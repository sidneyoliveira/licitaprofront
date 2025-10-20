// src/components/FornecedorModal.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function FornecedorModal({ isOpen, onClose, fornecedor, onSave }) {
  const [form, setForm] = useState({ razao_social: "", cnpj: "", email: "", telefone: "" });

  useEffect(() => {
    if (fornecedor) setForm({ ...fornecedor });
    else setForm({ razao_social: "", cnpj: "", email: "", telefone: "" });
  }, [fornecedor]);

  if (!isOpen) return null;

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave && onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">{fornecedor ? "Editar Fornecedor" : "Adicionar Fornecedor"}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium">Razão Social *</label>
            <input name="razao_social" value={form.razao_social} onChange={handleChange} className="w-full border rounded p-2 mt-1" required />
          </div>
          <div>
            <label className="text-xs font-medium">CNPJ *</label>
            <input name="cnpj" value={form.cnpj} onChange={handleChange} className="w-full border rounded p-2 mt-1" required />
          </div>
          <div>
            <label className="text-xs font-medium">Email</label>
            <input name="email" value={form.email} onChange={handleChange} className="w-full border rounded p-2 mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium">Telefone</label>
            <input name="telefone" value={form.telefone} onChange={handleChange} className="w-full border rounded p-2 mt-1" />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancelar</button>
            <button type="submit" className="px-5 py-2 bg-blue-700 text-white rounded">{fornecedor ? "Salvar" : "Adicionar"}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
