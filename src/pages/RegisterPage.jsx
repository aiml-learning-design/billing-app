import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import office_building from '../assets/office_building.jpg';
import company_logo from '../assets/company_logo.png';
import youtube_thumbnail from '../assets/youtube_thumbnail.jpg';
import {
  Box, TextField, Button, Typography, Link, Paper, Alert, Grid,
  FormControl, InputLabel, Select, MenuItem, IconButton, InputAdornment,
  FormControlLabel, Checkbox
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
  const [passwordMatchError, setPasswordMatchError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();



  // Fetch user's location and set country defaults
  useEffect(() => {
    const fetchLocationData = async () => {
      // Set default country values immediately to avoid blank state
      const defaultCountry = countries.find(c => c.code === 'in') || countries.find(c => c.name === 'India');
      setSelectedCountry(defaultCountry.name);
      setCountryCode(defaultCountry.code.toLowerCase());
      setPhone(defaultCountry.dialCode ? defaultCountry.dialCode.replace('+', '') : '');
      console.log('Set initial default country:', defaultCountry.name);
      
      try {
        // Use a Promise with timeout to avoid long-running API calls
        const fetchWithTimeout = async (url, timeout = 3000) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          
          try {
            const response = await axios.get(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            return response;
          } catch (error) {
            clearTimeout(timeoutId);
            throw error;
          }
        };
        
        console.log('Fetching location data...');
        const response = await fetchWithTimeout('https://ipapi.co/json/', 3000);
        const userData = response.data;
        
        if (!userData) {
          console.log('No location data received');
          return; // Default values already set
        }
        
        const countryNames = countries.map(c => c.name);
        console.log('Location data received:', userData);
        
        if (userData?.country_name && countryNames.includes(userData.country_name)) {
          console.log('Setting country to:', userData.country_name);
          setSelectedCountry(userData.country_name);
          const detectedCountryCode = userData.country_code.toLowerCase();
          setCountryCode(detectedCountryCode); 
          setPhone(userData.country_calling_code ? userData.country_calling_code.replace('+', '') : '');
        } else if (userData?.country_code) {
          // Try to find country by code if name doesn't match
          const countryByCode = countries.find(c => c.code === userData.country_code.toUpperCase());
          if (countryByCode) {
            console.log('Found country by code:', countryByCode.name);
            setSelectedCountry(countryByCode.name);
            setCountryCode(userData.country_code.toLowerCase());
            setPhone(countryByCode.dialCode ? countryByCode.dialCode.replace('+', '') : '');
          }
          // If not found, we keep the default values set at the beginning
        }
      } catch (error) {
        if (error.name === 'AbortError' || error.name === 'CanceledError') {
          console.log('Location data fetch timed out');
        } else {
          console.error("Failed to fetch location data:", error.message);
        }
        // No need to set default values again as they were set at the beginning
      }
    };

    fetchLocationData();
  }, []);

  useEffect(() => {
    const selectedCountryData = countries.find(c => c.name === selectedCountry);
    if (selectedCountryData) {
      setCountryCode(selectedCountryData.code.toLowerCase());
      if (!phone) {
        setPhone(selectedCountryData.dialCode.replace('+', ''));
      }
    }
  }, [selectedCountry]);

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

useEffect(() => {
  if (confirmPassword && password !== confirmPassword) {
    setPasswordMatchError("Passwords don't match");
  } else {
    setPasswordMatchError('');
  }
}, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

     console.log('Form submitted with selectedCountry:', selectedCountry);
     const countryData = countries.find(c => c.name === selectedCountry);
      console.log('Country data found for submission:', countryData);
      if (!countryData) {
        console.error('Invalid country selected:', selectedCountry);
        setError('Please select a valid country');
        return;
      }

      setError('');
      setPasswordMatchError('');

    if (!validateEmail(email)) {
      return setError('Please enter a valid email address');
    }

    if (passwordStrength < 3) {
      return setError('Please use a stronger password');
    }

    if (password !== confirmPassword) {
        setPasswordMatchError("Passwords don't match");
        return setError("Passwords don't match");
      }

    if (!termsAgreed) {
      return setError('You must agree to the Terms of Service and Privacy Policy');
    }

    console.log(countries)

    try {
      setError('');
      setLoading(true);

      const userData = {
        firstName,
        middleName,
        lastName,
        email,
        password,
        country: countryData.code, 
        countryName: selectedCountry,
        phone: phone,
        userRole: 'USER'
      };

      await register(userData);
      navigate('/dashboard');
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request was cancelled');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setError(err.response.data.message);
      }
      else if (err.response?.data?.code === 'REGISTRATION_ERROR') {
        console.log('Registration Error');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setError(err.response.data.message);
      } else if (err.response?.data?.code === 'VALIDATION_ERROR') {
        setError(err.response.data.message);
      } else if (err === 'User Profile on this email already registered') {
        setError(err);
        console.error("Registration error:", err);
        navigate('/login', {
          state: { 
            error: "Email already registered. Kindly use a different email for registration. If you have forgotten your password, click on 'Forgot Password' to reset it.",
            email: email // Optional: pre-fill email field on login page
          }
        });
      } else {
        setError(err);
        console.error("Registration error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  function numberToWords(num) {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    if (num === 0) return "Zero";

    const intPart = Math.floor(num);
    const decimalPart = Math.round((num - intPart) * 100);

    function convertTwoDigits(n) {
      if (n < 10) return ones[n];
      else if (n < 20) return teens[n - 10];
      else return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    }

    let words = "";
    if (intPart >= 100) {
      words += ones[Math.floor(intPart / 100)] + " Hundred ";
    }
    words += convertTwoDigits(intPart % 100);

    return words.trim() + " Rupees Only";
  }

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: '#1A237E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 1100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={company_logo}
            alt="Company Logo"
            style={{ height: '40px', marginRight: '16px' }}
          />
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            Invoice Generator Pro
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Link
            component={RouterLink}
            to="/support"
            underline="none"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              '&:hover': { color: '#FFD700' }
            }}
          >
            Support
          </Link>
          <Link
            component={RouterLink}
            to="/login"
            underline="none"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              '&:hover': { color: '#FFD700' }
            }}
          >
            Login
          </Link>
        </Box>
      </Box>

      <Box sx={{
        width: '100%',
        maxWidth: '1800px',
        margin: '0 auto',
        backgroundColor: '#87c6fa',
        padding: '20px',
        borderRadius: '4px',
        pt: '84px'
      }}>
        <Grid container spacing={3} alignItems="stretch" >
          <Grid item xs={12} md={3} sx={{ flex: '0 0 25%' , }}>
            <Paper elevation={3} sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', color: 'blue' , justifyContent: 'space-between', backgroundColor:'#adad3d', height: '100%', }}>
              <Typography variant="h6" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
                Registration Tutorial
              </Typography>
              <Box
                sx={{
                  position: 'relative',

                  cursor: 'pointer',
                  '&:hover .play-button': { transform: 'scale(1.1)' }
                }}
                onClick={() => window.open('https://youtube.com', '_blank')}
              >
                <img
                  src={youtube_thumbnail}
                  alt="How to Register"
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}
                />
                <Box
                  className="play-button"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(255,0,0,0.8)',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <Typography variant="h4" sx={{ color: 'white' }}>▶</Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                Watch our step-by-step guide to registration
              </Typography>
            </Paper>
          </Grid>
<Grid item xs={12} md={6} sx={{ flex: '0 0 40%' }}>
  <Paper
    elevation={3}
    sx={{
      width: '100%',
      flex: 1,
      backgroundColor: '#e8e7c5',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      p: 3,
    }}
  >
    <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold'}}>
      Create Your Account
    </Typography>
    {error && (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )}
    <form onSubmit={handleSubmit}>
      {/* Name Fields */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
             <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="caption" sx={{ width: '90px', fontWeight: 'bold', flexShrink: 0 }}>First Name:</Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                  sx={{ '& .MuiOutlinedInput-root': {
                                  backgroundColor: 'white',
                                }, mr: 2 }} // Add right margin for spacing
                />

                <Typography variant="caption" sx={{ width: '90px', fontWeight: 'bold', flexShrink: 0 }}>Middle Name:</Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  autoComplete="additional-name"
                  sx={{ '& .MuiOutlinedInput-root': {
                                                    backgroundColor: 'white',
                                                  }, mr: 2 }}
                />
              </Box>

          </Grid>

        </Grid>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="caption" sx={{ width: '90px', fontWeight: 'bold', flexShrink: 0 }}>Last Name:</Typography>
              <TextField
                fullWidth
                size="small"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
                sx={{ '& .MuiOutlinedInput-root': {
                                                  backgroundColor: 'white',
                                                }, mr: 2 }}
              />
            </Box>

      {/* Email */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="caption" sx={{ width: '90px', fontWeight: 'bold', flexShrink: 0 }}>Email:</Typography>
        <TextField
          fullWidth
          size="small"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
          sx={{ '& .MuiOutlinedInput-root': {
                                            backgroundColor: 'white',
                                          }, mr: 2 }}
        />
      </Box>

      {/* Country */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="caption" sx={{ width: '90px', fontWeight: 'bold', flexShrink: 0 }}>Country:</Typography>
        <FormControl fullWidth size="small" sx={{
                                                  '& .MuiOutlinedInput-root': {
                                                    backgroundColor: 'white',
                                                  }
                                                }}>
          <Select
            value={selectedCountry}
            onChange={(e) => {
              console.log('Country selected:', e.target.value);
              setSelectedCountry(e.target.value);
            }}
            required
          >
            {countries.map((country) => (
              <MenuItem key={country.name} value={country.name}>
                {country.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Phone */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="caption" sx={{ width: '90px', fontWeight: 'bold', flexShrink: 0 }}>Phone:</Typography>

        <Box sx={{ width: '100%' }}>
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
            inputStyle={{
              width: '100%',
              height: '40px',
              fontSize: '0.875rem'
            }}
            containerStyle={{
              width: '100%'
            }}
          />
        </Box>
      </Box>

      {/* Password */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="caption" sx={{ width: '90px', fontWeight: 'bold', flexShrink: 0 }}>Password:</Typography>
        <TextField
          fullWidth
          size="small"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  size="small"
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            )
          }}
      sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
            }
          }}
        />
      </Box>

      {/* Password Strength */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box
                            sx={{

                              position: 'relative',
                              display: 'inline-flex',
                              alignItems: 'center',
                              cursor: 'pointer',
                              '&:hover > div': {
                                visibility: 'visible',
                                opacity: 1
                              }

                            }}
                          >
      <Typography variant="caption">Password Strength</Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 'bold',
                ml: 0.5,
                color: '#616161'
              }}
            >
              ?
            </Typography>
            <Box
              sx={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                mb: 1,
                p: 1,
                backgroundColor: '#333',
                color: '#fff',
                borderRadius: '4px',
                fontSize: '0.75rem',
                width: '200px',
                visibility: 'hidden',
                opacity: 0,
                transition: 'opacity 0.2s, visibility 0.2s',
                zIndex: 1
              }}
            >
              <Typography variant="caption">Password Strength Requirements:</Typography>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
                <li>At least 8 characters long</li>
                <li>At least one uppercase letter</li>
                <li>At least one lowercase letter</li>
                <li>At least one number</li>
                <li>At least one special character (e.g. @$!%*?&)</li>
              </ul>
            </Box>
           </Box>
                   <Typography
                     variant="caption"
                     sx={{ color: getPasswordStrengthColor(passwordStrength) }}
                   >
                     {getPasswordStrengthLabel(passwordStrength)}
                   </Typography>
                 </Box>

      <Box sx={{ display: 'flex', mb: 1 }}>
        <Box sx={{ width: '90px', flexShrink: 0 }}></Box>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ height: '4px', backgroundColor: '#e0e0e0', borderRadius: '2px', mb: 1 }}>
            <Box
              sx={{
                height: '100%',
                width: getPasswordStrengthWidth(passwordStrength),
                backgroundColor: getPasswordStrengthColor(passwordStrength),
                borderRadius: '2px'
              }}
            />
          </Box>
          {/* Password strength indicators */}
        </Box>
      </Box>

      {/* Confirm Password */}
<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
  <Typography variant="caption" sx={{ width: '90px', fontWeight: 'bold', flexShrink: 0 }}>Confirm:</Typography>
  <TextField
    fullWidth
    size="small"
    type={showConfirmPassword ? 'text' : 'password'}
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    required
    error={!!passwordMatchError}
    helperText={passwordMatchError}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            size="small"
          >
            {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </IconButton>
        </InputAdornment>
      )
    }}
sx={{
      '& .MuiOutlinedInput-root': {
        backgroundColor: 'white',
      }
    }}
  />
</Box>

      {/* Terms */}
      <Box sx={{ display: 'flex', mb: 2 }}>
        <Box sx={{ width: '90px', flexShrink: 0 }}></Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              size="small"
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
        />
      </Box>

      {/* Submit Button */}
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ width: '90px', flexShrink: 0 }}></Box>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </Box>
    </form>

    <Typography sx={{ mt: 2 }} align="center">
      Already have an account?{' '}
      <Link component={RouterLink} to="/login" underline="hover">
        Login
      </Link>
    </Typography>
  </Paper>
</Grid>

          <Grid item xs={12} md={3} sx={{ flex: '0 0 30%' }}>
            <Paper
              elevation={3}
              sx={{
                height: '100%',
                width: '100%',
                flex: 1,
                p: 2,
                backgroundColor: '#FFF8E1',
                display: 'flex',
                flexDirection: 'column',
                borderTop: '4px solid #FFB74D',
                borderRadius: '8px'
              }}
            >
              <Typography variant="h5" gutterBottom align="center" sx={{ color: '#1A237E', fontWeight: 'bold' }}>
                Invoice Preview
              </Typography>

              <Box sx={{
                border: '1px dashed #FFB74D',
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: 'white',
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Typography variant="h6" sx={{ mb: 1, textAlign: 'left', fontWeight: 'bold', color: 'black' }}>
                  Sample Tax Invoice
                </Typography>




                     <Box sx={{
                       display: 'flex',
                       justifyContent: 'space-between',
                       alignItems: 'flex-start',
                       mb: 2
                     }}>
                       {/* Left Box - Invoice Details */}
                       <Box sx={{ flex: 1 }}>
                         <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                           <Typography variant="body2" sx={{ color: 'gray', fontWeight: 500, width: '120px' }}>
                             Invoice No #
                           </Typography>
                           <Typography variant="body2" sx={{ color: 'black' }}>
                             INV-2025-001
                           </Typography>
                         </Box>
                         <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                           <Typography variant="body2" sx={{ color: 'gray', fontWeight: 500, width: '120px' }}>
                             Invoice Date
                           </Typography>
                           <Typography variant="body2" sx={{ color: 'black' }}>
                             July 24, 2025
                           </Typography>
                         </Box>
                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
                           <Typography variant="body2" sx={{ color: 'gray', fontWeight: 500, width: '120px' }}>
                             Due Date
                           </Typography>
                           <Typography variant="body2" sx={{ color: 'black' }}>
                             August 23, 2025
                           </Typography>
                         </Box>
                       </Box>

                       {/* Right Box - Logo */}
                       <Box sx={{
                         textAlign: 'right',
                         display: 'flex',
                         flexDirection: 'column',
                         alignItems: 'flex-end'
                       }}>
                         <img
                           src={office_building}
                           alt="Sunshine Tower"
                           style={{ marginBottom: 8, width: 80, height: 80, objectFit: 'contain' }}
                         />
                         <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'primary.main' }}>
                           Sunshine Tower
                         </Typography>
                       </Box>
                     </Box>






                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem', color: 'blue' }}>Billed By:</Typography>
                    <Typography variant="body1">Your Company Name</Typography>
                    <Typography variant="body2">123 Business Street</Typography>
                    <Typography variant="body2">City, Country</Typography>
                    <Typography variant="body2">
                      <strong style={{ color: 'black' }}>GSTIN:</strong> 27ABCDE1234F0G0
                    </Typography>
                    <Typography variant="body2">
                      <strong style={{ color: 'black' }}>PAN:</strong> ABCDE1234F
                    </Typography>
                    <Typography variant="body2">
                      <strong style={{ color: 'black' }}>Email:</strong> test@test.com
                    </Typography>
                    <Typography variant="body2">
                      <strong style={{ color: 'black' }}>Phone:</strong> +91 99999 00000
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1rem', color: 'blue' }}>Billed To:</Typography>
                    <Typography variant="body1">Client Name</Typography>
                    <Typography variant="body2">456 Client Avenue</Typography>
                    <Typography variant="body2">Client City, Country</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'table', width: '100%', borderSpacing: 0 }}>
                  <Box sx={{ display: 'table-row', backgroundColor: '#33CC33', color: 'white', maxWidth: '500px' }}>
                    {['Item', 'GST Rate', 'Quantity', 'Rate', 'Amount', 'CGST', 'SGST', 'Total'].map((text, i) => (
                      <Box key={i} sx={{ display: 'table-cell', padding: '6px', fontWeight: 'bold', fontSize: '0.575rem' }}>
                        {text}
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{ display: 'table-row', borderBottom: '1px solid #A5D6A7' }}>
                    <Box sx={{ display: 'table-cell', padding: '6px' }}>
                      <Typography sx={{ fontSize: '0.575rem' }}>1. ISO Certification</Typography>
                      <Typography sx={{ fontSize: '0.575rem', fontStyle: 'italic' }}>(HSN/SAC: 111111)</Typography>
                    </Box>
                    <Box sx={{ display: 'table-cell', padding: '4px' }}>
                      <Typography sx={{ fontSize: '0.575rem' }}>18%</Typography>
                    </Box>
                    <Box sx={{ display: 'table-cell', padding: '4px' }}>
                      <Typography sx={{ fontSize: '0.575rem' }}>1</Typography>
                    </Box>
                    <Box sx={{ display: 'table-cell', padding: '4px' }}>
                      <Typography sx={{ fontSize: '0.575rem' }}>50.00</Typography>
                    </Box>
                    <Box sx={{ display: 'table-cell', padding: '4px' }}>
                      <Typography sx={{ fontSize: '0.575rem' }}>50.00</Typography>
                    </Box>
                    <Box sx={{ display: 'table-cell', padding: '4px' }}>
                      <Typography sx={{ fontSize: '0.575rem' }}>₹9.00</Typography>
                    </Box>
                    <Box sx={{ display: 'table-cell', padding: '4px' }}>
                      <Typography sx={{ fontSize: '0.575rem' }}>₹9.00</Typography>
                    </Box>
                    <Box sx={{ display: 'table-cell', padding: '4px' }}>
                      <Typography sx={{ fontSize: '0.575rem' }}>₹68.00</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'table-row', backgroundColor: '#E8F5E9', borderTop: '2px solid #33CC33' }}>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Amount in Words:
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'gray' }}>
                      {numberToWords(88.50)}
                    </Typography>
                  </Box>
                  <Box sx={{ flexShrink: 0 }}>
                    <Box
                      sx={{
                        display: 'table',
                        borderCollapse: 'collapse',
                        border: '1px solid #A5D6A7',
                        minWidth: '100px',
                        fontSize: '0.575rem',
                      }}
                    >
                      {[
                        { label: 'Amount', value: '₹50.00' },
                        { label: 'CGST', value: '₹9.00' },
                        { label: 'SGST', value: '₹9.00' },
                        { label: 'Total (INR)', value: '₹68.00' },
                      ].map(({ label, value }, i) => (
                        <Box
                          key={i}
                          sx={{
                            display: 'table-row',
                            backgroundColor: i % 2 === 0 ? '#F1F8E9' : 'white',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'table-cell',
                              padding: '8px 12px',
                              fontWeight: 'bold',
                              border: '1px solid #A5D6A7',
                            }}
                          >
                            {label}
                          </Box>
                          <Box
                            sx={{
                              display: 'table-cell',
                              padding: '8px 12px',
                              textAlign: 'right',
                              border: '1px solid #A5D6A7',
                              minWidth: '100px',
                            }}
                          >
                            {value}
                          </Box>
                        </Box>
                      ))}
                    </Box>
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
    </Box>
  );
};

export default RegisterPage;
