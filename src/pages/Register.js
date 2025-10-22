import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import useAxios from '../hooks/useAxios';
import ProcessoCard from '../components/ProcessoCard';
import ModalPublicacao from '../components/ModalPublicacao';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { useToast } from '../context/ToastContext';
import { Search, Plus, Filter, Download, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Button = ({ children, className = '', ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-full px-5 py-2.5 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Processos = () => {
  // ====== ESTADO / LÓGICA ORIGINAL (INTACTA) ======
  const [processos, setProcessos] = useState([]);
  const [deletingProcessId, setDeletingProcessId] = useState(null);
  const [publishingProcess, setPublishingProcess] = useState(null);
  const [activeStatus, setActiveStatus] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    modalidade: '',
    registro_precos: '',
    data_inicio: '',
    data_fim: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('data_processo');
  const [sortOrder, setSortOrder] = useState('desc');

  const api = useAxios();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchProcessos = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      const currentFilters = { ...filters, situacao: activeStatus };

      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      params.append('ordering', sortOrder === 'desc' ? `-${sortBy}` : sortBy);

      const response = await api.get(`/processos/?${params.toString()}`);
      setProcessos(response.data);
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
      showToast('Erro ao carregar processos.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [api, filters, activeStatus, sortBy, sortOrder, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProcessos();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchProcessos]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleTabClick = (status) => {
    setActiveStatus((prevStatus) => (prevStatus === status ? '' : status));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      modalidade: '',
      registro_precos: '',
      data_inicio: '',
      data_fim: '',
    });
    setActiveStatus('');
    setSortBy('data_processo');
    setSortOrder('desc');
    setShowFilters(false);
  };

  const handleDelete = (processoId) => setDeletingProcessId(processoId);

  const confirmDelete = async () => {
    try {
      await api.delete(`/processos/${deletingProcessId}/`);
      setDeletingProcessId(null);
      showToast('Processo removido com sucesso!', 'success');
      fetchProcessos();
    } catch (error) {
      showToast('Erro ao remover processo.', 'error');
      setDeletingProcessId(null);
    }
  };

  const handlePublicationSave = () => {
    setPublishingProcess(null);
    fetchProcessos();
  };

  const handleView = (processoId) => {
    const url = window.location.origin + `/processos/visualizar/${processoId}`;
    window.open(url, '_blank');
  };

  const handleEdit = (processo) => {
    navigate(`/processos/editar/${processo.id}`);
  };

  const handleCreate = () => {
    navigate('/processos/novo');
  };

  const exportToCSV = () => {
    showToast('Funcionalidade em desenvolvimento!', 'info');
  };

  const modalidades = [
    'Pregão Eletrônico',
    'Concorrência Eletrônica',
    'Dispensa Eletrônica',
    'Inexigibilidade Eletrônica',
    'Adesão a Registro de Preços',
    'Credenciamento',
  ];

  // ====== APENAS ESTILO (para bater com a imagem) ======
  const inputBase =
    'w-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1789D2] focus:border-transparent';
  const searchInput =
    'pl-12 pr-4 py-3 rounded-2xl text-base placeholder:text-gray-400';
  const selectInput = 'px-3 py-2 rounded-xl text-sm';
  const dateInput = 'px-3 py-2 rounded-xl text-sm';

  const hasActiveFilters = useMemo(() => {
    return (
      Object.values(filters).some((v) => v !== '') ||
      activeStatus !== '' ||
      sortBy !== 'data_processo' ||
      sortOrder !== 'desc'
    );
  }, [filters, activeStatus, sortBy, sortOrder]);

  return (
    <div className="min-h-screen bg-[#EEF3FB]">
      <Helmet>
        <title>Meus Processos</title>
      </Helmet>

      {/* Top bar azul (breadcrumb) */}
      <div className="bg-[#1789D2] text-white">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="text-sm font-medium">
            Início <span className="opacity-80">/</span> <span>Processos</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header card (Meus Processos) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#0E2340]">
                Meus Processos
              </h1>
              <p className="text-sm text-[#7A8CA8] mt-1">
                Acompanhe e gerencie {processos.length}{' '}
                {processos.length === 1 ? 'processo' : 'processos'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={exportToCSV}
                className="bg-[#118043] hover:bg-[#0E6F3A] text-white shadow rounded-full"
              >
                <Download size={16} />
                Exportar
              </Button>

              <Button
                onClick={handleCreate}
                className="bg-[#1789D2] hover:bg-[#0F7BC2] text-white shadow rounded-full"
              >
                <Plus size={16} />
                Adicionar
              </Button>

              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="border border-[#1789D2] text-[#1789D2] hover:bg-[#E8F4FF] bg-white"
              >
                <Filter size={16} />
                Filtros
              </Button>
            </div>
          </div>

          {/* Barra de busca grande (dentro do header) */}
          <div className="mt-5">
            <div className="relative">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Pesquisar processo..."
                className={`${inputBase} ${searchInput}`}
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
          </div>

          {/* Botão Filtros (pílula) destacado à direita em telas menores – já compõe acima */}
          <div className="mt-4 flex items-center gap-2 lg:hidden">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="border border-[#1789D2] text-[#1789D2] hover:bg-[#E8F4FF] bg-white"
            >
              <Filter size={16} />
              Filtros
            </Button>
            {hasActiveFilters && (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#E8F4FF] text-[#1789D2] border border-[#CBE6FF]">
                Ativos
              </span>
            )}
          </div>

          {/* Área dos filtros expansível (igual sua lógica) */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-4">
                  <select
                    className={`${inputBase} ${selectInput}`}
                    name="modalidade"
                    value={filters.modalidade}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todas Modalidades</option>
                    {modalidades.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>

                  <select
                    className={`${inputBase} ${selectInput}`}
                    name="registro_precos"
                    value={filters.registro_precos}
                    onChange={handleFilterChange}
                  >
                    <option value="">Reg. de Preços (Todos)</option>
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </select>

                  <input
                    className={`${inputBase} ${dateInput}`}
                    type="date"
                    name="data_inicio"
                    value={filters.data_inicio}
                    onChange={handleFilterChange}
                  />
                  <input
                    className={`${inputBase} ${dateInput}`}
                    type="date"
                    name="data_fim"
                    value={filters.data_fim}
                    onChange={handleFilterChange}
                  />
                </div>

                {hasActiveFilters && (
                  <div className="flex justify-end pt-3">
                    <Button
                      onClick={clearFilters}
                      className="border border-red-200 text-[#C53030] hover:bg-red-50 bg-white"
                    >
                      <X size={16} />
                      Limpar
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lista / Conteúdo */}
        <div className="mt-5 space-y-4">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1789D2] mx-auto"></div>
              <p className="text-sm text-[#7A8CA8] mt-3">Carregando...</p>
            </div>
          ) : processos.length > 0 ? (
            processos.map((processo) => (
              <ProcessoCard
                key={processo.id}
                processo={processo}
                onEdit={() => handleEdit(processo)}
                onDelete={() => handleDelete(processo.id)}
                onView={() => handleView(processo.id)}
                // Se o seu ProcessoCard aceita mais props (ex.: onPublish), mantenha-as:
                onPublish={() => setPublishingProcess(processo)}
              />
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-1 text-[#0E2340]">
                Nenhum processo encontrado
              </h3>
              <p className="text-[#7A8CA8] mb-6">
                {hasActiveFilters
                  ? 'Tente ajustar os filtros ou limpar a busca.'
                  : 'Comece a gerir as suas licitações agora.'}
              </p>
              {hasActiveFilters ? (
                <Button
                  onClick={clearFilters}
                  className="border border-[#1789D2] text-[#1789D2] hover:bg-[#E8F4FF] bg-white"
                >
                  Limpar Filtros
                </Button>
              ) : (
                <Button
                  onClick={handleCreate}
                  className="bg-[#1789D2] hover:bg-[#0F7BC2] text-white"
                >
                  <Plus size={16} />
                  Criar Primeiro Processo
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAIS (originais) */}
      {publishingProcess && (
        <ModalPublicacao
          processo={publishingProcess}
          closeModal={() => setPublishingProcess(null)}
          onPublished={handlePublicationSave}
        />
      )}
      {deletingProcessId && (
        <ConfirmDeleteModal
          onConfirm={confirmDelete}
          onCancel={() => setDeletingProcessId(null)}
        />
      )}
    </div>
  );
};

export default Processos;
