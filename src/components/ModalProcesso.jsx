// frontend/src/components/ModalProcesso.jsx

import { useState, useEffect, useCallback, useRef } from 'react';
import useAxios from '../hooks/useAxios';
import { useToast } from '../context/ToastContext';
import { XMarkIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

// --- COMPONENTES INTERNOS PARA ORGANIZAÇÃO ---

const TabButton = ({ label, isActive, onClick, isDisabled }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors relative ${
            isActive
                ? 'text-accent-blue'
                : isDisabled
                ? 'text-gray-400/50 dark:text-gray-500/50 cursor-not-allowed'
                : 'text-light-text-secondary hover:text-light-text-primary'
        }`}
    >
        {label}
        {isActive && (
            <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-accent-blue"
            />
        )}
    </button>
);

const FormSection = ({ title, children }) => (
    <div className="space-y-4">
        <h3 className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary border-b border-light-border dark:border-dark-border pb-2 mb-4">{title}</h3>
        {children}
    </div>
);

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

const ItemList = ({ items, onDelete }) => {
    const [expandedItemId, setExpandedItemId] = useState(null);
    const toggleExpansion = (itemId) => {
        setExpandedItemId(prevId => (prevId === itemId ? null : itemId));
    };

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs font-bold text-light-text-secondary dark:text-dark-text-secondary px-2 py-1">
                <div className="col-span-1">#</div>
                <div className="col-span-6">Descrição</div>
                <div className="col-span-2 text-center">Unidade</div>
                <div className="col-span-2 text-center">Quantidade</div>
                <div className="col-span-1 text-right">Ações</div>
            </div>
            {items.map((item, index) => (
                <div key={item.id}>
                    <div className="grid grid-cols-12 gap-2 items-center p-2 border rounded-lg bg-light-bg-primary dark:bg-dark-bg-primary">
                        <div className="col-span-1 text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">{index + 1}</div>
                        <div className="col-span-6 text-sm font-medium cursor-pointer hover:text-accent-blue" onClick={() => toggleExpansion(item.id)}>
                            {item.descricao}
                        </div>
                        <div className="col-span-2 text-sm text-center">{item.unidade}</div>
                        <div className="col-span-2 text-sm text-center">{parseFloat(item.quantidade).toFixed(2)}</div>
                        <div className="col-span-1 text-right">
                             <button type="button" onClick={() => onDelete(item.id)} className="p-1 text-red-500 rounded-full hover:bg-red-500/10">
                                 <TrashIcon className="w-4 h-4"/>
                             </button>
                        </div>
                    </div>
                    <AnimatePresence>
                        {expandedItemId === item.id && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="px-3 py-2 ml-8 border-l-2 border-accent-blue/30 text-xs text-light-text-secondary dark:text-dark-text-secondary"
                            >
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

const ModalNovoFornecedor = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({ razao_social: '', cnpj: '', email: '', telefone: '' });
    const api = useAxios();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const inputStyle = "w-full px-3 py-1.5 text-sm border rounded-lg";

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post('/fornecedores/', formData);
            showToast('Novo fornecedor cadastrado no catálogo!', 'success');
            onSave(response.data);
            onClose();
        } catch (error) {
            showToast('Erro ao cadastrar fornecedor.', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-light-bg-secondary dark:bg-dark-bg-secondary z-10 p-5 flex flex-col"
        >
            <h3 className="font-semibold text-base mb-4">Cadastrar Novo Fornecedor</h3>
            <form onSubmit={handleSubmit} className="space-y-4 flex-grow flex flex-col">
                <div className="space-y-4">
                    <input name="razao_social" value={formData.razao_social} onChange={handleChange} placeholder="Razão Social *" className={inputStyle} required />
                    <input name="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="CNPJ *" className={inputStyle} required />
                    <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className={inputStyle} />
                    <input name="telefone" value={formData.telefone} onChange={handleChange} placeholder="Telefone" className={inputStyle} />
                </div>
                <div className="flex justify-end gap-4 mt-auto pt-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg text-sm">Voltar</button>
                    <button type="submit" disabled={isLoading} className="py-2 px-4 bg-accent-blue text-white rounded-lg text-sm">
                        {isLoading ? 'Salvando...' : 'Salvar Fornecedor'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

const SearchableSupplierDropdown = ({ onSelect, onAddNew }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const api = useAxios();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchTerm.length < 2) {
            setResults([]);
            return;
        }
        setIsLoading(true);
        const timer = setTimeout(() => {
            api.get(`/fornecedores/?search=${searchTerm}`)
                .then(res => setResults(res.data))
                .catch(() => setResults([]))
                .finally(() => setIsLoading(false));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, api]);

    const handleSelect = (fornecedor) => {
        onSelect(fornecedor.id);
        setSearchTerm(`${fornecedor.cnpj} / ${fornecedor.razao_social}`);
        setIsOpen(false);
    };

    return (
        <div className="flex gap-2 items-end" ref={dropdownRef}>
            <div className="flex-grow relative">
                <label className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">Buscar Fornecedor (CNPJ ou Razão Social)</label>
                <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Comece a digitar para pesquisar..."
                    className="w-full px-3 py-1.5 text-sm border rounded-lg mt-1"
                />
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-light-bg-secondary dark:bg-dark-bg-secondary border rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto"
                    >
                        {isLoading && <p className="p-2 text-xs text-center">A pesquisar...</p>}
                        {!isLoading && results.length === 0 && searchTerm.length >= 2 && <p className="p-2 text-xs text-center">Nenhum fornecedor encontrado.</p>}
                        {results.map(fornecedor => (
                            <div 
                                key={fornecedor.id}
                                onClick={() => handleSelect(fornecedor)}
                                className="px-3 py-2 text-sm cursor-pointer hover:bg-light-border dark:hover:bg-dark-border"
                            >
                                <p className="font-semibold">{fornecedor.razao_social}</p>
                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{fornecedor.cnpj}</p>
                            </div>
                        ))}
                    </motion.div>
                )}
            </div>
            <button type="button" onClick={onAddNew} className="px-4 py-2 text-sm bg-accent-blue text-white rounded-lg h-full flex items-center justify-center flex-shrink-0">
                Novo Fornecedor
            </button>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL DO MODAL ---

const ModalProcesso = ({ closeModal, refreshProcessos, initialData }) => {
    // --- CORREÇÃO AQUI ---
    // A variável 'isEditing' foi movida para o topo do componente para que
    // todas as funções e o JSX dentro do ModalProcesso a possam aceder.
    const isEditing = initialData && initialData.id;
    
    const [activeTab, setActiveTab] = useState('dadosGerais');
    const [processoId, setProcessoId] = useState(initialData?.id || null);
    const { showToast } = useToast();
    const api = useAxios();

    const [formData, setFormData] = useState(
        initialData || {
            objeto: '', numero_processo: '', data_processo: getTodayDate(), modalidade: '', 
            classificacao: '', tipo_organizacao: '', registro_precos: false, orgao: '', 
            entidade: '', valor_referencia: '', numero_certame: '', data_abertura: '',
        }
    );
    
    const [itens, setItens] = useState([]);
    const [itemFormData, setItemFormData] = useState({ descricao: '', especificacao: '', unidade: '', quantidade: '' });
    
    const [fornecedoresDoProcesso, setFornecedoresDoProcesso] = useState([]);
    const [, setCatalogoFornecedores] = useState([]);
    const [fornecedorSelecionado, setFornecedorSelecionado] = useState('');
    const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);
    
    const [entidades, setEntidades] = useState([]);
    const [orgaos, setOrgaos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isEditing && initialData) {
            const formattedDataAbertura = initialData.data_abertura ? formatDateTimeForInput(initialData.data_abertura) : '';
            
            if (initialData.orgao) {
                api.get(`/orgaos/${initialData.orgao}/`).then(response => {
                    const orgaoData = response.data;
                    setFormData({
                        ...initialData,
                        data_abertura: formattedDataAbertura,
                        entidade: orgaoData.entidade,
                    });
                }).catch(() => {
                    showToast("Não foi possível carregar os detalhes da entidade/órgão.", "error");
                    setFormData({ ...initialData, data_abertura: formattedDataAbertura });
                });
            } else {
                setFormData({ ...initialData, data_abertura: formattedDataAbertura });
            }
        }
    }, [isEditing, initialData, api, showToast]);

    const fetchDadosDoProcesso = useCallback(async (id) => {
        if (!id) return;
        try {
            const response = await api.get(`/processos/${id}/`);
            setItens(response.data.itens);
            setFornecedoresDoProcesso(response.data.fornecedores_participantes);
        } catch (error) {
            showToast('Erro ao carregar itens ou fornecedores.', 'error');
        }
    }, [api, showToast]);
    
    const fetchCatalogoFornecedores = useCallback(async () => {
        try {
            const response = await api.get('/fornecedores/');
            setCatalogoFornecedores(response.data);
        } catch (error) {
            showToast('Erro ao carregar catálogo de fornecedores.', 'error');
        }
    }, [api, showToast]);

    useEffect(() => {
        api.get('/entidades/').then(res => setEntidades(res.data));
        fetchCatalogoFornecedores();
        if (processoId) {
            fetchDadosDoProcesso(processoId);
        }
    }, [processoId, api, fetchDadosDoProcesso, fetchCatalogoFornecedores]);

    useEffect(() => {
        if (formData.entidade) {
            api.get(`/orgaos/?entidade=${formData.entidade}`).then(res => setOrgaos(res.data));
        } else {
            setOrgaos([]);
        }
    }, [formData.entidade, api]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = name === 'registro_precos' ? (value === 'true') : (type === 'checkbox' ? checked : value);
        
        setFormData(prev => {
            const newFormData = { ...prev, [name]: finalValue };
            if (name === 'entidade' && prev.entidade !== value) {
                newFormData.orgao = '';
            }
            return newFormData;
        });
    };

    const handleSaveDadosGerais = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let response;
            if (isEditing) {
                response = await api.put(`/processos/${processoId}/`, formData);
                showToast('Dados gerais atualizados!', 'success');
            } else {
                response = await api.post('/processos/', formData);
                setProcessoId(response.data.id);
                showToast('Processo criado! Agora, adicione os itens.', 'success');
                setActiveTab('itens');
            }
            const responseData = response.data;
            setFormData(prev => ({
                ...prev,
                ...responseData,
                entidade: prev.entidade,
                data_abertura: formatDateTimeForInput(responseData.data_abertura),
            }));
            refreshProcessos();
        } catch (error) {
            showToast('Erro ao salvar dados gerais.', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            await api.post('/itens/', { ...itemFormData, processo: processoId });
            showToast('Item adicionado!', 'success');
            setItemFormData({ descricao: '', especificacao: '', unidade: '', quantidade: '' });
            fetchDadosDoProcesso(processoId);
        } catch (error) {
            showToast('Erro ao adicionar item.', 'error');
        }
    };
    
    const handleDeleteItem = async (itemId) => {
        try {
            await api.delete(`/itens/${itemId}/`);
            showToast('Item removido!', 'success');
            fetchDadosDoProcesso(processoId);
        } catch (error) {
            showToast('Erro ao remover item.', 'error');
        }
    };

    const handleAddFornecedor = async () => {
        if (!fornecedorSelecionado) return showToast('Selecione um fornecedor da lista.', 'error');
        try {
            await api.post(`/processos/${processoId}/adicionar_fornecedor/`, { fornecedor_id: fornecedorSelecionado });
            showToast('Fornecedor adicionado!', 'success');
            setFornecedorSelecionado('');
            fetchDadosDoProcesso(processoId);
        } catch (error) {
            showToast('Erro ao adicionar fornecedor.', 'error');
        }
    };

    const handleRemoveFornecedor = async (fornecedorId) => {
        try {
            await api.post(`/processos/${processoId}/remover_fornecedor/`, { fornecedor_id: fornecedorId });
            showToast('Fornecedor removido!', 'success');
            fetchDadosDoProcesso(processoId);
        } catch (error) {
            showToast('Erro ao remover fornecedor.', 'error');
        }
    };
    
    const handleNewSupplierSaved = (newSupplier) => {
        fetchCatalogoFornecedores();
        setFornecedorSelecionado(newSupplier.id);
    };

    const modalidades = ['Pregão Eletrônico', 'Concorrência Eletrônica', 'Dispensa Eletrônica', 'Inexigibilidade Eletrônica', 'Adesão a Registro de Preços', 'Credenciamento'];
    const classificacoes = ['Compras', 'Serviços Comuns', 'Serviços de Engenharia Comuns', 'Obras Comuns'];
    const organizacoes = ['Lote', 'Item'];
    // const situacoes = ['Aberto', 'Em Pesquisa', 'Aguardando Publicação', 'Publicado', 'Em Contratação', 'Adjudicado/Homologado', 'Revogado/Cancelado'];

    const inputStyle = "w-full px-3 py-1.5 text-sm border rounded-lg bg-light-bg-primary dark:bg-dark-bg-primary";
    const labelStyle = "text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary";

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl w-full max-w-4xl flex flex-col shadow-2xl h-[90vh]"
            >
                <header className="flex-shrink-0 flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-bold">{isEditing ? `Editar Processo: ${initialData?.numero_processo}` : 'Criar Novo Processo'}</h2>
                    <button onClick={closeModal} className="p-1 rounded-full"><XMarkIcon className="w-6 h-6" /></button>
                </header>
                <div className="flex-shrink-0 border-b">
                    <nav className="flex gap-2 px-4">
                        <TabButton label="1. Dados Gerais" isActive={activeTab === 'dadosGerais'} onClick={() => setActiveTab('dadosGerais')} />
                        <TabButton label="2. Itens" isActive={activeTab === 'itens'} onClick={() => setActiveTab('itens')} isDisabled={!processoId} />
                        <TabButton label="3. Fornecedores" isActive={activeTab === 'fornecedores'} onClick={() => setActiveTab('fornecedores')} isDisabled={!processoId} />
                    </nav>
                </div>
                <div className="p-5 flex-grow overflow-y-auto relative">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                            {activeTab === 'dadosGerais' && (
                                <form onSubmit={handleSaveDadosGerais} className="space-y-5">
                                    <FormSection title="Informações Principais">
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="md:col-span-2">
                                                <label className={labelStyle}>Objeto *</label>
                                                <textarea name="objeto" value={formData.objeto} onChange={handleChange} className={`${inputStyle} mt-1 h-[113px]`} required />
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className={labelStyle}>Número do Processo *</label>
                                                    <input name="numero_processo" value={formData.numero_processo} onChange={handleChange} className={`${inputStyle} mt-1`} required />
                                                </div>
                                                <div>
                                                   <label className={labelStyle}>Data do Processo *</label>
                                                   <input name="data_processo" type="date" value={formData.data_processo || ''} onChange={handleChange} className={`${inputStyle} mt-1`} required />
                                                </div>
                                            </div>
                                        </div>
                                    </FormSection>
                                    <FormSection title="Detalhes da Licitação">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelStyle}>Modalidade *</label>
                                                <select name="modalidade" value={formData.modalidade} onChange={handleChange} className={`${inputStyle} mt-1`} required>
                                                    <option value="">Selecione...</option>
                                                    {modalidades.map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelStyle}>Classificação *</label>
                                                <select name="classificacao" value={formData.classificacao} onChange={handleChange} className={`${inputStyle} mt-1`} required>
                                                    <option value="">Selecione...</option>
                                                    {classificacoes.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                         <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelStyle}>Entidade *</label>
                                                <select name="entidade" value={formData.entidade} onChange={handleChange} className={`${inputStyle} mt-1`} required>
                                                    <option value="">Selecione...</option>
                                                    {entidades.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelStyle}>Órgão *</label>
                                                <select name="orgao" value={formData.orgao} onChange={handleChange} className={`${inputStyle} mt-1`} required disabled={!formData.entidade}>
                                                    <option value="">{formData.entidade ? 'Selecione...' : 'Selecione uma entidade primeiro'}</option>
                                                    {orgaos.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </FormSection>
                                    <FormSection title="Configurações Adicionais">
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div>
                                                <label className={labelStyle}>Tipo de Organização *</label>
                                                <select name="tipo_organizacao" value={formData.tipo_organizacao} onChange={handleChange} className={`${inputStyle} mt-1`} required>
                                                    <option value="">Selecione...</option>
                                                    {organizacoes.map(o => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelStyle}>Registro de Preços *</label>
                                                <select name="registro_precos" value={formData.registro_precos} onChange={handleChange} className={`${inputStyle} mt-1`} required>
                                                    <option value={false}>Não</option>
                                                    <option value={true}>Sim</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelStyle}>Valor de Referência</label>
                                                <input name="valor_referencia" type="number" step="0.01" value={formData.valor_referencia || ''} onChange={handleChange} className={`${inputStyle} mt-1`} />
                                            </div>
                                        </div>
                                    </FormSection>
                                    <FormSection title="Publicação (Opcional)">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelStyle}>Número do Certame</label>
                                                <input name="numero_certame" value={formData.numero_certame || ''} onChange={handleChange} className={`${inputStyle} mt-1`} />
                                            </div>
                                            <div>
                                                <label className={labelStyle}>Abertura da Contratação</label>
                                                <input name="data_abertura" type="datetime-local" value={formData.data_abertura || ''} onChange={handleChange} className={`${inputStyle} mt-1`} />
                                            </div>
                                        </div>
                                    </FormSection>
                                    <div className="flex justify-end gap-4 pt-4">
                                        <button type="button" onClick={closeModal}>Cancelar</button>
                                        <button type="submit" disabled={isLoading}>
                                            {isLoading ? 'A Salvar...' : (isEditing ? 'Atualizar Dados' : 'Salvar e Continuar')}
                                        </button>
                                    </div>
                                </form>
                            )}
                            {activeTab === 'itens' && (
                                <div className="space-y-4">
                                    <FormSection title="Adicionar Novo Item">
                                        <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr_1fr_auto] gap-3 items-end">
                                            <div>
                                                <label className={labelStyle}>Descrição *</label>
                                                <input name="descricao" value={itemFormData.descricao} onChange={(e) => setItemFormData({...itemFormData, descricao: e.target.value})} className={inputStyle} required />
                                            </div>
                                            <div>
                                                <label className={labelStyle}>Especificação</label>
                                                <input name="especificacao" value={itemFormData.especificacao} onChange={(e) => setItemFormData({...itemFormData, especificacao: e.target.value})} className={inputStyle} />
                                            </div>
                                            <div>
                                                <label className={labelStyle}>Unidade *</label>
                                                <input name="unidade" value={itemFormData.unidade} onChange={(e) => setItemFormData({...itemFormData, unidade: e.target.value})} className={inputStyle} required />
                                            </div>
                                            <div>
                                                <label className={labelStyle}>Quantidade *</label>
                                                <input name="quantidade" type="number" step="0.01" value={itemFormData.quantidade} onChange={(e) => setItemFormData({...itemFormData, quantidade: e.target.value})} className={inputStyle} required />
                                            </div>
                                            <button type="submit" className="p-2 bg-accent-green text-white rounded-lg h-full flex items-center justify-center"><PlusIcon className="w-5 h-5"/></button>
                                        </form>
                                    </FormSection>
                                    <FormSection title="Itens Cadastrados">
                                        <ItemList items={itens} onDelete={handleDeleteItem} />
                                    </FormSection>
                                </div>
                            )}
                            {activeTab === 'fornecedores' && (
                                 <div className="space-y-4 relative">
                                    <FormSection title="Adicionar Fornecedor ao Processo">
                                        <SearchableSupplierDropdown 
                                            onSelect={(id) => setFornecedorSelecionado(id)}
                                            onAddNew={() => setIsNewSupplierModalOpen(true)}
                                        />
                                        <div className="flex justify-end mt-2">
                                            <button 
                                                type="button" 
                                                onClick={handleAddFornecedor} 
                                                className="px-4 py-2 text-sm bg-accent-green text-white rounded-lg flex items-center gap-2"
                                            >
                                                <PlusIcon className="w-5 h-5"/> Vincular Fornecedor Selecionado
                                            </button>
                                        </div>
                                    </FormSection>
                                    <FormSection title="Fornecedores Vinculados">
                                        {fornecedoresDoProcesso.map(f => (
                                            <div key={f.id} className="flex justify-between items-center p-2 border rounded-lg">
                                                <div>
                                                    <p className="font-semibold text-sm">{f.razao_social}</p>
                                                    <p className="text-xs text-light-text-secondary">{f.cnpj}</p>
                                                </div>
                                                <button onClick={() => handleRemoveFornecedor(f.id)}><TrashIcon className="w-4 h-4 text-red-500"/></button>
                                            </div>
                                        ))}
                                    </FormSection>
                                    {isNewSupplierModalOpen && (
                                        <ModalNovoFornecedor 
                                            onClose={() => setIsNewSupplierModalOpen(false)} 
                                            onSave={handleNewSupplierSaved} 
                                        />
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default ModalProcesso;