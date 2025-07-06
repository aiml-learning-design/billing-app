import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, TextField, Button, Typography, Link, Paper, Alert 
} from '@mui/material';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      return setError('Please enter a valid email address');
    }
    
    if (!validatePassword(password)) {
      return setError('Password must be at least 8 characters');
    }
    
    if (password !== confirmPassword) {
      return setError("Passwords don't match");
    }

    try {
        console.log("Submitting:", formData); // Log form data
        const response = await axios.post('/api/auth/register', formData);
        console.log("Full response:", response); // Log entire response
        console.log("Response data:", response.data); // Log just the data
      setError('');
      setLoading(true);
      await register(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Handle specific error codes from backend
      if (err.response?.data?.code === 'REGISTRATION_ERROR') {
        setError(err.response.data.message);
      } else if (err.response?.data?.code === 'VALIDATION_ERROR') {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again later.');
        setError(err.response.data.message);
        console.error("Registration error:", error);
        console.error("Error response:", error.response); // Axios error details
      }
    } finally {
      setLoading(false);
    }


  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          Register
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
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            helperText="At least 8 characters"
            autoComplete="new-password"
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
        <Typography sx={{ mt: 2 }} align="center">
          Already have an account?{' '}
          <Link href="/login" underline="hover">
            Login
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default RegisterPage;