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
        const response = await api.post('/api/business/update', values);
        formik.setValues(response.data);
        setSuccess(true);
      } catch (error) {
        console.error('Error saving business details', error);
      }
    },
  });

  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        const response = await api.get('/api/business');
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

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
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
            {/* Rest of your form fields */}
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