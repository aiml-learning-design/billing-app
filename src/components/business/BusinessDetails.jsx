import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent,
  Avatar, Button, FormControl, InputLabel, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Snackbar, Alert, Autocomplete, Divider,
  IconButton, InputAdornment, FormControlLabel, Switch, Tooltip,
  FormHelperText, Collapse
} from '@mui/material';
import { Business, Edit, Save, Add, Delete as DeleteIcon, Label, Category } from '@mui/icons-material';
import api from '../../services/api';
import axios from 'axios';
import countries from '../../utils/countries';
import countryStates from '../../utils/countryStates';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import 'react-phone-input-2/lib/style.css';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openNewDialog, setOpenNewDialog] = useState(false);
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
  const [newBusinessData, setNewBusinessData] = useState({
    businessName: '',
    gstin: '',
    pan: '',
    checkGstType: false,
    email: '',
    phone: '',
    showEmailInInvoice: false,
    showPhoneInInvoice: false,
    directEmailDocuments: false,
    directWhatsAppDocuments: false,
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
  const [customField, setCustomField] = useState({
    name: '',
    type: 'singleLineText',
    label: '',
    options: ['Option 1']
  });
  const [openCustomFieldDialog, setOpenCustomFieldDialog] = useState(false);
  
  // Country detection states
  const [countryCode, setCountryCode] = useState('in');
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [geoLocationLoading, setGeoLocationLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState(null);
  const [pincodeSuccess, setPincodeSuccess] = useState(false);

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
      setOpenEditDialog(true);
    }
  };

  // Close edit dialog
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };
  const [showTaxInfo, setShowTaxInfo] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
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
          setNewBusinessData(prev => ({
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
        setNewBusinessData(prev => ({
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
          setNewBusinessData(prev => ({
            ...prev,
            country: countryByCode.name
          }));
        } else {
          // Default to India if no match found
          const defaultCountry = countries.find(c => c.code === 'IN') || countries.find(c => c.name === 'India');
          console.log(`No matching country found, defaulting to ${defaultCountry.name}`);
          setSelectedCountry(defaultCountry.name);
          setCountryCode(defaultCountry.code.toLowerCase());
          setNewBusinessData(prev => ({
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
        setNewBusinessData(prev => ({
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
      setNewBusinessData(prev => ({
        ...prev,
        country: defaultCountry.name
      }));
    } finally {
      setGeoLocationLoading(false);
    }
  };

  // Open new business dialog
  const handleOpenNewDialog = () => {
    setNewBusinessData({
      businessName: '',
      gstin: '',
      pan: '',
      checkGstType: false,
      email: '',
      phone: '',
      showEmailInInvoice: false,
      showPhoneInInvoice: false,
      directEmailDocuments: false,
      directWhatsAppDocuments: false,
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

  // Close new business dialog
  const handleCloseNewDialog = () => {
    setOpenNewDialog(false);
  };
  
  // Handle input changes in new business form
  const handleNewBusinessInputChange = (e) => {
    const { name, value } = e.target;
    setNewBusinessData(prev => ({
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
          setNewBusinessData(prev => ({
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
  
  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setNewBusinessData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle phone input changes for new business
  const handleNewBusinessPhoneChange = (value) => {
    setNewBusinessData(prev => ({
      ...prev,
      phone: value
    }));
  };
  
  // Handle phone input changes for edit form
  const handleEditPhoneChange = (value) => {
    setEditFormData(prev => ({
      ...prev,
      phone: value
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
          setNewBusinessData(prev => ({
            ...prev,
            city: uaePlace.city
          }));

          // Update country to UAE
          const uaeCountry = countries.find(c => c.code === 'AE');
          if (uaeCountry) {
            setNewBusinessData(prev => ({
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
          setNewBusinessData(prev => ({
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
          setNewBusinessData(prev => ({
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
                setNewBusinessData(prev => ({
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

  // Handle input changes in edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit form submission
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
      
      setOpenEditDialog(false);
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
  
  // Handle new business form submission
  const handleCreateBusiness = async () => {
    try {
      setSaving(true);
      
      // Prepare data for API
      const businessData = {
        businessName: newBusinessData.businessName,
        gstin: newBusinessData.gstin,
        pan: newBusinessData.pan,
        checkGstType: newBusinessData.checkGstType,
        officeAddress: {
          email: newBusinessData.email,
          phone: newBusinessData.phone,
          addressLine: newBusinessData.addressLine,
          city: newBusinessData.city,
          state: newBusinessData.state,
          pincode: newBusinessData.pincode,
          country: newBusinessData.country
        },
        showEmailInInvoice: newBusinessData.showEmailInInvoice,
        showPhoneInInvoice: newBusinessData.showPhoneInInvoice,
        directEmailDocuments: newBusinessData.directEmailDocuments,
        directWhatsAppDocuments: newBusinessData.directWhatsAppDocuments,
        // Only include additionalDetails if there are any
        additionalDetails: newBusinessData.additionalDetails.length > 0 
          ? newBusinessData.additionalDetails 
          : undefined
      };
      
      // Log the payload to verify additionalDetails are included
      console.log('Creating business with data:', businessData);

      // Call API to create new business
      const response = await api.post('/api/businesses', businessData);
      
      // Add the new business to the list and select it
      const newBusiness = response.data;
      if (onBusinessUpdate) {
        onBusinessUpdate(newBusiness);
      }
      
      // If onBusinessChange is provided, select the new business
      if (onBusinessChange) {
        onBusinessChange(newBusiness);
      }
      
      setAlert({
        open: true,
        message: 'New business created successfully',
        severity: 'success'
      });
      
      setOpenNewDialog(false);
    } catch (error) {
      console.error('Error creating business:', error);
      setAlert({
        open: true,
        message: 'Failed to create new business',
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
            Billed By (Your Business Details)
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
            Billed By (Your Business Details)
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

        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
          <Autocomplete
            value={business}
            onChange={(event, newValue) => {
              if (newValue && onBusinessChange) {
                onBusinessChange(newValue);
              }
            }}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
            }}
            options={businesses}
            getOptionLabel={(option) => option.businessName || ''}
            isOptionEqualToValue={(option, value) => option.business_id === value.business_id}
            renderInput={(params) => (
              <TextField {...params} label="Business Name" variant="outlined" fullWidth />
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
            onClick={handleOpenNewDialog}
          >
            Add New Business
          </Button>
        </Box>

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










      {/* New Business Dialog */}
      <Dialog open={openNewDialog} onClose={handleCloseNewDialog} maxWidth="md" fullWidth>
        <Grid item xs={12} sm={6}>
            <DialogTitle>Add New Business</DialogTitle>
        </Grid>
        <DialogContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
            Business details
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {/* Basic Information Section */}
          <Grid item xs={12} sm={12} md={12} lg={12}>
          <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
            Basic Information
          </Typography>
          </Grid>




        <Grid container spacing={3} sx={{ mt: 0, width: "100%" }}>
            <Grid item xs={12} sm={6} md={4} lg={4} sx={{ mt: 0, width: "265px" }}>
                  <TextField
                    label="Vendor's Business Name*"
                    name="businessName"
                    value={newBusinessData.businessName}
                    onChange={handleNewBusinessInputChange}
                    fullWidth
                    required
                    margin="normal"
                    size="small"
                  />
            </Grid>

              <Grid item xs={12} sm={6} md={4} lg={4} sx={{ mt: 0, width: "265px" }}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Select Country*</InputLabel>
                    <Select
                      name="country"
                      value={newBusinessData.country}
                      onChange={handleNewBusinessInputChange}
                      label="Select Country*"
                      required
                      size="small"
                    >
                      {countries.map((country) => (
                        <MenuItem key={country.code} value={country.name}>
                          {country.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {geoLocationLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        Detecting your location...
                      </Typography>
                    </Box>
                  )}
            </Grid>

              <Grid item xs={12} sm={6} md={4} lg={4} sx={{ mt: 0, width: "265px" }}>
                  <TextField
                    label="City/Town"
                    name="city"
                    value={newBusinessData.city}
                    onChange={handleNewBusinessInputChange}
                    fullWidth
                    margin="normal"
                    size="small"
                  />
            </Grid>
          </Grid>

          {/* Tax Information Section */}
              <Typography
                variant="subtitle1"
                fontWeight="medium"
                sx={{ mt: 4, mb: 2, display: "flex", alignItems: "center", cursor: "pointer" }}
                onClick={() => setShowTaxInfo(!showTaxInfo)}
              >
                Tax Information (optional)
                <IconButton
                  size="small"
                  sx={{
                    transform: showTaxInfo ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s",
                    ml: 1,
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </Typography>

          <Collapse in={showTaxInfo} timeout="auto" unmountOnExit>
              <Grid item xs={12} sm={6} md={4} lg={4} sx={{ mt: 0, width: "265px" }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newBusinessData.checkGstType}
                      onChange={handleCheckboxChange}
                      name="checkGstType"
                      color="primary"
                    />
                  }
                  label="Check GST Type"
                />
              </Grid>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4} lg={4} sx={{ mt: 0, width: "410px" }}>
              <TextField
                label="Business GSTIN"
                name="gstin"
                value={newBusinessData.gstin}
                onChange={handleNewBusinessInputChange}
                fullWidth
                margin="normal"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4} sx={{ mt: 0, width: "410px" }}>
              <TextField
                label="Business PAN Number"
                name="pan"
                value={newBusinessData.pan}
                onChange={handleNewBusinessInputChange}
                fullWidth
                margin="normal"
                size="small"
              />
            </Grid>

          </Grid>

        </Collapse>
          <Typography variant="subtitle1" fontWeight="medium" sx={{ mt: 4, mb: 2 }} onClick={() => setShowAddress(!showAddress)}>
            Address (optional)
            <IconButton
                  size="small"
                  sx={{
                    transform: showAddress ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s",
                    ml: 1,
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
          </Typography>

          {/* Address Section */}
        <Collapse in={showAddress} timeout="auto" unmountOnExit>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4} lg={4} sx={{ mt: 0, width: "260px" }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Country</InputLabel>
                <Select
                  name="country"
                  value={newBusinessData.country}
                  onChange={handleNewBusinessInputChange}
                  label="Select Country"
                   size='small'
                >
                  {countries.map((country) => (
                    <MenuItem key={country.code} value={country.name}>
                      {country.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* State - Only shown if country has states */}
            {newBusinessData.country && countryStates[newBusinessData.country] && countryStates[newBusinessData.country].hasStates ? (
              <Grid item xs={12} sm={6} md={4} lg={4} sx={{ mt: 0, width: "260px" }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel size='small'>State / Province</InputLabel>
                  <Select
                    name="state"
                    value={newBusinessData.state}
                    onChange={handleNewBusinessInputChange}
                    label="State / Province"
                    size='small'
                  >
                    {countryStates[newBusinessData.country]?.states?.map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ) : (
              <Grid item xs={12} sm={6} md={4} lg={4} sx={{ mt: 0, width: "260px" }}>
                <TextField
                  label="State / Province"
                  name="state"
                  value={newBusinessData.state}
                  onChange={handleNewBusinessInputChange}
                  fullWidth
                  margin="normal"
                   size='small'
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6} md={4} lg={4} sx={{ mt: 0, width: "320" }}>
              <TextField
                label="City/Town"
                name="city"
                value={newBusinessData.city}
                onChange={handleNewBusinessInputChange}
                fullWidth
                margin="normal"
                size='small'
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4} lg={4} sx={{ mt: 0, width: "500" }}>
                        <TextField
                          label="Postal Code / Zip Code"
                          name="pincode"
                          value={newBusinessData.pincode}
                          onChange={handleNewBusinessInputChange}
                          fullWidth
                          margin="normal"
                          size='small'
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
                          helperText={pincodeError || (pincodeSuccess ? "✓ Location found and fields updated!" : "")}
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

                      <Grid item xs={12} sm={6} md={4} lg={4} sx={{ mt: 0, width: "500" }} >
                        <TextField
                          label="Street Address"
                          name="addressLine"
                          value={newBusinessData.addressLine}
                          onChange={handleNewBusinessInputChange}
                          fullWidth
                          margin="normal"
                          size='small'
                        />
                      </Grid>
                      </Grid>
    </Collapse>

          {/* Additional Details Section */}
          <Typography variant="subtitle1" fontWeight="medium" sx={{ mt: 4, mb: 2 }} onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}>
            Additional Details (optional)
            <IconButton
                              size="small"
                              sx={{
                                transform: showAdditionalDetails ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.3s",
                                ml: 1,
                              }}
                            >
                              <ExpandMoreIcon />
                            </IconButton>
          </Typography>
          <Collapse in={showAdditionalDetails} timeout="auto" unmountOnExit>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4} lg={4} sx={{ mt: 1, width: "400px" }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 0, display: 'block' }}>
                    Email
                </Typography>
              <TextField
                label="Email"
                name="email"
                value={newBusinessData.email}
                onChange={handleNewBusinessInputChange}
                fullWidth
                margin="normal"
                size='small'

              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4} sx={{ mt: 0, width: "400px" }}>
              <Box sx={{ mt: 2, mb: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 1, display: 'block' }}>
                  Phone No.
                </Typography>
                <PhoneInput
                  country={countryCode}
                  value={newBusinessData.phone}
                  onChange={handleNewBusinessPhoneChange}
                  inputStyle={{
                    width: '100%',
                    height: '40px',
                    fontSize: '0.875rem'
                  }}
                  containerStyle={{
                    width: '100%'
                  }}
                />
                <style>
                  {`
                    .react-tel-input .country-list .country {
                      padding: 5px 35px;
                    }
                  `}
                </style>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newBusinessData.directEmailDocuments}
                      onChange={handleCheckboxChange}
                      name="directEmailDocuments"
                      color="primary"
                    />
                  }
                  label="Add to directly email documents from Invoka"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={newBusinessData.directWhatsAppDocuments}
                      onChange={handleCheckboxChange}
                      name="directWhatsAppDocuments"
                      color="primary"
                    />
                  }
                  label="Add to directly WhatsApp documents from Invoka"
                />

                <Box sx={{ display: 'flex', gap: 4 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newBusinessData.showEmailInInvoice}
                        onChange={handleCheckboxChange}
                        name="showEmailInInvoice"
                        color="primary"
                      />
                    }
                    label="Show Email in Invoice"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={newBusinessData.showPhoneInInvoice}
                        onChange={handleCheckboxChange}
                        name="showPhoneInInvoice"
                        color="primary"
                      />
                    }
                    label="Show Phone in Invoice"
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
</Collapse>
          {/* Add Custom Fields Section */}
          <Typography variant="subtitle1" fontWeight="medium" sx={{ mt: 4, mb: 2 }}>
            Add Custom Fields
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                {/* Display existing key-value pairs */}
                {newBusinessData.additionalDetails.length > 0 ? (
                  <Box sx={{ mb: 2 }}>
                    {newBusinessData.additionalDetails.map((detail, index) => (
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
                              label="Field Name*"
                              name={`additionalDetails[${index}].key`}
                              value={detail.key}
                              onChange={(e) => {
                                const newDetails = [...newBusinessData.additionalDetails];
                                newDetails[index].key = e.target.value;
                                setNewBusinessData(prev => ({
                                  ...prev,
                                  additionalDetails: newDetails
                                }));
                              }}
                              size="small"
                              helperText="The name of the field that will only be used and shown internally"
                            />
                          </Grid>
                          <Grid item xs={5}>
                            <TextField
                              fullWidth
                              label="Value"
                              name={`additionalDetails[${index}].value`}
                              value={detail.value}
                              onChange={(e) => {
                                const newDetails = [...newBusinessData.additionalDetails];
                                newDetails[index].value = e.target.value;
                                setNewBusinessData(prev => ({
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
                                const newDetails = [...newBusinessData.additionalDetails];
                                newDetails.splice(index, 1);
                                setNewBusinessData(prev => ({
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
            onClick={handleCreateBusiness} 
            variant="contained" 
            color="primary"
            disabled={saving || !newBusinessData.businessName}
            startIcon={saving ? <CircularProgress size={20} /> : <Add />}
          >
            {saving ? 'Creating...' : 'Create Business'}
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
          bgcolor: 'primary.main', 
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
                label="Field Name*"
                value={customField.name}
                onChange={(e) => setCustomField(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                required
                variant="outlined"
                placeholder="Enter field name"
                helperText="The name of the field that will only be used and shown internally"
                InputProps={{
                  style: { height: '56px' },
                  sx: { borderRadius: '8px' },
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business fontSize="small" color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Field Type*</InputLabel>
                <Select
                  value={customField.type}
                  onChange={(e) => setCustomField(prev => ({ ...prev, type: e.target.value }))}
                  label="Field Type*"
                  inputProps={{
                    style: { height: '56px' }
                  }}
                  sx={{ 
                    borderRadius: '8px',
                    height: '56px'
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <Category fontSize="small" color="primary" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="singleLineText">Single Line Text</MenuItem>
                  <MenuItem value="multiLineText">Multi Line Text</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="phone">Phone</MenuItem>
                  <MenuItem value="url">URL</MenuItem>
                  <MenuItem value="number">Number</MenuItem>
                  <MenuItem value="currency">Currency</MenuItem>
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="checkbox">Multiple Select: Checkbox</MenuItem>
                  <MenuItem value="multiDropdown">Multiple Select: Dropdown</MenuItem>
                </Select>
                <FormHelperText>Select the type of field you want to add</FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Label*"
                value={customField.label || ''}
                onChange={(e) => setCustomField(prev => ({ ...prev, label: e.target.value }))}
                fullWidth
                required
                variant="outlined"
                placeholder="Enter field label"
                InputProps={{
                  style: { height: '56px' },
                  sx: { borderRadius: '8px' },
                  startAdornment: (
                    <InputAdornment position="start">
                      <Label fontSize="small" color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            {/* Options for checkbox and multiDropdown types */}
            {(customField.type === 'checkbox' || customField.type === 'multiDropdown') && (
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    p: 2, 
                    mt: 1,
                    border: '1px solid',
                    borderColor: 'divider',
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
                        height: '36px'
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
                          p: 1.5,
                          borderRadius: '8px',
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={9}>
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
                                style: { height: '40px' },
                                sx: { borderRadius: '8px' },
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Business fontSize="small" color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            onClick={() => setOpenCustomFieldDialog(false)}
            variant="outlined"
            sx={{ 
              borderRadius: '8px',
              px: 3,
              py: 1
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
              px: 3,
              py: 1
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
              
              if (!customField.label) {
                setAlert({
                  open: true,
                  message: 'Please enter a field label',
                  severity: 'error'
                });
                return;
              }
              
              // Create the new custom field
              const newCustomField = {
                key: customField.name,
                value: '',
                type: customField.type,
                label: customField.label,
                options: customField.type === 'checkbox' || customField.type === 'multiDropdown' 
                  ? customField.options 
                  : []
              };
              
              // Add to additionalDetails
              setNewBusinessData(prev => ({
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
                label: '',
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

export default BusinessDetails;