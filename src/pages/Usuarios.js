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
  Trash,
  ArrowUpDown,
  Pencil,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────── */
/* UI helpers                                                                */
/* ────────────────────────────────────────────────────────────────────────── */
const Button = ({ children, className = "", ...props }) => (
  <button
    className={`flex items-center justify-center font-medium gap-2 focus:outline-none disabled:pointer-events-none whitespace-nowrap transition-all duration-200 px-4 py-2 ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Mesmas classes usadas em Fornecedores/Entidades
const inputCampo =
  "w-full px-1 py-1 text-sm text-medium rounded-md focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-transparent border dark:bg-dark-bg-primary rounded-lg dark:border-dark-bg-primary";
const inputStyle =
  "w-full px-3 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-transparent";

/* ────────────────────────────────────────────────────────────────────────── */
/* Utils                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */
const safe = (v, fallback = "—") =>
  v === null || v === undefined || v === "" ? fallback : v;

const normalizeNome = (u) => {
  if (!u) return "—";
  const full =
    u.nome ||
    u.full_name ||
    (u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : "") ||
    u.first_name ||
    "";
  if (full) return full;
  if (u.username) return u.username;
  if (u.email) return String(u.email).split("@")[0];
  return "—";
};

const normalizeEmail = (u) => u?.email || "—";

const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
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
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || u?.username || "U"
  )}&background=0d3977&color=fff`;
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Página: Usuários                                                          */
/* ────────────────────────────────────────────────────────────────────────── */
export default function Usuarios() {
  const api = useAxios();
  const { showToast } = useToast();

  // Dados
  const [usuarios, setUsuarios] = useState([]);

  // UI/estado
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Modal de edição
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Filtros/ordenação/paginação (client-side)
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("nome"); // 'nome' | 'email' | 'phone' | 'ultimo_acesso'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' | 'desc'
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const hasActiveFilters = useMemo(
    () => !!search || sortBy !== "nome" || sortOrder !== "asc",
    [search, sortBy, sortOrder]
  );

  /* ──────────────────────────────────────────────────────────────────────── */
  /* Busca                                                                    */
  /* ──────────────────────────────────────────────────────────────────────── */
  const fetchUsuarios = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/usuarios/");
      setUsuarios(Array.isArray(res.data) ? res.data : []);
    } catch {
      showToast("Erro ao buscar usuários.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [api, showToast]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchUsuarios();
    }, 200);
    return () => clearTimeout(t);
  }, [fetchUsuarios]);

  /* ──────────────────────────────────────────────────────────────────────── */
  /* Derivados: normalização, filtro, ordenação e paginação                   */
  /* ──────────────────────────────────────────────────────────────────────── */
  const normalizados = useMemo(
    () =>
      usuarios.map((u) => ({
        ...u,
        _nome: normalizeNome(u),
        _email: normalizeEmail(u),
        _ultimoAcesso:
          u?.last_login || u?.ultimo_acesso || u?.lastLogin || u?.last_seen || null,
      })),
    [usuarios]
  );

  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase();

    const bySearch = term
      ? normalizados.filter((u) => {
          const campos = [u._nome, u._email, u?.phone]
            .filter(Boolean)
            .map((x) => String(x).toLowerCase());
          return campos.some((c) => c.includes(term));
        })
      : normalizados;

    const sorted = [...bySearch].sort((a, b) => {
      let A = "";
      let B = "";
      switch (sortBy) {
        case "nome":
          A = String(a._nome || "").toLowerCase();
          B = String(b._nome || "").toLowerCase();
          break;
        case "email":
          A = String(a._email || "").toLowerCase();
          B = String(b._email || "").toLowerCase();
          break;
        case "phone":
          A = String(a?.phone || "").toLowerCase();
          B = String(b?.phone || "").toLowerCase();
          break;
        case "ultimo_acesso": {
          const aDate = a._ultimoAcesso ? new Date(a._ultimoAcesso).getTime() : 0;
          const bDate = b._ultimoAcesso ? new Date(b._ultimoAcesso).getTime() : 0;
          const compNum = aDate - bDate;
          return sortOrder === "asc" ? compNum : -compNum;
        }
        default:
          A = String(a._nome || "").toLowerCase();
          B = String(b._nome || "").toLowerCase();
      }
      const comp = A.localeCompare(B, "pt-BR", { sensitivity: "accent" });
      return sortOrder === "asc" ? comp : -comp;
    });

    return sorted;
  }, [normalizados, search, sortBy, sortOrder]);

  const total = filtrados.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  const current = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtrados.slice(start, start + itemsPerPage);
  }, [filtrados, currentPage, itemsPerPage]);

  useEffect(() => {
    // reset página quando filtros mudam
    setCurrentPage(1);
  }, [search, sortBy, sortOrder, itemsPerPage]);

  /* ──────────────────────────────────────────────────────────────────────── */
  /* Ações                                                                    */
  /* ──────────────────────────────────────────────────────────────────────── */
  const askDelete = (id) => setDeletingId(id);

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/usuarios/${deletingId}/`);
      showToast("Usuário excluído com sucesso!", "success");
      setDeletingId(null);
      fetchUsuarios();
    } catch {
      showToast("Falha ao excluir o usuário.", "error");
      setDeletingId(null);
    }
  };

  const cancelDelete = () => setDeletingId(null);

  const toggleSort = (field) => {
    setSortBy((prevField) => {
      if (prevField === field) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        return prevField;
      }
      setSortOrder("asc");
      return field;
    });
  };

  const openEdit = (u) => {
    setEditingUser(u || null);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditingUser(null);
  };

  const handleSaved = () => {
    fetchUsuarios();
  };

  /* ──────────────────────────────────────────────────────────────────────── */
  /* Render                                                                    */
  /* ──────────────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-4">
      <Helmet>
        <title>Usuários</title>
      </Helmet>

      {deletingId && (
        <ConfirmDeleteModal onConfirm={confirmDelete} onCancel={cancelDelete} />
      )}

      {/* Modal de edição */}
      <UsuarioEditModal
        open={editOpen}
        user={editingUser}
        onClose={closeEdit}
        onSaved={handleSaved}
      />

      {/* Cabeçalho */}
      <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-md p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary">
              Usuários
            </h1>
            <p className="mt-1 text-md text-light-text-secondary dark:text-dark-text-secondary">
              {isLoading
                ? "Carregando..."
                : `Listando ${total} ${total === 1 ? "usuário" : "usuários"}`}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-2 justify-items-start">
            <Button
              onClick={() => openEdit(null)}
              className={`${inputStyle} max-w-35 h-8 gap-1 inline-flex items-center text-sm bg-accent-blue text-white hover:bg-accent-blue/90`}
            >
              <Plus className="w-3 h-3" />
              Novo Usuário
            </Button>
          </div>
        </div>

        {/* Busca + Filtros */}
        <div className="space-y-4">
          <div className="grid grid-cols-[4fr_1fr] items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputCampo} w-full pl-10 pr-4`}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-text-secondary" />
            </div>
            <div className="grid gap-2">
              <Button
                className={`${inputCampo} w-4 h-8`}
                onClick={() => setShowFilters((s) => !s)}
              >
                <Filter className="w-4 h-7" />
                Filtros
                {hasActiveFilters && (
                  <span className="ml-1 px-2 py-1 bg-accent-blue/10 text-accent-blue border rounded-lg text-xs font-semibold">
                    Ativos
                  </span>
                )}
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-2">
                  {/* Ordenações */}
                  <button
                    type="button"
                    onClick={() => toggleSort("nome")}
                    className={`${inputCampo} flex items-center justify-between`}
                    title="Ordenar por Nome"
                  >
                    Ordenar por Nome
                    <ArrowUpDown className="w-4 h-4 opacity-70" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSort("email")}
                    className={`${inputCampo} flex items-center justify-between`}
                    title="Ordenar por E-mail"
                  >
                    Ordenar por E-mail
                    <ArrowUpDown className="w-4 h-4 opacity-70" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSort("phone")}
                    className={`${inputCampo} flex items-center justify-between`}
                    title="Ordenar por Telefone"
                  >
                    Ordenar por Telefone
                    <ArrowUpDown className="w-4 h-4 opacity-70" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSort("ultimo_acesso")}
                    className={`${inputCampo} flex items-center justify-between`}
                    title="Ordenar por Último Acesso"
                  >
                    Ordenar por Último Acesso
                    <ArrowUpDown className="w-4 h-4 opacity-70" />
                  </button>
                </div>

                {/* Itens por página */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Exibir</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className={`${inputCampo} w-auto`}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-slate-600 dark:text-slate-300">por página</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-dark-bg-primary rounded-md p-4">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mx-auto"></div>
          </div>
        ) : total === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum usuário encontrado</h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
              {hasActiveFilters
                ? "Tente ajustar os filtros ou limpar a busca."
                : "Comece cadastrando um novo usuário."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-light-border dark:border-dark-border text-xs uppercase text-slate-500 dark:text-slate-400">
                    <th className="p-3">Foto</th>
                    <th
                      className="p-3 cursor-pointer select-none"
                      onClick={() => toggleSort("nome")}
                      title="Ordenar por Nome"
                    >
                      Nome
                    </th>
                    <th
                      className="p-3 cursor-pointer select-none"
                      onClick={() => toggleSort("email")}
                      title="Ordenar por E-mail"
                    >
                      E-mail
                    </th>
                    <th
                      className="p-3 cursor-pointer select-none"
                      onClick={() => toggleSort("phone")}
                      title="Ordenar por Telefone"
                    >
                      Telefone
                    </th>
                    <th
                      className="p-3 cursor-pointer select-none"
                      onClick={() => toggleSort("ultimo_acesso")}
                      title="Ordenar por Último Acesso"
                    >
                      Último Acesso
                    </th>
                    <th className="p-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {current.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-light-border/60 dark:border-dark-border/60 text-sm"
                    >
                      {/* Foto */}
                      <td className="p-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-slate-200 dark:ring-dark-border">
                          <img
                            src={avatarSrc(u)}
                            alt={normalizeNome(u)}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </td>

                      {/* Nome */}
                      <td className="p-3">
                        <div className="font-semibold text-slate-800 dark:text-dark-text-primary">
                          {normalizeNome(u)}
                        </div>
                        {u?.username && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            usuário: {u.username}
                          </div>
                        )}
                      </td>

                      {/* E-mail */}
                      <td className="p-3">{safe(u?._email || u?.email)}</td>

                      {/* Telefone */}
                      <td className="p-3">{safe(u?.phone)}</td>

                      {/* Último acesso */}
                      <td className="p-3">
                        {formatDate(u?.last_login || u?.ultimo_acesso)}
                      </td>

                      {/* Ações */}
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(u)}
                            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-dark-bg-secondary text-slate-600 dark:text-slate-300"
                            title="Editar usuário"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => askDelete(u.id)}
                            className="p-2 rounded-md hover:bg-red-500/10 text-red-500"
                            title="Excluir usuário"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 border-t border-light-border dark:border-dark-border">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Exibindo{" "}
                <strong>
                  {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, total)}
                </strong>{" "}
                de <strong>{total}</strong>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-1 py-1 rounded-md border border-light-border dark:border-dark-border disabled:opacity-50"
                >
                  Ant.
                </Button>
                <span className="text-sm">
                  Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                </span>
                <Button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-1 py-1 rounded-md border border-light-border dark:border-dark-border disabled:opacity-50"
                >
                  Próx.
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
