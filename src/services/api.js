import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-restaurantes-wq8c.onrender.com/api/restaurantes', // Cambia esto al URL de tu backend en el futuro
});

// Interceptor para agregar el token a cada solicitud
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
