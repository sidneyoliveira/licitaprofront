import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function StatusTag({ status }) {
  const statusStyles = {
    'Publicado': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'Adjudicado/Homologado': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    'Em Pesquisa': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    'Aberto': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    'Revogado/Cancelado': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    'default': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  };
  const style = statusStyles[status] || statusStyles.default;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${style}`}>
      <ArrowPathIcon className="w-4 h-4" />
      {status}
    </div>
  );
}
