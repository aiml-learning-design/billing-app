import axios from 'axios';
import jwt_decode from 'jwt-decode';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwt_decode(token);
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

// Function to refresh token
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');
    
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/auth/refresh-token`, 
      {}, 
      {
        headers: {
          'X-Refresh-Token': refreshToken
        }
      }
    );
    
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data.token;
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
    throw error;
  }
};

// Request interceptor
api.interceptors.request.use(async config => {
  let token = localStorage.getItem('token');
  
  // If token exists but is expired, try to refresh it
  if (token && isTokenExpired(token)) {
    try {
      token = await refreshToken();
    } catch (error) {
      // If refresh fails, the refreshToken function will handle logout
      return Promise.reject(error);
    }
  }
  
  // Add token to request headers
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Response interceptor
api.interceptors.response.use(
  response => response.data,
  async error => {
    const originalRequest = error.config;
    
    // If 401 error and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const token = await refreshToken();
        
        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, the refreshToken function will handle logout
        return Promise.reject(refreshError);
      }
    }
    
    // For all other errors, pass through the error message
    if (error.response) {
      return Promise.reject(error.response.data?.message || error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;