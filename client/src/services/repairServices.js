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
