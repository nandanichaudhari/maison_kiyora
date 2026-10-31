
import { useEffect, useId, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AUTH_BG = "/images/auth/maison-kiyora-auth-bg.png";
function getSafeDestination(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/account";
  if (/^\/(?:login|register)(?:\/|\?|#|$)/i.test(value)) return "/account";
  return value;
}
function GoogleMark() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.03 46.98 31.88 46.98 24.55z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.6.27-3.14.76-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.87.93 7.51 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.92-2.13 15.89-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const auth = useAuth();
  const {
    login,
    isAuthenticated,
    isLoading,
    isSubmitting,
    isConfigured,
    clearError,
  } = auth;
  // Supports either common OAuth method name.
  // AuthContext must actually implement one of them.
  const googleLogin =
    auth.loginWithGoogle ?? auth.signInWithGoogle;
  const emailId = useId();
  const passwordId = useId();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const from = location.state?.from;
  const fromPath =
    typeof from?.pathname === "string"
      ? `${from.pathname}${from.search || ""}${from.hash || ""}`
      : null;
  const redirectTo = getSafeDestination(
    fromPath ||
      new URLSearchParams(location.search).get("redirect")
  );
  useEffect(() => {
    document.title = "Sign In | Maison Kiyora";
  }, []);
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate, redirectTo]);
  useEffect(() => {
    return () => clearError?.();
  }, [clearError]);
  function updateField(name, value) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
    setServerError("");
    clearError?.();
  }
  function validateForm() {
    const nextErrors = {};
    if (!form.email.trim()) {
      nextErrors.email = "Please enter your email address.";
    } else if (!EMAIL_PATTERN.test(form.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!form.password) {
      nextErrors.password = "Please enter your password.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }
  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting || googleLoading || isLoading) return;
    if (!validateForm()) return;
    if (!isConfigured) {
      setServerError(
        "Customer sign-in is not available yet. Please try again later."
      );
      return;
    }
    try {
      setServerError("");
      const result = await login({
        email: form.email.trim(),
        password: form.password,
      });
      if (result?.success) {
        toast.success("Welcome back to Maison Kiyora.");
        // Existing auth-state effect handles redirect.
      } else if (result?.error) {
        setServerError(
          typeof result.error === "string"
            ? result.error
            : result.error.message || "Unable to sign in."
        );
      }
    } catch (error) {
      setServerError(
        error?.message || "Unable to sign in. Please try again."
      );
    }
  }
  async function handleGoogleLogin() {
    if (googleLoading || isSubmitting) return;
    if (!isConfigured) {
      setServerError(
        "Customer authentication is not configured yet."
      );
      return;
    }
    if (typeof googleLogin !== "function") {
      setServerError(
        "Google sign-in is not connected yet. Please use your email and password."
      );
      return;
    }
    setGoogleLoading(true);
    setServerError("");
    try {
      const result = await googleLogin({
        redirectTo,
      });
      if (result?.success && !result?.redirecting) {
        toast.success("Welcome to Maison Kiyora.");
      } else if (result?.error) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : result.error.message || "Google sign-in failed."
        );
      }
      // For OAuth redirect flows, the provider navigates
      // away and completes authentication after callback.
    } catch (error) {
      setServerError(
        error?.message ||
          "Unable to continue with Google. Please try again."
      );
    } finally {
      setGoogleLoading(false);
    }
  }
  if (isLoading) {
    return (
      <div className="mk-auth-loading">
        <style>{LOGIN_CSS}</style>
        <span className="mk-auth-spinner" />
        <p>Preparing your Maison experience...</p>
      </div>
    );
  }
  return (
    <main className="mk-auth">
      <style>{LOGIN_CSS}</style>
      <div className="mk-auth-layout">
        <section
          className="mk-auth-editorial"
          aria-label="Maison Kiyora fragrance"
        >
          <div className="mk-auth-editorial__glow" />
          <div className="mk-auth-editorial__top">
            <Link to="/" className="mk-auth-brand">
              MAISON KIYORA
            </Link>
            <span>THE ART OF SLOW PERFUMERY</span>
          </div>
                      <motion.div
              className="mk-auth-editorial__copy"
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="mk-auth-editorial__line" />
              <p>SCENTS THAT STAY WITH YOU.</p>
            </motion.div>
          <div className="mk-auth-editorial__bottom">
            <span>DISCOVER YOUR SIGNATURE SCENT</span>
            <span>MAISON KIYORA · INDIA</span>
          </div>
        </section>
        <section className="mk-auth-form-side">
          <div className="mk-auth-topbar">
            <Link to="/" className="mk-auth-mobile-brand">
              MAISON KIYORA
            </Link>
            <Link to="/" className="mk-auth-back">
              <ArrowLeft size={15} strokeWidth={1.5} />
              <span>Back to Maison</span>
            </Link>
          </div>
          <motion.div
            className="mk-auth-form-content"
            initial={reducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
          >
            <div className="mk-auth-heading">
              <span className="mk-auth-eyebrow">
                YOUR PRIVATE WORLD
              </span>
              <h2>
                Welcome <em>back.</em>
              </h2>
              <p>
                Sign in to revisit your favourites
                and continue your fragrance journey.
              </p>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="mk-auth-field">
                <label htmlFor={emailId}>
                  Email address
                </label>
                <div
                  className={`mk-auth-input ${
                    errors.email ? "is-invalid" : ""
                  }`}
                >
                  <Mail size={18} strokeWidth={1.4} />
                  <input
                    id={emailId}
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={
                      errors.email
                        ? `${emailId}-error`
                        : undefined
                    }
                    disabled={isSubmitting || googleLoading}
                    required
                  />
                </div>
                {errors.email && (
                  <p
                    id={`${emailId}-error`}
                    className="mk-auth-error"
                    role="alert"
                  >
                    {errors.email}
                  </p>
                )}
              </div>
              <div className="mk-auth-field">
                <div className="mk-auth-field-heading">
                  <label htmlFor={passwordId}>
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="mk-auth-forgot"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div
                  className={`mk-auth-input ${
                    errors.password ? "is-invalid" : ""
                  }`}
                >
                  <LockKeyhole size={18} strokeWidth={1.4} />
                  <input
                    id={passwordId}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(event) =>
                      updateField(
                        "password",
                        event.target.value
                      )
                    }
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password
                        ? `${passwordId}-error`
                        : undefined
                    }
                    disabled={isSubmitting || googleLoading}
                    required
                  />
                  <button
                    type="button"
                    className="mk-auth-eye"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff size={18} strokeWidth={1.5} />
                    ) : (
                      <Eye size={18} strokeWidth={1.5} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id={`${passwordId}-error`}
                    className="mk-auth-error"
                    role="alert"
                  >
                    {errors.password}
                  </p>
                )}
              </div>
              {serverError && (
                <div
                  className="mk-auth-server-error"
                  role="alert"
                >
                  {serverError}
                </div>
              )}
              <button
                type="submit"
                className="mk-auth-primary"
                disabled={
                  isSubmitting ||
                  googleLoading ||
                  !isConfigured
                }
              >
                <span>
                  {isSubmitting
                    ? "SIGNING IN..."
                    : "SIGN IN"}
                </span>
                {isSubmitting ? (
                  <span className="mk-auth-button-spinner" />
                ) : (
                  <ArrowRight
                    size={19}
                    strokeWidth={1.5}
                  />
                )}
              </button>
              {!isConfigured && (
                <p
                  className="mk-auth-config"
                  role="status"
                >
                  Customer authentication is being configured.
                </p>
              )}
            </form>
            <div className="mk-auth-divider">
              <span />
              <p>OR CONTINUE WITH</p>
              <span />
            </div>
            <button
              type="button"
              className="mk-auth-google"
              onClick={handleGoogleLogin}
              disabled={
                googleLoading ||
                isSubmitting ||
                !isConfigured
              }
            >
              {googleLoading ? (
                <span className="mk-auth-google-spinner" />
              ) : (
                <GoogleMark />
              )}
              <span>
                {googleLoading
                  ? "Connecting to Google..."
                  : "Continue with Google"}
              </span>
            </button>
            <p className="mk-auth-register">
              Don't have an account?{" "}
              <Link
                to={`/register?redirect=${encodeURIComponent(
                  redirectTo
                )}`}
              >
                Create one
              </Link>
            </p>
            <div className="mk-auth-security">
              <ShieldCheck
                size={16}
                strokeWidth={1.5}
              />
              <span>Secure customer sign-in</span>
            </div>
          </motion.div>
          <footer className="mk-auth-footer">
            <span>
              © {new Date().getFullYear()} Maison Kiyora
            </span>
            <div>
              <Link to="/privacy-policy">Privacy</Link>
              <Link to="/terms">Terms</Link>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}
const LOGIN_CSS = `
  .mk-auth {
    --ivory: #F5F0E8;
    --espresso: #211C19;
    --gold: #B69A69;
    --sand: #D8C9B5;
    --muted: #77716B;
    min-height: 100vh;
    background: var(--ivory);
    color: var(--espresso);
    font-family: "Manrope", sans-serif;
  }
  .mk-auth \*,
  .mk-auth \*::before,
  .mk-auth \*::after {
    box-sizing: border-box;
  }
  .mk-auth-layout {
    display: grid;
    grid-template-columns: minmax(0, 47%) minmax(0, 53%);
    min-height: 100vh;
  }
  .mk-auth-editorial {
    position: relative;
    isolation: isolate;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 760px;
    overflow: hidden;
    padding: clamp(30px, 4vw, 66px);
    background-color: #E9E0D4;
    background-image: url("/images/auth/maison-kiyora-auth-bg.png");
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    color: #211C19;
  }

  .mk-auth-editorial::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(245,240,232,.62) 0%, rgba(245,240,232,0) 30%, rgba(33,28,25,0) 75%, rgba(33,28,25,.32) 100%);
  }

  .mk-auth-editorial__top {
    position: relative;
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .mk-auth-brand,
  .mk-auth-mobile-brand {
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(23px, 2.5vw, 36px);
    font-weight: 400;
    letter-spacing: .17em;
    text-decoration: none;
    color: inherit;
    white-space: nowrap;
  }
  .mk-auth-editorial__top > span {
    color: #665341;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: .27em;
  }
  .mk-auth-editorial__copy {
    position: relative;
    z-index: 3;
    max-width: 370px;
    margin: 26px 0 auto;
  }

  .mk-auth-editorial__line {
    display: block;
    width: 38px;
    height: 1px;
    background: #9D7E50;
    margin-bottom: 12px;
  }

  .mk-auth-editorial__copy p {
    margin: 0;
    color: #4C3B2E;
    font-size: 10px;
    font-weight: 650;
    line-height: 1.8;
    letter-spacing: .19em;
  }

  .mk-auth-editorial__bottom {
    position: relative;
    z-index: 3;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 15px;
    color: #F5F0E8;
    text-shadow: 0 1px 10px rgba(0,0,0,.45);
    font-size: 9px;
    letter-spacing: .14em;
  }
  .mk-auth-form-side {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 100vh;
    padding: 30px clamp(25px, 5vw, 90px) 24px;
    background:
      radial-gradient(
        ellipse at 90% 5%,
        rgba(216,201,181,.22),
        transparent 35%
      ),
      #F5F0E8;
  }
  .mk-auth-topbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-height: 38px;
  }
  .mk-auth-mobile-brand {
    display: none;
  }
  .mk-auth-back {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    color: var(--espresso);
    font-size: 11px;
    text-decoration: none;
    transition: color .2s ease;
  }
  .mk-auth-back:hover {
    color: #927448;
  }
  .mk-auth-form-content {
    width: 100%;
    max-width: 440px;
    margin: auto;
    padding: 55px 0;
  }
  .mk-auth-heading {
    margin-bottom: 35px;
  }
  .mk-auth-eyebrow {
    font-size: 10px;
    font-weight: 650;
    letter-spacing: .24em;
    color: #997B52;
  }
  .mk-auth-heading h2 {
    margin: 15px 0 12px;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(58px, 5vw, 80px);
    font-weight: 400;
    line-height: 1;
    letter-spacing: -.045em;
  }
  .mk-auth-heading h2 em {
    color: #A98A5B;
    font-weight: 400;
  }
  .mk-auth-heading p {
    max-width: 340px;
    margin: 0;
    font-size: 12px;
    line-height: 1.9;
    color: var(--muted);
  }
  .mk-auth-field {
    margin-bottom: 22px;
  }
  .mk-auth-field label {
    display: block;
    margin-bottom: 10px;
    font-size: 11px;
    font-weight: 650;
  }
  .mk-auth-field-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }
  .mk-auth-forgot {
    color: #967549;
    font-size: 10px;
    text-decoration: none;
  }
  .mk-auth-forgot:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
  .mk-auth-input {
    display: flex;
    align-items: center;
    gap: 13px;
    height: 54px;
    padding: 0 15px;
    border: 1px solid #DCD3C6;
    background: rgba(255,255,255,.58);
    transition:
      border-color .2s ease,
      box-shadow .2s ease,
      background .2s ease;
  }
  .mk-auth-input:focus-within {
    border-color: var(--gold);
    background: #fff;
    box-shadow: 0 0 0 3px rgba(182,154,105,.09);
  }
  .mk-auth-input.is-invalid {
    border-color: #B85C55;
  }
  .mk-auth-input > svg {
    flex-shrink: 0;
    color: #8E806E;
  }
  .mk-auth-input input {
    flex: 1;
    min-width: 0;
    height: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--espresso);
    font: inherit;
    font-size: 12px;
  }
  .mk-auth-input input::placeholder {
    color: #A7A098;
  }
  .mk-auth-eye {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 32px;
    height: 38px;
    padding: 0;
    border: 0;
    background: transparent;
    color: #81766B;
    cursor: pointer;
  }
  .mk-auth-eye:hover {
    color: var(--espresso);
  }
  .mk-auth-error {
    margin: 7px 0 0;
    color: #A64740;
    font-size: 11px;
  }
  .mk-auth-server-error {
    margin-bottom: 18px;
    padding: 12px 14px;
    border: 1px solid #E5C6BF;
    background: #F7E9E6;
    color: #9D463F;
    font-size: 11px;
    line-height: 1.7;
  }
  .mk-auth-primary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 55px;
    margin-top: 9px;
    padding: 0 20px;
    border: 1px solid var(--espresso);
    background: var(--espresso);
    color: #F5F0E8;
    font: inherit;
    font-size: 11px;
    font-weight: 650;
    letter-spacing: .15em;
    cursor: pointer;
    transition:
      background .25s ease,
      transform .25s ease;
  }
  .mk-auth-primary:hover:not(:disabled) {
    background: #40332B;
    transform: translateY(-2px);
  }
  .mk-auth-primary:disabled,
  .mk-auth-google:disabled {
    opacity: .55;
    cursor: not-allowed;
  }
  .mk-auth-divider {
    display: flex;
    align-items: center;
    gap: 13px;
    margin: 29px 0 21px;
  }
  .mk-auth-divider > span {
    flex: 1;
    height: 1px;
    background: #DDD3C6;
  }
  .mk-auth-divider p {
    margin: 0;
    color: #8E8275;
    font-size: 9px;
    font-weight: 650;
    letter-spacing: .15em;
    white-space: nowrap;
  }
  .mk-auth-google {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 13px;
    width: 100%;
    min-height: 54px;
    padding: 0 15px;
    border: 1px solid #D9D0C5;
    background: rgba(255,255,255,.6);
    color: var(--espresso);
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition:
      border-color .2s ease,
      background .2s ease,
      transform .2s ease;
  }
  .mk-auth-google:hover:not(:disabled) {
    border-color: var(--gold);
    background: #fff;
    transform: translateY(-1px);
  }
  .mk-auth-register {
    margin: 27px 0 0;
    text-align: center;
    color: #77716B;
    font-size: 11px;
  }
  .mk-auth-register a {
    margin-left: 5px;
    color: #967549;
    font-weight: 650;
    text-decoration: underline;
    text-underline-offset: 4px;
  }
  .mk-auth-security {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 31px;
    color: #8C8378;
    font-size: 10px;
  }
  .mk-auth-security svg {
    color: #A98A5B;
  }
  .mk-auth-config {
    margin: 12px 0 0;
    color: #927049;
    font-size: 11px;
  }
  .mk-auth-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    color: #8C8378;
    font-size: 10px;
  }
  .mk-auth-footer > div {
    display: flex;
    gap: 20px;
  }
  .mk-auth-footer a {
    color: inherit;
    text-decoration: none;
  }
  .mk-auth-footer a:hover {
    color: var(--espresso);
  }
  .mk-auth-button-spinner,
  .mk-auth-google-spinner,
  .mk-auth-spinner {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255,255,255,.25);
    border-top-color: currentColor;
    border-radius: 50%;
    animation: mk-auth-spin .7s linear infinite;
  }
  .mk-auth-google-spinner {
    color: var(--espresso);
    border-color: #DDD3C6;
    border-top-color: var(--espresso);
  }
  @keyframes mk-auth-spin {
    to { transform: rotate(360deg); }
  }
  .mk-auth-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    min-height: 100vh;
    background: #F5F0E8;
    color: #211C19;
    font-family: "Manrope", sans-serif;
    font-size: 12px;
  }
  .mk-auth-loading .mk-auth-spinner {
    border-color: #DDD3C6;
    border-top-color: #211C19;
  }
  .mk-auth button:focus-visible,
  .mk-auth a:focus-visible {
    outline: 2px solid #B69A69;
    outline-offset: 4px;
  }
  @media (max-width: 1050px) {
    .mk-auth-layout {
      grid-template-columns: 44% 56%;
    }
    .mk-auth-editorial {
      padding: 34px;
    }
    .mk-auth-form-side {
      padding-inline: 38px;
    }
  }
  @media (max-width: 760px) {
    .mk-auth-layout {
      grid-template-columns: 1fr;
    }
    .mk-auth-editorial {
      min-height: 310px;
      padding: 28px 25px;
      background-position: center 56%;
    }
    .mk-auth-editorial__top {
      gap: 5px;
    }
    .mk-auth-brand {
      font-size: 25px;
    }
    .mk-auth-editorial__copy {
      margin: 20px 0 0;
    }
    .mk-auth-editorial__line {
      margin-bottom: 15px;
    }
    .mk-auth-editorial__bottom {
      display: none;
    }
    .mk-auth-form-side {
      min-height: auto;
      padding: 20px 25px 24px;
    }
    .mk-auth-form-content {
      max-width: 480px;
      padding: 38px 0 45px;
    }
    .mk-auth-heading h2 {
      font-size: clamp(53px, 10vw, 72px);
    }
    .mk-auth-footer {
      flex-wrap: wrap;
    }
  }
  @media (max-width: 430px) {
    .mk-auth-editorial {
      min-height: 265px;
      padding: 22px 19px;
      background-position: center 56%;
    }
    .mk-auth-brand {
      font-size: 21px;
    }
    .mk-auth-editorial__top > span {
      font-size: 7px;
    }
    .mk-auth-form-side {
      padding-inline: 20px;
    }
    .mk-auth-heading h2 {
      font-size: 56px;
    }
  }
  /* COMPACT LUXURY AUTH LAYOUT — matches Register */
  .mk-auth { min-height: 100dvh; }
  .mk-auth-layout {
    grid-template-columns: minmax(0, 40%) minmax(0, 60%);
    min-height: 100dvh;
  }
  .mk-auth-editorial {
    min-height: 0;
    padding: clamp(22px, 2.7vw, 42px);
    background-position: center 52%;
  }
  .mk-auth-form-side {
    min-height: 100dvh;
    padding: 18px clamp(22px, 4.5vw, 64px) 16px;
  }
  .mk-auth-form-content {
    max-width: 440px;
    padding: 18px 0;
  }
  .mk-auth-heading { margin-bottom: 22px; }
  .mk-auth-heading h2 {
    font-size: clamp(48px, 4.4vw, 66px);
    margin: 10px 0 8px;
  }
  .mk-auth-heading p { line-height: 1.65; }
  .mk-auth-field { margin-bottom: 14px; }
  .mk-auth-field label { margin-bottom: 7px; }
  .mk-auth-input { height: 47px; }
  .mk-auth-primary { min-height: 48px; margin-top: 6px; }
  .mk-auth-divider { margin: 19px 0 15px; }
  .mk-auth-google { min-height: 48px; }
  .mk-auth-register { margin-top: 17px; }
  .mk-auth-security { margin-top: 16px; }
  .mk-auth-editorial__copy { margin-top: 19px; }
  .mk-auth-footer { padding-top: 12px; }

  @media (max-width: 1050px) and (min-width: 761px) {
    .mk-auth-layout { grid-template-columns: 40% 60%; }
    .mk-auth-editorial { min-height: 0; padding: 25px; }
    .mk-auth-form-side { padding: 16px 30px; }
  }
  @media (max-width: 760px) {
    .mk-auth-layout { grid-template-columns: 1fr; min-height: 100dvh; }
    .mk-auth-editorial {
      min-height: 205px;
      padding: 19px 22px;
      background-position: center 56%;
    }
    .mk-auth-editorial__copy { margin-top: 14px; }
    .mk-auth-form-side { min-height: 0; padding: 17px 22px 20px; }
    .mk-auth-form-content { padding: 23px 0 26px; }
    .mk-auth-heading h2 { font-size: clamp(48px, 9vw, 62px); }
  }
  @media (max-width: 430px) {
    .mk-auth-editorial { min-height: 185px; padding: 16px 18px; }
    .mk-auth-form-side { padding-inline: 18px; }
    .mk-auth-heading h2 { font-size: 49px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .mk-auth \*,
    .mk-auth \*::before,
    .mk-auth \*::after {
      animation-duration: .01ms !important;
      transition-duration: .01ms !important;
    }
  }
`;
