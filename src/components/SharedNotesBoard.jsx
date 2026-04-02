import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Users,
  Ban,
  Bell,
  BellOff,
} from "lucide-react";
import useAxios from "../hooks/useAxios";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { extractResults } from "../services/api";

export default function SharedNotesBoard({
  processoId = null,
  title = "Anotações",
  className = "",
  showPreferences = false,
  columnLayout = false,
  onPreferencesSaved,
}) {
  const api = useAxios();
  const { showToast } = useToast();
  const { user: authUser, setUser } = useAuth();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [sharingQuery, setSharingQuery] = useState("");
  const [sharingSuggestions, setSharingSuggestions] = useState([]);
  const [selectedShareUsers, setSelectedShareUsers] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editText, setEditText] = useState("");

  const [prefsOpen, setPrefsOpen] = useState(false);
  const [receberAnotacoes, setReceberAnotacoes] = useState(
    authUser?.receber_anotacoes_compartilhadas ?? true
  );
  const [blockedUsers, setBlockedUsers] = useState(authUser?.usuarios_bloqueados_nomes || []);
  const [blockQuery, setBlockQuery] = useState("");
  const [blockSuggestions, setBlockSuggestions] = useState([]);

  const ownerId = authUser?.id;

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (processoId) params.processo = processoId;
      const { data } = await api.get("/anotacoes/", { params });
      setNotes(extractResults(data));
    } catch (error) {
      console.error(error);
      showToast("Erro ao carregar anotações.", "error");
    } finally {
      setLoading(false);
    }
  }, [api, processoId, showToast]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    setReceberAnotacoes(authUser?.receber_anotacoes_compartilhadas ?? true);
    setBlockedUsers(authUser?.usuarios_bloqueados_nomes || []);
  }, [authUser]);

  const fetchUserSuggestions = useCallback(
    async (term, setter) => {
      if (!term || term.trim().length < 2) {
        setter([]);
        return;
      }
      try {
        const params = { q: term.trim() };
        if (processoId) params.processo = processoId;
        const { data } = await api.get("/usuarios-lookup/", { params });
        setter(extractResults(data));
      } catch {
        setter([]);
      }
    },
    [api, processoId]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUserSuggestions(sharingQuery, setSharingSuggestions);
    }, 250);
    return () => clearTimeout(timer);
  }, [sharingQuery, fetchUserSuggestions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUserSuggestions(blockQuery, setBlockSuggestions);
    }, 250);
    return () => clearTimeout(timer);
  }, [blockQuery, fetchUserSuggestions]);

  const selectedShareUsernames = useMemo(
    () => selectedShareUsers.map((u) => u.username),
    [selectedShareUsers]
  );

  const addShareUser = (u) => {
    if (!u || selectedShareUsers.some((x) => x.id === u.id)) return;
    setSelectedShareUsers((prev) => [...prev, u]);
    setSharingQuery("");
    setSharingSuggestions([]);
  };

  const removeShareUser = (id) => {
    setSelectedShareUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const savePreferences = async () => {
    try {
      const payload = {
        receber_anotacoes_compartilhadas: receberAnotacoes,
        usuarios_bloqueados: blockedUsers.map((u) => u.id),
      };
      const { data } = await api.patch("/me/", payload);
      setUser((prev) => ({ ...(prev || {}), ...data }));
      onPreferencesSaved?.(data);
      showToast("Preferências de anotações salvas.", "success");
      setPrefsOpen(false);
    } catch (error) {
      console.error(error);
      showToast("Erro ao salvar preferências.", "error");
    }
  };

  const addBlockedUser = (u) => {
    if (!u || blockedUsers.some((x) => x.id === u.id) || u.id === ownerId) return;
    setBlockedUsers((prev) => [...prev, u]);
    setBlockQuery("");
    setBlockSuggestions([]);
  };

  const removeBlockedUser = (id) => {
    setBlockedUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleCreate = async () => {
    if (!newText.trim()) return;
    try {
      const payload = {
        titulo: newTitle || null,
        text: newText,
        concluida: false,
        processo: processoId || null,
        shared_usernames: selectedShareUsernames,
      };
      const { data } = await api.post("/anotacoes/", payload);
      setNotes((prev) => [data, ...prev]);
      setNewTitle("");
      setNewText("");
      setSelectedShareUsers([]);
      setSharingQuery("");
      showToast("Anotação criada.", "success");
    } catch (error) {
      console.error(error);
      showToast("Erro ao criar anotação.", "error");
    }
  };

  const handleToggle = async (note) => {
    try {
      const { data } = await api.patch(`/anotacoes/${note.id}/`, { concluida: !note.concluida });
      setNotes((prev) => prev.map((n) => (n.id === note.id ? data : n)));
    } catch (error) {
      console.error(error);
      showToast("Não foi possível marcar a tarefa.", "error");
    }
  };

  const startEdit = (note) => {
    setEditingId(note.id);
    setEditTitle(note.titulo || "");
    setEditText(note.text || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditText("");
  };

  const saveEdit = async (note) => {
    try {
      const { data } = await api.patch(`/anotacoes/${note.id}/`, {
        titulo: editTitle || null,
        text: editText,
      });
      setNotes((prev) => prev.map((n) => (n.id === note.id ? data : n)));
      cancelEdit();
      showToast("Anotação atualizada.", "success");
    } catch (error) {
      console.error(error);
      showToast("Erro ao atualizar anotação.", "error");
    }
  };

  const removeNote = async (id) => {
    try {
      await api.delete(`/anotacoes/${id}/`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      showToast("Anotação removida.", "success");
    } catch (error) {
      console.error(error);
      showToast("Erro ao remover anotação.", "error");
    }
  };

  const truncatePreview = (value, limit = 100) => {
    const text = String(value || "").trim();
    if (text.length <= limit) return text;
    return `${text.slice(0, limit)}...`;
  };

  return (
    <div className={`bg-amber-50 dark:bg-dark-bg-secondary rounded-xl border border-amber-100 dark:border-slate-700 p-4 sm:p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm uppercase tracking-wide text-amber-700 dark:text-amber-400">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium bg-white/70 dark:bg-slate-800 px-2 py-1 rounded-md text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-slate-700">
            {notes.length} notas
          </span>
          {showPreferences && (
            <button
              onClick={() => setPrefsOpen((v) => !v)}
              className="p-2 rounded-lg border border-amber-200 dark:border-slate-700 hover:bg-amber-100/70 dark:hover:bg-slate-800 text-amber-700 dark:text-amber-300"
              title="Preferências de compartilhamento"
            >
              {receberAnotacoes ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {showPreferences && prefsOpen && (
  <div className="mb-4 p-3 rounded-lg border border-amber-200 dark:border-slate-700 bg-amber-100/60 dark:bg-slate-900/30 space-y-3">
          <button
            type="button"
            onClick={() => setReceberAnotacoes((v) => !v)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm ${receberAnotacoes ? "border-emerald-300 text-emerald-700 dark:text-emerald-300" : "border-amber-300 text-amber-700 dark:text-amber-300"}`}
          >
            <span className="flex items-center gap-2">
              {receberAnotacoes ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              Receber anotações de outros usuários
            </span>
            <span className="font-semibold">{receberAnotacoes ? "ATIVO" : "INATIVO"}</span>
          </button>

          <div>
            <p className="text-xs font-semibold text-amber-800/80 dark:text-amber-300 mb-2 flex items-center gap-1"><Ban className="w-3.5 h-3.5" /> Usuários bloqueados</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {blockedUsers.map((u) => (
                <span key={u.id} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 text-xs">
                  @{u.username}
                  <button type="button" onClick={() => removeBlockedUser(u.id)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <input
              value={blockQuery}
              onChange={(e) => setBlockQuery(e.target.value)}
              placeholder="Digite nome/usuário para bloquear"
              className="w-full px-3 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-dark-bg-primary text-sm"
            />
            {blockSuggestions.length > 0 && (
              <div className="mt-1 border border-amber-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-dark-bg-primary">
                {blockSuggestions.map((u) => (
                  <button key={u.id} type="button" onClick={() => addBlockedUser(u)} className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 dark:hover:bg-slate-800">
                    {u.nome} <span className="text-slate-400">(@{u.username})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button onClick={savePreferences} className="px-3 py-2 rounded-lg bg-accent-blue text-white text-sm font-semibold">Salvar preferências</button>
          </div>
        </div>
      )}

      <div className={columnLayout ? "grid grid-cols-1 lg:grid-cols-3 gap-4" : ""}>
        <div className={columnLayout ? "lg:col-span-1" : ""}>
          <div className="space-y-3 mb-4">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Título da tarefa (opcional)"
              className="w-full px-3 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-dark-bg-primary text-sm"
            />
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              rows={4}
              placeholder="Escreva a anotação/tarefa..."
              className="w-full px-3 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-dark-bg-primary text-sm"
            />

            <div>
              <p className="text-xs font-semibold text-amber-800/80 dark:text-amber-300 mb-2 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Compartilhar com usuários</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedShareUsers.map((u) => (
                  <span key={u.id} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 text-xs">
                    @{u.username}
                    <button type="button" onClick={() => removeShareUser(u.id)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <input
                value={sharingQuery}
                onChange={(e) => setSharingQuery(e.target.value)}
                placeholder="Digite nome/usuário para compartilhar"
                className="w-full px-3 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-dark-bg-primary text-sm"
              />
              {sharingSuggestions.length > 0 && (
                <div className="mt-1 border border-amber-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-dark-bg-primary">
                  {sharingSuggestions.map((u) => (
                    <button key={u.id} type="button" onClick={() => addShareUser(u)} className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 dark:hover:bg-slate-800">
                      {u.nome} <span className="text-slate-400">(@{u.username})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-blue text-white text-sm font-semibold">
              <Plus className="w-4 h-4" /> Salvar anotação
            </button>
          </div>
        </div>

        <div className={columnLayout ? "lg:col-span-2" : ""}>
          <div className={columnLayout ? "grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[560px] overflow-y-auto pr-1" : "space-y-2 max-h-[430px] overflow-y-auto pr-1"}>
        {loading ? (
          <p className="text-sm text-slate-500">Carregando...</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-slate-500">Sem anotações.</p>
        ) : (
          notes.map((note) => {
            const isOwner = note.usuario === ownerId;
            const isEditing = editingId === note.id;
            const notePreview = truncatePreview(note.text, 100);
            return (
              <div key={note.id} className="p-3 rounded-lg border border-amber-200 dark:border-slate-700 bg-white/75 dark:bg-dark-bg-primary">
                <div className="flex items-start gap-2">
                  <button type="button" onClick={() => handleToggle(note)} className="mt-0.5 text-accent-blue">
                    {note.concluida ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <>
                        <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full mb-2 px-2 py-1 rounded border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                        <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} className="w-full px-2 py-1 rounded border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
                      </>
                    ) : (
                      <>
                        {note.titulo && <p className={`font-semibold text-sm break-words whitespace-pre-wrap ${note.concluida ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-200"}`}>{note.titulo}</p>}
                        <p
                          title={note.text}
                          className={`text-sm break-words whitespace-pre-wrap overflow-hidden ${note.concluida ? "line-through text-slate-400" : "text-slate-600 dark:text-slate-300"}`}
                        >
                          {notePreview}
                        </p>
                      </>
                    )}

                    <div className="mt-2 text-[11px] text-slate-400 flex flex-wrap gap-2">
                      <span>por @{note.usuario_nome}</span>
                      {note.processo_numero && <span>• processo {note.processo_numero}</span>}
                      {note.compartilhada_com_nomes?.length > 0 && (
                        <span>• compartilhada com {note.compartilhada_com_nomes.map((u) => `@${u.username}`).join(", ")}</span>
                      )}
                    </div>
                  </div>

                  {isOwner && (
                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        <>
                          <button type="button" onClick={() => saveEdit(note)} className="p-1.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/20"><Save className="w-4 h-4 text-emerald-600" /></button>
                          <button type="button" onClick={cancelEdit} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800"><X className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => startEdit(note)} className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/20"><Edit3 className="w-4 h-4 text-blue-600" /></button>
                          <button type="button" onClick={() => removeNote(note.id)} className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4 text-red-600" /></button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
