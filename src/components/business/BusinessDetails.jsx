import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent,
  Avatar, Button, FormControl, InputLabel, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Snackbar, Alert
} from '@mui/material';
import { Business, Edit, Save } from '@mui/icons-material';
import api from '../../services/api';

/**
 * BusinessDetails component for displaying business information in the "Billed By" section
 * 
 * @param {Object} props - Component props
 * @param {Object} props.business - Currently selected business object with details
 * @param {Array} props.businesses - Array of all available businesses
 * @param {Function} props.onBusinessChange - Function to handle business selection change
 * @param {Function} props.onEdit - Function to handle edit button click
 * @param {Function} props.onBusinessUpdate - Function to handle business update
 */
const BusinessDetails = ({ 
  business, 
  businesses = [], 
  onBusinessChange, 
  onEdit,
  onBusinessUpdate 
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    businessName: '',
    gstin: '',
    pan: '',
    email: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  // Open edit dialog
  const handleOpenEditDialog = () => {
    if (business) {
      const address = business.officeAddresses && business.officeAddresses.length > 0 
        ? business.officeAddresses[0] 
        : {};
        
      setEditFormData({
        businessName: business.businessName || '',
        gstin: business.gstin || '',
        pan: business.pan || '',
        email: address.email || '',
        phone: address.phone || '',
        addressLine: address.addressLine || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
        country: address.country || 'India'
      });
      setOpenDialog(true);
    }
  };

  // Close edit dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle input changes in edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setSaving(true);
      
      // Prepare data for API
      const businessData = {
        businessId: business.business_id,
        businessName: editFormData.businessName,
        gstin: editFormData.gstin,
        pan: editFormData.pan,
        officeAddress: {
          email: editFormData.email,
          phone: editFormData.phone,
          addressLine: editFormData.addressLine,
          city: editFormData.city,
          state: editFormData.state,
          pincode: editFormData.pincode,
          country: editFormData.country
        }
      };

      // Call API to update business
      const response = await api.put(`/api/businesses/${business.business_id}`, businessData);
      
      // Update local state
      if (onBusinessUpdate) {
        onBusinessUpdate(response.data);
      }
      
      setAlert({
        open: true,
        message: 'Business details updated successfully',
        severity: 'success'
      });
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Error updating business:', error);
      setAlert({
        open: true,
        message: 'Failed to update business details',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle alert close
  const handleAlertClose = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  if (!business) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Billed By (Your Details)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No business selected
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Billed By (Your Details)
          </Typography>
          <Box>
            <Button 
              startIcon={<Edit />} 
              onClick={handleOpenEditDialog}
              variant="outlined"
              size="small"
              sx={{ ml: 1 }}
            >
              Quick Edit
            </Button>
            {onEdit && (
              <Button 
                startIcon={<Edit />} 
                onClick={onEdit}
                variant="outlined"
                size="small"
                sx={{ ml: 1 }}
              >
                Full Edit
              </Button>
            )}
          </Box>
        </Box>

        {businesses.length > 1 && (
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Business</InputLabel>
            <Select
              value={business.business_id || ''}
              onChange={(e) => {
                const selectedBusiness = businesses.find(b => b.business_id === e.target.value);
                if (selectedBusiness && onBusinessChange) {
                  onBusinessChange(selectedBusiness);
                }
              }}
              label="Select Business"
            >
              {businesses.map(b => (
                <MenuItem key={b.business_id} value={b.business_id}>
                  {b.businessName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 1, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ mr: 2 }}>
              <Business />
            </Avatar>
            <Typography variant="subtitle1" fontWeight="bold">
              {business.businessName}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {business.officeAddresses && business.officeAddresses.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="body2">
                  {business.officeAddresses[0].addressLine}, {business.officeAddresses[0].city},
                  {business.officeAddresses[0].state} - {business.officeAddresses[0].pincode}
                </Typography>
              </Grid>
            )}
            
            {business.gstin && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <Box component="span" fontWeight="bold">GSTIN:</Box> {business.gstin}
                </Typography>
              </Grid>
            )}
            
            {business.pan && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <Box component="span" fontWeight="bold">PAN:</Box> {business.pan}
                </Typography>
              </Grid>
            )}
            
            {business.officeAddresses && business.officeAddresses.length > 0 && business.officeAddresses[0].email && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <Box component="span" fontWeight="bold">Email:</Box> {business.officeAddresses[0].email}
                </Typography>
              </Grid>
            )}
            
            {business.officeAddresses && business.officeAddresses.length > 0 && business.officeAddresses[0].phone && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <Box component="span" fontWeight="bold">Phone:</Box> {business.officeAddresses[0].phone}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </CardContent>

      {/* Edit Business Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Business Details</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Business Name"
                name="businessName"
                value={editFormData.businessName}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="GSTIN"
                name="gstin"
                value={editFormData.gstin}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="PAN"
                name="pan"
                value={editFormData.pan}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                name="email"
                value={editFormData.email}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                name="phone"
                value={editFormData.phone}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Address Line"
                name="addressLine"
                value={editFormData.addressLine}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="City"
                name="city"
                value={editFormData.city}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="State"
                name="state"
                value={editFormData.state}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Pincode"
                name="pincode"
                value={editFormData.pincode}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <Save />}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleAlertClose} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default BusinessDetails;