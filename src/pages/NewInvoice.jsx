import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { API_CONFIG, AUTH_CONFIG } from '../config/config';
import {
  Box, Typography, Grid, CircularProgress, Chip, Stepper, Step, StepLabel
} from '@mui/material';

// Import the components we created
import InvoiceDetails from '../components/invoices/InvoiceDetails';
import BusinessDetails from '../components/business/BusinessDetails';
import ClientDetailsNoApi from '../components/invoices/ClientDetailsNoApi';
import ShippingDetails from '../components/shipping/ShippingDetails';
import TransportDetails from '../components/shipping/TransportDetails';
import ItemDetails from '../components/item/ItemDetails';
import CostSummary from '../components/invoices/CostSummary';
import SignatureSection from '../components/invoices/SignatureSection';
import AdditionalInfo from '../components/invoices/AdditionalInfo';
import TermsAndConditionsWithCheckboxes from '../components/invoices/TermsAndConditionsWithCheckboxes';
import InvoiceSummary from '../components/invoices/InvoiceSummary';

/**
 * NewInvoice component refactored to use separate components
 */
const NewInvoice = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const initialFetchDone = useRef(false);
  
  // State for invoice details
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoicePrefix, setInvoicePrefix] = useState('');
  const [invoiceDelimiter, setInvoiceDelimiter] = useState('-');
  const [useCustomPrefix, setUseCustomPrefix] = useState(false);
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
  const [apiTerms, setApiTerms] = useState([]);
  const [selectedTerms, setSelectedTerms] = useState([]);
  const [termsLoading, setTermsLoading] = useState(false);
  const [terms, setTerms] = useState([
    'Please quote invoice number when remitting funds.',
    'Please pay within 15 days from the date of invoice, overdue interest @ 14% will be charged on delayed payments.'
  ]);
  
  // State for invoice type (PRODUCT, SERVICE, ONE_TIME)
  const [invoiceFor, setInvoiceFor] = useState('ONE_TIME');
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
          // Don't call fetchBusinessData here, it will be called in the useEffect
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
      console.log('Fetching data for business:', business);
      setLoading(true);
      
      // Generate next invoice number
/*       const lastInvoiceRes = await api.get(`/api/invoices/last?businessId=${business.business_id}`);
      if (lastInvoiceRes.data) {
        const lastNumber = lastInvoiceRes.data.invoiceNumber;
        const lastDate = new Date(lastInvoiceRes.data.invoiceDate).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
        setLastInvoiceNumber(lastNumber);
        setLastInvoiceDate(lastDate);
        
        // Extract numeric part from the last invoice number
        const prefix = lastNumber.replace(/\d+$/, '');
        const num = parseInt(lastNumber.match(/\d+$/)[0], 10);
        
        // Set default prefix based on last invoice if custom prefix is not being used
        if (!useCustomPrefix) {
          setInvoiceNumber(`${prefix}${num + 1}`);
        } else {
          // Use custom prefix and delimiter if specified
          const customPrefix = invoicePrefix || business.businessName.substring(0, 3).toUpperCase();
          setInvoiceNumber(`${customPrefix}${invoiceDelimiter}${num + 1}`);
        }
      } else {
        // No previous invoice, create a default one
        if (!useCustomPrefix) {
          setInvoiceNumber(`${business.businessName.substring(0, 3).toUpperCase()}1000`);
        } else {
          // Use custom prefix and delimiter if specified
          const customPrefix = invoicePrefix || business.businessName.substring(0, 3).toUpperCase();
          setInvoiceNumber(`${customPrefix}${invoiceDelimiter}1000`);
        }
      } */

      // Fetch all clients using the same endpoint as ClientDetails component
      // This ensures we only fetch client data once and use it throughout the component
      console.log('Fetching client details...');
      // Include business ID in the API call to filter clients for this business
      const clientsRes = await api.get(`/api/client/business/all`);
      console.log('Client details response:', clientsRes);
      
      // Process client data
      let clientsData = [];
      if (clientsRes.success && clientsRes.data) {
        const responseData = clientsRes.data;
        
        // Handle different response formats
        if (Array.isArray(responseData.content)) {
          console.log('Found standard Page structure with content array');
          clientsData = responseData.content;
        } else if (Array.isArray(responseData)) {
          console.log('Found direct array of clients');
          clientsData = responseData;
        } else if (responseData.client_id || responseData.businessName) {
          console.log('Found single client object');
          clientsData = [responseData];
        } else if (responseData.clients && Array.isArray(responseData.clients)) {
          console.log('Found custom structure with clients array');
          clientsData = responseData.clients;
        } else {
          console.warn('Unexpected response format, defaulting to empty array');
          clientsData = [];
        }
      }
      
      // Fetch warehouses and transporters
//       const [warehousesRes, transportersRes] = await Promise.all([
//         api.get(`/api/warehouses?businessId=${business.business_id}`),
//         api.get(`/api/transporters?businessId=${business.business_id}`)
//       ]);

      setClients(clientsData);
 //     setWarehouses(warehousesRes.data);
   //   setTransporters(transportersRes.data);
    } catch (err) {
      console.error('Failed to load data for business', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch terms and conditions from the API
  const fetchTermsAndConditions = async () => {
    try {
      setTermsLoading(true);
      console.log('Fetching terms and conditions from API');
      
      const response = await api.get('/api/invoice/terms');
      console.log('Terms and conditions response:', response);
      
      if (response.success && response.data) {
        let termsData = [];
        
        // Handle different response formats
        if (Array.isArray(response.data)) {
          console.log('Found array of terms');
          termsData = response.data;
        } else if (response.data.terms && Array.isArray(response.data.terms)) {
          console.log('Found terms array in response data');
          termsData = response.data.terms;
        } else {
          console.warn('Unexpected response format, defaulting to empty array');
          termsData = [];
        }
        
        console.log('Setting API terms:', termsData);
        setApiTerms(termsData);
        
        // Initialize selected terms with default selections if available
        if (termsData.length > 0) {
          // Select the first two terms by default (or all if less than two)
          const defaultSelected = termsData.slice(0, Math.min(2, termsData.length));
          setSelectedTerms(defaultSelected.map(term => term.id || term._id));
          
          // Update terms state with the text of selected terms
          setTerms(defaultSelected.map(term => term.text || term.content || term.description || ''));
        }
      }
    } catch (err) {
      console.error('Failed to fetch terms and conditions:', err);
      // If API fails, keep using the default terms
    } finally {
      setTermsLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Only fetch businesses from API if we haven't done the initial fetch yet
        // This prevents the API from being called twice
        if (!initialFetchDone.current) {
          initialFetchDone.current = true;
          // First fetch all businesses from the API
          await fetchAllBusinesses();
          
          // Fetch terms and conditions
          await fetchTermsAndConditions();
          
          // After fetching businesses, check if we have a selected business
          // If not, and we have businesses in allBusinesses, select the first one and fetch its data
          if (!selectedBusiness && allBusinesses.length > 0) {
            const business = allBusinesses[0];
            setSelectedBusiness(business);
            await fetchBusinessData(business);
          }
          // If no businesses were found in the API, fall back to using businesses from user object
          else if (!selectedBusiness && user?.businesses && user.businesses.length > 0) {
            console.log('No businesses found in API, using businesses from user object');
            const business = user.businesses[0];
            setSelectedBusiness(business);
            await fetchBusinessData(business);
          }
        }
      } catch (err) {
        console.error('Failed to initialize data', err);
        
        // If there was an error fetching from API, fall back to user object
        if (!selectedBusiness && user?.businesses && user.businesses.length > 0) {
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
  }, [user]);

  // Add a useEffect hook to fetch business data when selectedBusiness changes
  useEffect(() => {
    // Only fetch business data if selectedBusiness is not null and initialFetchDone is true
    // This prevents duplicate API calls during initial load
    if (selectedBusiness && initialFetchDone.current) {
      console.log('Selected business changed, fetching business data...');
      fetchBusinessData(selectedBusiness);
    }
  }, [selectedBusiness]);

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

  // Helper function to create invoice payload with optional fields
  const createInvoicePayload = (status) => {
    // Get the selected client data
    const selectedClientData = clients.find(c => c.client_id === selectedClient);
    
    // Create the base invoice data object
    const invoiceData = {
      invoiceNumber,
      invoiceDate: invoiceDate.toISOString(),
      dueDate: dueDate.toISOString(),
      billedBy: {
        businessId: selectedBusiness?.business_id || selectedBusiness?.businessId,
        businessName: selectedBusiness?.businessName,
        gstin: selectedBusiness?.gstin,
        pan: selectedBusiness?.pan,
        email: selectedBusiness?.officeAddresses?.[0]?.email,
        phone: selectedBusiness?.officeAddresses?.[0]?.phone,
        officeAddress: selectedBusiness?.officeAddresses?.[0]
      },
      billedTo: {
        businessId: selectedClientData?.client_id || selectedClientData?.businessId,
        businessName: selectedClientData?.businessName,
        gstin: selectedClientData?.gstin,
        pan: selectedClientData?.pan || null, // Explicitly set to null if not available
        email: selectedClientData?.email,
        phone: selectedClientData?.phone,
        officeAddress: selectedClientData?.address
      },
      currency,
      purchasedOrderRequest: {
        itemDetailsRequest: items.map(item => ({
          itemName: item.name,
          // Convert numeric values to numbers to ensure correct type
          gstRate: Number(item.gstRate),
          sgst: Number(item.sgst),
          cgst: Number(item.cgst),
          igst: 0, // Default to 0 if not provided
          quantity: Number(item.quantity),
          price: Number(item.rate),
          amount: Number(item.amount),
          total: Number(item.total),
          itemDescription: item.description || ""
        }))
      },
      status: status
    };

    // Add optional fields only if they have values
    if (selectedBusiness?.businessName) {
      invoiceData.companyName = selectedBusiness.businessName;
    }

    // Add invoiceId as optional field (it will be generated by the server if not provided)
    if (selectedClient) {
      invoiceData.invoiceId = `${selectedClient}-${invoiceNumber}`;
    }

    // Add invoiceFor based on the selected option (optional field)
    if (invoiceFor) {
      invoiceData.invoiceFor = invoiceFor;
    }

    // Add shipping information if enabled
    if (showShipping) {
      invoiceData.shippingFrom = shippingFrom;
      invoiceData.shippingTo = shippingTo;
    } else {
      // Add empty objects as per the payload format
      invoiceData.shippingFrom = {};
      invoiceData.shippingTo = {};
    }

    // Add terms and conditions if available
    if (terms && terms.length > 0) {
      // Format terms as key-value pairs as shown in the example payload
      const termsObj = {};
      terms.forEach((term, index) => {
        if (term && term.trim() !== '') {
          termsObj[`key_${index}`] = [term, ""];
        }
      });
      
      // Only add termsConditions if there are actual terms
      if (Object.keys(termsObj).length > 0) {
        invoiceData.termsConditions = termsObj;
      } else {
        // If no terms, add an empty object
        invoiceData.termsConditions = {};
      }
    } else {
      // If no terms, add an empty object
      invoiceData.termsConditions = {};
    }

    // Add item description as optional field
    if (items.length > 0 && items[0].description) {
      invoiceData.itemDescription = items[0].description;
    }

    // Add notes if enabled
    if (showNotes && notes) {
      invoiceData.additionalNotes = notes;
    }

    // Add additional details if available
    const additionalDetails = selectedClientData?.additionalDetails;
    if (additionalDetails && additionalDetails.length > 0) {
      // Filter out empty details
      const validDetails = additionalDetails.filter(detail => detail.key && detail.value);
      
      if (validDetails.length > 0) {
        const detailsObj = {};
        validDetails.forEach((detail, index) => {
          detailsObj[`key_${index}`] = {
            [detail.key]: detail.value
          };
        });
        invoiceData.AdditionalDetails = detailsObj;
      } else {
        // If no valid details, add an empty object
        invoiceData.AdditionalDetails = {};
      }
    } else {
      // If no additional details, add an empty object
      invoiceData.AdditionalDetails = {};
    }

    // Add signature if available
    if (signature) {
      invoiceData.signature = signature;
    }

    // Add attachments if enabled
    if (showAttachments && attachments.length > 0) {
      invoiceData.attachments = attachments.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      }));
    }

    return invoiceData;
  };

  // Handle saving as draft
  const handleSaveDraft = async () => {
    try {
      // Use the helper function to create the invoice payload
      const invoiceData = createInvoicePayload('DRAFT');
      
      // Log the payload to see what's being sent to the API
      console.log('Draft invoice payload being sent to API:', JSON.stringify(invoiceData, null, 2));
      
      // Verify that purchasedOrderRequest and itemDetailsRequest are present and correctly structured
      if (invoiceData.purchasedOrderRequest && Array.isArray(invoiceData.purchasedOrderRequest.itemDetailsRequest)) {
        console.log('purchasedOrderRequest.itemDetailsRequest is present and is an array with', 
          invoiceData.purchasedOrderRequest.itemDetailsRequest.length, 'items');
      } else {
        console.error('purchasedOrderRequest.itemDetailsRequest is missing or not an array!');
        console.log('purchasedOrderRequest:', invoiceData.purchasedOrderRequest);
      }

      // Try both approaches: using the api service and using axios directly
      
      // 1. First try using the api service with explicit content type
      console.log('Making API call using api service to /api/invoices');
      try {
        const apiResponse = await api.post('/api/invoices', invoiceData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // Log the response
        console.log('API service response for draft:', apiResponse);
        
        // If successful, navigate to the invoices page
        navigate('/invoices');
        return; // Exit the function if successful
      } catch (apiError) {
        console.error('Failed to save draft using api service:', apiError);
        // Continue to try the direct axios approach
      }
      
      // 2. If api service fails, try using axios directly
      console.log('Making API call using axios directly to /api/invoices');
      
      // Get the base URL and token
      const baseUrl = API_CONFIG.BASE_URL || 'http://localhost:8087/invokta';
      const token = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
      
      // Make the API call with axios
      const axiosResponse = await axios.post(
        `${baseUrl}/api/invoices`, 
        invoiceData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }
      );
      
      // Log the response
      console.log('Axios direct response status for draft:', axiosResponse.status);
      console.log('Axios direct response data for draft:', JSON.stringify(axiosResponse.data, null, 2));
      
      // Navigate to the invoices page
      navigate('/invoices');
    } catch (err) {
      console.error('Failed to save draft', err);
      console.error('Error details:', err.response ? err.response.data : err.message);
      
      // Log more details about the error
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
        console.error('Response data:', JSON.stringify(err.response.data, null, 2));
      } else if (err.request) {
        console.error('No response received. Request details:', err.request);
      } else {
        console.error('Error setting up request:', err.message);
      }
    }
  };

  // Handle save and continue
  const handleSaveAndContinue = async () => {
    try {
      // Use the helper function to create the invoice payload
      const invoiceData = createInvoicePayload('PENDING');
      
      // Log the payload to see what's being sent to the API
      console.log('Invoice payload being sent to API:', JSON.stringify(invoiceData, null, 2));
      
      // Verify that purchasedOrderRequest and itemDetailsRequest are present and correctly structured
      if (invoiceData.purchasedOrderRequest && Array.isArray(invoiceData.purchasedOrderRequest.itemDetailsRequest)) {
        console.log('purchasedOrderRequest.itemDetailsRequest is present and is an array with', 
          invoiceData.purchasedOrderRequest.itemDetailsRequest.length, 'items');
        
        // Log the first item in the array for debugging
        if (invoiceData.purchasedOrderRequest.itemDetailsRequest.length > 0) {
          console.log('First item in itemDetailsRequest:', 
            JSON.stringify(invoiceData.purchasedOrderRequest.itemDetailsRequest[0], null, 2));
        }
      } else {
        console.error('purchasedOrderRequest.itemDetailsRequest is missing or not an array!');
        console.log('purchasedOrderRequest:', invoiceData.purchasedOrderRequest);
      }

      // Try both approaches: using the api service and using axios directly
      
      // 1. First try using the api service with explicit content type
      console.log('Making API call using api service to /api/invoices/create');
      try {
        const apiResponse = await api.post('/api/invoices/create', invoiceData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // Log the response
        console.log('API service response:', apiResponse);
        
        // If successful, navigate to the payment page
        navigate(`/invoices/${apiResponse.invoiceId}/payment`);
        return; // Exit the function if successful
      } catch (apiError) {
        console.error('Failed to save invoice using api service:', apiError);
        // Continue to try the direct axios approach
      }
      
      // 2. If api service fails, try using axios directly
      console.log('Making API call using axios directly to /api/invoices/create');
      
      // Get the base URL and token
      const baseUrl = API_CONFIG.BASE_URL || 'http://localhost:8087/invokta';
      const token = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
      
      // Make the API call with axios
      const axiosResponse = await axios.post(
        `${baseUrl}/api/invoices/create`, 
        invoiceData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }
      );
      
      // Log the response
      console.log('Axios direct response status:', axiosResponse.status);
      console.log('Axios direct response data:', JSON.stringify(axiosResponse.data, null, 2));
      
      // Navigate to the payment page
      if (axiosResponse.data && axiosResponse.data.data && axiosResponse.data.data.invoiceId) {
        navigate(`/invoices/${axiosResponse.data.data.invoiceId}/payment`);
      } else if (axiosResponse.data && axiosResponse.data.invoiceId) {
        navigate(`/invoices/${axiosResponse.data.invoiceId}/payment`);
      } else {
        console.error('Invoice ID not found in response');
        // Navigate to invoices list as fallback
        navigate('/invoices');
      }
    } catch (err) {
      console.error('Failed to save invoice', err);
      console.error('Error details:', err.response ? err.response.data : err.message);
      
      // Log more details about the error
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
        console.error('Response data:', JSON.stringify(err.response.data, null, 2));
      } else if (err.request) {
        console.error('No response received. Request details:', err.request);
      } else {
        console.error('Error setting up request:', err.message);
      }
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
          <Grid item xs={12} md={12}>
            {activeStep === 0 ? (
              <>
                <InvoiceDetails
                  invoiceNumber={invoiceNumber}
                  setInvoiceNumber={setInvoiceNumber}
                  invoicePrefix={invoicePrefix}
                  setInvoicePrefix={setInvoicePrefix}
                  invoiceDelimiter={invoiceDelimiter}
                  setInvoiceDelimiter={setInvoiceDelimiter}
                  useCustomPrefix={useCustomPrefix}
                  setUseCustomPrefix={setUseCustomPrefix}
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

                <ClientDetailsNoApi
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

                <TermsAndConditionsWithCheckboxes
                  terms={terms}
                  setTerms={setTerms}
                  apiTerms={apiTerms}
                  selectedTerms={selectedTerms}
                  setSelectedTerms={setSelectedTerms}
                  termsLoading={termsLoading}
                  invoiceFor={invoiceFor}
                  setInvoiceFor={setInvoiceFor}
                  isRecurring={isRecurring}
                  setIsRecurring={setIsRecurring}
                />
              </>
            )}
          </Grid>

          {/* Right Column - Summary */}
          <Grid item xs={12} md={12}>
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