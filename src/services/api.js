import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_RAILWAY_URL,
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
