import React from 'react';
import {
  Box, Typography, Grid, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem,
  TextField, FormControlLabel, Checkbox
} from '@mui/material';

/**
 * ShippingDetails component for handling shipping information
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.showShipping - Whether to show shipping details
 * @param {Function} props.setShowShipping - Function to toggle shipping details visibility
 * @param {Array} props.warehouses - Array of warehouse objects
 * @param {Object} props.shippingFrom - Shipping from details
 * @param {Function} props.setShippingFrom - Function to update shipping from details
 * @param {Object} props.shippingTo - Shipping to details
 * @param {Function} props.setShippingTo - Function to update shipping to details
 * @param {Object} props.selectedClient - Selected client object (for same as client's address option)
 */
const ShippingDetails = ({
  showShipping,
  setShowShipping,
  warehouses = [],
  shippingFrom,
  setShippingFrom,
  shippingTo,
  setShippingTo,
  selectedClient
}) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Shipping Details
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={showShipping}
                onChange={(e) => setShowShipping(e.target.checked)}
              />
            }
            label="Enable Shipping Details"
          />
        </Box>

        {showShipping && (
          <Grid container spacing={2}>
            {/* Shipped From Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Shipped From
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Warehouse</InputLabel>
                <Select
                  value={shippingFrom.warehouse || ''}
                  onChange={(e) => setShippingFrom({ ...shippingFrom, warehouse: e.target.value })}
                  label="Select Warehouse"
                >
                  <MenuItem value="">
                    <em>Same as your business address</em>
                  </MenuItem>
                  {warehouses.map(warehouse => (
                    <MenuItem key={warehouse.warehouse_id} value={warehouse.warehouse_id}>
                      {warehouse.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Address"
                value={shippingFrom.address || ''}
                onChange={(e) => setShippingFrom({ ...shippingFrom, address: e.target.value })}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="City"
                value={shippingFrom.city || ''}
                onChange={(e) => setShippingFrom({ ...shippingFrom, city: e.target.value })}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Postal Code"
                value={shippingFrom.postalCode || ''}
                onChange={(e) => setShippingFrom({ ...shippingFrom, postalCode: e.target.value })}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="State"
                value={shippingFrom.state || ''}
                onChange={(e) => setShippingFrom({ ...shippingFrom, state: e.target.value })}
                fullWidth
                margin="normal"
              />
            </Grid>

            {/* Shipped To Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                Shipped To
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Select a Shipping Address</InputLabel>
                <Select
                  value={shippingTo.address || ''}
                  onChange={(e) => setShippingTo({ ...shippingTo, address: e.target.value })}
                  label="Select a Shipping Address"
                >
                  <MenuItem value="">
                    <em>Same as client's address</em>
                  </MenuItem>
                  {/* Add additional shipping addresses if available */}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Client's business name"
                value={selectedClient?.businessName || selectedClient?.clientName || ''}
                disabled
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="City"
                value={shippingTo.city || ''}
                onChange={(e) => setShippingTo({ ...shippingTo, city: e.target.value })}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Postal Code"
                value={shippingTo.postalCode || ''}
                onChange={(e) => setShippingTo({ ...shippingTo, postalCode: e.target.value })}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="State"
                value={shippingTo.state || ''}
                onChange={(e) => setShippingTo({ ...shippingTo, state: e.target.value })}
                fullWidth
                margin="normal"
              />
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default ShippingDetails;