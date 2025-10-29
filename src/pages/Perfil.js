import React, { useState, useEffect, useRef } from "react";
import { Camera } from "lucide-react";
import useAxios from "../hooks/useAxios";
import { useToast } from "../context/ToastContext";

const Perfil = () => {
  const [user, setUser] = useState(null);
  const [missingFields, setMissingFields] = useState([]);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [preview, setPreview] = useState(null);
  const [passwords, setPasswords] = useState({ password: "", confirm_password: "" });

  const api = useAxios();
  const { showToast } = useToast();
  const fileInputRef = useRef();

  // 🔹 Carrega dados do usuário
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/me/");
        setUser(response.data);
        setIsSuperUser(response.data.is_superuser || false);

        const requiredFields = {
          cpf: "CPF",
          phone: "Telefone",
          data_nascimento: "Data de Nascimento",
        };
        const missing = Object.keys(requiredFields).filter((f) => !response.data[f]);
        setMissingFields(missing);
      } catch {
        showToast("Não foi possível carregar os dados do usuário.", "error");
      }
    };
    fetchUser();
  }, [api, showToast]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "cpf") value = formatCPF(value);
    if (name === "phone") value = formatPhone(value);
    setUser({ ...user, [name]: value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("profile_image", file);

    try {
      await api.put("/me/", formData, { headers: { "Content-Type": "multipart/form-data" } });
      showToast("Foto de perfil atualizada com sucesso!", "success");
    } catch {
      showToast("Erro ao enviar a foto de perfil.", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.password && passwords.password !== passwords.confirm_password) {
      showToast("As senhas não coincidem!", "error");
      return;
    }

    try {
      const payload = { ...user, password: passwords.password || undefined };
      const { data } = await api.put("/me/", payload);
      setUser(data);
      setPasswords({ password: "", confirm_password: "" });
      showToast("Perfil atualizado com sucesso!", "success");
    } catch {
      showToast("Erro ao atualizar perfil.", "error");
    }
  };

  if (!user) return <div className="text-center py-10">Carregando perfil...</div>;

  const formatCPF = (v) =>
    v.replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{2})$/, "$1-$2")
      .slice(0, 14);

  const formatPhone = (v) =>
    v.replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);

  return (
    <div className="min-h-screen flex justify-center py-12 px-6">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
        {/* ======= Header ======= */}
        <div className="bg-light-primary px-8 pt-3  text-center relative">
          <div className="absolute top-4 right-4 text-sm text-accent-blue">
            {isSuperUser && <span className="px-3 py-1 bg-white/20 rounded-full">Superusuário</span>}
          </div>

          {/* Foto */}
          <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md group">
            <img
              src={
                preview ||
                user.profile_image ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.first_name || "U"
                )}&background=0d3977&color=fff`
              }
              alt="Foto do Usuário"
              className="object-cover w-full h-full group-hover:opacity-80 transition"
            />
            <div
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition"
              onClick={() => fileInputRef.current.click()}
            >
              <Camera className="text-white w-7 h-7" />
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          <h1 className="text-2xl font-semibold text-light-text-primary mt-4">
            {user.first_name} {user.last_name}
          </h1>
          <p className="text-gray-400 text-sm">{user.email}</p>
        </div>

        {/* ======= Form ======= */}
        <div className="px-8 py-3">
          {missingFields.length > 0 && (
            <div className="mb-2 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-center">
              Seu cadastro está incompleto! Complete os campos obrigatórios.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sessão Dados */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2 border-b">
                Informações Pessoais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label="Nome" name="first_name" value={user.first_name || ""} onChange={handleChange} />
                <Input label="Sobrenome" name="last_name" value={user.last_name || ""} onChange={handleChange} />
                <Input label="CPF" name="cpf" value={user.cpf || ""} onChange={handleChange} missing={missingFields.includes("cpf")} />
                <Input label="Data de Nascimento" name="data_nascimento" type="date" value={user.data_nascimento || ""} onChange={handleChange} />
                <Input label="Telefone" name="phone" value={user.phone || ""} onChange={handleChange} />
                <Input label="Email" name="email" value={user.email || ""} onChange={handleChange} />
                <Input label="Usuário" name="username" value={user.username} disabled />
              </div>
            </section>

            {/* Sessão Senha */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-2">
                Redefinição de Senha
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Nova senha" name="password" type="password" value={passwords.password} onChange={handlePasswordChange} />
                <Input label="Confirmar nova senha" name="confirm_password" type="password" value={passwords.confirm_password} onChange={handlePasswordChange} />
              </div>
            </section>

            {/* Sessão Permissões */}
            {isSuperUser && (
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-2">
                  Permissões do Usuário
                </h2>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600 leading-relaxed">
                  <p><strong>Superusuário</strong>: Acesso total ao sistema administrativo.</p>
                  <p>Gerencia licitações, usuários e configurações globais.</p>
                  <p>Pode visualizar logs e painéis internos.</p>
                </div>
              </section>
            )}

            {/* Botão */}
            <div className="text-center pt-6">
              <button
                type="submit"
                className="bg-[#0057FF] text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-[#0043c2] transition-all duration-200"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Perfil;

// ======= COMPONENTE REUTILIZÁVEL =======
const Input = ({ label, name, type = "text", value, onChange, disabled, missing }) => (
  <div className="relative">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-4 py-2 rounded-xl border text-gray-800 focus:ring-2 focus:outline-none transition-all ${
        disabled
          ? "bg-gray-100 cursor-not-allowed text-gray-500"
          : missing
          ? "border-red-400 focus:ring-red-400"
          : "border-gray-300 focus:ring-[#0057FF]"
      }`}
    />
  </div>
);
