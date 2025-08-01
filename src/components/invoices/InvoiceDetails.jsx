import React from 'react';
import {
  Box, Typography, Grid, Card, CardContent,
  TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

/**
 * InvoiceDetails component for handling basic invoice information
 * 
 * @param {Object} props - Component props
 * @param {string} props.invoiceNumber - Invoice number
 * @param {Function} props.setInvoiceNumber - Function to update invoice number
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