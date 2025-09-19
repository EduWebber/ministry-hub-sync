// Auth recovery utilities for handling authentication state recovery
import { supabase } from '@/integrations/supabase/client';

export interface AuthRecoveryOptions {
  redirectTo?: string;
  captchaToken?: string;
}

export const sendPasswordResetEmail = async (
  email: string, 
  options?: AuthRecoveryOptions
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: options?.redirectTo || `${window.location.origin}/reset-password`,
      captchaToken: options?.captchaToken
    });

    return { error };
  } catch (err) {
    console.error('Error sending password reset email:', err);
    return { error: err instanceof Error ? err : new Error('Unknown error occurred') };
  }
};

export const updatePassword = async (
  newPassword: string
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    return { error };
  } catch (err) {
    console.error('Error updating password:', err);
    return { error: err instanceof Error ? err : new Error('Unknown error occurred') };
  }
};

export const verifyOtp = async (
  email: string,
  token: string,
  type: 'signup' | 'recovery' | 'email_change' = 'recovery'
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type
    });

    return { error };
  } catch (err) {
    console.error('Error verifying OTP:', err);
    return { error: err instanceof Error ? err : new Error('Unknown error occurred') };
  }
};

export const resendConfirmation = async (
  email: string,
  options?: AuthRecoveryOptions
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: options?.redirectTo || `${window.location.origin}/confirm`,
        captchaToken: options?.captchaToken
      }
    });

    return { error };
  } catch (err) {
    console.error('Error resending confirmation:', err);
    return { error: err instanceof Error ? err : new Error('Unknown error occurred') };
  }
};

// Helper to check if user needs email confirmation
export const needsEmailConfirmation = (user: any): boolean => {
  return user && !user.email_confirmed_at;
};

// Helper to check if user is in recovery mode
export const isInRecoveryMode = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('type') && urlParams.get('type') === 'recovery';
};

// Helper to extract recovery tokens from URL
export const getRecoveryTokensFromUrl = (): { 
  access_token?: string; 
  refresh_token?: string; 
  type?: string; 
} => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    access_token: urlParams.get('access_token') || undefined,
    refresh_token: urlParams.get('refresh_token') || undefined,
    type: urlParams.get('type') || undefined
  };
};