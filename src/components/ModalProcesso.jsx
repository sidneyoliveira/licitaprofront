// frontend/src/components/ModalProcesso.jsx

import React, { useState, useEffect, useCallback } from 'react';
import useAxios from '../hooks/useAxios';
import { useToast } from '../context/ToastContext';
import { XMarkIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid';

const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const ModalProcesso = ({ closeModal, refreshProcessos, initialData }) => {
    const [activeTab, setActiveTab] = useState('dadosGerais');
    const [processoId, setProcessoId] = useState(initialData?.id || null);
    const { showToast } = useToast();
    const api = useAxios();

    // Estado para o formulário principal
    const [formData, setFormData] = useState(
        initialData || {
            objeto: '', numero_processo: '', modalidade: '', classificacao: '',
            data_processo: getTodayDate(), orgao: '', entidade: '', situacao: 'Em Pesquisa',
            tipo_organizacao: '', vigencia_meses: '', registro_precos: false, 
            valor_referencia: '', data_publicacao: '', data_abertura: ''
        }
    );

    // Estados para as sub-abas
    const [itens, setItens] = useState([]);
    const [itemFormData, setItemFormData] = useState({ descricao: '', especificacao: '', unidade: '', quantidade: '' });
    const [fornecedores, setFornecedores] = useState([]);
    const [fornecedorFormData, setFornecedorFormData] = useState({ nome: '', cnpj: '', telefone: '', email: '' });

    const [entidades, setEntidades] = useState([]);
    const [orgaos, setOrgaos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // --- EFEITOS DE CARREGAMENTO DE DADOS ---
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

    // --- FUNÇÕES DE MANIPULAÇÃO DE DADOS ---
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

    const inputStyle = "w-full px-3 py-1.5 text-sm border rounded-lg";
    const labelStyle = "text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary";
    const tabBaseStyle = "px-4 py-3 text-sm font-semibold border-b-2 transition-colors";
    const tabActiveStyle = "border-accent-blue text-accent-blue";
    const tabInactiveStyle = "border-transparent text-light-text-secondary hover:border-gray-300 dark:hover:border-dark-border hover:text-light-text-primary";
    const tabDisabledStyle = "text-gray-400/50 dark:text-gray-500/50 cursor-not-allowed border-transparent";

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl w-full max-w-4xl flex flex-col shadow-2xl">
                <header className="flex justify-between items-center p-4 border-b border-light-border dark:border-dark-border">
                    <h2 className="text-xl font-bold">
                        {processoId ? `Editar Processo: ${formData.numero_processo}` : 'Criar Novo Processo'}
                    </h2>
                    <button onClick={closeModal} className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><XMarkIcon className="w-6 h-6" /></button>
                </header>

                <div className="border-b border-light-border dark:border-dark-border">
                    <nav className="flex gap-4 px-4">
                        <button onClick={() => setActiveTab('dadosGerais')} className={`${tabBaseStyle} ${activeTab === 'dadosGerais' ? tabActiveStyle : tabInactiveStyle}`}>1. Dados Gerais</button>
                        <button onClick={() => setActiveTab('itens')} disabled={!processoId} className={`${tabBaseStyle} ${!processoId ? tabDisabledStyle : (activeTab === 'itens' ? tabActiveStyle : tabInactiveStyle)}`}>2. Itens</button>
                        <button onClick={() => setActiveTab('fornecedores')} disabled={!processoId} className={`${tabBaseStyle} ${!processoId ? tabDisabledStyle : (activeTab === 'fornecedores' ? tabActiveStyle : tabInactiveStyle)}`}>3. Fornecedores</button>
                    </nav>
                </div>
                
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {activeTab === 'dadosGerais' && (
                        <form onSubmit={handleSaveDadosGerais} className="space-y-4">
                            {/* Formulário de Dados Gerais como definido anteriormente */}
                            <button type="submit" disabled={isLoading} className="mt-4 bg-accent-blue text-white py-2 px-4 rounded-lg text-sm font-semibold">
                                {isLoading ? 'A Salvar...' : (processoId ? 'Atualizar Dados' : 'Salvar e Continuar')}
                            </button>
                        </form>
                    )}
                    {activeTab === 'itens' && (
                        <div className="space-y-4">
                            <h3 className="font-semibold">Adicionar Novo Item</h3>
                            <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end p-3 border rounded-lg">
                                <input name="descricao" value={itemFormData.descricao} onChange={(e) => setItemFormData({...itemFormData, descricao: e.target.value})} placeholder="Descrição" className={inputStyle} required />
                                <input name="especificacao" value={itemFormData.especificacao} onChange={(e) => setItemFormData({...itemFormData, especificacao: e.target.value})} placeholder="Especificação" className={inputStyle} />
                                <input name="unidade" value={itemFormData.unidade} onChange={(e) => setItemFormData({...itemFormData, unidade: e.target.value})} placeholder="Unidade (ex: UN, CX)" className={inputStyle} required />
                                <div className="flex gap-2">
                                    <input name="quantidade" type="number" value={itemFormData.quantidade} onChange={(e) => setItemFormData({...itemFormData, quantidade: e.target.value})} placeholder="Qtd." className={inputStyle} required />
                                    <button type="submit" className="p-2 bg-accent-green text-white rounded-lg"><PlusIcon className="w-5 h-5"/></button>
                                </div>
                            </form>
                            <h3 className="font-semibold pt-4">Itens Cadastrados</h3>
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
                            <h3 className="font-semibold">Adicionar Novo Fornecedor</h3>
                            <form onSubmit={handleAddFornecedor} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end p-3 border rounded-lg">
                                <input name="nome" value={fornecedorFormData.nome} onChange={(e) => setFornecedorFormData({...fornecedorFormData, nome: e.target.value})} placeholder="Nome do Fornecedor" className={`${inputStyle} col-span-2`} required />
                                <input name="cnpj" value={fornecedorFormData.cnpj} onChange={(e) => setFornecedorFormData({...fornecedorFormData, cnpj: e.target.value})} placeholder="CNPJ" className={inputStyle} required />
                                <input name="email" type="email" value={fornecedorFormData.email} onChange={(e) => setFornecedorFormData({...fornecedorFormData, email: e.target.value})} placeholder="Email" className={inputStyle} />
                                <div className="flex gap-2">
                                  <input name="telefone" value={fornecedorFormData.telefone} onChange={(e) => setFornecedorFormData({...fornecedorFormData, telefone: e.target.value})} placeholder="Telefone" className={inputStyle} />
                                  <button type="submit" className="p-2 bg-accent-green text-white rounded-lg"><PlusIcon className="w-5 h-5"/></button>
                                </div>
                            </form>
                            <h3 className="font-semibold pt-4">Fornecedores Cadastrados</h3>
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
                </div>
            </div>
        </div>
    );
};

export default ModalProcesso;