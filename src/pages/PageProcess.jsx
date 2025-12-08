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
/* SUBCOMPONENTE: Modal de Envio ao PNCP                                     */
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
      relative flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-bold transition-colors
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
    }
  }, [id, api, showToast, fetchDadosDoProcesso, fetchItens, fetchFornecedoresDoProcesso, fetchLotes]);

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
  /* HANDLERS                                                                */
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

        {/* Abas (Itens / Lotes / Fornecedores) – somente após salvar */}
        {processoId && !isEditing && (
          <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[480px]">
            {/* Navegação de Abas */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
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
            </div>

            {/* Conteúdo das Abas */}
            <div className="p-5 bg-slate-50/60 dark:bg-slate-900/40 min-h-[380px]">
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
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}