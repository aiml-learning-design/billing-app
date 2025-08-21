import React from 'react';
import {
  Box, Typography, Card, CardContent, Button,
  IconButton, TextField, InputAdornment,
  FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Add, Delete, CloudUpload } from '@mui/icons-material';

/**
 * ItemDetails component for handling the items section of the invoice
 * 
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of item objects
 * @param {Function} props.setItems - Function to update items array
 * @param {Function} props.onAddItem - Function to add a new item
 * @param {Function} props.onRemoveItem - Function to remove an item
 * @param {Function} props.onItemChange - Function to update a specific item field
 * @param {string} props.invoiceFor - Selected invoice type (PRODUCT, SERVICE, ONE_TIME)
 * @param {Function} props.setInvoiceFor - Function to update invoice type
 */
const ItemDetails = ({
  items = [],
  setItems,
  onAddItem,
  onRemoveItem,
  onItemChange,
  invoiceFor = 'ONE_TIME',
  setInvoiceFor = () => {}
}) => {
  // Default handlers if not provided
  const handleAddItem = onAddItem || (() => {
    setItems([
      ...items,
      {
        id: items.length + 1,
        name: '',
        hsn: '',
        gstRate: '',
        quantity: '',
        rate: '',
        amount: 0,
        cgst: 0,
        sgst: 0,
        total: 0,
        description: '',
        thumbnail: null
      }
    ]);
  });

  const handleRemoveItem = onRemoveItem || ((id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  });

  const handleItemChange = onItemChange || ((id, field, value) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  });

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Items
        </Typography>

        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Item</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>HSN/SAC</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>GST Rate</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Quantity</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Rate</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Amount</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>CGST</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>SGST</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Total</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>
                    <TextField
                      value={item.name}
                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                      fullWidth
                      placeholder="Name/SKU Id"
                      size="small"
                    />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <TextField
                      value={item.hsn}
                      onChange={(e) => handleItemChange(item.id, 'hsn', e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <TextField
                      type="number"
                      value={item.gstRate}
                      onChange={(e) => handleItemChange(item.id, 'gstRate', parseInt(e.target.value) || 0)}
                      fullWidth
                      size="small"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      fullWidth
                      size="small"
                    />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <TextField
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      fullWidth
                      size="small"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <Typography>₹{item.amount.toFixed(2)}</Typography>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <Typography>₹{item.cgst.toFixed(2)}</Typography>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <Typography>₹{item.sgst.toFixed(2)}</Typography>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <Typography>₹{item.total.toFixed(2)}</Typography>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <IconButton onClick={() => handleRemoveItem(item.id)}>
                      <Delete color="error" />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddItem}
            sx={{ mr: 2 }}
          >
            Add Item
          </Button>
          
          {/* Invoice For Dropdown */}
          <FormControl size="small" sx={{ minWidth: 150, mr: 2 }}>
            <InputLabel>Invoice For</InputLabel>
            <Select
              value={invoiceFor}
              onChange={(e) => setInvoiceFor(e.target.value)}
              label="Invoice For"
            >
              <MenuItem value="PRODUCT">Product</MenuItem>
              <MenuItem value="SERVICE">Service</MenuItem>
              <MenuItem value="ONE_TIME">One Time</MenuItem>
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={<Checkbox />}
            label="Add Description"
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Add Thumbnail"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ItemDetails;