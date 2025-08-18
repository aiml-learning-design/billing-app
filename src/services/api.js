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
    
    // Extract API response according to Swagger
    const apiResponse = response.data;
    
    // Check for API response structure
    if (!apiResponse.success || !apiResponse.data) {
      const backendMessage = apiResponse.message || 'Token refresh failed';
      throw new Error(backendMessage);
    }
    
    // Access the actual auth data via response.data.data (AuthResponse object)
    const authData = apiResponse.data;
    const accessToken = authData.authenticationData.accessToken;
    const newRefreshToken = authData.authenticationData.refreshToken;
    
    if (!accessToken || !newRefreshToken) {
      throw new Error('Invalid token response');
    }
    
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN, accessToken);
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
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
  response => {
    // Return the entire response.data to allow components to check success flag
    return response.data;
  },
  async error => {
    const originalRequest = error.config;
    
    // Handle network errors (backend unavailable)
    if (!error.response) {
      console.error('Network error detected - backend may be unavailable:', error.message);
      // Clear authentication tokens and redirect to login
      authUtils.clearTokens();
      authUtils.redirectToLogin();
      return Promise.reject(new Error('Backend server is unavailable. Please try again later.'));
    }
    
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
      // Extract error message from the API response structure
      const apiResponse = error.response.data;
      return Promise.reject(apiResponse?.message || error.message);
    }
    
    return Promise.reject(error);
  }
);

api.clearAuthTokens = authUtils.clearTokens;


export default api;