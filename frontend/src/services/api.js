import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vora_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('vora_token', data.token);
  localStorage.setItem('vora_user', JSON.stringify(data.user));
  return data.user;
}

export function logout() {
  localStorage.removeItem('vora_token');
  localStorage.removeItem('vora_user');
}

export function currentUser() {
  return JSON.parse(localStorage.getItem('vora_user') || 'null');
}

export async function getMyReservations(email) {
  const { data } = await api.get('/hotel/my-reservations', { params: { email } });
  return data.data;
}

export async function cancelReservation(id, email) {
  const { data } = await api.post(`/hotel/my-reservations/${id}/cancel`, { email });
  return data;
}
