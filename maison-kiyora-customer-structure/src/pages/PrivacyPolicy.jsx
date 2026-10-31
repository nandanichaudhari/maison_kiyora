import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, ShieldCheck, Mail, LockKeyhole, Database, CreditCard, Cookie, UserRound } from "lucide-react";

// MAISON KIYORA — PRIVACY POLICY
// IMPORTANT: This is a publication-ready UI, NOT a legally approved privacy notice.
// Replace and verify every pending item against the real deployed data flows.
// Never publish an inaccurate privacy claim.

const POLICY = {
  businessName: "Maison Kiyora",
  effectiveDate: "Pending confirmation",
  legalEntity: "Pending confirmation",
  contactEmail: import.meta.env.VITE_PRIVACY_EMAIL || import.meta.env.VITE_CONTACT_EMAIL || "",
  businessAddress: "Pending confirmation",
  dataRetention: "Pending confirmation",
  internationalTransfers: "Pending confirmation",
  analyticsProviders: "Pending confirmation",
};

const sections = [
  {
    id: "information",
    icon: UserRound,
    title: "Information we collect",
    paragraphs: [
      "When you create an account, place an order, or contact us, information may include your name, email address, phone number, delivery address, order details, and messages you choose to share.",
      "Technical information such as browser data, device information, and essential session identifiers may also be processed as part of operating the website. The precise categories collected should be checked against the live implementation.",
    ],
  },
  {
    id: "purposes",
    icon: Database,
    title: "How information is used",
    paragraphs: [
      "Customer information may be used to provide account access, process and fulfil orders, respond to enquiries, support payments, maintain security, and meet applicable legal obligations.",
      "Any promotional email or messaging programme, profiling, or additional use of customer information must be documented here if introduced. Consent and opt-out processes must reflect the actual implementation.",
    ],
  },
  {
    id: "authentication",
    icon: LockKeyhole,
    title: "Account authentication",
    paragraphs: [
      "The planned account experience uses Supabase Authentication to support registration, sign-in, password recovery, and account sessions. Authentication information is handled through the configured provider and the website's security controls.",
      "This section must be updated if the production authentication provider or its configuration changes.",
    ],
  },
  {
    id: "payments",
    icon: CreditCard,
    title: "Payments and transactions",
    paragraphs: [
      "The planned checkout integrates Razorpay for payment processing. Payment-related details and transaction references may be processed by the payment provider and our order-processing systems.",
      "The precise payment data accessible to Maison Kiyora, payment methods supported, and relevant provider notices must be verified before publication. Do not assume that card details are stored by the website.",
    ],
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "Cookies and local storage",
    paragraphs: [
      "The current storefront architecture uses browser storage for certain experiences, including shopping bag and wishlist persistence, and authentication may use browser session storage mechanisms.",
      "If analytics, advertising, or other non-essential tracking tools are added, their names, purposes, retention, and any consent controls must be described here accurately.",
    ],
  },
  {
    id: "sharing",
    icon: ShieldCheck,
    title: "Service providers and sharing",
    paragraphs: [
      "Running an online store may require information to be processed by hosting, authentication, payment, order fulfilment, delivery, and customer-support providers, as applicable to the live service.",
      "The final notice should identify the actual categories of recipients and relevant providers, and describe any legally required disclosures. This draft does not claim that customer information is never shared.",
    ],
  },
  {
    id: "retention",
    icon: Database,
    title: "Data retention and security",
    paragraphs: [
      "Information should be kept only for appropriate operational, legal, security, and record-keeping purposes. Actual retention periods and deletion procedures have not yet been confirmed.",
      "Reasonable safeguards should be applied to account, order, and personal information. No online system can be represented as absolutely secure; security controls and incident processes should be reviewed before launch.",
    ],
  },
  {
    id: "rights",
    icon: UserRound,
    title: "Your privacy choices and requests",
    paragraphs: [
      "Depending on applicable law and the nature of the request, customers may be able to ask about their personal information, request corrections or deletion, withdraw applicable consent, or raise a privacy concern.",
      "Requests can be sent through the contact page. Identity verification, applicable exceptions, response procedures, and a designated grievance contact must be established by the business before publication.",
    ],
  },
  {
    id: "changes",
    icon: ShieldCheck,
    title: "Changes to this notice",
    paragraphs: [
      "The privacy notice should be updated whenever data collection, service providers, payment flows, or applicable obligations change. The effective date above should reflect the most recent approved version.",
    ],
  },
];

const reviewItems = [
  "Confirm legal business name, address, and privacy/grievance contact",
  "Confirm all collected fields, service providers, and actual data flows",
  "Confirm data retention, deletion process, and international transfers",
  "Confirm analytics, advertising cookies, and any consent mechanism",
  "Confirm payment provider practices and order/shipping integrations",
  "Obtain business and legal approval; set the effective date",
];

function FadeIn({ children, className = "", delay = 0 }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.65, delay }}
    >
      {children}
    </motion.div>
  );
}

export default function PrivacyPolicy() {
  const [openSection, setOpenSection] = useState(null);

  useEffect(() => {
    document.title = "Privacy Policy | Maison Kiyora";
  }, []);

  const toggle = (id) => setOpenSection((current) => (current === id ? null : id));

  return (
    <main className="mk-privacy">
      <style>{styles}</style>

      <section className="mk-privacy-hero">
        <FadeIn className="mk-privacy-hero-content">
          <span className="mk-privacy-kicker">MAISON KIYORA / INFORMATION</span>
          <div className="mk-privacy-hero-icon"><ShieldCheck size={23} strokeWidth={1.3} /></div>
          <h1>Privacy <em>Policy.</em></h1>
          <p>A thoughtful approach to your information, and transparency about how our online experience works.</p>
          <span className="mk-privacy-effective">Effective date: {POLICY.effectiveDate}</span>
        </FadeIn>
      </section>

      <div className="mk-privacy-shell">
        <FadeIn className="mk-privacy-review" >
          <strong>Draft — review required before publication</strong>
          <p>
            This page describes planned website functionality and areas that require confirmation.
            It is not yet a final, legally approved privacy notice. Do not publish it unchanged.
          </p>
        </FadeIn>

        <div className="mk-privacy-layout">
          <aside className="mk-privacy-sidebar" aria-label="Privacy policy sections">
            <span className="mk-privacy-kicker">ON THIS PAGE</span>
            <nav>
              {sections.map((section, index) => (
                <a href={`#${section.id}`} key={section.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {section.title}
                </a>
              ))}
              <a href="#contact-privacy"><span>10</span> Contact</a>
            </nav>
          </aside>

          <div className="mk-privacy-content">
            <FadeIn className="mk-privacy-intro">
              <span className="mk-privacy-kicker">OUR APPROACH</span>
              <h2>Your trust <em>matters.</em></h2>
              <p>
                This draft explains the types of information that may be involved in shopping with
                {" "}{POLICY.businessName}. The final policy must accurately reflect the live website,
                its integrations, and the business's approved privacy practices.
              </p>
            </FadeIn>

            {sections.map((section, index) => {
              const Icon = section.icon;
              const expanded = openSection === section.id;
              return (
                <FadeIn key={section.id}>
                  <section className="mk-privacy-section" id={section.id}>
                    <button
                      type="button"
                      className="mk-privacy-section-heading"
                      onClick={() => toggle(section.id)}
                      aria-expanded={expanded}
                      aria-controls={`${section.id}-details`}
                    >
                      <span className="mk-privacy-section-number">{String(index + 1).padStart(2, "0")}</span>
                      <span className="mk-privacy-section-icon"><Icon size={20} strokeWidth={1.5} /></span>
                      <span className="mk-privacy-section-title">{section.title}</span>
                      <ChevronDown size={19} className={expanded ? "mk-privacy-chevron open" : "mk-privacy-chevron"} />
                    </button>
                    <div
                      id={`${section.id}-details`}
                      className="mk-privacy-section-body"
                      hidden={!expanded}
                    >
                      {section.paragraphs.map((paragraph, paragraphIndex) => (
                        <p key={paragraphIndex}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                </FadeIn>
              );
            })}

            <FadeIn>
              <section id="contact-privacy" className="mk-privacy-contact">
                <Mail size={24} strokeWidth={1.3} />
                <span className="mk-privacy-kicker">QUESTIONS & REQUESTS</span>
                <h2>We're here to <em>help.</em></h2>
                <p>
                  For questions about your information, please reach out through our contact page.
                  {POLICY.contactEmail ? " You may also use the email address below." : " A dedicated privacy email address is pending confirmation."}
                </p>
                {POLICY.contactEmail && (
                  <a className="mk-privacy-email" href={`mailto:${POLICY.contactEmail}`}>
                    {POLICY.contactEmail}
                  </a>
                )}
                <Link to="/contact" className="mk-privacy-cta">
                  CONTACT US <ArrowRight size={17} strokeWidth={1.5} />
                </Link>
              </section>
            </FadeIn>
          </div>
        </div>

        <FadeIn className="mk-privacy-checklist">
          <span className="mk-privacy-kicker">BEFORE GOING LIVE</span>
          <h2>Publication <em>checklist.</em></h2>
          <p>Internal launch checklist — remove this entire section after the final policy is approved.</p>
          <ul>
            {reviewItems.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <div className="mk-privacy-meta">
            <span>Legal entity: {POLICY.legalEntity}</span>
            <span>Business address: {POLICY.businessAddress}</span>
            <span>Retention: {POLICY.dataRetention}</span>
            <span>International transfers: {POLICY.internationalTransfers}</span>
            <span>Analytics: {POLICY.analyticsProviders}</span>
          </div>
        </FadeIn>

        <div className="mk-privacy-footer-links">
          <Link to="/terms">Terms & Conditions <ArrowRight size={15} /></Link>
          <Link to="/shipping-policy">Shipping Policy <ArrowRight size={15} /></Link>
          <Link to="/returns-refunds">Returns & Refunds <ArrowRight size={15} /></Link>
        </div>
      </div>
    </main>
  );
}

const styles = `
  .mk-privacy{--ivory:#F5F0E8;--espresso:#211C19;--gold:#B69A69;--sand:#D8C9B5;min-height:100vh;background:var(--ivory);color:var(--espresso);font-family:"Manrope",sans-serif}
  .mk-privacy *{box-sizing:border-box}
  .mk-privacy a{color:inherit;text-decoration:none}
  .mk-privacy-kicker{display:block;color:#9b7f56;font-size:10px;font-weight:650;letter-spacing:.22em;line-height:1.8}
  .mk-privacy-hero{padding:150px 24px 110px;text-align:center;background:radial-gradient(ellipse at 65% 30%,rgba(182,154,105,.2),transparent 55%),#eae1d4}
  .mk-privacy-hero-content{max-width:850px;margin:auto}
  .mk-privacy-hero-icon{display:grid;place-items:center;width:54px;height:54px;margin:25px auto 17px;border:1px solid rgba(182,154,105,.5);border-radius:50%;color:#9b7f56}
  .mk-privacy h1,.mk-privacy h2{font-family:"Cormorant Garamond",Georgia,serif;font-weight:400;letter-spacing:-.045em}
  .mk-privacy h1{font-size:clamp(65px,10vw,124px);line-height:.95;margin:0 0 22px}
  .mk-privacy h1 em,.mk-privacy h2 em{color:var(--gold);font-weight:300}
  .mk-privacy-hero p{max-width:470px;margin:0 auto;color:#777168;font-size:13px;line-height:2}
  .mk-privacy-effective{display:inline-block;margin-top:32px;color:#9b7f56;font-size:10px;letter-spacing:.08em}
  .mk-privacy-shell{max-width:1260px;margin:0 auto;padding:65px 28px 100px}
  .mk-privacy-review{margin-bottom:65px;padding:24px 30px;border-left:3px solid var(--gold);background:#eee5d8}
  .mk-privacy-review strong{font-size:12px;letter-spacing:.03em}
  .mk-privacy-review p{max-width:900px;margin:9px 0 0;color:#72695e;font-size:12px;line-height:1.9}
  .mk-privacy-layout{display:grid;grid-template-columns:265px minmax(0,1fr);gap:clamp(45px,7vw,110px)}
  .mk-privacy-sidebar{position:sticky;top:110px;align-self:start}
  .mk-privacy-sidebar nav{display:flex;flex-direction:column;gap:4px;margin-top:24px}
  .mk-privacy-sidebar a{display:flex;gap:15px;padding:11px 0;border-bottom:1px solid #e1d7c9;color:#675e56;font-size:11px;line-height:1.5;transition:color .2s}
  .mk-privacy-sidebar a:hover{color:#a17e4e}
  .mk-privacy-sidebar a span{color:var(--gold);font-size:10px}
  .mk-privacy-content{min-width:0}
  .mk-privacy-intro{padding-bottom:35px}
  .mk-privacy-intro h2,.mk-privacy-contact h2,.mk-privacy-checklist h2{margin:18px 0;font-size:clamp(48px,6vw,76px);line-height:1}
  .mk-privacy-intro p,.mk-privacy-contact p,.mk-privacy-checklist p{max-width:700px;color:#766f67;font-size:12px;line-height:2.1}
  .mk-privacy-section{scroll-margin-top:110px;border-top:1px solid #ded3c4}
  .mk-privacy-section-heading{display:flex;align-items:center;gap:18px;width:100%;min-height:94px;padding:17px 0;border:0;background:transparent;color:var(--espresso);text-align:left;cursor:pointer}
  .mk-privacy-section-number{align-self:center;color:#a38b6b;font-size:10px;letter-spacing:.06em}
  .mk-privacy-section-icon{display:grid;place-items:center;width:42px;height:42px;flex-shrink:0;border:1px solid #dfd1bc;border-radius:50%;color:#9b7f56}
  .mk-privacy-section-title{flex:1;font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(23px,3vw,34px);font-weight:500;line-height:1.1}
  .mk-privacy-chevron{flex-shrink:0;transition:transform .25s}
  .mk-privacy-chevron.open{transform:rotate(180deg)}
  .mk-privacy-section-body{padding:0 35px 29px 80px}
  .mk-privacy-section-body[hidden]{display:none}
  .mk-privacy-section-body p{margin:0 0 14px;color:#716b64;font-size:12px;line-height:2.05}
  .mk-privacy-contact{scroll-margin-top:110px;margin-top:65px;padding:55px 45px;background:#eae0d2;text-align:center}
  .mk-privacy-contact>svg{margin-bottom:18px;color:#9b7f56}
  .mk-privacy-contact h2{font-size:clamp(48px,6vw,70px)}
  .mk-privacy-contact p{margin:0 auto 23px}
  .mk-privacy-email{display:block;margin-bottom:20px;color:#92754c!important;font-size:12px;overflow-wrap:anywhere;text-decoration:underline!important;text-underline-offset:4px}
  .mk-privacy-cta{display:inline-flex;align-items:center;justify-content:center;gap:25px;min-height:49px;padding:0 24px;background:var(--espresso);color:white!important;font-size:10px;font-weight:600;letter-spacing:.14em;transition:background .2s}
  .mk-privacy-cta:hover{background:#47392f}
  .mk-privacy-checklist{margin-top:90px;padding:40px;border:1px solid #d8c9b5;background:#f0e9df}
  .mk-privacy-checklist h2{font-size:clamp(44px,5vw,64px)}
  .mk-privacy-checklist ul{display:grid;grid-template-columns:1fr 1fr;gap:12px 32px;margin:25px 0;padding-left:20px;color:#645b53;font-size:12px;line-height:1.8}
  .mk-privacy-checklist li::marker{color:var(--gold)}
  .mk-privacy-meta{display:flex;flex-wrap:wrap;gap:10px 25px;padding-top:22px;border-top:1px solid #d8c9b5;color:#88796b;font-size:10px;line-height:1.8}
  .mk-privacy-footer-links{display:flex;flex-wrap:wrap;justify-content:center;gap:18px 35px;margin-top:65px;padding-top:30px;border-top:1px solid #ded3c4}
  .mk-privacy-footer-links a{display:inline-flex;align-items:center;gap:9px;font-size:11px;color:#776a5b}
  .mk-privacy-footer-links a:hover{color:#9b7f56}
  @media(max-width:850px){.mk-privacy-layout{grid-template-columns:1fr;gap:35px}.mk-privacy-sidebar{position:static}.mk-privacy-sidebar nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 20px}.mk-privacy-shell{padding:45px 22px 80px}}
  @media(max-width:560px){.mk-privacy-hero{padding:125px 20px 80px}.mk-privacy-sidebar nav{grid-template-columns:1fr}.mk-privacy-section-heading{gap:10px;min-height:83px}.mk-privacy-section-icon{width:34px;height:34px}.mk-privacy-section-body{padding-left:0}.mk-privacy-contact{padding:45px 20px}.mk-privacy-checklist{padding:30px 22px}.mk-privacy-checklist ul{grid-template-columns:1fr}.mk-privacy-footer-links{justify-content:flex-start}}
  @media(prefers-reduced-motion:reduce){.mk-privacy *{scroll-behavior:auto!important;transition-duration:.01ms!important}}
`;
