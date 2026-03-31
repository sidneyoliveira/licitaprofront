import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import useAxios from '../hooks/useAxios';

// --- ESTILOS PADRONIZADOS ---
const INPUT_STYLE = "w-full h-10 px-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue bg-white dark:bg-dark-bg-primary text-slate-900 dark:text-slate-100 text-sm transition-all disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 placeholder:text-slate-400";
const LABEL_STYLE = "block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide";
const SECTION_STYLE = "p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-4";

const ItemModal = ({ isOpen, onClose, onItemSaved, processo, itemParaEditar, proximaOrdem }) => {
    const { showToast } = useToast();
    const api = useAxios();

    // --- ESTADOS ---
    const [sysOptions, setSysOptions] = useState({
        naturezas_despesa: [],
        situacoes_item: [],
        tipos_beneficio: [],
        categorias_item: [],
        mapa_modalidade_categoria_item: {}
    });
    const [fornecedores, setFornecedores] = useState([]);
    
    const [isSaving, setIsSaving] = useState(false);

    // Estado do Formulário
    const [formData, setFormData] = useState({
        processo: '',
        fornecedor: '',
        numero_item: '',
        descricao: '',
        especificacao: '',
        unidade: '',
        quantidade: '',
        valor_estimado: '',
        natureza_despesa: '',
        situacao: 'em_andamento',
        tipo_beneficio: 'nao_se_aplica',
        categoria: 'material'
    });

    // --- CARREGAMENTO DE DADOS ---
    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                try {
                    const resConstantes = await api.get("/constantes/sistema/");
                    setSysOptions(prev => ({ ...prev, ...resConstantes.data }));

                    if (processo?.id) {
                        const resFornecedores = await api.get(`/processos/${processo.id}/fornecedores/`);
                        setFornecedores(resFornecedores.data);
                    }
                } catch (error) {
                    console.error("Erro ao carregar dados:", error);
                    showToast("Erro ao carregar opções do sistema.", "error");
                } finally {
                }
            };
            loadData();
        }
    }, [isOpen, processo, api, showToast]);

    // --- INICIALIZAÇÃO DO FORMULÁRIO ---
    useEffect(() => {
        if (isOpen) {
            if (itemParaEditar) {
                // MODO EDIÇÃO
                setFormData({
                    processo: itemParaEditar.processo || processo?.id || '',
                    fornecedor: itemParaEditar.fornecedor || '',
                    numero_item: itemParaEditar.numero_item || itemParaEditar.ordem || '', 
                    descricao: itemParaEditar.descricao || '',
                    especificacao: itemParaEditar.especificacao || '',
                    unidade: itemParaEditar.unidade || '',
                    quantidade: itemParaEditar.quantidade || '',
                    valor_estimado: itemParaEditar.valor_estimado || '',
                    
                    // CORREÇÃO CRÍTICA: O Backend devolve 'natureza', o Front usa 'natureza_despesa'
                    natureza_despesa: itemParaEditar.natureza || itemParaEditar.natureza_despesa || '',
                    
                    situacao: itemParaEditar.situacao_item || itemParaEditar.situacao || 'em_andamento',
                    tipo_beneficio: itemParaEditar.tipo_beneficio || 4,
                    
                    // CORREÇÃO CRÍTICA: O Backend devolve 'categoria_item', o Front usa 'categoria'
                    categoria: itemParaEditar.categoria_item || itemParaEditar.categoria || 1
                });
            } else {
                // MODO NOVO
                setFormData({
                    processo: processo?.id || '',
                    fornecedor: '',
                    numero_item: proximaOrdem || 1, 
                    descricao: '',
                    especificacao: '',
                    unidade: '',
                    quantidade: '',
                    valor_estimado: '',
                    natureza_despesa: '',
                    situacao: 1,
                    tipo_beneficio: 4,
                    categoria: 1
                });
            }
        }
    }, [isOpen, itemParaEditar, processo, proximaOrdem]);

    // Filtra categorias de item com base na modalidade do processo
    const categoriasFiltradas = useMemo(() => {
        const modalidadeId = processo?.modalidade;
        const mapa = sysOptions.mapa_modalidade_categoria_item;
        if (!modalidadeId || !mapa || !mapa[modalidadeId]) {
            return sysOptions.categorias_item || [];
        }
        const idsPermitidos = mapa[modalidadeId] || [];
        return (sysOptions.categorias_item || []).filter(c => idsPermitidos.includes(c.id));
    }, [processo?.modalidade, sysOptions]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const processoId = processo?.id || formData.processo;
        if (!processoId) {
            showToast("Erro Crítico: ID do Processo não identificado.", "error");
            return;
        }

        if (!formData.descricao || !formData.quantidade || !formData.valor_estimado) {
            showToast("Preencha Descrição, Quantidade e Valor.", "warning");
            return;
        }

        setIsSaving(true);
        try {
            const ordemFinal = formData.numero_item ? parseInt(formData.numero_item) : (proximaOrdem || 1);

            // Payload mapeado corretamente para o Backend
            const payload = {
                ...formData,
                processo: processoId,
                quantidade: parseFloat(formData.quantidade),
                valor_estimado: parseFloat(formData.valor_estimado),
                ordem: ordemFinal,
                // Mapeamentos
                natureza: formData.natureza_despesa,
                categoria_item: formData.categoria
            };

            // Remove campos do front que não existem no model do backend para evitar confusão
            delete payload.natureza_despesa;
            delete payload.categoria;

            if (itemParaEditar) {
                await api.put(`/itens/${itemParaEditar.id}/`, payload);
                showToast("Item atualizado com sucesso!", "success");
            } else {
                await api.post("/itens/", payload);
                showToast(`Item ${ordemFinal} criado com sucesso!`, "success");
            }

            if (onItemSaved) onItemSaved();
            onClose();

        } catch (error) {
            console.error("Erro ao salvar:", error);
            const serverErrors = error.response?.data;
            let msg = "Erro ao salvar o item.";
            if (serverErrors) {
                const firstErrorKey = Object.keys(serverErrors)[0];
                if (firstErrorKey) {
                    const errorContent = serverErrors[firstErrorKey];
                    msg = `${firstErrorKey}: ${Array.isArray(errorContent) ? errorContent[0] : errorContent}`;
                }
            }
            showToast(msg, "error");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-dark-bg-secondary w-full max-w-4xl max-h-[90vh] rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg flex flex-col overflow-hidden"
                    >
                        {/* HEADER */}
                        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-dark-bg-primary flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    {itemParaEditar ? `Editar Item #${formData.numero_item}` : `Novo Item #${formData.numero_item}`}
                                    {!itemParaEditar && (
                                        <span className="bg-accent-blue/10 text-accent-blue text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                                            Automático
                                        </span>
                                    )}
                                </h3>
                                {processo && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Processo: <strong>{processo.numero_processo}</strong>
                                    </p>
                                )}
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* BODY SCROLLABLE */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                            <form id="itemForm" onSubmit={handleSubmit}>
                                
                                {/* 1. CATEGORIA E CLASSIFICAÇÃO */}
                                <div className={`${SECTION_STYLE} bg-accent-blue/5 dark:bg-accent-blue/10 border-accent-blue/20`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-1 h-4 bg-accent-blue rounded-full"></div>
                                        <h4 className="text-xs font-bold text-accent-blue uppercase">Classificação</h4>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                        <div className="md:col-span-4">
                                            <label className={LABEL_STYLE}>Categoria *</label>
                                            <select
                                                name="categoria"
                                                value={formData.categoria}
                                                onChange={handleChange}
                                                className={INPUT_STYLE}
                                                required
                                            >
                                                <option value="">Selecione a Categoria...</option>
                                                {categoriasFiltradas.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="md:col-span-8">
                                            <label className={LABEL_STYLE}>Natureza de Despesa</label>
                                            {/* FILTRO REMOVIDO, AGORA É UM SELECT SIMPLES */}
                                            <select
                                                name="natureza_despesa"
                                                value={formData.natureza_despesa}
                                                onChange={handleChange}
                                                className={INPUT_STYLE}
                                            >
                                                <option value="">Selecione a Natureza...</option>
                                                {sysOptions.naturezas_despesa?.map(nat => (
                                                    <option key={nat.id} value={nat.id}>{nat.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. DADOS DO ITEM */}
                                <div className={`${SECTION_STYLE} bg-white dark:bg-dark-bg-primary`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                                        <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Dados do Objeto</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                        <div className="md:col-span-12">
                                            <label className={LABEL_STYLE}>Descrição Resumida *</label>
                                            <input
                                                name="descricao"
                                                value={formData.descricao}
                                                onChange={handleChange}
                                                className={INPUT_STYLE}
                                                placeholder="Ex: Caneta Esferográfica Azul"
                                                required
                                            />
                                        </div>

                                        <div className="md:col-span-12">
                                            <label className={LABEL_STYLE}>Especificação Detalhada</label>
                                            <textarea
                                                name="especificacao"
                                                rows={3}
                                                value={formData.especificacao}
                                                onChange={handleChange}
                                                className={`${INPUT_STYLE} h-auto py-2`}
                                                placeholder="Cole a especificação completa aqui..."
                                            />
                                        </div>

                                        <div className="md:col-span-4">
                                            <label className={LABEL_STYLE}>Unidade *</label>
                                            <input
                                                name="unidade"
                                                value={formData.unidade}
                                                onChange={handleChange}
                                                className={`${INPUT_STYLE} uppercase`}
                                                placeholder="UND"
                                                required
                                            />
                                        </div>

                                        <div className="md:col-span-4">
                                            <label className={LABEL_STYLE}>Quantidade *</label>
                                            <input
                                                type="number"
                                                step="0.0001"
                                                name="quantidade"
                                                value={formData.quantidade}
                                                onChange={handleChange}
                                                className={INPUT_STYLE}
                                                required
                                            />
                                        </div>

                                        <div className="md:col-span-4">
                                            <label className={LABEL_STYLE}>Valor Unit. (R$) *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="valor_estimado"
                                                value={formData.valor_estimado}
                                                onChange={handleChange}
                                                className={INPUT_STYLE}
                                                required
                                            />
                                        </div>

                                        <div className="md:col-span-12 flex justify-end">
                                            <div className="text-right bg-slate-50 dark:bg-dark-bg-primary px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold block">Total Estimado</span>
                                                <span className="text-lg font-bold text-slate-800 dark:text-white">
                                                    {formData.quantidade && formData.valor_estimado
                                                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.quantidade * formData.valor_estimado)
                                                        : 'R$ 0,00'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. SITUAÇÃO E FORNECEDOR */}
                                <div className={`${SECTION_STYLE} bg-slate-50 dark:bg-dark-bg-primary mb-0`}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className={LABEL_STYLE}>Situação</label>
                                            <select
                                                name="situacao"
                                                value={formData.situacao}
                                                onChange={handleChange}
                                                className={INPUT_STYLE}
                                            >
                                                {sysOptions.situacoes_item?.map(s => (
                                                    <option key={s.id} value={s.id}>{s.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={LABEL_STYLE}>Benefício</label>
                                            <select
                                                name="tipo_beneficio"
                                                value={formData.tipo_beneficio}
                                                onChange={handleChange}
                                                className={INPUT_STYLE}
                                            >
                                                {sysOptions.tipos_beneficio?.map(b => (
                                                    <option key={b.id} value={b.id}>{b.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={LABEL_STYLE}>Fornecedor Vencedor</label>
                                            <select
                                                name="fornecedor"
                                                value={formData.fornecedor}
                                                onChange={handleChange}
                                                className={INPUT_STYLE}
                                            >
                                                <option value="">-- Selecione --</option>
                                                {fornecedores.map(f => (
                                                    <option key={f.id} value={f.id}>{f.razao_social} ({f.cnpj})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                            </form>
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
                            <button
                                type="submit"
                                form="itemForm"
                                disabled={isSaving}
                                className="px-6 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-accent-blue-hover transition-colors flex items-center gap-2 disabled:opacity-70"
                            >
                                {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Save size={16} />
                                )}
                                {itemParaEditar ? 'Salvar Alterações' : 'Adicionar Item'}
                            </button>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ItemModal;