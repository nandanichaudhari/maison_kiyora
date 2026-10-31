
/**
 * ======================================================
 * MAISON KIYORA
 * THE ART OF SLOW PERFUMERY
 *
 * CUSTOMER AUTHENTICATION SERVICE
 *
 * React 19 + Vite 6 + Supabase Auth
 *
 * Features:
 * - Registration and login
 * - Logout and session management
 * - Password recovery
 * - Email verification
 * - Customer profile updates
 * - Email change requests
 * - Authentication subscriptions
 * - Consistent error handling
 * ======================================================
 */

import {
  getSupabaseClient,
  getCurrentUser as getSupabaseUser,
  getCurrentSession as getSupabaseSession,
  getAccessToken as getSupabaseAccessToken,
  subscribeToAuthChanges,
} from "./supabaseClient.js";

// ======================================================
// 01. CONFIGURATION
// ======================================================

export const AUTH_ERROR_CODES = Object.freeze({
  NOT_CONFIGURED: "AUTH_NOT_CONFIGURED",
  INVALID_EMAIL: "INVALID_EMAIL",
  INVALID_PASSWORD: "INVALID_PASSWORD",
  PASSWORD_MISMATCH: "PASSWORD_MISMATCH",
  INVALID_NAME: "INVALID_NAME",
  NOT_AUTHENTICATED: "NOT_AUTHENTICATED",
  INVALID_REDIRECT: "INVALID_REDIRECT",
  UNKNOWN: "AUTH_ERROR",
});

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ======================================================
// 02. CUSTOM ERROR
// ======================================================

export class AuthServiceError extends Error {
  constructor(
    message,
    code = AUTH_ERROR_CODES.UNKNOWN,
    originalError = null
  ) {
    super(message);

    this.name = "AuthServiceError";
    this.code = code;
    this.originalError = originalError;
  }
}

// ======================================================
// 03. NORMALIZATION HELPERS
// ======================================================

function normalizeEmail(value) {
  return typeof value === "string"
    ? value.trim().toLowerCase()
    : "";
}

function normalizeName(value) {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ")
    : "";
}

export function isValidEmail(email) {
  return EMAIL_PATTERN.test(
    normalizeEmail(email)
  );
}

export function validatePassword(password) {
  const errors = [];

  if (typeof password !== "string") {
    errors.push("Password is required.");

    return {
      valid: false,
      errors,
    };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(
      `Password must contain at least ${MIN_PASSWORD_LENGTH} characters.`
    );
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    errors.push(
      `Password must not exceed ${MAX_PASSWORD_LENGTH} characters.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function requireValidEmail(email) {
  const normalized = normalizeEmail(email);

  if (!isValidEmail(normalized)) {
    throw new AuthServiceError(
      "Please enter a valid email address.",
      AUTH_ERROR_CODES.INVALID_EMAIL
    );
  }

  return normalized;
}

function requireValidPassword(password) {
  const validation = validatePassword(password);

  if (!validation.valid) {
    throw new AuthServiceError(
      validation.errors[0],
      AUTH_ERROR_CODES.INVALID_PASSWORD
    );
  }

  return password;
}

// ======================================================
// 04. SUPABASE CLIENT
// ======================================================

function requireClient() {
  try {
    const client = getSupabaseClient();

    if (!client?.auth) {
      throw new Error(
        "Supabase authentication is unavailable."
      );
    }

    return client;
  } catch (error) {
    throw new AuthServiceError(
      "Authentication is not configured. Please check your Supabase settings.",
      AUTH_ERROR_CODES.NOT_CONFIGURED,
      error
    );
  }
}

// ======================================================
// 05. ERROR HANDLING
// ======================================================

function handleAuthError(error) {
  if (error instanceof AuthServiceError) {
    return error;
  }

  const message =
    typeof error?.message === "string"
      ? error.message
      : "Authentication request failed.";

  return new AuthServiceError(
    message,
    error?.code || AUTH_ERROR_CODES.UNKNOWN,
    error
  );
}

export function getAuthErrorMessage(error) {
  if (error instanceof AuthServiceError) {
    return error.message;
  }

  return (
    error?.message ||
    "Something went wrong. Please try again."
  );
}

// ======================================================
// 06. SAFE REDIRECT URL
// ======================================================

function getSafeRedirectUrl(path = "/") {
  if (typeof window === "undefined") {
    return undefined;
  }

  if (
    typeof path !== "string" ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\")
  ) {
    throw new AuthServiceError(
      "Invalid authentication redirect URL.",
      AUTH_ERROR_CODES.INVALID_REDIRECT
    );
  }

  try {
    const url = new URL(
      path,
      window.location.origin
    );

    if (url.origin !== window.location.origin) {
      throw new Error(
        "Cross-origin redirect is not allowed."
      );
    }

    return url.toString();
  } catch {
    throw new AuthServiceError(
      "Invalid authentication redirect URL.",
      AUTH_ERROR_CODES.INVALID_REDIRECT
    );
  }
}

// ======================================================
// 07. NORMALIZE AUTH USER
// ======================================================

export function normalizeAuthUser(user) {
  if (!user || typeof user !== "object") {
    return null;
  }

  // Already-normalized user objects can be
  // returned by AuthContext or service functions.
  if (
    user.user_metadata === undefined &&
    user.emailVerified !== undefined
  ) {
    return {
      ...user,
      id: user.id ?? null,
    };
  }

  const metadata = user.user_metadata || {};

  const firstName = normalizeName(
    metadata.first_name ||
    metadata.firstName ||
    ""
  );

  const lastName = normalizeName(
    metadata.last_name ||
    metadata.lastName ||
    ""
  );

  const fullName = normalizeName(
    metadata.full_name ||
    metadata.fullName ||
    [firstName, lastName].filter(Boolean).join(" ")
  );

  return {
    id: user.id ?? null,
    email: user.email || null,
    phone: user.phone || null,

    firstName,
    lastName,
    fullName,

    avatarUrl:
      metadata.avatar_url ||
      metadata.picture ||
      null,

    emailVerified: Boolean(
      user.email_confirmed_at
    ),

    createdAt: user.created_at || null,
    updatedAt: user.updated_at || null,
  };
}

// ======================================================
// 08. REGISTER CUSTOMER
// ======================================================

export async function registerUser({
  firstName,
  lastName,
  fullName,
  email,
  password,
  confirmPassword,
  redirectPath = "/account",
} = {}) {
  const client = requireClient();

  const validEmail = requireValidEmail(email);
  const validPassword = requireValidPassword(password);

  if (
    confirmPassword !== undefined &&
    validPassword !== confirmPassword
  ) {
    throw new AuthServiceError(
      "Passwords do not match.",
      AUTH_ERROR_CODES.PASSWORD_MISMATCH
    );
  }

  const normalizedFirstName =
    normalizeName(firstName);

  const normalizedLastName =
    normalizeName(lastName);

  const normalizedFullName = normalizeName(
    fullName ||
    [
      normalizedFirstName,
      normalizedLastName,
    ]
      .filter(Boolean)
      .join(" ")
  );

  if (!normalizedFullName) {
    throw new AuthServiceError(
      "Please enter your name.",
      AUTH_ERROR_CODES.INVALID_NAME
    );
  }

  const emailRedirectTo =
    getSafeRedirectUrl(redirectPath);

  try {
    const { data, error } =
      await client.auth.signUp({
        email: validEmail,
        password: validPassword,
        options: {
          data: {
            first_name: normalizedFirstName,
            last_name: normalizedLastName,
            full_name: normalizedFullName,
          },
          emailRedirectTo,
        },
      });

    if (error) {
      throw error;
    }

    return {
      success: true,
      user: normalizeAuthUser(data?.user),
      session: data?.session || null,

      requiresEmailConfirmation: Boolean(
        data?.user && !data?.session
      ),

      message: data?.session
        ? "Your account is ready."
        : "If registration is eligible, please check your email for the confirmation link.",
    };
  } catch (error) {
    throw handleAuthError(error);
  }
}

// ======================================================
// 09. LOGIN CUSTOMER
// ======================================================

export async function loginUser({
  email,
  password,
} = {}) {
  const client = requireClient();

  const validEmail = requireValidEmail(email);

  if (
    typeof password !== "string" ||
    !password
  ) {
    throw new AuthServiceError(
      "Password is required.",
      AUTH_ERROR_CODES.INVALID_PASSWORD
    );
  }

  try {
    const { data, error } =
      await client.auth.signInWithPassword({
        email: validEmail,
        password,
      });

    if (error) {
      throw error;
    }

    if (!data?.session) {
      throw new AuthServiceError(
        "Unable to establish a login session.",
        "SESSION_NOT_CREATED"
      );
    }

    return {
      success: true,
      user: normalizeAuthUser(data.user),
      session: data.session,
      message:
        "You have signed in successfully.",
    };
  } catch (error) {
    throw handleAuthError(error);
  }
}

// ======================================================
// 10. LOGOUT CUSTOMER
// ======================================================

export async function logoutUser({
  scope = "local",
} = {}) {
  const client = requireClient();

  const allowedScopes = [
    "local",
    "global",
    "others",
  ];

  if (!allowedScopes.includes(scope)) {
    throw new AuthServiceError(
      "Invalid logout scope.",
      "INVALID_LOGOUT_SCOPE"
    );
  }

  try {
    const { error } =
      await client.auth.signOut({
        scope,
      });

    if (error) {
      throw error;
    }

    return {
      success: true,
      message:
        "You have signed out successfully.",
    };
  } catch (error) {
    throw handleAuthError(error);
  }
}

// ======================================================
// 11. GET CURRENT USER
// ======================================================

export async function getCurrentUser() {
  requireClient();

  try {
    const user = await getSupabaseUser();

    return normalizeAuthUser(user);
  } catch (error) {
    throw handleAuthError(error);
  }
}

// ======================================================
// 12. GET CURRENT SESSION
// ======================================================

export async function getCurrentSession() {
  requireClient();

  try {
    return await getSupabaseSession();
  } catch (error) {
    throw handleAuthError(error);
  }
}

// ======================================================
// 13. GET AUTH TOKEN
// ======================================================

export async function getAuthToken() {
  requireClient();

  try {
    return await getSupabaseAccessToken();
  } catch (error) {
    throw handleAuthError(error);
  }
}

// ======================================================
// 14. REQUEST PASSWORD RESET
// ======================================================

export async function requestPasswordReset({
  email,
  redirectPath = "/reset-password",
} = {}) {
  const client = requireClient();

  const validEmail = requireValidEmail(email);

  const redirectTo =
    getSafeRedirectUrl(redirectPath);

  try {
    const { error } =
      await client.auth.resetPasswordForEmail(
        validEmail,
        {
          redirectTo,
        }
      );

    if (error) {
      throw error;
    }

    return {
      success: true,
      message:
        "If an account exists for this email, password reset instructions will be sent.",
    };
  } catch (error) {
    throw handleAuthError(error);
  }
}

// ======================================================
// 15. UPDATE PASSWORD
// ======================================================

export async function updatePassword({
  password,
  confirmPassword,
} = {}) {
  const client = requireClient();

  const validPassword =
    requireValidPassword(password);

  if (
    confirmPassword !== undefined &&
    validPassword !== confirmPassword
  ) {
    throw new AuthServiceError(
      "Passwords do not match.",
      AUTH_ERROR_CODES.PASSWORD_MISMATCH
    );
  }

  try {
    const { data, error } =
      await client.auth.updateUser({
        password: validPassword,
      });

    if (error) {
      throw error;
    }

    return {
      success: true,
      user: normalizeAuthUser(data?.user),
      message:
        "Your password has been updated.",
    };
  } catch (error) {
    throw handleAuthError(error);
  }
}

// ======================================================
// 16. RESEND VERIFICATION EMAIL
// ======================================================

export async function resendVerificationEmail({
  email,
  redirectPath = "/account",
} = {}) {
  const client = requireClient();

  const validEmail = requireValidEmail(email);

  const emailRedirectTo =
    getSafeRedirectUrl(redirectPath);

  try {
    const { error } =
      await client.auth.resend({
        type: "signup",
        email: validEmail,
        options: {
          emailRedirectTo,
        },
      });

    if (error) {
      throw error;
    }

    return {
      success: true,
      message:
        "If verification is pending, a confirmation email will be sent.",
    };
  } catch (error) {
    throw handleAuthError(error);
  }
}

// ======================================================
// 17. UPDATE CUSTOMER PROFILE
// ======================================================

export async function updateUserProfile({
  firstName,
  lastName,
  fullName,
  avatarUrl,
} = {}) {
  const client = requireClient();

  let currentUser;

  try {
    currentUser = await getSupabaseUser();
  } catch (error) {
    throw handleAuthError(error);
  }

  if (!currentUser) {
    throw new AuthServiceError(
      "Please sign in to update your profile.",
      AUTH_ERROR_CODES.NOT_AUTHENTICATED
    );
  }

  const existingMetadata =
    currentUser.user_metadata || {};

  // Only allow approved profile fields.
  // Never accept admin roles or permissions
  // from user-controlled input.
  const metadata = {};

  if (firstName !== undefined) {
    metadata.first_name =
      normalizeName(firstName);
  }

  if (lastName !== undefined) {
    metadata.last_name =
      normalizeName(lastName);
  }

  if (fullName !== undefined) {
    metadata.full_name =
      normalizeName(fullName);
  } else if (
    firstName !== undefined ||
    lastName !== undefined
  ) {
    metadata.full_name = [
      metadata.first_name ??
        existingMetadata.first_name ??
        "",
      metadata.last_name ??
        existingMetadata.last_name ??
        "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (avatarUrl !== undefined) {
    if (
      avatarUrl !== null &&
      typeof avatarUrl !== "string"
    ) {
      throw new AuthServiceError(
        "Invalid profile image URL.",
        "INVALID_AVATAR_URL"
      );
    }

    metadata.avatar_url =
      avatarUrl || null;
  }

  try {
    const { data, error } =
      await client.auth.updateUser({
        data: metadata,
      });

    if (error) {
      throw error;
    }

    return {
      success: true,
      user: normalizeAuthUser(data?.user),
      message:
        "Your profile has been updated.",
    };
  } catch (error) {
    throw handleAuthError(error);
  }
}

// ======================================================
// 18. REQUEST EMAIL CHANGE
// ======================================================

export async function updateUserEmail({
  email,
} = {}) {
  const client = requireClient();

  const validEmail = requireValidEmail(email);

  try {
    const { data, error } =
      await client.auth.updateUser({
        email: validEmail,
      });

    if (error) {
      throw error;
    }

    return {
      success: true,
      user: normalizeAuthUser(data?.user),
      message:
        "If required, please confirm the email change using the verification link.",
    };
  } catch (error) {
    throw handleAuthError(error);
  }
}

// ======================================================
// 19. AUTH STATE SUBSCRIPTION
// ======================================================

export function onAuthStateChange(callback) {
  requireClient();

  if (typeof callback !== "function") {
    throw new AuthServiceError(
      "Authentication listener must be a function.",
      "INVALID_AUTH_CALLBACK"
    );
  }

  return subscribeToAuthChanges(
    (event, session) => {
      callback(event, session);
    }
  );
}

// ======================================================
// 20. AUTHENTICATION STATUS
// ======================================================

export async function isAuthenticated() {
  const user = await getCurrentUser();

  return Boolean(user?.id);
}

// ======================================================
// 21. DEFAULT EXPORT
// ======================================================

const authService = {
  isValidEmail,
  validatePassword,

  registerUser,
  loginUser,
  logoutUser,

  getCurrentUser,
  getCurrentSession,
  getAuthToken,

  requestPasswordReset,
  updatePassword,
  resendVerificationEmail,

  updateUserProfile,
  updateUserEmail,

  onAuthStateChange,
  isAuthenticated,

  normalizeAuthUser,
  getAuthErrorMessage,
};

export default authService;
