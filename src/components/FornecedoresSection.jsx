import React, { useState, useMemo } from "react";
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import FornecedorTable from "./tables/FornecedorTable";

export default function FornecedoresSection({
  fornecedoresDoProcesso,
  currentFornecedores,
  totalPagesForn,
  currentPageForn,
  itemsPerPageForn,
  setItemsPerPageForn,
  setCurrentPageForn,
  setFornecedorSelecionado,
  setIsFornecedorModalOpen,
  handleAskDelete,
  onEdit,
}) {
  // seleção local (apenas dos fornecedores visíveis)
  const [selectedFornecedores, setSelectedFornecedores] = useState(new Set());

  const areAllSelected = useMemo(() => {
    if (!currentFornecedores?.length) return false;
    return currentFornecedores.every((f) => selectedFornecedores.has(f.id));
  }, [currentFornecedores, selectedFornecedores]);

  const onSelectFornecedor = (id) => {
    setSelectedFornecedores((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const onSelectAll = () => {
    setSelectedFornecedores((prev) => {
      const next = new Set(prev);
      const all = currentFornecedores.every((f) => next.has(f.id));
      if (all) {
        currentFornecedores.forEach((f) => next.delete(f.id));
      } else {
        currentFornecedores.forEach((f) => next.add(f.id));
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Fornecedores Vinculados
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {fornecedoresDoProcesso.length} fornecedores no total.
            {selectedFornecedores.size > 0 && ` ${selectedFornecedores.size} selecionado(s).`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFornecedorSelecionado(null);
            setIsFornecedorModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#004aad] rounded-md shadow-sm hover:bg-[#003d91]"
        >
          <PlusIcon className="w-5 h-5" />
          Adicionar Fornecedor
        </button>
      </div>

      <FornecedorTable
        fornecedores={currentFornecedores}
        handleAskDelete={handleAskDelete}
        onEdit={onEdit}
        selectedFornecedores={selectedFornecedores}
        onSelectFornecedor={onSelectFornecedor}
        onSelectAll={onSelectAll}
        areAllSelected={areAllSelected}
      />

      {totalPagesForn > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span>Exibir</span>
            <select
              value={itemsPerPageForn}
              onChange={(e) => {
                setItemsPerPageForn(Number(e.target.value));
                setCurrentPageForn(1);
                // limpa seleção ao mudar paginação
                setSelectedFornecedores(new Set());
              }}
              className="w-auto px-2 py-1 border rounded-md"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span>por página</span>
          </div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
            <button
              onClick={() => {
                setCurrentPageForn((p) => Math.max(p - 1, 1));
                setSelectedFornecedores(new Set());
              }}
              disabled={currentPageForn === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-500 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 disabled:opacity-50"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <span className="relative hidden md:inline-flex items-center px-4 py-2 text-sm font-bold ring-1 ring-inset ring-slate-200 dark:ring-slate-700">
              Página {currentPageForn} de {totalPagesForn}
            </span>
            <button
              onClick={() => {
                setCurrentPageForn((p) => Math.min(p + 1, totalPagesForn));
                setSelectedFornecedores(new Set());
              }}
              disabled={currentPageForn === totalPagesForn || totalPagesForn === 0}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-500 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 disabled:opacity-50"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
