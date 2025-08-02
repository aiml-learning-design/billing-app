import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { API_CONFIG, AUTH_CONFIG } from '../config/config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
});

const authUtils = {
  clearTokens: () => {
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
  },
  redirectToLogin: () => {
    window.location.href = AUTH_CONFIG.ROUTES.LOGIN;
  }
};

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
    const refreshToken = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) throw new Error('No refresh token available');
    
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN}`, 
      {}, 
      {
        headers: {
          [API_CONFIG.HEADERS.REFRESH_TOKEN]: refreshToken
        }
      }
    );
    // Extract tokens from the new response structure
    const { accessToken, authentication } = response.data;
    if (!accessToken || !authentication?.refreshToken) {
      throw new Error('Invalid token response');
    }
    
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN, accessToken);
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, authentication.refreshToken);
    return accessToken;
  } catch (error) {
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    window.location.href = AUTH_CONFIG.ROUTES.LOGIN;
    throw error;
  }
};

// Request interceptor
api.interceptors.request.use(async config => {
  let token = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
  
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
    config.headers[API_CONFIG.HEADERS.AUTHORIZATION] = `Bearer ${token}`;
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
        originalRequest.headers[API_CONFIG.HEADERS.AUTHORIZATION] = `Bearer ${token}`;
        
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

api.clearAuthTokens = authUtils.clearTokens;


export default api;