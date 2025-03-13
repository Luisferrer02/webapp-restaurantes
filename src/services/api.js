// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: "https://backend-restaurantes-wq8c.onrender.com/api",
});

// Interceptor para añadir el token a cada solicitud (si existe)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
