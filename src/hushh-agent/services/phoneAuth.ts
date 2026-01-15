/**
 * Phone Authentication Service for Hushh Agent
 * Uses Firebase/GCP Identity Platform for Phone OTP verification
 * Syncs Firebase UID to Supabase for user data storage
 */

import { 
  firebaseAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  signOut,
  onAuthStateChanged,
  isFirebaseConfigured,
  type ConfirmationResult,
  type User
} from '../config/firebase';
import config from '../../resources/config/config';

// Types
export interface PhoneAuthUser {
  uid: string;
  phoneNumber: string | null;
  displayName: string | null;
}

export interface PhoneAuthResult {
  success: boolean;
  user?: PhoneAuthUser;
  error?: string;
}

// Store the confirmation result for OTP verification
let confirmationResult: ConfirmationResult | null = null;

/**
 * Initialize invisible reCAPTCHA verifier
 * Required by Firebase for phone authentication to prevent abuse
 */
export const initializeRecaptcha = (containerId: string): RecaptchaVerifier | null => {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase not configured. Phone auth will not work.');
    return null;
  }

  try {
    const verifier = new RecaptchaVerifier(firebaseAuth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('[PhoneAuth] reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('[PhoneAuth] reCAPTCHA expired');
      }
    });
    
    return verifier;
  } catch (error) {
    console.error('[PhoneAuth] Failed to initialize reCAPTCHA:', error);
    return null;
  }
};

/**
 * Send OTP to phone number
 * @param phoneNumber - Full phone number with country code (e.g., +919876543210)
 * @param recaptchaVerifier - RecaptchaVerifier instance
 */
export const sendOTP = async (
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<{ success: boolean; error?: string }> => {
  if (!isFirebaseConfigured()) {
    return { success: false, error: 'Firebase not configured' };
  }

  try {
    // Validate phone number format
    if (!phoneNumber.startsWith('+')) {
      return { success: false, error: 'Phone number must include country code (e.g., +91)' };
    }

    console.log('[PhoneAuth] Sending OTP to:', phoneNumber);
    
    confirmationResult = await signInWithPhoneNumber(
      firebaseAuth,
      phoneNumber,
      recaptchaVerifier
    );

    console.log('[PhoneAuth] OTP sent successfully');
    return { success: true };
  } catch (error: any) {
    console.error('[PhoneAuth] Failed to send OTP:', error);
    
    // Handle specific Firebase errors
    let errorMessage = 'Failed to send OTP';
    if (error.code === 'auth/invalid-phone-number') {
      errorMessage = 'Invalid phone number format';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many attempts. Please try again later.';
    } else if (error.code === 'auth/quota-exceeded') {
      errorMessage = 'SMS quota exceeded. Please try again later.';
    }
    
    return { success: false, error: errorMessage };
  }
};

/**
 * Verify OTP entered by user
 * @param otp - 6-digit OTP code
 */
export const verifyOTP = async (otp: string): Promise<PhoneAuthResult> => {
  if (!confirmationResult) {
    return { success: false, error: 'No OTP request found. Please request a new OTP.' };
  }

  try {
    console.log('[PhoneAuth] Verifying OTP');
    
    const userCredential = await confirmationResult.confirm(otp);
    const user = userCredential.user;

    console.log('[PhoneAuth] OTP verified successfully. Firebase UID:', user.uid);

    // Sync user to Supabase
    await syncUserToSupabase(user);

    return {
      success: true,
      user: {
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName
      }
    };
  } catch (error: any) {
    console.error('[PhoneAuth] OTP verification failed:', error);
    
    let errorMessage = 'Invalid OTP';
    if (error.code === 'auth/invalid-verification-code') {
      errorMessage = 'Incorrect OTP. Please try again.';
    } else if (error.code === 'auth/code-expired') {
      errorMessage = 'OTP expired. Please request a new one.';
    }
    
    return { success: false, error: errorMessage };
  }
};

/**
 * Sync Firebase user to Supabase hushh_agent_users table
 */
const syncUserToSupabase = async (user: User): Promise<void> => {
  if (!config.supabaseClient) {
    console.warn('[PhoneAuth] Supabase client not available');
    return;
  }

  try {
    const { error } = await config.supabaseClient
      .from('hushh_agent_users')
      .upsert({
        firebase_uid: user.uid,
        phone_number: user.phoneNumber,
        display_name: user.displayName,
        last_login_at: new Date().toISOString()
      }, {
        onConflict: 'firebase_uid'
      });

    if (error) {
      console.error('[PhoneAuth] Failed to sync user to Supabase:', error);
    } else {
      console.log('[PhoneAuth] User synced to Supabase successfully');
    }
  } catch (error) {
    console.error('[PhoneAuth] Error syncing to Supabase:', error);
  }
};

/**
 * Sign out user
 */
export const signOutUser = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    await signOut(firebaseAuth);
    confirmationResult = null;
    console.log('[PhoneAuth] User signed out');
    return { success: true };
  } catch (error: any) {
    console.error('[PhoneAuth] Sign out failed:', error);
    return { success: false, error: 'Failed to sign out' };
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): PhoneAuthUser | null => {
  const user = firebaseAuth.currentUser;
  if (!user) return null;

  return {
    uid: user.uid,
    phoneNumber: user.phoneNumber,
    displayName: user.displayName
  };
};

/**
 * Subscribe to auth state changes
 */
export const subscribeToAuthChanges = (
  callback: (user: PhoneAuthUser | null) => void
): (() => void) => {
  return onAuthStateChanged(firebaseAuth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName
      });
    } else {
      callback(null);
    }
  });
};

/**
 * Get user data from Supabase
 */
export const getUserFromSupabase = async (firebaseUid: string) => {
  if (!config.supabaseClient) {
    console.warn('[PhoneAuth] Supabase client not available');
    return null;
  }

  try {
    const { data, error } = await config.supabaseClient
      .from('hushh_agent_users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (error) {
      console.error('[PhoneAuth] Failed to get user from Supabase:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[PhoneAuth] Error getting user from Supabase:', error);
    return null;
  }
};

// Re-export for convenience
export { isFirebaseConfigured };
