/**
 * Global configuration file for the Invokta Billing Portal
 * This file centralizes all constants and configuration values used throughout the application
 */

// API Configuration Types
interface ApiEndpoints {
  AUTH: {
    LOGIN: string;
    REGISTER: string;
    REFRESH_TOKEN: string;
    FORGOT_PASSWORD: string;
    RESET_PASSWORD: string;
    GOOGLE_AUTH: string;
  };
  USER: {
    PROFILE: string;
    UPDATE_PROFILE: string;
  };
  BUSINESS: {
    ADD: string;
    UPDATE: string;
    GET_ALL: string;
    GET_BY_ID: (id: string | number) => string;
    ADD_SELF: string;
    ADD_CLIENT: string;
    GET_CLIENT_DETAILS: string;
    GET_SELF_DETAILS: string;
  };
  BANK: {
    ADD: string;
    UPDATE: string;
    GET_ALL: string;
    GET_BY_ID: (id: string | number) => string;
    DELETE: (id: string | number) => string;
  };
  INVOICE: {
    CREATE: string;
    GET_ALL: string;
    GET_BY_ID: (id: string | number) => string;
    SEARCH: string;
  };
}

interface ApiConfig {
  BASE_URL: string | undefined;
  ENDPOINTS: ApiEndpoints;
  HEADERS: {
    CONTENT_TYPE: string;
    AUTHORIZATION: string;
    REFRESH_TOKEN: string;
  };
}

// Auth Configuration Types
interface AuthConfig {
  STORAGE_KEYS: {
    TOKEN: string;
    REFRESH_TOKEN: string;
    BUSINESS_DETAILS: string;
  };
  ROUTES: {
    LOGIN: string;
    DASHBOARD: string;
    PROFILE: string;
  };
}

// UI Configuration Types
interface MenuItem {
  text: string;
  icon: string;
  route: string;
  new?: boolean;
}

interface UiConfig {
  MENU_ITEMS: MenuItem[];
  COLORS: {
    PRIMARY: string;
    SECONDARY: string;
    SUCCESS: string;
    ERROR: string;
    WARNING: string;
    INFO: string;
    BACKGROUND: string;
    PAPER: string;
    TEXT_PRIMARY: string;
    TEXT_SECONDARY: string;
    PARROT_GREEN: string;
    ORANGE: string;
  };
  TYPOGRAPHY: {
    FONT_FAMILY: string;
    HEADING_FONT_WEIGHT: number;
    BODY_FONT_WEIGHT: number;
  };
  SPACING: {
    UNIT: number;
    SMALL: number;
    MEDIUM: number;
    LARGE: number;
    XLARGE: number;
  };
  BREAKPOINTS: {
    XS: number;
    SM: number;
    MD: number;
    LG: number;
    XL: number;
  };
}

// API Configuration
export const API_CONFIG: ApiConfig = {
  // Base URL for API requests
  BASE_URL: import.meta.env.VITE_API_URL,
  
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
      ADD: '/api/vendor/business/add',
      UPDATE: '/api/business/update',
      GET_ALL: '/api/business/all',
      GET_BY_ID: (id) => `/api/business/${id}`,
      ADD_SELF: '/api/self-business-details',
      ADD_CLIENT: '/api/client-details',
      // New endpoints for client and self business details
      GET_CLIENT_DETAILS: '/api/client/business/all',
      GET_SELF_DETAILS: '/api/vendor/business/all',
    },
    
    // Bank and Payment Accounts
    BANK: {
      ADD: '/api/bank/add',
      UPDATE: '/api/bank/update',
      GET_ALL: '/api/bank/all',
      GET_BY_ID: (id) => `/api/bank/${id}`,
      DELETE: (id) => `/api/bank/${id}`,
    },
    
    // Invoices
    INVOICE: {
      CREATE: '/api/invoices/create',
      GET_ALL: '/api/invoices',
      GET_BY_ID: (id) => `/api/invoices/get/${id}`,
      SEARCH: '/api/invoices/search',
      // Note: GET_STATS endpoint doesn't exist in the backend API
      // Using SEARCH endpoint with calculation instead
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
export const AUTH_CONFIG: AuthConfig = {
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
export const UI_CONFIG: UiConfig = {
  // Dashboard Menu Items
  MENU_ITEMS: [
    { text: 'Dashboard', icon: 'Business', route: '/dashboard' },
    { text: 'Invoices', icon: 'Receipt', route: '/invoices', new: true },
    { text: 'New Invoice', icon: 'Description', route: '/invoices/new-invoice', new: true },
    { text: 'Business Details', icon: 'Business', route: '/business-details' },
    { text: 'Client Details', icon: 'Store', route: '/client-details' },
    { text: 'Item Details', icon: 'ListAlt', route: '/item-details' },
    { text: 'Shipping Details', icon: 'Description', route: '/shipping-details' },
    { text: 'Payment Accounts', icon: 'MonetizationOn', route: '/payment-accounts', new: true },
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