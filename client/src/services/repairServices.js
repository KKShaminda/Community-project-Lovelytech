const normalizeUrlPart = (value = '') => value.replace(/\/+$/, '');

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').trim();
const normalizedBaseUrl = normalizeUrlPart(rawBaseUrl.replace(/\/api$/i, ''));
const API_URL = `${normalizedBaseUrl}/api/repairs`;

const parseResponse = async (response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

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

export const createRepairRequest = async (payload) => {
  return request(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const createRepair = createRepairRequest;

export const getRepairs = async (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.append(key, String(value));
  });

  const queryString = query.toString();
  return request(`${API_URL}${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
};

export const getRepairByTrackingId = async (trackingId) => {
  return request(`${API_URL}/track/${encodeURIComponent(trackingId)}`, { method: 'GET' });
};

export const updateRepair = async (id, payload) => {
  return request(`${API_URL}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const deleteRepair = async (id) => {
  return request(`${API_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' });
};

