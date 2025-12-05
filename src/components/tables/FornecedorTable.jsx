import React from "react";
import { Pencil, Trash2, Building2, UserSearch } from "lucide-react";

/**
 * Checkbox Estilizado (Consistente com ItensTable)
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

export default function FornecedorTable({
  fornecedores = [], // Dados dos fornecedores vinculados (não é o catálogo completo)
  currentFornecedores = [], // Dados paginados (se aplicável)
  onEdit,
  handleAskDelete,
  selectedFornecedores = new Set(), // Set com IDs selecionados (opcional, para ações em massa)
  onSelectFornecedor,
  onSelectAll,
  areAllSelected,
  startIndex = 0,
}) {
  // Define qual lista usar (prioriza currentFornecedores se paginado, senão usa fornecedores)
  const listaExibicao = currentFornecedores.length > 0 ? currentFornecedores : fornecedores;
  const hasItems = listaExibicao.length > 0;

  return (
    <div className="w-full bg-white dark:bg-dark-bg-secondary rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
      
      {/* Tabela Responsiva */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full divide-y divide-slate-200 dark:divide-slate-700">
          
          {/* Cabeçalho */}
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              {/* Checkbox Opcional (se onSelectAll for passado) */}
              {onSelectAll && (
                <th scope="col" className="py-4 px-4 w-12 text-center">
                    <StyledCheckbox 
                        checked={hasItems && areAllSelected} 
                        onChange={onSelectAll} 
                    />
                </th>
              )}
              
              <th scope="col" className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-16">
                #
              </th>
              <th scope="col" className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Razão Social / Fantasia
              </th>
              <th scope="col" className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-48">
                CNPJ
              </th>
              <th scope="col" className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-40">
                Porte
              </th>
              <th scope="col" className="py-3 px-6 text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-28">
                Ações
              </th>
            </tr>
          </thead>

          {/* Corpo da Tabela */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {hasItems ? (
              listaExibicao.map((forn, idx) => {
                const isSelected = selectedFornecedores?.has?.(forn.id);
                return (
                  <tr 
                    key={forn.id} 
                    className={`
                        group transition-colors duration-150
                        ${isSelected 
                            ? 'bg-blue-50/70 dark:bg-blue-900/20' 
                            : 'bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30'
                        }
                    `}
                  >
                    {/* Checkbox */}
                    {onSelectFornecedor && (
                        <td className="py-4 px-4 text-center">
                        <StyledCheckbox 
                            checked={isSelected} 
                            onChange={() => onSelectFornecedor(forn.id)} 
                        />
                        </td>
                    )}

                    {/* Índice */}
                    <td className="py-4 px-4 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
                        {startIndex + idx + 1}
                    </td>

                    {/* Razão Social e Fantasia */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hidden sm:block">
                            <Building2 size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-[#004aad] transition-colors">
                                {forn.razao_social}
                            </span>
                            {forn.nome_fantasia && (
                                <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide mt-0.5">
                                    {forn.nome_fantasia}
                                </span>
                            )}
                        </div>
                      </div>
                    </td>

                    {/* CNPJ */}
                    <td className="py-4 px-4 text-left">
                        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-600">
                            {forn.cnpj}
                        </span>
                    </td>

                    {/* Porte */}
                    <td className="py-4 px-4 text-left">
                        <span className="text-sm text-slate-600 dark:text-slate-300 capitalize">
                            {forn.porte || '-'}
                        </span>
                    </td>

                    {/* Ações */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2 ">
                        {/* Botão de Edição (Opcional, se onEdit for passado) */}
                        {onEdit && (
                            <button 
                                onClick={() => onEdit(forn)} 
                                className="p-1.5 text-slate-400 hover:text-[#004aad] hover:bg-blue-50 rounded-md transition-colors"
                                title="Editar Fornecedor"
                            >
                            <Pencil size={16} />
                            </button>
                        )}
                        
                        {/* Botão de Exclusão/Desvinculação */}
                        <button 
                            onClick={() => handleAskDelete("fornecedor", forn)} 
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="Remover/Desvincular"
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
                <td colSpan={onSelectAll ? 6 : 5}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-full mb-3">
                        <UserSearch size={32} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        Nenhum fornecedor vinculado
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[250px]">
                        Utilize o botão "Adicionar Fornecedor" para vincular participantes a este processo.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Rodapé da Tabela (Contador) */}
      {hasItems && (
        <div className="bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-700 px-6 py-3 flex justify-end items-center gap-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Total de Participantes:
            </span>
            <span className="text-sm font-bold text-[#004aad]">
                {fornecedores.length}
            </span>
        </div>
      )}
    </div>
  );
}