// src/pages/Cadastros.js
import React from 'react';
import Card from '../components/Card'; // Importe o Card

// Assumindo que você tem os formulários como componentes separados
// Vamos estilizá-los diretamente aqui para simplificar
const FormFornecedor = () => (
    <form>
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Razão Social</label>
                <input type="text" className="w-full p-2 border rounded-lg bg-light-bg-primary dark:bg-dark-bg-primary border-light-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-blue" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">CNPJ</label>
                <input type="text" className="w-full p-2 border rounded-lg bg-light-bg-primary dark:bg-dark-bg-primary border-light-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-blue" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" className="w-full p-2 border rounded-lg bg-light-bg-primary dark:bg-dark-bg-primary border-light-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-blue" />
            </div>
        </div>
        <button type="submit" className="w-full mt-6 bg-accent-blue text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
            Cadastrar Fornecedor
        </button>
    </form>
);

const FormOrgao = () => (
     <form>
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Nome do Órgão</label>
                <input type="text" className="w-full p-2 border rounded-lg bg-light-bg-primary dark:bg-dark-bg-primary border-light-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-blue" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">CNPJ</label>
                <input type="text" className="w-full p-2 border rounded-lg bg-light-bg-primary dark:bg-dark-bg-primary border-light-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-blue" />
            </div>
        </div>
        <button type="submit" className="w-full mt-6 bg-accent-blue text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
            Cadastrar Órgão
        </button>
    </form>
);


const Cadastros = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Área de Cadastros</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Cadastrar Novo Fornecedor">
                    <FormFornecedor />
                </Card>
                <Card title="Cadastrar Novo Órgão">
                    <FormOrgao />
                </Card>
            </div>
        </div>
    );
};

export default Cadastros;