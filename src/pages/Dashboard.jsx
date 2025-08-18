import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box, Typography, Button, Grid, Card, CardContent,
  CircularProgress, Divider, Chip, Alert, List, ListItem,
  ListItemIcon, ListItemText, Paper, Avatar, FormControl, Select,
  MenuItem, Pagination, Stack, IconButton, Collapse
} from '@mui/material';
import {
  Receipt, Description, MonetizationOn,
  Business, ListAlt, Add, Store, Person,
  Email, Phone, LocationOn, ExpandMore, ExpandLess
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UI_CONFIG, API_CONFIG } from '../config/config';

const Dashboard = () => {
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
  // State to track which business cards are expanded
  const [expandedBusinesses, setExpandedBusinesses] = useState(new Set());
  
  // State to track if the Business Details section is expanded
  const [businessSectionExpanded, setBusinessSectionExpanded] = useState(false);
  
  // Handle size change for pagination
  const handleSizeChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setSize(newSize);
    setPage(0); // Reset to first page when changing page size
  };

  // Set selected business when user data is loaded or from localStorage
  useEffect(() => {
    // First try to get business details from localStorage (for newly created businesses)
    const storedBusinessDetails = localStorage.getItem('businessDetails');
    
    if (storedBusinessDetails) {
      try {
        const parsedBusinessDetails = JSON.parse(storedBusinessDetails);
        
        setBusinessDetails(parsedBusinessDetails);
        
        // If user data is also available, update the selected business
        if (user?.businesses && user.businesses.length > 0) {
          // Find the business in user.businesses that matches the stored business ID
          const matchingBusiness = user.businesses.find(
            b => b.business_id === parsedBusinessDetails.businessId
          );
          
          // If found, use it; otherwise use the first business
          setSelectedBusiness(matchingBusiness || user.businesses[0]);
        }
      } catch (error) {
        console.error('Error parsing business details from localStorage:', error);
        // Fall back to user data if available
        if (user?.businesses && user.businesses.length > 0) {
          setSelectedBusiness(user.businesses[0]);
        }
      }
    } else if (user?.businesses && user.businesses.length > 0) {
      // If no localStorage data, use user data
      setSelectedBusiness(user.businesses[0]);
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching business details from API with pagination', { page, size });
        
        // Call the business details API with pagination parameters
        const businessResponse = await api.get(`${API_CONFIG.ENDPOINTS.BUSINESS.GET_ALL}?page=${page}&size=${size}`);
        
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
        console.error('Dashboard data loading error:', err);
        
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
        let errorMessage = 'Failed to load dashboard data';
        
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
        setLoading(false);
      }
    };
    fetchData();
  }, [page, size]); // Re-fetch when page or size changes

  // Map icon strings from config to actual icon components
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'Receipt': return <Receipt />;
      case 'Description': return <Description />;
      case 'MonetizationOn': return <MonetizationOn />;
      case 'Person': return <Person />;
      case 'Store': return <Store />;
      case 'ListAlt': return <ListAlt />;
      case 'Business': return <Business />;
      default: return <Description />;
    }
  };
  
  // Handle page change for pagination
  const handlePageChange = (event, newPage) => {
    // MUI Pagination is 1-indexed, but our API is 0-indexed
    setPage(newPage - 1);
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

  // Use menu items from config
  const menuItems = UI_CONFIG.MENU_ITEMS.map(item => ({
    text: item.text,
    icon: getIconComponent(item.icon),
    new: item.new,
    onClick: item.route ? () => navigate(item.route) : undefined
  }));

  const quickActions = [
    {
      title: 'Create Invoice',
      description: 'Generate a new invoice for your client',
      icon: <Receipt fontSize="large" />,
      action: () => navigate('/invoices/new-invoice'),
      buttonText: 'Create'
    },
    {
      title: 'Manage Business',
      description: 'Update your business details and settings',
      icon: <Business fontSize="large" />,
      action: () => navigate('/profile'),
      buttonText: 'Manage'
    },
    {
      title: 'Bank Details',
      description: 'Manage your bank accounts and payment methods',
      icon: <MonetizationOn fontSize="large" />,
      action: () => navigate('/bank-details'),
      buttonText: 'Manage'
    }
  ];

  const getUserName = () => {
    if (!user) return 'USER';
    return [user.firstName, user.middleName, user.lastName]
      .filter(name => name && name.trim() !== '')
      .join(' ')
      .toUpperCase();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Paper 
        className="dashboard-sidebar"
        sx={{
          borderRadius: 0,
          boxShadow: 2,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'var(--parrot-green)',
          color: 'white',
          width: '60px',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          '&:hover': {
            width: '250px'
          }
        }}
      >
        <Box sx={{ 
          p: 2, 
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          transition: 'opacity 0.2s ease',
          opacity: { xs: 0, sm: 0 },
          '&:hover': { opacity: 1 }
        }} className="sidebar-header">
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
            {businessDetails?.businessName || selectedBusiness?.businessName}
          </Typography>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Premium Trial
          </Typography>
          <Typography variant="subtitle2" sx={{ mb: 3 }}>
            Uggrabb
          </Typography>

          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            Dashboard
          </Typography>
        </Box>

        <List sx={{ p: 0 }}>
          {menuItems.map((item, index) => (
            <ListItem
              button
              key={index}
              onClick={item.onClick}
              className="dashboard-sidebar-item"
              sx={{
                borderRadius: 0,
                mb: 0.5,
                color: 'var(--orange)',
                backgroundColor: 'var(--light-sky-color)',
                '&:hover': { 
                  backgroundColor: 'var(--parrot-green-dark)' 
                }
              }}
            >
              <ListItemIcon 
                className="dashboard-sidebar-icon"
                sx={{ 
                  minWidth: 36, 
                  color: 'var(--orange)'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{
                  '& .MuiTypography-root': {
                    transition: 'opacity 0.2s ease',
                    opacity: { xs: 0, sm: 0 },
                    '.dashboard-sidebar:hover &': { opacity: 1 }
                  }
                }}
                className="dashboard-sidebar-text"
              />
              {item.new && (
                <Chip
                  label="New"
                  size="small"
                  sx={{ 
                    ml: 1, 
                    height: 20, 
                    fontSize: '0.65rem',
                    bgcolor: 'var(--orange)',
                    color: 'white',
                    transition: 'opacity 0.2s ease',
                    opacity: { xs: 0, sm: 0 },
                    '.dashboard-sidebar:hover &': { opacity: 1 }
                  }}
                />
              )}
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 3 }}>
        {/* User Profile Section in Top Right */}
        <Box sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 20, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-end',
          zIndex: 1000
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1, 
            p: 1, 
            borderRadius: 1,
            bgcolor: 'background.paper',
            boxShadow: 1
          }}>
            <Avatar 
              src={user?.pictureUrl} 
              alt={getUserName()}
              sx={{ width: 40, height: 40, mr: 1 }}
            >
              {!user?.pictureUrl && <Person />}
            </Avatar>
            <Box sx={{ ml: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {getUserName()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.userEmail || user?.email || 'No email available'}
              </Typography>
              <Button 
                variant="text" 
                size="small" 
                onClick={() => navigate('/profile')}
                sx={{ p: 0, minWidth: 'auto', textTransform: 'none', display: 'block' }}
              >
                View Profile
              </Button>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
             {/* Hello {getUserName()}! */}
            Hello! {user?.full_name}
          </Typography>
          
          {/* Prominent Invoice Creation Component */}
          <Card 
            sx={{ 
              mb: 3, 
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              color: 'white',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'scale(1.02)',
                cursor: 'pointer'
              }
            }}
            onClick={() => navigate('/invoices/new-invoice')}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Receipt sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Create New Invoice
                  </Typography>
                  <Typography variant="body1">
                    Generate a professional invoice for your clients
                  </Typography>
                </Box>
              </Box>
              <Button 
                variant="contained" 
                color="secondary" 
                size="large"
                sx={{ 
                  bgcolor: 'white', 
                  color: '#2196F3',
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  }
                }}
              >
                Create Now
              </Button>
            </CardContent>
          </Card>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Business Info Card */}
{/*
        {selectedBusiness && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {selectedBusiness.businessName}
                  </Typography>

                  {selectedBusiness.officeAddress && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {selectedBusiness.officeAddress.addressLine}, {selectedBusiness.officeAddress.city},
                        {selectedBusiness.officeAddress.state} - {selectedBusiness.officeAddress.pincode}
                      </Typography>
                    </Box>
                  )}

                  {selectedBusiness.officeAddress?.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Phone color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {selectedBusiness.officeAddress.phone}
                      </Typography>
                    </Box>
                  )}

                  {selectedBusiness.officeAddress?.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Email color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {selectedBusiness.officeAddress.email}
                      </Typography>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Grid container spacing={2}>
                    {selectedBusiness.gstin && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          GSTIN:
                        </Typography>
                        <Typography variant="body1">
                          {selectedBusiness.gstin}
                        </Typography>
                      </Grid>
                    )}

                    {selectedBusiness.pan && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          PAN:
                        </Typography>
                        <Typography variant="body1">
                          {selectedBusiness.pan}
                        </Typography>
                      </Grid>
                    )}

                    {selectedBusiness.website && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Website:
                        </Typography>
                        <Typography variant="body1">
                          {selectedBusiness.website}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
 */}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            
            {/* Fallback UI when data cannot be loaded */}
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
              Getting Started
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Create Your First Invoice
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Start by creating your first invoice to track your business transactions.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => navigate('/invoices/new-invoice')}
                    >
                      Create Invoice
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Manage Your Business
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Update your business details and settings.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Business />}
                      onClick={() => navigate('/profile')}
                    >
                      Business Profile
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Need Help?
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Contact support if you're experiencing issues with the dashboard.
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => window.open('mailto:support@invokta.com')}
                    >
                      Contact Support
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Business Details
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
                  <Business sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
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
                    onClick={() => navigate('/business-setup')}
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
                        {/* Card header with business name and expand/collapse button */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {business.businessName}
                          </Typography>
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
                            {business.gstin || business.pan || "Not provided"}
                          </Typography>
                        </Box>
                        
                        {/* Collapsible detailed info */}
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                            {business.gstin && business.pan && (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                                  PAN:
                                </Typography>
                                <Typography variant="body1">
                                  {business.pan}
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
                            
                            {business.officeAddress && (
                              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                                  Address:
                                </Typography>
                                <Typography variant="body1">
                                  {business.officeAddress.addressLine}, 
                                  {business.officeAddress.city}, 
                                  {business.officeAddress.state} - 
                                  {business.officeAddress.pincode}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Collapse>
                        
                        <Button
                          variant="contained"
                          sx={{ mt: 2 }}
                          onClick={() => navigate(`/business/edit/${businessId}`)}
                        >
                          Edit Business
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
              
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 3 }}>
                  <Business sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Add New Business
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
                    Create a new business profile to manage your business details.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/business-setup')}
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

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quick Actions
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>
                      <Business fontSize="large" />
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      Manage Business
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Update your business details and settings
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/profile')}
                      fullWidth
                      sx={{ mt: 'auto' }}
                    >
                      Manage
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              

              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>
                      <MonetizationOn fontSize="large" />
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      Bank Details
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Manage your bank accounts and payment methods
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/bank-details')}
                      fullWidth
                      sx={{ mt: 'auto' }}
                    >
                      Manage
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;