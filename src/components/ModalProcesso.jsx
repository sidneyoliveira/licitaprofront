// frontend/src/components/ModalProcesso.jsx

import React, { useState, useEffect, useCallback } from 'react';
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

// --- COMPONENTE PRINCIPAL DO MODAL ---

const ModalProcesso = ({ closeModal, refreshProcessos, initialData }) => {
    const [activeTab, setActiveTab] = useState('dadosGerais');
    const [processoId, setProcessoId] = useState(initialData?.id || null);
    const { showToast } = useToast();
    const api = useAxios();

    const [formData, setFormData] = useState(
        initialData || {
            objeto: '', numero_processo: '', modalidade: '', classificacao: '',
            data_processo: getTodayDate(), orgao: '', entidade: '', situacao: 'Em Pesquisa',
            tipo_organizacao: '', vigencia_meses: '', registro_precos: false, 
            valor_referencia: '',
        }
    );

    const [itens, setItens] = useState([]);
    const [itemFormData, setItemFormData] = useState({ descricao: '', especificacao: '', unidade: '', quantidade: '' });
    const [fornecedores, setFornecedores] = useState([]);
    const [fornecedorFormData, setFornecedorFormData] = useState({ nome: '', cnpj: '', telefone: '', email: '' });

    const [entidades, setEntidades] = useState([]);
    const [orgaos, setOrgaos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchItensEFornecedores = useCallback(async (id) => {
        if (!id) return;
        try {
            const [itensRes, fornecedoresRes] = await Promise.all([
                api.get(`/itens/?processo=${id}`),
                api.get(`/fornecedores-processo/?processo=${id}`)
            ]);
            setItens(itensRes.data);
            setFornecedores(fornecedoresRes.data);
        } catch (error) {
            showToast('Erro ao carregar itens ou fornecedores.', 'error');
        }
    }, [api, showToast]);

    useEffect(() => {
        api.get('/entidades/').then(res => setEntidades(res.data));
        if (processoId) {
            fetchItensEFornecedores(processoId);
        }
    }, [processoId, api, fetchItensEFornecedores]);

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
        const newFormData = { ...formData, [name]: finalValue };
        if (name === 'entidade') newFormData.orgao = '';
        setFormData(newFormData);
    };

    const handleSaveDadosGerais = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (processoId) {
                const response = await api.put(`/processo/${processoId}/`, formData);
                setFormData(response.data);
                showToast('Dados gerais atualizados!', 'success');
            } else {
                const response = await api.post('/processo/', formData);
                setProcessoId(response.data.id);
                setFormData(response.data);
                showToast('Processo criado! Agora, adicione os itens.', 'success');
                setActiveTab('itens');
            }
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
            fetchItensEFornecedores(processoId);
        } catch (error) {
            showToast('Erro ao adicionar item.', 'error');
        }
    };
    
    const handleDeleteItem = async (itemId) => {
        try {
            await api.delete(`/itens/${itemId}/`);
            showToast('Item removido!', 'success');
            fetchItensEFornecedores(processoId);
        } catch (error) {
            showToast('Erro ao remover item.', 'error');
        }
    };

    const handleAddFornecedor = async (e) => {
        e.preventDefault();
        try {
            await api.post('/fornecedores-processo/', { ...fornecedorFormData, processo: processoId });
            showToast('Fornecedor adicionado!', 'success');
            setFornecedorFormData({ nome: '', cnpj: '', telefone: '', email: '' });
            fetchItensEFornecedores(processoId);
        } catch (error) {
            showToast('Erro ao adicionar fornecedor.', 'error');
        }
    };
    
    const handleDeleteFornecedor = async (fornecedorId) => {
        try {
            await api.delete(`/fornecedores-processo/${fornecedorId}/`);
            showToast('Fornecedor removido!', 'success');
            fetchItensEFornecedores(processoId);
        } catch (error) {
            showToast('Erro ao remover fornecedor.', 'error');
        }
    };

    const modalidades = ['Pregão Eletrônico', 'Concorrência Eletrônica', 'Dispensa Eletrônica', 'Inexigibilidade Eletrônica', 'Adesão a Registro de Preços', 'Credenciamento'];
    const classificacoes = ['Compras', 'Serviços Comuns', 'Serviços de Engenharia Comuns', 'Obras Comuns'];
    const situacoes = ['Aberto', 'Em Pesquisa', 'Aguardando Publicação', 'Publicado', 'Em Contratação', 'Adjudicado/Homologado', 'Revogado/Cancelado'];
    const organizacoes = ['Lote', 'Item'];

    const inputStyle = "w-full px-3 py-1.5 text-sm border rounded-lg bg-light-bg-primary dark:bg-dark-bg-primary";
    const labelStyle = "text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary";

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl w-full max-w-4xl flex flex-col shadow-2xl"
            >
                <header className="flex justify-between items-center p-4 border-b border-light-border dark:border-dark-border">
                    <h2 className="text-lg font-bold">
                        {processoId ? `Editar Processo: ${formData.numero_processo}` : 'Criar Novo Processo'}
                    </h2>
                    <button onClick={closeModal} className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><XMarkIcon className="w-6 h-6" /></button>
                </header>

                <div className="border-b border-light-border dark:border-dark-border">
                    <nav className="flex gap-2 px-4">
                        <TabButton label="1. Dados Gerais" isActive={activeTab === 'dadosGerais'} onClick={() => setActiveTab('dadosGerais')} />
                        <TabButton label="2. Itens" isActive={activeTab === 'itens'} onClick={() => setActiveTab('itens')} isDisabled={!processoId} />
                        <TabButton label="3. Fornecedores" isActive={activeTab === 'fornecedores'} onClick={() => setActiveTab('fornecedores')} isDisabled={!processoId} />
                    </nav>
                </div>
                
                <div className="p-5 max-h-[65vh] overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'dadosGerais' && (
                                <form onSubmit={handleSaveDadosGerais} className="space-y-5">
                                    <FormSection title="Informações Principais">
                                        <div>
                                            <label className={labelStyle}>Objeto *</label>
                                            <textarea name="objeto" value={formData.objeto} onChange={handleChange} className={`${inputStyle} mt-1`} rows="3" required />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelStyle}>Número do Processo *</label>
                                                <input name="numero_processo" value={formData.numero_processo} onChange={handleChange} className={`${inputStyle} mt-1`} required />
                                            </div>
                                            <div>
                                               <label className={labelStyle}>Data do Processo *</label>
                                               <input name="data_processo" type="date" value={formData.data_processo || ''} onChange={handleChange} className={`${inputStyle} mt-1`} required />
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
                                                    <option value="">Selecione uma entidade...</option>
                                                    {orgaos.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </FormSection>
                                    
                                    <div className="flex justify-end gap-4 pt-4">
                                        <button type="button" onClick={closeModal} className="py-2 px-4 rounded-lg text-sm font-medium">Cancelar</button>
                                        <button type="submit" disabled={isLoading} className="py-2 px-4 bg-accent-blue text-white rounded-lg text-sm font-semibold">
                                            {isLoading ? 'A Salvar...' : (processoId ? 'Atualizar Dados' : 'Salvar e Continuar')}
                                        </button>
                                    </div>
                                </form>
                            )}
                            {activeTab === 'itens' && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-base">Adicionar Novo Item</h3>
                                    <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end p-3 border rounded-lg">
                                        <input name="descricao" value={itemFormData.descricao} onChange={(e) => setItemFormData({...itemFormData, descricao: e.target.value})} placeholder="Descrição" className={inputStyle} required />
                                        <input name="especificacao" value={itemFormData.especificacao} onChange={(e) => setItemFormData({...itemFormData, especificacao: e.target.value})} placeholder="Especificação" className={inputStyle} />
                                        <input name="unidade" value={itemFormData.unidade} onChange={(e) => setItemFormData({...itemFormData, unidade: e.target.value})} placeholder="Unidade (ex: UN, CX)" className={inputStyle} required />
                                        <div className="flex gap-2">
                                            <input name="quantidade" type="number" value={itemFormData.quantidade} onChange={(e) => setItemFormData({...itemFormData, quantidade: e.target.value})} placeholder="Qtd." className={inputStyle} required />
                                            <button type="submit" className="p-2 bg-accent-green text-white rounded-lg"><PlusIcon className="w-5 h-5"/></button>
                                        </div>
                                    </form>
                                    <h3 className="font-semibold text-base pt-4">Itens Cadastrados</h3>
                                    <div className="space-y-2">
                                        {itens.map(item => (
                                            <div key={item.id} className="flex justify-between items-center p-2 border rounded-lg bg-light-bg-primary dark:bg-dark-bg-primary">
                                                <p className="text-sm">{item.quantidade} {item.unidade} - {item.descricao}</p>
                                                <button onClick={() => handleDeleteItem(item.id)} className="p-1 text-red-500 rounded-full hover:bg-red-500/10"><TrashIcon className="w-4 h-4"/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {activeTab === 'fornecedores' && (
                                 <div className="space-y-4">
                                    <h3 className="font-semibold text-base">Adicionar Novo Fornecedor</h3>
                                    <form onSubmit={handleAddFornecedor} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end p-3 border rounded-lg">
                                        <input name="nome" value={fornecedorFormData.nome} onChange={(e) => setFornecedorFormData({...fornecedorFormData, nome: e.target.value})} placeholder="Nome do Fornecedor" className={`${inputStyle} sm:col-span-2`} required />
                                        <input name="cnpj" value={fornecedorFormData.cnpj} onChange={(e) => setFornecedorFormData({...fornecedorFormData, cnpj: e.target.value})} placeholder="CNPJ" className={inputStyle} required />
                                        <input name="email" type="email" value={fornecedorFormData.email} onChange={(e) => setFornecedorFormData({...fornecedorFormData, email: e.target.value})} placeholder="Email" className={inputStyle} />
                                        <div className="flex gap-2">
                                          <input name="telefone" value={fornecedorFormData.telefone} onChange={(e) => setFornecedorFormData({...fornecedorFormData, telefone: e.target.value})} placeholder="Telefone" className={inputStyle} />
                                          <button type="submit" className="p-2 bg-accent-green text-white rounded-lg"><PlusIcon className="w-5 h-5"/></button>
                                        </div>
                                    </form>
                                    <h3 className="font-semibold text-base pt-4">Fornecedores Cadastrados</h3>
                                    <div className="space-y-2">
                                        {fornecedores.map(fornecedor => (
                                            <div key={fornecedor.id} className="flex justify-between items-center p-2 border rounded-lg bg-light-bg-primary dark:bg-dark-bg-primary">
                                                <p className="text-sm">{fornecedor.nome} ({fornecedor.cnpj})</p>
                                                <button onClick={() => handleDeleteFornecedor(fornecedor.id)} className="p-1 text-red-500 rounded-full hover:bg-red-500/10"><TrashIcon className="w-4 h-4"/></button>
                                            </div>
                                        ))}
                                    </div>
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