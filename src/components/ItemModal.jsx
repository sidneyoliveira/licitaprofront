import { useState } from "react";

export default function ItemForm({ item, onSave }) {
  const [form, setForm] = useState(item || { nome: "", quantidade: 0, valor_unitario: 0 });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-semibold mb-1">Nome *</label>
        <input
          name="nome"
          value={form.nome}
          onChange={handleChange}
          className="w-full rounded-md border px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Quantidade *</label>
        <input
          name="quantidade"
          type="number"
          value={form.quantidade}
          onChange={handleChange}
          className="w-full rounded-md border px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Valor Unitário *</label>
        <input
          name="valor_unitario"
          type="number"
          step="0.01"
          value={form.valor_unitario}
          onChange={handleChange}
          className="w-full rounded-md border px-3 py-2"
          required
        />
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-800 text-white rounded-md">
        Salvar
      </button>
    </form>
  );
}
