// frontend/src/pages/Usuarios.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import useAxios from "../hooks/useAxios";
import { useToast } from "../context/ToastContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import UsuarioEditModal from "../components/UsuarioEditModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  Trash2,
  ArrowUpDown,
  Pencil,
  Shield,
  User as UserIcon,
  CheckCircle,
  XCircle,
  MoreVertical,
  Mail,
  Phone,
  Calendar
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────── */
/* Componentes Visuais Internos (Helpers)                                     */
/* ────────────────────────────────────────────────────────────────────────── */

const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      active
        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
    }`}
  >
    {active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
    {active ? "Ativo" : "Inativo"}
  </span>
);

const RoleBadge = ({ isStaff }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      isStaff
        ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800"
        : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
    }`}
  >
    {isStaff ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
    {isStaff ? "Admin" : "Usuário"}
  </span>
);

const Button = ({ children, variant = "primary", className = "", ...props }) => {
  const base = "flex items-center justify-center font-medium gap-2 transition-all duration-200 px-4 py-2 rounded-md text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-accent-blue text-white hover:bg-accent-blue/90 shadow-sm hover:shadow",
    secondary: "bg-white dark:bg-dark-bg-primary border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-bg-secondary",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400",
    ghost: "text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary dark:text-gray-400",
  };
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
};

const TableSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
        <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    ))}
  </div>
);

/* ────────────────────────────────────────────────────────────────────────── */
/* Utils de Dados                                                             */
/* ────────────────────────────────────────────────────────────────────────── */

const normalizeNome = (u) => {
  if (!u) return "—";
  const full =
    u.nome ||
    u.full_name ||
    (u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : "") ||
    u.first_name ||
    "";
  return full || u.username || u.email?.split("@")[0] || "Sem Nome";
};

const formatDate = (iso) => {
  if (!iso) return "Nunca acessou";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

const avatarSrc = (u) => {
  if (u?.profile_image) return u.profile_image;
  const name = normalizeNome(u);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0d3977&color=fff&size=128`;
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Componente Principal                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

export default function Usuarios() {
  const api = useAxios();
  const { showToast } = useToast();

  // Estados de Dados
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de UI/Controle
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Filtros e Ordenação
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("nome");
  const [sortOrder, setSortOrder] = useState("asc");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce da busca para performance
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch de Usuários
  const fetchUsuarios = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/usuarios/");
      setUsuarios(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      showToast("Não foi possível carregar a lista de usuários.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [api, showToast]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  // Lógica de Processamento de Dados (Memoized)
  const processedData = useMemo(() => {
    let data = usuarios.map((u) => ({
      ...u,
      _nome: normalizeNome(u),
      _email: u.email || "",
      _ultimoAcesso: u.last_login || u.ultimo_acesso,
      // Assume false se não vier do backend, ajustável conforme seu serializer
      _isStaff: u.is_staff || false, 
      _isActive: u.is_active !== false, // Default true se undefined
    }));

    // Filtragem
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      data = data.filter((u) =>
        u._nome.toLowerCase().includes(term) ||
        u._email.toLowerCase().includes(term) ||
        (u.username && u.username.toLowerCase().includes(term))
      );
    }

    // Ordenação
    data.sort((a, b) => {
      let valA, valB;

      switch (sortBy) {
        case "email":
          valA = a._email;
          valB = b._email;
          break;
        case "ultimo_acesso":
          valA = new Date(a._ultimoAcesso || 0).getTime();
          valB = new Date(b._ultimoAcesso || 0).getTime();
          break;
        case "role":
          valA = a._isStaff ? 1 : 0;
          valB = b._isStaff ? 1 : 0;
          break;
        case "status":
            valA = a._isActive ? 1 : 0;
            valB = b._isActive ? 1 : 0;
            break;
        default: // nome
          valA = a._nome;
          valB = b._nome;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [usuarios, debouncedSearch, sortBy, sortOrder]);

  // Paginação
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const currentItems = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => setCurrentPage(1), [debouncedSearch, itemsPerPage]);

  // Handlers
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/usuarios/${deletingId}/`);
      showToast("Usuário removido com sucesso.", "success");
      fetchUsuarios();
    } catch {
      showToast("Erro ao excluir usuário.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (user = null) => {
    setEditingUser(user);
    setEditOpen(true);
  };

  const hasActiveFilters = !!search || sortBy !== "nome";

  return (
    <div className="space-y-3">
      <Helmet>
        <title>Gestão de Usuários</title>
      </Helmet>

      {/* Modais */}
      {deletingId && (
        <ConfirmDeleteModal
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(null)}
          title="Excluir Usuário"
          message="Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita."
        />
      )}

      <UsuarioEditModal
        open={editOpen}
        user={editingUser}
        onClose={() => { setEditOpen(false); setEditingUser(null); }}
        onSaved={fetchUsuarios}
      />


      <div className="bg-white dark:bg-dark-bg-secondary p-5 rounded-md shadow-sm border border-gray-100 dark:border-dark-border space-y-4">
        
        {/* LINHA 1: Título e Botão de Ação Principal */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <UserIcon className="w-6 h-6 text-accent-blue" />
              Usuários
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gerencie o acesso e permissões da equipe.
            </p>
          </div>
          
          <Button 
            onClick={() => handleEdit(null)}
            className="w-full sm:w-auto bg-accent-blue hover:bg-blue-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        {/* LINHA 2: Barra de Busca e Toggle de Filtros */}
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Campo de Busca (Ocupa o espaço restante) */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou username..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg-primary text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-all outline-none"
            />
          </div>

          {/* Botão de Filtros */}
          <Button 
            variant="secondary" 
            onClick={() => setShowFilters(!showFilters)}
            className={`whitespace-nowrap ${showFilters || search || sortBy !== 'nome' ? "border-accent-blue text-accent-blue bg-accent-blue/5" : ""}`}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? "Ocultar Filtros" : "Filtros"}
          </Button>
        </div>

        {/* ÁREA EXPANSÍVEL: Opções de Filtro (Aparece abaixo da linha 2) */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-2 border-t border-gray-100 dark:border-dark-border">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {[
                    { key: 'nome', label: 'Nome' },
                    { key: 'email', label: 'E-mail' },
                    { key: 'role', label: 'Função' },
                    { key: 'status', label: 'Status' },
                    { key: 'ultimo_acesso', label: 'Último Acesso' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => handleSort(item.key)}
                      className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                        sortBy === item.key
                          ? "bg-white dark:bg-dark-bg-primary border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg-secondary"
                          : "bg-white dark:bg-dark-bg-primary border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg-secondary"
                      }`}
                    >
                      <span>{item.label}</span>
                      {sortBy === item.key && <ArrowUpDown className="w-3 h-3" />}
                    </button>
                  ))}

                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-primary text-gray-600 dark:text-gray-300 focus:border-accent-blue outline-none cursor-pointer"
                  >
                    <option value={5}>5 por página</option>
                    <option value={10}>10 por página</option>
                    <option value={20}>20 por página</option>
                    <option value={50}>50 por página</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      {/* Tabela de Dados */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-md px-4 overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton />
          </div>
        ) : processedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-dark-bg-primary rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nenhum usuário encontrado</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mt-1">
              {debouncedSearch 
                ? `Não encontramos resultados para "${debouncedSearch}". Tente outro termo.` 
                : "Comece adicionando novos membros à sua equipe."}
            </p>
            {!debouncedSearch && (
              <Button className="mt-4" onClick={() => handleEdit(null)}>
                Cadastrar Agora
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-dark-bg-primary border-b border-gray-100 dark:border-dark-border text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                    <th className="p-4 w-14"></th>
                    <th className="p-4 cursor-pointer hover:text-accent-blue transition-colors" onClick={() => handleSort('nome')}>
                      <div className="flex items-center gap-1">Usuário <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
                    </th>
                    <th className="p-4 hidden md:table-cell cursor-pointer hover:text-accent-blue transition-colors" onClick={() => handleSort('email')}>
                       <div className="flex items-center gap-1">Contato <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
                    </th>
                    <th className="p-4 cursor-pointer hover:text-accent-blue transition-colors" onClick={() => handleSort('role')}>
                        <div className="flex items-center gap-1">Função <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
                    </th>
                    <th className="p-4 cursor-pointer hover:text-accent-blue transition-colors" onClick={() => handleSort('status')}>
                        <div className="flex items-center gap-1">Status <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
                    </th>
                    <th className="p-4 hidden lg:table-cell cursor-pointer hover:text-accent-blue transition-colors" onClick={() => handleSort('ultimo_acesso')}>
                        <div className="flex items-center gap-1">Último Acesso <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
                    </th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {currentItems.map((u) => (
                    <tr 
                      key={u.id} 
                      className="group hover:bg-gray-50 dark:hover:bg-dark-bg-primary/50 transition-colors"
                    >
                      <td className="p-2">
                        <img
                          src={avatarSrc(u)}
                          alt={u._nome}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-dark-bg-secondary shadow-sm"
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-900 dark:text-white">{u._nome}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">@{u.username}</div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <Mail className="w-3 h-3" /> {u._email || "—"}
                            </div>
                            {u.phone && (
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Phone className="w-3 h-3" /> {u.phone}
                                </div>
                            )}
                        </div>
                      </td>
                      <td className="p-4">
                        <RoleBadge isStaff={u._isStaff} />
                      </td>
                      <td className="p-4">
                        <StatusBadge active={u._isActive} />
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {formatDate(u._ultimoAcesso)}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            className="p-2 h-8 w-8 !px-0 rounded-full" 
                            onClick={() => handleEdit(u)}
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="p-2 h-8 w-8 !px-0 rounded-full hover:bg-red-50" 
                            onClick={() => setDeletingId(u.id)}
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rodapé da Tabela (Paginação) */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-dark-border flex flex-col md:flex-row items-center justify-between gap-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Mostrando <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> até <strong>{Math.min(currentPage * itemsPerPage, totalItems)}</strong> de <strong>{totalItems}</strong> resultados
              </span>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="secondary" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="h-9 px-3"
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-1 px-2">
                    {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 1) {
                            if (page === 2 || page === totalPages - 1) return <span key={i} className="text-gray-400">...</span>;
                            return null;
                        }
                        return (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                                    currentPage === page
                                    ? "bg-accent-blue text-white"
                                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-bg-primary"
                                }`}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>
                <Button 
                  variant="secondary" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="h-9 px-3"
                >
                  Próxima
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}