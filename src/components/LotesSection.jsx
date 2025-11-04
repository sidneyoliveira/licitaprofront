// src/components/LotesSection.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import useAxios from "../hooks/useAxios";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

/** Checkbox igual da ItensTable */
const StyledCheckbox = ({ checked, onChange, className = "" }) => (
  <label
    className={`relative inline-flex items-center justify-center cursor-pointer select-none ${className}`}
    aria-checked={checked}
    role="checkbox"
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="peer absolute inset-0 z-20 m-0 h-full w-full cursor-pointer opacity-0"
    />
    <div className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded border-2 border-slate-300 dark:border-dark-border transition-none peer-checked:border-[#004aad] peer-checked:bg-[#004aad]`}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`h-3 w-3 text-white ${checked ? "opacity-100" : "opacity-0"}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    </div>
  </label>
);

const inputStyle =
  "w-full px-3 py-2 text-sm border rounded-md bg-white border-slate-300 dark:bg-dark-bg-secondary dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad]";
const labelStyle =
  "text-[11px] font-semibold tracking-wide text-slate-600 dark:text-slate-300 uppercase";

/* ----------------------------- Modal base (alto z-index) ----------------------------- */
const Modal = ({ isOpen, onClose, children, maxWidth = "max-w-xl" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-xl md:ml-40 p-5`}>
        {children}
      </div>
    </div>
  );
};

/* --------------------------- Modal Criar/Editar Lote --------------------------- */
const LoteFormModal = ({ open, onClose, initialData, onSave, isSaving }) => {
  const [form, setForm] = useState({ numero: "", descricao: "" });

  useEffect(() => {
    setForm({
      numero: initialData?.numero ?? "",
      descricao: initialData?.descricao ?? "",
    });
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const submit = (e) => {
    e.preventDefault();
    onSave?.({
      numero: Number(form.numero) || 0,
      descricao: form.descricao?.trim() || "",
    });
  };

  return (
    <Modal isOpen={open} onClose={onClose}>
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 ">
        {initialData?.id ? "Editar Lote" : "Adicionar Lote"}
      </h3>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-[1fr_3fr] gap-4">
          <div>
            <label className={labelStyle}>Número *</label>
            <input
              name="numero"
              type="number"
              value={form.numero}
              onChange={handleChange}
              className={`${inputStyle} text-center`}
              required
            />
          </div>
          <div>
            <label className={labelStyle}>Descrição</label>
            <input
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              className={inputStyle}
              placeholder="Opcional"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-sm font-semibold hover:bg-slate-50 dark:hover:bg-dark-bg-tertiary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!!isSaving}
            className="px-4 py-2 rounded-md bg-[#0f766e] text-white hover:bg-[#115e59] disabled:opacity-70 font-semibold text-sm"
          >
            {isSaving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
/* ---------------------- Modal Selecionar Itens do Lote ---------------------- */
const LoteItensModal = ({
  open,
  onClose,
  lote,
  itens,
  busy,
  onSave,
}) => {
  const [selected, setSelected] = useState(new Set());
  const [term, setTerm] = useState("");

  useEffect(() => {
    // pré-seleciona o que já está neste lote
    const pre = new Set((itens || []).filter((i) => i.lote === lote?.id).map((i) => i.id));
    setSelected(pre);
  }, [open, lote, itens]);

  // MOSTRAR APENAS: sem lote OU no lote atual
  const visible = useMemo(() => {
    const list = (itens || []).filter((i) => i.lote == null || i.lote === lote?.id);
    const q = term.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (i) =>
        String(i.descricao || "").toLowerCase().includes(q) ||
        String(i.unidade || "").toLowerCase().includes(q)
    );
  }, [itens, lote, term]);

  const toggle = (id) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const allIds = visible.map((i) => i.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const toggleAll = () => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (allSelected) allIds.forEach((id) => n.delete(id));
      else allIds.forEach((id) => n.add(id));
      return n;
    });
  };

  return (
    <Modal isOpen={open} onClose={onClose} maxWidth="max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            Itens do Lote {lote?.numero}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Selecione os itens que pertencem a este lote. (Itens já alocados em outros lotes não aparecem aqui)
          </p>
        </div>
        <div className="w-64">
          <input
            type="text"
            className={inputStyle}
            placeholder="Filtrar itens..."
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800/40">
            <tr>
              <th className="py-3 px-4 w-12">
                <StyledCheckbox checked={allSelected} onChange={toggleAll} />
              </th>
              <th className="py-3 px-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Descrição
              </th>
              <th className="py-3 px-3 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Und.
              </th>
              <th className="py-3 px-3 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Qtd.
              </th>
              <th className="py-3 px-3 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Lote atual
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-dark-bg-secondary">
            {visible.map((i) => (
              <tr key={i.id} className={`${selected.has(i.id) ? "bg-blue-50/60 dark:bg-blue-900/20" : ""}`}>
                <td className="py-3 px-4">
                  <StyledCheckbox checked={selected.has(i.id)} onChange={() => toggle(i.id)} />
                </td>
                <td className="py-3 px-4 text-sm">{i.descricao}</td>
                <td className="py-3 px-3 text-sm">{i.unidade || "—"}</td>
                <td className="py-3 px-3 text-sm">{i.quantidade}</td>
                <td className="py-3 px-3 text-sm">
                  {i.lote ? `Lote ${lote?.numero}` : "—"}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-500">
                  Nenhum item disponível (itens já alocados em outros lotes não são exibidos aqui).
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded-md text-sm font-semibold hover:bg-slate-50 dark:hover:bg-dark-bg-tertiary"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onSave?.(selected)}
          className="px-4 py-2 rounded-md bg-[#0f766e] text-white hover:bg-[#115e59] disabled:opacity-70 font-semibold text-sm"
        >
          {busy ? "Salvando..." : "Salvar seleção"}
        </button>
      </div>
    </Modal>
  );
};
/* =============================== LotesSection =============================== */
export default function LotesSection({
  processoId,
  lotes: lotesProp = [],
  itens: itensProp,
  reloadLotes,
  reloadItens,
  showToast,
}) {
  const api = useAxios();

  const [lotes, setLotes] = useState(lotesProp);
  const [itens, setItens] = useState(itensProp || []);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [isItensOpen, setIsItensOpen] = useState(false);
  const [loteAlvo, setLoteAlvo] = useState(null);
  const [busyItens, setBusyItens] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // sync props
  useEffect(() => setLotes(lotesProp), [lotesProp]);
  useEffect(() => setItens(itensProp || []), [itensProp]);

  const nextNumero = useMemo(() => {
    const nums = (lotes || []).map((l) => Number(l.numero) || 0);
    const max = nums.length ? Math.max(...nums) : 0;
    return max + 1;
  }, [lotes]);

  const countByLote = useMemo(() => {
    const map = new Map();
    (itens || []).forEach((i) => {
      if (!i.lote) return;
      map.set(i.lote, (map.get(i.lote) || 0) + 1);
    });
    return map;
  }, [itens]);

  const ensureLotes = useCallback(async () => {
    if (reloadLotes) return reloadLotes();
    if (!processoId) return;
    const res = await api.get(`/lotes/?processo=${processoId}`);
    setLotes(res.data || []);
  }, [api, processoId, reloadLotes]);

  const ensureItens = useCallback(async () => {
    if (reloadItens) return reloadItens();
    if (!processoId) return;
    // usa a action do processo (garante order e menos payload)
    const res = await api.get(`/processos/${processoId}/itens/`);
    setItens(res.data || []);
  }, [api, processoId, reloadItens]);

  /* ----------------------------- Ações de Lote ----------------------------- */
  const openCreate = () => {
    if (!processoId) {
      showToast?.("Salve os dados gerais do processo antes de adicionar lotes.", "info");
      return;
    }
    setEditing({ numero: nextNumero, descricao: "" });
    setIsFormOpen(true);
  };

  const openEdit = (l) => {
    setEditing({ id: l.id, numero: l.numero, descricao: l.descricao || "" });
    setIsFormOpen(true);
  };

  const saveLote = async (payload) => {
    if (!processoId) return;
    setSaving(true);
    try {
      if (editing?.id) {
        await api.put(`/lotes/${editing.id}/`, {
          numero: payload.numero,
          descricao: payload.descricao,
          processo: processoId,
        });
        showToast?.("Lote atualizado!", "success");
      } else {
        await api.post(`/lotes/`, {
          processo: processoId,
          numero: payload.numero,
          descricao: payload.descricao,
        });
        showToast?.("Lote criado!", "success");
      }
      setIsFormOpen(false);
      setEditing(null);
      await ensureLotes();
    } catch (e) {
      console.error(e);
      showToast?.("Erro ao salvar lote.", "error");
    } finally {
      setSaving(false);
    }
  };

  const askDelete = (l) => {
    setDeleteTarget(l);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/lotes/${deleteTarget.id}/`);
      showToast?.("Lote removido.", "success");
      await ensureLotes();
      await ensureItens(); // reflete desvinculação de itens
    } catch (e) {
      console.error(e);
      showToast?.("Não foi possível remover o lote.", "error");
    } finally {
      setShowDelete(false);
      setDeleteTarget(null);
    }
  };

  /* ------------------------- Itens do Lote (modal) ------------------------ */
  const openItensModal = async (l) => {
    setLoteAlvo(l);
    if (!itensProp) {
      await ensureItens(); // garante itens antes de abrir
    }
    setIsItensOpen(true);
  };

  const saveItensDoLote = async (selectedIdsSet) => {
    if (!loteAlvo) return;
    setBusyItens(true);
    try {
      const loteId = loteAlvo.id;
      const updates = [];
      (itens || []).forEach((i) => {
        const wantOnThis = selectedIdsSet.has(i.id);
        const isOnThis = i.lote === loteId;

        if (wantOnThis && !isOnThis) updates.push(api.patch(`/itens/${i.id}/`, { lote: loteId }));
        if (!wantOnThis && isOnThis) updates.push(api.patch(`/itens/${i.id}/`, { lote: null }));
      });

      await Promise.all(updates);
      showToast?.("Itens do lote atualizados.", "success");
      await ensureItens();
      await ensureLotes();
      setIsItensOpen(false);
      setLoteAlvo(null);
    } catch (e) {
      console.error(e);
      showToast?.("Erro ao atualizar itens do lote.", "error");
    } finally {
      setBusyItens(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Lotes do Processo</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {(lotes || []).length} lote(s) cadastrado(s).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-accent-blue rounded-md shadow-sm hover:bg-accent-blue/90"
            disabled={!processoId}
            title={!processoId ? "Salve os dados gerais primeiro." : "Adicionar Lote"}
          >
            <PlusIcon className="w-5 h-5" />
            Adicionar Lote
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-bg-secondary shadow-sm">
        <table className="w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800/40">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Nº
              </th>
              <th className="py-3 px-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Descrição
              </th>
              <th className="py-3 px-4 text-right text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Qtd. Itens
              </th>
              <th className="py-3 px-6 text-center text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {(lotes || []).length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-slate-500">
                  Nenhum lote cadastrado.
                </td>
              </tr>
            ) : (
              (lotes || []).map((l) => {
                const qtd = countByLote.get(l.id) ?? "—";
                return (
                  <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-sm font-semibold">#{l.numero}</td>
                    <td className="py-3 px-4 text-sm">{l.descricao || "—"}</td>
                    <td className="py-3 px-4 text-sm text-right">{qtd}</td>
                    <td className="py-3 px-6 text-center">
                      <div className="inline-flex gap-3">
                        <button
                          onClick={() => openItensModal(l)}
                          className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                          title="Gerenciar itens do lote"
                          type="button"
                        >
                          <ClipboardDocumentListIcon className="w-5 h-5 inline" />
                        </button>

                        <button
                          onClick={() => openEdit(l)}
                          className="text-[#004aad] hover:text-[#003d91]"
                          title="Editar lote"
                          type="button"
                        >
                          <PencilIcon className="w-5 h-5 inline" />
                        </button>

                        <button
                          onClick={() => askDelete(l)}
                          className="text-rose-600 hover:text-rose-700"
                          title="Remover lote"
                          type="button"
                        >
                          <TrashIcon className="w-5 h-5 inline" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modais */}
      <LoteFormModal
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditing(null);
        }}
        initialData={editing}
        onSave={saveLote}
        isSaving={saving}
      />

      <LoteItensModal
        open={isItensOpen}
        onClose={() => {
          setIsItensOpen(false);
          setLoteAlvo(null);
        }}
        lote={loteAlvo}
        itens={itens}
        busy={busyItens}
        onSave={saveItensDoLote}
      />

      {/* Confirmação de exclusão (usa seu ConfirmDeleteModal) */}
      {showDelete && (
        <ConfirmDeleteModal
          message={`Deseja realmente remover o Lote ${deleteTarget?.numero}? Itens vinculados ficarão sem lote.`}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDelete(false);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}
