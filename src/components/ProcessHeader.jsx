import React, { useMemo, useState } from "react";
import {
  Pencil,
  FileText,
  Calendar,
  Wallet,
  Scale,
  Gavel,
  Tag,
  Clock,
  ClipboardList,
  AlertCircle,
  Globe,
  UploadCloud,
  CalendarCheck,
  CalendarClock,
  BookOpenCheck,
  Megaphone,
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

const InfoItem = ({ icon: Icon, label, value, iconColor = "text-slate-600", valueColor = "", className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <span className="text-sm uppercase tracking-wider font-bold text-slate-600 dark:text-slate-500 mb-1 flex items-center gap-1.5">
      {Icon && <Icon size={16} className={iconColor} />}
      {label}
    </span>
    <div className={`text-sm font-semibold leading-snug break-words ${valueColor || "text-slate-700 dark:text-slate-200"}`}>
      {value || <span className="text-slate-600 font-normal italic">Não informado</span>}
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
                className="inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-wider bg-accent-blue text-white rounded-md shadow-sm"
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
                    className="p-2 text-slate-500 hover:text-accent-blue hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                    title="Importar Planilha"
                >
                    <UploadCloud size={18} />
                </button>
            )}
            
            {/* Botão PNCP (Interno) */}
            <button
                onClick={() => setIsPncpModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg text-sm font-bold hover:bg-accent-blue-hover transition-all shadow-sm shadow-blue-900/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
                
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex flex-wrap items-center gap-2">
                    PROCESSO ADMINISTRATIVO – Nº {formData?.numero_processo || "—"}
                </h1>

                <SituacaoBadge situacao={labels.situacao} />
                </div>

                {/* Objeto + Certame + Amparo + SRP */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-x-8 gap-y-3 items-start">
                    <InfoItem
                      icon={FileText}
                      iconColor="text-blue-500"
                      label="Objeto"
                      value={
                        <p className="text-sm text-slate-800 dark:text-slate-300 leading-relaxed font-medium">
                          {formData?.objeto || "Objeto não informado."}
                        </p>
                      }
                    />
                    <InfoItem
                      icon={Scale}
                      iconColor="text-indigo-500"
                      label="Amparo Legal"
                      value={labels.amparo}
                    />
                    <div>
                      <span className="text-sm uppercase tracking-wider font-bold text-slate-600 dark:text-slate-500 mb-1 flex items-center gap-1.5">
                        <Megaphone size={16} className="text-amber-500" /> Certame
                      </span>
                      <span className="inline-block mt-1 px-3 py-1 text-sm font-bold rounded-md border border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700">
                        {labels.modalidade}
                        {numeroCertame
                          ? ` – ${numeroCertame}/${anoCertame}${siglaModalidade ? `-${siglaModalidade}` : ""}`
                          : formData?.numero_processo
                            ? ` – ${formData.numero_processo}`
                            : ""}
                      </span>
                    </div>
                    <InfoItem
                      icon={AlertCircle}
                      iconColor="text-purple-500"
                      label="Registro de Preço"
                      value={formatted.srp}
                      valueColor="text-slate-700 dark:text-slate-200"
                    />
                </div>
            </div>

            {/* LINHA 1: Datas (todas com ícones vermelhos/rosa) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 pt-2 border-t border-slate-100 dark:border-slate-700/50 pb-2">
              <InfoItem icon={Calendar}       iconColor="text-rose-500"    label="Data do processo"        value={formatted.cadastro} valueColor="text-slate-800 dark:text-slate-100 font-bold" />
              <InfoItem icon={CalendarCheck}   iconColor="text-rose-500"    label="Data da abertura"        value={formatted.abertura} valueColor="text-slate-800 dark:text-slate-100 font-bold" />
              <InfoItem icon={Wallet}          iconColor="text-emerald-500" label="Valor estimado"          value={formatted.valor || "R$ 0,00"} valueColor="text-emerald-600 dark:text-emerald-400 font-bold" />
              <InfoItem icon={Clock}           iconColor="text-orange-500"  label="Vigência"                value={formatted.vigencia} valueColor="text-slate-800 dark:text-slate-100 font-bold" />
              <InfoItem icon={ClipboardList}   iconColor="text-violet-500"  label="Organização"             value={labels.organizacao} />
              <InfoItem icon={Tag}             iconColor="text-cyan-500"    label="Classificação"           value={labels.classificacao} />
            </div>

            {/* LINHA 2: Detalhes do Certame (ícones coloridos variados) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-2 border-t border-slate-100 dark:border-slate-700/50">
              <InfoItem icon={Gavel}           iconColor="text-blue-500"    label="Modo de Disputa"         value={labels.modoDisputa}  valueColor="text-slate-800 dark:text-slate-100 font-bold" />
              <InfoItem icon={Scale}           iconColor="text-teal-500"    label="Critério de Julgamento"  value={labels.criterio}     valueColor="text-slate-800 dark:text-slate-100 font-bold" />
              <InfoItem icon={CalendarClock}   iconColor="text-indigo-500"  label="Abertura da Sessão"      value={formatted.abertura}  valueColor="text-slate-800 dark:text-slate-100 font-bold" />
              <InfoItem icon={BookOpenCheck}   iconColor="text-green-500"   label="Situação atual"          value={labels.situacao}     valueColor="text-slate-800 dark:text-slate-100 font-bold" />
            </div>

        </div>
        </div>
    </>
  );
}