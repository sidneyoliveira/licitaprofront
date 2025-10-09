// frontend/src/components/ModalProcesso.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import useAxios from '../hooks/useAxios';
import { useToast } from '../context/ToastContext';
import { XMarkIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon, PencilIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

// --- utilitários (mesma aparência da sua versão, mas compatível com backend novo) ---
const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDateTimeForInput = (isoString) => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        return date.toISOString().slice(0, 16);
    } catch (e) {
        return '';
    }
};

// --- pequenos componentes (idênticos aos seus, apenas sem dependências externas faltantes) ---
const TabButton = ({ label, isActive, onClick, isDisabled }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors relative ${isActive ? 'text-accent-blue' : isDisabled ? 'text-gray-400/50 cursor-not-allowed' : 'text-light-text-secondary hover:text-light-text-primary'}`}
    >
        {label}
        {isActive && <motion.div layoutId="activeTabIndicator" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-accent-blue" />}
    </button>
);

const FormSection = ({ title, children }) => (
    <div className="space-y-4">
        <h3 className="text-sm font-bold">{title}</h3>
        {children}
    </div>
);

const ItemList = ({ items, onEdit, onDelete, onMoveUp, onMoveDown }) => {
    const [expandedItemId, setExpandedItemId] = useState(null);
    const toggleExpansion = (itemId) => setExpandedItemId(prev => (prev === itemId ? null : itemId));

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs font-bold px-2 py-1">
                <div className="col-span-1">#</div>
                <div className="col-span-6">Descrição</div>
                <div className="col-span-2 text-center">Unidade</div>
                <div className="col-span-2 text-center">Quantidade</div>
                <div className="col-span-1 text-right">Ações</div>
            </div>
            {(items || []).map((item, index) => (
                <div key={item.id}>
                    <div className="grid grid-cols-12 gap-2 items-center p-2 border rounded-lg bg-white">
                        <div className="col-span-1 text-sm font-semibold">{index + 1}</div>
                        <div className="col-span-6 text-sm font-medium cursor-pointer hover:text-accent-blue" onClick={() => toggleExpansion(item.id)}>{item.descricao}</div>
                        <div className="col-span-2 text-sm text-center">{item.unidade}</div>
                        <div className="col-span-2 text-sm text-center">{parseFloat(item.quantidade).toFixed(2)}</div>
                        <div className="col-span-1 text-right flex items-center justify-end gap-1">
                            <button type="button" onClick={() => onMoveUp(index)} disabled={index === 0} className="p-1 disabled:opacity-30"><ArrowUpIcon className="w-4 h-4"/></button>
                            <button type="button" onClick={() => onMoveDown(index)} disabled={index === items.length - 1} className="p-1 disabled:opacity-30"><ArrowDownIcon className="w-4 h-4"/></button>
                            <button type="button" onClick={() => onEdit(item)} className="p-1 text-yellow-600"><PencilIcon className="w-4 h-4"/></button>
                            <button type="button" onClick={() => onDelete(item.id)} className="p-1 text-red-500"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                    </div>
                    <AnimatePresence>
                        {expandedItemId === item.id && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-3 py-2 ml-8 border-l-2 text-xs text-gray-600">
                                <p className="font-semibold">Especificação:</p>
                                <p className="whitespace-pre-wrap">{item.especificacao || "Nenhuma especificação fornecida."}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
};

// --- Modal principal ---
const ModalProcesso = ({ closeModal, refreshProcessos, initialData }) => {
    const isEditing = initialData && initialData.id;
    const [activeTab, setActiveTab] = useState('dadosGerais');
    const [processoId, setProcessoId] = useState(initialData?.id || null);
    const { showToast } = useToast();
    const api = useAxios();

    const [formData, setFormData] = useState({
        objeto: '', numero_processo: '', data_processo: getTodayDate(), modalidade: '', 
        classificacao: '', tipo_organizacao: '', registro_precos: false, orgao: '', 
        entidade: '', valor_referencia: '', numero_certame: '', data_abertura: '', situacao: 'Em Pesquisa',
    });

    const [itens, setItens] = useState([]);
    const [itemFormData, setItemFormData] = useState({ descricao: '', especificacao: '', unidade: '', quantidade: 1 });
    const [editingItem, setEditingItem] = useState(null);

    const [fornecedoresDoProcesso, setFornecedoresDoProcesso] = useState([]);
    const [fornecedorSearchTerm, setFornecedorSearchTerm] = useState('');
    const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
    const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);

    const [entidades, setEntidades] = useState([]);
    const [orgaos, setOrgaos] = useState([]);
    const [catalogoFornecedores, setCatalogoFornecedores] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Carrega dados iniciais se editar
    useEffect(() => {
        if (isEditing && initialData) {
            const formattedDataAbertura = initialData.data_abertura ? formatDateTimeForInput(initialData.data_abertura) : '';
            setFormData(prev => ({ ...prev, ...initialData, data_abertura: formattedDataAbertura }));
            setProcessoId(initialData.id);
        }
    }, [isEditing, initialData]);

    const fetchDadosDoProcesso = useCallback(async (id) => {
        if (!id) return;
        try {
            const res = await api.get(`/processos/${id}/`);
            setItens(res.data.itens || []);
            // backend não tem uma tabela ProcessoFornecedor explícita — para agora vamos buscar fornecedores no catálogo
            // e filtrar por participação através de uma convenção: o front assume que fornecedores vinculados aparecem em res.data.fornecedores
            setFornecedoresDoProcesso(res.data.fornecedores || []);
        } catch (e) {
            showToast('Erro ao carregar dados do processo.', 'error');
        }
    }, [api, showToast]);

    const fetchAuxiliares = useCallback(async () => {
        try {
            const [entRes, fornRes] = await Promise.all([api.get('/entidades/'), api.get('/fornecedores/')]);
            setEntidades(entRes.data);
            setCatalogoFornecedores(fornRes.data);
        } catch (e) {
            // ignora
        }
    }, [api]);

    useEffect(() => {
        fetchAuxiliares();
        if (processoId) fetchDadosDoProcesso(processoId);
    }, [processoId, fetchDadosDoProcesso, fetchAuxiliares]);

    useEffect(() => {
        if (formData.entidade) {
            api.get(`/orgaos/?entidade=${formData.entidade}`).then(res => setOrgaos(res.data)).catch(() => setOrgaos([]));
        } else setOrgaos([]);
    }, [formData.entidade, api]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const final = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: final }));
        if (name === 'entidade' && formData.entidade !== value) {
            setFormData(prev => ({ ...prev, orgao: '' }));
        }
    };

    const handleItemFormChange = (e) => setItemFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSaveDadosGerais = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let res;
            if (isEditing && processoId) {
                res = await api.put(`/processos/${processoId}/`, formData);
                showToast('Dados do processo atualizados!', 'success');
            } else {
                res = await api.post('/processos/', formData);
                setProcessoId(res.data.id);
                showToast('Processo criado! Agora adicione os itens.', 'success');
                setActiveTab('itens');
            }
            // atualiza form com retorno do backend
            setFormData(prev => ({ ...prev, ...res.data, data_abertura: formatDateTimeForInput(res.data.data_abertura) }));
            refreshProcessos && refreshProcessos();
        } catch (err) {
            showToast('Erro ao salvar dados do processo.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddItem = async (e) => {
    e.preventDefault();
    if (!processoId) return showToast('Salve o processo antes de adicionar itens.', 'error');

    // Calcula automaticamente a próxima ordem
    const nextOrdem = itens.length > 0 ? Math.max(...itens.map(i => i.ordem || 0)) + 1 : 1;

    try {
        await api.post('/itens/', {
            processo: processoId,
            descricao: itemFormData.descricao,
            especificacao: itemFormData.especificacao,
            unidade: itemFormData.unidade,
            quantidade: itemFormData.quantidade,
            ordem: nextOrdem
        });
        showToast('Item adicionado!', 'success');
        setItemFormData({ descricao: '', especificacao: '', unidade: '', quantidade: 1 });
        fetchDadosDoProcesso(processoId);
    } catch (err) {
        const msg = err.response?.data?.error || 'Erro ao adicionar item.';
        showToast(msg, 'error');
    }
    };

    const handleDeleteItem = async (itemId) => {
        try {
            await api.delete(`/itens/${itemId}/`);
            showToast('Item removido!', 'success');
            fetchDadosDoProcesso(processoId);
        } catch (err) {
            showToast('Erro ao remover item.', 'error');
        }
    };

    const handleEditItem = async (item) => {
        setEditingItem(item);
    };

    const handleSaveEditedItem = async (itemId, data) => {
        try {
            await api.patch(`/itens/${itemId}/`, data);
            showToast('Item atualizado!', 'success');
            setEditingItem(null);
            fetchDadosDoProcesso(processoId);
        } catch (err) {
            showToast('Erro ao atualizar item.', 'error');
        }
    };

    const handleReorderItems = async (newItems) => {
        setItens(newItems);
        const itemIds = newItems.map(i => i.id);
        try {
            await api.post('/reorder-itens/', { item_ids: itemIds });
            showToast('Ordem atualizada!', 'success');
        } catch {
            showToast('Erro ao reordenar.', 'error');
            fetchDadosDoProcesso(processoId);
        }
    };

    const moveItem = (index, direction) => {
        const newItems = [...itens];
        const item = newItems.splice(index, 1)[0];
        newItems.splice(index + direction, 0, item);
        handleReorderItems(newItems);
    };

    // Fornecedores: selecionar do catálogo e vincular ao processo (chamada customizada)
    const handleAddFornecedor = async () => {
        if (!fornecedorSelecionado) return showToast('Selecione um fornecedor', 'error');
        if (!processoId) return showToast('Salve o processo primeiro.', 'error');
        try {
            // envia somente fornecedor_id; backend retorna 200 OK (ou 201 se item_id enviado)
            await api.post(`/processos/${processoId}/adicionar_fornecedor/`, { fornecedor_id: fornecedorSelecionado.id });
            showToast('Fornecedor solicitado vinculação!', 'success');
            // atualizar lista local de fornecedores (faz GET de novo)
            fetchDadosDoProcesso(processoId);
            setFornecedorSelecionado(null);
            setFornecedorSearchTerm('');
        } catch (err) {
            showToast('Erro ao vincular fornecedor.', 'error');
        }
    };

    const handleRemoveFornecedor = async (fornId) => {
        if (!processoId) return;
        try {
            await api.post(`/processos/${processoId}/remover_fornecedor/`, { fornecedor_id: fornId });
            showToast('Fornecedor removido do processo (vínculos apagados).', 'success');
            fetchDadosDoProcesso(processoId);
        } catch {
            showToast('Erro ao remover fornecedor.', 'error');
        }
    };

    // simple searchable dropdown local (catalogoFornecedores)
    const filteredFornecedores = catalogoFornecedores.filter(f => {
        if (!fornecedorSearchTerm) return true;
        const q = fornecedorSearchTerm.toLowerCase();
        return (f.razao_social || '').toLowerCase().includes(q) || (f.cnpj || '').toLowerCase().includes(q);
    });

    // UI strings / constantes
    const modalidades = ['Pregão Eletrônico', 'Concorrência Eletrônica', 'Dispensa Eletrônica', 'Inexigibilidade Eletrônica', 'Adesão a Registro de Preços', 'Credenciamento'];
    const classificacoes = ['Compras', 'Serviços Comuns', 'Serviços de Engenharia Comuns', 'Obras Comuns'];
    const organizacoes = ['Lote', 'Item'];
    const situacoes = ['Aberto', 'Em Pesquisa', 'Aguardando Publicação', 'Publicado', 'Em Contratação', 'Adjudicado/Homologado', 'Revogado/Cancelado'];

    const inputStyle = "w-full px-3 py-1.5 text-sm border rounded-lg bg-white";
    const labelStyle = "text-xs font-medium text-gray-600 ";

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                <header className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold">{isEditing ? `Editar Processo ${initialData.numero_processo}` : 'Criar Novo Processo'}</h2>
                    <button onClick={closeModal}><XMarkIcon className="w-6 h-6"/></button>
                </header>

                <div className="flex-shrink-0 border-b">
                    <nav className="flex gap-2 px-4">
                        <TabButton label="Dados Gerais" isActive={activeTab === 'dadosGerais'} onClick={() => setActiveTab('dadosGerais')} />
                        <TabButton label="Itens" isActive={activeTab === 'itens'} onClick={() => setActiveTab('itens')} isDisabled={!processoId} />
                        <TabButton label="Fornecedores" isActive={activeTab === 'fornecedores'} onClick={() => setActiveTab('fornecedores')} isDisabled={!processoId} />
                    </nav>
                </div>

                <div className="p-5 overflow-y-scroll flex-grow relative">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                            {activeTab === 'dadosGerais' && (
                                <form onSubmit={handleSaveDadosGerais} className="space-y-2">

                                    {/* ========== SEÇÃO 1 - INFORMAÇÕES PRINCIPAIS ========== */}
                                    <FormSection>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="md:col-span-2">
                                        <label className={labelStyle}>Objeto *</label>
                                        <textarea
                                            name="objeto"
                                            value={formData.objeto}
                                            onChange={handleChange}
                                            placeholder="Descreva brevemente o objeto do processo licitatório..."
                                            className={`${inputStyle} mt-1 h-28`}
                                            required
                                        />
                                        </div>
                                        <div className="space-y-4">
                                        <div>
                                            <label className={labelStyle}>Número do Processo *</label>
                                            <input
                                            name="numero_processo"
                                            value={formData.numero_processo}
                                            onChange={handleChange}
                                            placeholder="Ex: 123/2025"
                                            className={`${inputStyle} mt-1`}
                                            required
                                            />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Data do Processo *</label>
                                            <input
                                            name="data_processo"
                                            type="date"
                                            value={formData.data_processo || ''}
                                            onChange={handleChange}
                                            className={`${inputStyle} mt-1`}
                                            required
                                            />
                                        </div>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-4 gap-6">
                                        <div>
                                        <label className={labelStyle}>Modalidade *</label>
                                        <select
                                            name="modalidade"
                                            value={formData.modalidade}
                                            onChange={handleChange}
                                            className={`${inputStyle} mt-1`}
                                            required
                                        >
                                            <option value="">Selecione...</option>
                                            {modalidades.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                        </div>

                                        <div>
                                        <label className={labelStyle}>Classificação *</label>
                                        <select
                                            name="classificacao"
                                            value={formData.classificacao}
                                            onChange={handleChange}
                                            className={`${inputStyle} mt-1`}
                                            required
                                        >
                                            <option value="">Selecione...</option>
                                            {classificacoes.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                        </div>

                                        <div>
                                        <label className={labelStyle}>Tipo de Organização *</label>
                                        <select
                                            name="tipo_organizacao"
                                            value={formData.tipo_organizacao}
                                            onChange={handleChange}
                                            className={`${inputStyle} mt-1`}
                                            required
                                        >
                                            <option value="">Selecione...</option>
                                            {organizacoes.map(o => (
                                            <option key={o} value={o}>{o}</option>
                                            ))}
                                        </select>
                                        </div>
                                        <div>
                                        <label className={labelStyle}>Registro de Preços *</label>
                                        <select
                                            name="registro_precos"
                                            value={formData.registro_precos ? "true" : "false"}
                                            onChange={(e) =>
                                            setFormData(prev => ({ ...prev, registro_precos: e.target.value === "true" }))
                                            }
                                            className={`${inputStyle} mt-1`}
                                            required
                                        >
                                            <option value="false">Não</option>
                                            <option value="true">Sim</option>
                                        </select>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                        <label className={labelStyle}>Entidade *</label>
                                        <select
                                            name="entidade"
                                            value={formData.entidade}
                                            onChange={handleChange}
                                            className={`${inputStyle} mt-1`}
                                            required
                                        >
                                            <option value="">Selecione...</option>
                                            {entidades.map(e => (
                                            <option key={e.id} value={e.id}>{e.nome}</option>
                                            ))}
                                        </select>
                                        </div>

                                        <div>
                                        <label className={labelStyle}>Órgão *</label>
                                        <select
                                            name="orgao"
                                            value={formData.orgao}
                                            onChange={handleChange}
                                            className={`${inputStyle} mt-1`}
                                            required
                                            disabled={!formData.entidade}
                                        >
                                            <option value="">
                                            {formData.entidade ? 'Selecione...' : 'Selecione uma entidade primeiro'}
                                            </option>
                                            {orgaos.map(o => (
                                            <option key={o.id} value={o.id}>{o.nome}</option>
                                            ))}
                                        </select>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-[1.2fr_2fr_1.5fr_1fr_2fr] gap-6 mt-1">

                                        <div>
                                            <label className={labelStyle}>Número do Certame</label>
                                                <input
                                                    name="numero_certame"
                                                    value={formData.numero_certame || ''}
                                                    onChange={handleChange}
                                                    placeholder="Ex: 045/2025"
                                                    className={`${inputStyle} mt-1`}
                                                />
                                        </div>
                                        <div >
                                        <label className={labelStyle}>Data/Hora de Abertura</label>
                                        <input
                                            name="data_abertura"
                                            type="datetime-local"
                                            value={formData.data_abertura || ''}
                                            onChange={handleChange}
                                            className={`${inputStyle}  mt-1`}
                                        />
                                        </div>

                                        <div>
                                        <label className={labelStyle}>Valor de Referência (R$)</label>
                                        <input
                                            name="valor_referencia"
                                            type="number"
                                            step="0.01"
                                            value={formData.valor_referencia || ''}
                                            onChange={handleChange}
                                            placeholder="0,00"
                                            className={`${inputStyle} mt-1 text-right`}
                                        />
                                        </div>

                                        <div >
                                        <label className={labelStyle}>Vigência *</label>
                                        <input
                                            name="vigencia_meses"
                                            type="number"
                                            min="0"
                                            value={formData.vigencia_meses || ''}
                                            onChange={handleChange}
                                            placeholder="12"
                                            className={`${inputStyle} mt-1 text-center`}
                                        />
                                        </div>

                                            <div>
                                        <label className={labelStyle} >Situação *</label>
                                        <select
                                            name="situacao"
                                            value={formData.situacao}
                                            onChange={handleChange}
                                            className={`${inputStyle} mt-1`}
                                            required
                                        >
                                            {situacoes.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                        </div>
                                        
                                        </div>
                                    
                                        
                                
                                    </FormSection>

                                    {/* ========== BOTÕES ========== */}
                                    <div className="flex justify-end gap-4 pt-2 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
                                    >
                                        {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar e continuar')}
                                    </button>
                                    </div>
                                </form>
                                )}



                            {activeTab === 'itens' && (
    <div className="space-y-4">
        <FormSection title="Adicionar Item">
            <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_2fr_2fr_1fr] gap-2 items-end p-2 border rounded-lg">
                <div className="sm:col-span-2">
                    <label className={labelStyle}>Descrição *</label>
                    <input name="descricao" value={itemFormData.descricao} onChange={handleItemFormChange} className={inputStyle} required />
                </div>
                <div>
                    <label className={labelStyle}>Especificação</label>
                    <input name="especificacao" value={itemFormData.especificacao} onChange={handleItemFormChange} className={inputStyle} />
                </div>
                <div className="flex gap-2">
                    <div>
                        <label className={labelStyle}>Unidade *</label>
                        <input name="unidade" value={itemFormData.unidade} onChange={handleItemFormChange} className={inputStyle} required />
                    </div>
                    <div>
                        <label className={labelStyle}>Quantidade *</label>
                        <input name="quantidade" type="number" step="0.01" value={itemFormData.quantidade} onChange={handleItemFormChange} className={inputStyle} required />
                    </div>
                </div>
                <button type="submit" className="p-2 bg-green-600 text-white rounded-lg h-full flex items-center justify-center"><PlusIcon className="w-5 h-5"/></button>
            </form>
        </FormSection>

        <FormSection title="Itens do Processo">
            <ItemList items={itens} onEdit={handleEditItem} onDelete={handleDeleteItem} onMoveUp={(i) => moveItem(i, -1)} onMoveDown={(i) => moveItem(i, 1)} />
        </FormSection>

                {/* Modal de edição de item */}
                {editingItem && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg"
                        >
                            <h3 className="text-lg font-bold mb-4">Editar Item</h3>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSaveEditedItem(editingItem.id, editingItem);
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className={labelStyle}>Ordem</label>
                                    <input
                                        type="number"
                                        name="ordem"
                                        min="1"
                                        value={editingItem.ordem || ''}
                                        onChange={(e) => setEditingItem(prev => ({ ...prev, ordem: e.target.value }))}
                                        className={inputStyle}
                                        placeholder="Auto"
                                    />
                                </div>
                                <div>
                                    <label className={labelStyle}>Descrição *</label>
                                    <input
                                        type="text"
                                        name="descricao"
                                        value={editingItem.descricao || ''}
                                        onChange={(e) => setEditingItem(prev => ({ ...prev, descricao: e.target.value }))}
                                        className={inputStyle}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={labelStyle}>Especificação</label>
                                    <textarea
                                        name="especificacao"
                                        value={editingItem.especificacao || ''}
                                        onChange={(e) => setEditingItem(prev => ({ ...prev, especificacao: e.target.value }))}
                                        className={`${inputStyle} h-24`}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelStyle}>Unidade *</label>
                                        <input
                                            name="unidade"
                                            value={editingItem.unidade || ''}
                                            onChange={(e) => setEditingItem(prev => ({ ...prev, unidade: e.target.value }))}
                                            className={inputStyle}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Quantidade *</label>
                                        <input
                                            name="quantidade"
                                            type="number"
                                            step="0.01"
                                            value={editingItem.quantidade || ''}
                                            onChange={(e) => setEditingItem(prev => ({ ...prev, quantidade: e.target.value }))}
                                            className={inputStyle}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-5">
                                    <button
                                        type="button"
                                        onClick={() => setEditingItem(null)}
                                        className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm"
                                    >
                                        Salvar Alterações
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </div>
        )}
                            {activeTab === 'fornecedores' && (
                                <div className="space-y-4">
                                    <FormSection title="Buscar Fornecedor (Catálogo)">
                                        <div className="flex gap-2 items-end">
                                            <div className="flex-grow">
                                                <label className={labelStyle}>Pesquisar CNPJ ou Razão</label>
                                                <input value={fornecedorSearchTerm} onChange={(e) => setFornecedorSearchTerm(e.target.value)} className={`${inputStyle} mt-1`} placeholder="Digite..." />
                                                <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg">
                                                    {filteredFornecedores.map(f => (
                                                        <div key={f.id} className="p-2 flex justify-between items-center hover:bg-gray-50">
                                                            <div>
                                                                <div className="font-semibold text-sm">{f.razao_social}</div>
                                                                <div className="text-xs text-gray-600">{f.cnpj}</div>
                                                            </div>
                                                            <div>
                                                                <button onClick={() => { setFornecedorSelecionado(f); setFornecedorSearchTerm(`${f.cnpj} / ${f.razao_social}`); }} className="p-2 bg-accent-blue text-white rounded-lg">Selecionar</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <button onClick={() => setIsNewSupplierModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Novo</button>
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-2">
                                            <button onClick={handleAddFornecedor} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"><PlusIcon className="w-5 h-5"/> Vincular</button>
                                        </div>
                                    </FormSection>

                                    <FormSection title="Fornecedores vinculados">
                                        {fornecedoresDoProcesso.length === 0 && <p className="text-sm text-gray-600">Nenhum fornecedor vinculado ainda.</p>}
                                        {fornecedoresDoProcesso.map(f => (
                                            <div key={f.id} className="p-2 border rounded-lg flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold text-sm">{f.razao_social}</p>
                                                    <p className="text-xs text-gray-600">{f.cnpj}</p>
                                                </div>
                                                <button onClick={() => handleRemoveFornecedor(f.id)} className="p-2"><TrashIcon className="w-4 h-4 text-red-500" /></button>
                                            </div>
                                        ))}
                                    </FormSection>

                                    {isNewSupplierModalOpen && (
                                        <div className="absolute inset-0 bg-white p-5 z-20">
                                            {/* Modal de criação rápida de fornecedor */}
                                            <NewFornecedorForm
                                                onClose={() => setIsNewSupplierModalOpen(false)}
                                                onSaved={(newF) => {
                                                    setCatalogoFornecedores(prev => [newF, ...prev]);
                                                    setFornecedorSelecionado(newF);
                                                    setFornecedorSearchTerm(`${newF.cnpj} / ${newF.razao_social}`);
                                                    setIsNewSupplierModalOpen(false);
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="p-4 border-t flex justify-end gap-2">
                    <button onClick={closeModal} className="py-2 px-4 rounded-lg">Fechar</button>
                </div>
            </motion.div>
        </div>
    );
};

export default ModalProcesso;

/**
 * Componente interno: formulário rápido de criação de fornecedor.
 * Se você já tem um componente no seu projeto, só substitua por ele.
 */
function NewFornecedorForm({ onClose, onSaved }) {
    const api = useAxios();
    const { showToast } = useToast();
    const [form, setForm] = useState({ razao_social: '', cnpj: '', email: '', telefone: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/fornecedores/', form);
            showToast('Fornecedor criado!', 'success');
            onSaved(res.data);
        } catch (err) {
            showToast('Erro ao criar fornecedor.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-4 border rounded-lg bg-white">
            <h3 className="font-bold mb-3">Novo Fornecedor</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="text-xs">Razão Social *</label>
                    <input name="razao_social" value={form.razao_social} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                </div>
                <div>
                    <label className="text-xs">CNPJ *</label>
                    <input name="cnpj" value={form.cnpj} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                </div>
                <div>
                    <label className="text-xs">Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full p-2 border rounded-lg" />
                </div>
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg">Voltar</button>
                    <button type="submit" disabled={loading} className="py-2 px-4 bg-blue-600 text-white rounded-lg">{loading ? 'Salvando...' : 'Salvar'}</button>
                </div>
            </form>
        </div>
    );
}
