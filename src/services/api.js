import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Modify your existing axios interceptor:
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      // For all other errors, pass through the error message
      return Promise.reject(error.response.data?.message || error.message);
    }
    return Promise.reject(error);
  }
);

export default api;