import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography, Paper,
  Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
  IconButton, Menu, MenuItem, Alert
} from '@mui/material';
import { 
  Add as AddIcon,
  MoreVert as MoreIcon,
  PictureAsPdf as PdfIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../../services/api';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await api.get('/api/invoices');
        setInvoices(response.data);
      } catch (err) {
        setError('Failed to fetch invoices');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const handleMenuOpen = (event, invoice) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvoice(null);
  };

  const handleEdit = () => {
    navigate(`/invoices/edit/${selectedInvoice.id}`);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/invoices/${selectedInvoice.id}`);
      setInvoices(invoices.filter(inv => inv.id !== selectedInvoice.id));
    } catch (err) {
      setError('Failed to delete invoice');
    }
    handleMenuClose();
  };

  const handleExportPdf = async () => {
    try {
      const response = await api.get(
        `/api/invoices/${selectedInvoice.id}/export/pdf`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${selectedInvoice.id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      setError('Failed to export PDF');
    }
    handleMenuClose();
  };

  if (loading) return <Typography>Loading invoices...</Typography>;

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Invoices</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/invoices/new')}
        >
          New Invoice
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Billed To</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.billedTo}</TableCell>
                <TableCell>
                  {invoice.currency} {invoice.amount}
                </TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      backgroundColor:
                        invoice.status === 'PAID'
                          ? 'success.light'
                          : invoice.status === 'CANCELLED'
                          ? 'error.light'
                          : 'warning.light',
                      color: 'common.white',
                    }}
                  >
                    {invoice.status}
                  </Box>
                </TableCell>
                <TableCell>
                  {new Date(invoice.invoiceDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {invoice.dueDate
                    ? new Date(invoice.dueDate).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell>
                  <IconButton onClick={(e) => handleMenuOpen(e, invoice)}>
                    <MoreIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleExportPdf}>
          <PdfIcon sx={{ mr: 1 }} /> Export PDF
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default InvoiceList;