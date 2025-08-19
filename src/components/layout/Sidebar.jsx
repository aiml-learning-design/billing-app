import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box, Typography, List, ListItem,
  ListItemIcon, ListItemText, Paper, Chip
} from '@mui/material';
import {
  Receipt, Description, MonetizationOn,
  Business, ListAlt, Person, Store
} from '@mui/icons-material';
import { UI_CONFIG } from '../../config/config';

const Sidebar = ({ onMouseEnter, onMouseLeave, width = '60px' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businessDetails, setBusinessDetails] = useState(null);

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

  // Use menu items from config
  const menuItems = UI_CONFIG.MENU_ITEMS.map(item => ({
    text: item.text,
    icon: getIconComponent(item.icon),
    new: item.new,
    onClick: item.route ? () => navigate(item.route) : undefined
  }));

  // Determine if sidebar is expanded based on width
  const isExpanded = width === '250px';

  return (
    <Paper 
      className="dashboard-sidebar"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      sx={{
        borderRadius: 0,
        boxShadow: 2,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#d5ede8',
        color: '#333333',
        width: width,
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 64, // Height of the AppBar/Navbar
        zIndex: 1000
      }}
    >
      <Box sx={{ 
        p: 2, 
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        transition: 'opacity 0.2s ease',
        opacity: isExpanded ? 1 : 0
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
              color: '#5066cc',
              backgroundColor: '#d5ede8',
              '&:hover': { 
                backgroundColor: '#b8dbd3' 
              }
            }}
          >
            <ListItemIcon 
              className="dashboard-sidebar-icon"
              sx={{ 
                minWidth: 36, 
                color: '#5066cc'
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{
                '& .MuiTypography-root': {
                  transition: 'opacity 0.2s ease',
                  opacity: isExpanded ? 1 : 0
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
                  bgcolor: '#5066cc',
                  color: 'white',
                  transition: 'opacity 0.2s ease',
                  opacity: isExpanded ? 1 : 0
                }}
              />
            )}
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Sidebar;