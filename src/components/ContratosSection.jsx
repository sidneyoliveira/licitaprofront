import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Loader2, Trash2, Edit, X } from 'lucide-react';
import { extractResults } from '../services/api';

const TIPOS_CONTRATO = [
  { id: 1, nome: 'Contrato' },
  { id: 2, nome: 'Empenho' },
  { id: 3, nome: 'Outros' },
];

const ContratoModal = ({ open, onClose, onSave, initialData }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    numero_contrato_empenho: '',
    ano_contrato: new Date().getFullYear(),
    tipo_contrato_id: 1,
    processo_ref: '',
    categoria_processo_id: '',
    receita: false,
    unidade_codigo: '',
    ni_fornecedor: '',
    tipo_pessoa_fornecedor: '',
  });

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm({
        numero_contrato_empenho: initialData.numero_contrato_empenho || '',
        ano_contrato: initialData.ano_contrato || new Date().getFullYear(),
        tipo_contrato_id: initialData.tipo_contrato_id || 1,
        processo_ref: initialData.processo_ref || '',
        categoria_processo_id: initialData.categoria_processo_id || '',
        receita: !!initialData.receita,
        unidade_codigo: initialData.unidade_codigo || '',
        ni_fornecedor: initialData.ni_fornecedor || '',
        tipo_pessoa_fornecedor: initialData.tipo_pessoa_fornecedor || '',
      });
      return;
    }

    setForm({
      numero_contrato_empenho: '',
      ano_contrato: new Date().getFullYear(),
      tipo_contrato_id: 1,
      processo_ref: '',
      categoria_processo_id: '',
      receita: false,
      unidade_codigo: '',
      ni_fornecedor: '',
      tipo_pessoa_fornecedor: '',
    });
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...form,
        ano_contrato: Number(form.ano_contrato),
        tipo_contrato_id: Number(form.tipo_contrato_id),
        categoria_processo_id: form.categoria_processo_id ? Number(form.categoria_processo_id) : null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl ui-modal-panel">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            {initialData?.id ? 'Editar Contrato/Empenho' : 'Novo Contrato/Empenho'}
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1 text-slate-500">Número</label>
            <input
              name="numero_contrato_empenho"
              value={form.numero_contrato_empenho}
              onChange={handleChange}
              required
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs mb-1 text-slate-500">Ano</label>
            <input
              type="number"
              name="ano_contrato"
              value={form.ano_contrato}
              onChange={handleChange}
              required
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs mb-1 text-slate-500">Tipo</label>
            <select
              name="tipo_contrato_id"
              value={form.tipo_contrato_id}
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              {TIPOS_CONTRATO.map((t) => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs mb-1 text-slate-500">Processo referência</label>
            <input
              name="processo_ref"
              value={form.processo_ref}
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs mb-1 text-slate-500">NI Fornecedor</label>
            <input
              name="ni_fornecedor"
              value={form.ni_fornecedor}
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs mb-1 text-slate-500">Unidade código</label>
            <input
              name="unidade_codigo"
              value={form.unidade_codigo}
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-between pt-2">
            <label className="inline-flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" name="receita" checked={form.receita} onChange={handleChange} />
              Receita
            </label>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ContratosSection({ processoId, api, showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(new Set());

  const fetchItems = useCallback(async () => {
    if (!processoId) return;
    setLoading(true);
    try {
      const { data } = await api.get('/contratos/', { params: { processo: processoId } });
      const list = extractResults(data);
      setItems(list);
    } catch (error) {
      console.error(error);
      showToast('Erro ao carregar contratos/empenhos.', 'error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [api, processoId, showToast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const tipoNome = useMemo(() => {
    const map = new Map(TIPOS_CONTRATO.map((t) => [Number(t.id), t.nome]));
    return (id) => map.get(Number(id)) || `Tipo ${id}`;
  }, []);

  const onSave = async (payload) => {
    try {
      if (editing?.id) {
        await api.patch(`/contratos/${editing.id}/`, { ...payload, processo: processoId });
        showToast('Contrato atualizado com sucesso.', 'success');
      } else {
        await api.post('/contratos/', { ...payload, processo: processoId });
        showToast('Contrato criado com sucesso.', 'success');
      }
      await fetchItems();
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.detail || 'Erro ao salvar contrato.';
      showToast(msg, 'error');
      throw error;
    }
  };

  const onDeleteOne = async (id) => {
    try {
      await api.delete(`/contratos/${id}/`);
      showToast('Contrato removido.', 'success');
      await fetchItems();
    } catch (error) {
      console.error(error);
      showToast('Erro ao remover contrato.', 'error');
    }
  };

  const onBulkDelete = async () => {
    if (!selected.size) return;
    const ids = [...selected];
    try {
      await api.post('/contratos/bulk-delete/', { ids });
      showToast(`${ids.length} contrato(s) removido(s).`, 'success');
      setSelected(new Set());
      await fetchItems();
    } catch (error) {
      console.error(error);
      showToast('Erro ao remover contratos em massa.', 'error');
    }
  };

  const allSelected = items.length > 0 && items.every((i) => selected.has(i.id));

  return (
    <div className="space-y-6">
      <ContratoModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditing(null);
        }}
        onSave={onSave}
        initialData={editing}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Contratos e Empenhos</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {items.length} registro(s) no total.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button
              type="button"
              onClick={onBulkDelete}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md border border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
            >
              <Trash2 size={16} />
              Excluir ({selected.size})
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setOpenModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus size={16} />
            Novo Contrato
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="ui-process-table text-left border-collapse">
          <thead>
            <tr>
              <th className="w-12 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => {
                    if (allSelected) {
                      setSelected(new Set());
                    } else {
                      setSelected(new Set(items.map((i) => i.id)));
                    }
                  }}
                />
              </th>
              <th>Número</th>
              <th>Tipo</th>
              <th>Ano</th>
              <th>Fornecedor</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-slate-500">
                  <Loader2 size={16} className="animate-spin inline-block mr-2" />
                  Carregando contratos...
                </td>
              </tr>
            )}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-slate-500">
                  Nenhum contrato/empenho cadastrado.
                </td>
              </tr>
            )}

            {!loading && items.map((item) => (
              <tr key={item.id}>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => {
                      setSelected((prev) => {
                        const next = new Set(prev);
                        next.has(item.id) ? next.delete(item.id) : next.add(item.id);
                        return next;
                      });
                    }}
                  />
                </td>
                <td className="whitespace-nowrap truncate max-w-[220px] font-medium" title={item.numero_contrato_empenho}>
                  {item.numero_contrato_empenho}
                </td>
                <td className="whitespace-nowrap">{tipoNome(item.tipo_contrato_id)}</td>
                <td className="whitespace-nowrap">{item.ano_contrato}</td>
                <td className="whitespace-nowrap truncate max-w-[220px]" title={item.ni_fornecedor || '-'}>
                  {item.ni_fornecedor || '-'}
                </td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(item);
                        setOpenModal(true);
                      }}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-amber-300 text-amber-600 bg-amber-50 hover:bg-amber-100"
                      title="Editar"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteOne(item.id)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-red-300 text-red-600 bg-red-50 hover:bg-red-100"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
