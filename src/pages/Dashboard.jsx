import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Dashboard</Typography>
      {user && (
        <>
          <Typography>Welcome, {user.email}</Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Logout
          </Button>
        </>
      )}
    </Box>
  );
};

export default Dashboard;