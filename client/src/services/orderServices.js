import { buildUrl, request } from './api.js';

const API_URL = buildUrl('/orders');

export const createOrder = async (payload) => {
  return request(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
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
