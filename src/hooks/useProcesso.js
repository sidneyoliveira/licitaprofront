import { useState, useEffect, useCallback } from 'react';
import useAxios from '../hooks/useAxios';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function useProcesso(initialId = null) {
    const api = useAxios();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [processoId, setProcessoId] = useState(initialId);
    const [isEditing, setIsEditing] = useState(!!initialId);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        objeto: '', numero_processo: '', data_processo:'', modalidade: '', 
        classificacao: '', tipo_organizacao: '', registro_precos: false, orgao: '', 
        entidade: '', valor_referencia: '', numero_certame: '', data_abertura: '', situacao: 'Em Pesquisa',
        vigencia_meses: 12,
    });

    const [itens, setItens] = useState([]);
    const [editingItem, setEditingItem] = useState(null);

    const [fornecedores, setFornecedores] = useState([]);
    const [editingFornecedor, setEditingFornecedor] = useState(null);

    const formatDateTimeForInput = (isoString) => {
        if (!isoString) return '';
        try { return new Date(isoString).toISOString().slice(0,16); }
        catch { return ''; }
    };

    const fetchProcesso = useCallback(async (id) => {
        if(!id) return;
        setIsLoading(true);
        try {
            const res = await api.get(`/processos/${id}/`);
            const data = res.data;
            setFormData(prev => ({ ...prev, ...data, data_abertura: formatDateTimeForInput(data.data_abertura) }));
            setItens(data.itens || []);
            setFornecedores(data.fornecedores || []);
        } catch(e) {
            showToast('Erro ao carregar processo.', 'error');
            navigate('/processos');
        } finally { setIsLoading(false); }
    }, [api, showToast, navigate]);

    const saveProcesso = useCallback(async () => {
        setIsLoading(true);
        try {
            let res;
            if(isEditing && processoId){
                res = await api.put(`/processos/${processoId}/`, formData);
                showToast('Processo atualizado!', 'success');
            } else {
                res = await api.post('/processos/', formData);
                showToast('Processo criado!', 'success');
                setProcessoId(res.data.id);
                setIsEditing(true);
            }
            const updated = res.data;
            setFormData(prev => ({ ...prev, ...updated, data_abertura: formatDateTimeForInput(updated.data_abertura) }));
            return updated;
        } catch {
            showToast('Erro ao salvar processo.', 'error');
        } finally { setIsLoading(false); }
    }, [api, formData, isEditing, processoId, showToast]);

    const addItem = useCallback(async (itemData) => {
        if(!processoId) return showToast('Salve o processo primeiro.', 'error');
        try {
            const nextOrdem = itens.length > 0 ? Math.max(...itens.map(i=>i.ordem||0))+1 : 1;
            await api.post('/itens/', { ...itemData, processo: processoId, ordem: nextOrdem });
            fetchProcesso(processoId);
        } catch { showToast('Erro ao adicionar item.', 'error'); }
    }, [api, fetchProcesso, itens, processoId, showToast]);

    const editItem = async (id, data) => {
        try {
            await api.patch(`/itens/${id}/`, data);
            setEditingItem(null);
            fetchProcesso(processoId);
        } catch { showToast('Erro ao atualizar item.', 'error'); }
    };

    const deleteItem = async (id) => {
        try { await api.delete(`/itens/${id}/`); fetchProcesso(processoId); }
        catch { showToast('Erro ao remover item.', 'error'); }
    };

    const addFornecedor = async (data) => {
        try {
            const res = await api.post('/fornecedores/', data);
            await api.post(`/processos/${processoId}/adicionar_fornecedor/`, { fornecedor_id: res.data.id });
            fetchProcesso(processoId);
        } catch { showToast('Erro ao adicionar fornecedor.', 'error'); }
    };

    const editFornecedor = async (id, data) => {
        try {
            await api.patch(`/fornecedores/${id}/`, data);
            setEditingFornecedor(null);
            fetchProcesso(processoId);
        } catch { showToast('Erro ao editar fornecedor.', 'error'); }
    };

    const removeFornecedor = async (id) => {
        try {
            await api.post(`/processos/${processoId}/remover_fornecedor/`, { fornecedor_id: id });
            fetchProcesso(processoId);
        } catch { showToast('Erro ao remover fornecedor.', 'error'); }
    };

    useEffect(() => {
        if(processoId) fetchProcesso(processoId);
    }, [fetchProcesso, processoId]);

    return {
        formData, setFormData, saveProcesso, isLoading, isEditing,
        itens, addItem, editItem, deleteItem, editingItem, setEditingItem,
        fornecedores, addFornecedor, editFornecedor, removeFornecedor, editingFornecedor, setEditingFornecedor
    };
}
