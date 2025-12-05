import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Save, 
  Building2, 
  Landmark, 
  DownloadCloud, 
  Loader2, 
  CheckCircle2 
} from 'lucide-react';
import useAxios from '../hooks/useAxios';
import { useToast } from '../context/ToastContext';

// --- ESTILOS PADRONIZADOS ---
const INPUT_STYLE = "w-full h-12 px-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad] bg-slate-50 dark:bg-slate-800/50 text-sm font-medium transition-all placeholder:text-slate-400";
const LABEL_STYLE = "block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide";

export const EntidadeOrgaoModal = ({
  item = {},
  entidades = [], // Usado para select de vínculo (se necessário futuramente)
  onClose,
  onSave,
}) => {
  const { showToast } = useToast();
  const api = useAxios();

  // --- DEFINIÇÃO DO TIPO ---
  // Garante defaults pra não quebrar se item vier undefined/null
  const { data = null, type = '', parentEntidadeId = '' } = item || {};

  // Normaliza o tipo
  const normalizedType = String(type)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const isEntidade = normalizedType === 'entidade';
  const isEditing = !!(data && data.id);
  
  // Labels e Ícones Dinâmicos
  const tipoLabel = isEntidade ? 'Entidade' : 'Unidade / Órgão';
  const Icon = isEntidade ? Building2 : Landmark;

  // --- ESTADOS ---
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    entidade: '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isImportingPncp, setIsImportingPncp] = useState(false);

  // --- EFEITOS ---
  useEffect(() => {
    if (isEntidade) {
      // Modo Entidade
      setFormData({
        nome: data?.nome || '',
        cnpj: data?.cnpj || '',
        entidade: '', // Entidade raiz não tem pai
      });
    } else {
      // Modo Órgão
      setFormData({
        nome: data?.nome || '',
        entidade: data?.entidade || parentEntidadeId || '',
        cnpj: '', // Órgão geralmente herda ou não precisa nesse contexto simples
      });
    }
  }, [isEntidade, data, parentEntidadeId]);

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Máscara simples de CNPJ
    let val = value;
    if (name === 'cnpj') {
        val = val.replace(/\D/g, '')
                 .replace(/^(\d{2})(\d)/, '$1.$2')
                 .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                 .replace(/\.(\d{3})(\d)/, '.$1/$2')
                 .replace(/(\d{4})(\d)/, '$1-$2')
                 .substring(0, 18);
    }
    
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isEntidade ? 'entidades' : 'orgaos';
    
    if (isEntidade && !formData.cnpj) {
        showToast("O CNPJ é obrigatório para entidades.", "warning");
        return;
    }
    
    if (!formData.nome) {
        showToast("O nome é obrigatório.", "warning");
        return;
    }

    setIsSaving(true);
    try {
      // Remove máscara para envio se necessário, ou envia com máscara (depende do backend)
      // Aqui enviando conforme o state
      
      if (isEditing) {
        await api.put(`/${endpoint}/${data.id}/`, formData);
        showToast(`${tipoLabel} atualizada com sucesso!`, 'success');
      } else {
        await api.post(`/${endpoint}/`, formData);
        showToast(`${tipoLabel} cadastrada com sucesso!`, 'success');
      }
      if (onSave) onSave();
      onClose();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.detail || `Erro ao salvar ${tipoLabel.toLowerCase()}.`;
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Importação PNCP (Apenas para Novas Entidades)
  const handleImportPncp = async () => {
    if (!isEntidade || isEditing) return;

    const digits = (formData.cnpj || '').replace(/\D/g, '');
    if (digits.length !== 14) {
      showToast('Informe um CNPJ válido com 14 dígitos para importar.', 'warning');
      return;
    }

    setIsImportingPncp(true);
    try {
      const res = await api.post('/orgaos/importar-pncp/', { cnpj: digits });
      const ent = res.data?.entidade;
      const created = res.data?.created ?? 0;
      const updated = res.data?.updated ?? 0;

      showToast(
        `Sincronização PNCP: ${created} unidades criadas e ${updated} atualizadas.`,
        'success'
      );

      if (onSave) onSave();
      // Não fecha o modal automaticamente para permitir ver o resultado ou editar o nome se quiser
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.detail || 'Erro ao importar dados do PNCP.';
      showToast(msg, 'error');
    } finally {
      setIsImportingPncp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-800"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-dark-bg-secondary">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-[#004aad] dark:text-blue-400 flex items-center justify-center">
                    <Icon size={20} strokeWidth={2.5} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-none">
                        {isEditing ? `Editar ${tipoLabel}` : `Nova ${tipoLabel}`}
                    </h2>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                        {isEntidade 
                            ? "Gestão de Entidade Administrativa" 
                            : "Gestão de Unidade Compradora"
                        }
                    </p>
                </div>
            </div>
            <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
                <X size={20} />
            </button>
        </div>

        {/* Corpo do Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {isEntidade ? (
                /* --- CAMPOS DE ENTIDADE --- */
                <>
                    <div>
                        <label className={LABEL_STYLE}>CNPJ da Entidade</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="cnpj"
                                value={formData.cnpj}
                                onChange={handleChange}
                                className={INPUT_STYLE}
                                placeholder="00.000.000/0000-00"
                                maxLength={18}
                                autoFocus={!isEditing}
                                disabled={isEditing || isImportingPncp}
                            />
                            
                            {/* Botão Importar PNCP (Apenas Criação) */}
                            {!isEditing && (
                                <button
                                    type="button"
                                    onClick={handleImportPncp}
                                    disabled={isImportingPncp || !formData.cnpj}
                                    className="flex items-center gap-2 px-4 bg-slate-100 hover:bg-[#004aad] hover:text-white text-slate-600 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Buscar dados no PNCP"
                                >
                                    {isImportingPncp ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <DownloadCloud size={18} />
                                    )}
                                    <span className="text-sm hidden sm:inline">PNCP</span>
                                </button>
                            )}
                        </div>
                        {!isEditing && (
                            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                                <span className="font-bold text-[#004aad]">Dica:</span> Digite o CNPJ e clique no botão para importar automaticamente o nome e as unidades vinculadas do Portal Nacional.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className={LABEL_STYLE}>Razão Social / Nome</label>
                        <input
                            type="text"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            className={INPUT_STYLE}
                            placeholder="Ex: Prefeitura Municipal de..."
                            required
                            disabled={isImportingPncp}
                        />
                    </div>
                </>
            ) : (
                /* --- CAMPOS DE ÓRGÃO --- */
                <>
                     {/* Se houver necessidade de trocar entidade pai, o select iria aqui */}
                     
                     <div>
                        <label className={LABEL_STYLE}>Nome da Unidade / Órgão</label>
                        <input
                            type="text"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            className={INPUT_STYLE}
                            placeholder="Ex: Secretaria de Saúde, Fundo Municipal..."
                            required
                            autoFocus
                        />
                    </div>
                    
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex gap-2">
                            <InfoIcon size={14} className="text-[#004aad] flex-shrink-0 mt-0.5" />
                            <span>
                                Esta unidade será vinculada à entidade pai selecionada. 
                                O código da unidade (UASG/Id) é gerado automaticamente na integração ou pode ser editado posteriormente.
                            </span>
                        </p>
                    </div>
                </>
            )}

            {/* Footer de Ações */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSaving || isImportingPncp}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSaving || isImportingPncp}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#004aad] text-white hover:bg-[#003d91] shadow-lg shadow-blue-900/20 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSaving ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Save size={18} />
                    )}
                    {isSaving ? 'Salvando...' : 'Salvar Registro'}
                </button>
            </div>

        </form>
      </motion.div>
    </div>
  );
};

// Pequeno helper interno para ícone de info
const InfoIcon = ({ size, className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4"/>
        <path d="M12 8h.01"/>
    </svg>
);