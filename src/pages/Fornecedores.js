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
} from "lucide-react";

import {FornecedorModal} from "./NewProcess";

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
  "w-full px-1 py-1 text-sm text-medium rounded-md focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-transparent border dark:bg-dark-bg-primary rounded-lg dark:border-dark-bg-primary";
const inputStyle =
  "w-full px-3 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-transparent";

/* ────────────────────────────────────────────────────────────────────────── */
/* Utils                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */
const maskCNPJ = (v) => {
  if (!v) return "—";
  const s = String(v).replace(/\D/g, "").slice(0, 14);
  if (s.length <= 11) return v; // se vier CPF ou outro formato, não força
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

  // Filtros/ordenação/paginação (client-side)
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("razao_social"); // 'razao_social' | 'cnpj' | 'municipio' | 'uf' | 'email'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' | 'desc'
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const hasActiveFilters = useMemo(
    () =>
      !!search ||
      sortBy !== "razao_social" ||
      sortOrder !== "asc",
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
    // reset página quando filtros mudarem
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

  // === Callbacks para o FornecedorModal ===
  const handleOpenNovoFornecedor = () => {
    setFornecedorSelecionado(null); // garante que é novo
    setIsFornecedorModalOpen(true);
  };

  const handleCloseFornecedorModal = () => {
    setIsFornecedorModalOpen(false);
  };

  const handleLinkFornecedor = async (id) => {
    // Nesta página (lista de fornecedores) não há processo pra vincular.
    // Podemos apenas fechar o modal ou mostrar um aviso.
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
    // Atualiza lista local sem precisar refetch imediato
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
    <div className="space-y-4">
      <Helmet>
        <title>Fornecedores</title>
      </Helmet>

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

      {/* Cabeçalho */}
      <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-md p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary">
              Fornecedores
            </h1>
            <p className="mt-1 text-md text-light-text-secondary dark:text-dark-text-secondary">
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
              className={`${inputStyle} h-8 gap-1 inline-flex items-center text-sm bg-accent-blue text-white hover:bg-accent-blue/90`}
            >
              <Plus className="w-3 h-3" />
              Novo Fornecedor
            </Button>
          </div>
        </div>

        {/* Busca + Filtros */}
        <div className="space-y-4">
          <div className="grid grid-cols-[4fr_1fr] items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por razão social, CNPJ, e-mail, município ou UF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputCampo} w-full pl-10 pr-4 py-1`}
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
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 pt-2">
                  {/* Ordenações principais */}
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
      <div className="bg-white dark:bg-dark-bg-primary rounded-md p-4">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mx-auto"></div>
          </div>
        ) : total === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Nenhum fornecedor encontrado
            </h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
              {hasActiveFilters
                ? "Tente ajustar os filtros ou limpar a busca."
                : "Comece cadastrando um novo fornecedor."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-light-border dark:border-dark-border text-xs uppercase text-slate-500 dark:text-slate-400">
                    <th
                      className="p-3 cursor-pointer select-none"
                      onClick={() => toggleSort("razao_social")}
                      title="Ordenar por Razão Social"
                    >
                      Razão Social
                    </th>
                    <th
                      className="p-3 cursor-pointer select-none"
                      onClick={() => toggleSort("cnpj")}
                      title="Ordenar por CNPJ"
                    >
                      CNPJ
                    </th>
                    <th className="p-3">E-mail</th>
                    <th
                      className="p-3 cursor-pointer select-none"
                      onClick={() => toggleSort("municipio")}
                      title="Ordenar por Município"
                    >
                      Município
                    </th>
                    <th
                      className="p-3 cursor-pointer select-none"
                      onClick={() => toggleSort("uf")}
                      title="Ordenar por UF"
                    >
                      UF
                    </th>
                    <th className="p-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {current.map((f) => (
                    <tr
                      key={f.id}
                      className="border-b border-light-border/60 dark:border-dark-border/60 text-sm"
                    >
                      <td className="p-3">
                        <div className="font-semibold text-slate-800 dark:text-dark-text-primary">
                          {safe(f?.razao_social)}
                        </div>
                        {f?.nome_fantasia && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Fantasia: {f.nome_fantasia}
                          </div>
                        )}
                      </td>
                      <td className="p-3">{maskCNPJ(f?.cnpj)}</td>
                      <td className="p-3">{safe(f?.email)}</td>
                      <td className="p-3">{safe(f?.municipio)}</td>
                      <td className="p-3">{safe(f?.uf)}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          {/* Futuro: botão de editar poderia abrir o FornecedorModal com fornecedorSelecionado */}
                          <button
                            onClick={() => askDelete(f.id)}
                            className="p-2 rounded-md hover:bg-red-500/10 text-red-500"
                            title="Excluir fornecedor"
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
            <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2  border-t border-light-border dark:border-dark-border">
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
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  className="px-1 py-1 rounded-md border border-light-border dark:border-dark-border disabled:opacity-50"
                >
                  Ant.
                </Button>
                <span className="text-sm">
                  Página <strong>{currentPage}</strong> de{" "}
                  <strong>{totalPages}</strong>
                </span>
                <Button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
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
