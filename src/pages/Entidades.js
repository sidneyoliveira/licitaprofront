// frontend/src/pages/Entidades.js

import React, { useState, useEffect, useCallback } from 'react';
import useAxios from '../hooks/useAxios';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { EntidadeOrgaoModal } from '../components/EntidadeOrgaoModal';
import { Building, Home, Pencil, Trash, ChevronDown, Plus, Search, PlusCircleIcon} from 'lucide-react';

const OrgaoItem = ({ orgao, onEdit, onDelete }) => (
    <div className="flex justify-between items-center ml-4 pl-4 py-2 pr-3 border-l-2 border-light-border dark:border-dark-border/50 bg-light-bg-primary dark:bg-dark-bg-primary/50 rounded-r-lg">
        <div className="flex items-center gap-3">
            <Home className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
            <div>
                <span className="font-medium text-sm">{orgao.nome}</span>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Secretaria</p>
            </div>
        </div>
        <div className="flex gap-3">
            <button onClick={onEdit} className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-light-text-secondary dark:text-dark-text-secondary"><Pencil className="w-4 h-4"/></button>
            <button onClick={onDelete} className="p-1.5 rounded-md hover:bg-red-500/10 text-red-500"><Trash className="w-4 h-4"/></button>
        </div>
    </div>
);

const EntidadeAcordeon = ({ entidade, orgaos, onEdit, onDelete, onAddOrgao }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
            <div className="flex justify-between items-center p-3 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center gap-4">
                    <Building className="w-6 h-6 text-accent-blue" />
                    <div>
                        <h3 className="font-bold text-light-text-primary dark:text-dark-text-primary">{entidade.nome}</h3>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Prefeitura - {entidade.ano}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onAddOrgao(); }} className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20">
                        <Plus className="w-4 h-4"/> Novo Órgão
                    </button>
                    <ChevronDown className={`w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {isOpen && (
                <div className="px-4 pb-4 pt-2 space-y-2">
                    {orgaos.length > 0 ? orgaos.map(orgao => (
                        <OrgaoItem 
                            key={orgao.id} 
                            orgao={orgao}
                            onEdit={() => onEdit(orgao, 'orgao')}
                            onDelete={() => onDelete(orgao, 'orgao')}
                        />
                    )) : <p className="text-center text-sm text-light-text-secondary dark:text-dark-text-secondary py-4">Nenhum órgão cadastrado para esta entidade.</p>}
                </div>
            )}
        </div>
    );
};

const Entidades = () => {
    const [entidades, setEntidades] = useState([]);
    const [orgaos, setOrgaos] = useState([]);
    const [hierarchicalData, setHierarchicalData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null); // { type: 'entidade'|'orgao', data: {}, parentEntidadeId: ? }
    const [deletingItem, setDeletingItem] = useState(null); // { type: 'entidade'|'orgao', id: ... }
    
    const api = useAxios();
    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        try {
            const [entidadesRes, orgaosRes] = await Promise.all([
                api.get('/entidades/'),
                api.get('/orgaos/')
            ]);
            setEntidades(entidadesRes.data);
            setOrgaos(orgaosRes.data);
        } catch {
            showToast('Erro ao carregar dados.', 'error');
        }
    }, [api, showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const structuredData = entidades
            .map(ent => ({
                ...ent,
                orgaos: orgaos.filter(org => org.entidade === ent.id)
            }))
            .filter(ent => 
                ent.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ent.orgaos.some(org => org.nome.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        setHierarchicalData(structuredData);
    }, [entidades, orgaos, searchTerm]);

    const handleOpenModal = (item = null, type = 'entidade', parentEntidadeId = null) => {
        setEditingItem({ data: item, type, parentEntidadeId });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSave = () => {
        fetchData();
        handleCloseModal();
    };

    const handleDelete = async () => {
        if (!deletingItem) return;
        const { type, id } = deletingItem;
        const endpoint = type === 'entidade' ? 'entidades' : 'orgaos';
        try {
            await api.delete(`/${endpoint}/${id}/`);
            showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} removido com sucesso!`, 'success');
            fetchData();
        } catch (error) {
            showToast(`Erro ao remover ${type}. Verifique se não há processos associados.`, 'error');
        } finally {
            setDeletingItem(null);
        }
    };

    return (
        <div className="space-y-6">
            {isModalOpen && (
                <EntidadeOrgaoModal 
                    item={editingItem}
                    entidades={entidades}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
            {deletingItem && (
                <ConfirmDeleteModal 
                    onConfirm={handleDelete}
                    onCancel={() => setDeletingItem(null)}
                />
            )}
            
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Entidades e Órgãos</h1>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">Gerencie prefeituras, secretarias e outros órgãos</p>
                </div>
                <button onClick={() => handleOpenModal(null, 'entidade')} className="bg-accent-blue text-white py-2 px-4 rounded-lg flex items-center gap-2">
                    <PlusCircleIcon className="w-5 h-5" /> Nova Entidade
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-text-secondary" />
                <input 
                    type="text"
                    placeholder="Buscar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary"
                />
            </div>
            
            <div className="space-y-4">
                {hierarchicalData.map(entidade => (
                    <EntidadeAcordeon 
                        key={entidade.id}
                        entidade={entidade}
                        orgaos={entidade.orgaos}
                        onEdit={(orgao = null, type = 'entidade') => {
                            if(type === 'orgao') handleOpenModal(orgao, 'orgao');
                            else handleOpenModal(entidade, 'entidade');
                        }}
                        onDelete={(item = null, type = 'entidade') => {
                            if(type === 'orgao') setDeletingItem({ type: 'orgao', id: item.id });
                            else setDeletingItem({ type: 'entidade', id: entidade.id });
                        }}
                        onAddOrgao={() => handleOpenModal(null, 'orgao', entidade.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Entidades;