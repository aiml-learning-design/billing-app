import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box, TextField, Button, Typography, Paper, Grid,
  MenuItem, Alert, FormControl, InputLabel, Select
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import api from '../../services/api';

const validationSchema = Yup.object().shape({
  billedTo: Yup.string().required('Required'),
  amount: Yup.number().positive('Must be positive').required('Required'),
  currency: Yup.string().required('Required'),
  gstStatus: Yup.string().required('Required'),
  gstRate: Yup.number().when('gstStatus', {
    is: (val) => val && val !== 'NONE',
    then: Yup.number().positive('Must be positive').required('Required'),
  }),
});

const InvoiceForm = ({ invoiceId, onSuccess }) => {
  const [invoice, setInvoice] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      const fetchInvoice = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/api/invoices/${invoiceId}`);
          setInvoice(response.data);
          formik.setValues({
            billedTo: response.data.billedTo,
            amount: response.data.amount,
            currency: response.data.currency || 'INR',
            status: response.data.status || 'DRAFT',
            gstStatus: response.data.gstStatus || 'INTRA',
            gstRate: response.data.gstRate || 18,
            invoiceDate: response.data.invoiceDate || new Date(),
            dueDate: response.data.dueDate || null,
            placeOfSupply: response.data.placeOfSupply || '',
          });
        } catch (error) {
          console.error('Error fetching invoice', error);
        } finally {
          setLoading(false);
        }
      };
      fetchInvoice();
    }
  }, [invoiceId]);

  const formik = useFormik({
    initialValues: {
      billedTo: '',
      amount: '',
      currency: 'INR',
      status: 'DRAFT',
      gstStatus: 'INTRA',
      gstRate: 18,
      invoiceDate: new Date(),
      dueDate: null,
      placeOfSupply: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSuccess(false);
        const payload = {
          ...values,
          invoiceDate: values.invoiceDate.toISOString().split('T')[0],
          dueDate: values.dueDate ? values.dueDate.toISOString().split('T')[0] : null,
        };

        const response = invoiceId
          ? await api.put(`/api/invoices/${invoiceId}`, payload)
          : await api.post('/api/invoices', payload);

        setInvoice(response.data);
        setSuccess(true);
        if (onSuccess) onSuccess(response.data);
      } catch (error) {
        console.error('Error saving invoice', error);
      }
    },
  });

  const calculateDueDate = (date) => {
    if (date) {
      const dueDate = new Date(date);
      dueDate.setDate(dueDate.getDate() + 30);
      formik.setFieldValue('dueDate', dueDate);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          {invoiceId ? 'Edit Invoice' : 'Create New Invoice'}
        </Typography>
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Invoice saved successfully!
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Billed To"
                name="billedTo"
                value={formik.values.billedTo}
                onChange={formik.handleChange}
                error={formik.touched.billedTo && Boolean(formik.errors.billedTo)}
                helperText={formik.touched.billedTo && formik.errors.billedTo}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={formik.values.amount}
                onChange={formik.handleChange}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
                helperText={formik.touched.amount && formik.errors.amount}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  name="currency"
                  value={formik.values.currency}
                  onChange={formik.handleChange}
                  label="Currency"
                >
                  <MenuItem value="INR">INR (₹)</MenuItem>
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  label="Status"
                >
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="SENT">Sent</MenuItem>
                  <MenuItem value="PAID">Paid</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="Invoice Date"
                value={formik.values.invoiceDate}
                onChange={(date) => {
                  formik.setFieldValue('invoiceDate', date);
                  calculateDueDate(date);
                }}
                renderInput={(params) => (
                  <TextField {...params} fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="Due Date"
                value={formik.values.dueDate}
                onChange={(date) => formik.setFieldValue('dueDate', date)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Place of Supply"
                name="placeOfSupply"
                value={formik.values.placeOfSupply}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>GST Status</InputLabel>
                <Select
                  name="gstStatus"
                  value={formik.values.gstStatus}
                  onChange={formik.handleChange}
                  label="GST Status"
                  required
                >
                  <MenuItem value="INTRA">Intra-State</MenuItem>
                  <MenuItem value="INTER">Inter-State</MenuItem>
                  <MenuItem value="NONE">No GST</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formik.values.gstStatus !== 'NONE' && (
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="GST Rate (%)"
                  name="gstRate"
                  type="number"
                  value={formik.values.gstRate}
                  onChange={formik.handleChange}
                  error={formik.touched.gstRate && Boolean(formik.errors.gstRate)}
                  helperText={formik.touched.gstRate && formik.errors.gstRate}
                  required
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={!formik.isValid}
              >
                {invoiceId ? 'Update Invoice' : 'Create Invoice'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default InvoiceForm;