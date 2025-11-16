// frontend/src/components/ImportacaoProcessoModal.jsx
import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import useAxios from "../hooks/useAxios";
import { useToast } from "../context/ToastContext";
import axios from "axios";

// helpers de UI para manter o padrão
const Button = ({ children, className = "", ...props }) => (
  <button
    className={`flex items-center justify-center font-medium gap-2 focus:outline-none disabled:pointer-events-none whitespace-nowrap transition-all duration-200 px-4 py-2 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const inputCampo =
  "w-full px-2 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-transparent border dark:bg-dark-bg-primary dark:border-dark-bg-primary";

const REQUIRED_IMPORT_SHEET = "IMPORTACAO";
const OPTIONAL_FORNEC_SHEET = "FORNECEDORES";

// campos que esperamos na aba IMPORTACAO (processo + item)
// OBS: Campos opcionais podem vir vazios (ok)
const PROCESSO_COLS = [
  "processo_ref",
  "entidade_id",
  "entidade_nome",
  "orgao_codigo_unidade",
  "orgao_nome",
  "numero_processo",
  "ano",
  "objeto",
  "modalidade",
  "registro_precos",
  "tipo_disputa",
  "data_certame",
  "hora_certame",
  "local_sessao",
  "observacoes_processo",
];

const ITEM_COLS = [
  "item_ordem",
  "lote",
  "item_descricao",
  "item_especificacao",
  "quantidade",
  "unidade",
  "valor_unitario_estimado",
  "categoria",
  "marca_preferencial",
];

// campos para a aba FORNECEDORES (opcional)
const FORNEC_COLS = [
  "cnpj",
  "razao_social",
  "nome_fantasia",
  "email",
  "telefone",
  "cep",
  "logradouro",
  "numero",
  "bairro",
  "complemento",
  "municipio",
  "uf",
  "observacoes",
];

// util seguro
const safe = (v, fb = "—") =>
  v === null || v === undefined || v === "" ? fb : v;

// normaliza SIM/NAO -> boolean
const toBool = (v) => {
  if (typeof v === "boolean") return v;
  const s = String(v || "").trim().toLowerCase();
  if (["sim", "s", "true", "1", "yes"].includes(s)) return true;
  if (["nao", "não", "n", "false", "0", "no"].includes(s)) return false;
  return null; // mantemos nulo se veio vazio/desconhecido
};

// junta data + hora -> ISO se possível
const joinDateTime = (d, h) => {
  if (!d && !h) return null;
  try {
    const date = d ? new Date(d) : null;
    if (!date || isNaN(date.getTime())) return null;

    if (!h) {
      // só data
      const iso = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
      ).toISOString();
      return iso;
    }

    // hora pode vir como string "HH:MM" ou número excel
    let hh = 0;
    let mm = 0;
    if (typeof h === "string" && h.includes(":")) {
      const [H, M] = h.split(":");
      hh = Number(H || 0);
      mm = Number(M || 0);
    } else if (!isNaN(Number(h))) {
      // excel hour fraction
      const totalMinutes = Math.round(Number(h) * 24 * 60);
      hh = Math.floor(totalMinutes / 60);
      mm = totalMinutes % 60;
    }

    const iso = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hh, mm, 0)
    ).toISOString();
    return iso;
  } catch {
    return null;
  }
};

export default function ImportacaoProcessoModal({
  open,
  onClose,
  onImported,
  templateUrl = "/Modelo_Simples_Importacao.xlsx",
}) {
  const api = useAxios();
  const { showToast } = useToast();
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null); // { processos:[], fornecedores:[], preview:[], warnings:[] }
  const [autoFornecedor, setAutoFornecedor] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) =>
    setLogs((l) => [...l, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const reset = () => {
    setFile(null);
    setParsed(null);
    setLogs([]);
    setAutoFornecedor(true);
    setSubmitting(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const closeAll = () => {
    reset();
    onClose?.();
  };

  const handlePick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/\.(xlsx)$/i.test(f.name)) {
      showToast("Envie um arquivo .xlsx.", "error");
      return;
    }
    setFile(f);
  };

  const parseWorkbook = async () => {
    if (!file) return;
    setParsing(true);
    setParsed(null);
    setLogs([]);
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: "array" });

      const importSheet =
        wb.Sheets[REQUIRED_IMPORT_SHEET] ||
        wb.Sheets[wb.SheetNames.find((n) => n.toLowerCase().includes("import"))];

      if (!importSheet) {
        showToast(
          `Aba "${REQUIRED_IMPORT_SHEET}" não encontrada no arquivo.`,
          "error"
        );
        setParsing(false);
        return;
      }

      const rows = XLSX.utils.sheet_to_json(importSheet, { defval: "" });
      if (!rows.length) {
        showToast("A aba IMPORTACAO está vazia.", "error");
        setParsing(false);
        return;
      }

      // warnings
      const warnings = [];
      const header = Object.keys(rows[0] || {});
      const missingHeaders = [...PROCESSO_COLS, ...ITEM_COLS].filter(
        (col) => !header.includes(col)
      );
      if (missingHeaders.length) {
        warnings.push(
          `Colunas ausentes em IMPORTACAO: ${missingHeaders.join(", ")}.`
        );
      }

      // agrupamento por processo_ref
      const byProcess = new Map();
      rows.forEach((r, idx) => {
        const ref = String(r.processo_ref || "").trim() || `ref_${idx + 1}`;
        if (!byProcess.has(ref)) byProcess.set(ref, []);
        byProcess.get(ref).push(r);
      });

      const processos = [];
      const preview = [];

      byProcess.forEach((lines, ref) => {
        // usa a primeira linha como base do processo
        const p0 = lines[0] || {};
        const registro_precos = toBool(p0.registro_precos);
        const isoSessao = joinDateTime(p0.data_certame, p0.hora_certame);

        const processo = {
          processo_ref: ref, // para rastreio em logs
          // processo (campos opcionais podem vir vazios)
          entidade_id: safe(p0.entidade_id, null),
          entidade_nome: safe(p0.entidade_nome, null),
          orgao_codigo_unidade: safe(p0.orgao_codigo_unidade, null),
          orgao_nome: safe(p0.orgao_nome, null),
          numero_processo: safe(p0.numero_processo, ""),
          ano: safe(p0.ano, ""),
          objeto: safe(p0.objeto, ""),
          modalidade: safe(p0.modalidade, ""),
          registro_precos:
            registro_precos === null ? undefined : Boolean(registro_precos),
          tipo_disputa: safe(p0.tipo_disputa, ""),
          data_sessao_iso: isoSessao,
          local_sessao: safe(p0.local_sessao, ""),
          observacoes_processo: safe(p0.observacoes_processo, ""),

          // itens
          itens: lines.map((L) => ({
            item_ordem: L.item_ordem || "",
            lote: L.lote || "",
            item_descricao: L.item_descricao || "",
            item_especificacao: L.item_especificacao || "",
            quantidade: L.quantidade || "",
            unidade: L.unidade || "",
            valor_unitario_estimado: L.valor_unitario_estimado || "",
            categoria: L.categoria || "",
            marca_preferencial: L.marca_preferencial || "",
          })),
        };

        processos.push(processo);
        preview.push({
          processo_ref: ref,
          numero_processo: processo.numero_processo,
          ano: processo.ano,
          itens: processo.itens.length,
          entidade: processo.entidade_id || processo.entidade_nome || "—",
          orgao:
            processo.orgao_codigo_unidade || processo.orgao_nome || "—",
        });
      });

      // FORNECEDORES (opcional)
      let fornecedores = [];
      const fornecSheet = wb.Sheets[OPTIONAL_FORNEC_SHEET];
      if (fornecSheet) {
        const fr = XLSX.utils.sheet_to_json(fornecSheet, { defval: "" });
        if (fr.length) {
          fornecedores = fr.map((f) => {
            const obj = {};
            FORNEC_COLS.forEach((c) => (obj[c] = f[c] ?? ""));
            return obj;
          });
        }
      }

      setParsed({ processos, fornecedores, preview, warnings });
      showToast("Planilha lida com sucesso! Revise a prévia e importe.", "success");
    } catch (err) {
      console.error(err);
      showToast("Falha ao ler a planilha. Verifique o arquivo.", "error");
    } finally {
      setParsing(false);
    }
  };

  // opcional: auto-cadastro de fornecedores por CNPJ caso não existam
  const ensureFornecedores = async (list) => {
    if (!list?.length) return;
    addLog(`Verificando ${list.length} fornecedor(es) da aba FORNECEDORES...`);
    try {
      // dedupe por CNPJ "limpo"
      const uniqByCNPJ = new Map();
      list.forEach((f) => {
        const clean = String(f.cnpj || "").replace(/[^\d]/g, "");
        if (!clean) return;
        if (!uniqByCNPJ.has(clean)) uniqByCNPJ.set(clean, { ...f, cnpj: clean });
      });
      const fornecedores = Array.from(uniqByCNPJ.values());
      if (!fornecedores.length) return;

      // busca já cadastrados
      const res = await api.get("/fornecedores/", { params: { limit: 1000 } });
      const existentes = Array.isArray(res.data) ? res.data : res.data?.results || [];
      const setExist = new Set(
        existentes
          .map((z) => String(z.cnpj || "").replace(/[^\d]/g, ""))
          .filter(Boolean)
      );

      for (const f of fornecedores) {
        const clean = f.cnpj;
        if (!clean) continue;
        if (setExist.has(clean)) {
          addLog(`Fornecedor ${clean} já existe — OK.`);
          continue;
        }

        if (autoFornecedor) {
          // tenta completar via BrasilAPI
          try {
            const b = await axios.get(
              `https://brasilapi.com.br/api/cnpj/v1/${clean}`
            );
            const d = b.data || {};
            const payload = {
              cnpj: clean,
              razao_social: f.razao_social || d.razao_social || "",
              nome_fantasia: f.nome_fantasia || d.nome_fantasia || "",
              telefone: f.telefone || d.ddd_telefone_1 || "",
              email: f.email || d.email || "",
              cep: f.cep || d.cep || "",
              logradouro: f.logradouro || d.logradouro || "",
              numero: f.numero || d.numero || "",
              bairro: f.bairro || d.bairro || "",
              complemento: f.complemento || d.complemento || "",
              municipio: f.municipio || d.municipio || "",
              uf: f.uf || d.uf || "",
              observacoes: f.observacoes || "",
            };
            await api.post("/fornecedores/", payload);
            addLog(`Fornecedor ${clean} cadastrado (BrasilAPI + manual).`);
            setExist.add(clean);
          } catch (err) {
            addLog(`Falha ao cadastrar fornecedor ${clean}. Prosseguindo...`);
          }
        }
      }
    } catch (e) {
      addLog("Não foi possível validar/cadastrar fornecedores. Prosseguindo...");
    }
  };

  // envio dos dados (sempre via XLSX para casar com o backend /processos/importar-xlsx/)
  const submitImport = async () => {
  if (!file) {
    showToast("Escolha um arquivo .xlsx", "error");
    return;
  }
  setSubmitting(true);
  try {
    const form = new FormData();
    form.append("arquivo", file); // <- chave igual à da view
    await api.post("/processos/importar-xlsx/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    showToast("Importação concluída!", "success");
    onImported?.();
    closeAll();
  } catch (err) {
    console.error(err);
    showToast("Falha na importação. Verifique o arquivo e as colunas.", "error");
  } finally {
    setSubmitting(false);
  }
};

  const counters = useMemo(() => {
    if (!parsed) return { processos: 0, itens: 0, fornecedores: 0 };
    const itens = parsed.processos.reduce((acc, p) => acc + (p.itens?.length || 0), 0);
    return {
      processos: parsed.processos.length,
      itens,
      fornecedores: parsed.fornecedores?.length || 0,
    };
  }, [parsed]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-5xl bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border shadow-xl overflow-hidden"
          initial={{ scale: 0.98, y: 10, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.98, y: 10, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-light-border dark:border-dark-border">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-accent-blue" />
              <h3 className="text-lg font-semibold">Importar Processos via Planilha</h3>
            </div>
            <button
              onClick={closeAll}
              className="p-2 rounded-md hover:bg-black/10 dark:hover:bg:white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {/* Seletor + ações */}
            <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-3">
              <div className="flex gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx"
                  onChange={handlePick}
                  className={`${inputCampo} w-full`}
                />
                <Button
                  onClick={parseWorkbook}
                  disabled={!file || parsing}
                  className={`border rounded-md ${parsing ? "opacity-60" : ""}`}
                >
                  {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  Ler arquivo
                </Button>
              </div>

              <div className="flex gap-2 justify-end">
                <a
                  href={templateUrl}
                  download
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border"
                >
                  <Download className="w-4 h-4" />
                  Baixar Modelo
                </a>
              </div>
            </div>

            {/* Opções */}
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoFornecedor}
                  onChange={(e) => setAutoFornecedor(e.target.checked)}
                />
                <span>
                  Completar/cadastrar fornecedores automaticamente pelo CNPJ (BrasilAPI),
                  se não existirem.
                </span>
              </label>
            </div>

            {/* Warnings */}
            {parsed?.warnings?.length ? (
              <div className="rounded-md border border-yellow-300 bg-yellow-50 text-yellow-800 p-3 text-sm">
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <AlertCircle className="w-4 h-4" /> Avisos
                </div>
                <ul className="list-disc ml-5">
                  {parsed.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Preview */}
            {parsed ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-md border p-3">
                    <p className="text-sm text-slate-500">Processos</p>
                    <p className="text-2xl font-semibold">{counters.processos}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-sm text-slate-500">Itens</p>
                    <p className="text-2xl font-semibold">{counters.itens}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-sm text-slate-500">Fornecedores (aba opcional)</p>
                    <p className="text-2xl font-semibold">{counters.fornecedores}</p>
                  </div>
                </div>

                <div className="overflow-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-light-bg-primary dark:bg-dark-bg-primary">
                      <tr className="text-xs uppercase text-slate-500">
                        <th className="p-2 text-left">Ref</th>
                        <th className="p-2 text-left">Nº Processo</th>
                        <th className="p-2 text-left">Ano</th>
                        <th className="p-2 text-left">Entidade</th>
                        <th className="p-2 text-left">Órgão</th>
                        <th className="p-2 text-right">Itens</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.preview.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2">{safe(row.processo_ref)}</td>
                          <td className="p-2">{safe(row.numero_processo)}</td>
                          <td className="p-2">{safe(row.ano)}</td>
                          <td className="p-2">{safe(row.entidade)}</td>
                          <td className="p-2">{safe(row.orgao)}</td>
                          <td className="p-2 text-right">{row.itens}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsed.preview.length > 10 ? (
                    <div className="p-2 text-xs text-slate-500">
                      Mostrando 10 de {parsed.preview.length} processos…
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-6 text-sm text-slate-500">
                Selecione o arquivo e clique em <b>Ler arquivo</b> para ver a prévia.
              </div>
            )}

            {/* Logs */}
            {logs.length ? (
              <div className="rounded-md border bg-light-bg-primary dark:bg-dark-bg-primary p-3 text-xs max-h-36 overflow-auto">
                {logs.map((l, i) => (
                  <div key={i}>{l}</div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-light-border dark:border-dark-border">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Campos como amparo legal e fundamentação são opcionais (podem ser
              incluídos após a importação).
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={closeAll} className="rounded-md border">
                Cancelar
              </Button>
              <Button
                onClick={submitImport}
                disabled={!parsed || submitting}
                className={`rounded-md text-white ${
                  parsed ? "bg-accent-blue hover:bg-accent-blue/90" : "bg-slate-400"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Importando…
                  </>
                ) : (
                  <>Importar</>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
