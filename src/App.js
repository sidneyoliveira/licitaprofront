import React from 'react';
// A importação do 'Router' foi removida, pois ela deve estar no seu arquivo index.js
import { Routes, Route, Navigate } from 'react-router-dom';

// 1. O import da rota protegida foi comentado
// import PrivateRoute from './utils/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

// Layouts e Páginas
// A importação do Sidebar foi removida, pois ele já é usado dentro do DashboardLayout
import Login from './pages/Login';
import Register from './pages/Register';
import Inicio from './pages/Inicio';
import Processos from './pages/Processos';
import Cadastros from './pages/Cadastros';
import Fornecedores from './pages/Fornecedores';
import Perfil from './pages/Perfil';
import DashboardLayout from './components/DashboardLayout';


function App() {
  return (
        <AuthProvider>
            <Routes>
                {/* Rotas Públicas continuam acessíveis */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* --- PROTEÇÃO REMOVIDA TEMPORARIAMENTE --- */}
                {/* A rota <PrivateRoute> foi comentada para permitir acesso direto ao dashboard. */}
                {/* Para reativar a proteção, descomente a linha <Route element={<PrivateRoute />}> e a linha de fechamento </Route> abaixo. */}

                {/* <Route element={<PrivateRoute />}> */}
                    <Route path="/*" element={
                        <DashboardLayout>
                            <Routes>
                                <Route path="/" element={<Inicio />} />
                                <Route path="/processos" element={<Processos />} />
                                <Route path="/cadastros" element={<Cadastros />} />
                                <Route path="/fornecedores" element={<Fornecedores />} />
                                <Route path="/perfil" element={<Perfil />} />
                                {/* Qualquer outra rota privada desconhecida volta para o início */}
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </DashboardLayout>
                    } />
                {/* </Route> */}
            </Routes>
        </AuthProvider>
  );
}

export default App;