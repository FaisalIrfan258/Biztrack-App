import { API_BASE_URL, ApiResponse, ENDPOINTS, getHeaders, handleApiError, handleApiResponse } from './config';

// Balance response type
export interface BalanceResponse extends ApiResponse {
  success: boolean;
  balance: number;
  lastUpdated: string;
}

// Balance history item type
export interface BalanceHistoryItem {
  userId: string;
  timestamp: string;
  previousBalance: number;
  newBalance: number;
  reason: string;
  transactionId: string;
}

// Balance history response type
export interface BalanceHistoryResponse {
  success: boolean;
  count: number;
  history: BalanceHistoryItem[];
}

/**
 * Get current balance
 */
export const getBalance = async (token: string): Promise<BalanceResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.BALANCE.GET}`, {
      method: 'GET',
      headers: getHeaders(token),
    });

    const data = await handleApiResponse(response);
    
    // The API response already matches our type
    return data;
  } catch (error) {
    console.error('Get balance error:', error);
    throw handleApiError(error);
  }
};

/**
 * Set balance to a specific amount (SuperAdmin only)
 * Used for correcting/fixing the balance
 */
export const setBalance = async (token: string, amount: number, reason: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.BALANCE.SET}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({ amount, reason }),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Set balance error:', error);
    throw handleApiError(error);
  }
};

/**
 * Adjust balance (add or subtract) (SuperAdmin only)
 * @param token - Auth token
 * @param amount - Amount to add (positive) or subtract (negative)
 * @param reason - Reason for adjustment
 */
export const adjustBalance = async (token: string, amount: number, reason: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.BALANCE.ADJUST}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ amount, reason }),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Adjust balance error:', error);
    throw handleApiError(error);
  }
};

/**
 * Get balance history
 */
export const getBalanceHistory = async (
  token: string, 
  startDate?: string, 
  endDate?: string
): Promise<BalanceHistoryResponse> => {
  try {
    let url = `${API_BASE_URL}${ENDPOINTS.BALANCE.HISTORY}`;
    
    // Add query parameters if provided
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(token),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Get balance history error:', error);
    throw handleApiError(error);
  }
}; 