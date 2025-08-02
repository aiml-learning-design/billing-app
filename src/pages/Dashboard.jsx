import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box, Typography, Button, Grid, Card, CardContent,
  CircularProgress, Divider, Chip, Alert, List, ListItem,
  ListItemIcon, ListItemText, Paper, Avatar
} from '@mui/material';
import {
  Receipt, Description, MonetizationOn,
  Business, ListAlt, Add, Store, Person,
  Email, Phone, LocationOn
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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
      try {
        if (!selectedBusiness) return;

        const [statsResponse, invoicesResponse] = await Promise.all([
          api.get(`/api/invoices/stats?businessId=${selectedBusiness.business_id}`),
          api.get(`/api/invoices?businessId=${selectedBusiness.business_id}&limit=1&sort=desc`)
        ]);

        setStats(statsResponse.data);
        if (invoicesResponse.data.length > 0) {
          setLastInvoice(invoicesResponse.data[0]);
        }
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedBusiness]);

  const menuItems = [
    { text: 'Sales', icon: <Receipt />, new: true },
    { text: 'Purchases', icon: <Description />, new: true },
    { text: 'Accounting', icon: <MonetizationOn />, new: true },
    { text: 'Sales CRM', icon: <Person />, new: true },
    { text: 'Inventory', icon: <Store />, new: true },
    { text: 'Accounting Reports', icon: <Description />, new: true },
    { text: 'GST Reports', icon: <Receipt />, new: true },
    { text: 'Workflows', icon: <ListAlt /> },
    { text: 'Bank & Payments', icon: <MonetizationOn /> },
    { text: 'Profile', icon: <Person />, onClick: () => navigate('/profile') },
    { text: 'View Profile', icon: <Person />, onClick: () => navigate('/profile') }
  ];

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
      <Paper sx={{
        width: 250,
        p: 2,
        borderRadius: 0,
        boxShadow: 2,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
          {businessDetails?.businessName || selectedBusiness?.businessName || "Dheeraj & Sons"}
        </Typography>
        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
          Premium Trial
        </Typography>
        <Typography variant="subtitle2" sx={{ mb: 3, color: 'text.secondary' }}>
          Uggrabb
        </Typography>

        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
          Dashboard
        </Typography>

        <List>
          {menuItems.map((item, index) => (
            <ListItem
              button
              key={index}
              onClick={item.onClick}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
              {item.new && (
                <Chip
                  label="New"
                  size="small"
                  color="primary"
                  sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
                />
              )}
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 3 }}>
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

                  {selectedBusiness.officeAddresses?.[0] && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {selectedBusiness.officeAddresses[0].addressLine}, {selectedBusiness.officeAddresses[0].city},
                        {selectedBusiness.officeAddresses[0].state} - {selectedBusiness.officeAddresses[0].pincode}
                      </Typography>
                    </Box>
                  )}

                  {selectedBusiness.officeAddresses?.[0]?.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Phone color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {selectedBusiness.officeAddresses[0].phone}
                      </Typography>
                    </Box>
                  )}

                  {selectedBusiness.officeAddresses?.[0]?.primaryEmail && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Email color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {selectedBusiness.officeAddresses[0].primaryEmail}
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