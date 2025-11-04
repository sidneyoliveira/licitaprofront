import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import PrivateRoute from './utils/PrivateRoute';
import Layout from './components/Layout';

// Públicas
import Login from './pages/Login';
import Register from './pages/Register';

// Privadas
import Inicio from './pages/Inicio';
import Processos from './pages/Processos';
import Entidades from './pages/Entidades';
import Fornecedores from './pages/Fornecedores';
import Usuarios from './pages/Usuarios';
import Notificacoes from './pages/Notificacoes';
import Perfil from './pages/Perfil';
import Configuracoes from './pages/Configuracoes';
import NewProcess from './pages/NewProcess';
import PageProcess from './pages/PageProcess';
import CompleteProfile from './pages/CompleteProfile';

function App() {
  return (
    <>
      <Helmet>
        <title>L3 Solutions - Gestão de Processos</title>
        <meta name="description" content="Sistema de gestão de processos licitatórios." />
      </Helmet>

      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Privadas */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Inicio />} />

            <Route path="processos" element={<Processos />} />
            <Route path="processos/novo" element={<NewProcess />} />
            <Route path="processos/:id" element={<PageProcess />} />

            <Route path="entidades" element={<Entidades />} />
            <Route path="fornecedores" element={<Fornecedores />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="complete-profile" element={<CompleteProfile />} />
            <Route path="notificacoes" element={<Notificacoes />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="configuracoes" element={<Configuracoes />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
