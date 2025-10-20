// src/components/ItemModal.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ItemModal({ isOpen, onClose, item, onSave }) {
  const [form, setForm] = useState({ descricao: "", especificacao: "", unidade: "", quantidade: 1 });

  useEffect(() => {
    if (item) setForm({ ...item });
    else setForm({ descricao: "", especificacao: "", unidade: "", quantidade: 1 });
  }, [item]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: name === "quantidade" ? value : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave && onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold mb-4">{item ? "Editar Item" : "Adicionar Item"}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium">Descrição *</label>
            <input name="descricao" value={form.descricao} onChange={handleChange} className="w-full border rounded p-2 mt-1" required />
          </div>
          <div>
            <label className="text-xs font-medium">Especificação</label>
            <textarea name="especificacao" value={form.especificacao} onChange={handleChange} className="w-full border rounded p-2 mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium">Unidade *</label>
              <input name="unidade" value={form.unidade} onChange={handleChange} className="w-full border rounded p-2 mt-1" required />
            </div>
            <div>
              <label className="text-xs font-medium">Quantidade *</label>
              <input name="quantidade" type="number" step="0.01" value={form.quantidade} onChange={handleChange} className="w-full border rounded p-2 mt-1" required />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancelar</button>
            <button type="submit" className="px-5 py-2 bg-blue-700 text-white rounded">{item ? "Salvar" : "Adicionar"}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
