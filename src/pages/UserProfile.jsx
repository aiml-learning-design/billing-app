import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  Box, Typography, Card, CardContent, Grid,
  TextField, Button, Avatar, CircularProgress,
  Snackbar, Alert, Divider, Paper
} from '@mui/material';
import { Person, Save, CloudUpload } from '@mui/icons-material';

/**
 * UserProfile page for displaying and editing user profile information
 */
const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  // Load user data from API
  useEffect(() => {
    console.log("UserProfile: Initializing API call to fetch user data");
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Fetch user data from the API using the api service with redirect handling
        const userData = await api.get('/api/users', {
          // Add configuration to ensure redirects are followed properly
          maxRedirects: 5, // Allow up to 5 redirects
          validateStatus: status => status >= 200 && status < 300 // Only accept success status codes
        });
        
        console.log("===========================================")
        console.log("User data loaded successfully")
        console.log("===========================================")
        console.log("Full userData object:", userData)
        console.log("userData.email:", userData.email)
        console.log("userData.country:", userData.country)
        console.log("userData.image:", userData.image)
        console.log("userData.pictureUrl:", userData.pictureUrl)
        console.log("userData.picture:", userData.picture)
        console.log("userData.avatar:", userData.avatar)
        
        // Set profile data from API response
        setProfileData({
          firstName: userData.firstName || '',
          middleName: userData.middleName || '',
          lastName: userData.lastName || '',
          email: userData.email || userData.userEmail || '',
          phone: userData.phone || '',
          country: userData.country || userData.userCountry || ''
        });
        
        // Set profile picture if available - try different possible property names
        setProfilePicture(userData.image || userData.pictureUrl || userData.picture || userData.avatar || null);
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
  }, []); // Remove user dependency to prevent multiple API calls

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Prepare data for API - only include editable fields
      // firstName, middleName, lastName, email are not editable as per requirements
      const userData = {
        // email removed as it's not editable
        phone: profileData.phone,
        country: profileData.country,
        // Use multiple property names for picture to ensure compatibility with backend
        image: profilePicture,
        pictureUrl: profilePicture,
        picture: profilePicture,
        avatar: profilePicture
      };

      console.log("Submitting user data:", userData);

      // Call API to update user
      const response = await api.put('/api/users/profile/update', userData);
      
      console.log("API response after update:", response);
      
      // Update local user context
      if (updateUser) {
        updateUser(response);
      }

      setAlert({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setAlert({
        open: true,
        message: 'Failed to update profile',
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
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={profilePicture}
            sx={{ width: 100, height: 100, mr: 3 }}
          >
            {!profilePicture && <Person sx={{ fontSize: 60 }} />}
          </Avatar>
          <Box>
            <Typography variant="h5">
              {profileData.firstName} {profileData.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {profileData.email || "No email available"}
            </Typography>
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
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="First Name"
                name="firstName"
                value={profileData.firstName}
                disabled
                fullWidth
                required
                helperText="First name cannot be edited"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Middle Name"
                name="middleName"
                value={profileData.middleName}
                disabled
                fullWidth
                helperText="Middle name cannot be edited"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Last Name"
                name="lastName"
                value={profileData.lastName}
                disabled
                fullWidth
                required
                helperText="Last name cannot be edited"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                name="email"
                value={profileData.email}
                disabled
                fullWidth
                required
                helperText="Email cannot be edited"
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
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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