import React, { useState, useRef } from 'react';
import {
  Box, Typography, Grid, Paper, Avatar, FormControl, Select,
  MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Snackbar, Alert, IconButton, InputLabel,
  Tooltip, Switch, FormControlLabel, Autocomplete, Collapse
} from '@mui/material';
import {
  CloudUpload, Save, Delete as DeleteIcon, Edit,
  ExpandMore, ExpandLess, Business, Category, Label
} from '@mui/icons-material';
import api from '../../services/api';
import countries from '../../utils/countries';
import countryStates from '../../utils/countryStates';

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
 * ClientDialog component for adding or editing client details
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when the dialog is closed
 * @param {Object} props.clientData - Client data for editing (null for adding new client)
 * @param {Function} props.onSave - Function to call when the client is saved
 * @param {boolean} props.isEditing - Whether the dialog is in edit mode
 */
const ClientDialog = ({
  open,
  onClose,
  clientData,
  onSave,
  isEditing = false
}) => {
  // State for client data
  const [formData, setFormData] = useState(clientData || {
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
    address: {
      addressLine: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      country: 'India',
      buildingNumber: '',
      streetAddress: ''
    },
    logo: null,
    additionalDetails: []
  });

  // States for collapsible sections
  const [taxInfoExpanded, setTaxInfoExpanded] = useState(true);
  const [addressExpanded, setAddressExpanded] = useState(true);
  const [additionalDetailsExpanded, setAdditionalDetailsExpanded] = useState(true);

  
  // State for custom field dialog
  const [openCustomFieldDialog, setOpenCustomFieldDialog] = useState(false);
  const [customFieldData, setCustomFieldData] = useState({ key: '', value: '' });
  const [editingFieldIndex, setEditingFieldIndex] = useState(-1);
  
  // State for saving and alerts
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [clientLogo, setClientLogo] = useState(null);
  const [logoLoading, setLogoLoading] = useState(false);

    const [businessId] = useState(generateBusinessId());

  
  // File input reference for logo upload
  const fileInputRef = useRef(null);
  
  // Toggle handlers for collapsible sections
  const toggleTaxInfoSection = () => {
    setTaxInfoExpanded(!taxInfoExpanded);
  };

  const generateBusinessId = () => {
    const bytes = new Uint8Array(12);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  };
  
  const toggleAddressSection = () => {
    setAddressExpanded(!addressExpanded);
  };
  
  const toggleAdditionalDetailsSection = () => {
    setAdditionalDetailsExpanded(!additionalDetailsExpanded);
  };
  
  // Handlers for custom fields
  const handleOpenCustomFieldDialog = (index = -1) => {
    if (index >= 0) {
      // Editing existing field
      const field = formData.additionalDetails[index];
      setCustomFieldData({ key: field.key, value: field.value });
      setEditingFieldIndex(index);
    } else {
      // Adding new field
      setCustomFieldData({ key: '', value: '' });
      setEditingFieldIndex(-1);
    }
    setOpenCustomFieldDialog(true);
  };
  
  const handleCloseCustomFieldDialog = () => {
    setOpenCustomFieldDialog(false);
    setCustomFieldData({ key: '', value: '' });
    setEditingFieldIndex(-1);
  };
  
  const handleCustomFieldInputChange = (e) => {
    const { name, value } = e.target;
    setCustomFieldData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveCustomField = () => {
    if (!customFieldData.key.trim()) {
      setAlert({
        open: true,
        message: 'Field name cannot be empty',
        severity: 'error'
      });
      return;
    }
    
    const newAdditionalDetails = [...formData.additionalDetails];
    
    if (editingFieldIndex >= 0) {
      // Update existing field
      newAdditionalDetails[editingFieldIndex] = customFieldData;
    } else {
      // Add new field
      newAdditionalDetails.push(customFieldData);
    }
    
    setFormData(prev => ({
      ...prev,
      additionalDetails: newAdditionalDetails
    }));
    
    handleCloseCustomFieldDialog();
  };
  
  const handleDeleteCustomField = (index) => {
    const newAdditionalDetails = [...formData.additionalDetails];
    newAdditionalDetails.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      additionalDetails: newAdditionalDetails
    }));
  };
  
  // Function to handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    // Handle nested address fields
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else if (type === 'checkbox') {
      // Handle checkbox/switch fields
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      // Handle regular fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Function to handle logo file selection
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
    
    // Set the logo file
    setFormData(prev => ({
      ...prev,
      logo: file
    }));
    
    // Create a local URL for preview
    setClientLogo(URL.createObjectURL(file));
  };
  
  // Function to handle saving the client
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Call the onSave callback with the form data
      await onSave(formData);
      
      // Close the dialog
      onClose();
    } catch (error) {
      console.error('Error saving client:', error);
      setAlert({
        open: true,
        message: 'Failed to save client',
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
  
  return (
    <>
      {/* Alert for success/error messages */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleAlertClose} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
      
      {/* Main Dialog */}
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth={false}
        PaperProps={{sx: { width: "770px", maxWidth: "95%" }}}
      >
        <DialogTitle>
          <Typography 
            variant="h6" 
            sx={{ 
              borderBottom: '1px solid',
              paddingBottom: 1,
              display: 'inline-block',
              width: '100%'
            }}
          >
            {isEditing ? 'Edit Client Details' : 'Add New Client'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" fontWeight="medium" sx={{ mt: 2, mb: 3 }}>
            Basic Client Details
          </Typography>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            {/* Row 1: Logo upload */}
            <Grid item xs={12}>
              <Box sx={{ mb: 3 }}>
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
                    minHeight: 180,
                    cursor: 'pointer',
                    borderStyle: 'dashed',
                    borderColor: formData.logo || clientLogo ? 'primary.main' : 'divider',
                    borderWidth: '2px',
                    borderRadius: '8px',
                    bgcolor: formData.logo || clientLogo ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'rgba(0, 0, 0, 0.02)'
                    },
                    width: "720px"
                  }}
                  onClick={() => fileInputRef.current.click()}
                >
                  {logoLoading ? (
                    <CircularProgress size={40} />
                  ) : (formData.logo || clientLogo) ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar
                        src={formData.logo ? URL.createObjectURL(formData.logo) : clientLogo}
                        alt="Client Logo"
                        sx={{ width: 100, height: 100, mb: 2 }}
                      />
                      {formData.logo && (
                        <>
                          <Typography variant="body2" color="textSecondary">
                            {formData.logo.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {(formData.logo.size / (1024 * 1024)).toFixed(2)} MB
                          </Typography>
                        </>
                      )}
                      <Button 
                        size="small" 
                        variant="outlined"
                        sx={{ 
                          mt: 1,
                          borderRadius: '8px'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, logo: null }));
                          setClientLogo(null);
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
            
            {/* Row 2: Business Name and Industry */}
            <Grid container spacing={2}>
              <Grid container item spacing={3} sx={{ mt: 1, mb: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                    Business Details
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Business Name"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={industryOptions}
                    value={formData.industry}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({
                        ...prev,
                        industry: newValue
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Industry"
                        name="industry"
                        fullWidth
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Business Alias (Optional)"
                    name="businessAlias"
                    value={formData.businessAlias}
                    onChange={handleInputChange}
                    variant="outlined"
                    helperText="An alternative name for this client"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Unique Key (Optional)"
                    name="uniqueKey"
                    value={formData.uniqueKey}
                    onChange={handleInputChange}
                    variant="outlined"
                    helperText="A unique identifier for this client"
                  />
                </Grid>
              </Grid>
              
              {/* Tax Information Section */}
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    pb: 1,
                    mt: 2,
                    cursor: 'pointer'
                  }}
                  onClick={toggleTaxInfoSection}
                >
                  <Typography variant="subtitle1" fontWeight="medium">
                    Tax Information
                  </Typography>
                  <IconButton size="small">
                    {taxInfoExpanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
                <Collapse in={taxInfoExpanded} timeout="auto" unmountOnExit>
                  <Box sx={{ py: 2 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="GSTIN"
                          name="gstin"
                          value={formData.gstin}
                          onChange={handleInputChange}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="PAN Number"
                          name="panNumber"
                          value={formData.panNumber}
                          onChange={handleInputChange}
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              </Grid>
              
              {/* Contact Information Section */}
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    pb: 1,
                    mt: 2
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="medium">
                    Contact Information
                  </Typography>
                </Box>
                <Box sx={{ py: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        variant="outlined"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.showEmailInInvoice}
                            onChange={handleInputChange}
                            name="showEmailInInvoice"
                            color="primary"
                          />
                        }
                        label="Show in invoice"
                        sx={{ mt: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        variant="outlined"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.showPhoneInInvoice}
                            onChange={handleInputChange}
                            name="showPhoneInInvoice"
                            color="primary"
                          />
                        }
                        label="Show in invoice"
                        sx={{ mt: 1 }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
              
              {/* Address Section */}
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    pb: 1,
                    mt: 2,
                    cursor: 'pointer'
                  }}
                  onClick={toggleAddressSection}
                >
                  <Typography variant="subtitle1" fontWeight="medium">
                    Address Details
                  </Typography>
                  <IconButton size="small">
                    {addressExpanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
                <Collapse in={addressExpanded} timeout="auto" unmountOnExit>
                  <Box sx={{ py: 2 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Building Number"
                          name="address.buildingNumber"
                          value={formData.address.buildingNumber}
                          onChange={handleInputChange}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Street Address"
                          name="address.streetAddress"
                          value={formData.address.streetAddress}
                          onChange={handleInputChange}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address Line"
                          name="address.addressLine"
                          value={formData.address.addressLine}
                          onChange={handleInputChange}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="City"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="District"
                          name="address.district"
                          value={formData.address.district}
                          onChange={handleInputChange}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel id="state-label">State</InputLabel>
                          <Select
                            labelId="state-label"
                            label="State"
                            name="address.state"
                            value={formData.address.state}
                            onChange={handleInputChange}
                          >
                            {countryStates.India.states.map(state => (
                              <MenuItem key={state} value={state}>
                                {state}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Pincode"
                          name="address.pincode"
                          value={formData.address.pincode}
                          onChange={handleInputChange}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel id="country-label">Country</InputLabel>
                          <Select
                            labelId="country-label"
                            label="Country"
                            name="address.country"
                            value={formData.address.country}
                            onChange={handleInputChange}
                          >
                            {countries.map(country => (
                              <MenuItem key={country.code} value={country.name}>
                                {country.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              </Grid>
              
              {/* Additional Details Section */}
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    pb: 1,
                    mt: 2,
                    cursor: 'pointer'
                  }}
                  onClick={toggleAdditionalDetailsSection}
                >
                  <Typography variant="subtitle1" fontWeight="medium">
                    Additional Details
                  </Typography>
                  <IconButton size="small">
                    {additionalDetailsExpanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
                <Collapse in={additionalDetailsExpanded} timeout="auto" unmountOnExit>
                  <Box sx={{ py: 2 }}>
                    {formData.additionalDetails.length > 0 ? (
                      <Grid container spacing={2}>
                        {formData.additionalDetails.map((field, index) => (
                          <Grid item xs={12} key={index}>
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 2,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <Box>
                                <Typography variant="subtitle2">{field.key}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {field.value}
                                </Typography>
                              </Box>
                              <Box>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenCustomFieldDialog(index)}
                                  sx={{ mr: 1 }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteCustomField(index)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        No additional details added yet.
                      </Typography>
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => handleOpenCustomFieldDialog()}
                      sx={{ mt: 2 }}
                    >
                      Add Custom Field
                    </Button>
                  </Box>
                </Collapse>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            onClick={onClose}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <Save />}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Custom Field Dialog */}
      <Dialog
        open={openCustomFieldDialog}
        onClose={handleCloseCustomFieldDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '8px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2
        }}>
          {editingFieldIndex >= 0 ? 'Edit Custom Field' : 'Add Custom Field'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Field Name"
                name="key"
                value={customFieldData.key}
                onChange={handleCustomFieldInputChange}
                variant="outlined"
                required
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Field Value"
                name="value"
                value={customFieldData.value}
                onChange={handleCustomFieldInputChange}
                variant="outlined"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            onClick={handleCloseCustomFieldDialog}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveCustomField}
            startIcon={<Save />}
          >
            Save Field
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClientDialog;