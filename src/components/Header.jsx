// frontend/src/components/Header.jsx
import React, {
  useState,
  useContext,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import AuthContext from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Breadcrumb from "./Breadcrumb";
import useAxios from "../hooks/useAxios";

import {
  Bell,
  User,
  Menu,
  Sun,
  Moon,
  LogOut as LogOutIcon,
  RefreshCw,
  AlertTriangle,
  Info,
  FilePlus2,
  UserPlus,
  Building2,
  Home,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

/* =========================================================================
 * Hook util: clique fora
 * ========================================================================= */
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
};

/* =========================================================================
 * Utils de data (mesmos padrões da página de Notificações)
 * ========================================================================= */
const parseDate = (raw) => {
  if (!raw) return null;

  // "YYYY-MM-DD"
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

/* =========================================================================
 * Metadados de tipos e tons de badge
 * ========================================================================= */
const typeMeta = {
  processo: { icon: FilePlus2, color: "text-blue-600", label: "Processo" },
  usuario: { icon: UserPlus, color: "text-emerald-600", label: "Usuário" },
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

/* =========================================================================
 * Componente Header
 * ========================================================================= */
const Header = ({ toggleSidebar }) => {
  const { user, logoutUser } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const api = useAxios();

  /* -----------------------------------------------------------------------
   * Refs de menus
   * --------------------------------------------------------------------- */
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  /* -----------------------------------------------------------------------
   * Estado de menus
   * --------------------------------------------------------------------- */
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useClickOutside(userMenuRef, () => setUserMenuOpen(false));
  useClickOutside(notifRef, () => setNotifOpen(false));

  /* -----------------------------------------------------------------------
   * Estado de dados (notificações)
   * --------------------------------------------------------------------- */
  const [processos, setProcessos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [entidades, setEntidades] = useState([]);
  const [orgaos, setOrgaos] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  /* -----------------------------------------------------------------------
   * Mapa de lidas (localStorage)
   * --------------------------------------------------------------------- */
  const [readMap, setReadMap] = useState(() => {
    try {
      const raw = localStorage.getItem("notifications_read_map");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("notifications_read_map", JSON.stringify(readMap));
  }, [readMap]);

  /* -----------------------------------------------------------------------
   * Helpers de fetch
   * --------------------------------------------------------------------- */
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
    setLoadingNotifs(true);
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
    } finally {
      setLoadingNotifs(false);
    }
  }, [api]);

  /* -----------------------------------------------------------------------
   * Agregação de notificações (como em Notificacoes.jsx)
   * --------------------------------------------------------------------- */
  useEffect(() => {
    const list = [];

    // Processos
    processos.forEach((p) => {
      const id = `proc-create-${p.id}`;
      const when =
        p.updated_at ||
        p.created_at ||
        pickProcessDate(p) ||
        new Date().toISOString();

      list.push({
        id,
        tipo: "processo",
        titulo:
          p.objeto ||
          p.descricao ||
          p.numero ||
          (p.id ? `Processo #${p.id}` : "Processo"),
        mensagem: `Processo ${
          p.numero ? `#${p.numero}` : p.id ? `#${p.id}` : ""
        } ${p.created_at ? "criado" : "atualizado"}`,
        data: when,
        severity: "info",
        href: p?.id ? `/processos/visualizar/${p.id}` : null,
      });

      // Alertas de certame (próximo/atrasado)
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
        mensagem: `Usuário cadastrado: ${
          [u.first_name, u.last_name].filter(Boolean).join(" ") ||
          u.username ||
          u.email
        }`,
        data: u.date_joined || u.created_at || new Date().toISOString(),
        severity: "success",
        href: "/usuarios",
      });
    });

    // Entidades
    entidades.forEach((e) => {
      const id = `ent-${e.id}`;
      list.push({
        id,
        tipo: "entidade",
        titulo: e.nome || "Nova entidade",
        mensagem: `Entidade cadastrada${
          e.ano ? ` (Ano: ${e.ano})` : ""
        }${e.cnpj ? ` • CNPJ: ${e.cnpj}` : ""}`,
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
        mensagem: `Órgão cadastrado${
          o.codigo_unidade ? ` • Unidade: ${o.codigo_unidade}` : ""
        }`,
        data: o.created_at || new Date().toISOString(),
        severity: "success",
        href: "/entidades",
      });
    });

    // Ordena por data desc
    const sorted = [...list].sort((a, b) => {
      const A = parseDate(a.data)?.getTime() ?? 0;
      const B = parseDate(b.data)?.getTime() ?? 0;
      return B - A;
    });

    setNotifs(sorted);
  }, [processos, usuarios, entidades, orgaos]);

  /* -----------------------------------------------------------------------
   * Derivados: não lidas
   * --------------------------------------------------------------------- */
  const unread = notifs.filter((n) => !readMap[n.id]);
  const unreadCount = unread.length;

  /* -----------------------------------------------------------------------
   * Ações
   * --------------------------------------------------------------------- */
  const openNotifMenu = async () => {
    if (!notifOpen) {
      // refresh leve ao abrir
      await fetchAll();
    }
    setNotifOpen((v) => !v);
  };

  const markRead = (id, value = true) => {
    setReadMap((m) => ({ ...m, [id]: value }));
  };

  const markAllRead = () => {
    const all = {};
    unread.forEach((n) => {
      all[n.id] = true;
    });
    setReadMap((m) => ({ ...m, ...all }));
  };

  /* -----------------------------------------------------------------------
   * Efeito inicial: carregar + auto-refresh
   * --------------------------------------------------------------------- */
  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 60000);
    return () => clearInterval(t);
  }, [fetchAll]);

  /* =========================================================================
   * JSX
   * ========================================================================= */
  return (
    <header
      className="
        sticky top-0 z-40 mt-4 mx-3
        rounded-2xl
        bg-white/95 dark:bg-dark-bg-secondary
        backdrop-blur
      "
    >
      <div className="flex items-center justify-between px-3 py-3 h-16">

        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={toggleSidebar}
            className="
              inline-flex items-center justify-center
              w-9 h-9
              rounded-full
              bg-slate-100 hover:bg-slate-200
              text-slate-700
              dark:bg-slate-800 dark:hover:bg-slate-700
              dark:text-slate-100
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600
            "
            aria-label="Alternar menu lateral"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:block text-slate-700 dark:text-slate-100 text-sm truncate">
            <Breadcrumb />
          </div>
        </div>

        {/* DIREITA: ações + usuário */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Alternar Tema */}
          <button
            onClick={toggleTheme}
            className="
              inline-flex items-center justify-center
              w-9 h-9
              rounded-full
              bg-slate-100 hover:bg-slate-200
              text-slate-700
              dark:bg-slate-800 dark:hover:bg-slate-700
              dark:text-slate-100
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600
            "
            title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* Notificações */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={openNotifMenu}
              className="
                relative
                inline-flex items-center justify-center
                w-9 h-9
                rounded-full
                bg-slate-100 hover:bg-slate-200
                text-slate-700
                dark:bg-slate-800 dark:hover:bg-slate-700
                dark:text-slate-100
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600
              "
              title="Notificações"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span
                  className="
                    absolute -top-0.5 -right-0.5
                    w-2.5 h-2.5
                    bg-red-500
                    rounded-full
                    border-2 border-white dark:border-slate-900
                  "
                />
              )}
            </button>

            {/* Dropdown Notificações */}
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="
                    absolute right-0 mt-3 w-80 md:w-96
                    bg-white dark:bg-slate-900
                    border border-slate-200 dark:border-slate-700
                    rounded-2xl
                    z-50 overflow-hidden
                    text-slate-800 dark:text-slate-50
                  "
                >
                  {/* Cabeçalho notificações */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-700 dark:text-slate-100">
                        Notificações
                      </span>
                      {unreadCount > 0 && (
                        <span
                          className="
                            text-[10px] px-1.5 py-0.5 rounded-md
                            bg-red-100 text-red-700 border border-red-200
                            dark:bg-red-900/30 dark:text-red-300 dark:border-red-800
                            font-semibold
                          "
                        >
                          {unreadCount} nova{unreadCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={fetchAll}
                        className="
                          p-1.5 rounded
                          text-slate-400 hover:text-blue-600
                          hover:bg-blue-50 dark:hover:bg-blue-900/20
                          transition-colors
                        "
                        title="Atualizar"
                      >
                        <RefreshCw size={14} />
                      </button>
                      <button
                        onClick={markAllRead}
                        className="
                          p-1.5 rounded
                          text-slate-400 hover:text-emerald-600
                          hover:bg-emerald-50 dark:hover:bg-emerald-900/20
                          transition-colors
                        "
                        title="Marcar todas como lidas"
                      >
                        <CheckCircle2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Lista notificações */}
                  <div className="max-h-[320px] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                    {loadingNotifs ? (
                      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mb-2" />
                        <span className="text-xs">Carregando...</span>
                      </div>
                    ) : unread.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-full mb-3">
                          <EyeOff className="w-6 h-6 opacity-60" />
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          Tudo limpo por aqui!
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {unread.slice(0, 6).map((n) => {
                          const meta = typeMeta[n.tipo] || typeMeta.sistema;
                          const Icon = meta.icon;

                          return (
                            <div
                              key={n.id}
                              className="
                                group p-4 relative
                                hover:bg-slate-50 dark:hover:bg-slate-800
                                transition-colors
                              "
                            >
                              <div className="flex gap-3">
                                <div
                                  className="
                                    mt-1 p-2 rounded-lg
                                    bg-slate-100 dark:bg-slate-800
                                    flex items-center justify-center
                                  "
                                >
                                  <Icon
                                    size={16}
                                    className={`${meta.color} dark:text-current`}
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start mb-1 gap-2">
                                    <h5 className="text-sm font-semibold truncate pr-4 text-slate-800 dark:text-slate-50">
                                      {n.titulo}
                                    </h5>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap mt-0.5">
                                      {relativeStr(n.data)}
                                    </span>
                                  </div>

                                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                    {n.mensagem}
                                  </p>

                                  <div className="flex gap-3 mt-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                                    {n.href && (
                                      <Link
                                        to={n.href}
                                        onClick={() => {
                                          markRead(n.id);
                                          setNotifOpen(false);
                                        }}
                                        className="
                                          text-[11px] font-semibold
                                          text-blue-600 dark:text-blue-400
                                          hover:underline
                                        "
                                      >
                                        Ver detalhes
                                      </Link>
                                    )}
                                    <button
                                      onClick={() => markRead(n.id)}
                                      className="
                                        text-[11px] font-medium
                                        text-slate-400 hover:text-slate-600
                                        dark:text-slate-500 dark:hover:text-slate-300
                                      "
                                    >
                                      Marcar como lida
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <Link
                    to="/notificacoes"
                    onClick={() => setNotifOpen(false)}
                    className="
                      block w-full py-3 text-center text-xs font-semibold
                      text-blue-600 dark:text-blue-400
                      bg-slate-50 dark:bg-slate-900
                      border-t border-slate-100 dark:border-slate-800
                      hover:bg-blue-50/60 dark:hover:bg-slate-800
                      transition-colors
                    "
                  >
                    Ver todas as notificações
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Divisor vertical*/}
          <div className="hidden md:block h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Menu do Usuário */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="
                flex items-center gap-3
                px-4 py-1
                rounded-xl
                bg-slate-100 hover:bg-slate-200
                dark:bg-slate-800 dark:hover:bg-slate-700
                text-slate-800 dark:text-slate-50
                transition-all
                focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600
              "
            >
              <div
                className="
                  w-9 h-9
                  rounded-full
                  bg-slate-200
                  dark:bg-slate-700
                  flex items-center justify-center
                  text-slate-700 dark:text-slate-100
                  overflow-hidden
                  shadow-sm
                  ring-2 ring-white/60 dark:ring-slate-800
                "
              >
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>

              <div className="hidden md:block text-left">
                <p className="text-md font-semibold text-slate-800 dark:text-slate-50 leading-none max-w-[140px] truncate">
                  {user?.first_name || user?.username || "Usuário"}
                </p>
              </div>
            </button>

            {/* Dropdown Usuário */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="
                    absolute right-0 mt-3 w-60
                    bg-white dark:bg-slate-900
                    border border-slate-200 dark:border-slate-700
                    rounded-xl shadow-xl
                    z-50 overflow-hidden
                    text-slate-800 dark:text-slate-50
                  "
                >
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/70">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-50 truncate">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p
                      className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5"
                      title={user?.email}
                    >
                      {user?.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/perfil"
                      onClick={() => setUserMenuOpen(false)}
                      className="
                        flex items-center gap-3 px-5 py-2.5
                        text-sm
                        text-slate-600 dark:text-slate-300
                        hover:bg-slate-50 dark:hover:bg-slate-800
                        hover:text-blue-600 dark:hover:text-blue-400
                        transition-colors
                      "
                    >
                      <User size={18} className="opacity-70" />
                      Minha conta
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-700 py-1">
                    <button
                      onClick={() => {
                        logoutUser();
                        setUserMenuOpen(false);
                      }}
                      className="
                        w-full text-left
                        flex items-center gap-3 px-5 py-2.5
                        text-sm font-medium
                        text-red-600 dark:text-red-400
                        hover:bg-red-50 dark:hover:bg-red-900/20
                        transition-colors
                      "
                    >
                      <LogOutIcon size={18} />
                      Sair do sistema
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
