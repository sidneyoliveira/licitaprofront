import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import PrivateRoute from './utils/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

// Layouts e Páginas
import Sidebar from './components/Sidebar';
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
                {/* Rotas Públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Agrupa todas as rotas privadas sob o PrivateRoute */}
                <Route element={<PrivateRoute />}>
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
                </Route>
            </Routes>
        </AuthProvider>
  );
}

export default App;