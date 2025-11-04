// src/components/ProcessHeader.jsx
import React, { useMemo } from "react";
import { Pencil, Download } from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────── */
/* Util: truncar texto (igual ao ProcessoCard)                               */
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

/* ────────────────────────────────────────────────────────────────────────── */
/* Mapa modalidade -> sigla (mesmo do ProcessoCard)                           */
/* ────────────────────────────────────────────────────────────────────────── */
const modalidadeMap = {
  "Pregão Eletrônico": { sigla: "PE" },
  "Concorrência Eletrônica": { sigla: "CE" },
  "Dispensa Eletrônica": { sigla: "DE" },
  "Adesão a Registro de Preços": { sigla: "ARP" },
  "Credenciamento": { sigla: "CR" },
  "Inexigibilidade Eletrônica": { sigla: "IE" },
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Helpers de formatação (SEM usar new Date — preserva exatamente a string)  */
/* ────────────────────────────────────────────────────────────────────────── */
// Aceita "YYYY-MM-DD", "YYYY-MM-DDTHH:MM[:SS]Z", "YYYY-MM-DD HH:MM[:SS]±hh:mm"
const formatDateExact = (iso, { showTime = true } = {}) => {
  if (!iso || typeof iso !== "string") return null;

  // remove timezone no fim (Z, +03:00, -0300 etc.)
  const cleaned = iso.replace(/Z$/i, "").replace(/([+-]\d{2}:?\d{2})$/i, "");
  const norm = cleaned.replace("T", " ").trim();

  // YYYY-MM-DD [HH:MM[:SS]]
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
  const base = "px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider";
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

const InfoPill = React.memo(({ label, value }) => (
  <div className="flex flex-col" style={{ minWidth: 0 }}>
    <span className="text-[13px] font-bold text-slate-500 dark:text-dark-text-secondary uppercase tracking-wide">
      {label}
    </span>
    <Ellipsize
      lines={1}
      className="text-[15px] font-semibold text-slate-800 dark:text-dark-text-primary"
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
      <span className="text-[13px] font-bold text-slate-500 dark:text-dark-text-secondary uppercase tracking-wide">
        Situação
      </span>
      <Ellipsize lines={1} className={`${getSituacaoStyle(situacao)} mt-1`} title={situacao}>
        {situacao}
      </Ellipsize>
    </div>
  );
});

/* ────────────────────────────────────────────────────────────────────────── */
/* Componente                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */
export default function ProcessHeader({
  formData = {},
  entidadeNome,
  orgaoNome,
  onEdit,        // abre edição de dados gerais
  onExportCSV,   // opcional
}) {
  const { siglaModalidade, numeroCertame, anoCertame } = useMemo(() => {
    const [num, ano] = formData?.numero_certame?.split("/") || [];
    return {
      numeroCertame: num,
      anoCertame: ano || new Date().getFullYear(),
      siglaModalidade: modalidadeMap[formData?.modalidade]?.sigla || "",
    };
  }, [formData?.numero_certame, formData?.modalidade]);

  // *** Datas exibidas exatamente como vieram do backend ***
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
      entidade_nome: entidadeNome,
      orgao_nome: orgaoNome,
      cadastroFormatado,
      aberturaFormatada,
      valorPrevisto,
    });
  };

  return (
    <div className="flex flex-col bg-white dark:bg-dark-bg-primary rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm overflow-hidden">
      {/* Barra superior (estilo ProcessoCard) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-3 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg-secondary">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:flex-1" style={{ minWidth: 0 }}>
          {entidadeNome && (
            <Ellipsize
              lines={1}
              as="span"
              className="block px-3 py-1 text-sm font-semibold bg-accent-blue text-white rounded-md"
              title={entidadeNome}
            >
              {entidadeNome}
            </Ellipsize>
          )}
          {orgaoNome && (
            <Ellipsize
              lines={1}
              as="span"
              className="block px-3 py-1 text-sm font-medium bg-slate-200 text-slate-700 dark:bg-dark-bg-secondary dark:text-dark-text-primary rounded-md"
              title={orgaoNome}
            >
              {orgaoNome}
            </Ellipsize>
          )}
        </div>

        {/* Ações */}
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
            title={formData?.modalidade}
          >
            {formData?.modalidade || "Modalidade não informada"}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-5 pt-4 border-t border-slate-200 dark:border-dark-border">
          <InfoPill label="Data de Cadastro" value={cadastroFormatado} />
          <InfoPill label="Data do Certame" value={aberturaFormatada} />
          <InfoPill label="Registro de Preços" value={formData?.registro_precos ? "Sim" : "Não"} />
          <InfoPill label="Valor de Referência" value={valorPrevisto || "Não informado"} />
          <SituacaoBadge situacao={formData?.situacao} />
        </div>
      </div>
    </div>
  );
}
