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
  
  // Log the user object to verify it has all the required properties
  console.log('Dashboard: User object:', user);
  console.log('Dashboard: User properties:', {
    id: user?.id,
    username: user?.username,
    email: user?.email,
    firstName: user?.firstName,
    middleName: user?.middleName,
    lastName: user?.lastName,
    full_name: user?.full_name,
    phone: user?.phone,
    pictureUrl: user?.pictureUrl,
    businesses: user?.businesses
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businessDetails, setBusinessDetails] = useState(null);
  const [allBusinesses, setAllBusinesses] = useState([]);
  
  // Business details functionality has been moved to BusinessDetails page
  
  useEffect(() => {
    // Simple loading state management for dashboard
    setLoading(false);
  }, []);

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
  
  // Business details functionality has been moved to BusinessDetails page

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
      action: () => navigate('/business-details'),
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
            {/* Business Details section */}
            <Card sx={{ mb: 3, p: 2 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Business sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Manage Your Business Details
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  View and manage all your business profiles in one place.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Business />}
                  onClick={() => navigate('/business-details')}
                >
                  View Business Details
                </Button>
              </CardContent>
            </Card>
            
            {/* Client Details section */}
            <Card sx={{ mb: 3, p: 2 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Store sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Client Details
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  View and manage all your client profiles in one place.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Store />}
                  onClick={() => navigate('/business-details?context=client')}
                >
                  Add Client Details
                </Button>
              </CardContent>
            </Card>


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