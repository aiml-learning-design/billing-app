import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box, Typography, Button, Grid, Card, CardContent,
  CircularProgress, Divider, Chip, Alert
} from '@mui/material';
import { Business, ListAlt, Add, Paid, Pending } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/invoices/stats');
        setStats(response.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const quickActions = [
    {
      title: 'Business Details',
      description: 'Update your business information',
      icon: <Business fontSize="large" />,
      action: () => navigate('/business'),
      buttonText: 'Go to Business'
    },
    {
      title: 'View Invoices',
      description: 'See all your invoices',
      icon: <ListAlt fontSize="large" />,
      action: () => navigate('/invoices'),
      buttonText: 'View Invoices'
    },
    {
      title: 'Create Invoice',
      description: 'Create a new invoice',
      icon: <Add fontSize="large" />,
      action: () => navigate('/invoices/new'),
      buttonText: 'Create Invoice'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      {user && (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Welcome back, {user.email}
          </Typography>

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
              <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
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

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
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

              {stats?.recentInvoices?.length > 0 && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    Recent Invoices
                  </Typography>
                  <Grid container spacing={2}>
                    {stats.recentInvoices.map((invoice) => (
                      <Grid item xs={12} sm={6} md={4} key={invoice.id}>
                        <Card
                          variant="outlined"
                          sx={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/invoices/edit/${invoice.id}`)}
                        >
                          <CardContent>
                            <Box sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              mb: 1
                            }}>
                              <Typography variant="subtitle1">
                                #{invoice.invoiceNumber}
                              </Typography>
                              <Chip
                                label={invoice.status}
                                size="small"
                                color={
                                  invoice.status === 'PAID' ? 'success' :
                                  invoice.status === 'CANCELLED' ? 'error' : 'warning'
                                }
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {invoice.billedTo}
                            </Typography>
                            <Typography variant="h6" sx={{ mt: 1 }}>
                              ₹{invoice.amount.toFixed(2)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(invoice.invoiceDate).toLocaleDateString()}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default Dashboard;