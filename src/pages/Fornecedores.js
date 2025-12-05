// frontend/src/pages/Fornecedores.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import useAxios from "../hooks/useAxios";
import { useToast } from "../context/ToastContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  Trash,
  ArrowUpDown,
  Pencil,        // <-- import do ícone de edição
} from "lucide-react";

import { FornecedorModal } from "./NewProcess";

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

const inputCampo =
  "w-full px-3 py-2 text-sm rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-transparent";
const inputStyle =
  "w-full px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-transparent";

/* ────────────────────────────────────────────────────────────────────────── */
/* Utils                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */
const maskCNPJ = (v) => {
  if (!v) return "—";
  const s = String(v).replace(/\D/g, "").slice(0, 14);
  if (s.length <= 11) return v;
  return s.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    "$1.$2.$3/$4-$5"
  );
};

const safe = (v, fallback = "—") =>
  v === null || v === undefined || v === "" ? fallback : v;

/* ────────────────────────────────────────────────────────────────────────── */
/* Página: Fornecedores                                                      */
/* ────────────────────────────────────────────────────────────────────────── */
export default function Fornecedores() {
  const api = useAxios();
  const { showToast } = useToast();

  // Dados
  const [fornecedores, setFornecedores] = useState([]);

  // UI/estado
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Modal de fornecedor
  const [isFornecedorModalOpen, setIsFornecedorModalOpen] = useState(false);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);

  // Filtros/ordenação/paginação
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("razao_social");
  const [sortOrder, setSortOrder] = useState("asc");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const hasActiveFilters = useMemo(
    () => !!search || sortBy !== "razao_social" || sortOrder !== "asc",
    [search, sortBy, sortOrder]
  );

  /* ──────────────────────────────────────────────────────────────────────── */
  /* Busca                                                                    */
  /* ──────────────────────────────────────────────────────────────────────── */
  const fetchFornecedores = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/fornecedores/");
      setFornecedores(Array.isArray(res.data) ? res.data : []);
    } catch {
      showToast("Erro ao buscar fornecedores.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [api, showToast]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchFornecedores();
    }, 200);
    return () => clearTimeout(t);
  }, [fetchFornecedores]);

  /* ──────────────────────────────────────────────────────────────────────── */
  /* Derivados: filtro/ordenação/paginação                                   */
  /* ──────────────────────────────────────────────────────────────────────── */
  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    const base = term
      ? fornecedores.filter((f) => {
          const campos = [
            f?.razao_social,
            f?.nome_fantasia,
            f?.cnpj,
            f?.email,
            f?.municipio,
            f?.uf,
          ]
            .filter(Boolean)
            .map((x) => String(x).toLowerCase());
          return campos.some((c) => c.includes(term));
        })
      : fornecedores;

    const sorted = [...base].sort((a, b) => {
      const A = String(a?.[sortBy] ?? "").toLowerCase();
      const B = String(b?.[sortBy] ?? "").toLowerCase();
      const comp = A.localeCompare(B, "pt-BR", { sensitivity: "accent" });
      return sortOrder === "asc" ? comp : -comp;
    });

    return sorted;
  }, [fornecedores, search, sortBy, sortOrder]);

  const total = filtrados.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  const current = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtrados.slice(start, start + itemsPerPage);
  }, [filtrados, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy, sortOrder, itemsPerPage]);

  /* ──────────────────────────────────────────────────────────────────────── */
  /* Ações                                                                    */
  /* ──────────────────────────────────────────────────────────────────────── */
  const askDelete = (id) => setDeletingId(id);

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/fornecedores/${deletingId}/`);
      showToast("Fornecedor excluído com sucesso!", "success");
      setDeletingId(null);
      fetchFornecedores();
    } catch {
      showToast("Falha ao excluir o fornecedor.", "error");
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

  const clearFilters = () => {
    setSearch("");
    setSortBy("razao_social");
    setSortOrder("asc");
    setShowFilters(false);
  };

  // === Modal Fornecedor ===
  const handleOpenNovoFornecedor = () => {
    setFornecedorSelecionado(null);
    setIsFornecedorModalOpen(true);
  };

  const handleCloseFornecedorModal = () => {
    setIsFornecedorModalOpen(false);
    setFornecedorSelecionado(null);
  };

  const handleLinkFornecedor = async () => {
    showToast("Esta tela é apenas para cadastro/gestão de fornecedores.", "info");
    setIsFornecedorModalOpen(false);
  };

  const handleSaveNewFornecedor = async (data) => {
    const payload = {
      cnpj: data.cnpj,
      razao_social: data.razao_social,
      nome_fantasia: data.nome_fantasia,
      porte: data.porte,
      telefone: data.telefone,
      email: data.email,
      cep: data.cep,
      logradouro: data.logradouro,
      numero: data.numero,
      bairro: data.bairro,
      complemento: data.complemento,
      uf: data.uf,
      municipio: data.municipio,
    };
    const res = await api.post("/fornecedores/", payload);
    showToast("Fornecedor cadastrado com sucesso!", "success");
    setFornecedores((prev) => [...prev, res.data]);
  };

  const handleSaveEditFornecedor = async (data) => {
    const payload = {
      cnpj: data.cnpj,
      razao_social: data.razao_social,
      nome_fantasia: data.nome_fantasia,
      porte: data.porte,
      telefone: data.telefone,
      email: data.email,
      cep: data.cep,
      logradouro: data.logradouro,
      numero: data.numero,
      bairro: data.bairro,
      complemento: data.complemento,
      uf: data.uf,
      municipio: data.municipio,
    };
    const res = await api.put(`/fornecedores/${data.id}/`, payload);
    showToast("Fornecedor atualizado com sucesso!", "success");
    setFornecedores((prev) =>
      prev.map((f) => (f.id === data.id ? res.data : f))
    );
  };

  /* ──────────────────────────────────────────────────────────────────────── */
  /* Render                                                                    */
  /* ──────────────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen pb-12 flex justify-center items-start">
      <Helmet>
        <title>Fornecedores</title>
      </Helmet>

      <div className="w-full max-w-7xl px-2 md:px-4 lg:px-0 py-4 space-y-4">
        {deletingId && (
          <ConfirmDeleteModal
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />
        )}

        {/* Modal de Fornecedor */}
        <FornecedorModal
          isOpen={isFornecedorModalOpen}
          onClose={handleCloseFornecedorModal}
          onLink={handleLinkFornecedor}
          onSaveNew={handleSaveNewFornecedor}
          onSaveEdit={handleSaveEditFornecedor}
          catalogo={fornecedores}
          fornecedorSelecionado={fornecedorSelecionado}
        />

        {/* Cabeçalho / Filtros */}
        <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-2xl p-4 md:p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary">
                Fornecedores
              </h1>
              <p className="mt-1 text-sm md:text-base text-light-text-secondary dark:text-dark-text-secondary">
                {isLoading
                  ? "Carregando..."
                  : `Listando ${total} ${
                      total === 1 ? "fornecedor" : "fornecedores"
                    }`}
              </p>
            </div>
            <div>
              <Button
                onClick={handleOpenNovoFornecedor}
                className="inline-flex items-center gap-2 text-sm bg-accent-blue text-white hover:bg-accent-blue/90 rounded-lg shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Novo Fornecedor
              </Button>
            </div>
          </div>

          {/* Busca + Filtros */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-[3fr_minmax(0,1fr)] items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por razão social, CNPJ, e-mail, município ou UF..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`${inputCampo} pl-10`}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-text-secondary" />
              </div>
              <div className="flex gap-2 justify-start md:justify-end">
                <Button
                  className={`${inputCampo} !px-3 !py-2 flex items-center justify-center gap-2 bg-light-bg-primary dark:bg-dark-bg-primary`}
                  onClick={() => setShowFilters((s) => !s)}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filtros</span>
                  {hasActiveFilters && (
                    <span className="ml-1 inline-block w-2 h-2 rounded-full bg-accent-blue" />
                  )}
                </Button>
                {hasActiveFilters && (
                  <Button
                    type="button"
                    onClick={clearFilters}
                    className="px-3 py-2 text-xs rounded-lg border border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    Limpar
                  </Button>
                )}
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
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => toggleSort("razao_social")}
                      className={`${inputCampo} flex items-center justify-between`}
                      title="Ordenar Razão"
                    >
                      Razão Social
                      <ArrowUpDown className="w-4 h-4 opacity-70" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSort("cnpj")}
                      className={`${inputCampo} flex items-center justify-between`}
                      title="Ordenar por CNPJ"
                    >
                      CNPJ
                      <ArrowUpDown className="w-4 h-4 opacity-70" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSort("municipio")}
                      className={`${inputCampo} flex items-center justify-between`}
                      title="Ordenar por Município"
                    >
                      Município
                      <ArrowUpDown className="w-4 h-4 opacity-70" />
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        Exibir
                      </span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) =>
                          setItemsPerPage(Number(e.target.value))
                        }
                        className={`${inputCampo} w-auto`}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        por página
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-4 md:p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mb-3" />
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Carregando fornecedores...
              </p>
            </div>
          ) : total === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-light-text-primary dark:text-dark-text-primary">
                Nenhum fornecedor encontrado
              </h3>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-6">
                {hasActiveFilters
                  ? "Tente ajustar os filtros ou limpar a busca."
                  : "Comece cadastrando um novo fornecedor."}
              </p>
              <Button
                onClick={handleOpenNovoFornecedor}
                className="inline-flex items-center gap-2 text-sm bg-accent-blue text-white hover:bg-accent-blue/90 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Novo Fornecedor
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-dark-bg-primary border-b border-gray-100 dark:border-dark-border text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                      <th
                        className="p-4 cursor-pointer hover:text-accent-blue transition-colors"
                        onClick={() => toggleSort("razao_social")}
                      >
                        <div className="flex items-center gap-1">
                          Razão Social
                          <ArrowUpDown className="w-3 h-3 opacity-50" />
                        </div>
                      </th>
                      <th
                        className="p-4 cursor-pointer hover:text-accent-blue transition-colors"
                        onClick={() => toggleSort("cnpj")}
                      >
                        <div className="flex items-center gap-1">
                          CNPJ
                          <ArrowUpDown className="w-3 h-3 opacity-50" />
                        </div>
                      </th>
                      <th
                        className="p-4 cursor-pointer hover:text-accent-blue transition-colors"
                        onClick={() => toggleSort("email")}
                      >
                        <div className="flex items-center gap-1">
                          Contato
                          <ArrowUpDown className="w-3 h-3 opacity-50" />
                        </div>
                      </th>
                      <th
                        className="p-4 cursor-pointer hover:text-accent-blue transition-colors"
                        onClick={() => toggleSort("municipio")}
                      >
                        <div className="flex items-center gap-1">
                          Município
                          <ArrowUpDown className="w-3 h-3 opacity-50" />
                        </div>
                      </th>
                      <th
                        className="p-4 cursor-pointer hover:text-accent-blue transition-colors"
                        onClick={() => toggleSort("uf")}
                      >
                        <div className="flex items-center gap-1">
                          UF
                          <ArrowUpDown className="w-3 h-3 opacity-50" />
                        </div>
                      </th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                    {current.map((f) => (
                      <tr
                        key={f.id}
                        className="hover:bg-gray-50 dark:hover:bg-dark-bg-primary/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-semibold text-slate-800 dark:text-dark-text-primary">
                            {safe(f?.razao_social)}
                          </div>
                          {f?.nome_fantasia && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Fantasia: {f.nome_fantasia}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-sm">{maskCNPJ(f?.cnpj)}</td>
                        <td className="p-4 text-sm">
                          <div className="flex flex-col gap-1">
                            <span className="text-slate-800 dark:text-dark-text-primary">
                              {safe(f?.email)}
                            </span>
                            {f?.telefone && (
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {f.telefone}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm">{safe(f?.municipio)}</td>
                        <td className="p-4 text-sm">{safe(f?.uf)}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* EDITAR - sempre visível */}
                            <Button
                              className="p-2 h-8 w-8 !px-0 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30"
                              onClick={() => {
                                setFornecedorSelecionado(f);
                                setIsFornecedorModalOpen(true);
                              }}
                              title="Editar fornecedor"
                            >
                              <Pencil className="w-4 h-4 text-blue-600" />
                            </Button>

                            {/* EXCLUIR - sempre visível */}
                            <Button
                              className="p-2 h-8 w-8 !px-0 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
                              onClick={() => askDelete(f.id)}
                              title="Excluir fornecedor"
                            >
                              <Trash className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              <div className="px-2 md:px-4 py-4 border-t border-light-border dark:border-dark-border flex flex-col md:flex-row items-center justify-between gap-4 mt-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Exibindo{" "}
                  <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> até{" "}
                  <strong>{Math.min(currentPage * itemsPerPage, total)}</strong>{" "}
                  de <strong>{total}</strong> resultados
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    className="px-2 py-1 rounded-md border border-light-border dark:border-dark-border text-sm disabled:opacity-50"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((p) => Math.max(1, p - 1))
                    }
                  >
                    Anterior
                  </Button>
                  <div className="flex items-center gap-1 px-2">
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page !== 1 &&
                        page !== totalPages &&
                        Math.abs(page - currentPage) > 1
                      ) {
                        if (page === 2 || page === totalPages - 1)
                          return (
                            <span
                              key={page}
                              className="text-gray-400 select-none"
                            >
                              ...
                            </span>
                          );
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
                    className="px-2 py-1 rounded-md border border-light-border dark:border-dark-border text-sm disabled:opacity-50"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
