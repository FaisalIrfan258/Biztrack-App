import { API_BASE_URL, ApiResponse, ENDPOINTS, getHeaders, handleApiError } from './config';

// Transaction type definition
export type Transaction = {
  _id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

// Transaction create/update payload
export type TransactionPayload = Omit<Transaction, '_id' | 'createdAt' | 'updatedAt'>;

/**
 * Get all transactions
 */
export const getTransactions = async (token: string): Promise<Transaction[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.TRANSACTIONS.LIST}`, {
      method: 'GET',
      headers: getHeaders(token),
    });

    const data = await response.json();

    if (!response.ok) {
      throw handleApiError({
        message: data.message || 'Failed to fetch transactions',
        status: response.status,
        data,
      });
    }

    return data.data;
  } catch (error) {
    console.error('Get transactions error:', error);
    throw handleApiError(error);
  }
};

/**
 * Create a new transaction
 */
export const createTransaction = async (
  token: string,
  transaction: TransactionPayload
): Promise<Transaction> => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.TRANSACTIONS.CREATE}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(transaction),
    });

    const data = await response.json();

    if (!response.ok) {
      throw handleApiError({
        message: data.message || 'Failed to create transaction',
        status: response.status,
        data,
      });
    }

    return data.data;
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
): Promise<Transaction> => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.TRANSACTIONS.UPDATE(id)}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(transaction),
    });

    const data = await response.json();

    if (!response.ok) {
      throw handleApiError({
        message: data.message || 'Failed to update transaction',
        status: response.status,
        data,
      });
    }

    return data.data;
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

    const data = await response.json();

    if (!response.ok) {
      throw handleApiError({
        message: data.message || 'Failed to delete transaction',
        status: response.status,
        data,
      });
    }

    return data;
  } catch (error) {
    console.error('Delete transaction error:', error);
    throw handleApiError(error);
  }
}; 