import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrashIcon, PlusIcon, PencilIcon, ClipboardDocumentIcon, CalendarDaysIcon,
    ClockIcon, DocumentTextIcon, ChevronLeftIcon, ChevronRightIcon, ArrowDownTrayIcon,
    BuildingOffice2Icon, CheckCircleIcon, NoSymbolIcon, ArchiveBoxIcon,
    ExclamationCircleIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';

import axios from 'axios';

import useAxios from '../hooks/useAxios';
import { useToast } from '../context/ToastContext';
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

// --- CONSTANTES ---
const modalidades = ['Pregão Eletrônico', 'Concorrência Eletrônica', 'Dispensa Eletrônica', 'Adesão a Registro de Preços', 'Credenciamento', 'Inexigibilidade Eletrônica'];
const classificacoes = ['Compras', 'Serviços Comuns', 'Serviços de Engenharia Comuns', 'Obras Comuns'];
const organizacoes = ['Lote', 'Item'];
const situacoes = ['Aberto', 'Em Pesquisa', 'Aguardando Publicação', 'Publicado', 'Em Contratação', 'Adjudicado/Homologado', 'Revogado/Cancelado'];

// --- ESTILOS REUTILIZÁVEIS ---
const inputStyle = "w-full px-3 py-1.5 text-sm border rounded-md bg-light-bg-secondary border-light-border dark:bg-dark-bg-secondary dark:border-dark-border focus:ring-1 focus:ring-accent-blue focus:border-accent-blue";
const labelStyle = "text-xs font-medium text-slate-500 dark:text-dark-text-secondary ";

// --- FUNÇÕES HELPER ---
const formatDateTimeForInput = (isoString) => {
    if (!isoString) return '';
    try {
        const d = new Date(isoString);
        const timezoneOffset = d.getTimezoneOffset() * 60000;
        const localDate = new Date(d.getTime() - timezoneOffset);
        return localDate.toISOString().slice(0, 16);
    } catch { return ''; }
};

const formatDate = (dateString) => {
    if (!dateString) return 'Não informado';
    // Adiciona T00:00:00-03:00 para garantir que a data seja interpretada no fuso horário correto (Brasília)
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo' };
    return new Date(dateString + 'T00:00:00-03:00').toLocaleDateString('pt-BR', options);
};

const formatDateTime = (isoString) => {
    if (!isoString) return 'Não informada';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' };
    return new Date(isoString).toLocaleDateString('pt-BR', options).replace(',', ' às');
};

const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'Não informado';
    return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// --- COMPONENTES DE UI REUTILIZÁVEIS ---
const DetailItem = ({ label, value, children }) => (
    <div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
        <div className="text-sm font-semibold text-slate-800 dark:text-dark-text-primary flex items-center gap-2 mt-1">
            {children}
            <span>{value || 'Não informado'}</span>
        </div>
    </div>
);

const StatusTag = ({ status }) => {
    const statusStyles = {
        'Publicado': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        'Adjudicado/Homologado': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        'Em Pesquisa': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        'Aberto': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        'Revogado/Cancelado': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        'default': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    };
    const style = statusStyles[status] || statusStyles.default;
    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${style}`}>
            <ArrowPathIcon className="w-4 h-4" />
            {status}
        </div>
    );
};

const ActionButton = ({ text, onClick, variant = 'primary', icon: Icon, disabled = false }) => {
    const baseStyle = "flex items-center justify-center gap-2 px-6 py-2.5 rounded-md font-semibold text-sm transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";
    const styles = {
        primary: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-2 focus:ring-orange-400',
        secondary: 'bg-teal-500 text-white hover:bg-teal-600 focus:ring-2 focus:ring-teal-400',
        outlined: 'bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-dark-border text-slate-700 dark:text-dark-text-secondary hover:bg-slate-50 dark:hover:bg-dark-bg-tertiary',
    };
    return (
        <button onClick={onClick} className={`${baseStyle} ${styles[variant]}`} disabled={disabled}>
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
        className={`px-1 py-4 text-sm font-semibold border-b-2 transition-colors relative
        ${isActive
            ? 'text-teal-500 border-teal-500'
            : isDisabled
                ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed border-transparent'
                : 'text-slate-500 hover:text-slate-800 dark:text-dark-text-secondary dark:hover:text-dark-text-primary border-transparent'
        }`}
    >
        {label}
    </button>
);

const StyledCheckbox = ({ checked, onChange, className = "" }) => {
    return (
        <label className={`relative inline-flex items-center justify-center cursor-pointer select-none ${className}`} aria-checked={checked} role="checkbox">
            <input type="checkbox" checked={checked} onChange={onChange} className="peer absolute inset-0 z-20 m-0 h-full w-full cursor-pointer opacity-0" />
            <div className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded border-2 border-slate-300 dark:border-dark-border transition-colors duration-200 peer-checked:border-teal-500 peer-checked:bg-teal-500`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`h-3 w-3 text-white transition-opacity duration-200 ${checked ? 'opacity-100' : 'opacity-0'}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
            </div>
        </label>
    );
};

// --- COMPONENTES MODAIS ---
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
        if (typeof onSave === 'function') {
        onSave(formData);
        } else {
        console.log('Fornecedor salvo (simulação):', formData);
        } 
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="bg-white dark:bg-dark-bg-secondary p-6 rounded-xl w-full max-w-lg shadow-2xl"
            >
                <h3 className="text-lg font-bold mb-4">{itemSelecionado ? 'Editar Item' : 'Adicionar Item'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="descricao" placeholder="Descrição" value={formData.descricao} onChange={handleChange} className={inputStyle} required />
                    <input name="unidade" placeholder="Unidade" value={formData.unidade} onChange={handleChange} className={inputStyle} />
                    <input name="quantidade" type="number" placeholder="Quantidade" value={formData.quantidade} onChange={handleChange} className={inputStyle} required />
                    <input name="valor_estimado" type="number" step="0.01" placeholder="Valor Estimado" value={formData.valor_estimado} onChange={handleChange} className={inputStyle} required />

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
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
      console.log('Retorno da BrasilAPI:', data);
      setFormData({
  ...formData,
  razao_social: data.razao_social || '',
  nome_fantasia: data.nome_fantasia || '',
  porte: data.porte || '',
  telefone: data.telefone || '',  // ✅ novo campo
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="bg-white dark:bg-dark-bg-secondary p-6 rounded-xl shadow-2xl w-full max-w-6xl"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
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
              className="text-sm text-blue-600 hover:underline"
            >
              {isCreating ? 'Buscar no Catálogo' : 'Novo Fornecedor'}
            </button>
          )}
        </div>

        {showForm ? (
          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block font-medium">CNPJ</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
                {!isEditing && (
                  <button
                    type="button"
                    onClick={buscarCNPJ}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500"
                  >
                    Buscar
                  </button>
                )}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block font-medium">Razão Social</label>
              <input
                type="text"
                name="razao_social"
                value={formData.razao_social}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>

            {[
  'nome_fantasia',
  'porte',
  'telefone',
  'email',
  'cep',
  'logradouro',
  'numero',
  'bairro',
  'complemento',
  'uf',
  'municipio',
].map((field) => (
              <div key={field}>
                <label className="block font-medium capitalize">{field.replace('_', ' ')}</label>
                <input
                  name={field}
                  value={formData[field] || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            ))}

            <div className="col-span-3 flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-500 disabled:opacity-70"
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Buscar por CNPJ ou Razão Social..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
            />
            <div className="max-h-64 overflow-y-auto border rounded-lg divide-y">
              {filteredCatalogo.map((f) => (
                <div
                  key={f.id}
                  className="p-3 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary"
                >
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{f.razao_social}</p>
                    <p className="text-sm text-gray-500">{f.cnpj}</p>
                  </div>
                  <button
                    onClick={() => onLink(f.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
                  >
                    Vincular
                  </button>
                </div>
              ))}
              {filteredCatalogo.length === 0 && (
                <p className="p-4 text-center text-gray-500">Nenhum fornecedor encontrado.</p>
              )}
            </div>
             <div className="col-span-3 flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// --- COMPONENTES DE TABELA ---
const ItensTable = ({ itens, onEdit, handleAskDelete, selectedItems, onSelectItem, onSelectAll, areAllSelected }) => (
    <div className="overflow-x-auto rounded-lg border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary shadow-sm">
        <table className="w-full divide-y divide-light-border dark:divide-dark-border">
            <thead className="bg-gray-100 dark:bg-dark-bg-tertiary">
                <tr>
                    <th className="py-3 px-4 text-left">
                        <StyledCheckbox checked={areAllSelected} onChange={onSelectAll} />
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Descrição</th>
                    <th className="py-3 px-3 text-left text-xs font-semibold uppercase tracking-wider">Quantidade</th>
                    <th className="py-3 px-3 text-left text-xs font-semibold uppercase tracking-wider">Valor</th>
                    <th className="py-3 px-6 text-center text-xs font-semibold uppercase tracking-wider">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
                {itens.map(item => (
                    <tr key={item.id} className={`hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary ${selectedItems.has(item.id) ? 'bg-teal-50 dark:bg-teal-900/20' : ''}`}>
                        <td className="py-4 px-4">
                            <StyledCheckbox checked={selectedItems.has(item.id)} onChange={() => onSelectItem(item.id)} />
                        </td>
                        <td className="py-4 px-4 text-sm">{item.descricao}</td>
                        <td className="px-3 py-4 text-sm">{item.quantidade}</td>
                        <td className="px-3 py-4 text-sm">{formatCurrency(item.valor_estimado)}</td>
                        <td className="py-4 px-6 text-center text-sm font-medium flex gap-3 justify-center">
                            <button onClick={() => onEdit(item)} title="Editar" className="text-blue-500 hover:text-blue-400">
                                <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleAskDelete("item", item)}
                                title="Remover"
                                className="text-red-600 hover:text-red-800"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>

        {itens.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <ClipboardDocumentIcon className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                <p className="mt-4 text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">Nenhum item adicionado</p>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Clique em “Adicionar Item” para cadastrar um.</p>
            </div>
        )}
    </div>
);

const FornecedorTable = ({ fornecedores, handleAskDelete, onEdit }) => (
  <div className="overflow-x-auto rounded-lg border bg-white dark:bg-dark-bg-secondary shadow-sm">
    <table className="w-full divide-y">
      <thead className="bg-gray-100 dark:bg-dark-bg-tertiary">
        <tr>
          <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Fornecedor</th>
          <th className="py-3 px-3 text-left text-xs font-semibold uppercase tracking-wider">CNPJ</th>
          <th className="py-3 px-3 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
          <th className="py-3 px-6 text-center text-xs font-semibold uppercase tracking-wider">Ações</th>
        </tr>
      </thead>
      <tbody>
        {fornecedores.length > 0 ? (
          fornecedores.map((forn) => (
            <tr key={forn.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary">
              <td className="py-4 px-6">{forn.razao_social}</td>
              <td className="px-3 py-4">{forn.cnpj}</td>
              <td className="px-3 py-4">{forn.email}</td>
              <td className="px-6 py-4 text-center space-x-4">
                <button onClick={() => onEdit(forn)} className="text-blue-500 hover:text-blue-400">
                  <PencilIcon className="w-5 h-5 inline" />
                </button>
                <button
                  onClick={() => handleAskDelete('fornecedor', forn)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="w-5 h-5 inline" />
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4" className="text-center py-8">
              <BuildingOffice2Icon className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="mt-2 text-sm font-semibold text-gray-600">
                Nenhum fornecedor vinculado ao processo.
              </p>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function PaginaProcesso() {
    const { id } = useParams();
    const navigate = useNavigate();
    const api = useAxios();
    const { showToast } = useToast();

    // Page Control State
    const isNewProcess = !id;
    const [processoId, setProcessoId] = useState(id || null);
    const [activeTab, setActiveTab] = useState("dadosGerais");
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(isNewProcess);

    // Form and Data State
    const [formData, setFormData] = useState({ objeto: '', numero_processo: '', data_processo: '', modalidade: '', classificacao: '', tipo_organizacao: '', registro_precos: false, orgao: '', entidade: '', valor_referencia: '', numero_certame: '', data_abertura: '', situacao: 'Em Pesquisa', vigencia_meses: 12 });
    const [itens, setItens] = useState([]); // Unificado: `itens` e `itensDoProcesso` agora são um só.
    const [fornecedoresDoProcesso, setFornecedoresDoProcesso] = useState([]);
    const [entidades, setEntidades] = useState([]);
    const [orgaos, setOrgaos] = useState([]);
    const [catalogoFornecedores, setCatalogoFornecedores] = useState([]);
    const [entidadeNome, setEntidadeNome] = useState('');
    const [orgaoNome, setOrgaoNome] = useState('');

    // Modal Control State
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
            // `itens` agora é carregado por `fetchItens`
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
            console.error("Erro ao buscar itens:", error);
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

    // --- EFEITOS ---
    useEffect(() => {
        fetchAuxiliares();
        if (id) {
            fetchDadosDoProcesso(id);
            fetchItens(id); // Carrega itens separadamente
            fetchFornecedoresDoProcesso(id); // Carrega fornecedores separadamente
        }
    }, [id, fetchDadosDoProcesso, fetchAuxiliares, fetchItens, fetchFornecedoresDoProcesso]);


    useEffect(() => {
        if (formData.entidade) {
            api.get(`/orgaos/?entidade=${formData.entidade}`).then(res => setOrgaos(res.data)).catch(() => setOrgaos([]));
        } else { setOrgaos([]); }
    }, [formData.entidade, api]);

    // --- HANDLERS DADOS GERAIS ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = name === "registro_precos" ? value === "true" : (type === "checkbox" ? checked : value);
        setFormData((prev) => ({ ...prev, [name]: finalValue }));
        if (name === 'entidade' && formData.entidade !== value) { setFormData(prev => ({ ...prev, orgao: '' })); }
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
                setActiveTab("itens"); // Avança para a próxima aba
            } else {
                fetchDadosDoProcesso(updatedData.id); // Recarrega os dados
                setIsEditing(false); // Sai do modo de edição
            }
        } catch { showToast("Erro ao salvar o processo.", "error"); }
        finally { setIsLoading(false); }
    };

    // --- HANDLERS ITENS ---
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
            fetchItens(processoId); // Recarrega a lista de itens
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
        // Usa a lista de 'itens' completa para filtrar
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

// --- HANDLERS FORNECEDORES ---
const handleLinkFornecedor = async (fornecedorId) => {
  setIsFornecedorModalOpen(false);
  try {
    await api.post(`/processos/${processoId}/adicionar_fornecedor/`, { fornecedor_id: fornecedorId });
    showToast('Fornecedor vinculado!', 'success');
    fetchFornecedoresDoProcesso(processoId);
  } catch (err) {
    console.error('Erro ao vincular fornecedor:', err);
    showToast('Erro ao vincular fornecedor.', 'error');
  }
};

// 👉 Salva um novo fornecedor e já vincula ao processo
const handleSaveNewAndLinkFornecedor = async (newFornecedor) => {
  try {
    // cadastra fornecedor novo no backend
    const res = await api.post('/fornecedores/', newFornecedor);
    const fornecedorCriado = res.data;

    // adiciona ao catálogo e vincula ao processo
    setCatalogoFornecedores((prev) => [fornecedorCriado, ...prev]);
    await handleLinkFornecedor(fornecedorCriado.id);
  } catch (err) {
    console.error('Erro ao cadastrar e vincular fornecedor:', err);
    showToast('Erro ao cadastrar fornecedor.', 'error');
  }
};

// 👉 Abre o modal já no modo de edição
const handleEditFornecedor = (fornecedor) => {
  setFornecedorSelecionado(fornecedor);
  setIsFornecedorModalOpen(true);
};

// 👉 Atualiza fornecedor editado (sem refazer fetch)
const handleUpdateEditedFornecedor = async (fornecedorAtualizado) => {
  try {
    const res = await api.put(`/fornecedores/${fornecedorAtualizado.id}/`, fornecedorAtualizado);
    const fornecedorEditado = res.data;

    // atualiza nas duas listas (processo e catálogo)
    setFornecedoresDoProcesso((prev) =>
      prev.map((f) => (f.id === fornecedorEditado.id ? fornecedorEditado : f))
    );
    setCatalogoFornecedores((prev) =>
      prev.map((f) => (f.id === fornecedorEditado.id ? fornecedorEditado : f))
    );

    showToast('Fornecedor atualizado.', 'success');
    setFornecedorSelecionado(null);
    setIsFornecedorModalOpen(false);
  } catch (err) {
    console.error('Erro ao atualizar fornecedor:', err);
    showToast('Erro ao atualizar fornecedor.', 'error');
  }
};

// --- HANDLER DE CONFIRMAÇÃO DE EXCLUSÃO ---
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
  } catch (error) {
    console.error('Erro ao remover:', error);
    showToast('Erro ao remover.', 'error');
  } finally {
    setShowConfirmModal(false);
    setItemToDelete(null);
    setDeleteType(null);
  }
};

return (
            <>
                {/* --- MODAIS --- */}
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

            {/* --- LAYOUT DA PÁGINA --- */}
            <div className="bg-slate-50 dark:bg-dark-bg-primary p-4 sm:p-6 lg:p-8 min-h-full">
                <div className="max-w-7xl mx-auto">

                    {/* Cabeçalho */}
                    <header className="flex items-center justify-between mb-2">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-dark-text-primary">
                                {isNewProcess ? "Novo Processo Licitatório" : `Processo Nº ${formData.numero_processo || '...'}`}
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-dark-text-secondary mt-1">
                                {isNewProcess ? "Preencha os dados para iniciar um novo processo." : "Acompanhe e controle as principais informações sobre este processo."}
                            </p>
                        </div>
                    </header>

                    {/* Painel Principal com Abas */}
                    <div className="bg-white dark:bg-dark-bg-secondary rounded-lg border border-slate-200 dark:border-dark-border shadow-sm">
                        <nav className="flex gap-6 px-6 border-b border-slate-200 dark:border-dark-border">
                            <TabButton label="Visão Geral" isActive={activeTab === "dadosGerais"} onClick={() => setActiveTab("dadosGerais")} />
                            <TabButton label="Itens do Processo" isActive={activeTab === "itens"} onClick={() => setActiveTab("itens")} isDisabled={isNewProcess} />
                            <TabButton label="Fornecedores" isActive={activeTab === "fornecedores"} onClick={() => setActiveTab("fornecedores")} isDisabled={isNewProcess} />
                        </nav>

                        <main className="p-6">
                            <AnimatePresence mode="wait">
                                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

                                    {/* --- ABA DADOS GERAIS --- */}
                                    {activeTab === "dadosGerais" && (
                                        isEditing ? (
                                            // MODO DE EDIÇÃO (FORMULÁRIO)
                                            <form onSubmit={handleSaveDadosGerais} className="space-y-6">
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div><label className={labelStyle}>Objeto *</label><textarea name="objeto" value={formData.objeto} onChange={handleChange} className={`${inputStyle} h-24`} required /></div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div><label className={labelStyle}>Nº do Processo*</label><input name="numero_processo" value={formData.numero_processo} onChange={handleChange} className={inputStyle} required /></div>
                                                        <div><label className={labelStyle}>Data do Processo*</label><input name="data_processo" type="date" value={formData.data_processo} onChange={handleChange} className={inputStyle} required /></div>
                                                        <div><label className={labelStyle}>Nº do Certame</label><input name="numero_certame" value={formData.numero_certame || ''} onChange={handleChange} className={inputStyle} /></div>
                                                        <div><label className={labelStyle}>Data/Hora Abertura</label><input name="data_abertura" type="datetime-local" value={formData.data_abertura || ''} onChange={handleChange} className={inputStyle} /></div>
                                                    </div>
                                                </div>
                                                <div className="grid md:grid-cols-4 gap-6">
                                                    <div><label className={labelStyle}>Modalidade *</label><select name="modalidade" value={formData.modalidade} onChange={handleChange} className={inputStyle} required><option value="">Selecione...</option>{modalidades.map(m => (<option key={m} value={m}>{m}</option>))}</select></div>
                                                    <div><label className={labelStyle}>Classificação *</label><select name="classificacao" value={formData.classificacao} onChange={handleChange} className={inputStyle} required><option value="">Selecione...</option>{classificacoes.map(c => (<option key={c} value={c}>{c}</option>))}</select></div>
                                                    <div><label className={labelStyle}>Organização *</label><select name="tipo_organizacao" value={formData.tipo_organizacao} onChange={handleChange} className={inputStyle} required><option value="">Selecione...</option>{organizacoes.map(o => (<option key={o} value={o}>{o}</option>))}</select></div>
                                                    <div><label className={labelStyle}>Situação *</label><select name="situacao" value={formData.situacao} onChange={handleChange} className={inputStyle} required>{situacoes.map(s => (<option key={s} value={s}>{s}</option>))}</select></div>
                                                </div>
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div><label className={labelStyle}>Entidade *</label><select name="entidade" value={formData.entidade} onChange={handleChange} className={inputStyle} required><option value="">Selecione...</option>{entidades.map(e => (<option key={e.id} value={e.id}>{e.nome}</option>))}</select></div>
                                                    <div><label className={labelStyle}>Órgão *</label><select name="orgao" value={formData.orgao} onChange={handleChange} className={inputStyle} required disabled={!formData.entidade || orgaos.length === 0}><option value="">{formData.entidade ? 'Selecione...' : 'Selecione uma entidade'}</option>{orgaos.map(o => (<option key={o.id} value={o.id}>{o.nome}</option>))}</select></div>
                                                </div>
                                                <div className="grid md:grid-cols-4 gap-6">
                                                    <div><label className={labelStyle}>Valor de Referência (R$)</label><input name="valor_referencia" type="number" step="0.01" value={formData.valor_referencia || ''} onChange={handleChange} placeholder="0,00" className={`${inputStyle} text-right`} /></div>
                                                    <div><label className={labelStyle}>Vigência (Meses)*</label><input name="vigencia_meses" type="number" min="1" value={formData.vigencia_meses || ''} onChange={handleChange} placeholder="12" className={`${inputStyle} text-center`} /></div>
                                                </div>

                                                <div className="flex justify-center gap-4 pt-6 border-t border-slate-200 dark:border-dark-border">
                                                    <ActionButton text={isNewProcess ? "Cancelar" : "Cancelar Edição"} onClick={() => isNewProcess ? navigate(-1) : setIsEditing(false)} variant="outlined" />
                                                    <ActionButton text={isNewProcess ? "Salvar e Continuar" : "Salvar Alterações"} onClick={handleSaveDadosGerais} variant="primary" icon={CheckCircleIcon} disabled={isLoading} />
                                                </div>
                                            </form>
                                        ) : (
                                            // MODO DE VISUALIZAÇÃO
                                            <div>
                                                <div className="flex justify-between items-start mb-8">
                                                    <div>
                                                        <h2 className="font-bold text-lg text-slate-800 dark:text-dark-text-primary">Detalhes da Licitação</h2>
                                                        <p className="text-sm text-slate-500 dark:text-dark-text-secondary">{formData.objeto}</p>
                                                    </div>
                                                    <button onClick={() => setIsEditing(true)} className="text-sm font-semibold text-teal-500 hover:text-teal-600 flex items-center gap-1">
                                                        <PencilIcon className="w-4 h-4" />
                                                        Editar
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
                                                    <DetailItem label="Status"><StatusTag status={formData.situacao} /></DetailItem>
                                                    <DetailItem label="Abertura" value={formatDateTime(formData.data_abertura)}><CalendarDaysIcon className="w-5 h-5 text-slate-400" /></DetailItem>
                                                    <DetailItem label="Modalidade" value={formData.modalidade} />
                                                    <DetailItem label="Valor Estimado" value={formatCurrency(formData.valor_referencia)} />
                                                    <DetailItem label="Vigência (Meses)" value={formData.vigencia_meses} />
                                                    <DetailItem label="Nº do Certame" value={formData.numero_certame} />
                                                    <DetailItem label="Data do Processo" value={formatDate(formData.data_processo)} />
                                                    <DetailItem label="Entidade" value={entidadeNome} />
                                                    <DetailItem label="Órgão" value={orgaoNome} />
                                                    <DetailItem label="Registro de Preço" value={formData.registro_precos ? 'Sim' : 'Não'} />
                                                </div>

                                                <div className="flex justify-center items-center gap-4 pt-8 mt-8 border-t border-slate-200 dark:border-dark-border">
                                                    <ActionButton text="Gerar Relatório" onClick={() => alert('Função não implementada')} variant="outlined" />
                                                    <ActionButton text="Anexar Arquivos" onClick={() => alert('Função não implementada')} variant="outlined" />
                                                    <ActionButton text="Analisar Edital" onClick={() => alert('Função não implementada')} variant="secondary" />
                                                </div>
                                            </div>
                                        )
                                    )}

                                    {/* --- ABA ITENS --- */}
                                    {activeTab === "itens" && (
                                        <div className="space-y-6">
                                            <div className="sm:flex sm:items-center sm:justify-between">
                                                <div>
                                                    <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Itens do Processo</h2>
                                                    <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">{itens.length} itens no total. {selectedItems.size > 0 && `${selectedItems.size} selecionado(s).`}</p>
                                                </div>
                                                <div className="mt-4 sm:mt-0 flex items-center gap-3">
                                                    <button type="button" className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-dark-bg-tertiary disabled:opacity-50" onClick={handleExportItems} disabled={selectedItems.size === 0}><ArrowDownTrayIcon className="w-5 h-5" />Exportar</button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setItemSelecionado(null);
                                                            setIsItemModalOpen(true);
                                                        }}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700"
                                                    >
                                                        <PlusIcon className="w-5 h-5" />
                                                        Adicionar Item
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <ItensTable
                                                itens={currentItems} // Passando itens paginados
                                                onEdit={(item) => {
                                                    setItemSelecionado(item);
                                                    setIsItemModalOpen(true);
                                                }}
                                                handleAskDelete={handleAskDelete} // Passando o handler correto
                                                selectedItems={selectedItems}
                                                onSelectItem={handleSelectItem}
                                                onSelectAll={handleSelectAll}
                                                areAllSelected={areAllCurrentItemsSelected}
                                            />
                                            
                                            {totalPages > 1 && (
                                                <div className="flex items-center justify-between pt-4 border-t border-light-border dark:border-dark-border">
                                                    <div className="flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                                        <span>Exibir</span>
                                                        <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); setSelectedItems(new Set()); }} className={`${inputStyle} shadow-sm w-auto`}>
                                                            <option value={5}>5</option>
                                                            <option value={10}>10</option>
                                                            <option value={20}>20</option>
                                                        </select>
                                                        <span>por página</span>
                                                    </div>
                                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                                                        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-light-border dark:ring-dark-border hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary disabled:opacity-50"><ChevronLeftIcon className="h-5 w-5" /></button>
                                                        <span className="relative hidden items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-light-border dark:ring-dark-border md:inline-flex">Página {currentPage} de {totalPages}</span>
                                                        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-light-border dark:ring-dark-border hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary disabled:opacity-50"><ChevronRightIcon className="h-5 w-5" /></button>
                                                    </nav>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* --- ABA FORNECEDORES --- */}
                                    {activeTab === "fornecedores" && (
                                        <div className="space-y-6">
                                            <div className="sm:flex sm:items-center sm:justify-between">
                                                <div>
                                                    <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Fornecedores Vinculados</h2>
                                                    <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">{fornecedoresDoProcesso.length} fornecedores no total.</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFornecedorSelecionado(null);
                                                        setIsFornecedorModalOpen(true);
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-500 border border-transparent rounded-md shadow-sm hover:bg-teal-600"
                                                >
                                                    <PlusIcon className="w-5 h-5" />
                                                    Adicionar Fornecedor
                                                </button>
                                            </div>
                                            
                                            <FornecedorTable
                                                fornecedores={currentFornecedores} // Passando fornecedores paginados
                                                handleAskDelete={handleAskDelete} // Passando o handler correto
                                                onEdit={handleEditFornecedor}
                                            />
                                            
                                            {totalPagesForn > 1 && (
                                                <div className="flex items-center justify-between pt-4 border-t border-light-border dark:border-dark-border">
                                                    <div className="flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                                        <span>Exibir</span>
                                                        <select value={itemsPerPageForn} onChange={(e) => { setItemsPerPageForn(Number(e.target.value)); setCurrentPageForn(1); }} className={`${inputStyle} shadow-sm w-auto`}>
                                                            <option value={5}>5</option>
                                                            <option value={10}>10</option>
                                                            <option value={20}>20</option>
                                                        </select>
                                                        <span>por página</span>
                                                    </div>
                                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                                                        <button onClick={() => setCurrentPageForn(p => Math.max(p - 1, 1))} disabled={currentPageForn === 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-light-border dark:ring-dark-border hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary disabled:opacity-50"><ChevronLeftIcon className="h-5 w-5" /></button>
                                                        <span className="relative hidden items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-light-border dark:ring-dark-border md:inline-flex">Página {currentPageForn} de {totalPagesForn}</span>
                                                        <button onClick={() => setCurrentPageForn(p => Math.min(p + 1, totalPagesForn))} disabled={currentPageForn === totalPagesForn || totalPagesForn === 0} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-light-border dark:ring-dark-border hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary disabled:opacity-50"><ChevronRightIcon className="h-5 w-5" /></button>
                                                    </nav>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </motion.div>
                            </AnimatePresence>
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
