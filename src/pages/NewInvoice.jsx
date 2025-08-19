import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {
  Box, Typography, Grid, CircularProgress, Chip, Stepper, Step, StepLabel
} from '@mui/material';
import { API_CONFIG } from '../config/config';

// Import the components we created
import InvoiceDetails from '../components/invoices/InvoiceDetails';
import BusinessDetails from '../components/business/BusinessDetails';
import ClientDetails from '../components/invoices/ClientDetails';
import ShippingDetails from '../components/shipping/ShippingDetails';
import TransportDetails from '../components/shipping/TransportDetails';
import ItemDetails from '../components/item/ItemDetails';
import CostSummary from '../components/invoices/CostSummary';
import SignatureSection from '../components/invoices/SignatureSection';
import AdditionalInfo from '../components/invoices/AdditionalInfo';
import TermsAndConditions from '../components/invoices/TermsAndConditions';
import InvoiceSummary from '../components/invoices/InvoiceSummary';

/**
 * NewInvoice component refactored to use separate components
 */
const NewInvoice = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  
  // State for invoice details
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(dayjs());
  const [dueDate, setDueDate] = useState(dayjs().add(14, 'day'));
  const [currency, setCurrency] = useState('INR');
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState('');
  const [lastInvoiceDate, setLastInvoiceDate] = useState('');
  
  // State for client details
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  
  // State for shipping details
  const [showShipping, setShowShipping] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [shippingFrom, setShippingFrom] = useState({
    warehouse: '',
    address: '',
    city: '',
    postalCode: '',
    state: ''
  });
  const [shippingTo, setShippingTo] = useState({
    address: '',
    city: '',
    postalCode: '',
    state: ''
  });
  
  // State for transport details
  const [showTransport, setShowTransport] = useState(false);
  const [transporters, setTransporters] = useState([]);
  const [transportDetails, setTransportDetails] = useState({
    transporter: '',
    distance: '',
    mode: '',
    docNo: '',
    docDate: null,
    vehicleType: '',
    vehicleNumber: ''
  });
  
  // State for items
  const [items, setItems] = useState([
    {
      id: 1,
      name: '',
      hsn: '',
      gstRate: 0,
      quantity: 1,
      rate: 0,
      amount: 0,
      cgst: 0,
      sgst: 0,
      total: 0,
      description: '',
      thumbnail: null
    }
  ]);
  
  // State for cost summary
  const [showDiscounts, setShowDiscounts] = useState(false);
  const [hideTotals, setHideTotals] = useState(false);
  const [summarizeTotalQuantity, setSummarizeTotalQuantity] = useState(false);
  const [showTotalInWords, setShowTotalInWords] = useState(true);
  
  // State for signature
  const [signature, setSignature] = useState(null);
  const [signatureLabel, setSignatureLabel] = useState('Authorised Signatory');
  const [useSignaturePad, setUseSignaturePad] = useState(false);
  
  // State for additional info
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showContactDetails, setShowContactDetails] = useState(false);
  
  // State for terms and conditions
  const [terms, setTerms] = useState([
    'Please quote invoice number when remitting funds.',
    'Please pay within 15 days from the date of invoice, overdue interest @ 14% will be charged on delayed payments.'
  ]);
  const [isRecurring, setIsRecurring] = useState(false);

  // Function to fetch all businesses from the API
  const fetchAllBusinesses = async () => {
    try {
      setLoading(true);
      console.log('Fetching all businesses from API');
      
      // Use the same endpoint as BusinessDetailsPage
      const endpoint = API_CONFIG.ENDPOINTS.BUSINESS.GET_SELF_DETAILS;
      const response = await api.get(`${endpoint}?page=0&size=100`);
      
      console.log('Businesses response:', response);
      
      if (response.success && response.data) {
        let businesses = [];
        const paginatedData = response.data;
        
        // Handle different response formats, similar to BusinessDetailsPage
        if (Array.isArray(paginatedData.content)) {
          console.log('Found standard Page structure with content array');
          businesses = paginatedData.content;
        } else if (Array.isArray(paginatedData)) {
          console.log('Found direct array of businesses');
          businesses = paginatedData;
        } else if (paginatedData.businessId || paginatedData.businessName) {
          console.log('Found single business object');
          businesses = [paginatedData];
        } else if (paginatedData.businesses && Array.isArray(paginatedData.businesses)) {
          console.log('Found custom pagination structure with businesses array');
          businesses = paginatedData.businesses;
        } else {
          console.warn('Unexpected response format, defaulting to empty array');
          businesses = [];
        }
        
        console.log('Setting all businesses:', businesses);
        setAllBusinesses(businesses);
        
        // If there are businesses and no selected business yet, select the first one
        if (businesses.length > 0 && !selectedBusiness) {
          setSelectedBusiness(businesses[0]);
          await fetchBusinessData(businesses[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch data for a specific business
  const fetchBusinessData = async (business) => {
    try {
      setLoading(true);
      
      // Generate next invoice number
      const lastInvoiceRes = await api.get(`/api/invoices/last?businessId=${business.business_id}`);
      if (lastInvoiceRes.data) {
        const lastNumber = lastInvoiceRes.data.invoiceNumber;
        const lastDate = new Date(lastInvoiceRes.data.invoiceDate).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
        setLastInvoiceNumber(lastNumber);
        setLastInvoiceDate(lastDate);
        
        const prefix = lastNumber.replace(/\d+$/, '');
        const num = parseInt(lastNumber.match(/\d+$/)[0], 10);
        setInvoiceNumber(`${prefix}${num + 1}`);
      } else {
        setInvoiceNumber(`${business.businessName.substring(0, 3).toUpperCase()}1000`);
      }

      // Fetch clients, warehouses, transporters
      const [clientsRes, warehousesRes, transportersRes] = await Promise.all([
        api.get(`/api/clients?businessId=${business.business_id}`),
        api.get(`/api/warehouses?businessId=${business.business_id}`),
        api.get(`/api/transporters?businessId=${business.business_id}`)
      ]);

      setClients(clientsRes.data);
      setWarehouses(warehousesRes.data);
      setTransporters(transportersRes.data);
    } catch (err) {
      console.error('Failed to load data for business', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Only fetch businesses from API if we don't already have them
        // This prevents an infinite loop with the dependency on allBusinesses
        if (allBusinesses.length === 0) {
          // First fetch all businesses from the API
          await fetchAllBusinesses();
        }
        
        // If no businesses were found in the API or there was an error,
        // fall back to using businesses from user object
        if (allBusinesses.length === 0 && user?.businesses && user.businesses.length > 0) {
          console.log('No businesses found in API, using businesses from user object');
          const business = user.businesses[0];
          setSelectedBusiness(business);
          await fetchBusinessData(business);
        }
      } catch (err) {
        console.error('Failed to initialize data', err);
        
        // If there was an error fetching from API, fall back to user object
        if (user?.businesses && user.businesses.length > 0) {
          console.log('Error fetching from API, using businesses from user object');
          const business = user.businesses[0];
          setSelectedBusiness(business);
          await fetchBusinessData(business);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [user, allBusinesses]);

  // Calculate item totals
  useEffect(() => {
    const updatedItems = items.map(item => {
      const amount = item.quantity * item.rate;
      const cgst = amount * (item.gstRate / 2) / 100;
      const sgst = amount * (item.gstRate / 2) / 100;
      const total = amount + cgst + sgst;

      return {
        ...item,
        amount,
        cgst,
        sgst,
        total
      };
    });

    setItems(updatedItems);
  }, [items]);

  // Handle adding a new item
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: items.length + 1,
        name: '',
        hsn: '',
        gstRate: 0,
        quantity: 1,
        rate: 0,
        amount: 0,
        cgst: 0,
        sgst: 0,
        total: 0,
        description: '',
        thumbnail: null
      }
    ]);
  };

  // Handle removing an item
  const handleRemoveItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // Handle item field changes
  const handleItemChange = (id, field, value) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Handle saving as draft
  const handleSaveDraft = async () => {
    try {
      const invoiceData = {
        invoiceNumber,
        invoiceDate: invoiceDate.toISOString(),
        dueDate: dueDate.toISOString(),
        billedBy: {
          businessId: selectedBusiness.business_id,
          businessName: selectedBusiness.businessName,
          gstin: selectedBusiness.gstin,
          pan: selectedBusiness.pan,
          address: selectedBusiness.officeAddresses?.[0],
          email: selectedBusiness.officeAddresses?.[0]?.email,
          phone: selectedBusiness.officeAddresses?.[0]?.phone
        },
        billedTo: clients.find(c => c.client_id === selectedClient),
        currency,
        items,
        shipping: showShipping ? {
          from: shippingFrom,
          to: shippingTo
        } : null,
        transport: showTransport ? transportDetails : null,
        termsAndConditions: terms,
        signature,
        notes: showNotes ? notes : null,
        attachments: showAttachments ? attachments.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size
        })) : null,
        status: 'DRAFT',
        isRecurring
      };

      await api.post('/api/invoices', invoiceData);
      navigate('/invoices');
    } catch (err) {
      console.error('Failed to save draft', err);
    }
  };

  // Handle save and continue
  const handleSaveAndContinue = async () => {
    try {
      const invoiceData = {
        invoiceNumber,
        invoiceDate: invoiceDate.toISOString(),
        dueDate: dueDate.toISOString(),
        billedBy: {
          businessId: selectedBusiness.business_id,
          businessName: selectedBusiness.businessName,
          gstin: selectedBusiness.gstin,
          pan: selectedBusiness.pan,
          address: selectedBusiness.officeAddresses?.[0],
          email: selectedBusiness.officeAddresses?.[0]?.email,
          phone: selectedBusiness.officeAddresses?.[0]?.phone
        },
        billedTo: clients.find(c => c.client_id === selectedClient),
        currency,
        items,
        shipping: showShipping ? {
          from: shippingFrom,
          to: shippingTo
        } : null,
        transport: showTransport ? transportDetails : null,
        termsAndConditions: terms,
        signature,
        notes: showNotes ? notes : null,
        attachments: showAttachments ? attachments.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size
        })) : null,
        status: 'PENDING',
        isRecurring
      };

      const response = await api.post('/api/invoices', invoiceData);
      navigate(`/invoices/${response.data.invoiceId}/payment`);
    } catch (err) {
      console.error('Failed to save invoice', err);
    }
  };

  // Handle step change
  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  // Handle adding a new client
  // Instead of navigating away from the invoice creation flow,
  // we'll let the ClientDetails component handle this with its built-in dialog
  const handleAddNewClient = () => {
    // The ClientDetails component will open its own dialog
    // when onAddNewClient is null or undefined
    return;
  };

  if (loading) {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </LocalizationProvider>
    );
  }

  const steps = ['Add Invoice Details', 'Design & Share (optional)'];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          New Invoice
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="subtitle1">
            Create New Invoice
          </Typography>
          <Box sx={{ display: 'flex' }}>
            <Chip 
              label="① Add Invoice Details" 
              color={activeStep === 0 ? "primary" : "default"} 
              sx={{ mr: 1 }}
              onClick={() => handleStepChange(0)}
            />
            <Chip 
              label="② Design & Share (optional)" 
              color={activeStep === 1 ? "primary" : "default"}
              variant={activeStep === 0 ? "outlined" : "default"}
              onClick={() => handleStepChange(1)}
            />
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Left Column - Invoice Details */}
          <Grid item xs={12} md={8}>
            {activeStep === 0 ? (
              <>
                <InvoiceDetails
                  invoiceNumber={invoiceNumber}
                  setInvoiceNumber={setInvoiceNumber}
                  invoiceDate={invoiceDate}
                  setInvoiceDate={setInvoiceDate}
                  dueDate={dueDate}
                  setDueDate={setDueDate}
                  currency={currency}
                  setCurrency={setCurrency}
                  lastInvoiceNumber={lastInvoiceNumber}
                  lastInvoiceDate={lastInvoiceDate}
                />

                <BusinessDetails
                  business={selectedBusiness}
                  businesses={allBusinesses.length > 0 ? allBusinesses : (user?.businesses || [])}
                  onBusinessChange={(business) => {
                    setSelectedBusiness(business);
                    // Fetch data for the selected business
                    fetchBusinessData(business);
                  }}
                  onEdit={() => navigate('/business-details')}
                  onBusinessUpdate={(updatedBusiness) => {
                    // Update the selected business in state
                    setSelectedBusiness(updatedBusiness);
                    
                    // Update the business in allBusinesses if it exists
                    if (allBusinesses.length > 0) {
                      const updatedBusinesses = allBusinesses.map(b => 
                        (b.business_id === updatedBusiness.business_id) ? updatedBusiness : b
                      );
                      setAllBusinesses(updatedBusinesses);
                    }
                    
                    // Note: In a production environment, we would also update the user context
                    // to persist the changes across the application. However, for now, we'll
                    // just update the local state, which is sufficient for the current session.
                  }}
                />

                <ClientDetails
                  clients={clients}
                  selectedClient={selectedClient}
                  setSelectedClient={setSelectedClient}
                  // Removed onAddNewClient prop to use the component's built-in dialog
                  // This keeps users in the invoice creation flow when adding a new client
                />

                <ShippingDetails
                  showShipping={showShipping}
                  setShowShipping={setShowShipping}
                  warehouses={warehouses}
                  shippingFrom={shippingFrom}
                  setShippingFrom={setShippingFrom}
                  shippingTo={shippingTo}
                  setShippingTo={setShippingTo}
                  selectedClient={clients.find(c => c.client_id === selectedClient)}
                />

                <TransportDetails
                  showTransport={showTransport}
                  setShowTransport={setShowTransport}
                  transporters={transporters}
                  transportDetails={transportDetails}
                  setTransportDetails={setTransportDetails}
                />

                <ItemDetails
                  items={items}
                  setItems={setItems}
                  onAddItem={handleAddItem}
                  onRemoveItem={handleRemoveItem}
                  onItemChange={handleItemChange}
                />

                <CostSummary
                  items={items}
                  currency={currency}
                  showDiscounts={showDiscounts}
                  setShowDiscounts={setShowDiscounts}
                  hideTotals={hideTotals}
                  setHideTotals={setHideTotals}
                  summarizeTotalQuantity={summarizeTotalQuantity}
                  setSummarizeTotalQuantity={setSummarizeTotalQuantity}
                  showTotalInWords={showTotalInWords}
                  setShowTotalInWords={setShowTotalInWords}
                />
              </>
            ) : (
              <>
                <SignatureSection
                  signature={signature}
                  setSignature={setSignature}
                  signatureLabel={signatureLabel}
                  setSignatureLabel={setSignatureLabel}
                  useSignaturePad={useSignaturePad}
                  setUseSignaturePad={setUseSignaturePad}
                />

                <AdditionalInfo
                  showAdditionalInfo={showAdditionalInfo}
                  setShowAdditionalInfo={setShowAdditionalInfo}
                  showNotes={showNotes}
                  setShowNotes={setShowNotes}
                  notes={notes}
                  setNotes={setNotes}
                  showAttachments={showAttachments}
                  setShowAttachments={setShowAttachments}
                  attachments={attachments}
                  setAttachments={setAttachments}
                  showContactDetails={showContactDetails}
                  setShowContactDetails={setShowContactDetails}
                />

                <TermsAndConditions
                  terms={terms}
                  setTerms={setTerms}
                  isRecurring={isRecurring}
                  setIsRecurring={setIsRecurring}
                />
              </>
            )}
          </Grid>

          {/* Right Column - Summary */}
          <Grid item xs={12} md={4}>
            <InvoiceSummary
              invoiceNumber={invoiceNumber}
              invoiceDate={invoiceDate}
              dueDate={dueDate}
              selectedClient={clients.find(c => c.client_id === selectedClient)}
              items={items}
              currency={currency}
              onSaveDraft={handleSaveDraft}
              onSaveAndContinue={handleSaveAndContinue}
            />
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default NewInvoice;