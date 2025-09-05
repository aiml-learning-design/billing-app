import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import { Dashboard, Business, ListAlt, AccountCircle, ExitToApp, Edit, People, Person } from '@mui/icons-material';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <AppBar position="static" elevation={0} sx={{
      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)'
    }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Billing Application
        </Typography>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/dashboard"
            startIcon={<Dashboard />}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/business-details"
            startIcon={<Business />}
          >
            Business
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/client-details"
            startIcon={<People />}
          >
            Clients
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/invoices"
            startIcon={<ListAlt />}
          >
            Invoices
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/profile"
            startIcon={<Person />}
          >
            Profile
          </Button>
        </Box>

        <IconButton
          size="large"
          edge="end"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
          color="inherit"
          sx={{ ml: 2 }}
        >
          <Avatar
            src={user.pictureUrl || undefined}
            sx={{ width: 32, height: 32 }}
          >
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </Avatar>
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">{user.full_name || 'User'}</Typography>
            <Typography variant="body2" color="text.secondary">{user.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
            <AccountCircle sx={{ mr: 1 }} />
            View Profile
          </MenuItem>
          <MenuItem onClick={() => { handleClose(); navigate('/profile?edit=true'); }}>
            <Edit sx={{ mr: 1 }} /> Edit Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ExitToApp sx={{ mr: 1 }} /> Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;