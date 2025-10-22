// src/hooks/useItens.js
import { useState, useEffect, useCallback } from "react";
import useAxios from "./useAxios"; // Garanta que o caminho para useAxios está correto
import { useToast } from '../context/ToastContext';

export default function useItens(processoId) {
  const [itens, setItens] = useState([]);
  const api = useAxios();
  const { showToast } = useToast();

  const fetchItens = useCallback(async () => {
    if (processoId) {
      try {
        const res = await api.get(`/processos/${processoId}/itens/`);
        setItens(res.data);
      } catch (error) {
        showToast('Erro ao carregar os itens do processo.', 'error');
      }
    }
  }, [processoId, api, showToast]);

  useEffect(() => {
    fetchItens();
  }, [fetchItens]);

  const addItem = async (itemData) => {
    if (processoId) {
      try {
        const res = await api.post(`/itens/`, { ...itemData, processo: processoId });
        setItens(prev => [...prev, res.data]);
        showToast('Item adicionado com sucesso!', 'success');
      } catch (error) {
        showToast('Erro ao adicionar o item.', 'error');
      }
    }
  };

  const editItem = async (id, itemData) => {
    try {
      const res = await api.put(`/itens/${id}/`, itemData);
      setItens(prev => prev.map(item => (item.id === id ? res.data : item)));
      showToast('Item atualizado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao atualizar o item.', 'error');
    }
  };

  const deleteItem = async (id) => {
    try {
      await api.delete(`/itens/${id}/`);
      setItens(prev => prev.filter(item => item.id !== id));
      showToast('Item removido com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao remover o item.', 'error');
    }
  };

  return { itens, addItem, editItem, deleteItem, refreshItens: fetchItens };
}