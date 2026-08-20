import { buildUrl, request, requestFormData } from './api.js';

const API_URL = buildUrl('/products');

export const getProducts = async (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.append(key, String(value));
  });

  const queryString = query.toString();
  return request(`${API_URL}${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
};

export const getProductFacets = async (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.append(key, String(value));
  });

  const queryString = query.toString();
  return request(`${API_URL}/facets${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
};

export const getProductById = async (productId) => {
  return request(`${API_URL}/${productId}`, { method: 'GET' });
};

export const createProduct = async (payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (key === 'images' && Array.isArray(value)) {
      value.forEach((file) => formData.append('images', file));
      return;
    }

    formData.append(key, value);
  });

  return requestFormData(API_URL, formData, 'POST');
};

export const updateProduct = async (productId, payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (key === 'images' && Array.isArray(value)) {
      value.forEach((file) => formData.append('images', file));
      return;
    }

    formData.append(key, value);
  });

  return requestFormData(`${API_URL}/${productId}`, formData, 'PUT');
};

export const deleteProduct = async (productId) => {
  return request(`${API_URL}/${productId}`, { method: 'DELETE' });
};
