// frontend/src/pages/Processos.js

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
import ImportacaoProcessoModal from "../components/ImportacaoProcessoModal";
import { UploadCloud } from "lucide-react";

const Button = ({ children, variant, size, className, ...props }) => (
    <button className={`flex items-center justify-center font-medium gap-2 focus:outline-none disabled:pointer-events-none whitespace-nowrap transition-all duration-200 px-4 py-2 ${className}`} {...props}>
        {children}
    </button>
);


const Processos = () => {
    
    const [processos, setProcessos] = useState([]);
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
    const navigate = useNavigate();
    const [importOpen, setImportOpen] = useState(false);

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

    const modalidades = ['Pregão Eletrônico', 'Concorrência Eletrônica', 'Dispensa Eletrônica', 'Inexigibilidade Eletrônica', 'Adesão a Registro de Preços', 'Credenciamento'];

    const inputStyle = "w-full px-3 py-2 text-md font-medium rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-transparent";
    const labelStyle = "text-xs font-medium text-gray-600 dark:text-gray-300 mb-1";
    const inputCampo = "w-full px-3 py-2 text-md text-medium focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-transparent border dark:bg-dark-bg-primary rounded-lg dark:border-dark-bg-primary";

    const hasActiveFilters = useMemo(() => {
        return Object.values(filters).some(v => v !== '') || activeStatus !== '' || sortBy !== 'data_processo' || sortOrder !== 'desc';
    }, [filters, activeStatus, sortBy, sortOrder]);
  
    return (
        <div className="space-y-4">
            <Helmet>
                <title>Meus Processos</title>
            </Helmet>

            {publishingProcess && <ModalPublicacao processo={publishingProcess} closeModal={() => setPublishingProcess(null)} onPublished={handlePublicationSave} />}
            {deletingProcessId && <ConfirmDeleteModal onConfirm={confirmDelete} onCancel={() => setDeletingProcessId(null)} />}

            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-md p-4 first-letter:md:px-8 py-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary ">Meus Processos</h1>
                        <p className="mt-1 text-md text-light-text-secondary dark:text-dark-text-secondary">
                            Gerencie e acompanhe {processos.length} {processos.length === 1 ? 'licitação' : 'licitações'}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-2 justify-items-start">
                        {/* <Button onClick={exportToCSV} variant="outline" className={`${inputStyle} max-w-36 h-9 gap-1 inline-flex items-center bg-secondary-green text-white shadow-md hover:bg-secondary-green/90 transition-colors`}><Download className="w-4 h-4" /> Exportar</Button> */}
                         <Button
                            onClick={() => setImportOpen(true)}
                            className={`${inputStyle} max-w-35 h-8 gap-1 inline-flex items-center text-sm border`}          >
                            <UploadCloud className="w-4 h-4" /> Importar
                        </Button>
                        <Button onClick={handleCreate} className={`${inputStyle} max-w-35 h-8 gap-1 inline-flex items-center text-sm bg-accent-blue text-white hover:bg-accent-blue/90`}><Plus className="w-3 h-3 " /> Novo Processo</Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className='grid grid-cols-[4fr_1fr] items-center gap-4 '>
                    <div className="relative">
                        <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Pesquisar por número, objeto, entidade..." className={`${inputCampo} w-full pl-10 pr-4 py-2`} />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-text-secondary" />
                    </div>
                    <div className="grid gap-2">
                        <Button className={`${inputCampo} w-4 h-8`} onClick={() => setShowFilters(!showFilters)} variant="outline">
                            <Filter className="w-4 h-7"/> Filtros
                            {hasActiveFilters && <span className="ml-1 px-2 py-1 bg-accent-blue/10 text-accent-blue border rounded-lg text-xs font-semibold">Ativos</span>}
                        </Button>
                        {hasActiveFilters && <Button onClick={clearFilters} variant="ghost" size="sm" className={`${inputStyle} text-accent-red border border-red-200 rounded-lg h-8`}><X className="w-4 h-3" /> Limpar</Button>}
                    </div>
                    </div>
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 pt-2">
                                    <select className={`${inputCampo}`} name="modalidade" value={filters.modalidade} onChange={handleFilterChange}><option value="">Todas Modalidades</option>{modalidades.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                    <select className={`${inputCampo}`} name="registro_precos" value={filters.registro_precos} onChange={handleFilterChange}><option value="">Reg. de Preços (Todos)</option><option value="true">Sim</option><option value="false">Não</option></select>
                                    <input className={`${inputCampo}`} type="date" name="data_inicio" value={filters.data_inicio} onChange={handleFilterChange} />
                                    <input className={`${inputCampo}`} type="date" name="data_fim" value={filters.data_fim} onChange={handleFilterChange} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            {/* Modal de Importação */}
                <ImportacaoProcessoModal
                open={importOpen}
                onClose={() => setImportOpen(false)}
                onImported={fetchProcessos}
                // se você já hospedar o template no backend, mude o link abaixo:
                templateUrl={"/Modelo_Simples_Importacao.xlsx"}
                />
            <div className="space-y-2">
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