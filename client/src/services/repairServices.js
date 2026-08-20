<<<<<<< HEAD
import { buildUrl, request } from './api.js'

const API_URL = buildUrl('/repairs')

const toQuery = (params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value))
    }
  })
  return query.toString()
}

// ── Public ────────────────────────────────────────────────────────────────────

/** Submit a new repair booking. No auth required. */
export const createRepair = async (payload) =>
  request(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

/** Track a repair by tracking ID (e.g. LT-2026-123456). No auth required. */
export const trackRepair = async (trackingId) =>
  request(`${API_URL}/track/${encodeURIComponent(trackingId.trim().toUpperCase())}`, {
    method: 'GET',
  })

// ── Authenticated Customer ────────────────────────────────────────────────────

/** Get the logged-in user's own repair bookings matching their email. */
export const getMyRepairs = async () =>
  request(`${API_URL}/my-repairs`, { method: 'GET' })

// ── Staff (Admin / Receptionist) ──────────────────────────────────────────────

/** Fetch all repairs with optional filters. Requires auth. */
export const getRepairs = async (params = {}) => {
  const qs = toQuery(params)
  return request(`${API_URL}${qs ? `?${qs}` : ''}`, { method: 'GET' })
}

/** Get a single repair by MongoDB _id. Requires auth. */
export const getRepairById = async (id) =>
  request(`${API_URL}/${id}`, { method: 'GET' })

/** Update a repair record. Requires auth. */
export const updateRepair = async (id, payload) =>
  request(`${API_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

/** Delete a repair record. Requires admin. */
export const deleteRepair = async (id) =>
  request(`${API_URL}/${id}`, { method: 'DELETE' })
=======
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

export const createRepairRequest = async (payload) => {
  return request(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getRepairs = async () => {
  return request(API_URL, { method: 'GET' });
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
>>>>>>> 20501282b1f059e730b954eec24bf8e68882c0d0
