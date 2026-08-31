import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3500/api',
});

// Har request ke sath agar token hai to automatically bhej do
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;