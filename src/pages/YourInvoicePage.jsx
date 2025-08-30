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
  Print, Download, Email, WhatsApp, 
  Facebook, Twitter, LinkedIn, Share, FileCopy
} from '@mui/icons-material';
import InvoiceLogo from '../assets/INVOICE.png';
import InvoktaLogo from '../assets/invokta_invoice.png';
import api from '../services/api';

/**
 * YourInvoicePage component for displaying the final invoice after submission
 * with options to print, export, and share the invoice
 */
const YourInvoicePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailAddress, setEmailAddress] = useState('');
  const [shareMenuAnchor, setShareMenuAnchor] = useState(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  
  // Business logo state
  const [showBusinessLogo, setShowBusinessLogo] = useState(true);
  const [businessLogo, setBusinessLogo] = useState(null);
  const [businessLogoLoading, setBusinessLogoLoading] = useState(false);
  const [businessLogoError, setBusinessLogoError] = useState(null);
  
  // Bank details state
  const [showBankDetails, setShowBankDetails] = useState(false);
  
  // QR code state
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQRCodeData] = useState(null);
  const [qrCodeLoading, setQRCodeLoading] = useState(false);
  const [qrCodeError, setQRCodeError] = useState(null);
  
  // Additional details state
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const [additionalDetails, setAdditionalDetails] = useState(new Map());

  // Load invoice data and display preferences from location state or localStorage
  useEffect(() => {
    console.log('YourInvoicePage: Component mounted or location changed');
    
    // Try to get data from location state
    if (location.state) {
      if (location.state.invoiceData) {
        console.log('YourInvoicePage: Found invoiceData in location state');
        setInvoiceData(location.state.invoiceData);
      }
      
      // Check for display preferences in location state
      if (location.state.displayPreferences) {
        console.log('YourInvoicePage: Found displayPreferences in location state', location.state.displayPreferences);
        const { 
          showBankDetails: bankDetails, 
          showQRCode: qrCode,
          showAdditionalDetails: additionalDetailsVisible,
          additionalDetailsArray
        } = location.state.displayPreferences;
        
        // Only set these if they are defined (using optional chaining and nullish coalescing)
        if (bankDetails !== undefined) setShowBankDetails(bankDetails);
        if (qrCode !== undefined) setShowQRCode(qrCode);
        if (additionalDetailsVisible !== undefined) setShowAdditionalDetails(additionalDetailsVisible);
        
        // Convert additionalDetailsArray back to a Map if it exists
        if (additionalDetailsArray && Array.isArray(additionalDetailsArray)) {
          console.log('YourInvoicePage: Converting additionalDetailsArray to Map', additionalDetailsArray);
          const detailsMap = new Map(additionalDetailsArray);
          setAdditionalDetails(detailsMap);
        }
      }
      
      setLoading(false);
    } else {
      console.log('YourInvoicePage: No data in location state, checking localStorage');
      
      // If not available in location state, try to get from localStorage
      const savedInvoiceData = localStorage.getItem('invoiceData');
      if (savedInvoiceData) {
        try {
          const parsedData = JSON.parse(savedInvoiceData);
          console.log('YourInvoicePage: Found invoiceData in localStorage');
          setInvoiceData(parsedData);
        } catch (error) {
          console.error('Error parsing invoice data from localStorage:', error);
        }
      } else {
        console.log('YourInvoicePage: No invoiceData found in localStorage');
      }
      
      // Check for display preferences in localStorage
      const savedDisplayPreferences = localStorage.getItem('invoiceDisplayPreferences');
      if (savedDisplayPreferences) {
        try {
          const parsedPreferences = JSON.parse(savedDisplayPreferences);
          console.log('YourInvoicePage: Found displayPreferences in localStorage', parsedPreferences);
          
          // Only set these if they are defined
          if (parsedPreferences.showBankDetails !== undefined) {
            setShowBankDetails(parsedPreferences.showBankDetails);
          }
          if (parsedPreferences.showQRCode !== undefined) {
            setShowQRCode(parsedPreferences.showQRCode);
          }
          if (parsedPreferences.showAdditionalDetails !== undefined) {
            setShowAdditionalDetails(parsedPreferences.showAdditionalDetails);
          }
          
          // Convert additionalDetailsArray back to a Map if it exists
          if (parsedPreferences.additionalDetailsArray && Array.isArray(parsedPreferences.additionalDetailsArray)) {
            console.log('YourInvoicePage: Converting additionalDetailsArray from localStorage to Map', parsedPreferences.additionalDetailsArray);
            const detailsMap = new Map(parsedPreferences.additionalDetailsArray);
            setAdditionalDetails(detailsMap);
          }
        } catch (error) {
          console.error('Error parsing display preferences from localStorage:', error);
        }
      } else {
        console.log('YourInvoicePage: No displayPreferences found in localStorage');
      }
      
      setLoading(false);
    }
  }, [location]);

  // Fetch business logo when component mounts
  useEffect(() => {
    const fetchBusinessLogo = async () => {
      if (!invoiceData || !invoiceData.businessId) return;
      
      try {
        setBusinessLogoLoading(true);
        // In a real implementation, this would be an API call
        // const response = await fetch(`/api/v1/media/load?keyIdentifier=${invoiceData.businessId}&type=BUSINESS_LOGO`);
        
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
          
          console.log('YourInvoicePage: Fetching QR code data from API');
          
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
    console.log('YourInvoicePage: Share via email', emailAddress);
    handleShareMenuClose();
  };

  // Handle share via WhatsApp
  const handleShareViaWhatsApp = () => {
    console.log('YourInvoicePage: Share via WhatsApp');
    handleShareMenuClose();
  };

  // Handle share via Facebook
  const handleShareViaFacebook = () => {
    console.log('YourInvoicePage: Share via Facebook');
    window.open('https://www.facebook.com/kdheeraj1502@', '_blank');
    handleShareMenuClose();
  };

  // Handle share via Twitter/X
  const handleShareViaTwitter = () => {
    console.log('YourInvoicePage: Share via Twitter/X');
    window.open('https://www.x.com/kdheeraj1502', '_blank');
    handleShareMenuClose();
  };

  // Handle share via LinkedIn
  const handleShareViaLinkedIn = () => {
    console.log('YourInvoicePage: Share via LinkedIn');
    window.open('https://www.linkedin.com/kdheeraj1512', '_blank');
    handleShareMenuClose();
  };

  // Handle export as PDF
  const handleExportAsPDF = async () => {
    console.log('YourInvoicePage: Export as PDF');
    
    try {
      // Create payload for PDF export
      const payload = {
        invoiceNumber: invoiceData?.invoiceNumber,
        bankDetails: showBankDetails ? {
          accountNumber: invoiceData?.bankDetails?.accountNumber
        } : null,
        QRCode: showQRCode
      };
      
      console.log('Exporting PDF with payload:', payload);
      
      // Make API call to export PDF
      const response = await api.post('/api/invoices/export/pdf', payload);
      
      if (response && response.success) {
        // Handle successful PDF export
        console.log('PDF exported successfully');
        
        // In a real implementation, we would download the PDF file
        // For demonstration, we'll just log a success message
        console.log('PDF download URL:', response.data?.downloadUrl);
      } else {
        throw new Error(response?.message || 'Failed to export PDF');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      // Show error message to user
    }
    
    handleExportMenuClose();
  };

  // Handle export as CSV
  const handleExportAsCSV = () => {
    console.log('YourInvoicePage: Export as CSV');
    handleExportMenuClose();
  };

  // Handle print
  const handlePrint = () => {
    console.log('YourInvoicePage: Print');
    
    // Create a printable version of the invoice
    const printContent = document.getElementById('printable-invoice');
    
    if (printContent) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write('<html><head><title>Print Invoice</title>');
      
      // Add styles for printing
      printWindow.document.write(`
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
          }
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      `);
      
      printWindow.document.write('</head><body>');
      printWindow.document.write('<div class="invoice-container">');
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.write('</div></body></html>');
      
      printWindow.document.close();
      printWindow.focus();
      
      // Print after a short delay to ensure content is loaded
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    navigate('/dashboard');
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
          Your Invoice
        </Typography>
        <Typography variant="body1" paragraph>
          Your invoice has been successfully created. You can print, export, or share it using the buttons below.
        </Typography>
      </Box>

      {/* Invoice ID and Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          {invoiceData?.invoiceNumber || 'A00002'}
        </Typography>
        <Typography variant="subtitle1">
          Your Invoice
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          variant="outlined"
          onClick={handleBackToDashboard}
        >
          Back to Dashboard
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

      {/* Invoice Preview - Printable Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Invoice
          </Typography>
          
          {/* Invoice Content - This is the printable section */}
          <Box id="printable-invoice" sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 3, mb: 3 }}>
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
                    bgcolor: '#fff8e1', 
                    borderRadius: 2,
                    border: '1px solid #ffecb3',
                    height: '100%',
                    minHeight: '240px'
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontSize: '1.3rem' }}>
                    For
                  </Typography>
                  <Typography variant="h6" fontWeight="medium" sx={{ fontSize: '1.2rem', my: 2 }}>
                    {invoiceData?.billedTo?.businessName || 'Client Business'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                    {invoiceData?.billedTo?.officeAddress?.country || 'United States of America (USA)'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            
            {/* Invoice Details - Invoice Number, Date, etc. */}
            <Grid container spacing={3} sx={{ mb: 6 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Invoice Number
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {invoiceData?.invoiceNumber || 'A00002'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Invoice Date
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {invoiceData?.invoiceDate ? new Date(invoiceData.invoiceDate).toLocaleDateString() : new Date().toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Due Date
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {invoiceData?.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString() : new Date(new Date().setDate(new Date().getDate() + 10)).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Currency
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {invoiceData?.currency || 'INR'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {/* Invoice Items */}
            <TableContainer component={Paper} elevation={0} sx={{ mb: 6, border: '1px solid #e0e0e0' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>GST</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(invoiceData?.purchasedOrderRequest?.itemDetailsRequest || []).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {item.itemName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.itemDescription}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{item.price}</TableCell>
                      <TableCell align="right">{item.gstRate}%</TableCell>
                      <TableCell align="right">{item.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Invoice Summary */}
            <Grid container spacing={3} sx={{ mb: 6 }}>
              <Grid item xs={12} sm={6}>
                {/* Additional Notes */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Additional Notes
                  </Typography>
                  <Typography variant="body2">
                    {invoiceData?.additionalNotes || 'Payment is due within 10 days.'}
                  </Typography>
                </Box>
                
                {/* Bank Details (if enabled) */}
                {showBankDetails && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Bank Details
                    </Typography>
                    <Typography variant="body2">
                      <strong>Bank:</strong> {invoiceData?.bankDetails?.bankName || 'Chase Bank'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Account Number:</strong> {invoiceData?.bankDetails?.accountNumber || '1234567890'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Account Holder:</strong> {invoiceData?.bankDetails?.accountHolderName || 'John Doe'}
                    </Typography>
                  </Box>
                )}
                
                {/* QR Code (if enabled) */}
                {showQRCode && qrCodeData && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Payment QR Code
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Box sx={{ border: '1px solid #e0e0e0', p: 1, borderRadius: 1, mr: 2 }}>
                        {/* Placeholder for QR code image */}
                        <Box sx={{ width: 100, height: 100, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="caption">QR Code</Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="body2">
                          {qrCodeData.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          UPI ID: {qrCodeData.upiId}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
                
                {/* Additional Details (if enabled) */}
                {showAdditionalDetails && additionalDetails.size > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Additional Details
                    </Typography>
                    {Array.from(additionalDetails.entries()).map(([key, value]) => (
                      <Box key={key} sx={{ display: 'flex', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', mr: 1 }}>
                          {key}:
                        </Typography>
                        <Typography variant="body2">
                          {value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ bgcolor: '#f9f9f9', p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Subtotal</Typography>
                    <Typography variant="body1">
                      {invoiceData?.currency || 'INR'} {invoiceData?.subtotal || '1000.00'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">GST</Typography>
                    <Typography variant="body1">
                      {invoiceData?.currency || 'INR'} {invoiceData?.gst || '180.00'}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight="bold">Total</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {invoiceData?.currency || 'INR'} {invoiceData?.total || '1180.00'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            
            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 6, pt: 3, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="body2" color="text.secondary">
                Thank you for your business!
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                This is a computer-generated invoice and does not require a signature.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default YourInvoicePage;