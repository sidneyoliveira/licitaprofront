// src/components/AtasSection.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  X,
  Calendar,
  Loader2,
  Trash2,
  Send,
  CheckCircle,
  AlertCircle,
  UploadCloud,
  Eye,
  Download,
  MoreVertical,
  Edit,
} from 'lucide-react';

/* --------------------------------------------------------------------- */
/* Modal de Cadastro / Edição da Ata                                     */
/* --------------------------------------------------------------------- */

const AtaFormModal = ({ open, onClose, onSave, initialData, processoResumo }) => {
  const [form, setForm] = useState({
    numero_ata_registro_preco: '',
    ano_ata: new Date().getFullYear(),
    data_assinatura: '',
    data_vigencia_inicio: '',
    data_vigencia_fim: '',
    observacao: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm((prev) => ({
        ...prev,
        numero_ata_registro_preco: initialData?.numero_ata_registro_preco || '',
        ano_ata: initialData?.ano_ata || new Date().getFullYear(),
        data_assinatura: initialData?.data_assinatura || '',
        data_vigencia_inicio: initialData?.data_vigencia_inicio || '',
        data_vigencia_fim: initialData?.data_vigencia_fim || '',
        observacao: initialData?.observacao || '',
      }));
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        className="w-full max-w-3xl bg-white dark:bg-dark-bg-secondary rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
          <div>
            <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent-blue" />
              {initialData?.id ? 'Editar Ata de Registro de Preços' : 'Nova Ata de Registro de Preços'}
            </h3>
            {processoResumo && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {processoResumo.objeto}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo */}
        <form onSubmit={handleSubmit} className="px-5 pb-5 pt-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Resumo do processo / info contextual */}
          {processoResumo && (
            <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 px-3 py-3 text-xs text-blue-800 dark:text-blue-200 flex flex-wrap gap-4">
              <div>
                <span className="font-semibold">Local: </span>
                {processoResumo.local || '-'}
              </div>
              <div>
                <span className="font-semibold">Órgão: </span>
                {processoResumo.orgao || '-'}
              </div>
              {processoResumo.modalidade && (
                <div>
                  <span className="font-semibold">Modalidade: </span>
                  {processoResumo.modalidade}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
                Nº da Ata
              </label>
              <input
                type="text"
                name="numero_ata_registro_preco"
                value={form.numero_ata_registro_preco}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-blue/60"
                placeholder="Ex: 72/2025"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
                Ano da Ata
              </label>
              <input
                type="number"
                name="ano_ata"
                value={form.ano_ata}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-blue/60"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
                Data da Assinatura
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-2 top-2.5" />
                <input
                  type="date"
                  name="data_assinatura"
                  value={form.data_assinatura}
                  onChange={handleChange}
                  className="w-full pl-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-blue/60"
                  required
                />
              </div>
            </div>
          </div>

          {/* Vigência */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
                Início da Vigência
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-2 top-2.5" />
                <input
                  type="date"
                  name="data_vigencia_inicio"
                  value={form.data_vigencia_inicio}
                  onChange={handleChange}
                  className="w-full pl-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-blue/60"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
                Fim da Vigência
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-2 top-2.5" />
                <input
                  type="date"
                  name="data_vigencia_fim"
                  value={form.data_vigencia_fim}
                  onChange={handleChange}
                  className="w-full pl-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-blue/60"
                  required
                />
              </div>
            </div>
          </div>

          {/* Observação (opcional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
              Observações (opcional)
            </label>
            <textarea
              name="observacao"
              value={form.observacao}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-blue/60"
              placeholder="Ex: Convocação prevista para 22/12/2025 às 11:02:45."
            />
          </div>

          {/* Rodapé */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-accent-blue text-white hover:bg-accent-blue/90 shadow-sm shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Salvar Ata
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* --------------------------------------------------------------------- */
/* Modal de Documentos da Ata (arquivos da ata)                          */
/* --------------------------------------------------------------------- */

const AtaDocumentosModal = ({
  open,
  ata,
  api,
  showToast,
  onClose,
}) => {
  const [documentos, setDocumentos] = useState([]);
  const [sendingKey, setSendingKey] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const isPublishedDoc = (doc) => doc?.status === 'enviado';

  const fetchDocumentos = useCallback(async () => {
    if (!ata?.id) return;
    try {
      const { data } = await api.get('/documentos-atas/', { params: { ata: ata.id } });
      const list = Array.isArray(data) ? data : data.results || [];
      setDocumentos(list);
    } catch (error) {
      console.error(error);
      showToast('Erro ao carregar documentos da ata.', 'error');
      setDocumentos([]);
    }
  }, [api, ata?.id, showToast]);

  useEffect(() => {
    if (open && ata?.id) {
      fetchDocumentos();
    }
  }, [open, ata?.id, fetchDocumentos]);

  const handleFileUpsert = async (tipoId, file) => {
    if (!file || !ata?.id) return;
    setSendingKey(`tipo:${tipoId}`);

    try {
      // Nome padrão; você pode melhorar usando um mapa de tipos
      const titulo = file.name;

      const fd = new FormData();
      fd.append('arquivo', file);
      fd.append('tipo_documento_id', tipoId);
      fd.append('titulo', titulo);
      fd.append('ata', ata.id);

      const existing = (documentos || []).find(
        (d) => Number(d.tipo_documento_id) === Number(tipoId) && d.status !== 'removido'
      );

      if (existing?.id) {
        await api.patch(`/documentos-atas/${existing.id}/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/documentos-atas/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      showToast('Arquivo da ata salvo com sucesso!', 'success');
      await fetchDocumentos();
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.detail || 'Erro ao salvar arquivo da ata.';
      showToast(msg, 'error');
    } finally {
      setSendingKey(null);
    }
  };

  const handlePublish = async (doc) => {
    if (!doc?.id) return;
    setSendingKey(`doc:${doc.id}`);

    try {
      await api.post(`/documentos-atas/${doc.id}/enviar-ao-pncp/`);
      showToast('Documento da ata publicado no PNCP!', 'success');
      await fetchDocumentos();
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.detail || 'Erro ao publicar documento da ata no PNCP.';
      showToast(msg, 'error');
    } finally {
      setSendingKey(null);
    }
  };

  const handleRemoverPncp = async (doc) => {
    if (!doc?.id) return;
    setSendingKey(`doc:${doc.id}`);

    try {
      await api.post(`/documentos-atas/${doc.id}/remover-do-pncp/`, {
        justificativa: 'Exclusão de documento de Ata solicitada pelo sistema de origem.',
      });
      showToast('Documento removido do PNCP com sucesso.', 'success');
      await fetchDocumentos();
    } catch (error) {
      console.error(error);
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'Erro ao remover documento da ata no PNCP.';
      showToast(msg, 'error');
    } finally {
      setSendingKey(null);
    }
  };

  const handleDeleteLocal = async (doc) => {
    if (!doc?.id) return;

    try {
      await api.delete(`/documentos-atas/${doc.id}/`);
      showToast('Documento local da ata removido.', 'success');
      await fetchDocumentos();
    } catch (error) {
      console.error(error);
      showToast('Erro ao remover documento local.', 'error');
    }
  };

  const handleViewFile = (doc) => {
    const url = doc?.arquivo_url || doc?.arquivo;
    if (!url) return showToast('Arquivo não disponível para visualização.', 'warning');
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadFile = async (doc) => {
    const url = doc?.arquivo_url || doc?.arquivo;
    const name = doc?.arquivo_nome || doc?.titulo || 'arquivo';
    if (!url) return showToast('Arquivo não disponível para download.', 'warning');

    try {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Falha ao baixar arquivo.');

      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error(error);
      showToast('Erro ao baixar arquivo.', 'error');
    }
  };

  if (!open || !ata) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        className="w-full max-w-4xl bg-white dark:bg-dark-bg-secondary rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
          <div>
            <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent-blue" />
              Documentos da Ata {ata.numero_ata_registro_preco || ata.id}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Vigência:{' '}
              {ata.data_vigencia_inicio
                ? new Date(ata.data_vigencia_inicio).toLocaleDateString('pt-BR')
                : '–'}{' '}
              até{' '}
              {ata.data_vigencia_fim
                ? new Date(ata.data_vigencia_fim).toLocaleDateString('pt-BR')
                : '–'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Você pode anexar documentos como Convocação, Ata assinada, Extrato etc.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 dark:text-slate-400">
                  <th className="p-2 w-10">ID</th>
                  <th className="p-2">Título</th>
                  <th className="p-2">Arquivo</th>
                  <th className="p-2 hidden md:table-cell">Status PNCP</th>
                  <th className="p-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* Linha para upload rápido genérico (sem tipo pré-fixado) */}
                <tr className="text-xs md:text-sm">
                  <td className="p-2 text-slate-400 italic align-middle">–</td>
                  <td className="p-2 align-middle text-slate-500 dark:text-slate-400">
                    Anexar novo documento
                  </td>
                  <td className="p-2 align-middle" colSpan={3}>
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-dark-bg-secondary cursor-pointer hover:border-accent-blue hover:bg-slate-50 transition-colors">
                      <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[11px] text-slate-600 dark:text-slate-300">
                        Selecionar arquivo (tipo será configurado no backend)
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        disabled={!!sendingKey}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          if (!file) return;
                          // tipo genérico "1" p/ backend decidir / ou você muda aqui
                          handleFileUpsert(1, file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </td>
                </tr>

                {documentos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                      Nenhum documento cadastrado para esta ata.
                    </td>
                  </tr>
                )}

                {documentos.map((doc) => {
                  const isPublished = isPublishedDoc(doc);
                  const rowSending = sendingKey === `doc:${doc.id}`;
                  const fileUrl = doc.arquivo_url || doc.arquivo;
                  const fileName = doc.arquivo_nome || doc.titulo || 'arquivo';

                  return (
                    <tr
                      key={doc.id}
                      className="text-xs md:text-sm hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors group"
                    >
                      <td className="p-2 text-slate-500 dark:text-slate-400 align-middle">
                        {doc.id}
                      </td>
                      <td className="p-2 align-middle">
                        <div className="text-slate-800 dark:text-slate-100 font-medium">
                          {doc.titulo || 'Documento'}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                          Tipo: {doc.tipo_documento_nome || doc.tipo_documento_id}
                        </div>
                      </td>
                      <td className="p-2 align-middle">
                        {fileUrl ? (
                          <button
                            type="button"
                            onClick={() => handleViewFile(doc)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-[11px] text-slate-600 dark:text-slate-300 hover:border-accent-blue transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-500" />
                            <span className="truncate max-w-[160px] md:max-w-[260px]">
                              {fileName}
                            </span>
                            <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-accent-blue" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            Sem arquivo
                          </span>
                        )}
                      </td>

                      {/* Status PNCP */}
                      <td className="p-2 align-middle hidden md:table-cell">
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            Publicado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                            <AlertCircle className="w-3 h-3" />
                            Não publicado
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="p-2 align-middle text-right">
                        <div className="flex justify-end items-center gap-1">
                          {fileUrl && (
                            <button
                              type="button"
                              onClick={() => handleViewFile(doc)}
                              className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 transition-colors"
                              title="Visualizar"
                            >
                              <Eye size={14} />
                            </button>
                          )}

                          {/* Publicar PNCP */}
                          {fileUrl && !isPublished && (
                            <button
                              type="button"
                              disabled={rowSending}
                              onClick={() => handlePublish(doc)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-accent-blue text-white hover:bg-accent-blue/90 disabled:opacity-60 transition-colors"
                            >
                              {rowSending ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Send size={13} />
                              )}
                              Publicar PNCP
                            </button>
                          )}

                          {/* Remover do PNCP – só aparece após publicado */}
                          {isPublished && (
                            <button
                              type="button"
                              disabled={rowSending}
                              onClick={() => handleRemoverPncp(doc)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-60 transition-colors"
                            >
                              {rowSending ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Trash2 size={13} />
                              )}
                              Remover PNCP
                            </button>
                          )}

                          {/* Menu ⋮ com baixar / alterar / deletar local */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setMenuOpenId((prev) => (prev === doc.id ? null : doc.id))
                              }
                              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Mais ações"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {menuOpenId === doc.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setMenuOpenId(null)}
                                />
                                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden text-left">
                                  {fileUrl && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleDownloadFile(doc);
                                        setMenuOpenId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-4 py-2 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                      <Download size={12} /> Baixar arquivo
                                    </button>
                                  )}

                                  <label className="w-full flex items-center gap-2 px-4 py-2 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                                    <Edit size={12} />{' '}
                                    {fileUrl ? 'Alterar arquivo' : 'Anexar arquivo'}
                                    <input
                                      type="file"
                                      className="hidden"
                                      onChange={(e) => {
                                        const f = e.target.files?.[0] || null;
                                        if (f) {
                                          handleFileUpsert(doc.tipo_documento_id, f);
                                        }
                                        setMenuOpenId(null);
                                        e.target.value = '';
                                      }}
                                    />
                                  </label>

                                  {/* Apagar arquivo local – sempre disponível */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleDeleteLocal(doc);
                                      setMenuOpenId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-[11px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  >
                                    <Trash2 size={12} /> Deletar arquivo local
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* --------------------------------------------------------------------- */
/* ABA PRINCIPAL: AtasSection                                            */
/* --------------------------------------------------------------------- */

export default function AtasSection({ processoId, api, showToast, processoResumo }) {
  const [atas, setAtas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingAtaId, setSavingAtaId] = useState(null); // spinner p/ publicar/remover PNCP
  const [ataModalOpen, setAtaModalOpen] = useState(false);
  const [ataEmEdicao, setAtaEmEdicao] = useState(null);
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [ataParaDocs, setAtaParaDocs] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const fetchAtas = useCallback(async () => {
    if (!processoId) return;
    setLoading(true);
    try {
      const { data } = await api.get('/atas-registro-precos/', {
        params: { processo: processoId },
      });
      const list = Array.isArray(data) ? data : data.results || [];
      setAtas(list);
    } catch (error) {
      console.error(error);
      showToast('Erro ao carregar atas de registro de preços.', 'error');
      setAtas([]);
    } finally {
      setLoading(false);
    }
  }, [api, processoId, showToast]);

  useEffect(() => {
    fetchAtas();
  }, [fetchAtas]);

  const isAtaPublished = (ata) =>
    ata?.status === 'publicada' || !!ata?.pncp_sequencial_ata || !!ata?.pncp_numero_controle;

  /* --------------------------- Handlers Ata --------------------------- */

  const handleOpenNewAta = () => {
    setAtaEmEdicao(null);
    setAtaModalOpen(true);
  };

  const handleEditAta = (ata) => {
    setAtaEmEdicao(ata);
    setAtaModalOpen(true);
  };

  const handleSaveAta = async (form) => {
    // create ou update
    try {
      if (ataEmEdicao?.id) {
        await api.patch(`/atas-registro-precos/${ataEmEdicao.id}/`, {
          ...form,
          processo: processoId,
        });
        showToast('Ata atualizada com sucesso!', 'success');
      } else {
        await api.post('/atas-registro-precos/', {
          ...form,
          processo: processoId,
        });
        showToast('Ata cadastrada com sucesso!', 'success');
      }
      await fetchAtas();
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.detail || 'Erro ao salvar a ata.';
      showToast(msg, 'error');
      throw error;
    }
  };

  const handleDeleteAtaLocal = async (ata) => {
    if (!ata?.id) return;
    try {
      await api.delete(`/atas-registro-precos/${ata.id}/`);
      showToast('Ata removida localmente.', 'success');
      await fetchAtas();
    } catch (error) {
      console.error(error);
      showToast('Erro ao remover a ata.', 'error');
    }
  };

  const handlePublishAtaPncp = async (ata) => {
    if (!ata?.id) return;
    setSavingAtaId(ata.id);
    try {
      await api.post(`/atas-registro-precos/${ata.id}/enviar-ao-pncp/`);
      showToast('Ata publicada no PNCP com sucesso!', 'success');
      await fetchAtas();
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.detail || 'Erro ao publicar ata no PNCP.';
      showToast(msg, 'error');
    } finally {
      setSavingAtaId(null);
    }
  };

  const handleRemoverAtaPncp = async (ata) => {
    if (!ata?.id) return;
    setSavingAtaId(ata.id);
    try {
      await api.post(`/atas-registro-precos/${ata.id}/remover-do-pncp/`, {
        justificativa: 'Remoção de Ata de Registro de Preços solicitada pelo sistema de origem.',
      });
      showToast('Ata removida do PNCP com sucesso.', 'success');
      await fetchAtas();
    } catch (error) {
      console.error(error);
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'Erro ao remover ata no PNCP.';
      showToast(msg, 'error');
    } finally {
      setSavingAtaId(null);
    }
  };

  const handleOpenDocsModal = (ata) => {
    setAtaParaDocs(ata);
    setDocsModalOpen(true);
  };

  /* ------------------------------------------------------------------- */

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-5">
      {/* Modais */}
      <AnimatePresence>
        {ataModalOpen && (
          <AtaFormModal
            open={ataModalOpen}
            onClose={() => setAtaModalOpen(false)}
            onSave={handleSaveAta}
            initialData={ataEmEdicao}
            processoResumo={processoResumo}
          />
        )}

        {docsModalOpen && ataParaDocs && (
          <AtaDocumentosModal
            open={docsModalOpen}
            ata={ataParaDocs}
            api={api}
            showToast={showToast}
            onClose={() => {
              setDocsModalOpen(false);
              setAtaParaDocs(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Cabeçalho da seção */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent-blue" />
            Atas de Registro de Preços
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cadastre as Atas vinculadas a este processo, publique no PNCP e gerencie os documentos
            específicos de cada ata.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNewAta}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-semibold bg-accent-blue text-white hover:bg-accent-blue/90 shadow-sm shadow-blue-900/20"
        >
          <Plus className="w-4 h-4" />
          Nova Ata
        </button>
      </div>

      {/* Tabela de Atas */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 dark:text-slate-400">
              <th className="p-2 w-10">ID</th>
              <th className="p-2">Ata / Vigência</th>
              <th className="p-2 hidden md:table-cell">Situação PNCP</th>
              <th className="p-2">Controle PNCP</th>
              <th className="p-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500 dark:text-slate-400 text-xs">
                  <Loader2 className="w-4 h-4 inline-block mr-2 animate-spin" />
                  Carregando atas...
                </td>
              </tr>
            )}

            {!loading && atas.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500 dark:text-slate-400 text-xs">
                  Nenhuma Ata de Registro de Preços cadastrada para este processo.
                </td>
              </tr>
            )}

            {!loading &&
              atas.map((ata) => {
                const published = isAtaPublished(ata);
                const isSaving = savingAtaId === ata.id;

                return (
                  <tr
                    key={ata.id}
                    className="text-xs md:text-sm hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors group"
                  >
                    <td className="p-2 align-middle text-slate-500 dark:text-slate-400">
                      {ata.id}
                    </td>

                    <td className="p-2 align-middle">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">
                        {ata.numero_ata_registro_preco || 'Ata'}{' '}
                        {ata.ano_ata ? `- ${ata.ano_ata}` : ''}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Vigência:{' '}
                        {ata.data_vigencia_inicio
                          ? new Date(ata.data_vigencia_inicio).toLocaleDateString('pt-BR')
                          : '–'}{' '}
                        até{' '}
                        {ata.data_vigencia_fim
                          ? new Date(ata.data_vigencia_fim).toLocaleDateString('pt-BR')
                          : '–'}
                      </div>
                      {ata.data_assinatura && (
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">
                          Assinatura:{' '}
                          {new Date(ata.data_assinatura).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </td>

                    {/* Situação PNCP */}
                    <td className="p-2 align-middle hidden md:table-cell">
                      {published ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
                          <CheckCircle className="w-3 h-3" />
                          Publicada no PNCP
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                          <AlertCircle className="w-3 h-3" />
                          Não publicada
                        </span>
                      )}
                    </td>

                    {/* Número de controle PNCP / link externo */}
                    <td className="p-2 align-middle">
                      {ata.numero_controle_pncp || ata.pncp_numero_controle ? (
                        <div className="flex flex-col text-[11px]">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">
                            {ata.numero_controle_pncp || ata.pncp_numero_controle}
                          </span>
                          {ata.link_pncp && (
                            <a
                              href={ata.link_pncp}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-accent-blue hover:underline mt-0.5"
                            >
                              Ver na PNCP
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          Sem número de controle
                        </span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="p-2 align-middle text-right">
                      <div className="flex justify-end items-center gap-1">
                        {/* Gerenciar Documentos da Ata */}
                        <button
                          type="button"
                          onClick={() => handleOpenDocsModal(ata)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <FileText size={12} />
                          Documentos
                        </button>

                        {/* Publicar PNCP – só se ainda não estiver publicada */}
                        {!published && (
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handlePublishAtaPncp(ata)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-accent-blue text-white hover:bg-accent-blue/90 disabled:opacity-60 transition-colors"
                          >
                            {isSaving ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Send size={13} />
                            )}
                            Publicar PNCP
                          </button>
                        )}

                        {/* Remover do PNCP – botão aparece APÓS publicado */}
                        {published && (
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleRemoverAtaPncp(ata)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-60 transition-colors"
                          >
                            {isSaving ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                            Remover PNCP
                          </button>
                        )}

                        {/* Menu ⋮ com editar / apagar local */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setMenuOpenId((prev) => (prev === ata.id ? null : ata.id))
                            }
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Mais ações"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {menuOpenId === ata.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setMenuOpenId(null)}
                              />
                              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden text-left">
                                {/* Editar ata */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleEditAta(ata);
                                    setMenuOpenId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                  <Edit size={12} /> Editar ata
                                </button>

                                {/* Apagar ata local – SEM apagar o histórico de PNCP
                                    (mantém o registro na tabela se o backend fizer soft-delete) */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDeleteAtaLocal(ata);
                                    setMenuOpenId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-[11px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                  <Trash2 size={12} /> Apagar ata (local)
                                </button>
                              </div>
                            </>
                          )}
                        </div>
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
