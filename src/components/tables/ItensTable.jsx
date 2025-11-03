import React from "react";
import { PencilIcon, TrashIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";

/** Helpers locais (para não depender do PageProcess) */
const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'Não informado';
  const n = Number(value);
  if (Number.isNaN(n)) return 'Não informado';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const StyledCheckbox = ({ checked, onChange, className = "" }) => (
  <label className={`relative inline-flex items-center justify-center cursor-pointer select-none ${className}`} aria-checked={checked} role="checkbox">
    <input type="checkbox" checked={checked} onChange={onChange} className="peer absolute inset-0 z-20 m-0 h-full w-full cursor-pointer opacity-0" />
    <div className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded border-2 border-slate-300 dark:border-dark-border transition-none peer-checked:border-[#004aad] peer-checked:bg-[#004aad]`}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`h-3 w-3 text-white ${checked ? 'opacity-100' : 'opacity-0'}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    </div>
  </label>
);

export default function ItensTable({
  itens,
  onEdit,
  handleAskDelete,
  selectedItems,
  onSelectItem,
  onSelectAll,
  areAllSelected,
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-bg-secondary shadow-sm">
      <table className="w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-800/40">
          <tr>
            <th className="py-3 px-4 text-left w-12">
              <StyledCheckbox checked={areAllSelected} onChange={onSelectAll} />
            </th>
            <th className="py-3 px-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">Descrição</th>
            <th className="py-3 px-3 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">Quantidade</th>
            <th className="py-3 px-3 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">Valor</th>
            <th className="py-3 px-6 text-center text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {itens.map(item => (
            <tr key={item.id} className={`${selectedItems.has(item.id) ? 'bg-blue-50/60 dark:bg-blue-900/20' : 'bg-white dark:bg-transparent'} hover:bg-slate-50 dark:hover:bg-slate-800/40`}>
              <td className="py-4 px-4">
                <StyledCheckbox checked={selectedItems.has(item.id)} onChange={() => onSelectItem(item.id)} />
              </td>
              <td className="py-4 px-4 text-sm text-slate-800 dark:text-slate-200">{item.descricao}</td>
              <td className="px-3 py-4 text-sm text-slate-800 dark:text-slate-200">{item.quantidade}</td>
              <td className="px-3 py-4 text-sm text-slate-800 dark:text-slate-200">{formatCurrency(item.valor_estimado)}</td>
              <td className="py-4 px-6 text-center text-sm font-semibold">
                <div className="flex gap-3 justify-center">
                  <button onClick={() => onEdit(item)} title="Editar" className="text-[#004aad] hover:text-[#003d91]"><PencilIcon className="w-5 h-5" /></button>
                  <button onClick={() => handleAskDelete("item", item)} title="Remover" className="text-rose-600 hover:text-rose-700"><TrashIcon className="w-5 h-5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {itens.length === 0 && (
        <div className="flex flex-col items-center justify-center p-10 text-center bg-white dark:bg-dark-bg-secondary">
          <ClipboardDocumentIcon className="w-12 h-12 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">Nenhum item adicionado</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Clique em “Adicionar Item” para cadastrar um.</p>
        </div>
      )}
    </div>
  );
}
