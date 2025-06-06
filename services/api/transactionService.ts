import { API_BASE_URL, ApiResponse, ENDPOINTS, getHeaders, handleApiError, handleApiResponse } from './config';

// Edit history item
export interface EditHistoryItem {
  userId: string;
  timestamp: string;
  previousValues: any;
}

// Transaction item type
export interface Transaction {
  transactionId: string;
  amount: number;
  date: string;
  category: string;
  purpose: string;
  receipt?: string;
  paidBy: 'Ahmed' | 'Faisal' | 'Wasey' | 'Company' | 'Others';
  returned: boolean;
  returnedDate?: string;
  createdBy: string;
  editedBy?: string;
  editHistory?: EditHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

// Transaction payload for create/update operations
export type TransactionPayload = {
  amount: number;
  date?: string;
  category: string;
  purpose: string;
  paidBy: 'Ahmed' | 'Faisal' | 'Wasey' | 'Company' | 'Others';
  returned?: boolean;
  returnedDate?: string;
};

// Transactions response type
export interface TransactionsResponse extends ApiResponse {
  success: boolean;
  count: number;
  transactions: Transaction[];
}

// Single transaction response type
export interface TransactionResponse extends ApiResponse {
  success: boolean;
  transaction: Transaction;
}

// Transaction filter parameters
export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  paidBy?: 'Ahmed' | 'Faisal' | 'Wasey' | 'Company' | 'Others';
  category?: string;
  returned?: boolean;
}

/**
 * Get all transactions with optional filters
 */
export const getTransactions = async (
  token: string,
  filters?: TransactionFilters
): Promise<TransactionsResponse> => {
  try {
    // Build URL with query parameters
    let url = `${API_BASE_URL}${ENDPOINTS.TRANSACTIONS.LIST}`;
    
    if (filters) {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.paidBy) params.append('paidBy', filters.paidBy);
      if (filters.category) params.append('category', filters.category);
      if (filters.returned !== undefined) params.append('returned', String(filters.returned));
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(token),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Get transactions error:', error);
    throw handleApiError(error);
  }
};

/**
 * Get recent transactions (limited to a specific count)
 */
export const getRecentTransactions = async (
  token: string,
  limit: number = 5
): Promise<TransactionsResponse> => {
  try {
    // For now, we'll fetch all and limit on client side
    // In the future, the API might support a limit parameter
    const response = await getTransactions(token);
    
    if (response.success && response.transactions) {
      // Sort by date (newest first) and limit the results
      const sortedTransactions = [...response.transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      return {
        ...response,
        transactions: sortedTransactions.slice(0, limit)
      };
    }
    
    return response;
  } catch (error) {
    console.error('Get recent transactions error:', error);
    throw handleApiError(error);
  }
};

/**
 * Get a single transaction by ID
 */
export const getTransactionById = async (
  token: string,
  id: string
): Promise<TransactionResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.TRANSACTIONS.GET(id)}`, {
      method: 'GET',
      headers: getHeaders(token),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Get transaction by ID error:', error);
    throw handleApiError(error);
  }
};

/**
 * Create a new transaction
 * @param token Auth token
 * @param data Transaction data
 * @param receiptFiles Optional receipt files
 */
export const createTransaction = async (
  token: string,
  data: {
    amount: number;
    date?: string;
    category: string;
    purpose: string;
    paidBy: 'Ahmed' | 'Faisal' | 'Wasey' | 'Company' | 'Others';
  },
  receiptFiles?: any[] // Changed from File[] to any[] to handle React Native's image picker response
): Promise<TransactionResponse> => {
  try {
    const formData = new FormData();
    
    // Add transaction data
    formData.append('amount', String(data.amount));
    if (data.date) formData.append('date', data.date);
    formData.append('category', data.category);
    formData.append('purpose', data.purpose);
    formData.append('paidBy', data.paidBy);
    
    // Add receipt files if provided
    if (receiptFiles && receiptFiles.length > 0) {
      receiptFiles.forEach((file, index) => {
        // Handle React Native image picker response format
        const fileUri = file.uri || file;
        const fileName = file.fileName || `receipt_${Date.now()}_${index}.jpg`;
        const fileType = file.type || 'image/jpeg';
        
        // Create a new file object that React Native can handle
        const fileObject = {
          uri: fileUri,
          name: fileName,
          type: fileType,
        };
        
        // @ts-ignore - React Native specific FormData append
        formData.append('receipts', fileObject);
      });
    }
    
    // In React Native, we don't set Content-Type header when using FormData
    // The fetch API will automatically set it with the correct boundary
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    };
    
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.TRANSACTIONS.CREATE}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Create transaction error:', error);
    throw handleApiError(error);
  }
};

/**
 * Update an existing transaction
 */
export const updateTransaction = async (
  token: string,
  id: string,
  transaction: Partial<TransactionPayload>
): Promise<TransactionResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.TRANSACTIONS.UPDATE(id)}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(transaction),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Update transaction error:', error);
    throw handleApiError(error);
  }
};

/**
 * Delete a transaction
 */
export const deleteTransaction = async (token: string, id: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.TRANSACTIONS.DELETE(id)}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Delete transaction error:', error);
    throw handleApiError(error);
  }
}; 