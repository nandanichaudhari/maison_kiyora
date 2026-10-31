
/**
 * ======================================================
 * MAISON KIYORA
 * THE ART OF SLOW PERFUMERY
 *
 * SUPABASE CLIENT CONFIGURATION
 *
 * React 19 + Vite 6
 *
 * Features:
 * - Centralized Supabase client
 * - Environment validation
 * - Persistent authentication sessions
 * - Automatic token refresh
 * - PKCE authentication flow
 * - Current user and session helpers
 * - Auth state subscriptions
 * - Access token retrieval
 *
 * Security:
 * - Publishable / anon key only
 * - Never expose service_role or secret keys
 * - Enforce Row Level Security (RLS)
 * - Validate authorization on the backend
 * ======================================================
 */

import {
  createClient,
} from "@supabase/supabase-js";

// ======================================================
// 01. ENVIRONMENT VARIABLES
// ======================================================

const SUPABASE_URL = String(
  import.meta.env.VITE_SUPABASE_URL || ""
).trim();

const SUPABASE_PUBLISHABLE_KEY = String(
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ""
).trim();

// ======================================================
// 02. URL VALIDATION
// ======================================================

function validateSupabaseUrl(value) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);

    const isHttps =
      url.protocol === "https:";

    const hasHostname =
      Boolean(url.hostname);

    const hasNoCredentials =
      !url.username && !url.password;

    return (
      isHttps &&
      hasHostname &&
      hasNoCredentials
    );
  } catch {
    return false;
  }
}

// ======================================================
// 03. CONFIGURATION STATUS
// ======================================================

const hasSupabaseUrl =
  Boolean(SUPABASE_URL);

const hasSupabaseKey =
  Boolean(SUPABASE_PUBLISHABLE_KEY);

const hasValidSupabaseUrl =
  validateSupabaseUrl(SUPABASE_URL);

export const isSupabaseConfigured =
  hasSupabaseUrl &&
  hasSupabaseKey &&
  hasValidSupabaseUrl;

// ======================================================
// 04. DEVELOPMENT WARNINGS
// ======================================================

if (import.meta.env.DEV) {
  if (
    hasSupabaseUrl &&
    !hasValidSupabaseUrl
  ) {
    console.warn(
      "[Maison Kiyora] Invalid Supabase URL. Use a valid HTTPS project URL."
    );
  }

  if (!hasSupabaseUrl || !hasSupabaseKey) {
    console.warn(
      "[Maison Kiyora] Supabase environment variables are missing."
    );
  }

  if (
    hasSupabaseUrl &&
    hasSupabaseKey &&
    hasValidSupabaseUrl
  ) {
    console.info(
      "[Maison Kiyora] Supabase configuration detected."
    );
  }
}

// ======================================================
// 05. CREATE SUPABASE CLIENT
// ======================================================

/**
 * Supabase client remains null when
 * configuration is missing or invalid.
 *
 * This allows the public storefront to
 * render during initial development.
 */

export const supabase =
  isSupabaseConfigured
    ? createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
          auth: {
            autoRefreshToken: true,

            persistSession: true,

            detectSessionInUrl: true,

            flowType: "pkce",

            storageKey:
              "maison-kiyora-auth",
          },

          global: {
            headers: {
              "X-Client-Info":
                "maison-kiyora-storefront",
            },
          },
        }
      )
    : null;

// ======================================================
// 06. REQUIRE CONFIGURED CLIENT
// ======================================================

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  return supabase;
}

// ======================================================
// 07. GET CURRENT SESSION
// ======================================================

export async function getCurrentSession() {
  const client = getSupabaseClient();

  const {
    data,
    error,
  } = await client.auth.getSession();

  if (error) {
    throw error;
  }

  return data?.session ?? null;
}

// ======================================================
// 08. GET CURRENT USER
// ======================================================

/**
 * getUser() checks the user with
 * Supabase Auth.
 *
 * Do not use browser-stored user data
 * as proof of authorization.
 */

export async function getCurrentUser() {
  const client = getSupabaseClient();

  const {
    data,
    error,
  } = await client.auth.getUser();

  if (error) {
    throw error;
  }

  return data?.user ?? null;
}

// ======================================================
// 09. GET ACCESS TOKEN
// ======================================================

/**
 * Returns the current session's
 * access token when available.
 *
 * Protected backend endpoints must
 * validate the JWT independently.
 */

export async function getAccessToken() {
  const session = await getCurrentSession();

  return session?.access_token ?? null;
}

// ======================================================
// 10. SIGN OUT USER
// ======================================================

export async function signOutUser() {
  const client = getSupabaseClient();

  const {
    error,
  } = await client.auth.signOut();

  if (error) {
    throw error;
  }

  return true;
}

// ======================================================
// 11. AUTH STATE SUBSCRIPTION
// ======================================================

/**
 * Usage:
 *
 * const unsubscribe =
 *   subscribeToAuthChanges(
 *     (event, session) => {
 *       // Update authentication state
 *     }
 *   );
 *
 * return unsubscribe;
 *
 * Avoid awaiting other Supabase Auth
 * methods inside this callback.
 */

export function subscribeToAuthChanges(
  callback
) {
  const client = getSupabaseClient();

  if (typeof callback !== "function") {
    throw new TypeError(
      "Auth callback must be a function."
    );
  }

  const {
    data,
  } = client.auth.onAuthStateChange(
    (event, session) => {
      callback(event, session);
    }
  );

  const subscription =
    data?.subscription;

  return () => {
    subscription?.unsubscribe();
  };
}

// ======================================================
// 12. CONNECTION STATUS
// ======================================================

export function getSupabaseStatus() {
  const configured = Boolean(supabase);

  return {
    configured,
    authEnabled: configured,
    databaseClientReady: configured,
  };
}

// ======================================================
// 13. DEFAULT EXPORT
// ======================================================

export default supabase;
