import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Grid, Paper, Divider, Button, Chip,
  Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, FormControlLabel, Switch, TextField,
  MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle,
  DialogContent, DialogActions, InputAdornment, IconButton, Tooltip,
  Menu, ListItemIcon, ListItemText, MenuItem as MenuItemMUI
} from '@mui/material';
import {
  Edit, Print, Download, Email, WhatsApp, MoreVert,
  Check, ArrowForward, ArrowBack, Add, Remove, Save,
  Facebook, Twitter, LinkedIn, Share, FileCopy
} from '@mui/icons-material';
import InvoiceLogo from '../assets/INVOICE.png';
import InvoktaLogo from '../assets/invokta_invoice.png';
import api from '../services/api';

/**
 * ReviewInvoicePage component for reviewing the invoice before final submission
 * with options to select payment account, export, share, and submit the invoice
 */
const ReviewInvoicePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [selectedPaymentAccount, setSelectedPaymentAccount] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [shareMenuAnchor, setShareMenuAnchor] = useState(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // Business logo state
  const [showBusinessLogo, setShowBusinessLogo] = useState(true);
  const [businessLogo, setBusinessLogo] = useState(null);
  const [businessLogoLoading, setBusinessLogoLoading] = useState(false);
  const [businessLogoError, setBusinessLogoError] = useState(null);
  
  // QR code state
  const [showQRCode, setShowQRCode] = useState(true);
  const [qrCodeData, setQRCodeData] = useState(null);
  const [qrCodeLoading, setQRCodeLoading] = useState(false);
  const [qrCodeError, setQRCodeError] = useState(null);

  // Load invoice data from location state or localStorage
  useEffect(() => {
    console.log('ReviewInvoicePage: Component mounted or location changed');
    
    // Try to get invoice data from location state
    if (location.state && location.state.invoiceData) {
      console.log('ReviewInvoicePage: Found invoiceData in location state');
      setInvoiceData(location.state.invoiceData);
      setLoading(false);
    } else {
      console.log('ReviewInvoicePage: No invoiceData in location state, checking localStorage');
      // If not available in location state, try to get from localStorage
      const savedInvoiceData = localStorage.getItem('invoiceData');
      if (savedInvoiceData) {
        try {
          const parsedData = JSON.parse(savedInvoiceData);
          console.log('ReviewInvoicePage: Found invoiceData in localStorage');
          setInvoiceData(parsedData);
        } catch (error) {
          console.error('Error parsing invoice data from localStorage:', error);
        }
      } else {
        console.log('ReviewInvoicePage: No invoiceData found in localStorage');
      }
      setLoading(false);
    }
  }, [location]);

  // Fetch payment accounts when component mounts
  useEffect(() => {
    const fetchPaymentAccounts = async () => {
      try {
        console.log('ReviewInvoicePage: Fetching payment accounts');
        // In a real implementation, this would be an API call
        // const response = await api.get('/api/banks/all');
        
        // For demonstration, we'll use mock data
        const mockAccounts = [
          {
            id: 1,
            bankName: 'Chase Bank',
            accountNumber: '1234567890',
            accountHolderName: 'John Doe',
            isPrimaryAccount: true
          },
          {
            id: 2,
            bankName: 'Bank of America',
            accountNumber: '0987654321',
            accountHolderName: 'John Doe',
            isPrimaryAccount: false
          }
        ];
        
        setPaymentAccounts(mockAccounts);
        
        // Set the primary account as the default selected account
        const primaryAccount = mockAccounts.find(account => account.isPrimaryAccount);
        if (primaryAccount) {
          setSelectedPaymentAccount(primaryAccount.id);
        } else if (mockAccounts.length > 0) {
          setSelectedPaymentAccount(mockAccounts[0].id);
        }
      } catch (error) {
        console.error('Error fetching payment accounts:', error);
      }
    };
    
    fetchPaymentAccounts();
  }, []);

  // Fetch business logo when component mounts
  useEffect(() => {
    const fetchBusinessLogo = async () => {
      if (!invoiceData || !invoiceData.businessId) return;
      
      try {
        setBusinessLogoLoading(true);
        // In a real implementation, this would be an API call
        // const response = await fetch(`/api/v1/media/load?businessId=${invoiceData.businessId}&type=BUSINESS_LOGO`);
        
        // For demonstration, we'll use a mock response
        const mockResponse = {
          success: true,
          data: {
            assetData: ['base64-encoded-image-data'],
            contentType: 'image/png'
          }
        };
        
        if (mockResponse.success && mockResponse.data && mockResponse.data.assetData) {
          // In a real implementation, we would convert the byte array to a base64 string
          // For demonstration, we'll use the InvoktaLogo directly
          setBusinessLogo(InvoktaLogo);
        } else {
          console.error('Business logo data not found in response');
          setBusinessLogoError('Business logo not found');
        }
      } catch (error) {
        console.error('Error fetching business logo:', error);
        setBusinessLogoError(error.message);
      } finally {
        setBusinessLogoLoading(false);
      }
    };
    
    fetchBusinessLogo();
  }, [invoiceData]);

  // Fetch QR code data when showQRCode is toggled on
  useEffect(() => {
    if (showQRCode) {
      const fetchQRCodeData = async () => {
        try {
          setQRCodeLoading(true);
          setQRCodeError(null);
          
          console.log('ReviewInvoicePage: Fetching QR code data from API');
          
          // Make API call to fetch QR code data
          // In a real implementation, we would use the api service from the project
          // const response = await api.get('api/bank/details/qrcode');
          
          // For demonstration purposes, we'll simulate a successful API response
          const mockResponse = {
            qrCodeUrl: 'https://example.com/qr-code.png',
            upiId: 'payment@upi',
            description: 'Scan this QR code to pay via UPI'
          };
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Simulate successful response
          const response = {
            ok: true,
            json: async () => mockResponse
          };
          
          if (!response.ok) {
            throw new Error(`Failed to fetch QR code data: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log('QR code data fetched successfully:', data);
          
          setQRCodeData(data);
        } catch (error) {
          console.error('Error fetching QR code data:', error);
          setQRCodeError(error.message || 'Failed to fetch QR code data');
        } finally {
          setQRCodeLoading(false);
        }
      };
      
      fetchQRCodeData();
    } else {
      // Reset QR code data when switch is turned off
      setQRCodeData(null);
      setQRCodeError(null);
    }
  }, [showQRCode]);

  // Handle payment account change
  const handlePaymentAccountChange = (event) => {
    setSelectedPaymentAccount(event.target.value);
  };

  // Handle email address change
  const handleEmailAddressChange = (event) => {
    setEmailAddress(event.target.value);
  };

  // Handle share menu open
  const handleShareMenuOpen = (event) => {
    setShareMenuAnchor(event.currentTarget);
  };

  // Handle share menu close
  const handleShareMenuClose = () => {
    setShareMenuAnchor(null);
  };

  // Handle export menu open
  const handleExportMenuOpen = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };

  // Handle export menu close
  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  // Handle share via email
  const handleShareViaEmail = () => {
    console.log('ReviewInvoicePage: Share via email', emailAddress);
    handleShareMenuClose();
  };

  // Handle share via WhatsApp
  const handleShareViaWhatsApp = () => {
    console.log('ReviewInvoicePage: Share via WhatsApp');
    handleShareMenuClose();
  };

  // Handle share via Facebook
  const handleShareViaFacebook = () => {
    console.log('ReviewInvoicePage: Share via Facebook');
    window.open('https://www.facebook.com/kdheeraj1502@', '_blank');
    handleShareMenuClose();
  };

  // Handle share via Twitter/X
  const handleShareViaTwitter = () => {
    console.log('ReviewInvoicePage: Share via Twitter/X');
    window.open('https://www.x.com/kdheeraj1502', '_blank');
    handleShareMenuClose();
  };

  // Handle share via LinkedIn
  const handleShareViaLinkedIn = () => {
    console.log('ReviewInvoicePage: Share via LinkedIn');
    window.open('https://www.linkedin.com/kdheeraj1512', '_blank');
    handleShareMenuClose();
  };

  // Handle export as PDF
  const handleExportAsPDF = () => {
    console.log('ReviewInvoicePage: Export as PDF');
    handleExportMenuClose();
  };

  // Handle export as CSV
  const handleExportAsCSV = () => {
    console.log('ReviewInvoicePage: Export as CSV');
    handleExportMenuClose();
  };

  // Handle print
  const handlePrint = () => {
    console.log('ReviewInvoicePage: Print');
    window.print();
  };

  // Handle save and submit
  const handleSaveAndSubmit = async () => {
    console.log('ReviewInvoicePage: Save and submit');
    setSubmitting(true);
    
    try {
      // In a real implementation, this would be an API call
      // const response = await api.post('/api/invoices/submit', {
      //   ...invoiceData,
      //   paymentAccountId: selectedPaymentAccount
      // });
      
      // For demonstration, we'll simulate a successful API response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitSuccess(true);
      
      // Clear the invoice data from localStorage
      localStorage.removeItem('invoiceData');
      
      // Show success message for a few seconds, then navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Error submitting invoice:', error);
      setSubmitError(error.message || 'Failed to submit invoice');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle back button click
  const handleBack = () => {
    console.log('ReviewInvoicePage: Back button clicked');
    navigate(-1); // Navigate back to the previous page (InvoiceSummaryPage)
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>Loading invoice data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0, width: '100%', maxWidth: 'none' }}>
      {/* User Message */}
      <Box sx={{ mb: 3, p: 3, bgcolor: '#e8f5e9', borderRadius: 1, border: '1px solid #c8e6c9' }}>
        <Typography variant="h6" gutterBottom color="success.main">
          Review Invoice
        </Typography>
        <Typography variant="body1" paragraph>
          Review your invoice details and select a payment account before submitting.
        </Typography>
      </Box>

      {/* Invoice ID and Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          {invoiceData?.invoiceNumber || 'A00002'}
        </Typography>
        <Typography variant="subtitle1">
          Review Invoice
        </Typography>
      </Box>

      {/* Step Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip
            icon={<Check />}
            label="Add Invoice Details"
            color="success"
            variant="outlined"
            sx={{ mr: 1, fontWeight: 'bold' }}
          />
          <ArrowForward sx={{ color: 'text.secondary', mx: 1 }} />
          <Chip
            icon={<Check />}
            label="Add Bank Details"
            color="success"
            variant="outlined"
            sx={{ mr: 1, fontWeight: 'bold' }}
          />
          <ArrowForward sx={{ color: 'text.secondary', mx: 1 }} />
          <Chip
            label="3 Review & Submit"
            color="primary"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
      </Box>

      {/* Payment Account Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Select Payment Account
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="payment-account-label">Payment Account</InputLabel>
            <Select
              labelId="payment-account-label"
              id="payment-account"
              value={selectedPaymentAccount}
              onChange={handlePaymentAccountChange}
              label="Payment Account"
            >
              {paymentAccounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.bankName} - {account.accountNumber} ({account.accountHolderName})
                  {account.isPrimaryAccount && " (Primary)"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <FormControlLabel
              control={
                <Switch 
                  color="primary" 
                  checked={showQRCode}
                  onChange={(e) => setShowQRCode(e.target.checked)}
                />
              }
              label="Display Payment QR Code"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<Edit />}
          onClick={() => navigate('/invoices/new-invoice')}
        >
          Edit
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportMenuOpen}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<Share />}
            onClick={handleShareMenuOpen}
          >
            Share
          </Button>
        </Box>
      </Box>

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportMenuClose}
      >
        <MenuItemMUI onClick={handleExportAsPDF}>
          <ListItemIcon>
            <FileCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as PDF</ListItemText>
        </MenuItemMUI>
        <MenuItemMUI onClick={handleExportAsCSV}>
          <ListItemIcon>
            <FileCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as CSV</ListItemText>
        </MenuItemMUI>
      </Menu>

      {/* Share Menu */}
      <Menu
        anchorEl={shareMenuAnchor}
        open={Boolean(shareMenuAnchor)}
        onClose={handleShareMenuClose}
      >
        <Box sx={{ px: 2, py: 1, width: 300 }}>
          <Typography variant="subtitle1" gutterBottom>
            Share via Email
          </Typography>
          <TextField
            label="Email Address"
            value={emailAddress}
            onChange={handleEmailAddressChange}
            fullWidth
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleShareViaEmail}
            sx={{ mb: 2 }}
          >
            Send Email
          </Button>
          
          <Divider sx={{ my: 1 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Share via Social Media
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Button
              variant="outlined"
              startIcon={<WhatsApp />}
              onClick={handleShareViaWhatsApp}
            >
              WhatsApp
            </Button>
            <Button
              variant="outlined"
              startIcon={<Facebook />}
              onClick={handleShareViaFacebook}
            >
              Facebook
            </Button>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              startIcon={<Twitter />}
              onClick={handleShareViaTwitter}
            >
              Twitter/X
            </Button>
            <Button
              variant="outlined"
              startIcon={<LinkedIn />}
              onClick={handleShareViaLinkedIn}
            >
              LinkedIn
            </Button>
          </Box>
        </Box>
      </Menu>

      {/* Invoice Preview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Invoice Preview
          </Typography>
          
          {/* Invoice Content - This would be a simplified version of the invoice */}
          <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 3, mb: 3 }}>
            {/* Invoice Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ mr: 2 }}>
                  <img 
                    src={InvoiceLogo} 
                    alt="Invoice Logo" 
                    style={{ height: '100px', objectFit: 'contain' }} 
                  />
                </Box>
                <Typography variant="h6" fontWeight="bold">
                  Invoice
                </Typography>
              </Box>
              
              {showBusinessLogo && businessLogo && (
                <Box>
                  <img 
                    src={businessLogo} 
                    alt="Business Logo" 
                    style={{ maxHeight: '80px', maxWidth: '300px', objectFit: 'contain' }} 
                  />
                </Box>
              )}
            </Box>
            
            {/* Invoice Details - From and For sections */}
            <Grid container spacing={5} sx={{ mb: 6 }}>
              <Grid item xs={12} sm={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 5, 
                    bgcolor: '#f5f9ff', 
                    borderRadius: 2,
                    border: '1px solid #e3f2fd',
                    height: '100%',
                    minHeight: '240px'
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontSize: '1.3rem' }}>
                    From
                  </Typography>
                  <Typography variant="h6" fontWeight="medium" sx={{ fontSize: '1.2rem', my: 2 }}>
                    {invoiceData?.billedBy?.businessName || 'Your Business'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                    {invoiceData?.billedBy?.officeAddress?.country || 'United States of America (USA)'}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 5, 
                    bgcolor: '#fff8f5', 
                    borderRadius: 2,
                    border: '1px solid #ffebee',
                    height: '100%',
                    minHeight: '240px'
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontSize: '1.3rem' }}>
                    For
                  </Typography>
                  <Typography variant="h6" fontWeight="medium" sx={{ fontSize: '1.2rem', my: 2 }}>
                    {invoiceData?.billedTo?.businessName || 'Client Name'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                    {invoiceData?.billedTo?.officeAddress?.country || 'United States of America (USA)'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            
            {/* Invoice Summary */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Invoice Number
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {invoiceData?.invoiceNumber || 'A00002'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Invoice Date
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {invoiceData?.invoiceDate ? new Date(invoiceData.invoiceDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'Aug 28, 2025'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Due Date
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {invoiceData?.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'Sep 11, 2025'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Amount
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  ${invoiceData?.total || '1.00'}
                </Typography>
              </Grid>
            </Grid>
            
            {/* Invoice Items */}
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Items
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell width="5%">#</TableCell>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Rate</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(invoiceData?.purchasedOrderRequest?.itemDetailsRequest || [
                    { id: 1, itemName: 'Sample Item', quantity: 1, price: 1, amount: 1 }
                  ]).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}.</TableCell>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">${item.price}</TableCell>
                      <TableCell align="right">${item.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Bank Details */}
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Payment Details
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Bank:</strong> {paymentAccounts.find(account => account.id === selectedPaymentAccount)?.bankName || 'Chase Bank'}
              </Typography>
              <Typography variant="body2">
                <strong>Account Number:</strong> {paymentAccounts.find(account => account.id === selectedPaymentAccount)?.accountNumber || '1234567890'}
              </Typography>
              <Typography variant="body2">
                <strong>Account Holder:</strong> {paymentAccounts.find(account => account.id === selectedPaymentAccount)?.accountHolderName || 'John Doe'}
              </Typography>
            </Box>
            
            {/* Total */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Box sx={{ width: '200px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Total (USD)
                  </Typography>
                  <Typography variant="subtitle2" fontWeight="bold">
                    ${invoiceData?.total || '1.00'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Powered by Invokta */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                powered by
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '30px', mr: 1 }}>
                <img 
                  src={InvoktaLogo} 
                  alt="Invokta Logo" 
                  style={{ height: '100%', objectFit: 'contain' }} 
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                invokta.com
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, mb: 4 }}>
        <Button
          variant="outlined"
          color="primary"
          size="large"
          startIcon={<ArrowBack />}
          onClick={handleBack}
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Save />}
          onClick={handleSaveAndSubmit}
          disabled={submitting || submitSuccess}
        >
          {submitting ? 'Submitting...' : 'Save & Submit'}
        </Button>
      </Box>

      {/* Success Message */}
      {submitSuccess && (
        <Box sx={{ mb: 3, p: 3, bgcolor: '#e8f5e9', borderRadius: 1, border: '1px solid #c8e6c9' }}>
          <Typography variant="h6" gutterBottom color="success.main">
            Invoice Submitted Successfully
          </Typography>
          <Typography variant="body1" paragraph>
            Your invoice has been saved and submitted. Redirecting to dashboard...
          </Typography>
        </Box>
      )}

      {/* Error Message */}
      {submitError && (
        <Box sx={{ mb: 3, p: 3, bgcolor: '#ffebee', borderRadius: 1, border: '1px solid #ffcdd2' }}>
          <Typography variant="h6" gutterBottom color="error.main">
            Error Submitting Invoice
          </Typography>
          <Typography variant="body1" paragraph>
            {submitError}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveAndSubmit}
          >
            Try Again
          </Button>
        </Box>
      )}

      {/* Footer */}
      <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Need Help?
            </Typography>
            <Typography variant="body2" paragraph>
              If you have any questions or need assistance, please contact our support team.
            </Typography>
            <Button variant="outlined" color="primary">
              Contact Support
            </Button>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Share Invokta
            </Typography>
            <Typography variant="body2" paragraph>
              Share Invokta with your friends and family.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="primary" onClick={() => window.open('https://www.facebook.com/kdheeraj1502@', '_blank')}>
                <Facebook />
              </IconButton>
              <IconButton color="primary" onClick={() => window.open('https://www.x.com/kdheeraj1502', '_blank')}>
                <Twitter />
              </IconButton>
              <IconButton color="primary" onClick={() => window.open('https://www.linkedin.com/kdheeraj1512', '_blank')}>
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ReviewInvoicePage;