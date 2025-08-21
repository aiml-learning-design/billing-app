import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Box, TextField, Button, Typography, Paper, Grid, Alert, 
  Accordion, AccordionSummary, AccordionDetails, IconButton
} from '@mui/material';
import { Add as AddIcon, ExpandMore as ExpandMoreIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../../services/api';

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
  gstin: Yup.string()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format')
    .required('GSTIN is required'),
  pan: Yup.string()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format')
    .required('PAN is required'),
  website: Yup.string().url('Invalid URL format'),
  officeAddresses: Yup.array().of(officeAddressSchema).min(1, 'At least one office address is required'),
});

const BusinessDetailsForm = () => {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [businessId, setBusinessId] = useState(null);

  // Empty office address template
  const emptyOfficeAddress = {
    primaryEmail: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  };

  const formik = useFormik({
    initialValues: {
      businessName: '',
      gstin: '',
      pan: '',
      website: '',
      officeAddresses: [{ ...emptyOfficeAddress }],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSuccess(false);
        setError(null);
        
        let response;
        if (businessId) {
          // Update existing business
          response = await api.put(`/api/vendor/business/update/${businessId}`, values);
        } else {
          // Create new business
          response = await api.post('/api/vendor/business/add', values);
        }
        
        setBusinessId(response.business_id);
        formik.setValues(response);
        setSuccess(true);
      } catch (error) {
        setError(error.response?.data?.message || 'Error saving business details');
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

  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        // Get all businesses for the user
        const response = await api.get('/api/business/all');
        if (response && response.length > 0) {
          // Use the first business
          const business = response[0];
          setBusinessId(business.business_id);
          
          // Ensure officeAddresses is an array
          const formattedBusiness = {
            ...business,
            officeAddresses: Array.isArray(business.officeAddresses) 
              ? business.officeAddresses 
              : [{ ...emptyOfficeAddress }]
          };
          
          formik.setValues(formattedBusiness);
        }
      } catch (error) {
        console.error('Error fetching business details', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBusinessDetails();
  }, []);

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Business Details
        </Typography>
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Business details saved successfully!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Business Name"
                name="businessName"
                value={formik.values.businessName}
                onChange={formik.handleChange}
                error={formik.touched.businessName && Boolean(formik.errors.businessName)}
                helperText={formik.touched.businessName && formik.errors.businessName}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Website"
                name="website"
                value={formik.values.website}
                onChange={formik.handleChange}
                error={formik.touched.website && Boolean(formik.errors.website)}
                helperText={formik.touched.website && formik.errors.website}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="GSTIN"
                name="gstin"
                value={formik.values.gstin}
                onChange={formik.handleChange}
                error={formik.touched.gstin && Boolean(formik.errors.gstin)}
                helperText={formik.touched.gstin && formik.errors.gstin}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="PAN"
                name="pan"
                value={formik.values.pan}
                onChange={formik.handleChange}
                error={formik.touched.pan && Boolean(formik.errors.pan)}
                helperText={formik.touched.pan && formik.errors.pan}
                required
              />
            </Grid>
            
            {/* Office Addresses Section */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Office Addresses</Typography>
                <Button 
                  startIcon={<AddIcon />} 
                  onClick={addOfficeAddress}
                  variant="outlined"
                  size="small"
                >
                  Add Address
                </Button>
              </Box>
              
              {formik.values.officeAddresses.map((address, index) => (
                <Accordion key={index} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      {address.addressLine ? 
                        `${address.addressLine}, ${address.city}` : 
                        `Office Address ${index + 1}`}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
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
                            formik.errors.officeAddresses?.[index]?.phone
                          }
                          required
                        />
                      </Grid>
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
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="State"
                          name={`officeAddresses[${index}].state`}
                          value={address.state}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.officeAddresses?.[index]?.state && 
                            Boolean(formik.errors.officeAddresses?.[index]?.state)
                          }
                          helperText={
                            formik.touched.officeAddresses?.[index]?.state && 
                            formik.errors.officeAddresses?.[index]?.state
                          }
                          required
                        />
                      </Grid>
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
                      {formik.values.officeAddresses.length > 1 && (
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => removeOfficeAddress(index)}
                          >
                            Remove Address
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
              
              {formik.errors.officeAddresses && typeof formik.errors.officeAddresses === 'string' && (
                <Typography color="error" sx={{ mt: 1 }}>
                  {formik.errors.officeAddresses}
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={formik.isSubmitting}
              >
                {businessId ? 'Update Business Details' : 'Create Business'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default BusinessDetailsForm;