import React, { useRef } from 'react';
import {
  Box, Typography, Card, CardContent,
  TextField, Button, FormControlLabel, Checkbox,
  List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import { AttachFile, Description } from '@mui/icons-material';

/**
 * AdditionalInfo component for handling additional information like notes and attachments
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.showAdditionalInfo - Whether to show additional info section
 * @param {Function} props.setShowAdditionalInfo - Function to toggle additional info visibility
 * @param {boolean} props.showNotes - Whether to show notes
 * @param {Function} props.setShowNotes - Function to toggle notes visibility
 * @param {string} props.notes - Notes text
 * @param {Function} props.setNotes - Function to update notes
 * @param {boolean} props.showAttachments - Whether to show attachments
 * @param {Function} props.setShowAttachments - Function to toggle attachments visibility
 * @param {Array} props.attachments - Array of attachment files
 * @param {Function} props.setAttachments - Function to update attachments
 * @param {boolean} props.showContactDetails - Whether to show contact details
 * @param {Function} props.setShowContactDetails - Function to toggle contact details visibility
 */
const AdditionalInfo = ({
  showAdditionalInfo = false,
  setShowAdditionalInfo = () => {},
  showNotes = false,
  setShowNotes = () => {},
  notes = '',
  setNotes = () => {},
  showAttachments = false,
  setShowAttachments = () => {},
  attachments = [],
  setAttachments = () => {},
  showContactDetails = false,
  setShowContactDetails = () => {}
}) => {
  const fileInputRef = useRef(null);

  const handleAttachmentUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
    
    // Reset the file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (index) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Additional Information
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={showAdditionalInfo}
                onChange={(e) => setShowAdditionalInfo(e.target.checked)}
              />
            }
            label="Enable Additional Info"
          />
        </Box>

        {showAdditionalInfo && (
          <>
            <Box sx={{ display: 'flex', mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showNotes}
                    onChange={(e) => setShowNotes(e.target.checked)}
                  />
                }
                label="Add Notes"
                sx={{ mr: 3 }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showAttachments}
                    onChange={(e) => setShowAttachments(e.target.checked)}
                  />
                }
                label="Add Attachments"
                sx={{ mr: 3 }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showContactDetails}
                    onChange={(e) => setShowContactDetails(e.target.checked)}
                  />
                }
                label="Add Contact Details"
              />
            </Box>

            {showNotes && (
              <TextField
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                placeholder="Add any additional notes here"
              />
            )}

            {showAttachments && (
              <Box sx={{ mt: 2 }}>
                <input
                  accept="*"
                  style={{ display: 'none' }}
                  id="attachment-upload"
                  type="file"
                  multiple
                  onChange={handleAttachmentUpload}
                  ref={fileInputRef}
                />
                <label htmlFor="attachment-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AttachFile />}
                  >
                    Add Attachments
                  </Button>
                </label>

                {attachments.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Attachments:</Typography>
                    <List>
                      {attachments.map((file, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Description />
                          </ListItemIcon>
                          <ListItemText 
                            primary={file.name} 
                            secondary={`${(file.size / 1024).toFixed(2)} KB`} 
                          />
                          <Button 
                            color="error" 
                            size="small"
                            onClick={() => handleRemoveAttachment(index)}
                          >
                            Remove
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            )}

            {showContactDetails && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Contact Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Contact details would be implemented here
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdditionalInfo;