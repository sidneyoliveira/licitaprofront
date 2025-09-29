// src/components/ProcessoCard.jsx

import React from 'react';
import { BuildingLibraryIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

// Componente para os itens de informação dentro do card
const InfoPill = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">{label}</p>
    <p className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">{value || '-'}</p>
  </div>
);

const ProcessoCard = ({ processo, onEdit, onDelete, onView }) => {

  // Função para determinar o estilo da "pílula" de situação
  const getSituacaoStyle = (situacao) => {
    const baseStyle = "px-2 py-1 text-xs font-bold rounded-full border inline-block";
    switch (situacao) {
      case 'Aberto':
      case 'Publicado':
        return `${baseStyle} bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700`;
      case 'Em Pesquisa':
      case 'Aguardando Publicação':
      case 'Em Contratação':
        return `${baseStyle} bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700`;
      case 'Adjudicado/Homologado':
        return `${baseStyle} bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700`;
      case 'Revogado/Cancelado':
        return `${baseStyle} bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700`;
      default:
        return `${baseStyle} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600`;
    }
  };

  // --- DICIONÁRIO E FUNÇÃO DE ESTILO PARA A TAG DO CERTAME ---
  const modalidadeMap = {
    'Pregão Eletrônico': { sigla: 'PE', color: 'purple' },
    'Concorrência Eletrônica': { sigla: 'CE', color: 'teal' },
    'Dispensa Eletrônica': { sigla: 'DE', color: 'indigo' },
    'Adesão a Registro de Preços': { sigla: 'ARP', color: 'pink' },
    'Credenciamento': { sigla: 'CR', color: 'amber' },
    'Inexigibilidade Eletrônica': { sigla: 'IE', color: 'cyan' },
  };

  const getCertameTagStyle = (modalidade) => {
    const color = modalidadeMap[modalidade]?.color || 'gray';
    const baseStyle = "px-2 py-1 text-sm font-semibold rounded-md border";
    const colorClasses = {
        purple: `${baseStyle} bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700`,
        teal: `${baseStyle} bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-700`,
        indigo: `${baseStyle} bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700`,
        pink: `${baseStyle} bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-200 border-pink-200 dark:border-pink-700`,
        amber: `${baseStyle} bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700`,
        cyan: `${baseStyle} bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200 border-cyan-200 dark:border-cyan-700`,
        gray: `${baseStyle} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600`,
    };
    return colorClasses[color];
  };
  
  // Lógica para formatar o número do certame
  const anoCertame = processo.numero_certame?.split('/')[1] || new Date().getFullYear();
  const numeroCertame = processo.numero_certame?.split('/')[0];
  const siglaModalidade = modalidadeMap[processo.modalidade]?.sigla || '';
  
  return (
    <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-light-border dark:border-dark-border p-4 shadow-sm transition-shadow hover:shadow-lg">
      
      {/* Cabeçalho do Card */}
       {/* --- CABEÇALHO DO CARD COM LAYOUT RECURSIVO --- */}
      <header className="flex items-center justify-between gap-4 pb-3 border-b border-light-border dark:border-dark-border">
        
        {/* Lado Esquerdo: Esta div agora cresce para ocupar o espaço disponível */}
        <div className="flex items-center gap-3 flex-grow min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium text-accent-blue bg-accent-blue/10 px-1 py-1 rounded-md border truncate">
            <BuildingLibraryIcon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{processo.entidade_nome || 'Entidade'} / {processo.orgao_nome || 'Órgão'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              onClick={() => onView(processo.id)}
              className="flex items-center gap-1.5 px-3 py-1 text-sm rounded-md text-green-600 dark:text-green-400 border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/50 hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
            >
                <EyeIcon className="w-4 h-4" />
                <span>Visualizar</span>
            </button>
            <button 
              onClick={() => onEdit(processo)} 
              className="flex items-center gap-1.5 px-3 py-1 text-sm rounded-md text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/50 hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-colors"
            >
                <PencilIcon className="w-4 h-4" />
                <span>Editar</span>
            </button>
            <button 
              onClick={() => onDelete(processo.id)} 
              className="flex items-center gap-1.5 px-3 py-1 text-sm rounded-md text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/50 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
            >
                <TrashIcon className="w-4 h-4" />
                <span>Remover</span>
            </button>
        </div>
      </header>

      {/* Corpo do Card */}
      <div className="py-4">
        <div className="flex justify-between items-start gap-4">
            {/* Lado Esquerdo: Título e Classificação */}
            <div className="flex-grow">
                <h3 className="font-bold text-lg text-light-text-primary dark:text-dark-text-primary">
                    {processo.modalidade} | Nº {processo.numero_processo}
                </h3>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3">{processo.classificacao}</p>
            </div>
            {/* Lado Direito: Tag do Certame */}
            {processo.numero_certame && (
                <div className={getCertameTagStyle(processo.modalidade)}>
                    Nº {numeroCertame}/{anoCertame}-{siglaModalidade}
                </div>
            )}
        </div>
        <p className="text-sm text-light-text-primary dark:text-dark-text-primary leading-relaxed line-clamp-2 mt-2">
          {processo.objeto}
        </p>
      </div>

      {/* Grid de Informações */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 items-center gap-4 py-4 border-t border-light-border dark:border-dark-border">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider">Situação</p>
          <span className={getSituacaoStyle(processo.situacao)}>
            {processo.situacao || '-'}
          </span>
        </div>
        <InfoPill label="Data de Cadastro" value={new Date(processo.data_processo + 'T00:00:00').toLocaleDateString('pt-BR')} />
        <InfoPill label="Abertura do Certame" value={processo.data_abertura ? new Date(processo.data_abertura).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'} />
        <InfoPill label="Reg. Preços" value={processo.registro_precos ? 'Sim' : 'Não'} />
        <InfoPill label="Organização" value={processo.tipo_organizacao} />
      </div>
    </div>
  );
};

export default ProcessoCard;