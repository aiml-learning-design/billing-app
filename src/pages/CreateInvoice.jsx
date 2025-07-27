import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Box, Typography, Button, Grid, Card, CardContent,
  TextField, Divider, Select, MenuItem, FormControl,
  InputLabel, IconButton, Checkbox, FormControlLabel,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  CloudUpload as UploadIcon,
  ContentCopy as DuplicateIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const CreateInvoice = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [lastInvoice, setLastInvoice] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [currency, setCurrency] = useState('INR');
  const [client, setClient] = useState({
    businessName: '',
    address: '',
    gstin: '',
    email: '',
    phone: ''
  });
  const [items, setItems] = useState([
    {
      id: 1,
      name: '',
      hsn: '',
      gstRate: 18,
      quantity: 1,
      rate: 0,
      amount: 0,
      description: ''
    }
  ]);
  const [terms, setTerms] = useState([
    'Please pay within 15 days from the date of invoice, overdue interest @ 14% will be charged on delayed payments.',
    'Please quote invoice number when remitting funds.'
  ]);
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState({
    showTaxSummary: false,
    showHsnSummary: false,
    showThumbnails: false,
    hidePlaceOfSupply: false
  });

  // Set selected business when user data is loaded
  useEffect(() => {
    if (user?.businesses && user.businesses.length > 0) {
      const business = user.businesses[0];
      setSelectedBusiness(business);

      // Generate invoice number based on last invoice
      api.get(`/api/invoices/last?businessId=${business.business_id}`)
        .then(response => {
          if (response.data) {
            setLastInvoice(response.data);
            const lastNumber = parseInt(response.data.invoiceNumber.replace(/^\D+/g, ''));
            setInvoiceNumber(`A${String(lastNumber + 1).padStart(5, '0')}`);
          } else {
            setInvoiceNumber('A00001');
          }
        })
        .catch(err => {
          console.error('Failed to fetch last invoice', err);
          setInvoiceNumber('A00001');
        });
    }
  }, [user]);

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        // Calculate amount if quantity or rate changes
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        }

        return updatedItem;
      }
      return item;
    }));
  };

  const addNewItem = () => {
    setItems([
      ...items,
      {
        id: items.length + 1,
        name: '',
        hsn: '',
        gstRate: 18,
        quantity: 1,
        rate: 0,
        amount: 0,
        description: ''
      }
    ]);
  };

  const duplicateItem = (id) => {
    const itemToDuplicate = items.find(item => item.id === id);
    if (itemToDuplicate) {
      setItems([
        ...items,
        {
          ...itemToDuplicate,
          id: items.length + 1
        }
      ]);
    }
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const addTerm = () => {
    setTerms([...terms, '']);
  };

  const updateTerm = (index, value) => {
    const newTerms = [...terms];
    newTerms[index] = value;
    setTerms(newTerms);
  };

  const removeTerm = (index) => {
    if (terms.length > 1) {
      setTerms(terms.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = items.reduce((sum, item) => sum + (item.amount * item.gstRate / 100), 0);
    const total = subtotal + tax;

    return { subtotal, tax, total };
  };

  const handleSubmit = async (saveAsDraft = false) => {
    try {
      const invoiceData = {
        businessId: selectedBusiness.business_id,
        invoiceNumber,
        invoiceDate,
        dueDate,
        currency,
        client,
        items,
        terms,
        notes,
        status: saveAsDraft ? 'DRAFT' : 'PENDING',
        subtotal: calculateTotals().subtotal,
        tax: calculateTotals().tax,
        total: calculateTotals().total
      };

      await api.post('/api/invoices', invoiceData);
      navigate('/invoices');
    } catch (error) {
      console.error('Failed to save invoice', error);
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  if (!selectedBusiness) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Create New Invoice
      </Typography>

      <Grid container spacing={3}>
        {/* Left Column - Invoice Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Invoice
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Invoice No*"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    fullWidth
                  />
                  {lastInvoice && (
                    <Typography variant="caption" color="text.secondary">
                      Last No: {lastInvoice.invoiceNumber} ({new Date(lastInvoice.invoiceDate).toLocaleDateString()})
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Due Date"
                      value={dueDate}
                      onChange={(newValue) => setDueDate(newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Billed By Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Billed By</Typography>
                <Button startIcon={<EditIcon />}>Edit</Button>
              </Box>

              <Typography variant="subtitle1">Your Details</Typography>
              <Typography variant="body2" color="text.secondary">Business details</Typography>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedBusiness.businessName}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2">
                    {selectedBusiness.officeAddresses?.[0]?.addressLine}, {selectedBusiness.officeAddresses?.[0]?.city},
                    {selectedBusiness.officeAddresses?.[0]?.state}, {selectedBusiness.officeAddresses?.[0]?.country}
                  </Typography>
                  <Typography variant="body2">
                    - {selectedBusiness.officeAddresses?.[0]?.pincode}
                  </Typography>
                </Grid>

                {selectedBusiness.gstin && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      GSTIN: {selectedBusiness.gstin}
                    </Typography>
                  </Grid>
                )}

                {selectedBusiness.pan && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      PAN: {selectedBusiness.pan}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    Email: {selectedBusiness.officeAddresses?.[0]?.primaryEmail}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    Phone: {selectedBusiness.officeAddresses?.[0]?.phone}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Billed To Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Billed To</Typography>
                <Button startIcon={<EditIcon />}>Edit</Button>
              </Box>

              <Typography variant="subtitle1">Client's Details</Typography>
              <Typography variant="body2" color="text.secondary">Business details</Typography>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Business Name"
                    value={client.businessName}
                    onChange={(e) => setClient({...client, businessName: e.target.value})}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    value={client.address}
                    onChange={(e) => setClient({...client, address: e.target.value})}
                    fullWidth
                    multiline
                    rows={3}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="GSTIN"
                    value={client.gstin}
                    onChange={(e) => setClient({...client, gstin: e.target.value})}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    value={client.email}
                    onChange={(e) => setClient({...client, email: e.target.value})}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone"
                    value={client.phone}
                    onChange={(e) => setClient({...client, phone: e.target.value})}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Button>Add Shipping Details</Button>
                <Button sx={{ ml: 2 }}>Configure GST</Button>
              </Box>
            </CardContent>
          </Card>

          {/* Invoice Date and Currency */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Invoice Date*"
                      value={invoiceDate}
                      onChange={(newValue) => setInvoiceDate(newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Currency*</InputLabel>
                    <Select
                      value={currency}
                      label="Currency*"
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <MenuItem value="INR">Indian Rupee (INR, ₹)</MenuItem>
                      <MenuItem value="USD">US Dollar (USD, $)</MenuItem>
                      <MenuItem value="EUR">Euro (EUR, €)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Button>Number and Currency Format</Button>
                  <Button sx={{ ml: 2 }}>Edit Columns/Formulas</Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>HSN/SAC</TableCell>
                      <TableCell>GST Rate</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Rate</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>IGST</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <TextField
                            value={item.name}
                            onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                            fullWidth
                            placeholder="Name/SKU Id (Required)"
                          />
                          <Button size="small">Add Description</Button>
                          <Button size="small" startIcon={<UploadIcon />}>Add Thumbnail</Button>
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={item.hsn}
                            onChange={(e) => handleItemChange(item.id, 'hsn', e.target.value)}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={item.gstRate}
                            onChange={(e) => handleItemChange(item.id, 'gstRate', e.target.value)}
                            fullWidth
                            InputProps={{
                              endAdornment: '%',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value))}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value))}
                            fullWidth
                            InputProps={{
                              startAdornment: '₹',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography>₹{item.amount.toFixed(2)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography>₹{(item.amount * item.gstRate / 100).toFixed(2)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography>₹{(item.amount + (item.amount * item.gstRate / 100)).toFixed(2)}</Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => duplicateItem(item.id)}>
                            <DuplicateIcon />
                          </IconButton>
                          <IconButton onClick={() => removeItem(item.id)}>
                            <RemoveIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 2 }}>
                <Button startIcon={<AddIcon />} onClick={addNewItem}>
                  Add New Line
                </Button>
                <Button sx={{ ml: 2 }}>Add New Group</Button>
              </Box>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Amount: ₹{subtotal.toFixed(2)}</Typography>
                <Typography>IGST: ₹{tax.toFixed(2)}</Typography>
                <Typography variant="h6">Total (INR): ₹{total.toFixed(2)}</Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Button>Add Discounts/Additional Charges</Button>
                <Button sx={{ ml: 2 }}>Hide Totals</Button>
                <Button sx={{ ml: 2 }}>Round Up</Button>
                <Button sx={{ ml: 2 }}>Round Down</Button>
                <Button sx={{ ml: 2 }}>Summarise Total Quantity</Button>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Button>Show Total In Words</Button>
              </Box>
            </CardContent>
          </Card>

          {/* Signature Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Signature
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button>Upload Signature</Button>
                <Button>Use Signature Pad</Button>
              </Box>

              <TextField
                label="Add signature label"
                fullWidth
                sx={{ mt: 2 }}
                placeholder="Authorised Signatory"
              />
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Terms and Conditions
              </Typography>

              {terms.map((term, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ mr: 1 }}>{index + 1}.</Typography>
                  <TextField
                    value={term}
                    onChange={(e) => updateTerm(index, e.target.value)}
                    fullWidth
                    multiline
                  />
                  <IconButton onClick={() => removeTerm(index)} sx={{ ml: 1 }}>
                    <RemoveIcon />
                  </IconButton>
                </Box>
              ))}

              <Button startIcon={<AddIcon />} onClick={addTerm}>
                Add New Term
              </Button>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Additional Notes
              </Typography>

              <TextField
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="Additional notes in Invoice"
              />
            </CardContent>
          </Card>

          {/* Advanced Options */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Advanced options
              </Typography>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                  />
                }
                label="This is a Recurring invoice - A draft invoice will be created with the same details every next period."
              />

              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select HSN column view</InputLabel>
                  <Select
                    value="default"
                    label="Select HSN column view"
                  >
                    <MenuItem value="default">Default</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Display unit as</InputLabel>
                  <Select
                    value="default"
                    label="Display unit as"
                  >
                    <MenuItem value="default">Default</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={advancedOptions.showTaxSummary}
                      onChange={(e) => setAdvancedOptions({...advancedOptions, showTaxSummary: e.target.checked})}
                    />
                  }
                  label="Show tax summary in invoice"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={advancedOptions.hidePlaceOfSupply}
                      onChange={(e) => setAdvancedOptions({...advancedOptions, hidePlaceOfSupply: e.target.checked})}
                    />
                  }
                  label="Hide place/country of supply"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={advancedOptions.showHsnSummary}
                      onChange={(e) => setAdvancedOptions({...advancedOptions, showHsnSummary: e.target.checked})}
                    />
                  }
                  label="Show HSN summary in invoice"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={advancedOptions.showThumbnails}
                      onChange={(e) => setAdvancedOptions({...advancedOptions, showThumbnails: e.target.checked})}
                    />
                  }
                  label="Show thumbnails in separate column"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Preview and Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3, position: 'sticky', top: 16 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Design & Share (optional)
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button variant="outlined" color="secondary">
                  Reset
                </Button>

                <Box>
                  <Button variant="contained" color="primary" onClick={() => handleSubmit(true)} sx={{ mr: 1 }}>
                    Save As Draft
                  </Button>
                  <Button variant="contained" color="success" onClick={() => handleSubmit(false)}>
                    Save & Continue
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Preview would go here */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Invoice Preview
              </Typography>
              {/* Preview content would be rendered here */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateInvoice;