import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthResponse, User, forgotPassword as apiForgotPassword, loginUser as apiLoginUser, resetPassword as apiResetPassword, getUserProfile } from '../services/api/authService';

// Define the shape of our auth context
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, password: string) => Promise<any>;
  validateToken: () => Promise<boolean>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  login: async () => ({ success: false, user: {} as User, userType: '', token: '' }),
  logout: () => {},
  forgotPassword: async () => ({}),
  resetPassword: async () => ({}),
  validateToken: async () => false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Validate token by making a request to get user profile
  const validateToken = async (): Promise<boolean> => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      
      if (!storedToken) {
        return false;
      }
      
      // Make API call to validate token
      const response = await getUserProfile(storedToken);
      
      if (response.success) {
        // Update user data with the latest from server
        setUser(response.user);
        setToken(storedToken);
        await AsyncStorage.setItem('userData', JSON.stringify(response.user));
        return true;
      } else {
        // Token is invalid, clear stored data
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        setToken(null);
        setUser(null);
        return false;
      }
    } catch (err) {
      console.error('Token validation error:', err);
      // Token is invalid or expired, clear stored data
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setToken(null);
      setUser(null);
      return false;
    }
  };

  // Check for stored token on app start
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUser = await AsyncStorage.getItem('userData');
        
        if (storedToken && storedUser) {
          // Set initial data from storage
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Validate token in background
          validateToken().then(isValid => {
            if (isValid) {
              // Token is valid, navigate to the main app screens
              router.replace('/(tabs)' as any);
            } else {
              // Token is invalid, navigate to auth screens
              router.replace('/(auth)' as any);
            }
          });
        } else {
          // No stored token, navigate to auth screens
          router.replace('/(auth)' as any);
        }
      } catch (e) {
        console.error('Failed to load auth data', e);
        // On error, navigate to auth screens
        router.replace('/(auth)' as any);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiLoginUser(email, password);
      
      if (response.success && response.token) {
        // Store the token and user data
        await AsyncStorage.setItem('userToken', response.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.user));
        
        // Update state
        setToken(response.token);
        setUser(response.user);
        
        // Navigate to the main app
        router.replace('/(tabs)' as any);
      }
      
      return response;
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Clear stored data
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      // Update state
      setToken(null);
      setUser(null);
      
      // Navigate to auth screens
      router.replace('/(auth)' as any);
    } catch (err: any) {
      setError(err.message || 'An error occurred during logout');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiForgotPassword(email);
      return response;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (token: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiResetPassword(token, password);
      return response;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Create the value object that will be provided to consumers
  const value = {
    user,
    token,
    isLoading,
    error,
    login,
    logout,
    forgotPassword,
    resetPassword,
    validateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 