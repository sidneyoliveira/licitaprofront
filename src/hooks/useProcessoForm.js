import { useState, useEffect } from "react";
import axios from "axios";

export default function useProcessoForm(processoId) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (processoId) {
      axios.get(`/api/processos/${processoId}`).then(res => setFormData(res.data));
    }
  }, [processoId]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleSave(e) {
    e.preventDefault();
    if (processoId) axios.put(`/api/processos/${processoId}`, formData);
    else axios.post(`/api/processos`, formData);
  }

  return { formData, handleChange, handleSave };
}
