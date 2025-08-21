import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem,
  Button, Avatar, Divider, Autocomplete, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Snackbar, Alert, IconButton, InputAdornment
} from '@mui/material';
import { Add, Person, LocationOn, Email, Phone, Save, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import axios from 'axios';
import countries from '../../utils/countries';
import countryStates from '../../utils/countryStates';
import { debounce } from 'lodash';

/**
 * ClientDetailsNoApi component for handling the "Billed To" section of the invoice
 * This version doesn't make API calls for client data, instead uses the provided clients prop
 * 
 * @param {Object} props - Component props
 * @param {Array} props.clients - Array of client objects (used as data source)
 * @param {string} props.selectedClient - ID of the selected client
 * @param {Function} props.setSelectedClient - Function to update selected client
 * @param {Function} props.onAddNewClient - Function to handle add new client button click
 */
const ClientDetailsNoApi = ({ 
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
    country: 'India',
    additionalDetails: []
  });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [inputValue, setInputValue] = useState('');
  
  // Country detection states
  const [countryCode, setCountryCode] = useState('in');
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [geoLocationLoading, setGeoLocationLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState(null);
  const [pincodeSuccess, setPincodeSuccess] = useState(false);
  
  // Autocomplete states
  const [clientOptions, setClientOptions] = useState(clients);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  
  // Get the selected client data
  const selectedClientData = clientOptions.find(c => c.client_id === selectedClient);
  
  // Function to filter clients based on search term (local filtering, no API call)
  const filterClients = (searchTerm) => {
    if (!searchTerm) {
      return clients;
    }
    
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return clients.filter(client => {
      const clientName = (client.clientName || '').toLowerCase();
      const businessName = (client.businessName || '').toLowerCase();
      const email = (client.email || '').toLowerCase();
      
      return clientName.includes(lowerCaseSearchTerm) || 
             businessName.includes(lowerCaseSearchTerm) || 
             email.includes(lowerCaseSearchTerm);
    });
  };
  
  // Create a debounced version of filterClients
  const debouncedFilterClients = useCallback(
    debounce((searchTerm) => {
      const filteredClients = filterClients(searchTerm);
      setClientOptions(filteredClients);
      setLoading(false);
    }, 300),
    [clients]
  );
  
  // Effect to filter clients when input value changes
  useEffect(() => {
    if (open) {
      setLoading(true);
      debouncedFilterClients(inputValue);
    }
  }, [inputValue, open, debouncedFilterClients]);
  
  // Effect to initialize client options with provided clients
  useEffect(() => {
    if (clients.length > 0) {
      setClientOptions(clients);
    }
  }, [clients]);
  
  // Fetch user's location and set country defaults
  const fetchLocationData = async () => {
    try {
      setGeoLocationLoading(true);
      const response = await axios.get('https://ipapi.co/json/');
      const userData = response.data;
      console.log("Location data from ipapi.co:", userData);

      // Set UAE as default for testing (or use any other default as needed)
      if (userData?.country_code === 'AE' || userData?.country_name === 'United Arab Emirates') {
        console.log("UAE detected, setting as default country");
        const uaeCountry = countries.find(c => c.code === 'AE');
        if (uaeCountry) {
          setSelectedCountry(uaeCountry.name);
          setCountryCode('ae');
          setNewClientData(prev => ({
            ...prev,
            country: uaeCountry.name
          }));
          return;
        }
      }

      const countryNames = countries.map(c => c.name);

      if (userData?.country_name && countryNames.includes(userData.country_name)) {
        console.log(`Setting country to ${userData.country_name}`);
        setSelectedCountry(userData.country_name);
        const detectedCountryCode = userData.country_code.toLowerCase();
        setCountryCode(detectedCountryCode);

        // Update country with the detected country
        setNewClientData(prev => ({
          ...prev,
          country: userData.country_name
        }));
      } else if (userData?.country_code) {
        // Try to find country by code if name doesn't match
        const countryByCode = countries.find(c => c.code === userData.country_code.toUpperCase());
        if (countryByCode) {
          console.log(`Found country by code: ${countryByCode.name}`);
          setSelectedCountry(countryByCode.name);
          setCountryCode(userData.country_code.toLowerCase());
          setNewClientData(prev => ({
            ...prev,
            country: countryByCode.name
          }));
        } else {
          // Default to India if no match found
          const defaultCountry = countries.find(c => c.code === 'IN') || countries.find(c => c.name === 'India');
          console.log(`No matching country found, defaulting to ${defaultCountry.name}`);
          setSelectedCountry(defaultCountry.name);
          setCountryCode(defaultCountry.code.toLowerCase());
          setNewClientData(prev => ({
            ...prev,
            country: defaultCountry.name
          }));
        }
      } else {
        // Default to India if no country data
        const defaultCountry = countries.find(c => c.code === 'IN') || countries.find(c => c.name === 'India');
        console.log(`No country data, defaulting to ${defaultCountry.name}`);
        setSelectedCountry(defaultCountry.name);
        setCountryCode(defaultCountry.code.toLowerCase());
        setNewClientData(prev => ({
          ...prev,
          country: defaultCountry.name
        }));
      }
    } catch (error) {
      console.error("Failed to fetch location data", error);
      // Default to India if error
      const defaultCountry = countries.find(c => c.code === 'IN') || countries.find(c => c.name === 'India');
      console.log(`Error fetching location, defaulting to ${defaultCountry.name}`);
      setSelectedCountry(defaultCountry.name);
      setCountryCode(defaultCountry.code.toLowerCase());
      setNewClientData(prev => ({
        ...prev,
        country: defaultCountry.name
      }));
    } finally {
      setGeoLocationLoading(false);
    }
  };

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
      country: 'India',
      additionalDetails: []
    });
    setOpenNewDialog(true);
    
    // Fetch location data when dialog opens
    fetchLocationData();
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
    
    // If country changes, update the country code
    if (name === 'country') {
      const country = countries.find(c => c.name === value);
      if (country) {
        setCountryCode(country.code.toLowerCase());
        
        // Reset state if country changes
        if (prev.country !== value) {
          setNewClientData(prev => ({
            ...prev,
            state: ''
          }));
        }
      }
    }
    
    // If pincode changes and is of sufficient length, trigger lookup
    if (name === 'pincode' && value.length >= 5) {
      handlePincodeLookup(value);
    }
  };
  
  // Handle pincode lookup
  const handlePincodeLookup = async (pincode) => {
    // Validate pincode format based on country
    if (!pincode) return;

    // Reset success state
    setPincodeSuccess(false);

    console.log(`Looking up pincode: ${pincode} for country code: ${countryCode}`);

    // Different countries have different pincode formats
    // For simplicity, we'll just check minimum length
    const minLength = countryCode === 'us' ? 5 :
                      countryCode === 'ca' ? 6 :
                      countryCode === 'gb' ? 5 :
                      countryCode === 'au' ? 4 :
                      countryCode === 'ae' ? 5 : 5;

    if (pincode.length < minLength) return;

    try {
      setPincodeLoading(true);
      setPincodeError(null);

      // Use the country code to determine which API endpoint to use
      // Default to 'in' (India) if no country code is set
      const countryCodeForApi = countryCode || 'in';

      console.log(`Using country code for API: ${countryCodeForApi}`);

      // Format the pincode based on country requirements
      let formattedPincode = pincode;

      // Special handling for certain countries
      if (countryCodeForApi === 'ca') {
        // Canadian postal codes are in format A1A 1A1, but API needs them without spaces
        formattedPincode = pincode.replace(/\s/g, '');
      } else if (countryCodeForApi === 'gb') {
        // UK postcodes may need special handling
        formattedPincode = pincode.replace(/\s/g, '');
      } else if (countryCodeForApi === 'ae') {
        // UAE postcodes are typically 5 digits
        formattedPincode = pincode.replace(/\s/g, '');

        // Special handling for UAE postcodes
        // If zippopotam.us doesn't support UAE, we can use a hardcoded mapping for common UAE postcodes
        const uaePostcodes = {
          '00000': { city: 'Abu Dhabi', state: '' },
          '11111': { city: 'Dubai', state: '' },
          '22222': { city: 'Sharjah', state: '' },
          '33333': { city: 'Ajman', state: '' },
          '44444': { city: 'Umm Al Quwain', state: '' },
          '55555': { city: 'Ras Al Khaimah', state: '' },
          '66666': { city: 'Fujairah', state: '' },
          // Add more UAE postcodes as needed
        };

        // Check if we have a hardcoded mapping for this UAE postcode
        if (uaePostcodes[formattedPincode]) {
          console.log(`Found hardcoded mapping for UAE postcode: ${formattedPincode}`);
          const uaePlace = uaePostcodes[formattedPincode];

          // Update city
          setNewClientData(prev => ({
            ...prev,
            city: uaePlace.city
          }));

          // Update country to UAE
          const uaeCountry = countries.find(c => c.code === 'AE');
          if (uaeCountry) {
            setNewClientData(prev => ({
              ...prev,
              country: uaeCountry.name
            }));
            setSelectedCountry(uaeCountry.name);
            setCountryCode('ae');
          }

          // Set success state
          setPincodeSuccess(true);
          setTimeout(() => {
            setPincodeSuccess(false);
          }, 3000);

          setPincodeLoading(false);
          return;
        }
      }

      // Call the zippopotam.us API to get location data based on pincode
      console.log(`Calling API: https://api.zippopotam.us/${countryCodeForApi}/${formattedPincode}`);
      const response = await axios.get(`https://api.zippopotam.us/${countryCodeForApi}/${formattedPincode}`);

      console.log('API response:', response.data);

      if (response.data && response.data.places && response.data.places.length > 0) {
        const place = response.data.places[0];
        let fieldsUpdated = false;

        // Update city
        if (place['place name']) {
          console.log(`Setting city to: ${place['place name']}`);
          setNewClientData(prev => ({
            ...prev,
            city: place['place name']
          }));
          fieldsUpdated = true;
        }

        // Get the country name from the response or use the current one
        let countryName = response.data.country;
        console.log(`Country from API: ${countryName}`);

        // If the API returned a country name that doesn't match our data structure,
        // try to find a matching country in our list
        if (countryName && !countryStates[countryName]) {
          console.log(`Country name doesn't match our data structure: ${countryName}`);
          // Try to find a matching country by name similarity
          const matchingCountry = Object.keys(countryStates).find(c =>
            c.toLowerCase() === countryName.toLowerCase() ||
            c.toLowerCase().includes(countryName.toLowerCase()) ||
            countryName.toLowerCase().includes(c.toLowerCase())
          );

          if (matchingCountry) {
            console.log(`Found matching country: ${matchingCountry}`);
            countryName = matchingCountry;
          }
        }

        // If we have a valid country name, update the form
        if (countryName && countryStates[countryName]) {
          // Update country
          console.log(`Setting country to: ${countryName}`);
          setNewClientData(prev => ({
            ...prev,
            country: countryName
          }));
          setSelectedCountry(countryName);
          fieldsUpdated = true;

          // Find the matching country in our countries list to get the code
          const countryObj = countries.find(c => c.name === countryName);
          if (countryObj) {
            console.log(`Setting country code to: ${countryObj.code.toLowerCase()}`);
            setCountryCode(countryObj.code.toLowerCase());
          }

          // Update state if the country has states
          if (countryStates[countryName] && countryStates[countryName].hasStates) {
            // Try to find the state in our list
            const stateName = place['state'] || place['state abbreviation'];
            if (stateName) {
              console.log(`State from API: ${stateName}`);
              const statesList = countryStates[countryName].states;

              // Find the closest matching state name
              const matchingState = statesList.find(s =>
                s.toLowerCase() === stateName.toLowerCase() ||
                s.toLowerCase().includes(stateName.toLowerCase()) ||
                stateName.toLowerCase().includes(s.toLowerCase())
              );

              if (matchingState) {
                console.log(`Setting state to: ${matchingState}`);
                setNewClientData(prev => ({
                  ...prev,
                  state: matchingState
                }));
                fieldsUpdated = true;
              }
            }
          }
        }

        // Set success state if any fields were updated
        if (fieldsUpdated) {
          console.log('Fields updated successfully');
          setPincodeSuccess(true);
          // Auto-hide success message after 3 seconds
          setTimeout(() => {
            setPincodeSuccess(false);
          }, 3000);
        } else {
          console.log('Found location but could not update fields');
          // Providing a helpful message instead of an error
          setPincodeError('Location found but details could not be auto-filled. You can enter them manually.');
        }
      } else {
        console.log('No location found for this pincode/zipcode');
        // Not showing error for not found pincodes as pincode is optional
      }
    } catch (error) {
      console.error('Error looking up pincode:', error);

      // Provide more specific error messages based on the error
      if (error.response) {
        if (error.response.status === 404) {
          console.log('Pincode/zipcode not found');
          // Not showing error for not found pincodes as pincode is optional
        } else {
          console.log(`API error: ${error.response.status}`);
          // Providing a helpful message instead of an error
          setPincodeError(`Unable to lookup pincode (API error). You can enter address details manually.`);
        }
      } else if (error.request) {
        console.log('Network error');
        // Providing a helpful message instead of an error
        setPincodeError('Network issue while looking up pincode. You can enter address details manually.');
      } else {
        console.log('Failed to lookup pincode');
        // Providing a helpful message instead of an error
        setPincodeError('Unable to lookup pincode. You can enter address details manually.');
      }
    } finally {
      setPincodeLoading(false);
    }
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
        },
        // Only include additionalDetails if there are any
        additionalDetails: newClientData.additionalDetails.length > 0 
          ? newClientData.additionalDetails 
          : undefined
      };
      
      // Log the payload to verify additionalDetails are included
      console.log('Creating client with data:', clientData);
      
      // Call API to create new client
      const response = await api.post('/api/client/business/add', clientData);
      
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
        message: error,
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
            open={open}
            onOpen={() => {
              setOpen(true);
              // Filter clients locally when dropdown is opened
              setLoading(true);
              debouncedFilterClients(inputValue);
            }}
            onClose={() => setOpen(false)}
            options={clientOptions}
            loading={loading}
            getOptionLabel={(option) => option.clientName || option.businessName || ''}
            isOptionEqualToValue={(option, value) => option.client_id === value.client_id}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Client Name" 
                variant="outlined" 
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                helperText="Start typing to search for clients"
              />
            )}
            noOptionsText="No clients found. Try a different search term or add a new client."
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
              <FormControl fullWidth margin="normal">
                <InputLabel>Country</InputLabel>
                <Select
                  name="country"
                  value={newClientData.country}
                  onChange={handleNewClientInputChange}
                  label="Country"
                  disabled={geoLocationLoading}
                >
                  {countries.map((country) => (
                    <MenuItem key={country.code} value={country.name}>
                      {country.name}
                    </MenuItem>
                  ))}
                </Select>
                {geoLocationLoading && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Detecting your location...
                    </Typography>
                  </Box>
                )}
              </FormControl>
            </Grid>
            {/* State - Only shown if country has states */}
            {newClientData.country && countryStates[newClientData.country] && countryStates[newClientData.country].hasStates ? (
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>State</InputLabel>
                  <Select
                    name="state"
                    value={newClientData.state}
                    onChange={handleNewClientInputChange}
                    label="State"
                  >
                    {countryStates[newClientData.country]?.states?.map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ) : (
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
            )}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Pincode"
                name="pincode"
                value={newClientData.pincode}
                onChange={handleNewClientInputChange}
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: pincodeLoading ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : pincodeSuccess ? (
                    <InputAdornment position="end">
                      <Box sx={{ color: 'success.main', display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.2rem' }}>✓</span>
                      </Box>
                    </InputAdornment>
                  ) : null
                }}
                error={Boolean(pincodeError)}
                helperText={pincodeError || (pincodeSuccess ? "✓ Location found and fields updated!" : "Enter pincode to auto-fill city, state, and country")}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: pincodeSuccess ? 'success.main' : undefined,
                    },
                  },
                  '& .MuiFormHelperText-root': {
                    color: pincodeSuccess ? 'success.main' : undefined,
                  }
                }}
              />
            </Grid>
            
            {/* Additional Details Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Additional Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add any custom information about your client as key-value pairs
              </Typography>
              
              <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                {/* Display existing key-value pairs */}
                {newClientData.additionalDetails.length > 0 ? (
                  <Box sx={{ mb: 2 }}>
                    {newClientData.additionalDetails.map((detail, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 2,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: 'rgba(0, 0, 0, 0.03)'
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={5}>
                            <TextField
                              fullWidth
                              label="Key"
                              name={`additionalDetails[${index}].key`}
                              value={detail.key}
                              onChange={(e) => {
                                const newDetails = [...newClientData.additionalDetails];
                                newDetails[index].key = e.target.value;
                                setNewClientData(prev => ({
                                  ...prev,
                                  additionalDetails: newDetails
                                }));
                              }}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={5}>
                            <TextField
                              fullWidth
                              label="Value"
                              name={`additionalDetails[${index}].value`}
                              value={detail.value}
                              onChange={(e) => {
                                const newDetails = [...newClientData.additionalDetails];
                                newDetails[index].value = e.target.value;
                                setNewClientData(prev => ({
                                  ...prev,
                                  additionalDetails: newDetails
                                }));
                              }}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={2}>
                            <IconButton 
                              color="error"
                              onClick={() => {
                                const newDetails = [...newClientData.additionalDetails];
                                newDetails.splice(index, 1);
                                setNewClientData(prev => ({
                                  ...prev,
                                  additionalDetails: newDetails
                                }));
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      No additional details added yet
                    </Typography>
                  </Box>
                )}
                
                {/* Button to add new key-value pair */}
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => {
                    setNewClientData(prev => ({
                      ...prev,
                      additionalDetails: [
                        ...prev.additionalDetails,
                        { key: '', value: '' }
                      ]
                    }));
                  }}
                  fullWidth
                >
                  Add Custom Field
                </Button>
              </Box>
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

export default ClientDetailsNoApi;