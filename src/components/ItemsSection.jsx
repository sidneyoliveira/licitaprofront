import React from "react";
import {
  PlusIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import ItensTable from "./tables/ItensTable";

export default function ItemsSection({
  itens,
  currentItems,
  totalPages,
  currentPage,
  itemsPerPage,
  setItemsPerPage,
  setCurrentPage,
  areAllCurrentItemsSelected,
  selectedItems,
  handleSelectItem,
  handleSelectAll,
  setIsItemModalOpen,
  setItemSelecionado,
  handleAskDelete,
  handleExportItems,
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Itens do Processo
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {itens.length} itens no total.{" "}
            {selectedItems.size > 0 && `${selectedItems.size} selecionado(s).`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-2 text-sm font-bold bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-slate-700 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-dark-bg-tertiary disabled:opacity-50"
            onClick={handleExportItems}
            disabled={selectedItems.size === 0}
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Exportar
          </button>
          <button
            type="button"
            onClick={() => {
              setItemSelecionado(null);
              setIsItemModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-accent-blue rounded-md shadow-sm hover:bg-accent-blue/90"
          >
            <PlusIcon className="w-5 h-5" />
            Adicionar Item
          </button>
        </div>
      </div>

      <ItensTable
        itens={currentItems}
        onEdit={(item) => {
          setItemSelecionado(item);
          setIsItemModalOpen(true);
        }}
        handleAskDelete={handleAskDelete}
        selectedItems={selectedItems}
        onSelectItem={handleSelectItem}
        onSelectAll={handleSelectAll}
        areAllSelected={areAllCurrentItemsSelected}
      />

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span>Exibir</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
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
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-500 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 disabled:opacity-50"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <span className="relative hidden md:inline-flex items-center px-4 py-2 text-sm font-bold ring-1 ring-inset ring-slate-200 dark:ring-slate-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
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
