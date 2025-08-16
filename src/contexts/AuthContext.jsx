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
    // Handle different user data structures:
    // 1. Direct access to businesses array (from JWT token or usersDto)
    // 2. Nested access via user.usersDto.businesses (from payload)
    const hasBusinessesInProfile = userData?.user?.usersDto?.businesses && userData.user.usersDto.businesses.length > 0;

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

const handleGoogleAuth = async (apiResponse) => {
  // Set a timeout to ensure loading state is reset even if something goes wrong
  const loadingTimeout = setTimeout(() => {
    console.log('handleGoogleAuth: Safety timeout triggered - resetting loading state');
    setLoading(false);
  }, 5000); // 5 seconds timeout as a safety measure

  try {
    console.log('handleGoogleAuth: Starting authentication process');
    setLoading(true);
    
    if (!apiResponse) {
      throw new Error('Authentication failed');
    }
    
    // Check if apiResponse is a string (from URL parameter) and parse it
    let parsedResponse;
    if (typeof apiResponse === 'string') {
      console.log('handleGoogleAuth: Received string apiResponse, parsing JSON');
      try {
        parsedResponse = JSON.parse(decodeURIComponent(apiResponse));
        console.log('handleGoogleAuth: Successfully parsed JSON from string');
      } catch (parseError) {
        console.error('handleGoogleAuth: Error parsing JSON', parseError);
        throw new Error('Failed to parse authentication response');
      }
    } else {
      console.log('handleGoogleAuth: Received object apiResponse, using directly');
      // Already an object
      parsedResponse = apiResponse;
    }
    
    // Check if this is an ApiResponse wrapper or direct AuthResponse
    let authResponse;
    if (parsedResponse.success !== undefined && parsedResponse.data) {
      // This is an ApiResponse wrapper
      console.log('handleGoogleAuth: Detected ApiResponse wrapper');
      authResponse = parsedResponse.data;
    } else {
      // This might be a direct AuthResponse
      console.log('handleGoogleAuth: Using direct AuthResponse');
      authResponse = parsedResponse;
    }

    // Validate the auth response structure
    if (!authResponse || !authResponse.authenticationData || !authResponse.authenticationData.accessToken) {
      console.error('handleGoogleAuth: Invalid auth response structure', authResponse);
      throw new Error('Invalid auth response format - missing access token');
    }

    // Extract tokens from authenticationData
    const accessToken = authResponse.authenticationData.accessToken;
    const refreshToken = authResponse.authenticationData.refreshToken;

    // Store tokens
    localStorage.setItem('token', accessToken);
    localStorage.setItem('authData', JSON.stringify(authResponse));
    localStorage.setItem('refreshToken', refreshToken);
    console.log('handleGoogleAuth: Tokens stored in localStorage');
    console.log('handleGoogleAuth: Extracting user data');

    // Try to extract user data from different possible locations in the response
    let userData;
    
    // First try from payload.user.usersDto (standard structure)
    if (authResponse.payload?.user?.usersDto) {
      console.log('handleGoogleAuth: Extracting user data from payload.user.usersDto');
      userData = authResponse.payload.user.usersDto;
    } 
    // Then try from payload directly (might be flattened)
    else if (authResponse.payload?.usersDto) {
      console.log('handleGoogleAuth: Extracting user data from payload.usersDto');
      userData = authResponse.payload.usersDto;
    }
    // Then try from payload (might contain user data directly)
    else if (authResponse.payload) {
      console.log('handleGoogleAuth: Using payload as user data');
      userData = authResponse.payload;
    }
    // As a last resort, try to decode the token
    else if (accessToken) {
      console.log('handleGoogleAuth: Extracting user data from JWT token');
      try {
        userData = jwt_decode(accessToken);
      } catch (decodeError) {
        console.error('handleGoogleAuth: Error decoding token', decodeError);
      }
    }
    
    console.log('handleGoogleAuth: User data extraction result:', userData ? 'successful' : 'failed');
    
    if (!userData) {
      console.error('handleGoogleAuth: Failed to extract user data from any source');
      throw new Error('Failed to extract user data from authentication response');
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
      
      const apiResponse = response.data;
      
      // Check for API response structure according to Swagger
      if (!apiResponse.success || !apiResponse.data) {
        const backendMessage = apiResponse.message || 'Token refresh failed';
        throw new Error(backendMessage);
      }
      
      // Access the actual auth data via response.data.data (AuthResponse object)
      const authData = apiResponse.data;
      const accessToken = authData.authenticationData.accessToken;
      const newRefreshToken = authData.authenticationData.refreshToken;
      
      localStorage.setItem('token', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      
      return accessToken;
    } catch (error) {
      console.error('Token refresh error:', error);
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
      // Decode the token to get user data
      const decoded = jwt_decode(token);
      setUser(decoded);
      
      if (storedAuthData) {
        // Parse the stored auth data
        const parsedAuthData = JSON.parse(storedAuthData);
        
        // Check if this is an ApiResponse wrapper or direct AuthResponse
        let authResponse;
        if (parsedAuthData.data && parsedAuthData.success) {
          // This is an ApiResponse wrapper
          authResponse = parsedAuthData.data;
        } else {
          // This might be a direct AuthResponse
          authResponse = parsedAuthData;
        }
        
        setAuthData(authResponse);
      }
    } catch (error) {
      console.error('Token decoding error:', error);
      logout();
    }
  };

  // Unified auth response handler
  const handleAuthResponse = (authResponse) => {
    // Extract tokens from authenticationData according to Swagger
    const accessToken = authResponse.authenticationData.accessToken;
    const refreshToken = authResponse.authenticationData.refreshToken;
    
    // Store tokens
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('authData', JSON.stringify(authResponse));
    setAuthData(authResponse);

    // Extract user data from token and set in state
    try {
      // First try to get user data from payload
      let userData = authResponse.payload;
      
      // If payload doesn't have user data in expected format, decode from token
      if (!userData?.user?.usersDto?.businesses) {
        userData = jwt_decode(accessToken);
        console.log('User data extracted from token:', userData);
      } else {
        console.log('User data extracted from payload:', userData);
      }
      
      // Set user data in state
      setUser(userData);
      
      console.log('User data set in state:', userData);
      
      // Check if user has business details
      const hasBusinesses = hasBusinessDetails(userData);
      console.log('Has business details:', hasBusinesses);
      
      if (!hasBusinesses) {
        console.log('Navigating to business setup page');
        navigate('/business-setup');
      } else {
        console.log('Navigating to dashboard');
        const dashboard = '/dashboard';
        navigate(dashboard);
      }
    } catch (error) {
      console.error('Error processing authentication response:', error);
      setError('Failed to process authentication response');
      navigate('/login');
    }
  };

  // Email/password login
const login = async (email, password) => {
  try {
    setError(null);
    setLoading(true);

    const apiResponse = await api.post('/api/auth/authenticate', { email, password });

    // Check for API response structure according to Swagger
    if (!apiResponse.success) {
      const backendMessage = apiResponse.message || 'Login failed';
      setError(backendMessage);
      throw new Error(backendMessage);
    }

    const authResponse = apiResponse.data;
    if (!authResponse || !authResponse.authenticationData) {
      const backendMessage = apiResponse.message || 'Login failed';
      setError(backendMessage);
      throw new Error(backendMessage);
    }
    handleAuthResponse(authResponse);
  } catch (error) {
    console.error('Login error:', error);

    // Gracefully extract backend or client error message
    const backendMessage =
      error?.response?.data?.message || error?.message || 'Login failed';

    setError(backendMessage);
    throw new Error(backendMessage); // Optional: rethrow to allow .catch to handle it
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
      const apiResponse = response.data;
      
      // Check for API response structure according to Swagger
      if (!apiResponse.success || !apiResponse.data) {
        const backendMessage = apiResponse.message || 'Registration failed';
        setError(backendMessage);
        throw new Error(backendMessage);
      }
      
      // Access the actual auth data via response.data.data (AuthResponse object)
      const authData = apiResponse.data;
      handleAuthResponse(authData);
    } catch (error) {
      console.error('Registration error:', error);
      const backendMessage = 
        error?.response?.data?.message || error?.message || 'Registration failed';
      setError(backendMessage);
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