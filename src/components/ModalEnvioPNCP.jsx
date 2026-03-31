import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  X,
  FileText,
  Loader2,
  Send,
  CheckCircle,
  AlertTriangle,
  FileSignature,
  UploadCloud,
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import useAxios from "../hooks/useAxios";

const MAX_FILE_MB = 50;

function formatMB(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const ENDPOINTS = {
  status: (id) => `/processos/${id}/status-pncp/`,
  publish: (id) => `/processos/${id}/publicar-pncp/`,
  rectifyDoc: (id) => `/processos/${id}/retificar-pncp/`,
};

const ModalEnvioPNCP = ({ processo, onClose, onSuccess }) => {
  const api = useAxios();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusLoading, setStatusLoading] = useState(true);
  const [hasPncp, setHasPncp] = useState(false);
  const [pncpInfo, setPncpInfo] = useState(null);

  const [operation, setOperation] = useState("publish");

  const [file, setFile] = useState(null);
  const [justificativa, setJustificativa] = useState("");

  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    (async () => {
      if (!processo?.id) {
        setStatusLoading(false);
        return;
      }
      setStatusLoading(true);
      try {
        const { data } = await api.get(ENDPOINTS.status(processo.id));
        if (!isMountedRef.current) return;
        setPncpInfo(data || null);
        const published = Boolean(data?.publicado || data?.sequencial_pncp);
        setHasPncp(published);
        setOperation(published ? "rectify" : "publish");
      } catch {
        if (!isMountedRef.current) return;
        setHasPncp(false);
        setOperation("publish");
      } finally {
        if (isMountedRef.current) setStatusLoading(false);
      }
    })();
    return () => { isMountedRef.current = false; };
  }, [processo?.id]);

  const handleFileChange = (e) => {
    setErrorMsg("");
    setSuccess(false);
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > MAX_FILE_MB * 1024 * 1024) {
      showToast(`O arquivo excede o limite de ${MAX_FILE_MB}MB.`, "warning");
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccess(false);

    if (!processo?.id) return;
    if (!file) return showToast("Selecione um arquivo PDF.", "warning");

    if (operation === "rectify" && !justificativa.trim()) {
      return showToast("Justificativa obrigatoria para retificacoes.", "warning");
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const form = new FormData();
      form.append("arquivo", file);

      if (operation === "publish") {
        form.append("titulo_documento", `Edital - ${processo.numero_processo || ""}`);
      } else {
        form.append("justificativa", justificativa.trim());
        form.append("titulo_documento", `Retificacao - ${processo.numero_processo || ""}`);
      }

      const endpoint =
        operation === "publish"
          ? ENDPOINTS.publish(processo.id)
          : ENDPOINTS.rectifyDoc(processo.id);

      await api.post(endpoint, form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          const pct = Math.round((evt.loaded * 100) / (evt.total || 1));
          setUploadProgress(Math.min(pct, 100));
        },
      });

      setSuccess(true);
      showToast(
        operation === "publish"
          ? "Processo publicado no PNCP com sucesso!"
          : "Retificacao enviada ao PNCP com sucesso!",
        "success"
      );

      try {
        const { data: st } = await api.get(ENDPOINTS.status(processo.id));
        if (isMountedRef.current) {
          setPncpInfo(st);
          setHasPncp(Boolean(st?.publicado || st?.sequencial_pncp));
        }
      } catch { /* ignora */ }

      if (onSuccess) onSuccess();
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.message ||
        "Falha na comunicacao com o PNCP.";
      setErrorMsg(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm flex-shrink-0">
              <Globe className="w-5 h-5 text-accent-blue" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-gray-800 dark:text-white truncate">
                Integracao PNCP
              </h3>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                {statusLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Verificando...
                  </>
                ) : hasPncp ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span>Publicado</span>
                    {pncpInfo?.sequencial_pncp && (
                      <span className="text-gray-400">- Seq. {pncpInfo.sequencial_pncp}</span>
                    )}
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    Nao publicado
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={!loading ? onClose : undefined}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Seletor de Operacao */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setOperation("publish"); setErrorMsg(""); setSuccess(false); }}
              disabled={loading}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-semibold transition ${
                operation === "publish"
                  ? "border-accent-blue bg-blue-50 dark:bg-blue-900/20 text-accent-blue"
                  : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              <Send className="w-4 h-4" />
              Publicar
            </button>

            <button
              type="button"
              onClick={() => { setOperation("rectify"); setErrorMsg(""); setSuccess(false); }}
              disabled={loading || !hasPncp}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-semibold transition ${
                operation === "rectify"
                  ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                  : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              } ${!hasPncp ? "opacity-50 cursor-not-allowed" : ""}`}
              title={!hasPncp ? "Publique primeiro para poder retificar" : ""}
            >
              <FileSignature className="w-4 h-4" />
              Retificar
            </button>
          </div>

          {/* Dica contextual */}
          <div className={`rounded-lg p-3 border text-xs leading-relaxed ${
            operation === "publish"
              ? "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800 text-blue-800 dark:text-blue-200"
              : "bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800 text-amber-800 dark:text-amber-200"
          }`}>
            {operation === "publish" ? (
              <>
                Envie o <b>arquivo do edital/aviso</b> para publicar este processo no PNCP.
                Confirme se dados e itens estao corretos antes de prosseguir.
              </>
            ) : (
              <>
                Envie um <b>novo arquivo PDF</b> para retificar o documento ja publicado.
                A justificativa e obrigatoria.
              </>
            )}
          </div>

          {/* Feedback erro */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 border border-red-200 bg-red-50 dark:bg-red-900/10 rounded-lg p-3 text-xs text-red-700 dark:text-red-300">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="break-words">{errorMsg}</span>
            </div>
          )}

          {/* Feedback sucesso */}
          {success && (
            <div className="flex items-center gap-2.5 border border-green-200 bg-green-50 dark:bg-green-900/10 rounded-lg p-3 text-xs text-green-700 dark:text-green-300">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <div className="font-bold">Operacao enviada com sucesso!</div>
                <div className="opacity-80">Confira o status no PNCP ou reabra este modal.</div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Upload */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                Arquivo (PDF) *
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all ${
                  file
                    ? "border-green-400 bg-green-50/30 dark:bg-green-900/10"
                    : "border-gray-300 dark:border-gray-600 hover:border-accent-blue hover:bg-slate-50 dark:hover:bg-gray-800"
                } ${loading ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
              >
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {file ? (
                  <div className="flex items-center gap-3 pointer-events-none">
                    <FileText className="w-7 h-7 text-green-600" />
                    <div className="text-left min-w-0">
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate max-w-[220px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-green-600 font-medium">
                        {formatMB(file.size)} - Pronto
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="pointer-events-none space-y-1">
                    <UploadCloud className="w-7 h-7 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Clique para selecionar o PDF
                    </p>
                    <p className="text-xs text-gray-400">Max. {MAX_FILE_MB}MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Justificativa (somente retificacao) */}
            {operation === "rectify" && (
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                  Justificativa *
                </label>
                <textarea
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  disabled={loading}
                  rows={2}
                  placeholder="Descreva o motivo da retificacao..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 resize-none bg-white dark:bg-gray-900"
                />
              </div>
            )}

            {/* Progresso */}
            {loading && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-gray-500">
                  <span>{uploadProgress < 100 ? "Enviando..." : "Processando..."}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-blue transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Rodape */}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading || !file || (operation === "rectify" && !hasPncp)}
                className="px-5 py-2 bg-accent-blue text-white text-sm font-bold rounded-lg hover:bg-accent-blue/90 flex items-center gap-2 shadow-sm shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : operation === "publish" ? (
                  <Send className="w-4 h-4" />
                ) : (
                  <FileSignature className="w-4 h-4" />
                )}
                {loading
                  ? "Processando..."
                  : operation === "publish"
                  ? "Publicar no PNCP"
                  : "Enviar Retificacao"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ModalEnvioPNCP;
