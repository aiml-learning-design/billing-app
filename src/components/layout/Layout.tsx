import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);

  const handleSidebarHover = (expanded: boolean): void => {
    setSidebarExpanded(expanded);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar 
        onMouseEnter={() => handleSidebarHover(true)}
        onMouseLeave={() => handleSidebarHover(false)}
        width={sidebarExpanded ? '250px' : '60px'}
      />
      
      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          ml: sidebarExpanded ? '250px' : '60px', // Adjust based on sidebar state
          mt: '64px', // Account for navbar height
          transition: 'margin-left 0.3s ease',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;