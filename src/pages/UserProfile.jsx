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
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Fetch user data from the specified API endpoint
        const response = await fetch('http://localhost:8087/invokta/api/users');
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const userData = await response.json();
        console.log("===========================================")
        console.log(response)
        console.log("===========================================")
        console.log(userData)

        
        // Set profile data from API response
        setProfileData({
          firstName: userData.firstName || '',
          middleName: userData.middleName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          country: userData.country || ''
        });
        
        // Set profile picture if available
        setProfilePicture(userData.image || null);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setAlert({
          open: true,
          message: 'Failed to load user data from API',
          severity: 'error'
        });
        
        // Fallback to user context data if API fails
        if (user) {
          setProfileData({
            firstName: user.firstName || '',
            middleName: user.middleName || '',
            lastName: user.lastName || '',
            email: user.userEmail || '',
            phone: user.phone || '',
            country: user.country || ''
          });
          setProfilePicture(user.pictureUrl || null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

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
      // firstName, middleName, lastName are not editable as per requirements
      const userData = {
        email: profileData.email,
        phone: profileData.phone,
        country: profileData.country,
        pictureUrl: profilePicture
      };

      // Call API to update user
      const response = await api.put('/api/users/profile/update', userData);
      
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
              {profileData.email}
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
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                name="country"
                value={profileData.country}
                onChange={handleInputChange}
                fullWidth
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