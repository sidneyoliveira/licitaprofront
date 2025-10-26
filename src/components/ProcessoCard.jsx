// frontend/src/components/ProcessoCard.jsx

import React from 'react';
import { Building2, Download, Eye, PencilLine, Trash2, CalendarDays, Clock3 } from 'lucide-react';

const InfoPill = ({ label, value }) => (
  <div className="rounded-2xl bg-light-bg-primary/60 dark:bg-white/5 px-4 py-3">
    <p className="text-xs font-semibold uppercase tracking-wide text-light-text-secondary/70 dark:text-dark-text-secondary/70">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
      {value || '-'}
    </p>
  </div>
);

const ProcessoCard = ({ processo, onEdit, onDelete, onView, onExport }) => {
  const getSituacaoStyle = (situacao) => {
    const baseStyle = 'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold';
    switch (situacao) {
      case 'Aberto':
      case 'Publicado':
        return `${baseStyle} bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200`;
      case 'Em Pesquisa':
      case 'Aguardando Publicação':
      case 'Em Contratação':
        return `${baseStyle} bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200`;
      case 'Adjudicado/Homologado':
        return `${baseStyle} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200`;
      case 'Revogado/Cancelado':
        return `${baseStyle} bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200`;
      default:
        return `${baseStyle} bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-200`;
    }
  };

  const modalidadeMap = {
    'Pregão Eletrônico': { sigla: 'PE' },
    'Concorrência Eletrônica': { sigla: 'CE' },
    'Dispensa Eletrônica': { sigla: 'DE' },
    'Adesão a Registro de Preços': { sigla: 'ARP' },
    'Credenciamento': { sigla: 'CR' },
    'Inexigibilidade Eletrônica': { sigla: 'IE' },
  };

  const anoCertame = processo.numero_certame?.split('/')[1] || new Date().getFullYear();
  const numeroCertame = processo.numero_certame?.split('/')[0];
  const siglaModalidade = modalidadeMap[processo.modalidade]?.sigla || '';

  const formatDate = (dateValue, options) => {
    if (!dateValue) return null;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString('pt-BR', options);
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const numeric = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(numeric)) return value;
    return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const aberturaFormatada = formatDate(processo.data_abertura, { dateStyle: 'short', timeStyle: 'short' });
  const cadastroFormatado = formatDate(processo.data_processo, { dateStyle: 'short' });
  const valorPrevisto = formatCurrency(processo.valor_previsto ?? processo.valor_estimado ?? processo.valor_total);

  return (
    <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-3xl p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-accent-blue/10 text-accent-blue">
              {processo.modalidade || 'Modalidade não informada'}
            </span>
            {processo.entidade_nome && (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                <Building2 className="w-4 h-4" />
                {processo.entidade_nome}
              </span>
            )}
            {processo.situacao && (
              <span className={getSituacaoStyle(processo.situacao)}>{processo.situacao}</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
              Processo Nº {processo.numero_processo || '—'}
            </h3>
            {processo.numero_certame && (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-accent-blue text-white shadow-md">
                Nº {numeroCertame}/{anoCertame}{siglaModalidade ? `-${siglaModalidade}` : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onExport && (
            <button
              onClick={() => onExport(processo)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-accent-blue bg-accent-blue/10 hover:bg-accent-blue/20 transition-colors"
            >
              <Download className="w-4 h-4" /> Exportar
            </button>
          )}
          {onView && (
            <button
              onClick={() => onView(processo.id)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-accent-blue text-white shadow-md hover:bg-accent-blue/90 transition-colors"
            >
              <Eye className="w-4 h-4" /> Visualizar
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(processo)}
              className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-light-bg-primary/80 dark:bg-white/10 text-accent-blue hover:bg-accent-blue/10 transition-colors"
              title="Editar processo"
            >
              <PencilLine className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(processo.id)}
              className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-light-bg-primary/80 dark:bg-white/10 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              title="Excluir processo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-light-bg-primary/70 dark:bg-white/5 p-5 space-y-2">
        {processo.classificacao && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-blue">{processo.classificacao}</p>
        )}
        <p className="text-sm md:text-base text-light-text-primary dark:text-dark-text-primary leading-relaxed">
          {processo.objeto || 'Nenhum objeto informado para este processo.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoPill
          label="Data de Cadastro"
          value={cadastroFormatado}
        />
        <InfoPill
          label="Data de Abertura"
          value={aberturaFormatada}
        />
        <InfoPill
          label="Registro de Preços"
          value={processo.registro_precos ? 'Sim' : 'Não'}
        />
        <InfoPill
          label="Valor Previsto"
          value={valorPrevisto || 'Não informado'}
        />
      </div>

      {(processo.local_sessao || processo.horario_sessao) && (
        <div className="flex flex-wrap items-center gap-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
          {processo.local_sessao && (
            <span className="inline-flex items-center gap-2">
              <Building2 className="w-4 h-4" /> {processo.local_sessao}
            </span>
          )}
          {processo.horario_sessao && (
            <span className="inline-flex items-center gap-2">
              <Clock3 className="w-4 h-4" /> {processo.horario_sessao}
            </span>
          )}
          {processo.data_sessao && (
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> {formatDate(processo.data_sessao, { dateStyle: 'short', timeStyle: 'short' })}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProcessoCard;