
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  requestPasswordReset,
  updatePassword,
  resendVerificationEmail,
  updateUserProfile,
  updateUserEmail,
  onAuthStateChange,
  normalizeAuthUser,
  getAuthErrorMessage,
} from "../services/authService.js";

import {
  isSupabaseConfigured,
} from "../services/supabaseClient.js";

// ======================================================
// MAISON KIYORA
// THE ART OF SLOW PERFUMERY
//
// AUTHENTICATION CONTEXT
//
// React 19 + Supabase Authentication
//
// Features:
// - Authentication state
// - Session restoration
// - Login / Register / Logout
// - Password recovery
// - Email verification
// - Customer profile management
// - Supabase auth event synchronization
// - Loading and error handling
// ======================================================

// ======================================================
// 01. CONTEXT
// ======================================================

export const AuthContext = createContext(null);

// ======================================================
// 02. HELPERS
// ======================================================

function normalizeUserSafely(user) {
  if (!user) {
    return null;
  }

  return normalizeAuthUser(user);
}

function getErrorMessage(error) {
  try {
    return (
      getAuthErrorMessage(error) ||
      "Something went wrong. Please try again."
    );
  } catch {
    return (
      error?.message ||
      "Something went wrong. Please try again."
    );
  }
}

// ======================================================
// 03. AUTH PROVIDER
// ======================================================

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [session, setSession] = useState(null);

  const [isLoading, setIsLoading] = useState(
    Boolean(isSupabaseConfigured)
  );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState(null);

  const mountedRef = useRef(false);

  const operationRef = useRef(false);

  // ====================================================
  // 04. ERROR MANAGEMENT
  // ====================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const saveError = useCallback((err) => {
    const message = getErrorMessage(err);

    if (mountedRef.current) {
      setError(message);
    }

    return message;
  }, []);

  // ====================================================
  // 05. AUTH STATE INITIALIZATION
  // ====================================================

  useEffect(() => {
    mountedRef.current = true;

    let active = true;
    let unsubscribe = () => {};

    // Supabase credentials are unavailable.
    if (!isSupabaseConfigured) {
      setUser(null);
      setSession(null);
      setIsLoading(false);

      return () => {
        active = false;
        mountedRef.current = false;
      };
    }

    setIsLoading(true);

    // Track whether an auth event has supplied
    // a session. This prevents the initial
    // getCurrentUser request from overwriting
    // newer auth state.
    let authEventReceived = false;

    try {
      const subscription = onAuthStateChange(
        (_event, nextSession) => {
          if (!active) {
            return;
          }

          authEventReceived = true;

          setSession(nextSession ?? null);

          setUser(
            normalizeUserSafely(
              nextSession?.user ?? null
            )
          );

          setIsLoading(false);
        }
      );

      if (typeof subscription === "function") {
        unsubscribe = subscription;
      }
    } catch (err) {
      if (active) {
        saveError(err);
        setIsLoading(false);
      }
    }

    // Restore or validate the current user.
    // Supabase auth events remain the primary
    // source of session state.
    getCurrentUser()
      .then((currentUser) => {
        if (!active || authEventReceived) {
          return;
        }

        setUser(currentUser ?? null);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!active || authEventReceived) {
          return;
        }

        saveError(err);
        setIsLoading(false);
      });

    return () => {
      active = false;
      mountedRef.current = false;

      try {
        unsubscribe();
      } catch (err) {
        console.warn(
          "Maison Kiyora: Auth cleanup failed.",
          err
        );
      }
    };
  }, [saveError]);

  // ====================================================
  // 06. SAFE ASYNC ACTION RUNNER
  // ====================================================

  const runAction = useCallback(
    async (action) => {
      if (operationRef.current) {
        throw new Error(
          "An authentication request is already in progress."
        );
      }

      operationRef.current = true;

      if (mountedRef.current) {
        setIsSubmitting(true);
        setError(null);
      }

      try {
        return await action();
      } catch (err) {
        if (mountedRef.current) {
          saveError(err);
        }

        throw err;
      } finally {
        operationRef.current = false;

        if (mountedRef.current) {
          setIsSubmitting(false);
        }
      }
    },
    [saveError]
  );

  // ====================================================
  // 07. LOGIN
  // ====================================================

  const login = useCallback(
    async (credentials) => {
      return runAction(async () => {
        const result = await loginUser(
          credentials
        );

        if (mountedRef.current) {
          setUser(result?.user ?? null);
          setSession(result?.session ?? null);
        }

        return result;
      });
    },
    [runAction]
  );

  // ====================================================
  // 08. REGISTRATION
  // ====================================================

  const register = useCallback(
    async (details) => {
      return runAction(async () => {
        const result = await registerUser(
          details
        );

        // Registration may require email
        // verification before a session exists.
        if (
          mountedRef.current &&
          result?.session
        ) {
          setUser(result.user ?? null);
          setSession(result.session);
        }

        return result;
      });
    },
    [runAction]
  );

  // ====================================================
  // GOOGLE OAUTH
  // ====================================================

  const loginWithGoogle = useCallback(
    async ({ redirectTo = "/account" } = {}) => {
      return runAction(async () => {
        if (!isSupabaseConfigured) {
          throw new Error("Supabase authentication is not configured.");
        }

        // Supports the common export names without changing the existing
        // Supabase client module. Verify its export before deploying.
        const clientModule = await import("../services/supabaseClient.js");
        const client = clientModule.supabase ?? clientModule.supabaseClient;
        if (!client?.auth?.signInWithOAuth) {
          throw new Error("Google sign-in requires an exported Supabase client.");
        }

        const destination =
          typeof redirectTo === "string" &&
          redirectTo.startsWith("/") &&
          !redirectTo.startsWith("//") &&
          !redirectTo.includes("\\")
            ? redirectTo
            : "/account";

        // Supabase redirects back to this same origin after Google consent.
        // A callback route can later read the redirect query parameter.
        const callback = new URL("/", window.location.origin);
        callback.searchParams.set("redirect", destination);

        const { data, error: oauthError } = await client.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: callback.toString() },
        });
        if (oauthError) throw oauthError;
        return { success: true, redirecting: true, url: data?.url };
      });
    },
    [runAction]
  );

  // ====================================================
  // 09. LOGOUT
  // ====================================================

  const logout = useCallback(
    async (options = {}) => {
      return runAction(async () => {
        const result = await logoutUser(
          options
        );

        // Logging out other sessions should
        // not clear the current session.
        if (
          mountedRef.current &&
          options.scope !== "others"
        ) {
          setUser(null);
          setSession(null);
        }

        return result;
      });
    },
    [runAction]
  );

  // ====================================================
  // 10. FORGOT PASSWORD
  // ====================================================

  const forgotPassword = useCallback(
    async (details) => {
      return runAction(() =>
        requestPasswordReset(details)
      );
    },
    [runAction]
  );

  // ====================================================
  // 11. CHANGE PASSWORD
  // ====================================================

  const changePassword = useCallback(
    async (details) => {
      return runAction(() =>
        updatePassword(details)
      );
    },
    [runAction]
  );

  // ====================================================
  // 12. RESEND EMAIL VERIFICATION
  // ====================================================

  const resendVerification = useCallback(
    async (details) => {
      return runAction(() =>
        resendVerificationEmail(details)
      );
    },
    [runAction]
  );

  // ====================================================
  // 13. UPDATE CUSTOMER PROFILE
  // ====================================================

  const updateProfile = useCallback(
    async (details) => {
      return runAction(async () => {
        const result = await updateUserProfile(
          details
        );

        if (
          mountedRef.current &&
          result?.user
        ) {
          setUser(result.user);
        }

        return result;
      });
    },
    [runAction]
  );

  // ====================================================
  // 14. CHANGE EMAIL
  // ====================================================

  const changeEmail = useCallback(
    async (details) => {
      return runAction(async () => {
        const result = await updateUserEmail(
          details
        );

        // Supabase may require confirmation
        // before changing the email.
        // Do not update the displayed email
        // until the auth state confirms it.

        return result;
      });
    },
    [runAction]
  );

  // ====================================================
  // 15. REFRESH CURRENT USER
  // ====================================================

  const refreshUser = useCallback(
    async () => {
      try {
        const currentUser =
          await getCurrentUser();

        if (mountedRef.current) {
          setUser(currentUser ?? null);
        }

        return currentUser;
      } catch (err) {
        if (mountedRef.current) {
          saveError(err);
        }

        throw err;
      }
    },
    [saveError]
  );

  // ====================================================
  // 16. DERIVED AUTHENTICATION STATE
  // ====================================================

  const isAuthenticated = Boolean(user?.id);

  const isEmailVerified = Boolean(
    user?.emailVerified
  );

  // ====================================================
  // 17. CONTEXT VALUE
  // ====================================================

  const value = useMemo(
    () => ({
      // ----------------------------------------------
      // CUSTOMER
      // ----------------------------------------------

      user,
      currentUser: user,
      session,

      // ----------------------------------------------
      // AUTHENTICATION STATUS
      // ----------------------------------------------

      isAuthenticated,
      isEmailVerified,

      // ----------------------------------------------
      // LOADING STATE
      // ----------------------------------------------

      isLoading,
      loading: isLoading,
      isSubmitting,

      // ----------------------------------------------
      // ERRORS
      // ----------------------------------------------

      error,
      clearError,

      // ----------------------------------------------
      // CONFIGURATION
      // ----------------------------------------------

      isConfigured: isSupabaseConfigured,

      // ----------------------------------------------
      // AUTHENTICATION ACTIONS
      // ----------------------------------------------

      login,
      register,
      loginWithGoogle,
      signInWithGoogle: loginWithGoogle,
      logout,

      // ----------------------------------------------
      // PASSWORD MANAGEMENT
      // ----------------------------------------------

      forgotPassword,
      changePassword,
      resendVerification,

      // ----------------------------------------------
      // PROFILE MANAGEMENT
      // ----------------------------------------------

      updateProfile,
      changeEmail,
      refreshUser,
    }),
    [
      user,
      session,
      isAuthenticated,
      isEmailVerified,
      isLoading,
      isSubmitting,
      error,
      clearError,
      login,
      register,
      loginWithGoogle,
      logout,
      forgotPassword,
      changePassword,
      resendVerification,
      updateProfile,
      changeEmail,
      refreshUser,
    ]
  );

  // ====================================================
  // 18. PROVIDER OUTPUT
  // ====================================================

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ======================================================
// 19. CUSTOM AUTH HOOK
// ======================================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}

// ======================================================
// 20. DEFAULT EXPORT
// ======================================================

export default AuthProvider;
