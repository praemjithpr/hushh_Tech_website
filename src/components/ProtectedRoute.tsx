import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import config from '../resources/config/config';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const checkAuthAndOnboarding = async () => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let subscription: any = null;
    try {
      if (!config.supabaseClient) {
        console.error("Supabase client is not initialized");
        navigate("/login", { replace: true });
        return;
      }

      const supabase = config.supabaseClient;

      // 1. Session Check
      let { data: { session } } = await supabase.auth.getSession();

      // Wait for session logic (same as before)
      if (!session?.user) {
        await new Promise<void>((resolve) => {
          const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
            if (newSession?.user) { session = newSession; resolve(); }
          });
          subscription = data.subscription;
          timeout = setTimeout(() => resolve(), 1500);
        });
        if (timeout) clearTimeout(timeout);
        if (subscription) subscription.unsubscribe();

        if (!session?.user) {
          navigate("/login", { replace: true });
          return;
        }
      }

      const user = session?.user;
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      // 2. Onboarding Check
      const { data: onboardingData } = await supabase
        .from('onboarding_data')
        .select('is_completed, current_step')
        .eq('user_id', user.id)
        .maybeSingle();

      const isOnOnboardingPage = location.pathname.startsWith('/onboarding/');

      if (!onboardingData || !onboardingData.is_completed) {
        if (!isOnOnboardingPage) {
          navigate('/onboarding/financial-link', { replace: true });
          return;
        }
      }

      // 2FA/MFA check has been removed - users can proceed directly
      console.log('[ProtectedRoute] Authorization check passed (2FA disabled)');

      setIsAuthorized(true);
    } catch (error) {
      console.error("Error checking auth:", error);
      navigate("/login", { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // OAuth Guard: When Plaid OAuth is in progress, the SDK manipulates browser
    // history which triggers location changes. Skip auth re-check to prevent
    // interfering with the OAuth flow (which crashes the Plaid SDK iframe).
    const oauthTimestamp = localStorage.getItem('plaid_oauth_pending');
    if (oauthTimestamp && isAuthorized) {
      const flagAge = Date.now() - Number(oauthTimestamp);
      if (flagAge < 120_000) { // Within 2 minutes — OAuth is in progress
        console.log('[ProtectedRoute] OAuth in progress — skipping auth re-check');
        return;
      }
    }

    checkAuthAndOnboarding();
  }, [navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
