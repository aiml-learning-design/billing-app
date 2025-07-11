import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Box, TextField, Button, Typography, Paper, Grid, Alert 
} from '@mui/material';
import api from '../../services/api';

const validationSchema = Yup.object().shape({
  businessName: Yup.string().required('Required'),
  address: Yup.string().required('Required'),
  gstin: Yup.string()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format')
    .required('Required'),
  pan: Yup.string()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format')
    .required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone must be 10 digits')
    .required('Required'),
});

const BusinessDetailsForm = () => {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formik = useFormik({
    initialValues: {
      businessName: '',
      address: '',
      gstin: '',
      pan: '',
      email: '',
      phone: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSuccess(false);
        setError(null);
        const response = await api.post('/api/business/update', values);
        formik.setValues(response.data);
        setSuccess(true);
      } catch (error) {
        setError(error.response?.data?.message || 'Error saving business details');
      }
    },
  });

  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        const response = await api.get('/api/business/1'); // Assuming single business for user
        if (response.data) {
          formik.setValues(response.data);
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
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={3}
                value={formik.values.address}
                onChange={formik.handleChange}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={!formik.dirty || !formik.isValid}
              >
                Save Business Details
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default BusinessDetailsForm;