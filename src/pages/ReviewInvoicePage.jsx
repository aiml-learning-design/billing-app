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
    console.log('ReviewInvoicePage: Component mounted or location changed');
    
    // Try to get data from location state
    if (location.state) {
      if (location.state.invoiceData) {
        console.log('ReviewInvoicePage: Found invoiceData in location state');
        setInvoiceData(location.state.invoiceData);
      }
      
      // Check for display preferences in location state
      if (location.state.displayPreferences) {
        console.log('ReviewInvoicePage: Found displayPreferences in location state', location.state.displayPreferences);
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
          console.log('ReviewInvoicePage: Converting additionalDetailsArray to Map', additionalDetailsArray);
          const detailsMap = new Map(additionalDetailsArray);
          setAdditionalDetails(detailsMap);
        }
      }
      
      setLoading(false);
    } else {
      console.log('ReviewInvoicePage: No data in location state, checking localStorage');
      
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
      
      // Check for display preferences in localStorage
      const savedDisplayPreferences = localStorage.getItem('invoiceDisplayPreferences');
      if (savedDisplayPreferences) {
        try {
          const parsedPreferences = JSON.parse(savedDisplayPreferences);
          console.log('ReviewInvoicePage: Found displayPreferences in localStorage', parsedPreferences);
          
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
            console.log('ReviewInvoicePage: Converting additionalDetailsArray from localStorage to Map', parsedPreferences.additionalDetailsArray);
            const detailsMap = new Map(parsedPreferences.additionalDetailsArray);
            setAdditionalDetails(detailsMap);
          }
        } catch (error) {
          console.error('Error parsing display preferences from localStorage:', error);
        }
      } else {
        console.log('ReviewInvoicePage: No displayPreferences found in localStorage');
      }
      
      setLoading(false);
    }
  }, [location]);

  // Fetch payment accounts when component mounts
  useEffect(() => {
    const fetchPaymentAccounts = async () => {
      try {
        console.log('ReviewInvoicePage: Fetching payment accounts');
        // Make API call to fetch bank accounts
        const response = await api.get('/api/banks/all');
        
        if (response && response.success) {
          // Extract the bank accounts from the response data
          const bankAccounts = response.data || [];
          
          // Map the API response to the format expected by the dropdown
          const formattedAccounts = bankAccounts.map(account => ({
            id: account.bankDetailsId,
            bankName: account.bankName,
            accountNumber: account.accountNumber,
            accountHolderName: account.accountHolderName,
            isPrimaryAccount: account.primaryAccount
          }));
          
          setPaymentAccounts(formattedAccounts);
          
          // Set the primary account as the default selected account
          const primaryAccount = formattedAccounts.find(account => account.isPrimaryAccount);
          if (primaryAccount) {
            setSelectedPaymentAccount(primaryAccount.id);
          } else if (formattedAccounts.length > 0) {
            setSelectedPaymentAccount(formattedAccounts[0].id);
          }
        } else {
          console.error('Failed to fetch bank accounts:', response?.message || 'Unknown error');
          // Use empty array if API call fails
          setPaymentAccounts([]);
        }
      } catch (error) {
        console.error('Error fetching payment accounts:', error);
        // Use empty array if API call fails
        setPaymentAccounts([]);
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
    
    // Validate that a payment account is selected
    if (!selectedPaymentAccount && paymentAccounts.length > 0) {
      setSubmitError('Please select a payment account before submitting the invoice.');
      return;
    }
    
    setSubmitting(true);
    setSubmitError(null);
    
    try {
      // Prepare the payload according to the required structure
      const selectedAccount = paymentAccounts.find(account => account.id === selectedPaymentAccount);
      
      // Convert additionalDetails Map to an object if it exists and is shown
      const additionalDetailsObj = showAdditionalDetails && additionalDetails.size > 0
        ? Object.fromEntries(additionalDetails)
        : {};
      
      const payload = {
        companyName: invoiceData?.billedBy?.businessName || "Acme Corporation",
        invoiceNumber: invoiceData?.invoiceNumber || "INV-2025-0001",
        invoiceDate: invoiceData?.invoiceDate || new Date().toISOString(),
        dueDate: invoiceData?.dueDate || new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
        AdditionalDetails: showAdditionalDetails && additionalDetails.size > 0
          ? additionalDetailsObj
          : invoiceData?.billedBy?.businessName || "Acme Corporation",
        billedBy: {
          businessId: invoiceData?.billedBy?.businessId || "string",
          businessName: invoiceData?.billedBy?.businessName || "string",
          gstin: invoiceData?.billedBy?.gstin || "string",
          pan: invoiceData?.billedBy?.pan || "string",
          email: invoiceData?.billedBy?.email || "string",
          phone: invoiceData?.billedBy?.phone || "string",
          officeAddress: {
            id: 0,
            email: invoiceData?.billedBy?.officeAddress?.email || "string",
            phone: invoiceData?.billedBy?.officeAddress?.phone || "string",
            addressLine: invoiceData?.billedBy?.officeAddress?.addressLine || "string",
            city: invoiceData?.billedBy?.officeAddress?.city || "string",
            state: invoiceData?.billedBy?.officeAddress?.state || "Andhra Pradesh",
            pincode: invoiceData?.billedBy?.officeAddress?.pincode || "string",
            country: invoiceData?.billedBy?.officeAddress?.country || "string"
          }
        },
        billedTo: {
          businessId: invoiceData?.billedTo?.businessId || "string",
          businessName: invoiceData?.billedTo?.businessName || "string",
          gstin: invoiceData?.billedTo?.gstin || "string",
          pan: invoiceData?.billedTo?.pan || "string",
          email: invoiceData?.billedTo?.email || "string",
          phone: invoiceData?.billedTo?.phone || "string",
          officeAddress: {
            id: 0,
            email: invoiceData?.billedTo?.officeAddress?.email || "string",
            phone: invoiceData?.billedTo?.officeAddress?.phone || "string",
            addressLine: invoiceData?.billedTo?.officeAddress?.addressLine || "string",
            city: invoiceData?.billedTo?.officeAddress?.city || "string",
            state: invoiceData?.billedTo?.officeAddress?.state || "Andhra Pradesh",
            pincode: invoiceData?.billedTo?.officeAddress?.pincode || "string",
            country: invoiceData?.billedTo?.officeAddress?.country || "string"
          }
        },
        shippingFrom: {},
        shippingTo: {},
        currency: invoiceData?.currency || "INR",
        purchasedOrderRequest: {
          itemDetailsRequest: (invoiceData?.purchasedOrderRequest?.itemDetailsRequest || []).map(item => ({
            itemName: item.itemName || "string",
            gstRate: item.gstRate || 0,
            sgst: item.sgst || 0,
            cgst: item.cgst || 0,
            igst: item.igst || 0,
            quantity: item.quantity || 0,
            price: item.price || 0,
            amount: item.amount || 0,
            total: item.total || 0,
            itemDescription: item.itemDescription || "string"
          }))
        },
        itemDescription: invoiceData?.itemDescription || "Software development services for July 2025",
        invoiceFor: invoiceData?.invoiceFor || "CUSTOMER",
        termsConditions: {
          additionalProp1: ["string"],
          additionalProp2: ["string"],
          additionalProp3: ["string"]
        },
        additionalNotes: invoiceData?.additionalNotes || "Payment is due within 10 days."
      };
      
      console.log('ReviewInvoicePage: Submitting invoice with payload', payload);
      
      // Make API call to create the invoice
      const response = await api.post('/api/invoices/create', payload);
      
      // Check if the API call was successful
      if (response && response.success) {
        setSubmitSuccess(true);
        
        // Clear the invoice data from localStorage
        localStorage.removeItem('invoiceData');
        localStorage.removeItem('invoiceDisplayPreferences');
        
        // Don't navigate away - user will see success UI with large buttons
      } else {
        throw new Error(response?.message || 'Failed to submit invoice');
      }
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
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Typography>Loading payment accounts...</Typography>
            </Box>
          ) : paymentAccounts.length === 0 ? (
            <Box sx={{ p: 2, bgcolor: '#fff8f5', borderRadius: 1, mb: 2 }}>
              <Typography color="error" gutterBottom>
                No payment accounts found.
              </Typography>
              <Typography variant="body2">
                Please add a bank account in the Payment Accounts page before proceeding.
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                size="small" 
                sx={{ mt: 1 }}
                onClick={() => navigate('/payment-accounts')}
              >
                Go to Payment Accounts
              </Button>
            </Box>
          ) : (
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
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch 
                    color="primary" 
                    checked={showBankDetails}
                    onChange={(e) => setShowBankDetails(e.target.checked)}
                  />
                }
                label="Hide Bank Details"
              />
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
              <FormControlLabel
                control={
                  <Switch 
                    color="primary" 
                    checked={showAdditionalDetails}
                    onChange={(e) => setShowAdditionalDetails(e.target.checked)}
                    disabled={additionalDetails.size === 0}
                  />
                }
                label="Show Additional Details"
              />
            </Box>
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
            
            {/* Bank Details and QR Code Section */}
            <Box sx={{ display: 'flex', mb: 3 }}>
              {/* Bank Details */}
              {showBankDetails && (
                <Box sx={{ flex: 1, mr: showQRCode ? 2 : 0 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Payment Details
                  </Typography>
                  <Box>
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
                </Box>
              )}
              
              {/* QR Code */}
              {showQRCode && (
                <Box sx={{ 
                  flex: 1, 
                  ml: showBankDetails ? 2 : 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px dashed #ccc',
                  borderRadius: 1,
                  p: 2
                }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Payment QR Code
                  </Typography>
                  
                  <Box sx={{ 
                    width: 200, 
                    height: 200, 
                    bgcolor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    position: 'relative'
                  }}>
                    {qrCodeLoading && (
                      <Box sx={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(255, 255, 255, 0.8)'
                      }}>
                        <Typography>Loading...</Typography>
                      </Box>
                    )}
                    
                    {qrCodeError && (
                      <Typography color="error" align="center">
                        {qrCodeError}
                      </Typography>
                    )}
                    
                    {qrCodeData && !qrCodeLoading && !qrCodeError && (
                      <img 
                        src={qrCodeData.qrCodeUrl || 'https://example.com/qr-code.png'} 
                        alt="Payment QR Code" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                      />
                    )}
                  </Box>
                  
                  <Typography variant="body2" align="center">
                    {qrCodeData?.description || 'Scan this QR code to pay via UPI'}
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* Additional Details Section */}
            {showAdditionalDetails && additionalDetails.size > 0 && (
              <Box sx={{ mb: 3, border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Additional Details
                </Typography>
                <Grid container spacing={2}>
                  {Array.from(additionalDetails.entries()).map(([key, value]) => (
                    <Grid item xs={12} key={key}>
                      <Box sx={{ p: 1, display: 'flex', alignItems: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ width: '150px', flexShrink: 0 }}>
                          {key}
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            
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
          disabled={submitting || submitSuccess || !selectedPaymentAccount || paymentAccounts.length === 0}
          title={!selectedPaymentAccount && paymentAccounts.length > 0 ? 'Please select a payment account' : 
                 paymentAccounts.length === 0 ? 'No payment accounts available' : ''}
        >
          {submitting ? 'Submitting...' : 'Save & Submit'}
        </Button>
      </Box>

      {/* Success Message with Large Buttons */}
      {submitSuccess && (
        <Box sx={{ mb: 3, p: 4, bgcolor: '#e8f5e9', borderRadius: 1, border: '1px solid #c8e6c9' }}>
          <Typography variant="h5" gutterBottom color="success.main" sx={{ fontWeight: 'bold', mb: 2 }}>
            Invoice Generated Successfully
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 3 }}>
            Your invoice has been saved and submitted successfully. You can now export, share, or print your invoice.
          </Typography>
          
          {/* Large Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Print sx={{ fontSize: 28 }} />}
              onClick={handlePrint}
              sx={{ 
                py: 2, 
                px: 4, 
                fontSize: '1.1rem', 
                fontWeight: 'bold',
                minWidth: '180px'
              }}
            >
              Print
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Download sx={{ fontSize: 28 }} />}
              onClick={handleExportMenuOpen}
              sx={{ 
                py: 2, 
                px: 4, 
                fontSize: '1.1rem', 
                fontWeight: 'bold',
                minWidth: '180px'
              }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Share sx={{ fontSize: 28 }} />}
              onClick={handleShareMenuOpen}
              sx={{ 
                py: 2, 
                px: 4, 
                fontSize: '1.1rem', 
                fontWeight: 'bold',
                minWidth: '180px'
              }}
            >
              Share
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </Box>
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
            disabled={submitting || !selectedPaymentAccount || paymentAccounts.length === 0}
            title={!selectedPaymentAccount && paymentAccounts.length > 0 ? 'Please select a payment account' : 
                   paymentAccounts.length === 0 ? 'No payment accounts available' : ''}
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