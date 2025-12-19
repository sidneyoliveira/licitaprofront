import React, { useMemo, useState } from "react";
import {
  Pencil,
  Download,
  FileText,
  Calendar,
  Wallet,
  Scale,
  Gavel,
  Tag,
  Clock,
  ClipboardList,
  Layers,
  AlertCircle,
  Globe,
  UploadCloud
} from "lucide-react";
import {
  MODALIDADES,
  CLASSIFICACOES,
  SITUACOES,
  ORGANIZACOES,
  MODO_DISPUTA,
  CRITERIO_JULGAMENTO,
  AMPARO_LEGAL,
  fromCode,
  toCode,
} from "../utils/constantes";

// Importa o Modal PNCP (Certifique-se de que o caminho está correto)
import ModalEnvioPNCP from './ModalEnvioPNCP'; 

/* ────────────────────────────────────────────────────────────────────────── */
/* 1. UTILS & HELPERS                                                        */
/* ────────────────────────────────────────────────────────────────────────── */

const modalidadeSiglaMap = {
  pregao_eletronico: "PE",
  pregao_presencial: "PP",
  concorrencia_eletronica: "CE",
  concorrencia_presencial: "CP",
  dispensa_licitacao: "DE",
  inexigibilidade: "IN",
  adesao_registro_precos: "ARP",
  credenciamento: "CR",
  leilao_eletronico: "LE",
  leilao_presencial: "LP",
  dialogo_competitivo: "DC",
};

/**
 * Trunca texto longo para caber em 1 ou mais linhas com '...'
 */
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

const formatDateExact = (iso, { showTime = true } = {}) => {
  if (!iso || typeof iso !== "string") return null;
  
  // Limpeza robusta da string ISO
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

/**
 * Define a cor do badge de situação baseada no texto
 */
const getSituacaoStyle = (situacao) => {
  const base = "px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border transition-colors";
  const s = String(situacao).toLowerCase();
  
  if (s.includes('publicado') || s.includes('aberto')) 
      return `${base} bg-emerald-50 text-emerald-700 border-emerald-200`;
  
  if (s.includes('pesquisa') || s.includes('aguardando') || s.includes('contratacao') || s.includes('andamento')) 
      return `${base} bg-blue-50 text-blue-700 border-blue-200`;
  
  if (s.includes('homologado') || s.includes('adjudicado'))
      return `${base} bg-indigo-50 text-indigo-700 border-indigo-200`;

  if (s.includes('cancelado') || s.includes('revogado') || s.includes('fracassado') || s.includes('deserto')) 
      return `${base} bg-rose-50 text-rose-700 border-rose-200`;
    
  return `${base} bg-slate-100 text-slate-600 border-slate-200`;
};

/**
 * Busca o Label humanizado a partir de um ID ou Código
 */
const resolveLabel = (options, codeOrLabel, fallbackLabel) => {
  const found = fromCode(options, codeOrLabel);
  if (found) return found.label;
  
  // Se já for uma string legível, retorna ela mesma
  if (fallbackLabel && typeof fallbackLabel === 'string' && fallbackLabel.length > 2) {
      return fallbackLabel;
  }
  return fallbackLabel || codeOrLabel || "Não informado";
};

/* ────────────────────────────────────────────────────────────────────────── */
/* 2. SUBCOMPONENTES VISUAIS                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

const InfoItem = ({ icon: Icon, label, value, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1.5">
      {Icon && <Icon size={14} className="text-slate-400" />}
      {label}
    </span>
    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-snug break-words">
      {value || <span className="text-slate-400 font-normal italic">Não informado</span>}
    </div>
  </div>
);

const SituacaoBadge = React.memo(({ situacao }) => {
  if (!situacao) return null;
  return (
    <div className="flex items-center">
      <span className={getSituacaoStyle(situacao)}>
        {situacao}
      </span>
    </div>
  );
});

/* ────────────────────────────────────────────────────────────────────────── */
/* 3. COMPONENTE PRINCIPAL                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

export default function ProcessHeader({
  formData = {},
  processoId, // Recebe o ID do processo
  entidadeNome,
  orgaoNome,
  onEdit,
  onExportCSV,
  onImport,
  onSuccess // Callback opcional para recarregar dados após sucesso no PNCP
}) {
  // Estado local para controlar o Modal PNCP
  const [isPncpModalOpen, setIsPncpModalOpen] = useState(false);

  // --- PREPARAÇÃO DE DADOS ---
  
  const entidadeNomeFinal = entidadeNome || formData?.entidade_nome || formData?.entidade_obj?.nome || "";
  const orgaoNomeFinal = orgaoNome || formData?.orgao_nome || formData?.orgao_obj?.nome || "";

  // Resolução de Labels (Backend ID -> Texto Legível)
  const labels = useMemo(() => ({
    id: formData?.id,
    modalidade: resolveLabel(MODALIDADES, formData?.modalidade),
    classificacao: resolveLabel(CLASSIFICACOES, formData?.classificacao),
    situacao: resolveLabel(SITUACOES, formData?.situacao),
    organizacao: resolveLabel(ORGANIZACOES, formData?.tipo_organizacao),
    modoDisputa: resolveLabel(MODO_DISPUTA, formData?.modo_disputa),
    criterio: resolveLabel(CRITERIO_JULGAMENTO, formData?.criterio_julgamento),
    amparo: resolveLabel(AMPARO_LEGAL, formData?.amparo_legal),
  }), [formData]);

  // Formatação de Datas e Valores
  const formatted = useMemo(() => ({
    cadastro: formatDateExact(formData?.data_processo, { showTime: false }),
    abertura: formatDateExact(formData?.data_abertura, { showTime: true }),
    valor: formatCurrency(formData?.valor_referencia),
    srp: (formData?.registro_precos ?? formData?.registro_preco) ? "Sim" : "Não",
    vigencia: formData?.vigencia_meses ? `${formData.vigencia_meses} meses` : null
  }), [formData]);

  // Construção do Título (Certame vs Processo)
  const { numeroCertame, anoCertame, siglaModalidade } = useMemo(() => {
    const modalidadeValue = toCode(MODALIDADES, formData?.modalidade);
    const sigla = modalidadeSiglaMap[modalidadeValue] || "";
    const [num, ano] = formData?.numero_certame ? String(formData.numero_certame).split("/") : [];
    
    return {
      numeroCertame: num,
      anoCertame: ano || new Date().getFullYear(),
      siglaModalidade: sigla,
    };
  }, [formData?.numero_certame, formData?.modalidade]);

  // Handler de Exportação
  const handleExport = () => {
    if (!onExportCSV) return;
    onExportCSV({
      ...formData,
      entidade_nome: entidadeNomeFinal,
      orgao_nome: orgaoNomeFinal,
      cadastroFormatado: formatted.cadastro,
      aberturaFormatada: formatted.abertura,
      valorPrevisto: formatted.valor,
      modalidade_label: labels.modalidade,
      classificacao_label: labels.classificacao,
      situacao_label: labels.situacao,
      tipo_organizacao_label: labels.organizacao,
      modo_disputa_label: labels.modoDisputa,
      criterio_julgamento_label: labels.criterio,
      amparo_legal_label: labels.amparo,
    });
  };

  return (
    <>
        {/* Renderização do Modal PNCP Interno */}
        {isPncpModalOpen && (
            <ModalEnvioPNCP
                processo={{ ...formData, id: processoId || formData.id }}
                onClose={() => setIsPncpModalOpen(false)}
                onSuccess={() => {
                    if (onSuccess) onSuccess();
                }}
            />
        )}

        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 overflow-hidden transition-all hover:shadow-md">
        
        {/* --- CABEÇALHO (TOPO) --- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-800/40">
            
            {/* Identificação da Entidade */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:flex-1 min-w-0">
            {entidadeNomeFinal && (
                <Ellipsize
                as="span"
                className="inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#004aad] text-white rounded-md shadow-sm"
                title={entidadeNomeFinal}
                >
                {entidadeNomeFinal}
                </Ellipsize>
            )}
            {orgaoNomeFinal && (
                <Ellipsize
                as="span"
                className="inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white border border-slate-300 text-slate-600 rounded-md"
                title={orgaoNomeFinal}
                >
                {orgaoNomeFinal}
                </Ellipsize>
            )}
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center gap-2">
            {/* Botão Importar (Opcional) */}
            {onImport && (
                <button
                    onClick={onImport}
                    className="p-2 text-slate-500 hover:text-[#004aad] hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                    title="Importar Planilha"
                >
                    <UploadCloud size={18} />
                </button>
            )}
            
            {/* Botão PNCP (Interno) */}
            <button
                onClick={() => setIsPncpModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#004aad] text-white rounded-lg text-sm font-bold hover:bg-[#003d91] transition-all shadow-sm shadow-blue-900/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Publicar no PNCP"
            >
                <Globe size={16} />
                <span>PNCP</span>
            </button>

            
            {/* Editar */}
            <button
                type="button"
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
                <Pencil size={16} />
                <span>Editar</span>
            </button>
            </div>
        </div>

        {/* --- CORPO (DETALHES) --- */}
        <div className="px-6 py-5 space-y-6">
            
            {/* Título Principal e Objeto */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                <SituacaoBadge situacao={labels.situacao} />
                
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex flex-wrap items-center gap-2">
                    {labels.modalidade}
                    {(numeroCertame || formData?.numero_processo) && (
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600 ml-1">
                        {numeroCertame
                        ? `Nº ${numeroCertame}/${anoCertame}${siglaModalidade ? `-${siglaModalidade}` : ""}`
                        : `Proc. ${formData?.numero_processo}`}
                    </span>
                    )}
                </h1>
                </div>

                {/* Objeto */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                        <FileText size={14} /> Objeto do Processo
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {formData?.objeto || "Objeto não informado."}
                    </p>
                </div>
            </div>

            {/* LINHA 1: Dados Legais e Administrativos */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 pt-2 border-b border-slate-100 dark:border-slate-700/50 pb-5">
            <InfoItem icon={Scale} label="Amparo Legal" value={labels.amparo} className="col-span-2 lg:col-span-1" />
            <InfoItem icon={Tag} label="Classificação" value={labels.classificacao} />
            <InfoItem icon={Layers} label="Organização" value={labels.organizacao} />
            <InfoItem icon={Clock} label="Vigência" value={formatted.vigencia} />
            <InfoItem icon={ClipboardList} label="Data Cadastro" value={formatted.cadastro} />
            </div>

            {/* LINHA 2: Dados do Certame (Valores e Disputa) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 pt-2">
            <InfoItem icon={Gavel} label="Modo de Disputa" value={labels.modoDisputa} />
            <InfoItem icon={Scale} label="Julgamento" value={labels.criterio} />
            <InfoItem icon={Calendar} label="Abertura da Sessão" value={formatted.abertura} />
            
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                <Wallet size={14} /> Valor Estimado
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatted.valor || "R$ 0,00"}
                </span>
            </div>

            <InfoItem icon={AlertCircle} label="Registro de Preço" value={formatted.srp} />
            </div>

        </div>
        </div>
    </>
  );
}