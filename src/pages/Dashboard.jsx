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
  
  // Common card styling to ensure all cards have equal dimensions and tabular alignment
  const cardStyle = {
    height: '350px', // Fixed height for all cards
    minWidth: '250px',
    padding: 3,
    borderRadius: '0.75rem',
    backgroundColor: '#f8f9fa',
    border: '1px solid #e0e0e0',
    transition: 'border-color 300ms linear, background-color 300ms linear, box-shadow 300ms',
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden', // Prevent content from overflowing
    '&:hover': {
      borderColor: '#bdbdbd',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }
  };
  
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
      title: 'User Profile',
      description: 'View and manage your personal profile information',
      icon: <Person fontSize="large" />,
      action: () => navigate('/profile'),
      buttonText: 'View'
    },
    {
      title: 'Manage Business',
      description: 'Update your business details and settings',
      icon: <Business fontSize="large" />,
      action: () => navigate('/business-details'),
      buttonText: 'Manage'
    },
    {
      title: 'Payment Accounts',
      description: 'Manage your payment accounts and banking details',
      icon: <MonetizationOn fontSize="large" />,
      action: () => navigate('/payment-accounts'),
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
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          {/* Hello {getUserName()}! */}
          Hello! {user?.full_name}
        </Typography>
        
        {/* Prominent Invoice Creation Component */}
        <Box 
          sx={{ 
            mb: 4,
            height: '150px', // Shorter than regular cards but still fixed height
            width: '100%',
            padding: 3,
            borderRadius: '0.75rem',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            color: 'white',
            transition: 'transform 0.3s, box-shadow 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            '&:hover': {
              transform: 'scale(1.01)',
              cursor: 'pointer',
              boxShadow: '0 5px 8px 2px rgba(33, 203, 243, .4)',
            }
          }}
          onClick={() => navigate('/invoices/new-invoice')}
        >
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
        </Box>
      </Box>

      {/* Main content divider */}
      <Divider sx={{ mb: 4 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
          
          {/* Fallback UI when data cannot be loaded */}
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Getting Started
          </Typography>
          
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{
                ...cardStyle,
                alignItems: 'center',
                textAlign: 'center',
                justifyContent: 'space-between'
              }}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    <Receipt fontSize="large" />
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Create Your First Invoice
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                    Start by creating your first invoice to track your business transactions.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/invoices/new-invoice')}
                  fullWidth
                  sx={{ mt: 'auto' }}
                >
                  Create Invoice
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{
                ...cardStyle,
                alignItems: 'center',
                textAlign: 'center',
                justifyContent: 'space-between'
              }}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    <Business fontSize="large" />
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Manage Your Business
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                    Update your business details and settings.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => navigate('/profile')}
                  fullWidth
                  sx={{ mt: 'auto' }}
                >
                  Business Profile
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{
                ...cardStyle,
                alignItems: 'center',
                textAlign: 'center',
                justifyContent: 'space-between'
              }}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    <Person fontSize="large" />
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Need Help?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                    Contact support if you're experiencing issues with the dashboard.
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  onClick={() => window.open('mailto:support@invokta.com')}
                  fullWidth
                  sx={{ mt: 'auto' }}
                >
                  Contact Support
                </Button>
              </Box>
            </Grid>
          </Grid>
        </>
      ) : (
        <>
          <Divider sx={{ my: 3 }} />

          {/* Main Management Sections */}
          <Grid container spacing={2} sx={{ mb: 4, width: '100%', mx: 0 }}>
            {/* Invoice Management Section */}
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} sx={{ display: 'flex', flex: '1 1 0px' }}>
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Invoice Management
                </Typography>
              
                <Box
                  sx={{
                    ...cardStyle,
                    width: '100%',
                    flex: 1,
                    animation: '0.5s cubic-bezier(0.34, 0.35, 0.2, 1) 0s 1 normal none running expandOut'
                  }}
                >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Invoices
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                  Effortlessly create and share professional invoices to clients via Email and WhatsApp.
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 'auto' }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate('/invoices')}
                    fullWidth
                  >
                    Invoices
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/invoices/new-invoice')}
                    fullWidth
                  >
                    Create New Invoice
                  </Button>
                  
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => window.open('https://www.youtube.com', '_blank')}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    See Demo Video
                  </Button>
                </Box>
              </Box>
            </Box>
            </Grid>
            
            {/* Business Management Section */}
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} sx={{ display: 'flex', flex: '1 1 0px' }}>
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Business Management
                </Typography>
              
                <Box sx={{ ...cardStyle, width: '100%', flex: 1 }}>
                  <Grid container spacing={2} sx={{ height: '100%' }}>
                  {/* Business Details Box */}
                  <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      height: '100%',
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: '0.5rem',
                      '&:hover': {
                        borderColor: '#bdbdbd',
                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)'
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 , width: '720px'}}>
                        <Business sx={{ color: 'primary.main', mr: 1 }} />
                        <Typography variant="h6" fontWeight="bold">
                          Business Details
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                        Manage your business profiles and settings
                      </Typography>
                      
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/business-details')}
                        fullWidth
                        sx={{ mt: 'auto' }}
                      >
                        Manage
                      </Button>
                    </Box>
                  </Grid>
                  
                  {/* Client Details Box */}
                  <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      height: '100%',
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: '0.5rem',
                      '&:hover': {
                        borderColor: '#bdbdbd',
                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)'
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 , width: '720px'}}>
                        <Store sx={{ color: 'primary.main', mr: 1 }} />
                        <Typography variant="h6" fontWeight="bold">
                          Client Details
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                        Manage your client profiles and information
                      </Typography>
                      
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/client-details')}
                        fullWidth
                        sx={{ mt: 'auto' }}
                      >
                        Manage
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            Quick Actions
          </Typography>

          <Grid 
            container 
            spacing={2} 
            sx={{ 
              mb: 4, 
              width: '100%',
              mx: 0 // No horizontal margin
            }}
          >
            {quickActions.map((action, index) => (
              <Grid 
                item 
                xs={12} 
                sm={4} 
                md={4} 
                lg={4} 
                xl={4} 
                key={index}
                sx={{
                  display: 'flex',
                  flex: '1 1 0px' // Equal width distribution
                }}
              >
                <Box sx={{
                  ...cardStyle,
                  alignItems: 'center',
                  textAlign: 'center',
                  justifyContent: 'space-between',
                  width: '100%' // Ensure box takes full width of grid item
                }}>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>
                      {action.icon}
                    </Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {action.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, flex: 1 }}
                    >
                      {action.description}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={action.action}
                    fullWidth
                    sx={{ mt: 'auto' }}
                  >
                    {action.buttonText}
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard;