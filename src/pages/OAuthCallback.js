import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography, Button } from '@mui/material';

const OAuthCallback = () => {
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
      navigate('/business-setup', { replace: true });
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
          throw new Error('Missing authentication response');
        }

        console.log('OAuthCallback: Calling handleGoogleAuth');
        await handleGoogleAuth(authResponse);
        console.log('OAuthCallback: handleGoogleAuth completed successfully');
      } catch (error) {
        console.error('OAuthCallback: OAuth processing error:', error);
        navigate('/login', {
          state: {
            error: error.message || 'Google authentication failed',
            from: 'oauth-callback'
          },
          replace: true
        });
      }
    };

    processAuth();
  }, [searchParams, navigate, handleGoogleAuth]);

  useEffect(() => {
    console.log('OAuthCallback: Second useEffect triggered', { user, loading });
    
    if (user && !loading) {
      console.log('OAuthCallback: User authenticated and not loading');
      
      // Log the structure of the user object to help debug
      console.log('OAuthCallback: User object structure:', JSON.stringify(user, null, 2));
      
      // Check if user has the expected properties
      if (!user.hasOwnProperty('businesses')) {
        console.error('OAuthCallback: User object is missing businesses property');
        console.log('OAuthCallback: Redirecting to business setup page due to missing businesses property');
        navigate('/business-setup', { replace: true });
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
        navigate(redirectPath, { replace: true });
      } else {
        // If user doesn't have business details, redirect to business setup page
        console.log('OAuthCallback: Redirecting to business setup page');
        navigate('/business-setup', { replace: true });
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
    navigate('/business-setup', { replace: true });
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
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Taking longer than expected? You can continue manually:
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleManualContinue}
          >
            Continue to Business Setup
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default OAuthCallback;