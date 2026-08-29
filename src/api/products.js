import apiClient from './axios';

// GET /api/products -> array langsung
export async function fetchProducts() {
  const res = await apiClient.get('/products');
  return res.data;
}

export async function fetchProduct(id) {
  const res = await apiClient.get(`/products/${id}`);
  return res.data;
}

// payload: { name, sku, price, stock, categoryId, supplierId, imageFile }
function buildProductFormData(payload) {
  const form = new FormData();
  form.append('name', payload.name);
  form.append('sku', payload.sku);
  form.append('price', payload.price);
  form.append('stock', payload.stock);
  form.append('categoryId', payload.categoryId);
  if (payload.supplierId) form.append('supplierId', payload.supplierId);
  if (payload.imageFile) form.append('image', payload.imageFile);
  return form;
}

export async function createProduct(payload) {
  const form = buildProductFormData(payload);
  const res = await apiClient.post('/products', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data; // { message, data }
}

export async function updateProduct(id, payload) {
  const form = buildProductFormData(payload);
  const res = await apiClient.put(`/products/${id}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data; // { message, data }
}

export async function deleteProduct(id) {
  const res = await apiClient.delete(`/products/${id}`);
  return res.data; // { message, data }
}
