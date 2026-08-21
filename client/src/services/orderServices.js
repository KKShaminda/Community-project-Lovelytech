const normalizeUrlPart = (value = '') => value.replace(/\/+$/, '');

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').trim();
const normalizedBaseUrl = normalizeUrlPart(rawBaseUrl.replace(/\/api$/i, ''));
const API_URL = `${normalizedBaseUrl}/api/orders`;

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
  const isFormData = options.body instanceof FormData;
  const headers = { ...(options.headers || {}) };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const message = data?.message || data?.error || response.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
};

export const createOrder = async (payload) => {
  const isFormData = payload instanceof FormData;
  return request(API_URL, {
    method: 'POST',
    body: isFormData ? payload : JSON.stringify(payload),
  });
};

export const getOrders = async (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.append(key, String(value));
  });

  const queryString = query.toString();
  return request(`${API_URL}${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
};

export const getOrderById = async (id) => {
  return request(`${API_URL}/${encodeURIComponent(id)}`, { method: 'GET' });
};

export const updateOrderStatus = async (id, status) => {
  return request(`${API_URL}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

export const updateOrder = async (id, payload) => {
  return request(`${API_URL}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const deleteOrder = async (id) => {
  return request(`${API_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' });
};
