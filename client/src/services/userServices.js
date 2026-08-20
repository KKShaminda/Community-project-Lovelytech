import { buildUrl, request } from './api.js';

const API_URL = buildUrl('/users');

export const getAllUsers = async () => request(API_URL, { method: 'GET' });

export const suspendUser = async (userId) => request(`${API_URL}/${userId}/suspend`, { method: 'PATCH' });

export const unsuspendUser = async (userId) => request(`${API_URL}/${userId}/unsuspend`, { method: 'PATCH' });