// frontend/src/pages/NewProcess.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrashIcon,
  PlusIcon,
  PencilIcon,
  ClipboardDocumentIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import axios from "axios";

import useAxios from "../hooks/useAxios";
import { useToast } from "../context/ToastContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import DadosGeraisForm from "../components/DadosGeraisForm";

/* ────────────────────────────────────────────────────────────────────────── */
/* 1. UI HELPERS (INPUTS, BUTTON, CHECKBOX, TABS)                            */
/* ────────────────────────────────────────────────────────────────────────── */

const inputClass =
  "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-blue";

const labelClass =
  "text-[11px] font-semibold tracking-wide text-slate-600 dark:text-slate-300 uppercase";

const Button = ({
  children,
  className = "",
  variant = "primary",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-accent-blue/60 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap";

  const variants = {
    primary:
      "bg-accent-blue text-white hover:bg-accent-blue/90 shadow-sm",
    outline:
      "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800",
    ghost:
      "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const TabButton = ({ label, isActive, onClick, isDisabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={isDisabled}
    className={`relative px-4 py-3 text-sm font-semibold transition-colors ${
      isDisabled
        ? "text-slate-400 dark:text-slate-600 cursor-not-allowed"
        : isActive
        ? "text-slate-900 dark:text-white"
        : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
    }`}
  >
    {label}
    {isActive && (
      <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#004aad]" />
    )}
  </button>
);

const StyledCheckbox = ({ checked, onChange, className = "" }) => (
  <label
    className={`relative inline-flex items-center justify-center cursor-pointer select-none ${className}`}
    aria-checked={checked}
    role="checkbox"
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="peer absolute inset-0 z-20 m-0 h-full w-full cursor-pointer opacity-0"
    />
    <div
      className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded border-2 border-slate-300 dark:border-slate-600 transition-colors peer-checked:border-[#004aad] peer-checked:bg-[#004aad]`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={3}
        stroke="currentColor"
        className={`h-3 w-3 text-white ${checked ? "opacity-100" : "opacity-0"}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 12.75l6 6 9-13.5"
        />
      </svg>
    </div>
  </label>
);

/* ────────────────────────────────────────────────────────────────────────── */
/* 2. HELPERS DE NEGÓCIO                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

const formatDateTimeForInput = (isoString) => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    const timezoneOffset = d.getTimezoneOffset() * 60000;
    const localDate = new Date(d.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
  } catch {
    return "";
  }
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "Não informado";
  return parseFloat(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

/* ────────────────────────────────────────────────────────────────────────── */
/* 3. MODAL DE ITENS                                                         */
/* ────────────────────────────────────────────────────────────────────────── */

const ItemModal = ({ isOpen, onClose, onSave, itemSelecionado }) => {
  const [formData, setFormData] = useState({
    descricao: "",
    unidade: "",
    quantidade: "",
    valor_estimado: "",
  });

  useEffect(() => {
    if (itemSelecionado) {
      setFormData(itemSelecionado);
    } else {
      setFormData({
        descricao: "",
        unidade: "",
        quantidade: "",
        valor_estimado: "",
      });
    }
  }, [itemSelecionado, isOpen]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof onSave === "function") onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 p-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-lg bg-white dark:bg-dark-bg-secondary rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
          initial={{ scale: 0.96, y: 10, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.96, y: 10, opacity: 0 }}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#004aad] dark:text-blue-400">
                <ClipboardDocumentIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">
                  {itemSelecionado ? "Editar Item" : "Adicionar Item"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Informe os dados básicos do item do processo.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <XMarkMini />
            </button>
          </div>

          {/* BODY */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className={labelClass}>Descrição *</label>
              <input
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Unidade</label>
                <input
                  name="unidade"
                  value={formData.unidade}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Quantidade *</label>
                <input
                  name="quantidade"
                  type="number"
                  value={formData.quantidade}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Valor Estimado *</label>
                <input
                  name="valor_estimado"
                  type="number"
                  step="0.01"
                  value={formData.valor_estimado}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </form>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {itemSelecionado ? "Salvar alterações" : "Adicionar item"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// mini X icon (pra não importar mais um do heroicons)
const XMarkMini = () => (
  <svg
    className="w-4 h-4 text-slate-500 dark:text-slate-300"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

/* ────────────────────────────────────────────────────────────────────────── */
/* 4. MODAL DE FORNECEDORES                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

export const FornecedorModal = ({
  isOpen,
  onClose,
  onLink,
  onSaveNew,
  onSaveEdit,
  catalogo = [],
  fornecedorSelecionado,
}) => {
  const { showToast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    cnpj: "",
    razao_social: "",
    nome_fantasia: "",
    porte: "",
    telefone: "",
    email: "",
    cep: "",
    logradouro: "",
    numero: "",
    bairro: "",
    complemento: "",
    uf: "",
    municipio: "",
  });

  const isEditing = Boolean(fornecedorSelecionado);
  const showForm = isEditing || isCreating;

  useEffect(() => {
    if (isEditing && fornecedorSelecionado) {
      setFormData(fornecedorSelecionado);
      setIsCreating(true);
    } else {
      setFormData({
        cnpj: "",
        razao_social: "",
        nome_fantasia: "",
        porte: "",
        telefone: "",
        email: "",
        cep: "",
        logradouro: "",
        numero: "",
        bairro: "",
        complemento: "",
        uf: "",
        municipio: "",
      });
      setIsCreating(false);
    }
  }, [isEditing, fornecedorSelecionado, isOpen]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const buscarCNPJ = async () => {
    if (!formData.cnpj)
      return showToast("Digite um CNPJ válido.", "error");

    try {
      const cnpjLimpo = formData.cnpj.replace(/[^\d]/g, "");
      const res = await axios.get(
        `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`
      );
      const data = res.data;

      setFormData((prev) => ({
        ...prev,
        razao_social: data.razao_social || "",
        nome_fantasia: data.nome_fantasia || "",
        porte: data.porte || "",
        telefone: data.ddd_telefone_1 || "",
        email: data.email || "",
        cep: data.cep || "",
        logradouro: data.logradouro || "",
        numero: data.numero || "",
        bairro: data.bairro || "",
        complemento: data.complemento || "",
        uf: data.uf || "",
        municipio: data.municipio || "",
      }));

      showToast("Dados carregados com sucesso!", "success");
    } catch {
      showToast(
        "Erro ao buscar CNPJ. Verifique o número e tente novamente.",
        "error"
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEditing) {
        await onSaveEdit(formData);
      } else {
        await onSaveNew(formData);
      }
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCatalogo = (catalogo || []).filter((f) => {
    const term = (searchTerm || "").toLowerCase();
    return (
      (f?.razao_social || "").toLowerCase().includes(term) ||
      (f?.cnpj || "").toLowerCase().includes(term)
    );
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-900/60 p-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-5xl bg-white dark:bg-dark-bg-secondary rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
          initial={{ scale: 0.96, y: 10, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.96, y: 10, opacity: 0 }}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#004aad] dark:text-blue-400">
                <BuildingOffice2Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">
                  {isEditing
                    ? "Editar Fornecedor"
                    : isCreating
                    ? "Cadastrar Novo Fornecedor"
                    : "Vincular Fornecedor"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Busque no catálogo ou cadastre um novo fornecedor para este
                  processo.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing && (
                <Button
                  variant="ghost"
                  className="text-xs md:text-sm"
                  onClick={() => setIsCreating((prev) => !prev)}
                >
                  {isCreating ? "Buscar no catálogo" : "Novo fornecedor"}
                </Button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <XMarkMini />
              </button>
            </div>
          </div>

          {/* BODY */}
          <div className="p-5">
            {showForm ? (
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"
              >
                <div className="md:col-span-1">
                  <label className={labelClass}>CNPJ</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="cnpj"
                      value={formData.cnpj}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                    {!isEditing && (
                      <Button
                        type="button"
                        variant="primary"
                        className="px-3"
                        onClick={buscarCNPJ}
                      >
                        Buscar
                      </Button>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Razão Social</label>
                  <input
                    type="text"
                    name="razao_social"
                    value={formData.razao_social}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr] gap-4">
                  <div>
                    <label className={labelClass}>Nome Fantasia</label>
                    <input
                      name="nome_fantasia"
                      value={formData.nome_fantasia}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>E-mail</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Telefone</label>
                    <input
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Porte</label>
                    <input
                      name="porte"
                      value={formData.porte}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-[1fr_3fr_1fr] gap-4">
                  <div>
                    <label className={labelClass}>CEP</label>
                    <input
                      name="cep"
                      value={formData.cep}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Logradouro</label>
                    <input
                      name="logradouro"
                      value={formData.logradouro}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Número</label>
                    <input
                      name="numero"
                      value={formData.numero}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-[2fr_2fr_2fr_1fr] gap-4">
                  <div>
                    <label className={labelClass}>Bairro</label>
                    <input
                      name="bairro"
                      value={formData.bairro}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Complemento</label>
                    <input
                      name="complemento"
                      value={formData.complemento}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Município</label>
                    <input
                      name="municipio"
                      value={formData.municipio}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>UF</label>
                    <input
                      name="uf"
                      value={formData.uf}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="md:col-span-3 flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800 mt-2">
                  <Button variant="ghost" type="button" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button variant="primary" type="submit" disabled={isSaving}>
                    {isSaving ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Buscar por CNPJ ou Razão Social..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={inputClass}
                />
                <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCatalogo.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">
                          {f.razao_social}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {f.cnpj}
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        className="text-xs"
                        onClick={() => onLink(f.id)}
                      >
                        Vincular
                      </Button>
                    </div>
                  ))}
                  {filteredCatalogo.length === 0 && (
                    <p className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                      Nenhum fornecedor encontrado.
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="ghost" onClick={onClose}>
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/* 5. TABELAS (ITENS / FORNECEDORES)                                         */
/* ────────────────────────────────────────────────────────────────────────── */

const ItensTable = ({
  itens,
  onEdit,
  handleAskDelete,
  selectedItems,
  onSelectItem,
  onSelectAll,
  areAllSelected,
}) => (
  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-bg-secondary shadow-sm">
    <table className="w-full divide-y divide-slate-200 dark:divide-slate-800">
      <thead className="bg-slate-50 dark:bg-slate-900/60">
        <tr>
          <th className="py-3 px-4 text-left w-10">
            <StyledCheckbox checked={areAllSelected} onChange={onSelectAll} />
          </th>
          <th className="py-3 px-4 text-left text-[11px] font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Descrição
          </th>
          <th className="py-3 px-3 text-left text-[11px] font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Quantidade
          </th>
          <th className="py-3 px-3 text-left text-[11px] font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Valor
          </th>
          <th className="py-3 px-6 text-center text-[11px] font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Ações
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
        {itens.map((item) => (
          <tr
            key={item.id}
            className={`${
              selectedItems.has(item.id)
                ? "bg-blue-50/60 dark:bg-blue-900/20"
                : "bg-white dark:bg-transparent"
            } hover:bg-slate-50 dark:hover:bg-slate-800/40`}
          >
            <td className="py-4 px-4">
              <StyledCheckbox
                checked={selectedItems.has(item.id)}
                onChange={() => onSelectItem(item.id)}
              />
            </td>
            <td className="py-4 px-4 text-sm text-slate-800 dark:text-slate-100">
              {item.descricao}
            </td>
            <td className="px-3 py-4 text-sm text-slate-800 dark:text-slate-100">
              {item.quantidade}
            </td>
            <td className="px-3 py-4 text-sm text-slate-800 dark:text-slate-100">
              {formatCurrency(item.valor_estimado)}
            </td>
            <td className="py-4 px-6 text-center">
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => onEdit(item)}
                  title="Editar"
                  className="text-[#004aad] hover:text-[#003d91]"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleAskDelete("item", item)}
                  title="Remover"
                  className="text-rose-600 hover:text-rose-700"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {itens.length === 0 && (
      <div className="flex flex-col items-center justify-center p-10 text-center bg-white dark:bg-dark-bg-secondary">
        <ClipboardDocumentIcon className="w-12 h-12 text-slate-300 dark:text-slate-600" />
        <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
          Nenhum item adicionado
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Clique em “Adicionar Item” para cadastrar um.
        </p>
      </div>
    )}
  </div>
);

const FornecedorTable = ({ fornecedores, handleAskDelete, onEdit }) => (
  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-bg-secondary shadow-sm">
    <table className="w-full divide-y divide-slate-200 dark:divide-slate-800">
      <thead className="bg-slate-50 dark:bg-slate-900/60">
        <tr>
          <th className="py-3 px-3 text-left text-[11px] font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            CNPJ
          </th>
          <th className="py-3 px-6 text-left text-[11px] font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Razão Social
          </th>
          <th className="py-3 px-6 text-left text-[11px] font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Nome Fantasia
          </th>
          <th className="py-3 px-3 text-left text-[11px] font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Telefone
          </th>
          <th className="py-3 px-6 text-center text-[11px] font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Ações
          </th>
        </tr>
      </thead>
      <tbody>
        {fornecedores.length > 0 ? (
          fornecedores.map((forn) => (
            <tr
              key={forn.id}
              className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
            >
              <td className="px-3 py-4 text-sm text-slate-800 dark:text-slate-100">
                {forn.cnpj}
              </td>
              <td className="py-4 px-6 text-sm text-slate-800 dark:text-slate-100">
                {forn.razao_social}
              </td>
              <td className="px-3 py-4 text-sm text-slate-800 dark:text-slate-100">
                {forn.nome_fantasia}
              </td>
              <td className="px-3 py-4 text-sm text-slate-800 dark:text-slate-100">
                {forn.telefone}
              </td>
              <td className="px-6 py-4 text-center">
                <div className="space-x-4">
                  <button
                    onClick={() => onEdit(forn)}
                    className="text-[#004aad] hover:text-[#003d91]"
                  >
                    <PencilIcon className="w-5 h-5 inline" />
                  </button>
                  <button
                    onClick={() => handleAskDelete("fornecedor", forn)}
                    className="text-rose-600 hover:text-rose-700"
                  >
                    <TrashIcon className="w-5 h-5 inline" />
                  </button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="text-center py-10">
              <BuildingOffice2Icon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-100">
                Nenhum fornecedor vinculado ao processo.
              </p>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

/* ────────────────────────────────────────────────────────────────────────── */
/* 6. COMPONENTE PRINCIPAL                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

export default function NewProcess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useAxios();
  const { showToast } = useToast();

  const isNewProcess = !id;
  const [processoId, setProcessoId] = useState(id || null);
  const [activeTab, setActiveTab] = useState("dadosGerais");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    objeto: "",
    numero_processo: "",
    data_processo: "",
    modalidade: "",
    classificacao: "",
    tipo_organizacao: "",
    registro_precos: false,
    orgao: "",
    entidade: "",
    valor_referencia: "",
    numero_certame: "",
    data_abertura: "",
    situacao: "Em Pesquisa",
    vigencia_meses: 12,
  });
  const [itens, setItens] = useState([]);
  const [fornecedoresDoProcesso, setFornecedoresDoProcesso] = useState([]);
  const [entidades, setEntidades] = useState([]);
  const [orgaos, setOrgaos] = useState([]);
  const [catalogoFornecedores, setCatalogoFornecedores] = useState([]);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);

  const [isFornecedorModalOpen, setIsFornecedorModalOpen] = useState(false);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);

  // PAGINAÇÃO ITENS
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const totalPages = Math.ceil(itens.length / itemsPerPage);
  const currentItems = itens.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const areAllCurrentItemsSelected =
    currentItems.length > 0 &&
    currentItems.every((item) => selectedItems.has(item.id));

  // PAGINAÇÃO FORNECEDORES
  const [currentPageForn, setCurrentPageForn] = useState(1);
  const [itemsPerPageForn, setItemsPerPageForn] = useState(5);
  const totalPagesForn = Math.ceil(
    fornecedoresDoProcesso.length / itemsPerPageForn
  );
  const currentFornecedores = fornecedoresDoProcesso.slice(
    (currentPageForn - 1) * itemsPerPageForn,
    currentPageForn * itemsPerPageForn
  );

  const handleAskDelete = (type, item) => {
    setDeleteType(type);
    setItemToDelete(item);
    setShowConfirmModal(true);
  };

  /* ────────────────────────────────────────────────────────────────────── */
  /* FETCH                                                                 */
  /* ────────────────────────────────────────────────────────────────────── */

  const fetchDadosDoProcesso = useCallback(
    async (pid) => {
      if (!pid) return;
      setIsLoading(true);
      try {
        const res = await api.get(`/processos/${pid}/`);
        const data = res.data;
        setFormData({
          ...data,
          data_abertura: formatDateTimeForInput(data.data_abertura),
          data_processo: data.data_processo || "",
        });
        setFornecedoresDoProcesso(
          data.fornecedores_processo || data.fornecedores || []
        );
        setProcessoId(data.id);
      } catch {
        showToast("Erro ao carregar dados do processo.", "error");
        navigate("/processos");
      } finally {
        setIsLoading(false);
      }
    },
    [api, showToast, navigate]
  );

  const fetchItens = useCallback(
    async (pid) => {
      if (!pid) return;
      try {
        const res = await api.get(`/processos/${pid}/itens/`);
        setItens(res.data || []);
      } catch {
        showToast("Erro ao carregar itens do processo.", "error");
      }
    },
    [api, showToast]
  );

  const fetchFornecedoresDoProcesso = useCallback(
    async (pid) => {
      if (!pid) return;
      try {
        const res = await api.get(`/processos/${pid}/fornecedores/`);
        setFornecedoresDoProcesso(res.data || []);
      } catch {
        showToast("Erro ao carregar fornecedores do processo.", "error");
      }
    },
    [api, showToast]
  );

  const fetchAuxiliares = useCallback(async () => {
    try {
      const [entRes, fornRes] = await Promise.all([
        api.get("/entidades/"),
        api.get("/fornecedores/"),
      ]);
      setEntidades(entRes.data);
      setCatalogoFornecedores(fornRes.data);
    } catch {
      showToast("Erro ao carregar dados auxiliares.", "error");
    }
  }, [api, showToast]);

  const loadOrgaosForEntidade = useCallback(
    async (entidadeId) => {
      if (!entidadeId) {
        setOrgaos([]);
        return;
      }
      try {
        const res = await api.get("/orgaos/", {
          params: { entidade: entidadeId },
        });
        setOrgaos(Array.isArray(res.data) ? res.data : []);
      } catch {
        showToast("Erro ao carregar órgãos da entidade selecionada.", "error");
        setOrgaos([]);
      }
    },
    [api, showToast]
  );

  useEffect(() => {
    fetchAuxiliares();
    if (id) {
      fetchDadosDoProcesso(id);
      fetchItens(id);
      fetchFornecedoresDoProcesso(id);
    }
  }, [
    id,
    fetchDadosDoProcesso,
    fetchAuxiliares,
    fetchItens,
    fetchFornecedoresDoProcesso,
  ]);

  useEffect(() => {
    if (formData.entidade) {
      loadOrgaosForEntidade(formData.entidade);
    } else {
      setOrgaos([]);
    }
  }, [formData.entidade, loadOrgaosForEntidade]);

  /* ────────────────────────────────────────────────────────────────────── */
  /* HANDLERS                                                              */
  /* ────────────────────────────────────────────────────────────────────── */

  const handleChangeDadosGerais = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveDadosGerais = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = isNewProcess
        ? await api.post("/processos/", formData)
        : await api.put(`/processos/${processoId}/`, formData);

      showToast(
        isNewProcess ? "Processo criado!" : "Processo atualizado!",
        "success"
      );

      const updatedData = res.data;
      if (isNewProcess) {
        navigate(`/processos/editar/${updatedData.id}`, { replace: true });
        setProcessoId(updatedData.id);
        setActiveTab("itens");
      } else {
        fetchDadosDoProcesso(updatedData.id);
      }
    } catch {
      showToast("Erro ao salvar o processo.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveItem = async (itemData) => {
    try {
      if (itemSelecionado) {
        await api.put(`/itens/${itemSelecionado.id}/`, itemData);
        showToast("Item atualizado com sucesso!", "success");
      } else {
        await api.post(`/itens/`, { ...itemData, processo: processoId });
        showToast("Item adicionado com sucesso!", "success");
      }
      setIsItemModalOpen(false);
      setItemSelecionado(null);
      fetchItens(processoId);
    } catch {
      showToast("Erro ao salvar item.", "error");
    }
  };

  const handleSelectAll = () => {
    if (areAllCurrentItemsSelected) {
      const newSelected = new Set(selectedItems);
      currentItems.forEach((item) => newSelected.delete(item.id));
      setSelectedItems(newSelected);
    } else {
      const newSelected = new Set(selectedItems);
      currentItems.forEach((item) => newSelected.add(item.id));
      setSelectedItems(newSelected);
    }
  };

  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    newSelected.has(itemId) ? newSelected.delete(itemId) : newSelected.add(itemId);
    setSelectedItems(newSelected);
  };

  const handleExportItems = () => {
    if (selectedItems.size === 0) {
      showToast("Nenhum item selecionado para exportar.", "info");
      return;
    }
    const itemsToExport = itens.filter((item) => selectedItems.has(item.id));
    const headers = "Descricao,Especificacao,Unidade,Quantidade\n";
    const csvContent = itemsToExport
      .map((item) => {
        const desc = `"${item.descricao.replace(/"/g, '""')}"`;
        const espec = `"${(item.especificacao || "").replace(/"/g, '""')}"`;
        return [desc, espec, item.unidade, item.quantidade].join(",");
      })
      .join("\n");
    const blob = new Blob([headers + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "itens_exportados.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    showToast(`${itemsToExport.length} itens exportados com sucesso!`, "success");
  };

  const handleLinkFornecedor = async (fornecedorId) => {
    setIsFornecedorModalOpen(false);
    try {
      await api.post(`/processos/${processoId}/adicionar_fornecedor/`, {
        fornecedor_id: fornecedorId,
      });
      showToast("Fornecedor vinculado!", "success");
      fetchFornecedoresDoProcesso(processoId);
    } catch {
      showToast("Erro ao vincular fornecedor.", "error");
    }
  };

  const handleSaveNewAndLinkFornecedor = async (newFornecedor) => {
    try {
      const res = await api.post("/fornecedores/", newFornecedor);
      const fornecedorCriado = res.data;
      setCatalogoFornecedores((prev) => [fornecedorCriado, ...prev]);
      await handleLinkFornecedor(fornecedorCriado.id);
    } catch {
      showToast("Erro ao cadastrar fornecedor.", "error");
    }
  };

  const handleEditFornecedor = (fornecedor) => {
    setFornecedorSelecionado(fornecedor);
    setIsFornecedorModalOpen(true);
  };

  const handleUpdateEditedFornecedor = async (fornecedorAtualizado) => {
    try {
      const res = await api.put(
        `/fornecedores/${fornecedorAtualizado.id}/`,
        fornecedorAtualizado
      );
      const fornecedorEditado = res.data;

      setFornecedoresDoProcesso((prev) =>
        prev.map((f) => (f.id === fornecedorEditado.id ? fornecedorEditado : f))
      );
      setCatalogoFornecedores((prev) =>
        prev.map((f) => (f.id === fornecedorEditado.id ? fornecedorEditado : f))
      );
      showToast("Fornecedor atualizado.", "success");
      setFornecedorSelecionado(null);
      setIsFornecedorModalOpen(false);
    } catch {
      showToast("Erro ao atualizar fornecedor.", "error");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteType === "fornecedor") {
        await api.post(`/processos/${processoId}/remover_fornecedor/`, {
          fornecedor_id: itemToDelete.id,
        });
        showToast("Fornecedor removido com sucesso.", "success");
        fetchFornecedoresDoProcesso(processoId);
      } else if (deleteType === "item") {
        await api.delete(`/itens/${itemToDelete.id}/`);
        showToast("Item removido com sucesso.", "success");
        fetchItens(processoId);
      }
    } catch {
      showToast("Erro ao remover.", "error");
    } finally {
      setShowConfirmModal(false);
      setItemToDelete(null);
      setDeleteType(null);
    }
  };

  /* ────────────────────────────────────────────────────────────────────── */
  /* RENDER                                                                */
  /* ────────────────────────────────────────────────────────────────────── */

  const pageTitle = isNewProcess
    ? "Novo Processo Licitatório"
    : "Editar Processo Licitatório";

  return (
    <>
      {/* MODAIS */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setItemSelecionado(null);
        }}
        onSave={handleSaveItem}
        itemSelecionado={itemSelecionado}
      />

      <FornecedorModal
        isOpen={isFornecedorModalOpen}
        onClose={() => {
          setIsFornecedorModalOpen(false);
          setFornecedorSelecionado(null);
        }}
        catalogo={catalogoFornecedores}
        onLink={handleLinkFornecedor}
        onSaveNew={handleSaveNewAndLinkFornecedor}
        onSaveEdit={handleUpdateEditedFornecedor}
        fornecedorSelecionado={fornecedorSelecionado}
      />

      {showConfirmModal && (
        <ConfirmDeleteModal
          message={
            deleteType === "fornecedor"
              ? `Deseja realmente remover o fornecedor "${itemToDelete?.nome || itemToDelete?.razao_social}" deste processo?`
              : `Deseja realmente excluir o item "${itemToDelete?.descricao}"?`
          }
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {/* LAYOUT PRINCIPAL */}
      <div className="min-h-screen pb-20 flex justify-center items-start">
      <div className="max-w-7xl w-full px-2 md:px-4 lg:px-0 py-4 space-y-4">
        {/* HEADER */}
        <section className="bg-white dark:bg-dark-bg-secondary rounded-2xl border border-slate-200 dark:border-slate-800 px-5 py-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {pageTitle}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isNewProcess
                  ? "Preencha os dados para cadastrar um novo processo licitatório."
                  : "Revise e atualize os dados do processo licitatório selecionado."}
              </p>
            </div>
          </div>
        </section>

        {/* CONTEÚDO PRINCIPAL */}
        <section className="bg-white dark:bg-dark-bg-secondary rounded-2xl border border-slate-200 dark:border-slate-800 px-4 md:px-5 pt-3 pb-5 shadow-sm">
          {/* TABS */}
          <nav className="flex gap-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 rounded-t-2xl px-2">
            <TabButton
              label="Visão Geral"
              isActive={activeTab === "dadosGerais"}
              onClick={() => setActiveTab("dadosGerais")}
            />
            <TabButton
              label="Itens do Processo"
              isActive={activeTab === "itens"}
              onClick={() => setActiveTab("itens")}
              isDisabled={isNewProcess}
            />
            <TabButton
              label="Fornecedores"
              isActive={activeTab === "fornecedores"}
              onClick={() => setActiveTab("fornecedores")}
              isDisabled={isNewProcess}
            />
          </nav>

          {/* CONTEÚDO DAS TABS */}
          <main className="pt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 0 }}
                transition={{ duration: 0.12 }}
              >
                {activeTab === "dadosGerais" && (
                  <DadosGeraisForm
                    formData={formData}
                    onChange={handleChangeDadosGerais}
                    onSubmit={handleSaveDadosGerais}
                    onCancel={() => navigate(-1)}
                    isLoading={isLoading}
                    isNew={isNewProcess}
                    entidades={entidades}
                    orgaos={orgaos}
                  />
                )}

                {activeTab === "itens" && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          Itens do Processo
                        </h2>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {itens.length} itens no total.{" "}
                          {selectedItems.size > 0 &&
                            `${selectedItems.size} selecionado(s).`}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={handleExportItems}
                          disabled={selectedItems.size === 0}
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                          Exportar
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => {
                            setItemSelecionado(null);
                            setIsItemModalOpen(true);
                          }}
                        >
                          <PlusIcon className="w-4 h-4" />
                          Adicionar Item
                        </Button>
                      </div>
                    </div>

                    <ItensTable
                      itens={currentItems}
                      onEdit={(item) => {
                        setItemSelecionado(item);
                        setIsItemModalOpen(true);
                      }}
                      handleAskDelete={handleAskDelete}
                      selectedItems={selectedItems}
                      onSelectItem={handleSelectItem}
                      onSelectAll={handleSelectAll}
                      areAllSelected={areAllCurrentItemsSelected}
                    />

                    {totalPages > 1 && (
                      <div className="flex flex-wrap items-center justify-between pt-4 mt-2 border-t border-slate-200 dark:border-slate-800 gap-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <span>Exibir</span>
                          <select
                            value={itemsPerPage}
                            onChange={(e) => {
                              setItemsPerPage(Number(e.target.value));
                              setCurrentPage(1);
                              setSelectedItems(new Set());
                            }}
                            className={`${inputClass} w-20`}
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                          </select>
                          <span>por página</span>
                        </div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                          <button
                            onClick={() =>
                              setCurrentPage((p) => Math.max(p - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-500 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                          >
                            <ChevronLeftIcon className="h-4 w-4" />
                          </button>
                          <span className="relative hidden md:inline-flex items-center px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-900">
                            Página {currentPage} de {totalPages}
                          </span>
                          <button
                            onClick={() =>
                              setCurrentPage((p) =>
                                Math.min(p + 1, totalPages)
                              )
                            }
                            disabled={
                              currentPage === totalPages || totalPages === 0
                            }
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-500 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                          >
                            <ChevronRightIcon className="h-4 w-4" />
                          </button>
                        </nav>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "fornecedores" && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          Fornecedores Vinculados
                        </h2>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {fornecedoresDoProcesso.length} fornecedores no
                          total.
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        onClick={() => {
                          setFornecedorSelecionado(null);
                          setIsFornecedorModalOpen(true);
                        }}
                      >
                        <PlusIcon className="w-4 h-4" />
                        Adicionar Fornecedor
                      </Button>
                    </div>

                    <FornecedorTable
                      fornecedores={currentFornecedores}
                      handleAskDelete={handleAskDelete}
                      onEdit={handleEditFornecedor}
                    />

                    {totalPagesForn > 1 && (
                      <div className="flex flex-wrap items-center justify-between pt-4 mt-2 border-t border-slate-200 dark:border-slate-800 gap-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <span>Exibir</span>
                          <select
                            value={itemsPerPageForn}
                            onChange={(e) => {
                              setItemsPerPageForn(Number(e.target.value));
                              setCurrentPageForn(1);
                            }}
                            className={`${inputClass} w-20`}
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                          </select>
                          <span>por página</span>
                        </div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                          <button
                            onClick={() =>
                              setCurrentPageForn((p) => Math.max(p - 1, 1))
                            }
                            disabled={currentPageForn === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-500 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                          >
                            <ChevronLeftIcon className="h-4 w-4" />
                          </button>
                          <span className="relative hidden md:inline-flex items-center px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-900">
                            Página {currentPageForn} de {totalPagesForn}
                          </span>
                          <button
                            onClick={() =>
                              setCurrentPageForn((p) =>
                                Math.min(p + 1, totalPagesForn)
                              )
                            }
                            disabled={
                              currentPageForn === totalPagesForn ||
                              totalPagesForn === 0
                            }
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-500 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                          >
                            <ChevronRightIcon className="h-4 w-4" />
                          </button>
                        </nav>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </section>
      </div>
      </div>
    </>
  );
}
