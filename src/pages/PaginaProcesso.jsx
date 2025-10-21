// frontend/src/pages/PaginaProcesso.jsx
 
import React,{ useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/solid';
import { DocumentTextIcon, ChevronLeftIcon, ChevronRightIcon, ArrowDownTrayIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';
import useAxios from '../hooks/useAxios';
import { useToast } from '../context/ToastContext';

// --- UTILS & CONSTANTS ---
const formatDateTimeForInput = (isoString) => {
    if (!isoString) return '';
    try {
        const d = new Date(isoString);
        const timezoneOffset = d.getTimezoneOffset() * 60000;
        const localDate = new Date(d.getTime() - timezoneOffset);
        return localDate.toISOString().slice(0, 16);
    } catch { return ''; }
};

const modalidades = ['Pregão Eletrônico', 'Concorrência Eletrônica', 'Dispensa Eletrônica', 'Adesão a Registro de Preços', 'Credenciamento', 'Inexigibilidade Eletrônica'];
const classificacoes = ['Compras', 'Serviços Comuns', 'Serviços de Engenharia Comuns', 'Obras Comuns'];
const organizacoes = ['Lote', 'Item'];
const situacoes = ['Aberto', 'Em Pesquisa', 'Aguardando Publicação', 'Publicado', 'Em Contratação', 'Adjudicado/Homologado', 'Revogado/Cancelado'];

// Estilos Reutilizáveis com base no tema original
const inputStyle = "w-full px-3 py-1.5 text-sm border rounded-lg bg-light-bg-secondary border-light-border dark:bg-dark-bg-secondary dark:border-dark-border focus:ring-1 focus:ring-accent-blue focus:border-accent-blue";
const labelStyle = "text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary";

// --- MODULAR UI COMPONENTS ---

const TabButton = ({ label, isActive, onClick, isDisabled }) => (
    <button type="button" onClick={onClick} disabled={isDisabled} className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors relative ${isActive ? 'text-accent-blue border-accent-blue' : isDisabled ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed border-transparent' : 'text-light-text-secondary hover:text-light-text-primary dark:text-dark-text-secondary dark:hover:text-dark-text-primary border-transparent'}`}>
        {label}
        {isActive && <motion.div layoutId="activeTabIndicator" className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-accent-blue" />}
    </button>
);

const ItemModal = ({ isOpen, onClose, item, onSave }) => {
    const [formData, setFormData] = useState({ descricao: '', especificacao: '', unidade: '', quantidade: 1 });
    useEffect(() => { if (isOpen) { setFormData(item || { descricao: '', especificacao: '', unidade: '', quantidade: 1 }); } }, [item, isOpen]);
    if (!isOpen) return null;
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-xl shadow-2xl w-full max-w-lg border border-light-border dark:border-dark-border">
                <h3 className="text-lg font-bold mb-5 text-light-text-primary dark:text-dark-text-primary">{item ? 'Editar Item' : 'Adicionar Novo Item'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className={labelStyle}>Descrição *</label><input type="text" name="descricao" value={formData.descricao} onChange={handleChange} className={inputStyle} required /></div>
                    <div><label className={labelStyle}>Especificação</label><textarea name="especificacao" value={formData.especificacao || ''} onChange={handleChange} className={`${inputStyle} h-24`} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelStyle}>Unidade *</label><input name="unidade" value={formData.unidade} onChange={handleChange} className={inputStyle} required /></div>
                        <div><label className={labelStyle}>Quantidade *</label><input name="quantidade" type="number" step="0.01" value={formData.quantidade} onChange={handleChange} className={inputStyle} required /></div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border text-sm font-medium hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary">Cancelar</button><button type="submit" className="px-5 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-blue-700">Salvar</button></div>
                </form>
            </motion.div>
        </div>
    );
};

const FornecedorModal = ({ isOpen, onClose, onLink, onSaveNew, catalogo }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [newFornForm, setNewFornForm] = useState({ razao_social: '', cnpj: '', email: '', telefone: '' });
    const api = useAxios();
    const { showToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => { if (!isOpen) { setSearchTerm(''); setIsCreating(false); setNewFornForm({ razao_social: '', cnpj: '', email: '', telefone: '' }); } }, [isOpen]);
    if (!isOpen) return null;

    const filteredCatalogo = catalogo.filter(f => {
        const term = searchTerm.toLowerCase();
        return f.razao_social.toLowerCase().includes(term) || f.cnpj.includes(term);
    });

    const handleNewFornChange = (e) => setNewFornForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSaveNewSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await api.post('/fornecedores/', newFornForm);
            showToast('Fornecedor criado!', 'success');
            onSaveNew(res.data);
        } catch { showToast('Erro ao criar fornecedor.', 'error'); } 
        finally { setIsSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-xl shadow-2xl w-full max-w-2xl border border-light-border dark:border-dark-border">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">{isCreating ? "Cadastrar Novo Fornecedor" : "Adicionar Fornecedor"}</h3>
                    <button type="button" onClick={() => setIsCreating(!isCreating)} className="text-sm text-accent-blue hover:underline">{isCreating ? "Buscar no Catálogo" : "Novo Fornecedor"}</button>
                </div>
                {isCreating ? (
                    <form onSubmit={handleSaveNewSubmit} className="space-y-4">
                        <div><label className={labelStyle}>Razão Social *</label><input name="razao_social" value={newFornForm.razao_social} onChange={handleNewFornChange} className={inputStyle} required /></div>
                        <div><label className={labelStyle}>CNPJ *</label><input name="cnpj" value={newFornForm.cnpj} onChange={handleNewFornChange} className={inputStyle} required /></div>
                        <div><label className={labelStyle}>Email</label><input name="email" type="email" value={newFornForm.email} onChange={handleNewFornChange} className={inputStyle} /></div>
                        <div><label className={labelStyle}>Telefone</label><input name="telefone" value={newFornForm.telefone} onChange={handleNewFornChange} className={inputStyle} /></div>
                        <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border text-sm font-medium hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary">Cancelar</button><button type="submit" disabled={isSaving} className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-green-400">{isSaving ? 'Salvando...':'Salvar e Vincular'}</button></div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <input type="text" placeholder="Buscar por CNPJ ou Razão Social..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={inputStyle} />
                        <div className="max-h-64 overflow-y-auto border rounded-lg divide-y divide-light-border dark:divide-dark-border">
                            {filteredCatalogo.map(f => (
                                <div key={f.id} className="p-3 flex justify-between items-center hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary">
                                    <div><p className="font-semibold text-light-text-primary dark:text-dark-text-primary">{f.razao_social}</p><p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{f.cnpj}</p></div>
                                    <button onClick={() => onLink(f.id)} className="px-4 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-blue-700">Vincular</button>
                                </div>
                            ))}
                            {filteredCatalogo.length === 0 && <p className="p-4 text-center text-light-text-secondary dark:text-dark-text-secondary">Nenhum fornecedor encontrado.</p>}
                        </div>
                        <div className="flex justify-end"><button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border text-sm font-medium hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary">Fechar</button></div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

// SUBSTITUA O SEU ItemTable POR ESTE

const ItemTable = ({ itens, onEdit, onDelete, selectedItems, onSelectAll, onSelectItem, expandedItemId, onToggleExpand }) => (
    <div className="overflow-x-auto rounded-lg border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary shadow-sm">
        <table className="w-full divide-y divide-light-border dark:divide-dark-border table-fixed">
            <thead className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary">
                <tr>
                    <th scope="col" className="p-4 w-[%]">
                        {/* Usando o StyledCheckbox no cabeçalho */}
                        <StyledCheckbox
                            checked={itens.length > 0 && selectedItems.size === itens.length}
                            onChange={onSelectAll}
                        />
                    </th>
                    <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-light-text-primary dark:text-dark-text-primary sm:pl-6 w-[60%]">Item</th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-light-text-primary dark:text-dark-text-primary w-[10%]">Unidade</th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-light-text-primary dark:text-dark-text-primary w-[10%]">Quantidade</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-center text-sm font-semibold text-light-text-primary dark:text-dark-text-primary w-[15%]">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
                {itens.map((item) => (
                    <React.Fragment key={item.id}>
                        <tr className="hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary cursor-pointer" onClick={() => onToggleExpand(item.id)}>
                            <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                {/* Usando o StyledCheckbox em cada linha */}
                                <StyledCheckbox
                                    checked={selectedItems.has(item.id)}
                                    onChange={() => onSelectItem(item.id)}
                                />
                            </td>
                            <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                                <div className="flex items-center gap-4">
                                    <DocumentTextIcon className="h-8 w-8 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                    <div className="font-medium text-light-text-primary dark:text-dark-text-primary truncate" title={item.descricao}>
                                        {item.descricao}
                                    </div>
                                </div>
                            </td>
                            <td className="px-3 py-4 text-sm text-light-text-secondary dark:text-dark-text-secondary text-center">{item.unidade}</td>
                            <td className="px-3 py-4 text-sm text-light-text-secondary dark:text-dark-text-secondary text-center">{parseFloat(item.quantidade).toFixed(2)}</td>
                            <td className="relative py-4 pl-3 pr-4 text-center text-sm font-medium sm:pr-6">
                                <div className="flex justify-center items-center gap-4">
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} title="Editar" className="text-yellow-500 hover:text-yellow-400"><PencilIcon className="w-5 h-5"/></button>
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} title="Excluir" className="text-red-500 hover:text-red-400"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </td>
                        </tr>
                        {expandedItemId === item.id && (
                            <tr className="bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50">
                                <td colSpan={5} className="p-0">
                                    <div className="px-6 py-4">
                                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap">
                                            <strong className="font-semibold text-light-text-primary dark:text-dark-text-primary block mb-1">Especificação:</strong>
                                            {item.especificacao || "Nenhuma especificação informada."}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
            </tbody>
        </table>
        {itens.length === 0 && <p className="p-6 text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">Nenhum item adicionado.</p>}
    </div>
);

const FornecedorTable = ({ fornecedores, onRemove }) => (
    <div className="overflow-x-auto rounded-lg border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary shadow-sm">
        <table className="w-full divide-y divide-light-border dark:divide-dark-border table-fixed">
             <thead className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary">
                <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-light-text-primary dark:text-dark-text-primary sm:pl-6">Fornecedor</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">CNPJ</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-center text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
                {fornecedores.map(forn => (
                    <tr key={forn.id} className="hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary">
                        <td className="py-4 pl-4 pr-3 text-sm sm:pl-6"><div className="flex items-center"><BuildingOffice2Icon className="h-8 w-8 text-gray-400 dark:text-gray-500 mr-4 flex-shrink-0" /><div className="font-medium text-light-text-primary dark:text-dark-text-primary">{forn.razao_social}</div></div></td>
                        <td className="px-3 py-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">{forn.cnpj}</td>
                        <td className="relative py-4 pl-3 pr-4 text-center text-sm font-medium sm:pr-6"><button onClick={() => onRemove(forn.id)} title="Desvincular" className="text-red-500 hover:text-red-400"><TrashIcon className="w-5 h-5"/></button></td>
                    </tr>
                ))}
            </tbody>
        </table>
        {fornecedores.length === 0 && <p className="p-6 text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">Nenhum fornecedor vinculado.</p>}
    </div>
);

const StyledCheckbox = ({ checked, onChange }) => {
    return (
        <div className="relative flex items-center justify-center">
            {/* O checkbox real, escondido mas funcional */}
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="peer absolute h-5 w-5 cursor-pointer opacity-0"
            />

            {/* A caixa visual que será estilizada */}
            <div
                className={`flex h-5 w-5 items-center justify-center rounded border-2 
                border-light-border dark:border-dark-border 
                transition-colors duration-200 
                peer-checked:border-accent-blue peer-checked:bg-accent-blue`}
            >
                {/* O ícone de "check" que aparece quando está marcado */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke="currentColor"
                    className={`h-3 w-3 text-white transition-opacity duration-200 ${checked ? 'opacity-100' : 'opacity-0'}`}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
export default function PaginaProcesso() {
    const { id } = useParams();
    const navigate = useNavigate();
    const api = useAxios();
    const { showToast } = useToast();

    // Page Control State
    const isEditing = !!id;
    const [processoId, setProcessoId] = useState(id || null);
    const [activeTab, setActiveTab] = useState("dadosGerais");
    const [isLoading, setIsLoading] = useState(false);

    // Form and Data State
    const [formData, setFormData] = useState({ objeto: '', numero_processo: '', data_processo:'', modalidade: '', classificacao: '', tipo_organizacao: '', registro_precos: false, orgao: '', entidade: '', valor_referencia: '', numero_certame: '', data_abertura: '', situacao: 'Em Pesquisa', vigencia_meses: 12 });
    const [itens, setItens] = useState([]);
    const [fornecedoresDoProcesso, setFornecedoresDoProcesso] = useState([]);
    const [entidades, setEntidades] = useState([]);
    const [orgaos, setOrgaos] = useState([]);
    const [catalogoFornecedores, setCatalogoFornecedores] = useState([]);

    // Modal Control State
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isFornecedorModalOpen, setIsFornecedorModalOpen] = useState(false);

    // Item Table State
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [expandedItemId, setExpandedItemId] = useState(null);
    const currentItems = itens.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(itens.length / itemsPerPage);

    // Fornecedor Table State
    const [currentPageForn, setCurrentPageForn] = useState(1);
    const [itemsPerPageForn, setItemsPerPageForn] = useState(5);
    const currentFornecedores = fornecedoresDoProcesso.slice((currentPageForn - 1) * itemsPerPageForn, currentPageForn * itemsPerPageForn);
    const totalPagesForn = Math.ceil(fornecedoresDoProcesso.length / itemsPerPageForn);

    // --- DATA FETCHING ---
    const fetchDadosDoProcesso = useCallback(async (pid) => {
        if (!pid) return;
        setIsLoading(true);
        try {
            const res = await api.get(`/processos/${pid}/`);
            const data = res.data;
            setFormData({ ...formData, ...data, data_abertura: formatDateTimeForInput(data.data_abertura), data_processo: data.data_processo || '' });
            setItens((data.itens || []).sort((a, b) => (a.ordem || 0) - (b.ordem || 0)));
            setFornecedoresDoProcesso(data.fornecedores || []);
            setProcessoId(data.id);
        } catch (err) {
            showToast("Erro ao carregar dados do processo.", "error");
            navigate("/processos");
        } finally { setIsLoading(false); }
    }, [api, showToast, navigate]);

    const fetchAuxiliares = useCallback(async () => {
        try {
            const [entRes, fornRes] = await Promise.all([api.get('/entidades/'), api.get('/fornecedores/')]);
            setEntidades(entRes.data);
            setCatalogoFornecedores(fornRes.data);
        } catch { showToast('Erro ao carregar dados auxiliares.', 'error'); }
    }, [api, showToast]);

    useEffect(() => {
        fetchAuxiliares();
        if (isEditing && id) { fetchDadosDoProcesso(id); }
    }, [id, isEditing, fetchDadosDoProcesso, fetchAuxiliares]);
    
    useEffect(() => {
        if (formData.entidade) {
            api.get(`/orgaos/?entidade=${formData.entidade}`).then(res => setOrgaos(res.data)).catch(() => setOrgaos([]));
        } else { setOrgaos([]); }
    }, [formData.entidade, api]);

    // --- HANDLERS ---
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
            const res = isEditing ? await api.put(`/processos/${processoId}/`, formData) : await api.post("/processos/", formData);
            showToast(isEditing ? "Processo atualizado!" : "Processo criado!", "success");
            const updatedData = res.data;
            if (!isEditing) {
                navigate(`/processos/editar/${updatedData.id}`, { replace: true });
                setActiveTab("itens");
            }
            fetchDadosDoProcesso(updatedData.id);
        } catch { showToast("Erro ao salvar o processo.", "error"); } 
        finally { setIsLoading(false); }
    };

    const handleSaveItem = async (itemData) => {
        const isUpdating = !!editingItem?.id;
        setIsItemModalOpen(false);
        setEditingItem(null);
        try {
            const endpoint = isUpdating ? `/itens/${editingItem.id}/` : "/itens/";
            const method = isUpdating ? 'patch' : 'post';
            const nextOrdem = itens.length > 0 ? Math.max(...itens.map(i => i.ordem || 0)) + 1 : 1;
            const payload = isUpdating ? itemData : { ...itemData, processo: processoId, ordem: nextOrdem };
            await api[method](endpoint, payload);
            showToast(`Item ${isUpdating ? 'atualizado' : 'adicionado'}!`, "success");
            fetchDadosDoProcesso(processoId); 
        } catch { showToast("Erro ao salvar o item.", "error"); }
    };

    const handleDeleteItem = async (itemId) => {
        if (window.confirm("Tem certeza que deseja excluir este item?")) {
            try {
                await api.delete(`/itens/${itemId}/`);
                showToast("Item removido!", "success");
                fetchDadosDoProcesso(processoId);
            } catch { showToast("Erro ao remover o item.", "error"); }
        }
    };

    const handleLinkFornecedor = async (fornecedorId) => {
        setIsFornecedorModalOpen(false);
        try {
            await api.post(`/processos/${processoId}/adicionar_fornecedor/`, { fornecedor_id: fornecedorId });
            showToast('Fornecedor vinculado!', 'success');
            fetchDadosDoProcesso(processoId);
        } catch { showToast('Erro ao vincular fornecedor.', 'error'); }
    };

    const handleSaveNewAndLinkFornecedor = (newFornecedor) => {
        setCatalogoFornecedores(prev => [newFornecedor, ...prev]);
        handleLinkFornecedor(newFornecedor.id);
    };

    const handleRemoveFornecedor = async (fornecedorId) => {
        if (window.confirm("Deseja desvincular este fornecedor do processo?")) {
            try {
                await api.post(`/processos/${processoId}/remover_fornecedor/`, { fornecedor_id: fornecedorId });
                showToast("Fornecedor desvinculado.", "success");
                fetchDadosDoProcesso(processoId);
            } catch { showToast("Erro ao remover fornecedor.", "error"); }
        }
    };

    // Handler para Exportação
    const handleExportItems = () => {
        if (selectedItems.size === 0) {
            showToast("Nenhum item selecionado para exportar.", "info");
            return;
        }
        
        const itemsToExport = itens.filter(item => selectedItems.has(item.id));
        
        // Cabeçalho do CSV
        const headers = "Descricao,Especificacao,Unidade,Quantidade\n";
        
        // Converte cada objeto de item para uma linha do CSV
        const csvContent = itemsToExport.map(item => {
            // Garante que valores com vírgula fiquem entre aspas
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
    const handleSelectAll = (e) => { if (e.target.checked) { setSelectedItems(new Set(currentItems.map(item => item.id))); } else { setSelectedItems(new Set()); } };
    const handleSelectItem = (itemId) => { const newSelected = new Set(selectedItems); newSelected.has(itemId) ? newSelected.delete(itemId) : newSelected.add(itemId); setSelectedItems(newSelected); };

    return (
        <>
            <ItemModal isOpen={isItemModalOpen} onClose={() => { setIsItemModalOpen(false); setEditingItem(null); }} item={editingItem} onSave={handleSaveItem} />
            <FornecedorModal isOpen={isFornecedorModalOpen} onClose={() => setIsFornecedorModalOpen(false)} catalogo={catalogoFornecedores} onLink={handleLinkFornecedor} onSaveNew={handleSaveNewAndLinkFornecedor}/>

            <div className="p-4 md:p-6 lg:p-8">
              <div className="rounded-lg border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text-primary dark:text-dark-text-primary">
                  <header className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
                      <h1 className="text-xl font-bold">{isEditing ? `Editar Processo: Nº ${formData.numero_certame || "..."}` : "Criar Novo Processo"}</h1>
                  </header>

                  <nav className="flex gap-2 px-4 border-b border-light-border dark:border-dark-border">
                      <TabButton label="Dados Gerais" isActive={activeTab === "dadosGerais"} onClick={() => setActiveTab("dadosGerais")} />
                      <TabButton label="Itens" isActive={activeTab === "itens"} onClick={() => setActiveTab("itens")} isDisabled={!processoId} />
                      <TabButton label="Fornecedores" isActive={activeTab === "fornecedores"} onClick={() => setActiveTab("fornecedores")} isDisabled={!processoId} />
                  </nav>

                  <main className="p-5">
                      <AnimatePresence mode="wait">
                          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                             
                              {activeTab === "dadosGerais" && (
                                  <form onSubmit={handleSaveDadosGerais} className="space-y-6">
                                      <div className="grid md:grid-cols-3 gap-6">
                                          <div className="md:col-span-2">
                                              <label className={labelStyle}>Objeto *</label>
                                              <textarea name="objeto" value={formData.objeto} onChange={handleChange} placeholder="Descreva o objeto do processo..." className={`${inputStyle} h-28`} required />
                                          </div>
                                          <div className="space-y-4">
                                              <div><label className={labelStyle}>Número do Processo *</label><input name="numero_processo" value={formData.numero_processo} onChange={handleChange} placeholder="Ex: 123/2025" className={inputStyle} required /></div>
                                              <div><label className={labelStyle}>Data do Processo *</label><input name="data_processo" type="date" value={formData.data_processo} onChange={handleChange} className={inputStyle} required /></div>
                                          </div>
                                      </div>
                                      <div className="grid md:grid-cols-4 gap-6">
                                          <div><label className={labelStyle}>Modalidade *</label><select name="modalidade" value={formData.modalidade} onChange={handleChange} className={inputStyle} required><option value="">Selecione...</option>{modalidades.map(m => (<option key={m} value={m}>{m}</option>))}</select></div>
                                          <div><label className={labelStyle}>Classificação *</label><select name="classificacao" value={formData.classificacao} onChange={handleChange} className={inputStyle} required><option value="">Selecione...</option>{classificacoes.map(c => (<option key={c} value={c}>{c}</option>))}</select></div>
                                          <div><label className={labelStyle}>Tipo de Organização *</label><select name="tipo_organizacao" value={formData.tipo_organizacao} onChange={handleChange} className={inputStyle} required><option value="">Selecione...</option>{organizacoes.map(o => (<option key={o} value={o}>{o}</option>))}</select></div>
                                          <div><label className={labelStyle}>Registro de Preços *</label><select name="registro_precos" value={String(formData.registro_precos)} onChange={handleChange} className={inputStyle} required><option value="false">Não</option><option value="true">Sim</option></select></div>
                                      </div>
                                      <div className="grid md:grid-cols-2 gap-6">
                                          <div><label className={labelStyle}>Entidade *</label><select name="entidade" value={formData.entidade} onChange={handleChange} className={inputStyle} required><option value="">Selecione...</option>{entidades.map(e => (<option key={e.id} value={e.id}>{e.nome}</option>))}</select></div>
                                          <div><label className={labelStyle}>Órgão *</label><select name="orgao" value={formData.orgao} onChange={handleChange} className={inputStyle} required disabled={!formData.entidade || orgaos.length === 0}><option value="">{formData.entidade ? 'Selecione...' : 'Selecione uma entidade'}</option>{orgaos.map(o => (<option key={o.id} value={o.id}>{o.nome}</option>))}</select></div>
                                      </div>
                                      <div className="grid md:grid-cols-5 gap-6 items-end">
                                          <div><label className={labelStyle}>Número do Certame</label><input name="numero_certame" value={formData.numero_certame || ''} onChange={handleChange} placeholder="Ex: 045/2025" className={inputStyle} /></div>
                                          <div><label className={labelStyle}>Data/Hora de Abertura</label><input name="data_abertura" type="datetime-local" value={formData.data_abertura || ''} onChange={handleChange} className={inputStyle} /></div>
                                          <div><label className={labelStyle}>Valor de Referência (R$)</label><input name="valor_referencia" type="number" step="0.01" value={formData.valor_referencia || ''} onChange={handleChange} placeholder="0,00" className={`${inputStyle} text-right`} /></div>
                                          <div><label className={labelStyle}>Vigência (Meses)*</label><input name="vigencia_meses" type="number" min="1" value={formData.vigencia_meses || ''} onChange={handleChange} placeholder="12" className={`${inputStyle} text-center`} /></div>
                                          <div><label className={labelStyle}>Situação *</label><select name="situacao" value={formData.situacao} onChange={handleChange} className={inputStyle} required>{situacoes.map(s => (<option key={s} value={s}>{s}</option>))}</select></div>
                                      </div>
                                  </form>
                              )}

                              {activeTab === "itens" && (
                                  <div className="space-y-6">
                                      <div className="sm:flex sm:items-center sm:justify-between">
                                          <div><h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Itens do Processo</h2><p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">{itens.length} itens no total. {selectedItems.size > 0 && `${selectedItems.size} selecionado(s).`}</p></div>
                                          <div className="mt-4 sm:mt-0 flex items-center gap-3"><button type="button" className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-md shadow-sm hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary disabled:opacity-50" onClick={handleExportItems} disabled={selectedItems.size === 0}><ArrowDownTrayIcon className="w-5 h-5" />Exportar</button><button type="button" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent-blue border border-transparent rounded-md shadow-sm hover:bg-blue-700" onClick={() => { setEditingItem(null); setIsItemModalOpen(true); }}><PlusIcon className="w-5 h-5" />Adicionar Item</button></div>
                                      </div>
                                      <ItemTable itens={currentItems} onEdit={(item) => { setEditingItem(item); setIsItemModalOpen(true); }} onDelete={handleDeleteItem} selectedItems={selectedItems} onSelectAll={handleSelectAll} onSelectItem={handleSelectItem} expandedItemId={expandedItemId} onToggleExpand={(itemId) => setExpandedItemId(prev => prev === itemId ? null : itemId)} />
                                      {totalPages > 0 && (<div className="flex items-center justify-between pt-4 border-t border-light-border dark:border-dark-border"><div className="flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary"><span>Exibir</span><select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); setSelectedItems(new Set()); }} className={`${inputStyle} shadow-sm`}><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option></select><span>por página</span></div><nav className="isolate inline-flex -space-x-px rounded-md shadow-sm"><button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-light-border dark:ring-dark-border hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary disabled:opacity-50"><ChevronLeftIcon className="h-5 w-5" /></button><span className="relative hidden items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-light-border dark:ring-dark-border md:inline-flex">Página {currentPage} de {totalPages}</span><button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-light-border dark:ring-dark-border hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary disabled:opacity-50"><ChevronRightIcon className="h-5 w-5" /></button></nav></div>)}
                                  </div>
                              )}

                              {activeTab === "fornecedores" && (
                                  <div className="space-y-6">
                                      <div className="sm:flex sm:items-center sm:justify-between">
                                          <div><h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Fornecedores Vinculados</h2><p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">{fornecedoresDoProcesso.length} fornecedores no total.</p></div>
                                          <button type="button" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent-blue border border-transparent rounded-md shadow-sm hover:bg-blue-700" onClick={() => setIsFornecedorModalOpen(true)}><PlusIcon className="w-5 h-5" />Adicionar Fornecedor</button>
                                      </div>
                                      <FornecedorTable fornecedores={currentFornecedores} onRemove={handleRemoveFornecedor} />
                                      {totalPagesForn > 0 && (<div className="flex items-center justify-between pt-4 border-t border-light-border dark:border-dark-border"><div className="flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary"><span>Exibir</span><select value={itemsPerPageForn} onChange={(e) => { setItemsPerPageForn(Number(e.target.value)); setCurrentPageForn(1); }} className={`${inputStyle} shadow-sm`}><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option></select><span>por página</span></div><nav className="isolate inline-flex -space-x-px rounded-md shadow-sm"><button onClick={() => setCurrentPageForn(p => Math.max(p - 1, 1))} disabled={currentPageForn === 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-light-border dark:ring-dark-border hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary disabled:opacity-50"><ChevronLeftIcon className="h-5 w-5" /></button><span className="relative hidden items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-light-border dark:ring-dark-border md:inline-flex">Página {currentPageForn} de {totalPagesForn}</span><button onClick={() => setCurrentPageForn(p => Math.min(p + 1, totalPagesForn))} disabled={currentPageForn === totalPagesForn || totalPagesForn === 0} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-light-border dark:ring-dark-border hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary disabled:opacity-50"><ChevronRightIcon className="h-5 w-5" /></button></nav></div>)}
                                  </div>
                              )}

                          </motion.div>
                      </AnimatePresence>
                  </main>

                  <div className="flex justify-end gap-4 px-6 py-4 border-t border-light-border dark:border-dark-border">
                      <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors">{isEditing ? 'Voltar' : 'Cancelar'}</button>
                      <button type="button" disabled={isLoading} onClick={handleSaveDadosGerais} className="px-6 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed">{isLoading ? 'Salvando...' : (isEditing ? 'Atualizar Processo' : 'Salvar e Continuar')}</button>
                  </div>
              </div>
            </div>
        </>
    );
}