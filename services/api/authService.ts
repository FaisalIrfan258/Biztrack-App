import { API_BASE_URL, ApiResponse, ENDPOINTS, getHeaders, handleApiError, handleApiResponse } from './config';

// User type definition
export type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  password?: string; // Only included in profile response
};

// Auth response type
export interface AuthResponse {
  success: boolean;
  user: User;
  userType: string;
  token: string;
}

// User profile response type
export interface UserProfileResponse {
  success: boolean;
  user: User;
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

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Login error:', error);
    throw handleApiError(error);
  }
};

/**
 * Logout user
 */
export const logoutUser = async (token: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.LOGOUT}`, {
      method: 'POST',
      headers: getHeaders(token),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Logout error:', error);
    throw handleApiError(error);
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (token: string): Promise<UserProfileResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.PROFILE}`, {
      method: 'GET',
      headers: getHeaders(token),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Get profile error:', error);
    throw handleApiError(error);
  }
};

/**
 * Change user password
 */
export const changePassword = async (
  token: string, 
  currentPassword: string, 
  newPassword: string
): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.CHANGE_PASSWORD}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Change password error:', error);
    throw handleApiError(error);
  }
};

/**
 * Send forgot password request
 */
export const forgotPassword = async (email: string): Promise<ApiResponse> => {
  try {
    // Web-only approach - the backend will handle creating the reset URL
    
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.FORGOT_PASSWORD}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });

    return await handleApiResponse(response);
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

    return await handleApiResponse(response);
  } catch (error) {
    console.error('Reset password error:', error);
    throw handleApiError(error);
  }
}; 