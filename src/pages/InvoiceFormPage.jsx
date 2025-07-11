import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InvoiceForm from '../components/invoices/InvoiceForm';
import { Box } from '@mui/material';

const InvoiceFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSuccess = (invoice) => {
    if (id) {
      // For edits, go back to invoice list
      navigate('/invoices');
    } else {
      // For new invoices, go to the edit page
      navigate(`/invoices/edit/${invoice.id}`);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <InvoiceForm invoiceId={id} onSuccess={handleSuccess} />
    </Box>
  );
};

export default InvoiceFormPage;