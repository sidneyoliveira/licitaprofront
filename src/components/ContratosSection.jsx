import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Edit,
  Eye,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Send,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { extractErrorMessage, extractResults } from '../services/api';

const INPUT_STYLE =
  'w-full h-10 px-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue bg-white dark:bg-dark-bg-primary text-slate-900 dark:text-slate-100 text-sm transition-all disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 placeholder:text-slate-400';
const LABEL_STYLE =
  'block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide';
const SECTION_STYLE = 'p-4 rounded-lg border border-slate-200 dark:border-slate-700';

const CONTRATO_DOCUMENT_SLOTS = [
  {
    chave: 'termo_convocacao',
    titulo: 'Termo de convocação',
    categoria: 'Outros Documentos',
    tipoDocumentoId: 7,
  },
  {
    chave: 'contrato',
    titulo: 'Contrato',
    categoria: 'Contrato',
    tipoDocumentoId: 1,
  },
  {
    chave: 'extrato',
    titulo: 'Extrato',
    categoria: 'Outros Documentos',
    tipoDocumentoId: 7,
  },
  {
    chave: 'certidao',
    titulo: 'Certidão',
    categoria: 'Outros Documentos',
    tipoDocumentoId: 7,
  },
];

const StyledCheckbox = ({ checked, onChange, className = '' }) => (
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
    <div className="pointer-events-none flex h-5 w-5 items-center justify-center rounded border-2 border-slate-300 dark:border-slate-600 peer-checked:border-accent-blue peer-checked:bg-accent-blue">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={3}
        stroke="currentColor"
        className={`h-3 w-3 text-white ${checked ? 'opacity-100' : 'opacity-0'}`}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    </div>
  </label>
);

const addOneYearToDateString = (value) => {
  if (!value) return '';
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return '';

  const candidate = new Date(Date.UTC(year + 1, month - 1, day));
  if (candidate.getUTCMonth() !== month - 1 || candidate.getUTCDate() !== day) {
    return `${year + 1}-02-28`;
  }
  return candidate.toISOString().slice(0, 10);
};

const formatDate = (value) => {
  if (!value) return '–';
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR');
};

const formatCurrency = (value) => {
  const numericValue = Number(value || 0);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number.isNaN(numericValue) ? 0 : numericValue);
};

const inferDocumentKey = (doc) => {
  if (doc?.chave_documento) return doc.chave_documento;
  const text = [doc?.titulo, doc?.arquivo_nome].filter(Boolean).join(' ').toLowerCase();
  if (text.includes('termo') && text.includes('convoc')) return 'termo_convocacao';
  if (text.includes('certidao') || text.includes('certidao')) return 'certidao';
  if (text.includes('extrato') || Number(doc?.tipo_documento_id) === 2) return 'extrato';
  if (text.includes('contrato') || Number(doc?.tipo_documento_id) === 1) return 'contrato';
  return null;
};

const getDocumentByKey = (docs, key) =>
  (docs || []).find((doc) => inferDocumentKey(doc) === key && doc.status !== 'removido');

const getPublishBlockers = (item, processoPublicadoPncp) => {
  const blockers = [];

  if (!processoPublicadoPncp) {
    blockers.push('O processo precisa estar publicado no PNCP antes do contrato.');
  }
  if (!item?.fornecedor_nome && !item?.fornecedor_cnpj && !item?.ni_fornecedor) {
    blockers.push('Selecione um fornecedor.');
  }
  if (!item?.unidade_codigo) {
    blockers.push('Selecione a secretaria.');
  }
  if (!item?.objeto) {
    blockers.push('Informe o objeto do contrato.');
  }
  if (item?.valor_contratado == null && item?.valor_global == null && item?.valor_inicial == null) {
    blockers.push('Informe o valor contratado.');
  }
  if (!item?.data_assinatura && !item?.data_vigencia_inicio) {
    blockers.push('Informe o inicio da vigencia.');
  }
  if (!item?.data_vigencia_fim) {
    blockers.push('Informe o fim da vigencia.');
  }
  if (item?.documentos_pendentes?.length) {
    blockers.push(`Faltam documentos: ${item.documentos_pendentes.join(', ')}.`);
  }

  return blockers;
};

const ContratoFormModal = ({
  open,
  onClose,
  onSave,
  initialData,
  processo,
  fornecedores,
  orgaos,
  showToast,
}) => {
  const [saving, setSaving] = useState(false);
  const [allowManualEndDate, setAllowManualEndDate] = useState(false);
  const [form, setForm] = useState({
    numero_contrato_empenho: '',
    ano_contrato: new Date().getFullYear(),
    fornecedor_id: '',
    unidade_codigo: '',
    objeto: '',
    valor_contratado: '',
    data_inicio_vigencia: '',
    data_vigencia_fim: '',
  });

  useEffect(() => {
    if (!open) return;

    const initialStartDate =
      initialData?.data_assinatura || initialData?.data_vigencia_inicio || '';
    const initialEndDate = initialData?.data_vigencia_fim || addOneYearToDateString(initialStartDate);
    const autoCalculatedEndDate = addOneYearToDateString(initialStartDate);

    setAllowManualEndDate(
      Boolean(initialEndDate && initialStartDate && initialEndDate !== autoCalculatedEndDate)
    );

    setForm({
      numero_contrato_empenho: initialData?.numero_contrato_empenho || '',
      ano_contrato: initialData?.ano_contrato || new Date().getFullYear(),
      fornecedor_id: initialData?.fornecedor || '',
      unidade_codigo: initialData?.unidade_codigo || '',
      objeto: initialData?.objeto || processo?.objeto || '',
      valor_contratado:
        initialData?.valor_contratado ?? initialData?.valor_global ?? initialData?.valor_inicial ?? '',
      data_inicio_vigencia: initialStartDate,
      data_vigencia_fim: initialEndDate,
    });
  }, [open, initialData, processo]);

  if (!open) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'data_inicio_vigencia') {
      setForm((prev) => ({
        ...prev,
        data_inicio_vigencia: value,
        data_vigencia_fim: allowManualEndDate ? prev.data_vigencia_fim : addOneYearToDateString(value),
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleManualEndDate = () => {
    setAllowManualEndDate((prev) => {
      const nextValue = !prev;
      if (!nextValue) {
        setForm((current) => ({
          ...current,
          data_vigencia_fim: addOneYearToDateString(current.data_inicio_vigencia),
        }));
      }
      return nextValue;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.fornecedor_id) {
      showToast('Selecione o fornecedor do contrato.', 'warning');
      return;
    }
    if (!form.unidade_codigo) {
      showToast('Selecione a secretaria/unidade do contrato.', 'warning');
      return;
    }
    if (!form.objeto.trim()) {
      showToast('Informe o objeto do contrato.', 'warning');
      return;
    }
    if (!form.valor_contratado) {
      showToast('Informe o valor contratado.', 'warning');
      return;
    }
    if (!form.data_inicio_vigencia || !form.data_vigencia_fim) {
      showToast('Informe as datas de vigencia do contrato.', 'warning');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        numero_contrato_empenho: form.numero_contrato_empenho.trim(),
        ano_contrato: Number(form.ano_contrato),
        fornecedor_id: Number(form.fornecedor_id),
        unidade_codigo: form.unidade_codigo,
        objeto: form.objeto.trim(),
        valor_global: Number(form.valor_contratado),
        data_assinatura: form.data_inicio_vigencia,
        data_vigencia_inicio: form.data_inicio_vigencia,
        data_vigencia_fim: form.data_vigencia_fim,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-dark-bg-secondary w-full max-w-4xl max-h-[90vh] rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg flex flex-col overflow-hidden"
      >
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-dark-bg-primary flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              {initialData?.id ? 'Editar Contrato' : 'Novo Contrato'}
            </h3>
            {processo?.numero_processo && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Processo: <strong>{processo.numero_processo}</strong>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <form id="contratoForm" onSubmit={handleSubmit} className="space-y-4">
            <div className={`${SECTION_STYLE} bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/40`}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-accent-blue rounded-full"></div>
                <h4 className="text-xs font-bold text-accent-blue uppercase">Contexto do Processo</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300">
                <div>
                  <span className="font-semibold">Objeto base:</span>
                  <p className="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
                    {processo?.objeto || 'O objeto sera preenchido manualmente neste contrato.'}
                  </p>
                </div>
                <div>
                  <span className="font-semibold">Secretarias disponiveis:</span>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">
                    {orgaos.length > 0 ? `${orgaos.length} unidade(s) vinculada(s)` : 'Nenhuma unidade vinculada a entidade.'}
                  </p>
                </div>
                <div>
                  <span className="font-semibold">Fornecedores do processo:</span>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">
                    {fornecedores.length > 0 ? `${fornecedores.length} fornecedor(es) disponivel(is)` : 'Nenhum fornecedor vinculado ao processo.'}
                  </p>
                </div>
              </div>
            </div>

            <div className={`${SECTION_STYLE} bg-white dark:bg-dark-bg-primary`}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Dados do Contrato</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4">
                  <label className={LABEL_STYLE}>Numero do Contrato *</label>
                  <input
                    name="numero_contrato_empenho"
                    value={form.numero_contrato_empenho}
                    onChange={handleChange}
                    className={INPUT_STYLE}
                    placeholder="Ex: 012/2026"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={LABEL_STYLE}>Ano *</label>
                  <input
                    type="number"
                    name="ano_contrato"
                    value={form.ano_contrato}
                    onChange={handleChange}
                    className={INPUT_STYLE}
                    required
                  />
                </div>

                <div className="md:col-span-6">
                  <label className={LABEL_STYLE}>Fornecedor *</label>
                  <select
                    name="fornecedor_id"
                    value={form.fornecedor_id}
                    onChange={handleChange}
                    className={INPUT_STYLE}
                    required
                  >
                    <option value="">Selecione o fornecedor...</option>
                    {fornecedores.map((fornecedor) => (
                      <option key={fornecedor.id} value={fornecedor.id}>
                        {fornecedor.razao_social} ({fornecedor.cnpj})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-6">
                  <label className={LABEL_STYLE}>Secretaria / Unidade *</label>
                  <select
                    name="unidade_codigo"
                    value={form.unidade_codigo}
                    onChange={handleChange}
                    className={INPUT_STYLE}
                    required
                  >
                    <option value="">Selecione a secretaria...</option>
                    {orgaos.map((orgao) => (
                      <option key={orgao.id || orgao.codigo_unidade} value={orgao.codigo_unidade || ''}>
                        {orgao.nome} {orgao.codigo_unidade ? `(${orgao.codigo_unidade})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-6">
                  <label className={LABEL_STYLE}>Valor Contratado *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="valor_contratado"
                    value={form.valor_contratado}
                    onChange={handleChange}
                    className={INPUT_STYLE}
                    placeholder="Ex: 153000.00"
                    required
                  />
                </div>

                <div className="md:col-span-12">
                  <label className={LABEL_STYLE}>Objeto *</label>
                  <textarea
                    name="objeto"
                    rows={4}
                    value={form.objeto}
                    onChange={handleChange}
                    className={`${INPUT_STYLE} h-auto py-2`}
                    placeholder="O objeto e carregado automaticamente do processo, mas pode ser ajustado aqui."
                    required
                  />
                </div>
              </div>
            </div>

            <div className={`${SECTION_STYLE} bg-slate-50 dark:bg-dark-bg-primary mb-0`}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">Vigencia</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6">
                  <label className={LABEL_STYLE}>Inicio da Vigencia / Data da Assinatura *</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="date"
                      name="data_inicio_vigencia"
                      value={form.data_inicio_vigencia}
                      onChange={handleChange}
                      className={`${INPUT_STYLE} pl-9`}
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-6">
                  <label className={LABEL_STYLE}>Fim da Vigencia *</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="date"
                        name="data_vigencia_fim"
                        value={form.data_vigencia_fim}
                        onChange={handleChange}
                        className={`${INPUT_STYLE} pl-9`}
                        disabled={!allowManualEndDate}
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={toggleManualEndDate}
                      className={`h-10 w-10 rounded-lg border transition-colors ${
                        allowManualEndDate
                          ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                          : 'border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                      }`}
                      title={
                        allowManualEndDate
                          ? 'Voltar para o calculo automatico do fim da vigencia'
                          : 'Editar manualmente o fim da vigencia'
                      }
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                    {allowManualEndDate
                      ? 'Modo manual ativado. Voce pode ajustar a data final.'
                      : 'A data final e calculada automaticamente com um ano de vigencia.'}
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="px-4 sm:px-6 py-4 bg-slate-50 dark:bg-dark-bg-primary border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="contratoForm"
            disabled={saving}
            className="px-6 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-accent-blue-hover transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            {initialData?.id ? 'Salvar Alteracoes' : 'Adicionar Contrato'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const DocumentosContratoModal = ({ open, contrato, api, showToast, onClose, onDocumentsUpdated }) => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState(null);

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
  }, [api, contrato?.id, showToast]);

  useEffect(() => {
    if (open && contrato?.id) {
      fetchDocs();
    }
  }, [open, contrato?.id, fetchDocs]);

  if (!open || !contrato) return null;

  const documentosPendentes = CONTRATO_DOCUMENT_SLOTS.filter((slot) => {
    const doc = getDocumentByKey(docs, slot.chave);
    return !doc?.arquivo_url && !doc?.arquivo;
  });

  const handleFileUpsert = async (slot, file) => {
    if (!file) return;
    setSavingKey(slot.chave);

    try {
      const formData = new FormData();
      formData.append('contrato', contrato.id);
      formData.append('chave_documento', slot.chave);
      formData.append('tipo_documento_id', slot.tipoDocumentoId);
      formData.append('titulo', slot.titulo);
      formData.append('arquivo', file);

      await api.post('/documentos-contratos/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showToast('Documento salvo com sucesso.', 'success');
      await fetchDocs();
      onDocumentsUpdated?.();
    } catch (error) {
      console.error(error);
      showToast(extractErrorMessage(error, 'Erro ao salvar documento do contrato.'), 'error');
    } finally {
      setSavingKey(null);
    }
  };

  const handleDeleteLocal = async (doc) => {
    if (!doc?.id) return;
    setSavingKey(doc.id);
    try {
      await api.delete(`/documentos-contratos/${doc.id}/`);
      showToast('Documento removido.', 'success');
      await fetchDocs();
      onDocumentsUpdated?.();
    } catch (error) {
      console.error(error);
      showToast(extractErrorMessage(error, 'Erro ao remover documento local.'), 'error');
    } finally {
      setSavingKey(null);
    }
  };

  const handleViewFile = (doc) => {
    const url = doc?.arquivo_url || doc?.arquivo;
    if (!url) {
      showToast('Arquivo nao disponivel para visualizacao.', 'warning');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{ duration: 0.12 }}
        className="w-full max-w-5xl ui-modal-panel"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
          <div>
            <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent-blue" />
              Documentos do Contrato {contrato.numero_contrato_empenho || contrato.id}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Anexe os quatro documentos obrigatorios para habilitar o envio do contrato ao PNCP.
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

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 flex flex-wrap gap-4 text-xs text-blue-900 dark:text-blue-100">
            <div>
              <span className="font-semibold">Obrigatorios:</span>{' '}
              {CONTRATO_DOCUMENT_SLOTS.length} arquivos
            </div>
            <div>
              <span className="font-semibold">Anexados:</span>{' '}
              {CONTRATO_DOCUMENT_SLOTS.length - documentosPendentes.length}
            </div>
            <div>
              <span className="font-semibold">Pendentes:</span>{' '}
              {documentosPendentes.length}
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              <Loader2 className="w-4 h-4 inline-block mr-2 animate-spin" />
              Carregando documentos...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CONTRATO_DOCUMENT_SLOTS.map((slot) => {
                const doc = getDocumentByKey(docs, slot.chave);
                const fileUrl = doc?.arquivo_url || doc?.arquivo;
                const isPublished = doc?.status === 'enviado';
                const isErrored = doc?.status === 'erro';
                const rowSaving = savingKey === slot.chave || savingKey === doc?.id;

                return (
                  <div
                    key={slot.chave}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-bg-primary p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
                            {slot.titulo}
                          </h4>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {slot.categoria}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          {fileUrl
                            ? doc?.arquivo_nome || doc?.titulo || 'Arquivo anexado'
                            : 'Nenhum arquivo anexado ainda.'}
                        </p>
                      </div>

                      {isPublished ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
                          <CheckCircle className="w-3 h-3" />
                          Enviado
                        </span>
                      ) : isErrored ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-800">
                          <AlertCircle className="w-3 h-3" />
                          Erro
                        </span>
                      ) : fileUrl ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800">
                          <UploadCloud className="w-3 h-3" />
                          Pronto
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                          <AlertCircle className="w-3 h-3" />
                          Pendente
                        </span>
                      )}
                    </div>

                    <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/30 px-3 py-3 mb-3 text-[11px] text-slate-500 dark:text-slate-400">
                      {isPublished
                        ? 'Documento ja enviado ao PNCP. Para trocar esse arquivo, remova-o do PNCP primeiro.'
                        : 'Esse anexo sera enviado automaticamente junto com o contrato quando a publicacao for iniciada.'}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold transition-colors ${
                          isPublished
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500'
                            : 'bg-accent-blue text-white hover:bg-accent-blue/90 cursor-pointer'
                        }`}
                      >
                        {rowSaving ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                        {fileUrl ? 'Trocar arquivo' : 'Anexar arquivo'}
                        <input
                          type="file"
                          className="hidden"
                          disabled={isPublished || rowSaving}
                          onChange={(event) => {
                            const file = event.target.files?.[0] || null;
                            if (file) {
                              handleFileUpsert(slot, file);
                            }
                            event.target.value = '';
                          }}
                        />
                      </label>

                      {fileUrl && (
                        <button
                          type="button"
                          onClick={() => handleViewFile(doc)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Eye size={13} />
                          Visualizar
                        </button>
                      )}

                      {doc && !isPublished && (
                        <button
                          type="button"
                          disabled={rowSaving}
                          onClick={() => handleDeleteLocal(doc)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors disabled:opacity-60"
                        >
                          {rowSaving ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
            {documentosPendentes.length === 0
              ? 'Tudo certo: o contrato ja pode ser enviado ao PNCP a partir da tabela principal.'
              : `Ainda faltam ${documentosPendentes.length} documento(s): ${documentosPendentes.map((item) => item.titulo).join(', ')}.`}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function ContratosSection({
  processoId,
  processo,
  fornecedores = [],
  orgaos = [],
  api,
  showToast,
}) {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingContratoId, setSavingContratoId] = useState(null);
  const [contratoModalOpen, setContratoModalOpen] = useState(false);
  const [contratoEmEdicao, setContratoEmEdicao] = useState(null);
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [contratoParaDocs, setContratoParaDocs] = useState(null);
  const [selectedContratos, setSelectedContratos] = useState(new Set());

  const fornecedoresOptions = useMemo(
    () => (Array.isArray(fornecedores) ? fornecedores : extractResults(fornecedores)),
    [fornecedores]
  );

  const orgaosOptions = useMemo(
    () => (Array.isArray(orgaos) ? orgaos : extractResults(orgaos)),
    [orgaos]
  );

  const processoPublicadoPncp = Boolean(processo?.pncp_ano_compra && processo?.pncp_sequencial_compra);

  const fetchContratos = useCallback(async () => {
    if (!processoId) return;
    setLoading(true);
    try {
      const { data } = await api.get('/contratos/', { params: { processo: processoId } });
      setContratos(extractResults(data));
    } catch (error) {
      console.error(error);
      showToast('Erro ao carregar contratos.', 'error');
      setContratos([]);
    } finally {
      setLoading(false);
    }
  }, [api, processoId, showToast]);

  useEffect(() => {
    fetchContratos();
  }, [fetchContratos]);

  const allSelected = contratos.length > 0 && contratos.every((item) => selectedContratos.has(item.id));

  const handleSave = async (payload) => {
    try {
      if (contratoEmEdicao?.id) {
        await api.patch(`/contratos/${contratoEmEdicao.id}/`, {
          ...payload,
          processo: processoId,
        });
        showToast('Contrato atualizado com sucesso.', 'success');
      } else {
        await api.post('/contratos/', {
          ...payload,
          processo: processoId,
        });
        showToast('Contrato criado com sucesso.', 'success');
      }
      await fetchContratos();
    } catch (error) {
      console.error(error);
      showToast(extractErrorMessage(error, 'Erro ao salvar contrato.'), 'error');
      throw error;
    }
  };

  const handleDeleteOne = async (item) => {
    try {
      await api.delete(`/contratos/${item.id}/`);
      showToast('Contrato removido localmente.', 'success');
      await fetchContratos();
    } catch (error) {
      console.error(error);
      showToast(extractErrorMessage(error, 'Erro ao remover contrato.'), 'error');
    }
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedContratos];
    if (!ids.length) return;
    try {
      await api.post('/contratos/bulk-delete/', { ids });
      showToast(`${ids.length} contrato(s) removido(s).`, 'success');
      setSelectedContratos(new Set());
      await fetchContratos();
    } catch (error) {
      console.error(error);
      showToast(extractErrorMessage(error, 'Erro ao remover contratos selecionados.'), 'error');
    }
  };

  const handlePublish = async (item) => {
    const blockers = getPublishBlockers(item, processoPublicadoPncp);
    if (blockers.length > 0) {
      showToast(blockers[0], 'warning');
      return;
    }

    setSavingContratoId(item.id);
    try {
      const { data } = await api.post(`/contratos/${item.id}/publicar-no-pncp/`);
      if (data?.documentos_com_erro?.length) {
        showToast(data.detail || 'Contrato publicado com pendencias em documentos.', 'warning');
      } else {
        showToast(data?.detail || 'Contrato publicado no PNCP com sucesso.', 'success');
      }
      await fetchContratos();
    } catch (error) {
      console.error(error);
      const responseData = error?.response?.data || {};
      const details = [
        ...(responseData.campos_pendentes || []),
        ...(responseData.documentos_pendentes || []).map((itemName) => `Documento pendente: ${itemName}`),
      ];
      const message = details.length > 0 ? details[0] : extractErrorMessage(error, 'Erro ao publicar contrato no PNCP.');
      showToast(message, 'error');
    } finally {
      setSavingContratoId(null);
    }
  };

  const handleRetificar = async (item) => {
    const justificativa = window.prompt('Justificativa para retificacao:', 'Retificacao de contrato solicitada pelo sistema de origem.');
    if (justificativa === null) return;

    setSavingContratoId(item.id);
    try {
      const { data } = await api.post(`/contratos/${item.id}/retificar-no-pncp/`, { justificativa });
      if (data?.documentos_com_erro?.length) {
        showToast(data.detail || 'Contrato retificado, mas ainda ha documentos pendentes.', 'warning');
      } else {
        showToast(data?.detail || 'Contrato retificado no PNCP.', 'success');
      }
      await fetchContratos();
    } catch (error) {
      console.error(error);
      showToast(extractErrorMessage(error, 'Erro ao retificar contrato no PNCP.'), 'error');
    } finally {
      setSavingContratoId(null);
    }
  };

  const handleExcluirPncp = async (item) => {
    setSavingContratoId(item.id);
    try {
      await api.post(`/contratos/${item.id}/excluir-do-pncp/`, {
        justificativa: 'Exclusao de contrato solicitada pelo sistema de origem.',
      });
      showToast('Contrato removido do PNCP.', 'success');
      await fetchContratos();
    } catch (error) {
      console.error(error);
      showToast(extractErrorMessage(error, 'Erro ao remover contrato do PNCP.'), 'error');
    } finally {
      setSavingContratoId(null);
    }
  };

  const openNewContratoModal = () => {
    setContratoEmEdicao(null);
    setContratoModalOpen(true);
  };

  const openEditContratoModal = (item) => {
    setContratoEmEdicao(item);
    setContratoModalOpen(true);
  };

  const openDocumentosModal = (item) => {
    setContratoParaDocs(item);
    setDocsModalOpen(true);
  };

  const isPublished = (item) => item?.status === 'publicado' || Boolean(item?.pncp_sequencial_contrato);

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-5">
      <AnimatePresence>
        {contratoModalOpen && (
          <ContratoFormModal
            open={contratoModalOpen}
            onClose={() => {
              setContratoModalOpen(false);
              setContratoEmEdicao(null);
            }}
            onSave={handleSave}
            initialData={contratoEmEdicao}
            processo={processo}
            fornecedores={fornecedoresOptions}
            orgaos={orgaosOptions}
            showToast={showToast}
          />
        )}

        {docsModalOpen && contratoParaDocs && (
          <DocumentosContratoModal
            open={docsModalOpen}
            contrato={contratoParaDocs}
            api={api}
            showToast={showToast}
            onClose={() => {
              setDocsModalOpen(false);
              setContratoParaDocs(null);
            }}
            onDocumentsUpdated={fetchContratos}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Contratos</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cadastre os contratos vinculados a este processo, anexe os documentos obrigatorios e envie ao PNCP com validacao completa.
          </p>
          {!processoPublicadoPncp && (
            <p className="text-xs text-amber-600 dark:text-amber-300 mt-1 font-semibold">
              O processo precisa estar publicado no PNCP antes do envio de qualquer contrato.
            </p>
          )}
          {selectedContratos.size > 0 && (
            <p className="text-xs text-accent-blue mt-1 font-semibold">
              {selectedContratos.size} contrato(s) selecionado(s).
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {selectedContratos.size > 0 && (
            <button
              type="button"
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold bg-rose-50 dark:bg-rose-900/20 border border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 shadow-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Excluir ({selectedContratos.size})
            </button>
          )}

          <button
            type="button"
            onClick={openNewContratoModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-semibold bg-accent-blue text-white hover:bg-accent-blue/90 shadow-sm shadow-blue-900/20"
          >
            <Plus className="w-4 h-4" />
            Novo Contrato
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="ui-process-table text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500 dark:text-slate-400">
              <th className="p-2 w-12 text-center">
                <StyledCheckbox
                  checked={allSelected}
                  onChange={() => {
                    if (allSelected) {
                      setSelectedContratos(new Set());
                    } else {
                      setSelectedContratos(new Set(contratos.map((item) => item.id)));
                    }
                  }}
                />
              </th>
              <th className="p-2 w-10">ID</th>
              <th className="p-2">Contrato / Fornecedor</th>
              <th className="p-2 hidden lg:table-cell">Secretaria / Vigencia</th>
              <th className="p-2 hidden md:table-cell">Documentos</th>
              <th className="p-2 hidden md:table-cell">Situacao PNCP</th>
              <th className="p-2">Controle PNCP</th>
              <th className="p-2 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-500 dark:text-slate-400 text-xs">
                  <Loader2 className="w-4 h-4 inline-block mr-2 animate-spin" />
                  Carregando contratos...
                </td>
              </tr>
            )}

            {!loading && contratos.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-500 dark:text-slate-400 text-xs">
                  Nenhum contrato cadastrado para este processo.
                </td>
              </tr>
            )}

            {!loading &&
              contratos.map((item) => {
                const published = isPublished(item);
                const isSaving = savingContratoId === item.id;
                const isSelected = selectedContratos.has(item.id);
                const blockers = getPublishBlockers(item, processoPublicadoPncp);

                return (
                  <tr
                    key={item.id}
                    className={`text-xs md:text-sm group transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-900/20'
                        : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/20'
                    }`}
                  >
                    <td className="p-2 align-middle text-center">
                      <StyledCheckbox
                        checked={isSelected}
                        onChange={() => {
                          setSelectedContratos((previous) => {
                            const next = new Set(previous);
                            if (next.has(item.id)) {
                              next.delete(item.id);
                            } else {
                              next.add(item.id);
                            }
                            return next;
                          });
                        }}
                      />
                    </td>

                    <td className="p-2 align-middle text-slate-500 dark:text-slate-400">{item.id}</td>

                    <td className="p-2 align-middle">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">
                        {item.numero_contrato_empenho || 'Contrato'} {item.ano_contrato ? `- ${item.ano_contrato}` : ''}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Fornecedor: {item.fornecedor_nome || item.fornecedor_cnpj || item.ni_fornecedor || 'Não selecionado'}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-2">
                        {item.objeto || 'Sem objeto informado.'}
                      </div>
                    </td>

                    <td className="p-2 align-middle hidden lg:table-cell">
                      <div className="text-slate-700 dark:text-slate-200 font-medium">
                        {item.unidade_nome || item.unidade_codigo || 'Secretaria não informada'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Inicio: {formatDate(item.data_vigencia_inicio || item.data_assinatura)}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Fim: {formatDate(item.data_vigencia_fim)}
                      </div>
                    </td>

                    <td className="p-2 align-middle hidden md:table-cell">
                      {item.documentos_obrigatorios_ok ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
                          <CheckCircle className="w-3 h-3" />
                          4 de 4 anexados
                        </span>
                      ) : (
                        <div className="text-[11px] text-rose-600 dark:text-rose-300 leading-relaxed">
                          {item.documentos_pendentes?.length
                            ? `Faltam: ${item.documentos_pendentes.join(', ')}`
                            : 'Anexos obrigatorios pendentes'}
                        </div>
                      )}
                    </td>

                    <td className="p-2 align-middle hidden md:table-cell">
                      {published ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
                          <CheckCircle className="w-3 h-3" />
                          Publicado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                          <AlertCircle className="w-3 h-3" />
                          Rascunho
                        </span>
                      )}
                    </td>

                    <td className="p-2 align-middle">
                      {item.numero_controle_pncp ? (
                        <div className="flex flex-col text-[11px]">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">
                            {item.numero_controle_pncp}
                          </span>
                          {item.link_pncp && (
                            <a
                              href={item.link_pncp}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-accent-blue hover:underline mt-0.5"
                            >
                              Ver no PNCP
                            </a>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">Sem controle</span>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {formatCurrency(item.valor_contratado ?? item.valor_global ?? item.valor_inicial)}
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="p-2 align-middle text-right">
                      <div className="flex justify-end items-center gap-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => openDocumentosModal(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <FileText size={12} />
                          Documentos
                        </button>

                        {!published && (
                          <button
                            type="button"
                            disabled={isSaving || blockers.length > 0}
                            title={blockers.length > 0 ? blockers.join(' ') : 'Enviar contrato ao PNCP'}
                            onClick={() => handlePublish(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-accent-blue text-white hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                            Enviar PNCP
                          </button>
                        )}

                        {published && (
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleRetificar(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-300 disabled:opacity-60 transition-colors"
                          >
                            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Edit size={13} />}
                            Retificar
                          </button>
                        )}

                        {published && (
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleExcluirPncp(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 disabled:opacity-60 transition-colors"
                          >
                            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                            Remover PNCP
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openEditContratoModal(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Edit size={13} />
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteOne(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                        >
                          <Trash2 size={13} />
                          Excluir
                        </button>
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
