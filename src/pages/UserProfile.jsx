import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Box, Typography, Card, CardContent, Grid,
  TextField, Button, Avatar, CircularProgress,
  Snackbar, Alert, Divider, Paper, List, ListItem, ListItemText
} from '@mui/material';
import { Person, Save, CloudUpload, Edit } from '@mui/icons-material';

/**
 * UserProfile page for displaying and editing user profile information
 */
const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    country: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  
  // Ref to prevent duplicate API calls
  const apiCallMadeRef = useRef(false);

  // Check URL parameters for edit mode
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const editParam = searchParams.get('edit');
    setEditMode(editParam === 'true');
  }, [location.search]);

  // Load user data from API
  useEffect(() => {
    console.log("UserProfile: Initializing API call to fetch user data");
    
    const fetchUserData = async () => {
      // Check if API call has already been made to prevent duplicate calls
      if (apiCallMadeRef.current) {
        console.log("UserProfile: Skipping duplicate API call");
        return;
      }
      
      try {
        setLoading(true);
        // Mark that we're making the API call
        apiCallMadeRef.current = true;
        
        // Fetch user data from the API using the api service with redirect handling
        const response = await api.get('/api/users', {
          // Add configuration to ensure redirects are followed properly
          maxRedirects: 5, // Allow up to 5 redirects
          validateStatus: status => status >= 200 && status < 300 // Only accept success status codes
        });
        
        console.log("===========================================");
        console.log("User data loaded successfully");
        console.log("===========================================");
        console.log("Full response:", response);
        
        // Extract user data from the response
        // The API response has a structure like the one in the issue description
        const userData = response.data || response;
        
        console.log("Extracted user data:", userData);
        
        // Map fields from the API response to our component state
        setProfileData({
          firstName: userData.first_name || '',
          middleName: userData.middle_name || '',
          lastName: userData.last_name || '',
          email: userData.user_email || userData.email || '',
          phone: userData.phone || '',
          country: userData.country || ''
        });
        
        // Set profile picture from picture_url field
        setProfilePicture(userData.picture_url || userData.image || userData.pictureUrl || null);
      } catch (error) {
        console.error('Error fetching user data:', error);
        
        // Provide more specific error messages based on the error
        let errorMessage = 'Failed to load user data from API';
        
        // Check if the error is a redirect (302)
        if (error.response && error.response.status === 302) {
          errorMessage = 'API redirected the request. Please check API configuration.';
          console.warn('Redirect detected:', error.response.headers.location);
        } else if (error.response) {
          // Other HTTP error responses
          errorMessage = `API error: ${error.response.status} - ${error.response.statusText || 'Unknown error'}`;
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = 'No response received from API. Please check your connection.';
        }
        
        setAlert({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
        
        // Fallback to user context data if API fails
        if (user) {
          console.log("Falling back to user context data:", user);
          console.log("user.userEmail:", user.userEmail);
          console.log("user.email:", user.email);
          console.log("user.country:", user.country);
          console.log("user.pictureUrl:", user.pictureUrl);
          console.log("user.image:", user.image);
          
          setProfileData({
            firstName: user.firstName || '',
            middleName: user.middleName || '',
            lastName: user.lastName || '',
            email: user.userEmail || user.email || '',
            phone: user.phone || '',
            country: user.country || user.userCountry || ''
          });
          setProfilePicture(user.pictureUrl || user.image || user.picture || user.avatar || null);
        }
      } finally {
        setLoading(false);
        console.log("UserProfile: API call completed");
      }
    };

    fetchUserData();
  }, []); // Empty dependency array to run only once

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile picture upload
  const handlePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePicture(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    // If we're in edit mode, navigate to /profile without the edit parameter
    // If we're in view mode, navigate to /profile?edit=true
    if (editMode) {
      navigate('/profile');
    } else {
      navigate('/profile?edit=true');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Prepare data for API - format to match what the /api/user/save endpoint expects
      const userData = {
        first_name: profileData.firstName,
        middle_name: profileData.middleName,
        last_name: profileData.lastName,
        user_email: profileData.email,
        phone: profileData.phone,
        country: profileData.country,
        picture_url: profilePicture
      };

      console.log("Submitting user data:", userData);

      // Call API to update user using the /api/user/save endpoint
      const response = await api.post('/api/user/save', userData);
      
      console.log("API response after update:", response);
      
      // Check if the response indicates success
      if (response.success === true && response.status === 200) {
        console.log("Profile updated successfully");
        
        // Update local user context if updateUser function is available
        if (updateUser) {
          updateUser(response.data || response);
        }

        // Show success message
        setAlert({
          open: true,
          message: response.message || 'Profile updated successfully',
          severity: 'success'
        });
        
        // Switch back to view mode after successful update
        navigate('/profile');
      } else {
        // Handle case where API returns a non-success response
        console.error('API returned non-success response:', response);
        setAlert({
          open: true,
          message: response.message || 'Failed to update profile: Server returned an error',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Provide more specific error messages based on the error
      let errorMessage = 'Failed to update profile';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage += `: Server responded with ${error.response.status} - ${error.response.statusText || 'Unknown status'}`;
        
        // Try to extract more specific error message from response data
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage += ` - ${error.response.data}`;
          } else if (error.response.data.message) {
            errorMessage += ` - ${error.response.data.message}`;
          }
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage += ': No response received from server';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage += `: ${error.message || 'Unknown error'}`;
      }
      
      setAlert({
        open: true,
        message: errorMessage,
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Log the current state before rendering
  console.log("Rendering with profileData:", profileData);
  console.log("Rendering with profilePicture:", profilePicture);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          User Profile
        </Typography>
        <Button
          variant="contained"
          color={editMode ? "secondary" : "primary"}
          startIcon={editMode ? <Save /> : <Edit />}
          onClick={editMode ? null : toggleEditMode}
          sx={{ ml: 2 }}
        >
          {editMode ? 'View Profile' : 'Edit Profile'}
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        {/* Profile Header with Avatar - Same in both modes */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={profilePicture}
            sx={{ width: 100, height: 100, mr: 3 }}
          >
            {!profilePicture && <Person sx={{ fontSize: 60 }} />}
          </Avatar>
          <Box>
            <Typography variant="h5">
              {profileData.firstName} {profileData.middleName ? `${profileData.middleName} ` : ''}{profileData.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {profileData.email || "No email available"}
            </Typography>
            {editMode && (
              <>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-picture-upload"
                  type="file"
                  onChange={handlePictureUpload}
                />
                <label htmlFor="profile-picture-upload">
                  <Button
                    component="span"
                    startIcon={<CloudUpload />}
                    sx={{ mt: 1 }}
                    size="small"
                  >
                    Change Picture
                  </Button>
                </label>
              </>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* View Mode - Display user data in a list */}
        {!editMode ? (
          <Box>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Full Name" 
                  secondary={`${profileData.firstName} ${profileData.middleName || ''} ${profileData.lastName}`} 
                  primaryTypographyProps={{ fontWeight: 'bold' }}
                />
              </ListItem>
              <Divider component="li" />
              
              <ListItem>
                <ListItemText 
                  primary="Email" 
                  secondary={profileData.email} 
                  primaryTypographyProps={{ fontWeight: 'bold' }}
                />
              </ListItem>
              <Divider component="li" />
              
              <ListItem>
                <ListItemText 
                  primary="Phone Number" 
                  secondary={profileData.phone || "Not provided"} 
                  primaryTypographyProps={{ fontWeight: 'bold' }}
                />
              </ListItem>
              <Divider component="li" />
              
              <ListItem>
                <ListItemText 
                  primary="Country" 
                  secondary={profileData.country || "Not provided"} 
                  primaryTypographyProps={{ fontWeight: 'bold' }}
                />
              </ListItem>
            </List>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Edit />}
                onClick={toggleEditMode}
              >
                Edit Profile
              </Button>
            </Box>
          </Box>
        ) : (
          /* Edit Mode - Form with editable fields */
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Middle Name"
                  name="middleName"
                  value={profileData.middleName}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  name="phone"
                  value={profileData.phone || ""}
                  onChange={handleInputChange}
                  fullWidth
                  helperText={!profileData.phone ? "Please enter your phone number" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Country"
                  name="country"
                  value={profileData.country || ""}
                  onChange={handleInputChange}
                  fullWidth
                  helperText={!profileData.country ? "Please enter your country" : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    onClick={toggleEditMode}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<Save />}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        )}
      </Paper>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleAlertClose} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfile;