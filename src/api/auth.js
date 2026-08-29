import apiClient from './axios';

export async function loginRequest(username, password) {
  const res = await apiClient.post('/auth/login', { username, password });
  return res.data; // { message, token, data: { id, username, role } }
}

export async function registerRequest(username, password) {
  const res = await apiClient.post('/auth/register', { username, password });
  return res.data; // { message, data }
}
