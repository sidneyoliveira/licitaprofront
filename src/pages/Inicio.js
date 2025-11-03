// src/pages/Inicio.js
import React, { useState, useEffect, useContext } from 'react';
import useAxios from '../hooks/useAxios';
import Card from '../components/Card';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';

const StatItem = ({ title, value }) => (
  <div>
    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{title}</p>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

const Inicio = () => {
  const [stats, setStats] = useState(null);
  const [userData, setUserData] = useState(null);
  const api = useAxios();
  const { user } = useContext(AuthContext);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getDisplayName = () => {
    if (userData?.first_name)
      return `${userData.first_name} `;
    if (userData?.first_name)
      return userData.first_name;
    return user?.username || 'Usuário';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, userRes] = await Promise.all([
          api.get('/dashboard-stats/'),
          api.get('/me/'),
        ]);
        setStats(statsRes.data);
        setUserData(userRes.data);
      } catch (error) {
        console.error('Erro ao buscar dados iniciais:', error);
      }
    };

    fetchData();
  }, [api]);


  if (!stats) {
    return (
      <div className="flex justify-center items-center h-64 text-dark-text-primary dark:text-dark-text-primary">
        Carregando informações...
      </div>
    );
  }

  return (
    <div
      className="space-y-4"
    >
      {/* Saudação */}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
    </div>
  );
};

export default Inicio;
