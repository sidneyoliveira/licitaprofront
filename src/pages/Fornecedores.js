// src/pages/Fornecedores.js
import React, { useState, useEffect } from 'react';
import useAxios from '../hooks/useAxios';
import Card from '../components/Card';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const Fornecedores = () => {
    const [fornecedores, setFornecedores] = useState([]);
    const api = useAxios();

    useEffect(() => {
        // Sua lógica para buscar fornecedores...
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Gerenciamento de Fornecedores</h1>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-light-border dark:border-dark-border">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">Razão Social</th>
                                <th className="p-4 text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">CNPJ</th>
                                <th className="p-4 text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">Email</th>
                                <th className="p-4 text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Faça o map nos seus dados de fornecedores aqui */}
                            <tr className="border-b border-light-border dark:border-dark-border hover:bg-light-bg-primary dark:hover:bg-dark-bg-primary">
                                <td className="p-4 font-medium">Fornecedor Exemplo LTDA</td>
                                <td className="p-4">12.345.678/0001-99</td>
                                <td className="p-4">contato@exemplo.com</td>
                                <td className="p-4">
                                    <div className="flex justify-center gap-2">
                                        <button className="p-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-accent-blue dark:hover:text-accent-blue"><PencilIcon className="w-5 h-5"/></button>
                                        <button className="p-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-red-500 dark:hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Fornecedores;