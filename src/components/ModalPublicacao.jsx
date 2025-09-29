// frontend/src/components/ModalPublicacao.jsx

import React, { useState } from 'react';
import useAxios from '../hooks/useAxios';
import { useToast } from '../context/ToastContext';
import { XMarkIcon } from '@heroicons/react/24/solid';

const ModalPublicacao = ({ processo, closeModal, onPublished }) => {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        numero_certame: processo.numero_certame || '',
        data_abertura: processo.data_abertura ? new Date(processo.data_abertura).toISOString().slice(0, 16) : '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const api = useAxios();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Usamos PATCH para atualizar apenas os campos necessários
            await api.patch(`/processos/${processo.id}/`, {
                ...formData,
                situacao: 'Publicado', // Garante que o status final é 'Publicado'
            });
            showToast('Processo publicado com sucesso!', 'success');
            onPublished();
            closeModal();
        } catch (error) {
            showToast('Erro ao publicar o processo.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle = "w-full px-3 py-1.5 text-sm border rounded-lg";
    const labelStyle = "text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary";

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-xl w-full max-w-md relative">
                <button onClick={closeModal} className="absolute top-4 right-4"><XMarkIcon className="w-6 h-6" /></button>
                <h2 className="text-xl font-bold mb-4">Dados da Publicação</h2>
                <p className="text-sm mb-4 text-light-text-secondary dark:text-dark-text-secondary">
                    O processo <span className="font-bold">{processo.numero_processo}</span> foi movido para "Publicado". Por favor, insira os dados do certame.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelStyle}>Número do Certame *</label>
                        <input name="numero_certame" value={formData.numero_certame} onChange={handleChange} className={`${inputStyle} mt-1`} required />
                    </div>
                    <div>
                        <label className={labelStyle}>Data e Hora da Abertura *</label>
                        <input name="data_abertura" type="datetime-local" value={formData.data_abertura} onChange={handleChange} className={`${inputStyle} mt-1`} required />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={closeModal} className="py-2 px-4 rounded-lg text-sm">Cancelar</button>
                        <button type="submit" disabled={isLoading} className="py-2 px-4 bg-accent-blue text-white rounded-lg text-sm">
                            {isLoading ? 'Publicando...' : 'Confirmar Publicação'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalPublicacao;