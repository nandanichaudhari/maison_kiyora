import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2, Mail, MessageSquareText, Send, ShieldCheck, Sparkles } from "lucide-react";

// Maison Kiyora — Contact
// Set VITE_CONTACT_EMAIL to receive mailto enquiries, or VITE_CONTACT_API_URL
// to submit to your own secure backend. Never place API secrets in Vite env vars.
const CONTACT_EMAIL = (import.meta.env.VITE_CONTACT_EMAIL || "").trim();
const CONTACT_API_URL = (import.meta.env.VITE_CONTACT_API_URL || "").trim();
const SUBJECTS = ["Product enquiry", "Existing order", "Shipping & delivery", "Returns & refunds", "Collaboration", "Something else"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INITIAL_FORM = { name: "", email: "", subject: "Product enquiry", orderNumber: "", message: "", consent: false, website: "" };

function Reveal({ children, className = "", delay = 0 }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function FieldError({ id, children }) {
  return children ? <span id={id} className="mk-contact-field-error" role="alert">{children}</span> : null;
}

export default function Contact() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [feedback, setFeedback] = useState("");
  const canSubmit = Boolean(CONTACT_API_URL || CONTACT_EMAIL);

  useEffect(() => {
    document.title = "Contact Us | Maison Kiyora";
  }, []);

  const deliveryMode = useMemo(() => CONTACT_API_URL ? "api" : CONTACT_EMAIL ? "email" : "none", []);

  const update = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
    if (status !== "sending") {
      setStatus("idle");
      setFeedback("");
    }
  };

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Please enter your name (at least 2 characters).";
    if (!EMAIL_PATTERN.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (!SUBJECTS.includes(form.subject)) next.subject = "Please choose a subject.";
    if (form.message.trim().length < 15) next.message = "Please write at least 15 characters.";
    if (form.message.trim().length > 3000) next.message = "Please keep your message under 3,000 characters.";
    if (form.orderNumber.trim().length > 80) next.orderNumber = "Order reference is too long.";
    if (!form.consent) next.consent = "Please confirm that we may use your details to reply.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === "sending" || !validate()) return;
    if (form.website) return; // Honeypot. Backend must also validate and rate-limit.
    if (!canSubmit) {
      setStatus("error");
      setFeedback("The contact form isn't connected yet. Please try again later.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject,
      orderNumber: form.orderNumber.trim(),
      message: form.message.trim(),
    };

    if (deliveryMode === "email") {
      const body = [
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        `Topic: ${payload.subject}`,
        payload.orderNumber ? `Order reference: ${payload.orderNumber}` : null,
        "",
        payload.message,
      ].filter((line) => line !== null).join("\n");
      const subject = `Maison Kiyora enquiry — ${payload.subject}`;
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStatus("email");
      setFeedback("Your email app should open with a prepared message. Please press Send there to complete your enquiry.");
      return;
    }

    setStatus("sending");
    setFeedback("");
    try {
      const response = await fetch(CONTACT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Unable to submit your enquiry. Please try again.");
      setForm(INITIAL_FORM);
      setErrors({});
      setStatus("success");
      setFeedback("Thank you. Your message has been submitted.");
    } catch (error) {
      setStatus("error");
      setFeedback(error?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <main className="mk-contact-page">
      <style>{styles}</style>
      <section className="mk-contact-hero" aria-labelledby="mk-contact-title">
        <div className="mk-contact-hero-glow" aria-hidden="true" />
        <motion.div className="mk-contact-hero-inner" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <span className="mk-contact-eyebrow">MAISON KIYORA / GET IN TOUCH</span>
          <h1 id="mk-contact-title">We'd love to <em>hear from you.</em></h1>
          <p>Questions about a fragrance, an order, or something else? Leave us a message.</p>
        </motion.div>
        <span className="mk-contact-hero-mark" aria-hidden="true">MK</span>
      </section>

      <section className="mk-contact-content" aria-label="Contact options and enquiry form">
        <div className="mk-contact-layout">
          <Reveal className="mk-contact-aside">
            <span className="mk-contact-eyebrow">A PERSONAL CONNECTION</span>
            <h2>Every note <em>matters.</em></h2>
            <p className="mk-contact-aside-intro">Whether you're exploring our fragrances or need help with an existing purchase, we're here to listen.</p>

            <div className="mk-contact-info-card">
              <span className="mk-contact-info-icon"><Mail size={20} strokeWidth={1.5} /></span>
              <div>
                <h3>Write to us</h3>
                {CONTACT_EMAIL ? (
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                ) : (
                  <p>Use the enquiry form to get in touch.</p>
                )}
              </div>
            </div>
            <div className="mk-contact-info-card">
              <span className="mk-contact-info-icon"><MessageSquareText size={20} strokeWidth={1.5} /></span>
              <div>
                <h3>Already placed an order?</h3>
                <p>Include your order reference so we can identify your enquiry.</p>
                <Link to="/orders">View your orders <ArrowRight size={13} /></Link>
              </div>
            </div>

            <div className="mk-contact-aside-divider" />
            <span className="mk-contact-eyebrow">EXPLORE THE MAISON</span>
            <Link to="/collections" className="mk-contact-collection-link">
              Discover our fragrances <ArrowRight size={17} />
            </Link>
            <Link to="/our-story" className="mk-contact-collection-link">
              Our story <ArrowRight size={17} />
            </Link>
          </Reveal>

          <Reveal className="mk-contact-form-panel" delay={0.12}>
            <div className="mk-contact-form-heading">
              <div>
                <span className="mk-contact-eyebrow">YOUR ENQUIRY</span>
                <h2>Send a <em>message.</em></h2>
              </div>
              <Sparkles size={23} strokeWidth={1} aria-hidden="true" />
            </div>
            <p className="mk-contact-form-intro">Tell us how we can help. Fields marked * are required.</p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="mk-contact-form-row">
                <div className="mk-contact-field">
                  <label htmlFor="mk-contact-name">YOUR NAME *</label>
                  <input id="mk-contact-name" type="text" autoComplete="name" maxLength={120} placeholder="Your full name" value={form.name} onChange={(e) => update("name", e.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "mk-contact-name-error" : undefined} />
                  <FieldError id="mk-contact-name-error">{errors.name}</FieldError>
                </div>
                <div className="mk-contact-field">
                  <label htmlFor="mk-contact-email">EMAIL ADDRESS *</label>
                  <input id="mk-contact-email" type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "mk-contact-email-error" : undefined} />
                  <FieldError id="mk-contact-email-error">{errors.email}</FieldError>
                </div>
              </div>
              <div className="mk-contact-form-row">
                <div className="mk-contact-field">
                  <label htmlFor="mk-contact-subject">HOW CAN WE HELP? *</label>
                  <select id="mk-contact-subject" value={form.subject} onChange={(e) => update("subject", e.target.value)} aria-invalid={Boolean(errors.subject)}>
                    {SUBJECTS.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                  </select>
                  <FieldError id="mk-contact-subject-error">{errors.subject}</FieldError>
                </div>
                <div className="mk-contact-field">
                  <label htmlFor="mk-contact-order">ORDER REFERENCE <span>(OPTIONAL)</span></label>
                  <input id="mk-contact-order" type="text" maxLength={80} placeholder="If applicable" value={form.orderNumber} onChange={(e) => update("orderNumber", e.target.value)} aria-invalid={Boolean(errors.orderNumber)} />
                  <FieldError id="mk-contact-order-error">{errors.orderNumber}</FieldError>
                </div>
              </div>
              <div className="mk-contact-field">
                <label htmlFor="mk-contact-message">YOUR MESSAGE *</label>
                <textarea id="mk-contact-message" rows={6} maxLength={3000} placeholder="Tell us a little more about your enquiry..." value={form.message} onChange={(e) => update("message", e.target.value)} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "mk-contact-message-error" : undefined} />
                <div className="mk-contact-character-count">{form.message.length} / 3000</div>
                <FieldError id="mk-contact-message-error">{errors.message}</FieldError>
              </div>
              <div className="mk-contact-honeypot" aria-hidden="true">
                <label htmlFor="mk-contact-website">Website</label>
                <input id="mk-contact-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => update("website", e.target.value)} />
              </div>
              <div className="mk-contact-consent">
                <input id="mk-contact-consent" type="checkbox" checked={form.consent} onChange={(e) => update("consent", e.target.checked)} aria-invalid={Boolean(errors.consent)} />
                <label htmlFor="mk-contact-consent">I agree that Maison Kiyora may use the information provided to respond to my enquiry. Read our <Link to="/privacy-policy">Privacy Policy</Link>.</label>
              </div>
              <FieldError id="mk-contact-consent-error">{errors.consent}</FieldError>

              {feedback && (
                <div className={`mk-contact-feedback mk-contact-feedback-${status}`} role={status === "error" ? "alert" : "status"}>
                  {status === "success" ? <CheckCircle2 size={19} /> : <Mail size={19} />}
                  <span>{feedback}</span>
                </div>
              )}

              <button className="mk-contact-submit" type="submit" disabled={status === "sending" || !canSubmit}>
                <span>{status === "sending" ? "SENDING..." : deliveryMode === "email" ? "OPEN EMAIL TO SEND" : "SEND ENQUIRY"}</span>
                <Send size={17} strokeWidth={1.5} />
              </button>
              {!canSubmit && <p className="mk-contact-config-note">Contact delivery has not been configured yet. Add VITE_CONTACT_EMAIL or VITE_CONTACT_API_URL to your environment.</p>}
              <div className="mk-contact-privacy-note"><ShieldCheck size={15} strokeWidth={1.5} /><span>Your details are requested only to handle your enquiry.</span></div>
            </form>
          </Reveal>
        </div>
      </section>

      <section className="mk-contact-outro">
        <Reveal>
          <span className="mk-contact-eyebrow">THE ART OF SLOW PERFUMERY</span>
          <h2>A little more <em>to discover.</em></h2>
          <Link to="/collections">EXPLORE THE COLLECTION <ArrowRight size={18} /></Link>
        </Reveal>
      </section>
    </main>
  );
}

const styles = `
.mk-contact-page{--ivory:#F5F0E8;--espresso:#211C19;--gold:#B69A69;--sand:#D8C9B5;min-height:100vh;background:var(--ivory);color:var(--espresso);font-family:"Manrope",sans-serif}
.mk-contact-page *,.mk-contact-page *:before,.mk-contact-page *:after{box-sizing:border-box}
.mk-contact-page a{color:inherit;text-decoration:none}
.mk-contact-eyebrow{display:block;font-size:10px;font-weight:650;letter-spacing:.23em;color:#a08760;line-height:1.7}
.mk-contact-hero{position:relative;min-height:410px;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:145px 24px 85px;background:linear-gradient(135deg,#ece3d6,#f5f0e8 60%,#e9dece);text-align:center}
.mk-contact-hero-glow{position:absolute;inset:-30%;background:radial-gradient(ellipse at 68% 40%,rgba(182,154,105,.16),transparent 45%);pointer-events:none}
.mk-contact-hero-inner{position:relative;z-index:1;max-width:850px}
.mk-contact-hero h1{margin:21px 0;font:400 clamp(58px,8vw,110px)/.96 "Cormorant Garamond",Georgia,serif;letter-spacing:-.05em}
.mk-contact-hero h1 em,.mk-contact-page h2 em{font-weight:300;color:var(--gold)}
.mk-contact-hero p{margin:0 auto;max-width:530px;color:#81776f;font-size:12px;line-height:2}
.mk-contact-hero-mark{position:absolute;bottom:-76px;right:4%;font:300 280px/1 "Cormorant Garamond",Georgia,serif;letter-spacing:-.12em;color:rgba(182,154,105,.075);pointer-events:none}
.mk-contact-content{padding:95px 24px 125px}
.mk-contact-layout{max-width:1250px;margin:auto;display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:clamp(40px,7vw,115px);align-items:start}
.mk-contact-aside{padding-top:15px}
.mk-contact-aside h2,.mk-contact-form-heading h2,.mk-contact-outro h2{margin:17px 0 0;font:400 clamp(52px,5.3vw,78px)/1 "Cormorant Garamond",Georgia,serif;letter-spacing:-.045em}
.mk-contact-aside-intro{max-width:365px;margin:23px 0 45px;color:#79736d;font-size:12px;line-height:2.1}
.mk-contact-info-card{display:flex;gap:18px;align-items:flex-start;margin:0 0 33px}
.mk-contact-info-icon{display:grid;place-items:center;flex-shrink:0;width:45px;height:45px;border:1px solid #d7c9b4;color:#a58a61}
.mk-contact-info-card h3{margin:2px 0 8px;font-size:12px;font-weight:700}
.mk-contact-info-card p,.mk-contact-info-card a{margin:0;font-size:11px;line-height:1.9;color:#77716c;overflow-wrap:anywhere}
.mk-contact-info-card a{display:inline-flex;align-items:center;gap:7px;border-bottom:1px solid #c5b59b;padding-bottom:3px}
.mk-contact-aside-divider{height:1px;background:#ded3c5;margin:42px 0 34px}
.mk-contact-collection-link{display:flex;align-items:center;justify-content:space-between;gap:15px;max-width:340px;padding:18px 0;border-bottom:1px solid #ded3c5;font-size:12px}
.mk-contact-collection-link:hover{color:#94764e}
.mk-contact-form-panel{background:#fffdf9;border:1px solid #e5dcd0;padding:clamp(26px,4vw,55px);box-shadow:0 24px 70px rgba(42,30,19,.035)}
.mk-contact-form-heading{display:flex;justify-content:space-between;gap:18px;align-items:center}
.mk-contact-form-heading h2{font-size:clamp(49px,4.5vw,65px)}
.mk-contact-form-heading>svg{color:#b69a69;flex-shrink:0}
.mk-contact-form-intro{margin:16px 0 35px;color:#817a72;font-size:11px;line-height:1.9}
.mk-contact-form-row{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.mk-contact-field{display:flex;flex-direction:column;min-width:0;margin-bottom:22px}
.mk-contact-field label{margin-bottom:10px;font-size:9px;font-weight:700;letter-spacing:.15em}
.mk-contact-field label span{color:#a09b95;font-weight:500}
.mk-contact-field input,.mk-contact-field select,.mk-contact-field textarea{width:100%;min-height:49px;padding:13px 14px;border:1px solid #e0d6c9;border-radius:0;background:#fffdfa;color:#211c19;font:400 12px/1.6 "Manrope",sans-serif;outline:none;transition:border-color .2s,box-shadow .2s}
.mk-contact-field textarea{resize:vertical;min-height:148px}
.mk-contact-field input:focus,.mk-contact-field select:focus,.mk-contact-field textarea:focus{border-color:#b69a69;box-shadow:0 0 0 3px rgba(182,154,105,.1)}
.mk-contact-field input::placeholder,.mk-contact-field textarea::placeholder{color:#a8a29a}
.mk-contact-field [aria-invalid="true"]{border-color:#b76b66}
.mk-contact-field-error{display:block;color:#a44949;font-size:10px;line-height:1.6;margin:6px 0 0}
.mk-contact-character-count{text-align:right;margin-top:6px;color:#9a938a;font-size:9px}
.mk-contact-consent{display:flex;gap:12px;align-items:flex-start;margin:8px 0 22px}
.mk-contact-consent input{width:16px;height:16px;accent-color:#211c19;flex-shrink:0;margin-top:2px}
.mk-contact-consent label{color:#79736d;font-size:10px;line-height:1.9;cursor:pointer}
.mk-contact-consent label a{color:#8e714b;border-bottom:1px solid #b69a69}
.mk-contact-submit{display:flex;align-items:center;justify-content:space-between;gap:20px;width:100%;min-height:56px;margin-top:20px;padding:0 22px;border:1px solid #211c19;background:#211c19;color:#fff;font:650 10px "Manrope",sans-serif;letter-spacing:.15em;cursor:pointer;transition:background .2s}
.mk-contact-submit:hover:not(:disabled){background:#4a3b2e}
.mk-contact-submit:disabled{opacity:.5;cursor:not-allowed}
.mk-contact-feedback{display:flex;align-items:flex-start;gap:10px;margin:15px 0;padding:14px;border:1px solid #d7c9b4;background:#f7f2eb;font-size:11px;line-height:1.8}
.mk-contact-feedback svg{flex-shrink:0;margin-top:2px}
.mk-contact-feedback-success{color:#386348;border-color:#bad4bd;background:#f1f8f1}
.mk-contact-feedback-error{color:#994646;border-color:#e4b7b7;background:#fff5f4}
.mk-contact-config-note{font-size:10px;line-height:1.7;color:#9b5d4b}
.mk-contact-privacy-note{display:flex;gap:8px;align-items:center;margin-top:18px;color:#918a82;font-size:9px;line-height:1.6}
.mk-contact-privacy-note svg{flex-shrink:0;color:#a18b6a}
.mk-contact-honeypot{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;overflow:hidden!important}
.mk-contact-outro{padding:100px 24px 110px;text-align:center;background:#eae0d2}
.mk-contact-outro h2{margin:20px 0 30px}
.mk-contact-outro a{display:inline-flex;align-items:center;gap:25px;padding:17px 22px;border:1px solid #211c19;background:#211c19;color:#fff;font-size:10px;letter-spacing:.12em}
.mk-contact-outro a:hover{background:#47392e}
@media(max-width:850px){.mk-contact-layout{grid-template-columns:1fr;gap:55px}.mk-contact-aside{max-width:620px}.mk-contact-content{padding:65px 20px 90px}}
@media(max-width:540px){.mk-contact-hero{padding:125px 20px 70px;min-height:355px}.mk-contact-hero h1{font-size:58px}.mk-contact-hero-mark{font-size:170px;bottom:-35px}.mk-contact-form-panel{padding:26px 20px}.mk-contact-form-row{grid-template-columns:1fr;gap:0}.mk-contact-content{padding:50px 15px 75px}.mk-contact-aside h2{font-size:58px}.mk-contact-outro{padding:85px 20px}.mk-contact-outro h2{font-size:54px}}
@media(prefers-reduced-motion:reduce){.mk-contact-page *{transition-duration:.01ms!important;animation-duration:.01ms!important}}
`;
