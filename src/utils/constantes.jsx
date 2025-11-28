// src/utils/constantes.jsx

// ============================================================================
// MODALIDADES (IDs alinhados com o PNCP/Backend)
// ============================================================================
export const MODALIDADES = [
  { code: 6,  value: 'pregao_eletronico',          label: 'Pregão - Eletrônico' },
  { code: 7,  value: 'pregao_presencial',          label: 'Pregão - Presencial' },
  { code: 4,  value: 'concorrencia_eletronica',    label: 'Concorrência - Eletrônica' },
  { code: 5,  value: 'concorrencia_presencial',    label: 'Concorrência - Presencial' },
  { code: 8,  value: 'dispensa_licitacao',         label: 'Dispensa de Licitação' },
  { code: 9,  value: 'inexigibilidade',            label: 'Inexigibilidade' },
  { code: 11, value: 'pre_qualificacao',           label: 'Pré-Qualificação' },
  { code: 12, value: 'credenciamento',             label: 'Credenciamento' },
  { code: 13, value: 'leilao_eletronico',          label: 'Leilão - Eletrônico' },
  { code: 14, value: 'leilao_presencial',          label: 'Leilão - Presencial' },
  { code: 15, value: 'dialogo_competitivo',        label: 'Diálogo Competitivo' },
];

// ============================================================================
// AMPARO LEGAL (Lista Plana com IDs do Backend)
// ============================================================================
export const AMPARO_LEGAL = [
    // --- Lei 14.133 (Art 28) ---
    { code: 1, value: "lei14133_art28_i", label: "Lei 14.133/21, Art. 28, I (Pregão)" },
    { code: 2, value: "lei14133_art28_ii", label: "Lei 14.133/21, Art. 28, II (Concorrência)" },
    { code: 3, value: "lei14133_art28_iii", label: "Lei 14.133/21, Art. 28, III (Concurso)" },
    { code: 4, value: "lei14133_art28_iv", label: "Lei 14.133/21, Art. 28, IV (Leilão)" },
    { code: 5, value: "lei14133_art28_v", label: "Lei 14.133/21, Art. 28, V (Diálogo Competitivo)" },

    // --- Lei 14.133 (Art 75 - Dispensa) ---
    { code: 18, value: "lei14133_art75_i", label: "Lei 14.133/21, Art. 75, I (Obras/Eng < 100k)" },
    { code: 19, value: "lei14133_art75_ii", label: "Lei 14.133/21, Art. 75, II (Serviços < 50k)" },
    { code: 20, value: "lei14133_art75_iii_a", label: "Lei 14.133/21, Art. 75, III, a (Deserta/Fracassada)" },
    { code: 21, value: "lei14133_art75_iii_b", label: "Lei 14.133/21, Art. 75, III, b (Preços Superiores)" },
    // ... adicione os outros incisos do Art 75 se necessário (22 a 46, 60, 77) ...

    // --- Lei 14.133 (Art 74 - Inexigibilidade) ---
    { code: 6, value: "lei14133_art74_i", label: "Lei 14.133/21, Art. 74, I (Exclusivo)" },
    { code: 7, value: "lei14133_art74_ii", label: "Lei 14.133/21, Art. 74, II (Artista)" },
    { code: 8, value: "lei14133_art74_iii_a", label: "Lei 14.133/21, Art. 74, III, a (Técnico)" },
    // ... outros incisos do Art 74 ...

    // --- Leis Antigas / Outras ---
    { code: 301, value: "lei10520_art1", label: "Lei 10.520/02, Art. 1º (Pregão)" },
    { code: 203, value: "lei8666_art22_iii", label: "Lei 8.666/93, Art. 22, III (Concorrência)" },
    { code: 206, value: "lei8666_art24_i", label: "Lei 8.666/93, Art. 24, I (Obras)" },
    { code: 207, value: "lei8666_art24_ii", label: "Lei 8.666/93, Art. 24, II (Serviços)" },
];

export const MODO_DISPUTA = [
  { code: 1, value: 'aberto',            label: 'Aberto' },
  { code: 2, value: 'fechado',           label: 'Fechado' },
  { code: 3, value: 'aberto_fechado',    label: 'Aberto-Fechado' },
  { code: 4, value: 'dispensa_com_disputa', label: 'Dispensa com Disputa' },
  { code: 5, value: 'nao_se_aplica',     label: 'Não se aplica' },
  { code: 6, value: 'fechado_aberto',    label: 'Fechado-Aberto' },
];

export const CRITERIO_JULGAMENTO = [
  { code: 1, value: 'menor_preco',   label: 'Menor Preço' },
  { code: 2, value: 'maior_desconto',label: 'Maior Desconto' },
  { code: 3, value: 'melhor_tecnica',label: 'Melhor Técnica' },
  { code: 4, value: 'tecnica_e_preco', label: 'Técnica e Preço' },
  { code: 5, value: 'maior_lance',   label: 'Maior Lance' },
  { code: 6, value: 'maior_retorno', label: 'Maior Retorno Econômico' },
];

export const CLASSIFICACOES = [
  { code: 1, value: 'compras',                        label: 'Compras' },
  { code: 2, value: 'servicos_comuns',                label: 'Serviços Comuns' },
  { code: 3, value: 'servicos_engenharia_comuns',     label: 'Serviços de Engenharia Comuns' },
  { code: 4, value: 'obras_comuns',                   label: 'Obras Comuns' },
];

export const ORGANIZACOES = [
  { code: 1, value: 'lote', label: 'Lote' },
  { code: 2, value: 'item', label: 'Item' },
];

export const SITUACOES = [
  { code: 1, value: 'aberto',                  label: 'Aberto' },
  { code: 2, value: 'em_pesquisa',             label: 'Em Pesquisa' },
  { code: 3, value: 'aguardando_publicacao',   label: 'Aguardando Publicação' },
  { code: 4, value: 'publicado',               label: 'Publicado' },
  { code: 5, value: 'em_contratacao',          label: 'Em Contratação' },
  { code: 6, value: 'adjudicado',              label: 'Adjudicado' },
  { code: 7, value: 'homologado',              label: 'Homologado' },
  { code: 8, value: 'revogado',                label: 'Revogado' },
  { code: 9, value: 'cancelado',               label: 'Cancelado' },
  { code: 10, value: 'deserto',                label: 'Deserto' },
  { code: 11, value: 'fracassado',             label: 'Fracassado' },
];

// ==============================
// Helpers
// ==============================
const __norm = (s) =>
  (typeof s === 'string'
    ? s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
    : String(s ?? '').toLowerCase().trim());

export const toCode = (options, valueOrLabel) => {
  if (valueOrLabel == null || valueOrLabel === '') return '';
  const byValue = options.find((o) => o.value === valueOrLabel);
  if (byValue) return byValue.value;
  const byLabel = options.find((o) => __norm(o.label) === __norm(valueOrLabel));
  if (byLabel) return byLabel.value;
  const byCode = options.find((o) => String(o.code) === String(valueOrLabel));
  if (byCode) return byCode.value;
  return '';
};

export const fromCode = (options, codeOrLabel) => {
  if (codeOrLabel == null || codeOrLabel === '') return null;
  // Busca exata por code (int ou string)
  const byCode = options.find((o) => String(o.code) === String(codeOrLabel));
  if (byCode) return byCode;
  // Busca por value
  const byValue = options.find((o) => o.value === codeOrLabel);
  if (byValue) return byValue;
  // Busca por label (fallback)
  const byLabel = options.find((o) => __norm(o.label) === __norm(codeOrLabel));
  if (byLabel) return byLabel;
  return null;
};