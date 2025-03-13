// src/services/api.js
import axios from 'axios';

const api = axios.create({
  //baseURL: "https://backend-restaurantes-wq8c.onrender.com/api",
  baseURL: process.env.API_URL || "http://localhost:5001/api",
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Only add token for non-public endpoints
    if (!config.url.includes('/public')) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle token expiration
      localStorage.removeItem('token');
      // Optionally redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;