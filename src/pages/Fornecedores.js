import React, { useState, useEffect } from 'react';
import useAxios from '../hooks/useAxios';
import Card from '../components/Card';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useToast } from '../context/ToastContext';

const Fornecedores = () => {
    const [fornecedores, setFornecedores] = useState([]);
    const api = useAxios();
    const { showToast } = useToast();

    const fetchFornecedores = async () => {
        try {
            const response = await api.get('/fornecedores/');
            setFornecedores(response.data);
        } catch (error) {
            showToast("Erro ao buscar fornecedores.", "error");
        }
    };

    useEffect(() => {
        fetchFornecedores();
    }, [api]);

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
            try {
                await api.delete(`/fornecedores/${id}/`);
                showToast('Fornecedor excluído com sucesso!', 'success');
                fetchFornecedores(); // Recarrega a lista
            } catch (error) {
                showToast('Falha ao excluir o fornecedor.', 'error');
            }
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Gerenciamento de Fornecedores</h1>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-light-border dark:border-dark-border">
                                <th className="p-4">Razão Social</th>
                                <th className="p-4">CNPJ</th>
                                <th className="p-4">Email</th>
                                <th className="p-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fornecedores.map(f => (
                                <tr key={f.id} className="border-b dark:border-dark-border">
                                    <td className="p-4">{f.razao_social}</td>
                                    <td className="p-4">{f.cnpj}</td>
                                    <td className="p-4">{f.email}</td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => handleDelete(f.id)} className="text-red-500 hover:text-red-700">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Fornecedores;
