import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Grid, Paper, Divider, Button, Chip,
  Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, FormControlLabel, Switch, TextField,
  MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, InputAdornment,
  IconButton, Tooltip
} from '@mui/material';
import {
  Edit, Print, Download, Email, WhatsApp, MoreVert,
  Check, ArrowForward, Add, Remove, KeyboardArrowUp, KeyboardArrowDown,
  Visibility, VisibilityOff
} from '@mui/icons-material';
import InvoiceLogo from '../assets/INVOICE.png';
import InvoktaLogo from '../assets/invokta_invoice.png';

/**
 * InvoiceSummaryPage component for displaying the invoice summary after saving
 * with navigation flow at the top showing "(check)Add Invoice Details => 2 Add Bank Details => 3 Customise & Share"
 */
const InvoiceSummaryPage = () => {
  console.log('InvoiceSummaryPage: Component function called');
  
  const navigate = useNavigate();
  const location = useLocation();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1); // Start at step 2 (Add Bank Details)
  
  // Late fee dialog state
  const [lateFeeEnabled, setLateFeeEnabled] = useState(false);
  const [lateFeeDialogOpen, setLateFeeDialogOpen] = useState(false);
  const [lateFeeType, setLateFeeType] = useState('Percentage'); // 'Percentage' or 'Fixed Amount'
  const [lateFeeAmount, setLateFeeAmount] = useState('');
  const [lateFeeAmountError, setLateFeeAmountError] = useState(false);
  const [daysAfterDueDate, setDaysAfterDueDate] = useState(7);
  const [taxRate, setTaxRate] = useState('');
  const [showInInvoice, setShowInInvoice] = useState(true);
  
  // Bank details state
  const [showBankDetails, setShowBankDetails] = useState(true);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQRCodeData] = useState(null);
  const [qrCodeLoading, setQRCodeLoading] = useState(false);
  const [qrCodeError, setQRCodeError] = useState(null);
  
  // Business logo state
  const [showBusinessLogo, setShowBusinessLogo] = useState(true);
  const [businessLogo, setBusinessLogo] = useState(null);
  const [businessLogoLoading, setBusinessLogoLoading] = useState(false);
  const [businessLogoError, setBusinessLogoError] = useState(null);

  // Get the current date for the footer
  const currentDate = new Date();
  const formattedDate = `${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
  const formattedTime = `${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')} ${currentDate.getHours() >= 12 ? 'PM' : 'AM'}`;

  // Load invoice data from location state, localStorage, or handle direct navigation
  useEffect(() => {
    console.log('InvoiceSummaryPage: Component mounted or location changed');
    console.log('InvoiceSummaryPage: Current location:', location);
    console.log('InvoiceSummaryPage: Location state:', location.state);
    console.log('InvoiceSummaryPage: URL pathname:', location.pathname);
    
    // Check if this is a direct navigation to a specific invoice
    const pathParts = location.pathname.split('/');
    const invoiceId = pathParts[pathParts.length - 1];
    console.log('InvoiceSummaryPage: Extracted invoiceId from URL:', invoiceId);
    
    // Try to get invoice data from location state
    if (location.state && location.state.invoiceData) {
      console.log('InvoiceSummaryPage: Found invoiceData in location state:', location.state.invoiceData);
      setInvoiceData(location.state.invoiceData);
      setLoading(false);
    } else {
      console.log('InvoiceSummaryPage: No invoiceData in location state, checking localStorage');
      // If not available in location state, try to get from localStorage
      const savedInvoiceData = localStorage.getItem('invoiceData');
      if (savedInvoiceData) {
        try {
          const parsedData = JSON.parse(savedInvoiceData);
          console.log('InvoiceSummaryPage: Found invoiceData in localStorage:', parsedData);
          
          // If we have an invoiceId from the URL and it's not 'new', update the invoiceId in the data
          if (invoiceId && invoiceId !== 'new' && parsedData) {
            console.log('InvoiceSummaryPage: Updating invoiceId in data to match URL:', invoiceId);
            parsedData.invoiceId = invoiceId;
            parsedData.invoiceNumber = invoiceId; // Also update the invoice number for display
            localStorage.setItem('invoiceData', JSON.stringify(parsedData));
          }
          
          setInvoiceData(parsedData);
        } catch (error) {
          console.error('Error parsing invoice data from localStorage:', error);
        }
      } else {
        console.log('InvoiceSummaryPage: No invoiceData found in localStorage');
        
        // If we have an invoiceId from the URL and it's not 'new', create minimal data with that ID
        if (invoiceId && invoiceId !== 'new') {
          console.log('InvoiceSummaryPage: Creating minimal data with invoiceId from URL:', invoiceId);
          const minimalData = {
            invoiceId: invoiceId,
            invoiceNumber: invoiceId,
            invoiceDate: new Date().toISOString(),
            dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString()
          };
          setInvoiceData(minimalData);
          localStorage.setItem('invoiceData', JSON.stringify(minimalData));
        }
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
        const response = await fetch(`/api/v1/media/load?businessId=${invoiceData.businessId}&type=BUSINESS_LOGO`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch business logo: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data && data.data.assetData) {
          // Convert byte array to base64 string for display
          const base64String = data.data.assetData.join('');
          setBusinessLogo(`data:${data.data.contentType || 'image/png'};base64,${base64String}`);
        } else {
          console.error('Business logo data not found in response:', data);
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
          
          console.log('Fetching QR code data from API');
          
          // Make API call to fetch QR code data
          // Using the API service from the project
          // In a real implementation, we would use the api service from the project
          // const response = await api.get('api/bank/details/qrcode');
          
          // For demonstration purposes, we'll simulate a successful API response
          // This would be replaced with the actual API call in production
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

  // Handle step change
  const handleStepChange = (step) => {
    console.log('InvoiceSummaryPage: handleStepChange called with step:', step);
    setActiveStep(step);
    
    // Navigate based on step
    if (step === 0) {
      // Navigate back to invoice details
      console.log('InvoiceSummaryPage: About to navigate to /invoices/new-invoice using window.location');
      window.location.href = '/invoices/new-invoice';
    } else if (step === 2) {
      // Navigate to customise & share
      // This would be implemented in a future update
      // For now, just stay on the current page
      console.log('InvoiceSummaryPage: Step 2 selected, staying on current page');
    }
  };

  // Handle edit button click
  const handleEdit = () => {
    console.log('InvoiceSummaryPage: Edit button clicked');
    console.log('InvoiceSummaryPage: About to navigate to /invoices/new-invoice using window.location');
    window.location.href = '/invoices/new-invoice';
  };
  
  // Handle late fee switch change
  const handleLateFeeChange = (event) => {
    const checked = event.target.checked;
    setLateFeeEnabled(checked);
    if (checked) {
      setLateFeeDialogOpen(true);
    }
  };
  
  // Handle late fee dialog close
  const handleLateFeeDialogClose = () => {
    setLateFeeDialogOpen(false);
    // If no fee amount was set, disable the late fee
    if (!lateFeeAmount) {
      setLateFeeEnabled(false);
    }
  };
  
  // Handle late fee type change
  const handleLateFeeTypeChange = (event) => {
    setLateFeeType(event.target.value);
  };
  
  // Handle late fee amount change
  const handleLateFeeAmountChange = (event) => {
    const value = event.target.value;
    setLateFeeAmount(value);
    // Clear error if value is not empty
    if (value) {
      setLateFeeAmountError(false);
    }
  };
  
  // Handle days after due date change
  const handleDaysAfterDueDateChange = (event) => {
    setDaysAfterDueDate(event.target.value);
  };
  
  // Increment days after due date
  const incrementDaysAfterDueDate = () => {
    setDaysAfterDueDate(prevDays => prevDays + 1);
  };
  
  // Decrement days after due date
  const decrementDaysAfterDueDate = () => {
    setDaysAfterDueDate(prevDays => Math.max(1, prevDays - 1));
  };
  
  // Handle tax rate change
  const handleTaxRateChange = (event) => {
    setTaxRate(event.target.value);
  };
  
  // Handle show in invoice change
  const handleShowInInvoiceChange = (event) => {
    setShowInInvoice(event.target.checked);
  };
  
  // Handle late fee dialog submit
  const handleLateFeeDialogSubmit = () => {
    // Validate form
    if (!lateFeeAmount) {
      setLateFeeAmountError(true);
      return;
    }
    
    // Close dialog
    setLateFeeDialogOpen(false);
  };

  // Log rendering state
  console.log('InvoiceSummaryPage: Rendering component');
  console.log('InvoiceSummaryPage: Loading state:', loading);
  console.log('InvoiceSummaryPage: Invoice data state:', invoiceData);

  // Create a fallback invoice data object if invoiceData is null or undefined
  if (!invoiceData && !loading) {
    console.log('InvoiceSummaryPage: Creating fallback invoice data');
    // Create a minimal fallback invoice data object with default values
    const fallbackInvoiceData = {
      invoiceNumber: 'A00002',
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
      billedBy: {
        businessName: 'Your Business',
        officeAddress: { country: 'United States of America (USA)' }
      },
      billedTo: {
        businessName: 'Client Name',
        officeAddress: { country: 'United States of America (USA)' }
      },
      purchasedOrderRequest: {
        itemDetailsRequest: [
          { id: 1, itemName: 'Sample Item', quantity: 1, price: 1, amount: 1 }
        ]
      },
      total: '1.00'
    };
    
    // Set the fallback data to the state
    setInvoiceData(fallbackInvoiceData);
    
    // Also store it in localStorage for future reference
    localStorage.setItem('invoiceData', JSON.stringify(fallbackInvoiceData));
    
    console.log('InvoiceSummaryPage: Set fallback invoice data:', fallbackInvoiceData);
  }
  
  // Final safety check to ensure all required nested objects exist
  // This prevents errors if the data structure is incomplete
  if (invoiceData) {
    console.log('InvoiceSummaryPage: Performing final safety check on invoice data');
    
    // Ensure billedBy exists
    if (!invoiceData.billedBy) {
      console.log('InvoiceSummaryPage: Adding missing billedBy object');
      invoiceData.billedBy = {
        businessName: 'Your Business',
        officeAddress: { country: 'United States of America (USA)' }
      };
    }
    
    // Ensure billedBy.officeAddress exists
    if (invoiceData.billedBy && !invoiceData.billedBy.officeAddress) {
      console.log('InvoiceSummaryPage: Adding missing billedBy.officeAddress object');
      invoiceData.billedBy.officeAddress = { country: 'United States of America (USA)' };
    }
    
    // Ensure billedTo exists
    if (!invoiceData.billedTo) {
      console.log('InvoiceSummaryPage: Adding missing billedTo object');
      invoiceData.billedTo = {
        businessName: 'Client Name',
        officeAddress: { country: 'United States of America (USA)' }
      };
    }
    
    // Ensure billedTo.officeAddress exists
    if (invoiceData.billedTo && !invoiceData.billedTo.officeAddress) {
      console.log('InvoiceSummaryPage: Adding missing billedTo.officeAddress object');
      invoiceData.billedTo.officeAddress = { country: 'United States of America (USA)' };
    }
    
    // Ensure purchasedOrderRequest exists
    if (!invoiceData.purchasedOrderRequest) {
      console.log('InvoiceSummaryPage: Adding missing purchasedOrderRequest object');
      invoiceData.purchasedOrderRequest = {
        itemDetailsRequest: [
          { id: 1, itemName: 'Sample Item', quantity: 1, price: 1, amount: 1 }
        ]
      };
    }
    
    // Ensure purchasedOrderRequest.itemDetailsRequest exists and is an array
    if (invoiceData.purchasedOrderRequest && !Array.isArray(invoiceData.purchasedOrderRequest.itemDetailsRequest)) {
      console.log('InvoiceSummaryPage: Adding missing or fixing itemDetailsRequest array');
      invoiceData.purchasedOrderRequest.itemDetailsRequest = [
        { id: 1, itemName: 'Sample Item', quantity: 1, price: 1, amount: 1 }
      ];
    }
    
    // If itemDetailsRequest is an empty array, add a sample item
    if (invoiceData.purchasedOrderRequest && 
        Array.isArray(invoiceData.purchasedOrderRequest.itemDetailsRequest) && 
        invoiceData.purchasedOrderRequest.itemDetailsRequest.length === 0) {
      console.log('InvoiceSummaryPage: Adding sample item to empty itemDetailsRequest array');
      invoiceData.purchasedOrderRequest.itemDetailsRequest.push(
        { id: 1, itemName: 'Sample Item', quantity: 1, price: 1, amount: 1 }
      );
    }
  }

  if (loading) {
    console.log('InvoiceSummaryPage: Rendering loading state');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>Loading invoice data...</Typography>
      </Box>
    );
  }
  
  console.log('InvoiceSummaryPage: Rendering main content');

  // Late Fee Dialog
  const renderLateFeeDialog = () => {
    return (
      <Dialog
        open={lateFeeDialogOpen}
        onClose={handleLateFeeDialogClose}
        aria-labelledby="late-fee-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="late-fee-dialog-title">Charge Late Fee</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enable late payment fee to this invoice if it goes unpaid after the given date
          </DialogContentText>
          
          {/* Show In Invoice */}
          <FormControlLabel
            control={
              <Switch
                checked={showInInvoice}
                onChange={handleShowInInvoiceChange}
                color="primary"
              />
            }
            label="Show In Invoice"
            sx={{ mb: 2, display: 'block' }}
          />
          
          {/* Fee Type */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="fee-type-label">Fee Type</InputLabel>
            <Select
              labelId="fee-type-label"
              id="fee-type"
              value={lateFeeType}
              onChange={handleLateFeeTypeChange}
              label="Fee Type"
            >
              <MenuItem value="Percentage">Percentage</MenuItem>
              <MenuItem value="Fixed Amount">Fixed Amount</MenuItem>
            </Select>
          </FormControl>
          
          {/* Fee Amount */}
          <TextField
            label={lateFeeType === 'Percentage' ? '% Fee Amount' : 'Fee Amount'}
            value={lateFeeAmount}
            onChange={handleLateFeeAmountChange}
            fullWidth
            sx={{ mb: 2 }}
            error={lateFeeAmountError}
            helperText={lateFeeAmountError ? 'Fee amount is a required field' : ''}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {lateFeeType === 'Percentage' ? '%' : '$'}
                </InputAdornment>
              ),
            }}
          />
          
          {/* Days After Due Date */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Days After Due Date
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                value={daysAfterDueDate}
                onChange={handleDaysAfterDueDateChange}
                type="number"
                inputProps={{ min: 1 }}
                sx={{ width: '100px' }}
              />
              <Box sx={{ ml: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={incrementDaysAfterDueDate}
                  sx={{ minWidth: '36px', p: 0.5 }}
                >
                  <KeyboardArrowUp />
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={decrementDaysAfterDueDate}
                  sx={{ minWidth: '36px', p: 0.5, ml: 0.5 }}
                  disabled={daysAfterDueDate <= 1}
                >
                  <KeyboardArrowDown />
                </Button>
              </Box>
            </Box>
          </Box>
          
          {/* Tax Rate */}
          <TextField
            label="% Tax Rate"
            value={taxRate}
            onChange={handleTaxRateChange}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  %
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLateFeeDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLateFeeDialogSubmit} color="primary" variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ p: 0, width: '100%', maxWidth: 'none' }}>
      {/* Late Fee Dialog */}
      {renderLateFeeDialog()}
      
      {/* User Message */}
      <Box sx={{ mb: 3, p: 3, bgcolor: '#e8f5e9', borderRadius: 1, border: '1px solid #c8e6c9' }}>
        <Typography variant="h6" gutterBottom color="success.main">
          Invoice Summary Page
        </Typography>
        <Typography variant="body1" paragraph>
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
          <Button 
            variant="outlined" 
            color="success"
            size="small" 
            onClick={() => {
              console.log('InvoiceSummaryPage: Go to Dashboard button clicked');
              console.log('InvoiceSummaryPage: About to navigate to /dashboard using window.location');
              window.location.href = '/dashboard';
            }}
            sx={{ mr: 1 }}
          >
            Go to Dashboard
          </Button>
          <Button 
            variant="outlined" 
            color="primary"
            size="small" 
            onClick={() => {
              console.log('InvoiceSummaryPage: Back to Invoice Creation button clicked');
              console.log('InvoiceSummaryPage: About to navigate to /invoices/new-invoice using window.location');
              window.location.href = '/invoices/new-invoice';
            }}
            sx={{ mr: 1 }}
          >
            Back to Invoice Creation
          </Button>
        </Box>
      </Box>

      {/* Invoice ID and Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          {invoiceData?.invoiceNumber || 'A00002'}
        </Typography>
        <Typography variant="subtitle1">
          Create New Invoice
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
            onClick={() => handleStepChange(0)}
            sx={{ mr: 1, fontWeight: 'bold' }}
          />
          <ArrowForward sx={{ color: 'text.secondary', mx: 1 }} />
          <Chip
            label="2 Add Bank Details"
            color={activeStep === 1 ? "primary" : "default"}
            onClick={() => handleStepChange(1)}
            sx={{ mr: 1, fontWeight: 'bold' }}
          />
          <ArrowForward sx={{ color: 'text.secondary', mx: 1 }} />
          <Chip
            label="3 Customise & Share"
            color={activeStep === 2 ? "primary" : "default"}
            variant={activeStep < 2 ? "outlined" : "default"}
            onClick={() => handleStepChange(2)}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<Edit />}
          onClick={handleEdit}
        >
          Edit
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
          >
            Record Payment
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
          >
            Print
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
          >
            Download
          </Button>
          <Button
            variant="outlined"
            startIcon={<Email />}
          >
            Email / WhatsApp
          </Button>
          <Button
            variant="outlined"
            startIcon={<MoreVert />}
          >
            More
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Invoice Summary and Client Information in one wide box */}
        <Grid container spacing={3} sx={{ mb: 3}}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                {/* Invoice Summary - Two Column Layout */}
                <Box sx={{ width: '1260px' }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Invoice Summary
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {/* Left Column - Invoice Details (Vertical Layout) */}
                    <Grid item xs={12} md={6}  sx={{ width: '625px' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 2,
                        p: 2,
                        borderRight: { md: '1px solid #e0e0e0' }
                      }}>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 2, minWidth: '120px', flexShrink: 0 }}>
                            Invoice No:
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {invoiceData?.invoiceNumber || 'A00002'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 2, minWidth: '120px', flexShrink: 0 }}>
                            Status:
                          </Typography>
                          <Chip
                            label="Unpaid"
                            color="error"
                            size="small"
                          />
                        </Box>
                        
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 2, minWidth: '120px', flexShrink: 0 }}>
                            Invoice Date:
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {invoiceData?.invoiceDate ? new Date(invoiceData.invoiceDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'Aug 27, 2025'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 2, minWidth: '120px', flexShrink: 0 }}>
                            Due Date:
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {invoiceData?.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'Sep 10, 2025'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 2, minWidth: '120px', flexShrink: 0 }}>
                            Total Amount:
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            ${invoiceData?.total || '1'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 2, minWidth: '120px', flexShrink: 0 }}>
                            Payment Options:
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            Account Transfer
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 2, minWidth: '120px', flexShrink: 0 }}>
                            Late Fee:
                          </Typography>
                          <Box>
                            <FormControlLabel
                              control={
                                <Switch 
                                  color="primary" 
                                  checked={lateFeeEnabled}
                                  onChange={handleLateFeeChange}
                                />
                              }
                              label="Add Late payment fee"
                            />
                            
                            {/* Display late fee settings when enabled */}
                            {lateFeeEnabled && lateFeeAmount && (
                              <Box sx={{ mt: 1, ml: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {lateFeeType === 'Percentage' ? (
                                    `${lateFeeAmount}% of invoice amount after ${daysAfterDueDate} days`
                                  ) : (
                                    `$${lateFeeAmount} fixed amount after ${daysAfterDueDate} days`
                                  )}
                                  {taxRate && ` + ${taxRate}% tax`}
                                </Typography>
                                <Button
                                  variant="text"
                                  color="primary"
                                  size="small"
                                  onClick={() => setLateFeeDialogOpen(true)}
                                  sx={{ mt: 0.5, p: 0 }}
                                >
                                  Edit
                                </Button>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                    
                    {/* Right Column - Client Information (Vertical Layout) */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 2,
                        p: 2
                      }}>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 2, minWidth: '120px', flexShrink: 0 }}>
                            For:
                          </Typography>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {invoiceData?.billedTo?.businessName || 'client name dheeraj'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {invoiceData?.billedTo?.officeAddress?.country || 'United States of America (USA)'}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 2, minWidth: '120px', flexShrink: 0 }}>
                            Client Balance:
                          </Typography>
                          <Box>
                            <Typography variant="body1" fontWeight="medium" color="error">
                              $2(Due)
                            </Typography>
                            <Button
                              variant="text"
                              color="primary"
                              size="small"
                            >
                              View Ledger Statement
                            </Button>
                          </Box>
                        </Box>
                        
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 2, minWidth: '120px', flexShrink: 0 }}>
                            Email Status:
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            Not Sent
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 2, minWidth: '120px', flexShrink: 0 }}>
                            Created by:
                          </Typography>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              Dheeraj Kumar
                            </Typography>
                            <FormControlLabel
                              control={<Switch color="primary" size="small" />}
                              label="Show in Invoice"
                            />
                          </Box>
                        </Box>

                        <Box sx={{ mt: 2, pt: 2 }}>
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                      Tags
                                    </Typography>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<Add />}
                                    >
                                      Add Tags
                                    </Button>
                                  </Box>
                                </Grid>
                              </Grid>
                          </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                
                {/* Show in Invoice and Tags at the bottom */}

              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Main Invoice Details - Full Width */}
        <Grid item xs={12}>
          {/* Invoice Details Card */}
          <Card sx={{ mb: 3, width: '100%', maxWidth: 'none' }}>
            <CardContent sx={{ px: { xs: 2, sm: 3, md: 4, width: '1290px' } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {/* Invoice Logo */}
                  <Box sx={{ mr: 2, display: 'flex', justifyContent: 'flex-start' }}>
                    <img 
                      src={InvoiceLogo} 
                      alt="Invoice Logo" 
                      style={{ height: '200px', objectFit: 'contain' }} 
                    />
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    Invoice
                  </Typography>
                </Box>
                
                {/* Business Logo */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {showBusinessLogo && businessLogo && (
                    <Box sx={{ display: 'flex', alignItems: 'center', height: '160px' }}>
                      <img 
                        src={businessLogo} 
                        alt="Business Logo" 
                        style={{ maxHeight: '100%', maxWidth: '600px', objectFit: 'contain' }} 
                      />
                    </Box>
                  )}
                  <Tooltip title={showBusinessLogo ? "Hide Business Logo" : "Show Business Logo"}>
                    <IconButton 
                      onClick={() => setShowBusinessLogo(!showBusinessLogo)}
                      size="small"
                    >
                      {showBusinessLogo ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Invoice No
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    #{invoiceData?.invoiceNumber || 'A00002'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Invoice Date
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {invoiceData?.invoiceDate ? new Date(invoiceData.invoiceDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'Aug 26, 2025'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Due Date
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {invoiceData?.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'Sep 10, 2025'}
                  </Typography>
                </Box>
              </Box>

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
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontSize: '1.3rem', width: '493px' }}>
                      From
                    </Typography>
                    <Typography variant="h6" fontWeight="medium" sx={{ fontSize: '1.2rem', my: 2 }}>
                      {invoiceData?.billedBy?.businessName || 'asdfgh'}
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
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontSize: '1.3rem', width: '492px' }}>
                      For
                    </Typography>
                    <Typography variant="h6" fontWeight="medium" sx={{ fontSize: '1.2rem', my: 2 }}>
                      {invoiceData?.billedTo?.businessName || 'client name dheeraj'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                      {invoiceData?.billedTo?.officeAddress?.country || 'United States of America (USA)'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              {/* Invoice Items Table */}
              <TableContainer component={Paper} sx={{ mb: 3, width: '100%', overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#87CEEB' }}>
                      <TableCell width="5%">#</TableCell>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Rate</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(invoiceData?.purchasedOrderRequest?.itemDetailsRequest || [
                      { id: 1, itemName: 'pnaee', quantity: 11, price: 67868341, amount: 746551751 }
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
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  ₹0.00
                </Typography>
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
                </Box>
              </Box>
              
              {/* Bank Details and QR Code Section */}
              <Box sx={{ display: 'flex', mb: 3 }}>
                {/* Bank Details */}
                {showBankDetails && (
                  <Box sx={{ flex: 1, mr: showQRCode ? 2 : 0 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Bank Details
                    </Typography>
                    
                    <Grid container spacing={2} direction="column">
                      <Grid item xs={12}>
                        <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ width: '150px', flexShrink: 0 }}>
                            Account Name
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            Dheeraj
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ width: '150px', flexShrink: 0 }}>
                            Account Number
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            523461431
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ width: '150px', flexShrink: 0 }}>
                            IBAN
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            jdfjha
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ width: '150px', flexShrink: 0 }}>
                            Bank
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            dfjbhdfa
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
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
                          <Typography variant="body2" color="text.secondary">
                            Loading QR Code...
                          </Typography>
                        </Box>
                      )}
                      
                      {qrCodeError && (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="error">
                            Error: {qrCodeError}
                          </Typography>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            color="primary"
                            onClick={() => {
                              setQRCodeError(null);
                              setShowQRCode(true); // This will trigger the useEffect to fetch again
                            }}
                            sx={{ mt: 1 }}
                          >
                            Retry
                          </Button>
                        </Box>
                      )}
                      
                      {!qrCodeLoading && !qrCodeError && !qrCodeData && (
                        <Typography variant="body2" color="text.secondary">
                          QR Code will appear here
                        </Typography>
                      )}
                      
                      {!qrCodeLoading && !qrCodeError && qrCodeData && (
                        <Box 
                          component="img"
                          src={qrCodeData.qrCodeUrl || qrCodeData.imageUrl || qrCodeData.url}
                          alt="Payment QR Code"
                          sx={{ 
                            maxWidth: '100%', 
                            maxHeight: '100%',
                            objectFit: 'contain'
                          }}
                          onError={(e) => {
                            console.error('Error loading QR code image');
                            setQRCodeError('Failed to load QR code image');
                          }}
                        />
                      )}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      {qrCodeData?.description || 'Scan to pay via UPI'}
                    </Typography>
                    
                    {qrCodeData?.upiId && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        UPI ID: {qrCodeData.upiId}
                      </Typography>
                    )}
                  </Box>
                )}
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
                <Box sx={{ display: 'flex', alignItems: 'center', height: '60px', mr: 1 }}>
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
            </CardContent>
          </Card>
        </Grid>
        
        {/* Customize Invoice Design - Full Width Row */}
        <Grid item xs={12}>
          <Card sx={{ mb: 3, width: '1290px' }}>
            <CardContent sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Customize Invoice Design
                </Typography>
                <Chip label="Premium Feature" color="primary" size="small" />
              </Box>
              
              {/* Template Selection */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  1. Select Template
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Premium Feature: Choose from multiple premium templates.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  >
                    *
                  </Box>
                </Box>
              </Box>
              
              {/* Color and Font */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  2. Change Color & Font
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Premium Feature: Customize font type, style, and color.
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Change Color
                  </Typography>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: '#313944',
                      borderRadius: 1,
                      mt: 1,
                      mb: 2
                    }}
                  />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    #
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    313944
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Select Heading Font
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    Open Sans
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Select Body Font
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    Open Sans
                  </Typography>
                </Box>
              </Box>
              
              {/* Letterhead & Footer */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  3. Add LetterHead & Footer
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Premium Feature: Customize your documents with letterhead & footer.
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    Add Letterhead
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Recommended resolution 1000x200px and file size upto 500KB
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Final PDF Configurations
                  </Typography>
                  <FormControlLabel
                    control={<Switch color="primary" />}
                    label="Show only on First Page"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Header will be applied at the top of first page
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    Add Footer
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Recommended resolution 1000x200px and file size upto 500KB
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Final PDF Configuration
                  </Typography>
                  <FormControlLabel
                    control={<Switch color="primary" />}
                    label="Show only on Last Page"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Footer will be applied at the end of the content on the last page
                  </Typography>
                </Box>
              </Box>
              
              {/* Page Size, Margins & More */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  4. Page Size, Margins & More
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Premium Feature: Customise page size, margins, and more.
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Select Paper Size
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    A4
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Select Margin
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    Narrow
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Text Scale
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    Smaller
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={<Switch color="primary" />}
                    label="Hide Footer"
                  />
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={<Switch color="primary" />}
                    label="Landscape"
                  />
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={<Switch color="primary" />}
                    label="Pageless PDF"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Generate PDF without page-breaks.
                    Applies to all sharing options.
                  </Typography>
                </Box>
              </Box>
              
              {/* Script Selection */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  5. Change Script
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Select a supported script if you're using a non-english language and keyboard for your documents
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Select a Supported Script
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    English (Latin)
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={<Switch color="primary" />}
                    label="Enable right-to-left script"
                  />
                </Box>
              </Box>
              
              {/* Other Configurations */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  6. Other Configurations
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={<Switch color="primary" />}
                    label="Optimise text wrapping"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Intelligently break long text at natural word boundaries
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={<Switch color="primary" />}
                    label="Use Original Logo Image"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Select to use the original logo image for better quality. Will increase the PDF size.
                  </Typography>
                </Box>
              </Box>
              
              {/* Bank Details Configuration */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Bank Details
                </Typography>
                <Chip label="Enabled" color="success" size="small" />
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Show Bank Account Details
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    NEFT, IMPS, CASH
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Bank Account
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" fontWeight="medium">
                      dfjbhdfa
                    </Typography>
                    <Button
                      variant="text"
                      color="primary"
                      size="small"
                    >
                      Edit
                    </Button>
                  </Box>
                  <Typography variant="body2" fontWeight="medium">
                    Dheeraj
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Acc. No: 523461431
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    Select Another Bank Account
                  </Button>
                </Box>
              </Box>
              
              {/* Online Payment Options */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Online Payment Options
                </Typography>
                <Chip label="Not enabled" color="default" size="small" />
                
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Add Payment Link to Invoice
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Generate Payment Links to allow your clients to pay directly from your invoices.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    Enable Now
                  </Button>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Your KYC verification is pending. Please complete your KYC to accept international payments.
                  </Typography>
                  <Button
                    variant="text"
                    color="primary"
                    size="small"
                  >
                    Complete Now
                  </Button>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    External Payment Link
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, mb: 4 }}>
        <Button
          variant="outlined"
          color="primary"
          size="large"
          onClick={() => {
            console.log('InvoiceSummaryPage: Back button clicked');
            // Navigate back to invoice creation
            window.location.href = '/invoices/new-invoice';
          }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => {
            console.log('InvoiceSummaryPage: Next button clicked');
            // Save current invoice data to localStorage
            localStorage.setItem('invoiceData', JSON.stringify(invoiceData));
            // Navigate to review page
            navigate('/invoices/review', { state: { invoiceData } });
          }}
        >
          Next: Review Invoice
        </Button>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Download our app
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">
                • Download from Play Store
              </Typography>
              <Typography variant="body2">
                • Download from App Store
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Reach out to us for any help
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">
                • +91 88068 69021
              </Typography>
              <Typography variant="body2">
                • care@invokta.com
              </Typography>
              <Typography variant="body2">
                • Help and Support
              </Typography>
              <Typography variant="body2">
                • FAQs
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button variant="text" color="primary">
                Dashboard
              </Button>
              <Button variant="text" color="primary">
                Sales
              </Button>
              <Button variant="text" color="primary">
                Purchase
              </Button>
              <Button variant="text" color="primary">
                Reports
              </Button>
              <Button variant="text" color="primary">
                Manage Team
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default InvoiceSummaryPage;