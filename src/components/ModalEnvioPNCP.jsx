import React, { useEffect, useMemo, useRef, useState } from "react";
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
  History,
  UploadCloud,
  Pencil,
  PlusCircle,
  ClipboardList,
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import useAxios from "../hooks/useAxios";

/**
 * Modal PNCP — Fluxos suportados (front):
 * 1) Publicação inicial (com arquivo PDF)
 * 2) Edição de publicação (somente metadados: JSON)
 * 3) Retificação/Inserção de documento (com arquivo PDF + justificativa)
 * 4) Adição de itens (JSON array)
 * 5) Retificação de item (numeroItem + JSON patch + justificativa)
 *
 * Observação importante:
 * - Este componente chama endpoints do SEU backend (ex.: /processos/:id/publicar-pncp/).
 * - Garanta que o backend execute as operações equivalentes na API do PNCP (manual).
 */

// Tipos de Documento (UI) — mantenha alinhado ao seu backend
const TIPOS_DOCUMENTO = [
  { id: "edital", label: "Edital de Licitação" },
  { id: "aviso_contratacao_direta", label: "Aviso de Contratação Direta" },
  { id: "ata_registro_precos", label: "Ata de Registro de Preços" },
  { id: "contrato", label: "Contrato" },
  { id: "termo_aditivo", label: "Termo Aditivo" },
  { id: "documento_retificacao", label: "Documento de Retificação" },
  { id: "outros", label: "Outros Documentos" },
];

// “Tipo de aviso / publicação” (UI) — ajuste IDs conforme seu backend/domínio
const TIPOS_PUBLICACAO = [
  { id: "edital_licitacao", label: "Edital (Licitação)" },
  { id: "aviso_contratacao_direta", label: "Aviso (Contratação Direta)" },
  { id: "aviso_dispensa", label: "Aviso (Dispensa)" },
  { id: "aviso_inexigibilidade", label: "Aviso (Inexigibilidade)" },
  { id: "outro", label: "Outro" },
];

const OPERATIONS = {
  PUBLISH: "publish",
  EDIT: "edit",
  RECTIFY_DOC: "rectify_doc",
  ADD_ITEMS: "add_items",
  RECTIFY_ITEM: "rectify_item",
};

const UI = {
  IDLE: "idle",
  SUCCESS: "success",
  ERROR: "error",
};

const MAX_FILE_MB = 50;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function safeJsonParse(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: e?.message || "JSON inválido." };
  }
}

function isPdf(file) {
  return file?.type === "application/pdf" || file?.name?.toLowerCase()?.endsWith(".pdf");
}

function formatMB(bytes) {
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(2)} MB`;
}

function operationMeta(op) {
  switch (op) {
    case OPERATIONS.PUBLISH:
      return {
        title: "Nova Publicação",
        icon: <Globe className="w-4 h-4" />,
        hint: (
          <>
            Você vai publicar este processo no PNCP. Normalmente isso gera o <b>sequencial</b> do PNCP no cadastro da
            contratação. Confirme se dados e itens estão corretos.
          </>
        ),
        tone: "info",
      };
    case OPERATIONS.EDIT:
      return {
        title: "Edição de Publicação",
        icon: <Pencil className="w-4 h-4" />,
        hint: (
          <>
            Atualize <b>metadados</b> (sem documento) por edição. Use o JSON para enviar apenas o que mudou (seu backend
            decide o PATCH parcial).
          </>
        ),
        tone: "warning",
      };
    case OPERATIONS.RECTIFY_DOC:
      return {
        title: "Retificação / Novo Documento",
        icon: <FileSignature className="w-4 h-4" />,
        hint: (
          <>
            Envie um <b>novo PDF</b> para vincular/retificar documento da contratação. Justificativa é recomendada e
            costuma ser obrigatória em retificações.
          </>
        ),
        tone: "warning",
      };
    case OPERATIONS.ADD_ITEMS:
      return {
        title: "Adição de Itens",
        icon: <PlusCircle className="w-4 h-4" />,
        hint: (
          <>
            Adicione itens em uma contratação já existente. Em geral, o PNCP <b>impede</b> inclusão de itens se não houver
            documento/arquivo <b>ativo</b> vinculado.
          </>
        ),
        tone: "info",
      };
    case OPERATIONS.RECTIFY_ITEM:
      return {
        title: "Retificação de Item",
        icon: <History className="w-4 h-4" />,
        hint: (
          <>
            Retifique um item específico informando o <b>número do item</b> e um JSON com os campos alterados (patch).
            Justificativa recomendada/obrigatória conforme regra do seu backend.
          </>
        ),
        tone: "warning",
      };
    default:
      return { title: "Operação", icon: <Globe className="w-4 h-4" />, hint: null, tone: "info" };
  }
}

function HintCard({ tone = "info", icon, title, children }) {
  const styles =
    tone === "warning"
      ? "bg-amber-50 border-amber-200 text-amber-900"
      : tone === "error"
      ? "bg-red-50 border-red-200 text-red-900"
      : "bg-blue-50 border-blue-100 text-blue-900";

  const iconColor =
    tone === "warning" ? "text-amber-600" : tone === "error" ? "text-red-600" : "text-[#004aad]";

  return (
    <div className={`border rounded-lg p-4 flex gap-3 ${styles}`}>
      <div className={`w-5 h-5 flex-shrink-0 ${iconColor}`}>{icon}</div>
      <div className="text-sm leading-relaxed">
        <div className="font-extrabold mb-0.5">{title}</div>
        <div className="opacity-90">{children}</div>
      </div>
    </div>
  );
}

const ENDPOINTS = {
  status: (id) => `/processos/${id}/status-pncp/`,
  publish: (id) => `/processos/${id}/publicar-pncp/`,
  edit: (id) => `/processos/${id}/editar-pncp/`,
  rectifyDoc: (id) => `/processos/${id}/retificar-pncp/`,
  addItems: (id) => `/processos/${id}/adicionar-itens-pncp/`,
  rectifyItem: (id) => `/processos/${id}/retificar-item-pncp/`,
};

const ModalEnvioPNCP = ({ processo, onClose, onSuccess }) => {
  const api = useAxios();
  const { showToast } = useToast();

  const [uiState, setUiState] = useState(UI.IDLE);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [statusLoading, setStatusLoading] = useState(true);
  const [pncpInfo, setPncpInfo] = useState(null);
  const [hasPncp, setHasPncp] = useState(false);

  const [operation, setOperation] = useState(OPERATIONS.PUBLISH);

  // Campos
  const [tipoPublicacao, setTipoPublicacao] = useState(TIPOS_PUBLICACAO[0]?.id || "edital_licitacao");
  const [tipoDocumento, setTipoDocumento] = useState(TIPOS_DOCUMENTO[0]?.id || "edital");
  const [observacao, setObservacao] = useState("");

  const [file, setFile] = useState(null);

  // JSON payloads (edição/itens/patch item)
  const [editJson, setEditJson] = useState(`{\n  \n}`);
  const [itemsJson, setItemsJson] = useState(`[\n  {\n    "numeroItem": 1,\n    "descricao": "Item exemplificativo",\n    "quantidade": 1,\n    "unidadeMedida": "Unidade",\n    "valorUnitarioEstimado": 0,\n    "valorTotal": 0\n  }\n]`);
  const [numeroItem, setNumeroItem] = useState("");
  const [itemPatchJson, setItemPatchJson] = useState(`{\n  \n}`);

  const isMountedRef = useRef(true);

  const canUseOperation = useMemo(() => {
    const needsPncp = [OPERATIONS.EDIT, OPERATIONS.RECTIFY_DOC, OPERATIONS.ADD_ITEMS, OPERATIONS.RECTIFY_ITEM];
    return {
      [OPERATIONS.PUBLISH]: true,
      [OPERATIONS.EDIT]: hasPncp,
      [OPERATIONS.RECTIFY_DOC]: hasPncp,
      [OPERATIONS.ADD_ITEMS]: hasPncp,
      [OPERATIONS.RECTIFY_ITEM]: hasPncp,
      needsPncp,
    };
  }, [hasPncp]);

  const meta = useMemo(() => operationMeta(operation), [operation]);

  // ✅ Sem tela “CHECKING”: consulta status em paralelo e ajusta operação padrão.
  useEffect(() => {
    isMountedRef.current = true;

    const run = async () => {
      if (!processo?.id) {
        setStatusLoading(false);
        setHasPncp(false);
        setOperation(OPERATIONS.PUBLISH);
        return;
      }

      setStatusLoading(true);
      try {
        const { data } = await api.get(ENDPOINTS.status(processo.id));

        if (!isMountedRef.current) return;

        setPncpInfo(data || null);
        const published = Boolean(data?.publicado || data?.sequencial_pncp);
        setHasPncp(published);

        // Se já existe no PNCP, padrão vira retificação de doc (mais comum).
        setOperation(published ? OPERATIONS.RECTIFY_DOC : OPERATIONS.PUBLISH);
      } catch (err) {
        // Se falhar a consulta, não trava a UX: assume publicação inicial.
        if (!isMountedRef.current) return;
        setPncpInfo(null);
        setHasPncp(false);
        setOperation(OPERATIONS.PUBLISH);
      } finally {
        if (isMountedRef.current) setStatusLoading(false);
      }
    };

    run();
    return () => {
      isMountedRef.current = false;
    };
  }, [processo?.id, api]);

  const resetFeedback = () => {
    setUiState(UI.IDLE);
    setErrorMsg("");
  };

  const handleFileChange = (e) => {
    resetFeedback();
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!isPdf(selected)) {
      showToast("O PNCP aceita apenas arquivos PDF.", "warning");
      return;
    }
    if (selected.size > MAX_FILE_MB * 1024 * 1024) {
      showToast(`O arquivo excede o limite de ${MAX_FILE_MB}MB.`, "warning");
      return;
    }
    setFile(selected);
  };

  const validateBeforeSubmit = () => {
    if (!processo?.id) return { ok: false, msg: "Erro crítico: ID do processo ausente." };

    // Operações que exigem registro PNCP
    if (!canUseOperation[operation]) {
      return { ok: false, msg: "Esta operação exige que o processo já esteja publicado no PNCP." };
    }

    const needsFile = operation === OPERATIONS.PUBLISH || operation === OPERATIONS.RECTIFY_DOC;
    if (needsFile && !file) return { ok: false, msg: "O arquivo PDF é obrigatório para esta operação." };

    // Justificativa: recomendada/obrigatória em retificações (vamos exigir nas retificações por segurança)
    if (operation === OPERATIONS.RECTIFY_DOC || operation === OPERATIONS.RECTIFY_ITEM) {
      if (!observacao?.trim()) return { ok: false, msg: "A justificativa é obrigatória para retificações." };
    }

    if (operation === OPERATIONS.EDIT) {
      const parsed = safeJsonParse(editJson);
      if (!parsed.ok) return { ok: false, msg: `JSON de edição inválido: ${parsed.error}` };
      if (typeof parsed.value !== "object" || parsed.value === null || Array.isArray(parsed.value)) {
        return { ok: false, msg: "O JSON de edição deve ser um objeto." };
      }
    }

    if (operation === OPERATIONS.ADD_ITEMS) {
      const parsed = safeJsonParse(itemsJson);
      if (!parsed.ok) return { ok: false, msg: `JSON de itens inválido: ${parsed.error}` };
      if (!Array.isArray(parsed.value) || parsed.value.length === 0) {
        return { ok: false, msg: "Envie um array JSON com ao menos 1 item." };
      }
    }

    if (operation === OPERATIONS.RECTIFY_ITEM) {
      const n = Number(numeroItem);
      if (!Number.isInteger(n) || n <= 0) return { ok: false, msg: "Informe um número de item válido (> 0)." };

      const parsed = safeJsonParse(itemPatchJson);
      if (!parsed.ok) return { ok: false, msg: `JSON de retificação do item inválido: ${parsed.error}` };
      if (typeof parsed.value !== "object" || parsed.value === null || Array.isArray(parsed.value)) {
        return { ok: false, msg: "O JSON do patch do item deve ser um objeto." };
      }
    }

    return { ok: true };
  };

  const buildRequest = () => {
    // Retorna { endpoint, data, config }
    const pid = processo.id;

    if (operation === OPERATIONS.PUBLISH) {
      const form = new FormData();
      form.append("arquivo", file);
      form.append("tipo_publicacao", tipoPublicacao); // novo
      form.append("tipo_documento", tipoDocumento);
      if (observacao?.trim()) form.append("observacao", observacao.trim());

      return {
        endpoint: ENDPOINTS.publish(pid),
        data: form,
        config: {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (evt) => {
            const total = evt.total || 1;
            const percent = Math.round((evt.loaded * 100) / total);
            setUploadProgress(clamp(percent, 0, 100));
          },
        },
      };
    }

    if (operation === OPERATIONS.RECTIFY_DOC) {
      const form = new FormData();
      form.append("arquivo", file);
      form.append("tipo_documento", tipoDocumento);
      form.append("justificativa", observacao.trim()); // obrigatório aqui
      return {
        endpoint: ENDPOINTS.rectifyDoc(pid),
        data: form,
        config: {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (evt) => {
            const total = evt.total || 1;
            const percent = Math.round((evt.loaded * 100) / total);
            setUploadProgress(clamp(percent, 0, 100));
          },
        },
      };
    }

    if (operation === OPERATIONS.EDIT) {
      const parsed = JSON.parse(editJson);
      return {
        endpoint: ENDPOINTS.edit(pid),
        data: {
          payload: parsed,
          justificativa: observacao?.trim() || undefined,
        },
        config: {},
      };
    }

    if (operation === OPERATIONS.ADD_ITEMS) {
      const parsed = JSON.parse(itemsJson);
      return {
        endpoint: ENDPOINTS.addItems(pid),
        data: {
          itens: parsed,
          observacao: observacao?.trim() || undefined,
        },
        config: {},
      };
    }

    // RECTIFY_ITEM
    const parsed = JSON.parse(itemPatchJson);
    return {
      endpoint: ENDPOINTS.rectifyItem(pid),
      data: {
        numeroItem: Number(numeroItem),
        patch: parsed,
        justificativa: observacao.trim(),
      },
      config: {},
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetFeedback();

    const validation = validateBeforeSubmit();
    if (!validation.ok) {
      showToast(validation.msg, "warning");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const { endpoint, data, config } = buildRequest();
      await api.post(endpoint, data, config);

      setUiState(UI.SUCCESS);
      showToast("Operação enviada com sucesso.", "success");

      // Atualiza status local após sucesso (reconsulta)
      try {
        const { data: st } = await api.get(ENDPOINTS.status(processo.id));
        if (isMountedRef.current) {
          setPncpInfo(st || null);
          const published = Boolean(st?.publicado || st?.sequencial_pncp);
          setHasPncp(published);
        }
      } catch {
        // se falhar, ignora; o sucesso principal já aconteceu
      }

      if (onSuccess) onSuccess();
      // ✅ Removido setTimeout/espera: não fecha automaticamente
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Falha na comunicação com o PNCP/Backend. Tente novamente.";
      setUiState(UI.ERROR);
      setErrorMsg(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const requireFile = operation === OPERATIONS.PUBLISH || operation === OPERATIONS.RECTIFY_DOC;
  const requireJustification = operation === OPERATIONS.RECTIFY_DOC || operation === OPERATIONS.RECTIFY_ITEM;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
              <Globe className="w-5 h-5 text-[#004aad]" />
            </div>
            <div className="leading-tight">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">Integração PNCP</h3>
              <div className="text-xs text-gray-500 dark:text-gray-300 flex items-center gap-2">
                {statusLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Verificando status…
                  </>
                ) : hasPncp ? (
                  <>
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Já publicado
                    </span>
                    {pncpInfo?.sequencial_pncp ? (
                      <span className="text-gray-400">• Sequencial: {pncpInfo.sequencial_pncp}</span>
                    ) : null}
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Ainda não publicado
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={!loading ? onClose : undefined}
            className={`text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-2 transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            aria-label="Fechar"
            title={loading ? "Aguarde finalizar" : "Fechar"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Seletor de Operação */}
          <div className="grid grid-cols-1 gap-2">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
              Operação no PNCP
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  resetFeedback();
                  setOperation(OPERATIONS.PUBLISH);
                }}
                disabled={loading}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition
                  ${
                    operation === OPERATIONS.PUBLISH
                      ? "border-[#004aad] bg-blue-50 text-[#004aad]"
                      : "border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
              >
                <Send className="w-4 h-4" />
                Publicar
              </button>

              <button
                type="button"
                onClick={() => {
                  resetFeedback();
                  setOperation(OPERATIONS.RECTIFY_DOC);
                }}
                disabled={loading || !hasPncp}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition
                  ${
                    operation === OPERATIONS.RECTIFY_DOC
                      ? "border-amber-400 bg-amber-50 text-amber-800"
                      : "border-gray-200 hover:bg-gray-50 text-gray-700"
                  }
                  ${!hasPncp ? "opacity-60 cursor-not-allowed" : ""}`}
                title={!hasPncp ? "Exige publicação prévia" : "Retificar documento"}
              >
                <FileSignature className="w-4 h-4" />
                Retificar Doc.
              </button>

              <button
                type="button"
                onClick={() => {
                  resetFeedback();
                  setOperation(OPERATIONS.EDIT);
                }}
                disabled={loading || !hasPncp}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition
                  ${
                    operation === OPERATIONS.EDIT
                      ? "border-amber-400 bg-amber-50 text-amber-800"
                      : "border-gray-200 hover:bg-gray-50 text-gray-700"
                  }
                  ${!hasPncp ? "opacity-60 cursor-not-allowed" : ""}`}
                title={!hasPncp ? "Exige publicação prévia" : "Editar publicação"}
              >
                <Pencil className="w-4 h-4" />
                Editar
              </button>

              <button
                type="button"
                onClick={() => {
                  resetFeedback();
                  setOperation(OPERATIONS.ADD_ITEMS);
                }}
                disabled={loading || !hasPncp}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition
                  ${
                    operation === OPERATIONS.ADD_ITEMS
                      ? "border-[#004aad] bg-blue-50 text-[#004aad]"
                      : "border-gray-200 hover:bg-gray-50 text-gray-700"
                  }
                  ${!hasPncp ? "opacity-60 cursor-not-allowed" : ""}`}
                title={!hasPncp ? "Exige publicação prévia" : "Adicionar itens"}
              >
                <PlusCircle className="w-4 h-4" />
                Adicionar Itens
              </button>

              <button
                type="button"
                onClick={() => {
                  resetFeedback();
                  setOperation(OPERATIONS.RECTIFY_ITEM);
                }}
                disabled={loading || !hasPncp}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition sm:col-span-2
                  ${
                    operation === OPERATIONS.RECTIFY_ITEM
                      ? "border-amber-400 bg-amber-50 text-amber-800"
                      : "border-gray-200 hover:bg-gray-50 text-gray-700"
                  }
                  ${!hasPncp ? "opacity-60 cursor-not-allowed" : ""}`}
                title={!hasPncp ? "Exige publicação prévia" : "Retificar um item"}
              >
                <History className="w-4 h-4" />
                Retificar Item
              </button>
            </div>
          </div>

          {/* Card contextual */}
          <HintCard tone={meta.tone} icon={meta.icon} title={meta.title}>
            {meta.hint}
          </HintCard>

          {/* Feedback de erro/sucesso */}
          {uiState === UI.ERROR ? (
            <HintCard tone="error" icon={<AlertTriangle className="w-5 h-5" />} title="Falha ao enviar">
              <div className="whitespace-pre-wrap break-words">{errorMsg || "Erro inesperado."}</div>
            </HintCard>
          ) : null}

          {uiState === UI.SUCCESS ? (
            <div className="flex items-center gap-3 border border-green-200 bg-green-50 rounded-lg p-4">
              <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="text-sm">
                <div className="font-extrabold text-green-900">Operação enviada com sucesso!</div>
                <div className="text-green-800/80">Se necessário, confira o status no PNCP ou reabra este modal.</div>
              </div>
            </div>
          ) : null}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campos específicos do PUBLISH */}
            {operation === OPERATIONS.PUBLISH ? (
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                    Tipo de Aviso/Publicação *
                  </label>
                  <select
                    value={tipoPublicacao}
                    onChange={(e) => {
                      resetFeedback();
                      setTipoPublicacao(e.target.value);
                    }}
                    disabled={loading}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad] bg-white text-sm disabled:bg-gray-100"
                  >
                    {TIPOS_PUBLICACAO.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}

            {/* Tipo de Documento (usado em publish/retify_doc) */}
            {operation === OPERATIONS.PUBLISH || operation === OPERATIONS.RECTIFY_DOC ? (
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                  Tipo de Documento *
                </label>
                <select
                  value={tipoDocumento}
                  onChange={(e) => {
                    resetFeedback();
                    setTipoDocumento(e.target.value);
                  }}
                  disabled={loading}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad] bg-white text-sm disabled:bg-gray-100"
                >
                  {TIPOS_DOCUMENTO.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {/* Upload de arquivo */}
            {requireFile ? (
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                  Arquivo (PDF) *
                </label>

                <div
                  className={`
                    relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all
                    ${file ? "border-green-500 bg-green-50/30" : "border-gray-300 hover:border-[#004aad] hover:bg-slate-50"}
                    ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
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
                      <FileText className="w-8 h-8 text-green-600" />
                      <div className="text-left">
                        <p className="text-sm font-bold text-gray-800 truncate max-w-[250px]">{file.name}</p>
                        <p className="text-xs text-green-600 font-medium">{formatMB(file.size)} • Pronto</p>
                      </div>
                    </div>
                  ) : (
                    <div className="pointer-events-none space-y-1">
                      <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">Clique para selecionar o PDF</p>
                      <p className="text-xs text-gray-400">Tamanho máx. {MAX_FILE_MB}MB</p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Edição (JSON) */}
            {operation === OPERATIONS.EDIT ? (
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                  Dados para edição (JSON) *
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600">
                    <ClipboardList className="w-4 h-4" />
                    Envie apenas campos alterados (seu backend aplica PATCH parcial)
                  </div>
                  <textarea
                    value={editJson}
                    onChange={(e) => {
                      resetFeedback();
                      setEditJson(e.target.value);
                    }}
                    disabled={loading}
                    rows={7}
                    spellCheck={false}
                    className="w-full p-3 text-sm font-mono bg-white focus:outline-none disabled:bg-gray-100"
                    placeholder='{"campo": "novo valor"}'
                  />
                </div>
              </div>
            ) : null}

            {/* Adição de itens (JSON array) */}
            {operation === OPERATIONS.ADD_ITEMS ? (
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                  Itens da contratação (JSON array) *
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600">
                    Dica: cole um array de itens. Ex.: [{"{"}"numeroItem":1,...{"}"}]
                  </div>
                  <textarea
                    value={itemsJson}
                    onChange={(e) => {
                      resetFeedback();
                      setItemsJson(e.target.value);
                    }}
                    disabled={loading}
                    rows={9}
                    spellCheck={false}
                    className="w-full p-3 text-sm font-mono bg-white focus:outline-none disabled:bg-gray-100"
                  />
                </div>
              </div>
            ) : null}

            {/* Retificação de item */}
            {operation === OPERATIONS.RECTIFY_ITEM ? (
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                    Número do Item *
                  </label>
                  <input
                    value={numeroItem}
                    onChange={(e) => {
                      resetFeedback();
                      setNumeroItem(e.target.value);
                    }}
                    disabled={loading}
                    inputMode="numeric"
                    placeholder="Ex.: 1"
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad] bg-white text-sm disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                    Patch do Item (JSON) *
                  </label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600">
                      Envie apenas campos que mudaram (ex.: valorTotal, descricao, quantidade...)
                    </div>
                    <textarea
                      value={itemPatchJson}
                      onChange={(e) => {
                        resetFeedback();
                        setItemPatchJson(e.target.value);
                      }}
                      disabled={loading}
                      rows={7}
                      spellCheck={false}
                      className="w-full p-3 text-sm font-mono bg-white focus:outline-none disabled:bg-gray-100"
                      placeholder='{"descricao":"Nova descrição"}'
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {/* Justificativa / Observação */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                {requireJustification ? "Justificativa *" : "Justificativa / Observação"}
              </label>
              <textarea
                value={observacao}
                onChange={(e) => {
                  resetFeedback();
                  setObservacao(e.target.value);
                }}
                disabled={loading}
                rows={2}
                placeholder={
                  requireJustification
                    ? "Obrigatório: descreva o motivo da retificação..."
                    : "Opcional: descreva o motivo ou detalhe da operação..."
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad] text-sm disabled:bg-gray-100 resize-none"
              />
            </div>

            {/* Progresso (somente upload) */}
            {loading && requireFile ? (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between text-xs font-semibold text-gray-500">
                  <span>{uploadProgress < 100 ? "Enviando arquivo..." : "Processando resposta..."}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#004aad] transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : null}

            {/* Rodapé */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading || (requireFile && !file) || !canUseOperation[operation]}
                className={`
                  px-6 py-2.5 bg-[#004aad] text-white text-sm font-bold rounded-lg
                  hover:bg-[#003d91] flex items-center gap-2 shadow-lg shadow-blue-900/20
                  transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100
                `}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : operation === OPERATIONS.RECTIFY_DOC ? (
                  <FileSignature className="w-4 h-4" />
                ) : operation === OPERATIONS.ADD_ITEMS ? (
                  <PlusCircle className="w-4 h-4" />
                ) : operation === OPERATIONS.EDIT ? (
                  <Pencil className="w-4 h-4" />
                ) : operation === OPERATIONS.RECTIFY_ITEM ? (
                  <History className="w-4 h-4" />
                ) : (
                  <Send className="w-4 h-4" />
                )}

                {loading ? "Processando..." : "Enviar ao PNCP"}
              </button>
            </div>

            {/* Nota pequena de compat */}
            <div className="text-[11px] text-gray-400 leading-relaxed">
              Observação: os botões chamam endpoints do seu backend. Se algum endpoint ainda não existir, crie no backend
              (ex.: <span className="font-mono">editar-pncp</span>,{" "}
              <span className="font-mono">adicionar-itens-pncp</span>,{" "}
              <span className="font-mono">retificar-item-pncp</span>) mantendo as regras do PNCP.
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ModalEnvioPNCP;
