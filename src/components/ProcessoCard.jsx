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
        {/* --- NÚMERO DO CERTAME ADICIONADO AO TÍTULO --- */}
        <h3 className="font-bold text-base text-light-text-primary dark:text-dark-text-primary">
          Processo Nº {processo.numero_processo}
          {processo.numero_certame && <span className="font-normal text-light-text-secondary dark:text-dark-text-secondary"> | Certame Nº {processo.numero_certame}</span>}
        </h3>
      </header>

      <div className="p-3">
        {/* --- CLASSIFICAÇÃO ADICIONADA AQUI --- */}
        <p className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">{processo.classificacao}</p>
        <p className="text-sm text-light-text-primary dark:text-dark-text-primary line-clamp-2">{processo.objeto}</p>
      </div>

      <footer className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 border-t border-light-border dark:border-dark-border">
        <InfoPill label="Cadastro" value={new Date(processo.data_processo).toLocaleDateString('pt-BR')} />
        {/* --- HORA DA ABERTURA ADICIONADA --- */}
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