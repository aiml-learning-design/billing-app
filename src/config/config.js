/**
 * Global configuration file for the Invokta Billing Portal
 * This file centralizes all constants and configuration values used throughout the application
 */

// API Configuration
export const API_CONFIG = {
  // Base URL for API requests
  BASE_URL: process.env.REACT_APP_API_URL,
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      REFRESH_TOKEN: '/api/auth/refresh-token',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
      GOOGLE_AUTH: '/oauth2/authorization/google',
    },
    
    // User
    USER: {
      PROFILE: '/api/users',
      UPDATE_PROFILE: '/api/users/profile/update',
    },
    
    // Business
    BUSINESS: {
      ADD: '/api/business/add',
      UPDATE: '/api/business/update',
      GET_ALL: '/api/business',
      GET_BY_ID: (id) => `/api/business/${id}`,
    },
    
    // Invoices
    INVOICE: {
      CREATE: '/api/invoices/create',
      GET_ALL: '/api/invoices',
      GET_BY_ID: (id) => `/api/invoices/${id}`,
      GET_STATS: '/api/invoices/stats',
    },
  },
  
  // HTTP Headers
  HEADERS: {
    CONTENT_TYPE: 'application/json',
    AUTHORIZATION: 'Authorization',
    REFRESH_TOKEN: 'X-Refresh-Token',
  },
};

// Authentication Configuration
export const AUTH_CONFIG = {
  // Local Storage Keys
  STORAGE_KEYS: {
    TOKEN: 'token',
    REFRESH_TOKEN: 'refreshToken',
    BUSINESS_DETAILS: 'businessDetails',
  },
  
  // Routes
  ROUTES: {
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
  },
};

// UI Configuration
export const UI_CONFIG = {
  // Dashboard Menu Items
  MENU_ITEMS: [
    { text: 'Sales', icon: 'Receipt', new: true },
    { text: 'Purchases', icon: 'Description', new: true },
    { text: 'Accounting', icon: 'MonetizationOn', new: true },
    { text: 'Sales CRM', icon: 'Person', new: true },
    { text: 'Inventory', icon: 'Store', new: true },
    { text: 'Accounting Reports', icon: 'Description', new: true },
    { text: 'GST Reports', icon: 'Receipt', new: true },
    { text: 'Workflows', icon: 'ListAlt' },
    { text: 'Bank & Payments', icon: 'MonetizationOn' },
    { text: 'Profile', icon: 'Person', route: '/profile' },
  ],
  
  // Theme Colors
  COLORS: {
    PRIMARY: '#3f51b5',
    SECONDARY: '#f50057',
    SUCCESS: '#4caf50',
    ERROR: '#f44336',
    WARNING: '#ff9800',
    INFO: '#2196f3',
    BACKGROUND: '#f8f9fa',
    PAPER: '#ffffff',
    TEXT_PRIMARY: '#212121',
    TEXT_SECONDARY: '#757575',
    
    // Custom colors for the dashboard menu
    PARROT_GREEN: '#58D68D', // Bright green color for sidebar
    ORANGE: '#FF8C00',       // Orange color for menu items
  },
  
  // Typography
  TYPOGRAPHY: {
    FONT_FAMILY: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    HEADING_FONT_WEIGHT: 600,
    BODY_FONT_WEIGHT: 400,
  },
  
  // Spacing
  SPACING: {
    UNIT: 8, // Base spacing unit in pixels
    SMALL: 8,
    MEDIUM: 16,
    LARGE: 24,
    XLARGE: 32,
  },
  
  // Breakpoints
  BREAKPOINTS: {
    XS: 0,
    SM: 600,
    MD: 960,
    LG: 1280,
    XL: 1920,
  },
};

export default {
  API: API_CONFIG,
  AUTH: AUTH_CONFIG,
  UI: UI_CONFIG,
};