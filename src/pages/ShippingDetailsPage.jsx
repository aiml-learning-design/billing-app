import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  Box, Typography, Grid, TextField, Button,
  CircularProgress, Snackbar, Alert, Paper,
  Tabs, Tab, Divider, Card, CardContent,
  List, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Save, Add, Delete, Edit, LocationOn } from '@mui/icons-material';

/**
 * ShippingDetailsPage for managing shipping addresses and warehouses
 */
const ShippingDetailsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    email: '',
    phone: '',
    isDefault: false
  });

  // Load businesses and warehouses data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          // Fetch businesses
          if (user.businesses && user.businesses.length > 0) {
            setBusinesses(user.businesses);
            const defaultBusiness = user.businesses[0];
            setSelectedBusiness(defaultBusiness);
            
            // Fetch warehouses for the selected business
            const warehousesRes = await api.get(`/api/warehouses?businessId=${defaultBusiness.business_id}`);
            setWarehouses(warehousesRes.data || []);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setAlert({
          open: true,
          message: 'Failed to load shipping data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Handle business change
  const handleBusinessChange = async (event) => {
    const businessId = event.target.value;
    const business = businesses.find(b => b.business_id === businessId);
    
    if (business) {
      setSelectedBusiness(business);
      setLoading(true);
      
      try {
        // Fetch warehouses for the selected business
        const warehousesRes = await api.get(`/api/warehouses?businessId=${businessId}`);
        setWarehouses(warehousesRes.data || []);
        setSelectedWarehouse(null);
      } catch (error) {
        console.error('Error fetching warehouses:', error);
        setAlert({
          open: true,
          message: 'Failed to load warehouses',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isDefault' ? checked : value
    }));
  };

  // Open dialog to add new warehouse
  const handleAddWarehouse = () => {
    setFormData({
      name: '',
      addressLine: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      email: '',
      phone: '',
      isDefault: false
    });
    setDialogMode('add');
    setOpenDialog(true);
  };

  // Open dialog to edit warehouse
  const handleEditWarehouse = (warehouse) => {
    setFormData({
      name: warehouse.name || '',
      addressLine: warehouse.addressLine || '',
      city: warehouse.city || '',
      state: warehouse.state || '',
      pincode: warehouse.pincode || '',
      country: warehouse.country || 'India',
      email: warehouse.email || '',
      phone: warehouse.phone || '',
      isDefault: warehouse.isDefault || false
    });
    setSelectedWarehouse(warehouse);
    setDialogMode('edit');
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle form submission
  const handleSubmit = async () => {
    setSaving(true);

    try {
      if (!selectedBusiness) {
        throw new Error('No business selected');
      }

      const warehouseData = {
        ...formData,
        businessId: selectedBusiness.business_id
      };

      let response;
      if (dialogMode === 'add') {
        // Create new warehouse
        response = await api.post('/api/warehouses', warehouseData);
        setWarehouses([...warehouses, response.data]);
        setAlert({
          open: true,
          message: 'Warehouse added successfully',
          severity: 'success'
        });
      } else {
        // Update existing warehouse
        response = await api.put(`/api/warehouses/${selectedWarehouse.warehouse_id}`, warehouseData);
        
        // Update warehouses list
        const updatedWarehouses = warehouses.map(warehouse => 
          warehouse.warehouse_id === selectedWarehouse.warehouse_id ? response.data : warehouse
        );
        setWarehouses(updatedWarehouses);
        
        setAlert({
          open: true,
          message: 'Warehouse updated successfully',
          severity: 'success'
        });
      }

      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving warehouse:', error);
      setAlert({
        open: true,
        message: `Failed to ${dialogMode === 'add' ? 'add' : 'update'} warehouse`,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle warehouse deletion
  const handleDeleteWarehouse = async (warehouseId) => {
    try {
      await api.delete(`/api/warehouses/${warehouseId}`);
      
      // Update warehouses list
      setWarehouses(warehouses.filter(warehouse => warehouse.warehouse_id !== warehouseId));
      
      setAlert({
        open: true,
        message: 'Warehouse deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      setAlert({
        open: true,
        message: 'Failed to delete warehouse',
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
        Shipping Details
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Select Business</InputLabel>
            <Select
              value={selectedBusiness?.business_id || ''}
              onChange={handleBusinessChange}
              label="Select Business"
            >
              {businesses.map(business => (
                <MenuItem key={business.business_id} value={business.business_id}>
                  {business.businessName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Warehouses & Shipping Locations
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleAddWarehouse}
          >
            Add Warehouse
          </Button>
        </Box>

        {warehouses.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No warehouses found. Add a warehouse to get started.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {warehouses.map(warehouse => (
              <Grid item xs={12} md={6} key={warehouse.warehouse_id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        {warehouse.name}
                        {warehouse.isDefault && (
                          <Typography component="span" variant="caption" sx={{ ml: 1, color: 'primary.main' }}>
                            (Default)
                          </Typography>
                        )}
                      </Typography>
                      <Box>
                        <IconButton onClick={() => handleEditWarehouse(warehouse)}>
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteWarehouse(warehouse.warehouse_id)} color="error">
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocationOn fontSize="small" sx={{ mr: 1 }} />
                              <Typography variant="body2">Address</Typography>
                            </Box>
                          }
                          secondary={
                            warehouse.addressLine ? 
                            `${warehouse.addressLine}, ${warehouse.city || ''}, ${warehouse.state || ''} - ${warehouse.pincode || ''}` :
                            'Not provided'
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Email" 
                          secondary={warehouse.email || 'Not provided'} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Phone" 
                          secondary={warehouse.phone || 'Not provided'} 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Add/Edit Warehouse Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Warehouse' : 'Edit Warehouse'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Warehouse Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    name="isDefault"
                  />
                }
                label="Set as Default Warehouse"
                sx={{ mt: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Address Line"
                name="addressLine"
                value={formData.addressLine}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                name="phone"
                value={formData.phone}
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
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default ShippingDetailsPage;