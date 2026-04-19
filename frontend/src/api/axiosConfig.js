// src/api/axiosConfig.js - Centralized Axios Setup

import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach whichever token exists (admin takes priority)
API.interceptors.request.use((config) => {
  const adminToken  = localStorage.getItem('adminToken');
  const clientToken = localStorage.getItem('clientToken');
  const token = adminToken || clientToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      if (localStorage.getItem('adminToken')) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      } else if (localStorage.getItem('clientToken')) {
        localStorage.removeItem('clientToken');
        localStorage.removeItem('clientUser');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
