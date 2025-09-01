import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  Container,
  IconButton,
  CircularProgress,
  Snackbar,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import api from '../services/api';
import countries from '../utils/countries';
import countryStates from '../utils/countryStates';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Validation schema
const getValidationSchema = (selectedCountry) => {
  return Yup.object().shape({
    businessName: Yup.string().required('Business name is required'),
    website: Yup.string().url('Invalid URL format'),
    gstin: Yup.string()
      .test('gstin-format', 'Invalid GSTIN format', (value) => {
        if (!value) return true; // Optional field
        // GSTIN validation logic (15 alphanumeric characters)
        const gstinRegex = /^[0-9A-Z]{15}$/;
        return gstinRegex.test(value);
      }),
    pan: Yup.string()
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
    primaryEmail: Yup.string().email('Invalid email'),
    phone: Yup.string()
      .test('phone-validation', 'Invalid phone number', function(value) {
        const { country } = this.parent;
        if (!value) return false;

        // Country-specific phone validation
        if (country === 'India') {
          return /^[6-9][0-9]{9}$/.test(value); // Indian phone numbers
        } else if (country === 'United States' || country === 'Canada') {
          return /^[2-9][0-9]{9}$/.test(value); // US/Canada format
        }
        // Add more country-specific validations as needed
        return value.length >= 8; // Default minimum length
      })
      .required('Phone is required'),
    addressLine: Yup.string(),
    city: Yup.string(),
    state: Yup.string().when('country', {
      is: (country) => country && countryStates[country] && countryStates[country].hasStates,
      then: () => Yup.string(),
      otherwise: () => Yup.string().notRequired(),
    }),
    pincode: Yup.string(),
    country: Yup.string().required('Country is required'),
    additionalDetails: Yup.array().of(
      Yup.object().shape({
        key: Yup.string().required('Key is required'),
        value: Yup.string().required('Value is required')
      })
    )
  });
};

// Helper functions
const generateBusinessId = () => {
  const bytes = new Uint8Array(12);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

const getCountryCode = (countryName) => {
  const country = countries.find(c => c.name === countryName);
  return country ? country.code.toLowerCase() : 'in';
};

const BusinessSetup = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countryCode, setCountryCode] = useState('in');
  const [geoLocationLoading, setGeoLocationLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState(null);
  const [pincodeSuccess, setPincodeSuccess] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [businessId] = useState(generateBusinessId());
  const navigate = useNavigate();

  const businessSetUpContext = searchParams.get('context') || 'vendor';

  // Formik initialization
  const formik = useFormik({
    initialValues: {
      businessName: '',
      website: '',
      gstin: '',
      pan: '',
      primaryEmail: '',
      phone: '',
      addressLine: '',
      city: '',
      state: '',
      pincode: '',
      country: '',
      additionalDetails: []
    },
    validationSchema: getValidationSchema(),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);

        let logoUrl = null;
        if (logoFile) {
          try {
            setLogoUploading(true);
            const formData = new FormData();
            formData.append('file', logoFile);

            const logoResponse = await api.post(
              `/api/v1/media/upload?keyIdentifier=${businessId}&assetType=BUSINESS_LOGO&assetName=CompanyLogo`,
              formData,
              { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (logoResponse.success) {
              logoUrl = logoResponse.data.url;
            }
          } catch (logoError) {
            console.error('Error uploading logo:', logoError);
          } finally {
            setLogoUploading(false);
          }
        }

        // Format the payload
        const address = {
          email: values.primaryEmail,
          phone: values.phone,
          addressLine: values.addressLine,
          city: values.city,
          pincode: values.pincode,
          country: values.country
        };

        if (values.country && countryStates[values.country] && countryStates[values.country].hasStates) {
          address.state = values.state;
        }

        const payload = {
          businessId,
          businessName: values.businessName,
          gstin: values.gstin,
          pan: values.pan,
          email: values.primaryEmail,
          phone: values.phone,
          address,
          additionalDetails: values.additionalDetails.length > 0 ? values.additionalDetails : undefined,
          logoUrl
        };

        // Make API call
        const response = await api.post(`/api/${businessSetUpContext}/business/add`, payload);

        if (!response.success) {
          throw new Error('Error creating business');
        }

        const businessDetails = response.data;

        // Store business details
        if (businessDetails && businessDetails.businessId) {
          localStorage.setItem('businessDetails', JSON.stringify(businessDetails));
          localStorage.setItem('businessSetupCompleted', 'true');

          setSuccessMessage('Business setup successful! Redirecting to dashboard...');

        setTimeout(() => {
          if (businessSetUpContext === 'vendor') {
            navigate('/business-details');
          } else if (businessSetUpContext === 'client') {
            navigate('/client-details');
          }
        }, 1000);
        } else {
          throw new Error('Error creating business');
        }
      } catch (error) {
        console.error('Error creating business:', error);

        if (error.response) {
          setError(error.response.data?.message || 'Error from server');
        } else if (error.request) {
          setError('No response from server. Please check your connection.');
        } else {
          setError(error.message || 'Error creating business');
        }
      } finally {
        setLoading(false);
      }
    },
  });

  // Handle logo file selection
  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setLogoFile(file);

      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  // Fetch user's location
  const fetchLocationData = useCallback(async () => {
    try {
      setGeoLocationLoading(true);
      const response = await axios.get('https://ipapi.co/json/');
      const userData = response.data;

      // Set UAE as default for testing or based on location
      const defaultCountry = countries.find(c => c.code === 'AE') || countries.find(c => c.name === 'United Arab Emirates');
      let targetCountry = defaultCountry;

      if (userData?.country_name && countries.some(c => c.name === userData.country_name)) {
        const detectedCountry = countries.find(c => c.name === userData.country_name);
        if (detectedCountry) targetCountry = detectedCountry;
      } else if (userData?.country_code) {
        const countryByCode = countries.find(c => c.code === userData.country_code.toUpperCase());
        if (countryByCode) targetCountry = countryByCode;
      }

      formik.setFieldValue('country', targetCountry.name);
      setCountryCode(targetCountry.code.toLowerCase());
    } catch (error) {
      console.error("Failed to fetch location data", error);
      const defaultCountry = countries.find(c => c.code === 'AE') || countries.find(c => c.name === 'United Arab Emirates');
      formik.setFieldValue('country', defaultCountry.name);
      setCountryCode(defaultCountry.code.toLowerCase());
    } finally {
      setGeoLocationLoading(false);
    }
  }, [formik.setFieldValue]);

  useEffect(() => {
    fetchLocationData();
  }, [fetchLocationData]);

  // Handle pincode lookup
  const handlePincodeLookup = async (pincode) => {
    if (!pincode) return;
    setPincodeSuccess(false);

    const minLength = countryCode === 'us' ? 5 :
                      countryCode === 'ca' ? 6 :
                      countryCode === 'gb' ? 5 :
                      countryCode === 'au' ? 4 :
                      countryCode === 'ae' ? 5 : 5;

    if (pincode.length < minLength) return;

    try {
      setPincodeLoading(true);
      setPincodeError(null);

      const countryCodeForApi = countryCode || 'ae';
      let formattedPincode = pincode.replace(/\s/g, '');

      // Special handling for UAE postcodes
      if (countryCodeForApi === 'ae') {
        const uaePostcodes = {
          '00000': { city: 'Abu Dhabi', state: '' },
          '11111': { city: 'Dubai', state: '' },
          '22222': { city: 'Sharjah', state: '' },
          '33333': { city: 'Ajman', state: '' },
          '44444': { city: 'Umm Al Quwain', state: '' },
          '55555': { city: 'Ras Al Khaimah', state: '' },
          '66666': { city: 'Fujairah', state: '' },
        };

        if (uaePostcodes[formattedPincode]) {
          const uaePlace = uaePostcodes[formattedPincode];
          formik.setFieldValue('city', uaePlace.city);

          const uaeCountry = countries.find(c => c.code === 'AE');
          if (uaeCountry) {
            formik.setFieldValue('country', uaeCountry.name);
            setCountryCode('ae');
          }

          setPincodeSuccess(true);
          setTimeout(() => setPincodeSuccess(false), 3000);
          setPincodeLoading(false);
          return;
        }
      }

      // Call the zippopotam.us API
      const response = await axios.get(`https://api.zippopotam.us/${countryCodeForApi}/${formattedPincode}`);

      if (response.data && response.data.places && response.data.places.length > 0) {
        const place = response.data.places[0];
        let fieldsUpdated = false;

        if (place['place name']) {
          formik.setFieldValue('city', place['place name']);
          fieldsUpdated = true;
        }

        let countryName = response.data.country;
        if (countryName && !countryStates[countryName]) {
          const matchingCountry = Object.keys(countryStates).find(c =>
            c.toLowerCase() === countryName.toLowerCase() ||
            c.toLowerCase().includes(countryName.toLowerCase()) ||
            countryName.toLowerCase().includes(c.toLowerCase())
          );

          if (matchingCountry) countryName = matchingCountry;
        }

        if (countryName && countryStates[countryName]) {
          formik.setFieldValue('country', countryName);
          setCountryCode(getCountryCode(countryName));
          fieldsUpdated = true;

          if (countryStates[countryName] && countryStates[countryName].hasStates) {
            const stateName = place['state'] || place['state abbreviation'];
            if (stateName) {
              const statesList = countryStates[countryName].states;
              const matchingState = statesList.find(s =>
                s.toLowerCase() === stateName.toLowerCase() ||
                s.toLowerCase().includes(stateName.toLowerCase()) ||
                stateName.toLowerCase().includes(s.toLowerCase())
              );

              if (matchingState) {
                formik.setFieldValue('state', matchingState);
                fieldsUpdated = true;
              }
            }
          }
        }

        if (fieldsUpdated) {
          setPincodeSuccess(true);
          setTimeout(() => setPincodeSuccess(false), 3000);
        } else {
          setPincodeError('Location found but details could not be auto-filled.');
        }
      }
    } catch (error) {
      console.error('Error looking up pincode:', error);
      if (error.response?.status === 404) {
        // Not showing error for not found pincodes
      } else if (error.request) {
        setPincodeError('Network issue while looking up pincode.');
      } else {
        setPincodeError('Unable to lookup pincode.');
      }
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setSuccessMessage(null);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 5, mb: 5 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Tell us about your {businessSetUpContext}
          </Typography>
          <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary" sx={{ mb: 4 }}>
            This helps us personalize your experience
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Snackbar
            open={!!successMessage}
            autoHideDuration={6000}
            onClose={handleCloseSuccess}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
              {successMessage}
            </Alert>
          </Snackbar>

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              {/* Logo Upload Section - Top Row */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                      Company Logo
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                      {logoPreview ? (
                        <Avatar
                          src={logoPreview}
                          sx={{ width: 80, height: 80 }}
                          variant="rounded"
                        />
                      ) : (
                        <Avatar
                          sx={{ width: 80, height: 80, bgcolor: 'grey.200' }}
                          variant="rounded"
                        >
                          <CloudUploadIcon />
                        </Avatar>
                      )}
                      <Box>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<CloudUploadIcon />}
                          disabled={logoUploading}
                          sx={{
                            width: '300px', // Widen the upload button
                            justifyContent: 'flex-start'
                          }}
                        >
                          Upload Logo
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleLogoChange}
                          />
                        </Button>
                        {logoPreview && (
                          <Button
                            variant="text"
                            color="error"
                            onClick={handleRemoveLogo}
                            sx={{ ml: 1 }}
                          >
                            Remove
                          </Button>
                        )}
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Upload your company logo (max 5MB, JPG/PNG)
                    </Typography>
                    {logoUploading && (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        <Typography variant="body2">Uploading logo...</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Business Name */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Business Name"
                  name="businessName"
                  value={formik.values.businessName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.businessName && Boolean(formik.errors.businessName)}
                  helperText={
                    (formik.touched.businessName && formik.errors.businessName) ||
                    "Official Name used across Accounting documents and reports."
                  }
                  required
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '40px' // Reduce height by ~60% (from default ~56px)
                    }
                  }}
                />
              </Grid>

              {/* Website */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Website"
                  name="website"
                  value={formik.values.website}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.website && Boolean(formik.errors.website)}
                  helperText={
                    (formik.touched.website && formik.errors.website) ||
                    "Add your business or work website."
                  }
                  placeholder="Your Work Website"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '40px' // Reduce height by ~60%
                    }
                  }}
                />
              </Grid>

              {/* GSTIN and PAN in a 2-column row */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="GSTIN"
                  name="gstin"
                  value={formik.values.gstin}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.gstin && Boolean(formik.errors.gstin)}
                  helperText={
                    (formik.touched.gstin && formik.errors.gstin) ||
                    "Enter your 15-digit Goods and Services Tax Identification Number"
                  }
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '40px' // Reduce height by ~60%
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="PAN"
                  name="pan"
                  value={formik.values.pan}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.pan && Boolean(formik.errors.pan)}
                  helperText={
                    (formik.touched.pan && formik.errors.pan) ||
                    "Enter your 10-character Permanent Account Number"
                  }
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '40px' // Reduce height by ~60%
                    }
                  }}
                />
              </Grid>

              {/* Office Address Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Office Address
                </Typography>

                <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    {/* Email and Phone in a 2-column row */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="primaryEmail"
                        value={formik.values.primaryEmail}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.primaryEmail && Boolean(formik.errors.primaryEmail)}
                        helperText={formik.touched.primaryEmail && formik.errors.primaryEmail}
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            height: '40px' // Reduce height by ~60%
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        name="phone"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.phone && Boolean(formik.errors.phone)}
                        helperText={
                          (formik.touched.phone && formik.errors.phone) ||
                          "10-digit phone number without spaces or special characters"
                        }
                        required
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            height: '40px' // Reduce height by ~60%
                          }
                        }}
                      />
                    </Grid>

                    {/* Address Line */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address Line"
                        name="addressLine"
                        value={formik.values.addressLine}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.addressLine && Boolean(formik.errors.addressLine)}
                        helperText={formik.touched.addressLine && formik.errors.addressLine}
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            height: '40px' // Reduce height by ~60%
                          }
                        }}
                      />
                    </Grid>

                    {/* City and Pincode in a 2-column row */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="City"
                        name="city"
                        value={formik.values.city}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.city && Boolean(formik.errors.city)}
                        helperText={formik.touched.city && formik.errors.city}
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            height: '40px' // Reduce height by ~60%
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Pincode"
                        name="pincode"
                        value={formik.values.pincode}
                        onChange={(e) => {
                          formik.handleChange(e);
                          if (pincodeSuccess) setPincodeSuccess(false);
                          if (e.target.value.length >= 5) {
                            handlePincodeLookup(e.target.value);
                          }
                        }}
                        onBlur={(e) => {
                          formik.handleBlur(e);
                          if (e.target.value.length >= 5) {
                            handlePincodeLookup(e.target.value);
                          }
                        }}
                        error={formik.touched.pincode && Boolean(formik.errors.pincode) || Boolean(pincodeError)}
                        helperText={
                          (formik.touched.pincode && formik.errors.pincode) ||
                          pincodeError ||
                          (pincodeSuccess ? "✓ Location found and fields updated!" : "Enter pincode to auto-fill city, state, and country")
                        }
                        InputProps={{
                          endAdornment: pincodeLoading ? (
                            <InputAdornment position="end">
                              <CircularProgress size={20} />
                            </InputAdornment>
                          ) : pincodeSuccess ? (
                            <InputAdornment position="end">
                              <Box sx={{ color: 'success.main', display: 'flex', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.2rem' }}>✓</span>
                              </Box>
                            </InputAdornment>
                          ) : null
                        }}
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            height: '40px', // Reduce height by ~60%
                            '& fieldset': {
                              borderColor: pincodeSuccess ? 'success.main' : undefined,
                            },
                          },
                          '& .MuiFormHelperText-root': {
                            color: pincodeSuccess ? 'success.main' : undefined,
                          }
                        }}
                      />
                    </Grid>

                    {/* State and Country in a 2-column row */}
                    {formik.values.country && countryStates[formik.values.country] && countryStates[formik.values.country].hasStates && (
                      <Grid item xs={12} sm={6}>
                        <FormControl
                          fullWidth
                          error={formik.touched.state && Boolean(formik.errors.state)}
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              height: '40px' // Reduce height by ~60%
                            }
                          }}
                        >
                          <InputLabel>State</InputLabel>
                          <Select
                            name="state"
                            value={formik.values.state}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            label="State"
                          >
                            {countryStates[formik.values.country]?.states?.map((state) => (
                              <MenuItem key={state} value={state}>
                                {state}
                              </MenuItem>
                            ))}
                          </Select>
                          {formik.touched.state && formik.errors.state && (
                            <FormHelperText>
                              {formik.errors.state}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                    )}

                    <Grid item xs={12} sm={6}>
                      <FormControl
                        fullWidth
                        error={formik.touched.country && Boolean(formik.errors.country)}
                        required
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            height: '40px' // Reduce height by ~60%
                          }
                        }}
                      >
                        <InputLabel>Country</InputLabel>
                        <Select
                          name="country"
                          value={formik.values.country}
                          onChange={(e) => {
                            formik.setFieldValue('country', e.target.value);
                            setCountryCode(getCountryCode(e.target.value));
                          }}
                          onBlur={formik.handleBlur}
                          label="Country"
                        >
                          {countries.map((country) => (
                            <MenuItem key={country.code} value={country.name}>
                              {country.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.country && formik.errors.country && (
                          <FormHelperText>
                            {formik.errors.country}
                          </FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Geolocation Loading Indicator */}
              {geoLocationLoading && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2 }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Detecting your location...
                    </Typography>
                  </Box>
                </Grid>
              )}

              {/* Additional Details Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Additional Details
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Add any custom information about your business as key-value pairs
                </Typography>

                <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  {formik.values.additionalDetails.length > 0 ? (
                    <Box sx={{ mb: 2 }}>
                      {formik.values.additionalDetails.map((detail, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 2,
                            p: 1,
                            borderRadius: 1,
                            bgcolor: 'rgba(0, 0, 0, 0.03)'
                          }}
                        >
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={5}>
                              <TextField
                                fullWidth
                                label="Key"
                                name={`additionalDetails[${index}].key`}
                                value={detail.key}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={
                                  formik.touched.additionalDetails?.[index]?.key &&
                                  Boolean(formik.errors.additionalDetails?.[index]?.key)
                                }
                                helperText={
                                  formik.touched.additionalDetails?.[index]?.key &&
                                  formik.errors.additionalDetails?.[index]?.key
                                }
                                size="small"
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    height: '40px' // Reduce height by ~60%
                                  }
                                }}
                              />
                            </Grid>
                            <Grid item xs={5}>
                              <TextField
                                fullWidth
                                label="Value"
                                name={`additionalDetails[${index}].value`}
                                value={detail.value}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={
                                  formik.touched.additionalDetails?.[index]?.value &&
                                  Boolean(formik.errors.additionalDetails?.[index]?.value)
                                }
                                helperText={
                                  formik.touched.additionalDetails?.[index]?.value &&
                                  formik.errors.additionalDetails?.[index]?.value
                                }
                                size="small"
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    height: '40px' // Reduce height by ~60%
                                  }
                                }}
                              />
                            </Grid>
                            <Grid item xs={2}>
                              <IconButton
                                color="error"
                                onClick={() => {
                                  const newDetails = [...formik.values.additionalDetails];
                                  newDetails.splice(index, 1);
                                  formik.setFieldValue('additionalDetails', newDetails);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Grid>
                          </Grid>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        No additional details added yet
                      </Typography>
                    </Box>
                  )}

                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      formik.setFieldValue('additionalDetails', [
                        ...formik.values.additionalDetails,
                        { key: '', value: '' }
                      ]);
                    }}
                    fullWidth
                  >
                    Add Custom Field
                  </Button>
                </Box>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading || geoLocationLoading}
                  sx={{ mt: 2 }}
                  startIcon={loading && <CircularProgress size={20} color="inherit" />}
                >
                  {loading ? 'Saving...' : 'Save & Continue'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default BusinessSetup;