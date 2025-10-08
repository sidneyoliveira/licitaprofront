// frontend/src/pages/Processos.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import useAxios from '../hooks/useAxios';
import ProcessoCard from '../components/ProcessoCard';
import ModalProcesso from '../components/ModalProcesso';
import ModalPublicacao from '../components/ModalPublicacao';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { useToast } from '../context/ToastContext';
import { Search, Plus, Filter, Download, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CORREÇÃO: Importação do componente Button ---
const Button = ({ children, variant, size, className, ...props }) => (
    <button className={`flex items-center justify-center text-sm font-semibold gap-2 focus:outline-none disabled:pointer-events-none whitespace-nowrap transition-all duration-200 rounded-lg px-4 py-2 ${className}`} {...props}>
        {children}
    </button>
);


// Componente para as abas de status
const StatusTab = ({ children, count, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-accent-blue text-white shadow-md' 
        : 'bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border'
    }`}
  >
    {children}
    {count > 0 && (
      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
        active 
          ? 'bg-white text-accent-blue' 
          : 'bg-accent-blue/10 text-accent-blue'
      }`}>
        {count}
      </span>
    )}
  </button>
);

const Processos = () => {
    const [processos, setProcessos] = useState([]);
    const [editingProcess, setEditingProcess] = useState(null);
    const [deletingProcessId, setDeletingProcessId] = useState(null);
    const [publishingProcess, setPublishingProcess] = useState(null);
    const [activeStatus, setActiveStatus] = useState('');
    const [filters, setFilters] = useState({ 
        search: '', 
        modalidade: '', 
        registro_precos: '',
        data_inicio: '',
        data_fim: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('data_processo');
    const [sortOrder, setSortOrder] = useState('desc');
    const api = useAxios();
    const { showToast } = useToast();

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
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleTabClick = (status) => {
        setActiveStatus(prevStatus => (prevStatus === status ? '' : status));
    };

    const clearFilters = () => {
        setFilters({ search: '', modalidade: '', registro_precos: '', data_inicio: '', data_fim: '' });
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

    const handleSaveProcess = (savedData) => {
        setEditingProcess(null);
        fetchProcessos();
        const isPublishedOrLater = ['Publicado', 'Em Contratação', 'Adjudicado/Homologado'].includes(savedData.situacao);
        if (isPublishedOrLater && !savedData.numero_certame) {
            setPublishingProcess(savedData);
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

    const handleEdit = (processo) => setEditingProcess(processo);
    const handleCreate = () => setEditingProcess({});

    const exportToCSV = () => {
        showToast('Funcionalidade em desenvolvimento!', 'info');
    };

    const statuses = ['Aberto', 'Em Pesquisa', 'Aguardando Publicação', 'Publicado', 'Em Contratação', 'Adjudicado/Homologado', 'Revogado/Cancelado'];
    const modalidades = ['Pregão Eletrônico', 'Concorrência Eletrônica', 'Dispensa Eletrônica', 'Inexigibilidade Eletrônica', 'Adesão a Registro de Preços', 'Credenciamento'];

    const statusCounts = useMemo(() => {
        const counts = { total: processos.length };
        statuses.forEach(status => {
            counts[status] = processos.filter(p => p.situacao === status).length;
        });
        return counts;
    }, [processos]);

    const hasActiveFilters = useMemo(() => {
        return Object.values(filters).some(v => v !== '') || activeStatus !== '' || sortBy !== 'data_processo' || sortOrder !== 'desc';
    }, [filters, activeStatus, sortBy, sortOrder]);

    // --- CORREÇÃO AQUI: Declaração da variável isEditing ---
    const isEditing = editingProcess && editingProcess.id;

    return (
        <div className="space-y-4">
            <Helmet>
                <title>Minhas Licitações - Licita.PRO</title>
            </Helmet>

            {editingProcess && <ModalProcesso closeModal={() => setEditingProcess(null)} onSave={handleSaveProcess} refreshProcessos={fetchProcessos} initialData={isEditing ? editingProcess : {}} />}
            {publishingProcess && <ModalPublicacao processo={publishingProcess} closeModal={() => setPublishingProcess(null)} onPublished={handlePublicationSave} />}
            {deletingProcessId && <ConfirmDeleteModal onConfirm={confirmDelete} onCancel={() => setDeletingProcessId(null)} />}

            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg shadow-sm p-4 md:p-6 border border-light-border dark:border-dark-border">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl font-bold">Minhas Licitações</h1>
                        <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                            Gerencie e acompanhe {processos.length} {processos.length === 1 ? 'licitação' : 'licitações'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={fetchProcessos} variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" /> Atualizar</Button>
                        <Button onClick={exportToCSV} variant="outline" className="gap-2"><Download className="w-4 h-4" /> Exportar</Button>
                        <Button onClick={handleCreate} className="gap-2"><Plus className="w-4 h-4" /> Novo Processo</Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Pesquisar por número, objeto, entidade..." className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-text-secondary" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="gap-2">
                            <Filter className="w-4 h-4" /> Filtros Avançados
                            {hasActiveFilters && <span className="ml-1 px-2 py-0.5 bg-accent-blue/10 text-accent-blue rounded-full text-xs font-semibold">Ativos</span>}
                        </Button>
                        {hasActiveFilters && <Button onClick={clearFilters} variant="ghost" size="sm" className="gap-1 text-accent-red"><X className="w-3 h-3" /> Limpar</Button>}
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                                    <select name="modalidade" value={filters.modalidade} onChange={handleFilterChange}><option value="">Todas Modalidades</option>{modalidades.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                    <select name="registro_precos" value={filters.registro_precos} onChange={handleFilterChange}><option value="">Reg. de Preços (Todos)</option><option value="true">Sim</option><option value="false">Não</option></select>
                                    <input type="date" name="data_inicio" value={filters.data_inicio} onChange={handleFilterChange} />
                                    <input type="date" name="data_fim" value={filters.data_fim} onChange={handleFilterChange} />
                                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}><option value="data_processo">Ordenar por Data</option><option value="numero_processo">Ordenar por Número</option></select>
                                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}><option value="desc">Decrescente</option><option value="asc">Crescente</option></select>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="overflow-x-auto pb-2">
                <div className="flex gap-2 min-w-max p-1">
                    <StatusTab active={activeStatus === ''} onClick={() => handleTabClick('')} count={statusCounts.total}>Todos</StatusTab>
                    {statuses.map(status => <StatusTab key={status} active={activeStatus === status} onClick={() => handleTabClick(status)} count={statusCounts[status] || 0}>{status}</StatusTab>)}
                </div>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mx-auto"></div></div>
                ) : processos.length > 0 ? (
                    processos.map(processo => <ProcessoCard key={processo.id} processo={processo} onEdit={() => handleEdit(processo)} onDelete={() => handleDelete(processo.id)} onView={() => handleView(processo.id)} />)
                ) : (
                    <div className="text-center py-12 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Nenhum processo encontrado</h3>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">{hasActiveFilters ? 'Tente ajustar os filtros ou limpar a busca.' : 'Comece a gerir as suas licitações agora.'}</p>
                        {hasActiveFilters ? <Button onClick={clearFilters} variant="outline">Limpar Filtros</Button> : <Button onClick={handleCreate} className="gap-2"><Plus className="w-4 h-4" /> Criar Primeiro Processo</Button>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Processos;