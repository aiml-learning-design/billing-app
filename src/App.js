import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import Dashboard from './pages/Dashboard';
import BusinessPage from './pages/BusinessPage';
import BusinessSetupPage from './pages/BusinessSetupPage';
import InvoicesPage from './pages/InvoicesPage';
import InvoiceFormPage from './pages/InvoiceFormPage';
import UserProfile from './pages/UserProfile';
import BusinessDetailsPage from './pages/BusinessDetailsPage';
import ShippingDetailsPage from './pages/ShippingDetailsPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import NewInvoice from './pages/NewInvoice';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import NotFoundPage from './pages/NotFoundPage';
import PhoneInput from 'react-phone-input-2';
import OAuthCallback from './pages/OAuthCallback';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/business" element={<BusinessPage />} />
            <Route path="/business-setup" element={<BusinessSetupPage />} />
            <Route path="/:businessName" element={<Dashboard />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/invoices/new" element={<InvoiceFormPage />} />
            <Route path="/invoices/new-invoice" element={<NewInvoice />} />
            <Route path="/invoices/edit/:id" element={<InvoiceFormPage />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/business-details" element={<BusinessDetailsPage />} />
            <Route path="/shipping-details" element={<ShippingDetailsPage />} />
            <Route path="/item-details" element={<ItemDetailsPage />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </LocalizationProvider>
  );
}

export default App;