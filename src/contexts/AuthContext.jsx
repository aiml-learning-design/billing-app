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
  
  const hasBusinessDetails = (userData) => {
    // Check if user has businesses in their profile
    const hasBusinessesInProfile = userData?.businesses && userData.businesses.length > 0;
    
    // Check if user has completed business setup (stored in localStorage)
    const hasCompletedBusinessSetup = localStorage.getItem('businessSetupCompleted') === 'true';
    
    console.log('Has businesses in profile:', hasBusinessesInProfile);
    console.log('Has completed business setup:', hasCompletedBusinessSetup);
    
    return hasBusinessesInProfile || hasCompletedBusinessSetup;
  };

  const isTokenExpired = (token) => {
    try {
      const decoded = jwt_decode(token);
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  };

const handleGoogleAuth = async (authResponseJson) => {
  // Set a timeout to ensure loading state is reset even if something goes wrong
  const loadingTimeout = setTimeout(() => {
    console.log('handleGoogleAuth: Safety timeout triggered - resetting loading state');
    setLoading(false);
  }, 5000); // 5 seconds timeout as a safety measure

  try {
    console.log('handleGoogleAuth: Starting authentication process');
    setLoading(true);
    
    if (!authResponseJson) {
      throw new Error('Auth response JSON is null or undefined');
    }
    
    const authResponse = JSON.parse(decodeURIComponent(authResponseJson));
    console.log('handleGoogleAuth: Auth response parsed successfully');

    if (!authResponse || !authResponse.accessToken) {
      throw new Error('Invalid auth response format - missing access token');
    }

    // Store tokens
    localStorage.setItem('token', authResponse.accessToken);
    localStorage.setItem('authData', JSON.stringify(authResponse));
    console.log('handleGoogleAuth: Tokens stored in localStorage');

    if (authResponse.invoktaAuthentication.refreshToken) {
      localStorage.setItem('refreshToken', authResponse.invoktaAuthentication.refreshToken);
    }

    console.log('handleGoogleAuth: Extracting user data');
    const userData = authResponse.invoktaAuthentication.payload;

    console.log('handleGoogleAuth: User data extracted', userData ? 'successfully' : 'failed');
    
    if (!userData) {
      throw new Error('Failed to extract user data from token');
    }
    
    console.log('handleGoogleAuth: Setting user state');
    setUser(userData);
    console.log('handleGoogleAuth: Setting auth data state');
    setAuthData(authResponse);
    
    console.log('handleGoogleAuth: Authentication process completed successfully');

    return userData;
  } catch (error) {
    console.error('handleGoogleAuth: Error during authentication', error);
    setError('Failed to process authentication');
    throw error;
  } finally {
    clearTimeout(loadingTimeout);
    
    console.log('handleGoogleAuth: Setting loading state to false');
    setLoading(false);
    
    setTimeout(() => {
      if (loading) {
        console.log('handleGoogleAuth: Loading state still true after completion - forcing reset');
        setLoading(false);
      }
    }, 500);
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

    const userData = jwt_decode(response.accessToken);
    setUser(userData);
    setAuthData(response);

    // Check if user has business details
    if (!hasBusinessDetails(userData)) {
      // If no business details, redirect to business setup page
      navigate('/business-setup');
    } else {
      // Redirect to dashboard or pre-auth path
      const preAuthPath = sessionStorage.getItem('preAuthPath') || '/dashboard';
      sessionStorage.removeItem('preAuthPath');
      navigate(preAuthPath);
    }
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


  // Registration
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      api.clearAuthTokens();
      
      const response = await api.post('/api/auth/register', userData);
      if (response.accessToken) {
        // Use handleAuthResponse which already has logic to check for business details
        // and redirect accordingly. No need for explicit navigation here.
        handleAuthResponse(response);
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
    setError,
    refreshToken,
    handleGoogleAuth
  };

  // Log the current state before rendering
  console.log('AuthProvider: Rendering with state', { 
    userExists: !!user, 
    isLoading: loading,
    hasAuthData: !!authData
  });

  return (
    <AuthContext.Provider value={value}>
      {/* Only render children when not loading */}
      {!loading ? (
        children
      ) : (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <p>Loading authentication...</p>
        </div>
      )}
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