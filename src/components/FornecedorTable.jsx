// src/components/FornecedorTable.jsx
import React, { useMemo, useState } from "react";
import { Trash2, Download, Plus, ChevronLeft, ChevronRight } from "lucide-react";

function exportCsv(rows, filename = "fornecedores.csv") {
  if (!rows || rows.length === 0) {
    const blob = new Blob([""], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    link.click();
    return;
  }
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(",")]
    .concat(rows.map((r) => headers.map((h) => `"${(r[h] ?? "").toString().replace(/"/g, '""')}"`).join(",")))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  link.click();
}

export default function FornecedorTable({ fornecedores = [], onAdd, onEdit, onDelete }) {
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const total = fornecedores.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const slice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return fornecedores.slice(start, start + pageSize);
  }, [fornecedores, page]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Fornecedores</h3>
          <p className="text-xs text-gray-500">{total} fornecedores</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportCsv(fornecedores, "fornecedores.csv")} className="flex items-center gap-2 px-3 py-2 border rounded text-sm text-gray-700 hover:bg-gray-50">
            <Download size={14} /> Export
          </button>
          <button onClick={onAdd} className="flex items-center gap-2 px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Razão Social</th>
              <th className="px-4 py-3 text-left">CNPJ</th>
              <th className="px-4 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">Nenhum fornecedor</td>
              </tr>
            ) : (
              slice.map((f, idx) => (
                <tr key={f.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="px-4 py-3">{f.razao_social}</td>
                  <td className="px-4 py-3">{f.cnpj}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => onEdit && onEdit(f)} className="text-gray-700 hover:text-gray-900">✏️</button>
                      <button onClick={() => onDelete && onDelete(f.id)} className="text-red-600 hover:text-red-800"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
        <div className="text-xs text-gray-500">Showing {slice.length} of {total} results</div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded hover:bg-gray-100"><ChevronLeft size={16} /></button>
          <div className="text-sm">
            <span className="px-3 py-1 rounded-full bg-gray-100">{page}</span>
            <span className="text-sm text-gray-500 ml-2">/ {pages}</span>
          </div>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="p-2 rounded hover:bg-gray-100"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}
