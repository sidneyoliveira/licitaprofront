// frontend/src/App.js

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

// Componentes de Lógica e Layout
import PrivateRoute from './utils/PrivateRoute';
import Layout from './components/Layout';

// Páginas Públicas
import Login from './pages/Login';
import Register from './pages/Register';

// Páginas Privadas
import Inicio from './pages/Inicio';
import Processos from './pages/Processos';
import Cadastros from './pages/Cadastros';
import Fornecedores from './pages/Fornecedores';
import Usuarios from './pages/Usuarios';
import Notificacoes from './pages/Notificacoes';
import Perfil from './pages/Perfil';
import Configuracoes from './pages/Configuracoes';

function App() {
  return (
    <>
      <Helmet>
        <title>Licita.PRO - Gestão de Licitações</title>
        <meta name="description" content="Sistema de gestão de processos licitatórios." />
      </Helmet>
      
      <Routes>
        {/* Rotas Públicas: Acessíveis sem login */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Agrupa todas as rotas privadas sob o PrivateRoute */}
        <Route element={<PrivateRoute />}>
            <Route path="/*" element={
                <Layout>
                    <Routes>
                        <Route path="/" element={<Inicio />} />
                        <Route path="/processos" element={<Processos />} />
                        <Route path="/cadastros" element={<Cadastros />} />
                        <Route path="/fornecedores" element={<Fornecedores />} />
                        <Route path="/usuarios" element={<Usuarios />} />
                        <Route path="/notificacoes" element={<Notificacoes />} />
                        <Route path="/perfil" element={<Perfil />} />
                        <Route path="/configuracoes" element={<Configuracoes />} />
                        
                        {/* Se nenhuma rota privada for encontrada, redireciona para a página inicial */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Layout>
            } />
        </Route>
      </Routes>
    </>
  );
}

export default App;