import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Save, Building2, Phone, MapPin, Loader2, Link as LinkIcon } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

// --- HELPERS DE MÁSCARA ---
const formatCNPJ = (value) => {
    if (!value) return '';
    return value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .substring(0, 18);
};

const formatPhone = (value) => {
    if (!value) return '';
    const v = value.replace(/\D/g, '');
    if (v.length > 10) {
        return v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    }
    return v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
};

const formatCEP = (value) => {
    if (!value) return '';
    return value
        .replace(/\D/g, '')
        .replace(/^(\d{5})(\d)/, '$1-$2')
        .substring(0, 9);
};

// --- ESTILOS ---
const INPUT_STYLE = "w-full h-10 px-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue bg-white dark:bg-dark-bg-primary text-slate-900 dark:text-slate-100 text-sm transition-all disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 placeholder:text-slate-400";
const LABEL_STYLE = "block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide";
const SECTION_TITLE = "text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-1";

const FornecedorModal = ({
    isOpen,
    onClose,
    onLink,
    onSaveNew,
    onSaveEdit,
    catalogo = [],
    fornecedorSelecionado,
}) => {
    const { showToast } = useToast();
    
    // Estados de Controle
    const [mode, setMode] = useState('search'); // 'search' | 'create'
    const [isSaving, setIsSaving] = useState(false);
    const [isSearchingCNPJ, setIsSearchingCNPJ] = useState(false);
    
    // Estados de Dados
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        cnpj: '',
        razao_social: '',
        nome_fantasia: '',
        porte: '',
        telefone: '',
        email: '',
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        complemento: '',
        uf: '',
        municipio: '',
    });

    const isEditing = Boolean(fornecedorSelecionado);

    // --- EFEITOS ---
    useEffect(() => {
        if (isOpen) {
            if (fornecedorSelecionado) {
                setFormData(fornecedorSelecionado);
                setMode('create');
            } else {
                setMode('search');
                setFormData({
                    cnpj: '', razao_social: '', nome_fantasia: '', porte: '',
                    telefone: '', email: '', cep: '', logradouro: '',
                    numero: '', bairro: '', complemento: '', uf: '', municipio: ''
                });
            }
            setSearchTerm('');
        }
    }, [isOpen, fornecedorSelecionado]);

    // --- HANDLERS ---

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        // Aplica máscaras
        if (name === 'cnpj') formattedValue = formatCNPJ(value);
        if (name === 'telefone') formattedValue = formatPhone(value);
        if (name === 'cep') formattedValue = formatCEP(value);

        setFormData(prev => ({ ...prev, [name]: formattedValue }));
    };

    const buscarCNPJ = async () => {
        if (!formData.cnpj || formData.cnpj.length < 14) {
            return showToast('Digite um CNPJ válido.', 'warning');
        }
        
        setIsSearchingCNPJ(true);
        try {
            const cnpjLimpo = formData.cnpj.replace(/[^\d]/g, '');
            const { data } = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
            
            // CORREÇÃO DA FORMATAÇÃO DO TELEFONE
            // Concatena DDD e Telefone (tratando nulos) e formata o resultado limpo
            const ddd = data.ddd_telefone_1 || "";
            const num = data.telefone_1 || "";
            const telefoneRaw = `${ddd}${num}`; 

            setFormData(prev => ({
                ...prev,
                razao_social: data.razao_social || '',
                nome_fantasia: data.nome_fantasia || '',
                porte: data.descricao_porte || data.porte || '',
                
                // Usa a função de máscara para formatar o número combinado
                telefone: formatPhone(telefoneRaw),
                
                email: data.email || '',
                cep: formatCEP(data.cep || ''),
                logradouro: data.logradouro || '',
                numero: data.numero || '',
                bairro: data.bairro || '',
                complemento: data.complemento || '',
                uf: data.uf || '',
                municipio: data.municipio || '',
            }));
            showToast('Dados carregados com sucesso!', 'success');
        } catch (e) {
            console.error(e);
            showToast('Erro ao buscar CNPJ. Verifique se está correto.', 'error');
        } finally {
            setIsSearchingCNPJ(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.cnpj || !formData.razao_social) {
            showToast("CNPJ e Razão Social são obrigatórios.", "warning");
            return;
        }

        setIsSaving(true);
        try {
            if (isEditing) {
                await onSaveEdit?.(formData);
            } else {
                await onSaveNew?.(formData);
            }
            onClose?.();
        } catch (error) {
            console.error(error);
            showToast("Erro ao salvar fornecedor.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    // Filtro do Catálogo
    const filteredCatalogo = useMemo(() => {
        if (!catalogo) return [];
        const term = searchTerm.toLowerCase();
        return catalogo.filter(f => 
            (f.razao_social && f.razao_social.toLowerCase().includes(term)) || 
            (f.cnpj && f.cnpj.includes(term))
        );
    }, [catalogo, searchTerm]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-white dark:bg-dark-bg-secondary w-full max-w-4xl max-h-[90vh] rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg flex flex-col overflow-hidden"
                    >
                        {/* HEADER */}
                        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-dark-bg-primary flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                    {isEditing ? 'Editar Fornecedor' : 'Gerenciar Fornecedores'}
                                </h3>
                                {!isEditing && (
                                    <div className="flex gap-4 mt-2 text-sm">
                                        <button 
                                            onClick={() => setMode('search')}
                                            className={`pb-1 border-b-2 transition-colors ${mode === 'search' ? 'border-accent-blue text-accent-blue font-bold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                        >
                                            Buscar no Catálogo
                                        </button>
                                        <button 
                                            onClick={() => setMode('create')}
                                            className={`pb-1 border-b-2 transition-colors ${mode === 'create' ? 'border-accent-blue text-accent-blue font-bold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                        >
                                            Cadastrar Novo
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                            
                            {/* MODO BUSCA (CATÁLOGO) */}
                            {mode === 'search' && !isEditing && (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Buscar por CNPJ ou Razão Social..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className={`${INPUT_STYLE} pl-10 h-12 text-base`}
                                            autoFocus
                                        />
                                    </div>

                                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-dark-bg-secondary overflow-hidden">
                                        {filteredCatalogo.length > 0 ? (
                                            <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-[400px] overflow-y-auto">
                                                {filteredCatalogo.map((f) => (
                                                    <div key={f.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                        <div>
                                                            <p className="font-bold text-slate-800 dark:text-white">{f.razao_social}</p>
                                                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-200 dark:border-slate-700">{f.cnpj}</span>
                                                                {f.municipio && <span>• {f.municipio}/{f.uf}</span>}
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => onLink?.(f.id)}
                                                            className="px-4 py-2 bg-white dark:bg-dark-bg-primary border border-accent-blue text-accent-blue rounded-lg text-sm font-medium hover:bg-accent-blue hover:text-white transition-all flex items-center gap-2"
                                                        >
                                                            <LinkIcon size={16} />
                                                            Vincular
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                                <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Search size={24} className="text-slate-400" />
                                                </div>
                                                <p>Nenhum fornecedor encontrado no catálogo.</p>
                                                <button 
                                                    onClick={() => setMode('create')}
                                                    className="mt-2 text-accent-blue hover:underline text-sm font-medium"
                                                >
                                                    Cadastrar novo fornecedor
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* MODO FORMULÁRIO (CRIAR/EDITAR) */}
                            {(mode === 'create' || isEditing) && (
                                <form id="fornecedorForm" onSubmit={handleSubmit} className="space-y-6">
                                    
                                    {/* DADOS DA EMPRESA */}
                                    <div className="bg-white dark:bg-dark-bg-primary p-5 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <h4 className={SECTION_TITLE}>
                                            <Building2 size={16} className="text-accent-blue" />
                                            Dados da Empresa
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                            <div className="md:col-span-4">
                                                <label className={LABEL_STYLE}>CNPJ *</label>
                                                <div className="relative flex gap-2">
                                                    <input
                                                        name="cnpj"
                                                        value={formData.cnpj}
                                                        onChange={handleInputChange}
                                                        className={INPUT_STYLE}
                                                        placeholder="00.000.000/0000-00"
                                                        required
                                                        maxLength={18}
                                                    />
                                                    {!isEditing && (
                                                        <button 
                                                            type="button" 
                                                            onClick={buscarCNPJ}
                                                            disabled={isSearchingCNPJ}
                                                            className="px-3 bg-accent-blue/10 text-accent-blue border border-accent-blue/20 hover:bg-accent-blue/20 rounded-lg transition-colors disabled:opacity-50"
                                                            title="Buscar dados na Receita"
                                                        >
                                                            {isSearchingCNPJ ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="md:col-span-8">
                                                <label className={LABEL_STYLE}>Razão Social *</label>
                                                <input
                                                    name="razao_social"
                                                    value={formData.razao_social}
                                                    onChange={handleInputChange}
                                                    className={INPUT_STYLE}
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-6">
                                                <label className={LABEL_STYLE}>Nome Fantasia</label>
                                                <input
                                                    name="nome_fantasia"
                                                    value={formData.nome_fantasia}
                                                    onChange={handleInputChange}
                                                    className={INPUT_STYLE}
                                                />
                                            </div>
                                            <div className="md:col-span-6">
                                                <label className={LABEL_STYLE}>Porte</label>
                                                <input
                                                    name="porte"
                                                    value={formData.porte}
                                                    onChange={handleInputChange}
                                                    className={INPUT_STYLE}
                                                    placeholder="ME, EPP, DEMAIS..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* CONTATO */}
                                    <div className="bg-white dark:bg-dark-bg-primary p-5 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <h4 className={SECTION_TITLE}>
                                            <Phone size={16} className="text-green-600" />
                                            Contato
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={LABEL_STYLE}>Telefone</label>
                                                <input
                                                    name="telefone"
                                                    value={formData.telefone}
                                                    onChange={handleInputChange}
                                                    className={INPUT_STYLE}
                                                    placeholder="(00) 00000-0000"
                                                    maxLength={15}
                                                />
                                            </div>
                                            <div>
                                                <label className={LABEL_STYLE}>E-mail</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className={INPUT_STYLE}
                                                    placeholder="contato@empresa.com"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* ENDEREÇO */}
                                    <div className="bg-white dark:bg-dark-bg-primary p-5 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <h4 className={SECTION_TITLE}>
                                            <MapPin size={16} className="text-red-500" />
                                            Endereço
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                            <div className="md:col-span-3">
                                                <label className={LABEL_STYLE}>CEP</label>
                                                <input
                                                    name="cep"
                                                    value={formData.cep}
                                                    onChange={handleInputChange}
                                                    className={INPUT_STYLE}
                                                    placeholder="00000-000"
                                                    maxLength={9}
                                                />
                                            </div>
                                            <div className="md:col-span-7">
                                                <label className={LABEL_STYLE}>Logradouro</label>
                                                <input
                                                    name="logradouro"
                                                    value={formData.logradouro}
                                                    onChange={handleInputChange}
                                                    className={INPUT_STYLE}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className={LABEL_STYLE}>Número</label>
                                                <input
                                                    name="numero"
                                                    value={formData.numero}
                                                    onChange={handleInputChange}
                                                    className={INPUT_STYLE}
                                                />
                                            </div>
                                            <div className="md:col-span-4">
                                                <label className={LABEL_STYLE}>Bairro</label>
                                                <input
                                                    name="bairro"
                                                    value={formData.bairro}
                                                    onChange={handleInputChange}
                                                    className={INPUT_STYLE}
                                                />
                                            </div>
                                            <div className="md:col-span-4">
                                                <label className={LABEL_STYLE}>Município</label>
                                                <input
                                                    name="municipio"
                                                    value={formData.municipio}
                                                    onChange={handleInputChange}
                                                    className={INPUT_STYLE}
                                                />
                                            </div>
                                            <div className="md:col-span-1">
                                                <label className={LABEL_STYLE}>UF</label>
                                                <input
                                                    name="uf"
                                                    value={formData.uf}
                                                    onChange={handleInputChange}
                                                    className={INPUT_STYLE}
                                                    maxLength={2}
                                                />
                                            </div>
                                            <div className="md:col-span-3">
                                                <label className={LABEL_STYLE}>Complemento</label>
                                                <input
                                                    name="complemento"
                                                    value={formData.complemento}
                                                    onChange={handleInputChange}
                                                    className={INPUT_STYLE}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* FOOTER */}
                        <div className="px-4 sm:px-6 py-4 bg-slate-50 dark:bg-dark-bg-primary border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            
                            {(mode === 'create' || isEditing) && (
                                <button
                                    type="submit"
                                    form="fornecedorForm"
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-accent-blue-hover transition-colors flex items-center gap-2 disabled:opacity-70"
                                >
                                    {isSaving ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    {isEditing ? 'Atualizar Fornecedor' : 'Salvar e Vincular'}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default FornecedorModal;