// src/pages/Inicio.js
import React, { useState, useEffect, useContext } from 'react';
import useAxios from '../hooks/useAxios';
import Card from '../components/Card';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';

const StatItem = ({ title, value }) => (
    <div>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
    </div>
);

const Inicio = () => {
    const [stats, setStats] = useState(null);
    const [user, setUser] = useState(null);
    const api = useAxios();
    const { showToast } = useToast();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard-stats/');
                setStats(response.data);
            } catch (error) {
                console.error("Erro ao buscar estatísticas", error);
                showToast("Não foi possível carregar estatísticas.", "error");
            }
        };
        fetchStats();
    }, [api, showToast]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/me/');
                setUser(response.data);
            } catch (error) {
                console.error("Erro ao buscar usuário", error);
                showToast("Não foi possível carregar dados do usuário.", "error");
            }
        };
        fetchUser();
    }, [api, showToast]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Bom dia";
        if (hour < 18) return "Boa tarde";
        return "Boa noite";
    };

    const getDisplayName = () => {
        if (!user) return "usuário";
        if (user.first_name)
            return `${user.first_name}`;
        if (user.first_name)
            return user.first_name;
        return user.username || "usuário";
    };

    if (!stats) {
        return <div>Carregando...</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-3"
        >
            {/* Saudação no estilo do Header */}
            <div className="flex items-center justify-between bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-lg p-4 shadow-sm">
                <div>
                    <h1 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
                        {getGreeting()}, <span className="text-blue-600 dark:text-blue-400">{getDisplayName()}</span> 
                    </h1>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                        Bem-vindo de volta ao sistema. Aqui estão seus dados mais recentes.
                    </p>
                </div>
            </div>

            {/* Cards de estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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

            {/* Atividade recente */}
            <div>
                <Card title="Atividade Recente">
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                        Nenhuma atividade recente para mostrar.
                    </p>
                </Card>
            </div>
        </motion.div>
    );
};

export default Inicio;
