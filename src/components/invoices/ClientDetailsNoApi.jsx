import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Grid, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem,
  Button, Avatar, Divider, Autocomplete, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Snackbar, Alert, IconButton, InputAdornment,
  Paper, Tooltip, Switch, FormControlLabel, FormHelperText
} from '@mui/material';
import { 
  Add, Person, LocationOn, Email, Phone, Save, Delete as DeleteIcon,
  CloudUpload, ExpandMore, ExpandLess, Business, Category, Edit
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import axios from 'axios';
import countries from '../../utils/countries';
import countryStates from '../../utils/countryStates';
import { debounce } from 'lodash';

// Common industry options
const industryOptions = [
  'Accounting & Finance',
  'Advertising & Marketing',
  'Agriculture & Farming',
  'Apparel & Fashion',
  'Architecture & Design',
  'Automotive',
  'Banking & Financial Services',
  'Biotechnology',
  'Construction',
  'Consulting',
  'Consumer Goods',
  'Education & E-learning',
  'Electronics',
  'Energy & Utilities',
  'Entertainment & Media',
  'Food & Beverages',
  'Government & Public Sector',
  'Healthcare & Medical',
  'Hospitality & Tourism',
  'Information Technology',
  'Insurance',
  'Legal Services',
  'Manufacturing',
  'Mining & Metals',
  'Non-profit & NGO',
  'Pharmaceuticals',
  'Real Estate',
  'Retail',
  'Telecommunications',
  'Transportation & Logistics',
  'Other'
];

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
    industry: '',
    gstin: '',
    panNumber: '',
    email: '',
    phone: '',
    showEmailInInvoice: false,
    showPhoneInInvoice: false,
    businessAlias: '',
    uniqueKey: '',
    // Address fields
    addressLine: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    country: 'India',
    buildingNumber: '',
    streetAddress: '',
    // Logo
    logo: null,
    additionalDetails: []
  });
  
  // States for collapsible sections
  const [taxInfoExpanded, setTaxInfoExpanded] = useState(true);
  const [addressExpanded, setAddressExpanded] = useState(true);
  const [additionalDetailsExpanded, setAdditionalDetailsExpanded] = useState(true);
  
  // State for custom field dialog
  const [openCustomFieldDialog, setOpenCustomFieldDialog] = useState(false);
  const [customField, setCustomField] = useState({
    name: '',
    type: 'singleLineText',
    options: ['Option 1']
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
  
  // File input reference
  const fileInputRef = useRef(null);
  
  // Handle logo file selection
  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setAlert({
        open: true,
        message: 'Please upload a JPEG or PNG file',
        severity: 'error'
      });
      return;
    }
    
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setAlert({
        open: true,
        message: 'File size must be less than 10MB',
        severity: 'error'
      });
      return;
    }
    
    // Validate image dimensions
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      
      // Check if dimensions are too large
      if (img.width > 1080 || img.height > 1080) {
        setAlert({
          open: true,
          message: 'Image dimensions should not exceed 1080x1080px',
          severity: 'warning'
        });
        // Still allow the image but with a warning
      }
      
      // Update state with the file
      setNewClientData(prev => ({
        ...prev,
        logo: file
      }));
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      setAlert({
        open: true,
        message: 'Invalid image file',
        severity: 'error'
      });
    };
    
    img.src = URL.createObjectURL(file);
  };
  
  // Handle input changes in the new client form
  const handleNewClientInputChange = (e) => {
    const { name, value } = e.target;
    
    // If country changes, update the country code and reset state if needed
    if (name === 'country') {
      const country = countries.find(c => c.name === value);
      if (country) {
        setCountryCode(country.code.toLowerCase());
        
        // Reset state if country changes
        if (newClientData.country !== value) {
          setNewClientData(prev => ({
            ...prev,
            [name]: value,
            state: ''
          }));
          return; // Return early since we've already updated the state
        }
      }
    }
    
    // For all other fields or if country didn't need state reset
    setNewClientData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If pincode changes and is of sufficient length, trigger lookup
    if (name === 'pincode' && value.length >= 5) {
      handlePincodeLookup(value);
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setNewClientData(prev => ({
      ...prev,
      [name]: checked
    }));
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
        // Use businessName as the clientName
        clientName: newClientData.businessName,
        businessName: newClientData.businessName,
        industry: newClientData.industry,
        gstin: newClientData.gstin,
        panNumber: newClientData.panNumber,
        email: newClientData.email,
        phone: newClientData.phone,
        showEmailInInvoice: newClientData.showEmailInInvoice,
        showPhoneInInvoice: newClientData.showPhoneInInvoice,
        businessAlias: newClientData.businessAlias,
        uniqueKey: newClientData.uniqueKey,
        address: {
          addressLine: newClientData.addressLine,
          streetAddress: newClientData.streetAddress,
          buildingNumber: newClientData.buildingNumber,
          district: newClientData.district,
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
      
      // Handle logo upload if a logo was selected
      if (newClientData.logo) {
        // Create a FormData object for file upload
        const formData = new FormData();
        formData.append('logo', newClientData.logo);
        
        try {
          // Upload the logo first
          const logoResponse = await api.post('/api/client/business/logo/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          // If logo upload was successful, add the logo URL to the client data
          if (logoResponse.success && logoResponse.data && logoResponse.data.logoUrl) {
            clientData.logoUrl = logoResponse.data.logoUrl;
          }
        } catch (logoError) {
          console.error('Error uploading logo:', logoError);
          // Continue with client creation even if logo upload fails
        }
      }
      
      // Log the payload to verify additionalDetails are included
      console.log('Creating client with data:', clientData);
      
      // Call API to create new client
      const response = await api.post('/api/client/business/add', clientData);
      
      // Add the new client to the list and select it
      const newClient = response.data;
      
      // Add the new client to clientOptions so it appears in search results immediately
      setClientOptions(prevOptions => {
        // Check if the client already exists in the options
        const exists = prevOptions.some(client => client.client_id === newClient.client_id);
        if (!exists) {
          return [newClient, ...prevOptions];
        }
        return prevOptions;
      });
      
      // Update the input value to show the new client name
      setInputValue(newClient.clientName || newClient.businessName);
      
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
        <DialogTitle sx={{ pb: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              borderBottom: '2px solid',
              borderColor: 'primary.main', 
              paddingBottom: 1,
              display: 'inline-block',
              fontWeight: 'bold'
            }}
          >
            Add New Client
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography 
            variant="subtitle1" 
            fontWeight="medium" 
            sx={{ 
              mt: 1, 
              mb: 2,
              color: 'text.secondary',
              borderLeft: '4px solid',
              borderColor: 'primary.light',
              pl: 1
            }}
          >
            Basic Client Details
          </Typography>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            {/* First row - Logo upload */}
            <Grid item xs={12}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight="medium" sx={{ mb: 1, color: 'text.secondary' }}>
                  Upload Logo
                </Typography>
                <input
                  accept="image/jpeg,image/png"
                  style={{ display: 'none' }}
                  id="logo-upload"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoChange}
                />
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 160,
                    cursor: 'pointer',
                    borderStyle: 'dashed',
                    borderColor: newClientData.logo ? 'primary.main' : 'divider',
                    borderWidth: '2px',
                    borderRadius: '8px',
                    bgcolor: newClientData.logo ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'rgba(0, 0, 0, 0.02)'
                    }
                  }}
                  onClick={() => fileInputRef.current.click()}
                >
                  {newClientData.logo ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar
                        src={URL.createObjectURL(newClientData.logo)}
                        alt="Client Logo"
                        sx={{ width: 100, height: 100, mb: 2 }}
                      />
                      <Typography variant="body2" color="textSecondary">
                        {newClientData.logo.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {(newClientData.logo.size / (1024 * 1024)).toFixed(2)} MB
                      </Typography>
                      <Button 
                        size="small" 
                        variant="outlined"
                        sx={{ mt: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewClientData(prev => ({ ...prev, logo: null }));
                        }}
                      >
                        Change
                      </Button>
                    </Box>
                  ) : (
                    <>
                      <CloudUpload color="primary" sx={{ fontSize: 48, mb: 2 }} />
                      <Typography variant="body1" align="center" fontWeight="medium" gutterBottom>
                        Upload Logo
                      </Typography>
                      <Typography variant="caption" color="textSecondary" align="center" sx={{ mt: 1 }}>
                        JPEG, PNG format • Max 10MB • 1080×1080px
                      </Typography>
                    </>
                  )}
                </Paper>
              </Box>
            </Grid>
            
            {/* Second row - Business Name and Industry */}
            <Grid container item spacing={3} sx={{ mt: 1, mb: 1 }}>
              <Grid item xs={12}>
                <Typography variant="body2" fontWeight="medium" sx={{ mb: 1, color: 'text.secondary' }}>
                  Business Details
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Business Name"
                  name="businessName"
                  value={newClientData.businessName}
                  onChange={handleNewClientInputChange}
                  fullWidth
                  required
                  variant="outlined"
                  placeholder="Enter business name"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Business fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Client Industry</InputLabel>
                  <Select
                    name="industry"
                    value={newClientData.industry}
                    onChange={handleNewClientInputChange}
                    label="Client Industry"
                    startAdornment={
                      <InputAdornment position="start">
                        <Category fontSize="small" color="primary" />
                      </InputAdornment>
                    }
                    sx={{
                      borderRadius: '8px',
                    }}
                  >
                    {industryOptions.map((industry) => (
                      <MenuItem key={industry} value={industry}>
                        {industry}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Select the primary industry of your client</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
            
            {/* Third row - Country and City */}
            <Grid container item spacing={3} sx={{ mt: 1, mb: 1 }}>
              <Grid item xs={12}>
                <Typography variant="body2" fontWeight="medium" sx={{ mb: 1, color: 'text.secondary' }}>
                  Location Details
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Country</InputLabel>
                  <Select
                    name="country"
                    value={newClientData.country}
                    onChange={handleNewClientInputChange}
                    label="Country"
                    disabled={geoLocationLoading}
                    startAdornment={
                      <InputAdornment position="start">
                        <LocationOn fontSize="small" color="primary" />
                      </InputAdornment>
                    }
                    sx={{
                      borderRadius: '8px',
                    }}
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
                  <FormHelperText>Default selection based on your location</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="City/Town"
                  name="city"
                  value={newClientData.city}
                  onChange={handleNewClientInputChange}
                  fullWidth
                  variant="outlined"
                  placeholder="Enter city or town"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                />
              </Grid>
            </Grid>
            
            {/* Tax Information Section (Collapsible) */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  borderRadius: '8px',
                  overflow: 'hidden',
                  borderColor: taxInfoExpanded ? 'primary.light' : 'divider'
                }}
              >
                <Box 
                  sx={{ 
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    bgcolor: taxInfoExpanded ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                  }}
                  onClick={() => setTaxInfoExpanded(!taxInfoExpanded)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Save color="primary" sx={{ mr: 1.5, fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight="medium">
                      Tax Information <Typography component="span" variant="caption" color="text.secondary">(Optional)</Typography>
                    </Typography>
                  </Box>
                  <IconButton size="small" color="primary">
                    {taxInfoExpanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
                
                {taxInfoExpanded && (
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Business GSTIN"
                          name="gstin"
                          value={newClientData.gstin}
                          onChange={handleNewClientInputChange}
                          fullWidth
                          variant="outlined"
                          placeholder="e.g., 22AAAAA0000A1Z5"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Save fontSize="small" color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="PAN Number"
                          name="panNumber"
                          value={newClientData.panNumber}
                          onChange={handleNewClientInputChange}
                          fullWidth
                          variant="outlined"
                          placeholder="e.g., AAAAA0000A"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Save fontSize="small" color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Grid>
            
            {/* Address Section (Collapsible) */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  borderRadius: '8px',
                  overflow: 'hidden',
                  borderColor: addressExpanded ? 'primary.light' : 'divider'
                }}
              >
                <Box 
                  sx={{ 
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    bgcolor: addressExpanded ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                  }}
                  onClick={() => setAddressExpanded(!addressExpanded)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn color="primary" sx={{ mr: 1.5, fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight="medium">
                      Address
                    </Typography>
                  </Box>
                  <IconButton size="small" color="primary">
                    {addressExpanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
                
                {addressExpanded && (
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel>Country</InputLabel>
                          <Select
                            name="country"
                            value={newClientData.country}
                            onChange={handleNewClientInputChange}
                            label="Country"
                            disabled={geoLocationLoading}
                            startAdornment={
                              <InputAdornment position="start">
                                <LocationOn fontSize="small" color="primary" />
                              </InputAdornment>
                            }
                            sx={{
                              borderRadius: '8px',
                            }}
                          >
                            {countries.map((country) => (
                              <MenuItem key={country.code} value={country.name}>
                                {country.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      {/* State/Province - Only shown if country has states */}
                      {newClientData.country && countryStates[newClientData.country] && countryStates[newClientData.country].hasStates ? (
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel>State/Province</InputLabel>
                            <Select
                              name="state"
                              value={newClientData.state}
                              onChange={handleNewClientInputChange}
                              label="State/Province"
                              startAdornment={
                                <InputAdornment position="start">
                                  <LocationOn fontSize="small" color="primary" />
                                </InputAdornment>
                              }
                              sx={{
                                borderRadius: '8px',
                              }}
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
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="State/Province"
                            name="state"
                            value={newClientData.state}
                            onChange={handleNewClientInputChange}
                            fullWidth
                            variant="outlined"
                            placeholder="Enter state or province"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LocationOn fontSize="small" color="primary" />
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                              }
                            }}
                          />
                        </Grid>
                      )}
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="District"
                          name="district"
                          value={newClientData.district}
                          onChange={handleNewClientInputChange}
                          fullWidth
                          variant="outlined"
                          placeholder="Enter district"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOn fontSize="small" color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="City/Town"
                          name="city"
                          value={newClientData.city}
                          onChange={handleNewClientInputChange}
                          fullWidth
                          variant="outlined"
                          placeholder="Enter city or town"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOn fontSize="small" color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Building Number/House Number"
                          name="buildingNumber"
                          value={newClientData.buildingNumber}
                          onChange={handleNewClientInputChange}
                          fullWidth
                          variant="outlined"
                          placeholder="Enter building or house number"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOn fontSize="small" color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Postal/Zip Code"
                          name="pincode"
                          value={newClientData.pincode}
                          onChange={handleNewClientInputChange}
                          fullWidth
                          variant="outlined"
                          placeholder="Enter postal or zip code"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOn fontSize="small" color="primary" />
                              </InputAdornment>
                            ),
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
                          helperText={pincodeError || (pincodeSuccess ? "✓ Location found and fields updated!" : "Enter postal code to auto-fill location details")}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              borderColor: pincodeSuccess ? 'success.main' : undefined,
                            },
                            '& .MuiFormHelperText-root': {
                              color: pincodeSuccess ? 'success.main' : undefined,
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          label="Street Address"
                          name="streetAddress"
                          value={newClientData.streetAddress}
                          onChange={handleNewClientInputChange}
                          fullWidth
                          variant="outlined"
                          placeholder="Enter street address"
                          multiline
                          rows={2}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                                <LocationOn fontSize="small" color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Grid>
            
            {/* Additional Details Section (Collapsible) */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  borderRadius: '8px',
                  overflow: 'hidden',
                  borderColor: additionalDetailsExpanded ? 'primary.light' : 'divider'
                }}
              >
                <Box 
                  sx={{ 
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    bgcolor: additionalDetailsExpanded ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                  }}
                  onClick={() => setAdditionalDetailsExpanded(!additionalDetailsExpanded)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Business color="primary" sx={{ mr: 1.5, fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight="medium">
                      Additional Details <Typography component="span" variant="caption" color="text.secondary">(Optional)</Typography>
                    </Typography>
                  </Box>
                  <IconButton size="small" color="primary">
                    {additionalDetailsExpanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
                
                {additionalDetailsExpanded && (
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Business Alias (Nick Name)"
                          name="businessAlias"
                          value={newClientData.businessAlias}
                          onChange={handleNewClientInputChange}
                          fullWidth
                          variant="outlined"
                          placeholder="e.g., ABC Corp"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Business fontSize="small" color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Unique Key"
                          name="uniqueKey"
                          value={newClientData.uniqueKey}
                          onChange={handleNewClientInputChange}
                          fullWidth
                          variant="outlined"
                          placeholder="e.g., CLIENT001"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Business fontSize="small" color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box>
                          <TextField
                            label="Email"
                            name="email"
                            value={newClientData.email}
                            onChange={handleNewClientInputChange}
                            fullWidth
                            variant="outlined"
                            placeholder="e.g., contact@example.com"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Email fontSize="small" color="primary" />
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                              },
                              mb: 1
                            }}
                            helperText={
                              <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                Add to directly email documents from Invokta
                              </Typography>
                            }
                          />
                          <FormControlLabel
                            control={
                              <Switch
                                checked={newClientData.showEmailInInvoice}
                                onChange={handleCheckboxChange}
                                name="showEmailInInvoice"
                                color="primary"
                                size="small"
                              />
                            }
                            label={
                              <Typography variant="body2">
                                Show Email in Invoice
                              </Typography>
                            }
                          />
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box>
                          <TextField
                            label="Phone Number"
                            name="phone"
                            value={newClientData.phone}
                            onChange={handleNewClientInputChange}
                            fullWidth
                            variant="outlined"
                            placeholder="e.g., 9876543210"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Phone fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                      +{countryCode === 'in' ? '91' : 
                                         countryCode === 'ae' ? '971' : 
                                         countryCode === 'us' ? '1' : 
                                         countryCode === 'gb' ? '44' : '00'}
                                    </Typography>
                                  </Box>
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                              },
                              mb: 1
                            }}
                            helperText={
                              <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                Add to directly WhatsApp documents from Invokta
                              </Typography>
                            }
                          />
                          <FormControlLabel
                            control={
                              <Switch
                                checked={newClientData.showPhoneInInvoice}
                                onChange={handleCheckboxChange}
                                name="showPhoneInInvoice"
                                color="primary"
                                size="small"
                              />
                            }
                            label={
                              <Typography variant="body2">
                                Show Phone in Invoice
                              </Typography>
                            }
                          />
                        </Box>
                      </Grid>
                      
                      {/* Custom Fields Section */}
                      <Grid item xs={12}>
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Add color="primary" fontSize="small" sx={{ mr: 1 }} />
                            <Typography variant="subtitle2" fontWeight="medium">
                              Custom Fields
                            </Typography>
                          </Box>
                          
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              mb: 3, 
                              p: 2, 
                              borderRadius: '8px',
                              borderColor: 'divider',
                              bgcolor: 'rgba(0, 0, 0, 0.01)'
                            }}
                          >
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
                                      p: 1.5,
                                      borderRadius: '8px',
                                      bgcolor: 'background.paper',
                                      border: '1px solid',
                                      borderColor: 'divider'
                                    }}
                                  >
                                    <Grid container spacing={2} alignItems="center">
                                      <Grid item xs={12} md={5}>
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
                                          variant="outlined"
                                          InputProps={{
                                            startAdornment: (
                                              <InputAdornment position="start">
                                                <Business fontSize="small" color="primary" />
                                              </InputAdornment>
                                            ),
                                          }}
                                          sx={{
                                            '& .MuiOutlinedInput-root': {
                                              borderRadius: '8px',
                                            }
                                          }}
                                        />
                                      </Grid>
                                      <Grid item xs={12} md={5}>
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
                                          variant="outlined"
                                          InputProps={{
                                            startAdornment: (
                                              <InputAdornment position="start">
                                                <Business fontSize="small" color="primary" />
                                              </InputAdornment>
                                            ),
                                          }}
                                          sx={{
                                            '& .MuiOutlinedInput-root': {
                                              borderRadius: '8px',
                                            }
                                          }}
                                        />
                                      </Grid>
                                      <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'center' }}>
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
                                          size="small"
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Grid>
                                    </Grid>
                                  </Box>
                                ))}
                              </Box>
                            ) : (
                              <Box sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                  No custom fields added yet
                                </Typography>
                              </Box>
                            )}
                            
                            {/* Button to add new custom field */}
                            <Button
                              variant="outlined"
                              startIcon={<Add />}
                              onClick={() => setOpenCustomFieldDialog(true)}
                              fullWidth
                              sx={{ 
                                borderRadius: '8px',
                                py: 1
                              }}
                            >
                              Add Custom Field
                            </Button>
                          </Paper>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseNewDialog}
            variant="outlined"
            sx={{ 
              borderRadius: '8px',
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateClient} 
            variant="contained" 
            color="primary"
            disabled={saving || !newClientData.businessName}
            startIcon={saving ? <CircularProgress size={20} /> : <Add />}
            sx={{ 
              borderRadius: '8px',
              px: 3
            }}
          >
            {saving ? 'Creating...' : 'Create Client'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Custom Field Dialog */}
      <Dialog 
        open={openCustomFieldDialog} 
        onClose={() => setOpenCustomFieldDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.light', 
          color: 'white',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Add sx={{ mr: 1.5, fontSize: 24 }} />
            <Typography variant="h6" fontWeight="medium">
              Add Custom Field
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Field Name"
                value={customField.name}
                onChange={(e) => setCustomField(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                required
                variant="outlined"
                placeholder="Enter field name"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business fontSize="small" color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                  mt: 1
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Field Type</InputLabel>
                <Select
                  value={customField.type}
                  onChange={(e) => setCustomField(prev => ({ ...prev, type: e.target.value }))}
                  label="Field Type"
                  startAdornment={
                    <InputAdornment position="start">
                      <Category fontSize="small" color="primary" />
                    </InputAdornment>
                  }
                  sx={{
                    borderRadius: '8px',
                  }}
                >
                  <MenuItem value="singleLineText">Single Line Text</MenuItem>
                  <MenuItem value="multiLineText">Multi Line Text</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="phone">Phone</MenuItem>
                  <MenuItem value="url">URL</MenuItem>
                  <MenuItem value="currency">Currency</MenuItem>
                  <MenuItem value="checkbox">Multiple Select: Checkbox</MenuItem>
                  <MenuItem value="multiDropdown">Multiple Select: Dropdown</MenuItem>
                </Select>
                <FormHelperText>Select the type of field you want to add</FormHelperText>
              </FormControl>
            </Grid>
            
            {/* Options for checkbox and multiDropdown types */}
            {(customField.type === 'checkbox' || customField.type === 'multiDropdown') && (
              <Grid item xs={12}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    mt: 1,
                    borderRadius: '8px',
                    bgcolor: 'rgba(0, 0, 0, 0.01)'
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 2 
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Add color="primary" fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" fontWeight="medium">
                        Customize Options
                      </Typography>
                    </Box>
                    <Button 
                      variant="outlined"
                      startIcon={<Add />} 
                      size="small"
                      onClick={() => {
                        setCustomField(prev => ({
                          ...prev,
                          options: [...prev.options, `Option ${prev.options.length + 1}`]
                        }));
                      }}
                      sx={{ 
                        borderRadius: '8px',
                      }}
                    >
                      Add new option
                    </Button>
                  </Box>
                  
                  <Box sx={{ maxHeight: '200px', overflowY: 'auto', pr: 1 }}>
                    {customField.options.map((option, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 2,
                          p: 1,
                          borderRadius: '8px',
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <TextField
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...customField.options];
                            newOptions[index] = e.target.value;
                            setCustomField(prev => ({
                              ...prev,
                              options: newOptions
                            }));
                          }}
                          fullWidth
                          size="small"
                          variant="outlined"
                          placeholder={`Option ${index + 1}`}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Business fontSize="small" color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mr: 1,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                            }
                          }}
                        />
                        <Box sx={{ display: 'flex' }}>
                          <Tooltip title="Edit Option">
                            <IconButton 
                              size="small" 
                              color="primary"
                              sx={{ mr: 0.5 }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Option">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => {
                                const newOptions = [...customField.options];
                                newOptions.splice(index, 1);
                                setCustomField(prev => ({
                                  ...prev,
                                  options: newOptions
                                }));
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: 'background.paper' }}>
          <Button 
            onClick={() => setOpenCustomFieldDialog(false)}
            variant="outlined"
            sx={{ 
              borderRadius: '8px',
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<Add />}
            sx={{ 
              borderRadius: '8px',
              px: 3
            }}
            onClick={() => {
              if (!customField.name) {
                setAlert({
                  open: true,
                  message: 'Please enter a field name',
                  severity: 'error'
                });
                return;
              }
              
              // Create the new custom field
              const newCustomField = {
                key: customField.name,
                value: '',
                type: customField.type,
                options: customField.type === 'checkbox' || customField.type === 'multiDropdown' 
                  ? customField.options 
                  : []
              };
              
              // Add to additionalDetails
              setNewClientData(prev => ({
                ...prev,
                additionalDetails: [
                  ...prev.additionalDetails,
                  newCustomField
                ]
              }));
              
              // Reset and close dialog
              setCustomField({
                name: '',
                type: 'singleLineText',
                options: ['Option 1']
              });
              setOpenCustomFieldDialog(false);
            }}
          >
            Add Field
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