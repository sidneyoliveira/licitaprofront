import React from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function LotesSection({ lotes, showToast }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Lotes do Processo
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {lotes.length} lote(s) cadastrado(s).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              showToast?.("Funcionalidade de lotes não implementada neste build.", "info")
            }
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-accent-blue rounded-md shadow-sm hover:bg-accent-blue/90"
          >
            <PlusIcon className="w-5 h-5" />
            Adicionar Lote
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-bg-secondary shadow-sm">
        <table className="w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800/40">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Código
              </th>
              <th className="py-3 px-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Descrição
              </th>
              <th className="py-3 px-4 text-right text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Qtd. Itens
              </th>
              <th className="py-3 px-6 text-center text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {lotes.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-slate-500">
                  Nenhum lote cadastrado.
                </td>
              </tr>
            ) : (
              lotes.map((l) => (
                <tr
                  key={l.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <td className="py-3 px-4 text-sm">{l.codigo || l.id}</td>
                  <td className="py-3 px-4 text-sm">{l.descricao}</td>
                  <td className="py-3 px-4 text-sm text-right">
                    {l.qtd_itens || (l.itens?.length || 0)}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => showToast?.("Editar lote — em breve", "info")}
                      className="text-[#004aad] hover:text-[#003d91] mr-3"
                    >
                      <PencilIcon className="w-5 h-5 inline" />
                    </button>
                    <button
                      onClick={() => showToast?.("Remover lote — em breve", "info")}
                      className="text-rose-600 hover:text-rose-700"
                    >
                      <TrashIcon className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
