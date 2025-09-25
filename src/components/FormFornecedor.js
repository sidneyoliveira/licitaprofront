// src/components/FormFornecedor.js
import React, { useState } from 'react';
import useAxios from '../hooks/useAxios';

const FormFornecedor = () => {
    const [razaoSocial, setRazaoSocial] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [email, setEmail] = useState('');
    const api = useAxios();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/fornecedores/', {
                razao_social: razaoSocial,
                cnpj: cnpj,
                email: email,
            });
            alert('Fornecedor cadastrado com sucesso!');
            // Limpa os campos após o sucesso
            setRazaoSocial('');
            setCnpj('');
            setEmail('');
        } catch (error) {
            console.error('Erro ao cadastrar fornecedor:', error);
            alert('Falha ao cadastrar fornecedor. Verifique os dados e tente novamente.');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">Cadastrar Novo Fornecedor</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="razao_social">Razão Social</label>
                    <input
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text" id="razao_social" value={razaoSocial}
                        onChange={(e) => setRazaoSocial(e.target.value)} required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="cnpj_fornecedor">CNPJ</label>
                    <input
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text" id="cnpj_fornecedor" value={cnpj}
                        onChange={(e) => setCnpj(e.target.value)} required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
                    <input
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="email" id="email" value={email}
                        onChange={(e) => setEmail(e.target.value)} required
                    />
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors">
                    Cadastrar Fornecedor
                </button>
            </form>
        </div>
    );
};

export default FormFornecedor;