import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, Trash2, Edit, X, FileText, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { extractResults } from '../services/api';

const TIPOS_CONTRATO = [
  { id: 1, nome: 'Contrato' },
  { id: 2, nome: 'Empenho' },
  { id: 3, nome: 'Outros' },
];

const TIPOS_DOCUMENTO = [
  { id: 1, nome: 'Documento Principal' },
  { id: 2, nome: 'Extrato' },
  { id: 3, nome: 'Termo Aditivo' },
  { id: 4, nome: 'Publicação DOU' },
  { id: 5, nome: 'Apostilamento' },
  { id: 6, nome: 'Rescisão' },
  { id: 7, nome: 'Outros' },
];

const StyledCheckbox = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center justify-center cursor-pointer select-none" aria-checked={checked} role="checkbox">
    <input type="checkbox" checked={checked} onChange={onChange} className="peer absolute inset-0 z-20 m-0 h-full w-full cursor-pointer opacity-0" />
    <div className="pointer-events-none flex h-5 w-5 items-center justify-center rounded border-2 border-slate-300 dark:border-slate-600 peer-checked:border-accent-blue peer-checked:bg-accent-blue">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`h-3 w-3 text-white ${checked ? 'opacity-100' : 'opacity-0'}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    </div>
  </label>
);

const ContratoModal = ({ open, onClose, onSave, initialData }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    numero_contrato_empenho: '',
    ano_contrato: new Date().getFullYear(),
    tipo_contrato_id: 1,
    ni_fornecedor: '',
    tipo_pessoa_fornecedor: 'PJ',
    unidade_codigo: '',
    processo_ref: '',
    categoria_processo_id: '',
    objeto: '',
    valor_inicial: '',
    valor_global: '',
    data_assinatura: '',
    data_vigencia_inicio: '',
    data_vigencia_fim: '',
    receita: false,
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      numero_contrato_empenho: initialData?.numero_contrato_empenho || '',
      ano_contrato: initialData?.ano_contrato || new Date().getFullYear(),
      tipo_contrato_id: initialData?.tipo_contrato_id || 1,
      ni_fornecedor: initialData?.ni_fornecedor || '',
      tipo_pessoa_fornecedor: initialData?.tipo_pessoa_fornecedor || 'PJ',
      unidade_codigo: initialData?.unidade_codigo || '',
      processo_ref: initialData?.processo_ref || '',
      categoria_processo_id: initialData?.categoria_processo_id || '',
      objeto: initialData?.objeto || '',
      valor_inicial: initialData?.valor_inicial ?? '',
      valor_global: initialData?.valor_global ?? '',
      data_assinatura: initialData?.data_assinatura || '',
      data_vigencia_inicio: initialData?.data_vigencia_inicio || '',
      data_vigencia_fim: initialData?.data_vigencia_fim || '',
      receita: !!initialData?.receita,
    });
  }, [open, initialData]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...form,
        ano_contrato: Number(form.ano_contrato),
        tipo_contrato_id: Number(form.tipo_contrato_id),
        categoria_processo_id: form.categoria_processo_id ? Number(form.categoria_processo_id) : null,
        valor_inicial: form.valor_inicial !== '' ? Number(form.valor_inicial) : null,
        valor_global: form.valor_global !== '' ? Number(form.valor_global) : null,
        data_assinatura: form.data_assinatura || null,
        data_vigencia_inicio: form.data_vigencia_inicio || null,
        data_vigencia_fim: form.data_vigencia_fim || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl ui-modal-panel">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">{initialData?.id ? 'Editar Contrato/Empenho' : 'Novo Contrato/Empenho'}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto">
          <input name="numero_contrato_empenho" value={form.numero_contrato_empenho} onChange={handleChange} required placeholder="Número" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
          <input type="number" name="ano_contrato" value={form.ano_contrato} onChange={handleChange} required placeholder="Ano" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
          <select name="tipo_contrato_id" value={form.tipo_contrato_id} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            {TIPOS_CONTRATO.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>

          <input name="ni_fornecedor" value={form.ni_fornecedor} onChange={handleChange} placeholder="CPF/CNPJ Fornecedor" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
          <select name="tipo_pessoa_fornecedor" value={form.tipo_pessoa_fornecedor} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <option value="PJ">Pessoa Jurídica</option>
            <option value="PF">Pessoa Física</option>
          </select>
          <input name="unidade_codigo" value={form.unidade_codigo} onChange={handleChange} placeholder="Código Unidade" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />

          <input type="number" step="0.01" name="valor_inicial" value={form.valor_inicial} onChange={handleChange} placeholder="Valor Inicial" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
          <input type="number" step="0.01" name="valor_global" value={form.valor_global} onChange={handleChange} placeholder="Valor Global" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
          <input name="processo_ref" value={form.processo_ref} onChange={handleChange} placeholder="Processo referência" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />

          <input type="date" name="data_assinatura" value={form.data_assinatura} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
          <input type="date" name="data_vigencia_inicio" value={form.data_vigencia_inicio} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
          <input type="date" name="data_vigencia_fim" value={form.data_vigencia_fim} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />

          <textarea name="objeto" value={form.objeto} onChange={handleChange} rows={2} placeholder="Objeto" className="md:col-span-3 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />

          <div className="md:col-span-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="inline-flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" name="receita" checked={form.receita} onChange={handleChange} /> Receita
            </label>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : null} Salvar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const DocumentosContratoModal = ({ open, contrato, api, showToast, onClose }) => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDocs = useCallback(async () => {
    if (!contrato?.id) return;
    setLoading(true);
    try {
      const { data } = await api.get('/documentos-contratos/', { params: { contrato: contrato.id } });
      setDocs(extractResults(data));
    } catch (error) {
      console.error(error);
      showToast('Erro ao carregar documentos do contrato.', 'error');
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, [api, contrato, showToast]);

  useEffect(() => {
    if (open) fetchDocs();
  }, [open, fetchDocs]);

  if (!open || !contrato) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl ui-modal-panel">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Documentos do Contrato {contrato.numero_contrato_empenho || contrato.id}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100"><X size={16} /></button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <table className="ui-process-table text-left border-collapse w-full">
            <thead>
              <tr><th className="p-2">Tipo</th><th className="p-2">Arquivo</th><th className="p-2">Status</th><th className="p-2 text-right">Ações</th></tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={4} className="p-6 text-center text-xs text-slate-500"><Loader2 className="w-4 h-4 inline-block mr-2 animate-spin" /> Carregando...</td></tr>
              )}

              {!loading && TIPOS_DOCUMENTO.map((tipo) => {
                const doc = docs.find((d) => Number(d.tipo_documento_id) === tipo.id);
                const enviado = doc?.status === 'enviado';
                return (
                  <tr key={tipo.id} className="text-xs">
                    <td className="p-2">{tipo.nome}</td>
                    <td className="p-2">{doc?.arquivo_nome || 'Sem arquivo'}</td>
                    <td className="p-2">{enviado ? 'Publicado' : doc?.status || 'Rascunho'}</td>
                    <td className="p-2 text-right">
                      <div className="inline-flex items-center gap-1">
                        <label className="inline-flex items-center gap-1 px-2 py-1 rounded border cursor-pointer">
                          <FileText size={12} />
                          <input type="file" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const fd = new FormData();
                              fd.append('contrato', contrato.id);
                              fd.append('tipo_documento_id', tipo.id);
                              fd.append('arquivo', file);
                              await api.post('/documentos-contratos/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                              showToast('Documento anexado.', 'success');
                              fetchDocs();
                            } catch (error) {
                              showToast(error?.response?.data?.detail || 'Erro no upload.', 'error');
                            }
                          }} />
                        </label>

                        {doc && !enviado && contrato.status === 'publicado' && (
                          <button type="button" className="px-2 py-1 rounded border text-blue-600" onClick={async () => {
                            try { await api.post(`/documentos-contratos/${doc.id}/enviar-ao-pncp/`); showToast('Documento publicado.', 'success'); fetchDocs(); }
                            catch (error) { showToast(error?.response?.data?.detail || 'Erro ao publicar.', 'error'); }
                          }}><Send size={12} /></button>
                        )}

                        {doc && enviado && (
                          <button type="button" className="px-2 py-1 rounded border text-amber-600" onClick={async () => {
                            try { await api.post(`/documentos-contratos/${doc.id}/excluir-do-pncp/`, { justificativa: 'Remoção de documento de contrato.' }); showToast('Documento removido do PNCP.', 'success'); fetchDocs(); }
                            catch (error) { showToast(error?.response?.data?.detail || 'Erro ao remover.', 'error'); }
                          }}><AlertCircle size={12} /></button>
                        )}

                        {doc && (
                          <button type="button" className="px-2 py-1 rounded border text-red-600" onClick={async () => {
                            try { await api.delete(`/documentos-contratos/${doc.id}/`); showToast('Documento removido.', 'success'); fetchDocs(); }
                            catch (error) { showToast('Erro ao remover documento.', 'error'); }
                          }}><Trash2 size={12} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default function ContratosSection({ processoId, api, showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [openDocsModal, setOpenDocsModal] = useState(false);
  const [docsContrato, setDocsContrato] = useState(null);
  const [selected, setSelected] = useState(new Set());

  const fetchItems = useCallback(async () => {
    if (!processoId) return;
    setLoading(true);
    try {
      const { data } = await api.get('/contratos/', { params: { processo: processoId } });
      setItems(extractResults(data));
    } catch (error) {
      console.error(error);
      showToast('Erro ao carregar contratos/empenhos.', 'error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [api, processoId, showToast]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const isPublished = (item) => item?.status === 'publicado' || !!item?.pncp_sequencial_contrato;
  const tipoNome = (id) => TIPOS_CONTRATO.find((t) => Number(t.id) === Number(id))?.nome || `Tipo ${id}`;
  const allSelected = items.length > 0 && items.every((i) => selected.has(i.id));

  const onSave = async (payload) => {
    if (editing?.id) await api.patch(`/contratos/${editing.id}/`, { ...payload, processo: processoId });
    else await api.post('/contratos/', { ...payload, processo: processoId });
    showToast('Contrato salvo com sucesso.', 'success');
    await fetchItems();
  };

  const onDeleteOne = async (item) => {
    await api.delete(`/contratos/${item.id}/`);
    showToast('Contrato removido localmente.', 'success');
    await fetchItems();
  };

  const onBulkDelete = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    await api.post('/contratos/bulk-delete/', { ids });
    showToast(`${ids.length} contrato(s) removido(s).`, 'success');
    setSelected(new Set());
    await fetchItems();
  };

  const onPublish = async (item) => {
    setSavingId(item.id);
    try {
      await api.post(`/contratos/${item.id}/publicar-no-pncp/`);
      showToast('Contrato publicado no PNCP.', 'success');
      await fetchItems();
    } finally { setSavingId(null); }
  };

  const onRetificar = async (item) => {
    const justificativa = window.prompt('Justificativa para retificação:', 'Retificação de contrato/empenho.');
    if (justificativa === null) return;
    setSavingId(item.id);
    try {
      await api.post(`/contratos/${item.id}/retificar-no-pncp/`, { justificativa });
      showToast('Contrato retificado no PNCP.', 'success');
      await fetchItems();
    } finally { setSavingId(null); }
  };

  const onExcluirPncp = async (item) => {
    setSavingId(item.id);
    try {
      await api.post(`/contratos/${item.id}/excluir-do-pncp/`, { justificativa: 'Exclusão solicitada pelo sistema de origem.' });
      showToast('Contrato removido do PNCP.', 'success');
      await fetchItems();
    } finally { setSavingId(null); }
  };

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-5">
      <AnimatePresence>
        {openModal && (
          <ContratoModal open={openModal} onClose={() => { setOpenModal(false); setEditing(null); }} onSave={onSave} initialData={editing} />
        )}
        {openDocsModal && docsContrato && (
          <DocumentosContratoModal open={openDocsModal} contrato={docsContrato} api={api} showToast={showToast} onClose={() => { setOpenDocsModal(false); setDocsContrato(null); }} />
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Contratos e Empenhos</h2>
          <p className="text-xs text-slate-500 mt-1">{items.length} registro(s) no total.</p>
        </div>

        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button type="button" onClick={onBulkDelete} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md border border-red-300 bg-red-50 text-red-600 hover:bg-red-100">
              <Trash2 size={16} /> Excluir ({selected.size})
            </button>
          )}
          <button type="button" onClick={() => { setEditing(null); setOpenModal(true); }} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700">
            <Plus size={16} /> Novo Contrato
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="ui-process-table text-left border-collapse">
          <thead>
            <tr>
              <th className="w-12 text-center">
                <StyledCheckbox checked={allSelected} onChange={() => {
                  if (allSelected) setSelected(new Set());
                  else setSelected(new Set(items.map((i) => i.id)));
                }} />
              </th>
              <th>ID</th>
              <th>Número</th>
              <th>Tipo</th>
              <th>Status PNCP</th>
              <th>Controle</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="p-6 text-center text-sm text-slate-500"><Loader2 size={16} className="animate-spin inline-block mr-2" />Carregando contratos...</td></tr>
            )}

            {!loading && items.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-sm text-slate-500">Nenhum contrato/empenho cadastrado.</td></tr>
            )}

            {!loading && items.map((item) => {
              const published = isPublished(item);
              const isSaving = savingId === item.id;
              return (
                <tr key={item.id}>
                  <td className="text-center"><StyledCheckbox checked={selected.has(item.id)} onChange={() => {
                    setSelected((prev) => {
                      const next = new Set(prev);
                      next.has(item.id) ? next.delete(item.id) : next.add(item.id);
                      return next;
                    });
                  }} /></td>
                  <td>{item.id}</td>
                  <td>
                    <div className="font-medium">{item.numero_contrato_empenho}</div>
                    <div className="text-xs text-slate-500">Fornecedor: {item.ni_fornecedor || '-'}</div>
                  </td>
                  <td>{tipoNome(item.tipo_contrato_id)}</td>
                  <td>
                    {published
                      ? <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle size={14} />Publicado</span>
                      : <span className="inline-flex items-center gap-1 text-slate-500"><AlertCircle size={14} />Não publicado</span>}
                  </td>
                  <td>
                    {item.numero_controle_pncp || '-'
                    }
                    {item.link_pncp && <div><a href={item.link_pncp} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Ver PNCP</a></div>}
                  </td>
                  <td className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <button type="button" onClick={() => { setDocsContrato(item); setOpenDocsModal(true); }} className="h-8 px-2 rounded-md border border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100" title="Documentos"><FileText size={14} /></button>
                      {!published && (
                        <button type="button" disabled={isSaving} onClick={() => onPublish(item)} className="h-8 px-2 rounded-md border border-blue-300 text-blue-600 bg-blue-50 hover:bg-blue-100" title="Publicar PNCP">{isSaving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}</button>
                      )}
                      {published && (
                        <button type="button" disabled={isSaving} onClick={() => onRetificar(item)} className="h-8 px-2 rounded-md border border-amber-300 text-amber-600 bg-amber-50 hover:bg-amber-100" title="Retificar PNCP">{isSaving ? <Loader2 size={14} className="animate-spin" /> : <Edit size={14} />}</button>
                      )}
                      {published && (
                        <button type="button" disabled={isSaving} onClick={() => onExcluirPncp(item)} className="h-8 px-2 rounded-md border border-red-300 text-red-600 bg-red-50 hover:bg-red-100" title="Remover PNCP">{isSaving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}</button>
                      )}
                      <button type="button" onClick={() => { setEditing(item); setOpenModal(true); }} className="h-8 px-2 rounded-md border border-amber-300 text-amber-600 bg-amber-50 hover:bg-amber-100" title="Editar"><Edit size={14} /></button>
                      <button type="button" onClick={() => onDeleteOne(item)} className="h-8 px-2 rounded-md border border-red-300 text-red-600 bg-red-50 hover:bg-red-100" title="Apagar local"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
