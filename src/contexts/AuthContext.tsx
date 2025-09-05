import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';
import jwt_decode from 'jwt-decode';
import { API_CONFIG } from '../config/config';

// Define types for user data
interface Business {
  business_id?: string;
  businessName?: string;
  businessType?: string;
  [key: string]: any;
}

interface UserData {
  id?: string | null;
  user_id?: string | null;
  userId?: string | null;
  username?: string | null;
  userName?: string | null;
  user_name?: string | null;
  email?: string | null;
  userEmail?: string | null;
  user_email?: string | null;
  firstName?: string | null;
  first_name?: string | null;
  middleName?: string | null;
  middle_name?: string | null;
  lastName?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  fullName?: string | null;
  name?: string | null;
  phone?: string | null;
  phoneNumber?: string | null;
  pictureUrl?: string | null;
  picture_url?: string | null;
  image?: string | null;
  picture?: string | null;
  avatar?: string | null;
  businesses?: Business[];
  userDto?: any;
  user?: any;
  [key: string]: any;
}

interface NormalizedUser {
  id: string | null;
  username: string | null;
  email: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  full_name: string | null;
  phone: string | null;
  pictureUrl: string | null;
  businesses: Business[];
  [key: string]: any;
}

interface AuthenticationData {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  authenticationData: AuthenticationData;
  payload?: any;
  [key: string]: any;
}

// Define the shape of the context
interface AuthContextType {
  user: NormalizedUser | null;
  userBusinessDetails: Business[] | null;
  authData: AuthResponse | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  refreshToken: () => Promise<string>;
  handleGoogleAuth: (apiResponse: any) => Promise<UserData>;
}

// Define props for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<NormalizedUser | null>(null);
  const [userBusinessDetails, setBusinessDetails] = useState<Business[] | null>(null);
  const [authData, setAuthData] = useState<AuthResponse | null>(null); // Stores complete auth response
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Normalize user data to ensure consistent structure
  const normalizeUserData = (userData: UserData | null, authResponseData: AuthResponse | null = null): NormalizedUser | null => {
    if (!userData) return null;
    
    console.log('Normalizing user data:', userData);
    console.log('Auth response data:', authResponseData);
    
    // Create a base normalized object with all possible properties
    const normalized: NormalizedUser = {
      // Basic user info
      id: userData.id || userData.user_id || userData.userId || null,
      username: userData.username || userData.userName || userData.user_name || null,
      email: userData.email || userData.userEmail || userData.user_email || 
             userData.userDto?.email || userData.userDto?.userEmail ||
             userData.user?.userDto?.email || userData.user?.userDto?.userEmail || null,
      
      // Name components
      firstName: userData.firstName || userData.first_name || 
                userData.userDto?.firstName || userData.userDto?.first_name ||
                userData.user?.userDto?.firstName || userData.user?.userDto?.first_name || null,
      middleName: userData.middleName || userData.middle_name || 
                 userData.userDto?.middleName || userData.userDto?.middle_name ||
                 userData.user?.userDto?.middleName || userData.user?.userDto?.middle_name || null,
      lastName: userData.lastName || userData.last_name || 
               userData.userDto?.lastName || userData.userDto?.last_name ||
               userData.user?.userDto?.lastName || userData.user?.userDto?.last_name || null,
      
      // Full name (constructed or from data)
      full_name: userData.full_name || userData.fullName || userData.name || 
                userData.userDto?.full_name || userData.userDto?.fullName || userData.userDto?.name ||
                userData.user?.userDto?.full_name || userData.user?.userDto?.fullName || userData.user?.userDto?.name || null,
      
      // Contact info
      phone: userData.phone || userData.phoneNumber || 
            userData.userDto?.phone || userData.userDto?.phoneNumber ||
            userData.user?.userDto?.phone || userData.user?.userDto?.phoneNumber || null,
      
      // Profile image
      pictureUrl: userData.pictureUrl || userData.picture_url || userData.image || userData.picture || userData.avatar ||
                 userData.userDto?.pictureUrl || userData.userDto?.picture_url || userData.userDto?.image ||
                 userData.user?.userDto?.pictureUrl || userData.user?.userDto?.picture_url || userData.user?.userDto?.image || null,
      
      // Business details
      businesses: userData.businesses || 
                 userData.userDto?.businesses ||
                 userData.user?.userDto?.businesses || [],
      
      // Keep original data structure for compatibility
      ...userData
    };
    
    // If we have a full name but not individual components, try to extract them
    if (normalized.full_name && (!normalized.firstName && !normalized.lastName)) {
      const nameParts = normalized.full_name.split(' ');
      if (nameParts.length >= 1) normalized.firstName = nameParts[0];
      if (nameParts.length >= 2) normalized.lastName = nameParts[nameParts.length - 1];
      if (nameParts.length >= 3) normalized.middleName = nameParts.slice(1, nameParts.length - 1).join(' ');
    }
    
    // If we have individual name components but no full name, construct it
    if (!normalized.full_name && (normalized.firstName || normalized.lastName)) {
      normalized.full_name = [normalized.firstName, normalized.middleName, normalized.lastName]
        .filter(Boolean)
        .join(' ');
    }
    
    // If we have auth response data, extract additional info
    if (authResponseData) {
      // Extract any additional user data from auth response
      if (authResponseData.payload?.user?.userDto) {
        const userDto = authResponseData.payload.user.userDto;
        Object.assign(normalized, {
          ...userDto,
          businesses: normalized.businesses || userDto.businesses || []
        });
      }
    }
    
    console.log('Normalized user data:', normalized);
    return normalized;
  };
  
  const hasBusinessDetails = (userData: any): boolean => {
    // Check if user has businesses in their profile
    // Handle different user data structures:
    // 1. Direct access to businesses array (from JWT token or userDto)
    // 2. Nested access via user.userDto.businesses (from payload)
    const hasBusinessesInProfile = userData?.user?.userDto?.businesses && userData.user.userDto.businesses.length > 0;

    // Check if user has completed business setup (stored in localStorage)
    const hasCompletedBusinessSetup = localStorage.getItem('businessSetupCompleted') === 'true';
    
    console.log('Has businesses in profile:', hasBusinessesInProfile);
    console.log('Has completed business setup:', hasCompletedBusinessSetup);
    
    return hasBusinessesInProfile || hasCompletedBusinessSetup;
  };

  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded = jwt_decode<{ exp: number }>(token);
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  };

const handleGoogleAuth = async (apiResponse: any): Promise<UserData> => {
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
    let parsedResponse: any;
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
    let authResponse: AuthResponse;
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
    let userData: UserData | null = null;
    
    // First try from payload.user.userDto (standard structure)
    if (authResponse.payload) {
      console.log('handleGoogleAuth: Extracting user data from payload.user.userDto');
      userData = authResponse.payload;
    }
    
    console.log('handleGoogleAuth: User data extraction result:', userData ? 'successful' : 'failed');
    
    if (!userData) {
      console.error('handleGoogleAuth: Failed to extract user data from any source');
      throw new Error('Failed to extract user data from authentication response');
    }
    
    console.log('handleGoogleAuth: Normalizing user data');
    const normalizedUserData = normalizeUserData(userData, authResponse);
    console.log('handleGoogleAuth: Setting user state');
    setUser(normalizedUserData);
    setBusinessDetails(normalizedUserData?.businesses || null);
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

  // Function to check if backend is available
  const checkBackendAvailability = async (): Promise<boolean> => {
    try {
      // Make a simple request to check if backend is available
      // Using the user profile endpoint which should be lightweight
      // We don't care about the response, just that the server responds
      await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER.PROFILE}`, { 
        timeout: 3000, // 3 second timeout
        validateStatus: () => true // Accept any status code as success
      });
      return true;
    } catch (error) {
      console.error('Backend availability check failed:', (error as Error).message);
      // If we get here, it's likely a network error (ECONNREFUSED, timeout, etc.)
      // which means the backend is unavailable
      return false;
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<string> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token available');
      
      const response = await api.post('/api/auth/refresh-token', {}, {
        headers: {
          'X-Refresh-Token': refreshToken
        }
      });
      
      const apiResponse = response as any;
      
      // Check for API response structure according to Swagger
      if (!apiResponse.success || !apiResponse.data) {
        const backendMessage = apiResponse.message || 'Token refresh failed';
        throw new Error(backendMessage);
      }
      
      // Access the actual auth data via response.data.data (AuthResponse object)
      const authData = apiResponse.data as AuthResponse;
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
      setLoading(true);
      const token = localStorage.getItem('token');
      const storedAuthData = localStorage.getItem('authData');
      
      try {
        // First check if backend is available
        const isBackendAvailable = await checkBackendAvailability();
        
        if (!isBackendAvailable) {
          console.error('Backend is unavailable during initialization');
          // Clear authentication state since backend is unavailable
          logout();
          setError('Backend server is unavailable. Please try again later.');
          setLoading(false);
          return;
        }
        
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
            // Clear authentication state on error
            logout();
          }
        }
      } catch (error) {
        console.error('Authentication initialization failed:', error);
        // Clear authentication state on any error
        logout();
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  // Update both user and auth data state
  const updateAuthState = (token: string, storedAuthData: string | null) => {
    try {
      // Decode the token to get user data
      const decoded = jwt_decode<UserData>(token);
      
      let authResponse: AuthResponse | null = null;
      if (storedAuthData) {
        // Parse the stored auth data
        const parsedAuthData = JSON.parse(storedAuthData);
        
        // Check if this is an ApiResponse wrapper or direct AuthResponse
        if (parsedAuthData.data && parsedAuthData.success) {
          // This is an ApiResponse wrapper
          authResponse = parsedAuthData.data;
        } else {
          // This might be a direct AuthResponse
          authResponse = parsedAuthData;
        }
        
        setAuthData(authResponse);
      }
      
      // Normalize user data before setting it
      console.log('updateAuthState: Normalizing user data from token');
      const normalizedUserData = normalizeUserData(decoded, authResponse);
      setUser(normalizedUserData);
      setBusinessDetails(normalizedUserData?.businesses || null);
    } catch (error) {
      console.error('Token decoding error:', error);
      logout();
    }
  };

  // Unified auth response handler
  const handleAuthResponse = (authResponse: AuthResponse) => {
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
      let userData: UserData | null = null;
      if(authResponse?.payload?.user?.userDto) {
          userData = authResponse.payload.user.userDto;
      }

      // Normalize user data before setting it
      console.log('handleAuthResponse: Normalizing user data');
      const normalizedUserData = normalizeUserData(userData, authResponse);
      
      // Set user data in state
      setUser(normalizedUserData);
      setBusinessDetails(normalizedUserData?.businesses || null);
      console.log('User data set in state:', normalizedUserData);
      
      // Check if user has business details
      const hasBusinesses = hasBusinessDetails(normalizedUserData);
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
const login = async (email: string, password: string): Promise<void> => {
  try {
    setError(null);
    setLoading(true);

    const apiResponse = await api.post('/api/auth/authenticate', { email, password });

    // Check for API response structure according to Swagger
    if (!(apiResponse as any).success) {
      const backendMessage = (apiResponse as any).message || 'Login failed';
      setError(backendMessage);
      throw new Error(backendMessage);
    }

    const authResponse = (apiResponse as any).data as AuthResponse;
    if (!authResponse || !authResponse.authenticationData) {
      const backendMessage = (apiResponse as any).message || 'Login failed';
      setError(backendMessage);
      throw new Error(backendMessage);
    }
    handleAuthResponse(authResponse);
  } catch (error) {
    console.error('Login error:', error);

    // Gracefully extract backend or client error message
    const backendMessage =
      (error as any)?.response?.data?.message || (error as Error)?.message || 'Login failed';

    setError(backendMessage);
    throw new Error(backendMessage); // Optional: rethrow to allow .catch to handle it
  } finally {
    setLoading(false);
  }
};


  // Registration
  const register = async (userData: any): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      api.clearAuthTokens();
      
      const response = await api.post('/api/auth/register', userData);
      const apiResponse = response as any;
      
      // Check for API response structure according to Swagger
      if (!apiResponse.success || !apiResponse.data) {
        const backendMessage = apiResponse.message || 'Registration failed';
        setError(backendMessage);
        throw new Error(backendMessage);
      }
      
      // Access the actual auth data via response.data.data (AuthResponse object)
      const authData = apiResponse.data as AuthResponse;
      handleAuthResponse(authData);
    } catch (error) {
      console.error('Registration error:', error);
      const backendMessage = 
        (error as any)?.response?.data?.message || (error as Error)?.message || 'Registration failed';
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
    setBusinessDetails(null);
    setAuthData(null);
    navigate('/login');
  };

  const value: AuthContextType = {
    user,
    userBusinessDetails, // Add userBusinessDetails to the context value
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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}