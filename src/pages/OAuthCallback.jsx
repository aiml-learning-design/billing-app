import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGoogleAuth } = useAuth();

  useEffect(() => {
    const authResponse = searchParams.get('authResponse');

    if (authResponse) {
      handleGoogleAuth(authResponse)
        .then(() => navigate('/dashboard'))
        .catch(() => navigate('/login', {
          state: { error: 'Google authentication failed' }
        }));
    } else {
      navigate('/login', {
        state: { error: 'Authentication response missing' }
      });
    }
  }, [searchParams, navigate, handleGoogleAuth]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <h2>Processing Google login...</h2>
    </div>
  );
};

export default OAuthCallback;