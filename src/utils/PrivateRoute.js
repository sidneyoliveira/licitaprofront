import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { initializing, authTokens } = useAuth();

  if (initializing) {
    return <div className="p-6">Carregando…</div>;
  }

  return authTokens ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
