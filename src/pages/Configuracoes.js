// src/pages/Configuracoes.js
import React from 'react';
import Card from '../components/Card';
import { Cog8ToothIcon } from '@heroicons/react/24/outline';

const Configuracoes = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Configurações</h1>
            <Card>
                <div className="text-center py-12">
                    <Cog8ToothIcon className="mx-auto h-16 w-16 text-light-text-secondary dark:text-dark-text-secondary" />
                    <h3 className="mt-4 text-lg font-medium">Em Desenvolvimento</h3>
                    <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        A área de configurações gerais do sistema estará disponível aqui em breve.
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default Configuracoes;