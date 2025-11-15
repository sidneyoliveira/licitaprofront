// frontend/src/components/Header.jsx
import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Breadcrumb from "./Breadcrumb";
import useAxios from '../hooks/useAxios';

import {
  Bell,
  User,
  Menu,
  Sun,
  Moon,
  Archive as ArchiveIcon,
  LogOut as LogOutIcon,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Info,
  FilePlus2,
  UserPlus,
  Building2,
  Home,
  CalendarClock,
  EyeOff,
} from 'lucide-react';

/* click outside util */
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
};

/* date/utils — mesmos padrões da página de Notificações */
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

const Header = ({ toggleSidebar }) => {
  const { user, logoutUser } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const api = useAxios();

  /* menus */
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  useClickOutside(userMenuRef, () => setUserMenuOpen(false));

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  useClickOutside(notifRef, () => setNotifOpen(false));

  /* notifs state */
  const [processos, setProcessos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [entidades, setEntidades] = useState([]);
  const [orgaos, setOrgaos] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  /* read map in localStorage */
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

  /* fetch helpers */
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

  /* aggregate like Notificacoes.jsx */
  useEffect(() => {
    const list = [];

    // Processos
    processos.forEach((p) => {
      const id = `proc-create-${p.id}`;
      const when = p.updated_at || p.created_at || pickProcessDate(p) || new Date().toISOString();
      list.push({
        id,
        tipo: "processo",
        titulo: p.objeto || p.descricao || p.numero || (p.id ? `Processo #${p.id}` : "Processo"),
        mensagem: `Processo ${p.numero ? `#${p.numero}` : p.id ? `#${p.id}` : ""} ${
          p.created_at ? "criado" : "atualizado"
        }`,
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
              titulo: `Certame próximo ${p.numero ? `(#${p.numero})` : p.id ? `(#${p.id})` : ""}`,
              mensagem: `Faltam ${diff === 0 ? "0" : diff} ${Math.abs(diff) === 1 ? "dia" : "dias"} para o certame (${formatDateTime(d)})`,
              data: new Date().toISOString(),
              severity: diff <= 3 ? "error" : "warning",
              href: p?.id ? `/processos/visualizar/${p.id}` : null,
            });
          } else if (diff < 0 && Math.abs(diff) <= 5) {
            list.push({
              id: `proc-atraso-${p.id}`,
              tipo: "alerta",
              titulo: `Certame em atraso ${p.numero ? `(#${p.numero})` : p.id ? `(#${p.id})` : ""}`,
              mensagem: `O certame passou ${Math.abs(diff)} ${Math.abs(diff) === 1 ? "dia" : "dias"} (${formatDateTime(d)})`,
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
        mensagem: `Usuário cadastrado: ${[u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || u.email}`,
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
        mensagem: `Entidade cadastrada${e.ano ? ` (Ano: ${e.ano})` : ""}${e.cnpj ? ` • CNPJ: ${e.cnpj}` : ""}`,
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

    // Ordena por data desc
    const sorted = [...list].sort((a, b) => {
      const A = parseDate(a.data)?.getTime() ?? 0;
      const B = parseDate(b.data)?.getTime() ?? 0;
      return B - A;
    });

    setNotifs(sorted);
  }, [processos, usuarios, entidades, orgaos]);

  /* unread only for header preview */
  const unread = notifs.filter((n) => !readMap[n.id]);
  const unreadCount = unread.length;

  /* actions */
  const openNotifMenu = async () => {
    // Sempre que abrir, dá um refresh leve (rápido)
    if (!notifOpen) {
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

  const goAll = () => {
    setNotifOpen(false);
    navigate("/notificacoes");
  };

  /* first load */
  useEffect(() => {
    // carrega ao montar
    fetchAll();
    // opcional: auto-refresh leve a cada 60s
    const t = setInterval(fetchAll, 60000);
    return () => clearInterval(t);
  }, [fetchAll]);

  return (
    <motion.header
      className="sticky top-0 z-40 mt-4 mx-3 px-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border-b border-light-border dark:border-dark-border"
    >
      <div className="flex items-center justify-between p-4 h-12">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <Menu className="w-5 h-5 text-light-text-primary dark:text-dark-text-primary" />
        </button>

        <div className='itens-left flex-1 mx-4'>
          <Breadcrumb />
        </div>

        <div className="flex items-center">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            {isDark ? (
              <Sun className="w-6 h-6 text-light-text-primary dark:text-dark-text-primary" />
            ) : (
              <Moon className="w-6 h-6 text-light-text-primary dark:text-dark-text-primary" />
            )}
          </button>

          {/* Notificações */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={openNotifMenu}
              className="p-2 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative"
              title="Notificações"
            >
              <Bell className="w-6 h-6 text-light-text-primary dark:text-dark-text-primary" />
              {unreadCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-[4px] flex items-center justify-center text-[11px] bg-red-500 text-white rounded-full border-2 border-light-bg-secondary dark:border-dark-bg-secondary">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </button>

            {/* Dropdown de Notificações */}
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-[380px] bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-lg shadow-xl z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-3 py-2 border-b border-light-border dark:border-dark-border">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-accent-blue" />
                    <span className="font-semibold">Notificações</span>
                    {unreadCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                        {unreadCount} não lida{unreadCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchAll}
                      className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
                      title="Atualizar"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={markAllRead}
                      className="px-2 py-1 rounded-md text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                      title="Marcar todas como lidas"
                    >
                      <CheckCircle2 className="w-3 h-3 inline-block mr-1" />
                      Marcar todas
                    </button>
                  </div>
                </div>

                <div className="max-h-[380px] overflow-auto">
                  {loadingNotifs ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-blue"></div>
                    </div>
                  ) : unread.length === 0 ? (
                    <div className="text-center py-10 px-4">
                      <EyeOff className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">
                        Nenhuma nova notificação.
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-light-border dark:divide-dark-border">
                      {unread.slice(0, 6).map((n) => {
                        const meta = typeMeta[n.tipo] || typeMeta.sistema;
                        const Icon = meta.icon;
                        const tone = badgeTone[n.severity] || badgeTone.info;
                        return (
                          <li key={n.id} className="p-3 hover:bg-black/5 dark:hover:bg-white/5 transition">
                            <div className="flex gap-3">
                              <div className="mt-0.5">
                                <Icon className={`w-5 h-5 ${meta.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-semibold truncate">{n.titulo}</h4>
                                  <span className={`px-2 py-0.5 text-[10px] rounded border ${tone}`}>
                                    {n.severity === "error"
                                      ? "Crítico"
                                      : n.severity === "warning"
                                      ? "Atenção"
                                      : n.severity === "success"
                                      ? "Sucesso"
                                      : "Info"}
                                  </span>
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                    • {formatDateTime(n.data)} ({relativeStr(n.data)})
                                  </span>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2">
                                  {n.mensagem}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                  {n.href ? (
                                    <Link
                                      to={n.href}
                                      onClick={() => {
                                        markRead(n.id, true);
                                        setNotifOpen(false);
                                      }}
                                      className="px-2 py-1 rounded-md border border-light-border dark:border-dark-border text-xs hover:bg-black/5 dark:hover:bg-white/5"
                                    >
                                      Abrir
                                    </Link>
                                  ) : null}
                                  <button
                                    onClick={() => markRead(n.id, true)}
                                    className="px-2 py-1 rounded-md bg-accent-blue text-white text-xs hover:bg-accent-blue/90"
                                  >
                                    Marcar como lida
                                  </button>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="flex items-center justify-between px-3 py-2 border-t border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary">
                  <Link
                    to="/notificacoes"
                    onClick={() => setNotifOpen(false)}
                    className="text-sm text-accent-blue hover:underline"
                  >
                    Ver todas
                  </Link>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <CalendarClock className="w-3 h-3" />
                    atualizado {formatDateTime(new Date())}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Menu do usuário */}
          <div className="relative ml-1" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <User className="w-6 h-6" />
              <span className="font-medium text-md text-light-text-primary dark:text-dark-text-primary">
                Olá, {(user?.first_name || user?.username || 'Usuario')}
              </span>
            </button>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-56 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-md z-50 py-1"
              >
                <div className="px-4 py-2 border-b dark:border-dark-border">
                  <p className="text-sm font-semibold">{(user?.first_name || user?.username)}</p>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary truncate">
                    {user?.email}
                  </p>
                </div>
                <Link
                  to="/perfil"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm w-full hover:bg-light-border dark:hover:bg-dark-border"
                >
                  <User className="w-4 h-4" /> Minha Conta
                </Link>
                <Link
                  to="/arquivos"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm w-full hover:bg-light-border dark:hover:bg-dark-border"
                >
                  <ArchiveIcon className="w-4 h-4" /> Meus Arquivos
                </Link>
                <div className="border-t border-light-border dark:border-dark-border my-1"></div>
                <button
                  onClick={() => { logoutUser(); setUserMenuOpen(false); }}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
                >
                  <LogOutIcon className="w-4 h-4" /> Sair
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
