import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box, TextField, Button, Typography, Link, Paper, Alert, Divider,
  InputAdornment, IconButton, CircularProgress
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import companyLogo from '../assets/company_logo.png';
import jwt_decode from 'jwt-decode';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const { login, loginWithGoogle, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Handle regular errors from location state
    if (location.state?.error) {
      setError(location.state.error);
      if (location.state.email) {
        setEmail(location.state.email);
      }
      window.history.replaceState({}, document.title);
    }

    // Handle OAuth callback with authResponse
    const authResponseJson = searchParams.get('authResponse');
    if (authResponseJson) {
      handleOAuthCallback(authResponseJson);
    }
  }, [location, searchParams]);

  const handleOAuthCallback = async (authResponseJson) => {
    try {
      setOauthLoading(true);
      const authResponse = JSON.parse(decodeURIComponent(authResponseJson));

      // Store auth data
      localStorage.setItem('authData', JSON.stringify(authResponse));
      localStorage.setItem('token', authResponse.accessToken);

      if (authResponse.invoktaAuthentication?.refreshToken) {
        localStorage.setItem('refreshToken', authResponse.invoktaAuthentication.refreshToken);
      }

      // Set user in context
      const userData = authResponse.userDetails || jwt_decode(authResponse.accessToken);
      setUser(userData);

      // Clean URL and redirect
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to process authentication response');
      console.error('Auth response error:', error);
    } finally {
      setOauthLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError('');
    setOauthLoading(true);
    
    // Store current path for redirect after login
    sessionStorage.setItem('preAuthPath', window.location.pathname);
    
    // Redirect to backend Google OAuth endpoint
    window.location.href = 'http://localhost:8087/invokta/oauth2/authorization/google';
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  if (oauthLoading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Signing in with Google...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: `linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url(${companyLogo})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: 450,
          p: 4,
          mx: 2,
          backgroundColor: 'background.paper',
          backdropFilter: 'blur(2px)',
        }}
      >
        <Typography variant="h5" gutterBottom align="center">
          Welcome Back
        </Typography>
        <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
          Sign in to continue to your account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 2 }}>
            <Link component={RouterLink} to="/forgot-password" underline="hover" variant="body2">
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ py: 1.5 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <Box sx={{ mt: 3, mb: 3 }}>
          <Divider>
            <Typography variant="body2" color="textSecondary">
              OR
            </Typography>
          </Divider>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Button
            onClick={handleGoogleLogin}
            fullWidth
            variant="contained"
            disabled={loading || oauthLoading}
            startIcon={
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                alt="Google"
                width={20}
                style={{ marginRight: 8 }}
              />
            }
            sx={{
              py: 1.5,
              backgroundColor: '#4285F4',
              '&:hover': { backgroundColor: '#357ABD' }
            }}
          >
            Continue with Google
          </Button>
        </Box>

        <Typography align="center" variant="body2">
          Don't have an account?{' '}
          <Link component={RouterLink} to="/register" underline="hover" fontWeight="medium">
            Create an account
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginPage;