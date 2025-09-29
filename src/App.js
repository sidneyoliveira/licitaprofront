// frontend/src/App.js

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './utils/PrivateRoute';
import DashboardLayout from './components/DashboardLayout';

// Importa todas as páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Inicio from './pages/Inicio';
import Processos from './pages/Processos';
import Cadastros from './pages/Cadastros';
import Fornecedores from './pages/Fornecedores';
import Perfil from './pages/Perfil';
import Configuracoes from './pages/Configuracoes';

function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Agrupa todas as rotas privadas */}
      <Route element={<PrivateRoute />}>
        <Route path="/*" element={
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<Inicio />} />
              <Route path="/processos" element={<Processos />} />
              <Route path="/cadastros" element={<Cadastros />} />
              <Route path="/fornecedores" element={<Fornecedores />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              
              {/* Rota Placeholder para Meus Arquivos */}
              <Route path="/arquivos" element={
                <div className="p-6">
                  <h1 className="text-3xl font-bold">Meus Arquivos</h1>
                  <p className="mt-4">Esta página está em construção.</p>
                </div>
              } />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </DashboardLayout>
        } />
      </Route>
    </Routes>
  );
}

export default App;