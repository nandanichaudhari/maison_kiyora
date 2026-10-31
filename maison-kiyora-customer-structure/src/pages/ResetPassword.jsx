

import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

import {

  ArrowLeft,

  ArrowRight,

  Check,

  CheckCircle2,

  Eye,

  EyeOff,

  KeyRound,

  LockKeyhole,

  ShieldCheck,

} from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";

import { supabase } from "../services/supabaseClient.js";

const getPasswordChecks = (password) => [

  {

    label: "At least 8 characters",

    passed: password.length >= 8,

  },

  {

    label: "Uppercase and lowercase",

    passed: /[a-z]/.test(password) && /[A-Z]/.test(password),

  },

  {

    label: "At least one number",

    passed: /\d/.test(password),

  },

  {

    label: "At least one special character",

    passed: /[^A-Za-z0-9]/.test(password),

  },

];

export default function ResetPassword() {

  const navigate = useNavigate();

  const {

    changePassword,

    isSubmitting,

    isConfigured,

    clearError,

  } = useAuth();

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =

    useState(false);

  const [recoveryStatus, setRecoveryStatus] =

    useState("checking");

  const [recoveryError, setRecoveryError] = useState("");

  const [formError, setFormError] = useState("");

  const [success, setSuccess] = useState(false);

  const checks = getPasswordChecks(password);

  const strength = checks.filter((item) => item.passed).length;

  useEffect(() => {

    document.title = "Reset Password | Maison Kiyora";

  }, []);

  useEffect(() => {
    if (!supabase) {
      setRecoveryStatus("invalid");
      setRecoveryError("Password recovery is not configured.");
      return;
    }

    let active = true;
    let verified = false;
    let timeoutId;

    const confirmRecovery = () => {
      if (!active) return;
      verified = true;
      setRecoveryStatus("ready");
      setRecoveryError("");
    };

    const failRecovery = (message) => {
      if (!active || verified) return;
      setRecoveryStatus("invalid");
      setRecoveryError(message || "This password reset link is invalid or has expired.");
    };

    const url = new URL(window.location.href);
    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
    const tokenHash = url.searchParams.get("token_hash");
    const code = url.searchParams.get("code");
    const hashType = hash.get("type");
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    const hasRecoveryTokens = hashType === "recovery" && Boolean(accessToken && refreshToken);
    const errorDescription = url.searchParams.get("error_description") || hash.get("error_description");

    // Subscribe immediately: the Supabase client may be completing
    // its automatic PKCE exchange while this page mounts.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active || !session?.user) return;
      if (event === "PASSWORD_RECOVERY") {
        confirmRecovery();
      } else if (code && event === "SIGNED_IN") {
        // PKCE recovery links may emit SIGNED_IN after code exchange.
        confirmRecovery();
      }
    });

    const verifyRecovery = async () => {
      if (errorDescription) {
        failRecovery(errorDescription.replace(/\+/g, " "));
        return;
      }

      try {
        if (tokenHash) {
          const { data: result, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });
          if (error) throw error;
          if (!result?.session?.user) {
            throw new Error("Unable to establish a password recovery session.");
          }
          confirmRecovery();
          return;
        }

        if (hasRecoveryTokens) {
          const { data: result, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          if (!result?.session?.user) {
            throw new Error("Unable to establish a password recovery session.");
          }
          confirmRecovery();
          return;
        }

        if (!code) {
          failRecovery("This password reset link is invalid or has expired.");
          return;
        }

        // detectSessionInUrl: true makes Supabase exchange the PKCE
        // code automatically. Do not exchange the same code twice.
        // getSession() waits for the client's initialization.
        const { data: result, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (result?.session?.user && active) {
          // A session alone may predate the reset link. Only accept
          // a recovery-related auth event as confirmation for PKCE.
          // The listener above handles PASSWORD_RECOVERY / SIGNED_IN.
        }
      } catch (error) {
        failRecovery(error?.message || "Unable to verify your password reset link.");
      }
    };

    void verifyRecovery();

    timeoutId = window.setTimeout(() => {
      failRecovery("We couldn't verify this recovery link. Please request a new password reset email.");
    }, 10000);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      data?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {

    return () => clearError();

  }, [clearError]);

  const validateForm = () => {

    if (!password) {

      return "Please enter your new password.";

    }

    if (password.length < 8 || password.length > 72) {

      return "Password must contain 8 to 72 characters.";

    }

    if (!checks.every((item) => item.passed)) {

      return "Please meet all password requirements.";

    }

    if (!confirmPassword) {

      return "Please confirm your new password.";

    }

    if (password !== confirmPassword) {

      return "Passwords do not match.";

    }

    return "";

  };

  const handleSubmit = async (event) => {

    event.preventDefault();

    if (

      isSubmitting ||

      recoveryStatus !== "ready" ||

      success

    ) {

      return;

    }

    const validationError = validateForm();

    if (validationError) {

      setFormError(validationError);

      return;

    }

    try {

      setFormError("");

      const result = await changePassword({

        password,

        confirmPassword,

      });

      if (result?.success === false) {

        throw new Error(

          result.message || "Unable to update password."

        );

      }

      setPassword("");

      setConfirmPassword("");

      setSuccess(true);

    } catch (error) {

      setFormError(

        error?.message ||

          "Unable to update your password. Please try again."

      );

    }

  };

  return (

    <div className="mk-reset-page">

      <style>{styles}</style>

      <div className="mk-reset-layout">

        <aside className="mk-reset-brand">

          <Link to="/" className="mk-reset-logo">

            MAISON KIYORA

          </Link>

          <motion.div

            initial={{ opacity: 0, y: 25 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.7 }}

            className="mk-reset-brand-copy"

          >

            <span>THE ART OF SLOW PERFUMERY</span>

            <h1>

              A fresh

              <br />

              <em>beginning.</em>

            </h1>

            <p>

              Your personal fragrance journey continues.

            </p>

          </motion.div>

          <span className="mk-reset-brand-footer">

            MAISON KIYORA

          </span>

        </aside>

        <section className="mk-reset-panel">

          <header className="mk-reset-topbar">

            <Link to="/" className="mk-reset-mobile-logo">

              MAISON KIYORA

            </Link>

            <Link to="/" className="mk-reset-back">

              <ArrowLeft size={16} />

              Back to Maison

            </Link>

          </header>

          <motion.div

            className="mk-reset-content"

            initial={{ opacity: 0, y: 15 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.5 }}

          >

            {recoveryStatus === "checking" && !success && (

              <div

                className="mk-reset-message"

                role="status"

                aria-busy="true"

              >

                <div className="mk-reset-icon">

                  <LockKeyhole size={26} />

                </div>

                <span className="mk-reset-eyebrow">

                  SECURE RECOVERY

                </span>

                <h2>

                  Verifying your <em>link.</em>

                </h2>

                <p>

                  Please wait while we verify your

                  password reset request.

                </p>

                <div className="mk-reset-loader" />

              </div>

            )}

            {recoveryStatus === "invalid" && !success && (

              <div className="mk-reset-message" role="alert">

                <div className="mk-reset-icon">

                  <KeyRound size={27} />

                </div>

                <span className="mk-reset-eyebrow">

                  RECOVERY LINK

                </span>

                <h2>

                  Link <em>unavailable.</em>

                </h2>

                <p>{recoveryError}</p>

                <Link

                  to="/forgot-password"

                  className="mk-reset-primary-link"

                >

                  Request a New Link

                  <ArrowRight size={18} />

                </Link>

              </div>

            )}

            {success && (

              <div className="mk-reset-message" role="status">

                <div className="mk-reset-icon">

                  <CheckCircle2 size={30} />

                </div>

                <span className="mk-reset-eyebrow">

                  PASSWORD UPDATED

                </span>

                <h2>

                  All <em>set.</em>

                </h2>

                <p>

                  Your password has been updated successfully.

                  You can now continue to your account.

                </p>

                <button

                  type="button"

                  className="mk-reset-primary-link"

                  onClick={() =>

                    navigate("/account", { replace: true })

                  }

                >

                  Continue to My Account

                  <ArrowRight size={18} />

                </button>

              </div>

            )}

            {recoveryStatus === "ready" && !success && (

              <>

                <div className="mk-reset-heading">

                  <div className="mk-reset-icon">

                    <LockKeyhole size={25} />

                  </div>

                  <span className="mk-reset-eyebrow">

                    SECURE YOUR ACCOUNT

                  </span>

                  <h2>

                    New <em>password.</em>

                  </h2>

                  <p>

                    Create a new password to regain access

                    to your Maison Kiyora account.

                  </p>

                </div>

                <form onSubmit={handleSubmit} noValidate>

                  <div className="mk-reset-field">

                    <label htmlFor="mk-new-password">

                      New password

                    </label>

                    <div className="mk-reset-input">

                      <LockKeyhole size={18} />

                      <input

                        id="mk-new-password"

                        type={

                          showPassword ? "text" : "password"

                        }

                        autoComplete="new-password"

                        placeholder="Enter new password"

                        value={password}

                        onChange={(event) => {

                          setPassword(event.target.value);

                          setFormError("");

                        }}

                        disabled={isSubmitting}

                      />

                      <button

                        type="button"

                        onClick={() =>

                          setShowPassword((value) => !value)

                        }

                        aria-label={

                          showPassword

                            ? "Hide password"

                            : "Show password"

                        }

                        aria-pressed={showPassword}

                      >

                        {showPassword ? (

                          <EyeOff size={18} />

                        ) : (

                          <Eye size={18} />

                        )}

                      </button>

                    </div>

                    {password && (

                      <div className="mk-reset-strength">

                        <div className="mk-reset-strength-bars">

                          {[1, 2, 3, 4].map((number) => (

                            <span

                              key={number}

                              className={

                                number <= strength

                                  ? "active"

                                  : ""

                              }

                            />

                          ))}

                        </div>

                        <div className="mk-reset-checks">

                          {checks.map((item) => (

                            <div

                              key={item.label}

                              className={

                                item.passed ? "passed" : ""

                              }

                            >

                              <Check size={13} />

                              {item.label}

                            </div>

                          ))}

                        </div>

                      </div>

                    )}

                  </div>

                  <div className="mk-reset-field">

                    <label htmlFor="mk-confirm-password">

                      Confirm new password

                    </label>

                    <div className="mk-reset-input">

                      <LockKeyhole size={18} />

                      <input

                        id="mk-confirm-password"

                        type={

                          showConfirmPassword

                            ? "text"

                            : "password"

                        }

                        autoComplete="new-password"

                        placeholder="Confirm new password"

                        value={confirmPassword}

                        onChange={(event) => {

                          setConfirmPassword(event.target.value);

                          setFormError("");

                        }}

                        disabled={isSubmitting}

                      />

                      <button

                        type="button"

                        onClick={() =>

                          setShowConfirmPassword(

                            (value) => !value

                          )

                        }

                        aria-label={

                          showConfirmPassword

                            ? "Hide confirmation password"

                            : "Show confirmation password"

                        }

                        aria-pressed={showConfirmPassword}

                      >

                        {showConfirmPassword ? (

                          <EyeOff size={18} />

                        ) : (

                          <Eye size={18} />

                        )}

                      </button>

                    </div>

                    {confirmPassword &&

                      confirmPassword === password && (

                        <p className="mk-reset-match">

                          <CheckCircle2 size={14} />

                          Passwords match

                        </p>

                      )}

                  </div>

                  {formError && (

                    <p

                      className="mk-reset-error"

                      role="alert"

                    >

                      {formError}

                    </p>

                  )}

                  <button

                    className="mk-reset-submit"

                    type="submit"

                    disabled={

                      isSubmitting || !isConfigured

                    }

                  >

                    {isSubmitting

                      ? "Updating password..."

                      : "Update Password"}

                    <ArrowRight size={18} />

                  </button>

                </form>

                <div className="mk-reset-security">

                  <ShieldCheck size={17} />

                  Secure password recovery

                </div>

              </>

            )}

          </motion.div>

          <footer className="mk-reset-footer">

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

    </div>

  );

}

const styles = `

  .mk-reset-page {

    --ivory: #F5F0E8;

    --navy: #1D2940;

    --gold: #B69A69;

    min-height: 100vh;

    background: var(--ivory);

    color: var(--navy);

    font-family: "Manrope", sans-serif;

  }

  .mk-reset-page * {

    box-sizing: border-box;

  }

  .mk-reset-layout {

    display: grid;

    grid-template-columns: 46% 54%;

    min-height: 100vh;

  }

  .mk-reset-brand {

    position: relative;

    display: flex;

    flex-direction: column;

    justify-content: space-between;

    overflow: hidden;

    min-height: 650px;

    padding: clamp(32px, 5vw, 76px);

    background:

      radial-gradient(

        ellipse at 50% 65%,

        rgba(182,154,105,.23),

        transparent 52%

      ),

      linear-gradient(145deg, #29364d, #101a2b);

    color: #fff;

  }

  .mk-reset-brand::before {

    content: "K";

    position: absolute;

    top: 20%;

    left: 50%;

    transform: translateX(-50%);

    font-family: "Cormorant Garamond", Georgia, serif;

    font-size: clamp(200px, 27vw, 400px);

    font-style: italic;

    color: rgba(255,255,255,.07);

    pointer-events: none;

  }

  .mk-reset-logo,

  .mk-reset-mobile-logo {

    position: relative;

    z-index: 1;

    color: inherit;

    text-decoration: none;

    font-family: "Cormorant Garamond", Georgia, serif;

    font-size: 24px;

    letter-spacing: .18em;

  }

  .mk-reset-brand-copy {

    position: relative;

    z-index: 1;

  }

  .mk-reset-brand-copy > span,

  .mk-reset-eyebrow {

    color: var(--gold);

    font-size: 10px;

    font-weight: 600;

    letter-spacing: .24em;

  }

  .mk-reset-brand-copy h1 {

    margin: 20px 0;

    font-family: "Cormorant Garamond", Georgia, serif;

    font-size: clamp(70px, 8vw, 120px);

    font-weight: 300;

    line-height: .9;

    letter-spacing: -.05em;

  }

  .mk-reset-brand-copy h1 em {

    color: #dbc5a2;

  }

  .mk-reset-brand-copy p {

    max-width: 300px;

    color: rgba(255,255,255,.7);

    font-size: 12px;

    line-height: 2;

  }

  .mk-reset-brand-footer {

    position: relative;

    z-index: 1;

    color: rgba(255,255,255,.4);

    font-size: 10px;

    letter-spacing: .2em;

  }

  .mk-reset-panel {

    display: flex;

    flex-direction: column;

    min-width: 0;

    padding: 30px clamp(24px, 5vw, 80px) 25px;

  }

  .mk-reset-topbar {

    display: flex;

    align-items: center;

    justify-content: flex-end;

    min-height: 36px;

  }

  .mk-reset-mobile-logo {

    display: none;

  }

  .mk-reset-back {

    display: inline-flex;

    align-items: center;

    gap: 8px;

    color: var(--navy);

    text-decoration: none;

    font-size: 11px;

  }

  .mk-reset-content {

    width: 100%;

    max-width: 440px;

    margin: auto;

    padding: 65px 0;

  }

  .mk-reset-icon {

    display: grid;

    place-items: center;

    width: 64px;

    height: 64px;

    margin-bottom: 25px;

    border: 1px solid #d8c9b5;

    border-radius: 50%;

    color: var(--gold);

  }

  .mk-reset-heading h2,

  .mk-reset-message h2 {

    margin: 17px 0;

    font-family: "Cormorant Garamond", Georgia, serif;

    font-size: clamp(55px, 5.5vw, 78px);

    font-weight: 400;

    line-height: .95;

    letter-spacing: -.05em;

  }

  .mk-reset-heading h2 em,

  .mk-reset-message h2 em {

    color: var(--gold);

    font-weight: 300;

  }

  .mk-reset-heading p,

  .mk-reset-message p {

    margin: 0 0 30px;

    color: #78777A;

    font-size: 12px;

    line-height: 1.9;

  }

  .mk-reset-field {

    margin-bottom: 22px;

  }

  .mk-reset-field label {

    display: block;

    margin-bottom: 10px;

    font-size: 11px;

    font-weight: 600;

  }

  .mk-reset-input {

    display: flex;

    align-items: center;

    gap: 12px;

    min-height: 54px;

    padding: 0 14px;

    border: 1px solid #ddd5ca;

    background: rgba(255,255,255,.5);

  }

  .mk-reset-input:focus-within {

    border-color: var(--gold);

    box-shadow: 0 0 0 3px rgba(182,154,105,.1);

  }

  .mk-reset-input > svg {

    flex-shrink: 0;

    color: #9b8d7b;

  }

  .mk-reset-input input {

    flex: 1;

    min-width: 0;

    height: 52px;

    border: 0;

    outline: none;

    background: transparent;

    color: var(--navy);

    font: inherit;

    font-size: 12px;

  }

  .mk-reset-input button {

    display: grid;

    place-items: center;

    width: 30px;

    height: 34px;

    border: 0;

    background: transparent;

    color: #8d8376;

    cursor: pointer;

  }

  .mk-reset-strength {

    margin-top: 13px;

    padding: 14px;

    border: 1px solid #e5dcd0;

  }

  .mk-reset-strength-bars {

    display: grid;

    grid-template-columns: repeat(4, 1fr);

    gap: 5px;

    margin-bottom: 14px;

  }

  .mk-reset-strength-bars span {

    height: 3px;

    background: #ded7cd;

  }

  .mk-reset-strength-bars span.active {

    background: #B69A69;

  }

  .mk-reset-checks {

    display: grid;

    grid-template-columns: repeat(2, 1fr);

    gap: 9px;

  }

  .mk-reset-checks div {

    display: flex;

    align-items: center;

    gap: 6px;

    color: #96918a;

    font-size: 10px;

  }

  .mk-reset-checks div.passed {

    color: #53735a;

  }

  .mk-reset-match {

    display: flex;

    align-items: center;

    gap: 6px;

    margin: 8px 0 0;

    color: #53735a;

    font-size: 10px;

  }

  .mk-reset-error {

    margin: 0 0 16px;

    padding: 12px;

    background: #f7e9e6;

    border: 1px solid #e6c8c1;

    color: #9e453c;

    font-size: 11px;

    line-height: 1.7;

  }

  .mk-reset-submit,

  .mk-reset-primary-link {

    display: flex;

    align-items: center;

    justify-content: space-between;

    width: 100%;

    min-height: 55px;

    padding: 0 20px;

    border: 1px solid var(--navy);

    background: var(--navy);

    color: #fff;

    font: inherit;

    font-size: 11px;

    font-weight: 600;

    letter-spacing: .07em;

    text-decoration: none;

    cursor: pointer;

  }

  .mk-reset-submit:hover:not(:disabled),

  .mk-reset-primary-link:hover {

    background: #30405a;

  }

  .mk-reset-submit:disabled {

    opacity: .55;

    cursor: not-allowed;

  }

  .mk-reset-security {

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 9px;

    margin-top: 28px;

    color: #8d8378;

    font-size: 10px;

  }

  .mk-reset-security svg {

    color: var(--gold);

  }

  .mk-reset-message .mk-reset-icon {

    margin-left: auto;

    margin-right: auto;

  }

  .mk-reset-message {

    text-align: center;

  }

  .mk-reset-message .mk-reset-primary-link {

    margin-top: 30px;

  }

  .mk-reset-loader {

    width: 26px;

    height: 26px;

    margin: 20px auto;

    border: 2px solid #ded6cb;

    border-top-color: var(--navy);

    border-radius: 50%;

    animation: mk-reset-spin .8s linear infinite;

  }

  @keyframes mk-reset-spin {

    to { transform: rotate(360deg); }

  }

  .mk-reset-footer {

    display: flex;

    justify-content: space-between;

    gap: 16px;

    color: #8d867d;

    font-size: 10px;

  }

  .mk-reset-footer div {

    display: flex;

    gap: 18px;

  }

  .mk-reset-footer a {

    color: inherit;

    text-decoration: none;

  }

  @media (max-width: 700px) {

    .mk-reset-layout {

      display: block;

    }

    .mk-reset-brand {

      display: none;

    }

    .mk-reset-panel {

      min-height: 100svh;

      padding: 24px;

    }

    .mk-reset-topbar {

      justify-content: space-between;

    }

    .mk-reset-mobile-logo {

      display: inline-block;

      font-size: 19px;

    }

    .mk-reset-content {

      padding: 60px 0;

    }

    .mk-reset-heading h2,

    .mk-reset-message h2 {

      font-size: 60px;

    }

  }

  @media (max-width: 400px) {

    .mk-reset-panel {

      padding: 20px;

    }

    .mk-reset-checks {

      grid-template-columns: 1fr;

    }

    .mk-reset-heading h2,

    .mk-reset-message h2 {

      font-size: 51px;

    }

    .mk-reset-footer {

      flex-wrap: wrap;

    }

  }

  @media (prefers-reduced-motion: reduce) {

    .mk-reset-page *,

    .mk-reset-page *::before,

    .mk-reset-page *::after {

      animation-duration: .01ms !important;

      transition-duration: .01ms !important;

    }

  }

`;
