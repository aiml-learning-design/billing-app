import React from 'react';
import {
  Box, Typography, Card, CardContent,
  Divider, FormControlLabel, Checkbox
} from '@mui/material';

/**
 * CostSummary component for displaying cost summary information
 * 
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of item objects
 * @param {string} props.currency - Currency code
 * @param {boolean} props.showDiscounts - Whether to show discounts/additional charges
 * @param {Function} props.setShowDiscounts - Function to toggle discounts visibility
 * @param {boolean} props.hideTotals - Whether to hide totals
 * @param {Function} props.setHideTotals - Function to toggle totals visibility
 * @param {boolean} props.summarizeTotalQuantity - Whether to summarize total quantity
 * @param {Function} props.setSummarizeTotalQuantity - Function to toggle total quantity summarization
 * @param {boolean} props.showTotalInWords - Whether to show total in words
 * @param {Function} props.setShowTotalInWords - Function to toggle total in words visibility
 */
const CostSummary = ({
  items = [],
  currency = 'INR',
  showDiscounts = false,
  setShowDiscounts = () => {},
  hideTotals = false,
  setHideTotals = () => {},
  summarizeTotalQuantity = false,
  setSummarizeTotalQuantity = () => {},
  showTotalInWords = false,
  setShowTotalInWords = () => {}
}) => {
  // Calculate subtotal (sum of all item amounts)
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  
  // Calculate CGST (sum of all item CGST)
  const cgst = items.reduce((sum, item) => sum + (item.cgst || 0), 0);
  
  // Calculate SGST (sum of all item SGST)
  const sgst = items.reduce((sum, item) => sum + (item.sgst || 0), 0);
  
  // Calculate total (subtotal + CGST + SGST)
  const total = subtotal + cgst + sgst;

  // Helper function to format currency
  const formatCurrency = (amount) => {
    const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '€';
    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  // Convert number to words (simplified version)
  const numberToWords = (num) => {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    
    const convertLessThanThousand = (n) => {
      if (n === 0) return '';
      
      let result = '';
      
      if (n >= 100) {
        result += units[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      
      if (n >= 10 && n <= 19) {
        result += teens[n - 10];
      } else {
        result += tens[Math.floor(n / 10)];
        if (n % 10 > 0) {
          result += ' ' + units[n % 10];
        }
      }
      
      return result.trim();
    };
    
    const numStr = num.toString();
    const integerPart = parseInt(numStr.split('.')[0]);
    const decimalPart = numStr.includes('.') ? parseInt(numStr.split('.')[1]) : 0;
    
    let result = '';
    
    if (integerPart >= 10000000) {
      result += convertLessThanThousand(Math.floor(integerPart / 10000000)) + ' Crore ';
      num %= 10000000;
    }
    
    if (integerPart >= 100000) {
      result += convertLessThanThousand(Math.floor(integerPart / 100000)) + ' Lakh ';
      num %= 100000;
    }
    
    if (integerPart >= 1000) {
      result += convertLessThanThousand(Math.floor(integerPart / 1000)) + ' Thousand ';
      num %= 1000;
    }
    
    result += convertLessThanThousand(integerPart % 1000);
    
    if (decimalPart > 0) {
      result += ' and ' + convertLessThanThousand(decimalPart) + ' Paise';
    }
    
    return result.trim();
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          COST
        </Typography>

        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={showDiscounts}
                onChange={(e) => setShowDiscounts(e.target.checked)}
              />
            }
            label="Add Discounts/Additional Charges"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={hideTotals}
                onChange={(e) => setHideTotals(e.target.checked)}
              />
            }
            label="Hide Totals"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={summarizeTotalQuantity}
                onChange={(e) => setSummarizeTotalQuantity(e.target.checked)}
              />
            }
            label="Summarise Total Quantity"
          />
        </Box>

        {!hideTotals && (
          <>
            <Divider sx={{ my: 2 }} />

            {/* Display subtotal */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Amount</Typography>
              <Typography variant="body1">{formatCurrency(subtotal)}</Typography>
            </Box>

            {/* Display SGST */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">SGST</Typography>
              <Typography variant="body1">{formatCurrency(sgst)}</Typography>
            </Box>

            {/* Display CGST */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">CGST</Typography>
              <Typography variant="body1">{formatCurrency(cgst)}</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Display total */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Total ({currency})</Typography>
              <Typography variant="h5">{formatCurrency(total)}</Typography>
            </Box>

            {/* Display total in words */}
            {showTotalInWords && (
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                {numberToWords(total)} {currency === 'INR' ? 'Rupees' : currency === 'USD' ? 'Dollars' : 'Euros'} Only
              </Typography>
            )}
          </>
        )}

        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={showTotalInWords}
                onChange={(e) => setShowTotalInWords(e.target.checked)}
              />
            }
            label="Show Total In Words"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default CostSummary;