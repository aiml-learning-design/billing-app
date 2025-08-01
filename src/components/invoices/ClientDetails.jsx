import React from 'react';
import {
  Box, Typography, Grid, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem,
  Button, Avatar, Divider
} from '@mui/material';
import { Add, Person, LocationOn, Email, Phone } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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

  const handleAddNewClient = () => {
    if (onAddNewClient) {
      onAddNewClient();
    } else {
      navigate('/clients/new');
    }
  };

  const selectedClientData = clients.find(c => c.client_id === selectedClient);

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Billed To (Client's Details)
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel>Select a Client</InputLabel>
          <Select
            value={selectedClient || ''}
            onChange={(e) => setSelectedClient(e.target.value)}
            label="Select a Client"
          >
            <MenuItem value="">
              <em>Select Client/Business from the list</em>
            </MenuItem>
            {clients.map(client => (
              <MenuItem key={client.client_id} value={client.client_id}>
                {client.clientName || client.businessName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ textAlign: 'center', my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
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
    </Card>
  );
};

export default ClientDetails;