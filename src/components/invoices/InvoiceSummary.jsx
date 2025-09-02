import React from 'react';
import {
  Box, Typography, Card, CardContent,
  Button, Divider, Grid
} from '@mui/material';
import { Save } from '@mui/icons-material';
import dayjs from 'dayjs';

/**
 * InvoiceSummary component for displaying invoice summary and save buttons
 * 
 * @param {Object} props - Component props
 * @param {string} props.invoiceNumber - Invoice number
 * @param {Object} props.invoiceDate - Invoice date (dayjs object)
 * @param {Object} props.dueDate - Due date (dayjs object)
 * @param {Object} props.selectedClient - Selected client object
 * @param {Array} props.items - Array of invoice items
 * @param {string} props.currency - Currency code
 * @param {Function} props.onSaveDraft - Function to handle save as draft
 * @param {Function} props.onSaveAndContinue - Function to handle save and continue
 */
const InvoiceSummary = ({
  invoiceNumber = '',
  invoiceDate = null,
  dueDate = null,
  selectedClient = null,
  items = [],
  currency = 'INR',
  onSaveDraft = () => {},
  onSaveAndContinue = () => {}
}) => {
  // Helper function to format currency
  const formatCurrency = (amount) => {
    const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '€';
    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  // Calculate subtotal (sum of all item amounts)
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  
  // Calculate tax (sum of all item CGST and SGST)
  const tax = items.reduce((sum, item) => sum + (item.cgst || 0) + (item.sgst || 0), 0);
  
  // Calculate total (subtotal + tax)
  const total = subtotal + tax;

  // Format dates
  const formattedInvoiceDate = invoiceDate && dayjs(invoiceDate).isValid() 
    ? dayjs(invoiceDate).format('MMM D, YYYY') 
    : 'Not set';
  
  const formattedDueDate = dueDate && dayjs(dueDate).isValid() 
    ? dayjs(dueDate).format('MMM D, YYYY') 
    : 'Not set';

  return (
    <Card sx={{ 
      width: '1280px',
      maxWidth: 'none',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
      borderRadius: 1,
      mb: 3,
      border: '1px solid #e0e0e0'
    }}>
      <CardContent sx={{ padding: 2 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
          Invoice Summary
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 1, bgcolor: '#f9f9f9', borderRadius: 1, height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Invoice No
              </Typography>
              <Typography variant="body2" fontWeight="medium">{invoiceNumber || 'Not set'}</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 1, bgcolor: '#f9f9f9', borderRadius: 1, height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Invoice Date
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formattedInvoiceDate}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 1, bgcolor: '#f9f9f9', borderRadius: 1, height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Due Date
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formattedDueDate}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 1, bgcolor: '#f9f9f9', borderRadius: 1, height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Billed To
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {selectedClient ? (selectedClient.clientName || selectedClient.businessName) : 'Not selected'}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 1, bgcolor: '#f9f9f9', borderRadius: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Items
              </Typography>
              <Typography variant="body1" fontWeight="medium" color="primary.main">{items.length}</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 1, bgcolor: '#f9f9f9', borderRadius: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Subtotal
              </Typography>
              <Typography variant="body1" fontWeight="medium" color="primary.main">
                {formatCurrency(subtotal)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 1, bgcolor: '#f9f9f9', borderRadius: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Tax
              </Typography>
              <Typography variant="body1" fontWeight="medium" color="primary.main">
                {formatCurrency(tax)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box 
          sx={{ 
            mb: 3, 
            p: 2, 
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            borderRadius: 2,
            color: 'white',
            boxShadow: '0 3px 6px rgba(33, 150, 243, 0.25)',
            textAlign: 'center'
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
            Total Amount in Rupees
          </Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ my: 1 }}>
            {formatCurrency(total)}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              startIcon={<Save />}
              onClick={onSaveAndContinue}
              sx={{ 
                py: 2, 
                fontWeight: 'bold',
                fontSize: '1.1rem',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.25)',
                  background: 'linear-gradient(45deg, #1e88e5 30%, #1cb5e0 90%)',
                }
              }}
            >
              Save & Continue
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              size="large"
              startIcon={<Save />}
              onClick={onSaveDraft}
              sx={{ 
                py: 2,
                fontSize: '1.1rem',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: 'rgba(33, 150, 243, 0.05)'
                }
              }}
            >
              Save As Draft
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default InvoiceSummary;