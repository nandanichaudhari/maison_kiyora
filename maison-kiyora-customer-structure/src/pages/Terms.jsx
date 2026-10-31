import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  ClipboardList,
  CreditCard,
  HelpCircle,
  Package,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react";

/**
 * MAISON KIYORA — TERMS & CONDITIONS
 *
 * IMPORTANT: This is a draft template, not approved legal advice.
 * Have the business owner/legal reviewer verify every clause before launch.
 * Replace the placeholders below only with confirmed business information.
 */
const TERMS_CONFIG = {
  businessLegalName: "", // Confirm registered/legal business name.
  businessAddress: "", // Confirm address to disclose.
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || "",
  effectiveDate: "", // Example: "30 October 2026" — use actual approval date.
  governingLaw: "", // Confirm applicable law and jurisdiction with legal reviewer.
  jurisdiction: "", // Confirm jurisdiction, if appropriate.
};

const sections = [
  {
    id: "acceptance",
    number: "01",
    title: "Acceptance of terms",
    icon: BookOpen,
    paragraphs: [
      "These Terms & Conditions describe the rules for using the Maison Kiyora website and placing orders through it. Please read them before using the website or purchasing a product.",
      "The final version of these terms should identify the legal entity operating the website and the date on which the terms take effect.",
    ],
  },
  {
    id: "accounts",
    number: "02",
    title: "Accounts & customer information",
    icon: UserRound,
    paragraphs: [
      "Customers may be able to create an account to manage their profile, saved addresses, orders and other account features. Customers should provide accurate information and keep their login credentials secure.",
      "Account access and personal information handling are also addressed in our Privacy Policy. Any account eligibility, suspension or closure rules must be reviewed and approved before publication.",
    ],
  },
  {
    id: "products",
    number: "03",
    title: "Products & descriptions",
    icon: Package,
    paragraphs: [
      "Product pages are intended to help customers understand the fragrances available for purchase. Product details, sizes, images and availability should be checked against the live catalogue before an order is placed.",
      "Any rules about packaging variations, product substitutions, ingredient information or fragrance sensitivities should be supplied and verified by the business before they are added to the final terms.",
    ],
  },
  {
    id: "pricing",
    number: "04",
    title: "Pricing & payments",
    icon: CreditCard,
    paragraphs: [
      "The checkout should display the applicable product prices and any additional charges before the customer confirms an order. The final payable amount must be calculated by the server rather than trusted from browser input.",
      "Online payments may be processed using a third-party payment provider, such as Razorpay, if that integration is enabled. Payment confirmation, failed-payment handling and refunds must follow the actual payment and order systems in use.",
      "Any policy for pricing errors, taxes, promotions, payment authorization or currency must be approved by the business before publication.",
    ],
  },
  {
    id: "orders",
    number: "05",
    title: "Orders & confirmation",
    icon: ShoppingBag,
    paragraphs: [
      "After checkout, the website may provide an order reference and an order status page. An on-screen message alone should not be treated as proof of successful payment; payment status should be confirmed against the authenticated order record.",
      "Order acceptance, stock-related changes, cancellations and customer notifications depend on the final order-management process. These operational rules must be confirmed before the terms go live.",
    ],
  },
  {
    id: "shipping",
    number: "06",
    title: "Shipping & delivery",
    icon: Package,
    paragraphs: [
      "Delivery coverage, shipping charges, dispatch estimates, delivery timelines and tracking availability depend on the destination and the shipping arrangements in place at checkout.",
      "Please refer to the Shipping Policy for the latest published information. Specific timelines or delivery guarantees should not be added without confirmation from the business and its logistics partners.",
    ],
    link: { to: "/shipping-policy", label: "READ SHIPPING POLICY" },
  },
  {
    id: "returns",
    number: "07",
    title: "Returns, refunds & cancellations",
    icon: ClipboardList,
    paragraphs: [
      "Eligibility for returns, refunds, replacements and cancellations is subject to the business's approved policy and applicable law. Fragrance products may require particular handling considerations, so conditions must be stated accurately.",
      "Please consult the Returns & Refunds page for the published process. No return window, refund processing period or cancellation guarantee is established by this draft page.",
    ],
    link: { to: "/returns-refunds", label: "READ RETURNS & REFUNDS" },
  },
  {
    id: "privacy",
    number: "08",
    title: "Privacy & website security",
    icon: ShieldCheck,
    paragraphs: [
      "The website may use authentication, local browser storage and service providers to support shopping and account features. Actual data collection, processing, sharing and retention practices should be described in the approved Privacy Policy.",
      "Customers should not attempt to interfere with the website, misuse another person's account or access systems without authorization. The final acceptable-use and intellectual-property clauses should be reviewed by the business.",
    ],
    link: { to: "/privacy-policy", label: "READ PRIVACY POLICY" },
  },
  {
    id: "changes",
    number: "09",
    title: "Updates & questions",
    icon: HelpCircle,
    paragraphs: [
      "The business may need to revise these terms as its services, operational processes or legal requirements change. The effective date and any required customer notice should reflect the final approved policy.",
      "For questions about an order or these terms, use the contact page. The business's verified legal name, contact information and applicable governing-law details should appear in the published version.",
    ],
    link: { to: "/contact", label: "CONTACT OUR TEAM" },
  },
];

function Section({ section, expanded, onToggle, reducedMotion }) {
  const Icon = section.icon;
  const contentId = `mk-terms-content-${section.id}`;
  return (
    <article className={`mk-terms-section ${expanded ? "is-open" : ""}`} id={section.id}>
      <button
        className="mk-terms-section-trigger"
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={contentId}
      >
        <span className="mk-terms-number">{section.number}</span>
        <span className="mk-terms-section-icon"><Icon size={19} strokeWidth={1.5} /></span>
        <span className="mk-terms-section-title">{section.title}</span>
        <ChevronDown size={20} strokeWidth={1.4} className="mk-terms-chevron" />
      </button>
      {expanded && (
        <motion.div
          id={contentId}
          className="mk-terms-section-content"
          initial={reducedMotion ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.25 }}
        >
          {section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          {section.link && (
            <Link to={section.link.to} className="mk-terms-inline-link">
              {section.link.label} <ArrowUpRight size={16} strokeWidth={1.5} />
            </Link>
          )}
        </motion.div>
      )}
    </article>
  );
}

export default function Terms() {
  const [expandedIds, setExpandedIds] = useState(["acceptance"]);
  const reducedMotion = useReducedMotion();
  const allExpanded = expandedIds.length === sections.length;
  const hasMissingLegalDetails = useMemo(() =>
    !TERMS_CONFIG.businessLegalName || !TERMS_CONFIG.businessAddress ||
    !TERMS_CONFIG.supportEmail || !TERMS_CONFIG.effectiveDate ||
    !TERMS_CONFIG.governingLaw,
  []);

  useEffect(() => {
    document.title = "Terms & Conditions | Maison Kiyora";
  }, []);

  const toggleSection = (id) => {
    setExpandedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  return (
    <main className="mk-terms-page">
      <style>{styles}</style>
      <section className="mk-terms-hero">
        <motion.div
          className="mk-terms-hero-inner"
          initial={reducedMotion ? false : { opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="mk-terms-eyebrow">MAISON KIYORA / INFORMATION</span>
          <h1>Terms <em>&</em><br />Conditions.</h1>
          <p>Clarity, care and confidence in every interaction.</p>
          <div className="mk-terms-hero-line" />
        </motion.div>
      </section>

      <section className="mk-terms-layout">
        <aside className="mk-terms-sidebar" aria-label="Terms sections">
          <span className="mk-terms-side-label">ON THIS PAGE</span>
          <nav>
            {sections.map((section) => (
              <a href={`#${section.id}`} key={section.id}>
                <span>{section.number}</span>{section.title}
              </a>
            ))}
          </nav>
          <Link to="/contact" className="mk-terms-side-contact">
            NEED ASSISTANCE? <ArrowUpRight size={16} />
          </Link>
        </aside>

        <div className="mk-terms-content">
          <div className="mk-terms-intro">
            <span className="mk-terms-eyebrow">THE IMPORTANT DETAILS</span>
            <h2>A thoughtful<br /><em>experience.</em></h2>
            <p>
              These terms explain the framework for browsing and shopping with
              Maison Kiyora. Please review them alongside our shipping, returns
              and privacy policies.
            </p>
          </div>

          {hasMissingLegalDetails && (
            <div className="mk-terms-draft-notice" role="note">
              <strong>Pre-launch legal review required</strong>
              <p>
                This page is a working draft, not the final approved Terms & Conditions.
                Confirm the business identity, address, contact email, effective date,
                applicable law and operational policies before making it public.
              </p>
            </div>
          )}

          <div className="mk-terms-meta">
            <div><span>DOCUMENT</span><strong>Terms & Conditions</strong></div>
            <div><span>EFFECTIVE DATE</span><strong>{TERMS_CONFIG.effectiveDate || "Pending confirmation"}</strong></div>
          </div>

          <div className="mk-terms-accordion-heading">
            <span>POLICY SECTIONS</span>
            <button
              type="button"
              onClick={() => setExpandedIds(allExpanded ? [] : sections.map((section) => section.id))}
            >
              {allExpanded ? "COLLAPSE ALL" : "EXPAND ALL"}
              <ChevronDown size={15} className={allExpanded ? "is-rotated" : ""} />
            </button>
          </div>

          <div className="mk-terms-accordion">
            {sections.map((section) => (
              <Section
                key={section.id}
                section={section}
                expanded={expandedIds.includes(section.id)}
                onToggle={() => toggleSection(section.id)}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>

          <div className="mk-terms-business">
            <span className="mk-terms-eyebrow">BUSINESS INFORMATION</span>
            <h3>Who operates this website?</h3>
            <dl>
              <div><dt>Legal business name</dt><dd>{TERMS_CONFIG.businessLegalName || "To be confirmed"}</dd></div>
              <div><dt>Business address</dt><dd>{TERMS_CONFIG.businessAddress || "To be confirmed"}</dd></div>
              <div><dt>Support email</dt><dd>{TERMS_CONFIG.supportEmail || "To be confirmed"}</dd></div>
              <div><dt>Applicable law</dt><dd>{TERMS_CONFIG.governingLaw || "To be confirmed"}</dd></div>
              <div><dt>Jurisdiction</dt><dd>{TERMS_CONFIG.jurisdiction || "To be confirmed"}</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section className="mk-terms-cta">
        <span className="mk-terms-eyebrow">HERE TO HELP</span>
        <h2>Questions? <em>We're here.</em></h2>
        <p>For assistance with your order or questions about our policies, reach out to our team.</p>
        <Link to="/contact" className="mk-terms-cta-link">
          CONTACT US <ArrowRight size={17} strokeWidth={1.5} />
        </Link>
        <div className="mk-terms-quick-links">
          <Link to="/privacy-policy">PRIVACY POLICY</Link>
          <Link to="/shipping-policy">SHIPPING POLICY</Link>
          <Link to="/returns-refunds">RETURNS & REFUNDS</Link>
        </div>
      </section>
    </main>
  );
}

const styles = `
.mk-terms-page{--ivory:#F5F0E8;--espresso:#211C19;--gold:#B69A69;--sand:#D8C9B5;background:var(--ivory);color:var(--espresso);min-height:100vh;font-family:"Manrope",sans-serif}
.mk-terms-page *{box-sizing:border-box}
.mk-terms-page a{text-decoration:none}
.mk-terms-hero{padding:155px 24px 100px;text-align:center;background:radial-gradient(ellipse at 70% 30%,rgba(182,154,105,.15),transparent 55%),#eae1d5}
.mk-terms-hero-inner{max-width:950px;margin:auto}
.mk-terms-eyebrow,.mk-terms-side-label{display:block;color:#957c54;font-size:10px;font-weight:650;letter-spacing:.23em;line-height:1.8}
.mk-terms-hero h1{margin:24px 0;font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(74px,11vw,145px);font-weight:400;letter-spacing:-.06em;line-height:.87}
.mk-terms-hero h1 em,.mk-terms-intro h2 em,.mk-terms-cta h2 em{color:var(--gold);font-weight:300}
.mk-terms-hero p{color:#776f66;font-size:12px;line-height:2}
.mk-terms-hero-line{width:65px;height:1px;background:var(--gold);margin:34px auto 0}
.mk-terms-layout{display:grid;grid-template-columns:245px minmax(0,1fr);gap:clamp(45px,7vw,110px);max-width:1310px;margin:auto;padding:95px 35px 130px;align-items:start}
.mk-terms-sidebar{position:sticky;top:110px;padding-top:9px}
.mk-terms-sidebar nav{display:flex;flex-direction:column;gap:4px;margin-top:25px}
.mk-terms-sidebar nav a{display:flex;gap:14px;padding:12px 6px;color:#726b62;font-size:11px;line-height:1.6;transition:color .2s}
.mk-terms-sidebar nav a:hover{color:#9b7a4e}
.mk-terms-sidebar nav a span{color:#b69a69;font-size:10px}
.mk-terms-side-contact{display:flex;align-items:center;justify-content:space-between;margin-top:35px;padding:18px 0;border-top:1px solid #d8cbb9;color:var(--espresso);font-size:10px;font-weight:600;letter-spacing:.1em}
.mk-terms-content{min-width:0}
.mk-terms-intro h2{margin:18px 0 25px;font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(62px,7vw,100px);font-weight:400;line-height:.92;letter-spacing:-.055em}
.mk-terms-intro>p{max-width:650px;margin:0 0 38px;color:#777169;font-size:13px;line-height:2.1}
.mk-terms-draft-notice{padding:21px 24px;margin-bottom:35px;border:1px solid #d4bfa0;background:#f1e8db}
.mk-terms-draft-notice strong{font-size:12px;letter-spacing:.03em}
.mk-terms-draft-notice p{margin:8px 0 0;color:#766b5d;font-size:11px;line-height:1.9}
.mk-terms-meta{display:flex;flex-wrap:wrap;gap:45px;padding:23px 0;margin-bottom:45px;border-top:1px solid #d8cbb9;border-bottom:1px solid #d8cbb9}
.mk-terms-meta div{display:flex;flex-direction:column;gap:7px}
.mk-terms-meta span,.mk-terms-accordion-heading>span{font-size:9px;letter-spacing:.16em;color:#998465;font-weight:650}
.mk-terms-meta strong{font-size:12px;font-weight:500}
.mk-terms-accordion-heading{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:16px}
.mk-terms-accordion-heading button{display:flex;align-items:center;gap:8px;padding:10px 0;border:0;background:transparent;color:var(--espresso);font:inherit;font-size:9px;letter-spacing:.12em;cursor:pointer}
.mk-terms-accordion-heading button svg{transition:transform .2s}
.mk-terms-accordion-heading button svg.is-rotated{transform:rotate(180deg)}
.mk-terms-section{scroll-margin-top:100px;border-bottom:1px solid #d9cebe}
.mk-terms-section:first-child{border-top:1px solid #d9cebe}
.mk-terms-section-trigger{display:grid;grid-template-columns:35px 40px minmax(0,1fr) 25px;align-items:center;gap:15px;width:100%;padding:27px 4px;border:0;background:transparent;color:var(--espresso);text-align:left;cursor:pointer}
.mk-terms-number{color:#ac926c;font-size:10px}
.mk-terms-section-icon{display:grid;place-items:center;width:36px;height:36px;border:1px solid #d8c9b5;border-radius:50%;color:#977c54}
.mk-terms-section-title{font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(25px,3vw,35px);font-weight:500;line-height:1.1}
.mk-terms-chevron{justify-self:end;transition:transform .25s}
.mk-terms-section.is-open .mk-terms-chevron{transform:rotate(180deg)}
.mk-terms-section-content{overflow:hidden;padding:0 42px 28px 105px}
.mk-terms-section-content p{margin:0 0 16px;color:#776f66;font-size:12px;line-height:2.05}
.mk-terms-inline-link{display:inline-flex;align-items:center;gap:12px;margin-top:10px;padding-bottom:8px;border-bottom:1px solid var(--gold);color:var(--espresso);font-size:10px;font-weight:650;letter-spacing:.1em}
.mk-terms-business{margin-top:75px;padding:40px;background:#eee5d9}
.mk-terms-business h3{margin:15px 0 30px;font-family:"Cormorant Garamond",Georgia,serif;font-size:40px;font-weight:500}
.mk-terms-business dl{margin:0}
.mk-terms-business dl>div{display:grid;grid-template-columns:170px minmax(0,1fr);gap:18px;padding:15px 0;border-top:1px solid #d8cbbb}
.mk-terms-business dt{font-size:11px;color:#8b795f}
.mk-terms-business dd{margin:0;font-size:12px;overflow-wrap:anywhere}
.mk-terms-cta{padding:115px 24px 90px;text-align:center;background:var(--espresso);color:var(--ivory)}
.mk-terms-cta h2{margin:20px 0;font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(54px,7vw,95px);font-weight:400;letter-spacing:-.05em}
.mk-terms-cta>p{max-width:460px;margin:0 auto 32px;color:#c9c0b5;font-size:12px;line-height:2}
.mk-terms-cta-link{display:inline-flex;align-items:center;justify-content:space-between;gap:45px;min-height:54px;padding:0 23px;background:var(--ivory);color:var(--espresso);font-size:10px;font-weight:650;letter-spacing:.13em}
.mk-terms-cta-link:hover{background:#e8d8c2}
.mk-terms-quick-links{display:flex;justify-content:center;flex-wrap:wrap;gap:15px 35px;margin-top:75px}
.mk-terms-quick-links a{color:#c5b69e;font-size:9px;letter-spacing:.13em}
.mk-terms-quick-links a:hover{color:white}
@media(max-width:900px){.mk-terms-layout{grid-template-columns:1fr;gap:35px;padding:70px 25px 100px}.mk-terms-sidebar{position:static}.mk-terms-sidebar nav{flex-direction:row;flex-wrap:wrap;gap:5px 18px}.mk-terms-sidebar nav a{padding:7px 0}.mk-terms-side-contact{display:none}}
@media(max-width:560px){.mk-terms-hero{padding:120px 18px 75px}.mk-terms-hero h1{font-size:clamp(65px,15vw,90px)}.mk-terms-layout{padding:55px 18px 85px}.mk-terms-sidebar nav{max-height:115px;overflow:auto}.mk-terms-intro h2{font-size:62px}.mk-terms-section-trigger{grid-template-columns:23px 30px minmax(0,1fr) 20px;gap:9px;padding:22px 0}.mk-terms-section-icon{width:29px;height:29px}.mk-terms-section-icon svg{width:16px}.mk-terms-section-title{font-size:26px}.mk-terms-section-content{padding:0 10px 25px 0}.mk-terms-business{padding:26px 20px}.mk-terms-business dl>div{grid-template-columns:1fr;gap:6px}.mk-terms-cta{padding:90px 18px 75px}}
@media(prefers-reduced-motion:reduce){.mk-terms-page *{scroll-behavior:auto!important;animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;
