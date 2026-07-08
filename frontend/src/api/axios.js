import axios from 'axios';

// Single shared axios instance - every API call in the app goes through here,
// so we only have to configure the base URL and auth header logic once.
const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Interceptor: automatically attaches the JWT (if present) to every
// outgoing request, so individual components never have to do it manually.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
