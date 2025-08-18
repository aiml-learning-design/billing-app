import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../contexts/AuthContext';
import { UI_CONFIG, API_CONFIG } from '../config/config';

const BusinessDetails = () => {
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
  
  // Helper function to get businesses from user data
  const getBusinessesFromUser = (userData) => {
    // Check different possible locations for businesses data
    if (userData?.businesses && userData.businesses.length > 0) {
      // Direct access (JWT token structure)
      console.log('Found businesses in direct access');
      return userData.businesses;
    } else if (userData?.usersDto?.businesses && userData.usersDto.businesses.length > 0) {
      // Nested access via usersDto (email/password login)
      console.log('Found businesses in usersDto');
      return userData.usersDto.businesses;
    } else if (userData?.user?.usersDto?.businesses && userData.user.usersDto.businesses.length > 0) {
      // Nested access via user.usersDto (Google auth)
      console.log('Found businesses in user.usersDto');
      return userData.user.usersDto.businesses;
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Business Details
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<Business />}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
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
        </>
      )}
    </Box>
  );
};

export default BusinessDetails;