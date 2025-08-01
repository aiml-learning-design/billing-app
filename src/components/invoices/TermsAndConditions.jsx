import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent,
  TextField, Button, IconButton,
  FormControlLabel, Checkbox
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

/**
 * TermsAndConditions component for handling terms and conditions
 * 
 * @param {Object} props - Component props
 * @param {Array} props.terms - Array of terms
 * @param {Function} props.setTerms - Function to update terms
 * @param {boolean} props.isRecurring - Whether the invoice is recurring
 * @param {Function} props.setIsRecurring - Function to toggle recurring status
 */
const TermsAndConditions = ({
  terms = [
    'Please quote invoice number when remitting funds.',
    'Please pay within 15 days from the date of invoice, overdue interest @ 14% will be charged on delayed payments.'
  ],
  setTerms = () => {},
  isRecurring = false,
  setIsRecurring = () => {}
}) => {
  const [newTerm, setNewTerm] = useState('');

  const handleAddTerm = () => {
    if (newTerm.trim()) {
      setTerms([...terms, newTerm]);
      setNewTerm('');
    }
  };

  const handleRemoveTerm = (index) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  const handleUpdateTerm = (index, value) => {
    const updatedTerms = [...terms];
    updatedTerms[index] = value;
    setTerms(updatedTerms);
  };

  const handleAddNewGroup = () => {
    // This would be implemented based on the specific requirements
    // For now, just add a separator term
    setTerms([...terms, '---']);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Terms and Conditions
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

        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Add />}
            sx={{ mr: 2 }}
            onClick={handleAddTerm}
          >
            Add New Term
          </Button>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddNewGroup}
          >
            Add New Group
          </Button>
        </Box>

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

export default TermsAndConditions;