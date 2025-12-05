import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Building2,
  Users,
  Activity,
  Calendar,
  ArrowRight,
  Plus,
  Settings,
  UserCheck,
  Clock,
  LayoutGrid,
  ShieldCheck,
} from "lucide-react";

import useAxios from "../hooks/useAxios";
import AuthContext from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

/* ────────────────────────────────────────────────────────────────────────── */
/* 1. UTILS & HELPERS                                                        */
/* ────────────────────────────────────────────────────────────────────────── */

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Avatar com iniciais e cor formal (fallback)
const getAvatarUrl = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "User"
  )}&background=004aad&color=fff&bold=true&size=128`;
};

/* ────────────────────────────────────────────────────────────────────────── */
/* 2. SUBCOMPONENTES VISUAIS                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

// Card de Estatísticas (KPI)
const StatCard = ({ title, value, icon: Icon, to }) => (
  <Link to={to} className="block h-full group">
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="h-full p-6 bg-white dark:bg-dark-bg-secondary rounded-2xl  hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-[#004aad] dark:text-blue-400">
          <Icon size={24} strokeWidth={2} />
        </div>
        <ArrowRight
          size={16}
          className="text-slate-300 dark:text-slate-600 group-hover:text-[#004aad] transition-colors"
        />
      </div>

      <div className="space-y-1">
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
          {value !== null && value !== undefined ? value : "-"}
        </h3>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </p>
      </div>
    </motion.div>
  </Link>
);

// Card de Atalho
const ShortcutCard = ({ label, icon: Icon, to, description }) => (
  <Link to={to} className="group block h-full">
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-dark-bg-secondary rounded-2xl  hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200 h-full">
      <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[#004aad] dark:text-blue-400 group-hover:scale-105 transition-transform duration-300">
        <Icon size={20} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-800 dark:text-white text-sm truncate group-hover:text-[#004aad] transition-colors">
          {label}
        </h4>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {description}
          </p>
        )}
      </div>
      <div className="text-slate-300 dark:text-slate-600 group-hover:text-[#004aad] transition-colors">
        <ArrowRight size={18} />
      </div>
    </div>
  </Link>
);

// Item de Atividade Recente
const RecentActivityItem = ({ process }) => (
  <div className="group flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors duration-200">
    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[#004aad] dark:text-blue-400 flex items-center justify-center flex-shrink-0">
      <FileText size={18} />
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h4 className="text-sm font-semibold text-slate-800 dark:text-white truncate">
          {process.objeto || `Processo sem objeto definido`}
        </h4>
        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap flex items-center gap-1">
          <Clock size={10} />
          {formatDate(
            process.data_criacao_sistema || process.created_at
          )}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-medium text-slate-600 dark:text-slate-300">
            {process.numero_processo || "S/N"}
          </span>
          {process.modalidade && (
            <span className="truncate max-w-[150px] hidden sm:block">
              • {process.modalidade}
            </span>
          )}
        </div>

        <Link
          to={`/processos/editar/${process.id}`}
          className="text-xs font-bold text-[#004aad] dark:text-blue-400 hover:underline opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          Ver detalhes
        </Link>
      </div>
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"
      />
    ))}
  </div>
);

/* ────────────────────────────────────────────────────────────────────────── */
/* 3. PÁGINA PRINCIPAL                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

const Inicio = () => {
  const { user } = useContext(AuthContext);
  const api = useAxios();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentProcesses, setRecentProcesses] = useState([]);

  const currentDate = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const greeting = getGreeting();
  const displayName = user?.first_name || user?.username || "Usuário";

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, recentRes] = await Promise.all([
        api.get("/dashboard-stats/"),
        api.get("/processos/", {
          params: { page_size: 5, ordering: "-id" },
        }),
      ]);

      setStats(statsRes.data);
      setRecentProcesses(recentRes.data.results || []);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const kpiData = useMemo(
    () => [
      {
        title: "Total de Processos",
        value: stats?.total_processos,
        icon: FileText,
        to: "/processos",
      },
      {
        title: "Em Andamento",
        value: stats?.processos_em_andamento,
        icon: Activity,
        to: "/processos?status=andamento",
      },
      {
        title: "Fornecedores",
        value: stats?.total_fornecedores,
        icon: Users,
        to: "/fornecedores",
      },
      {
        title: "Órgãos",
        value: stats?.total_orgaos,
        icon: Building2,
        to: "/entidades",
      },
    ],
    [stats]
  );

  return (
    <div className="min-h-screen pb-20 flex justify-center items-start">
      <Helmet>
        <title>Dashboard | Licitapro</title>
      </Helmet>

      <div className="max-w-7xl w-full py-2 space-y-6 px-3 md:px-0">
        {/* CABEÇALHO / HERO */}
        <header className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-dark-bg-secondary rounded-2xl px-6 py-6 gap-4">
          <div className="flex items-center gap-5">
            <img
              src={user?.profile_image || getAvatarUrl(displayName)}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover bg-slate-100 dark:bg-slate-700"
            />
            <div>
              <h1 className="text-2xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {greeting},{" "}
                <span className="text-[#004aad] dark:text-blue-400">
                  {displayName}
                </span>
              </h1>
              <div className="flex items-center gap-2 mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                <Calendar size={14} />
                <span className="capitalize">{currentDate}</span>
              </div>
            </div>
          </div>
        </header>

        {/* VISÃO GERAL (KPIs) */}
        <section>
          
          {isLoading ? (
            <DashboardSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpiData.map((kpi, idx) => (
                <StatCard
                  key={idx}
                  title={kpi.title}
                  value={kpi.value}
                  icon={kpi.icon}
                  to={kpi.to}
                />
              ))}
            </div>
          )}
        </section>

        {/* CONTEÚDO DUPLO (Atalhos + Feed) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* COLUNA ESQUERDA: ATALHOS */}
          <section className="lg:col-span-1 flex flex-col gap-6">  
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <ShortcutCard
                label="Fornecedores"
                description="Gerencie sua base de contatos"
                icon={UserCheck}
                to="/fornecedores"
              />
              <ShortcutCard
                label="Entidades e Órgãos"
                description="Cadastro de unidades compradoras"
                icon={Building2}
                to="/entidades"
              />
              <ShortcutCard
                label="Usuários"
                description="Controle de acesso ao sistema"
                icon={Users}
                to="/usuarios"
              />
              <ShortcutCard
                label="Configurações"
                description="Preferências gerais do sistema"
                icon={Settings}
                to="/configuracoes"
              />
            </div>
          </section>

          {/* COLUNA DIREITA: PROCESSOS RECENTES */}
          <section className="lg:col-span-2 flex flex-col gap-6">

            <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-sm overflow-hidden min-h-[300px]">
              {isLoading ? (
                <div className="p-6 space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-slate-50 dark:bg-slate-800 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : recentProcesses.length > 0 ? (
                <div className="p-2">
                  {recentProcesses.map((process) => (
                    <RecentActivityItem key={process.id} process={process} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[375px] text-center px-6">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <FileText
                      size={32}
                      className="text-slate-300 dark:text-slate-600"
                    />
                  </div>
                  <h3 className="text-slate-800 dark:text-white font-semibold mb-1">
                    Nenhum processo recente
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto mb-6">
                    Comece criando um novo processo licitatório para ver a
                    atividade aqui.
                  </p>
                  <button
                    onClick={() => navigate("/processos/novo")}
                    className="text-[#004aad] dark:text-blue-400 text-sm font-bold hover:underline"
                  >
                    Criar primeiro processo
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Inicio;
