import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../services/api';

// Validation schema for office address
const officeAddressSchema = Yup.object().shape({
  primaryEmail: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone must be 10 digits')
    .required('Phone is required'),
  addressLine: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  pincode: Yup.string().required('Pincode is required'),
  country: Yup.string().required('Country is required'),
});

// Main validation schema
const validationSchema = Yup.object().shape({
  businessName: Yup.string().required('Business name is required'),
  website: Yup.string().url('Invalid URL format'),
  officeAddresses: Yup.array().of(officeAddressSchema).min(1, 'At least one office address is required'),
});

const BusinessSetupPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Empty office address template
  const emptyOfficeAddress = {
    primaryEmail: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  };

  const formik = useFormik({
    initialValues: {
      businessName: '',
      website: '',
      gstin: '',
      pan: '',
      officeAddresses: [
        {
          primaryEmail: '',
          phone: '',
          addressLine: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India'
        }
      ]
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);

        // Make API call with the new endpoint
        const response = await api.post('/api/business/add', values);
        
        // Navigate to the business page
        if (response && response.business_id) {
          navigate(`/business`);
        } else {
          throw new Error('No business ID returned from API');
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Error creating business');
        console.error('Error creating business:', error);
      } finally {
        setLoading(false);
      }
    },
  });

  // Add a new office address
  const addOfficeAddress = () => {
    const officeAddresses = [...formik.values.officeAddresses, { ...emptyOfficeAddress }];
    formik.setFieldValue('officeAddresses', officeAddresses);
  };
  
  // Remove an office address
  const removeOfficeAddress = (index) => {
    if (formik.values.officeAddresses.length > 1) {
      const officeAddresses = [...formik.values.officeAddresses];
      officeAddresses.splice(index, 1);
      formik.setFieldValue('officeAddresses', officeAddresses);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 5, mb: 5 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Tell us about your business
          </Typography>
          <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary" sx={{ mb: 4 }}>
            This helps us personalize your experience
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              {/* Business Name */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Business Name"
                  name="businessName"
                  value={formik.values.businessName}
                  onChange={formik.handleChange}
                  error={formik.touched.businessName && Boolean(formik.errors.businessName)}
                  helperText={
                    (formik.touched.businessName && formik.errors.businessName) || 
                    "Official Name used across Accounting documents and reports."
                  }
                  required
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
                  error={formik.touched.website && Boolean(formik.errors.website)}
                  helperText={
                    (formik.touched.website && formik.errors.website) || 
                    "Add your business or work website."
                  }
                  placeholder="Your Work Website"
                />
              </Grid>

              {/* GSTIN */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="GSTIN"
                  name="gstin"
                  value={formik.values.gstin}
                  onChange={formik.handleChange}
                  error={formik.touched.gstin && Boolean(formik.errors.gstin)}
                  helperText={
                    (formik.touched.gstin && formik.errors.gstin) || 
                    "Enter your 15-digit Goods and Services Tax Identification Number"
                  }
                  required
                />
              </Grid>

              {/* PAN */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="PAN"
                  name="pan"
                  value={formik.values.pan}
                  onChange={formik.handleChange}
                  error={formik.touched.pan && Boolean(formik.errors.pan)}
                  helperText={
                    (formik.touched.pan && formik.errors.pan) || 
                    "Enter your 10-character Permanent Account Number"
                  }
                  required
                />
              </Grid>

              {/* Office Addresses Section */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Office Addresses
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />} 
                    onClick={addOfficeAddress}
                    size="small"
                  >
                    Add Address
                  </Button>
                </Box>
                
                {formik.values.officeAddresses.map((address, index) => (
                  <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1">
                        Address {index + 1}
                      </Typography>
                      {formik.values.officeAddresses.length > 1 && (
                        <IconButton 
                          color="error" 
                          onClick={() => removeOfficeAddress(index)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                    <Grid container spacing={2}>
                      {/* Email */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          name={`officeAddresses[${index}].primaryEmail`}
                          value={address.primaryEmail}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.officeAddresses?.[index]?.primaryEmail && 
                            Boolean(formik.errors.officeAddresses?.[index]?.primaryEmail)
                          }
                          helperText={
                            formik.touched.officeAddresses?.[index]?.primaryEmail && 
                            formik.errors.officeAddresses?.[index]?.primaryEmail
                          }
                          required
                        />
                      </Grid>
                      
                      {/* Phone */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone"
                          name={`officeAddresses[${index}].phone`}
                          value={address.phone}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.officeAddresses?.[index]?.phone && 
                            Boolean(formik.errors.officeAddresses?.[index]?.phone)
                          }
                          helperText={
                            formik.touched.officeAddresses?.[index]?.phone && 
                            formik.errors.officeAddresses?.[index]?.phone || 
                            "10-digit phone number without spaces or special characters"
                          }
                          required
                        />
                      </Grid>
                      
                      {/* Address Line */}
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address Line"
                          name={`officeAddresses[${index}].addressLine`}
                          value={address.addressLine}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.officeAddresses?.[index]?.addressLine && 
                            Boolean(formik.errors.officeAddresses?.[index]?.addressLine)
                          }
                          helperText={
                            formik.touched.officeAddresses?.[index]?.addressLine && 
                            formik.errors.officeAddresses?.[index]?.addressLine
                          }
                          required
                        />
                      </Grid>
                      
                      {/* City */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="City"
                          name={`officeAddresses[${index}].city`}
                          value={address.city}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.officeAddresses?.[index]?.city && 
                            Boolean(formik.errors.officeAddresses?.[index]?.city)
                          }
                          helperText={
                            formik.touched.officeAddresses?.[index]?.city && 
                            formik.errors.officeAddresses?.[index]?.city
                          }
                          required
                        />
                      </Grid>
                      
                      {/* State */}
                      <Grid item xs={12} sm={6}>
                        <FormControl 
                          fullWidth
                          error={
                            formik.touched.officeAddresses?.[index]?.state && 
                            Boolean(formik.errors.officeAddresses?.[index]?.state)
                          }
                          required
                        >
                          <InputLabel>State</InputLabel>
                          <Select
                            name={`officeAddresses[${index}].state`}
                            value={address.state}
                            onChange={formik.handleChange}
                            label="State"
                          >
                            {[
                              "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
                              "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
                              "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
                              "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
                              "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
                              "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
                              "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
                            ].map((state) => (
                              <MenuItem key={state} value={state}>
                                {state}
                              </MenuItem>
                            ))}
                          </Select>
                          {formik.touched.officeAddresses?.[index]?.state && 
                           formik.errors.officeAddresses?.[index]?.state && (
                            <FormHelperText>
                              {formik.errors.officeAddresses?.[index]?.state}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                      
                      {/* Pincode */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Pincode"
                          name={`officeAddresses[${index}].pincode`}
                          value={address.pincode}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.officeAddresses?.[index]?.pincode && 
                            Boolean(formik.errors.officeAddresses?.[index]?.pincode)
                          }
                          helperText={
                            formik.touched.officeAddresses?.[index]?.pincode && 
                            formik.errors.officeAddresses?.[index]?.pincode
                          }
                          required
                        />
                      </Grid>
                      
                      {/* Country */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Country"
                          name={`officeAddresses[${index}].country`}
                          value={address.country}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.officeAddresses?.[index]?.country && 
                            Boolean(formik.errors.officeAddresses?.[index]?.country)
                          }
                          helperText={
                            formik.touched.officeAddresses?.[index]?.country && 
                            formik.errors.officeAddresses?.[index]?.country
                          }
                          required
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
                
                {formik.errors.officeAddresses && typeof formik.errors.officeAddresses === 'string' && (
                  <Typography color="error" sx={{ mt: 1 }}>
                    {formik.errors.officeAddresses}
                  </Typography>
                )}
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{ mt: 2 }}
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

export default BusinessSetupPage;