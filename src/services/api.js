// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: "https://backend-restaurantes-wq8c.onrender.com/api",
});

// Interceptor para añadir el token a cada solicitud (si existe)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el error es 400 y cumple cierta condición, puedes decidir ignorarlo o notificarlo de forma menos intrusiva
    if (error.response && error.response.status === 400) {
      console.warn("Error 400 ignorado:", error.response.data);
      return Promise.resolve(error.response);
    }
    return Promise.reject(error);
  }
);

export default api;
