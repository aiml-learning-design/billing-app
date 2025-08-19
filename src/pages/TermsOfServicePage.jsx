import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, Typography, Paper, Container, Breadcrumbs, Link, Divider 
} from '@mui/material';
import { Home as HomeIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const TermsOfServicePage = () => {
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
        <Typography color="text.primary">Terms of Service</Typography>
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
            Terms of Service
          </Typography>
        </Box>
        
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Last Updated: July 18, 2025
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="body1" paragraph>
          Please read these Terms of Service ("Terms") carefully before using the Billing Application service operated by Billing Application Inc. ("us", "we", or "our").
        </Typography>
        
        <Typography variant="body1" paragraph>
          Your access to and use of the service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the service.
        </Typography>
        
        <Typography variant="body1" paragraph>
          By accessing or using the service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          1. Accounts
        </Typography>
        
        <Typography variant="body1" paragraph>
          When you create an account with us, you must provide accurate, complete, and up-to-date information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our service.
        </Typography>
        
        <Typography variant="body1" paragraph>
          You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password, whether your password is with our service or a third-party service.
        </Typography>
        
        <Typography variant="body1" paragraph>
          You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          2. Service Usage
        </Typography>
        
        <Typography variant="body1" paragraph>
          Our service allows you to create, manage, and store invoices and business information. You are responsible for all data that you input into the service, including ensuring that it complies with applicable laws and regulations.
        </Typography>
        
        <Typography variant="body1" paragraph>
          You agree not to use the service:
        </Typography>
        
        <Typography component="div" variant="body1" sx={{ pl: 3 }}>
          <ul>
            <li>In any way that violates any applicable national or international law or regulation</li>
            <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way</li>
            <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter", "spam", or any other similar solicitation</li>
            <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity</li>
            <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful</li>
          </ul>
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          3. Intellectual Property
        </Typography>
        
        <Typography variant="body1" paragraph>
          The service and its original content, features, and functionality are and will remain the exclusive property of Billing Application Inc. and its licensors. The service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
        </Typography>
        
        <Typography variant="body1" paragraph>
          Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Billing Application Inc.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          4. User Content
        </Typography>
        
        <Typography variant="body1" paragraph>
          Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post on or through the service, including its legality, reliability, and appropriateness.
        </Typography>
        
        <Typography variant="body1" paragraph>
          By posting Content on or through the service, you represent and warrant that:
        </Typography>
        
        <Typography component="div" variant="body1" sx={{ pl: 3 }}>
          <ul>
            <li>The Content is yours (you own it) or you have the right to use it and grant us the rights and license as provided in these Terms</li>
            <li>The posting of your Content on or through the service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person</li>
          </ul>
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          5. Subscription and Payments
        </Typography>
        
        <Typography variant="body1" paragraph>
          Some parts of the service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis, depending on the type of subscription plan you select.
        </Typography>
        
        <Typography variant="body1" paragraph>
          At the end of each billing period, your subscription will automatically renew under the same conditions unless you cancel it or Billing Application Inc. cancels it. You may cancel your subscription renewal either through your online account management page or by contacting our customer support team.
        </Typography>
        
        <Typography variant="body1" paragraph>
          All payments are processed securely through our payment processors. By providing your payment information, you authorize us to charge your payment method for the subscription plan you have selected.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          6. Termination
        </Typography>
        
        <Typography variant="body1" paragraph>
          We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
        </Typography>
        
        <Typography variant="body1" paragraph>
          Upon termination, your right to use the service will immediately cease. If you wish to terminate your account, you may simply discontinue using the service or contact us to request account deletion.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          7. Limitation of Liability
        </Typography>
        
        <Typography variant="body1" paragraph>
          In no event shall Billing Application Inc., nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
        </Typography>
        
        <Typography component="div" variant="body1" sx={{ pl: 3 }}>
          <ul>
            <li>Your access to or use of or inability to access or use the service</li>
            <li>Any conduct or content of any third party on the service</li>
            <li>Any content obtained from the service</li>
            <li>Unauthorized access, use or alteration of your transmissions or content</li>
          </ul>
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          8. Disclaimer
        </Typography>
        
        <Typography variant="body1" paragraph>
          Your use of the service is at your sole risk. The service is provided on an "AS IS" and "AS AVAILABLE" basis. The service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          9. Governing Law
        </Typography>
        
        <Typography variant="body1" paragraph>
          These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
        </Typography>
        
        <Typography variant="body1" paragraph>
          Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          10. Changes to Terms
        </Typography>
        
        <Typography variant="body1" paragraph>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
        </Typography>
        
        <Typography variant="body1" paragraph>
          By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the service.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          11. Contact Us
        </Typography>
        
        <Typography variant="body1" paragraph>
          If you have any questions about these Terms, please contact us at:
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ pl: 3 }}>
          Email: terms@billingapp.com<br />
          Address: 123 Billing Street, Invoice City, 12345<br />
          Phone: +1 (555) 123-4567
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="body2" color="text.secondary" align="center">
          By using our service, you acknowledge that you have read and understood these Terms of Service.
        </Typography>
      </Paper>
    </Container>
  );
};

export default TermsOfServicePage;