import { useEffect, useId, useMemo, useState } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { motion, useReducedMotion } from "framer-motion";

import { ArrowLeft, ArrowRight, Check, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";

import { toast } from "react-toastify";

import { useAuth } from "../context/AuthContext.jsx";



const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AUTH_BG = "/images/auth/maison-kiyora-auth-bg.png";

const INITIAL_FORM = { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" };



function safeDestination(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/account";
  if (/^\/(?:login|register)(?:\/|\?|#|$)/i.test(value)) return "/account";
  return value;
}



function passwordRules(password) {

  return [

    { label: "At least 8 characters", passed: password.length >= 8 },

    { label: "Uppercase and lowercase letters", passed: /[A-Z]/.test(password) && /[a-z]/.test(password) },

    { label: "At least one number", passed: /\d/.test(password) },

    { label: "At least one special character", passed: /[^A-Za-z0-9]/.test(password) },

  ];

}



function GoogleMark() {

  return <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">

    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>

    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.03 46.98 31.88 46.98 24.55z"/>

    <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.6.27-3.14.76-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.87.93 7.51 2.56 10.78l7.97-6.19z"/>

    <path fill="#34A853" d="M24 48c6.48 0 11.92-2.13 15.89-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"/>

  </svg>;

}



export default function Register() {

  const navigate = useNavigate();

  const location = useLocation();

  const reducedMotion = useReducedMotion();

  const auth = useAuth();

  const { register, isAuthenticated, isLoading, isSubmitting, isConfigured, clearError } = auth;

  const googleLogin = auth.loginWithGoogle ?? auth.signInWithGoogle;

  const id = useId();

  const [form, setForm] = useState(INITIAL_FORM);

  const [errors, setErrors] = useState({});

  const [serverError, setServerError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [confirmationEmail, setConfirmationEmail] = useState("");

  const [registrationComplete, setRegistrationComplete] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);



  const rules = useMemo(() => passwordRules(form.password), [form.password]);

  const strength = rules.filter((rule) => rule.passed).length;

  const strengthLabel = ["", "Needs improvement", "Fair", "Good", "Strong"][strength] || "Needs improvement";

  const from = location.state?.from;

  const fromPath = from?.pathname ? `${from.pathname}${from.search || ""}${from.hash || ""}` : null;

  const redirectTo = safeDestination(fromPath || new URLSearchParams(location.search).get("redirect"));



  useEffect(() => { document.title = "Create Account | Maison Kiyora"; }, []);

  useEffect(() => {

    if (!isLoading && isAuthenticated && !registrationComplete) navigate(redirectTo, { replace: true });

  }, [isLoading, isAuthenticated, registrationComplete, navigate, redirectTo]);

  useEffect(() => () => clearError?.(), [clearError]);



  function updateField(name, value) {

    setForm((previous) => ({ ...previous, [name]: value }));

    setErrors((previous) => ({ ...previous, [name]: "" }));

    setServerError("");

    clearError?.();

  }



  function validate() {

    const next = {};

    if (!form.firstName.trim()) next.firstName = "Please enter your first name.";

    else if (form.firstName.trim().length > 80) next.firstName = "First name is too long.";

    if (!form.lastName.trim()) next.lastName = "Please enter your last name.";

    else if (form.lastName.trim().length > 80) next.lastName = "Last name is too long.";

    if (!form.email.trim()) next.email = "Please enter your email address.";

    else if (!EMAIL_PATTERN.test(form.email.trim())) next.email = "Please enter a valid email address.";

    if (!form.password) next.password = "Please create a password.";

    else if (form.password.length < 8 || form.password.length > 72 || !rules.every((rule) => rule.passed))

      next.password = "Use 8–72 characters and meet all password requirements.";

    if (!form.confirmPassword) next.confirmPassword = "Please confirm your password.";

    else if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match.";

    if (!acceptedTerms) next.terms = "Please accept the Terms & Conditions and Privacy Policy.";

    setErrors(next);

    return Object.keys(next).length === 0;

  }



  async function handleSubmit(event) {

    event.preventDefault();

    if (isSubmitting || isLoading || googleLoading || !validate()) return;

    if (!isConfigured) { setServerError("Account registration is not available yet."); return; }

    try {

      setServerError("");

      const result = await register({

        firstName: form.firstName.trim(),

        lastName: form.lastName.trim(),

        fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,

        email: form.email.trim(),

        password: form.password,

        confirmPassword: form.confirmPassword,

        redirectPath: redirectTo,

      });

      if (!result?.success) {

        const reason = result?.error;

        throw new Error(typeof reason === "string" ? reason : reason?.message || "Unable to create your account.");

      }

      setForm((previous) => ({ ...previous, password: "", confirmPassword: "" }));

      if (result.requiresEmailConfirmation || !result.session) {

        setConfirmationEmail(form.email.trim());

        setRegistrationComplete(true);

        return;

      }

      toast.success("Welcome to Maison Kiyora.");

      navigate(redirectTo, { replace: true });

    } catch (error) {

      setServerError(error?.message || "We couldn't create your account. Please try again.");

    }

  }



  async function handleGoogle() {

    if (googleLoading || isSubmitting) return;

    if (!isConfigured) { setServerError("Customer authentication is not configured yet."); return; }

    if (typeof googleLogin !== "function") {

      setServerError("Google sign-in is not connected yet. Please register using email.");

      return;

    }

    setGoogleLoading(true);

    setServerError("");

    try {

      const result = await googleLogin({ redirectTo });

      if (result?.error) throw new Error(typeof result.error === "string" ? result.error : result.error.message || "Google sign-in failed.");

      if (result?.success && !result?.redirecting) toast.success("Welcome to Maison Kiyora.");

    } catch (error) {

      setServerError(error?.message || "Unable to continue with Google.");

    } finally { setGoogleLoading(false); }

  }



  function field(name, label, icon, options = {}) {

    const inputId = `${id}-${name}`;

    const isPassword = name === "password" || name === "confirmPassword";

    const visible = name === "password" ? showPassword : showConfirm;

    const toggle = name === "password" ? setShowPassword : setShowConfirm;

    return <div className="mkr-field" key={name}>

      <label htmlFor={inputId}>{label}</label>

      <div className={`mkr-input ${errors[name] ? "invalid" : ""}`}>

        {icon}

        <input id={inputId} type={isPassword ? (visible ? "text" : "password") : options.type || "text"}

          autoComplete={options.autoComplete} placeholder={options.placeholder || label}

          maxLength={options.maxLength} value={form[name]}

          autoCapitalize={name === "email" ? "none" : undefined}

          spellCheck={name === "email" ? false : undefined}

          onChange={(event) => updateField(name, event.target.value)}

          aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${inputId}-error` : undefined}

          disabled={isSubmitting || googleLoading} required />

        {isPassword && <button type="button" className="mkr-eye"

          onClick={() => toggle((previous) => !previous)}

          aria-label={visible ? `Hide ${label}` : `Show ${label}`} aria-pressed={visible}>

          {visible ? <EyeOff size={17}/> : <Eye size={17}/>}

        </button>}

      </div>

      {errors[name] && <p className="mkr-error" id={`${inputId}-error`} role="alert">{errors[name]}</p>}

    </div>;

  }



  if (isLoading) return <main className="mkr-loading"><style>{CSS}</style><span className="mkr-spinner"/>Preparing your experience...</main>;



  return <main className="mkr-page">

    <style>{CSS}</style>

    <div className="mkr-layout">

      <section className="mkr-editorial" aria-label="Maison Kiyora fragrance">

        <div className="mkr-editorial-top">

          <Link to="/" className="mkr-brand">MAISON KIYORA</Link>

          <span>THE ART OF SLOW PERFUMERY</span>

        </div>

        <motion.div className="mkr-editorial-copy"

          initial={reducedMotion ? false : { opacity: 0, y: 25 }}

          animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }}>

          <span className="mkr-rule"/>

          <p className="mkr-image-tagline">SCENTS THAT STAY WITH YOU.</p>



        </motion.div>

        <div className="mkr-editorial-bottom"><span>AN INVITATION TO DISCOVER</span><span>MAISON KIYORA · INDIA</span></div>

      </section>

      <section className="mkr-panel">

        <header className="mkr-topbar">

          <Link to="/" className="mkr-mobile-brand">MAISON KIYORA</Link>

          <Link to="/" className="mkr-back"><ArrowLeft size={15}/>Back to Maison</Link>

        </header>

        <motion.div className="mkr-content"

          initial={reducedMotion ? false : { opacity: 0, y: 15 }}

          animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>

          {registrationComplete ? <div className="mkr-confirmation" role="status">

            <div className="mkr-confirm-icon"><Mail size={29}/></div>

            <span className="mkr-eyebrow">ONE MORE STEP</span>

            <h2>Check your <em>inbox.</em></h2>

            <p>If email confirmation is required, instructions have been sent to:</p>

            <strong>{confirmationEmail}</strong>

            <p>Open the confirmation link to complete registration. Check your spam folder if you don't see it.</p>

            <Link to={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="mkr-primary-link">

              Continue to Sign In <ArrowRight size={18}/>

            </Link>

            <Link to="/" className="mkr-text-link">Return to Maison Kiyora</Link>

          </div> : <>

            <div className="mkr-heading">

              <span className="mkr-eyebrow">BECOME PART OF THE MAISON</span>

              <h2>Create your <em>account.</em></h2>

              <p>A personal space for your favourite fragrances and orders.</p>

            </div>

            <form onSubmit={handleSubmit} noValidate>

              <div className="mkr-name-grid">

                {field("firstName", "First name", <UserRound size={17}/>, { autoComplete: "given-name", maxLength: 80 })}

                {field("lastName", "Last name", <UserRound size={17}/>, { autoComplete: "family-name", maxLength: 80 })}

              </div>

              {field("email", "Email address", <Mail size={17}/>, { type: "email", autoComplete: "email", placeholder: "you@example.com" })}

              {field("password", "Create password", <LockKeyhole size={17}/>, { autoComplete: "new-password" })}

              {form.password.length > 0 && <div className="mkr-password-guide">

                <div className="mkr-strength-label"><span>Password strength</span><span>{strengthLabel}</span></div>

                <div className="mkr-strength-bars" aria-label={`Password strength: ${strengthLabel}`}>

                  {[1, 2, 3, 4].map((level) => <span key={level} className={level <= strength ? `active level-${strength}` : ""}/>)}

                </div>

                <div className="mkr-rules">{rules.map((rule) => <div key={rule.label} className={rule.passed ? "passed" : ""}>

                  <Check size={13}/>{rule.label}

                </div>)}</div>

              </div>}

              {field("confirmPassword", "Confirm password", <LockKeyhole size={17}/>, { autoComplete: "new-password", placeholder: "Re-enter your password" })}

              {form.confirmPassword && form.confirmPassword === form.password &&

                <p className="mkr-match"><CheckCircle2 size={14}/> Passwords match</p>}

              <div className="mkr-terms">

                <input id={`${id}-terms`} type="checkbox" checked={acceptedTerms}

                  onChange={(event) => { setAcceptedTerms(event.target.checked); setErrors((previous) => ({ ...previous, terms: "" })); }}

                  disabled={isSubmitting || googleLoading} aria-invalid={Boolean(errors.terms)} />

                <label htmlFor={`${id}-terms`}>I agree to the <Link to="/terms" target="\_blank" rel="noopener noreferrer">Terms & Conditions</Link> and <Link to="/privacy-policy" target="\_blank" rel="noopener noreferrer">Privacy Policy</Link>.</label>

              </div>

              {errors.terms && <p className="mkr-error" role="alert">{errors.terms}</p>}

              {serverError && <div className="mkr-server-error" role="alert">{serverError}</div>}

              <button type="submit" className="mkr-primary" disabled={isSubmitting || googleLoading || !isConfigured}>

                <span>{isSubmitting ? "CREATING YOUR ACCOUNT..." : "CREATE ACCOUNT"}</span>

                {isSubmitting ? <span className="mkr-spinner"/> : <ArrowRight size={19}/>}

              </button>

              {!isConfigured && <p className="mkr-config" role="status">Customer registration is being configured.</p>}

            </form>

            <div className="mkr-divider"><span/>OR CONTINUE WITH<span/></div>

            <button type="button" className="mkr-google" onClick={handleGoogle}

              disabled={googleLoading || isSubmitting || !isConfigured}>

              {googleLoading ? <span className="mkr-google-spinner"/> : <GoogleMark/>}

              {googleLoading ? "Connecting to Google..." : "Continue with Google"}

            </button>

            <p className="mkr-signin">Already part of the Maison? <Link to={`/login?redirect=${encodeURIComponent(redirectTo)}`}>Sign in</Link></p>

            <div className="mkr-security"><ShieldCheck size={16}/>Secure account registration</div>

          </>}

        </motion.div>

        <footer className="mkr-footer"><span>© {new Date().getFullYear()} Maison Kiyora</span>

          <div><Link to="/privacy-policy">Privacy</Link><Link to="/terms">Terms</Link></div>

        </footer>

      </section>

    </div>

  </main>;

}



const CSS = `

.mkr-page{--ivory:#F5F0E8;--espresso:#211C19;--gold:#B69A69;--sand:#D8C9B5;min-height:100vh;background:var(--ivory);color:var(--espresso);font-family:"Manrope",sans-serif}

.mkr-page *,.mkr-page *::before,.mkr-page *::after{box-sizing:border-box}

.mkr-layout{display:grid;grid-template-columns:minmax(0,40%) minmax(0,60%);min-height:100dvh}

.mkr-editorial{position:relative;isolation:isolate;display:flex;flex-direction:column;justify-content:space-between;min-height:0;overflow:hidden;padding:clamp(24px,3vw,42px);color:#211C19;background:#E9E0D4 url("/images/auth/maison-kiyora-auth-bg.png") center 48% / cover no-repeat}

.mkr-editorial::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(245,240,232,.62),transparent 30%,transparent 75%,rgba(33,28,25,.32))}

.mkr-editorial-top{z-index:3;display:flex;flex-direction:column;align-items:flex-start;gap:8px}

.mkr-brand,.mkr-mobile-brand{font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(23px,2.5vw,36px);letter-spacing:.17em;font-weight:400;color:inherit;text-decoration:none;white-space:nowrap}

.mkr-editorial-top>span{font-size:9px;letter-spacing:.27em;color:#665341}

.mkr-editorial-copy{position:relative;z-index:3;margin-top:15px;margin-bottom:auto;max-width:370px}

.mkr-rule{display:block;width:38px;height:1px;margin-bottom:12px;background:#9D7E50}

.mkr-image-tagline{margin:0;font-size:10px;font-weight:650;letter-spacing:.19em;line-height:1.8;color:#4C3B2E}

.mkr-editorial-bottom{z-index:3;display:flex;justify-content:space-between;gap:12px;font-size:9px;letter-spacing:.13em;color:#F5F0E8;text-shadow:0 1px 10px rgba(0,0,0,.45)}

.mkr-panel{display:flex;flex-direction:column;min-width:0;padding:18px clamp(24px,4vw,62px) 18px;background:radial-gradient(ellipse at 90% 5%,rgba(216,201,181,.22),transparent 35%),var(--ivory)}

.mkr-topbar{display:flex;align-items:center;justify-content:flex-end;min-height:36px}

.mkr-mobile-brand{display:none}

.mkr-back{display:inline-flex;align-items:center;gap:9px;color:var(--espresso);font-size:11px;text-decoration:none}

.mkr-back:hover{color:#927448}

.mkr-content{width:100%;max-width:490px;margin:auto;padding:22px 0}

.mkr-eyebrow{font-size:10px;font-weight:650;letter-spacing:.24em;color:#997B52}

.mkr-heading{margin-bottom:18px}

.mkr-heading h2,.mkr-confirmation h2{margin:8px 0 7px;font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(46px,4vw,62px);font-weight:400;line-height:1;letter-spacing:-.045em}

.mkr-heading h2 em,.mkr-confirmation h2 em{color:#A98A5B;font-weight:400}

.mkr-heading p,.mkr-confirmation p{max-width:390px;margin:0;font-size:12px;line-height:1.9;color:#77716B}

.mkr-name-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}

.mkr-field{min-width:0;margin-bottom:12px}

.mkr-field label{display:block;margin-bottom:6px;font-size:11px;font-weight:650}

.mkr-input{display:flex;align-items:center;gap:11px;min-height:45px;padding:0 12px;border:1px solid #DCD3C6;background:rgba(255,255,255,.58);transition:border-color .2s,box-shadow .2s}

.mkr-input:focus-within{border-color:var(--gold);box-shadow:0 0 0 3px rgba(182,154,105,.09);background:#fff}

.mkr-input.invalid{border-color:#B85C55}

.mkr-input>svg{flex-shrink:0;color:#8E806E}

.mkr-input input{flex:1;min-width:0;height:43px;border:0;outline:0;background:transparent;color:var(--espresso);font:inherit;font-size:12px}

.mkr-input input::placeholder{color:#A7A098}

.mkr-eye{display:grid;place-items:center;flex-shrink:0;width:30px;height:35px;border:0;background:transparent;color:#81766B;cursor:pointer}

.mkr-error{margin:7px 0 0;color:#A64740;font-size:10px;line-height:1.6}

.mkr-password-guide{margin:-2px 0 12px;padding:10px;border:1px solid #E5DCD0;background:rgba(255,255,255,.32)}

.mkr-strength-label{display:flex;justify-content:space-between;gap:10px;margin-bottom:9px;color:#77716B;font-size:10px}

.mkr-strength-bars{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:13px}

.mkr-strength-bars span{height:3px;background:#DED7CD}

.mkr-strength-bars .active.level-1{background:#B65D52}

.mkr-strength-bars .active.level-2{background:#C18D53}

.mkr-strength-bars .active.level-3{background:#A9975B}

.mkr-strength-bars .active.level-4{background:#718B72}

.mkr-rules{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}

.mkr-rules>div{display:flex;align-items:center;gap:6px;color:#96918A;font-size:9px;line-height:1.5}

.mkr-rules svg{flex-shrink:0}

.mkr-rules .passed{color:#53735A}

.mkr-match{display:flex;align-items:center;gap:6px;margin:-10px 0 17px;color:#53735A;font-size:10px}

.mkr-terms{display:flex;align-items:flex-start;gap:11px;margin:6px 0 13px}

.mkr-terms input{flex-shrink:0;width:16px;height:16px;margin:2px 0 0;accent-color:var(--espresso);cursor:pointer}

.mkr-terms label{color:#77716B;font-size:10px;line-height:1.9}

.mkr-terms a{color:var(--espresso);text-underline-offset:3px}

.mkr-server-error{margin:0 0 18px;padding:12px 14px;border:1px solid #E5C6BF;background:#F7E9E6;color:#9D463F;font-size:11px;line-height:1.7}

.mkr-primary,.mkr-primary-link{display:flex;align-items:center;justify-content:space-between;width:100%;min-height:48px;padding:0 17px;border:1px solid var(--espresso);background:var(--espresso);color:var(--ivory);font:inherit;font-size:11px;font-weight:650;letter-spacing:.12em;text-decoration:none;cursor:pointer;transition:background .2s,transform .2s}

.mkr-primary:hover:not(:disabled),.mkr-primary-link:hover{background:#40332B;transform:translateY(-1px)}

.mkr-primary:disabled,.mkr-google:disabled{opacity:.55;cursor:not-allowed}

.mkr-spinner,.mkr-google-spinner{display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,.3);border-top-color:currentColor;border-radius:50%;animation:mkr-spin .7s linear infinite}

.mkr-google-spinner{border-color:#DDD3C6;border-top-color:var(--espresso)}

@keyframes mkr-spin{to{transform:rotate(360deg)}}

.mkr-divider{display:flex;align-items:center;gap:13px;margin:16px 0 13px;color:#8E8275;font-size:9px;font-weight:650;letter-spacing:.15em}

.mkr-divider span{flex:1;height:1px;background:#DDD3C6}

.mkr-google{display:flex;align-items:center;justify-content:center;gap:13px;width:100%;min-height:46px;padding:0 14px;border:1px solid #D9D0C5;background:rgba(255,255,255,.6);color:var(--espresso);font:inherit;font-size:12px;font-weight:600;cursor:pointer}

.mkr-google:hover:not(:disabled){border-color:var(--gold);background:#fff}

.mkr-signin{margin:16px 0 0;text-align:center;color:#77716B;font-size:11px}

.mkr-signin a{margin-left:4px;color:#967549;font-weight:650;text-underline-offset:4px}

.mkr-security{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:15px;color:#8C8378;font-size:10px}

.mkr-security svg{color:#A98A5B}

.mkr-footer{display:flex;justify-content:space-between;align-items:center;gap:15px;color:#8C8378;font-size:10px}

.mkr-footer div{display:flex;gap:20px}

.mkr-footer a{color:inherit;text-decoration:none}

.mkr-confirmation{text-align:center}

.mkr-confirm-icon{display:grid;place-items:center;width:74px;height:74px;margin:0 auto 26px;border:1px solid var(--sand);border-radius:50%;color:#A98A5B}

.mkr-confirmation p{margin:16px auto}

.mkr-confirmation strong{display:block;overflow-wrap:anywhere;margin:15px 0;font-size:13px}

.mkr-confirmation .mkr-primary-link{margin-top:34px}

.mkr-text-link{display:inline-block;margin-top:25px;color:#967549;font-size:11px;text-decoration:none}

.mkr-config{margin:12px 0 0;color:#927049;font-size:10px}

.mkr-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:15px;min-height:100vh;background:#F5F0E8;color:#211C19;font-family:"Manrope",sans-serif;font-size:12px}

.mkr-loading .mkr-spinner{border-color:#DDD3C6;border-top-color:#211C19}

.mkr-page a:focus-visible,.mkr-page button:focus-visible{outline:2px solid var(--gold);outline-offset:4px}

@media(max-width:1000px){.mkr-layout{grid-template-columns:38% 62%}.mkr-editorial{padding:35px}.mkr-panel{padding-inline:32px}}

@media(max-width:760px){.mkr-layout{grid-template-columns:1fr}.mkr-editorial{min-height:285px;padding:26px 24px;background-position:center 56%}.mkr-editorial-copy{margin:27px 0 0}.mkr-rule{margin-bottom:14px}.mkr-editorial-bottom{display:none}.mkr-panel{min-height:auto;padding:20px 24px 24px}.mkr-content{padding:38px 0 45px}.mkr-heading h2{font-size:clamp(53px,10vw,72px)}}

@media(max-width:440px){.mkr-editorial{min-height:255px;padding:22px 19px;background-position:center 56%}.mkr-brand{font-size:21px}.mkr-editorial-top>span{font-size:7px}.mkr-panel{padding-inline:20px}.mkr-name-grid{grid-template-columns:1fr;gap:0}.mkr-rules{grid-template-columns:1fr}.mkr-heading h2{font-size:53px}.mkr-footer{flex-wrap:wrap}}

/* Compact responsive refinements */
.mkr-editorial { background-position: center 48%; }
.mkr-editorial::before { background:linear-gradient(180deg,rgba(245,240,232,.65) 0%,transparent 24%,transparent 80%,rgba(33,28,25,.18) 100%); }
.mkr-editorial-copy { margin-top:18px; }
.mkr-editorial-bottom { font-size:8px; }
.mkr-footer { padding-top:12px; }
@media(max-width:760px){
 .mkr-layout{grid-template-columns:1fr;min-height:100dvh}
 .mkr-editorial{min-height:0;height:220px;padding:20px 24px;background-position:center 55%}
 .mkr-editorial-copy{margin-top:15px}
 .mkr-editorial-bottom{display:none}
 .mkr-panel{padding:12px 24px 20px}
 .mkr-content{padding:20px 0 25px}
 .mkr-heading h2{font-size:clamp(45px,8vw,60px)}
}
@media(max-width:440px){
 .mkr-editorial{height:180px;padding:17px 19px;background-position:center 55%}
 .mkr-editorial-top>span{font-size:7px}
 .mkr-editorial-copy{margin-top:10px}
 .mkr-image-tagline{font-size:8px}
 .mkr-panel{padding:10px 19px 20px}
 .mkr-content{padding:16px 0 22px}
 .mkr-name-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
 .mkr-rules{grid-template-columns:1fr}
 .mkr-heading h2{font-size:46px}
}

@media(prefers-reduced-motion:reduce){.mkr-page *,.mkr-page *::before,.mkr-page *::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}

`;
