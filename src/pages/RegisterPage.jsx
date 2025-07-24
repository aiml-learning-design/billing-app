import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, TextField, Button, Typography, Link, Paper, Alert, Grid,
  FormControl, InputLabel, Select, MenuItem, IconButton, InputAdornment,
  FormControlLabel, Checkbox, FormHelperText
} from '@mui/material';
import { 
  Check as CheckIcon, 
  Close as CloseIcon,
  Visibility, 
  VisibilityOff
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
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import 'react-phone-input-2/lib/style.css';
import axios from 'axios';


const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('IN');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('in');
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Fetch user's location and set country defaults
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await axios.get('https://ipapi.co/json/');
        const userData = response.data;
        const countryNames = countries.map(country => country.name);
        if (userData?.country_name && countryNames.includes(userData.country_name)) {
          setSelectedCountry(userData.country_name);
          const detectedCountryCode = userData.country_code.toLowerCase();
          setCountryCode(detectedCountryCode);
          setPhone(userData.country_calling_code ? userData.country_calling_code.replace('+', '') : '');
        } else {
          const defaultCountry = countries.find(c => c.code === 'US') || countries.find(c => c.name === 'United States');
          setSelectedCountry(defaultCountry.name);
          setCountryCode(defaultCountry.code.toLowerCase());
          setPhone(defaultCountry.dialCode.replace('+', ''));
        }
      } catch (error) {
        console.error("Failed to fetch location data", error);
        const defaultCountry = countries.find(c => c.code === 'in') || countries.find(c => c.name === 'India');
        setSelectedCountry(defaultCountry.name);
        setCountryCode(defaultCountry.code.toLowerCase());
        setPhone(defaultCountry.dialCode.replace('+', ''));
      }
    };
    
    fetchLocationData();
  }, []);


  // Update phone country code when selected country changes
  useEffect(() => {
    const selectedCountryData = countries.find(c => c.name === selectedCountry);
    if (selectedCountryData) {
      setCountryCode(selectedCountryData.code.toLowerCase());
      // Optionally update the phone number with the country's dialing code
      if (!phone) {
        setPhone(selectedCountryData.dialCode.replace('+', ''));
      }
    }
  }, [selectedCountry]);

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
        phone: phone,
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
    <Box className="auth-container" sx={{ 
      width: '100%', 
      maxWidth: '1400px', 
      margin: '0 auto',
      backgroundColor: '#F0F7FF', // Light blue background for the entire page
      padding: '20px',
      borderRadius: '8px'
    }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Paper 
            elevation={3} 
            className="auth-paper" 
            sx={{ 
              width: '100%', 
              maxWidth: '750px',  // Increased width by approximately 50%
              padding: '20px 30px',
              backgroundColor: '#E6F0FF', // Light blue background for the registration form
              borderTop: '4px solid #7986CB' // Purple-blue accent border
            }}
          >
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
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                label="Country"
                required
              >
                {countries.map((country) => (
                  <MenuItem key={country.name} value={country.name}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
          </FormControl>

          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>Phone Number *</Typography>
            <style>
              {`
                .react-tel-input .country-list .country {
                  padding: 5px 35px;
                }
              `}
            </style>
            <PhoneInput
              country={countryCode}
              value={phone}
              onChange={setPhone}
              enableSearch={true}
              inputProps={{
                name: 'phone',
                required: true
              }}
              inputStyle={{ 
                width: '100%', 
                height: '56px',
                fontSize: '1rem',
                borderRadius: '4px',
                paddingLeft: '80px'
              }}
              buttonStyle={{
                borderRadius: '4px 0 0 4px',
                width: '50px',
                padding: '0px 0px 0px 5px'
              }}
              containerStyle={{ 
                width: '100%'
              }}
              dropdownStyle={{
                width: 'auto',
                minWidth: '375px',
                padding: '0',
                margin: '0'
              }}
              countryDropdownStyle={{
                padding: '0',
                margin: '0',
                lineHeight: '1',
                height: 'auto'
              }}
            />
          </Box>

          {/* <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          /> */}

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              style: { height: '56px' },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
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
            type={showConfirmPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            InputProps={{
              style: { height: '56px' },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
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
        </Grid>
        
        {/* Invoice-related styling on the right side */}
        <Grid item xs={12} md={5}>
          <Paper 
            elevation={3} 
            sx={{ 
              height: '100%', 
              padding: '20px',
              backgroundColor: '#FFF8E1', // Yellowish background for invoice preview
              display: 'flex',
              flexDirection: 'column',
              borderTop: '4px solid #FFB74D', // Orange accent border
              borderRadius: '8px'
            }}
          >
            <Typography variant="h5" gutterBottom align="center" color="primary">
              Invoice Preview
            </Typography>
            
            <Box sx={{ 
              border: '1px dashed #ccc', 
              borderRadius: '8px', 
              padding: '15px',
              backgroundColor: 'white',
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                Sample Invoice
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">From:</Typography>
                  <Typography variant="body1">Your Company Name</Typography>
                  <Typography variant="body2">123 Business Street</Typography>
                  <Typography variant="body2">City, Country</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">To:</Typography>
                  <Typography variant="body1">Client Name</Typography>
                  <Typography variant="body2">456 Client Avenue</Typography>
                  <Typography variant="body2">Client City, Country</Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                backgroundColor: '#FFF3E0', 
                borderRadius: '4px', 
                p: 1, 
                mb: 2,
                border: '1px solid #FFE0B2'
              }}>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Invoice Number:</Typography>
                    <Typography variant="body2">INV-2025-001</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Date:</Typography>
                    <Typography variant="body2">July 24, 2025</Typography>
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ mb: 2, flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Items:</Typography>
                <Box sx={{ 
                  border: '1px solid #eee', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <Grid container sx={{ backgroundColor: '#FFB74D', p: 1, color: 'white' }}>
                    <Grid item xs={6}><Typography variant="body2" fontWeight="bold">Description</Typography></Grid>
                    <Grid item xs={3}><Typography variant="body2" fontWeight="bold">Quantity</Typography></Grid>
                    <Grid item xs={3}><Typography variant="body2" fontWeight="bold">Amount</Typography></Grid>
                  </Grid>
                  
                  <Grid container sx={{ p: 1, borderBottom: '1px solid #eee' }}>
                    <Grid item xs={6}><Typography variant="body2">Service 1</Typography></Grid>
                    <Grid item xs={3}><Typography variant="body2">1</Typography></Grid>
                    <Grid item xs={3}><Typography variant="body2">$100.00</Typography></Grid>
                  </Grid>
                  
                  <Grid container sx={{ p: 1, borderBottom: '1px solid #eee' }}>
                    <Grid item xs={6}><Typography variant="body2">Service 2</Typography></Grid>
                    <Grid item xs={3}><Typography variant="body2">2</Typography></Grid>
                    <Grid item xs={3}><Typography variant="body2">$150.00</Typography></Grid>
                  </Grid>
                  
                  <Grid container sx={{ p: 1, backgroundColor: '#FFEFD5', borderTop: '2px solid #FFB74D' }}>
                    <Grid item xs={9}><Typography variant="body2" fontWeight="bold" color="#FF8F00">Total</Typography></Grid>
                    <Grid item xs={3}><Typography variant="body2" fontWeight="bold" color="#FF8F00">$250.00</Typography></Grid>
                  </Grid>
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto', textAlign: 'center' }}>
                Create your account to start generating professional invoices like this
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RegisterPage;