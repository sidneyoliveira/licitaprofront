// frontend/src/pages/Notificacoes.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import { useToast } from "../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Info,
  FilePlus2,
  UserPlus,
  Building2,
  Home,
  CalendarClock,
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

const inputCampo =
  "w-full px-1 py-1 text-sm text-medium rounded-md focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-transparent border dark:bg-dark-bg-primary rounded-lg dark:border-dark-bg-primary";
const inputStyle =
  "w-full px-3 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-transparent";

/* ────────────────────────────────────────────────────────────────────────── */
/* Utils                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */
const typeMeta = {
  processo: { icon: FilePlus2, color: "text-accent-blue", label: "Processo" },
  usuario: { icon: UserPlus, color: "text-green-600", label: "Usuário" },
  entidade: { icon: Building2, color: "text-indigo-600", label: "Entidade" },
  orgao: { icon: Home, color: "text-amber-600", label: "Órgão" },
  alerta: { icon: AlertTriangle, color: "text-red-600", label: "Alerta" },
  sistema: { icon: Info, color: "text-slate-600", label: "Sistema" },
};

const badgeTone = {
  info: "bg-blue-50 text-blue-700 border-blue-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-red-50 text-red-700 border-red-200",
};

const parseDate = (raw) => {
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return new Date(`${raw}T00:00:00`);
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDateTime = (iso) => {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (!d || Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const daysDiffFromNow = (date) => {
  if (!date) return null;
  const now = new Date();
  const ms = parseDate(date).getTime() - now.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
};

const relativeStr = (date) => {
  const d = parseDate(date);
  if (!d) return "—";
  const diff = daysDiffFromNow(d);
  if (diff === 0) return "hoje";
  if (diff === 1) return "amanhã";
  if (diff > 1) return `em ${diff} dias`;
  if (diff === -1) return "ontem";
  return `há ${Math.abs(diff)} dias`;
};

const pickProcessDate = (p) => {
  const keys = [
    "data_certame",
    "data_abertura",
    "data_sessao",
    "data_processo",
    "data_inicio",
    "data_fim",
    "updated_at",
    "created_at",
  ];
  for (const k of keys) {
    if (p?.[k]) return p[k];
  }
  return null;
};

const safe = (v, fb = "—") => (v === null || v === undefined || v === "" ? fb : v);

/* ────────────────────────────────────────────────────────────────────────── */
/* Página: Notificações                                                      */
/* ────────────────────────────────────────────────────────────────────────── */
export default function Notificacoes() {
  const api = useAxios();
  const { showToast } = useToast();

  // Dados brutos
  const [processos, setProcessos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [entidades, setEntidades] = useState([]);
  const [orgaos, setOrgaos] = useState([]);

  // Notificações agregadas
  const [notifs, setNotifs] = useState([]);

  // UI
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filtros/orden. — PADRÃO: somente NÃO LIDAS + DATA DESC
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(""); // '', 'processo', ...
  const [statusFilter, setStatusFilter] = useState("nao_lida"); // default: não lidas
  const [severityFilter, setSeverityFilter] = useState(""); // '', 'info'|'success'|'warning'|'error'
  const [sortBy, setSortBy] = useState("data"); // default: data
  const [sortOrder, setSortOrder] = useState("desc"); // default: desc
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [hideRead, setHideRead] = useState(false); // opcional, mantém o botão, mas padrão já é "não lidas"

  // Estado de leitura
  const [readMap, setReadMap] = useState(() => {
    try {
      const raw = localStorage.getItem("notifications_read_map");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  /* ──────────────────────────────────────────────────────────────────────── */
  /* Fetch                                                                    */
  /* ──────────────────────────────────────────────────────────────────────── */
  const fetchArray = async (path, params = {}) => {
    try {
      const r = await api.get(path, { params });
      if (Array.isArray(r.data)) return r.data;
      if (Array.isArray(r.data?.results)) return r.data.results;
      return [];
    } catch {
      return [];
    }
  };

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [procs, users, ents, orgs] = await Promise.all([
        fetchArray("/processos/", { ordering: "-updated_at" }),
        fetchArray("/usuarios/", { ordering: "-date_joined" }),
        fetchArray("/entidades/", { ordering: "-id" }),
        fetchArray("/orgaos/", { ordering: "-id" }),
      ]);

      setProcessos(procs);
      setUsuarios(users);
      setEntidades(ents);
      setOrgaos(orgs);
    } catch (e) {
      showToast("Não foi possível carregar as notificações.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [api, showToast]);

  useEffect(() => {
    fetchAll();  
  }, [fetchAll]);

  /* ──────────────────────────────────────────────────────────────────────── */
  /* Agregador                                                                */
  /* ──────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const list = [];

    // Processos
    processos.forEach((p) => {
      const id = `proc-create-${p.id}`;
      const when =
        p.updated_at || p.created_at || pickProcessDate(p) || new Date().toISOString();

      list.push({
        id,
        tipo: "processo",
        titulo:
          p.objeto || p.descricao || p.numero || (p.id ? `Processo #${p.id}` : "Processo"),
        mensagem: `Processo ${p.numero ? `#${p.numero}` : p.id ? `#${p.id}` : ""} ${
          p.created_at ? "criado" : "atualizado"
        }`,
        data: when,
        severity: "info",
        href: p?.id ? `/processos/visualizar/${p.id}` : null,
      });

      // Alertas de data do certame
      const certame = pickProcessDate(p);
      const d = parseDate(certame);
      if (d) {
        const diff = daysDiffFromNow(d);
        if (diff !== null) {
          if (diff >= 0 && diff <= 15) {
            list.push({
              id: `proc-alerta-${p.id}`,
              tipo: "alerta",
              titulo: `Certame próximo ${
                p.numero ? `(#${p.numero})` : p.id ? `(#${p.id})` : ""
              }`,
              mensagem: `Faltam ${diff === 0 ? "0" : diff} ${
                Math.abs(diff) === 1 ? "dia" : "dias"
              } para o certame (${formatDateTime(d)})`,
              data: new Date().toISOString(),
              severity: diff <= 3 ? "error" : "warning",
              href: p?.id ? `/processos/visualizar/${p.id}` : null,
            });
          } else if (diff < 0 && Math.abs(diff) <= 5) {
            list.push({
              id: `proc-atraso-${p.id}`,
              tipo: "alerta",
              titulo: `Certame em atraso ${
                p.numero ? `(#${p.numero})` : p.id ? `(#${p.id})` : ""
              }`,
              mensagem: `O certame passou ${Math.abs(diff)} ${
                Math.abs(diff) === 1 ? "dia" : "dias"
              } (${formatDateTime(d)})`,
              data: new Date().toISOString(),
              severity: "error",
              href: p?.id ? `/processos/visualizar/${p.id}` : null,
            });
          }
        }
      }
    });

    // Usuários
    usuarios.forEach((u) => {
      const id = `user-${u.id ?? u.username ?? Math.random()}`;
      list.push({
        id,
        tipo: "usuario",
        titulo: u.first_name || u.username || u.email || "Novo usuário",
        mensagem: `Usuário cadastrado: ${[
          u.first_name,
          u.last_name,
        ].filter(Boolean).join(" ") || u.username || u.email}`,
        data: u.date_joined || u.created_at || new Date().toISOString(),
        severity: "success",
        href: null,
        extra: { email: u.email, phone: u.phone },
      });
    });

    // Entidades
    entidades.forEach((e) => {
      const id = `ent-${e.id}`;
      list.push({
        id,
        tipo: "entidade",
        titulo: e.nome || "Nova entidade",
        mensagem: `Entidade cadastrada${e.ano ? ` (Ano: ${e.ano})` : ""}${
          e.cnpj ? ` • CNPJ: ${e.cnpj}` : ""
        }`,
        data: e.created_at || new Date().toISOString(),
        severity: "success",
        href: "/entidades",
      });
    });

    // Órgãos
    orgaos.forEach((o) => {
      const id = `org-${o.id}`;
      list.push({
        id,
        tipo: "orgao",
        titulo: o.nome || "Novo órgão",
        mensagem: `Órgão cadastrado${o.codigo_unidade ? ` • Unidade: ${o.codigo_unidade}` : ""}`,
        data: o.created_at || new Date().toISOString(),
        severity: "success",
        href: "/entidades",
      });
    });

    // Ordena por data desc por padrão
    const sorted = [...list].sort((a, b) => {
      const A = parseDate(a.data)?.getTime() ?? 0;
      const B = parseDate(b.data)?.getTime() ?? 0;
      return B - A;
    });

    setNotifs(sorted);
  }, [processos, usuarios, entidades, orgaos]);

  useEffect(() => {
    localStorage.setItem("notifications_read_map", JSON.stringify(readMap));
  }, [readMap]);

  /* ──────────────────────────────────────────────────────────────────────── */
  /* Filtro/Ordenação/Paginação                                              */
  /* ──────────────────────────────────────────────────────────────────────── */
  const hasActiveFilters = useMemo(() => {
    // NÃO considerar "statusFilter = nao_lida" e "data/desc" como filtro ativo (é o padrão)
    const isDefaultSort = sortBy === "data" && sortOrder === "desc";
    const isDefaultStatus = statusFilter === "nao_lida";
    return (
      !!search ||
      !!typeFilter ||
      !!severityFilter ||
      hideRead || // se estiver usando o toggle de ocultar lidas explicitamente
      !isDefaultSort ||
      !isDefaultStatus
    );
  }, [search, typeFilter, severityFilter, sortBy, sortOrder, statusFilter, hideRead]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    let arr = notifs.filter((n) => {
      const matchSearch = term
        ? [n.titulo, n.mensagem, n.tipo]
            .filter(Boolean)
            .map((x) => String(x).toLowerCase())
            .some((txt) => txt.includes(term))
        : true;

      const matchType = typeFilter ? n.tipo === typeFilter : true;

      const isRead = !!readMap[n.id];
      const matchStatus =
        statusFilter === "lida" ? isRead : statusFilter === "nao_lida" ? !isRead : true;

      const matchSeverity = severityFilter ? n.severity === severityFilter : true;

      const respectHideRead = hideRead ? !isRead : true;

      return matchSearch && matchType && matchStatus && matchSeverity && respectHideRead;
    });

    // Ordenação
    arr = arr.sort((a, b) => {
      let comp = 0;
      if (sortBy === "data") {
        const A = parseDate(a.data)?.getTime() ?? 0;
        const B = parseDate(b.data)?.getTime() ?? 0;
        comp = A - B;
      } else if (sortBy === "tipo") {
        comp = String(a.tipo).localeCompare(String(b.tipo), "pt-BR", { sensitivity: "base" });
      } else if (sortBy === "titulo") {
        comp = String(a.titulo).localeCompare(String(b.titulo), "pt-BR", { sensitivity: "base" });
      }
      return sortOrder === "asc" ? comp : -comp;
    });

    return arr;
  }, [notifs, search, typeFilter, statusFilter, severityFilter, sortBy, sortOrder, readMap, hideRead]);

  const total = filtered.length;
  const [itemsPerPageState, setItemsPerPageState] = useState(10);
  useEffect(() => setItemsPerPageState(itemsPerPage), [itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPageState));
  const current = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPageState;
    return filtered.slice(start, start + itemsPerPageState);
  }, [filtered, currentPage, itemsPerPageState]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, statusFilter, severityFilter, sortBy, sortOrder, itemsPerPageState, hideRead]);

  /* ──────────────────────────────────────────────────────────────────────── */
  /* Ações                                                                    */
  /* ──────────────────────────────────────────────────────────────────────── */
  const toggleSort = (field) => {
    setSortBy((prevField) => {
      if (prevField === field) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        return prevField;
      }
      // se mudar de campo, manter desc quando mudar para "data"
      setSortOrder(field === "data" ? "desc" : "asc");
      return field;
    });
  };

  const markRead = (id, value = true) => {
    setReadMap((m) => ({ ...m, [id]: value }));
  };

  const markAllRead = () => {
    const all = {};
    filtered.forEach((n) => {
      all[n.id] = true;
    });
    setReadMap((m) => ({ ...m, ...all }));
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("");
    setStatusFilter("nao_lida"); // volta ao padrão
    setSeverityFilter("");
    setSortBy("data"); // padrão
    setSortOrder("desc"); // padrão
    setHideRead(false);
    setItemsPerPage(10);
    setShowFilters(false);
  };

  const handleRefresh = async () => {
    await fetchAll();
  };

  /* ──────────────────────────────────────────────────────────────────────── */
  /* Render                                                                    */
  /* ──────────────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-4">
      <Helmet>
        <title>Notificações</title>
      </Helmet>

      {/* Cabeçalho */}
      <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-md p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-accent-blue" />
            <div>
              <h1 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary">
                Central de Notificações
              </h1>
              <p className="mt-1 text-md text-light-text-secondary dark:text-dark-text-secondary">
                {isLoading ? "Carregando..." : `Exibindo ${total} notificações`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={markAllRead}
              className={`${inputStyle} h-8 gap-1 inline-flex items-center text-sm bg-emerald-600 text-white hover:bg-emerald-700`}
              title="Marcar todas como lidas"
            >
              <CheckCircle2 className="w-4 h-4" /> Marcar tudo como lido
            </Button>
            <Button
              onClick={handleRefresh}
              className="h-8 px-3 rounded-lg border border-light-border dark:border-dark-border text-slate-600 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5"
              title="Atualizar"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Busca + Filtros */}
        <div className="space-y-4">
          <div className="grid grid-cols-[4fr_1fr] items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar por título, mensagem ou tipo..."
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
                {/* Selo só aparece quando SAIR do padrão */}
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
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
                  {/* Tipo */}
                  <select
                    className={`${inputCampo}`}
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="">Todos os tipos</option>
                    <option value="processo">Processo</option>
                    <option value="alerta">Alerta</option>
                    <option value="usuario">Usuário</option>
                    <option value="entidade">Entidade</option>
                    <option value="orgao">Órgão</option>
                    <option value="sistema">Sistema</option>
                  </select>

                  {/* Status — default: NÃO LIDAS */}
                  <select
                    className={`${inputCampo}`}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="nao_lida">Não lida</option>
                    <option value="">Todas</option>
                    <option value="lida">Lida</option>
                  </select>

                  {/* Severidade */}
                  <select
                    className={`${inputCampo}`}
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                  >
                    <option value="">Todas as severidades</option>
                    <option value="info">Info</option>
                    <option value="success">Sucesso</option>
                    <option value="warning">Atenção</option>
                    <option value="error">Crítico</option>
                  </select>

                  {/* Ordenações — default: data/desc */}
                  <button
                    type="button"
                    onClick={() => toggleSort("data")}
                    className={`${inputCampo} flex items-center justify-between`}
                    title="Ordenar por Data"
                  >
                    Ordenar por Data
                    <ArrowUpDown className="w-4 h-4 opacity-70" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSort("titulo")}
                    className={`${inputCampo} flex items-center justify-between`}
                    title="Ordenar por Título"
                  >
                    Ordenar por Título
                    <ArrowUpDown className="w-4 h-4 opacity-70" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSort("tipo")}
                    className={`${inputCampo} flex items-center justify-between`}
                    title="Ordenar por Tipo"
                  >
                    Ordenar por Tipo
                    <ArrowUpDown className="w-4 h-4 opacity-70" />
                  </button>

                  {/* Ocultar lidas (opcional adicional ao filtro) */}
                  <div className="flex items-center gap-2 px-2">
                    <button
                      type="button"
                      onClick={() => setHideRead((v) => !v)}
                      className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
                      title={hideRead ? "Mostrar lidas" : "Ocultar lidas"}
                    >
                      {hideRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {hideRead ? "Ocultando lidas" : "Exibir lidas"}
                    </button>
                  </div>
                </div>

                {/* Itens por página + Reset */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2">
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

                  <div>
                    <Button
                      onClick={clearFilters}
                      className={`${inputStyle} h-8 gap-1 inline-flex items-center text-sm border border-light-border dark:border-dark-border`}
                    >
                      Limpar filtros
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white dark:bg-dark-bg-primary rounded-md p-0">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mx-auto"></div>
          </div>
        ) : total === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sem notificações no momento</h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
              {hasActiveFilters
                ? "Tente ajustar os filtros ou limpar a busca."
                : "À medida que o sistema for sendo utilizado, os avisos aparecerão aqui."}
            </p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-light-border dark:divide-dark-border">
              {current.map((n) => {
                const meta = typeMeta[n.tipo] || typeMeta.sistema;
                const Icon = meta.icon;
                const tone = badgeTone[n.severity] || badgeTone.info;
                const isRead = !!readMap[n.id];

                return (
                  <li key={n.id}>
                    <div className="flex items-stretch gap-3 px-4 py-3 hover:bg-black/2 dark:hover:bg-white/5 transition">
                      <div
                        className={`w-1 rounded ${
                          n.severity === "error"
                            ? "bg-red-500"
                            : n.severity === "warning"
                            ? "bg-amber-500"
                            : n.severity === "success"
                            ? "bg-emerald-500"
                            : "bg-accent-blue"
                        }`}
                      />
                      <div className="mt-0.5">
                        <Icon className={`w-5 h-5 ${meta.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className={`font-semibold ${isRead ? "opacity-70" : ""}`}>
                            {n.titulo}
                          </h4>
                          <span className={`px-2 py-0.5 text-xs rounded border ${tone}`}>
                            {n.severity === "error"
                              ? "Crítico"
                              : n.severity === "warning"
                              ? "Atenção"
                              : n.severity === "success"
                              ? "Sucesso"
                              : "Info"}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            • {typeMeta[n.tipo]?.label || "Sistema"}
                          </span>
                        </div>

                        <div
                          className={`text-sm mt-0.5 ${
                            isRead
                              ? "text-slate-500 dark:text-slate-400"
                              : "text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          {n.mensagem}
                        </div>

                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <CalendarClock className="w-4 h-4" />
                          <span>{formatDateTime(n.data)}</span>
                          <span className="opacity-60">({relativeStr(n.data)})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {n.href ? (
                          <Link
                            to={n.href}
                            className="px-2 py-1 rounded-md border border-light-border dark:border-dark-border text-xs hover:bg-black/5 dark:hover:bg-white/5"
                          >
                            Abrir
                          </Link>
                        ) : null}
                        <button
                          onClick={() => markRead(n.id, !isRead)}
                          className={`px-2 py-1 rounded-md border text-xs ${
                            isRead
                              ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              : "border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-dark-border dark:text-slate-200 dark:hover:bg-white/5"
                          }`}
                          title={isRead ? "Marcar como não lida" : "Marcar como lida"}
                        >
                          {isRead ? "Não lida" : "Lida"}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Paginação */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 border-t border-light-border dark:border-dark-border">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Exibindo{" "}
                <strong>
                  {(currentPage - 1) * itemsPerPageState + 1}-
                  {Math.min(currentPage * itemsPerPageState, total)}
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
