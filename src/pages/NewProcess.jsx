import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrashIcon, PlusIcon, PencilIcon, ClipboardDocumentIcon, ChevronLeftIcon, ChevronRightIcon, ArrowDownTrayIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';

import axios from 'axios';

import useAxios from '../hooks/useAxios';
import { useToast } from '../context/ToastContext';
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import DadosGeraisForm from '../components/DadosGeraisForm';

const inputStyle = "w-full px-3 py-2 text-sm border rounded-md bg-white border-slate-300 dark:bg-dark-bg-secondary dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad]";
const labelStyle = "text-[11px] font-semibold tracking-wide text-slate-600 dark:text-slate-300 uppercase";

// --- HELPER FUNCTIONS ---
const formatDateTimeForInput = (isoString) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    const timezoneOffset = d.getTimezoneOffset() * 60000;
    const localDate = new Date(d.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
  } catch { return ''; }
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'Não informado';
  return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// --- UI COMPONENTS ---
const TabButton = ({ label, isActive, onClick, isDisabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={isDisabled}
    className={`px-4 py-3 text-md font-semibold border-b-2 transition-none
      ${isActive
        ? 'text-accent-blue dark:text-dark-text-primary border-[#FFD60A]'
        : isDisabled
          ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed border-transparent'
          : 'text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white border-transparent'
      }`}
  >
    {label}
  </button>
);

const StyledCheckbox = ({ checked, onChange, className = "" }) => (
  <label className={`relative inline-flex items-center justify-center cursor-pointer select-none ${className}`} aria-checked={checked} role="checkbox">
    <input type="checkbox" checked={checked} onChange={onChange} className="peer absolute inset-0 z-20 m-0 h-full w-full cursor-pointer opacity-0" />
    <div className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded border-2 border-slate-300 dark:border-dark-border transition-none peer-checked:border-[#004aad] peer-checked:bg-[#004aad]`}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`h-3 w-3 text-white ${checked ? 'opacity-100' : 'opacity-0'}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    </div>
  </label>
);

// --- MODALS ---
const ItemModal = ({ isOpen, onClose, onSave, itemSelecionado }) => {
  const [formData, setFormData] = useState({
    descricao: '',
    unidade: '',
    quantidade: '',
    valor_estimado: ''
  });

  useEffect(() => {
    if (itemSelecionado) setFormData(itemSelecionado);
    else setFormData({ descricao: '', unidade: '', quantidade: '', valor_estimado: '' });
  }, [itemSelecionado, isOpen]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof onSave === 'function') onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 0 }}
        className="bg-white dark:bg-dark-bg-secondary p-6 rounded-xl w-full max-w-lg shadow-xl border border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">{itemSelecionado ? 'Editar Item' : 'Adicionar Item'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelStyle}>Descrição *</label>
            <input name="descricao" value={formData.descricao} onChange={handleChange} className={inputStyle} required />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelStyle}>Unidade</label>
              <input name="unidade" value={formData.unidade} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Quantidade *</label>
              <input name="quantidade" type="number" value={formData.quantidade} onChange={handleChange} className={inputStyle} required />
            </div>
            <div>
              <label className={labelStyle}>Valor Estimado *</label>
              <input name="valor_estimado" type="number" step="0.01" value={formData.valor_estimado} onChange={handleChange} className={inputStyle} required />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-sm font-semibold hover:bg-slate-50 dark:hover:bg-dark-bg-tertiary">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-[#0f766e] text-white rounded-md text-sm font-semibold hover:bg-[#115e59]">{itemSelecionado ? 'Salvar Alterações' : 'Adicionar'}</button>
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
  fornecedorSelecionado
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
    if (isEditing && fornecedorSelecionado) {
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

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const buscarCNPJ = async () => {
    if (!formData.cnpj) return showToast('Digite um CNPJ válido.', 'error');
    try {
      const cnpjLimpo = formData.cnpj.replace(/[^\d]/g, '');
      const res = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      const data = res.data;

      setFormData({
        ...formData,
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
      });

      showToast('Dados carregados com sucesso!', 'success');
    } catch (error) {
      
      showToast('Erro ao buscar CNPJ. Verifique o número e tente novamente.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEditing) {
        await onSaveEdit(formData);
      } else {
        await onSaveNew(formData);
      }
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCatalogo = (catalogo || []).filter((f) => {
    const term = (searchTerm || '').toLowerCase();
    return (
      (f?.razao_social || '').toLowerCase().includes(term) ||
      (f?.cnpj || '').toLowerCase().includes(term)
    );
  });

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 0 }}
          className="bg-white dark:bg-dark-bg-secondary p-6 rounded-xl shadow-xl w-full max-w-[900px] min-w-[360px] border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {isEditing
                ? 'Editar Fornecedor'
                : isCreating
                  ? 'Cadastrar Novo Fornecedor'
                  : 'Vincular Fornecedor'}
            </h3>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsCreating(!isCreating)}
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
                  <input
                    type="text"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleChange}
                    className={inputStyle}
                    required
                  />
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={buscarCNPJ}
                      className="bg-[#004aad] text-white px-4 py-2 rounded-md hover:bg-[#003d91]"
                    >
                      Buscar
                    </button>
                  )}
                </div>
              </div>
              <div className="col-span-2">
                <label className={labelStyle}>Razão Social</label>
                <input
                  type="text"
                  name="razao_social"
                  value={formData.razao_social}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>
              <div className="col-span-3 grid grid-cols-[2fr_2fr_1fr_1fr] gap-4">
                <div>
                  <label className={labelStyle}>Nome Fantasia</label>
                  <input name="nome_fantasia" value={formData.nome_fantasia} onChange={handleChange} className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>E-mail</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>Telefone</label>
                  <input name="telefone" value={formData.telefone} onChange={handleChange} className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>Porte</label>
                  <input name="porte" value={formData.porte} onChange={handleChange} className={inputStyle} />
                </div>
              </div>
              <div className="col-span-3 grid grid-cols-[1fr_3fr_1fr] gap-4">
                <div>
                  <label className={labelStyle}>CEP</label>
                  <input name="cep" value={formData.cep} onChange={handleChange} className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>Logradouro</label>
                  <input name="logradouro" value={formData.logradouro} onChange={handleChange} className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>Número</label>
                  <input name="numero" value={formData.numero} onChange={handleChange} className={inputStyle} />
                </div>
              </div>
              <div className="col-span-3 grid grid-cols-[2fr_2fr_2fr_1fr] gap-4">
                <div>
                  <label className={labelStyle}>Bairro</label>
                  <input name="bairro" value={formData.bairro} onChange={handleChange} className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>Complemento</label>
                  <input name="complemento" value={formData.complemento} onChange={handleChange} className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>Município</label>
                  <input name="municipio" value={formData.municipio} onChange={handleChange} className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>UF</label>
                  <input name="uf" value={formData.uf} onChange={handleChange} className={inputStyle} />
                </div>
              </div>
              <div className="col-span-3 flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 font-semibold text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-md bg-[#0f766e] text-white hover:bg-[#115e59] disabled:opacity-70 font-semibold text-sm"
                >
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Buscar por CNPJ ou Razão Social..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputStyle}`}
                />
                <div className="max-h-64 overflow-y-auto border rounded-lg divide-y bg-white dark:bg-dark-bg-secondary">
                  {filteredCatalogo.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-dark-bg-tertiary"
                    >
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{f.razao_social}</p>
                        <p className="text-sm text-slate-500">{f.cnpj}</p>
                      </div>
                      <button
                        onClick={() => onLink(f.id)}
                        className="px-4 py-2 bg-[#004aad] text-white rounded-md hover:bg-[#003d91] font-semibold text-sm"
                      >
                        Vincular
                      </button>
                    </div>
                  ))}
                  {filteredCatalogo.length === 0 && (
                    <p className="p-4 text-center text-slate-500">
                      Nenhum fornecedor encontrado.
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 font-semibold text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </>
  );
};

// --- TABLES ---
const ItensTable = ({ itens, onEdit, handleAskDelete, selectedItems, onSelectItem, onSelectAll, areAllSelected }) => (
  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-bg-secondary shadow-sm">
    <table className="w-full divide-y divide-slate-200 dark:divide-slate-700">
      <thead className="bg-slate-50 dark:bg-slate-800/40">
        <tr>
          <th className="py-3 px-4 text-left w-12">
            <StyledCheckbox checked={areAllSelected} onChange={onSelectAll} />
          </th>
          <th className="py-3 px-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">Descrição</th>
          <th className="py-3 px-3 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">Quantidade</th>
          <th className="py-3 px-3 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">Valor</th>
          <th className="py-3 px-6 text-center text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">Ações</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
        {itens.map(item => (
          <tr key={item.id} className={`${selectedItems.has(item.id) ? 'bg-blue-50/60 dark:bg-blue-900/20' : 'bg-white dark:bg-transparent'} hover:bg-slate-50 dark:hover:bg-slate-800/40`}>
            <td className="py-4 px-4">
              <StyledCheckbox checked={selectedItems.has(item.id)} onChange={() => onSelectItem(item.id)} />
            </td>
            <td className="py-4 px-4 text-sm text-slate-800 dark:text-slate-200">{item.descricao}</td>
            <td className="px-3 py-4 text-sm text-slate-800 dark:text-slate-200">{item.quantidade}</td>
            <td className="px-3 py-4 text-sm text-slate-800 dark:text-slate-200">{formatCurrency(item.valor_estimado)}</td>
            <td className="py-4 px-6 text-center text-sm font-semibold">
              <div className="flex gap-3 justify-center">
                <button onClick={() => onEdit(item)} title="Editar" className="text-[#004aad] hover:text-[#003d91]">
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleAskDelete("item", item)}
                  title="Remover"
                  className="text-rose-600 hover:text-rose-700"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {itens.length === 0 && (
      <div className="flex flex-col items-center justify-center p-10 text-center bg-white dark:bg-dark-bg-secondary">
        <ClipboardDocumentIcon className="w-12 h-12 text-slate-300 dark:text-slate-600" />
        <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">Nenhum item adicionado</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Clique em “Adicionar Item” para cadastrar um.</p>
      </div>
    )}
  </div>
);

const FornecedorTable = ({ fornecedores, handleAskDelete, onEdit }) => (
  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-bg-secondary shadow-sm">
    <table className="w-full divide-y divide-slate-200 dark:divide-slate-700">
      <thead className="bg-slate-50 dark:bg-slate-800/40">
        <tr>
          <th className="py-3 px-3 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">CNPJ</th>
          <th className="py-3 px-6 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">Razão Social</th>
          <th className="py-3 px-6 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">Nome Fantasia</th>
          <th className="py-3 px-3 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">Telefone</th>
          <th className="py-3 px-6 text-center text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">Ações</th>
        </tr>
      </thead>
      <tbody>
        {fornecedores.length > 0 ? (
          fornecedores.map((forn) => (
            <tr key={forn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <td className="px-3 py-4 text-sm text-slate-800 dark:text-slate-200">{forn.cnpj}</td>
              <td className="py-4 px-6 text-sm text-slate-800 dark:text-slate-200">{forn.razao_social}</td>
              <td className="px-3 py-4 text-sm text-slate-800 dark:text-slate-200">{forn.nome_fantasia}</td>
              <td className="px-3 py-4 text-sm text-slate-800 dark:text-slate-200">{forn.telefone}</td>
              <td className="px-6 py-4 text-center">
                <div className="space-x-4">
                  <button onClick={() => onEdit(forn)} className="text-[#004aad] hover:text-[#003d91]">
                    <PencilIcon className="w-5 h-5 inline" />
                  </button>
                  <button
                    onClick={() => handleAskDelete('fornecedor', forn)}
                    className="text-rose-600 hover:text-rose-700"
                  >
                    <TrashIcon className="w-5 h-5 inline" />
                  </button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="text-center py-10">
              <BuildingOffice2Icon className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Nenhum fornecedor vinculado ao processo.
              </p>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

// --- MAIN COMPONENT ---
export default function NewProcess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useAxios();
  const { showToast } = useToast();

  const isNewProcess = !id;
  const [processoId, setProcessoId] = useState(id || null);
  const [activeTab, setActiveTab] = useState("dadosGerais");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(isNewProcess);

  const [formData, setFormData] = useState({
    objeto: '', numero_processo: '', data_processo: '', modalidade: '', classificacao: '', tipo_organizacao: '', registro_precos: false, orgao: '', entidade: '', valor_referencia: '', numero_certame: '', data_abertura: '', situacao: 'Em Pesquisa', vigencia_meses: 12
  });
  const [itens, setItens] = useState([]);
  const [fornecedoresDoProcesso, setFornecedoresDoProcesso] = useState([]);
  const [entidades, setEntidades] = useState([]);
  const [orgaos, setOrgaos] = useState([]);
  const [catalogoFornecedores, setCatalogoFornecedores] = useState([]);
  const [entidadeNome, setEntidadeNome] = useState('');
  const [orgaoNome, setOrgaoNome] = useState('');

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [isFornecedorModalOpen, setIsFornecedorModalOpen] = useState(false);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);

  // Pagination State (Itens)
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const totalPages = Math.ceil(itens.length / itemsPerPage);
  const currentItems = itens.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const areAllCurrentItemsSelected = currentItems.length > 0 && currentItems.every(item => selectedItems.has(item.id));

  // Pagination State (Fornecedores)
  const [currentPageForn, setCurrentPageForn] = useState(1);
  const [itemsPerPageForn, setItemsPerPageForn] = useState(5);
  const totalPagesForn = Math.ceil(fornecedoresDoProcesso.length / itemsPerPageForn);
  const currentFornecedores = fornecedoresDoProcesso.slice((currentPageForn - 1) * itemsPerPageForn, currentPageForn * itemsPerPageForn);

  const handleAskDelete = (type, item) => {
    setDeleteType(type);
    setItemToDelete(item);
    setShowConfirmModal(true);
  };

  // --- DATA FETCHING ---
  const fetchDadosDoProcesso = useCallback(async (pid) => {
    if (!pid) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/processos/${pid}/`);
      const data = res.data;
      setFormData({ ...data, data_abertura: formatDateTimeForInput(data.data_abertura), data_processo: data.data_processo || '' });
      setFornecedoresDoProcesso(data.fornecedores_processo || data.fornecedores || []);
      setProcessoId(data.id);
      setEntidadeNome(data.entidade_nome || '');
      setOrgaoNome(data.orgao_nome || '');
    } catch (err) {
      showToast("Erro ao carregar dados do processo.", "error");
      navigate("/processos");
    } finally { setIsLoading(false); }
  }, [api, showToast, navigate]);

  const fetchItens = useCallback(async (pid) => {
    if (!pid) return;
    try {
      const res = await api.get(`/processos/${pid}/itens/`);
      setItens(res.data || []);
    } catch (error) {
      showToast("Erro ao carregar itens do processo.", "error");
    }
  }, [api, showToast]);

  const fetchFornecedoresDoProcesso = useCallback(async (pid) => {
    if (!pid) return;
    try {
      const res = await api.get(`/processos/${pid}/fornecedores/`);
      setFornecedoresDoProcesso(res.data || []);
    } catch {
      showToast('Erro ao carregar fornecedores do processo.', 'error');
    }
  }, [api, showToast]);

  const fetchAuxiliares = useCallback(async () => {
    try {
      const [entRes, fornRes] = await Promise.all([api.get('/entidades/'), api.get('/fornecedores/')]);
      setEntidades(entRes.data);
      setCatalogoFornecedores(fornRes.data);
    } catch { showToast('Erro ao carregar dados auxiliares.', 'error'); }
  }, [api, showToast]);

  const loadOrgaosForEntidade = useCallback(async (entidadeId) => {
    if (!entidadeId) {
      setOrgaos([]);
      return;
    }
    try {
      const res = await api.get('/orgaos/', { params: { entidade: entidadeId } });
      setOrgaos(Array.isArray(res.data) ? res.data : []);
    } catch {
      showToast('Erro ao carregar órgãos da entidade selecionada.', 'error');
      setOrgaos([]);
    }
  }, [api, showToast]);

  // --- EFFECTS ---
  useEffect(() => {
    fetchAuxiliares();
    if (id) {
      fetchDadosDoProcesso(id);
      fetchItens(id);
      fetchFornecedoresDoProcesso(id);
    }
  }, [id, fetchDadosDoProcesso, fetchAuxiliares, fetchItens, fetchFornecedoresDoProcesso]);

  useEffect(() => {
    if (formData.entidade) {
      loadOrgaosForEntidade(formData.entidade);
    } else {
      setOrgaos([]);
    }
  }, [formData.entidade, loadOrgaosForEntidade]);

  // --- HANDLERS ---
  const handleChangeDadosGerais = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveDadosGerais = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = isNewProcess ? await api.post("/processos/", formData) : await api.put(`/processos/${processoId}/`, formData);
      showToast(isNewProcess ? "Processo criado!" : "Processo atualizado!", "success");
      const updatedData = res.data;
      if (isNewProcess) {
        navigate(`/processos/editar/${updatedData.id}`, { replace: true });
        setActiveTab("itens");
      } else {
        fetchDadosDoProcesso(updatedData.id);
        setIsEditing(false);
      }
    } catch { showToast("Erro ao salvar o processo.", "error"); }
    finally { setIsLoading(false); }
  };

  const handleSaveItem = async (itemData) => {
    try {
      if (itemSelecionado) {
        await api.put(`/itens/${itemSelecionado.id}/`, itemData);
        showToast("Item atualizado com sucesso!", "success");
      } else {
        await api.post(`/itens/`, { ...itemData, processo: processoId });
        showToast("Item adicionado com sucesso!", "success");
      }
      setIsItemModalOpen(false);
      setItemSelecionado(null);
      fetchItens(processoId);
    } catch {
      showToast("Erro ao salvar item.", "error");
    }
  };

  const handleSelectAll = () => {
    if (areAllCurrentItemsSelected) {
      const newSelected = new Set(selectedItems);
      currentItems.forEach(item => newSelected.delete(item.id));
      setSelectedItems(newSelected);
    } else {
      const newSelected = new Set(selectedItems);
      currentItems.forEach(item => newSelected.add(item.id));
      setSelectedItems(newSelected);
    }
  };

  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    newSelected.has(itemId) ? newSelected.delete(itemId) : newSelected.add(itemId);
    setSelectedItems(newSelected);
  };

  const handleExportItems = () => {
    if (selectedItems.size === 0) {
      showToast("Nenhum item selecionado para exportar.", "info");
      return;
    }
    const itemsToExport = itens.filter(item => selectedItems.has(item.id));
    const headers = "Descricao,Especificacao,Unidade,Quantidade\n";
    const csvContent = itemsToExport.map(item => {
      const desc = `"${item.descricao.replace(/"/g, '""')}"`;
      const espec = `"${(item.especificacao || '').replace(/"/g, '""')}"`;
      return [desc, espec, item.unidade, item.quantidade].join(',');
    }).join('\n');
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "itens_exportados.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    showToast(`${itemsToExport.length} itens exportados com sucesso!`, "success");
  };

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
      const res = await api.post('/fornecedores/', newFornecedor);
      const fornecedorCriado = res.data;
      setCatalogoFornecedores((prev) => [fornecedorCriado, ...prev]);
      await handleLinkFornecedor(fornecedorCriado.id);
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
      const res = await api.put(`/fornecedores/${fornecedorAtualizado.id}/`, fornecedorAtualizado);
      const fornecedorEditado = res.data;
      setFornecedoresDoProcesso((prev) =>
        prev.map((f) => (f.id === fornecedorEditado.id ? fornecedorEditado : f))
      );
      setCatalogoFornecedores((prev) =>
        prev.map((f) => (f.id === fornecedorEditado.id ? fornecedorEditado : f))
      );
      showToast('Fornecedor atualizado.', 'success');
      setFornecedorSelecionado(null);
      setIsFornecedorModalOpen(false);
    } catch {
      showToast('Erro ao atualizar fornecedor.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteType === 'fornecedor') {
        await api.post(`/processos/${processoId}/remover_fornecedor/`, {
          fornecedor_id: itemToDelete.id,
        });
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

  return (
    <>
      {/* --- MODALS --- */}
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
            deleteType === "fornecedor"
              ? `Deseja realmente remover o fornecedor "${itemToDelete?.nome || itemToDelete?.razao_social}" deste processo?`
              : `Deseja realmente excluir o item "${itemToDelete?.descricao}"?`
          }
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
      {/* --- PAGE LAYOUT --- */}
      <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-4 mx-2 mt-3 md:px-8 py-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold leading-tight">
              Novo Processo Licitatório
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Preencha os dados para criar um novo processo licitatório.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl px-4 py-4 mx-2 mt-6 md:px-4">
        {/* Tabs */}
        <nav className="flex gap-2 px-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
          <TabButton label="Visão Geral" isActive={activeTab === "dadosGerais"} onClick={() => setActiveTab("dadosGerais")} />
          <TabButton label="Itens do Processo" isActive={activeTab === "itens"} onClick={() => setActiveTab("itens")} isDisabled={isNewProcess} />
          <TabButton label="Fornecedores" isActive={activeTab === "fornecedores"} onClick={() => setActiveTab("fornecedores")} isDisabled={isNewProcess} />
        </nav>
        {/* Content */}
        <main className="p-2 mx-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 1, y: 0 }}
              transition={{ duration: 0 }}
            >
              {/* --- TAB DADOS GERAIS --- */}
              {activeTab === "dadosGerais" && (
                <DadosGeraisForm
                  formData={formData}
                  onChange={handleChangeDadosGerais}
                  onSubmit={handleSaveDadosGerais}
                  onCancel={() => (isNewProcess ? navigate(-1) : setIsEditing(false))}
                  isLoading={isLoading}
                  isNew={isNewProcess}
                  entidades={entidades}
                />
              )}
              {/* --- TAB ITENS --- */}
              {activeTab === "itens" && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Itens do Processo</h2>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{itens.length} itens no total. {selectedItems.size > 0 && `${selectedItems.size} selecionado(s).`}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="flex items-center gap-2 px-3 py-2 text-sm font-bold bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-slate-700 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-dark-bg-tertiary disabled:opacity-50"
                        onClick={handleExportItems}
                        disabled={selectedItems.size === 0}
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Exportar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setItemSelecionado(null);
                          setIsItemModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-accent-blue rounded-md shadow-sm hover:bg-accent-blue/90"
                      >
                        <PlusIcon className="w-5 h-5" />
                        Adicionar Item
                      </button>
                    </div>
                  </div>
                  <ItensTable
                    itens={currentItems}
                    onEdit={(item) => {
                      setItemSelecionado(item);
                      setIsItemModalOpen(true);
                    }}
                    handleAskDelete={handleAskDelete}
                    selectedItems={selectedItems}
                    onSelectItem={handleSelectItem}
                    onSelectAll={handleSelectAll}
                    areAllSelected={areAllCurrentItemsSelected}
                  />
                  {totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span>Exibir</span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); setSelectedItems(new Set()); }}
                          className={`${inputStyle} w-auto`}
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                        </select>
                        <span>por página</span>
                      </div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-500 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 disabled:opacity-50">
                          <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <span className="relative hidden md:inline-flex items-center px-4 py-2 text-sm font-bold ring-1 ring-inset ring-slate-200 dark:ring-slate-700">
                          Página {currentPage} de {totalPages}
                        </span>
                        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-500 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 disabled:opacity-50">
                          <ChevronRightIcon className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  )}
                </div>
              )}
              {/* --- TAB FORNECEDORES --- */}
              {activeTab === "fornecedores" && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Fornecedores Vinculados</h2>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{fornecedoresDoProcesso.length} fornecedores no total.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFornecedorSelecionado(null);
                        setIsFornecedorModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#004aad] rounded-md shadow-sm hover:bg-[#003d91]"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Adicionar Fornecedor
                    </button>
                  </div>
                  <FornecedorTable
                    fornecedores={currentFornecedores}
                    handleAskDelete={handleAskDelete}
                    onEdit={handleEditFornecedor}
                  />
                  {totalPagesForn > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span>Exibir</span>
                        <select value={itemsPerPageForn} onChange={(e) => { setItemsPerPageForn(Number(e.target.value)); setCurrentPageForn(1); }} className={`${inputStyle} w-auto`}>
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                        </select>
                        <span>por página</span>
                      </div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                        <button onClick={() => setCurrentPageForn(p => Math.max(p - 1, 1))} disabled={currentPageForn === 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-500 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 disabled:opacity-50"><ChevronLeftIcon className="h-5 w-5" /></button>
                        <span className="relative hidden md:inline-flex items-center px-4 py-2 text-sm font-bold ring-1 ring-inset ring-slate-200 dark:ring-slate-700">Página {currentPageForn} de {totalPagesForn}</span>
                        <button onClick={() => setCurrentPageForn(p => Math.min(p + 1, totalPagesForn))} disabled={currentPageForn === totalPagesForn || totalPagesForn === 0} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-500 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 disabled:opacity-50"><ChevronRightIcon className="h-5 w-5" /></button>
                      </nav>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}
