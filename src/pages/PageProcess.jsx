import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

// Seções
import ItemsSection from '../components/ItemsSection';
import FornecedoresSection from '../components/FornecedoresSection';
import LotesSection from '../components/LotesSection';

// Infra
import useAxios from '../hooks/useAxios';
import { useToast } from '../context/ToastContext';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import ProcessHeader from '../components/ProcessHeader';

/* =============================================================
 * Constantes
 * ============================================================= */
const modalidades = [
  'Pregão Eletrônico',
  'Concorrência Eletrônica',
  'Dispensa Eletrônica',
  'Adesão a Registro de Preços',
  'Credenciamento',
  'Inexigibilidade Eletrônica',
];
const classificacoes = [
  'Compras',
  'Serviços Comuns',
  'Serviços de Engenharia Comuns',
  'Obras Comuns',
];
const organizacoes = ['Lote', 'Item'];
const situacoes = [
  'Aberto',
  'Em Pesquisa',
  'Aguardando Publicação',
  'Publicado',
  'Em Contratação',
  'Adjudicado/Homologado',
  'Revogado/Cancelado',
];

/* =============================================================
 * Estilos reutilizáveis
 * ============================================================= */
const inputStyle =
  'w-full px-3 py-2 text-sm border rounded-md bg-white border-slate-300 dark:bg-dark-bg-secondary dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad]';
const labelStyle =
  'text-[11px] font-semibold tracking-wide text-slate-600 dark:text-slate-300 uppercase';

/* =============================================================
 * Helpers
 * ============================================================= */
// Formata iso → "YYYY-MM-DDTHH:MM" para inputs datetime-local SEM converter fuso
const toDatetimeLocalExact = (iso) => {
  if (!iso) return '';
  const cleaned = String(iso).replace(/Z$/i, '').replace(' ', 'T');
  const m = cleaned.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})/);
  return m ? `${m[1]}T${m[2]}:${m[3]}` : '';
};

/* =============================================================
 * Botões básicos
 * ============================================================= */
const ActionButton = ({ text, onClick, variant = 'primary', icon: Icon, disabled = false, type = 'button' }) => {
  const baseStyle =
    'flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-semibold text-sm transition-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed';
  const styles = {
    primary: 'bg-[#004aad] text-white hover:bg-[#003d91] focus:ring-2 focus:ring-[#004aad]/30',
    outlined:
      'bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-dark-border text-slate-700 dark:text-dark-text-secondary hover:bg-slate-50 dark:hover:bg-dark-bg-tertiary',
  };
  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${styles[variant]}`} disabled={disabled}>
      {Icon && <Icon className="w-5 h-5" />}
      <span>{text}</span>
    </button>
  );
};

const TabButton = ({ label, isActive, onClick, isDisabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={isDisabled}
    className={`px-4 py-3 text-md font-semibold border-b-2 transition-none ${
      isActive
        ? 'text-accent-blue dark:text-dark-text-primary border-[#FFD60A]'
        : isDisabled
        ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed border-transparent'
        : 'text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white border-transparent'
    }`}
  >
    {label}
  </button>
);

/* =============================================================
 * Modais
 * ============================================================= */
const ItemModal = ({ isOpen, onClose, onSave, itemSelecionado }) => {
  const [formData, setFormData] = useState({ descricao: '', unidade: '', quantidade: '', valor_estimado: '' });

  useEffect(() => {
    if (isOpen) {
      setFormData(
        itemSelecionado || { descricao: '', unidade: '', quantidade: '', valor_estimado: '' }
      );
    }
  }, [itemSelecionado, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(formData);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 0 }}
        className="bg-white dark:bg-dark-bg-secondary p-6 md:ml-40 rounded-xl w-full max-w-lg border border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">
          {itemSelecionado ? 'Editar Item' : 'Adicionar Item'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelStyle}>Descrição *</label>
            <input
              name="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData((p) => ({ ...p, descricao: e.target.value }))}
              className={inputStyle}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelStyle}>Unidade</label>
              <input
                name="unidade"
                value={formData.unidade}
                onChange={(e) => setFormData((p) => ({ ...p, unidade: e.target.value }))}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>Quantidade *</label>
              <input
                name="quantidade"
                type="number"
                value={formData.quantidade}
                onChange={(e) => setFormData((p) => ({ ...p, quantidade: e.target.value }))}
                className={inputStyle}
                required
              />
            </div>
            <div>
              <label className={labelStyle}>Valor Estimado *</label>
              <input
                name="valor_estimado"
                type="number"
                step="0.01"
                value={formData.valor_estimado}
                onChange={(e) => setFormData((p) => ({ ...p, valor_estimado: e.target.value }))}
                className={inputStyle}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-sm font-semibold hover:bg-slate-50 dark:hover:bg-dark-bg-tertiary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0f766e] text-white rounded-md text-sm font-semibold hover:bg-[#115e59]"
            >
              {itemSelecionado ? 'Salvar Alterações' : 'Adicionar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

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
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
  const showForm = isEditing || isCreating;

  useEffect(() => {
    if (!isOpen) return;
    if (isEditing) {
      setFormData(fornecedorSelecionado);
      setIsCreating(true);
    } else {
      setFormData({
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
      setIsCreating(false);
    }
  }, [isEditing, fornecedorSelecionado, isOpen]);

  const buscarCNPJ = async () => {
    if (!formData.cnpj) return showToast('Digite um CNPJ válido.', 'error');
    try {
      const cnpjLimpo = formData.cnpj.replace(/[^\d]/g, '');
      const { data } = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      setFormData((prev) => ({
        ...prev,
        razao_social: data.razao_social || '',
        nome_fantasia: data.nome_fantasia || '',
        porte: data.porte || '',
        telefone: data.ddd_telefone_1 || '',
        email: data.email || '',
        cep: data.cep || '',
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
      showToast('Erro ao buscar CNPJ. Verifique o número e tente novamente.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEditing) await onSaveEdit?.(formData);
      else await onSaveNew?.(formData);
      onClose?.();
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCatalogo = useMemo(() => {
    const term = (searchTerm || '').toLowerCase();
    return (catalogo || []).filter(
      (f) => f?.razao_social?.toLowerCase().includes(term) || f?.cnpj?.toLowerCase().includes(term)
    );
  }, [catalogo, searchTerm]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 0 }}
        className="bg-white dark:bg-dark-bg-secondary p-6 md:ml-40 rounded-xl shadow-xl w-full max-w-[900px] min-w-[360px] border border-slate-200 dark:border-slate-700"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {isEditing ? 'Editar Fornecedor' : isCreating ? 'Cadastrar Novo Fornecedor' : 'Vincular Fornecedor'}
          </h3>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsCreating((v) => !v)}
              className="text-sm font-semibold text-[#004aad] hover:underline"
            >
              {isCreating ? 'Buscar no Catálogo' : 'Novo Fornecedor'}
            </button>
          )}
        </div>

        {showForm ? (
          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <label className={labelStyle}>CNPJ</label>
              <div className="flex gap-2">
                <input type="text" name="cnpj" value={formData.cnpj} onChange={(e) => setFormData((p) => ({ ...p, cnpj: e.target.value }))} className={inputStyle} required />
                {!isEditing && (
                  <button type="button" onClick={buscarCNPJ} className="bg-[#004aad] text-white px-4 py-2 rounded-md hover:bg-[#003d91]">
                    Buscar
                  </button>
                )}
              </div>
            </div>
            <div className="col-span-2">
              <label className={labelStyle}>Razão Social</label>
              <input type="text" name="razao_social" value={formData.razao_social} onChange={(e) => setFormData((p) => ({ ...p, razao_social: e.target.value }))} className={inputStyle} />
            </div>

            <div className="col-span-3 grid grid-cols-[2fr_2fr_1fr_1fr] gap-4">
              <div>
                <label className={labelStyle}>Nome Fantasia</label>
                <input name="nome_fantasia" value={formData.nome_fantasia} onChange={(e) => setFormData((p) => ({ ...p, nome_fantasia: e.target.value }))} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>E-mail</label>
                <input type="email" name="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Telefone</label>
                <input name="telefone" value={formData.telefone} onChange={(e) => setFormData((p) => ({ ...p, telefone: e.target.value }))} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Porte</label>
                <input name="porte" value={formData.porte} onChange={(e) => setFormData((p) => ({ ...p, porte: e.target.value }))} className={inputStyle} />
              </div>
            </div>

            <div className="col-span-3 grid grid-cols-[1fr_3fr_1fr] gap-4">
              <div>
                <label className={labelStyle}>CEP</label>
                <input name="cep" value={formData.cep} onChange={(e) => setFormData((p) => ({ ...p, cep: e.target.value }))} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Logradouro</label>
                <input name="logradouro" value={formData.logradouro} onChange={(e) => setFormData((p) => ({ ...p, logradouro: e.target.value }))} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Número</label>
                <input name="numero" value={formData.numero} onChange={(e) => setFormData((p) => ({ ...p, numero: e.target.value }))} className={inputStyle} />
              </div>
            </div>

            <div className="col-span-3 grid grid-cols-[2fr_2fr_2fr_1fr] gap-4">
              <div>
                <label className={labelStyle}>Bairro</label>
                <input name="bairro" value={formData.bairro} onChange={(e) => setFormData((p) => ({ ...p, bairro: e.target.value }))} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Complemento</label>
                <input name="complemento" value={formData.complemento} onChange={(e) => setFormData((p) => ({ ...p, complemento: e.target.value }))} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Município</label>
                <input name="municipio" value={formData.municipio} onChange={(e) => setFormData((p) => ({ ...p, municipio: e.target.value }))} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>UF</label>
                <input name="uf" value={formData.uf} onChange={(e) => setFormData((p) => ({ ...p, uf: e.target.value }))} className={inputStyle} />
              </div>
            </div>

            <div className="col-span-3 flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 font-semibold text-sm">
                Cancelar
              </button>
              <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-md bg-[#0f766e] text-white hover:bg-[#115e59] disabled:opacity-70 font-semibold text-sm">
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Buscar por CNPJ ou Razão Social..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${inputStyle}`}
              />
              <div className="max-h-64 overflow-y-auto border rounded-lg divide-y bg-white dark:bg-dark-bg-secondary">
                {filteredCatalogo.map((f) => (
                  <div key={f.id} className="p-3 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-dark-bg-tertiary">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{f.razao_social}</p>
                      <p className="text-sm text-slate-500">{f.cnpj}</p>
                    </div>
                    <button onClick={() => onLink?.(f.id)} className="px-4 py-2 bg-[#004aad] text-white rounded-md hover:bg-[#003d91] font-semibold text-sm">
                      Vincular
                    </button>
                  </div>
                ))}
                {filteredCatalogo.length === 0 && (
                  <p className="p-4 text-center text-slate-500">Nenhum fornecedor encontrado.</p>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 font-semibold text-sm">
                  Cancelar
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

/* =============================================================
 * Página principal
 * ============================================================= */
export default function PageProcess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useAxios();
  const { showToast } = useToast();

  const isNewProcess = !id;
  const [processoId, setProcessoId] = useState(id || null);
  const [activeTab, setActiveTab] = useState('itens');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(isNewProcess);

  const [formData, setFormData] = useState({
    objeto: '',
    numero_processo: '',
    data_processo: '',
    modalidade: '',
    classificacao: '',
    tipo_organizacao: '',
    registro_precos: false,
    orgao: '',
    entidade: '',
    valor_referencia: '',
    numero_certame: '',
    data_abertura: '',
    situacao: 'Em Pesquisa',
    vigencia_meses: 12,
  });

  const [itens, setItens] = useState([]);
  const [fornecedoresDoProcesso, setFornecedoresDoProcesso] = useState([]);
  const [entidades, setEntidades] = useState([]);
  const [orgaos, setOrgaos] = useState([]);
  const [catalogoFornecedores, setCatalogoFornecedores] = useState([]);
  const [entidadeNome, setEntidadeNome] = useState('');
  const [orgaoNome, setOrgaoNome] = useState('');
  const [lotes, setLotes] = useState([]);

  // Modais & exclusões
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [isFornecedorModalOpen, setIsFornecedorModalOpen] = useState(false);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);

  /* ---------------- Paginação (itens) ---------------- */
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const totalPages = useMemo(() => Math.ceil(itens.length / itemsPerPage), [itens.length, itemsPerPage]);
  const currentItems = useMemo(
    () => itens.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [itens, currentPage, itemsPerPage]
  );
  const areAllCurrentItemsSelected = useMemo(
    () => currentItems.length > 0 && currentItems.every((item) => selectedItems.has(item.id)),
    [currentItems, selectedItems]
  );

  /* ---------------- Paginação (fornecedores) ---------------- */
  const [currentPageForn, setCurrentPageForn] = useState(1);
  const [itemsPerPageForn, setItemsPerPageForn] = useState(5);
  const totalPagesForn = useMemo(
    () => Math.ceil(fornecedoresDoProcesso.length / itemsPerPageForn),
    [fornecedoresDoProcesso.length, itemsPerPageForn]
  );
  const currentFornecedores = useMemo(
    () => fornecedoresDoProcesso.slice((currentPageForn - 1) * itemsPerPageForn, currentPageForn * itemsPerPageForn),
    [fornecedoresDoProcesso, currentPageForn, itemsPerPageForn]
  );

  /* =============================================================
   * Data fetching
   * ============================================================= */
  const fetchDadosDoProcesso = useCallback(
    async (pid) => {
      if (!pid) return;
      setIsLoading(true);
      try {
        const { data } = await api.get(`/processos/${pid}/`);
        setFormData({
          ...data,
          // mantém exatamente o que veio do backend (sem normalizar fuso)
          data_abertura: data.data_abertura,
          data_processo: data.data_processo || '',
        });
        // fornecedores via endpoint dedicado depois (evita limpar na ausência)
        setProcessoId(data.id);
        setEntidadeNome(data.entidade_nome || '');
        setOrgaoNome(data.orgao_nome || '');
      } catch (err) {
        showToast('Erro ao carregar dados do processo.', 'error');
        navigate('/processos');
      } finally {
        setIsLoading(false);
      }
    },
    [api, showToast, navigate]
  );

  const fetchItens = useCallback(
    async (pid) => {
      if (!pid) return;
      try {
        const { data } = await api.get(`/processos/${pid}/itens/`);
        setItens(data || []);
      } catch (error) {
        console.error('Erro ao buscar itens:', error);
        showToast('Erro ao carregar itens do processo.', 'error');
      }
    },
    [api, showToast]
  );

  const fetchFornecedoresDoProcesso = useCallback(
    async (pid) => {
      if (!pid) return;
      try {
        const { data } = await api.get(`/processos/${pid}/fornecedores/`);
        setFornecedoresDoProcesso(data || []);
      } catch {
        showToast('Erro ao carregar fornecedores do processo.', 'error');
      }
    },
    [api, showToast]
  );

  const fetchLotes = useCallback(
    async (pid) => {
      if (!pid) return;
      try {
        const { data } = await api.get(`/processos/${pid}/lotes/`);
        setLotes(data || []);
      } catch {
        setLotes([]);
      }
    },
    [api]
  );

  const fetchAuxiliares = useCallback(async () => {
    try {
      const [entRes, fornRes] = await Promise.all([
        api.get('/entidades/'),
        api.get('/fornecedores/'),
      ]);
      setEntidades(entRes.data || []);
      setCatalogoFornecedores(fornRes.data || []);
    } catch {
      showToast('Erro ao carregar dados auxiliares.', 'error');
    }
  }, [api, showToast]);

  useEffect(() => {
    fetchAuxiliares();
    if (id) {
      fetchDadosDoProcesso(id);
      fetchItens(id);
      fetchFornecedoresDoProcesso(id);
      fetchLotes(id);
    }
  }, [id, fetchDadosDoProcesso, fetchAuxiliares, fetchItens, fetchFornecedoresDoProcesso, fetchLotes]);

  useEffect(() => {
    if (!formData.entidade) return setOrgaos([]);
    api
      .get(`/orgaos/?entidade=${formData.entidade}`)
      .then((res) => setOrgaos(res.data || []))
      .catch(() => setOrgaos([]));
  }, [formData.entidade, api]);

  /* =============================================================
   * Handlers Gerais
   * ============================================================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = name === 'registro_precos' ? value === 'true' : type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    if (name === 'entidade' && formData.entidade !== value) {
      setFormData((prev) => ({ ...prev, orgao: '' }));
    }
  };

  const handleSaveDadosGerais = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = isNewProcess
        ? await api.post('/processos/', formData)
        : await api.put(`/processos/${processoId}/`, formData);

      showToast(isNewProcess ? 'Processo criado!' : 'Processo atualizado!', 'success');
      const updated = res.data;

      if (isNewProcess) {
        navigate(`/processos/editar/${updated.id}`, { replace: true });
        setProcessoId(updated.id);
        setIsEditing(false);
      } else {
        await fetchDadosDoProcesso(updated.id);
        await fetchFornecedoresDoProcesso(updated.id); // evita sumir os fornecedores
        setIsEditing(false);
      }
    } catch {
      showToast('Erro ao salvar o processo.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- Itens ---------------- */
  const handleSaveItem = async (itemData) => {
    try {
      if (itemSelecionado) {
        await api.put(`/itens/${itemSelecionado.id}/`, itemData);
        showToast('Item atualizado com sucesso!', 'success');
      } else {
        await api.post(`/itens/`, { ...itemData, processo: processoId });
        showToast('Item adicionado com sucesso!', 'success');
      }
      setIsItemModalOpen(false);
      setItemSelecionado(null);
      fetchItens(processoId);
    } catch {
      showToast('Erro ao salvar item.', 'error');
    }
  };

  const handleSelectAll = () => {
    const pageIds = currentItems.map((i) => i.id);
    const next = new Set(selectedItems);
    const all = pageIds.every((id) => next.has(id));
    (all ? pageIds.forEach((id) => next.delete(id)) : pageIds.forEach((id) => next.add(id)));
    setSelectedItems(next);
  };

  const handleSelectItem = (itemId) => {
    const next = new Set(selectedItems);
    next.has(itemId) ? next.delete(itemId) : next.add(itemId);
    setSelectedItems(next);
  };

  const handleExportItems = () => {
    if (selectedItems.size === 0) {
      showToast('Nenhum item selecionado para exportar.', 'info');
      return;
    }
    const itemsToExport = itens.filter((i) => selectedItems.has(i.id));
    const headers = 'Descricao,Especificacao,Unidade,Quantidade\n';
    const csvContent = itemsToExport
      .map((item) => {
        const desc = `"${(item.descricao || '').replace(/"/g, '""')}"`;
        const espec = `"${(item.especificacao || '').replace(/"/g, '""')}"`;
        return [desc, espec, item.unidade, item.quantidade].join(',');
      })
      .join('\n');
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'itens_exportados.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`${itemsToExport.length} itens exportados com sucesso!`, 'success');
  };

  /* ---------------- Fornecedores ---------------- */
  const handleLinkFornecedor = async (fornecedorId) => {
    setIsFornecedorModalOpen(false);
    try {
      await api.post(`/processos/${processoId}/adicionar_fornecedor/`, { fornecedor_id: fornecedorId });
      showToast('Fornecedor vinculado!', 'success');
      fetchFornecedoresDoProcesso(processoId);
    } catch {
      showToast('Erro ao vincular fornecedor.', 'error');
    }
  };

  const handleSaveNewAndLinkFornecedor = async (newFornecedor) => {
    try {
      const { data } = await api.post('/fornecedores/', newFornecedor);
      setCatalogoFornecedores((prev) => [data, ...prev]);
      await handleLinkFornecedor(data.id);
    } catch {
      showToast('Erro ao cadastrar fornecedor.', 'error');
    }
  };

  const handleEditFornecedor = (fornecedor) => {
    setFornecedorSelecionado(fornecedor);
    setIsFornecedorModalOpen(true);
  };

  const handleUpdateEditedFornecedor = async (fornecedorAtualizado) => {
    try {
      const { data } = await api.put(`/fornecedores/${fornecedorAtualizado.id}/`, fornecedorAtualizado);
      setFornecedoresDoProcesso((prev) => prev.map((f) => (f.id === data.id ? data : f)));
      setCatalogoFornecedores((prev) => prev.map((f) => (f.id === data.id ? data : f)));
      showToast('Fornecedor atualizado.', 'success');
      setFornecedorSelecionado(null);
      setIsFornecedorModalOpen(false);
    } catch {
      showToast('Erro ao atualizar fornecedor.', 'error');
    }
  };

  /* ---------------- Exclusões ---------------- */
  const handleAskDelete = (type, item) => {
    setDeleteType(type);
    setItemToDelete(item);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteType === 'fornecedor') {
        await api.post(`/processos/${processoId}/remover_fornecedor/`, { fornecedor_id: itemToDelete.id });
        showToast('Fornecedor removido com sucesso.', 'success');
        fetchFornecedoresDoProcesso(processoId);
      } else if (deleteType === 'item') {
        await api.delete(`/itens/${itemToDelete.id}/`);
        showToast('Item removido com sucesso.', 'success');
        fetchItens(processoId);
      }
    } catch {
      showToast('Erro ao remover.', 'error');
    } finally {
      setShowConfirmModal(false);
      setItemToDelete(null);
      setDeleteType(null);
    }
  };

  /* =============================================================
   * Render
   * ============================================================= */
  return (
    <>
      {/* Modais */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setItemSelecionado(null);
        }}
        onSave={handleSaveItem}
        itemSelecionado={itemSelecionado}
      />

      <FornecedorModal
        isOpen={isFornecedorModalOpen}
        onClose={() => {
          setIsFornecedorModalOpen(false);
          setFornecedorSelecionado(null);
        }}
        catalogo={catalogoFornecedores}
        onLink={handleLinkFornecedor}
        onSaveNew={handleSaveNewAndLinkFornecedor}
        onSaveEdit={handleUpdateEditedFornecedor}
        fornecedorSelecionado={fornecedorSelecionado}
      />

      {showConfirmModal && (
        <ConfirmDeleteModal
          message={
            deleteType === 'fornecedor'
              ? `Deseja realmente remover o fornecedor "${itemToDelete?.nome || itemToDelete?.razao_social}" deste processo?`
              : `Deseja realmente excluir o item "${itemToDelete?.descricao}"?`
          }
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {/* Cabeçalho (card) */}
      {!isEditing && (
        <ProcessHeader
          formData={formData}
          entidadeNome={entidadeNome}
          orgaoNome={orgaoNome}
          onEdit={() => setIsEditing(true)}
        />
      )}

      {/* Formulário de edição */}
      {isEditing && (
        <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-4 md:px-8 py-4">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">
            Dados Gerais do Processo
          </h2>
          <form onSubmit={handleSaveDadosGerais} className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>Objeto *</label>
                <textarea
                  name="objeto"
                  value={formData.objeto}
                  onChange={handleChange}
                  className={`${inputStyle} h-28`}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>Nº do Processo *</label>
                  <input
                    name="numero_processo"
                    value={formData.numero_processo}
                    onChange={handleChange}
                    className={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label className={labelStyle}>Data do Processo *</label>
                  <input
                    name="data_processo"
                    type="date"
                    value={formData.data_processo}
                    onChange={handleChange}
                    className={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label className={labelStyle}>Nº do Certame</label>
                  <input
                    name="numero_certame"
                    value={formData.numero_certame || ''}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Data/Hora Abertura</label>
                  <input
                    type="datetime-local"
                    name="data_abertura"
                    value={toDatetimeLocalExact(formData.data_abertura)}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-5 gap-4">
              <div>
                <label className={labelStyle}>Modalidade *</label>
                <select
                  name="modalidade"
                  value={formData.modalidade}
                  onChange={handleChange}
                  className={inputStyle}
                  required
                >
                  <option value="">Selecione...</option>
                  {modalidades.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelStyle}>Classificação *</label>
                <select
                  name="classificacao"
                  value={formData.classificacao}
                  onChange={handleChange}
                  className={inputStyle}
                  required
                >
                  <option value="">Selecione...</option>
                  {classificacoes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelStyle}>Organização *</label>
                <select
                  name="tipo_organizacao"
                  value={formData.tipo_organizacao}
                  onChange={handleChange}
                  className={inputStyle}
                  required
                >
                  <option value="">Selecione...</option>
                  {organizacoes.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
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
                  className={`${inputStyle} text-right`}
                />
              </div>
              <div>
                <label className={labelStyle}>Vigência (Meses) *</label>
                <input
                  name="vigencia_meses"
                  type="number"
                  min="1"
                  value={formData.vigencia_meses || ''}
                  onChange={handleChange}
                  placeholder="12"
                  className={`${inputStyle} text-center`}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className={labelStyle}>Entidade *</label>
                <select
                  name="entidade"
                  value={formData.entidade}
                  onChange={handleChange}
                  className={inputStyle}
                  required
                >
                  <option value="">Selecione...</option>
                  {entidades.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelStyle}>Órgão *</label>
                <select
                  name="orgao"
                  value={formData.orgao}
                  onChange={handleChange}
                  className={inputStyle}
                  required
                  disabled={!formData.entidade || orgaos.length === 0}
                >
                  <option value="">
                    {formData.entidade ? 'Selecione...' : 'Selecione uma entidade'}
                  </option>
                  {orgaos.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelStyle}>Situação *</label>
                <select
                  name="situacao"
                  value={formData.situacao}
                  onChange={handleChange}
                  className={inputStyle}
                  required
                >
                  {situacoes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
              <ActionButton
                text={isNewProcess ? 'Cancelar' : 'Cancelar Edição'}
                onClick={() => (isNewProcess ? navigate(-1) : setIsEditing(false))}
                variant="outlined"
              />
              <ActionButton
                text={isNewProcess ? 'Salvar e Continuar' : 'Salvar Alterações'}
                onClick={handleSaveDadosGerais}
                variant="primary"
                icon={CheckCircleIcon}
                disabled={isLoading}
                type="submit"
              />
            </div>
          </form>
        </div>
      )}

      {/* Tabs (Itens / Lotes / Fornecedores) */}
      <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl px-4 py-4 mt-2 md:px-4 mb-12">
        <nav className="flex gap-2 px-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
          <TabButton label="Itens" isActive={activeTab === 'itens'} onClick={() => setActiveTab('itens')} isDisabled={!processoId} />
          {formData?.tipo_organizacao === 'Lote' && (
            <TabButton label="Lotes" isActive={activeTab === 'lotes'} onClick={() => setActiveTab('lotes')} isDisabled={!processoId} />
          )}
          <TabButton label="Fornecedores" isActive={activeTab === 'fornecedores'} onClick={() => setActiveTab('fornecedores')} isDisabled={!processoId} />
        </nav>

        <main className="p-2 mx-4">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 1, y: 0 }} transition={{ duration: 0 }}>
              {activeTab === 'itens' && (
                <ItemsSection
                  itens={itens}
                  currentItems={currentItems}
                  totalPages={totalPages}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  setItemsPerPage={setItemsPerPage}
                  setCurrentPage={setCurrentPage}
                  areAllCurrentItemsSelected={areAllCurrentItemsSelected}
                  selectedItems={selectedItems}
                  handleSelectItem={handleSelectItem}
                  handleSelectAll={handleSelectAll}
                  setIsItemModalOpen={setIsItemModalOpen}
                  setItemSelecionado={setItemSelecionado}
                  handleAskDelete={handleAskDelete}
                  handleExportItems={handleExportItems}
                />
              )}

              {activeTab === "lotes" && formData?.tipo_organizacao === 'Lote' && (
                <LotesSection
                  processoId={processoId}
                  lotes={lotes}
                  itens={itens}                       
                  reloadLotes={() => fetchLotes(processoId)}
                  reloadItens={() => fetchItens(processoId)}
                  showToast={showToast}
                />
              )}

              {activeTab === 'fornecedores' && (
                <FornecedoresSection
                  fornecedoresDoProcesso={fornecedoresDoProcesso}
                  currentFornecedores={currentFornecedores}
                  totalPagesForn={totalPagesForn}
                  currentPageForn={currentPageForn}
                  itemsPerPageForn={itemsPerPageForn}
                  setItemsPerPageForn={setItemsPerPageForn}
                  setCurrentPageForn={setCurrentPageForn}
                  setFornecedorSelecionado={setFornecedorSelecionado}
                  setIsFornecedorModalOpen={setIsFornecedorModalOpen}
                  handleAskDelete={handleAskDelete}
                  onEdit={handleEditFornecedor}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}

/* =============================================================
 * Skeleton de carregamento (opcional)
 * ============================================================= */
export function ProcessLoading() {
  return (
    <div className="animate-pulse space-y-4 p-4 mx-2">
      <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-24 w-full bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded" />
        ))}
      </div>
      <div className="h-10 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-64 w-full bg-slate-200 dark:bg-slate-700 rounded" />
    </div>
  );
}
