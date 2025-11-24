import React, { useEffect, useMemo, useState, useCallback } from "react";
import useAxios from "../hooks/useAxios";
import { useToast } from "../context/ToastContext";
import {
  MODALIDADES,
  CLASSIFICACOES,
  FUNDAMENTACOES,
  ORGANIZACOES,
  SITUACOES,
  MODO_DISPUTA,
  CRITERIO_JULGAMENTO,
  AMPARO_LEGAL,
  getAmparoOptions,
} from "../utils/constantes";

const INPUT_STYLE =
  "w-full px-3 py-2 text-sm border rounded-md bg-white border-slate-300 dark:bg-dark-bg-secondary dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad]";
const LABEL_STYLE =
  "text-[11px] font-semibold tracking-wide text-slate-600 dark:text-slate-300 uppercase";

const asStr = (v) => (v == null ? "" : String(v));

const normalizeSelectValue = (incoming, list) => {
  if (!incoming) return "";
  const s = String(incoming);
  if (!Array.isArray(list)) return s;
  const found =
    list.find((o) => o.value === s) ||
    list.find((o) => o.label === s) ||
    list.find((o) => String(o.code) === s);
  return found ? found.value : s;
};

const pickFromId = (formData, name, idField, list) => {
  const v = formData?.[name];
  if (v) return normalizeSelectValue(v, list);
  const id = formData?.[idField];
  if (id != null) {
    const found = (list || []).find((opt) => String(opt.code) === String(id));
    return found ? found.value : "";
  }
  return "";
};

const inferFundamentacaoFromAmparo = (amparoId, AMPARO_LEGAL) => {
  if (!amparoId) return "";
  const id = String(amparoId);
  if ((AMPARO_LEGAL.lei_8666 || []).some((a) => String(a.code) === id))
    return "lei_8666";
  if ((AMPARO_LEGAL.lei_10520 || []).some((a) => String(a.code) === id))
    return "lei_10520";
  for (const arr of Object.values(AMPARO_LEGAL.lei_14133 || {})) {
    if ((arr || []).some((a) => String(a.code) === id)) return "lei_14133";
  }
  return "";
};

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

  const entidadeSel = asStr(formData?.entidade);
  const orgaoSel = asStr(formData?.orgao);

  const [orgaosList, setOrgaosList] = useState([]);
  const [loadingOrgaos, setLoadingOrgaos] = useState(false);

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
        showToast("Erro ao carregar órgãos da entidade selecionada.", "error");
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

  const handleChangeLocal = (e) => {
    const { name, value } = e.target;
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
    onChange(e);
  };

  const modalidadeVal = pickFromId(formData, "modalidade", "modalidade_id", MODALIDADES);
  const classificacaoVal = normalizeSelectValue(formData?.classificacao, CLASSIFICACOES);

  let fundamentacaoVal = normalizeSelectValue(formData?.fundamentacao, FUNDAMENTACOES);
  if (!fundamentacaoVal) {
    fundamentacaoVal =
      pickFromId(formData, "fundamentacao", "fundamentacao_id", FUNDAMENTACOES) ||
      inferFundamentacaoFromAmparo(formData?.amparo_legal_id, AMPARO_LEGAL);
  }

  const amparoOptions = useMemo(
    () => getAmparoOptions(fundamentacaoVal, modalidadeVal),
    [fundamentacaoVal, modalidadeVal]
  );

  const amparoLegalVal = (() => {
    const v = normalizeSelectValue(formData?.amparo_legal, amparoOptions);
        console.log( `entrou no amparo legal val ${v}` )
    if (v) return v;
    const id = formData?.amparo_legal_id;
    if (id != null) {
      const found = (amparoOptions || []).find((a) => String(a.code) === String(id));
          console.log( `valor de found ${found}` )
      return found ? found.value : "";
    }
    console.log( `valor de const v ${v}` )
    return "";
  })();

  const modoDisputaVal = pickFromId(formData, "modo_disputa", "modo_disputa_id", MODO_DISPUTA);
  const criterioJulgVal = pickFromId(formData, "criterio_julgamento", "criterio_julgamento_id", CRITERIO_JULGAMENTO);
  const organizacaoVal = normalizeSelectValue(formData?.tipo_organizacao, ORGANIZACOES);
  const situacaoVal = normalizeSelectValue(formData?.situacao, SITUACOES);

  const orgaosDaEntidade = useMemo(() => {
    if (!entidadeSel) return [];
    return orgaosList.filter((o) => asStr(o.entidade) === entidadeSel);
  }, [entidadeSel, orgaosList]);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* LINHA 1 */}
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
              value={formData?.data_abertura ? formData.data_abertura.substring(0, 16) : ""}
              onChange={handleChangeLocal}
              className={INPUT_STYLE}
            />
          </div>
        </div>
      </div>

      {/* LINHA 2 */}
      <div className="grid md:grid-cols-4 gap-4">
        <div>
          <label className={LABEL_STYLE}>Modalidade *</label>
          <select
            name="modalidade"
            value={modalidadeVal}
            onChange={handleChangeLocal}
            className={INPUT_STYLE}
            required
          >
            <option value="">Selecione...</option>
            {MODALIDADES.map((m) => (
              <option key={m.code} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_STYLE}>Classificação *</label>
          <select
            name="classificacao"
            value={classificacaoVal}
            onChange={handleChangeLocal}
            className={INPUT_STYLE}
            required
          >
            <option value="">Selecione...</option>
            {CLASSIFICACOES.map((c) => (
              <option key={c.code} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_STYLE}>Fundamentação *</label>
          <select
            name="fundamentacao"
            value={fundamentacaoVal}
            onChange={handleChangeLocal}
            className={INPUT_STYLE}
            required
          >
            <option value="">Selecione...</option>
            {FUNDAMENTACOES.map((f) => (
              <option key={f.code} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_STYLE}>Amparo Legal *</label>
          <select
            name="amparo_legal"
            value={amparoLegalVal}
            onChange={handleChangeLocal}
            className={INPUT_STYLE}
            required
            disabled={!fundamentacaoVal}
          >
            <option value="">Selecione...</option>
            {amparoOptions.map((a) => (
              <option key={a.code} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* LINHA 3 */}
      <div className="grid md:grid-cols-5 gap-4">
        <div>
          <label className={LABEL_STYLE}>Modo de Disputa *</label>
          <select
            name="modo_disputa"
            value={modoDisputaVal}
            onChange={handleChangeLocal}
            className={INPUT_STYLE}
            required
          >
            <option value="">Selecione...</option>
            {MODO_DISPUTA.map((m) => (
              <option key={m.code} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_STYLE}>Critério de Julgamento *</label>
          <select
            name="criterio_julgamento"
            value={criterioJulgVal}
            onChange={handleChangeLocal}
            className={INPUT_STYLE}
            required
          >
            <option value="">Selecione...</option>
            {CRITERIO_JULGAMENTO.map((c) => (
              <option key={c.code} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_STYLE}>Organização *</label>
          <select
            name="tipo_organizacao"
            value={organizacaoVal}
            onChange={handleChangeLocal}
            className={INPUT_STYLE}
            required
          >
            <option value="">Selecione...</option>
            {ORGANIZACOES.map((o) => (
              <option key={o.code} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
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
      </div>

      {/* LINHA 4 */}
      <div className="grid md:grid-cols-3 gap-4">
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
        <div>
          <label className={LABEL_STYLE}>Situação *</label>
          <select
            name="situacao"
            value={situacaoVal}
            onChange={handleChangeLocal}
            className={INPUT_STYLE}
            required
          >
            {SITUACOES.map((s) => (
              <option key={s.code} value={s.value}>{s.label}</option>
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
