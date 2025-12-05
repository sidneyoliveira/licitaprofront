import React from "react";
import { Pencil, Trash2, ClipboardList, PackageOpen } from "lucide-react";

/** * Helpers Locais
 */
const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'R$ 0,00';
  const n = Number(value);
  if (Number.isNaN(n)) return 'R$ 0,00';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatNumber = (value) => {
    if(!value) return '0';
    return Number(value).toLocaleString('pt-BR');
}

/**
 * Checkbox Estilizado
 */
const StyledCheckbox = ({ checked, onChange, className = "" }) => (
  <label 
    className={`relative inline-flex items-center justify-center cursor-pointer select-none ${className}`} 
    aria-checked={checked} 
    role="checkbox"
  >
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={onChange} 
      className="peer absolute inset-0 z-20 m-0 h-full w-full cursor-pointer opacity-0" 
    />
    <div className={`
        pointer-events-none flex h-5 w-5 items-center justify-center rounded 
        border-2 transition-all duration-200 ease-in-out
        ${checked 
            ? 'border-[#004aad] bg-[#004aad]' 
            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-transparent hover:border-[#004aad]/50'
        }
    `}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={3} 
        stroke="currentColor" 
        className={`h-3 w-3 text-white transition-opacity ${checked ? 'opacity-100' : 'opacity-0'}`}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    </div>
  </label>
);

export default function ItensTable({
  itens = [],
  onEdit,
  handleAskDelete,
  selectedItems,
  onSelectItem,
  onSelectAll,
  areAllSelected,
}) {
  const hasItems = itens.length > 0;

  return (
    <div className="w-full bg-white dark:bg-dark-bg-secondary rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
      
      {/* Tabela Responsiva */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full divide-y divide-slate-200 dark:divide-slate-700">
          
          {/* Cabeçalho */}
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th scope="col" className="py-4 px-4 w-12 text-center">
                <StyledCheckbox 
                    checked={hasItems && areAllSelected} 
                    onChange={onSelectAll} 
                />
              </th>
              <th scope="col" className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Descrição / Especificação
              </th>
              <th scope="col" className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-24">
                Unid.
              </th>
              <th scope="col" className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-32">
                Qtd.
              </th>
              <th scope="col" className="py-3 px-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-36">
                Valor Unit.
              </th>
              <th scope="col" className="py-3 px-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-40">
                Total
              </th>
              <th scope="col" className="py-3 px-6 text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-28">
                Ações
              </th>
            </tr>
          </thead>

          {/* Corpo da Tabela */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {hasItems ? (
              itens.map((item) => {
                const isSelected = selectedItems.has(item.id);
                return (
                  <tr 
                    key={item.id} 
                    className={`
                        group transition-colors duration-150
                        ${isSelected 
                            ? 'bg-blue-50/70 dark:bg-blue-900/20' 
                            : 'bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30'
                        }
                    `}
                  >
                    {/* Checkbox */}
                    <td className="py-4 px-4 text-center">
                      <StyledCheckbox 
                        checked={isSelected} 
                        onChange={() => onSelectItem(item.id)} 
                      />
                    </td>

                    {/* Descrição e Detalhes */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-[#004aad] transition-colors">
                            {item.descricao}
                        </span>
                        {item.numero_item && (
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mt-0.5">
                                Item nº {item.numero_item}
                            </span>
                        )}
                      </div>
                    </td>

                    {/* Unidade */}
                    <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 uppercase">
                            {item.unidade || '-'}
                        </span>
                    </td>

                    {/* Quantidade */}
                    <td className="py-4 px-4 text-center text-sm font-medium text-slate-600 dark:text-slate-300">
                      {formatNumber(item.quantidade)}
                    </td>

                    {/* Valor Unitário */}
                    <td className="py-4 px-4 text-right text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatCurrency(item.valor_estimado)}
                    </td>

                    {/* Valor Total (Calculado) */}
                    <td className="py-4 px-4 text-right text-sm font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      {formatCurrency((item.quantidade || 0) * (item.valor_estimado || 0))}
                    </td>

                    {/* Ações */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                            onClick={() => onEdit(item)} 
                            className="p-1.5 text-slate-400 hover:text-[#004aad] hover:bg-blue-50 rounded-md transition-colors"
                            title="Editar Item"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                            onClick={() => handleAskDelete("item", item)} 
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="Remover Item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              /* Empty State */
              <tr>
                <td colSpan="7">
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-full mb-3">
                        <PackageOpen size={32} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        Nenhum item cadastrado
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
                        Utilize o botão "Adicionar Item" acima para começar a preencher a lista.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Rodapé da Tabela (Opcional - Totais) */}
      {hasItems && (
        <div className="bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-700 px-6 py-3 flex justify-end items-center gap-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Valor Total do Lote/Itens:
            </span>
            <span className="text-sm font-bold text-[#004aad]">
                {formatCurrency(itens.reduce((acc, item) => acc + (item.quantidade * item.valor_estimado), 0))}
            </span>
        </div>
      )}
    </div>
  );
}