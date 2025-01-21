import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-restaurantes-wq8c.onrender.com/api', // Cambia esto al URL de tu backend en el futuro
});

export default api;
