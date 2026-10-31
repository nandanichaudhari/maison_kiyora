
/**
 * ======================================================
 * MAISON KIYORA
 * THE ART OF SLOW PERFUMERY
 *
 * CUSTOM AUTHENTICATION HOOK
 *
 * React 19 + Supabase Authentication
 *
 * Provides access to:
 * - Current customer
 * - Authentication status
 * - Login / Registration / Logout
 * - Password recovery
 * - Profile management
 * - Session loading state
 * ======================================================
 */

import {
  useAuth as useAuthContext,
} from "../context/AuthContext.jsx";

/**
 * Access the global authentication context.
 *
 * Must be used inside <AuthProvider>.
 *
 * Example:
 *
 * const {
 *   user,
 *   isAuthenticated,
 *   isLoading,
 *   login,
 *   logout,
 * } = useAuth();
 */

export function useAuth() {
  return useAuthContext();
}

export default useAuth;
