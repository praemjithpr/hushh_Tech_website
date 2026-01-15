/**
 * React Hook for Phone Authentication in Hushh Agent
 * Manages authentication state and provides auth methods
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { RecaptchaVerifier } from 'firebase/auth';
import {
  initializeRecaptcha,
  sendOTP,
  verifyOTP,
  signOutUser,
  subscribeToAuthChanges,
  isFirebaseConfigured,
  type PhoneAuthUser,
} from '../services/phoneAuth';

export type AuthStep = 'phone' | 'otp' | 'authenticated';

interface UsePhoneAuthReturn {
  // State
  user: PhoneAuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  step: AuthStep;
  isConfigured: boolean;
  
  // Actions
  requestOTP: (phoneNumber: string) => Promise<boolean>;
  confirmOTP: (otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  resetToPhoneStep: () => void;
}

export const usePhoneAuth = (): UsePhoneAuthReturn => {
  const [user, setUser] = useState<PhoneAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<AuthStep>('phone');
  
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);

  const isConfigured = isFirebaseConfigured();

  // Subscribe to auth state changes
  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = subscribeToAuthChanges((authUser) => {
      setUser(authUser);
      setStep(authUser ? 'authenticated' : 'phone');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isConfigured]);

  // Initialize reCAPTCHA container
  useEffect(() => {
    if (!isConfigured) return;

    // Create hidden container for reCAPTCHA
    if (!recaptchaContainerRef.current) {
      const container = document.createElement('div');
      container.id = 'recaptcha-container';
      container.style.display = 'none';
      document.body.appendChild(container);
      recaptchaContainerRef.current = container;
    }

    return () => {
      if (recaptchaContainerRef.current) {
        recaptchaContainerRef.current.remove();
        recaptchaContainerRef.current = null;
      }
    };
  }, [isConfigured]);

  // Request OTP
  const requestOTP = useCallback(async (phoneNumber: string): Promise<boolean> => {
    if (!isConfigured) {
      setError('Phone authentication is not configured');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Initialize reCAPTCHA if not already done
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = initializeRecaptcha('recaptcha-container');
      }

      if (!recaptchaVerifierRef.current) {
        setError('Failed to initialize verification. Please refresh the page.');
        setIsLoading(false);
        return false;
      }

      const result = await sendOTP(phoneNumber, recaptchaVerifierRef.current);

      if (result.success) {
        setStep('otp');
        setIsLoading(false);
        return true;
      } else {
        setError(result.error || 'Failed to send OTP');
        // Reset reCAPTCHA on error
        recaptchaVerifierRef.current = null;
        setIsLoading(false);
        return false;
      }
    } catch (err: any) {
      console.error('[usePhoneAuth] requestOTP error:', err);
      setError(err.message || 'An unexpected error occurred');
      recaptchaVerifierRef.current = null;
      setIsLoading(false);
      return false;
    }
  }, [isConfigured]);

  // Confirm OTP
  const confirmOTP = useCallback(async (otp: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await verifyOTP(otp);

      if (result.success && result.user) {
        setUser(result.user);
        setStep('authenticated');
        setIsLoading(false);
        return true;
      } else {
        setError(result.error || 'Failed to verify OTP');
        setIsLoading(false);
        return false;
      }
    } catch (err: any) {
      console.error('[usePhoneAuth] confirmOTP error:', err);
      setError(err.message || 'An unexpected error occurred');
      setIsLoading(false);
      return false;
    }
  }, []);

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await signOutUser();
      setUser(null);
      setStep('phone');
      recaptchaVerifierRef.current = null;
    } catch (err: any) {
      console.error('[usePhoneAuth] logout error:', err);
      setError(err.message || 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset to phone step
  const resetToPhoneStep = useCallback(() => {
    setStep('phone');
    setError(null);
    recaptchaVerifierRef.current = null;
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    step,
    isConfigured,
    requestOTP,
    confirmOTP,
    logout,
    clearError,
    resetToPhoneStep,
  };
};

export default usePhoneAuth;
