import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  FileText,
  X,
  Loader2,
  Send,
  LayoutDashboard,
  Package,
  Users,
  Layers,
  UploadCloud,
  CheckCircle,
  Trash2,
  Edit,
  AlertCircle,
  StickyNote,
  Plus
} from 'lucide-react';

// --- COMPONENTES & SEÇÕES ---
import ProcessHeader from '../components/ProcessHeader';
import DadosGeraisForm from '../components/DadosGeraisForm';
import ItemsSection from '../components/ItemsSection';
import LotesSection from '../components/LotesSection';
import FornecedoresSection from '../components/FornecedoresSection';
import ContratosSection from '../components/ContratosSection';

// --- MODAIS ---
import ItemModal from '../components/ItemModal';
import FornecedorModal from '../components/FornecedorModal';
import ImportacaoProcessoModal from '../components/ImportacaoProcessoModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

// --- INFRA ---
import useAxios from '../hooks/useAxios';
import { useToast } from '../context/ToastContext';
import { extractResults } from '../services/api';

import AtasSection from '../components/AtasSection';
import SharedNotesBoard from '../components/SharedNotesBoard';


/* ────────────────────────────────────────────────────────────────────────── */
/* TIPOS DE DOCUMENTO (PNCP 5.12)                                            */
/* ────────────────────────────────────────────────────────────────────────── */

const DOCUMENT_TYPES = [
  { id: 16, nome: 'Outros Documentos' },
  { id: 1, nome: 'Aviso de Contratação Direta' },
  { id: 2, nome: 'Edital' },
  { id: 3, nome: 'Minuta do Contrato' },
  { id: 4, nome: 'Termo de Referência' },
  { id: 5, nome: 'Anteprojeto' },
  { id: 6, nome: 'Projeto Básico' },
  { id: 7, nome: 'Estudo Técnico Preliminar' },
  { id: 8, nome: 'Projeto Executivo' },
  { id: 9, nome: 'Mapa de Riscos' },
  { id: 10, nome: 'DFD' },
  { id: 19, nome: 'Minuta de Ata de Registro de Preços' },
  { id: 20, nome: 'Ato que autoriza a Contratação Direta' },
];

const DEFAULT_DOCUMENT_TEMPLATES = [
  { nome: 'Edital', tipo_documento_id: 2 },
  { nome: 'Documento de Formalização de Demanda', tipo_documento_id: 16 },
  { nome: 'Estudo Técnico Preliminar', tipo_documento_id: 7 },
  { nome: 'Termo de referência', tipo_documento_id: 4 },
  { nome: 'Termo de Autuação', tipo_documento_id: 16 },
  { nome: 'Anexo I Termo de Referencia', tipo_documento_id: 16 },
  { nome: 'Anexo II Minuta de contrato', tipo_documento_id: 3 },
  { nome: 'Anexo III Minuta da Ata de Registro de Preços', tipo_documento_id: 16 },
  { nome: 'Termo de adjudicação', tipo_documento_id: 16 },
  { nome: 'Termo de homologação', tipo_documento_id: 16 },
];

/* ────────────────────────────────────────────────────────────────────────── */
/* SUBCOMPONENTE: Modal de Envio ao PNCP (Edital Rápido)                     */
/* ────────────────────────────────────────────────────────────────────────── */

const ModalEnvioPNCP = ({ processo, onClose, onSuccess }) => {
  const api = useAxios();
  const { showToast } = useToast();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return showToast('Selecione o arquivo do Edital (PDF).', 'warning');

    setLoading(true);
    const formData = new FormData();
    formData.append('arquivo', file);
    formData.append('titulo_documento', `Edital - ${processo.numero_processo}`);

    try {
      await api.post(`/processos/${processo.id}/publicar-pncp/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Processo enviado ao PNCP com sucesso!', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.detail || 'Erro ao comunicar com o PNCP.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-dark-bg-secondary rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
            <Globe className="w-5 h-5 text-accent-blue" />
            Publicar no PNCP
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleUpload} className="p-5 space-y-5">
          <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-800 dark:text-blue-200 px-3 py-3">
            Você está publicando o processo{' '}
            <span className="font-semibold">{processo.numero_processo}</span> no ambiente de produção do PNCP.
          </div>

          <div className="space-y-2">
            <label className="block text-md font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
              Anexar Edital/Aviso (PDF)
            </label>
            <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer group hover:border-accent-blue hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div
                className={`p-3 rounded-full mb-3 flex items-center justify-center ${
                  file
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-accent-blue'
                }`}
              >
                <FileText className="w-7 h-7" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {file ? file.name : 'Clique para selecionar o arquivo PDF do edital/aviso'}
              </span>
              {!file && (
                <span className="mt-1 text-md text-slate-400 dark:text-slate-500">
                  Tamanho máximo e demais regras conforme o PNCP.
                </span>
              )}
            </div>
          </div>

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
              disabled={loading || !file}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-accent-blue text-white hover:bg-accent-blue/90 shadow-sm shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Enviar agora
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/* SUBCOMPONENTE: Botão de Aba                                               */
/* ────────────────────────────────────────────────────────────────────────── */

const TAB_COLORS = {
  itens:        { active: 'text-blue-600 dark:text-blue-400',    border: 'border-blue-600 dark:border-blue-400',    inactive: 'text-slate-400' },
  lotes:        { active: 'text-violet-600 dark:text-violet-400', border: 'border-violet-600 dark:border-violet-400', inactive: 'text-slate-400' },
  fornecedores: { active: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-600 dark:border-emerald-400', inactive: 'text-slate-400' },
  contratos:    { active: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-600 dark:border-cyan-400', inactive: 'text-slate-400' },
  atas:         { active: 'text-amber-600 dark:text-amber-400',  border: 'border-amber-600 dark:border-amber-400',  inactive: 'text-slate-400' },
  arquivos:     { active: 'text-rose-600 dark:text-rose-400',    border: 'border-rose-600 dark:border-rose-400',    inactive: 'text-slate-400' },
  anotacoes:    { active: 'text-amber-600 dark:text-amber-400',  border: 'border-amber-600 dark:border-amber-400',  inactive: 'text-slate-400' },
};

const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => {
  const colors = TAB_COLORS[id] || TAB_COLORS.itens;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap
        border-b-2 transition-colors
        ${isActive
          ? `${colors.active} ${colors.border}`
          : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
        }
      `}
      aria-selected={isActive}
      role="tab"
      id={`tab-${id}`}
    >
      <Icon size={17} className={isActive ? colors.active : colors.inactive} />
      {label}
    </button>
  );
};

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

/* ────────────────────────────────────────────────────────────────────────── */
/* SUBCOMPONENTE: Aba de Arquivos / PNCP (FLUXO CORRIGIDO)                   */
/* - Coluna Local lê localDocs                                               */
/* - Coluna PNCP lê pncpRemoteDocs                                           */
/* - Botão "Publicar PNCP" (texto)                                           */
/* - Após publicado -> "Remover PNCP"                                        */
/* - Remove "Visualizar" do menu ⋮                                           */
/* ────────────────────────────────────────────────────────────────────────── */
const ArquivosSection = ({
  documentRows,
  documentTypeOptions,
  localDocs,
  pncpRemoteDocs,
  onAddDocument,
  onFileUpsert,
  onPublishPncp,
  onRemovePncp,
  onDeleteLocal,
  onBulkDeleteDocuments,
  onView,
  sendingKey,
}) => {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDocNome, setNewDocNome] = useState('');
  const [newDocTipoId, setNewDocTipoId] = useState('');
  const [newDocFile, setNewDocFile] = useState(null);
  const [addingDoc, setAddingDoc] = useState(false);

  const allDocTypesSelected =
    documentRows.length > 0 && documentRows.every((d) => selectedRows.has(d.id));

  const toggleSelectDocType = (id) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAllDocTypes = () => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (allDocTypesSelected) {
        documentRows.forEach((d) => next.delete(d.id));
      } else {
        documentRows.forEach((d) => next.add(d.id));
      }
      return next;
    });
  };

  const findLocalByLinha = (row) => {
    const byLinha = (localDocs || []).find(
      (d) => Number(d.linha_documento) === Number(row.id)
    );
    if (byLinha) return byLinha;

    return (localDocs || []).find(
      (d) =>
        Number(d.tipo_documento_id) === Number(row.tipo_documento_id) &&
        String(d.titulo || '').trim().toLowerCase() === String(row.nome || '').trim().toLowerCase()
    );
  };

  const findPncpByLinha = (row, localDoc) => {
    if (localDoc?.pncp_sequencial_documento) {
      const bySeq = (pncpRemoteDocs || []).find(
        (d) => Number(d.pncp_sequencial_documento || d.sequencial_documento) === Number(localDoc.pncp_sequencial_documento)
      );
      if (bySeq) return bySeq;
    }
    return (pncpRemoteDocs || []).find((d) => Number(d.tipo_documento_id ?? d.tipoDocumentoId) === Number(row.tipo_documento_id));
  };

  const getFileUrl = (doc) => doc?.arquivo_url || doc?.arquivo || null;
  const getFileName = (doc) =>
    doc?.arquivo_nome || doc?.arquivo_nome_original || doc?.titulo || 'arquivo';

  const handleAddDocumentSubmit = async (e) => {
    e.preventDefault();
    const nome = newDocNome.trim();
    const tipo_documento_id = Number(newDocTipoId || 0);
    if (!nome || !tipo_documento_id || !newDocFile) return;

    setAddingDoc(true);
    await onAddDocument({ nome, tipo_documento_id, arquivo: newDocFile });
    setAddingDoc(false);
    setNewDocNome('');
    setNewDocTipoId('');
    setNewDocFile(null);
    setIsAddModalOpen(false);
  };

  const canAddDocument = !!newDocNome.trim() && !!Number(newDocTipoId || 0) && !!newDocFile;

  const handleBulkDelete = async () => {
    if (!selectedRows.size) return;
    await onBulkDeleteDocuments([...selectedRows]);
    setSelectedRows(new Set());
  };

  return (
    <div className="space-y-6">
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-bg-secondary shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Adicionar documento</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddDocumentSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Nome do documento</label>
                <input
                  type="text"
                  value={newDocNome}
                  onChange={(e) => setNewDocNome(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-bg-primary text-sm"
                  placeholder="Ex.: Documento complementar"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tipo do documento</label>
                <select
                  value={newDocTipoId}
                  onChange={(e) => setNewDocTipoId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-bg-primary text-sm"
                >
                  <option value="">Selecione</option>
                  {documentTypeOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Arquivo</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.odt,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.zip"
                  onChange={(e) => setNewDocFile(e.target.files?.[0] || null)}
                  className="w-full text-sm file:mr-3 file:px-3 file:py-2 file:rounded-md file:border-0 file:bg-emerald-50 file:text-emerald-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!canAddDocument || addingDoc}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {addingDoc ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Documentos da Contratação</h2>
          {selectedRows.size > 0 && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {selectedRows.size} documento(s) selecionado(s).
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedRows.size > 0 && (
            <button
              type="button"
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md border border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
            >
              <Trash2 size={16} />
              Excluir ({selectedRows.size})
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Plus size={16} />
            Adicionar documento
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse ui-process-table">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-md md:text-xs uppercase text-slate-500 dark:text-slate-400">
              <th className="p-2 md:p-3 w-12 text-center">
                <StyledCheckbox checked={allDocTypesSelected} onChange={toggleSelectAllDocTypes} />
              </th>
              <th className="p-2 md:p-3 w-14">Ordem</th>
              <th className="p-2 md:p-3">Nome do Documento</th>
              <th className="p-2 md:p-3">Tipo de Documento</th>
              <th className="p-2 md:p-3">Arquivo Local</th>
              <th className="p-2 md:p-3 hidden md:table-cell">Status PNCP</th>
              <th className="p-2 md:p-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {documentRows.map((dt, index) => {
              const local = findLocalByLinha(dt);
              const pncp = findPncpByLinha(dt, local);

              const hasLocal = !!local;
              const fileUrl = getFileUrl(local);
              const fileName = getFileName(local);

              const isPublished =
                local?.status === 'enviado'
                

              const pncpSeq =
                local?.pncp_sequencial_documento ||
                pncp?.pncp_sequencial_documento ||
                pncp?.sequencial_documento ||
                null;

              const pncpDate =
                local?.pncp_publicado_em ||
                pncp?.pncp_publicado_em ||
                pncp?.publicado_em ||
                null;

              const rowSending = sendingKey === `linha:${dt.id}`;
              const isSelected = selectedRows.has(dt.id);

              return (
                <tr
                  key={dt.id || dt.key || `${dt.tipo_documento_id}-${index}`}
                  className={`text-xs md:text-sm group transition-colors ${isSelected ? 'bg-blue-50/70 dark:bg-blue-900/20' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'}`}
                >
                  <td className="py-1 px-3 align-middle text-center">
                    <StyledCheckbox checked={isSelected} onChange={() => toggleSelectDocType(dt.id)} />
                  </td>
                  <td className="py-1 px-3 text-slate-500 dark:text-slate-400 align-middle">
                    <span className="inline-block w-6 text-center whitespace-nowrap">{index + 1}</span>
                  </td>

                  <td className="py-1 px-3 align-middle max-w-[280px]">
                    <div className="font-normal text-slate-800 dark:text-slate-100 truncate whitespace-nowrap" title={dt.nome}>
                      {dt.nome}
                    </div>
                  </td>

                  <td className="py-1 px-3 align-middle max-w-[220px]">
                    <div className="font-normal text-slate-600 dark:text-slate-300 truncate whitespace-nowrap" title={documentTypeOptions.find((d) => Number(d.id) === Number(dt.tipo_documento_id))?.nome || `Tipo ${dt.tipo_documento_id}`}>
                      {documentTypeOptions.find((d) => Number(d.id) === Number(dt.tipo_documento_id))?.nome || `Tipo ${dt.tipo_documento_id}`}
                    </div>

                    {/* Badges mobile */}
                    {isPublished ? (
                      <div className="mt-1 text-md text-emerald-600 dark:text-emerald-400 flex items-center gap-1 md:hidden">
                        <CheckCircle className="w-3 h-3" />
                        Publicado no PNCP
                      </div>
                    ) : hasLocal ? (
                      <div className="mt-1 text-md text-blue-600 dark:text-blue-300 flex items-center gap-1 md:hidden">
                        <CheckCircle className="w-3 h-3" />
                        Rascunho Local
                      </div>
                    ) : (
                      <div className="mt-1 text-md text-slate-400 dark:text-slate-500 flex items-center gap-1 md:hidden">
                        <AlertCircle className="w-3 h-3" />
                        Sem arquivo
                      </div>
                    )}
                  </td>

                  {/* Arquivo Local */}
                  <td className="py-1 px-3 align-middle max-w-[320px]">
                    {hasLocal ? (
                      <div className="inline-flex w-full items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onView(fileUrl)}
                          className="min-w-0 inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 hover:border-emerald-300 transition-colors"
                          title="Visualizar arquivo"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="truncate max-w-[180px] md:max-w-[220px] text-sm text-slate-700 dark:text-slate-200 font-medium whitespace-nowrap" title={fileName}>
                            {fileName}
                          </span>
                        </button>

                        <label className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-amber-300 text-amber-600 bg-amber-50 hover:bg-amber-100 cursor-pointer" title="Alterar arquivo local">
                          <Edit size={14} />
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.odt,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.zip"
                            className="hidden"
                            disabled={rowSending}
                            onChange={(e) => onFileUpsert(dt, e.target.files?.[0] || null)}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => onDeleteLocal(local.id)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-red-300 text-red-600 bg-red-50 hover:bg-red-100"
                          title="Excluir arquivo local"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-dark-bg-secondary cursor-pointer hover:border-accent-blue hover:bg-slate-50 transition-colors w-full md:w-auto">
                        <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-md text-slate-600 dark:text-slate-300">
                          Selecionar arquivo
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.odt,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.zip"
                          className="hidden"
                          disabled={rowSending}
                          onChange={(e) => onFileUpsert(dt, e.target.files?.[0] || null)}
                        />
                      </label>
                    )}
                  </td>

                  {/* Status PNCP */}
                  <td className="py-1 px-3 align-middle hidden md:table-cell">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-normal border whitespace-nowrap ${
                        isPublished
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700'
                      }`}
                      title={pncpDate ? `Publicado em ${new Date(pncpDate).toLocaleString('pt-BR')}` : ''}
                    >
                      {isPublished ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {isPublished ? 'Publicado' : 'Não publicado'}
                    </span>
                  </td>

                  {/* Ações */}
                  <td className="py-1 px-3 align-middle text-right relative">
                    <div className="flex flex-nowrap justify-end items-center gap-2">
                      {hasLocal && !isPublished && (
                        <button
                          type="button"
                          onClick={() => onPublishPncp(local.id, dt.id)}
                          disabled={rowSending}
                          className="whitespace-nowrap inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-normal bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          title="Publicar no PNCP"
                        >
                          {rowSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          Publicar PNCP
                        </button>
                      )}

                      {hasLocal && isPublished && (
                        <button
                          type="button"
                          onClick={() => onRemovePncp(dt.id, pncpSeq, local?.id)}
                          disabled={rowSending || !pncpSeq}
                          className="whitespace-nowrap inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-normal bg-red-50 border border-red-300 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
                          title="Remover do PNCP"
                        >
                          {rowSending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          Remover PNCP
                        </button>
                      )}
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
};

/* ────────────────────────────────────────────────────────────────────────── */
/* COMPONENTE PRINCIPAL: PageProcess                                         */
/* ────────────────────────────────────────────────────────────────────────── */

export default function PageProcess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useAxios();
  const { showToast } = useToast();

  // --- ESTADOS DE CONTROLE ---
  const isNewProcess = !id;
  const [processoId, setProcessoId] = useState(id || null);
  const [activeTab, setActiveTab] = useState('itens');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(isNewProcess);

  // --- ESTADOS DE DADOS ---
  const [formData, setFormData] = useState({
    objeto: '',
    numero_processo: '',
    data_processo: '',
    modalidade: '',
    classificacao: '',
    tipo_organizacao: '',
    registro_precos: false,
    orgao: '',
    entidade: '',
    valor_referencia: '',
    numero_certame: '',
    data_abertura: '',
    situacao: 'Em Pesquisa',
    vigencia_meses: 12,
    fundamentacao: '',
    amparo_legal: '',
    modo_disputa: '',
    criterio_julgamento: '',
  });

  const [itens, setItens] = useState([]);
  const [fornecedoresDoProcesso, setFornecedoresDoProcesso] = useState([]);
  const [entidades, setEntidades] = useState([]);
  const [orgaos, setOrgaos] = useState([]);
  const [catalogoFornecedores, setCatalogoFornecedores] = useState([]);
  const [entidadeNome, setEntidadeNome] = useState('');
  const [orgaoNome, setOrgaoNome] = useState('');
  const [lotes, setLotes] = useState([]);

  // --- ARQUIVOS: separar local x PNCP (CORREÇÃO DO FLUXO) ---
  const [localDocs, setLocalDocs] = useState([]);
  const [pncpRemoteDocs, setPncpRemoteDocs] = useState([]);
  const [documentRows, setDocumentRows] = useState([]);

  // controle spinner por tipo
  const [sendingKey, setSendingKey] = useState(null);

  // --- MODAIS ---
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pncpModalData, setPncpModalData] = useState(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [isFornecedorModalOpen, setIsFornecedorModalOpen] = useState(false);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);

  // Confirmação de Exclusão
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);

  // --- TABELA / PAGINAÇÃO ---
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [currentPageForn, setCurrentPageForn] = useState(1);
  const [itemsPerPageForn, setItemsPerPageForn] = useState(10);

  // --- COMPUTADOS ---
  const isLote = useMemo(
    () => String(formData?.tipo_organizacao || '').toLowerCase() === 'lote',
    [formData?.tipo_organizacao]
  );

  const nextOrdem = useMemo(() => {
    if (!itens || itens.length === 0) return 1;
    const ordens = itens.map((i) => i.ordem || 0);
    return Math.max(...ordens) + 1;
  }, [itens]);

  // Paginação Itens
  const totalPages = Math.ceil(itens.length / itemsPerPage) || 1;
  const currentItems = useMemo(
    () => itens.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [itens, currentPage, itemsPerPage]
  );

  const areAllCurrentItemsSelected = useMemo(
    () => currentItems.length > 0 && currentItems.every((item) => selectedItems.has(item.id)),
    [currentItems, selectedItems]
  );

  // Paginação Fornecedores
  const totalPagesForn = Math.ceil(fornecedoresDoProcesso.length / itemsPerPageForn) || 1;
  const currentFornecedores = useMemo(
    () =>
      fornecedoresDoProcesso.slice(
        (currentPageForn - 1) * itemsPerPageForn,
        currentPageForn * itemsPerPageForn
      ),
    [fornecedoresDoProcesso, currentPageForn, itemsPerPageForn]
  );

  /* ──────────────────────────────────────────────────────────────────────── */
  /* DATA FETCHING                                                           */
  /* ──────────────────────────────────────────────────────────────────────── */

  const fetchDadosDoProcesso = useCallback(
    async (pid) => {
      if (!pid) return;
      setIsLoading(true);
      try {
        const { data } = await api.get(`/processos/${pid}/`);
        setFormData({
          ...data,
          data_abertura: data.data_abertura,
          data_processo: data.data_processo || '',
        });
        setProcessoId(data.id);
        setEntidadeNome(data.entidade_nome || '');
        setOrgaoNome(data.orgao_nome || '');
      } catch {
        showToast('Erro ao carregar dados do processo.', 'error');
        navigate('/processos');
      } finally {
        setIsLoading(false);
      }
    },
    [api, showToast, navigate]
  );

  const fetchItens = useCallback(
    async (pid) => {
      if (!pid) return;
      try {
        const { data } = await api.get(`/processos/${pid}/itens/`);
        setItens(data || []);
      } catch {
        showToast('Erro ao carregar itens.', 'error');
      }
    },
    [api, showToast]
  );

  const fetchFornecedoresDoProcesso = useCallback(
    async (pid) => {
      if (!pid) return;
      try {
        const { data } = await api.get(`/processos/${pid}/fornecedores/`);
        setFornecedoresDoProcesso(data || []);
      } catch {
        showToast('Erro ao carregar fornecedores.', 'error');
      }
    },
    [api, showToast]
  );

  const fetchLotes = useCallback(
    async (pid) => {
      if (!pid) return;
      try {
        const { data } = await api.get(`/processos/${pid}/lotes/`);
        setLotes(data || []);
      } catch {
        setLotes([]);
      }
    },
    [api]
  );

  // PNCP (consulta)
  const fetchPncpDocs = useCallback(
    async (pid) => {
      if (!pid) return;
      try {
        const { data } = await api.get(`/processos/${pid}/pncp/arquivos/`);
        const docs = extractResults(data.documentos || data);
        setPncpRemoteDocs(docs);
      } catch (error) {
        console.error(error);
        // não derruba a tela por isso; somente mantém vazio
        setPncpRemoteDocs([]);
      }
    },
    [api]
  );

  // Local (banco)
  const fetchLocalDocs = useCallback(
    async (pid) => {
      if (!pid) return;
      try {
        const { data } = await api.get(`/documentos-pncp/`, { params: { processo: pid } });
        const docs = extractResults(data);
        setLocalDocs(docs);
      } catch (error) {
        console.error(error);
        showToast('Erro ao carregar documentos locais.', 'error');
        setLocalDocs([]);
      }
    },
    [api, showToast]
  );

  const fetchDocumentRows = useCallback(
    async (pid) => {
      if (!pid) return;
      try {
        const { data } = await api.get('/processo-documento-linhas/', {
          params: { processo: pid },
        });
        const rows = extractResults(data);

        if (rows.length > 0) {
          setDocumentRows(rows.sort((a, b) => (a.ordem || 0) - (b.ordem || 0)));
          return;
        }

        const defaults = DEFAULT_DOCUMENT_TEMPLATES;
        await Promise.all(
          defaults.map((row, index) =>
            api.post('/processo-documento-linhas/', {
              processo: pid,
              nome: row.nome,
              tipo_documento_id: row.tipo_documento_id,
              ordem: index + 1,
              custom: false,
            })
          )
        );

        const reload = await api.get('/processo-documento-linhas/', {
          params: { processo: pid },
        });
        const seeded = extractResults(reload.data);
        setDocumentRows(seeded.sort((a, b) => (a.ordem || 0) - (b.ordem || 0)));
      } catch (error) {
        console.error(error);
  showToast('Erro ao carregar documentos.', 'error');
        setDocumentRows([]);
      }
    },
    [api, showToast]
  );

  const loadOrgaosForEntidade = useCallback(
    async (entidadeId) => {
      if (!entidadeId) {
        setOrgaos([]);
        setFormData((prev) => ({ ...prev, orgao: '' }));
        return;
      }
      try {
        const res = await api.get('/orgaos/', { params: { entidade: entidadeId } });
        setOrgaos(extractResults(res.data));
      } catch {
        showToast('Erro ao carregar órgãos.', 'error');
      }
    },
    [api, showToast]
  );

  // Initial Load
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [entRes, fornRes] = await Promise.all([api.get('/entidades/'), api.get('/fornecedores/')]);
        setEntidades(entRes.data || []);
        setCatalogoFornecedores(fornRes.data || []);
      } catch {
        showToast('Erro ao carregar dados auxiliares.', 'error');
      }
    };

    loadInitial();

    if (id) {
      fetchDadosDoProcesso(id);
      fetchItens(id);
      fetchFornecedoresDoProcesso(id);
      fetchLotes(id);

      // IMPORTANTÍSSIMO: carregar local e PNCP em estados separados
      fetchLocalDocs(id);
      fetchPncpDocs(id);
      fetchDocumentRows(id);
    }
  }, [
    id,
    api,
    showToast,
    fetchDadosDoProcesso,
    fetchItens,
    fetchFornecedoresDoProcesso,
    fetchLotes,
    fetchLocalDocs,
    fetchPncpDocs,
    fetchDocumentRows,
  ]);

  // Carrega Órgãos ao mudar Entidade (no load inicial)
  useEffect(() => {
    if (formData.entidade) {
      api
        .get(`/orgaos/?entidade=${formData.entidade}`)
        .then((res) => setOrgaos(res.data || []))
        .catch(() => setOrgaos([]));
    }
  }, [formData.entidade, api]);

  // Carrega Lotes se tipo mudar
  useEffect(() => {
    if (processoId && isLote) fetchLotes(processoId);
  }, [isLote, processoId, fetchLotes]);

  /* ──────────────────────────────────────────────────────────────────────── */
  /* HANDLERS GERAIS                                                         */
  /* ──────────────────────────────────────────────────────────────────────── */

  const handleChangeDadosGerais = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'entidade') {
      setFormData((prev) => ({ ...prev, entidade: value, orgao: '' }));
      loadOrgaosForEntidade(value);
    }
  };

  const handleSaveDadosGerais = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = isNewProcess
        ? await api.post('/processos/', formData)
        : await api.put(`/processos/${processoId}/`, formData);

      showToast(isNewProcess ? 'Processo criado com sucesso!' : 'Processo atualizado!', 'success');
      const updated = res.data;

      if (isNewProcess) {
        navigate(`/processos/editar/${updated.id}`, { replace: true });
        setProcessoId(updated.id);
      } else {
        await fetchDadosDoProcesso(updated.id);
      }
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      showToast('Erro ao salvar o processo.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Itens
  const handleSelectAll = () => {
    const pageIds = currentItems.map((i) => i.id);
    const next = new Set(selectedItems);
    const allSelected = pageIds.every((id) => next.has(id));
    if (allSelected) {
      pageIds.forEach((id) => next.delete(id));
    } else {
      pageIds.forEach((id) => next.add(id));
    }
    setSelectedItems(next);
  };

  const handleSelectItem = (itemId) => {
    const next = new Set(selectedItems);
    next.has(itemId) ? next.delete(itemId) : next.add(itemId);
    setSelectedItems(next);
  };

  const handleExportItems = () => {
    if (selectedItems.size === 0) {
      return showToast('Selecione itens para exportar.', 'info');
    }
    showToast(`${selectedItems.size} itens exportados (simulação).`, 'success');
  };

  // Fornecedores
  const handleLinkFornecedor = async (fornecedorId) => {
    setIsFornecedorModalOpen(false);
    try {
      await api.post(`/processos/${processoId}/adicionar_fornecedor/`, { fornecedor_id: fornecedorId });
      showToast('Fornecedor vinculado com sucesso!', 'success');
      fetchFornecedoresDoProcesso(processoId);
    } catch {
      showToast('Erro ao vincular fornecedor.', 'error');
    }
  };

  const handleSaveNewAndLinkFornecedor = async (newFornecedor) => {
    try {
      const { data } = await api.post('/fornecedores/', newFornecedor);
      setCatalogoFornecedores((prev) => [data, ...prev]);
      await handleLinkFornecedor(data.id);
    } catch {
      showToast('Erro ao cadastrar fornecedor.', 'error');
    }
  };

  const handleUpdateEditedFornecedor = async (fornecedorAtualizado) => {
    try {
      const { data } = await api.put(`/fornecedores/${fornecedorAtualizado.id}/`, fornecedorAtualizado);
      setFornecedoresDoProcesso((prev) => prev.map((f) => (f.id === data.id ? data : f)));
      setCatalogoFornecedores((prev) => prev.map((f) => (f.id === data.id ? data : f)));
      showToast('Fornecedor atualizado.', 'success');
      setIsFornecedorModalOpen(false);
    } catch {
      showToast('Erro ao atualizar fornecedor.', 'error');
    }
  };

  // Exclusão
  const handleAskDelete = (type, item) => {
    setDeleteType(type);
    setItemToDelete(item);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteType === 'fornecedor') {
        await api.post(`/processos/${processoId}/remover_fornecedor/`, { fornecedor_id: itemToDelete.id });
        showToast('Fornecedor removido.', 'success');
        fetchFornecedoresDoProcesso(processoId);
      } else if (deleteType === 'item') {
        await api.delete(`/itens/${itemToDelete.id}/`);
        showToast('Item removido.', 'success');
        fetchItens(processoId);
      }
    } catch {
      showToast('Erro ao remover.', 'error');
    } finally {
      setShowConfirmModal(false);
      setItemToDelete(null);
      setDeleteType(null);
    }
  };

  // Exclusão em massa — Itens
  const handleBulkDeleteItems = async (ids) => {
    if (!ids?.length) return;
    try {
      await api.post('/itens/bulk-delete/', { ids });
      showToast(`${ids.length} item(ns) removido(s).`, 'success');
      setSelectedItems(new Set());
      fetchItens(processoId);
    } catch {
      showToast('Erro ao remover itens em massa.', 'error');
    }
  };

  // Exclusão em massa — Fornecedores do processo
  const handleBulkDeleteFornecedores = async (ids) => {
    if (!ids?.length) return;
    try {
      await api.post('/fornecedores-processo/bulk-delete/', { ids, processo_id: processoId });
      showToast(`${ids.length} fornecedor(es) removido(s).`, 'success');
      fetchFornecedoresDoProcesso(processoId);
    } catch {
      showToast('Erro ao remover fornecedores em massa.', 'error');
    }
  };

  /* ──────────────────────────────────────────────────────────────────────── */
  /* HANDLERS ESPECÍFICOS: ARQUIVOS (corrigidos)                              */
  /* - Upsert: se existe doc local -> PATCH /{id}/                            */
  /* - Se não existe -> POST                                                  */
  /* - Publicar: POST /{id}/enviar-ao-pncp/                                   */
  /* - Remover PNCP: DELETE /processos/{pid}/pncp/arquivos/{seq}/             */
  /* - Remover Local: DELETE /documentos-pncp/{id}/                           */
  /* ──────────────────────────────────────────────────────────────────────── */

  const findLocalByRow = useCallback(
    (row) => {
      const byLinha = (localDocs || []).find(
        (d) => Number(d.linha_documento) === Number(row.id)
      );
      if (byLinha) return byLinha;
      return (localDocs || []).find(
        (d) =>
          Number(d.tipo_documento_id) === Number(row.tipo_documento_id) &&
          String(d.titulo || '').trim().toLowerCase() === String(row.nome || '').trim().toLowerCase()
      );
    },
    [localDocs]
  );

  const handleUpsertDocFile = async (row, file) => {
    if (!file || !processoId || !row?.id) return;

    setSendingKey(`linha:${row.id}`);
    try {
      const fd = new FormData();
      fd.append("arquivo", file);
      fd.append("linha_documento", row.id);
      fd.append("tipo_documento_id", row.tipo_documento_id);
      fd.append("titulo", row.nome);
      fd.append("processo", processoId);

      const existing = findLocalByRow(row);

      if (existing?.id) {
        await api.patch(`/documentos-pncp/${existing.id}/`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post(`/documentos-pncp/`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      showToast("Arquivo salvo com sucesso!", "success");
      await fetchLocalDocs(processoId);
    } catch (error) {
      console.error(error);
      showToast("Erro ao salvar arquivo no banco de dados.", "error");
    } finally {
      setSendingKey(null);
    }
  };

  const handlePublishDocPncp = async (idLocalNoBanco, rowId) => {
    setSendingKey(`linha:${rowId}`);
    try {
      await api.post(`/documentos-pncp/${idLocalNoBanco}/enviar-ao-pncp/`);
      showToast("Documento publicado no PNCP com sucesso!", "success");

      // após publicar, atualiza as duas fontes
      await Promise.all([fetchLocalDocs(processoId), fetchPncpDocs(processoId)]);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.detail || "Erro ao publicar no PNCP.";
      showToast(msg, "error");
    } finally {
      setSendingKey(null);
    }
  };

  const handleDeleteDocPncp = async (rowId, sequencialDocumento, localDocId = null) => {
    if (!processoId) return;

    if (!sequencialDocumento) {
      showToast("Identificador do documento no PNCP não encontrado.", "error");
      return;
    }

    try {
      setSendingKey(`linha:${rowId}`);

      // 1) Exclui do PNCP
      await api.delete(`/processos/${processoId}/pncp/arquivos/${sequencialDocumento}/`, {
        data: { justificativa: "Exclusão solicitada pelo sistema de origem." },
      });

      // 2) Atualiza o registro LOCAL para voltar a ser rascunho
      //    (a UI vai voltar a mostrar o botão "Publicar PNCP")
      const localDoc = localDocId
        ? (localDocs || []).find((d) => Number(d.id) === Number(localDocId))
        : null;

      if (localDoc?.id) {
        const fd = new FormData();
        fd.append("status", "rascunho");
        fd.append("pncp_sequencial_documento", "");
        fd.append("pncp_publicado_em", "");

        await api.patch(`/documentos-pncp/${localDoc.id}/`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      showToast("Documento excluído do PNCP com sucesso.", "success");

      // 3) Recarrega os dados locais (fonte da sua tabela)
      await fetchLocalDocs(processoId);
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Erro ao excluir documento no PNCP.";
      showToast(msg, "error");
    } finally {
      setSendingKey(null);
    }
  };

  const handleDeleteLocalDoc = async (docId) => {
    try {
      await api.delete(`/documentos-pncp/${docId}/`);
      showToast("Arquivo local removido.", "success");
      await fetchLocalDocs(processoId);
    } catch (error) {
      console.error(error);
      showToast("Erro ao remover rascunho local.", "error");
    }
  };

  const handleAddDocument = async ({ nome, tipo_documento_id, arquivo }) => {
    const tipo = Number(tipo_documento_id);
    if (!tipo || !nome || !arquivo || !processoId) return;

    try {
      const { data: created } = await api.post('/processo-documento-linhas/', {
        processo: processoId,
        nome,
        tipo_documento_id: tipo,
        ordem: (documentRows?.length || 0) + 1,
        custom: true,
      });

      await handleUpsertDocFile(created, arquivo);
      await fetchDocumentRows(processoId);
      showToast('Documento adicionado com sucesso.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Erro ao adicionar documento.', 'error');
    }
  };

  const handleBulkDeleteDocuments = async (documentIds) => {
    if (!Array.isArray(documentIds) || !documentIds.length) return;

    try {
      for (const docId of documentIds) {
        const docRef = (documentRows || []).find((d) => Number(d.id) === Number(docId));
        if (!docRef) continue;

        const localDoc = findLocalByRow(docRef);
        if (localDoc?.id) {
          await api.delete(`/documentos-pncp/${localDoc.id}/`);
        }

        await api.delete(`/processo-documento-linhas/${docRef.id}/`);
      }

      await Promise.all([fetchLocalDocs(processoId), fetchDocumentRows(processoId)]);
      showToast('Documento(s) excluído(s) com sucesso.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Erro ao excluir documento(s).', 'error');
    }
  };

  const handleViewFile = (url) => {
    if (!url) return showToast("Arquivo não disponível para visualização.", "warning");
    window.open(url, "_blank", "noopener,noreferrer");
  };

  /* ──────────────────────────────────────────────────────────────────────── */
  /* RENDER                                                                  */
  /* ──────────────────────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen pb-20 flex justify-center items-start">
      <AnimatePresence>
        {isItemModalOpen && (
          <ItemModal
            isOpen={isItemModalOpen}
            onClose={() => {
              setIsItemModalOpen(false);
              setItemSelecionado(null);
            }}
            processo={{ id: processoId, numero_processo: formData.numero_processo }}
            itemParaEditar={itemSelecionado}
            proximaOrdem={nextOrdem}
            onItemSaved={() => {
              fetchItens(processoId);
              fetchDadosDoProcesso(processoId);
            }}
          />
        )}

        {isImportModalOpen && (
          <ImportacaoProcessoModal
            open={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onImported={(newProcess) => {
              showToast('Importação concluída!', 'success');
              if (newProcess?.id && newProcess.id !== processoId) {
                navigate(`/processos/editar/${newProcess.id}`);
              } else if (processoId) {
                fetchItens(processoId);
                fetchDadosDoProcesso(processoId);
              }
            }}
            templateUrl="/Modelo_Simples_Importacao.xlsx"
          />
        )}

        {pncpModalData && (
          <ModalEnvioPNCP
            processo={pncpModalData}
            onClose={() => setPncpModalData(null)}
            onSuccess={() => fetchDadosDoProcesso(processoId)}
          />
        )}

        {isFornecedorModalOpen && (
          <FornecedorModal
            isOpen={isFornecedorModalOpen}
            onClose={() => {
              setIsFornecedorModalOpen(false);
              setFornecedorSelecionado(null);
            }}
            catalogo={catalogoFornecedores}
            onLink={handleLinkFornecedor}
            onSaveNew={handleSaveNewAndLinkFornecedor}
            onSaveEdit={handleUpdateEditedFornecedor}
            fornecedorSelecionado={fornecedorSelecionado}
          />
        )}

        {showConfirmModal && (
          <ConfirmDeleteModal
            message={
              deleteType === 'fornecedor'
                ? `Desvincular o fornecedor "${itemToDelete?.razao_social}"?`
                : `Excluir o item "${itemToDelete?.descricao}"?`
            }
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowConfirmModal(false)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl w-full px-2 sm:px-3 md:px-4 lg:px-0 py-4 space-y-4 sm:space-y-6">
        {!isEditing && (
          <ProcessHeader
            formData={formData}
            processoId={processoId}
            entidadeNome={entidadeNome}
            orgaoNome={orgaoNome}
            onEdit={() => setIsEditing(true)}
            onExportCSV={() => showToast('Exportando dados...', 'info')}
            onSuccess={() => {
              fetchDadosDoProcesso(processoId);
              fetchLocalDocs(processoId);
              fetchPncpDocs(processoId);
            }}
          />
        )}

        {isEditing && (
          <div className="bg-white dark:bg-dark-bg-secondary rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <LayoutDashboard className="text-accent-blue" />
                {isNewProcess ? 'Novo Processo' : 'Editar Dados Gerais'}
              </h2>
            </div>

            <DadosGeraisForm
              formData={formData}
              onChange={handleChangeDadosGerais}
              onSubmit={handleSaveDadosGerais}
              onCancel={() => (isNewProcess ? navigate(-1) : setIsEditing(false))}
              isLoading={isLoading}
              isNew={isNewProcess}
              entidades={entidades}
              orgaos={orgaos}
            />
          </div>
        )}

        {processoId && !isEditing && (
          <div className="bg-white dark:bg-dark-bg-secondary rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[480px]">
            <div className="ui-tab-list overflow-x-auto scrollbar-none -webkit-overflow-scrolling-touch" role="tablist" aria-label="Abas do processo">
              <TabButton
                id="itens"
                label="Itens do Processo"
                icon={Package}
                isActive={activeTab === 'itens'}
                onClick={() => setActiveTab('itens')}
              />
              {isLote && (
                <TabButton
                  id="lotes"
                  label="Gerenciar Lotes"
                  icon={Layers}
                  isActive={activeTab === 'lotes'}
                  onClick={() => setActiveTab('lotes')}
                />
              )}
              <TabButton
                id="fornecedores"
                label="Fornecedores"
                icon={Users}
                isActive={activeTab === 'fornecedores'}
                onClick={() => setActiveTab('fornecedores')}
              />
              <TabButton
                id="contratos"
                label="Contratos"
                icon={FileText}
                isActive={activeTab === 'contratos'}
                onClick={() => setActiveTab('contratos')}
              />
              {formData.registro_precos && (
                <TabButton
                  id="atas"
                  label="Atas de Registro de Preços"
                  icon={FileText}
                  isActive={activeTab === 'atas'}
                  onClick={() => setActiveTab('atas')}
                />
              )}
              <TabButton
                id="arquivos"
                label="Arquivos"
                icon={FileText}
                isActive={activeTab === 'arquivos'}
                onClick={() => setActiveTab('arquivos')}
              />
              <TabButton
                id="anotacoes"
                label="Anotações"
                icon={StickyNote}
                isActive={activeTab === 'anotacoes'}
                onClick={() => setActiveTab('anotacoes')}
              />

            </div>

            <div className="p-3 sm:p-4 md:p-6 bg-slate-50/50 dark:bg-slate-900/20 min-h-[380px]">
              <div>
                  {activeTab === 'itens' && (
                    <ItemsSection
                      itens={itens}
                      currentItems={currentItems}
                      totalPages={totalPages}
                      currentPage={currentPage}
                      itemsPerPage={itemsPerPage}
                      setItemsPerPage={setItemsPerPage}
                      setCurrentPage={setCurrentPage}
                      areAllCurrentItemsSelected={areAllCurrentItemsSelected}
                      selectedItems={selectedItems}
                      handleSelectItem={handleSelectItem}
                      handleSelectAll={handleSelectAll}
                      setIsItemModalOpen={setIsItemModalOpen}
                      setItemSelecionado={setItemSelecionado}
                      handleAskDelete={handleAskDelete}
                      handleExportItems={handleExportItems}
                      onBulkDelete={handleBulkDeleteItems}
                    />
                  )}

                  {activeTab === 'lotes' && isLote && (
                    <LotesSection
                      processoId={processoId}
                      lotes={lotes}
                      itens={itens}
                      reloadLotes={() => fetchLotes(processoId)}
                      reloadItens={() => fetchItens(processoId)}
                      showToast={showToast}
                    />
                  )}

                  {activeTab === 'fornecedores' && (
                    <FornecedoresSection
                      fornecedoresDoProcesso={fornecedoresDoProcesso}
                      currentFornecedores={currentFornecedores}
                      totalPagesForn={totalPagesForn}
                      currentPageForn={currentPageForn}
                      itemsPerPageForn={itemsPerPageForn}
                      setItemsPerPageForn={setItemsPerPageForn}
                      setCurrentPageForn={setCurrentPageForn}
                      setFornecedorSelecionado={(f) => {
                        setFornecedorSelecionado(f);
                        setIsFornecedorModalOpen(true);
                      }}
                      setIsFornecedorModalOpen={setIsFornecedorModalOpen}
                      handleAskDelete={handleAskDelete}
                      onEdit={(f) => {
                        setFornecedorSelecionado(f);
                        setIsFornecedorModalOpen(true);
                      }}
                      onBulkDelete={handleBulkDeleteFornecedores}
                    />
                  )}

                  {activeTab === 'arquivos' && (
                    <ArquivosSection
                      documentRows={documentRows}
                      documentTypeOptions={DOCUMENT_TYPES}
                      localDocs={localDocs}
                      pncpRemoteDocs={pncpRemoteDocs}
                      onAddDocument={handleAddDocument}
                      onFileUpsert={handleUpsertDocFile}
                      onPublishPncp={handlePublishDocPncp}
                      onRemovePncp={handleDeleteDocPncp}
                      onDeleteLocal={handleDeleteLocalDoc}
                      onBulkDeleteDocuments={handleBulkDeleteDocuments}
                      onView={handleViewFile}
                      sendingKey={sendingKey}
                    />
                  )}

                  {activeTab === 'contratos' && (
                    <ContratosSection
                      processoId={processoId}
                      api={api}
                      showToast={showToast}
                    />
                  )}

                  {activeTab === 'atas' && formData.registro_precos && (
                    <AtasSection
                      processoId={processoId}
                      api={api}
                      showToast={showToast}
                      processoResumo={{
                        local: 'Itarema/CE',
                        orgao: entidadeNome || orgaoNome,
                        modalidade: formData.modalidade_nome, 
                        dataDivulgacao: formData.pncp_publicado_em
                          ? new Date(formData.pncp_publicado_em).toLocaleDateString('pt-BR')
                          : null,
                        objeto: formData.objeto,
                      }}
                    />
                  )}

                  {activeTab === 'anotacoes' && (
                    <SharedNotesBoard
                      title="Anotações do Processo"
                      processoId={processoId}
                      columnLayout
                    />
                  )}

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
