import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem,
  Button, Avatar, Divider, Autocomplete, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Snackbar, Alert
} from '@mui/material';
import { Add, Person, LocationOn, Email, Phone, Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

/**
 * ClientDetails component for handling the "Billed To" section of the invoice
 * 
 * @param {Object} props - Component props
 * @param {Array} props.clients - Array of client objects
 * @param {string} props.selectedClient - ID of the selected client
 * @param {Function} props.setSelectedClient - Function to update selected client
 * @param {Function} props.onAddNewClient - Function to handle add new client button click
 */
const ClientDetails = ({ 
  clients = [], 
  selectedClient, 
  setSelectedClient,
  onAddNewClient
}) => {
  const navigate = useNavigate();
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [newClientData, setNewClientData] = useState({
    clientName: '',
    businessName: '',
    gstin: '',
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
  const [inputValue, setInputValue] = useState('');
  
  // Get the selected client data
  const selectedClientData = clients.find(c => c.client_id === selectedClient);
  
  // Handle opening the new client dialog
  const handleOpenNewDialog = () => {
    setNewClientData({
      clientName: inputValue || '',
      businessName: inputValue || '',
      gstin: '',
      email: '',
      phone: '',
      addressLine: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    });
    setOpenNewDialog(true);
  };
  
  // Handle closing the new client dialog
  const handleCloseNewDialog = () => {
    setOpenNewDialog(false);
  };
  
  // Handle input changes in the new client form
  const handleNewClientInputChange = (e) => {
    const { name, value } = e.target;
    setNewClientData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle creating a new client
  const handleCreateClient = async () => {
    try {
      setSaving(true);
      
      // Prepare data for API
      const clientData = {
        clientName: newClientData.clientName || newClientData.businessName,
        businessName: newClientData.businessName,
        gstin: newClientData.gstin,
        email: newClientData.email,
        phone: newClientData.phone,
        address: {
          addressLine: newClientData.addressLine,
          city: newClientData.city,
          state: newClientData.state,
          pincode: newClientData.pincode,
          country: newClientData.country
        }
      };
      
      // Call API to create new client
      const response = await api.post('/api/clients', clientData);
      
      // Add the new client to the list and select it
      const newClient = response.data;
      
      // If setSelectedClient is provided, select the new client
      if (setSelectedClient) {
        setSelectedClient(newClient.client_id);
      }
      
      setAlert({
        open: true,
        message: 'New client created successfully',
        severity: 'success'
      });
      
      setOpenNewDialog(false);
    } catch (error) {
      console.error('Error creating client:', error);
      setAlert({
        open: true,
        message: 'Failed to create new client',
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
  
  // Handle add new client button click
  const handleAddNewClient = () => {
    if (onAddNewClient) {
      onAddNewClient();
    } else {
      handleOpenNewDialog();
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Billed To (Client's Details)
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
          <Autocomplete
            value={selectedClientData}
            onChange={(event, newValue) => {
              if (newValue && setSelectedClient) {
                setSelectedClient(newValue.client_id);
              }
            }}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
            }}
            options={clients}
            getOptionLabel={(option) => option.clientName || option.businessName || ''}
            isOptionEqualToValue={(option, value) => option.client_id === value.client_id}
            renderInput={(params) => (
              <TextField {...params} label="Client Name" variant="outlined" fullWidth />
            )}
            freeSolo
            fullWidth
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Divider sx={{ flexGrow: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>
              OR
            </Typography>
            <Divider sx={{ flexGrow: 1 }} />
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<Add />}
            sx={{ mt: 1 }}
            onClick={handleAddNewClient}
          >
            Add New Client
          </Button>
        </Box>

        {selectedClientData && (
          <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 1, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ mr: 2 }}>
                <Person />
              </Avatar>
              <Typography variant="subtitle1" fontWeight="bold">
                {selectedClientData.clientName || selectedClientData.businessName}
              </Typography>
            </Box>

            {selectedClientData.address && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn color="action" sx={{ mr: 1, fontSize: 'small' }} />
                <Typography variant="body2">
                  {selectedClientData.address.addressLine}, {selectedClientData.address.city},
                  {selectedClientData.address.state} - {selectedClientData.address.pincode}
                </Typography>
              </Box>
            )}

            {selectedClientData.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Email color="action" sx={{ mr: 1, fontSize: 'small' }} />
                <Typography variant="body2">
                  {selectedClientData.email}
                </Typography>
              </Box>
            )}

            {selectedClientData.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Phone color="action" sx={{ mr: 1, fontSize: 'small' }} />
                <Typography variant="body2">
                  {selectedClientData.phone}
                </Typography>
              </Box>
            )}

            {selectedClientData.gstin && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                <Box component="span" fontWeight="bold">GSTIN:</Box> {selectedClientData.gstin}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
      
      {/* New Client Dialog */}
      <Dialog open={openNewDialog} onClose={handleCloseNewDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Client</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            Enter your client details below. These details will be used in the "Billed To" section of your invoices.
          </Typography>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Client Name"
                name="clientName"
                value={newClientData.clientName}
                onChange={handleNewClientInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Business Name"
                name="businessName"
                value={newClientData.businessName}
                onChange={handleNewClientInputChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="GSTIN"
                name="gstin"
                value={newClientData.gstin}
                onChange={handleNewClientInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                name="email"
                value={newClientData.email}
                onChange={handleNewClientInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                name="phone"
                value={newClientData.phone}
                onChange={handleNewClientInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Address Line"
                name="addressLine"
                value={newClientData.addressLine}
                onChange={handleNewClientInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="City"
                name="city"
                value={newClientData.city}
                onChange={handleNewClientInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="State"
                name="state"
                value={newClientData.state}
                onChange={handleNewClientInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Pincode"
                name="pincode"
                value={newClientData.pincode}
                onChange={handleNewClientInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateClient} 
            variant="contained" 
            color="primary"
            disabled={saving || !newClientData.businessName}
            startIcon={saving ? <CircularProgress size={20} /> : <Add />}
          >
            {saving ? 'Creating...' : 'Create Client'}
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

export default ClientDetails;