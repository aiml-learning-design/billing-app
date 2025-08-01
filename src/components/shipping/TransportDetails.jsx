import React from 'react';
import {
  Box, Typography, Grid, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem,
  TextField, FormControlLabel, Checkbox,
  Button, InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

/**
 * TransportDetails component for handling transport information
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.showTransport - Whether to show transport details
 * @param {Function} props.setShowTransport - Function to toggle transport details visibility
 * @param {Array} props.transporters - Array of transporter objects
 * @param {Object} props.transportDetails - Transport details object
 * @param {Function} props.setTransportDetails - Function to update transport details
 */
const TransportDetails = ({
  showTransport,
  setShowTransport,
  transporters = [],
  transportDetails,
  setTransportDetails
}) => {
  // Helper function to update a specific field in transportDetails
  const handleTransportChange = (field, value) => {
    setTransportDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Transport Details
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={showTransport}
                onChange={(e) => setShowTransport(e.target.checked)}
              />
            }
            label="Enable Transport Details"
          />
        </Box>

        {showTransport && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Transporter Details</InputLabel>
                <Select
                  value={transportDetails.transporter || ''}
                  onChange={(e) => handleTransportChange('transporter', e.target.value)}
                  label="Transporter Details"
                >
                  <MenuItem value="">
                    <em>Select Transporter</em>
                  </MenuItem>
                  {transporters.map(transporter => (
                    <MenuItem key={transporter.transporter_id} value={transporter.transporter_id}>
                      {transporter.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Distance (in Km)"
                value={transportDetails.distance || ''}
                onChange={(e) => handleTransportChange('distance', e.target.value)}
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button size="small">Calculate distance here</Button>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            {/* Mode of Transport */}
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!transportDetails.mode}
                    onChange={(e) => {
                      if (!e.target.checked) {
                        handleTransportChange('mode', '');
                      }
                    }}
                  />
                }
                label="Add Mode of Transport"
              />
              {transportDetails.mode !== undefined && (
                <TextField
                  label="Mode of Transport"
                  value={transportDetails.mode || ''}
                  onChange={(e) => handleTransportChange('mode', e.target.value)}
                  fullWidth
                  margin="normal"
                />
              )}
            </Grid>
            
            {/* Transport Doc No */}
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!transportDetails.docNo}
                    onChange={(e) => {
                      if (!e.target.checked) {
                        handleTransportChange('docNo', '');
                      }
                    }}
                  />
                }
                label="Add Transport Doc No"
              />
              {transportDetails.docNo !== undefined && (
                <TextField
                  label="Transport Doc No"
                  value={transportDetails.docNo || ''}
                  onChange={(e) => handleTransportChange('docNo', e.target.value)}
                  fullWidth
                  margin="normal"
                />
              )}
            </Grid>
            
            {/* Transport Doc Date */}
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!transportDetails.docDate}
                    onChange={(e) => {
                      if (!e.target.checked) {
                        handleTransportChange('docDate', null);
                      } else {
                        handleTransportChange('docDate', dayjs());
                      }
                    }}
                  />
                }
                label="Add Transport Doc Date"
              />
              {transportDetails.docDate && (
                <DatePicker
                  label="Transport Doc Date"
                  value={transportDetails.docDate}
                  onChange={(newValue) => {
                    // Ensure we always pass a valid dayjs object or null
                    const normalizedValue = newValue && dayjs(newValue).isValid() ? dayjs(newValue) : null;
                    handleTransportChange('docDate', normalizedValue);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: "normal"
                    }
                  }}
                />
              )}
            </Grid>
            
            {/* Vehicle Type */}
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!transportDetails.vehicleType}
                    onChange={(e) => {
                      if (!e.target.checked) {
                        handleTransportChange('vehicleType', '');
                      }
                    }}
                  />
                }
                label="Vehicle Type"
              />
              {transportDetails.vehicleType !== undefined && (
                <TextField
                  label="Vehicle Type"
                  value={transportDetails.vehicleType || ''}
                  onChange={(e) => handleTransportChange('vehicleType', e.target.value)}
                  fullWidth
                  margin="normal"
                />
              )}
            </Grid>
            
            {/* Vehicle Number */}
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!transportDetails.vehicleNumber}
                    onChange={(e) => {
                      if (!e.target.checked) {
                        handleTransportChange('vehicleNumber', '');
                      }
                    }}
                  />
                }
                label="Vehicle Number"
              />
              {transportDetails.vehicleNumber !== undefined && (
                <TextField
                  label="Vehicle Number"
                  value={transportDetails.vehicleNumber || ''}
                  onChange={(e) => handleTransportChange('vehicleNumber', e.target.value)}
                  fullWidth
                  margin="normal"
                />
              )}
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default TransportDetails;