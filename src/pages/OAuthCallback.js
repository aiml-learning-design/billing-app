import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGoogleAuth, user } = useAuth();

  useEffect(() => {
    const authResponse = searchParams.get('authResponse');

    if (authResponse) {
      handleGoogleAuth(authResponse)
        .then((userData) => {
          // Check if user has business details or has completed business setup
          const hasBusinessDetails = userData?.businesses && userData.businesses.length > 0;
          const hasCompletedBusinessSetup = localStorage.getItem('businessSetupCompleted') === 'true';
          
          console.log('OAuthCallback: Checking user status');
          console.log('- Has business details:', hasBusinessDetails);
          console.log('- Has completed business setup:', hasCompletedBusinessSetup);

          if (hasBusinessDetails || hasCompletedBusinessSetup) {
            // User has business details or has completed setup - redirect to dashboard
            console.log('OAuthCallback: User has business details or has completed setup, redirecting to dashboard');
            const redirectPath = sessionStorage.getItem('preAuthPath') || '/dashboard';
            sessionStorage.removeItem('preAuthPath');
            navigate(redirectPath, { replace: true });
          } else {
            // First-time user - redirect to business setup
            console.log('OAuthCallback: First-time user, redirecting to business setup');
            navigate('/business-setup', { replace: true });
          }
        })
        .catch(() => navigate('/login', {
          state: { error: 'Google authentication failed' }
        }));
    } else {
      navigate('/login', {
        state: { error: 'Authentication response missing' }
      });
    }
  }, [searchParams, navigate, handleGoogleAuth, user]);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Processing Google login...
      </Typography>
    </Box>
  );
};

export default OAuthCallback;