import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography, Button, Alert } from '@mui/material';

// Global error handler for debugging
if (typeof window !== 'undefined') {
  window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error caught in OAuthCallback:', { message, source, lineno, colno, error });
    // Log to console and attempt to navigate after an error
    try {
      console.log('Attempting emergency navigation after global error');
      window.location.href = '/business-setup';
    } catch (e) {
      console.error('Failed emergency navigation:', e);
    }
    return true; // Prevents the default error handling
  };
}

const OAuthCallback = () => {
  // Add error state to display any errors to the user
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGoogleAuth, user, loading } = useAuth();
  const safetyTimeoutRef = useRef(null);
  const processingRef = useRef(false);

  console.log('OAuthCallback: Component rendered', { user, loading });
  
  // Safety timeout to ensure users don't get stuck on the loading screen
  useEffect(() => {
    // Set a timeout to force navigation if redirection doesn't happen
    safetyTimeoutRef.current = setTimeout(() => {
      console.log('OAuthCallback: Safety timeout triggered - forcing navigation to business setup');
      
      try {
        // Try React Router navigation first
        navigate('/business-setup', { replace: true });
        
        // As a backup, use direct browser navigation after a short delay
        setTimeout(() => {
          console.log('OAuthCallback: Safety timeout - Forcing direct browser navigation');
          window.location.href = '/business-setup';
        }, 100);
      } catch (error) {
        console.error('OAuthCallback: Safety timeout - Navigation error, using direct browser navigation', error);
        window.location.href = '/business-setup';
      }
    }, 15000); // 15 seconds timeout
    
    return () => {
      // Clear the timeout when component unmounts or when navigation happens
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
    };
  }, [navigate]);

  useEffect(() => {
    console.log('OAuthCallback: First useEffect triggered');
    const authResponse = searchParams.get('authResponse');
    console.log('OAuthCallback: Auth response from URL', authResponse ? 'present' : 'missing');

    const processAuth = async () => {
      console.log('OAuthCallback: Starting processAuth');
      try {
        if (!authResponse) {
          console.error('OAuthCallback: Missing authentication response');
          const errorMsg = 'Missing authentication response';
          setError(errorMsg);
          throw new Error(errorMsg);
        }

        console.log('OAuthCallback: Calling handleGoogleAuth');
        await handleGoogleAuth(authResponse);
        console.log('OAuthCallback: handleGoogleAuth completed successfully');
      } catch (error) {
        console.error('OAuthCallback: OAuth processing error:', error);
        setError(error.message || 'Google authentication failed');
        
        // Try to navigate to login page with error state
        try {
          navigate('/login', {
            state: {
              error: error.message || 'Google authentication failed',
              from: 'oauth-callback'
            },
            replace: true
          });
          
          // Fallback to direct navigation after a short delay
          setTimeout(() => {
            console.log('OAuthCallback: Fallback navigation to login page');
            window.location.href = '/login?error=' + encodeURIComponent(error.message || 'Google authentication failed');
          }, 500);
        } catch (navError) {
          console.error('OAuthCallback: Navigation error after auth failure:', navError);
          // Last resort - direct navigation
          window.location.href = '/login?error=' + encodeURIComponent(error.message || 'Google authentication failed');
        }
      }
    };

    processAuth();
  }, [searchParams, navigate, handleGoogleAuth]);

  useEffect(() => {
    console.log('OAuthCallback: Second useEffect triggered', { user, loading });
    
    try {
      if (user && !loading) {
        console.log('OAuthCallback: User authenticated and not loading');
        
        // Log the structure of the user object to help debug
        console.log('OAuthCallback: User object structure:', JSON.stringify(user, null, 2));
        
        // Check if user has the expected properties
        if (!user.hasOwnProperty('businesses')) {
          console.error('OAuthCallback: User object is missing businesses property');
          console.log('OAuthCallback: Redirecting to business setup page due to missing businesses property');
          setError('User object is missing businesses property. Redirecting to business setup page...');
          
          try {
            navigate('/business-setup', { replace: true });
            
            // Fallback direct navigation
            setTimeout(() => {
              console.log('OAuthCallback: Fallback direct navigation to business setup');
              window.location.href = '/business-setup';
            }, 500);
          } catch (navError) {
            console.error('OAuthCallback: Navigation error:', navError);
            window.location.href = '/business-setup';
          }
          return;
        }
        
        // Check if user has business details
        const hasBusinessDetails = user.businesses && user.businesses.length > 0;
        console.log('OAuthCallback: User has business details?', hasBusinessDetails);
        console.log('OAuthCallback: Businesses:', user.businesses);
        
        if (hasBusinessDetails) {
          // If user has business details, redirect to dashboard or pre-auth path
          const redirectPath = sessionStorage.getItem('preAuthPath') || '/dashboard';
          console.log('OAuthCallback: Redirecting to', redirectPath);
          sessionStorage.removeItem('preAuthPath');
          
          try {
            navigate(redirectPath, { replace: true });
            
            // Fallback direct navigation
            setTimeout(() => {
              console.log('OAuthCallback: Fallback direct navigation to', redirectPath);
              window.location.href = redirectPath;
            }, 500);
          } catch (navError) {
            console.error('OAuthCallback: Navigation error:', navError);
            window.location.href = redirectPath;
          }
        } else {
          // If user doesn't have business details, redirect to business setup page
          console.log('OAuthCallback: Redirecting to business setup page');
          
          try {
            navigate('/business-setup', { replace: true });
            
            // Fallback direct navigation
            setTimeout(() => {
              console.log('OAuthCallback: Fallback direct navigation to business setup');
              window.location.href = '/business-setup';
            }, 500);
          } catch (navError) {
            console.error('OAuthCallback: Navigation error:', navError);
            window.location.href = '/business-setup';
          }
        }
      } else {
        console.log('OAuthCallback: Waiting for user authentication', { 
          userExists: !!user, 
          isLoading: loading 
        });
        
        // If user exists but we're still loading, log more details
        if (user && loading) {
          console.log('OAuthCallback: User exists but still loading. User:', user);
        }
      }
    } catch (error) {
      console.error('OAuthCallback: Error in second useEffect:', error);
      setError('Error during authentication process: ' + error.message);
      
      // Emergency navigation to business setup
      try {
        window.location.href = '/business-setup';
      } catch (e) {
        console.error('OAuthCallback: Failed emergency navigation:', e);
      }
    }
  }, [user, loading, navigate]);

  // State to show manual navigation button after a delay
  const [showManualNav, setShowManualNav] = useState(false);
  
  // Show manual navigation button after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowManualNav(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle manual navigation
  const handleManualContinue = () => {
    console.log('OAuthCallback: Manual navigation triggered by user');
    // Clear the safety timeout
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
    }
    
    try {
      // Try React Router navigation first
      navigate('/business-setup', { replace: true });
      
      // As a backup, use direct browser navigation after a short delay
      setTimeout(() => {
        console.log('OAuthCallback: Forcing direct browser navigation');
        window.location.href = '/business-setup';
      }, 100);
    } catch (error) {
      console.error('OAuthCallback: Navigation error, using direct browser navigation', error);
      window.location.href = '/business-setup';
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      gap: 2
    }}>
      <CircularProgress size={60} />
      <Typography variant="h6">Completing authentication...</Typography>

      {/* Show manual navigation option after delay */}
      {showManualNav && (
        <Box sx={{
          mt: 4,
          textAlign: 'center',
          p: 3,
          border: '2px solid #f50057',
          borderRadius: 2,
          backgroundColor: 'rgba(245, 0, 87, 0.05)'
        }}>
          <Typography variant="h6" color="error" sx={{ mb: 1, fontWeight: 'bold' }}>
            Authentication Taking Too Long
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            We're having trouble completing the authentication process automatically.
            Please click the button below to continue to the Business Setup page:
          </Typography>
          <Button
            variant="contained"
            color="error"
            onClick={handleManualContinue}
            size="large"
            sx={{
              py: 1.5,
              px: 4,
              fontSize: '1.1rem',
              boxShadow: 3,
              '&:hover': {
                backgroundColor: '#c51162',
                boxShadow: 5
              }
            }}
          >
            Continue to Business Setup Now
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default OAuthCallback;