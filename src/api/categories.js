import apiClient from './axios';

export async function fetchCategories() {
  const res = await apiClient.get('/categories');
  return res.data; // array
}

export async function createCategory(name) {
  const res = await apiClient.post('/categories', { name });
  return res.data; // category langsung (tidak dibungkus)
}

export async function updateCategory(id, name) {
  const res = await apiClient.put(`/categories/${id}`, { name });
  return res.data; // { message, data }
}

export async function deleteCategory(id) {
  const res = await apiClient.delete(`/categories/${id}`);
  return res.data; // { message }
}
