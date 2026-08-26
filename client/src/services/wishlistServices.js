import { getAuthHeaders } from './authServices';

const normalizeUrlPart = (value = '') => value.replace(/\/+$/, '');

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').trim();
const normalizedBaseUrl = normalizeUrlPart(rawBaseUrl.replace(/\/api$/i, ''));
const API_URL = `${normalizedBaseUrl}/api/wishlist`;

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
  const headers = {
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

// GET current user's wishlist
export const getWishlist = async () => {
  return request(API_URL, { method: 'GET' });
};

// Toggle item in wishlist (atomic add or remove)
export const toggleWishlist = async (productId) => {
  return request(`${API_URL}/toggle`, {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
};

// Add item to wishlist
export const addToWishlist = async (productId) => {
  return request(`${API_URL}/add`, {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
};

// Remove item from wishlist
export const removeFromWishlist = async (productId) => {
  return request(`${API_URL}/remove/${productId}`, {
    method: 'DELETE',
  });
};

// Clear entire wishlist
export const clearWishlist = async () => {
  return request(`${API_URL}/clear`, {
    method: 'DELETE',
  });
};
