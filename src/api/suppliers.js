import apiClient from './axios';

export async function fetchSuppliers() {
  const res = await apiClient.get('/suppliers');
  return res.data; // array
}

export async function createSupplier(payload) {
  const res = await apiClient.post('/suppliers', payload);
  return res.data; // { message, data }
}

export async function updateSupplier(id, payload) {
  const res = await apiClient.put(`/suppliers/${id}`, payload);
  return res.data; // { message, data }
}

export async function deleteSupplier(id) {
  const res = await apiClient.delete(`/suppliers/${id}`);
  return res.data; // { message }
}
