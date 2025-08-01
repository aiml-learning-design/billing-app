import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  Box, Typography, Grid, TextField, Button,
  CircularProgress, Snackbar, Alert, Paper,
  Tabs, Tab, Divider, IconButton, Card, CardContent,
  List, ListItem, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import { Save, Add, Delete, Edit, Business } from '@mui/icons-material';

/**
 * BusinessDetailsPage for managing business information
 */
const BusinessDetailsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [currentBusiness, setCurrentBusiness] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
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

  // Load businesses data
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        if (user) {
          // Assuming user.businesses is available from the auth context
          if (user.businesses && user.businesses.length > 0) {
            setBusinesses(user.businesses);
            setCurrentBusiness(user.businesses[0]);
            
            // Initialize form with first business data
            const business = user.businesses[0];
            const address = business.officeAddresses && business.officeAddresses.length > 0 
              ? business.officeAddresses[0] 
              : {};
              
            setFormData({
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
          }
        }
      } catch (error) {
        console.error('Error fetching businesses:', error);
        setAlert({
          open: true,
          message: 'Failed to load business data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [user]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    if (businesses[newValue]) {
      const business = businesses[newValue];
      setCurrentBusiness(business);
      
      const address = business.officeAddresses && business.officeAddresses.length > 0 
        ? business.officeAddresses[0] 
        : {};
        
      setFormData({
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
      
      setEditMode(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle edit mode
  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Prepare data for API
      const businessData = {
        businessId: currentBusiness.business_id,
        businessName: formData.businessName,
        gstin: formData.gstin,
        pan: formData.pan,
        officeAddress: {
          email: formData.email,
          phone: formData.phone,
          addressLine: formData.addressLine,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country
        }
      };

      // Call API to update business
      const response = await api.put(`/api/businesses/${currentBusiness.business_id}`, businessData);
      
      // Update local state
      const updatedBusinesses = businesses.map(business => 
        business.business_id === currentBusiness.business_id ? response.data : business
      );
      
      setBusinesses(updatedBusinesses);
      setCurrentBusiness(response.data);
      setEditMode(false);

      setAlert({
        open: true,
        message: 'Business details updated successfully',
        severity: 'success'
      });
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

  // Handle creating a new business
  const handleAddBusiness = async () => {
    try {
      // Call API to create a new business
      const response = await api.post('/api/businesses', {
        businessName: 'New Business',
        userId: user.id
      });
      
      // Update local state
      setBusinesses([...businesses, response.data]);
      setSelectedTab(businesses.length);
      setCurrentBusiness(response.data);
      
      // Initialize form with new business data
      setFormData({
        businessName: 'New Business',
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
      
      setEditMode(true);
    } catch (error) {
      console.error('Error creating business:', error);
      setAlert({
        open: true,
        message: 'Failed to create new business',
        severity: 'error'
      });
    }
  };

  // Handle alert close
  const handleAlertClose = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Business Details
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {businesses.map((business, index) => (
            <Tab key={business.business_id} label={business.businessName} />
          ))}
          <Tab 
            icon={<Add />} 
            aria-label="add business" 
            onClick={handleAddBusiness}
          />
        </Tabs>
      </Box>

      {currentBusiness && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              {currentBusiness.businessName}
            </Typography>
            <Button
              variant={editMode ? "contained" : "outlined"}
              color={editMode ? "secondary" : "primary"}
              onClick={handleToggleEditMode}
              startIcon={editMode ? <Business /> : <Edit />}
            >
              {editMode ? 'View Mode' : 'Edit Mode'}
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {editMode ? (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Business Information
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Business Name"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="GSTIN"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="PAN"
                    name="pan"
                    value={formData.pan}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Address Information
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Address Line"
                    name="addressLine"
                    value={formData.addressLine}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<Save />}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Business Information
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="Business Name" 
                          secondary={currentBusiness.businessName} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="GSTIN" 
                          secondary={currentBusiness.gstin || 'Not provided'} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="PAN" 
                          secondary={currentBusiness.pan || 'Not provided'} 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Contact Information
                    </Typography>
                    {currentBusiness.officeAddresses && currentBusiness.officeAddresses.length > 0 ? (
                      <List>
                        <ListItem>
                          <ListItemText 
                            primary="Email" 
                            secondary={currentBusiness.officeAddresses[0].email || 'Not provided'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Phone" 
                            secondary={currentBusiness.officeAddresses[0].phone || 'Not provided'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Address" 
                            secondary={
                              currentBusiness.officeAddresses[0].addressLine ? 
                              `${currentBusiness.officeAddresses[0].addressLine}, ${currentBusiness.officeAddresses[0].city || ''}, ${currentBusiness.officeAddresses[0].state || ''} - ${currentBusiness.officeAddresses[0].pincode || ''}` :
                              'Not provided'
                            } 
                          />
                        </ListItem>
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No contact information available
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Paper>
      )}

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
    </Box>
  );
};

export default BusinessDetailsPage;