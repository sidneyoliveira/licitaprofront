import React, { useEffect, useMemo, useState, useCallback } from "react";
import useAxios from "../hooks/useAxios";
import { useToast } from "../context/ToastContext";

// Estilos
const INPUT_STYLE =
  "w-full px-3 py-2 text-sm border rounded-md bg-white border-slate-300 dark:bg-dark-bg-secondary dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad] disabled:bg-gray-100 disabled:text-gray-400";
const LABEL_STYLE =
  "text-[11px] font-semibold tracking-wide text-slate-600 dark:text-slate-300 uppercase";

const asStr = (v) => (v == null ? "" : String(v));

export default function DadosGeraisForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isLoading,
  isNew,
  entidades,
}) {
  const api = useAxios();
  const { showToast } = useToast();

  const [sysOptions, setSysOptions] = useState({
    modalidades: [],
    modos_disputa: [],
    instrumentos_convocatorios: [],
    criterios_julgamento: [],
    amparos_legais: [],      
    situacoes_processo: [],
    tipos_organizacao: [],
    
    // Mapa de dependência vindo do Backend
    mapa_modalidade_amparo: {},
    
    classificacoes: [
        { id: "Compras", label: "Compras" },
        { id: "Serviços Comuns", label: "Serviços Comuns" },
        { id: "Obras Comuns", label: "Obras Comuns" },
        { id: "Serviços de Engenharia", label: "Serviços de Engenharia" }
    ]
  });

  const [orgaosList, setOrgaosList] = useState([]);
  const [loadingOrgaos, setLoadingOrgaos] = useState(false);

  // Carrega constantes
  useEffect(() => {
    const fetchConstantes = async () => {
      try {
        const res = await api.get("/constantes/sistema/");
        setSysOptions(prev => ({ ...prev, ...res.data }));
      } catch (error) {
        console.error("Erro ao carregar constantes", error);
        showToast("Erro ao carregar listas do sistema.", "error");
      }
    };
    fetchConstantes();
  }, [api, showToast]);

  // Carrega Órgãos
  const entidadeSel = asStr(formData?.entidade);
  const orgaoSel = asStr(formData?.orgao);

  const fetchOrgaos = useCallback(
    async (entidadeId) => {
      if (!entidadeId) {
        setOrgaosList([]);
        return;
      }
      setLoadingOrgaos(true);
      try {
        const res = await api.get("/orgaos/", {
          params: { entidade: entidadeId },
        });
        setOrgaosList(Array.isArray(res.data) ? res.data : []);
      } catch {
        setOrgaosList([]);
        showToast("Erro ao carregar órgãos.", "error");
      } finally {
        setLoadingOrgaos(false);
      }
    },
    [api, showToast]
  );

  useEffect(() => {
    if (entidadeSel) fetchOrgaos(entidadeSel);
    else setOrgaosList([]);
  }, [entidadeSel, fetchOrgaos]);

  // =========================================================
  // LÓGICA DE FILTRAGEM (MODALIDADE -> AMPARO)
  // =========================================================

  const amparosFiltrados = useMemo(() => {
    const modalidadeId = formData?.modalidade;
    const mapa = sysOptions.mapa_modalidade_amparo;

    if (!modalidadeId || !mapa) return [];

    const amparosPermitidos = mapa[modalidadeId] || [];

    return sysOptions.amparos_legais.filter(amp => 
      amparosPermitidos.includes(amp.id)
    );
  }, [formData?.modalidade, sysOptions]);


  // =========================================================
  // HANDLERS
  // =========================================================

  const handleChangeLocal = (e) => {
    const { name, value } = e.target;
    
    // Entidade -> Limpa Órgão
    if (name === "entidade") {
      const newEnt = asStr(value);
      if (newEnt !== entidadeSel) {
        onChange({ target: { name: "entidade", value: newEnt } });
        onChange({ target: { name: "orgao", value: "" } });
      } else {
        onChange(e);
      }
      return;
    }

    // Modalidade -> Limpa Amparo
    if (name === "modalidade") {
        onChange(e); 
        onChange({ target: { name: "amparo_legal", value: "" } }); 
        return;
    }

    // Converter Select de SRP em booleano
    if (name === "registro_preco") {
        onChange({ target: { name, value: value === 'true' } });
        return;
    }

    onChange(e);
  };

  const orgaosDaEntidade = useMemo(() => {
    if (!entidadeSel) return [];
    return orgaosList.filter((o) => asStr(o.entidade) === entidadeSel);
  }, [entidadeSel, orgaosList]);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      
      {/* LINHA 1: Objeto e Dados Cadastrais Básicos */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <label className={LABEL_STYLE}>Objeto *</label>
          <textarea
            name="objeto"
            value={formData?.objeto || ""}
            onChange={handleChangeLocal}
            className={`${INPUT_STYLE} h-28`}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL_STYLE}>Nº do Processo *</label>
            <input
              name="numero_processo"
              value={formData?.numero_processo || ""}
              onChange={handleChangeLocal}
              className={INPUT_STYLE}
              required
            />
          </div>
          <div>
            <label className={LABEL_STYLE}>Data do Processo *</label>
            <input
              name="data_processo"
              type="date"
              value={formData?.data_processo || ""}
              onChange={handleChangeLocal}
              className={INPUT_STYLE}
              required
            />
          </div>
          <div>
            <label className={LABEL_STYLE}>Nº do Certame</label>
            <input
              name="numero_certame"
              value={formData?.numero_certame || ""}
              onChange={handleChangeLocal}
              className={INPUT_STYLE}
            />
          </div>
          <div>
            <label className={LABEL_STYLE}>Data/Hora Abertura</label>
            <input
              name="data_abertura"
              type="datetime-local"
              value={formData?.data_abertura ? String(formData.data_abertura).substring(0, 16) : ""}
              onChange={handleChangeLocal}
              className={INPUT_STYLE}
            />
          </div>
        </div>
      </div>

      {/* LINHA 2: Modalidade, Amparo, Classificação, SRP */}
      <div className="grid md:grid-cols-4 gap-4">
        {/* Modalidade */}
        <div>
          <label className={LABEL_STYLE}>Modalidade (PNCP) *</label>
          <select
            name="modalidade"
            value={formData?.modalidade || ""}
            onChange={handleChangeLocal}
            className={INPUT_STYLE}
            required
          >
            <option value="">Selecione...</option>
            {sysOptions.modalidades.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Amparo Legal */}
        <div>
          <label className={LABEL_STYLE}>Amparo Legal (Artigo) *</label>
          <select
            name="amparo_legal"
            value={formData?.amparo_legal || ""}
            onChange={handleChangeLocal}
            className={INPUT_STYLE}
            required
            disabled={!formData?.modalidade}
          >
            <option value="">
                {!formData?.modalidade 
                    ? "Selecione a Modalidade" 
                    : amparosFiltrados.length === 0 
                        ? "Nenhum artigo disp." 
                        : "Selecione..."}
            </option>
            {amparosFiltrados.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </div>

        {/* Classificação */}
        <div>
          <label className={LABEL_STYLE}>Classificação *</label>
          <select
            name="classificacao"
            value={formData?.classificacao || ""}
            onChange={handleChangeLocal}
            className={INPUT_STYLE}
            required
          >
            <option value="">Selecione...</option>
            {sysOptions.classificacoes.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Registro de Preço (Select) */}
        <div>
          <label className={LABEL_STYLE}>É Registro de Preço (SRP)?</label>
          <select
            name="registro_preco"
            value={formData?.registro_preco ? "true" : "false"}
            onChange={handleChangeLocal}
            className={INPUT_STYLE}
          >
            <option value="false">Não</option>
            <option value="true">Sim</option>
          </select>
        </div>
      </div>

      {/* LINHA 3: Organização, Disputa, Critério, Instrumento */}
      <div className="grid md:grid-cols-4 gap-4">
        {/* Organização */}
        <div>
            <label className={LABEL_STYLE}>Organização *</label>
            <select
            name="tipo_organizacao"
            value={formData?.tipo_organizacao || ""}
            onChange={handleChangeLocal}
            className={INPUT_STYLE}
            required
            >
            <option value="">Selecione...</option>
            {sysOptions.tipos_organizacao.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
            ))}
            </select>
        </div>

        {/* Modo de Disputa */}
        <div>
          <label className={LABEL_STYLE}>Modo de Disputa *</label>
          <select
            name="modo_disputa"
            value={formData?.modo_disputa || ""}
            onChange={handleChangeLocal}
            className={INPUT_STYLE}
            required
          >
            <option value="">Selecione...</option>
            {sysOptions.modos_disputa.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>
        
        {/* Critério de Julgamento */}
        <div>
          <label className={LABEL_STYLE}>Critério de Julgamento *</label>
          <select
            name="criterio_julgamento"
            value={formData?.criterio_julgamento || ""}
            onChange={handleChangeLocal}
            className={INPUT_STYLE}
            required
          >
            <option value="">Selecione...</option>
            {sysOptions.criterios_julgamento.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Instrumento Convocatório */}
        <div>
            <label className={LABEL_STYLE}>Instrumento Convocatório *</label>
            <select
            name="instrumento_convocatorio"
            value={formData?.instrumento_convocatorio || ""}
            onChange={handleChangeLocal}
            className={INPUT_STYLE}
            required
            >
            <option value="">Selecione...</option>
            {sysOptions.instrumentos_convocatorios.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
            ))}
            </select>
        </div>
      </div>

      {/* LINHA 4: Entidade, Órgão, Valor, Vigência, Situação */}
      <div className="grid md:grid-cols-5 gap-4">
        {/* Entidade */}
        <div>
          <label className={LABEL_STYLE}>Entidade *</label>
          <select
            name="entidade"
            value={entidadeSel}
            onChange={handleChangeLocal}
            className={INPUT_STYLE}
            required
          >
            <option value="">Selecione...</option>
            {entidades.map((e) => (
              <option key={e.id} value={asStr(e.id)}>{e.nome}</option>
            ))}
          </select>
        </div>
        
        {/* Órgão */}
        <div>
          <label className={LABEL_STYLE}>Órgão *</label>
          <select
            name="orgao"
            value={orgaoSel}
            onChange={handleChangeLocal}
            className={INPUT_STYLE}
            required
            disabled={!entidadeSel || (loadingOrgaos && orgaosDaEntidade.length === 0)}
          >
            <option value="">
              {!entidadeSel
                ? "Selecione uma entidade"
                : loadingOrgaos && orgaosDaEntidade.length === 0
                ? "Carregando órgãos..."
                : "Selecione..."}
            </option>
            {orgaosDaEntidade.map((o) => (
              <option key={o.id} value={asStr(o.id)}>{o.nome}</option>
            ))}
          </select>
        </div>

        {/* Valor de Referência */}
        <div>
          <label className={LABEL_STYLE}>Valor de Referência (R$)</label>
          <input
            name="valor_referencia"
            type="number"
            step="0.01"
            value={formData?.valor_referencia ?? ""}
            onChange={handleChangeLocal}
            placeholder="0,00"
            className={`${INPUT_STYLE} text-right`}
          />
        </div>
        
        {/* Vigência */}
        <div>
          <label className={LABEL_STYLE}>Vigência (Meses) *</label>
          <input
            name="vigencia_meses"
            type="number"
            min="1"
            value={formData?.vigencia_meses ?? ""}
            onChange={handleChangeLocal}
            placeholder="12"
            className={`${INPUT_STYLE} text-center`}
          />
        </div>

        {/* Situação */}
        <div>
          <label className={LABEL_STYLE}>Situação *</label>
          <select
            name="situacao"
            value={formData?.situacao || ""}
            onChange={handleChangeLocal}
            className={INPUT_STYLE}
            required
          >
             {sysOptions.situacoes_processo.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-dark-bg-secondary hover:bg-slate-50 dark:hover:bg-dark-bg-tertiary"
        >
          {isNew ? "Cancelar" : "Cancelar Edição"}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 rounded-md text-white bg-[#004aad] hover:bg-[#003d91] disabled:opacity-50"
        >
          {isNew ? "Salvar e Continuar" : "Salvar Alterações"}
        </button>
      </div>
    </form>
  );
}