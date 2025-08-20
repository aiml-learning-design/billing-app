import React from 'react';
import {
  Box, Typography, Grid, Card, CardContent,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Checkbox, FormControlLabel, Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

/**
 * InvoiceDetails component for handling basic invoice information
 * 
 * @param {Object} props - Component props
 * @param {string} props.invoiceNumber - Invoice number
 * @param {Function} props.setInvoiceNumber - Function to update invoice number
 * @param {string} props.invoicePrefix - Custom prefix for invoice number
 * @param {Function} props.setInvoicePrefix - Function to update invoice prefix
 * @param {string} props.invoiceDelimiter - Delimiter between prefix and number
 * @param {Function} props.setInvoiceDelimiter - Function to update delimiter
 * @param {boolean} props.useCustomPrefix - Whether to use custom prefix
 * @param {Function} props.setUseCustomPrefix - Function to toggle custom prefix
 * @param {Object} props.invoiceDate - Invoice date (dayjs object)
 * @param {Function} props.setInvoiceDate - Function to update invoice date
 * @param {Object} props.dueDate - Due date (dayjs object)
 * @param {Function} props.setDueDate - Function to update due date
 * @param {string} props.currency - Currency code
 * @param {Function} props.setCurrency - Function to update currency
 * @param {string} props.lastInvoiceNumber - Last invoice number (for reference)
 * @param {string} props.lastInvoiceDate - Last invoice date (for reference)
 */
const InvoiceDetails = ({
  invoiceNumber,
  setInvoiceNumber,
  invoicePrefix,
  setInvoicePrefix,
  invoiceDelimiter,
  setInvoiceDelimiter,
  useCustomPrefix,
  setUseCustomPrefix,
  invoiceDate,
  setInvoiceDate,
  dueDate,
  setDueDate,
  currency,
  setCurrency,
  lastInvoiceNumber,
  lastInvoiceDate
}) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Invoice Details
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={useCustomPrefix}
                  onChange={(e) => setUseCustomPrefix(e.target.checked)}
                />
              }
              label="Use custom prefix for invoice number"
            />
          </Grid>
          
          {useCustomPrefix && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Invoice Prefix"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  fullWidth
                  margin="normal"
                  placeholder="Enter prefix (e.g. INV)"
                  helperText="Optional prefix for invoice numbers"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Delimiter</InputLabel>
                  <Select
                    value={invoiceDelimiter}
                    onChange={(e) => setInvoiceDelimiter(e.target.value)}
                    label="Delimiter"
                  >
                    <MenuItem value="-">Hyphen (-)</MenuItem>
                    <MenuItem value="/">Slash (/)</MenuItem>
                    <MenuItem value="_">Underscore (_)</MenuItem>
                    <MenuItem value=".">Dot (.)</MenuItem>
                    <MenuItem value="">None</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
            </>
          )}
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Invoice No*"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              fullWidth
              margin="normal"
            />
            {lastInvoiceNumber && lastInvoiceDate && (
              <Typography variant="caption" color="text.secondary">
                Last No: {lastInvoiceNumber} ({lastInvoiceDate})
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Invoice Date*"
              value={invoiceDate}
              onChange={(newValue) => {
                // Ensure we always pass a valid dayjs object or null
                const normalizedValue = newValue && dayjs(newValue).isValid() ? dayjs(newValue) : null;
                setInvoiceDate(normalizedValue);
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: "normal"
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Due Date"
              value={dueDate}
              onChange={(newValue) => {
                // Ensure we always pass a valid dayjs object or null
                const normalizedValue = newValue && dayjs(newValue).isValid() ? dayjs(newValue) : null;
                setDueDate(normalizedValue);
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: "normal"
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Currency*</InputLabel>
              <Select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                label="Currency*"
              >
                <MenuItem value="INR">Indian Rupee (INR, ₹)</MenuItem>
                <MenuItem value="USD">US Dollar (USD, $)</MenuItem>
                <MenuItem value="EUR">Euro (EUR, €)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default InvoiceDetails;