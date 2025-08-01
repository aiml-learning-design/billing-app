import React, { useRef } from 'react';
import {
  Box, Typography, Card, CardContent,
  Button, FormControlLabel, Checkbox,
  TextField
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

/**
 * SignatureSection component for handling signature upload or drawing
 * 
 * @param {Object} props - Component props
 * @param {string} props.signature - Base64 encoded signature image
 * @param {Function} props.setSignature - Function to update signature
 * @param {string} props.signatureLabel - Label for the signature
 * @param {Function} props.setSignatureLabel - Function to update signature label
 * @param {boolean} props.useSignaturePad - Whether to use signature pad
 * @param {Function} props.setUseSignaturePad - Function to toggle signature pad
 */
const SignatureSection = ({
  signature,
  setSignature,
  signatureLabel = 'Authorised Signatory',
  setSignatureLabel = () => {},
  useSignaturePad = false,
  setUseSignaturePad = () => {}
}) => {
  const fileInputRef = useRef(null);

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSignature(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setSignature(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Signature
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            onClick={handleReset}
            sx={{ mr: 2 }}
            disabled={!signature}
          >
            Reset
          </Button>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="signature-upload"
            type="file"
            onChange={handleSignatureUpload}
            ref={fileInputRef}
          />
          <label htmlFor="signature-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUpload />}
              sx={{ mr: 2 }}
            >
              Upload Signature
            </Button>
          </label>
          <FormControlLabel
            control={
              <Checkbox
                checked={useSignaturePad}
                onChange={(e) => setUseSignaturePad(e.target.checked)}
              />
            }
            label="Use Signature Pad"
          />
        </Box>

        {useSignaturePad && (
          <Box sx={{ border: '1px solid #ccc', height: 200, mb: 2, p: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Signature pad would be implemented here
            </Typography>
          </Box>
        )}

        <TextField
          label="Signature Label"
          value={signatureLabel}
          onChange={(e) => setSignatureLabel(e.target.value)}
          fullWidth
          margin="normal"
          placeholder="Authorised Signatory"
        />

        {signature && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {signatureLabel}
            </Typography>
            <img
              src={signature}
              alt="Signature"
              style={{ maxWidth: '200px', maxHeight: '100px', border: '1px solid #eee' }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SignatureSection;