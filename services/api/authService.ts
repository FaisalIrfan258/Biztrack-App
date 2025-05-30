import { API_BASE_URL, ApiResponse, ENDPOINTS, getHeaders, handleApiError } from './config';

// User type definition
export type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

// Auth response type
export interface AuthResponse {
  success: boolean;
  user: User;
  userType: string;
  token: string;
}

/**
 * Login user with email and password
 */
export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw handleApiError({
        message: data.message || 'Login failed',
        status: response.status,
        data,
      });
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw handleApiError(error);
  }
};

/**
 * Send forgot password request
 */
export const forgotPassword = async (email: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.FORGOT_PASSWORD}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw handleApiError({
        message: data.message || 'Failed to process forgot password request',
        status: response.status,
        data,
      });
    }

    return data;
  } catch (error) {
    console.error('Forgot password error:', error);
    throw handleApiError(error);
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (token: string, password: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.RESET_PASSWORD(token)}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw handleApiError({
        message: data.message || 'Failed to reset password',
        status: response.status,
        data,
      });
    }

    return data;
  } catch (error) {
    console.error('Reset password error:', error);
    throw handleApiError(error);
  }
}; 