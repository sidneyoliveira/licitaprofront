// src/pages/Inicio.js
import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import Card from "../components/Card";
import AuthContext from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  ChevronRight,
  User as UserIcon,
  FileText,
  Building2,
  Users,
  Activity,
  CalendarClock,
} from "lucide-react";
import { useToast } from "../context/ToastContext";

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
const avatarSrc = (userData) => {
  if (userData?.profile_image) return userData.profile_image;
  const name =
    (userData?.first_name || "") + " " + (userData?.last_name || "");
  const fallback = name.trim() || userData?.username || "U";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    fallback
  )}&background=0d3977&color=fff`;
};

const formatDateTime = (iso) => {
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

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
};

const getDisplayName = (userData, authUser) => {
  if (userData?.first_name && userData?.last_name)
    return `${userData.first_name} ${userData.last_name}`;
  if (userData?.first_name) return userData.first_name;
  return authUser?.username || "Usuário";
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Skeletons                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */
const Line = ({ w = "w-24" }) => (
  <div className={`h-3 rounded-md bg-slate-200 dark:bg-dark-border/60 ${w}`} />
);

const CardSkeleton = () => (
  <div className="p-4 rounded-lg bg-white dark:bg-dark-bg-primary space-y-2">
    <Line w="w-32" />
    <Line w="w-16" />
  </div>
);

/* ────────────────────────────────────────────────────────────────────────── */
/* Page                                                                       */
/* ────────────────────────────────────────────────────────────────────────── */
const Inicio = () => {
  const [stats, setStats] = useState(null);
  const [userData, setUserData] = useState(null);
  const [recentProcessos, setRecentProcessos] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const api = useAxios();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, userRes] = await Promise.all([
        api.get("/dashboard-stats/"),
        api.get("/me/"),
      ]);
      setStats(statsRes.data);
      setUserData(userRes.data);
    } catch (error) {
      console.error("Erro ao buscar dados iniciais:", error);
      showToast("Não foi possível carregar os dados iniciais.", "error");
    } finally {
      setIsLoading(false);
    }

    // Busca de atividade recente (opcional/robusta)
    try {
      const r = await api.get("/processos/", {
        params: { ordering: "-id", page_size: 5 },
      });
      const arr = Array.isArray(r.data?.results) ? r.data.results : Array.isArray(r.data) ? r.data : [];
      setRecentProcessos(arr.slice(0, 5));
    } catch {
      // Silencioso: se der erro, mostramos placeholder.
      setRecentProcessos([]);
    }
  }, [api, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData();
  };

  const kpis = useMemo(() => {
    if (!stats) return [];
    return [
      {
        title: "Total de Processos",
        value: stats.total_processos,
        icon: FileText,
        to: "/processos",
      },
      {
        title: "Processos em Andamento",
        value: stats.processos_em_andamento,
        icon: Activity,
        to: "/processos?status=andamento",
      },
      {
        title: "Fornecedores Cadastrados",
        value: stats.total_fornecedores,
        icon: Users,
        to: "/fornecedores",
      },
      {
        title: "Órgãos Cadastrados",
        value: stats.total_orgaos,
        icon: Building2,
        to: "/entidades",
      },
    ];
  }, [stats]);

  return (
    <div className="space-y-4">
      <Helmet>
        <title>Início</title>
      </Helmet>

      {/* Saudação */}
      <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/60 shadow-sm">
              <img
                src={avatarSrc(userData)}
                alt={getDisplayName(userData, user)}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
                {getGreeting()},{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  {getDisplayName(userData, user)}
                </span>
              </h1>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-0.5 flex items-center gap-1">
                <CalendarClock className="w-4 h-4 opacity-70" />
                {formatDateTime(new Date().toISOString())}
              </p>
            </div>
          </div>
          {/* <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate("/processos/novo")}
              className={`${inputStyle} h-9 text-sm bg-accent-blue text-white hover:bg-accent-blue/90`}
            >
              <FileText className="w-4 h-4" />
              Novo Processo
            </Button>
            <Button
              onClick={handleRefresh}
              className="h-9 px-3 rounded-lg  text-slate-600 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5"
              title="Atualizar"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div> */}
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          kpis.map(({ title, value, icon: Icon, to }, idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
            >
              <Link to={to}>
                <div className="p-4 rounded-lg bg-white dark:bg-dark-bg-primary hover:shadow-sm transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {title}
                      </p>
                      <p className="text-3xl font-bold mt-1">{value}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-accent-blue/10">
                      <Icon className="w-6 h-6 text-accent-blue" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>

      {/* Atalhos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <Link to="/fornecedores">
          <div className="p-3 rounded-lg  bg-white dark:bg-dark-bg-primary hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-accent-blue" />
              <span className="font-medium">Fornecedores</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </div>
        </Link>
        <Link to="/entidades">
          <div className="p-3 rounded-lg  bg-white dark:bg-dark-bg-primary hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-accent-blue" />
              <span className="font-medium">Entidades e Unidades</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </div>
        </Link>
        <Link to="/usuarios">
          <div className="p-3 rounded-lg bg-white dark:bg-dark-bg-primary hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-accent-blue" />
              <span className="font-medium">Usuários</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </div>
        </Link>
        <Link to="/processos">
          <div className="p-3 rounded-lg bg-white dark:bg-dark-bg-primary hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent-blue" />
              <span className="font-medium">Processos</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </div>
        </Link>
      </div>

      {/* Atividade recente */}
      <div>
        <div className="p-4 rounded-lg bg-white dark:bg-dark-bg-primary">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent-blue" />
              <h3 className="text-base font-semibold">Atividade Recente</h3>
            </div>
            <Link
              to="/processos"
              className="text-sm text-accent-blue hover:underline flex items-center gap-1"
            >
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Line w="w-1/2" />
              <Line w="w-2/3" />
              <Line w="w-1/3" />
            </div>
          ) : recentProcessos && recentProcessos.length > 0 ? (
            <ul className="divide-y divide-light-border dark:divide-dark-border">
              {recentProcessos.map((p) => {
                const titulo =
                  p?.objeto ||
                  p?.descricao ||
                  p?.numero ||
                  (p?.id ? `Processo #${p.id}` : "Processo");
                const quando =
                  p?.updated_at ||
                  p?.modified_at ||
                  p?.created_at ||
                  p?.data ||
                  null;

                return (
                  <li key={p.id ?? titulo} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{titulo}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        ID: {p?.id ?? "—"}
                        {p?.modalidade ? ` • ${p.modalidade}` : ""}
                        {p?.status ? ` • ${p.status}` : ""}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDateTime(quando)}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Nenhuma atividade recente para mostrar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inicio;
