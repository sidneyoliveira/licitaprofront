// src/components/ProcessoCard.jsx

import React, { useMemo, useCallback } from 'react';
import { Download, Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  MODALIDADES,
  SITUACOES,
  fromCode,
  toCode
} from "../utils/constantes";

// --- Utils ---

// Mapa de Siglas padronizado com o Backend
const modalidadeSiglaMap = {
  pregao_eletronico: "PE",
  pregao_presencial: "PP",
  concorrencia_eletronica: "CE",
  concorrencia_presencial: "CP",
  dispensa_eletronica: "DE",
  dispensa_licitacao: "DL",
  inexigibilidade: "IN",
  adesao_registro_precos: "ARP",
  credenciamento: "CR",
  leilao_eletronico: "LE",
  leilao_presencial: "LP",
  dialogo_competitivo: "DC",
};

const Ellipsize = ({ lines = 1, title, as: Tag = 'span', className = '', children }) => {
  const style =
    lines === 1
      ? { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
      : { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: String(lines), overflow: 'hidden' };
  return (
    <Tag
      className={className}
      style={style}
      title={typeof title === 'string' ? title : typeof children === 'string' ? children : undefined}
    >
      {children}
    </Tag>
  );
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
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return null;
  return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const getSituacaoStyle = (situacao) => {
  const base = "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider";
  const normalized = String(situacao || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  if (normalized.includes('aberto') || normalized.includes('publicado'))
    return `${base} bg-accent-blue/10 text-accent-blue dark:bg-accent-blue/20 dark:text-accent-blue`;
  if (normalized.includes('pesquisa') || normalized.includes('aguardando') || normalized.includes('contratacao'))
    return `${base} bg-accent-yellow/10 text-accent-yellow dark:bg-accent-yellow/20 dark:text-accent-yellow`;
  if (normalized.includes('homologado') || normalized.includes('adjudicado'))
    return `${base} bg-accent-green/10 text-accent-green dark:bg-accent-green/20 dark:text-accent-green`;
  if (normalized.includes('cancelado') || normalized.includes('revogado') || normalized.includes('fracassado') || normalized.includes('deserto'))
    return `${base} bg-accent-red/10 text-accent-red dark:bg-accent-red/20 dark:text-accent-red`;
    
  return `${base} bg-slate-200 text-slate-700 dark:bg-dark-bg-secondary dark:text-dark-text-secondary`;
};

// Resolve label a partir de value/label/code
const resolveLabel = (options, codeOrLabel, fallbackLabel) => {
  const found = fromCode(options, codeOrLabel);
  if (found) return found.label;
  if (fallbackLabel && typeof fallbackLabel === 'string' && fallbackLabel.length > 2) {
      return fallbackLabel;
  }
  return fallbackLabel || "";
};

// --- Subcomponentes ---

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
      {value || '–'}
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

const IconButton = React.memo(({ icon: Icon, label, onClick, variant = 'default' }) => {
  const styles = {
    default:
      'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-dark-text-secondary dark:hover:bg-dark-bg-secondary dark:hover:text-dark-text-primary',
    destructive: 'text-red-500 hover:bg-red-100 dark:text-accent-red dark:hover:bg-accent-red/20',
  };
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.(e);
      }}
      onAuxClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      title={label}
      className={`p-2 rounded-xl transition-colors ${styles[variant]}`}
    >
      <Icon className="w-5 h-5" />
      <span className="sr-only">{label}</span>
    </button>
  );
});

// --- Componente Principal ---
const ProcessoCard = ({ processo = {}, onEdit, onDelete, onView, onExport }) => {
  const navigate = useNavigate();

  // 1. Resolve Labels e Siglas
  const modalidadeLabel = useMemo(
    () => resolveLabel(MODALIDADES, processo?.modalidade),
    [processo?.modalidade]
  );

  const situacaoLabel = useMemo(
    () => resolveLabel(SITUACOES, processo?.situacao),
    [processo?.situacao]
  );

  const { anoCertame, numeroCertame, siglaModalidade } = useMemo(() => {
    const modalidadeValue = toCode(MODALIDADES, processo?.modalidade);
    const sigla = modalidadeSiglaMap[modalidadeValue] || "";
    
    const [num, ano] = String(processo?.numero_certame || "").split('/');
    return {
      anoCertame: ano || new Date().getFullYear(),
      numeroCertame: num,
      siglaModalidade: sigla,
    };
  }, [processo?.numero_certame, processo?.modalidade]);

  // 2. Formatação de Dados
  const aberturaFormatada = useMemo(
    () => formatDateExact(processo?.data_abertura, { showTime: true }),
    [processo?.data_abertura]
  );

  const cadastroFormatado = useMemo(
    () => formatDateExact(processo?.data_processo, { dateStyle: 'short' }),
    [processo?.data_processo]
  );

  const valorPrevisto = useMemo(
    () => formatCurrency(processo?.valor_referencia),
    [processo?.valor_referencia]
  );

  // 3. Handlers
  const handleView = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
    navigate(`/processos/${processo?.id ?? ''}`, {
      state: { processo, processoId: processo?.id ?? null },
      replace: false,
    });
  }, [navigate, processo]);

  const handleDelete = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (processo?.id != null) onDelete?.(processo.id);
  }, [onDelete, processo?.id]);

  const exportToCSV = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const headers = [
      'Número do Processo', 'Número do Certame', 'Modalidade', 'Classificação',
      'Objeto', 'Secretaria', 'Entidade', 'Órgão', 'Data de Cadastro',
      'Data do Certame', 'Registro de Preços', 'Valor de Referência', 'Situação'
    ];
    const values = [
      processo?.numero_processo || '',
      processo?.numero_certame || '',
      modalidadeLabel || '',
      processo?.classificacao || '',
      `"${(processo?.objeto || '').replace(/"/g, '""')}"`,
      processo?.secretaria || '',
      processo?.entidade_nome || '',
      processo?.orgao_nome || '',
      cadastroFormatado || '',
      aberturaFormatada || '',
      processo?.registro_precos ? 'Sim' : 'Não',
      valorPrevisto || '',
      situacaoLabel || ''
    ];

    const csvContent = '\uFEFF' + [headers.join(';'), values.join(';')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `processo_${processo?.numero_processo || 'dados'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onExport?.(processo);
  }, [processo, modalidadeLabel, situacaoLabel, cadastroFormatado, aberturaFormatada, valorPrevisto, onExport]);

  // 4. Renderização
  return (
    <div className="flex flex-col bg-white dark:bg-dark-bg-primary rounded-2xl overflow-hidden">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-4 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg-secondary">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:flex-1 md:w-20 sm:w-12" style={{ minWidth: 0 }}>
          {processo?.entidade_nome && (
            <Ellipsize
              lines={1}
              as="span"
              className="block px-3 py-1 text-sm font-semibold bg-accent-blue text-white rounded-md"
              title={processo?.entidade_nome}
            >
              {processo?.entidade_nome}
            </Ellipsize>
          )}
          {processo?.orgao_nome && (
            <Ellipsize
              lines={1}
              as="span"
              className="block px-3 py-1 text-sm font-medium bg-slate-200 text-slate-700 dark:bg-dark-bg-secondary dark:text-dark-text-primary rounded-md"
              title={processo?.orgao_nome}
            >
              {processo?.orgao_nome}
            </Ellipsize>
          )}
        </div>

        {/* Botões */}
        <div className="flex items-center gap-1 flex-wrap md:flex-nowrap md:flex-shrink-0">
          <button
            type="button"
            onClick={handleView}
            onAuxClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="inline-flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium bg-accent-blue text-white hover:bg-accent-blue/90 transition-colors"
            title="Visualizar Processo"
          >
            <Eye className="w-4 h-4" />
            <span>Visualizar</span>
          </button>
          <IconButton icon={Download} label="Exportar CSV" onClick={exportToCSV} />
          {onDelete && (
            <IconButton icon={Trash2} label="Excluir" onClick={handleDelete} variant="destructive" />
          )}
        </div>
      </div>

      {/* Corpo */}
      <div className="px-6 py-5 space-y-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2" style={{ minWidth: 0 }}>
          <Ellipsize
            lines={1}
            as="h3"
            className="text-xl font-bold text-slate-900 dark:text-dark-text-primary"
            title={modalidadeLabel}
          >
            {modalidadeLabel || 'Modalidade não informada'}
          </Ellipsize>

          {numeroCertame && (
            <span className="text-sm font-bold px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 dark:bg-dark-bg-secondary dark:text-dark-text-primary">
              {numeroCertame}/{anoCertame}
              {siglaModalidade ? `-${siglaModalidade}` : ''}
            </span>
          )}
        </div>

        <Ellipsize
          lines={2}
          as="p"
          className="text-[15px] leading-relaxed text-slate-600 dark:text-dark-text-secondary"
          title={processo?.objeto}
        >
          {processo?.objeto || 'Nenhum objeto informado para este processo.'}
        </Ellipsize>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-5 pt-4 border-t border-slate-200 dark:border-dark-border">
          <InfoPill label="Data de Cadastro" value={cadastroFormatado} />
          <InfoPill label="Data do Certame" value={aberturaFormatada} />
          <InfoPill label="Registro de Preços" value={processo?.registro_precos ? 'Sim' : 'Não'} />
          <InfoPill label="Valor de Referência" value={valorPrevisto || 'Não informado'} />
          <SituacaoBadge situacao={situacaoLabel} />
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProcessoCard);