// frontend/src/components/UsuarioEditModal.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Camera } from "lucide-react";
import useAxios from "../hooks/useAxios";
import { useToast } from "../context/ToastContext";

/* ─ UI helpers ──────────────────────────────────────────────────────────── */
const inputCampo =
  "w-full px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-transparent border dark:bg-dark-bg-primary dark:border-dark-bg-primary";
const labelCampo = "text-xs font-medium text-slate-600 dark:text-slate-300 mb-1";
const btnBase =
  "inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium transition-colors";
const btnPrimary = `${btnBase} bg-accent-blue text-white hover:bg-accent-blue/90 disabled:opacity-60 disabled:cursor-not-allowed`;
const btnGhost = `${btnBase} text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-dark-bg-secondary`;
const badge =
  "px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-dark-bg-secondary dark:text-dark-text-secondary";

/* ─ Utils ───────────────────────────────────────────────────────────────── */
const formatCPF = (v = "") =>
  String(v)
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{2})$/, "$1-$2");

const formatPhone = (v = "") =>
  String(v)
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");

const fallbackAvatar = (u) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    u?.first_name || u?.username || "U"
  )}&background=0d3977&color=fff`;

/* ─ Modal ───────────────────────────────────────────────────────────────── */
export default function UsuarioEditModal({ open, user, onClose, onSaved }) {
  const api = useAxios();
  const { showToast } = useToast();
  const isEdit = Boolean(user?.id);

  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    cpf: "",
    data_nascimento: "",
    phone: "",
    is_active: true,
    is_staff: false,
  });

  // foto
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  // Carrega dados (detalhe) quando abre
  useEffect(() => {
    if (!open) return;

    const resetCreate = () => {
      setForm({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        cpf: "",
        data_nascimento: "",
        phone: "",
        is_active: true,
        is_staff: false,
      });
      setPreview(null);
      setSelectedFile(null);
    };

    const loadDetail = async () => {
      if (!isEdit) {
        resetCreate();
        return;
      }

      setLoadingDetail(true);
      try {
        // Busca o detalhe pra trazer cpf/phone/nascimento/profile_image
        const { data } = await api.get(`/usuarios/${user.id}/`);
        setForm({
          username: data?.username || "",
          first_name: data?.first_name || "",
          last_name: data?.last_name || "",
          email: data?.email || "",
          cpf: data?.cpf || "",
          data_nascimento: data?.data_nascimento || "",
          phone: data?.phone || "",
          is_active: typeof data?.is_active === "boolean" ? data.is_active : true,
          is_staff: typeof data?.is_staff === "boolean" ? data.is_staff : false,
        });
        setPreview(data?.profile_image || null);
        setSelectedFile(null);
      } catch (e) {
        // fallback ao objeto vindo da tabela (mesmo que incompleto)
        setForm({
          username: user?.username || "",
          first_name: user?.first_name || "",
          last_name: user?.last_name || "",
          email: user?.email || "",
          cpf: user?.cpf || "",
          data_nascimento: user?.data_nascimento || "",
          phone: user?.phone || "",
          is_active: typeof user?.is_active === "boolean" ? user.is_active : true,
          is_staff: typeof user?.is_staff === "boolean" ? user.is_staff : false,
        });
        setPreview(user?.profile_image || null);
      } finally {
        setLoadingDetail(false);
      }
    };

    loadDetail();

    // limpar previews blob ao desmontar/fechar
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEdit, user?.id]);

  /* ─ Handlers ──────────────────────────────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((f) => ({ ...f, [name]: checked }));
      return;
    }
    let v = value;
    if (name === "cpf") v = formatCPF(value);
    if (name === "phone") v = formatPhone(value);
    setForm((f) => ({ ...f, [name]: v }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setSelectedFile(null);
    setPreview(null);
    // Se quiser sinalizar remoção ao backend:
    // setForm((f) => ({ ...f, profile_image: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        // não mandar campos de leitura
        if (["id", "date_joined", "last_login", "profile_image"].includes(key)) return;
        // DRF aceita "true"/"false" em multipart
        formData.append(key, value ?? "");
      });

      if (selectedFile instanceof File) {
        formData.append("profile_image", selectedFile);
      }

      const url = isEdit ? `/usuarios/${user.id}/` : `/usuarios/`;
      const method = isEdit ? api.patch : api.post;

      // Enviar como multipart; axios define boundary automaticamente
      await method(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast(isEdit ? "Usuário atualizado com sucesso!" : "Usuário criado com sucesso!", "success");
      onSaved?.();
      onClose?.();
    } catch (error) {
      console.error(error);
      if (error?.response?.data) console.warn("Erro da API:", error.response.data);
      showToast("Erro ao salvar usuário.", "error");
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = useMemo(() => {
    if (preview) return preview;
    if (user?.profile_image) return user.profile_image;
    return fallbackAvatar(user || form);
  }, [preview, user, form]);

  if (!open) return null;

  /* ─ Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-[200]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-white dark:bg-dark-bg-primary rounded-xl shadow-lg border border-light-border dark:border-dark-border overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-dark-text-primary">
                {isEdit ? "Editar Usuário" : "Novo Usuário"}
              </h3>
              {isEdit ? <span className={badge}>ID #{user?.id}</span> : <span className={badge}>Cadastro</span>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-dark-bg-secondary text-slate-600 dark:text-slate-300"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
            {/* Foto */}
            <section className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow ring-1 ring-slate-200 dark:ring-dark-border">
                <img src={avatarSrc} alt="Foto do usuário" className="object-cover w-full h-full" />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                  title="Alterar foto"
                >
                  <Camera className="text-white w-5 h-5" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} className={btnGhost}>
                  Trocar foto
                </button>
                {preview && (
                  <button type="button" onClick={handleRemoveImage} className={btnGhost}>
                    Remover
                  </button>
                )}
              </div>
            </section>

            {/* Dados */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelCampo}>Nome</label>
                <input className={inputCampo} name="first_name" value={form.first_name} onChange={handleChange} />
              </div>
              <div>
                <label className={labelCampo}>Sobrenome</label>
                <input className={inputCampo} name="last_name" value={form.last_name} onChange={handleChange} />
              </div>
              <div>
                <label className={labelCampo}>Usuário</label>
                <input
                  className={inputCampo}
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  disabled={isEdit}
                />
              </div>
              <div>
                <label className={labelCampo}>E-mail</label>
                <input className={inputCampo} name="email" type="email" value={form.email} onChange={handleChange} />
              </div>
              <div>
                <label className={labelCampo}>CPF</label>
                <input
                  className={inputCampo}
                  name="cpf"
                  value={form.cpf}
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <label className={labelCampo}>Data de Nascimento</label>
                <input
                  className={inputCampo}
                  name="data_nascimento"
                  type="date"
                  value={form.data_nascimento}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className={labelCampo}>Telefone</label>
                <input
                  className={inputCampo}
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="flex items-center gap-4 pt-6">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="rounded border-slate-300 text-accent-blue focus:ring-accent-blue"
                  />
                  Ativo
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="is_staff"
                    checked={form.is_staff}
                    onChange={handleChange}
                    className="rounded border-slate-300 text-accent-blue focus:ring-accent-blue"
                  />
                  Staff
                </label>
              </div>
            </section>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-light-border dark:border-dark-border">
              <button type="button" onClick={onClose} className={btnGhost} disabled={saving || loadingDetail}>
                Cancelar
              </button>
              <button type="submit" className={btnPrimary} disabled={saving || loadingDetail}>
                {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar usuário"}
              </button>
            </div>
          </form>

          {loadingDetail && (
            <div className="absolute inset-0 bg-white/60 dark:bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
