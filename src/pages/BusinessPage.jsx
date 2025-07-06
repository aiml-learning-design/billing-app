import React from 'react';
import BusinessDetailsForm from '../components/business/BusinessDetailsForm';
import { Box } from '@mui/material';

export default function BusinessPage() {
  return (
    <Box sx={{ p: 3 }}>
      <BusinessDetailsForm />
    </Box>
  );
}