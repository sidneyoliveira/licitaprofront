/**
 * Utilitários para consumo da API backend.
 * 
 * Normaliza respostas paginadas (DRF) e plain arrays,
 * fornece helpers de paginação e tratamento de erro.
 */

/**
 * Extrai a lista de resultados de uma resposta da API.
 * Suporta resposta paginada { count, results } e array direto.
 *
 * @param {object|array} data - response.data da API
 * @returns {array} lista de itens
 */
export function extractResults(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

/**
 * Extrai metadados de paginação de uma resposta paginada.
 *
 * @param {object} data - response.data da API
 * @param {number} pageSize - tamanho da página (default 50)
 * @returns {{ count: number, totalPages: number, next: string|null, previous: string|null }}
 */
export function extractPagination(data, pageSize = 50) {
  if (!data || Array.isArray(data)) {
    const len = Array.isArray(data) ? data.length : 0;
    return { count: len, totalPages: 1, next: null, previous: null };
  }
  const count = data.count || 0;
  return {
    count,
    totalPages: Math.max(1, Math.ceil(count / pageSize)),
    next: data.next || null,
    previous: data.previous || null,
  };
}

/**
 * Extrai uma mensagem de erro amigável de um erro Axios/DRF.
 *
 * @param {Error} error - erro capturado no catch
 * @param {string} fallback - mensagem padrão
 * @returns {string}
 */
export function extractErrorMessage(error, fallback = "Ocorreu um erro inesperado.") {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  // DRF retorna { detail: "..." } ou { field: ["msg"] }
  if (typeof data.detail === "string") return data.detail;
  if (typeof data === "string") return data;
  // Concatena erros de campo
  const msgs = Object.values(data)
    .flat()
    .filter((v) => typeof v === "string");
  return msgs.length > 0 ? msgs.join(" ") : fallback;
}
