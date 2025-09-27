// src/components/ModalProcesso.jsx

import React, { useState, useEffect } from 'react';
import useAxios from '../hooks/useAxios';
import { useToast } from '../context/ToastContext';
import { XMarkIcon } from '@heroicons/react/24/solid';

const ModalProcesso = ({ closeModal, refreshProcessos, initialData }) => {
    const isEditing = initialData && initialData.id;
    const { showToast } = useToast();
    const [formData, setFormData] = useState(
        initialData || {
            objeto: '', numero_processo: '', numero_certame: '', modalidade: 'Pregão Eletrônico', classificacao: 'Compras',
            tipo_organizacao: 'Lote', vigencia_meses: '', situacao: 'Aberto', registro_precos: false, 
            data_publicacao: '', data_abertura: '', valor_referencia: '',
            entidade: '', orgao: '' // Corrigido de 'municipio' para 'entidade'
        }
    );
    const [entidades, setEntidades] = useState([]);
    const [orgaos, setOrgaos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const api = useAxios();

    // 1. Busca todas as entidades ao montar o componente
    useEffect(() => {
        api.get('/entidades/').then(res => setEntidades(res.data));
    }, [api]);

    // 2. Busca os órgãos sempre que uma entidade é selecionada
    useEffect(() => {
        if (formData.entidade) {
            api.get(`/orgaos/?entidade=${formData.entidade}`).then(res => setOrgaos(res.data));
        } else {
            setOrgaos([]);
        }
    }, [formData.entidade, api]);

    // 3. Lógica para preencher os campos em modo de EDIÇÃO
    useEffect(() => {
        if (isEditing && initialData.orgao) {
            // Busca os detalhes do órgão para encontrar sua entidade-mãe
            api.get(`/orgaos/${initialData.orgao}/`).then(response => {
                const orgaoData = response.data;
                // Atualiza o formulário com a entidade e o órgão corretos
                setFormData(prev => ({
                    ...prev,
                    entidade: orgaoData.entidade, // Define a entidade
                    orgao: orgaoData.id // Garante que o órgão está selecionado
                }));
            }).catch(err => {
                console.error("Erro ao buscar detalhes do órgão", err);
                showToast("Não foi possível carregar os detalhes da entidade/órgão.", "error");
            });
        }
    }, [isEditing, initialData, api, showToast]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = name === 'registro_precos' ? (value === 'true') : (type === 'checkbox' ? checked : value);
        const newFormData = { ...formData, [name]: finalValue };

        // Se o utilizador mudar a entidade, limpa o órgão selecionado
        if (name === 'entidade') {
            newFormData.orgao = '';
        }
        setFormData(newFormData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isEditing) {
                await api.put(`/processos/${initialData.id}/`, formData);
                showToast('Processo atualizado com sucesso!', 'success');
            } else {
                await api.post('/processos/', formData);
                showToast('Processo criado com sucesso!', 'success');
            }
            refreshProcessos();
            closeModal();
        } catch (error) {
            console.error('Erro ao salvar processo:', error.response?.data);
            showToast('Erro ao salvar processo. Verifique os campos.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const modalidades = ['Pregão Eletrônico', 'Concorrência Eletrônica', 'Dispensa Eletrônica', 'Inexigibilidade Eletrônica', 'Adesão a Registro de Preços', 'Credenciamento'];
    const classificacoes = ['Compras', 'Serviços Comuns', 'Serviços de Engenharia Comuns', 'Obras Comuns'];
    const situacoes = ['Aberto', 'Em Pesquisa', 'Aguardando Publicação', 'Publicado', 'Em Contratação', 'Adjudicado/Homologado', 'Revogado/Cancelado'];
    const organizacoes = ['Lote', 'Item'];

    const inputStyle = "w-full px-3 py-1.5 text-sm border rounded-lg bg-light-bg-primary dark:bg-dark-bg-primary";
    const labelStyle = "text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary";

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-xl w-full max-w-3xl relative">
                <h2 className="text-xl font-bold mb-4">{isEditing ? 'Editar Processo' : 'Criar Novo Processo'}</h2>
                <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto pr-2 space-y-3">
                    <div>
                        <label className={labelStyle}>Objeto *</label>
                        <textarea name="objeto" value={formData.objeto} onChange={handleChange} className={`${inputStyle} mt-1`} rows="3" required />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelStyle}>Número *</label>
                            <input name="numero_processo" value={formData.numero_processo} onChange={handleChange} className={`${inputStyle} mt-1`} required />
                        </div>
                        <div>
                            <label className={labelStyle}>Número do Certame *</label>
                            <input name="numero_certame" value={formData.numero_certame} onChange={handleChange} className={`${inputStyle} mt-1`} required />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelStyle}>Modalidade *</label>
                            <select name="modalidade" value={formData.modalidade} onChange={handleChange} className={`${inputStyle} mt-1`} required>
                                {modalidades.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelStyle}>Classificação *</label>
                            <select name="classificacao" value={formData.classificacao} onChange={handleChange} className={`${inputStyle} mt-1`} required>
                                {classificacoes.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                     <div className="grid md:grid-cols-2 gap-4">
                        <div>
                        <label className={labelStyle}>Entidade *</label>
                         <select name="entidade" value={formData.entidade} onChange={handleChange} className={`${inputStyle} mt-1`} required>
                            <option value="">Selecione...</option>
                            {entidades.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelStyle}>Órgão *</label>
                        <select name="orgao" value={formData.orgao} onChange={handleChange} className={`${inputStyle} mt-1`} required disabled={!formData.entidade}>
                            <option value="">Selecione uma entidade primeiro...</option>
                            {orgaos.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
                        </select>
                    </div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                           <label className={labelStyle}>Organização dos Itens</label>
                           <select name="tipo_organizacao" value={formData.tipo_organizacao || ''} onChange={handleChange} className={`${inputStyle} mt-1`}>
                                <option value="">Selecione...</option>
                                {organizacoes.map(o => <option key={o} value={o}>{o}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className={labelStyle}>Registro de Preços</label>
                           <select name="registro_precos" value={formData.registro_precos} onChange={handleChange} className={`${inputStyle} mt-1`}>
                               <option value={false}>Não</option>
                               <option value={true}>Sim</option>
                           </select>
                        </div>
                        <div>
                            <label className={labelStyle}>Situação</label>
                            <select name="situacao" value={formData.situacao || ''} onChange={handleChange} className={`${inputStyle} mt-1`}>
                                <option value="">Selecione...</option>
                                {situacoes.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                           <label className={labelStyle}>Vigência (Meses)</label>
                           <input name="vigencia_meses" type="number" value={formData.vigencia_meses || ''} onChange={handleChange} className={`${inputStyle} mt-1`} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={closeModal} className="py-2 px-4 rounded-lg text-sm">Cancelar</button>
                        <button type="submit" disabled={isLoading} className="py-2 px-4 bg-accent-blue text-white rounded-lg text-sm">
                            {isLoading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalProcesso;