import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to periodically validate the authentication token
 * @param intervalMinutes How often to check token validity (in minutes)
 */
export const useTokenValidator = (intervalMinutes: number = 5) => {
  const { validateToken, token } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Only set up validation if we have a token
    if (token) {
      // Convert minutes to milliseconds
      const intervalMs = intervalMinutes * 60 * 1000;
      
      // Set up periodic token validation
      intervalRef.current = setInterval(async () => {
        console.log('Validating token...');
        await validateToken();
      }, intervalMs);
    }
    
    // Clean up interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [token, validateToken, intervalMinutes]);
};

/**
 * Component to wrap authenticated routes and validate token
 */
export const TokenValidator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Validate token every 5 minutes
  useTokenValidator(5);
  
  // Simply render the children
  return <React.Fragment>{children}</React.Fragment>;
}; 