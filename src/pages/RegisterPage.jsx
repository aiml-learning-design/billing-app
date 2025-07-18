import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, TextField, Button, Typography, Link, Paper, Alert, Grid,
  FormControl, InputLabel, Select, MenuItem, InputAdornment,
  FormControlLabel, Checkbox, FormHelperText
} from '@mui/material';
import { 
  Check as CheckIcon, 
  Close as CloseIcon 
} from '@mui/icons-material';
import countries from '../utils/countries';
import { 
  calculatePasswordStrength, 
  getPasswordStrengthLabel, 
  getPasswordStrengthColor, 
  getPasswordStrengthWidth,
  hasMinLength,
  hasUppercase,
  hasLowercase,
  hasNumber,
  hasSpecialChar
} from '../utils/passwordUtils';

const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('IN');
  const [phoneCode, setPhoneCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Update phone code when country changes
  useEffect(() => {
    const selectedCountry = countries.find(c => c.code === country);
    if (selectedCountry) {
      setPhoneCode(selectedCountry.dialCode);
    }
  }, [country]);

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      return setError('Please enter a valid email address');
    }
    
    if (passwordStrength < 3) {
      return setError('Please use a stronger password');
    }
    
    if (password !== confirmPassword) {
      return setError("Passwords don't match");
    }

    if (!termsAgreed) {
      return setError('You must agree to the Terms of Service and Privacy Policy');
    }

    try {
      setError('');
      setLoading(true);
      
      // Create user data object with all required fields
      const userData = {
        firstName,
        middleName,
        lastName,
        email,
        password,
        country,
        phone: phoneCode + phoneNumber,
        userRole: 'USER'
      };
      
      await register(userData);
      navigate('/dashboard');
    } catch (err) {
      // Handle specific error codes from backend
      if (err.response?.data?.code === 'REGISTRATION_ERROR') {
        setError(err.response.data.message);
      } else if (err.response?.data?.code === 'VALIDATION_ERROR') {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again later.');
        console.error("Registration error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="auth-container">
      <Paper elevation={3} className="auth-paper">
        <Typography variant="h5" gutterBottom align="center">
          Create Your Account
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="First Name"
                fullWidth
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Middle Name"
                fullWidth
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                autoComplete="additional-name"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Last Name"
                fullWidth
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
              />
            </Grid>
          </Grid>

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

          <FormControl fullWidth margin="normal">
            <InputLabel>Country</InputLabel>
            <Select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              label="Country"
              required
            >
              {countries.map((country) => (
                <MenuItem key={country.code} value={country.code}>
                  {country.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={4}>
              <TextField
                label="Code"
                fullWidth
                value={phoneCode}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={8}>
              <TextField
                label="Phone Number"
                fullWidth
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                autoComplete="tel"
                placeholder="Enter phone number"
              />
            </Grid>
          </Grid>

          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          {/* Password Strength Indicator */}
          <Box className="password-strength">
            <Box className="strength-meter">
              <Box 
                className="strength-meter-fill" 
                sx={{ 
                  width: getPasswordStrengthWidth(passwordStrength),
                  backgroundColor: getPasswordStrengthColor(passwordStrength)
                }}
              />
            </Box>
            <Box className="strength-text">
              <Typography variant="caption">
                Password Strength
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ color: getPasswordStrengthColor(passwordStrength) }}
              >
                {getPasswordStrengthLabel(passwordStrength)}
              </Typography>
            </Box>
            <Box className="strength-requirements">
              <Box className={`requirement ${hasMinLength(password) ? 'valid' : 'invalid'}`}>
                {hasMinLength(password) ? <CheckIcon fontSize="small" /> : <CloseIcon fontSize="small" />}
                <Typography variant="caption">8+ characters</Typography>
              </Box>
              <Box className={`requirement ${hasUppercase(password) ? 'valid' : 'invalid'}`}>
                {hasUppercase(password) ? <CheckIcon fontSize="small" /> : <CloseIcon fontSize="small" />}
                <Typography variant="caption">Uppercase</Typography>
              </Box>
              <Box className={`requirement ${hasLowercase(password) ? 'valid' : 'invalid'}`}>
                {hasLowercase(password) ? <CheckIcon fontSize="small" /> : <CloseIcon fontSize="small" />}
                <Typography variant="caption">Lowercase</Typography>
              </Box>
              <Box className={`requirement ${hasNumber(password) ? 'valid' : 'invalid'}`}>
                {hasNumber(password) ? <CheckIcon fontSize="small" /> : <CloseIcon fontSize="small" />}
                <Typography variant="caption">Number</Typography>
              </Box>
              <Box className={`requirement ${hasSpecialChar(password) ? 'valid' : 'invalid'}`}>
                {hasSpecialChar(password) ? <CheckIcon fontSize="small" /> : <CloseIcon fontSize="small" />}
                <Typography variant="caption">Special character</Typography>
              </Box>
            </Box>
          </Box>

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

          <FormControlLabel
            control={
              <Checkbox 
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                I agree to the{' '}
                <Link component={RouterLink} to="/terms" target="_blank">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link component={RouterLink} to="/privacy" target="_blank">
                  Privacy Policy
                </Link>
              </Typography>
            }
            sx={{ mt: 2 }}
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
          <Link component={RouterLink} to="/login" underline="hover">
            Login
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default RegisterPage;