import axios from 'axios';

const api = axios.create({
  baseURL: process.env.RAILWAY_URL || "http://localhost:5001/api",  // si usas React
  // o si usas Next.js:
  // baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001/api",
});

api.interceptors.request.use(
  (config) => {
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
