/**
 * API configuration and common utilities
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

// Base URL for API calls
export const API_BASE_URL = 'https://biztrackbackend.onrender.com'	;

// API endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile',
    CHANGE_PASSWORD: '/api/auth/change-password',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: (token: string) => `/api/auth/reset-password/${token}`,
  },
  // Add more endpoints as needed
  TRANSACTIONS: {
    LIST: '/api/transactions',
    CREATE: '/api/transactions',
    UPDATE: (id: string) => `/api/transactions/${id}`,
    DELETE: (id: string) => `/api/transactions/${id}`,
  },
  BALANCE: {
    GET: '/api/balance',
    SET: '/api/balance',           // PUT - Set balance to specific amount
    ADJUST: '/api/balance/adjust', // POST - Add/subtract from balance
    HISTORY: '/api/balance/history',
  },
  ACTION_LOGS: {
    LIST: '/api/action-log',
  },
};

// Common headers
export const getHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// API error handling
export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Helper function to handle API errors
export const handleApiError = (error: any): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }
  
  // Check for unauthorized error (token expired)
  if (error.status === 401) {
    // Clear auth data and redirect to login
    handleTokenExpiration();
  }
  
  return new ApiError(
    error.message || 'An unexpected error occurred',
    error.status || 500
  );
};

// Handle API response
export const handleApiResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Check for unauthorized error (token expired)
    if (response.status === 401) {
      // Clear auth data and redirect to login
      handleTokenExpiration();
    }
    
    throw new ApiError(
      data.message || 'API request failed',
      response.status,
      data
    );
  }
  
  return data;
};

// Handle token expiration
export const handleTokenExpiration = async () => {
  console.log('Token expired or invalid, redirecting to login');
  
  try {
    // Clear stored auth data
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    
    // Redirect to login page
    router.replace('/(auth)' as any);
  } catch (err) {
    console.error('Error handling token expiration:', err);
  }
}; 