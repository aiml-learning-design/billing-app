import React from 'react';
import InvoiceList from '../components/invoices/InvoiceList';
import { Box } from '@mui/material';

export default function InvoicesPage() {
  return (
    <Box sx={{ p: 3 }}>
      <InvoiceList />
    </Box>
  );
}