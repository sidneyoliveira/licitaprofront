import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Save, Building2, Phone, MapPin, Loader2, Link as LinkIcon, Plus } from 'lucide-react';
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
const INPUT_STYLE = "w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad] bg-white text-sm transition-all disabled:bg-gray-100 disabled:text-gray-400";
const LABEL_STYLE = "block text-[11px] font-bold text-gray-600 mb-1 uppercase tracking-wide";
const SECTION_TITLE = "text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2 border-b pb-1";

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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* HEADER */}
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                    {isEditing ? 'Editar Fornecedor' : 'Gerenciar Fornecedores'}
                                </h3>
                                {!isEditing && (
                                    <div className="flex gap-4 mt-2 text-sm">
                                        <button 
                                            onClick={() => setMode('search')}
                                            className={`pb-1 border-b-2 transition-colors ${mode === 'search' ? 'border-[#004aad] text-[#004aad] font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Buscar no Catálogo
                                        </button>
                                        <button 
                                            onClick={() => setMode('create')}
                                            className={`pb-1 border-b-2 transition-colors ${mode === 'create' ? 'border-[#004aad] text-[#004aad] font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Cadastrar Novo
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50/30">
                            
                            {/* MODO BUSCA (CATÁLOGO) */}
                            {mode === 'search' && !isEditing && (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Buscar por CNPJ ou Razão Social..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className={`${INPUT_STYLE} pl-10 h-12 text-base`}
                                            autoFocus
                                        />
                                    </div>

                                    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                                        {filteredCatalogo.length > 0 ? (
                                            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                                                {filteredCatalogo.map((f) => (
                                                    <div key={f.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                                        <div>
                                                            <p className="font-bold text-gray-800">{f.razao_social}</p>
                                                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs border border-gray-200">{f.cnpj}</span>
                                                                {f.municipio && <span>• {f.municipio}/{f.uf}</span>}
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => onLink?.(f.id)}
                                                            className="px-4 py-2 bg-white border border-[#004aad] text-[#004aad] rounded-lg text-sm font-medium hover:bg-[#004aad] hover:text-white transition-all flex items-center gap-2 shadow-sm"
                                                        >
                                                            <LinkIcon size={16} />
                                                            Vincular
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center text-gray-500">
                                                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Search size={24} className="text-gray-400" />
                                                </div>
                                                <p>Nenhum fornecedor encontrado no catálogo.</p>
                                                <button 
                                                    onClick={() => setMode('create')}
                                                    className="mt-2 text-[#004aad] hover:underline text-sm font-medium"
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
                                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                                        <h4 className={SECTION_TITLE}>
                                            <Building2 size={16} className="text-[#004aad]" />
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
                                                            className="px-3 bg-blue-50 text-[#004aad] border border-blue-100 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
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
                                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
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
                                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
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
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors"
                            >
                                Cancelar
                            </button>
                            
                            {(mode === 'create' || isEditing) && (
                                <button
                                    type="submit"
                                    form="fornecedorForm"
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-[#004aad] text-white rounded-lg text-sm font-medium hover:bg-[#003d91] transition-colors flex items-center gap-2 disabled:opacity-70"
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