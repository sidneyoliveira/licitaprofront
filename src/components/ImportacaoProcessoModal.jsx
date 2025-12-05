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

/* ────────────────────────────────────────────────────────────────────────── */
/* 1. UI HELPERS (BOTÃO + INPUT)                                            */
/* ────────────────────────────────────────────────────────────────────────── */

const Button = ({
  children,
  className = "",
  variant = "primary",
  ...props
}) => {
  const baseStyle =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-accent-blue/60 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap";

  const variants = {
    primary:
      "bg-accent-blue text-white hover:bg-accent-blue/90 shadow-sm",
    outline:
      "border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800",
    ghost:
      "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const inputClass =
  "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-blue";

/* ────────────────────────────────────────────────────────────────────────── */
/* 2. CONSTANTES & HELPERS DE NEGÓCIO                                       */
/* ────────────────────────────────────────────────────────────────────────── */

const CADASTRO_SHEET = "CADASTRO INICIAL";
const OPTIONAL_FORNEC_SHEET = "FORNECEDORES";

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

const safe = (v, fb = "—") =>
  v === null || v === undefined || v === "" ? fb : v;

// SIM / NÃO -> boolean
const toBool = (v) => {
  if (typeof v === "boolean") return v;
  const s = String(v || "").trim().toLowerCase();
  if (["sim", "s", "true", "1", "yes"].includes(s)) return true;
  if (["nao", "não", "n", "false", "0", "no"].includes(s)) return false;
  return null;
};

// junta data + hora -> ISO
const joinDateTime = (d, h) => {
  if (!d && !h) return null;
  try {
    const date = d ? new Date(d) : null;
    if (!date || isNaN(date.getTime())) return null;

    if (!h) {
      const iso = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
      ).toISOString();
      return iso;
    }

    let hh = 0;
    let mm = 0;

    if (typeof h === "string" && h.includes(":")) {
      const [H, M] = h.split(":");
      hh = Number(H || 0);
      mm = Number(M || 0);
    } else if (!isNaN(Number(h))) {
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

/* ────────────────────────────────────────────────────────────────────────── */
/* 3. COMPONENTE PRINCIPAL                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

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
  const [parsed, setParsed] = useState(null); // { processos, fornecedores, preview, warnings }
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

      const getCell = (sheet, addr) => {
        const cell = sheet[addr];
        if (!cell) return "";
        if (cell.v === null || cell.v === undefined) {
          return cell.w ?? "";
        }
        return cell.v;
      };

      const cadastroSheetName =
        wb.SheetNames.find(
          (n) => n.toLowerCase() === CADASTRO_SHEET.toLowerCase()
        ) ||
        wb.SheetNames.find((n) =>
          n.toLowerCase().includes("cadastro inicial")
        ) ||
        wb.SheetNames.find((n) => n.toLowerCase().includes("cadastro"));

      if (!cadastroSheetName || !wb.Sheets[cadastroSheetName]) {
        showToast(
          `Aba "${CADASTRO_SHEET}" não encontrada no arquivo.`,
          "error"
        );
        return;
      }

      const sheet = wb.Sheets[cadastroSheetName];
      const warnings = [];

      // META DO PROCESSO (linha 7)
      const numero_processo = safe(getCell(sheet, "B7"), "");
      const data_processo_raw = getCell(sheet, "C7");
      const numero_certame = safe(getCell(sheet, "D7"), "");
      const data_certame_raw = getCell(sheet, "E7");
      const hora_certame_raw = getCell(sheet, "F7");

      const entidade_nome = safe(getCell(sheet, "G7"), null);
      const orgao_nome = safe(getCell(sheet, "H7"), null);
      const valor_global_estimado = getCell(sheet, "I7") || "";

      // DADOS TÉCNICOS (linha 11)
      const modalidade = safe(getCell(sheet, "A11"), "");
      const modo_disputa = safe(getCell(sheet, "B11"), "");
      const registro_precos_raw = getCell(sheet, "C11");
      const tipo_organizacao = safe(getCell(sheet, "D11"), "");
      const criterio_julgamento = safe(getCell(sheet, "E11"), "");
      const classificacao = safe(getCell(sheet, "F11"), "");
      const vigencia_meses = getCell(sheet, "I11") || "";

      const registro_precos = toBool(registro_precos_raw);
      const data_sessao_iso = joinDateTime(
        data_certame_raw,
        hora_certame_raw
      );

      // CAMPOS TEXTUAIS
      const objeto = safe(getCell(sheet, "A7"), "");
      const amparo_legal = safe(getCell(sheet, "H11"), "");
      const fundamentacao = safe(getCell(sheet, "G11"), "");

      // ITENS DO PROCESSO (cabeçalho -> linha 15)
      const ITEMS_HEADER_ROW = 15;
      const ITEMS_HEADER_ROW_INDEX0 = ITEMS_HEADER_ROW - 1;

      const rawItems = XLSX.utils.sheet_to_json(sheet, {
        range: ITEMS_HEADER_ROW_INDEX0,
        defval: "",
      });

      if (!rawItems.length) {
        showToast(
          "A área de itens da planilha está vazia. Verifique a seção 'ITENS DO PROCESSO'.",
          "error"
        );
        return;
      }

      const itemHeader = Object.keys(rawItems[0] || {});
      const requiredItemHeaders = [
        "LOTE",
        "N ITEM",
        "DESCRIÇÃO DO ITEM",
        "ESPECIFICAÇÃO",
        "QUANTIDADE",
        "UNIDADE",
        "NATUREZA / DESPESA",
        "VALOR REFERÊNCIA UNITÁRIO",
        "CNPJ DO FORNECEDOR",
      ];

      const missingItemHeaders = requiredItemHeaders.filter(
        (h) => !itemHeader.includes(h)
      );
      if (missingItemHeaders.length) {
        warnings.push(
          `Colunas ausentes na seção ITENS DO PROCESSO: ${missingItemHeaders.join(
            ", "
          )}.`
        );
      }

      const itens = rawItems
        .map((row) => {
          const lote = String(row["LOTE"] || "").trim();
          const numItem = row["N ITEM"];
          const descricao = String(
            row["DESCRIÇÃO DO ITEM"] || ""
          ).trim();
          const especificacao = String(row["ESPECIFICAÇÃO"] || "").trim();
          const quantidade = row["QUANTIDADE"];
          const unidade = row["UNIDADE"];
          const naturezaDespesa = row["NATUREZA / DESPESA"];
          const valorRef = row["VALOR REFERÊNCIA UNITÁRIO"];
          const cnpj = row["CNPJ DO FORNECEDOR"];

          const hasItemData =
            descricao ||
            especificacao ||
            (quantidade !== null &&
              quantidade !== undefined &&
              quantidade !== "") ||
            (valorRef !== null &&
              valorRef !== undefined &&
              valorRef !== "");

          if (!hasItemData) return null;

          return {
            item_ordem: numItem || "",
            lote,
            item_descricao: descricao,
            item_especificacao: especificacao || "",
            quantidade: quantidade ?? "",
            unidade: unidade ?? "",
            valor_unitario_estimado: valorRef ?? "",
            categoria: naturezaDespesa ?? "",
            marca_preferencial: "",
            cnpj_fornecedor: cnpj || "",
          };
        })
        .filter(Boolean);

      if (!itens.length) {
        showToast(
          "Nenhum item válido encontrado na seção ITENS DO PROCESSO.",
          "error"
        );
        return;
      }

      const processos = [
        {
          processo_ref: "CADASTRO_INICIAL",
          entidade_id: null,
          entidade_nome,
          orgao_codigo_unidade: null,
          orgao_nome,
          numero_processo,
          ano: "2025",
          objeto,
          modalidade,
          registro_precos:
            registro_precos === null ? undefined : registro_precos,
          tipo_disputa: modo_disputa,
          data_sessao_iso,
          local_sessao: "",
          classificacao,
          criterio_julgamento,
          tipo_organizacao,
          vigencia_meses,
          amparo_legal,
          fundamentacao,
          valor_global_estimado,
          itens,
        },
      ];

      const preview = [
        {
          processo_ref: "CADASTRO_INICIAL",
          numero_processo,
          ano: "2025",
          entidade: entidade_nome || "—",
          orgao: orgao_nome || "—",
          itens: itens.length,
        },
      ];

      setParsed({ processos, fornecedores: [], preview, warnings });
      showToast(
        'Planilha "CADASTRO INICIAL" lida com sucesso! Revise a prévia e importe.',
        "success"
      );
    } catch (err) {
      console.error(err);
      showToast("Falha ao ler a planilha. Verifique o arquivo.", "error");
    } finally {
      setParsing(false);
    }
  };

  // opcional: auto-cadastro de fornecedores por CNPJ
  const ensureFornecedores = async (list) => {
    if (!list?.length) return;
    addLog(`Verificando ${list.length} fornecedor(es) da aba FORNECEDORES...`);
    try {
      const uniqByCNPJ = new Map();
      list.forEach((f) => {
        const clean = String(f.cnpj || "").replace(/[^\d]/g, "");
        if (!clean) return;
        if (!uniqByCNPJ.has(clean)) uniqByCNPJ.set(clean, { ...f, cnpj: clean });
      });
      const fornecedores = Array.from(uniqByCNPJ.values());
      if (!fornecedores.length) return;

      const res = await api.get("/fornecedores/", {
        params: { limit: 1000 },
      });
      const existentes = Array.isArray(res.data)
        ? res.data
        : res.data?.results || [];
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
            };
            await api.post("/fornecedores/", payload);
            addLog(`Fornecedor ${clean} cadastrado (BrasilAPI + manual).`);
            setExist.add(clean);
          } catch (err) {
            addLog(
              `Falha ao cadastrar fornecedor ${clean}. Prosseguindo...`
            );
          }
        }
      }
    } catch (e) {
      addLog(
        "Não foi possível validar/cadastrar fornecedores. Prosseguindo..."
      );
    }
  };

  // envio dos dados (sempre via XLSX para casar com o backend)
  const submitImport = async () => {
    if (!file) {
      showToast("Escolha um arquivo .xlsx", "error");
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("arquivo", file);
      await api.post("/processos/importar-xlsx/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("Importação concluída!", "success");
      onImported?.();
      closeAll();
    } catch (err) {
      console.error(err);
      showToast(
        "Falha na importação. Verifique o arquivo e as colunas.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const counters = useMemo(() => {
    if (!parsed) return { processos: 0, itens: 0, fornecedores: 0 };
    const itens = parsed.processos.reduce(
      (acc, p) => acc + (p.itens?.length || 0),
      0
    );
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
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-5xl bg-white dark:bg-dark-bg-secondary rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
          initial={{ scale: 0.96, y: 10, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.96, y: 10, opacity: 0 }}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#004aad] dark:text-blue-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">
                  Importar Processos via Planilha
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Utilize o modelo padrão para cadastrar processos e itens em lote.
                </p>
              </div>
            </div>
            <button
              onClick={closeAll}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500 dark:text-slate-300" />
            </button>
          </div>

          {/* BODY */}
          <div className="p-5 space-y-5">
            {/* SELETOR + AÇÕES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wide">
                  Arquivo .xlsx
                </span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".xlsx"
                    onChange={handlePick}
                    className={`${inputClass} sm:flex-1 cursor-pointer`}
                  />
                  <Button
                    variant="outline"
                    onClick={parseWorkbook}
                    disabled={!file || parsing}
                    className="sm:w-auto"
                  >
                    {parsing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Lendo arquivo...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        Ler arquivo
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wide">
                  Modelo da planilha
                </span>
                <a
                  href={templateUrl}
                  download
                  className="inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Baixar modelo
                </a>
              </div>
            </div>

            {/* OPÇÕES */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 px-3 py-3 flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-0.5 accent-accent-blue"
                checked={autoFornecedor}
                onChange={(e) => setAutoFornecedor(e.target.checked)}
              />
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Completar/cadastrar fornecedores automaticamente pelo{" "}
                <span className="font-semibold">CNPJ</span> (BrasilAPI), caso
                ainda não estejam cadastrados.
              </div>
            </div>

            {/* WARNINGS */}
            {parsed?.warnings?.length ? (
              <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-100 p-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <AlertCircle className="w-4 h-4" />
                  Avisos da leitura da planilha
                </div>
                <ul className="list-disc ml-5 space-y-1">
                  {parsed.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* PREVIEW OU PLACEHOLDER */}
            {parsed ? (
              <div className="space-y-4">
                {/* CONTADORES */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Processos
                    </p>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                      {counters.processos}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Itens
                    </p>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                      {counters.itens}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Fornecedores (via CNPJ)
                    </p>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                      {counters.fornecedores}
                    </p>
                  </div>
                </div>

                {/* TABELA PREVIEW */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                  <div className="overflow-auto max-h-72">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-900/80">
                        <tr className="text-[11px] sm:text-xs uppercase text-slate-500 dark:text-slate-400">
                          <th className="p-2 text-left">Ref.</th>
                          <th className="p-2 text-left">Nº Processo</th>
                          <th className="p-2 text-left">Ano</th>
                          <th className="p-2 text-left">Entidade</th>
                          <th className="p-2 text-left">Órgão</th>
                          <th className="p-2 text-right">Itens</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsed.preview.slice(0, 10).map((row, idx) => (
                          <tr
                            key={idx}
                            className="border-t border-slate-100 dark:border-slate-800/80"
                          >
                            <td className="p-2 align-middle">
                              {safe(row.processo_ref)}
                            </td>
                            <td className="p-2 align-middle">
                              {safe(row.numero_processo)}
                            </td>
                            <td className="p-2 align-middle">
                              {safe(row.ano)}
                            </td>
                            <td className="p-2 align-middle">
                              {safe(row.entidade)}
                            </td>
                            <td className="p-2 align-middle">
                              {safe(row.orgao)}
                            </td>
                            <td className="p-2 text-right align-middle">
                              {row.itens}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsed.preview.length > 10 && (
                    <div className="px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
                      Mostrando 10 de {parsed.preview.length} processos…
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 px-4 py-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-900/40">
                Selecione o arquivo e clique em{" "}
                <span className="font-semibold">Ler arquivo</span> para ver a
                prévia dos processos e itens a serem importados.
              </div>
            )}

            {/* LOGS */}
            {logs.length ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-[11px] sm:text-xs max-h-32 overflow-auto">
                {logs.map((l, i) => (
                  <div key={i}>{l}</div>
                ))}
              </div>
            ) : null}
          </div>

          {/* FOOTER */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
            <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                Campos como <strong>amparo legal</strong> e{" "}
                <strong>fundamentação</strong> são opcionais e podem ser
                completados após a importação.
              </span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant="ghost"
                onClick={closeAll}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={submitImport}
                disabled={!parsed || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importando...
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
