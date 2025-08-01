import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  Box, Typography, Grid, TextField, Button,
  CircularProgress, Snackbar, Alert, Paper,
  Divider, Card, CardContent, CardMedia,
  List, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, InputAdornment, Chip
} from '@mui/material';
import { 
  Save, Add, Delete, Edit, Image, Search,
  Inventory, Category, Description, AttachMoney
} from '@mui/icons-material';

/**
 * ItemDetailsPage for managing inventory items
 */
const ItemDetailsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    hsn: '',
    gstRate: 18,
    price: 0,
    unit: 'Piece',
    thumbnail: null,
    thumbnailPreview: null
  });

  // Load businesses and items data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          // Fetch businesses
          if (user.businesses && user.businesses.length > 0) {
            setBusinesses(user.businesses);
            const defaultBusiness = user.businesses[0];
            setSelectedBusiness(defaultBusiness);
            
            // Fetch items for the selected business
            const itemsRes = await api.get(`/api/items?businessId=${defaultBusiness.business_id}`);
            setItems(itemsRes.data || []);
            setFilteredItems(itemsRes.data || []);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setAlert({
          open: true,
          message: 'Failed to load items data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Filter items when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredItems(filtered);
    }
    setPage(0);
  }, [searchTerm, items]);

  // Handle business change
  const handleBusinessChange = async (event) => {
    const businessId = event.target.value;
    const business = businesses.find(b => b.business_id === businessId);
    
    if (business) {
      setSelectedBusiness(business);
      setLoading(true);
      
      try {
        // Fetch items for the selected business
        const itemsRes = await api.get(`/api/items?businessId=${businessId}`);
        setItems(itemsRes.data || []);
        setFilteredItems(itemsRes.data || []);
        setSearchTerm('');
      } catch (error) {
        console.error('Error fetching items:', error);
        setAlert({
          open: true,
          message: 'Failed to load items',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'gstRate' || name === 'price') {
      // Convert to number
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          thumbnail: file,
          thumbnailPreview: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Open dialog to add new item
  const handleAddItem = () => {
    setFormData({
      name: '',
      sku: '',
      description: '',
      category: '',
      hsn: '',
      gstRate: 18,
      price: 0,
      unit: 'Piece',
      thumbnail: null,
      thumbnailPreview: null
    });
    setDialogMode('add');
    setOpenDialog(true);
  };

  // Open dialog to edit item
  const handleEditItem = (item) => {
    setFormData({
      name: item.name || '',
      sku: item.sku || '',
      description: item.description || '',
      category: item.category || '',
      hsn: item.hsn || '',
      gstRate: item.gstRate || 18,
      price: item.price || 0,
      unit: item.unit || 'Piece',
      thumbnail: null,
      thumbnailPreview: item.thumbnailUrl || null
    });
    setSelectedItem(item);
    setDialogMode('edit');
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setSaving(true);

    try {
      if (!selectedBusiness) {
        throw new Error('No business selected');
      }

      // Create form data for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('sku', formData.sku);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('hsn', formData.hsn);
      formDataToSend.append('gstRate', formData.gstRate);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('unit', formData.unit);
      formDataToSend.append('businessId', selectedBusiness.business_id);
      
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail);
      }

      let response;
      if (dialogMode === 'add') {
        // Create new item
        response = await api.post('/api/items', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setItems([...items, response.data]);
        setAlert({
          open: true,
          message: 'Item added successfully',
          severity: 'success'
        });
      } else {
        // Update existing item
        response = await api.put(`/api/items/${selectedItem.item_id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Update items list
        const updatedItems = items.map(item => 
          item.item_id === selectedItem.item_id ? response.data : item
        );
        setItems(updatedItems);
        
        setAlert({
          open: true,
          message: 'Item updated successfully',
          severity: 'success'
        });
      }

      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving item:', error);
      setAlert({
        open: true,
        message: `Failed to ${dialogMode === 'add' ? 'add' : 'update'} item`,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle item deletion
  const handleDeleteItem = async (itemId) => {
    try {
      await api.delete(`/api/items/${itemId}`);
      
      // Update items list
      setItems(items.filter(item => item.item_id !== itemId));
      
      setAlert({
        open: true,
        message: 'Item deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      setAlert({
        open: true,
        message: 'Failed to delete item',
        severity: 'error'
      });
    }
  };

  // Handle alert close
  const handleAlertClose = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Item Details
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Select Business</InputLabel>
              <Select
                value={selectedBusiness?.business_id || ''}
                onChange={handleBusinessChange}
                label="Select Business"
              >
                {businesses.map(business => (
                  <MenuItem key={business.business_id} value={business.business_id}>
                    {business.businessName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Search Items"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              placeholder="Search by name, SKU, description, or category"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleAddItem}
              fullWidth
            >
              Add New Item
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>HSN/SAC</TableCell>
                <TableCell>GST Rate</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No items found. Add an item to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(item => (
                    <TableRow key={item.item_id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {item.thumbnailUrl ? (
                            <Box
                              component="img"
                              src={item.thumbnailUrl}
                              alt={item.name}
                              sx={{ width: 40, height: 40, mr: 2, objectFit: 'cover', borderRadius: 1 }}
                            />
                          ) : (
                            <Box
                              sx={{ 
                                width: 40, 
                                height: 40, 
                                mr: 2, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                bgcolor: 'grey.200',
                                borderRadius: 1
                              }}
                            >
                              <Inventory />
                            </Box>
                          )}
                          <Typography variant="body1">{item.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{item.sku || '-'}</TableCell>
                      <TableCell>
                        {item.category ? (
                          <Chip label={item.category} size="small" />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{item.hsn || '-'}</TableCell>
                      <TableCell>{item.gstRate}%</TableCell>
                      <TableCell>₹{item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditItem(item)}>
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteItem(item.item_id)} color="error">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add/Edit Item Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Item' : 'Edit Item'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} md={8}>
              <TextField
                label="Item Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="HSN/SAC Code"
                name="hsn"
                value={formData.hsn}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="GST Rate (%)"
                name="gstRate"
                type="number"
                value={formData.gstRate}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Unit</InputLabel>
                <Select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  label="Unit"
                >
                  <MenuItem value="Piece">Piece</MenuItem>
                  <MenuItem value="Kg">Kilogram (Kg)</MenuItem>
                  <MenuItem value="g">Gram (g)</MenuItem>
                  <MenuItem value="L">Liter (L)</MenuItem>
                  <MenuItem value="ml">Milliliter (ml)</MenuItem>
                  <MenuItem value="m">Meter (m)</MenuItem>
                  <MenuItem value="cm">Centimeter (cm)</MenuItem>
                  <MenuItem value="Box">Box</MenuItem>
                  <MenuItem value="Dozen">Dozen</MenuItem>
                  <MenuItem value="Pair">Pair</MenuItem>
                  <MenuItem value="Set">Set</MenuItem>
                  <MenuItem value="Hour">Hour</MenuItem>
                  <MenuItem value="Day">Day</MenuItem>
                  <MenuItem value="Service">Service</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Item Thumbnail
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ mr: 2 }}>
                  {formData.thumbnailPreview ? (
                    <Box
                      component="img"
                      src={formData.thumbnailPreview}
                      alt="Thumbnail preview"
                      sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1 }}
                    />
                  ) : (
                    <Box
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        bgcolor: 'grey.200',
                        borderRadius: 1
                      }}
                    >
                      <Image sx={{ fontSize: 40, color: 'grey.500' }} />
                    </Box>
                  )}
                </Box>
                <Box>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="thumbnail-upload"
                    type="file"
                    onChange={handleThumbnailUpload}
                    ref={fileInputRef}
                  />
                  <label htmlFor="thumbnail-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUpload />}
                    >
                      Upload Thumbnail
                    </Button>
                  </label>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Recommended size: 500x500px. Max file size: 2MB.
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={saving || !formData.name}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default ItemDetailsPage;