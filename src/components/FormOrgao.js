// src/components/FormOrgao.js
import React, { useState } from 'react';
import useAxios from '../hooks/useAxios';

const FormOrgao = () => {
    const [nome, setNome] = useState('');
    const [cnpj, setCnpj] = useState('');
    const api = useAxios();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/orgaos/', {
                nome: nome,
                cnpj: cnpj,
            });
            alert('Órgão cadastrado com sucesso!');
            setNome('');
            setCnpj('');
        } catch (error) {
            console.error('Erro ao cadastrar órgão:', error);
            alert('Falha ao cadastrar órgão. Verifique os dados e tente novamente.');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">Cadastrar Novo Órgão</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="nome_orgao">Nome do Órgão</label>
                    <input
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text" id="nome_orgao" value={nome}
                        onChange={(e) => setNome(e.target.value)} required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="cnpj_orgao">CNPJ</label>
                    <input
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text" id="cnpj_orgao" value={cnpj}
                        onChange={(e) => setCnpj(e.target.value)} required
                    />
                </div>
                <button type="submit" className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors">
                    Cadastrar Órgão
                </button>
            </form>
        </div>
    );
};

export default FormOrgao;