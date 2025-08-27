import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Grid, Paper, Divider, Button, Chip,
  Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, FormControlLabel, Switch, TextField,
  MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import {
  Edit, Print, Download, Email, WhatsApp, MoreVert,
  Check, ArrowForward, Add
} from '@mui/icons-material';

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

  return (
    <Box sx={{ p: 1 }}>
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
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  {/* Invoice Summary - Left Side (Vertical Layout) */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Invoice Summary
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Invoice No
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {invoiceData?.invoiceNumber || 'A00002'}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Status
                        </Typography>
                        <Chip
                          label="Unpaid"
                          color="error"
                          size="small"
                        />
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Invoice Date
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {invoiceData?.invoiceDate ? new Date(invoiceData.invoiceDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'Aug 27, 2025'}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
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
                      
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Total Amount
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          ${invoiceData?.total || '1'}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Payment Options
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          Account Transfer
                        </Typography>
                      </Box>
                      
                      <Box>
                        <FormControlLabel
                          control={<Switch color="primary" />}
                          label="Add Late payment fee"
                        />
                      </Box>
                    </Box>
                  </Grid>
                  
                  {/* Client Information - Right Side */}
                  <Grid item xs={12} md={6}>
                    {/* For - Client Information */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        For
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {invoiceData?.billedTo?.businessName || 'client name dheeraj'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {invoiceData?.billedTo?.officeAddress?.country || 'United States of America (USA)'}
                      </Typography>
                    </Box>
                    
                    {/* Client Balance */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Client Balance
                      </Typography>
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
                    
                    {/* Email Status */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Email Status
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        Not Sent
                      </Typography>
                    </Box>
                    
                    {/* Created by */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Created by
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        Dheeraj Kumar
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                {/* Show in Invoice and Tags at the bottom */}
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={<Switch color="primary" size="small" />}
                        label="Show in Invoice"
                      />
                    </Grid>
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
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Main Invoice Details */}
        <Grid item xs={12}>
          {/* Invoice Details Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Invoice
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Invoice No
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    #{invoiceData?.invoiceNumber || 'A00002'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Invoice Date
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {invoiceData?.invoiceDate ? new Date(invoiceData.invoiceDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'Aug 26, 2025'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Due Date
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {invoiceData?.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'Sep 10, 2025'}
                  </Typography>
                </Grid>
              </Grid>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    From
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {invoiceData?.billedBy?.businessName || 'asdfgh'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {invoiceData?.billedBy?.officeAddress?.country || 'United States of America (USA)'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    For
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {invoiceData?.billedTo?.businessName || 'client name dheeraj'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {invoiceData?.billedTo?.officeAddress?.country || 'United States of America (USA)'}
                  </Typography>
                </Grid>
              </Grid>
              
              {/* Invoice Items Table */}
              <TableContainer component={Paper} sx={{ mb: 3, width: '100%', overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
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
                <FormControlLabel
                  control={<Switch color="primary" />}
                  label="Hide Bank Details"
                />
              </Box>
              
              {/* Bank Details */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Bank Details
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Account Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      Dheeraj
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Account Number
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      523461431
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      IBAN
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      jdfjha
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Bank
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      dfjbhdfa
                    </Typography>
                  </Grid>
                </Grid>
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
            </CardContent>
          </Card>
        </Grid>
        
        {/* Customize Invoice Design - Full Width Row */}
        <Grid item xs={12}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
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