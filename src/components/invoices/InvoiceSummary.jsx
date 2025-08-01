import React from 'react';
import {
  Box, Typography, Card, CardContent,
  Button, Divider
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
    <Card sx={{ position: 'sticky', top: 20 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Invoice Summary
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Invoice No
          </Typography>
          <Typography variant="body1">{invoiceNumber || 'Not set'}</Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Invoice Date
          </Typography>
          <Typography variant="body1">
            {formattedInvoiceDate}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Due Date
          </Typography>
          <Typography variant="body1">
            {formattedDueDate}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Billed To
          </Typography>
          <Typography variant="body1">
            {selectedClient ? (selectedClient.clientName || selectedClient.businessName) : 'Not selected'}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Items
          </Typography>
          <Typography variant="body1">{items.length}</Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Subtotal
          </Typography>
          <Typography variant="body1">
            {formatCurrency(subtotal)}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Tax
          </Typography>
          <Typography variant="body1">
            {formatCurrency(tax)}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Total Amount
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {formatCurrency(total)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<Save />}
            onClick={onSaveAndContinue}
          >
            Save & Continue
          </Button>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            startIcon={<Save />}
            onClick={onSaveDraft}
          >
            Save As Draft
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InvoiceSummary;