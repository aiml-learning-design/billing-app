import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardContent,
  CircularProgress, Divider, Chip, Alert, List, ListItem,
  ListItemIcon, ListItemText, Paper, Avatar, FormControl, Select,
  MenuItem, Pagination, Stack, IconButton, Collapse, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, OutlinedInput, InputLabel,
  FormHelperText, InputAdornment, Snackbar, DialogContentText
} from '@mui/material';
import {
  Receipt, Description, MonetizationOn,
  Business, ListAlt, Add, Store, Person,
  Email, Phone, LocationOn, ExpandMore, ExpandLess,
  Save, CloudUpload, Edit, Delete
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { UI_CONFIG, API_CONFIG } from '../config/config';
import countries from '../utils/countries';
import countryStates from '../utils/countryStates';

const BusinessDetailsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businessDetails, setBusinessDetails] = useState(null);
  const [allBusinesses, setAllBusinesses] = useState([]);

  // Pagination states
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Refs to prevent duplicate API calls
  const apiCallRef = useRef({
    inProgress: false,
    lastPage: -1,
    lastSize: -1,
    callCount: 0
  });

  // State to track which business cards are expanded
  const [expandedBusinesses, setExpandedBusinesses] = useState(new Set());

  // State to track if the Business Details section is expanded
  // Set to true by default so business logos are loaded when the page loads
  const [businessSectionExpanded, setBusinessSectionExpanded] = useState(true);

  // State to store business logo URLs
  const [businessLogoUrls, setBusinessLogoUrls] = useState({});

  // Edit dialog states
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editBusinessData, setEditBusinessData] = useState({
    businessId: '',
    businessName: '',
    gstin: '',
    panNumber: '',
    email: '',
    phone: '',
    address: {
        email:'',
        phone:'',
      addressLine: '',
      city: '',
      state: '',
      pincode: '',
      country: ''
    },
    logo: null
  });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [businessLogo, setBusinessLogo] = useState(null);
  const [logoLoading, setLogoLoading] = useState(false);

    // Delete dialog states
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [businessToDelete, setBusinessToDelete] = useState(null);

  // File input reference for logo upload
  const fileInputRef = useRef(null);

  // Helper function to get businesses from user data
  const getBusinessesFromUser = (userData) => {
    // Check different possible locations for businesses data
    if (userData?.businesses && userData.businesses.length > 0) {
      // Direct access (JWT token structure)
      console.log('Found businesses in direct access');
      return userData.businesses;
    } else if (userData?.userDto?.businesses && userData.userDto.businesses.length > 0) {
      // Nested access via userDto (email/password login)
      console.log('Found businesses in userDto');
      return userData.userDto.businesses;
    } else if (userData?.user?.userDto?.businesses && userData.user.userDto.businesses.length > 0) {
      // Nested access via user.userDto (Google auth)
      console.log('Found businesses in user.userDto');
      return userData.user.userDto.businesses;
    }
    return null;
  };

  // Set selected business when user data is loaded or from localStorage
  useEffect(() => {
    console.log('BusinessDetails: User data changed', user);

    // First try to get business details from localStorage (for newly created businesses)
    const storedBusinessDetails = localStorage.getItem('businessDetails');
    const userBusinesses = getBusinessesFromUser(user);

    console.log('User businesses:', userBusinesses);

    if (storedBusinessDetails) {
      try {
        const parsedBusinessDetails = JSON.parse(storedBusinessDetails);
        console.log('Found stored business details:', parsedBusinessDetails);
        setBusinessDetails(parsedBusinessDetails);

        // If user data is also available, update the selected business
        if (userBusinesses) {
          // Find the business in userBusinesses that matches the stored business ID
          const matchingBusiness = userBusinesses.find(
            b => b.business_id === parsedBusinessDetails.businessId ||
                 b.businessId === parsedBusinessDetails.businessId
          );

          // If found, use it; otherwise use the first business
          setSelectedBusiness(matchingBusiness || userBusinesses[0]);
        }
      } catch (error) {
        console.error('Error parsing business details from localStorage:', error);
        // Fall back to user data if available
        if (userBusinesses) {
          setSelectedBusiness(userBusinesses[0]);
        }
      }
    } else if (userBusinesses) {
      // If no localStorage data, use user data
      setSelectedBusiness(userBusinesses[0]);
    }
  }, [user]);

  // Effect to ensure page is valid when totalPages changes
  useEffect(() => {
    // If current page is beyond the total pages, reset to the last page
    if (totalPages > 0 && page >= totalPages) {
      console.log('Current page is beyond total pages, resetting to last page');
      setPage(totalPages - 1);
    }
  }, [totalPages, page]);

  // Effect to preload business logos when allBusinesses changes
  useEffect(() => {
    if (allBusinesses.length > 0) {
      console.log('Businesses loaded, preloading business logos');
      preloadBusinessLogos(allBusinesses);
    }
  }, [allBusinesses]);

  useEffect(() => {
    const fetchData = async () => {
      // Check if we're already making this exact API call
      if (apiCallRef.current.inProgress &&
          apiCallRef.current.lastPage === page &&
          apiCallRef.current.lastSize === size) {
        console.log('Skipping duplicate API call - call already in progress with same parameters');
        return;
      }

      // Check if we've already made this exact API call
      if (apiCallRef.current.lastPage === page &&
          apiCallRef.current.lastSize === size &&
          apiCallRef.current.callCount > 0) {
        console.log('Skipping duplicate API call - already called with same parameters');
        return;
      }

      // Mark that we're starting an API call
      apiCallRef.current.inProgress = true;
      apiCallRef.current.lastPage = page;
      apiCallRef.current.lastSize = size;
      apiCallRef.current.callCount++;

      console.log('API call count:', apiCallRef.current.callCount);

      setLoading(true);
      setError(null);
      try {
        console.log('Fetching business details from API with pagination', { page, size });

        // Use the vendor API endpoint
        const endpoint = API_CONFIG.ENDPOINTS.BUSINESS.GET_SELF_DETAILS;

        console.log('Using endpoint:', endpoint);

        const businessResponse = await api.get(`${endpoint}?page=${page}&size=${size}`);

        console.log('Business details response:', businessResponse);

        // Check if the response is successful and contains data
        if (businessResponse.success && businessResponse.data) {
          try {
            // Extract paginated data
            const paginatedData = businessResponse.data;
            console.log('Paginated data:', paginatedData);

            // Check if the response has the expected Page structure
            if (paginatedData && typeof paginatedData === 'object') {
              let businesses = [];
              let totalPagesValue = 0;
              let totalElementsValue = 0;

              // Case 1: Standard Spring Data Page object
              if (Array.isArray(paginatedData.content)) {
                console.log('Found standard Page structure with content array');
                businesses = paginatedData.content;
                totalPagesValue = paginatedData.totalPages || 0;
                totalElementsValue = paginatedData.totalElements || 0;
              }
              // Case 2: Direct array of businesses
              else if (Array.isArray(paginatedData)) {
                console.log('Found direct array of businesses');
                businesses = paginatedData;
                totalPagesValue = Math.ceil(paginatedData.length / size) || 1;
                totalElementsValue = paginatedData.length;
              }
              // Case 3: Single business object
              else if (paginatedData.businessId || paginatedData.businessName) {
                console.log('Found single business object');
                businesses = [paginatedData];
                totalPagesValue = 1;
                totalElementsValue = 1;
              }
              // Case 4: Custom pagination structure
              else if (paginatedData.businesses && Array.isArray(paginatedData.businesses)) {
                console.log('Found custom pagination structure with businesses array');
                businesses = paginatedData.businesses;
                totalPagesValue = paginatedData.pages || paginatedData.totalPages || Math.ceil(businesses.length / size) || 1;
                totalElementsValue = paginatedData.total || paginatedData.totalElements || businesses.length;
              }
              // Case 5: Empty or unexpected response
              else {
                console.warn('Unexpected response format, defaulting to empty array');
                businesses = [];
                totalPagesValue = 0;
                totalElementsValue = 0;
              }

              console.log('Setting all businesses:', businesses);
              console.log('Pagination metadata:', { totalPages: totalPagesValue, totalElements: totalElementsValue });

              setAllBusinesses(businesses);
              setTotalPages(totalPagesValue);
              setTotalElements(totalElementsValue);

              // If there are businesses, set the first one as selected
              if (Array.isArray(businesses) && businesses.length > 0) {
                console.log('Setting selected business to first business:', businesses[0]);
                setSelectedBusiness(businesses[0]);
                setBusinessDetails(businesses[0]);
              } else {
                console.log('No businesses found in response');
              }
            } else {
              console.error('Invalid response data format:', paginatedData);
              throw new Error('Invalid response data format');
            }
          } catch (parseError) {
            console.error('Error parsing paginated data:', parseError);
            setAllBusinesses([]);
            setTotalPages(0);
            setTotalElements(0);
            throw new Error('Failed to parse business data: ' + parseError.message);
          }
        } else {
          console.error('Invalid business details response format:', businessResponse);
          throw new Error('Failed to load business details');
        }
      } catch (err) {
        console.error('Business details loading error:', err);

        // Log more detailed error information
        console.error('Error details:', {
          name: err.name,
          message: err.message,
          stack: err.stack,
          response: err.response ? {
            status: err.response.status,
            statusText: err.response.statusText,
            data: err.response.data
          } : 'No response data',
          request: err.request ? 'Request exists but no response received' : 'No request data'
        });

        // Set a more descriptive error message
        let errorMessage = 'Failed to load business details';

        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorMessage += `: Server responded with ${err.response.status} - ${err.response.statusText || 'Unknown status'}`;

          // Try to extract more specific error message from response data
          if (err.response.data) {
            if (typeof err.response.data === 'string') {
              errorMessage += ` - ${err.response.data}`;
            } else if (err.response.data.message) {
              errorMessage += ` - ${err.response.data.message}`;
            } else if (err.response.data.error) {
              errorMessage += ` - ${err.response.data.error}`;
            }
          }
        } else if (err.request) {
          // The request was made but no response was received
          errorMessage += ': No response received from server';
        } else {
          // Something happened in setting up the request that triggered an Error
          errorMessage += `: ${err.message || 'Unknown error'}`;
        }

        setError(errorMessage);
      } finally {
        // Mark that the API call is no longer in progress
        apiCallRef.current.inProgress = false;
        setLoading(false);
      }
    };
    fetchData();
  }, [page, size]); // Re-fetch when page or size changes

  // Handle page change for pagination
  const handlePageChange = (event, newPage) => {
    // MUI Pagination is 1-indexed, but our API is 0-indexed
    setPage(newPage - 1);
  };

  // Handle size change for pagination
  const handleSizeChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setSize(newSize);
    setPage(0); // Reset to first page when changing page size
  };

  // Toggle expansion state of a business card
  const toggleBusinessExpansion = (businessId) => {
    setExpandedBusinesses(prevExpanded => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(businessId)) {
        newExpanded.delete(businessId);
      } else {
        newExpanded.add(businessId);
      }
      return newExpanded;
    });
  };

  // Toggle expansion state of the Business Details section
  const toggleBusinessSectionExpansion = () => {
    setBusinessSectionExpanded(!businessSectionExpanded);
  };

  // Function to handle adding a new business
  const handleAddBusiness = () => {
    // Navigate to business setup page with business context
    navigate('/business-setup?context=vendor');
  };

  // Function to handle editing a business
  const handleEditBusiness = (business) => {
    console.log('Editing business:', business);

    // Prepare business data for editing
    const businessData = {
      businessId: business.businessId || business.business_id,
      businessName: business.businessName || business.business_name || '',
      gstin: business.gstin || '',
      panNumber: business.panNumber || business.pan || '',
      email: business.email || '',
      phone: business.phone || '',
      address: {
      email: business.address?.email || '',
      phone: business.address?.phone || '',
        addressLine: business.address?.addressLine || '',
        city: business.address?.city || '',
        state: business.address?.state || '',
        pincode: business.address?.pincode || '',
        country: business.address?.country || 'India'
      },
      logo: null
    };

    // Set the edit business data
    setEditBusinessData(businessData);

    // Fetch business logo
  //  fetchBusinessLogo(businessData.businessId);

    // Open the edit dialog
    setOpenEditDialog(true);
  };

    // Function to handle delete business confirmation
    const handleDeleteBusiness = (business) => {
      console.log('Preparing to delete business:', business);
      setBusinessToDelete(business);
      setOpenDeleteDialog(true);
    };

    // Function to confirm and execute business deletion
    const confirmDeleteBusiness = async () => {
      if (!businessToDelete) return;

      try {
        setDeleting(true);
        const businessId = businessToDelete.businessId || businessToDelete.business_id;

        console.log(`Deleting business with ID: ${businessId}`);

        // Call the delete API
        const response = await api.delete(`/api/vendor/business/delete/${businessId}`);

        if (response.success) {
          setAlert({
            open: true,
            message: 'Business deleted successfully',
            severity: 'success'
          });

          // Remove the deleted business from the list
          setAllBusinesses(prevBusinesses =>
            prevBusinesses.filter(business =>
              (business.businessId || business.business_id) !== businessId
            )
          );

          // Update total elements count
          setTotalElements(prev => prev - 1);

          // If we're on a page that might now be empty, adjust the page
          if (allBusinesses.length === 1 && page > 0) {
            setPage(page - 1);
          }
        } else {
          throw new Error(response.message || 'Failed to delete business');
        }
      } catch (error) {
        console.error('Error deleting business:', error);
        setAlert({
          open: true,
          message: 'Failed to delete business: ' + (error.response?.data?.message || error.message),
          severity: 'error'
        });
      } finally {
        setDeleting(false);
        setOpenDeleteDialog(false);
        setBusinessToDelete(null);
      }
    };

    // Function to cancel business deletion
    const cancelDeleteBusiness = () => {
      setOpenDeleteDialog(false);
      setBusinessToDelete(null);
    };

  // Function to fetch business logo
  const fetchBusinessLogo = async (businessId) => {
    if (!businessId) return;

    try {
      setLogoLoading(true);

      // Get the authentication token from localStorage
      const token = localStorage.getItem('token');

      // Construct the URL for fetching the logo
      const logoUrl = `${API_CONFIG.BASE_URL}/api/v1/media/load?keyIdentifier=${businessId}&assetType=BUSINESS_LOGO`;

      // Make an authenticated request to fetch the logo
      console.log(`Adding authorization header for fetchBusinessLogo: Bearer ${token ? token.substring(0, 10) + '...' : 'undefined'}`);

      const response = await fetch(logoUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch logo: ${response.status} ${response.statusText}`);
      }

      // Create a blob URL from the response
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      // Set the logo URL to the blob URL
      setBusinessLogo(objectUrl);
    } catch (error) {
      console.error('Error fetching business logo:', error);
      setBusinessLogo(null);
    } finally {
      setLogoLoading(false);
    }
  };

  // Function to preload business logos
  const preloadBusinessLogos = async (businesses) => {
    if (!businesses || businesses.length === 0) return;

    console.log('Preloading business logos for businesses:', businesses);

    // Get the authentication token from localStorage
    const token = localStorage.getItem('token');

    // Create a new object to store logo URLs
    const logoUrls = {};

    // Use Promise.all to wait for all logo fetches to complete
    await Promise.all(businesses.map(async (business) => {
      const businessId = business.businessId || business.business_id;
      if (!businessId) return;

      // Make a direct API call to load the logo
      const logoUrl = `${API_CONFIG.BASE_URL}/api/v1/media/load?keyIdentifier=${businessId}&assetType=BUSINESS_LOGO`;

      console.log(`Preloading logo for business ${businessId} from URL: ${logoUrl}`);

      try {
                  const response = await fetch(logoUrl, {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });

                  console.log(
                    `Fetch response for logo ${businessId}:`,
                    response.status,
                    response.statusText
                  );

                  if (!response.ok) {
                    throw new Error(`Failed to fetch logo: ${response.status} ${response.statusText}`);
                  }

                  // ---- OPTION 1: If backend returns JSON with base64 ----
                  if (response.headers.get("content-type")?.includes("application/json")) {
                    const json = await response.json();
                    const base64Data = typeof json.data?.assetData === "string"
                      ? json.data.assetData
                      : (json.data?.assetData || []).join("");
                   if (!base64Data) return;
                    logoUrls[businessId] = `data:${json.data?.contentType};base64,${base64Data}`;
                    console.log(`Created base64 logo for business ${businessId}`);
                  }
                  // ---- OPTION 2: If backend returns raw image (Blob) ----
                  else {
                    const blob = await response.blob();
                    if (blob.size > 0) {
                      const objectUrl = URL.createObjectURL(blob);
                      logoUrls[businessId] = objectUrl;
                      console.log(`Created blob URL for business ${businessId}: ${objectUrl}`);
                    }
                  }
                } catch (error) {
        console.error(`Fetch error for logo ${businessId}:`, error);
      }
    }));

    // Update the state with all logo URLs
    setBusinessLogoUrls(logoUrls);
    console.log('Updated business logo URLs:', logoUrls);
  };

  // Function to handle input changes in the edit form
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested address fields
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setEditBusinessData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      // Handle regular fields
      setEditBusinessData(prev => ({
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
    setEditBusinessData(prev => ({
      ...prev,
      logo: file
    }));

    // Create a local URL for preview
    setBusinessLogo(URL.createObjectURL(file));
  };

  // Function to handle updating a business
  const handleUpdateBusiness = async () => {
    try {
      setSaving(true);

      // Prepare data for API
      const businessData = {
        businessId: editBusinessData.businessId,
        businessName: editBusinessData.businessName, // Business name
        gstin: editBusinessData.gstin,
        panNumber: editBusinessData.panNumber,
        email: editBusinessData.email,
        phone: editBusinessData.phone,
        address: editBusinessData.address
      };

      // Handle logo upload if a logo was selected
      if (editBusinessData.logo && editBusinessData.logo instanceof File) {
        // Create a FormData object for file upload
        const formData = new FormData();
        formData.append('file', editBusinessData.logo);
        formData.append('businessId', editBusinessData.businessId);

        try {
          // Upload the logo first
         // const logoResponse = await api.post('/api/v1/media/upload', formData, {
          const logoResponse = await api.post(`${API_CONFIG.BASE_URL}/api/v1/media/upload?keyIdentifier=${editBusinessData.businessId}&assetType=BUSINESS_LOGO&assetName=CompanyLogo`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          // If logo upload was successful, add the logo URL to the business data
          if (logoResponse.success && logoResponse.data && logoResponse.data.logoUrl) {
            businessData.logoUrl = logoResponse.data.logoUrl;
          }
        } catch (logoError) {
          console.error('Error uploading logo:', logoError);
          // Continue with business update even if logo upload fails
        }
      }

    //  Log the payload to verify data
      console.log('Updating business with data:', businessData);

      // Call API to update business
      const response = await api.put('/api/vendor/business/update/'+businessData.businessId, businessData);

      // Update the business in the list
      const updatedVendor = response.data;
      console.log('Business updated:', updatedVendor);

      // Update the business in allBusinesses
      setAllBusinesses(prevBusinesses => {
        return prevBusinesses.map(business => {
          if (business.businessId === updatedVendor.businessId ||
              business.business_id === updatedVendor.businessId) {
            return updatedVendor;
          }
          return business;
        });
      });

      setAlert({
        open: true,
        message: 'Business updated successfully',
        severity: 'success'
      });

      // Close the edit dialog
      setOpenEditDialog(false);
    } catch (error) {
      console.error('Error updating business:', error);
      setAlert({
        open: true,
        message: 'Failed to update business',
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
    <Box sx={{ p: 3 }}>
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

            {/* Delete Confirmation Dialog */}
            <Dialog
              open={openDeleteDialog}
              onClose={cancelDeleteBusiness}
              aria-labelledby="delete-dialog-title"
              aria-describedby="delete-dialog-description"
            >
              <DialogTitle id="delete-dialog-title">
               <center> Confirm Delete </center>
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="delete-dialog-description">
                  <center><strong style={{ color: '#8B0000' }}>Are you sure you want to DELETE </strong></center>
                   <center><strong>➤ {businessToDelete?.businessName} </strong></center>
<br />
                  <em style={{ fontSize: '0.875rem', color: '#555' }}>
                      Once deleted, this business cannot be retrieved.
                    </em>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={cancelDeleteBusiness} disabled={deleting}>
                  No, Cancel
                </Button>
                <Button
                  onClick={confirmDeleteBusiness}
                  disabled={deleting}
                  color="error"
                  variant="contained"
                  autoFocus
                >
                  {deleting ? <CircularProgress size={20} /> : 'Yes, Delete'}
                </Button>
              </DialogActions>
            </Dialog>

      {/* Edit business Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Business Details</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* business Logo */}
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  border: '1px dashed #ccc',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 2,
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {logoLoading ? (
                  <CircularProgress size={40} />
                ) : businessLogo ? (
                  <img
                    src={businessLogoUrls[editBusinessData.businessId]}
                    alt="Business Logo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      console.error('Error loading logo');
                      e.target.src = 'https://via.placeholder.com/150?text=No+Logo';
                    }}
                  />
                ) : (
                  <Business sx={{ fontSize: 60, color: 'text.secondary' }} />
                )}
              </Box>
              <input
                type="file"
                accept="image/jpeg, image/png"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleLogoChange}
              />
              <Button
                variant="outlined"
                startIcon={<CloudUpload />}
                onClick={() => fileInputRef.current.click()}
                sx={{ mb: 2 }}
              >
                Upload Logo
              </Button>
            </Grid>

            {/* Business Details Form */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Business Name"
                    name="businessName"
                    value={editBusinessData.businessName}
                    onChange={handleEditInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="GSTIN"
                    name="gstin"
                    value={editBusinessData.gstin}
                    onChange={handleEditInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="PAN Number"
                    name="panNumber"
                    value={editBusinessData.panNumber}
                    onChange={handleEditInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={editBusinessData.email}
                    onChange={handleEditInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={editBusinessData.phone}
                    onChange={handleEditInputChange}
                  />
                </Grid>
              </Grid>
            </Grid>

                          {/* Office Address Section */}
                          <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                              Address Details
                            </Typography>

                            <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                              <Grid container spacing={2}>
                                {/* Email */}
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                      fullWidth
                                      label="Email"
                                      name="primaryEmail"
                                      value={editBusinessData.address.email}
                                      onChange={handleEditInputChange}
                                      />
                                </Grid>

                                {/* Phone */}
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="Phone"
                                    name="phone"
                                      value={editBusinessData.address.phone}
                                      onChange={handleEditInputChange}
                                  />
                                </Grid>

                                {/* Address Line */}
                                <Grid item xs={12}>
                                                  <TextField
                                                    fullWidth
                                                    label="Address Line"
                                                    name="address.addressLine"
                                                    value={editBusinessData.address.addressLine}
                                                    onChange={handleEditInputChange}
                                                  />
                                                </Grid>

                                {/* City */}
                                <Grid item xs={12} md={6}>
                                                  <TextField
                                                    fullWidth
                                                    label="City"
                                                    name="address.city"
                                                    value={editBusinessData.address.city}
                                                    onChange={handleEditInputChange}
                                                  />
                                 </Grid>

                                {/* State - Only shown if country has states */}
                                <Grid item xs={12} md={6}>
                                                  <TextField
                                                    fullWidth
                                                    label="State"
                                                    name="address.state"
                                                    value={editBusinessData.address.state}
                                                    onChange={handleEditInputChange}
                                                  />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                  <TextField
                                                    fullWidth
                                                    label="Pincode"
                                                    name="address.pincode"
                                                    value={editBusinessData.address.pincode}
                                                    onChange={handleEditInputChange}
                                                  />
                                                </Grid>



                                {/* Country */}
                                <Grid item xs={12} md={6}>
                                                  <FormControl fullWidth>
                                                    <InputLabel id="country-label">Country</InputLabel>
                                                    <Select
                                                      labelId="country-label"
                                                      name="address.country"
                                                      value={editBusinessData.address.country}
                                                      onChange={handleEditInputChange}
                                                      label="Country"
                                                    >
                                                      {countries.map((country) => (
                                                        <MenuItem key={country.code} value={country.name}>
                                                          {country.name}
                                                        </MenuItem>
                                                      ))}
                                                    </Select>
                                                  </FormControl>
                                                </Grid>
                              </Grid>
                            </Box>
                          </Grid>
                          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateBusiness}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <Save />}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>


      {/* Page Header with Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Business Details
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Business />}
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="outlined"
            startIcon={<Receipt />}
            onClick={() => navigate('/invoices/new-invoice')}
          >
            Back to Invoice
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Your Businesses
            </Typography>
            <IconButton
              onClick={toggleBusinessSectionExpansion}
              aria-expanded={businessSectionExpanded}
              aria-label="toggle business details"
              sx={{
                color: '#000000',
                bgcolor: 'rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.15)',
                  border: '1px solid rgba(0, 0, 0, 0.3)'
                },
                padding: 1,
                fontWeight: 'bold'
              }}
            >
              {businessSectionExpanded ? <ExpandLess sx={{ fontSize: 28 }} /> : <ExpandMore sx={{ fontSize: 28 }} />}
            </IconButton>
          </Box>

          <Collapse in={businessSectionExpanded} timeout="auto">
            {allBusinesses.length === 0 ? (
              <Card sx={{ mb: 3, p: 2 }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Store sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    No Business Details Available
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    You haven't added any business details yet. Add your business details to get started.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Add />}
                    onClick={() => navigate('/business-setup?context=business')}
                  >
                    Add Business Details
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {allBusinesses.map((business, index) => {
                  const businessId = business.businessId || business.business_id;
                  const isExpanded = expandedBusinesses.has(businessId);

                  return (
                    <Grid item xs={12} md={6} key={index}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          {/* Card header with business name, logo, and expand/collapse button */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box
                                sx={{
                                  width: 50,
                                  height: 50,
                                  borderRadius: '50%',
                                  border: '1px solid #eee',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  mr: 2,
                                  overflow: 'hidden'
                                }}
                              >
                                <img
                                  src={businessLogoUrls[businessId]}
                                  alt=""
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.target.src = '';
                                    e.target.style.display = 'none';
                                    // Add null check before accessing parentElement
                                    if (e.target.parentElement) {
                                      e.target.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" fill="#757575"/></svg>';
                                    }
                                  }}
                                />
                              </Box>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {business.businessName}
                              </Typography>
                            </Box>
                            <IconButton
                              onClick={() => toggleBusinessExpansion(businessId)}
                              aria-expanded={isExpanded}
                              aria-label="show more"
                            >
                              {isExpanded ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          </Box>

                          {/* Always show minimal info */}
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                              {business.gstin ? "GSTIN:" : "PAN:"}
                            </Typography>
                            <Typography variant="body1">
                              {business.gstin || business.panNumber || business.pan || "Not provided"}
                            </Typography>
                          </Box>

                          {/* Collapsible detailed info */}
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                              {business.gstin && (business.panNumber || business.pan) && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                                    PAN:
                                  </Typography>
                                  <Typography variant="body1">
                                    {business.panNumber || business.pan}
                                  </Typography>
                                </Box>
                              )}

                              {business.email && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                                    Email:
                                  </Typography>
                                  <Typography variant="body1">
                                    {business.email}
                                  </Typography>
                                </Box>
                              )}

                              {business.phone && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                                    Phone:
                                  </Typography>
                                  <Typography variant="body1">
                                    {business.phone}
                                  </Typography>
                                </Box>
                              )}

                              {/* Display address from business.address (new structure) or business.officeAddress (old structure) */}
                              {(business.address || business.officeAddress) && (
                                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                                    Address:
                                  </Typography>
                                  <Typography variant="body1">
                                    {business.address && (
                                      <>
                                        {business.address.email && (
                                          <div><b>Email:</b> {business.address.email}</div>
                                        )}
                                        {business.address.phone && (
                                          <div><b>Phone:</b> {business.address.phone}</div>
                                        )}
                                        {business.address.addressLine && (
                                          <div><b>Address Line:</b> {business.address.addressLine}</div>
                                        )}
                                        {business.address.city && (
                                          <div><b>City:</b> {business.address.city}</div>
                                        )}
                                        {business.address.state && (
                                          <div><b>State:</b> {business.address.state}</div>
                                        )}
                                        {business.address.pincode && (
                                          <div><b>PIN:</b> {business.address.pincode}</div>
                                        )}
                                        {business.address.country && (
                                          <div><b>Country:</b> {business.address.country}</div>
                                        )}
                                      </>
                                    )}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Collapse>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                          <Button
                            variant="contained"
                            sx={{ mt: 2 }}
                            startIcon={<Edit />}
                            onClick={() => handleEditBusiness(business)}
                          >
                            Edit Business
                          </Button>
                          <Button
                                variant="outlined"
                                sx={{ mt: 2 , flex: 1}}
                                color="error"
                                startIcon={<Delete />}
                                onClick={() => handleDeleteBusiness(business)}
                             //   sx={{ flex: 1 }}
                              >
                                Delete Business
                              </Button>
                              </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}

                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 3 }}>
                    <Store sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Add New Business
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
                      Create a new business profile to manage your business details.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={handleAddBusiness}
                    >
                      Add Business
                    </Button>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Pagination controls - only show when there are businesses */}
            {allBusinesses.length > 0 && totalElements > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 3 }}>
                <Stack spacing={2} alignItems="center">
                  {totalPages > 1 && (
                    <Pagination
                      count={totalPages || 1}
                      page={page + 1} // Convert from 0-indexed to 1-indexed
                      onChange={handlePageChange}
                      color="primary"
                      showFirstButton
                      showLastButton
                      disabled={loading}
                    />
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Rows per page:
                    </Typography>
                    <FormControl size="small">
                      <Select
                        value={size}
                        onChange={handleSizeChange}
                        disabled={loading}
                      >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                      </Select>
                    </FormControl>

                    <Typography variant="body2" color="text.secondary">
                      Showing {Math.min(size * page + 1, totalElements)} - {Math.min(size * (page + 1), totalElements)} of {totalElements} businesses
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}
          </Collapse>
        </>
      )}
    </Box>
  );
};

export default BusinessDetailsPage;