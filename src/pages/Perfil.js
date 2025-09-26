import React, { useState, useEffect } from 'react';
import useAxios from '../hooks/useAxios';
import Card from '../components/Card';
import { useToast } from '../context/ToastContext';

const Perfil = () => {
    const [user, setUser] = useState(null);
    const api = useAxios();
    const { showToast } = useToast();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/me/');
                setUser(response.data);
            } catch {
                showToast('Não foi possível carregar os dados do usuário.', 'error');
            }
        };
        fetchUser();
    }, [api]);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put('/me/', user);
            showToast('Perfil atualizado com sucesso!', 'success');
            setUser(response.data);
        } catch (error) {
            showToast('Falha ao atualizar o perfil.', 'error');
        }
    };

    if (!user) return <div>Carregando perfil...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>
            <Card>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nome</label>
                            <input type="text" name="first_name" defaultValue={user.first_name} className="w-full p-2 border rounded-lg bg-light-bg-primary dark:bg-dark-bg-primary border-light-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-blue" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Sobrenome</label>
                            <input type="text" name="last_name" defaultValue={user.last_name} className="w-full p-2 border rounded-lg bg-light-bg-primary dark:bg-dark-bg-primary border-light-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-blue" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Nome de Usuário</label>
                            <input type="text" name="username" value={user.username} readOnly className="w-full p-2 border rounded-lg bg-light-border dark:bg-dark-border cursor-not-allowed text-light-text-secondary dark:text-dark-text-secondary" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input type="email" name="email" defaultValue={user.email} className="w-full p-2 border rounded-lg bg-light-bg-primary dark:bg-dark-bg-primary border-light-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-blue" />
                        </div>
                    </div>
                    <button type="submit" className="mt-6 bg-accent-blue text-white py-2 px-4 rounded-lg">
                        Salvar Alterações
                    </button>
                </form>
            </Card>
        </div>
    );
};

export default Perfil;