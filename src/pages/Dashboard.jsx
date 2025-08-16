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
import { UI_CONFIG } from '../config/config';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastInvoice, setLastInvoice] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businessDetails, setBusinessDetails] = useState(null);

  // Function to validate business details and detect fake data
  const validateBusinessDetails = (businessData) => {
    // Check for obviously fake business names
    const fakeBusinesNamePatterns = [
      /fake/i, 
      /test/i, 
      /dummy/i, 
      /example/i
    ];
    
    // Check for test email domains
    const fakeEmailDomains = [
      'example.com',
      'example.us',
      'test.com',
      'fake.com',
      'domain.com'
    ];
    
    // Check for fake phone numbers
    const fakePhonePatterns = [
      /^123456/, 
      /^555/, 
      /^000/, 
      /^111/, 
      /^999/, 
      /12345678/, 
      /^601952/  // Specific pattern from the issue description
    ];
    
    // Check for fake address patterns
    const fakeAddressPatterns = [
      /fake/i,
      /test/i,
      /example/i,
      /123 main/i,
      /1600 fake/i  // Specific pattern from the issue description
    ];
    
    // Check for fake business ID patterns (if they follow a specific format)
    const fakeBusinessIdPatterns = [
      /6062f455a06536d00ac9e6e5/  // Specific ID from the issue description
    ];
    
    // Check business name
    if (businessData.businessName) {
      for (const pattern of fakeBusinesNamePatterns) {
        if (pattern.test(businessData.businessName)) {
          console.log(`Detected fake business name: ${businessData.businessName}`);
          return true;
        }
      }
    }
    
    // Check email
    if (businessData.email) {
      const emailDomain = businessData.email.split('@')[1]?.toLowerCase();
      if (emailDomain && fakeEmailDomains.includes(emailDomain)) {
        console.log(`Detected fake email domain: ${emailDomain}`);
        return true;
      }
    }
    
    // Check phone
    if (businessData.phone) {
      for (const pattern of fakePhonePatterns) {
        if (pattern.test(businessData.phone)) {
          console.log(`Detected fake phone number: ${businessData.phone}`);
          return true;
        }
      }
    }
    
    // Check address if it exists
    if (businessData.officeAddress) {
      const address = businessData.officeAddress;
      
      // Check address line
      if (address.addressLine) {
        for (const pattern of fakeAddressPatterns) {
          if (pattern.test(address.addressLine)) {
            console.log(`Detected fake address: ${address.addressLine}`);
            return true;
          }
        }
      }
    }
    
    // Check business ID
    if (businessData.businessId) {
      for (const pattern of fakeBusinessIdPatterns) {
        if (pattern.test(businessData.businessId)) {
          console.log(`Detected fake business ID: ${businessData.businessId}`);
          return true;
        }
      }
    }
    
    // If we get here, no fake data was detected
    return false;
  };

  // Set selected business when user data is loaded or from localStorage
  useEffect(() => {
    // First try to get business details from localStorage (for newly created businesses)
    const storedBusinessDetails = localStorage.getItem('businessDetails');
    
    if (storedBusinessDetails) {
      try {
        const parsedBusinessDetails = JSON.parse(storedBusinessDetails);
        
        // Validate business details to detect fake data
        const isFakeData = validateBusinessDetails(parsedBusinessDetails);
        
        if (isFakeData) {
          console.error('Detected fake business data in localStorage. Clearing localStorage and using API data instead.');
          // Clear fake business details from localStorage
          localStorage.removeItem('businessDetails');
          
          // Fall back to user data if available
          if (user?.businesses && user.businesses.length > 0) {
            setSelectedBusiness(user.businesses[0]);
          }
          return;
        }
        
        // If data is valid, use it
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
      try {
        if (!selectedBusiness) return;

        const [statsResponse, invoicesResponse] = await Promise.all([
          api.get(`/api/invoices/stats?businessId=${selectedBusiness.business_id}`),
          api.get(`/api/invoices?businessId=${selectedBusiness.business_id}&limit=1&sort=desc`)
        ]);

        setStats(statsResponse);
        if (invoicesResponse.length > 0) {
          setLastInvoice(invoicesResponse[0]);
        }
      } catch (err) {
        setError('Failed to load dashboard data');
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
            {businessDetails?.businessName || selectedBusiness?.businessName || "Dheeraj & Sons"}
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
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
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