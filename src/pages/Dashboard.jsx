import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box, Typography, Button, Grid, Card, CardContent,
  CircularProgress, Divider, Chip, Alert, List, ListItem,
  ListItemIcon, ListItemText, Paper, Avatar, FormControl, Select,
  MenuItem
} from '@mui/material';
import {
  Receipt, Description, MonetizationOn,
  Business, ListAlt, Add, Store, Person,
  Email, Phone, LocationOn
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UI_CONFIG, API_CONFIG } from '../config/config';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastInvoice, setLastInvoice] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businessDetails, setBusinessDetails] = useState(null);

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!selectedBusiness) {
          console.log('No selected business, skipping data fetch');
          return;
        }
        
        console.log('Fetching data for business:', selectedBusiness);
        console.log('Business ID:', selectedBusiness.business_id || selectedBusiness.businessId);
        
        // Use the search endpoint instead of stats endpoint which doesn't exist in Swagger
        const businessId = selectedBusiness.business_id || selectedBusiness.businessId;
        
        if (!businessId) {
          console.error('Business ID is undefined or null');
          throw new Error('Invalid business ID');
        }
        
        // Use the search endpoint to get all invoices for this business
        const searchRequest = {
          businessId: businessId,
          // No other filters needed to get all invoices
        };
        
        // Use try-catch for each API call to handle errors individually
        let invoicesSearchResponse, latestInvoiceResponse;
        
        try {
          // First API call - search invoices
          console.log('Making search request with params:', searchRequest);
          
          // Try different approaches for passing search parameters
          try {
            // Approach 1: Using query parameter with JSON string
            console.log('Trying search approach 1: Query parameter with JSON string');
            invoicesSearchResponse = await api.get(
              `${API_CONFIG.ENDPOINTS.INVOICE.SEARCH}?searchInvoiceRequest=${encodeURIComponent(JSON.stringify(searchRequest))}`
            );
            console.log('Search approach 1 successful');
          } catch (approach1Error) {
            console.error('Search approach 1 failed:', approach1Error);
            
            // Approach 2: Using query parameters directly
            console.log('Trying search approach 2: Direct query parameters');
            try {
              invoicesSearchResponse = await api.get(
                `${API_CONFIG.ENDPOINTS.INVOICE.SEARCH}?businessId=${businessId}`
              );
              console.log('Search approach 2 successful');
            } catch (approach2Error) {
              console.error('Search approach 2 failed:', approach2Error);
              
              // Approach 3: Using POST with request body
              console.log('Trying search approach 3: POST with request body');
              try {
                invoicesSearchResponse = await api.post(
                  API_CONFIG.ENDPOINTS.INVOICE.SEARCH,
                  searchRequest
                );
                console.log('Search approach 3 successful');
              } catch (approach3Error) {
                console.error('Search approach 3 failed:', approach3Error);
                // Re-throw the original error if all approaches fail
                throw approach1Error;
              }
            }
          }
          
          console.log('Search request successful with response:', invoicesSearchResponse);
        } catch (searchError) {
          console.error('Error in search request:', searchError);
          // Set a default response to prevent errors in the next section
          invoicesSearchResponse = { success: false, message: searchError.message || 'Failed to search invoices' };
        }
        
        try {
          // Second API call - get latest invoice
          console.log('Making latest invoice request for businessId:', businessId);
          
          // Try different approaches for the latest invoice request
          try {
            // Approach 1: Using query parameters
            console.log('Trying latest invoice approach 1: Query parameters');
            latestInvoiceResponse = await api.get(
              `${API_CONFIG.ENDPOINTS.INVOICE.GET_ALL}?businessId=${businessId}&limit=1&sort=desc`
            );
            console.log('Latest invoice approach 1 successful');
          } catch (approach1Error) {
            console.error('Latest invoice approach 1 failed:', approach1Error);
            
            // Approach 2: Using a different endpoint format
            console.log('Trying latest invoice approach 2: Alternative endpoint');
            try {
              latestInvoiceResponse = await api.get(
                `${API_CONFIG.ENDPOINTS.INVOICE.GET_ALL}/${businessId}?limit=1&sort=desc`
              );
              console.log('Latest invoice approach 2 successful');
            } catch (approach2Error) {
              console.error('Latest invoice approach 2 failed:', approach2Error);
              
              // Approach 3: Using POST with request body
              console.log('Trying latest invoice approach 3: POST with request body');
              try {
                latestInvoiceResponse = await api.post(
                  API_CONFIG.ENDPOINTS.INVOICE.GET_ALL,
                  { businessId, limit: 1, sort: 'desc' }
                );
                console.log('Latest invoice approach 3 successful');
              } catch (approach3Error) {
                console.error('Latest invoice approach 3 failed:', approach3Error);
                // Re-throw the original error if all approaches fail
                throw approach1Error;
              }
            }
          }
          
          console.log('Latest invoice request successful with response:', latestInvoiceResponse);
        } catch (invoiceError) {
          console.error('Error in latest invoice request:', invoiceError);
          // Set a default response to prevent errors in the next section
          latestInvoiceResponse = { success: false, message: invoiceError.message || 'Failed to get latest invoice' };
        }
        
        console.log('Invoices search response:', invoicesSearchResponse);
        console.log('Latest invoice response:', latestInvoiceResponse);

        // Track if both API calls failed
        let searchFailed = false;
        let invoiceFailed = false;
        let errorMessages = [];

        // Check if the search response is successful and extract data
        if (invoicesSearchResponse.success && invoicesSearchResponse.data) {
          const invoicesPage = invoicesSearchResponse.data;
          const invoices = invoicesPage.content || [];
          
          // Calculate stats from the invoices data
          const calculatedStats = {
            totalInvoices: invoices.length,
            paidInvoices: invoices.filter(inv => inv.status === 'PAID').length,
            pendingInvoices: invoices.filter(inv => inv.status === 'PENDING').length,
            totalAmount: invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0)
          };
          
          console.log('Calculated stats:', calculatedStats);
          setStats(calculatedStats);
        } else {
          console.error('Invalid invoices search response format:', invoicesSearchResponse);
          // Set default empty stats
          setStats({
            totalInvoices: 0,
            paidInvoices: 0,
            pendingInvoices: 0,
            totalAmount: 0
          });
          
          // Mark search as failed and collect error message
          searchFailed = true;
          if (invoicesSearchResponse.message) {
            errorMessages.push(`Search failed: ${invoicesSearchResponse.message}`);
          } else {
            errorMessages.push('Failed to load invoice statistics');
          }
        }

        // Check if latest invoice response is successful and contains data
        if (latestInvoiceResponse.success && latestInvoiceResponse.data) {
          const invoices = latestInvoiceResponse.data;
          if (Array.isArray(invoices) && invoices.length > 0) {
            console.log('Setting last invoice:', invoices[0]);
            setLastInvoice(invoices[0]);
          } else {
            console.log('No invoices found in the response');
          }
        } else {
          console.error('Invalid latest invoice response format:', latestInvoiceResponse);
          // Don't throw error for empty invoices, just log it
          console.warn('No invoices found or invalid response format');
          
          // Mark invoice as failed and collect error message
          invoiceFailed = true;
          if (latestInvoiceResponse.message) {
            errorMessages.push(`Latest invoice failed: ${latestInvoiceResponse.message}`);
          } else {
            errorMessages.push('Failed to load latest invoice');
          }
        }
        
        // Only set error if both API calls failed or if there's a specific error message
        if (searchFailed && invoiceFailed) {
          setError(`Failed to load dashboard data: ${errorMessages.join(', ')}`);
        } else if (errorMessages.length > 0) {
          // If only one API call failed, show a warning but don't block the dashboard
          console.warn('Partial dashboard data loaded with errors:', errorMessages.join(', '));
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
  }, [selectedBusiness]);

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
      icon: <Add fontSize="large" />,
      action: () => navigate('/invoices/new-invoice'),
      buttonText: 'Create'
    },
    {
      title: 'Create Quotation',
      description: 'Create a quotation to send to potential clients',
      icon: <Description fontSize="large" />,
      action: () => navigate('/quotations/new'),
      buttonText: 'Create'
    },
    {
      title: 'Record Expense',
      description: 'Track your business expenses',
      icon: <MonetizationOn fontSize="large" />,
      action: () => navigate('/expenses/new'),
      buttonText: 'Record'
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
                {user?.userEmail || 'No email available'}
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

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Hello {getUserName()} Welcome to {businessDetails?.businessName || selectedBusiness?.businessName || "Dheeraj & Sons"}!
          </Typography>

          {user?.businesses?.length > 1 && (
            <FormControl sx={{ minWidth: 200 }}>
              <Select
                value={selectedBusiness?.business_id || ''}
                onChange={(e) => {
                  const selected = user.businesses.find(b => b.business_id === e.target.value);
                  setSelectedBusiness(selected);
                }}
                displayEmpty
              >
                {user.businesses.map((business) => (
                  <MenuItem key={business.business_id} value={business.business_id}>
                    {business.businessName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Business Info Card */}
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
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Getting Started
            </Typography>

            <Grid container spacing={3}>
              {/* Last Invoice Card */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Your Last Invoice
                    </Typography>

                    {lastInvoice ? (
                      <>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                          Invoice No. {lastInvoice.invoiceNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Billed To
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {lastInvoice.billedTo}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Amount
                        </Typography>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                          ₹{lastInvoice.amount.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Invoice Date {new Date(lastInvoice.invoiceDate).toLocaleDateString()}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body1" color="text.secondary">
                        No invoices found
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Quotations Card */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Quotations
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Seal the deal with customised quotations and win over potential clients.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Description />}
                      onClick={() => navigate('/quotations/new')}
                    >
                      Create Quotation
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Expenses Card */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Expenses
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Stay on top of your expenses. Track and manage your finances with ease and accuracy.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<MonetizationOn />}
                      onClick={() => navigate('/expenses/new')}
                    >
                      Record Expense
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quick Actions
            </Typography>

            <Grid container spacing={3}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center'
                    }}>
                      <Box sx={{ color: 'primary.main', mb: 2 }}>
                        {action.icon}
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {action.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {action.description}
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={action.action}
                        fullWidth
                        sx={{ mt: 'auto' }}
                      >
                        {action.buttonText}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Business Overview
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Total Invoices
                    </Typography>
                    <Typography variant="h4">
                      {stats?.totalInvoices || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Paid Invoices
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {stats?.paidInvoices || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Pending Invoices
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {stats?.pendingInvoices || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Total Revenue
                    </Typography>
                    <Typography variant="h4">
                      ₹{stats?.totalAmount?.toFixed(2) || '0.00'}
                    </Typography>
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