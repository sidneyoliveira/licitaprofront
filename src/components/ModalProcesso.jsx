import React, { useState, useEffect } from 'react';
import useAxios from '../hooks/useAxios';
import { useToast } from '../context/ToastContext';
import { XMarkIcon } from '@heroicons/react/24/solid';

// Função para obter a data de hoje no formato YYYY-MM-DD
const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const ModalProcesso = ({ closeModal, refreshProcessos, initialData }) => {
    const isEditing = initialData && initialData.id;
    const { showToast } = useToast();
    
    // O estado inicial agora inclui a data_cadastro por padrão
    const [formData, setFormData] = useState(
        initialData || {
            objeto: '', numero_processo: '', numero_certame: '', 
            modalidade: 'Pregão Eletrônico', // Valor padrão
            classificacao: 'Compras', // Valor padrão
            data_cadastro: getTodayDate(), // Valor padrão obrigatório
            orgao: '',
            tipo_organizacao: 'Lote', 
            vigencia_meses: '', 
            situacao: 'Aberto', 
            registro_precos: false, 
            data_publicacao: '', 
            data_abertura: '', // Campo opcional
            valor_referencia: '',
            entidade: '',
        }
    );
    
    const [entidades, setEntidades] = useState([]);
    const [orgaos, setOrgaos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const api = useAxios();

    useEffect(() => {
        api.get('/entidades/').then(res => setEntidades(res.data));
    }, [api]);

    useEffect(() => {
        if (formData.entidade) {
            api.get(`/orgaos/?entidade=${formData.entidade}`).then(res => setOrgaos(res.data));
        } else {
            setOrgaos([]);
        }
    }, [formData.entidade, api]);
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = name === 'registro_precos' ? (value === 'true') : (type === 'checkbox' ? checked : value);
        const newFormData = { ...formData, [name]: finalValue };

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
                            <label className="text-xs font-medium">Data do Cadastro *</label>
                            <input name="data_cadastro" type="date" value={formData.data_cadastro || ''} onChange={handleChange} className="w-full p-2 mt-1 border rounded-lg" required />
                        </div>
                         <div>
                            <label className="text-xs font-medium">Abertura da Contratação</label>
                            <input name="data_abertura" type="datetime-local" value={formData.data_abertura || ''} onChange={handleChange} className="w-full p-2 mt-1 border rounded-lg" />
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