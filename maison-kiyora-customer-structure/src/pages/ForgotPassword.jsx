

import { useEffect, useId, useState } from "react";

import { Link } from "react-router-dom";

import { motion } from "framer-motion";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Mail,
  ShieldCheck,

} from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";

// ======================================================

// MAISON KIYORA

// FORGOT PASSWORD PAGE

// ======================================================

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPassword() {
  const emailId = useId();
  const {
    forgotPassword,
    isLoading,
    isSubmitting,
    isConfigured,
    clearError,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [serverError, setServerError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  useEffect(() => {
    document.title = "Forgot Password | Maison Kiyora";
  }, []);
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    setEmailError("");
    setServerError("");
    clearError();
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isLoading || isSubmitting) {
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setEmailError("Please enter your email address.");
      return;
    }
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    if (!isConfigured) {
      setServerError(
        "Password recovery is not available yet. Please try again later."
      );
      return;
    }
    try {
      setServerError("");
      setEmailError("");
      const result = await forgotPassword({
        email: normalizedEmail,
        redirectPath: "/reset-password",
      });
      if (!result?.success) {
        throw new Error("Unable to process your request. Please try again.");
      }
      setSubmittedEmail(normalizedEmail);
      setIsSubmitted(true);
    } catch (error) {
      setServerError(
        error?.message ||
          "Unable to process your request. Please try again."
      );
    }
  };
  if (isLoading) {
    return (
      <div className="mk-forgot-loading" aria-busy="true">
        <style>{forgotStyles}</style>
        <span className="mk-forgot-spinner" />
        <p>Preparing your experience...</p>
      </div>
    );
  }
  return (
    <div className="mk-forgot-page">
      <style>{forgotStyles}</style>
      <div className="mk-forgot-layout">
        {/* LEFT BRAND PANEL */}
        <section
          className="mk-forgot-brand"
          aria-label="Maison Kiyora brand"
        >
          <div className="mk-forgot-brand-glow" />
          <div className="mk-forgot-brand-content">
            <Link to="/" className="mk-forgot-brand-logo">
              MAISON KIYORA
            </Link>
            <motion.div
              className="mk-forgot-brand-message"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="mk-forgot-eyebrow">
                THE ART OF SLOW PERFUMERY
              </span>
              <h1>
                Every story
                <br />
                <em>continues.</em>
              </h1>
              <p>
                Return to your personal world of fragrance,
                memories and meaningful moments.
              </p>
              <span className="mk-forgot-brand-rule" />
            </motion.div>
            <div className="mk-forgot-brand-footer">
              A MOMENT TO RETURN
            </div>
          </div>
        </section>
        {/* RIGHT FORM PANEL */}
        <section className="mk-forgot-form-panel">
          <header className="mk-forgot-topbar">
            <Link to="/" className="mk-forgot-mobile-logo">
              MAISON KIYORA
            </Link>
            <Link to="/" className="mk-forgot-back">
              <ArrowLeft size={15} strokeWidth={1.5} />
              Back to Maison
            </Link>
          </header>
          <motion.div
            className="mk-forgot-form-container"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              ease: "easeOut",
            }}
          >
            {isSubmitted ? (
              /* EMAIL SENT SCREEN */
              <div
                className="mk-forgot-success"
                role="status"
              >
                <div className="mk-forgot-success-icon">
                  <Mail size={29} strokeWidth={1.4} />
                </div>
                <span className="mk-forgot-section-label">
                  CHECK YOUR INBOX
                </span>
                <h2>
                  A new <em>beginning.</em>
                </h2>
                <p>
                  If an account exists for this email,
                  password reset instructions will be sent to:
                </p>
                <strong className="mk-forgot-submitted-email">
                  {submittedEmail}
                </strong>
                <p>
                  Please check your inbox and spam folder.
                  Follow the link in the email to create a
                  new password.
                </p>
                <div className="mk-forgot-success-notice">
                  <CheckCircle2
                    size={17}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span>
                    Your password reset request has been processed.
                  </span>
                </div>
                <Link
                  to="/login"
                  className="mk-forgot-submit mk-forgot-link-button"
                >
                  <span>Return to Sign In</span>
                  <ArrowRight size={18} strokeWidth={1.5} />
                </Link>
                <button
                  type="button"
                  className="mk-forgot-text-button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmailError("");
                    setServerError("");
                  }}
                >
                  Try another email address
                </button>
              </div>
            ) : (
              /* FORGOT PASSWORD FORM */
              <>
                <div className="mk-forgot-heading">
                  <div className="mk-forgot-heading-icon">
                    <LockKeyhole
                      size={23}
                      strokeWidth={1.35}
                    />
                  </div>
                  <span className="mk-forgot-section-label">
                    ACCOUNT RECOVERY
                  </span>
                  <h2>
                    Forgot your <em>password?</em>
                  </h2>
                  <p>
                    Enter the email address associated with
                    your account. We'll help you begin the
                    password reset process.
                  </p>
                </div>
                <form onSubmit={handleSubmit} noValidate>
                  <div className="mk-forgot-field">
                    <label htmlFor={emailId}>
                      Email address
                    </label>
                    <div
                      className={`mk-forgot-input-wrap ${
                        emailError ? "is-invalid" : ""
                      }`}
                    >
                      <Mail
                        size={18}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      <input
                        id={emailId}
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        autoCapitalize="none"
                        spellCheck={false}
                        value={email}
                        onChange={handleEmailChange}
                        aria-invalid={Boolean(emailError)}
                        aria-describedby={
                          emailError
                            ? `${emailId}-error`
                            : undefined
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                    {emailError && (
                      <p
                        id={`${emailId}-error`}
                        className="mk-forgot-field-error"
                        role="alert"
                      >
                        {emailError}
                      </p>
                    )}
                  </div>
                  {serverError && (
                    <div
                      className="mk-forgot-server-error"
                      role="alert"
                    >
                      {serverError}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="mk-forgot-submit"
                    disabled={
                      isSubmitting || !isConfigured
                    }
                  >
                    <span>
                      {isSubmitting
                        ? "Sending instructions..."
                        : "Send Reset Link"}
                    </span>
                    {isSubmitting ? (
                      <span className="mk-forgot-button-spinner" />
                    ) : (
                      <ArrowRight
                        size={18}
                        strokeWidth={1.5}
                      />
                    )}
                  </button>
                  {!isConfigured && (
                    <p
                      className="mk-forgot-config-note"
                      role="status"
                    >
                      Password recovery is being configured.
                    </p>
                  )}
                </form>
                <div className="mk-forgot-divider">
                  <span />
                  <span>REMEMBER YOUR PASSWORD?</span>
                  <span />
                </div>
                <Link
                  to="/login"
                  className="mk-forgot-login-link"
                >
                  <ArrowLeft size={17} strokeWidth={1.5} />
                  Back to Sign In
                </Link>
                <div className="mk-forgot-security">
                  <ShieldCheck size={17} strokeWidth={1.5} />
                  <span>
                    Secure password recovery
                  </span>
                </div>
              </>
            )}
          </motion.div>
          <footer className="mk-forgot-footer">
            <span>
              © {new Date().getFullYear()} Maison Kiyora
            </span>
            <div>
              <Link to="/privacy-policy">
                Privacy
              </Link>
              <Link to="/terms">
                Terms
              </Link>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );

}

const forgotStyles = `
  .mk-forgot-page {
    --mk-ivory: #F5F0E8;
    --mk-navy: #1D2940;
    --mk-gold: #B69A69;
    --mk-sand: #D8C9B5;
    --mk-muted: #78777A;
    min-height: 100vh;
    background: var(--mk-ivory);
    color: var(--mk-navy);
    font-family: "Manrope", sans-serif;
  }
  .mk-forgot-page *,
  .mk-forgot-page *::before,
  .mk-forgot-page *::after {
    box-sizing: border-box;
  }
  .mk-forgot-layout {
    display: grid;
    grid-template-columns: minmax(0, 48%) minmax(0, 52%);
    min-height: 100vh;
  }
  .mk-forgot-brand {
    position: relative;
    min-height: 700px;
    overflow: hidden;
    color: #fff;
    background:
      radial-gradient(
        ellipse at 55% 75%,
        rgba(182,154,105,.27),
        transparent 49%
      ),
      linear-gradient(
        155deg,
        #29364d 0%,
        #1D2940 50%,
        #101a2b 100%
      );
  }
  .mk-forgot-brand::before {
    content: "";
    position: absolute;
    width: min(68%, 385px);
    aspect-ratio: .68;
    top: 19%;
    left: 50%;
    transform: translateX(-50%);
    border: 1px solid rgba(216,201,181,.18);
    border-radius: 48% 48% 7% 7%;
    box-shadow:
      0 0 0 22px rgba(216,201,181,.025),
      0 0 110px rgba(182,154,105,.09);
    pointer-events: none;
  }
  .mk-forgot-brand::after {
    content: "M";
    position: absolute;
    left: 50%;
    top: 34%;
    transform: translate(-50%, -50%);
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(170px, 20vw, 330px);
    font-weight: 300;
    font-style: italic;
    line-height: 1;
    color: rgba(245,240,232,.09);
    pointer-events: none;
  }
  .mk-forgot-brand-glow {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      120deg,
      transparent 20%,
      rgba(255,255,255,.025) 50%,
      transparent 80%
    );
    pointer-events: none;
  }
  .mk-forgot-brand-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 100%;
    padding: clamp(34px, 5vw, 76px);
  }
  .mk-forgot-brand-logo,
  .mk-forgot-mobile-logo {
    color: inherit;
    text-decoration: none;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 24px;
    letter-spacing: .18em;
    font-weight: 500;
  }
  .mk-forgot-brand-message {
    max-width: 440px;
  }
  .mk-forgot-eyebrow,
  .mk-forgot-section-label {
    display: inline-block;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .25em;
  }
  .mk-forgot-eyebrow {
    color: var(--mk-sand);
  }
  .mk-forgot-brand-message h1 {
    margin: 23px 0;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(70px, 7vw, 112px);
    font-weight: 300;
    letter-spacing: -.045em;
    line-height: .92;
  }
  .mk-forgot-brand-message h1 em {
    color: #dbc5a2;
    font-weight: 300;
  }
  .mk-forgot-brand-message p {
    max-width: 320px;
    margin: 0;
    color: rgba(255,255,255,.7);
    font-size: 12px;
    line-height: 2;
  }
  .mk-forgot-brand-rule {
    display: block;
    width: 70px;
    height: 1px;
    margin-top: 38px;
    background: var(--mk-gold);
  }
  .mk-forgot-brand-footer {
    color: rgba(245,240,232,.5);
    font-size: 9px;
    letter-spacing: .23em;
  }
  .mk-forgot-form-panel {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: 30px clamp(24px, 5vw, 80px) 25px;
  }
  .mk-forgot-topbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-height: 35px;
  }
  .mk-forgot-mobile-logo {
    display: none;
  }
  .mk-forgot-back {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    color: var(--mk-navy);
    text-decoration: none;
    font-size: 11px;
    font-weight: 600;
  }
  .mk-forgot-back:hover {
    color: #967a51;
  }
  .mk-forgot-form-container {
    width: 100%;
    max-width: 440px;
    margin: auto;
    padding: 65px 0;
  }
  .mk-forgot-heading {
    margin-bottom: 34px;
  }
  .mk-forgot-heading-icon {
    display: grid;
    place-items: center;
    width: 57px;
    height: 57px;
    margin-bottom: 28px;
    border: 1px solid #d8c9b5;
    border-radius: 50%;
    color: #a18a66;
  }
  .mk-forgot-section-label {
    color: #a38b66;
  }
  .mk-forgot-heading h2,
  .mk-forgot-success h2 {
    margin: 16px 0;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(54px, 5.2vw, 75px);
    font-weight: 400;
    letter-spacing: -.05em;
    line-height: .98;
  }
  .mk-forgot-heading h2 em,
  .mk-forgot-success h2 em {
    color: var(--mk-gold);
    font-weight: 300;
  }
  .mk-forgot-heading p,
  .mk-forgot-success p {
    max-width: 380px;
    margin: 0;
    color: var(--mk-muted);
    font-size: 12px;
    line-height: 1.95;
  }
  .mk-forgot-field {
    margin-bottom: 23px;
  }
  .mk-forgot-field label {
    display: block;
    margin-bottom: 11px;
    font-size: 11px;
    font-weight: 650;
  }
  .mk-forgot-input-wrap {
    display: flex;
    align-items: center;
    min-height: 54px;
    gap: 13px;
    padding: 0 15px;
    border: 1px solid #ddd5ca;
    background: rgba(255,255,255,.45);
    transition: border-color .2s, box-shadow .2s;
  }
  .mk-forgot-input-wrap:focus-within {
    border-color: var(--mk-gold);
    box-shadow: 0 0 0 3px rgba(182,154,105,.10);
  }
  .mk-forgot-input-wrap.is-invalid {
    border-color: #b85c55;
  }
  .mk-forgot-input-wrap > svg {
    flex-shrink: 0;
    color: #9b8d7b;
  }
  .mk-forgot-input-wrap input {
    flex: 1;
    min-width: 0;
    height: 52px;
    border: 0;
    outline: none;
    background: transparent;
    color: var(--mk-navy);
    font: inherit;
    font-size: 12px;
  }
  .mk-forgot-input-wrap input::placeholder {
    color: #aaa39a;
  }
  .mk-forgot-field-error {
    margin: 7px 0 0;
    color: #a64740;
    font-size: 11px;
    line-height: 1.6;
  }
  .mk-forgot-server-error {
    margin: 0 0 18px;
    padding: 12px 14px;
    background: #f7e9e6;
    border: 1px solid #e6c8c1;
    color: #9e453c;
    font-size: 11px;
    line-height: 1.7;
  }
  .mk-forgot-submit {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 55px;
    padding: 0 20px;
    border: 1px solid var(--mk-navy);
    background: var(--mk-navy);
    color: #fff;
    font: inherit;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .08em;
    cursor: pointer;
    transition: background .25s, transform .25s;
  }
  .mk-forgot-submit:hover:not(:disabled) {
    background: #30405a;
    transform: translateY(-1px);
  }
  .mk-forgot-submit:disabled {
    opacity: .55;
    cursor: not-allowed;
  }
  .mk-forgot-link-button {
    margin-top: 32px;
    text-decoration: none;
  }
  .mk-forgot-button-spinner,
  .mk-forgot-spinner {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255,255,255,.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: mk-forgot-spin .7s linear infinite;
  }
  @keyframes mk-forgot-spin {
    to { transform: rotate(360deg); }
  }
  .mk-forgot-config-note {
    margin: 12px 0 0;
    color: #8a6650;
    font-size: 10px;
  }
  .mk-forgot-divider {
    display: flex;
    align-items: center;
    gap: 13px;
    margin: 33px 0 22px;
  }
  .mk-forgot-divider span:first-child,
  .mk-forgot-divider span:last-child {
    flex: 1;
    height: 1px;
    background: #ded6cb;
  }
  .mk-forgot-divider span:nth-child(2) {
    color: #9a9084;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: .11em;
    white-space: nowrap;
  }
  .mk-forgot-login-link {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-height: 53px;
    border: 1px solid #c6b7a2;
    color: var(--mk-navy);
    text-decoration: none;
    font-size: 11px;
    font-weight: 600;
    transition: background .25s, border-color .25s;
  }
  .mk-forgot-login-link:hover {
    background: #eae0d2;
    border-color: var(--mk-gold);
  }
  .mk-forgot-security {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    margin-top: 28px;
    color: #8d8378;
    font-size: 10px;
  }
  .mk-forgot-security svg {
    color: #a18a66;
  }
  .mk-forgot-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    color: #8d867d;
    font-size: 10px;
  }
  .mk-forgot-footer div {
    display: flex;
    gap: 20px;
  }
  .mk-forgot-footer a {
    color: inherit;
    text-decoration: none;
  }
  .mk-forgot-footer a:hover {
    color: var(--mk-navy);
  }
  .mk-forgot-success {
    text-align: center;
  }
  .mk-forgot-success-icon {
    display: grid;
    place-items: center;
    width: 78px;
    height: 78px;
    margin: 0 auto 27px;
    border: 1px solid #d8c9b5;
    border-radius: 50%;
    color: #a18a66;
  }
  .mk-forgot-success h2 {
    margin-bottom: 22px;
  }
  .mk-forgot-success p {
    margin: 15px auto;
  }
  .mk-forgot-submitted-email {
    display: block;
    margin: 14px 0;
    color: #1D2940;
    font-size: 13px;
    overflow-wrap: anywhere;
  }
  .mk-forgot-success-notice {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 24px;
    padding: 13px;
    background: rgba(110,140,113,.08);
    border: 1px solid rgba(110,140,113,.2);
    color: #53735a;
    font-size: 10px;
    line-height: 1.6;
  }
  .mk-forgot-success-notice svg {
    flex-shrink: 0;
  }
  .mk-forgot-text-button {
    display: inline-block;
    margin-top: 23px;
    padding: 5px;
    border: 0;
    background: transparent;
    color: #95794f;
    font: inherit;
    font-size: 11px;
    cursor: pointer;
  }
  .mk-forgot-text-button:hover {
    text-decoration: underline;
  }
  .mk-forgot-loading {
    display: flex;
    min-height: 70vh;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    background: #F5F0E8;
    color: #1D2940;
    font-family: "Manrope", sans-serif;
    font-size: 12px;
  }
  .mk-forgot-spinner {
    border-color: #ded6cb;
    border-top-color: #1D2940;
  }
  @media (max-width: 900px) {
    .mk-forgot-layout {
      grid-template-columns: 42% 58%;
    }
    .mk-forgot-brand-content {
      padding: 34px;
    }
    .mk-forgot-form-panel {
      padding-inline: 30px;
    }
  }
  @media (max-width: 700px) {
    .mk-forgot-layout {
      display: block;
    }
    .mk-forgot-brand {
      display: none;
    }
    .mk-forgot-form-panel {
      min-height: 100vh;
      min-height: 100svh;
      padding: 24px 24px 22px;
    }
    .mk-forgot-topbar {
      justify-content: space-between;
    }
    .mk-forgot-mobile-logo {
      display: inline-block;
      font-size: 19px;
    }
    .mk-forgot-form-container {
      padding: 55px 0;
    }
    .mk-forgot-heading h2 {
      font-size: 60px;
    }
  }
  @media (max-width: 380px) {
    .mk-forgot-form-panel {
      padding-inline: 18px;
    }
    .mk-forgot-mobile-logo {
      font-size: 16px;
    }
    .mk-forgot-back {
      font-size: 10px;
    }
    .mk-forgot-heading h2 {
      font-size: 52px;
    }
    .mk-forgot-footer {
      flex-wrap: wrap;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .mk-forgot-page *,
    .mk-forgot-page *::before,
    .mk-forgot-page *::after {
      animation-duration: .01ms !important;
      transition-duration: .01ms !important;
    }
  }

`;

export default ForgotPassword;
