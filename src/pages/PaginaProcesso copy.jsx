// frontend/src/pages/Perfil.js



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

  StickyNote,

  Paperclip,

  X,

  UploadCloud,

  Save

} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import useAxios from "../hooks/useAxios";

import { useToast } from "../context/ToastContext";



import UsuarioEditModal from "../components/UsuarioEditModal";



/* ────────────────────────────────────────────────────────────────────────── */

/* 🎨 UI COMPONENTS (READ-ONLY)                                               */

/* ────────────────────────────────────────────────────────────────────────── */



const Label = ({ children }) => (

  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">

    {children}

  </label>

);



const ReadOnlyInput = ({ icon: Icon, value, ...props }) => (

  <div className="relative group">

    {Icon && (

      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

        <Icon className="h-4.5 w-4.5 text-gray-400" />

      </div>

    )}

    <input

      readOnly

      disabled

      value={value || "Não informado"}

      className={`

        w-full bg-gray-50 dark:bg-dark-bg-primary text-gray-700 dark:text-gray-300 

        rounded-lg border border-gray-100 dark:border-dark-border px-3 py-2.5 text-sm 

        transition-all outline-none cursor-default

        ${Icon ? "pl-10" : ""}

      `}

      {...props}

    />

  </div>

);



const SectionHeader = ({ title, icon: Icon, action }) => (

  <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100 dark:border-dark-border">

    <div className="flex items-center gap-2">

      <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded text-accent-blue">

        <Icon className="w-4 h-4" />

      </div>

      <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wide">

        {title}

      </h3>

    </div>

    {action}

  </div>

);



const InfoBadge = ({ label, active, icon: Icon }) => (

  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${

    active 

      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" 

      : "bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"

  }`}>

    <Icon className="w-3.5 h-3.5" />

    {label}

  </div>

);



/* ────────────────────────────────────────────────────────────────────────── */

/* 📂 MODAL DE ANEXAR ARQUIVO (Padronizado)                                   */

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

    

    // Simulação de delay ou chamada real

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

        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

          <motion.div 

            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}

            onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm"

          />

          <motion.div 

            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}

            className="relative w-full max-w-md bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-2xl overflow-hidden flex flex-col"

          >

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-border">

              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Anexar Documento</h2>

              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg-primary text-gray-500"><X className="w-5 h-5" /></button>

            </div>

            

            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {/* Área de Upload */}

              <div 

                onClick={() => fileRef.current.click()}

                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-accent-blue hover:bg-blue-50 dark:hover:bg-dark-bg-primary transition-colors"

              >

                <input type="file" ref={fileRef} onChange={handleFileChange} className="hidden" />

                <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />

                {file ? (

                  <p className="text-sm font-semibold text-accent-blue">{file.name}</p>

                ) : (

                  <p className="text-sm text-gray-500">Clique para selecionar um arquivo</p>

                )}

              </div>



              <div>

                <Label>Descrição do Arquivo</Label>

                <input 

                  value={description}

                  onChange={(e) => setDescription(e.target.value)}

                  placeholder="Ex: Contrato Social, CNH..."

                  className="w-full bg-gray-50 dark:bg-dark-bg-primary text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-dark-border px-3 py-2 text-sm outline-none focus:border-accent-blue"

                />

              </div>



              <div className="flex justify-end gap-3 pt-2">

                <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>

                <button 

                  type="submit" 

                  disabled={!file || uploading}

                  className="px-4 py-2 text-sm font-bold text-white bg-accent-blue hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2"

                >

                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}

                  Salvar

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

/* 🚀 PÁGINA PERFIL                                                           */

/* ────────────────────────────────────────────────────────────────────────── */



const Perfil = () => {

  const api = useAxios();

  const { showToast } = useToast();



  // Estados

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  

  // Modais

  const [editModalOpen, setEditModalOpen] = useState(false);

  const [attachModalOpen, setAttachModalOpen] = useState(false);



  // Estados Locais (Mockados por enquanto, idealmente viriam do backend)

  const [notes, setNotes] = useState([

    { id: 1, text: "Lembrar de atualizar o certificado digital mês que vem.", date: new Date().toISOString() }

  ]);

  const [newNote, setNewNote] = useState("");

  

  const [documents, setDocuments] = useState([

    { id: 1, name: "Termo de Responsabilidade.pdf", description: "Assinado", date: "2023-10-15" }

  ]);



  // Carregar Dados

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



  // Handlers de Notas

  const handleAddNote = () => {

    if (!newNote.trim()) return;

    const note = { id: Date.now(), text: newNote, date: new Date().toISOString() };

    setNotes([note, ...notes]);

    setNewNote("");

    showToast("Anotação salva.", "success");

  };



  const handleDeleteNote = (id) => {

    setNotes(notes.filter(n => n.id !== id));

  };



  // Handler de Documentos

  const handleUploadDocument = async ({ file, description }) => {

    // Aqui você chamaria a API real para upload

    // const formData = new FormData(); formData.append('file', file); ...

    

    const newDoc = {

      id: Date.now(),

      name: file.name,

      description: description || "Sem descrição",

      date: new Date().toISOString().split('T')[0]

    };

    setDocuments([newDoc, ...documents]);

    showToast("Arquivo anexado com sucesso!", "success");

  };



  if (loading) {

    return (

      <div className="w-full h-[80vh] flex items-center justify-center">

        <Loader2 className="w-10 h-10 text-accent-blue animate-spin" />

      </div>

    );

  }



  return (

    <div className="w-full mx-auto space-y-3">

      

      {/* MODAIS */}

      <UsuarioEditModal 

        open={editModalOpen} 

        user={user} 

        onClose={() => setEditModalOpen(false)} 

        onSaved={() => { fetchUser(); setEditModalOpen(false); }} 

      />



      <AttachFileModal 

        open={attachModalOpen}

        onClose={() => setAttachModalOpen(false)}

        onUpload={handleUploadDocument}

      />



      {/* 1. CABEÇALHO IDENTIDADE */}

      <div className="bg-white dark:bg-dark-bg-secondary p-6 rounded-xl border border-gray-100 dark:border-dark-border flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm">

        {/* Avatar */}

        <div className="relative flex-shrink-0">

          <div className="w-24 h-24 rounded-full border-4 border-white dark:border-dark-bg-secondary bg-gray-200 shadow-md overflow-hidden">

            <img 

              src={user.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || 'U')}&background=random&color=fff&size=128`} 

              alt="Profile" 

              className="w-full h-full object-cover"

            />

          </div>

          {user.is_superuser && (

            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-white dark:border-dark-bg-secondary">

              ADMIN

            </div>

          )}

        </div>



        {/* Info + Badge Status */}

        <div className="flex-1 text-center md:text-left space-y-1">

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">

            {user.first_name} {user.last_name}

          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">@{user.username}</p>

          

          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">

            <InfoBadge 

              label={user.is_active ? "Conta Ativa" : "Conta Inativa"} 

              active={user.is_active} 

              icon={user.is_active ? CheckCircle : Shield} 

            />

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-dark-bg-primary">

              <Clock className="w-3.5 h-3.5" />

              Membro desde {new Date(user.date_joined).getFullYear()}

            </div>

          </div>

        </div>



        {/* Botão Editar */}

        <button 

          onClick={() => setEditModalOpen(true)}

          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-dark-bg-primary border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg-primary/80 transition-colors shadow-sm"

        >

          <Edit className="w-4 h-4" />

          Editar Perfil

        </button>

      </div>



      {/* 2. GRID DE INFORMAÇÕES (LINHA 1) */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        

        {/* COLUNA ESQUERDA: Informações Pessoais */}

        <div className="bg-white dark:bg-dark-bg-secondary p-6 rounded-xl border border-gray-100 dark:border-dark-border shadow-sm h-full">

          <SectionHeader title="Informações Pessoais" icon={User} />

          

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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

              <ReadOnlyInput 

                icon={Calendar} 

                value={user.data_nascimento ? new Date(user.data_nascimento).toLocaleDateString('pt-BR') : null} 

              />

            </div>

            <div>

              <Label>Acesso</Label>

              <div className="w-full bg-gray-50 dark:bg-dark-bg-primary text-gray-700 dark:text-gray-300 rounded-lg border border-gray-100 dark:border-dark-border px-3 py-2.5 text-sm flex items-center gap-2">

                <Shield className="w-4 h-4 text-blue-500" />

                {user.is_superuser ? "Superusuário" : user.is_staff ? "Equipe" : "Padrão"}

              </div>

            </div>

          </div>

        </div>



        {/* COLUNA DIREITA: Dados de Contato */}

        <div className="bg-white dark:bg-dark-bg-secondary p-6 rounded-xl border border-gray-100 dark:border-dark-border shadow-sm h-full">

          <SectionHeader title="Dados de Contato" icon={Phone} />

          

          <div className="grid grid-cols-1 gap-4">

            <div>

              <Label>E-mail Corporativo</Label>

              <ReadOnlyInput icon={Mail} value={user.email} />

            </div>

            <div>

              <Label>Telefone / Celular</Label>

              <ReadOnlyInput icon={Phone} value={user.phone} />

            </div>

            {/* <div>

              <Label>Último Login</Label>

              <ReadOnlyInput 

                icon={Clock} 

                value={user.last_login ? new Date(user.last_login).toLocaleString() : "Nunca"} 

              />

            </div> */}

          </div>

        </div>

      </div>



      {/* 3. GRID DE EXTRAS (LINHA 2) */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        

        {/* Bloco de Notas */}

        <div className="bg-white dark:bg-dark-bg-secondary p-6 rounded-xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col h-96">

          <SectionHeader title="Anotações Pessoais" icon={StickyNote} />

          

          <div className="flex gap-2 mb-4">

            <input 

              value={newNote}

              onChange={(e) => setNewNote(e.target.value)}

              placeholder="Nova anotação..."

              className="flex-1 bg-gray-50 dark:bg-dark-bg-primary rounded-lg border border-gray-200 dark:border-dark-border px-3 py-2 text-sm outline-none focus:border-accent-blue"

              onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}

            />

            <button 

              onClick={handleAddNote}

              className="p-2 bg-accent-blue text-white rounded-lg hover:bg-blue-700 transition-colors"

            >

              <Plus className="w-5 h-5" />

            </button>

          </div>



          <div className="flex-1 overflow-y-auto space-y-2 pr-1">

            {notes.length === 0 ? (

              <p className="text-center text-sm text-gray-400 mt-10">Nenhuma anotação salva.</p>

            ) : (

              notes.map((note) => (

                <div key={note.id} className="p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-800/30 rounded-lg flex justify-between items-start group">

                  <div>

                    <p className="text-sm text-gray-800 dark:text-gray-200">{note.text}</p>

                    <p className="text-[10px] text-gray-400 mt-1">{new Date(note.date).toLocaleDateString()}</p>

                  </div>

                  <button onClick={() => handleDeleteNote(note.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">

                    <Trash2 className="w-3.5 h-3.5" />

                  </button>

                </div>

              ))

            )}

          </div>

        </div>



        {/* Componente de Documentos */}

        <div className="bg-white dark:bg-dark-bg-secondary p-6 rounded-xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col h-96">

          <SectionHeader 

            title="Documentos & Processos" 

            icon={FileText} 

            action={

              <button 

                onClick={() => setAttachModalOpen(true)}

                className="text-xs font-medium text-accent-blue hover:underline flex items-center gap-1"

              >

                <Paperclip className="w-3.5 h-3.5" /> Anexar

              </button>

            }

          />



          <div className="flex-1 overflow-y-auto space-y-2 pr-1">

            {documents.length === 0 ? (

              <div className="flex flex-col items-center justify-center h-full text-gray-400">

                <UploadCloud className="w-8 h-8 mb-2 opacity-50" />

                <p className="text-sm">Nenhum documento anexado.</p>

              </div>

            ) : (

              documents.map((doc) => (

                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg-primary transition-colors group">

                  <div className="flex items-center gap-3">

                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-600">

                      <FileText className="w-5 h-5" />

                    </div>

                    <div>

                      <p className="text-sm font-medium text-gray-800 dark:text-white line-clamp-1">{doc.name}</p>

                      <p className="text-[10px] text-gray-400">{doc.description} • {doc.date}</p>

                    </div>

                  </div>

                  <button className="text-gray-400 hover:text-accent-blue p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">

                    <Download className="w-4 h-4" />

                  </button>

                </div>

              ))

            )}

          </div>

        </div>



      </div>

    </div>

  );

};



export default Perfil;