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
  const [error, setError] = useState(null);

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
        setError(null);

        // Calculate GST amounts
        let igst = 0;
        let cgst = 0;
        let sgst = 0;
        let dueAmount = values.amount;

        if (values.gstStatus !== 'NONE') {
          const gstAmount = values.amount * (values.gstRate / 100);
          dueAmount = values.amount + gstAmount;

          if (values.gstStatus === 'INTER') {
            igst = gstAmount;
          } else {
            cgst = gstAmount / 2;
            sgst = gstAmount / 2;
          }
        }

        const payload = {
          ...values,
          invoiceDate: values.invoiceDate.toISOString().split('T')[0],
          dueDate: values.dueDate ? values.dueDate.toISOString().split('T')[0] : null,
          dueAmount,
          igst,
          cgst,
          sgst
        };

        const response = invoiceId
          ? await api.put(`/api/invoices/update/${invoiceId}`, payload)
          : await api.post('/api/invoices/add', payload);

        setInvoice(response.data);
        setSuccess(true);
        if (onSuccess) onSuccess(response.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Error saving invoice');
      }
    },
  });

  useEffect(() => {
    if (invoiceId) {
      const fetchInvoice = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/api/invoices/get/${invoiceId}`);
          setInvoice(response.data);
          formik.setValues({
            billedTo: response.data.billedTo,
            amount: response.data.amount,
            currency: response.data.currency || 'INR',
            status: response.data.status || 'DRAFT',
            gstStatus: response.data.gstStatus || 'INTRA',
            gstRate: response.data.gstRate || 18,
            invoiceDate: new Date(response.data.invoiceDate) || new Date(),
            dueDate: response.data.dueDate ? new Date(response.data.dueDate) : null,
            placeOfSupply: response.data.placeOfSupply || '',
          });
        } catch (error) {
          setError(error.response?.data?.message || 'Error fetching invoice');
        } finally {
          setLoading(false);
        }
      };
      fetchInvoice();
    }
  }, [invoiceId]);

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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
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
            {formik.values.gstStatus !== 'NONE' && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  GST Calculation:
                </Typography>
                <Typography>
                  Amount: {formik.values.amount || 0} {formik.values.currency}
                </Typography>
                {formik.values.gstStatus === 'INTER' && (
                  <Typography>
                    IGST ({formik.values.gstRate || 0}%): {formik.values.amount * (formik.values.gstRate / 100) || 0} {formik.values.currency}
                  </Typography>
                )}
                {formik.values.gstStatus === 'INTRA' && (
                  <>
                    <Typography>
                      CGST ({formik.values.gstRate / 2 || 0}%): {formik.values.amount * (formik.values.gstRate / 200) || 0} {formik.values.currency}
                    </Typography>
                    <Typography>
                      SGST ({formik.values.gstRate / 2 || 0}%): {formik.values.amount * (formik.values.gstRate / 200) || 0} {formik.values.currency}
                    </Typography>
                  </>
                )}
                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                  Total Amount: {formik.values.amount * (1 + (formik.values.gstStatus === 'NONE' ? 0 : formik.values.gstRate / 100)) || 0} {formik.values.currency}
                </Typography>
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