import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';

export default function ModalEditarItem({ isOpen, onClose, item, onSave }) {
    const [form, setForm] = useState({ descricao:'', unidade:'', quantidade:0, especificacao:'' });

    useEffect(() => { if(item) setForm(item); }, [item]);

    const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = e => { e.preventDefault(); onSave(form); onClose(); };

    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <Dialog.Panel className="bg-white rounded-lg shadow-md w-full max-w-md p-6">
                <Dialog.Title className="text-lg font-semibold text-gray-800 mb-4">Editar Item</Dialog.Title>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <label className="flex flex-col text-gray-700">
                        Descrição
                        <input name="descricao" value={form.descricao} onChange={handleChange} className="border border-gray-300 rounded px-2 py-1"/>
                    </label>
                    <label className="flex flex-col text-gray-700">
                        Unidade
                        <input name="unidade" value={form.unidade} onChange={handleChange} className="border border-gray-300 rounded px-2 py-1"/>
                    </label>
                    <label className="flex flex-col text-gray-700">
                        Quantidade
                        <input type="number" name="quantidade" value={form.quantidade} onChange={handleChange} className="border border-gray-300 rounded px-2 py-1"/>
                    </label>
                    <label className="flex flex-col text-gray-700">
                        Especificação
                        <textarea name="especificacao" value={form.especificacao} onChange={handleChange} className="border border-gray-300 rounded px-2 py-1"/>
                    </label>
                    <div className="flex justify-end gap-2 mt-2">
                        <button type="button" onClick={onClose} className="px-3 py-1 border rounded text-gray-700">Cancelar</button>
                        <button type="submit" className="px-3 py-1 bg-blue-800 text-white rounded">Salvar</button>
                    </div>
                </form>
            </Dialog.Panel>
        </Dialog>
    );
}
