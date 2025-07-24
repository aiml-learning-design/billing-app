import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, Typography, Paper, Container, Breadcrumbs, Link, Divider 
} from '@mui/material';
import { Home as HomeIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const PrivacyPolicyPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link 
          component={RouterLink} 
          to="/"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>
        <Typography color="text.primary">Privacy Policy</Typography>
      </Breadcrumbs>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Link 
            component={RouterLink} 
            to="/register" 
            sx={{ display: 'flex', alignItems: 'center', mr: 2 }}
          >
            <ArrowBackIcon fontSize="small" />
          </Link>
          <Typography variant="h4" component="h1" gutterBottom>
            Privacy Policy
          </Typography>
        </Box>
        
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Last Updated: July 18, 2025
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="body1" paragraph>
          At Billing App, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our billing and invoice management service.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          1. Information We Collect
        </Typography>
        
        <Typography variant="body1" paragraph>
          We collect several types of information from and about users of our service, including:
        </Typography>
        
        <Typography component="div" variant="body1" sx={{ pl: 3 }}>
          <ul>
            <li>
              <strong>Personal Information:</strong> Name, email address, phone number, country, and other contact details you provide when registering or updating your account.
            </li>
            <li>
              <strong>Business Information:</strong> Business name, address, tax identification numbers (such as GSTIN, PAN), and other details related to your business operations.
            </li>
            <li>
              <strong>Invoice Data:</strong> Information about your invoices, including client details, amounts, dates, and payment status.
            </li>
            <li>
              <strong>Usage Data:</strong> Information about how you use our service, including log data, device information, and analytics.
            </li>
          </ul>
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          2. How We Use Your Information
        </Typography>
        
        <Typography variant="body1" paragraph>
          We use the information we collect to:
        </Typography>
        
        <Typography component="div" variant="body1" sx={{ pl: 3 }}>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process and manage your account registration</li>
            <li>Facilitate invoice creation, management, and payment processing</li>
            <li>Communicate with you about your account, updates, and support</li>
            <li>Analyze usage patterns to enhance user experience</li>
            <li>Comply with legal obligations</li>
          </ul>
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          3. Data Security
        </Typography>
        
        <Typography variant="body1" paragraph>
          We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          4. Data Sharing and Disclosure
        </Typography>
        
        <Typography variant="body1" paragraph>
          We may share your information with:
        </Typography>
        
        <Typography component="div" variant="body1" sx={{ pl: 3 }}>
          <ul>
            <li>
              <strong>Service Providers:</strong> Third-party vendors who provide services on our behalf, such as hosting, analytics, and customer support.
            </li>
            <li>
              <strong>Business Partners:</strong> Companies we partner with to offer integrated services.
            </li>
            <li>
              <strong>Legal Requirements:</strong> When required by law, court order, or governmental authority.
            </li>
            <li>
              <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.
            </li>
          </ul>
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          5. Your Rights
        </Typography>
        
        <Typography variant="body1" paragraph>
          Depending on your location, you may have certain rights regarding your personal information, including:
        </Typography>
        
        <Typography component="div" variant="body1" sx={{ pl: 3 }}>
          <ul>
            <li>Access to your personal information</li>
            <li>Correction of inaccurate or incomplete information</li>
            <li>Deletion of your personal information</li>
            <li>Restriction or objection to processing</li>
            <li>Data portability</li>
            <li>Withdrawal of consent</li>
          </ul>
        </Typography>
        
        <Typography variant="body1" paragraph>
          To exercise these rights, please contact us using the information provided in the "Contact Us" section.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          6. Cookies and Tracking Technologies
        </Typography>
        
        <Typography variant="body1" paragraph>
          We use cookies and similar tracking technologies to collect information about your browsing activities and to remember your preferences. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          7. Children's Privacy
        </Typography>
        
        <Typography variant="body1" paragraph>
          Our service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we learn that we have collected personal information from a child, we will take steps to delete that information.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          8. Changes to This Privacy Policy
        </Typography>
        
        <Typography variant="body1" paragraph>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          9. Contact Us
        </Typography>
        
        <Typography variant="body1" paragraph>
          If you have any questions about this Privacy Policy, please contact us at:
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ pl: 3 }}>
          Email: privacy@billingapp.com<br />
          Address: 123 Billing Street, Invoice City, 12345<br />
          Phone: +1 (555) 123-4567
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="body2" color="text.secondary" align="center">
          By using our service, you acknowledge that you have read and understood this Privacy Policy.
        </Typography>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicyPage;