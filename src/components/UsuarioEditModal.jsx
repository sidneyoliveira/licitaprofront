// frontend/src/components/UsuarioEditModal.jsx

import React, { useEffect, useState, useRef, useMemo } from "react";
import { 
  X, 
  Camera, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save, 
  User, 
  Shield, 
  Lock, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Phone,
  Calendar,
  CreditCard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAxios from "../hooks/useAxios";
import { useToast } from "../context/ToastContext";

/* ────────────────────────────────────────────────────────────────────────── */
/* 🎨 UI COMPONENTS INTERNOS                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

const Label = ({ children, required }) => (
  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const Input = ({ icon: Icon, error, ...props }) => (
  <div className="relative group">
    {Icon && (
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className={`h-4.5 w-4.5 ${error ? "text-red-400" : "text-gray-400 group-focus-within:text-accent-blue transition-colors"}`} />
      </div>
    )}
    <input
      className={`
        w-full bg-white dark:bg-dark-bg-primary text-gray-900 dark:text-white 
        rounded-xl border px-3 py-2.5 text-sm transition-all outline-none shadow-sm
        ${Icon ? "pl-10" : ""}
        ${error 
          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
          : "border-gray-200 dark:border-dark-border focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/10 hover:border-gray-300 dark:hover:border-gray-600"
        }
      `}
      {...props}
    />
    {error && <p className="text-xs text-red-500 mt-1 ml-1 animate-pulse">{error}</p>}
  </div>
);

const Switch = ({ label, description, checked, onChange, icon: Icon }) => (
  <label className={`
    flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all group select-none
    ${checked 
      ? "bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800" 
      : "bg-white border-gray-200 dark:bg-dark-bg-primary dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600"
    }
  `}>
    <div className="flex items-center gap-4">
      <div className={`p-2.5 rounded-full transition-colors ${checked ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
        {Icon ? <Icon className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
      </div>
      <div>
        <p className={`font-semibold text-sm ${checked ? "text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-white"}`}>
          {label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
      </div>
    </div>
    <div className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-blue"></div>
    </div>
  </label>
);

/* ────────────────────────────────────────────────────────────────────────── */
/* 🛠️ UTILS                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

const formatCPF = (v = "") => String(v).replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
const formatPhone = (v = "") => {
  const r = String(v).replace(/\D/g, "").slice(0, 11);
  if (r.length > 10) return r.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
  return r.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
};

/* ────────────────────────────────────────────────────────────────────────── */
/* 🚀 MODAL COMPLETO                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

export default function UsuarioEditModal({ open, user, onClose, onSaved }) {
  const api = useAxios();
  const { showToast } = useToast();
  const isEdit = Boolean(user?.id);
  const fileRef = useRef(null);

  // -- Estados --
  const [activeTab, setActiveTab] = useState("geral");
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // -- Form State --
  const [form, setForm] = useState({
    username: "", first_name: "", last_name: "", email: "", cpf: "",
    data_nascimento: "", phone: "", is_active: true, is_staff: false,
    password: "", confirm_password: ""
  });

  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // -- Effects --
  useEffect(() => {
    if (!open) return;
    
    setForm({
      username: "", first_name: "", last_name: "", email: "", cpf: "",
      data_nascimento: "", phone: "", is_active: true, is_staff: false,
      password: "", confirm_password: ""
    });
    setErrors({});
    setSelectedFile(null);
    setPreview(null);
    setActiveTab("geral");

    if (isEdit) fetchDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  const fetchDetails = async () => {
    setLoadingData(true);
    try {
      const { data } = await api.get(`/usuarios/${user.id}/`);
      setForm((prev) => ({
        ...prev,
        username: data.username || "",
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        cpf: data.cpf || "",
        data_nascimento: data.data_nascimento || "",
        phone: data.phone || "",
        is_active: data.is_active ?? true,
        is_staff: data.is_staff ?? false,
      }));
      setPreview(data.profile_image);
    } catch (e) {
      setForm((prev) => ({ ...prev, ...user }));
    } finally {
      setLoadingData(false);
    }
  };

  // -- Handlers --
  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === "cpf") val = formatCPF(value);
    if (name === "phone") val = formatPhone(value);

    setForm(prev => ({ ...prev, [name]: val }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSwitch = (name) => {
    setForm(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Usuário obrigatório.";
    if (!form.first_name.trim()) newErrors.first_name = "Nome obrigatório.";
    if (!form.email.trim()) newErrors.email = "E-mail obrigatório.";
    
    if (!isEdit && !form.password) newErrors.password = "Senha obrigatória para novos.";
    if (form.password && form.password !== form.confirm_password) {
      newErrors.confirm_password = "As senhas não conferem.";
    }

    setErrors(newErrors);
    
    if (newErrors.password || newErrors.confirm_password || newErrors.username) {
       if (newErrors.password || newErrors.confirm_password) setActiveTab("seguranca");
       else if (newErrors.username) setActiveTab("seguranca");
    } else if (Object.keys(newErrors).length > 0) {
       setActiveTab("geral");
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const formData = new FormData();
      
      const fields = ["username", "first_name", "last_name", "email", "cpf", "data_nascimento", "phone", "is_active", "is_staff"];
      fields.forEach(f => formData.append(f, form[f] === null ? "" : form[f]));

      if (form.password) formData.append("password", form.password);
      if (selectedFile) formData.append("profile_image", selectedFile);

      const url = isEdit ? `/usuarios/${user.id}/` : `/usuarios/`;
      const method = isEdit ? api.patch : api.post;

      await method(url, formData, { headers: { "Content-Type": "multipart/form-data" } });

      showToast(isEdit ? "Perfil atualizado com sucesso!" : "Usuário criado com sucesso!", "success");
      onSaved?.();
      onClose?.();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.detail || 
                  (error.response?.data?.username ? "Nome de usuário já existe." : "Erro ao salvar dados.");
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-5xl bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* ─ HEADER (CORRIGIDO: Sem sticky) ─ */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-border bg-white dark:bg-dark-bg-secondary flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {isEdit ? "Editar Perfil" : "Novo Membro"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEdit ? `Gerenciando usuário #${user.id}` : "Preencha os dados para conceder acesso."}
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg-primary text-gray-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ─ BODY (Com Flex e Min-Height para Scroll Correto) ─ */}
            <div className="flex flex-1 overflow-hidden flex-col md:flex-row min-h-0">
              
              {/* Sidebar */}
              <div className="w-full md:w-72 bg-gray-50/80 dark:bg-dark-bg-primary/50 border-r border-gray-100 dark:border-dark-border p-6 flex flex-col gap-6 overflow-y-auto flex-shrink-0">
                
                {/* Avatar */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-full border-4 border-white dark:border-dark-bg-secondary shadow-lg overflow-hidden bg-gray-200">
                      <img 
                        src={preview || `https://ui-avatars.com/api/?name=${form.first_name || 'Novo'}&background=random&color=fff`} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => fileRef.current.click()}
                      className="absolute bottom-0 right-0 p-2 bg-accent-blue text-white rounded-full shadow-md hover:bg-blue-600 transition-transform hover:scale-105"
                      title="Alterar foto"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  
                  <div className="mt-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{form.first_name || "Novo Usuário"}</h3>
                    <p className="text-xs text-gray-500">{form.email || "sem email"}</p>
                  </div>
                  
                  {preview && (
                    <button 
                      onClick={() => { setPreview(null); setSelectedFile(null); }}
                      className="mt-2 text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remover foto
                    </button>
                  )}
                </div>

                <hr className="border-gray-200 dark:border-dark-border" />

                {/* Menu */}
                <nav className="space-y-1">
                  {[
                    { id: "geral", label: "Dados Pessoais", icon: User },
                    { id: "seguranca", label: "Segurança e Login", icon: Lock },
                    { id: "permissoes", label: "Permissões", icon: Shield },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all
                        ${activeTab === tab.id 
                          ? "bg-white dark:bg-dark-bg-secondary text-accent-blue shadow-sm ring-1 ring-gray-200 dark:ring-dark-border" 
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary/50"
                        }`}
                    >
                      <tab.icon className={`w-4.5 h-4.5 ${activeTab === tab.id ? "text-accent-blue" : "text-gray-400"}`} />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Conteúdo (Scrollable) */}
              <div className="flex-1 overflow-y-auto bg-white dark:bg-dark-bg-secondary p-6 md:p-10">
                {loadingData ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
                  </div>
                ) : (
                  <form id="user-form" onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8 pb-4">
                    
                    {/* GERAL */}
                    {activeTab === "geral" && (
                      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
                        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100 dark:border-dark-border">
                          <User className="w-5 h-5 text-accent-blue" />
                          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Informações Básicas</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                          <div>
                            <Label required>Nome</Label>
                            <Input name="first_name" value={form.first_name} onChange={handleChange} placeholder="Ex: João" error={errors.first_name} />
                          </div>
                          <div>
                            <Label>Sobrenome</Label>
                            <Input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Ex: Silva" />
                          </div>
                          <div className="md:col-span-1">
                            <Label required>E-mail Corporativo</Label>
                            <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="joao@empresa.com" error={errors.email} icon={FileText} />
                          </div>
                          <div>
                            <Label>Celular</Label>
                            <Input name="phone" value={form.phone} onChange={handleChange} placeholder="(00) 00000-0000" maxLength={15} icon={Phone} />
                          </div>
                          <div>
                            <Label>CPF</Label>
                            <Input name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" maxLength={14} icon={CreditCard} />
                          </div>                          
                          <div>
                            <Label>Nascimento</Label>
                            <Input name="data_nascimento" type="date" value={form.data_nascimento} onChange={handleChange} icon={Calendar} />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* TAB: SEGURANÇA */}
                    {activeTab === "seguranca" && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100 dark:border-dark-border">
                          <Lock className="w-5 h-5 text-accent-blue" />
                          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Segurança</h3>
                        </div>
                        <div>
                          <Label required>Nome de Usuário</Label>
                          <Input 
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="usuario.sistema"
                            disabled={isEdit}
                            error={errors.username}
                            icon={User}
                          />
                          {isEdit && <p className="text-xs text-gray-400 mt-1">O nome de usuário não pode ser alterado.</p>}
                        </div>

                        <div className="p-5 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-800/30 rounded-xl space-y-4">
                          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-500 mb-2">
                            <Lock className="w-4 h-4" />
                            <h4 className="font-semibold text-sm">Definir Senha</h4>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                              <Label required={!isEdit}>Nova Senha</Label>
                              <Input 
                                name="password" 
                                type={showPassword ? "text" : "password"} 
                                value={form.password} 
                                onChange={handleChange} 
                                placeholder={isEdit ? "Deixe em branco para manter" : "Mínimo 6 caracteres"}
                                error={errors.password}
                              />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            
                            <div>
                              <Label required={!isEdit}>Confirmar Senha</Label>
                              <Input 
                                name="confirm_password" 
                                type="password" 
                                value={form.confirm_password} 
                                onChange={handleChange} 
                                placeholder="Repita a senha"
                                error={errors.confirm_password}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* PERMISSÕES */}
                    {activeTab === "permissoes" && (
                      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
                        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100 dark:border-dark-border">
                          <Shield className="w-5 h-5 text-accent-blue" />
                          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Controle de Acesso</h3>
                        </div>

                        <div className="space-y-4">
                          <Switch 
                            label="Conta Ativa"
                            description="Desative para bloquear o acesso temporariamente sem excluir o usuário."
                            checked={form.is_active}
                            onChange={() => handleSwitch('is_active')}
                            icon={CheckCircle}
                          />

                          <Switch 
                            label="Acesso Administrativo (Staff)"
                            description="Permite acesso às configurações do sistema e gerenciamento de outros usuários."
                            checked={form.is_staff}
                            onChange={() => handleSwitch('is_staff')}
                            icon={Shield}
                          />

                          {form.is_staff && (
                            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-300 animate-in fade-in slide-in-from-top-2">
                              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold">Atenção: Poderes Administrativos</p>
                                <p className="mt-1 opacity-90">Este usuário terá controle total sobre os cadastros. Use com cautela.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </form>
                )}
              </div>
            </div>

            {/* ─ FOOTER (Fixed) ─ */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-dark-bg-primary border-t border-gray-100 dark:border-dark-border flex justify-end gap-3 flex-shrink-0">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-dark-bg-secondary transition-colors"
                disabled={saving}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={saving || loadingData}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-accent-blue hover:bg-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEdit ? "Salvar Alterações" : "Criar Usuário"}
                  </>
                )}
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}