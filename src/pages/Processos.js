// frontend/src/pages/Processos.js
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Filter,
  X,
  UploadCloud,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import useAxios from "../hooks/useAxios";
import { useToast } from "../context/ToastContext";

import ProcessoCard from "../components/ProcessoCard";
import ModalPublicacao from "../components/ModalPublicacao";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import ImportacaoProcessoModal from "../components/ImportacaoProcessoModal";

/* ────────────────────────────────────────────────────────────────────────── */
/* 1. SUBCOMPONENTES E UTILS                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

const Button = ({
  children,
  className = "",
  variant = "primary",
  ...props
}) => {
  const baseStyle =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-accent-blue/60 disabled:opacity-60";

  const variants = {
    primary:
      "bg-accent-blue text-white hover:bg-accent-blue/90 shadow-sm",
    outline:
      "border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-100 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800",
    ghost:
      "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10",
    import:
      "border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-100 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const inputClass =
  "w-full px-3 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-accent-blue placeholder:text-slate-400 dark:placeholder:text-slate-500";

const ProcessosSkeleton = () => (
  <div className="space-y-3 mt-4">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse"
      />
    ))}
  </div>
);

/* ────────────────────────────────────────────────────────────────────────── */
/* 2. PÁGINA PRINCIPAL                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

const Processos = () => {
  const api = useAxios();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Estados
  const [processos, setProcessos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modals, setModals] = useState({
    delete: null,
    publish: null,
    import: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    modalidade: "",
    registro_precos: "",
    data_inicio: "",
    data_fim: "",
  });

  /* --------------------------------------------------------------------- */
  /* FETCH                                                                 */
  /* --------------------------------------------------------------------- */

  const fetchProcessos = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append("ordering", "-data_processo");

      const response = await api.get(`/processos/?${params.toString()}`);
      setProcessos(response.data);
    } catch (error) {
      console.error(error);
      showToast("Erro ao carregar processos.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [api, filters, showToast]);

  // Debounce dos filtros
  useEffect(() => {
    const timer = setTimeout(fetchProcessos, 300);
    return () => clearTimeout(timer);
  }, [fetchProcessos]);

  /* --------------------------------------------------------------------- */
  /* HANDLERS                                                              */
  /* --------------------------------------------------------------------- */

  const handleFilterChange = (e) =>
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  const clearFilters = () => {
    setFilters({
      search: "",
      modalidade: "",
      registro_precos: "",
      data_inicio: "",
      data_fim: "",
    });
    setShowFilters(false);
  };

  const handleDelete = async () => {
    if (!modals.delete) return;
    try {
      await api.delete(`/processos/${modals.delete}/`);
      showToast("Processo removido com sucesso!", "success");
      setModals((m) => ({ ...m, delete: null }));
      fetchProcessos();
    } catch (error) {
      showToast("Erro ao remover processo.", "error");
    }
  };

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some(Boolean),
    [filters]
  );

  /* --------------------------------------------------------------------- */
  /* RENDER                                                                */
  /* --------------------------------------------------------------------- */

  return (
    <div className="min-h-screen pb-20 flex justify-center items-start">
      <Helmet>
        <title>Meus Processos | Licitapro</title>
      </Helmet>

      {/* Modais */}
      {modals.publish && (
        <ModalPublicacao
          processo={modals.publish}
          closeModal={() =>
            setModals((m) => ({ ...m, publish: null }))
          }
          onPublished={() => {
            setModals((m) => ({ ...m, publish: null }));
            fetchProcessos();
          }}
        />
      )}

      {modals.delete && (
        <ConfirmDeleteModal
          onConfirm={handleDelete}
          onCancel={() =>
            setModals((m) => ({ ...m, delete: null }))
          }
        />
      )}

      <ImportacaoProcessoModal
        open={modals.import}
        onClose={() =>
          setModals((m) => ({ ...m, import: false }))
        }
        onImported={fetchProcessos}
        templateUrl="/Modelo_Simples_Importacao.xlsx"
      />

      <div className="max-w-7xl w-full py-2 space-y-2 px-3 md:px-0">
        {/* HEADER / HERO */}
        <section className="bg-white dark:bg-dark-bg-secondary rounded-2xl px-6 py-6 ">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Meus Processos
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Gerencie{" "}
                <span className="font-semibold text-[#004aad] dark:text-blue-400">
                  {processos.length}
                </span>{" "}
                licitações cadastradas.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="import"
                onClick={() =>
                  setModals((m) => ({ ...m, import: true }))
                }
              >
                <UploadCloud className="w-4 h-4" />
                Importar
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate("/processos/novo")}
              >
                <Plus className="w-4 h-4" />
                Novo Processo
              </Button>
            </div>
          </div>

          {/* BARRA DE BUSCA + BOTÃO DE FILTROS */}
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-2 items-center">
            {/* Busca */}
            <div className="relative">
              <input
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Pesquisar por número, objeto ou modalidade..."
                className={`${inputClass} pl-10`}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>

            {/* Ações de filtro */}
            <div className="flex gap-2 justify-start md:justify-end">
              <Button
                variant="outline"
                onClick={() => setShowFilters((v) => !v)}
              >
                <Filter className="w-4 h-4" />
                Filtros
                {hasActiveFilters && (
                  <span className="ml-1 w-2 h-2 bg-accent-blue rounded-full" />
                )}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  title="Limpar filtros"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* FILTROS EXPANSÍVEIS */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    className={inputClass}
                    name="modalidade"
                    value={filters.modalidade}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todas as modalidades</option>
                    <option value="Pregão Eletrônico">
                      Pregão Eletrônico
                    </option>
                    <option value="Dispensa Eletrônica">
                      Dispensa Eletrônica
                    </option>
                    {/* Adicionar outras opções conforme necessário */}
                  </select>

                  <select
                    className={inputClass}
                    name="registro_precos"
                    value={filters.registro_precos}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos os tipos</option>
                    <option value="true">SRP (Sim)</option>
                    <option value="false">SRP (Não)</option>
                  </select>

                  <input
                    type="date"
                    className={inputClass}
                    name="data_inicio"
                    value={filters.data_inicio}
                    onChange={handleFilterChange}
                  />
                  <input
                    type="date"
                    className={inputClass}
                    name="data_fim"
                    value={filters.data_fim}
                    onChange={handleFilterChange}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* LISTA DE PROCESSOS */}
        <section>
          {isLoading ? (
            <ProcessosSkeleton />
          ) : processos.length > 0 ? (
            <div className="space-y-3">
              {processos.map((proc) => (
                <ProcessoCard
                  key={proc.id}
                  processo={proc}
                  onEdit={() =>
                    navigate(`/processos/editar/${proc.id}`)
                  }
                  onDelete={() =>
                    setModals((m) => ({ ...m, delete: proc.id }))
                  }
                  onView={() =>
                    window.open(
                      `/processos/visualizar/${proc.id}`,
                      "_blank"
                    )
                  }
                  onPublish={() =>
                    setModals((m) => ({ ...m, publish: proc }))
                  }
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 bg-white dark:bg-dark-bg-secondary rounded-2xl border border-slate-200 dark:border-slate-800 py-12 px-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-slate-800 dark:text-slate-100 font-semibold mb-1">
                Nenhum processo encontrado
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                Ajuste os filtros de pesquisa ou crie um novo processo
                licitatório para começar a gerenciar seus procedimentos.
              </p>

              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                  >
                    Limpar filtros
                  </Button>
                )}

                <Button
                  variant="primary"
                  onClick={() => navigate("/processos/novo")}
                >
                  <Plus className="w-4 h-4" />
                  Novo Processo
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Processos;
