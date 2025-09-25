// src/pages/Inicio.js
import React, { useState, useEffect } from 'react';
import useAxios from '../hooks/useAxios';
import Card from '../components/Card'; // Importe nosso novo card

const StatItem = ({ title, value }) => (
    <div>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
    </div>
);

const Inicio = () => {
    const [stats, setStats] = useState(null);
    const api = useAxios();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard-stats/');
                setStats(response.data);
            } catch (error) {
                console.error("Erro ao buscar estatísticas", error);
            }
        };
        fetchStats();
    }, []);

    if (!stats) {
        return <div>Carregando...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <StatItem title="Total de Processos" value={stats.total_processos} />
                </Card>
                <Card>
                    <StatItem title="Processos em Andamento" value={stats.processos_em_andamento} />
                </Card>
                <Card>
                    <StatItem title="Fornecedores Cadastrados" value={stats.total_fornecedores} />
                </Card>
                <Card>
                    <StatItem title="Órgãos Cadastrados" value={stats.total_orgaos} />
                </Card>
            </div>
            
            {/* Você pode adicionar mais cards aqui */}
            <div className="mt-6">
                <Card title="Atividade Recente">
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">Nenhuma atividade recente para mostrar.</p>
                </Card>
            </div>
        </div>
    );
};

export default Inicio;