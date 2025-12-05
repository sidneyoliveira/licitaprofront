import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, Save, Loader2, FileSignature } from "lucide-react";
import { motion } from "framer-motion";

import AuthContext from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import useAxios from "../hooks/useAxios"; // Assuming you have this hook based on other files

/* ────────────────────────────────────────────────────────────────────────── */
/* 1. UI HELPERS & STYLES                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

const InputField = ({ icon: Icon, ...props }) => (
  <div className="relative group">
    {Icon && (
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#004aad] transition-colors">
        <Icon size={18} strokeWidth={2} />
      </div>
    )}
    <input
      className={`
        w-full bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200
        rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm
        focus:outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad]
        transition-all placeholder:text-slate-400
        ${Icon ? "pl-11" : ""}
      `}
      {...props}
    />
  </div>
);

const Label = ({ children, htmlFor }) => (
  <label 
    htmlFor={htmlFor} 
    className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide pl-1"
  >
    {children}
  </label>
);

/* ────────────────────────────────────────────────────────────────────────── */
/* 2. PÁGINA COMPLETE PROFILE                                                */
/* ────────────────────────────────────────────────────────────────────────── */

const CompleteProfile = () => {
  const { user, setUser } = useContext(AuthContext); 
  const { showToast } = useToast();
  const navigate = useNavigate();
  const api = useAxios();

  const [formData, setFormData] = useState({
    username: user?.username || "",
    first_name: "",
    last_name: "",
    phone: "",
  });
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Usando useAxios para garantir headers de auth corretos
      const { data } = await api.put("/me/", formData);
      
      // Atualiza o contexto se a função estiver disponível
      if (setUser) {
          setUser(prev => ({ ...prev, ...data }));
      }

      showToast("Cadastro finalizado com sucesso!", "success");
      
      // Pequeno delay para feedback visual antes de redirecionar
      setTimeout(() => {
          navigate("/"); 
      }, 800);
      
    } catch (error) {
      console.error("Erro ao completar perfil:", error);
      const msg = error.response?.data?.detail || "Erro ao salvar dados. Tente novamente.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {/* Cabeçalho Visual */}
        <div className="bg-[#004aad] p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8 blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-4 border border-white/30 text-white shadow-lg">
                    <FileSignature size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                    Complete seu Cadastro
                </h2>
                <p className="text-blue-100 text-sm mt-2 max-w-xs mx-auto">
                    Para continuar, precisamos de algumas informações básicas para o seu perfil.
                </p>
            </div>
        </div>

        {/* Formulário */}
        <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                    <Label htmlFor="first_name">Nome</Label>
                    <InputField
                        id="first_name"
                        type="text"
                        name="first_name"
                        placeholder="Seu primeiro nome"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                        icon={User}
                        autoFocus
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="last_name">Sobrenome</Label>
                    <InputField
                        id="last_name"
                        type="text"
                        name="last_name"
                        placeholder="Seu sobrenome"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                        icon={User}
                    />
                </div>
            </div>

            <div className="space-y-1">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <InputField
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    icon={Phone}
                />
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#004aad] hover:bg-[#003d91] text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    {loading ? "Salvando..." : "Finalizar Cadastro"}
                </button>
                
                {/* Opcional: Link para sair ou voltar se necessário */}
                {/* <p className="text-center mt-4 text-xs text-slate-400">
                    Ao continuar, você concorda com nossos Termos de Uso.
                </p> */}
            </div>

            </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CompleteProfile;