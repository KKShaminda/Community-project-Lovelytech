import { buildUrl, request } from './api.js'

const API_URL = buildUrl('/sales')

export const getSales = async () => request(API_URL, { method: 'GET' })

export const createSale = async (payload) =>
  request(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateSale = async (saleId, payload) =>
  request(`${API_URL}/${saleId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const deleteSale = async (saleId) =>
  request(`${API_URL}/${saleId}`, { method: 'DELETE' })
