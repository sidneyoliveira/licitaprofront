// frontend/src/components/ProcessoCard.jsx

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
    const baseStyle = "px-2 py-1 text-xs font-semibold rounded-md border inline-block uppercase";
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
    <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border shadow-sm hover:shadow-md transition-shadow">
      <header className="flex flex-col gap-2 p-3 border-b border-light-border dark:border-dark-border">
        <div className="flex justify-between items-start">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold bg-accent-blue/10 text-accent-blue px-2 py-1 rounded-md">{processo.modalidade}</span>
            <div className="flex items-center gap-1.5 text-xs text-light-text-secondary dark:text-dark-text-secondary">
              <BuildingLibraryIcon className="w-4 h-4" />
              <span className="font-medium">{processo.entidade_nome}</span>
            </div>
          </div>
          <span className={getSituacaoStyle(processo.situacao)}>
            {processo.situacao}
          </span>
        </div>
        
        {/* --- NÚMERO DO CERTAME MOVIDO E ESTILIZADO --- */}
        <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-light-text-primary dark:text-dark-text-primary">
              Processo Nº {processo.numero_processo}
            </h3>
            {processo.numero_certame && (
                <div className={getCertameTagStyle(processo.modalidade)}>
                    Nº {numeroCertame}/{anoCertame}-{siglaModalidade}
                </div>
            )}
        </div>

      </header>

      <div className="p-3">
        <p className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">{processo.classificacao}</p>
        <p className="text-sm text-light-text-primary dark:text-dark-text-primary line-clamp-2">{processo.objeto}</p>
      </div>

      <footer className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 border-t border-light-border dark:border-dark-border">
        <InfoPill label="Cadastro" value={new Date(processo.data_processo).toLocaleDateString('pt-BR')} />
        <InfoPill label="Abertura" value={processo.data_abertura ? new Date(processo.data_abertura).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'} />
        <InfoPill label="Reg. Preços" value={processo.registro_precos ? 'Sim' : 'Não'} />
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => onView(processo.id)} className="p-2 rounded-md text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50">
            <EyeIcon className="w-4 h-4" />
          </button>
          <button onClick={() => onEdit(processo)} className="p-2 rounded-md text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/50">
            <PencilIcon className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(processo.id)} className="p-2 rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ProcessoCard;