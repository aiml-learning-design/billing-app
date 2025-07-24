import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [businesses, setBusinesses] = useState([]);
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
      
      // Extract tokens from the new response structure
      const accessToken = response.accessToken;
      const newRefreshToken = response.authentication?.refreshToken;
      
      // Store the full user details from the authentication response
      const userInfo = response.authentication?.payload?.user;
      if (userInfo) {
        setUserDetails(userInfo);
        
        // Store the businesses if they exist
        const userBusinesses = userInfo?.businesses || [];
        setBusinesses(userBusinesses);
      }
      
      localStorage.setItem('token', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      return accessToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
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
            // If token is expired, try to refresh it
            const newToken = await refreshToken();
            setUser(jwt_decode(newToken));
            
            // After refreshing token, fetch user details to get business information
            try {
              const userResponse = await api.get('/api/users/me');
              setUserDetails(userResponse);
              
              // Store the businesses if they exist
              const userBusinesses = userResponse?.businesses || [];
              setBusinesses(userBusinesses);
            } catch (error) {
              console.error('Failed to fetch user details:', error);
            }
          } catch (error) {
            // If refresh fails, user will be logged out in the refreshToken function
          }
        } else {
          // If token is valid, set user from token
          setUser(jwt_decode(token));
          
          // Fetch user details to get business information
          try {
            const userResponse = await api.get('/api/users/me');
            setUserDetails(userResponse);
            
            // Store the businesses if they exist
            const userBusinesses = userResponse?.businesses || [];
            setBusinesses(userBusinesses);
            
            // Redirect based on whether the user has businesses
            // Only redirect if we're not already on the correct page
            const currentPath = window.location.pathname;
            if (userBusinesses && userBusinesses.length > 0) {
              if (currentPath === '/business-setup') {
                navigate('/dashboard');
              }
            } else {
              if (currentPath === '/dashboard' || currentPath === '/') {
                navigate('/business-setup');
              }
            }
          } catch (error) {
            console.error('Failed to fetch user details:', error);
          }
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
      
      // Extract tokens from the new response structure
      const accessToken = response.accessToken;
      const refreshToken = response.authentication?.refreshToken;
      
      localStorage.setItem('token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // Store the decoded JWT token
      setUser(jwt_decode(accessToken));
      
      // Store the full user details from the authentication response
      const userInfo = response.authentication?.payload?.user;
      setUserDetails(userInfo);
      
      // Store the businesses if they exist
      const userBusinesses = userInfo?.businesses || [];
      setBusinesses(userBusinesses);
      
      // Navigate based on whether the user has businesses
      if (userBusinesses && userBusinesses.length > 0) {
        navigate('/dashboard');
      } else {
        navigate('/business-setup');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/register', userData);
      
      // Extract tokens from the new response structure
      const accessToken = response.accessToken;
      const refreshToken = response.authentication?.refreshToken;
      
      localStorage.setItem('token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // Store the decoded JWT token
      setUser(jwt_decode(accessToken));
      
      // Store the full user details from the authentication response
      const userInfo = response.authentication?.payload?.user;
      setUserDetails(userInfo);
      
      // Store the businesses if they exist
      const userBusinesses = userInfo?.businesses || [];
      setBusinesses(userBusinesses);
      
      // For new registrations, always navigate to business setup
      // as they likely don't have businesses yet
      navigate('/business-setup');
    } catch (error) {
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
      
      // Extract tokens from the new response structure
      const accessToken = response.accessToken;
      const refreshToken = response.authentication?.refreshToken;
      
      localStorage.setItem('token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // Store the decoded JWT token
      setUser(jwt_decode(accessToken));
      
      // Store the full user details from the authentication response
      const userInfo = response.authentication?.payload?.user;
      setUserDetails(userInfo);
      
      // Store the businesses if they exist
      const userBusinesses = userInfo?.businesses || [];
      setBusinesses(userBusinesses);
      
      // Navigate based on whether the user has businesses
      if (userBusinesses && userBusinesses.length > 0) {
        navigate('/dashboard');
      } else {
        navigate('/business-setup');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Google login failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setUserDetails(null);
    setBusinesses([]);
    navigate('/login');
  };

  const value = {
    user,
    userDetails,
    businesses,
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