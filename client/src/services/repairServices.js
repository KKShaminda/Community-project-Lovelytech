import { buildUrl, request } from './api.js';

const API_URL = buildUrl('/repairs');

export const createRepairRequest = async (payload) => {
  return request(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const createRepair = createRepairRequest;

export const getMyRepairs = async () => {
  return request(`${API_URL}/my-repairs`, { method: 'GET' });
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
