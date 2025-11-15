// frontend/src/components/EntidadeOrgaoModal.jsx

import React, { useState, useEffect } from 'react';
import useAxios from '../hooks/useAxios';
import { useToast } from '../context/ToastContext';
import { XMarkIcon } from '@heroicons/react/24/solid';

export const EntidadeOrgaoModal = ({ item, entidades, onClose, onSave }) => {
  const { data, type, parentEntidadeId } = item;
  const isEditing = data && data.id;
  const isEntidade = type === 'Entidade';

  const [formData, setFormData] = useState({});
  const [isImportingPncp, setIsImportingPncp] = useState(false);

  const api = useAxios();
  const { showToast } = useToast();

  useEffect(() => {
    if (isEntidade) {
      setFormData({
        nome: data?.nome || '',
        cnpj: data?.cnpj || '',
      });
    } else {
      // é Órgão
      setFormData({
        nome: data?.nome || '',
        entidade: data?.entidade || parentEntidadeId || '',
      });
    }
  }, [item, isEntidade, data, parentEntidadeId]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isEntidade ? 'entidade' : 'orgaos';
    try {
      if (isEditing) {
        await api.put(`/${endpoint}/${data.id}/`, formData);
        showToast(`${type} atualizado com sucesso!`, 'success');
      } else {
        await api.post(`/${endpoint}/`, formData);
        showToast(`${type} cadastrado com sucesso!`, 'success');
      }
      onSave();
    } catch (error) {
      showToast(`Erro ao salvar ${type}.`, 'error');
    }
  };

  // ===== Importação PNCP: só aparece em "Nova Entidade" =====
  const handleImportPncp = async () => {
    if (!isEntidade || isEditing) return;
    const digits = (formData.cnpj || '').replace(/\D/g, '');
    if (digits.length !== 14) {
      showToast('Informe um CNPJ válido com 14 dígitos.', 'error');
      return;
    }
    setIsImportingPncp(true);
    try {
      const res = await api.post('/orgaos/importar-pncp/', { cnpj: digits });
      const ent = res.data?.entidade;
      const created = res.data?.created ?? 0;
      const updated = res.data?.updated ?? 0;
      showToast(
        `PNCP: ${created} órgãos criados e ${updated} atualizados para ${ent?.nome || 'a entidade'}.`,
        'success'
      );
      // Atualiza listas e fecha modal conforme fluxo existente
      onSave();
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Erro ao importar do PNCP.';
      showToast(msg, 'error');
    } finally {
      setIsImportingPncp(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
      <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-xl w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? `Editar ${type}` : `Cadastrar ${type}`}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isEntidade ? (
            <>
              <div>
                <label className="text-xs font-medium">Nome da Entidade</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium">CNPJ</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleChange}
                    className="flex-1 p-2 border rounded-lg"
                  />
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={handleImportPncp}
                      disabled={isImportingPncp}
                      className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm"
                      title="Importar unidades do PNCP usando este CNPJ"
                    >
                      {isImportingPncp ? 'Importando…' : 'Importar PNCP'}
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-medium">Vincular à Entidade</label>
                <select
                  name="entidade"
                  value={formData.entidade}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded-lg"
                  required
                >
                  <option value="">Selecione uma entidade...</option>
                  {entidades.map((ent) => (
                    <option key={ent.id} value={ent.id}>
                      {ent.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Nome do Órgão</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded-lg"
                  required
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-lg text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-accent-blue text-white rounded-lg text-sm"
              disabled={isImportingPncp}
            >
              {isEditing ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
