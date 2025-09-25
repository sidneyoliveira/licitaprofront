import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = () => {
    const { user } = useContext(AuthContext);

    // Se o usuário não existir, redireciona para a página de login
    if (!user) {
        return <Navigate to="/login" />;
    }

    // Se o usuário existir, renderiza a página filha (o dashboard)
    return <Outlet />;
};

export default PrivateRoute;