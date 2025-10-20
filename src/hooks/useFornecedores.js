import { useState, useEffect } from "react";
import axios from "axios";

export default function useFornecedores(processoId) {
  const [fornecedores, setFornecedores] = useState([]);

  useEffect(() => {
    if (processoId) {
      axios.get(`/api/processos/${processoId}/fornecedores`).then(res => setFornecedores(res.data));
    }
  }, [processoId]);

  function addFornecedor(f) {
    axios.post(`/api/processos/${processoId}/fornecedores`, f).then(res => setFornecedores(prev => [...prev, res.data]));
  }

  function editFornecedor(id, f) {
    axios.put(`/api/fornecedores/${id}`, f).then(res => setFornecedores(prev => prev.map(forn => (forn.id === id ? res.data : forn))));
  }

  function deleteFornecedor(id) {
    axios.delete(`/api/fornecedores/${id}`).then(() => setFornecedores(prev => prev.filter(f => f.id !== id)));
  }

  return { fornecedores, addFornecedor, editFornecedor, deleteFornecedor };
}
