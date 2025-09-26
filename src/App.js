// frontend/src/App.js

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Importa a lógica da rota protegida
import PrivateRoute from './utils/PrivateRoute';

// Importa o layout principal
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
      {/* Rotas Públicas: Acessíveis sem login */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Agrupa todas as rotas privadas sob o PrivateRoute */}
      <Route element={<PrivateRoute />}>
        {/* A rota "catch-all" (/*) renderiza o layout do dashboard */}
        <Route path="/*" element={
          <DashboardLayout>
            {/* As rotas filhas são renderizadas dentro do layout */}
            <Routes>
              <Route path="/" element={<Inicio />} />
              <Route path="/processos" element={<Processos />} />
              <Route path="/cadastros" element={<Cadastros />} />
              <Route path="/fornecedores" element={<Fornecedores />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              
              {/* Se nenhuma rota privada for encontrada, redireciona para a página inicial */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </DashboardLayout>
        } />
      </Route>
    </Routes>
  );
}

export default App;