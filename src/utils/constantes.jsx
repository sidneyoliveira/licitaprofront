// --- export constANTES ---

export const MODALIDADES = [
  { code: 1, value: 'pregao_eletronico',        label: 'Pregão Eletrônico' },
  { code: 2, value: 'concorrencia_eletronica',  label: 'Concorrência Eletrônica' },
  { code: 3, value: 'dispensa_eletronica',      label: 'Dispensa Eletrônica' },
  { code: 4, value: 'adesao_registro_precos',   label: 'Adesão a Registro de Preços' },
  { code: 5, value: 'credenciamento',           label: 'Credenciamento' },
  { code: 6, value: 'inexigibilidade_eletronica', label: 'Inexigibilidade Eletrônica' },
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
  { code: 6, value: 'adjudicado_homologado',   label: 'Adjudicado/Homologado' },
  { code: 7, value: 'revogado_cancelado',      label: 'Revogado/Cancelado' },
];

export const FUNDAMENTACOES = [
  { code: 1, value: 'lei_14133', label: 'Lei 14.133/21' },
  { code: 2, value: 'lei_8666',  label: 'Lei 8.666/93' },
  { code: 3, value: 'lei_10520', label: 'Lei 10.520/02' },
];

export const AMPARO_LEGAL = {
  lei_8666: [
    { code: 101, value: 'art_23', label: 'Art. 23' },
    { code: 102, value: 'art_24', label: 'Art. 24' },
    { code: 103, value: 'art_25', label: 'Art. 25' },
  ],
  lei_10520: [
    { code: 201, value: 'art_4',  label: 'Art. 4º' },
    { code: 202, value: 'art_5',  label: 'Art. 5º' },
  ],
  lei_14133: {
    pregao_eletronico: [
      { code: 301, value: 'art_28_i',  label: 'Art. 28, inciso I' },
    ],
    concorrencia_eletronica: [
      { code: 302, value: 'art_28_ii', label: 'Art. 28, inciso II' },
    ],
    dispensa_eletronica: [
      { code: 311, value: 'art_75_par7', label: 'Art. 75, § 7º' },
      { code: 312, value: 'art_75_i',    label: 'Art. 75, inciso I' },
      { code: 313, value: 'art_75_ii',   label: 'Art. 75, inciso II' },
      { code: 314, value: 'art_75_iii_a',label: 'Art. 75, inciso III, a' },
      { code: 315, value: 'art_75_iii_b',label: 'Art. 75, inciso III, b' },
      { code: 316, value: 'art_75_iv_a', label: 'Art. 75, inciso IV, a' },
      { code: 317, value: 'art_75_iv_b', label: 'Art. 75, inciso IV, b' },
      { code: 318, value: 'art_75_iv_c', label: 'Art. 75, inciso IV, c' },
      { code: 319, value: 'art_75_iv_d', label: 'Art. 75, inciso IV, d' },
      { code: 320, value: 'art_75_iv_e', label: 'Art. 75, inciso IV, e' },
      { code: 321, value: 'art_75_iv_f', label: 'Art. 75, inciso IV, f' },
      { code: 322, value: 'art_75_iv_j', label: 'Art. 75, inciso IV, j' },
      { code: 323, value: 'art_75_iv_k', label: 'Art. 75, inciso IV, k' },
      { code: 324, value: 'art_75_iv_m', label: 'Art. 75, inciso IV, m' },
      { code: 325, value: 'art_75_ix',   label: 'Art. 75, inciso IX' },
      { code: 326, value: 'art_75_viii', label: 'Art. 75, inciso VIII' },
      { code: 327, value: 'art_75_xv',   label: 'Art. 75, inciso XV' },
      { code: 328, value: 'lei_11947_art14_1', label: 'Lei 11.947/2009, Art. 14, § 1º' },
    ],
    credenciamento: [
      { code: 331, value: 'art_79_i',   label: 'Art. 79, inciso I' },
      { code: 332, value: 'art_79_ii',  label: 'Art. 79, inciso II' },
      { code: 333, value: 'art_79_iii', label: 'Art. 79, inciso III' },
    ],
    inexigibilidade_eletronica: [
      { code: 341, value: 'art_74_caput', label: 'Art. 74, caput' },
      { code: 342, value: 'art_74_i',     label: 'Art. 74, I' },
      { code: 343, value: 'art_74_ii',    label: 'Art. 74, II' },
      { code: 344, value: 'art_74_iii_a', label: 'Art. 74, III, a' },
      { code: 345, value: 'art_74_iii_b', label: 'Art. 74, III, b' },
      { code: 346, value: 'art_74_iii_c', label: 'Art. 74, III, c' },
      { code: 347, value: 'art_74_iii_d', label: 'Art. 74, III, d' },
      { code: 348, value: 'art_74_iii_e', label: 'Art. 74, III, e' },
      { code: 349, value: 'art_74_iii_f', label: 'Art. 74, III, f' },
      { code: 350, value: 'art_74_iii_g', label: 'Art. 74, III, g' },
      { code: 351, value: 'art_74_iii_h', label: 'Art. 74, III, h' },
      { code: 352, value: 'art_74_iv',    label: 'Art. 74, IV' },
      { code: 353, value: 'art_74_v',     label: 'Art. 74, V' },
    ],
    adesao_registro_precos: [
      { code: 354, value: 'art_86_2',   label: 'Art. 86, § 2º' },
    ],
  },
};

export const MODO_DISPUTA = [
  { code: 1, value: 'aberto',            label: 'Aberto' },
  { code: 2, value: 'fechado',           label: 'Fechado' },
  { code: 3, value: 'aberto_e_fechado',  label: 'Aberto e Fechado' },
];

export const CRITERIO_JULGAMENTO = [
  { code: 1, value: 'menor_preco',   label: 'Menor Preço' },
  { code: 2, value: 'maior_desconto',label: 'Maior Desconto' },
];

// Helper para opções de amparo conforme a fundamentação e modalidade
export function getAmparoOptions(fundamentacao, modalidadeValue) {
  if (!fundamentacao) return [];
  if (fundamentacao === 'lei_8666') return AMPARO_LEGAL.lei_8666 || [];
  if (fundamentacao === 'lei_10520') return AMPARO_LEGAL.lei_10520 || [];
  if (fundamentacao === 'lei_14133') {
    if (!modalidadeValue) return [];
    const mapa = AMPARO_LEGAL.lei_14133 || {};
    return mapa[modalidadeValue] || [];
  }
  return [];
}

export const SITUACAO_CONTRATACAO = [
  { code: 1, value: 'divulgada_pncp', label: 'Divulgada no PNCP' },
  { code: 2, value: 'revogada',       label: 'Revogada' },
  { code: 3, value: 'anulada',        label: 'Anulada' },
  { code: 4, value: 'suspensa',       label: 'Suspensa' },
];

export const SITUACAO_ITEM = [
  { code: 1, value: 'em_andamento',         label: 'Em Andamento' },
  { code: 2, value: 'homologado',           label: 'Homologado' },
  { code: 3, value: 'anulado_revogado',     label: 'Anulado/Revogado/Cancelado' },
  { code: 4, value: 'deserto',              label: 'Deserto' },
  { code: 5, value: 'fracassado',           label: 'Fracassado' },
];

export const TIPO_BENEFICIO = [
  { code: 1, value: 'participacao_exclusiva_me_epp', label: 'Participação exclusiva para ME/EPP' },
  { code: 2, value: 'subcontratacao_me_epp',         label: 'Subcontratação para ME/EPP' },
  { code: 3, value: 'cota_reservada_me_epp',         label: 'Cota reservada para ME/EPP' },
  { code: 4, value: 'sem_beneficio',                 label: 'Sem benefício' },
  { code: 5, value: 'nao_se_aplica',                 label: 'Não se aplica' },
];

export const SITUACAO_RESULTADO_ITEM = [
  { code: 1, value: 'informado', label: 'Informado' },
  { code: 2, value: 'cancelado', label: 'Cancelado' },
];

export const TIPO_CONTRATO = [
  { code: 1, value: 'contrato',            label: 'Contrato (termo inicial)' },
  { code: 2, value: 'comodato',            label: 'Comodato' },
  { code: 3, value: 'arrendamento',        label: 'Arrendamento' },
  { code: 4, value: 'concessao',           label: 'Concessão' },
  { code: 5, value: 'termo_adesao',        label: 'Termo de Adesão' },
  { code: 6, value: 'convenio_revogado',   label: 'Convênio (revogado)' },
  { code: 7, value: 'empenho',             label: 'Empenho' },
  { code: 8, value: 'outros',              label: 'Outros' },
  { code: 9, value: 'ted_revogado',        label: 'TED (revogado)' },
  { code: 10, value: 'act_revogado',       label: 'ACT (revogado)' },
  { code: 11, value: 'termo_compromisso_revogado', label: 'Termo de Compromisso (revogado)' },
  { code: 12, value: 'carta_contrato',     label: 'Carta Contrato' },
];

export const TIPO_TERMO_CONTRATO = [
  { code: 1, value: 'termo_rescisao',      label: 'Termo de Rescisão' },
  { code: 2, value: 'termo_aditivo',       label: 'Termo Aditivo' },
  { code: 3, value: 'termo_apostilamento', label: 'Termo de Apostilamento' },
];

export const CATEGORIA_PROCESSO = [
  { code: 1, value: 'cessao',                label: 'Cessão' },
  { code: 2, value: 'compras',               label: 'Compras' },
  { code: 3, value: 'informatica_tic',       label: 'Informática (TIC)' },
  { code: 4, value: 'internacional',         label: 'Internacional' },
  { code: 5, value: 'locacao_imoveis',       label: 'Locação Imóveis' },
  { code: 6, value: 'mao_de_obra',           label: 'Mão de Obra' },
  { code: 7, value: 'obras',                 label: 'Obras' },
  { code: 8, value: 'servicos',              label: 'Serviços' },
  { code: 9, value: 'servicos_engenharia',   label: 'Serviços de Engenharia' },
  { code: 10, value: 'servicos_saude',       label: 'Serviços de Saúde' },
  { code: 11, value: 'alienacao_bens',       label: 'Alienação de bens móveis/imóveis' },
];

export const TIPO_DOCUMENTO = [
  { code: 1, value: 'aviso_contratacao_direta', label: 'Aviso de Contratação Direta' },
  { code: 2, value: 'edital',                   label: 'Edital' },
  { code: 3, value: 'minuta_contrato',          label: 'Minuta do Contrato' },
  { code: 4, value: 'termo_referencia',         label: 'Termo de Referência' },
  { code: 5, value: 'anteprojeto',              label: 'Anteprojeto' },
  { code: 6, value: 'projeto_basico',           label: 'Projeto Básico' },
  { code: 7, value: 'estudo_tecnico_preliminar',label: 'Estudo Técnico Preliminar' },
  { code: 8, value: 'projeto_executivo',        label: 'Projeto Executivo' },
  { code: 9, value: 'mapa_riscos',              label: 'Mapa de Riscos' },
  { code: 10, value: 'dfd',                     label: 'DFD' },
  { code: 11, value: 'ata_registro_preco',      label: 'Ata de Registro de Preço' },
  { code: 12, value: 'contrato',                label: 'Contrato' },
  { code: 13, value: 'termo_rescisao',          label: 'Termo de Rescisão' },
  { code: 14, value: 'termo_aditivo',           label: 'Termo Aditivo' },
  { code: 15, value: 'termo_apostilamento',     label: 'Termo de Apostilamento' },
  { code: 16, value: 'outros_documentos',       label: 'Outros documentos do processo' },
  { code: 17, value: 'nota_empenho',            label: 'Nota de Empenho' },
  { code: 18, value: 'relatorio_final_contrato',label: 'Relatório Final de Contrato' },
  { code: 19, value: 'minuta_ata_registro_precos', label: 'Minuta de Ata de Registro de Preços' },
  { code: 20, value: 'ato_autoriza_contratacao_direta', label: 'Ato que autoriza a Contratação Direta' },
];

export const NATUREZA_JURIDICA = [
  { code: 0, value: '0000', label: '0000 - Natureza Jurídica não informada' },
  { code: 1, value: '1015', label: '1015 - Órgão Público do Poder Executivo Federal' },
  { code: 2, value: '1023', label: '1023 - Órgão Público do Poder Executivo Estadual/DF' },
  { code: 3, value: '1031', label: '1031 - Órgão Público do Poder Executivo Municipal' },
  { code: 4, value: '1040', label: '1040 - Órgão Público do Poder Legislativo Federal' },
  { code: 5, value: '1058', label: '1058 - Órgão Público do Poder Legislativo Estadual/DF' },
  { code: 6, value: '1066', label: '1066 - Órgão Público do Poder Legislativo Municipal' },
  { code: 7, value: '1074', label: '1074 - Órgão Público do Poder Judiciário Federal' },
  { code: 8, value: '1082', label: '1082 - Órgão Público do Poder Judiciário Estadual' },
  { code: 9, value: '1104', label: '1104 - Autarquia Federal' },
  { code: 10, value: '1112', label: '1112 - Autarquia Estadual/DF' },
  { code: 11, value: '1120', label: '1120 - Autarquia Municipal' },
  { code: 12, value: '1139', label: '1139 - Fundação Pública Dir. Público Federal' },
  { code: 13, value: '1147', label: '1147 - Fundação Pública Dir. Público Estadual/DF' },
  { code: 14, value: '1155', label: '1155 - Fundação Pública Dir. Público Municipal' },
  { code: 15, value: '1163', label: '1163 - Órgão Público Autônomo Federal' },
  { code: 16, value: '1171', label: '1171 - Órgão Público Autônomo Estadual/DF' },
  { code: 17, value: '1180', label: '1180 - Órgão Público Autônomo Municipal' },
  { code: 18, value: '1198', label: '1198 - Comissão Polinacional' },
  { code: 19, value: '1210', label: '1210 - Consórcio Público de Direito Público' },
  { code: 20, value: '1228', label: '1228 - Consórcio Público de Direito Privado' },
  { code: 21, value: '1236', label: '1236 - Estado ou Distrito Federal' },
  { code: 22, value: '1244', label: '1244 - Município' },
  { code: 23, value: '1252', label: '1252 - Fundação Pública de Direito Privado Federal' },
  { code: 24, value: '1260', label: '1260 - Fundação Pública de Direito Privado Estadual/DF' },
  { code: 25, value: '1279', label: '1279 - Fundação Pública de Direito Privado Municipal' },
  { code: 26, value: '1287', label: '1287 - Fundo Público da Administração Indireta Federal' },
  { code: 27, value: '1295', label: '1295 - Fundo Público da Administração Indireta Estadual/DF' },
  { code: 28, value: '1309', label: '1309 - Fundo Público da Administração Indireta Municipal' },
  { code: 29, value: '1317', label: '1317 - Fundo Público da Administração Direta Federal' },
  { code: 30, value: '1325', label: '1325 - Fundo Público da Administração Direta Estadual/DF' },
  { code: 31, value: '1333', label: '1333 - Fundo Público da Administração Direta Municipal' },
  { code: 32, value: '1341', label: '1341 - União' },
  { code: 33, value: '2011', label: '2011 - Empresa Pública' },
  { code: 34, value: '2038', label: '2038 - Sociedade de Economia Mista' },
  { code: 35, value: '2046', label: '2046 - Sociedade Anônima Aberta' },
  { code: 36, value: '2054', label: '2054 - Sociedade Anônima Fechada' },
  { code: 37, value: '2062', label: '2062 - Sociedade Empresária Limitada' },
  { code: 38, value: '2070', label: '2070 - Sociedade Empresária em Nome Coletivo' },
  { code: 39, value: '2089', label: '2089 - Sociedade Empresária em Comandita Simples' },
  { code: 40, value: '2097', label: '2097 - Sociedade Empresária em Comandita por Ações' },
  { code: 41, value: '2100', label: '2100 - Sociedade Mercantil de Capital e Indústria' },
  { code: 42, value: '2127', label: '2127 - Sociedade em Conta de Participação' },
  { code: 43, value: '2135', label: '2135 - Empresário (Individual)' },
  { code: 44, value: '2143', label: '2143 - Cooperativa' },
  { code: 45, value: '2151', label: '2151 - Consórcio de Sociedades' },
  { code: 46, value: '2160', label: '2160 - Grupo de Sociedades' },
  { code: 47, value: '2178', label: '2178 - Estab. no Brasil de Sociedade Estrangeira' },
  { code: 48, value: '2194', label: '2194 - Estab. no Brasil de Empresa Binacional Argentino-Brasileira' },
  { code: 49, value: '2216', label: '2216 - Empresa Domiciliada no Exterior' },
  { code: 50, value: '2224', label: '2224 - Clube/Fundo de Investimento' },
  { code: 51, value: '2232', label: '2232 - Sociedade Simples Pura' },
  { code: 52, value: '2240', label: '2240 - Sociedade Simples Limitada' },
  { code: 53, value: '2259', label: '2259 - Sociedade Simples em Nome Coletivo' },
  { code: 54, value: '2267', label: '2267 - Sociedade Simples em Comandita Simples' },
  { code: 55, value: '2275', label: '2275 - Empresa Binacional' },
  { code: 56, value: '2283', label: '2283 - Consórcio de Empregadores' },
  { code: 57, value: '2291', label: '2291 - Consórcio Simples' },
  { code: 58, value: '2305', label: '2305 - EIRELI (Empresária)' },
  { code: 59, value: '2313', label: '2313 - EIRELI (Simples)' },
  { code: 60, value: '2321', label: '2321 - Sociedade Unipessoal de Advocacia' },
  { code: 61, value: '2330', label: '2330 - Cooperativas de Consumo' },
  { code: 62, value: '2348', label: '2348 - Empresa Simples de Inovação - Inova Simples' },
  { code: 63, value: '2356', label: '2356 - Investidor Não Residente' },
  { code: 64, value: '3034', label: '3034 - Serviço Notarial e Registral (Cartório)' },
  { code: 65, value: '3069', label: '3069 - Fundação Privada' },
  { code: 66, value: '3077', label: '3077 - Serviço Social Autônomo' },
  { code: 67, value: '3085', label: '3085 - Condomínio Edilício' },
  { code: 68, value: '3107', label: '3107 - Comissão de Conciliação Prévia' },
  { code: 69, value: '3115', label: '3115 - Entidade de Mediação e Arbitragem' },
  { code: 70, value: '3131', label: '3131 - Entidade Sindical' },
  { code: 71, value: '3204', label: '3204 - Estab. no Brasil de Fundação/Associação Estrangeiras' },
  { code: 72, value: '3212', label: '3212 - Fundação/Associação Domiciliada no Exterior' },
  { code: 73, value: '3220', label: '3220 - Organização Religiosa' },
  { code: 74, value: '3239', label: '3239 - Comunidade Indígena' },
  { code: 75, value: '3247', label: '3247 - Fundo Privado' },
  { code: 76, value: '3255', label: '3255 - Dir. Nacional de Partido Político' },
  { code: 77, value: '3263', label: '3263 - Dir. Regional de Partido Político' },
  { code: 78, value: '3271', label: '3271 - Dir. Local de Partido Político' },
  { code: 79, value: '3280', label: '3280 - Comitê Financeiro de Partido Político' },
  { code: 80, value: '3298', label: '3298 - Frente Plebiscitária/Referendária' },
  { code: 81, value: '3301', label: '3301 - Organização Social (OS)' },
  { code: 82, value: '3328', label: '3328 - Plano de Benefícios de Previdência Fechada' },
  { code: 83, value: '3999', label: '3999 - Associação Privada' },
  { code: 84, value: '4014', label: '4014 - Empresa Individual Imobiliária' },
  { code: 85, value: '4090', label: '4090 - Candidato a Cargo Político Eletivo' },
  { code: 86, value: '4120', label: '4120 - Produtor Rural (Pessoa Física)' },
  { code: 87, value: '5010', label: '5010 - Organização Internacional' },
  { code: 88, value: '5029', label: '5029 - Representação Diplomática Estrangeira' },
  { code: 89, value: '5037', label: '5037 - Outras Instituições Extraterritoriais' },
  { code: 90, value: '8885', label: '8885 - Natureza Jurídica não informada' },
];

export const PORTE_EMPRESA = [
  { code: 1, value: 'me',         label: 'ME - Microempresa' },
  { code: 2, value: 'epp',        label: 'EPP - Empresa de Pequeno Porte' },
  { code: 3, value: 'demais',     label: 'Demais' },
  { code: 4, value: 'pf',         label: 'Não se aplica (PF)' },
  { code: 5, value: 'nao_informado', label: 'Não informado' },
];


// ==============================
// Helpers para mapear label <-> value (codes) nas constantes
// ==============================
const __norm = (s) =>
  (typeof s === 'string'
    ? s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
    : String(s ?? '').toLowerCase().trim());

/**
 * toCode(options, valorDoBackendOuLabel)
 * Converte um label (ou code/valor já válido) para o 'value' definido nas constantes.
 * Retorna '' se não encontrar.
 */
export const toCode = (options, valueOrLabel) => {
  if (valueOrLabel == null || valueOrLabel === '') return '';
  // já é o value?
  const byValue = options.find((o) => o.value === valueOrLabel);
  if (byValue) return byValue.value;
  // veio como label do backend?
  const byLabel = options.find((o) => __norm(o.label) === __norm(valueOrLabel));
  if (byLabel) return byLabel.value;
  // eventualmente veio como code numérico
  const byCode = options.find((o) => String(o.code) === String(valueOrLabel));
  if (byCode) return byCode.value;
  return '';
};

/**
 * fromCode(options, codeOuLabel)
 * Localiza o objeto da constante a partir de value, label ou code.
 * Retorna o objeto inteiro ( { code, value, label } ) ou null se não encontrar.
 */
export const fromCode = (options, codeOrLabel) => {
  if (codeOrLabel == null || codeOrLabel === '') return null;
  const byValue = options.find((o) => o.value === codeOrLabel);
  if (byValue) return byValue;
  const byLabel = options.find((o) => __norm(o.label) === __norm(codeOrLabel));
  if (byLabel) return byLabel;
  const byCode = options.find((o) => String(o.code) === String(codeOrLabel));
  if (byCode) return byCode;
  return null;
};