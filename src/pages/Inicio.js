import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Users, Building2 } from "lucide-react";
import useAxios from "../hooks/useAxios";

/**
 * Página Início (novo designer L3 SOLUTIONS)
 * - Mantém comunicação com backend via useAxios
 * - Visual modernizado com a cor azul #1789D2
 */

const Inicio = () => {
  const api = useAxios();
  const [resumo, setResumo] = useState({ processos: 0, fornecedores: 0, entidades: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResumo = async () => {
      setLoading(true);
      try {
        const res = await api.get("dashboard-stats/"); 
        if (res.data) setResumo(res.data);
      } catch (error) {
        console.error("Erro ao carregar resumo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResumo();
  }, [api]);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Início
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Visão geral do sistema
        </p>
      </div>

      {/* Cards principais */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* Card Processos */}
        <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Processos</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
              {loading ? "..." : resumo.processos_em_andamento}
            </div>
          </div>
          <div
            className="w-10 h-10 flex items-center justify-center rounded-md text-white shadow"
            style={{ background: "linear-gradient(135deg,#1789D2,#0F7BC2)" }}
          >
            <FileText size={20} />
          </div>
        </div>

        {/* Card Fornecedores */}
        <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Fornecedores</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
              {loading ? "..." : resumo.total_fornecedores}
            </div>
          </div>
          <div
            className="w-10 h-10 flex items-center justify-center rounded-md text-white shadow"
            style={{ background: "linear-gradient(135deg,#1789D2,#0F7BC2)" }}
          >
            <Users size={20} />
          </div>
        </div>

        {/* Card Entidades */}
        <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Entidades</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
              {loading ? "..." : resumo.total_orgaos}
            </div>
          </div>
          <div
            className="w-10 h-10 flex items-center justify-center rounded-md text-white shadow"
            style={{ background: "linear-gradient(135deg,#1789D2,#0F7BC2)" }}
          >
            <Building2 size={20} />
          </div>
        </div>
      </motion.div>

      {/* Seção adicional (opcional) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-700 rounded-lg p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Últimas Atualizações
        </h2>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
          <li>- Processos recentemente publicados</li>
          <li>- Licitações atualizadas</li>
          <li>- Fornecedores cadastrados</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default Inicio;
