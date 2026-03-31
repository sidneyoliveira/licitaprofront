import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  CreditCard,
  Loader2,
  Edit,
  CheckCircle,
  Clock,
  FileText,
  Download,
  Plus,
  Trash2,
  Paperclip,
  X,
  UploadCloud,
  Save,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import useAxios from "../hooks/useAxios";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import UsuarioEditModal from "../components/UsuarioEditModal";
import SharedNotesBoard from "../components/SharedNotesBoard";

/* ────────────────────────────────────────────────────────────────────────── */
/* 1. UI HELPERS & STYLES                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

const Label = ({ children, className = "" }) => (
  <label className={`block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide ${className}`}>
    {children}
  </label>
);

const ReadOnlyInput = ({ icon: Icon, value, className = "", ...props }) => (
  <div className={`relative ${className}`}>
    {Icon && (
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Icon size={18} strokeWidth={2} />
      </div>
    )}
    <div
      className={`
        w-full bg-slate-50 dark:bg-dark-bg-primary text-slate-700 dark:text-slate-300 
        rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm 
        cursor-default font-medium flex items-center
        ${Icon ? "pl-11" : ""}
      `}
      {...props}
    >
        {value || <span className="text-slate-400 italic font-normal">Não informado</span>}
    </div>
  </div>
);

const SectionHeader = ({ title, icon: Icon, action }) => (
  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
    <div className="flex items-center gap-3">
  <div className="p-2 bg-accent-blue/10 dark:bg-accent-blue/20 rounded-lg text-accent-blue dark:text-blue-400">
        <Icon size={20} strokeWidth={2} />
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-white tracking-tight">
        {title}
      </h3>
    </div>
    {action}
  </div>
);

const InfoBadge = ({ label, active, icon: Icon }) => (
  <div
    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
      active
        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
        : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700"
    }`}
  >
    {Icon && <Icon size={14} strokeWidth={2.5} />}
    {label}
  </div>
);

/* ────────────────────────────────────────────────────────────────────────── */
/* 2. MODAL DE ANEXAR ARQUIVO                                                */
/* ────────────────────────────────────────────────────────────────────────── */

const AttachFileModal = ({ open, onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleFileChange = (e) => {
    if (e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);

    await onUpload({ file, description });

    setUploading(false);
    setFile(null);
    setDescription("");
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-dark-bg-secondary rounded-xl shadow-lg overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-bg-secondary">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent-blue/10 dark:bg-accent-blue/20 rounded-lg text-accent-blue">
                      <Paperclip size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                    Anexar Documento
                  </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Área de Upload */}
              <div className="space-y-2">
                  <Label>Arquivo</Label>
                  <div
                    onClick={() => fileRef.current.click()}
                    className={`
                        border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all group
                        ${file 
                            ? 'border-emerald-400 bg-emerald-50/30 dark:border-emerald-800/50' 
                            : 'border-slate-300 dark:border-slate-700 hover:border-accent-blue hover:bg-blue-50/30 dark:hover:border-blue-500'
                        }
                    `}
                  >
                    <input
                      type="file"
                      ref={fileRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {file ? (
                        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full mb-3">
                                <CheckCircle size={32} />
                            </div>
                            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 break-all px-4">
                                {file.name}
                            </p>
                            <p className="text-xs text-emerald-600/70 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                            <span className="text-xs text-slate-400 mt-4 underline hover:text-slate-600">Trocar arquivo</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="p-3 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-full mb-3 group-hover:text-accent-blue group-hover:bg-blue-100 transition-colors">
                                <UploadCloud size={32} />
                            </div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                Clique para selecionar
                            </p>
                            <p className="text-xs text-slate-400 mt-1">PDF, JPG ou PNG</p>
                        </div>
                    )}
                  </div>
              </div>

              <div>
                <Label>Descrição (Opcional)</Label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: CNH, Comprovante de Residência..."
                  className="w-full h-12 px-4 bg-white dark:bg-dark-bg-primary border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue outline-none transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!file || uploading}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-accent-blue hover:bg-accent-blue-hover rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                  {uploading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Salvar Anexo
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/* 3. PÁGINA PERFIL                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

const Perfil = () => {
  const api = useAxios();
  const { showToast } = useToast();
  const { user: authUser } = useAuth();
  const isAdmin = authUser?.is_staff || authUser?.is_superuser;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modais
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [attachModalOpen, setAttachModalOpen] = useState(false);

  const [documents, setDocuments] = useState([]);

  const fetchUser = async () => {
    try {
      const { data } = await api.get("/me/");
      setUser(data);
    } catch (err) {
      showToast("Erro ao carregar perfil.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1. Carregar Usuário e Documentos
  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, docsRes] = await Promise.all([
        api.get("/me/"),
        api.get("/arquivos-user/"),
      ]);
      
      setUser(userRes.data);
      setDocuments(docsRes.data?.results || docsRes.data || []);
      
    } catch (err) {
      console.error(err);
      showToast("Erro ao carregar dados do perfil.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Upload Arquivo (POST multipart)
  const handleUploadDocument = async ({ file, description }) => {
    try {
      const formData = new FormData();
      formData.append("arquivo", file);
      if (description) formData.append("descricao", description);

      const response = await api.post("/arquivos-user/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDocuments([response.data, ...documents]);
      showToast("Arquivo anexado com sucesso!", "success");
    } catch (error) {
      console.error(error);
      showToast("Erro ao anexar arquivo.", "error");
    }
  };

  // 3. Deletar Arquivo (DELETE)
  const handleDeleteDocument = async (id) => {
    try {
      await api.delete(`/arquivos-user/${id}/`);
      setDocuments(documents.filter((d) => d.id !== id));
      showToast("Arquivo removido.", "success");
    } catch (error) {
      console.error(error);
      showToast("Erro ao remover arquivo.", "error");
    }
  };

  if (loading || !user) {
    return (
      <div className="w-full h-[80vh] flex flex-col items-center justify-center gap-4">
  <Loader2 className="w-12 h-12 text-accent-blue animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 space-y-4">
        
        {/* MODAIS */}
        <UsuarioEditModal
          open={editModalOpen}
          user={user}
          onClose={() => setEditModalOpen(false)}
          onSaved={() => {
            fetchUser();
            setEditModalOpen(false);
          }}
        />

        <AttachFileModal
          open={attachModalOpen}
          onClose={() => setAttachModalOpen(false)}
          onUpload={handleUploadDocument}
        />

        {/* --- CABEÇALHO DO PERFIL --- */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-6 w-full">
                
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden ring-1 ring-gray-100 dark:ring-slate-800">
                        <img
                            src={user.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || "U")}&background=004aad&color=fff&size=256&bold=true`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {user.is_superuser && (
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white dark:border-dark-bg-secondary flex items-center gap-1 whitespace-nowrap z-10">
                            <ShieldCheck size={12} /> ADMIN
                        </div>
                    )}
                </div>

                {/* Informações Principais e Badges */}
                <div className="flex-1 text-center md:text-left min-w-0">
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                        {user.first_name} {user.last_name}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm flex flex-wrap justify-center md:justify-start items-center gap-2 mt-1">
                        <span className="text-accent-blue font-bold">@{user.username}</span>
                        <span className="hidden md:inline w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="truncate">{user.email}</span>
                    </p>
                    
                    {/* Entidades vinculadas */}
                    {user.entidades_nomes && user.entidades_nomes.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <Building2 size={13} className="text-slate-400 flex-shrink-0" />
                        {user.entidades_nomes.map((ent, idx) => (
                          <span key={ent.id} className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {ent.nome}{idx < user.entidades_nomes.length - 1 ? "," : ""}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                        {isAdmin && (
                        <InfoBadge
                            label={user.is_active ? "Conta Ativa" : "Conta Inativa"}
                            active={user.is_active}
                            icon={user.is_active ? CheckCircle : Shield}
                        />
                        )}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-dark-bg-primary text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <Clock size={14} className="text-slate-400" />
                            Membro desde {new Date(user.date_joined).getFullYear()}
                        </div>
                    </div>
                </div>

                {/* Botão Editar (Alinhado à direita em Desktop, abaixo em Mobile) */}
                <div className="flex-shrink-0 mt-2 md:mt-0">
                    <button
                        onClick={() => setEditModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-dark-bg-primary text-slate-600 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-accent-blue transition-colors border border-slate-200 dark:border-slate-700"
                    >
                        <Edit size={16} />
                        Editar Perfil
                    </button>
                </div>
            </div>
        </div>

        {/* --- GRID DE CONTEÚDO --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* COLUNA ESQUERDA: Informações Detalhadas */}
          <div className="lg:col-span-2 space-y-4">
             
             {/* Card Dados Pessoais */}
             <div className="bg-white dark:bg-dark-bg-secondary p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <SectionHeader title="Dados Pessoais" icon={User} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                   <div>
                      <Label>Nome Completo</Label>
                      <ReadOnlyInput icon={User} value={`${user.first_name} ${user.last_name}`} />
                   </div>
                   <div>
                      <Label>CPF</Label>
                      <ReadOnlyInput icon={CreditCard} value={user.cpf} />
                   </div>
                   <div>
                      <Label>Data de Nascimento</Label>
                      <ReadOnlyInput icon={Calendar} value={user.data_nascimento ? new Date(user.data_nascimento).toLocaleDateString('pt-BR') : null} />
                   </div>
                   {isAdmin && (
                   <div>
                      <Label>Nível de Acesso</Label>
                      <div className="h-[46px] flex items-center px-4 bg-slate-50 dark:bg-dark-bg-primary border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300">
                          <Shield className="w-4 h-4 mr-2 text-accent-blue" />
                          {user.is_superuser ? "Administrador Total" : user.is_staff ? "Membro da Equipe" : "Usuário Padrão"}
                      </div>
                   </div>
                   )}
                </div>
             </div>

             {/* Card Contato */}
             <div className="bg-white dark:bg-dark-bg-secondary p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <SectionHeader title="Informações de Contato" icon={Phone} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                   <div>
                      <Label>E-mail Principal</Label>
                      <ReadOnlyInput icon={Mail} value={user.email} />
                   </div>
                   <div>
                      <Label>Telefone / WhatsApp</Label>
                      <ReadOnlyInput icon={Phone} value={user.phone} />
                   </div>
                </div>
             </div>

             {/* Card Documentos */}
             <div className="bg-white dark:bg-dark-bg-secondary p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <SectionHeader 
                    title="Documentos" 
                    icon={FileText} 
                    action={
                        <button 
                            onClick={() => setAttachModalOpen(true)}
                            className="text-xs font-bold text-accent-blue hover:text-blue-700 flex items-center gap-1 px-3 py-1.5 bg-accent-blue/10 dark:bg-accent-blue/20 rounded-lg transition-colors"
                        >
                            <Plus size={14} strokeWidth={3} /> Novo
                        </button>
                    }
                />
                
                <div className="space-y-3">
                    {documents.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                            <UploadCloud className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">Nenhum documento vinculado.</p>
                        </div>
                    ) : (
                        documents.map(doc => (
                            <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-dark-bg-primary text-slate-500 flex items-center justify-center flex-shrink-0">
                                        <FileText size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                            {doc.descricao || doc.arquivo?.split("/").pop() || "Documento"}
                                        </h4>
                                        <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                            <span>{doc.enviado_em ? new Date(doc.enviado_em).toLocaleDateString("pt-BR") : ""}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {doc.arquivo_url && (
                                        <a
                                            href={doc.arquivo_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-slate-400 hover:text-accent-blue hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                        >
                                            <Download size={18} />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleDeleteDocument(doc.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
             </div>
          </div>

      {/* COLUNA DIREITA: Sidebar de Anotações/Tarefas */}
          <div className="lg:col-span-1 space-y-8">
      <SharedNotesBoard
        title="Anotações Pessoais"
        showPreferences
        onPreferencesSaved={fetchUser}
      />

          </div>

        </div>
      </div>
    </div>
  );
};

export default Perfil;