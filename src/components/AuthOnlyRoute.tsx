/**
 * AuthOnlyRoute — requires login only, NO onboarding check.
 * Use this for pages that need authentication but should NOT
 * redirect to financial-link or onboarding steps.
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../resources/config/config";

interface AuthOnlyRouteProps {
  children: React.ReactNode;
}

const AuthOnlyRoute: React.FC<AuthOnlyRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!config.supabaseClient) {
        navigate("/login", { replace: true });
        return;
      }

      const supabase = config.supabaseClient;
      let { data: { session } } = await supabase.auth.getSession();

      // Brief wait for auth state if not immediately available
      if (!session?.user) {
        await new Promise<void>((resolve) => {
          const { data } = supabase.auth.onAuthStateChange((_, s) => {
            if (s?.user) { session = s; resolve(); }
          });
          const sub = data.subscription;
          const t = setTimeout(() => resolve(), 1500);
          return () => { clearTimeout(t); sub.unsubscribe(); };
        });
      }

      if (!session?.user) {
        navigate("/login", { replace: true });
        return;
      }

      // Authorized — no onboarding check needed
      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return <>{children}</>;
};

export default AuthOnlyRoute;
