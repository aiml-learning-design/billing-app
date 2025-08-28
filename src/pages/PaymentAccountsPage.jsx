import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardContent,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Select, FormControl, InputLabel,
  FormHelperText, Divider, CircularProgress, Snackbar, Alert, FormControlLabel, Switch
} from '@mui/material';
import {
  Add, Edit, Delete, Refresh, Download, FilterList,
  AccountBalance, Person, CreditCard, ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import countries from '../utils/countries';

// Function to generate a business ID (equivalent to the Java code provided)
const generateBusinessId = () => {
  // Create a secure random array of 12 bytes
  const bytes = new Uint8Array(12);
  window.crypto.getRandomValues(bytes);
  
  // Convert each byte to a 2-digit hex string and join them
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

// Function to get user's country based on IP address
const getUserCountry = async () => {
  try {
    // Using ipinfo.io to get user's country based on IP
    const response = await fetch('https://ipinfo.io/json?token=YOUR_TOKEN');
    const data = await response.json();
    
    // Find the country in our countries list
    if (data && data.country) {
      const countryObj = countries.find(c => c.code === data.country);
      return countryObj ? countryObj.name : 'United States';
    }
    
    return 'United States';
  } catch (error) {
    console.error('Error detecting user location:', error);
    return 'United States'; // Default fallback
  }
};

const PaymentAccountsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [openNewAccountDialog, setOpenNewAccountDialog] = useState(false);
  const [openBankAccountDialog, setOpenBankAccountDialog] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState('');
  const [userCountry, setUserCountry] = useState('United States');
  const [bankAccountData, setBankAccountData] = useState({
    country: 'United States',
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ibanCode: '',
    swiftCode: '',
    accountHolderName: '',
    bankAccountType: 'Savings',
    currency: 'US Dollar(USD, $)',
    ifscCode: '',
    isPrimaryAccount: false,
    upiId: '',
    confirmUpiId: '',
    upiActive: false,
    status: true,
    customDetails: []
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [editingAccount, setEditingAccount] = useState(null);
  
  // Detect user's country on component mount
  useEffect(() => {
    const detectUserCountry = async () => {
      const country = await getUserCountry();
      setUserCountry(country);
      setBankAccountData(prev => ({
        ...prev,
        country: country
      }));
    };
    
    detectUserCountry();
  }, []);

  // Handler for editing an account
  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setBankAccountData({
      country: account.country || 'United States of America (USA)',
      bankName: account.bankName || '',
      accountNumber: account.accountNumber || '',
      confirmAccountNumber: account.accountNumber || '',
      ibanCode: account.ibanCode || '',
      swiftCode: account.swiftCode || '',
      accountHolderName: account.accountHolderName || '',
      bankAccountType: account.accountType || 'Savings',
      currency: account.currency || 'US Dollar(USD, $)',
      ifscCode: account.ifscCode || '',
      isPrimaryAccount: account.isPrimaryAccount || false,
      upiId: account.upiId || '',
      upiActive: account.upiActive || false,
      status: account.status || true,
      customDetails: account.customDetails || []
    });
    setOpenBankAccountDialog(true);
  };

  // Handler for toggling account status (active/inactive)
  const handleToggleAccountStatus = async (account) => {
    try {
      setLoading(true);
      
      // Prepare payload for API
      const payload = {
        bankDetailsId: account.id,
        active: !account.status,
        status: !account.status
      };
      
      // Call API to toggle account status
      const response = await api.put(`/api/banks/${account.id}/toggle-status`, payload);
      
      if (response && response.success) {
        // Update the local state with the updated account
        const updatedAccounts = accounts.map(acc => 
          acc.id === account.id ? { ...acc, status: !acc.status } : acc
        );
        
        setAccounts(updatedAccounts);
        
        setAlert({
          open: true,
          message: `Account ${account.status ? 'deactivated' : 'activated'} successfully`,
          severity: 'success'
        });
      } else {
        throw new Error(response?.message || 'Failed to update account status');
      }
    } catch (error) {
      console.error('Error toggling account status:', error);
      setAlert({
        open: true,
        message: error.message || 'Failed to update account status',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch accounts data
  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        setLoading(true);
        
        // Make API call to fetch bank accounts
        const response = await api.get('/api/banks/all');
        
        if (response && response.success) {
          // Extract the bank accounts from the response data
          const bankAccounts = response.data || [];
          
          // Map the API response to the format expected by the table
          const formattedAccounts = bankAccounts.map(account => ({
            id: account.bankDetailsId,
            bankName: account.bankName,
            accountNumber: account.accountNumber,
            ifscCode: account.ifsccode,
            ibanCode: account.ibancode,
            swiftCode: account.swiftcode,
            accountHolderName: account.accountHolderName,
            accountType: account.bankAccountType,
            country: account.country,
            currency: account.currency,
            isPrimaryAccount: account.primaryAccount,
            createdAt: new Date(account.createdAt || Date.now()).toISOString().split('T')[0],
            status: account.active,
            upiId: account.upiID,
            upiActive: account.upiActive,
            businessId: account.businessId
          }));
          
          setAccounts(formattedAccounts);
          setTotalCount(formattedAccounts.length);
        } else {
          console.error('Failed to fetch bank accounts:', response?.message || 'Unknown error');
          setAlert({
            open: true,
            message: response?.message || 'Failed to fetch bank accounts',
            severity: 'error'
          });
          setAccounts([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error('Error fetching bank accounts:', error);
        setAlert({
          open: true,
          message: error.message || 'Failed to fetch bank accounts',
          severity: 'error'
        });
        setAccounts([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBankAccounts();
  }, [page, rowsPerPage, filter]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(0);
  };

  // Open new account dialog
  const handleOpenNewAccountDialog = () => {
    setOpenNewAccountDialog(true);
  };

  // Close new account dialog
  const handleCloseNewAccountDialog = () => {
    setOpenNewAccountDialog(false);
    setSelectedAccountType('');
  };

  // Handle account type selection
  const handleAccountTypeSelect = (type) => {
    setSelectedAccountType(type);
  };

  // Continue to specific account form
  const handleContinueToAccountForm = () => {
    setOpenNewAccountDialog(false);
    if (selectedAccountType === 'bank') {
      setOpenBankAccountDialog(true);
    }
    // Add handling for other account types as needed
  };

  // Close bank account dialog
  const handleCloseBankAccountDialog = () => {
    setOpenBankAccountDialog(false);
    setBankAccountData({
      country: userCountry,
      bankName: '',
      accountNumber: '',
      confirmAccountNumber: '',
      ibanCode: '',
      swiftCode: '',
      accountHolderName: '',
      bankAccountType: 'Savings',
      currency: 'US Dollar(USD, $)',
      ifscCode: '',
      isPrimaryAccount: false,
      upiId: '',
      confirmUpiId: '',
      upiActive: false,
      status: true,
      customDetails: []
    });
    setErrors({});
    setEditingAccount(null);
  };

  // Handle bank account input change
  const handleBankAccountInputChange = (e) => {
    const { name, value } = e.target;
    setBankAccountData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Add custom field to bank account
  const handleAddCustomField = () => {
    setBankAccountData(prev => ({
      ...prev,
      customDetails: [...prev.customDetails, { key: '', value: '' }]
    }));
  };

  // Handle custom field change
  const handleCustomFieldChange = (index, field, value) => {
    const updatedCustomDetails = [...bankAccountData.customDetails];
    updatedCustomDetails[index][field] = value;
    setBankAccountData(prev => ({
      ...prev,
      customDetails: updatedCustomDetails
    }));
  };

  // Remove custom field
  const handleRemoveCustomField = (index) => {
    const updatedCustomDetails = [...bankAccountData.customDetails];
    updatedCustomDetails.splice(index, 1);
    setBankAccountData(prev => ({
      ...prev,
      customDetails: updatedCustomDetails
    }));
  };

  // Validate bank account form
  const validateBankAccountForm = () => {
    const newErrors = {};
    
    if (!bankAccountData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }
    
    if (!bankAccountData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    }
    
    if (!bankAccountData.confirmAccountNumber.trim()) {
      newErrors.confirmAccountNumber = 'Please confirm account number';
    } else if (bankAccountData.accountNumber !== bankAccountData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = 'Account numbers do not match';
    }
    
    if (!bankAccountData.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required';
    }
    
    if (!bankAccountData.ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC code is required';
    }
    
    // Validate UPI ID if provided
    if (bankAccountData.upiId.trim()) {
      if (!bankAccountData.confirmUpiId.trim()) {
        newErrors.confirmUpiId = 'Please confirm UPI ID';
      } else if (bankAccountData.upiId !== bankAccountData.confirmUpiId) {
        newErrors.confirmUpiId = 'UPI IDs do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit bank account form
  const handleSubmitBankAccount = async () => {
    if (!validateBankAccountForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Generate a business ID if we're adding a new account
      const businessId = editingAccount ? editingAccount.businessId : generateBusinessId();
      
      // Get current date and time for createdOn field
      const createdOn = editingAccount ? editingAccount.createdAt : new Date().toISOString();
      
      // Prepare payload for API according to the required format
      const payload = {
        bankDetailsId: editingAccount ? editingAccount.id : 0,
        bankName: bankAccountData.bankName,
        accountNumber: bankAccountData.accountNumber,
        confirmAccountNumber: bankAccountData.confirmAccountNumber,
        accountHolderName: bankAccountData.accountHolderName,
        bankAccountType: bankAccountData.bankAccountType,
        currency: bankAccountData.currency,
        confirmUpiID: bankAccountData.confirmUpiId,
        status: bankAccountData.status,
        businessId: businessId,
        country: bankAccountData.country,
        bankDetailsMetadDta: {
          additionalProp1: {},
          additionalProp2: {},
          additionalProp3: {}
        },
        active: bankAccountData.status,
        upiActive: bankAccountData.upiActive,
        primaryAccount: bankAccountData.isPrimaryAccount,
        ifsccode: bankAccountData.ifscCode,
        upiID: bankAccountData.upiId,
        linked: bankAccountData.isPrimaryAccount,
        ibancode: bankAccountData.ibanCode,
        swiftcode: bankAccountData.swiftCode
      };
      
      let response;
      
      if (editingAccount) {
        // Call API to update bank account
        response = await api.put(`/api/banks/${editingAccount.id}`, payload);
      } else {
        // Call API to add bank account
        response = await api.post('/api/banks/add', payload);
      }
      
      if (response.success) {
        setAlert({
          open: true,
          message: editingAccount ? 'Bank account updated successfully' : 'Bank account added successfully',
          severity: 'success'
        });
        
        // Close dialog and reset form
        handleCloseBankAccountDialog();
        setEditingAccount(null);
        
        // Refresh accounts list
        // This would trigger the useEffect to fetch updated data
        setPage(0);
      } else {
        throw new Error(response.message || `Failed to ${editingAccount ? 'update' : 'add'} bank account`);
      }
    } catch (error) {
      console.error(`Error ${editingAccount ? 'updating' : 'adding'} bank account:`, error);
      setAlert({
        open: true,
        message: error.message || `Failed to ${editingAccount ? 'update' : 'add'} bank account`,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle alert close
  const handleAlertClose = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Payment Accounts
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleOpenNewAccountDialog}
        >
          New Payments Account
        </Button>
      </Box>

      {/* Filter Buttons */}
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button
          variant={filter === 'all' ? 'contained' : 'outlined'}
          onClick={() => handleFilterChange('all')}
          sx={{ mb: 1 }}
        >
          All Payment Accounts
        </Button>
        <Button
          variant={filter === 'bank' ? 'contained' : 'outlined'}
          onClick={() => handleFilterChange('bank')}
          sx={{ mb: 1 }}
        >
          Bank Accounts
        </Button>
        <Button
          variant={filter === 'employee' ? 'contained' : 'outlined'}
          onClick={() => handleFilterChange('employee')}
          sx={{ mb: 1 }}
        >
          Employee Accounts
        </Button>
        <Button
          variant={filter === 'statements' ? 'contained' : 'outlined'}
          onClick={() => handleFilterChange('statements')}
          sx={{ mb: 1 }}
        >
          Account Statements
        </Button>
        <Button
          variant={filter === 'refrens' ? 'contained' : 'outlined'}
          onClick={() => handleFilterChange('refrens')}
          sx={{ mb: 1 }}
        >
          Refrens Payments
        </Button>
        <Button
          variant={filter === 'active' ? 'contained' : 'outlined'}
          onClick={() => handleFilterChange('active')}
          sx={{ mb: 1 }}
        >
          Active Accounts
        </Button>
        <Button
          variant={filter === 'inactive' ? 'contained' : 'outlined'}
          onClick={() => handleFilterChange('inactive')}
          sx={{ mb: 1 }}
        >
          Inactive Accounts
        </Button>
        <Button
          variant="outlined"
          startIcon={<Download />}
          sx={{ mb: 1, ml: 'auto' }}
        >
          Download CSV
        </Button>
      </Box>

      {/* Accounts Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="payment accounts table">
            <TableHead>
              <TableRow>
                <TableCell>Bank Name</TableCell>
                <TableCell>Account Number</TableCell>
                <TableCell>IFSC</TableCell>
                <TableCell>IBAN</TableCell>
                <TableCell>SWIFT</TableCell>
                <TableCell>Account Holder Name</TableCell>
                <TableCell>Account Type</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell>Primary Account</TableCell>
                <TableCell>Created On</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={24} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No accounts found
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => (
                  <TableRow key={account.id} hover>
                    <TableCell>{account.bankName || '-'}</TableCell>
                    <TableCell>{account.accountNumber || '-'}</TableCell>
                    <TableCell>{account.ifscCode || '-'}</TableCell>
                    <TableCell>{account.ibanCode || '-'}</TableCell>
                    <TableCell>{account.swiftCode || '-'}</TableCell>
                    <TableCell>{account.accountHolderName || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={account.accountType} 
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{account.country || '-'}</TableCell>
                    <TableCell>{account.currency || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={account.isPrimaryAccount ? 'Primary' : 'Secondary'} 
                        color={account.isPrimaryAccount ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{account.createdAt || '-'}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="primary"
                        aria-label="edit"
                        onClick={() => handleEditAccount(account)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color={account.status ? "error" : "success"}
                        aria-label={account.status ? "mark as inactive" : "mark as active"}
                        onClick={() => handleToggleAccountStatus(account)}
                      >
                        {account.status ? <Delete fontSize="small" /> : <Refresh fontSize="small" />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
            Showing {accounts.length > 0 ? page * rowsPerPage + 1 : 0} to {Math.min((page + 1) * rowsPerPage, totalCount)} of {totalCount} All Payment Accounts
          </Typography>
          <Button size="small" sx={{ ml: 2 }}>
            Show/Hide Columns
          </Button>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{ ml: 'auto' }}
          />
        </Box>
      </Paper>

      {/* New Payment Account Dialog */}
      <Dialog
        open={openNewAccountDialog}
        onClose={handleCloseNewAccountDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Add New Payment Account
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
            Which account would you like to add?
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card 
                sx={{ 
                  p: 2, 
                  cursor: 'pointer',
                  border: selectedAccountType === 'bank' ? '2px solid #3f51b5' : '1px solid #e0e0e0',
                  '&:hover': { borderColor: '#3f51b5' }
                }}
                onClick={() => handleAccountTypeSelect('bank')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountBalance sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Bank Account
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      All types of bank accounts
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card 
                sx={{ 
                  p: 2, 
                  cursor: 'pointer',
                  border: selectedAccountType === 'employee' ? '2px solid #3f51b5' : '1px solid #e0e0e0',
                  '&:hover': { borderColor: '#3f51b5' }
                }}
                onClick={() => handleAccountTypeSelect('employee')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Employee Account
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add your employees to manage and track salaries & reimbursements.
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card 
                sx={{ 
                  p: 2, 
                  cursor: 'pointer',
                  border: selectedAccountType === 'other' ? '2px solid #3f51b5' : '1px solid #e0e0e0',
                  '&:hover': { borderColor: '#3f51b5' }
                }}
                onClick={() => handleAccountTypeSelect('other')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CreditCard sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Other Account
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cash, Debit/Credit cards, Wallets and more
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Add Accounts to easily manage and track your withdrawals, deposits, salaries, reimbursements and more
              <Button size="small" sx={{ ml: 1 }}>Learn More</Button>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewAccountDialog}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            disabled={!selectedAccountType}
            onClick={handleContinueToAccountForm}
            endIcon={<ArrowForward />}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add New Bank Account Dialog */}
      <Dialog
        open={openBankAccountDialog}
        onClose={handleCloseBankAccountDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingAccount ? 'Edit Bank Account' : 'Add New Bank Account'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.country}>
                <InputLabel required>Country</InputLabel>
                <Select
                  name="country"
                  value={bankAccountData.country}
                  onChange={handleBankAccountInputChange}
                  label="Country *"
                >
                  {countries.map((country) => (
                    <MenuItem key={country.code} value={country.name}>
                      {country.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.country && <FormHelperText>{errors.country}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Bank Name"
                name="bankName"
                value={bankAccountData.bankName}
                onChange={handleBankAccountInputChange}
                fullWidth
                required
                error={!!errors.bankName}
                helperText={errors.bankName}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Account Number"
                name="accountNumber"
                value={bankAccountData.accountNumber}
                onChange={handleBankAccountInputChange}
                fullWidth
                required
                error={!!errors.accountNumber}
                helperText={errors.accountNumber}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Confirm Account Number"
                name="confirmAccountNumber"
                value={bankAccountData.confirmAccountNumber}
                onChange={handleBankAccountInputChange}
                fullWidth
                required
                error={!!errors.confirmAccountNumber}
                helperText={errors.confirmAccountNumber}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="IBAN Code"
                name="ibanCode"
                value={bankAccountData.ibanCode}
                onChange={handleBankAccountInputChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="SWIFT Code"
                name="swiftCode"
                value={bankAccountData.swiftCode}
                onChange={handleBankAccountInputChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Account Holder Name"
                name="accountHolderName"
                value={bankAccountData.accountHolderName}
                onChange={handleBankAccountInputChange}
                fullWidth
                required
                error={!!errors.accountHolderName}
                helperText={errors.accountHolderName}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel required>Bank Account Type</InputLabel>
                <Select
                  name="bankAccountType"
                  value={bankAccountData.bankAccountType}
                  onChange={handleBankAccountInputChange}
                  label="Bank Account Type *"
                >
                  <MenuItem value="Savings">Savings</MenuItem>
                  <MenuItem value="Checking">Checking</MenuItem>
                  <MenuItem value="Current">Current</MenuItem>
                  <MenuItem value="Business">Business</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel required>Currency</InputLabel>
                <Select
                  name="currency"
                  value={bankAccountData.currency}
                  onChange={handleBankAccountInputChange}
                  label="Currency *"
                >
                  <MenuItem value="US Dollar(USD, $)">US Dollar (USD, $)</MenuItem>
                  <MenuItem value="Indian Rupee(INR, ₹)">Indian Rupee (INR, ₹)</MenuItem>
                  <MenuItem value="Euro(EUR, €)">Euro (EUR, €)</MenuItem>
                  <MenuItem value="British Pound(GBP, £)">British Pound (GBP, £)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={bankAccountData.isPrimaryAccount}
                    onChange={(e) => handleBankAccountInputChange({
                      target: { name: 'isPrimaryAccount', value: e.target.checked }
                    })}
                    color="primary"
                  />
                }
                label="Primary Account"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={bankAccountData.status}
                    onChange={(e) => handleBankAccountInputChange({
                      target: { name: 'status', value: e.target.checked }
                    })}
                    color="primary"
                  />
                }
                label={bankAccountData.status ? "Active" : "Inactive"}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                UPI Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="UPI ID"
                name="upiId"
                value={bankAccountData.upiId}
                onChange={handleBankAccountInputChange}
                fullWidth
                error={!!errors.upiId}
                helperText={errors.upiId}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Confirm UPI ID"
                name="confirmUpiId"
                value={bankAccountData.confirmUpiId}
                onChange={handleBankAccountInputChange}
                fullWidth
                error={!!errors.confirmUpiId}
                helperText={errors.confirmUpiId}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={bankAccountData.upiActive}
                    onChange={(e) => handleBankAccountInputChange({
                      target: { name: 'upiActive', value: e.target.checked }
                    })}
                    color="primary"
                  />
                }
                label="UPI Active"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="primary" sx={{ mr: 1 }}>
                  Upgrade to Accounts to link Bank Account to a Ledger.
                </Typography>
                <Button size="small" variant="outlined" color="primary">
                  Upgrade Now
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="IFSC Code"
                name="ifscCode"
                value={bankAccountData.ifscCode}
                onChange={handleBankAccountInputChange}
                fullWidth
                error={!!errors.ifscCode}
                helperText={errors.ifscCode}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button variant="outlined" onClick={handleAddCustomField}>
                Add Custom Bank Details
              </Button>
            </Grid>
            
            {/* Custom Fields Section */}
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                {bankAccountData.customDetails.map((detail, index) => (
                  <Box key={index} sx={{ display: 'flex', mb: 2, gap: 2 }}>
                    <TextField
                      label="Field Name"
                      value={detail.key}
                      onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Value"
                      value={detail.value}
                      onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                      sx={{ flex: 1 }}
                    />
                    <IconButton color="error" onClick={() => handleRemoveCustomField(index)}>
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={handleAddCustomField}
                  sx={{ mt: 1 }}
                >
                  Add Custom Field
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBankAccountDialog}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSubmitBankAccount}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting 
              ? (editingAccount ? 'Updating...' : 'Adding...') 
              : (editingAccount ? 'Update Account' : 'Add Account')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleAlertClose} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentAccountsPage;