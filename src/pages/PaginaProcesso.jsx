// frontend/src/pages/PaginaProcesso.jsx

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import useAxios from '../hooks/useAxios';
import { useToast } from '../context/ToastContext';
import { TrashIcon, PlusIcon, PencilIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

const formatDateTimeForInput = (isoString) => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        return date.toISOString().slice(0, 16);
    } catch (e) {
        return '';
    }
};

const TabButton = ({ label, isActive, onClick, isDisabled }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors relative ${isActive ? 'text-accent-blue' : isDisabled ? 'text-gray-200 cursor-not-allowed' : 'text-light-text-secondary hover:text-light-text-primary dark:text-dark-text-secondary dark:hover:text-dark-text-primary'} `}
    >
        {label}
        {isActive && <motion.div layoutId="activeTabIndicator" className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-accent-blue" />}
    </button>
);

const FormSection = ({ title, children }) => (
    <div className="space-y-1">
        <h3 className="text-sm font-bold">{title}</h3>
        {children}
    </div>
);

const ItemList = ({ items, onEdit, onDelete, onMoveUp, onMoveDown }) => {
    const [expandedItemId, setExpandedItemId] = useState(null);
    const toggleExpansion = (itemId) => setExpandedItemId(prev => (prev === itemId ? null : itemId));

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs font-bold px-3 py-3 border rounded-lg">
                <div className="col-span-1">#</div>
                <div className="col-span-6">Descrição</div>
                <div className="col-span-2 text-center">Unidade</div>
                <div className="col-span-2 text-center">Quantidade</div>
                <div className="col-span-1 text-right">Ações</div>
            </div>
            {(items || []).map((item, index) => (
                <div key={item.id}>
                    <div className="grid grid-cols-12 gap-2 items-center p-2 bg-light-bg-secondary border-light-border dark:bg-dark-bg-secondary dark:border-dark-border">
                        <div className="col-span-1 text-sm font-semibold">{index + 1}</div>
                        <div className="col-span-6 text-sm font-medium cursor-pointer  hover:text-accent-blue" onClick={() => toggleExpansion(item.id)}>{item.descricao}</div>
                        <div className="col-span-2 text-sm text-center">{item.unidade}</div>
                        <div className="col-span-2 text-sm text-center">{parseFloat(item.quantidade).toFixed(2)}</div>
                        <div className="col-span-1 text-right flex items-center justify-end gap-1">
                            {/* <button type="button" onClick={() => onMoveUp(index)} disabled={index === 0} className="p-1 disabled:opacity-30"><ArrowUpIcon className="w-4 h-4"/></button>
                            <button type="button" onClick={() => onMoveDown(index)} disabled={index === items.length - 1} className="p-1 disabled:opacity-30"><ArrowDownIcon className="w-4 h-4"/></button> */}
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


// --- DICIONÁRIO E FUNÇÃO DE ESTILO PARA A TAG DO CERTAME  ---
const modalidadeMap = {
    'Pregão Eletrônico': { sigla: 'PE', color: 'purple' },
    'Concorrência Eletrônica': { sigla: 'CE', color: 'teal' },
    'Dispensa Eletrônica': { sigla: 'DE', color: 'indigo' },
    'Adesão a Registro de Preços': { sigla: 'ARP', color: 'pink' },
    'Credenciamento': { sigla: 'CR', color: 'amber' },
    'Inexigibilidade Eletrônica': { sigla: 'IE', color: 'cyan' },
};

// --- Componente de PÁGINA principal ---
const PaginaProcesso = () => {
    const { id } = useParams(); // <-- Pega o 'id' da URL, ex: /processo/editar/123
    const navigate = useNavigate(); // <-- Hook para navegar entre páginas
    const isEditing = !!id; // <-- Determina se é edição se houver um ID na URL

    const [activeTab, setActiveTab] = useState('dadosGerais');
    const [processoId, setProcessoId] = useState(id || null);
    const { showToast } = useToast();
    const api = useAxios();

    const [formData, setFormData] = useState({
        objeto: '', numero_processo: '', data_processo:'', modalidade: '', 
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
    
    // Carrega dados iniciais do processo se estiver em modo de edição
    const fetchProcessoData = useCallback(async (processoIdToFetch) => {
        setIsLoading(true);
        try {
            const res = await api.get(`/processos/${processoIdToFetch}/`);
            const initialData = res.data;
            const formattedDataAbertura = initialData.data_abertura ? formatDateTimeForInput(initialData.data_abertura) : '';
            setFormData(prev => ({ ...prev, ...initialData, data_abertura: formattedDataAbertura }));
            setItens(initialData.itens || []);
            setFornecedoresDoProcesso(initialData.fornecedores || []);
        } catch (e) {
            showToast('Erro ao carregar dados do processo.', 'error');
            navigate('/processos'); // Volta para a lista se não encontrar o processo
        } finally {
            setIsLoading(false);
        }
    }, [api, showToast, navigate]);

    const fetchAuxiliares = useCallback(async () => {
        try {
            const [entRes, fornRes] = await Promise.all([api.get('/entidades/'), api.get('/fornecedores/')]);
            setEntidades(entRes.data);
            setCatalogoFornecedores(fornRes.data);
        } catch (e) {
            showToast('Erro ao carregar dados auxiliares.', 'error');
        }
    }, [api, showToast]);

    useEffect(() => {
        fetchAuxiliares();
        if (isEditing && processoId) {
            fetchProcessoData(processoId);
        }
    }, [isEditing, processoId, fetchProcessoData, fetchAuxiliares]);

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
                showToast('Processo criado com sucesso!', 'success');
                // Navega para a página de edição do processo recém-criado
                navigate(`/processos/editar/${res.data.id}`, { replace: true });
            }
            // Atualiza o formulário com o retorno do backend
            const updatedData = res.data;
            setFormData(prev => ({ ...prev, ...updatedData, data_abertura: formatDateTimeForInput(updatedData.data_abertura) }));
            if(!isEditing) {
                setProcessoId(updatedData.id); 
                setActiveTab('itens'); 
            }

        } catch (err) {
            showToast('Erro ao salvar dados do processo.', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const fetchDadosDoProcesso = useCallback(async (id) => {
        if (!id) return;
        try {
            const res = await api.get(`/processos/${id}/`);
            setItens(res.data.itens || []);
            setFornecedoresDoProcesso(res.data.fornecedores || []);
        } catch (e) {
            showToast('Erro ao carregar itens/fornecedores.', 'error');
        }
    }, [api, showToast]);

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!processoId) return showToast('Salve o processo antes de adicionar itens.', 'error');
        const nextOrdem = itens.length > 0 ? Math.max(...itens.map(i => i.ordem || 0)) + 1 : 1;
        try {
            await api.post('/itens/', { processo: processoId, ...itemFormData, ordem: nextOrdem });
            showToast('Item adicionado!', 'success');
            setItemFormData({ descricao: '', especificacao: '', unidade: '', quantidade: 1 });
            fetchDadosDoProcesso(processoId);
        } catch (err) {
            showToast(err.response?.data?.error || 'Erro ao adicionar item.', 'error');
        }
    };

    const handleDeleteItem = async (itemId) => {
        try {
            await api.delete(`/itens/${itemId}/`);
            showToast('Item removido!', 'success');
            fetchDadosDoProcesso(processoId);
        } catch (err) { showToast('Erro ao remover item.', 'error'); }
    };

    const handleEditItem = (item) => setEditingItem(item);

    const handleSaveEditedItem = async (itemId, data) => {
        try {
            await api.patch(`/itens/${itemId}/`, data);
            showToast('Item atualizado!', 'success');
            setEditingItem(null);
            fetchDadosDoProcesso(processoId);
        } catch (err) { showToast('Erro ao atualizar item.', 'error'); }
    };

    const handleReorderItems = async (newItems) => {
        setItens(newItems);
        try {
            await api.post('/reorder-itens/', { item_ids: newItems.map(i => i.id) });
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

    const handleAddFornecedor = async () => {
        if (!fornecedorSelecionado) return showToast('Selecione um fornecedor', 'error');
        if (!processoId) return showToast('Salve o processo primeiro.', 'error');
        try {
            await api.post(`/processos/${processoId}/adicionar_fornecedor/`, { fornecedor_id: fornecedorSelecionado.id });
            showToast('Fornecedor vinculado!', 'success');
            fetchDadosDoProcesso(processoId);
            setFornecedorSelecionado(null);
            setFornecedorSearchTerm('');
        } catch (err) { showToast('Erro ao vincular fornecedor.', 'error'); }
    };

    const handleRemoveFornecedor = async (fornId) => {
        if (!processoId) return;
        try {
            await api.post(`/processos/${processoId}/remover_fornecedor/`, { fornecedor_id: fornId });
            showToast('Fornecedor desvinculado.', 'success');
            fetchDadosDoProcesso(processoId);
        } catch { showToast('Erro ao remover fornecedor.', 'error'); }
    };

    const filteredFornecedores = catalogoFornecedores.filter(f => {
        if (!fornecedorSearchTerm) return true;
        const q = fornecedorSearchTerm.toLowerCase();
        return (f.razao_social || '').toLowerCase().includes(q) || (f.cnpj || '').toLowerCase().includes(q);
    });

    const modalidades = ['Pregão Eletrônico', 'Concorrência Eletrônica', 'Dispensa Eletrônica', 'Inexigibilidade Eletrônica', 'Adesão a Registro de Preços', 'Credenciamento'];
    const classificacoes = ['Compras', 'Serviços Comuns', 'Serviços de Engenharia Comuns', 'Obras Comuns'];
    const organizacoes = ['Lote', 'Item'];
    const situacoes = ['Aberto', 'Em Pesquisa', 'Aguardando Publicação', 'Publicado', 'Em Contratação', 'Adjudicado/Homologado', 'Revogado/Cancelado'];
    const inputStyle = "w-full px-3 py-1.5 text-sm border rounded-lg  bg-light-bg-secondary border-light-border dark:bg-dark-bg-secondary dark:border-dark-border";
    const labelStyle = "text-xs font-medium  bg-light-bg-secondary border-light-border dark:bg-dark-bg-secondary dark:border-dark-border ";

    const anoCertame = formData.numero_certame?.split('/')[1] || new Date().getFullYear();
    const numeroCertame = formData.numero_certame?.split('/')[0];
    const siglaModalidade = modalidadeMap[formData.modalidade]?.sigla || '';
    
    return (

        <div>
            <div className="mb-28 rounded-lg border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary">
                <header className="flex items-center justify-between p-4 rounded-lg bg-light-bg-secondary border-light-border dark:bg-dark-bg-secondary dark:border-dark-border">
                    <h1 className="text-xl font-bold">
                        {isEditing ? `Editar Processo: Nº ${numeroCertame}/${anoCertame}-${siglaModalidade}` : 'Criar Novo Processo'}
                    </h1>
                </header>

                <div className="flex-shrink-0 border-b  bg-light-bg-secondary border-light-border dark:bg-dark-bg-secondary dark:border-dark-border ">
                    <nav className="flex gap-2 px-4">
                        <TabButton label="Dados Gerais" isActive={activeTab === 'dadosGerais'} onClick={() => setActiveTab('dadosGerais')} />
                        <TabButton label="Itens" isActive={activeTab === 'itens'} onClick={() => setActiveTab('itens')} isDisabled={!processoId} />
                        <TabButton label="Fornecedores" isActive={activeTab === 'fornecedores'} onClick={() => setActiveTab('fornecedores')} isDisabled={!processoId} />
                    </nav>
                </div>

                <div className="p-5 flex-grow">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                            
                            {activeTab === 'dadosGerais' && (
                                <form onSubmit={handleSaveDadosGerais} className="space-y-6">

                                    <FormSection>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="md:col-span-2">
                                        <label className={labelStyle}>Objeto *</label>
                                        <textarea name="objeto" value={formData.objeto} onChange={handleChange} placeholder="Descreva brevemente o objeto do processo licitatório..." className={`${inputStyle} mt-1 h-28`} required />
                                        </div>
                                        <div className="space-y-4">
                                        <div>
                                            <label className={labelStyle}>Número do Processo *</label>
                                            <input name="numero_processo" value={formData.numero_processo} onChange={handleChange} placeholder="Ex: 123/2025" className={`${inputStyle} mt-1`} required />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Data do Processo *</label>
                                            <input name="data_processo" type="date" value={formData.data_processo || ''} onChange={handleChange} className={`${inputStyle} mt-1`} required />
                                        </div>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-4 gap-6">
                                        <div>
                                            <label className={labelStyle}>Modalidade *</label>
                                            <select name="modalidade" value={formData.modalidade} onChange={handleChange} className={`${inputStyle} mt-1`} required>
                                                <option value="">Selecione...</option>
                                                {modalidades.map(m => (<option key={m} value={m}>{m}</option>))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Classificação *</label>
                                            <select name="classificacao" value={formData.classificacao} onChange={handleChange} className={`${inputStyle} mt-1`} required>
                                                <option value="">Selecione...</option>
                                                {classificacoes.map(c => (<option key={c} value={c}>{c}</option>))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Tipo de Organização *</label>
                                            <select name="tipo_organizacao" value={formData.tipo_organizacao} onChange={handleChange} className={`${inputStyle} mt-1`} required>
                                                <option value="">Selecione...</option>
                                                {organizacoes.map(o => (<option key={o} value={o}>{o}</option>))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Registro de Preços *</label>
                                            <select name="registro_precos" value={formData.registro_precos ? "true" : "false"} onChange={(e) => setFormData(prev => ({ ...prev, registro_precos: e.target.value === "true" }))} className={`${inputStyle} mt-1`} required>
                                                <option value="false">Não</option>
                                                <option value="true">Sim</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelStyle}>Entidade *</label>
                                            <select name="entidade" value={formData.entidade} onChange={handleChange} className={`${inputStyle} mt-1`} required>
                                                <option value="">Selecione...</option>
                                                {entidades.map(e => (<option key={e.id} value={e.id}>{e.nome}</option>))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Órgão *</label>
                                            <select name="orgao" value={formData.orgao} onChange={handleChange} className={`${inputStyle} mt-1`} required disabled={!formData.entidade}>
                                                <option value="">{formData.entidade ? 'Selecione...' : 'Selecione uma entidade primeiro'}</option>
                                                {orgaos.map(o => (<option key={o.id} value={o.id}>{o.nome}</option>))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-[1.2fr_2fr_1.5fr_1fr_2fr] gap-6 mt-1">
                                        <div>
                                            <label className={labelStyle}>Número do Certame</label>
                                            <input name="numero_certame" value={formData.numero_certame || ''} onChange={handleChange} placeholder="Ex: 045/2025" className={`${inputStyle} mt-1`} />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Data/Hora de Abertura</label>
                                            <input name="data_abertura" type="datetime-local" value={formData.data_abertura || ''} onChange={handleChange} className={`${inputStyle}  mt-1`} />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Valor de Referência (R$)</label>
                                            <input name="valor_referencia" type="number" step="0.01" value={formData.valor_referencia || ''} onChange={handleChange} placeholder="0,00" className={`${inputStyle} mt-1 text-right`} />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Vigência *</label>
                                            <input name="vigencia_meses" type="number" min="0" value={formData.vigencia_meses || ''} onChange={handleChange} placeholder="12" className={`${inputStyle} mt-1 text-center`} />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Situação *</label>
                                            <select name="situacao" value={formData.situacao} onChange={handleChange} className={`${inputStyle} mt-1`} required>
                                                {situacoes.map(s => (<option key={s} value={s}>{s}</option>))}
                                            </select>
                                        </div>
                                    </div>
                                    </FormSection>
                                </form>
                            )}
                            {activeTab === 'itens' && (
                                <div className="space-y-2">

                                    <FormSection title="Adicionar Item">
                                        <form onSubmit={handleAddItem} className={`${inputStyle} grid grid-cols-1 sm:grid-cols-[1fr_2fr_2fr_2fr_1fr] gap-2 items-end p-2 border rounded-lg`}>
                                            <div className="sm:col-span-2 ">
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
                                    {editingItem && (
                                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-xl shadow-2xl w-full max-w-lg">
                                                <h3 className="text-lg font-bold mb-4 ">Editar Item</h3>
                                                <form onSubmit={(e) => { e.preventDefault(); handleSaveEditedItem(editingItem.id, editingItem); }} className="space-y-4">
                                                    <div>
                                                        <label className={labelStyle}>Ordem</label>
                                                        <input type="number" name="ordem" min="1" value={editingItem.ordem || ''} onChange={(e) => setEditingItem(prev => ({ ...prev, ordem: e.target.value }))} className={inputStyle} placeholder="Auto" />
                                                    </div>
                                                    <div>
                                                        <label className={labelStyle}>Descrição *</label>
                                                        <input type="text" name="descricao" value={editingItem.descricao || ''} onChange={(e) => setEditingItem(prev => ({ ...prev, descricao: e.target.value }))} className={inputStyle} required />
                                                    </div>
                                                    <div>
                                                        <label className={labelStyle}>Especificação</label>
                                                        <textarea name="especificacao" value={editingItem.especificacao || ''} onChange={(e) => setEditingItem(prev => ({ ...prev, especificacao: e.target.value }))} className={`${inputStyle} h-24`} />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className={labelStyle}>Unidade *</label>
                                                            <input name="unidade" value={editingItem.unidade || ''} onChange={(e) => setEditingItem(prev => ({ ...prev, unidade: e.target.value }))} className={inputStyle} required />
                                                        </div>
                                                        <div>
                                                            <label className={labelStyle}>Quantidade *</label>
                                                            <input name="quantidade" type="number" step="0.01" value={editingItem.quantidade || ''} onChange={(e) => setEditingItem(prev => ({ ...prev, quantidade: e.target.value }))} className={inputStyle} required />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-3 mt-5">
                                                        <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm">Cancelar</button>
                                                        <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm">Salvar Alterações</button>
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
                
                {/* Rodapé com botões de ação */}
                <div className="flex justify-end gap-4 px-6 py-4 border-t bg-light-bg-secondary border-light-border dark:bg-dark-bg-secondary dark:border-dark-border">
                    <button
                        type="button"
                        onClick={() => navigate(-1)} 
                        className="px-4 py-2 rounded-lg border  bg-light-bg-secondary houver:bg-light-bg-secondary border-light-border dark:bg-dark-bg-secondary dark:hover:bg-dark-100 dark:border-dark-border transition-colors"
                    >
                        {isEditing ? 'Voltar' : 'Cancelar'}
                    </button>
                    <button
                        type="button" 
                        disabled={isLoading}
                        onClick={handleSaveDadosGerais}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                    >
                        {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar Processo' : 'Salvar e Continuar')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaginaProcesso;

// O componente NewFornecedorForm continua o mesmo, ele já é um "sub-modal"
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