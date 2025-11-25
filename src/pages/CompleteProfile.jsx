import React, { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { axiosInstance } from "../api/config";
import { useNavigate } from "react-router-dom";

const CompleteProfile = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.put("/me/", formData);
      showToast("Perfil atualizado com sucesso!", "success");
      navigate("/"); // ✅ vai para dashboard após finalizar
    } catch (error) {
      showToast("Erro ao salvar dados. Tente novamente.", "error");
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-accent-blue mb-6">
          Complete seu cadastro
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border p-3 rounded-xl"
            type="text"
            name="first_name"
            placeholder="Nome"
            onChange={handleChange}
            required
          />

          <input
            className="w-full border p-3 rounded-xl"
            type="text"
            name="last_name"
            placeholder="Sobrenome"
            onChange={handleChange}
            required
          />

          <input
            className="w-full border p-3 rounded-xl"
            type="text"
            name="phone"
            placeholder="Telefone"
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="w-full bg-accent-blue text-white py-3 rounded-xl"
          >
            Finalizar cadastro
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
