const normalizeUrlPart = (value = '') => value.replace(/\/+$/, '');

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').trim();
const normalizedBaseUrl = normalizeUrlPart(rawBaseUrl.replace(/\/api$/i, ''));
const API_URL = `${normalizedBaseUrl}/api/sales`;

const parseResponse = async (response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include',
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const message = data?.message || data?.error || response.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
};

export const getSales = async () => {
  return request(API_URL, { method: 'GET' });
};

export const createSale = async (payload) => {
  return request(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateSale = async (id, payload) => {
  return request(`${API_URL}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const deleteSale = async (id) => {
  return request(`${API_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' });
};
