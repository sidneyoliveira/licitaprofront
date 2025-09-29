// src/pages/Processos.js

import React, { useState, useEffect, useCallback } from 'react';
import useAxios from '../hooks/useAxios';
import ProcessoCard from '../components/ProcessoCard';
import ModalProcesso from '../components/ModalProcesso';
import ModalPublicacao from '../components/ModalPublicacao';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

const StatusTab = ({ children, count, active, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-colors ${
        active 
        ? 'bg-accent-blue text-white shadow-sm' 
        : 'bg-light-bg-secondary dark:bg-dark-bg-secondary hover:bg-light-border dark:hover:bg-dark-border'
    }`}>
        {children}
        {count > 0 && <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-white text-accent-blue' : 'bg-light-border dark:bg-dark-border'}`}>{count}</span>}
    </button>
);

const Processos = () => {
    const [processos, setProcessos] = useState([]);
    const [editingProcess, setEditingProcess] = useState(null);
    const [deletingProcessId, setDeletingProcessId] = useState(null);
    const [publishingProcess, setPublishingProcess] = useState(null);
    const [activeStatus, setActiveStatus] = useState('');
    const [filters, setFilters] = useState({ search: '', modalidade: '', situacao: '' });
    const [isLoading, setIsLoading] = useState(true);
    const api = useAxios();

    const fetchProcessos = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            // Adiciona filtros não vazios aos parâmetros, incluindo o activeStatus
            const currentFilters = { ...filters, situacao: activeStatus || filters.situacao };
            Object.entries(currentFilters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });
            
            const response = await api.get(`/processos/?${params.toString()}`);
            setProcessos(response.data);
        } catch (error) {
            console.error('Erro ao buscar processos:', error);
        } finally {
            setIsLoading(false);
        }
    }, [api, filters, activeStatus]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProcessos();
        }, 300); // Debounce de 300ms
        
        return () => clearTimeout(timer);
    }, [fetchProcessos]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        // Ao usar os filtros de select, limpamos o filtro da aba de status
        if (name === 'modalidade' || (name === 'situacao' && value !== '')) {
            setActiveStatus('');
        }
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleTabClick = (status) => {
        const newStatus = activeStatus === status ? '' : status;
        setActiveStatus(newStatus);
        // Limpa os outros filtros de situação para não haver conflito
        setFilters(prev => ({ ...prev, situacao: '' }));
    };

    const handleDelete = (processoId) => {
        setDeletingProcessId(processoId);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/processos/${deletingProcessId}/`);
            setDeletingProcessId(null);
            fetchProcessos();
        } catch (error) {
            setDeletingProcessId(null);
        }
    };

     const handleSaveProcess = (savedData) => {
        setEditingProcess(null); // Fecha o modal principal
        fetchProcessos(); // Atualiza a lista

        // Se o status for "Publicado" (ou posterior) e não houver número de certame, abre o segundo modal
        const isPublishedOrLater = ['Publicado', 'Em Contratação', 'Adjudicado/Homologado'].includes(savedData.situacao);
        if (isPublishedOrLater && !savedData.numero_certame) {
            setPublishingProcess(savedData);
        }
    };

     // Função para fechar todos os modais e atualizar a lista
    const handlePublicationSave = () => {
        setPublishingProcess(null);
        fetchProcessos();
    };
    
    const closeAllModals = () => {
        setEditingProcess(null);
        setPublishingProcess(null);
        setDeletingProcessId(null);
    };

    const handleView = (processoId) => {
        const url = window.location.origin + `/processos/visualizar/${processoId}`;
        window.open(url, '_blank');
    };

    const handleEdit = (processo) => setEditingProcess(processo);
    const handleCreate = () => setEditingProcess({});

    const statuses = ['Aberto', 'Em Pesquisa', 'Aguardando Publicação', 'Publicado', 'Em Contratação', 'Adjudicado/Homologado', 'Revogado/Cancelado'];
    const MODALIDADE_CHOICES = { 'PE': 'Pregão Eletrônico', 'CE': 'Concorrência Eletrônica', 'DE': 'Dispensa Eletrônica', 'IE': 'Inexigibilidade Eletrônica', 'ARP': 'Adesão a Registro de Preços', 'CR': 'Credenciamento' };

    return (
        <div>
            {/* Modal principal de Edição/Criação */}
            {editingProcess && (
                <ModalProcesso 
                    closeModal={() => setEditingProcess(null)} 
                    onSave={handleSaveProcess}
                    initialData={editingProcess} 
                />
            )}

            {/* Novo modal de Publicação */}
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
                    message="Tem certeza que deseja remover este processo? Os dados serão perdidos permanentemente."
                />
            )}
            
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Minhas Licitações</h1>
                    <p className="mt-1 text-light-text-secondary dark:text-dark-text-secondary">Gerencie e acompanhe as licitações.</p>
                </div>
                <button onClick={handleCreate} className="flex items-center gap-2 bg-accent-blue text-white py-2 px-4 rounded-lg">
                    <PlusIcon className="w-5 h-5" />
                    Novo Processo
                </button>
            </div>

            <div className="my-6">
                <div className="relative">
                    <input
                        type="text" name="search" value={filters.search} onChange={handleFilterChange}
                        placeholder="Pesquisar..." className="w-full pl-10 pr-4 py-3 border rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border-light-border dark:border-dark-border"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-text-secondary" />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-6">
                <StatusTab active={activeStatus === ''} onClick={() => handleTabClick('')}>Todos</StatusTab>
                {statuses.map((status) => (
                    <StatusTab key={status} active={activeStatus === status} onClick={() => handleTabClick(status)}>
                        {status}
                    </StatusTab>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                <select 
                    name="modalidade"
                    value={filters.modalidade}
                    onChange={handleFilterChange}
                    className="border rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border-light-border dark:border-dark-border p-2"
                >
                    <option value="">Todas as Modalidades</option>
                    {Object.entries(MODALIDADE_CHOICES).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                </select>
                {/* Outros filtros podem ser adicionados aqui */}
            </div>

            <div className="space-y-4">
                {isLoading ? <p className="text-center py-10">Carregando...</p> : 
                 processos.length > 0 ? (
                    processos.map((processo) => (
                        <ProcessoCard 
                            key={processo.id} 
                            processo={processo} 
                            onEdit={handleEdit} 
                            onDelete={handleDelete} 
                            onView={handleView}
                        />
                    ))
                ) : (
                    <p className="text-center py-10">Nenhum processo encontrado.</p>
                )}
            </div>
        </div>
    );
};

export default Processos;