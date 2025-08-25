import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent,
  TextField, Button, IconButton,
  FormControlLabel, Checkbox,
  FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Divider
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import api from '../../services/api';

/**
 * Enhanced TermsAndConditions component with checkboxes for term selection
 * and a dropdown for invoiceFor selection
 * 
 * @param {Object} props - Component props
 * @param {Array} props.terms - Array of terms
 * @param {Function} props.setTerms - Function to update terms
 * @param {Array} props.apiTerms - Array of terms from API
 * @param {Array} props.selectedTerms - Array of selected term IDs
 * @param {Function} props.setSelectedTerms - Function to update selected terms
 * @param {boolean} props.termsLoading - Whether terms are being loaded
 * @param {string} props.invoiceFor - Selected invoice type
 * @param {Function} props.setInvoiceFor - Function to update invoice type
 * @param {boolean} props.isRecurring - Whether the invoice is recurring
 * @param {Function} props.setIsRecurring - Function to toggle recurring status
 */
const TermsAndConditionsWithCheckboxes = ({
  terms = [],
  setTerms = () => {},
  apiTerms = [],
  selectedTerms = [],
  setSelectedTerms = () => {},
  termsLoading = false,
  invoiceFor = 'ONE_TIME',
  setInvoiceFor = () => {},
  isRecurring = false,
  setIsRecurring = () => {}
}) => {
  const [newTerm, setNewTerm] = useState('');
  const [showTermsList, setShowTermsList] = useState(false);
  const [additionalTerms, setAdditionalTerms] = useState('');
  
  // Function to fetch terms and conditions from API
  const fetchTermsFromApi = async () => {
    try {
      setSelectedTerms([]);
      const response = await api.get('/api/invoice/terms');
      if (response.success && response.data) {
        let termsData = [];
        
        // Handle different response formats
        if (Array.isArray(response.data)) {
          termsData = response.data;
        } else if (response.data.terms && Array.isArray(response.data.terms)) {
          termsData = response.data.terms;
        }
        
        // Update the apiTerms state in the parent component
        if (termsData.length > 0) {
          // This will update the apiTerms in the parent component (NewInvoice.jsx)
          // which will cause this component to re-render with the new apiTerms
        }
      }
    } catch (error) {
      console.error('Error fetching terms:', error);
    }
  };

  // Handle adding a custom term
  const handleAddTerm = () => {
    if (newTerm.trim()) {
      setTerms([...terms, newTerm]);
      setNewTerm('');
    }
  };

  // Handle removing a term
  const handleRemoveTerm = (index) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  // Handle updating a term
  const handleUpdateTerm = (index, value) => {
    const updatedTerms = [...terms];
    updatedTerms[index] = value;
    setTerms(updatedTerms);
  };

  // Handle selecting/deselecting a term from API
  const handleTermSelection = (termId) => {
    if (selectedTerms.includes(termId)) {
      // Deselect the term
      setSelectedTerms(selectedTerms.filter(id => id !== termId));
      
      // Remove the term from terms array
      const term = apiTerms.find(t => (t.id || t._id) === termId);
      if (term) {
        const termText = term.text || term.content || term.description || '';
        setTerms(terms.filter(t => t !== termText));
      }
    } else {
      // Select the term
      setSelectedTerms([...selectedTerms, termId]);
      
      // Add the term to terms array
      const term = apiTerms.find(t => (t.id || t._id) === termId);
      if (term) {
        const termText = term.text || term.content || term.description || '';
        setTerms([...terms, termText]);
      }
    }
  };

  // Handle checkbox change for showing terms list
  const handleShowTermsChange = (event) => {
    const checked = event.target.checked;
    setShowTermsList(checked);
    
    // If checked, fetch terms from API
    if (checked) {
      fetchTermsFromApi();
    }
  };
  
  // Handle additional terms change
  const handleAdditionalTermsChange = (event) => {
    setAdditionalTerms(event.target.value);
  };
  
  // Add additional terms to the terms list when they change
  useEffect(() => {
    if (additionalTerms.trim()) {
      // Check if additional terms are already in the list
      const additionalTermExists = terms.includes(additionalTerms);
      
      if (!additionalTermExists) {
        // Add additional terms to the end of the list
        setTerms([...terms.filter(term => term !== additionalTerms), additionalTerms]);
      }
    }
  }, [additionalTerms]);

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Terms and Conditions
        </Typography>
        
        {/* Terms and Conditions Caption with Checkbox */}
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={showTermsList}
                onChange={handleShowTermsChange}
              />
            }
            label="Show Terms and Conditions"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Select this checkbox to view and select from standard terms and conditions.
          </Typography>
        </Box>

        {/* API Terms with Checkboxes */}
        {showTermsList && apiTerms.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Standard Terms and Conditions
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Select the terms and conditions you want to include in your invoice.
            </Typography>
            
            {termsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Box sx={{ mb: 2 }}>
                {apiTerms.map((term, index) => {
                  const termId = term.id || term._id;
                  const termText = term.text || term.content || term.description || '';
                  
                  return (
                    <FormControlLabel
                      key={termId || index}
                      control={
                        <Checkbox
                          checked={selectedTerms.includes(termId)}
                          onChange={() => handleTermSelection(termId)}
                        />
                      }
                      label={termText}
                      sx={{ display: 'block', mb: 1 }}
                    />
                  );
                })}
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
          </Box>
        )}

        {/* Custom Terms */}
        <Typography variant="subtitle2" gutterBottom>
          Custom Terms and Conditions
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          Add your own custom terms and conditions.
        </Typography>

        <Box sx={{ mb: 2 }}>
          {terms.map((term, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                {index + 1}.
              </Typography>
              <TextField
                value={term}
                onChange={(e) => handleUpdateTerm(index, e.target.value)}
                fullWidth
                size="small"
                multiline
                sx={{ mr: 1 }}
              />
              <IconButton size="small" onClick={() => handleRemoveTerm(index)}>
                <Delete fontSize="small" color="error" />
              </IconButton>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            placeholder="Add new term"
            fullWidth
            size="small"
            sx={{ mr: 2 }}
          />
          <Button
            variant="outlined"
            onClick={handleAddTerm}
          >
            Add Term
          </Button>
        </Box>

        {/* Additional Terms Text Box */}
        <Box sx={{ mt: 3, mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Additional Terms
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            Add any additional terms and conditions specific to this invoice.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Enter additional terms and conditions here..."
            value={additionalTerms}
            onChange={handleAdditionalTermsChange}
            variant="outlined"
          />
        </Box>

        {/* Recurring Invoice Option */}
        <Box sx={{ mt: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
              />
            }
            label="This is a Recurring invoice"
          />
          <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
            A draft invoice will be created with the same details every next period.
          </Typography>
        </Box>

        <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
          Advanced options
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          <FormControlLabel
            control={<Checkbox />}
            label="Hide place/country of supply"
            sx={{ mr: 2 }}
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Show HSN summary in invoice"
            sx={{ mr: 2 }}
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Add original images in line items"
            sx={{ mr: 2 }}
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Show thumbnails in separate column"
            sx={{ mr: 2 }}
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Show description in full width"
            sx={{ mr: 2 }}
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Hide subtotal for group items"
            sx={{ mr: 2 }}
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Show SKU in invoice"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default TermsAndConditionsWithCheckboxes;