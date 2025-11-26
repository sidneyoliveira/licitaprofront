// src/components/ProcessHeader.jsx
import React, { useMemo } from "react";
import { Pencil, Download } from "lucide-react";
import {
  MODALIDADES,
  FUNDAMENTACOES,
  CLASSIFICACOES,
  SITUACOES,
  ORGANIZACOES,
  MODO_DISPUTA,
  CRITERIO_JULGAMENTO,
  AMPARO_LEGAL,
  getAmparoOptions,
  fromCode,
  toCode,
  
} from "../utils/constantes";

/* ────────────────────────────────────────────────────────────────────────── */
/* Utils                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */
const Ellipsize = ({ lines = 1, title, as: Tag = "span", className = "", children }) => {
  const style =
    lines === 1
      ? { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }
      : { display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: String(lines), overflow: "hidden" };
  return (
    <Tag
      className={className}
      style={style}
      title={typeof title === "string" ? title : typeof children === "string" ? children : undefined}
    >
      {children}
    </Tag>
  );
};

const modalidadeMap = {
  "Pregão Eletrônico": { sigla: "PE" },
  "Concorrência Eletrônica": { sigla: "CE" },
  "Dispensa Eletrônica": { sigla: "DE" },
  "Adesão a Registro de Preços": { sigla: "ARP" },
  "Credenciamento": { sigla: "CR" },
  "Inexigibilidade Eletrônica": { sigla: "IE" },
};


const formatDateExact = (iso, { showTime = true } = {}) => {

  if (!iso || typeof iso !== "string") return null;


  const cleaned = iso.replace(/Z$/i, "").replace(/([+-]\d{2}:?\d{2})$/i, "");
  const norm = cleaned.replace("T", " ").trim();


  const m = norm.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!m) return null;

  const [, yyyy, mm, dd, HH, MM] = m;
  const dateBR = `${dd}/${mm}/${yyyy}`;
  if (!showTime || !HH || !MM) return dateBR;
  return `${dateBR}, ${HH}:${MM}`;
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const getSituacaoStyle = (situacao) => {
  const base = "px-3 py-1 rounded-md text-xs font-medium uppercase tracking-wider";
  switch (situacao) {
    case "Aberto":
    case "Publicado":
      return `${base} bg-accent-blue/10 text-accent-blue dark:bg-accent-blue/20`;
    case "Em Pesquisa":
    case "Aguardando Publicação":
    case "Em Contratação":
      return `${base} bg-accent-yellow/10 text-accent-yellow dark:bg-accent-yellow/20`;
    case "Adjudicado/Homologado":
      return `${base} bg-accent-green/10 text-accent-green dark:bg-accent-green/20`;
    case "Revogado/Cancelado":
      return `${base} bg-accent-red/10 text-accent-red dark:bg-accent-red/20`;
    default:
      return `${base} bg-slate-200 text-slate-700 dark:bg-dark-bg-secondary dark:text-dark-text-secondary`;
  }
};

// Resolve label a partir de value/label/code vindos do backend
const resolveLabel = (options, codeOrLabel, fallbackLabel) => {
  // Tenta por 'label' que já veio:
  const byLabel = fromCode(options, fallbackLabel);
  if (byLabel) return byLabel.label;

  // Tenta pelo code/value:
  const byCode = fromCode(options, codeOrLabel);
  if (byCode) return byCode.label;

  // Fallback: o que veio do backend (ex.: já em português)
  return fallbackLabel || "";
};

// Achata o AMPARO_LEGAL para procurar por code numérico (ex.: 301)
const flattenAmparo = () => {
  const flat = [];
  Object.values(AMPARO_LEGAL).forEach((val) => {
    if (Array.isArray(val)) {
      flat.push(...val);
    } else if (val && typeof val === "object") {
      Object.values(val).forEach((arr) => {
        if (Array.isArray(arr)) flat.push(...arr);
      });
    }
  });
  return flat;
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Subcomponentes                                                            */
/* ────────────────────────────────────────────────────────────────────────── */
const InfoPill = React.memo(({ label, value }) => (
  <div className="flex flex-col" style={{ minWidth: 0 }}>
    <span className="text-xs font-medium text-slate-500 dark:text-dark-text-secondary uppercase tracking-wide">
      {label}
    </span>
    <Ellipsize
      lines={1}
      className="text-[13px] font-medium text-slate-800 dark:text-dark-text-primary"
      title={value}
    >
      {value || "–"}
    </Ellipsize>
  </div>
));

const SituacaoBadge = React.memo(({ situacao }) => {
  if (!situacao) return null;
  return (
    <div className="flex flex-col" style={{ minWidth: 0 }}>
      <span className="text-[13px] font-medium text-slate-500 dark:text-dark-text-secondary uppercase tracking-wide">
        Situação
      </span>
      <Ellipsize lines={1} className={`${getSituacaoStyle(situacao)} mt-1`} title={situacao}>
        {situacao}
      </Ellipsize>
    </div>
  );
});export default function ProcessHeader({
  formData = {},
  entidadeNome,
  orgaoNome,
  onEdit,
  onExportCSV,
}) {
  const entidadeNomeFinal =
    entidadeNome ||
    formData?.entidade_nome ||
    formData?.entidade_obj?.nome ||
    "";

  const orgaoNomeFinal =
    orgaoNome ||
    formData?.orgao_nome ||
    formData?.orgao_obj?.nome ||
    "";

  // Modalidade (usa code ou texto e resolve label oficial)
  const modalidadeLabel = useMemo(
    () =>
      resolveLabel(
        MODALIDADES,
        formData?.modalidade_code || formData?.modalidade,
        formData?.modalidade
      ),
    [formData?.modalidade_code, formData?.modalidade]
  );

  // Classificação
  const classificacaoLabel = useMemo(
    () =>
      resolveLabel(
        CLASSIFICACOES,
        formData?.classificacao_code || formData?.classificacao,
        formData?.classificacao
      ),
    [formData?.classificacao_code, formData?.classificacao]
  );

  // Situação
  const situacaoLabel = useMemo(
    () =>
      resolveLabel(
        SITUACOES,
        formData?.situacao_code || formData?.situacao,
        formData?.situacao
      ),
    [formData?.situacao_code, formData?.situacao]
  );

  // Tipo de organização (Item / Lote)
  const organizacaoLabel = useMemo(
    () =>
      resolveLabel(
        ORGANIZACOES,
        formData?.tipo_organizacao_code || formData?.tipo_organizacao,
        formData?.tipo_organizacao
      ),
    [formData?.tipo_organizacao_code, formData?.tipo_organizacao]
  );

  // Modo de disputa (abreto / fechado / aberto_e_fechado)
  const modoDisputaLabel = useMemo(
    () =>
      resolveLabel(
        MODO_DISPUTA,
        formData?.modo_disputa_id || formData?.modo_disputa,
        formData?.modo_disputa
      ),
    [formData?.modo_disputa_id, formData?.modo_disputa]
  );

  // Critério de julgamento (menor_preco / maior_desconto)
  const criterioJulgamentoLabel = useMemo(
    () =>
      resolveLabel(
        CRITERIO_JULGAMENTO,
        formData?.criterio_julgamento_id || formData?.criterio_julgamento,
        formData?.criterio_julgamento
      ),
    [formData?.criterio_julgamento_id, formData?.criterio_julgamento]
  );

  // Fundamentação (lei_14133 / lei_8666 / lei_10520)
  const fundamentacaoLabel = useMemo(() => {
    const value = toCode(FUNDAMENTACOES, formData?.fundamentacao);
    const found = fromCode(FUNDAMENTACOES, value);
    return found?.label || formData?.fundamentacao || "";
  }, [formData?.fundamentacao]);

  // Amparo legal – compatível com Excel + backend
  const amparoLegalLabel = useMemo(() => {
    // 1) normaliza fundamentação e modalidade para o value interno
    const fundVal = toCode(FUNDAMENTACOES, formData?.fundamentacao);
    const modVal = toCode(
      MODALIDADES,
      formData?.modalidade_code || formData?.modalidade
    );

    if (fundVal && modVal) {
      // 2) pega as opções de amparo válidas pra (lei + modalidade)
      const opts = getAmparoOptions(fundVal, modVal);
      if (opts && opts.length) {
        // 3) tenta normalizar o que veio do backend (value, label ou id)
        const amparoValue = toCode(
          opts,
          formData?.amparo_legal || formData?.amparo_legal_id
        );
        if (amparoValue) {
          const found = fromCode(opts, amparoValue);
          if (found) return found.label;
        }
      }
    }

    // 4) Fallback: procura no AMPARO_LEGAL “achado”
    const flat = flattenAmparo();

    // por id numérico
    const fromId = fromCode(flat, formData?.amparo_legal_id);
    if (fromId) return fromId.label;

    // por value/label texto
    const fromVal = fromCode(flat, formData?.amparo_legal);
    if (fromVal) return fromVal.label;

    // último recurso: o texto bruto
    return formData?.amparo_legal || "";
  }, [
    formData?.fundamentacao,
    formData?.modalidade_code,
    formData?.modalidade,
    formData?.amparo_legal,
    formData?.amparo_legal_id,
  ]);

  const registroPrecos =
    formData?.registro_precos ?? formData?.registro_preco ?? false;

  const { siglaModalidade, numeroCertame, anoCertame } = useMemo(() => {
    const [num, ano] = formData?.numero_certame?.split("/") || [];
    return {
      numeroCertame: num,
      anoCertame: ano || new Date().getFullYear(),
      siglaModalidade: modalidadeMap[modalidadeLabel]?.sigla || "",
    };
  }, [formData?.numero_certame, modalidadeLabel]);

  const cadastroFormatado = useMemo(
    () => formatDateExact(formData?.data_processo, { showTime: false }),
    [formData?.data_processo]
  );

  const aberturaFormatada = useMemo(
    () => formatDateExact(formData?.data_abertura, { showTime: true }),
    [formData?.data_abertura]
  );

  const valorPrevisto = useMemo(
    () => formatCurrency(formData?.valor_referencia),
    [formData?.valor_referencia]
  );

  const handleExport = () => {
    if (!onExportCSV) return;
    onExportCSV({
      ...formData,
      entidade_nome: entidadeNomeFinal,
      orgao_nome: orgaoNomeFinal,
      cadastroFormatado,
      aberturaFormatada,
      valorPrevisto,
      modalidade_label: modalidadeLabel,
      classificacao_label: classificacaoLabel,
      situacao_label: situacaoLabel,
      tipo_organizacao_label: organizacaoLabel,
      modo_disputa_label: modoDisputaLabel,
      criterio_julgamento_label: criterioJulgamentoLabel,
      fundamentacao_label: fundamentacaoLabel,
      amparo_legal_label: amparoLegalLabel,
    });
  };

  return (
    <div className="flex flex-col bg-white dark:bg-dark-bg-primary rounded-md border border-slate-200 dark:border-dark-border shadow-sm overflow-hidden">
      {/* Barra superior */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-3 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg-secondary">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:flex-1" style={{ minWidth: 0 }}>
          {entidadeNomeFinal && (
            <Ellipsize
              lines={1}
              as="span"
              className="block px-3 py-1 text-sm font-semibold bg-accent-blue text-white rounded-md"
              title={entidadeNomeFinal}
            >
              {entidadeNomeFinal}
            </Ellipsize>
          )}
          {orgaoNomeFinal && (
            <Ellipsize
              lines={1}
              as="span"
              className="block px-3 py-1 text-sm font-medium bg-slate-200 text-slate-700 dark:bg-dark-bg-secondary dark:text-dark-text-primary rounded-md"
              title={orgaoNomeFinal}
            >
              {orgaoNomeFinal}
            </Ellipsize>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-accent-blue text-white hover:bg-accent-blue/90 transition-colors"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
            <span>Editar</span>
          </button>
          {onExportCSV && (
            <button
              type="button"
              onClick={handleExport}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-dark-text-secondary dark:hover:bg-dark-bg-secondary dark:hover:text-dark-text-primary transition-colors"
              title="Exportar cabeçalho (CSV)"
            >
              <Download className="w-5 h-5" />
              <span className="sr-only">Exportar CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Corpo */}
      <div className="px-6 py-3 space-y-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2" style={{ minWidth: 0 }}>
          <Ellipsize
            lines={1}
            as="h3"
            className="text-xl font-bold text-slate-900 dark:text-dark-text-primary"
            title={modalidadeLabel}
          >
            {modalidadeLabel || "Modalidade não informada"}
          </Ellipsize>

          {(numeroCertame || formData?.numero_processo) && (
            <span className="text-sm font-bold px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 dark:bg-dark-bg-secondary dark:text-dark-text-primary">
              {numeroCertame
                ? `${numeroCertame}/${anoCertame}${siglaModalidade ? `-${siglaModalidade}` : ""}`
                : formData?.numero_processo}
            </span>
          )}
        </div>

        <Ellipsize
          lines={2}
          as="p"
          className="text-[15px] leading-relaxed text-slate-600 dark:text-dark-text-secondary"
          title={formData?.objeto}
        >
          {formData?.objeto || "Nenhum objeto informado para este processo."}
        </Ellipsize>

        {/* Dados Gerais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-x-2 gap-y-2 pt-4 border-t border-slate-200 dark:border-dark-border">
          <InfoPill label="Fundamentação" value={fundamentacaoLabel} />
          <InfoPill label="Amparo Legal" value={amparoLegalLabel} />
          <InfoPill label="Classificação" value={classificacaoLabel} />
          <InfoPill label="Modo de Disputa" value={modoDisputaLabel} />
          <InfoPill label="Julgamento" value={criterioJulgamentoLabel} />
          <InfoPill label="Organização" value={organizacaoLabel} />
          <InfoPill label="Cadastro" value={cadastroFormatado} />
          <InfoPill label="Certame" value={aberturaFormatada} />
          <InfoPill label="Reg. de Preços" value={registroPrecos ? "Sim" : "Não"} />
          <InfoPill label="Estimado" value={valorPrevisto || "Não informado"} />
          <InfoPill label="Vigência" value={formData?.vigencia_meses ? `${formData.vigencia_meses} meses` : ""} />
          <SituacaoBadge situacao={situacaoLabel} />
        </div>
      </div>
    </div>
  );
}
