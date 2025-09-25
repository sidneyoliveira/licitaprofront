// src/pages/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/AxiosInstance'; 

const Register = () => {
    const [formData, setFormData] = useState({
        username: '', email: '', password: '', first_name: '',
        last_name: '', cpf: '', data_nascimento: ''
    });
    // Novos estados para uma melhor UX
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({}); // Guarda os erros de validação
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Inicia o carregamento
        setErrors({}); // Limpa os erros antigos

        try {
            await axiosInstance.post('/register/', formData);
            alert('Usuário cadastrado com sucesso! Você será redirecionado para o login.');
            navigate('/login');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                // Se o erro for de validação (400), guarda as mensagens
                setErrors(error.response.data);
            } else {
                // Para outros erros (conexão, etc.)
                setErrors({ general: "Não foi possível conectar ao servidor. Tente novamente." });
            }
        } finally {
            setIsLoading(false); // Finaliza o carregamento
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-2xl my-8">
                <h2 className="text-2xl font-bold text-center mb-6">Cadastro de Novo Usuário</h2>
                
                {/* Mensagem de erro geral */}
                {errors.general && <p className="text-red-500 text-center mb-4">{errors.general}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                        {/* Nome */}
                        <div>
                            <label className="block text-gray-700 mb-1" htmlFor="first_name">Nome</label>
                            <input className="w-full px-3 py-2 border rounded" type="text" name="first_name" onChange={handleChange} required />
                            {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                        </div>
                        {/* Sobrenome */}
                        <div>
                            <label className="block text-gray-700 mb-1" htmlFor="last_name">Sobrenome</label>
                            <input className="w-full px-3 py-2 border rounded" type="text" name="last_name" onChange={handleChange} required />
                            {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                        </div>
                        {/* Nome de Usuário */}
                        <div>
                            <label className="block text-gray-700 mb-1" htmlFor="username">Nome de Usuário</label>
                            <input className="w-full px-3 py-2 border rounded" type="text" name="username" onChange={handleChange} required />
                            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                        </div>
                        {/* Email */}
                        <div>
                            <label className="block text-gray-700 mb-1" htmlFor="email">Email</label>
                            <input className="w-full px-3 py-2 border rounded" type="email" name="email" onChange={handleChange} required />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        {/* CPF */}
                        <div>
                            <label className="block text-gray-700 mb-1" htmlFor="cpf">CPF</label>
                            <input className="w-full px-3 py-2 border rounded" type="text" name="cpf" onChange={handleChange} />
                            {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>}
                        </div>
                        {/* Data de Nascimento */}
                        <div>
                            <label className="block text-gray-700 mb-1" htmlFor="data_nascimento">Data de Nascimento</label>
                            <input className="w-full px-3 py-2 border rounded" type="date" name="data_nascimento" onChange={handleChange} />
                            {errors.data_nascimento && <p className="text-red-500 text-xs mt-1">{errors.data_nascimento}</p>}
                        </div>
                        {/* Senha */}
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 mb-1" htmlFor="password">Senha</label>
                            <input className="w-full px-3 py-2 border rounded" type="password" name="password" onChange={handleChange} required />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>
                    </div>
                    
                    <button type="submit" disabled={isLoading} className="w-full mt-6 bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:bg-green-300">
                        {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <p className="text-gray-600">Já tem uma conta?{' '}<Link to="/login" className="text-blue-500 hover:underline">Faça o login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;