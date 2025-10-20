import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';

export default function ModalEditarFornecedor({ isOpen, onClose, fornecedor, onSave }) {
    const [form, setForm] = useState({ razao_social:'', cnpj:'' });

    useEffect(() => { if(fornecedor) setForm(fornecedor); }, [fornecedor]);

    const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = e => { e.preventDefault(); onSave(form); onClose(); };

    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <Dialog.Panel className="bg-white rounded-lg shadow-md w-full max-w-md p-6">
                <Dialog.Title className="text-lg font-semibold text-gray-800 mb-4">Editar Fornecedor</Dialog.Title>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <label className="flex flex-col text-gray-700">
                        Razão Social
                        <input name="razao_social" value={form.razao_social} onChange={handleChange} className="border border-gray-300 rounded px-2 py-1"/>
                    </label>
                    <label className="flex flex-col text-gray-700">
                        CNPJ
                        <input name="cnpj" value={form.cnpj} onChange={handleChange} className="border border-gray-300 rounded px-2 py-1"/>
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
