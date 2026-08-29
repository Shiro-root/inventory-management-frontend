import apiClient from './axios';

export async function fetchStockMovements() {
  const res = await apiClient.get('/stock-movements');
  return res.data; // array (tanpa relasi product)
}

export async function createStockMovement(payload) {
  // payload: { productId, type: 'IN' | 'OUT', quantity, note }
  const res = await apiClient.post('/stock-movements', payload);
  return res.data; // { message, data: { newStockMovement, updateStockProduct } }
}
