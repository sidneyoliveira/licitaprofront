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
  Trash2
} from 'lucide-react';

// --- COMPONENTES & SEÇÕES ---
import ProcessHeader from '../components/ProcessHeader';
import DadosGeraisForm from '../components/DadosGeraisForm';
import ItemsSection from '../components/ItemsSection';
import LotesSection from '../components/LotesSection';
import FornecedoresSection from '../components/FornecedoresSection';

// --- MODAIS ---
import ItemModal from '../components/ItemModal';
import FornecedorModal from '../components/FornecedorModal';
import ImportacaoProcessoModal from '../components/ImportacaoProcessoModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

// --- INFRA ---
import useAxios from '../hooks/useAxios';
import { useToast } from '../context/ToastContext';

/* ────────────────────────────────────────────────────────────────────────── */
/* TIPOS DE DOCUMENTO (PNCP 5.12)                                            */
/* ────────────────────────────────────────────────────────────────────────── */

const DOCUMENT_TYPES = [
  { id: 1, nome: 'Aviso de Contratação Direta' },
  { id: 2, nome: 'Edital' },
  { id: 3, nome: 'Minuta do Contrato' },
  { id: 4, nome: 'Termo de Referência' },
  { id: 5, nome: 'Anteprojeto' },
  { id: 6, nome: 'Projeto Básico' },
  { id: 7, nome: 'Estudo Técnico Preliminar' },
  // { id: 8, nome: 'Projeto Executivo' },
  { id: 9, nome: 'Mapa de Riscos' },
  { id: 10, nome: 'DFD' },
  { id: 19, nome: 'Minuta de Ata de Registro de Preços' },
  { id: 20, nome: 'Ato que autoriza a Contratação Direta' },
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-dark-bg-secondary rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
            <Globe className="w-5 h-5 text-[#004aad]" />
            Publicar no PNCP
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleUpload} className="p-5 space-y-5">
          <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-800 dark:text-blue-200 px-3 py-3">
            Você está publicando o processo{' '}
            <span className="font-semibold">{processo.numero_processo}</span> no ambiente de produção do PNCP.
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
              Anexar Edital/Aviso (PDF)
            </label>
            <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer group hover:border-[#004aad] hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
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
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-[#004aad]'
                }`}
              >
                <FileText className="w-7 h-7" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {file ? file.name : 'Clique para selecionar o arquivo PDF do edital/aviso'}
              </span>
              {!file && (
                <span className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  Tamanho máximo e demais regras conforme o PNCP.
                </span>
              )}
            </div>
          </div>

          {/* Footer */}
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
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-[#004aad] text-white hover:bg-[#003d91] shadow-sm shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
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

const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      relative flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-bold transition-colors whitespace-nowrap
      ${
        isActive
          ? 'text-[#004aad] bg-white dark:bg-dark-bg-secondary'
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60'
      }
    `}
  >
    <Icon size={18} className={isActive ? 'text-[#004aad]' : 'text-slate-400'} />
    {label}
    {isActive && (
      <motion.div
        layoutId="activeTab-underline"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#004aad]"
      />
    )}
  </button>
);
/* ────────────────────────────────────────────────────────────────────────── */
/* SUBCOMPONENTE: Aba de Arquivos / PNCP                                    */
/* ────────────────────────────────────────────────────────────────────────── */

const ArquivosSection = ({
  documentTypes,
  uploads,
  pncpDocs,
  onFileChange,
  onPublish,
  onDelete, 
  sendingDocId,
}) => {
  const getDocInfo = (tipoId) =>
    (pncpDocs || []).find(
      (d) =>
        Number(d.tipoDocumentoId ?? d.tipo_documento_id) === Number(tipoId)
    );

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#004aad]" />
            Documentos da Contratação
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Anexe os arquivos do processo e publique no PNCP.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] md:text-xs uppercase text-slate-500 dark:text-slate-400">
              <th className="p-2 md:p-3 w-14">Ordem</th>
              <th className="p-2 md:p-3">Tipo de Documento</th>
              <th className="p-2 md:p-3">Arquivo</th>
              <th className="p-2 md:p-3 hidden md:table-cell">Situação</th>
              <th className="p-2 md:p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {documentTypes.map((dt) => {
              const row = uploads[dt.id] || {};
              const info = getDocInfo(dt.id);
              const publicado = !!info;
              
              return (
                <tr key={dt.id} className="text-xs md:text-sm">
                  <td className="p-2 md:p-3 text-slate-500 dark:text-slate-400 align-middle">
                    {dt.id}
                  </td>
                  <td className="p-2 md:p-3 align-middle">
                    <div className="font-medium text-slate-800 dark:text-slate-100">
                      {dt.nome}
                    </div>
                    {publicado && (
                      <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 md:hidden">
                        <CheckCircle className="w-3 h-3" />
                        Publicado
                      </div>
                    )}
                  </td>
                  <td className="p-2 md:p-3 align-middle">
                    {/* Se já publicado, mostra apenas o nome do arquivo remoto (ou fixo) para não confundir, ou permite re-upload se a lógica de negócio permitir sobrescrever */}
                    <div className="space-y-1">
                      <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed ${publicado ? 'border-emerald-200 bg-emerald-50 cursor-default' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40 cursor-pointer hover:border-[#004aad] hover:bg-slate-100'} transition-colors w-full md:w-auto`}>
                        <UploadCloud className={`w-3.5 h-3.5 ${publicado ? 'text-emerald-500' : 'text-slate-500'}`} />
                        <span className="truncate max-w-[150px] md:max-w-[200px] text-[11px] text-slate-600 dark:text-slate-300">
                            {publicado 
                              ? "Arquivo já enviado" 
                              : (row.file ? row.file.name : "Selecionar arquivo")
                            }
                        </span>
                        {!publicado && (
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.odt,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.zip"
                            className="hidden"
                            onChange={(e) =>
                              onFileChange(dt.id, e.target.files?.[0] || null)
                            }
                          />
                        )}
                      </label>
                    </div>
                  </td>
                  <td className="p-2 md:p-3 align-middle hidden md:table-cell">
                    {publicado ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
                        <CheckCircle className="w-3 h-3" />
                        Publicado{' '}
                        {info.dataPublicacaoPncp
                          ? `em ${new Date(info.dataPublicacaoPncp).toLocaleDateString('pt-BR')}`
                          : ''}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                        Não publicado
                      </span>
                      
                    )}
                  </td>
                  <td className="p-2 md:p-3 align-middle text-right">
                    {publicado ? (
                      <button
                        type="button"
                        onClick={() => onDelete(dt.id, info.sequencialDocumento)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all active:scale-95 shadow-sm"
                        title="Remover do PNCP"
                      >
                         {sendingDocId === dt.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Excluir
                      </button>
                    ) : (
                      // BOTÃO PUBLICAR
                      <button
                        type="button"
                        onClick={() => onPublish(dt.id)}
                        disabled={sendingDocId === dt.id || !row.file}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-[#004aad] text-white hover:bg-[#003d91] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-blue-900/20 transition-all active:scale-95"
                      >
                        {sendingDocId === dt.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        Publicar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
        * O envio é realizado integrando diretamente com a API do PNCP.
      </p>
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

  // --- PNCP / ARQUIVOS ---
  const [pncpDocs, setPncpDocs] = useState([]);
  const [docUploads, setDocUploads] = useState({});
  const [sendingDocId, setSendingDocId] = useState(null);

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

  // Consulta wrapper para 6.3.5 + 6.3.8 (Contratação + Documentos)
  const fetchPncpDocs = useCallback(
    async (pid) => {
      if (!pid) return;
      try {
        const { data } = await api.get(`/processos/${pid}/pncp/arquivos/`);
        // Espera-se que o backend retorne algo como { documentos: [...] } ou diretamente a lista:
        const docs = Array.isArray(data) ? data : data?.documentos || [];
        setPncpDocs(docs);
      } catch (error) {
        console.error(error);
        showToast('Erro ao carregar documentos do PNCP.', 'error');
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
        setOrgaos(Array.isArray(res.data) ? res.data : []);
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
      fetchPncpDocs(id); // carrega documentos PNCP
    }
  }, [
    id,
    api,
    showToast,
    fetchDadosDoProcesso,
    fetchItens,
    fetchFornecedoresDoProcesso,
    fetchLotes,
    fetchPncpDocs,
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

 /* ──────────────────────────────────────────────────────────────────────── */
/* HANDLERS ESPECÍFICOS: ARQUIVOS / PNCP                                   */
/* ──────────────────────────────────────────────────────────────────────── */

const handleChangeDocFile = (tipoId, file) => {
  setDocUploads((prev) => ({
    ...prev,
    [tipoId]: {
      ...(prev[tipoId] || {}),
      file,
    },
  }));
};

// Wrapper para 6.3.6 (Inserir Documento a uma Contratação) via backend
const handlePublishDocPncp = async (tipoId) => {
  if (!processoId) return;

  const row = docUploads[tipoId];
  if (!row?.file) {
    showToast("Selecione o arquivo antes de publicar no PNCP.", "warning");
    return;
  }

  setSendingDocId(tipoId);
  try {
    // Busca o nome do tipo para gerar o título automático
    const docTypeObj = DOCUMENT_TYPES.find((d) => d.id === tipoId);
    const nomeTipo = docTypeObj ? docTypeObj.nome : `Documento ${tipoId}`;
    const tituloAutomatico = `${nomeTipo}`;

    const fd = new FormData();
    fd.append("arquivo", row.file); // campo binário
    fd.append("tipo_documento_id", tipoId); // Tipo-Documento-Id
    fd.append("titulo_documento", tituloAutomatico); // Título gerado automaticamente

    // Endpoint do backend:
    // POST /processos/:id/pncp/arquivos/
    await api.post(`/processos/${processoId}/pncp/arquivos/`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    showToast("Documento enviado ao PNCP com sucesso!", "success");

    // Limpa seleção local desse tipo
    setDocUploads((prev) => ({
      ...prev,
      [tipoId]: { ...prev[tipoId], file: null },
    }));

    // Recarrega lista de documentos do PNCP (6.3.8)
    await fetchPncpDocs(processoId);
  } catch (error) {
    console.error(error);
    const msg =
      error.response?.data?.detail || "Erro ao enviar documento ao PNCP.";
    showToast(msg, "error");
  } finally {
    setSendingDocId(null);
  }
};

const handleDeleteDocPncp = async (localDocId, sequencialDocumento) => {
  if (!processoId) return;

  if (!sequencialDocumento) {
    showToast("Identificador do documento no PNCP não encontrado.", "error");
    return;
  }

  try {
    // usa o primeiro parâmetro só para controlar o spinner
    setSendingDocId(localDocId);

    await api.delete(
      `/processos/${processoId}/pncp/arquivos/${sequencialDocumento}/`,
      {
        data: {
          justificativa: "Exclusão solicitada pelo sistema de origem.",
        },
      }
    );

    showToast("Documento excluído do PNCP com sucesso.", "success");

    // Recarrega lista de documentos do PNCP
    await fetchPncpDocs(processoId);
  } catch (error) {
    const msg =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      "Erro ao excluir documento no PNCP.";
    showToast(msg, "error");
  } finally {
    setSendingDocId(null);
  }
};


  /* ──────────────────────────────────────────────────────────────────────── */
  /* RENDER                                                                  */
  /* ──────────────────────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen pb-20 flex justify-center items-start">
      {/* MODAIS GLOBAIS */}
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

      {/* CONTEÚDO CENTRALIZADO */}
      <div className="max-w-7xl w-full px-2 md:px-4 lg:px-0 py-4 space-y-6">
        {/* Cabeçalho/resumo do processo */}
        {!isEditing && (
          <ProcessHeader
            formData={formData}
            entidadeNome={entidadeNome}
            orgaoNome={orgaoNome}
            onEdit={() => setIsEditing(true)}
            onExportCSV={() => showToast('Exportando dados...', 'info')}
          />
        )}

        {/* Bloco de edição (Dados Gerais) */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-bg-secondary rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
          >
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <LayoutDashboard className="text-[#004aad]" />
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
          </motion.div>
        )}

        {/* Abas (Itens / Lotes / Fornecedores / Arquivos) – somente após salvar */}
        {processoId && !isEditing && (
          <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[480px]">
            
            {/* Navegação de Abas - PADRONIZADA */}
            <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-bg-secondary overflow-x-auto gap-1">
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
                id="arquivos"
                label="Arquivos"
                icon={FileText}
                isActive={activeTab === 'arquivos'}
                onClick={() => setActiveTab('arquivos')}
              />
            </div>

            {/* Conteúdo das Abas */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/20 min-h-[380px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.18 }}
                >
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
                    />
                  )}

                  {activeTab === 'arquivos' && (
                    <ArquivosSection
                      documentTypes={DOCUMENT_TYPES}
                      uploads={docUploads}
                      pncpDocs={pncpDocs}
                      onFileChange={handleChangeDocFile}
                      onPublish={handlePublishDocPncp}
                      onDelete={handleDeleteDocPncp}   // 👈 AQUI
                      sendingDocId={sendingDocId}
                      
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}