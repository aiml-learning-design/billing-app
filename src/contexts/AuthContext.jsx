import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwt_decode(token);
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token available');
      
      const response = await api.post('/api/auth/refresh-token', {}, {
        headers: {
          'X-Refresh-Token': refreshToken
        }
      });
      
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      return response.accessToken;
    } catch (error) {
    //  console.error('Failed to refresh token:', error);
      logout();
      throw error;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        if (isTokenExpired(token)) {
          try {
            const newToken = await refreshToken();
            setUser(jwt_decode(newToken));
          } catch (error) {
            // If refresh fails, user will be logged out in the refreshToken function
          }
        } else {
          setUser(jwt_decode(token));
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/authenticate', { email, password });
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      setUser(jwt_decode(response.accessToken));
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData) => {
    api.clearAuthTokens();
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setError(null);
      const response = await api.post('/api/auth/register', userData);
      if (response.accessToken) {
        localStorage.setItem('token', response.accessToken);
        if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }
          setUser(jwt_decode(response.accessToken));
      }
      navigate('/business-setup');
    } catch (error) {
      api.clearAuthTokens();
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const loginWithGoogle = async (googleData) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/google', {
        token: googleData.credential
      });
      if (response.accessToken) {
        localStorage.setItem('token', response.accessToken);
        if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }
          setUser(jwt_decode(response.accessToken));
      }
      navigate('/dashboard');
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setError(error.response?.data?.message || 'Google login failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    loginWithGoogle,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}