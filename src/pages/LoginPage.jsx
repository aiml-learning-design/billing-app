import React, { useState } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
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
import google_signin_logo from '../assets/google_signin_logo.png';
import { API_CONFIG } from '../config/config';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const { login, error: authError, setError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for error in location state when component mounts
  React.useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
      if (location.state.email) {
        setEmail(location.state.email);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(''); // Clear any previous errors
      setLoading(true);
      await login(email, password);
      // If login is successful, the AuthContext will handle navigation
    } catch (err) {
      // Error is already set in AuthContext, no need to set it here
      console.error('Login error caught in LoginPage:', err);
    } finally {
      setLoading(false);
    }
  };

const handleGoogleLogin = () => {
    setError(''); // Clear any previous errors using AuthContext's setError

    // Store current path for post-login redirect
    sessionStorage.setItem('preAuthPath', window.location.pathname);
    
    // Clear the processed auth responses in localStorage
    localStorage.removeItem('processedAuthResponses');
    console.log('LoginPage: Cleared processed auth responses in localStorage');

    // Redirect to backend OAuth endpoint
    window.location.href = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.GOOGLE_AUTH}`;
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

        {authError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {authError}
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
            disabled={loading || oauthLoading}
            startIcon={
              <img
                src= {google_signin_logo}
                alt="Google"
                height={70}
                width={350}
                style={{ marginRight: -10 }}
              />
            }
          >
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