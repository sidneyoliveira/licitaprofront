// src/components/ModalEnvioPNCP.jsx
import React, { useState } from 'react';
import { UploadCloud, X, FileText, Loader2, Send } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import useAxios from '../hooks/useAxios';

const ModalEnvioPNCP = ({ processo, onClose, onSuccess }) => {
    const api = useAxios();
    const { showToast } = useToast();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return showToast("Selecione um arquivo PDF.", "error");

        setLoading(true);
        const formData = new FormData();
        formData.append('arquivo', file);
        formData.append('titulo_documento', `Edital - ${processo.numero_processo}`);

        try {
            await api.post(`/processos/${processo.id}/publicar-pncp/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showToast("Processo enviado ao PNCP com sucesso!", "success");
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.detail || "Erro ao enviar para o PNCP.";
            showToast(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-dark-border">
                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <UploadCloud className="w-5 h-5 text-blue-600" /> Publicar no PNCP
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 rounded-full p-1"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleUpload} className="p-6 space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                        Você está publicando o processo <strong>{processo.numero_processo}</strong> no ambiente de Treinamento do PNCP.
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Anexar Edital/Aviso (PDF)</label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-dark-bg-primary transition-colors cursor-pointer relative">
                            <input 
                                type="file" 
                                accept=".pdf" 
                                onChange={(e) => setFile(e.target.files[0])} 
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <FileText className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">
                                {file ? file.name : "Clique para selecionar o arquivo"}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                        <button 
                            type="submit" 
                            disabled={loading || !file}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Enviar para PNCP
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalEnvioPNCP;