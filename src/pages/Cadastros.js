// frontend/src/pages/Cadastros.js

import React, { useState, useEffect, useCallback } from 'react';
import useAxios from '../hooks/useAxios';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// --- COMPONENTES DO FORMULÁRIO (mantidos como antes) ---
const FormEntidade = ({ initialData, onSave }) => {
    const [formData, setFormData] = useState(initialData || { nome: '', cnpj: '' });
    const api = useAxios();
    const { showToast } = useToast();
    const isEditing = initialData && initialData.id;

    // Sincroniza o formulário se o item a ser editado mudar
    useEffect(() => {
        setFormData(initialData || { nome: '', cnpj: '' });
    }, [initialData]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/entidades/${initialData.id}/`, formData);
                showToast('Entidade atualizada com sucesso!', 'success');
            } else {
                await api.post('/entidades/', formData);
                showToast('Entidade cadastrada com sucesso!', 'success');
            }
            onSave();
        } catch (error) {
            showToast('Erro ao salvar entidade.', 'error');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-xs font-medium">Nome da Entidade</label>
                <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="w-full p-2 mt-1 border rounded-lg" required />
            </div>
            <div>
                <label className="text-xs font-medium">CNPJ</label>
                <input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} className="w-full p-2 mt-1 border rounded-lg" />
            </div>
            <button type="submit" className="w-full mt-2 bg-accent-blue text-white py-2 px-4 rounded-lg">
                {isEditing ? 'Atualizar Entidade' : 'Salvar Entidade'}
            </button>
        </form>
    );
};

const FormOrgao = ({ entidades, initialData, onSave }) => {
    const [formData, setFormData] = useState(initialData || { nome: '', entidade: '' });
    const api = useAxios();
    const { showToast } = useToast();
    const isEditing = initialData && initialData.id;

    useEffect(() => {
        setFormData(initialData || { nome: '', entidade: '' });
    }, [initialData]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/orgaos/${initialData.id}/`, formData);
                showToast('Órgão atualizado com sucesso!', 'success');
            } else {
                await api.post('/orgaos/', formData);
                showToast('Órgão cadastrado com sucesso!', 'success');
            }
            onSave();
        } catch (error) {
            showToast('Erro ao salvar órgão.', 'error');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-xs font-medium">Vincular à Entidade</label>
                <select name="entidade" value={formData.entidade} onChange={handleChange} className="w-full p-2 mt-1 border rounded-lg" required>
                    <option value="">Selecione uma entidade...</option>
                    {entidades.map(ent => <option key={ent.id} value={ent.id}>{ent.nome}</option>)}
                </select>
            </div>
            <div>
                <label className="text-xs font-medium">Nome do Órgão</label>
                <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="w-full p-2 mt-1 border rounded-lg" required />
            </div>
            <button type="submit" className="w-full mt-2 bg-accent-blue text-white py-2 px-4 rounded-lg">
                {isEditing ? 'Atualizar Órgão' : 'Salvar Órgão'}
            </button>
        </form>
    );
};

// --- COMPONENTE PRINCIPAL DA PÁGINA COM ABAS ---
const Cadastros = () => {
    const [activeTab, setActiveTab] = useState('entidades'); // Estado para controlar a aba ativa
    const api = useAxios();
    const { showToast } = useToast();

    const [entidades, setEntidades] = useState([]);
    const [orgaos, setOrgaos] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);

    const fetchEntidades = useCallback(async () => {
        try {
            const response = await api.get('/entidades/');
            setEntidades(response.data);
        } catch { showToast('Não foi possível carregar as entidades.', 'error'); }
    }, [api, showToast]);

    const fetchOrgaos = useCallback(async () => {
        try {
            const response = await api.get('/orgaos/');
            setOrgaos(response.data);
        } catch { showToast('Não foi possível carregar os órgãos.', 'error'); }
    }, [api, showToast]);

    useEffect(() => {
        fetchEntidades();
        fetchOrgaos();
    }, [fetchEntidades, fetchOrgaos]);

    const handleSave = () => {
        fetchEntidades();
        fetchOrgaos();
        setEditingItem(null);
    };

    const confirmDelete = async () => {
        if (!deletingItem) return;
        const { type, id } = deletingItem;
        const endpoint = type === 'entidade' ? 'entidades' : 'orgaos';
        try {
            await api.delete(`/${endpoint}/${id}/`);
            showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} removido com sucesso!`, 'success');
            if (type === 'entidade') fetchEntidades();
            if (type === 'orgao') fetchOrgaos();
        } catch {
            showToast(`Falha ao remover ${type}.`, 'error');
        } finally {
            setDeletingItem(null);
        }
    };

    const tabBaseStyle = "px-4 py-2 text-sm font-medium rounded-t-lg";
    const tabActiveStyle = "text-accent-blue border-b-2 border-accent-blue";
    const tabInactiveStyle = "text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary border-b-2 border-transparent";

    return (
        <div>
            {deletingItem && (
                <ConfirmDeleteModal
                    onConfirm={confirmDelete}
                    onCancel={() => setDeletingItem(null)}
                    message={`Tem a certeza de que deseja remover? Esta ação pode remover também os registos associados.`}
                />
            )}

            <h1 className="text-3xl font-bold mb-6">Gestão de Cadastros</h1>

            {/* Navegação das Abas */}
            <div className="border-b border-light-border dark:border-dark-border">
                <nav className="-mb-px flex gap-6" aria-label="Tabs">
                    <button 
                        onClick={() => { setActiveTab('entidades'); setEditingItem(null); }}
                        className={`${tabBaseStyle} ${activeTab === 'entidades' ? tabActiveStyle : tabInactiveStyle}`}
                    >
                        Entidades
                    </button>
                    <button 
                        onClick={() => { setActiveTab('orgaos'); setEditingItem(null); }}
                        className={`${tabBaseStyle} ${activeTab === 'orgaos' ? tabActiveStyle : tabInactiveStyle}`}
                    >
                        Órgãos
                    </button>
                </nav>
            </div>

            {/* Conteúdo das Abas */}
            <div className="mt-6">
                {activeTab === 'entidades' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card title={editingItem?.type === 'entidade' ? 'Editar Entidade' : 'Cadastrar Nova Entidade'}>
                            <FormEntidade 
                                key={editingItem?.type === 'entidade' ? editingItem.data.id : 'new-entidade'}
                                initialData={editingItem?.type === 'entidade' ? editingItem.data : null}
                                onSave={handleSave}
                            />
                        </Card>
                        <Card title="Entidades Cadastradas">
                            <div className="overflow-y-auto max-h-96">
                                {entidades.map(ent => (
                                    <div key={ent.id} className="flex justify-between items-center p-2 border-b">
                                        <span>{ent.nome}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingItem({ type: 'entidade', data: ent })}><PencilIcon className="w-4 h-4"/></button>
                                            <button onClick={() => setDeletingItem({ type: 'entidade', id: ent.id })}><TrashIcon className="w-4 h-4 text-red-500"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'orgaos' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card title={editingItem?.type === 'orgao' ? 'Editar Órgão' : 'Cadastrar Novo Órgão'}>
                             <FormOrgao 
                                key={editingItem?.type === 'orgao' ? editingItem.data.id : 'new-orgao'}
                                entidades={entidades}
                                initialData={editingItem?.type === 'orgao' ? editingItem.data : null}
                                onSave={handleSave}
                            />
                        </Card>
                        <Card title="Órgãos Cadastrados">
                            <div className="overflow-y-auto max-h-96">
                                 {orgaos.map(org => (
                                    <div key={org.id} className="flex justify-between items-center p-2 border-b">
                                        <div>
                                            <p>{org.nome}</p>
                                            <p className="text-xs text-light-text-secondary">{org.entidade_nome}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingItem({ type: 'orgao', data: org })}><PencilIcon className="w-4 h-4"/></button>
                                            <button onClick={() => setDeletingItem({ type: 'orgao', id: org.id })}><TrashIcon className="w-4 h-4 text-red-500"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cadastros;