import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authData, setAuthData] = useState(null); // Stores complete auth response
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

// In your AuthContext.js
const handleGoogleAuth = async (authResponseJson) => {
  try {
    setLoading(true);
    const authResponse = JSON.parse(decodeURIComponent(authResponseJson));

    // Store tokens
    localStorage.setItem('token', authResponse.accessToken);
    localStorage.setItem('authData', JSON.stringify(authResponse));

    if (authResponse.refreshToken) {
      localStorage.setItem('refreshToken', authResponse.refreshToken);
    }

    // Set user state
    const userData = authResponse.userDetails || jwt_decode(authResponse.accessToken);
    setUser(userData);

    return userData;
  } catch (error) {
    setError('Failed to process authentication');
    throw error;
  } finally {
    setLoading(false);
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
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      return response.accessToken;
    } catch (error) {
      logout();
      throw error;
    }
  };

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedAuthData = localStorage.getItem('authData');
      
      if (token) {
        try {
          if (isTokenExpired(token)) {
            const newToken = await refreshToken();
            updateAuthState(newToken, storedAuthData);
          } else {
            updateAuthState(token, storedAuthData);
          }
        } catch (error) {
          console.error('Authentication initialization error:', error);
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  // Update both user and auth data state
  const updateAuthState = (token, storedAuthData) => {
    try {
      const decoded = jwt_decode(token);
      setUser(decoded);
      
      if (storedAuthData) {
        const parsedAuthData = JSON.parse(storedAuthData);
        setAuthData(parsedAuthData);
      }
    } catch (error) {
      console.error('Token decoding error:', error);
      logout();
    }
  };

  // Unified auth response handler
  const handleAuthResponse = (response) => {
    localStorage.setItem('token', response.accessToken);
    localStorage.setItem('authData', JSON.stringify(response));

    if (response.invoktaAuthentication?.refreshToken) {
      localStorage.setItem('refreshToken', response.invoktaAuthentication.refreshToken);
    }

    setUser(jwt_decode(response.accessToken));
    setAuthData(response);

    // Redirect to dashboard or pre-auth path
    const preAuthPath = sessionStorage.getItem('preAuthPath') || '/dashboard';
    sessionStorage.removeItem('preAuthPath');
    navigate(preAuthPath);
  };

  // Email/password login
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.post('/api/auth/authenticate', { email, password });
      handleAuthResponse(response);
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth login
// In your AuthContext.js
// Update loginWithGoogle to ensure proper state handling
const loginWithGoogle = async (googleData) => {
  try {
    setError(null);
    setLoading(true);

    if (googleData.authResponse) {
      const authResponse = JSON.parse(decodeURIComponent(googleData.authResponse));

      // Store tokens
      localStorage.setItem('token', authResponse.accessToken);
      localStorage.setItem('authData', JSON.stringify(authResponse));

      if (authResponse.invoktaAuthentication?.refreshToken) {
        localStorage.setItem('refreshToken', authResponse.invoktaAuthentication.refreshToken);
      }

      // Decode and set user
      const userData = authResponse.userDetails || jwt_decode(authResponse.accessToken);
      setUser(userData);
      setAuthData(authResponse);

      return userData;
    }
    throw new Error('Invalid auth response format');
  } catch (error) {
    setError(error.message || 'Google login failed');
    throw error;
  } finally {
    setLoading(false);
  }
};

  // Registration
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      api.clearAuthTokens();
      
      const response = await api.post('/api/auth/register', userData);
      if (response.accessToken) {
        handleAuthResponse(response);
        navigate('/business-setup');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('authData');
    setUser(null);
    setAuthData(null);
    navigate('/login');
  };

  const value = {
    user,
    authData, // Provides complete auth response to components
    loading,
    error,
    login,
    register,
    logout,
    loginWithGoogle,
    setError,
    refreshToken,
    handleGoogleAuth
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