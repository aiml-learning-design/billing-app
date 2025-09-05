import React from 'react';
import {
  Box, Typography, Grid, Card, CardContent,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Checkbox, FormControlLabel, Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

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
        {/* First row: Invoice Details title centered */}
        <Grid container justifyContent="center" sx={{ mb: 2 }}>
          <Grid item>
            <Typography variant="h6" gutterBottom>
              Invoice Details
            </Typography>
          </Grid>
        </Grid>

        {/* Second row: Use custom prefix checkbox (small font) */}
        <Grid container justifyContent="left" sx={{ mb: 2 }}>
          <Grid item>
            <FormControlLabel
              control={
                <Checkbox
                  checked={useCustomPrefix}
                  onChange={(e) => setUseCustomPrefix(e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="body2">
                  Use custom prefix for invoice number
                </Typography>
              }
            />
          </Grid>
        </Grid>

<Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

        {/* Custom prefix fields (if enabled) */}
        {useCustomPrefix && (
          <>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Invoice Prefix"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  fullWidth
                  margin="normal"
                  size="small"
                  placeholder="Enter prefix (e.g. INV)"
                  helperText="Optional prefix for invoice numbers"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" size="small">
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
            </Grid>
          </>
        )}

        {/* Third row: Invoice No, Invoice Date, Due Date, Currency */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Invoice No*"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              fullWidth
              margin="normal"
              size="small"
            />
            {lastInvoiceNumber && lastInvoiceDate && (
              <Typography variant="caption" color="text.secondary">
                Last No: {lastInvoiceNumber} ({lastInvoiceDate})
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={3}>
            <DatePicker
              label="Invoice Date*"
              value={invoiceDate}
              onChange={(newValue) => {
                const normalizedValue = newValue && dayjs(newValue).isValid() ? dayjs(newValue) : null;
                setInvoiceDate(normalizedValue);
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: "normal",
                  size: "small"
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <DatePicker
              label="Due Date"
              value={dueDate}
              onChange={(newValue) => {
                const normalizedValue = newValue && dayjs(newValue).isValid() ? dayjs(newValue) : null;
                setDueDate(normalizedValue);
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: "normal",
                  size: "small"
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Currency*</InputLabel>
              <Select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                label="Currency*"
              >
                <MenuItem value="INR">Indian Rupee (INR, ₹)</MenuItem>
                <MenuItem value="USD">US Dollar (USD, $)</MenuItem>
                <MenuItem value="EUR">Euro (EUR, €)</MenuItem>
                <MenuItem value="GBP">British Pound (GBP, £)</MenuItem>
                <MenuItem value="AUD">Australian Dollar (AUD, A$)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

      </CardContent>
    </Card>
  );
};

export default InvoiceDetails;