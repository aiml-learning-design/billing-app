import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGoogleAuth } = useAuth();
  
  // Get the localStorage key for tracking processed auth responses
  const PROCESSED_AUTH_RESPONSES_KEY = 'processedAuthResponses';

  useEffect(() => {
    const authResponse = searchParams.get('authResponse');

    if (authResponse) {
      // Get the processed auth responses from localStorage
      const processedResponses = localStorage.getItem(PROCESSED_AUTH_RESPONSES_KEY);
      const processedResponsesArray = processedResponses ? JSON.parse(processedResponses) : [];

      // Check if we've already processed this auth response
      if (processedResponsesArray.includes(authResponse)) {
        console.log('OAuthCallback: Auth response already processed, skipping');
        return;
      }


      // Process the auth response
      handleGoogleAuth(authResponse)
        .then((userData) => {
          // Check if user has business details or has completed business setup
          const hasBusinessDetails = userData?.businesses && userData.businesses.length > 0;

          if(!hasBusinessDetails) {
            localStorage.setItem('businessSetupCompleted', 'false')
          }
          const hasCompletedBusinessSetup = localStorage.getItem('businessSetupCompleted') === 'true';
          console.log('- Has businesses in profile:', hasBusinessDetails);
          console.log('- Has completed business setup:', hasCompletedBusinessSetup);
          // This prevents duplicate processing if the component re-renders
          processedResponsesArray.push(authResponse);
          localStorage.setItem(PROCESSED_AUTH_RESPONSES_KEY, JSON.stringify(processedResponsesArray));
          console.log('OAuthCallback: Processing new auth response');
          if (hasBusinessDetails || hasCompletedBusinessSetup) {
            // User has business details or has completed setup - redirect to dashboard
            console.log('OAuthCallback: User has business details or has completed setup, redirecting to dashboard');
            const redirectPath = '/dashboard';
            navigate(redirectPath, { replace: true });
          } else {
            // First-time user - redirect to business setup
            console.log('OAuthCallback: First-time user, redirecting to business setup');
            navigate('/business-setup', { replace: true });
          }
        })
        .catch(() => {
          // If there's an error, we should still keep the auth response in the Set
          // to prevent duplicate processing on re-renders
          navigate('/login', {
            state: { error: 'Google authentication failed' }
          });
        });
    } else {
      navigate('/login', {
        state: { error: 'Authentication response missing' }
      });
    }
    // Remove 'user' from dependency array to prevent duplicate calls
  //}, [searchParams, navigate, handleGoogleAuth]);
    }, [handleGoogleAuth]);

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