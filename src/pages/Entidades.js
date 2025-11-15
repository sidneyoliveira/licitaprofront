// frontend/src/pages/Entidades.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import useAxios from "../hooks/useAxios";
import { useToast } from "../context/ToastContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { EntidadeOrgaoModal } from "../components/EntidadeOrgaoModal";
import {
  Building,
  Home,
  Pencil,
  Trash,
  ChevronDown,
  Plus,
  Search,
  Filter,
  X,
  ArrowUpDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  "w-full px-4 py-1 text-sm font-medium rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-transparent";

/* ────────────────────────────────────────────────────────────────────────── */
/* Subcomponentes                                                            */
/* ────────────────────────────────────────────────────────────────────────── */
const OrgaoItem = React.memo(({ orgao, onEdit, onDelete }) => (
  <div className="flex justify-between items-center ml-4 pl-4 py-2 pr-3 border-l-2 border-light-border dark:border-dark-border/50 bg-light-bg-primary dark:bg-dark-bg-primary/50 rounded-r-lg">
    <div className="flex items-center gap-3">
      <Home className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
      <div>
        <span className="font-medium text-sm">{orgao.nome}</span>
        <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
          <span className="inline-block mr-2">Secretaria</span>
          <span className="inline-block">• Código da Unidade: {orgao.codigo_unidade || "—"}</span>
        </div>
      </div>
    </div>
    <div className="flex gap-3">
      <button
        onClick={onEdit}
        className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-light-text-secondary dark:text-dark-text-secondary"
        title="Editar órgão"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 rounded-md hover:bg-red-500/10 text-red-500"
        title="Excluir órgão"
      >
        <Trash className="w-4 h-4" />
      </button>
    </div>
  </div>
));

const EntidadeAcordeon = React.memo(
  ({ entidade, orgaos, isOpen, onToggle, onEdit, onDelete, onAddOrgao }) => {
    return (
      <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-md overflow-hidden">
        <div
          className="flex justify-between items-center p-3 cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex items-center gap-4">
            <Building className="w-6 h-6 text-accent-blue" />
            <div>
              <h3 className="font-bold text-light-text-primary dark:text-dark-text-primary">
                {entidade.nome}
              </h3>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                CNPJ: {entidade.cnpj || "—"} • Ano: {entidade.ano || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddOrgao();
              }}
              className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20"
              title="Cadastrar Nova Unidade para esta entidade"
            >
              <Plus className="w-4 h-4" /> Nova Unidade
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(null, "entidade");
              }}
              className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-light-text-secondary dark:text-dark-text-secondary"
              title="Editar esta entidade"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(entidade, "entidade");
              }}
              className="p-1.5 rounded-md hover:bg-red-500/10 text-red-500"
              title="Excluir esta entidade"
            >
              <Trash className="w-4 h-4" />
            </button>

            <ChevronDown
              className={`w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-2 space-y-2">
                {orgaos.length > 0 ? (
                  orgaos.map((orgao) => (
                    <OrgaoItem
                      key={orgao.id}
                      orgao={orgao}
                      onEdit={() => onEdit(orgao, "orgao")}
                      onDelete={() => onDelete(orgao, "orgao")}
                    />
                  ))
                ) : (
                  <p className="text-center text-sm text-light-text-secondary dark:text-dark-text-secondary py-4">
                    Nenhum órgão cadastrado para esta entidade.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

/* ────────────────────────────────────────────────────────────────────────── */
/* Página: Entidades                                                         */
/* ────────────────────────────────────────────────────────────────────────── */
export default function Entidades() {
  const api = useAxios();
  const { showToast } = useToast();

  // Dados base
  const [entidades, setEntidades] = useState([]);
  const [orgaos, setOrgaos] = useState([]);

  // UI/estado de tela
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // { data, type, parentEntidadeId }
  const [deletingItem, setDeletingItem] = useState(null); // { type: 'entidade' | 'orgao', id }

  // Filtros e ordenação
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [anoFiltro, setAnoFiltro] = useState("");
  const [sortBy, setSortBy] = useState("nome"); // 'nome' | 'ano' | 'orgaos'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' | 'desc'

  // Acordeões abertos (ids de entidades)
  const [openSet, setOpenSet] = useState(() => new Set());

  /* ──────────────────────────────────────────────────────────────────────── */
  /* Busca de dados                                                          */
  /* ──────────────────────────────────────────────────────────────────────── */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [entRes, orgRes] = await Promise.all([api.get("/entidades/"), api.get("/orgaos/")]);
      setEntidades(Array.isArray(entRes.data) ? entRes.data : []);
      setOrgaos(Array.isArray(orgRes.data) ? orgRes.data : []);
    } catch {
      showToast("Erro ao carregar dados.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [api, showToast]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchData();
    }, 200);
    return () => clearTimeout(t);
  }, [fetchData]);

  /* ──────────────────────────────────────────────────────────────────────── */
  /* Derivados: anos únicos, estrutura hierárquica com filtro/ordenação      */
  /* ──────────────────────────────────────────────────────────────────────── */
  const anosDisponiveis = useMemo(() => {
    const set = new Set(entidades.map((e) => e.ano).filter(Boolean));
    return Array.from(set).sort((a, b) => String(a).localeCompare(String(b)));
  }, [entidades]);

  const hierarchicalData = useMemo(() => {
    const term = search.trim().toLowerCase();

    const joined = entidades.map((ent) => ({
      ...ent,
      orgaos: orgaos.filter((org) => Number(org.entidade) === Number(ent.id)),
    }));

    const filtrado = joined.filter((ent) => {
      const anoOk = anoFiltro ? String(ent.ano) === String(anoFiltro) : true;

      if (!term) return anoOk;

      const entidadeMatch =
        (ent.nome || "").toLowerCase().includes(term) ||
        (ent.cnpj || "").toLowerCase().includes(term);

      const orgaoMatch = ent.orgaos?.some(
        (org) =>
          (org.nome || "").toLowerCase().includes(term) ||
          String(org.codigo_unidade || "").toLowerCase().includes(term)
      );

      return anoOk && (entidadeMatch || orgaoMatch);
    });

    const sorted = [...filtrado].sort((a, b) => {
      let comp = 0;
      if (sortBy === "nome") {
        comp = String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR", {
          sensitivity: "accent",
        });
      } else if (sortBy === "ano") {
        comp = String(a.ano || "").localeCompare(String(b.ano || ""));
      } else if (sortBy === "orgaos") {
        comp = (a.orgaos?.length || 0) - (b.orgaos?.length || 0);
      }
      return sortOrder === "asc" ? comp : -comp;
    });

    return sorted;
  }, [entidades, orgaos, search, anoFiltro, sortBy, sortOrder]);

  const totalOrgaos = useMemo(
    () => hierarchicalData.reduce((acc, e) => acc + (e.orgaos?.length || 0), 0),
    [hierarchicalData]
  );

  const hasActiveFilters = useMemo(() => !!search || !!anoFiltro || sortBy !== "nome" || sortOrder !== "asc", [
    search,
    anoFiltro,
    sortBy,
    sortOrder,
  ]);

  /* ──────────────────────────────────────────────────────────────────────── */
  /* Ações                                                                    */
  /* ──────────────────────────────────────────────────────────────────────── */
  const handleOpenModal = (item = null, type = "entidade", parentEntidadeId = null) => {
    setEditingItem({ data: item, type, parentEntidadeId });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = () => {
    fetchData();
    handleCloseModal();
  };

  const askDelete = (item, type) => {
    if (!item) return;
    const id = type === "entidade" ? item.id : item.id;
    setDeletingItem({ type, id });
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    const { type, id } = deletingItem;
    const endpoint = type === "entidade" ? "entidades" : "orgaos";
    try {
      await api.delete(`/${endpoint}/${id}/`);
      showToast(
        `${type.charAt(0).toUpperCase() + type.slice(1)} removido com sucesso!`,
        "success"
      );
      fetchData();
    } catch (error) {
      showToast(
        `Erro ao remover ${type}. Verifique se não há processos associados.`,
        "error"
      );
    } finally {
      setDeletingItem(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setAnoFiltro("");
    setSortBy("nome");
    setSortOrder("asc");
    setShowFilters(false);
  };

  const toggleOpen = (id) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

  /* ──────────────────────────────────────────────────────────────────────── */
  /* Render                                                                    */
  /* ──────────────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-3">
      <Helmet>
        <title>Entidades e Órgãos</title>
      </Helmet>

      {isModalOpen && (
        <EntidadeOrgaoModal
          item={editingItem}
          entidades={entidades}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
      {deletingItem && (
        <ConfirmDeleteModal
          onConfirm={handleDelete}
          onCancel={() => setDeletingItem(null)}
        />
      )}

      {/* Cabeçalho */}
      <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-md p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary">
              Entidades e Unidades
            </h1>
            <p className="mt-1 text-md text-light-text-secondary dark:text-dark-text-secondary">
              Gerencie {hierarchicalData.length} {hierarchicalData.length === 1 ? "entidade" : "entidades"} e{" "}
              {totalOrgaos} {totalOrgaos === 1 ? "órgão" : "órgãos"}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-2 justify-items-start">
            <Button
              onClick={() => handleOpenModal(null, "entidade")}
              className={`${inputStyle} max-w-35 h-8 gap-1 inline-flex items-center text-sm bg-accent-blue text-white hover:bg-accent-blue/90`}
            >
              Nova Entidade
            </Button>
          </div>
        </div>

        {/* Busca + Ações */}
        <div className="space-y-3">
          <div className="grid grid-cols-[4fr_1fr] items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nome, CNPJ, órgão ou código da unidade..."
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
                <Filter className="w-4 h-7" /> Filtros
                
              </Button>
              
            </div>
          </div>

          {/* Filtros colapsáveis */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 pt-2">
                  <select
                    className={`${inputCampo}`}
                    value={anoFiltro}
                    onChange={(e) => setAnoFiltro(e.target.value)}
                  >
                    <option value="">Todos os anos</option>
                    {anosDisponiveis.map((ano) => (
                      <option key={ano} value={ano}>
                        {ano}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => toggleSort("nome")}
                    className={`${inputCampo} flex items-center justify-between`}
                    title="Ordenar por nome"
                  >
                    Ordenar por Nome
                    <ArrowUpDown className="w-4 h-4 opacity-70" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleSort("ano")}
                    className={`${inputCampo} flex items-center justify-between`}
                    title="Ordenar por ano"
                  >
                    Ordenar por Ano
                    <ArrowUpDown className="w-4 h-4 opacity-70" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleSort("orgaos")}
                    className={`${inputCampo} flex items-center justify-between`}
                    title="Ordenar por quantidade de órgãos"
                  >
                    Ordenar por Órgãos
                    <ArrowUpDown className="w-4 h-4 opacity-70" />
                  </button>

                  {/* <div className="flex items-center text-sm text-slate-600 dark:text-slate-300 px-2">
                    <span>
                      Ordem:{" "}
                      <strong className="uppercase">
                        {sortOrder === "asc" ? "ASC" : "DESC"}
                      </strong>
                    </span>
                  </div> */}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mx-auto"></div>
          </div>
        ) : hierarchicalData.length > 0 ? (
          hierarchicalData.map((ent) => (
            <EntidadeAcordeon
              key={ent.id}
              entidade={ent}
              orgaos={ent.orgaos}
              isOpen={openSet.has(ent.id)}
              onToggle={() => toggleOpen(ent.id)}
              onEdit={(orgao = null, type = "entidade") => {
                if (type === "orgao") handleOpenModal(orgao, "orgao", ent.id);
                else handleOpenModal(ent, "entidade");
              }}
              onDelete={(item = null, type = "entidade") => {
                if (type === "orgao") askDelete(item, "orgao");
                else askDelete(ent, "entidade");
              }}
              onAddOrgao={() => handleOpenModal(null, "orgao", ent.id)}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma entidade encontrada</h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
              {hasActiveFilters
                ? "Tente ajustar os filtros ou limpar a busca."
                : "Comece cadastrando uma nova entidade."}
            </p>
            {hasActiveFilters ? (
              <Button
                onClick={() => handleOpenModal(null, "entidade")}
                className="gap-2 bg-accent-blue text-white hover:bg-accent-blue/90"
              >
                Nova Entidade
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
