// frontend/src/components/ProcessoCard.jsx

import React from 'react';
import { Building2, Download, Eye, PencilLine, Trash2 } from 'lucide-react';
import { data } from 'autoprefixer';

const InfoPill = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[13px] font-bold text-[#1a1a1a]/80 uppercase tracking-wide">
      {label}
    </span>
    <span className="text-[15px] font-semibold text-[#001a33]">{value || '-'}</span>
  </div>
);

const ProcessoCard = ({ processo, onEdit, onDelete, onView, onExport }) => {
  const getSituacaoStyle = (situacao) => {
    const baseStyle = 'px-3 py-1.5 rounded-md text-xs font-bold uppercase';
    switch (situacao) {
      case 'Aberto':
      case 'Publicado':
        return `${baseStyle} bg-[#007bff] text-white`;
      case 'Em Pesquisa':
      case 'Aguardando Publicação':
      case 'Em Contratação':
        return `${baseStyle} bg-amber-500/10 text-amber-700`;
      case 'Adjudicado/Homologado':
        return `${baseStyle} bg-emerald-600/10 text-emerald-700`;
      case 'Revogado/Cancelado':
        return `${baseStyle} bg-rose-600/10 text-rose-700`;
      default:
        return `${baseStyle} bg-slate-200 text-slate-700`;
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

  // 🟩 Função para gerar o CSV
  const exportToCSV = () => {
    const headers = [
      'Número do Processo',
      'Número do Certame',
      'Modalidade',
      'Classificação',
      'Objeto',
      'Secretaria',
      'Entidade',
      'Órgão',
      'Data de Cadastro',
      'Data do Certame',
      'Registro de Preços',
      'Valor de Referência',
      'Situação'
    ];

    const values = [
      processo.numero_processo || '',
      processo.numero_certame || '',
      processo.modalidade || '',
      processo.classificacao || '',
      processo.objeto || '',
      processo.secretaria || '',
      processo.entidade_nome || '',
      processo.orgao || '',
      cadastroFormatado || '',
      aberturaFormatada || '',
      processo.registro_precos ? 'Sim' : 'Não',
      valorPrevisto || '',
      processo.situacao || ''
    ];

    const csvContent = '\uFEFF' + [headers.join(';'), values.join(';')].join('\n');

  // Cria o blob com codificação UTF-8
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `processo_${processo.numero_processo || 'dados'}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
  
  const aberturaFormatada = formatDate(processo.data_abertura, { dateStyle: 'short', timeStyle: 'short' });
  const cadastroFormatado = formatDate(processo.data_processo, { dateStyle: 'short' });
  const valorPrevisto = formatCurrency(processo.valor_referencia, {dateStyle: 'short'});

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-700 p-0 overflow-hidden">
     {/* ======= Cabeçalho ======= */}
<div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 px-8 py-3 rounded-t-2xl">

  {/* 🟦 Bloco: Entidade + Órgão */}
  <div className="flex flex-wrap items-center gap-2 min-w-[250px] flex-1">
    {processo.entidade_nome && (
      <span 
        className="truncate overflow-hidden text-ellipsis max-w-[250px] sm:max-w-[300px] md:max-w-[300px] 2xl:max-w-[700px] px-3 py-1 text-sm font-semibold bg-accent-blue text-white rounded-md"
        title={processo.entidade_nome}
      >
        {processo.entidade_nome}
      </span>
    )}

    {processo.orgao_nome && (
      <span
        className="truncate overflow-hidden text-ellipsis max-w-[250px] sm:max-w-[350px] md:max-w-[400px] 2xl:max-w-[700px] px-3 py-1 text-sm font-medium bg-[#E8F4FF] text-[#1789D2] dark:text-gray-300 dark:bg-[#0F294A] border border-[#bcd2e0] dark:border-[#1c4274] rounded-md"
        title={processo.orgao_nome}
      >
        {processo.orgao_nome}
      </span>
    )}
  </div>

  {/* 🟨 Bloco: Botões */}
  <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-2 flex-shrink-0">
    <button
      onClick={exportToCSV}
      variant="outline"
      className="inline-flex items-center gap-1 h-7 px-4 py-2 bg-secondary-green text-white rounded-md text-sm font-medium hover:bg-secondary-green/90 transition-colors"
    >
      <Download className="w-4 h-4" /> Exportar
    </button>

    {onEdit && (
      <button
        onClick={() => onEdit(processo)}
        className="inline-flex items-center gap-2 h-7 px-4 py-2 bg-accent-blue text-white text-sm font-semibold rounded-md hover:bg-accent-blue/90 transition-colors"
      >
        <Eye className="w-4 h-4" /> Visualizar
      </button>
    )}

    {/* {onEdit && (
      <button
        onClick={() => onEdit(processo)}
        className="h-9 w-9 flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-800"
        title="Editar"
      >
        <PencilLine className="w-4 h-4" />
      </button>
    )} */}

    {onDelete && (
      <button
        onClick={() => onDelete(processo.id)}
        className="h-7 px-4 py-2 flex items-center justify-center rounded-md bg-red-600 text-white hover:bg-red-500 transition-colorsdark:bg-slate-700 dark:hover:bg-red-800"
        title="Excluir"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    )}
  </div>
</div>


      {/* Corpo */}
      <div className="px-8 py-3 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-xl font-bold text-[#001a33] dark:text-white">
            {processo.modalidade || 'Modalidade não informada'}
          </h3>
          {processo.numero_certame && (
            <span className="bg-[#ffcc00] text-[#1a1a1a] text-sm font-bold px-3 py-1.5 rounded-md">
              {numeroCertame}/{anoCertame}{siglaModalidade ? `-${siglaModalidade}` : ''}
            </span>
          )}
        </div>

        <p className="text-[15px] leading-relaxed text-[#1a1a1a]/80 dark:text-slate-200">
          {processo.objeto || 'Nenhum objeto informado para este processo.'}
        </p>

        {/* Informações inferiores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <InfoPill label="Data de Cadastro" value={cadastroFormatado} />
          <InfoPill label="Data do Certame" value={aberturaFormatada} />
          <InfoPill label="Registro de Preços" value={processo.registro_precos ? 'Sim' : 'Não'} />
          <InfoPill label="Valor de Referência" value={valorPrevisto || 'Não informado'} />
          <div className="flex flex-col items-start">
            <span className="text-[13px] font-bold text-[#1a1a1a]/80 uppercase tracking-wide">
              Situação
            </span>
            {processo.situacao && (
              <span className={`${getSituacaoStyle(processo.situacao)} mt-1`}>
                {processo.situacao}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessoCard;
