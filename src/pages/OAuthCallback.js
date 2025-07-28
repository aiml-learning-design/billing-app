import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGoogleAuth, user, loading } = useAuth();

  useEffect(() => {
    const authResponse = searchParams.get('authResponse');

    const processAuth = async () => {
      try {
        if (!authResponse) {
          throw new Error('Missing authentication response');
        }

        await handleGoogleAuth(authResponse);
      } catch (error) {
        console.error('OAuth processing error:', error);
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
    if (user && !loading) {
      const redirectPath = sessionStorage.getItem('preAuthPath') || '/dashboard';
      sessionStorage.removeItem('preAuthPath');
      navigate(redirectPath, { replace: true });
    }
  }, [user, loading, navigate]);

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
    </Box>
  );
};

export default OAuthCallback;