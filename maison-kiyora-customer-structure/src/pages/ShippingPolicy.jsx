import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  ClipboardCheck,
  Headphones,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";

/**
 * Maison Kiyora — Shipping & Delivery
 *
 * IMPORTANT: These settings must be confirmed with the business before launch.
 * Leave unverified policy fields empty; the UI will not invent promises.
 */
const SHIPPING_POLICY = {
  lastUpdated: "", // e.g. "30 October 2026" — use the actual approval date
  dispatchTime: "", // e.g. an approved dispatch commitment
  deliveryTime: "", // approved delivery estimates and applicable regions
  shippingFees: "", // approved fees / free-shipping threshold
  shippingRegions: "", // actual supported delivery locations
  courierPartners: "", // verified courier names, if applicable
  trackingProcess: "", // how tracking is shared once dispatched
  failedDeliveryProcess: "", // approved redelivery / return-to-origin process
  shippingRestrictions: "", // actual restrictions, if any
  supportEmail: "", // verified support address; otherwise link to Contact
};

const sections = [
  {
    id: "coverage",
    number: "01",
    icon: MapPin,
    title: "Where we deliver",
    description: "Delivery availability depends on the shipping address and serviceability checks at checkout.",
    policyKey: "shippingRegions",
    pending: "Our delivery coverage details are being finalised. Please contact us to confirm serviceability for your location before placing an order.",
  },
  {
    id: "dispatch",
    number: "02",
    icon: Package,
    title: "Order processing & dispatch",
    description: "Orders are prepared for dispatch after the applicable order and payment checks are complete.",
    policyKey: "dispatchTime",
    pending: "Confirmed processing and dispatch timelines will be published here once available.",
  },
  {
    id: "delivery",
    number: "03",
    icon: Truck,
    title: "Estimated delivery",
    description: "Delivery estimates may vary depending on destination, courier serviceability and circumstances in transit.",
    policyKey: "deliveryTime",
    pending: "Please contact our team for the current delivery estimate for your destination. We do not currently publish a guaranteed delivery window.",
  },
  {
    id: "charges",
    number: "04",
    icon: ClipboardCheck,
    title: "Shipping charges",
    description: "Any applicable shipping fee should be shown before the customer confirms an order.",
    policyKey: "shippingFees",
    pending: "Shipping rates and any free-shipping eligibility are not yet published. Confirm the final charge during checkout before paying.",
  },
  {
    id: "tracking",
    number: "05",
    icon: ShieldCheck,
    title: "Order tracking",
    description: "Tracking information is available only when a shipment has been created and tracking details have been provided.",
    policyKey: "trackingProcess",
    pending: "You can check your order details in your account. If tracking information is not yet available, please contact our support team with your order reference.",
  },
];

const faqItems = [
  {
    question: "How can I check the status of my order?",
    answer: "Sign in to your Maison Kiyora account and open My Orders. If your order details do not yet show a shipping update, contact us with your order reference.",
  },
  {
    question: "Do you offer express or same-day delivery?",
    answer: "Express and same-day delivery have not been confirmed as available. Please contact us before placing a time-sensitive order.",
  },
  {
    question: "Can I change my delivery address after ordering?",
    answer: "Please contact us as soon as possible with your order reference. Address changes are subject to the order's processing stage and courier availability; they cannot be guaranteed.",
  },
  {
    question: "What if my parcel is delayed or not delivered?",
    answer: "Contact our support team with your order reference and any tracking details. We can review the available shipment information and advise on the next steps.",
  },
  {
    question: "Where can I read the returns policy?",
    answer: "Please see the Returns & Refunds page for the currently published return and refund information. Shipping and return eligibility are separate matters.",
  },
];

function Reveal({ children, className = "", delay = 0 }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.65, delay }}
    >
      {children}
    </motion.div>
  );
}

export default function ShippingPolicy() {
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const previous = document.title;
    document.title = "Shipping & Delivery | Maison Kiyora";
    return () => { document.title = previous; };
  }, []);

  const scrollToDetails = () => {
    document.getElementById("mk-shipping-details")?.scrollIntoView({
      behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <main className="mk-shipping-page">
      <style>{styles}</style>

      <section className="mk-shipping-hero" aria-labelledby="mk-shipping-title">
        <div className="mk-shipping-hero-inner">
          <Reveal>
            <div className="mk-shipping-eyebrow">MAISON KIYORA <span>/</span> CUSTOMER CARE</div>
            <h1 id="mk-shipping-title">Shipping <em>&amp; Delivery.</em></h1>
            <p>Everything you need to know about receiving your fragrance.</p>
            <button type="button" className="mk-shipping-hero-link" onClick={scrollToDetails}>
              EXPLORE THE DETAILS <ArrowRight size={16} strokeWidth={1.5} />
            </button>
            {SHIPPING_POLICY.lastUpdated && (
              <p className="mk-shipping-updated">Last updated: {SHIPPING_POLICY.lastUpdated}</p>
            )}
          </Reveal>
        </div>
        <span className="mk-shipping-hero-decoration" aria-hidden="true">M K</span>
      </section>

      <section className="mk-shipping-intro" aria-label="Shipping overview">
        <Reveal>
          <span className="mk-shipping-kicker">YOUR ORDER, THOUGHTFULLY HANDLED</span>
          <h2>From our maison <em>to your door.</em></h2>
          <p>We want your shopping experience to feel considered from beginning to end. The information below explains what is currently available and where to get help with a specific order.</p>
        </Reveal>
      </section>

      <section id="mk-shipping-details" className="mk-shipping-details" aria-labelledby="mk-shipping-details-title">
        <div className="mk-shipping-section-heading">
          <span className="mk-shipping-kicker">THE ESSENTIALS</span>
          <h2 id="mk-shipping-details-title">Delivery <em>information.</em></h2>
        </div>
        <div className="mk-shipping-section-list">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const confirmedText = SHIPPING_POLICY[section.policyKey];
            return (
              <Reveal key={section.id} delay={Math.min(index * 0.05, 0.2)}>
                <article className="mk-shipping-section-row" id={section.id}>
                  <div className="mk-shipping-section-index">{section.number}</div>
                  <div className="mk-shipping-section-icon"><Icon size={22} strokeWidth={1.35} aria-hidden="true" /></div>
                  <div className="mk-shipping-section-copy">
                    <h3>{section.title}</h3>
                    <p>{section.description}</p>
                    <p className="mk-shipping-policy-text">{confirmedText || section.pending}</p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
        {(SHIPPING_POLICY.courierPartners || SHIPPING_POLICY.failedDeliveryProcess || SHIPPING_POLICY.shippingRestrictions) && (
          <div className="mk-shipping-extra">
            {SHIPPING_POLICY.courierPartners && <p><strong>Courier partners:</strong> {SHIPPING_POLICY.courierPartners}</p>}
            {SHIPPING_POLICY.failedDeliveryProcess && <p><strong>Unsuccessful deliveries:</strong> {SHIPPING_POLICY.failedDeliveryProcess}</p>}
            {SHIPPING_POLICY.shippingRestrictions && <p><strong>Shipping restrictions:</strong> {SHIPPING_POLICY.shippingRestrictions}</p>}
          </div>
        )}
      </section>

      <section className="mk-shipping-support-strip" aria-labelledby="mk-shipping-support-title">
        <Reveal className="mk-shipping-support-inner">
          <div className="mk-shipping-support-icon"><Headphones size={26} strokeWidth={1.25} /></div>
          <div>
            <span className="mk-shipping-kicker">HERE TO HELP</span>
            <h2 id="mk-shipping-support-title">Questions about <em>your order?</em></h2>
            <p>For address queries, delivery updates or a specific shipment, include your order reference when you get in touch.</p>
          </div>
          <Link className="mk-shipping-support-button" to="/contact">CONTACT US <ArrowRight size={17} /></Link>
        </Reveal>
      </section>

      <section className="mk-shipping-faq" aria-labelledby="mk-shipping-faq-title">
        <div className="mk-shipping-faq-grid">
          <Reveal className="mk-shipping-faq-heading">
            <span className="mk-shipping-kicker">A LITTLE MORE CLARITY</span>
            <h2 id="mk-shipping-faq-title">Frequently asked <em>questions.</em></h2>
            <p>Find answers to common questions about orders and delivery.</p>
          </Reveal>
          <div className="mk-shipping-faq-items">
            {faqItems.map((item, index) => {
              const expanded = openFaq === index;
              return (
                <div className="mk-shipping-faq-item" key={item.question}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`mk-shipping-faq-answer-${index}`}
                      onClick={() => setOpenFaq(expanded ? null : index)}
                    >
                      <span>{item.question}</span>
                      <ChevronDown size={19} className={expanded ? "is-open" : ""} strokeWidth={1.5} />
                    </button>
                  </h3>
                  {expanded && <div id={`mk-shipping-faq-answer-${index}`} className="mk-shipping-faq-answer"><p>{item.answer}</p></div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mk-shipping-footer-cta">
        <Reveal>
          <span className="mk-shipping-kicker">CONTINUE YOUR JOURNEY</span>
          <h2>Discover your <em>signature scent.</em></h2>
          <div className="mk-shipping-footer-links">
            <Link to="/collections">EXPLORE FRAGRANCES <ArrowRight size={17} /></Link>
            <Link to="/orders">VIEW MY ORDERS <ArrowRight size={17} /></Link>
            <Link to="/returns-refunds">RETURNS & REFUNDS <ArrowRight size={17} /></Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}

const styles = `
.mk-shipping-page{--ivory:#F5F0E8;--espresso:#211C19;--gold:#B69A69;--sand:#D8C9B5;background:var(--ivory);color:var(--espresso);font-family:"Manrope",sans-serif;overflow:hidden}
.mk-shipping-page *{box-sizing:border-box}
.mk-shipping-page a{text-decoration:none}
.mk-shipping-page button{font:inherit}
.mk-shipping-kicker,.mk-shipping-eyebrow{font-size:10px;font-weight:600;letter-spacing:.22em;line-height:1.8;color:#a08661}
.mk-shipping-page h1,.mk-shipping-page h2,.mk-shipping-page h3{font-family:"Cormorant Garamond",Georgia,serif;font-weight:400}
.mk-shipping-page h1 em,.mk-shipping-page h2 em{font-weight:300;color:var(--gold)}
.mk-shipping-hero{position:relative;min-height:530px;padding:155px 7% 110px;background:radial-gradient(ellipse at 84% 40%,#e2d6c4,transparent 55%),#eee7dc;overflow:hidden}
.mk-shipping-hero-inner{position:relative;z-index:1;max-width:1080px;margin:auto}
.mk-shipping-eyebrow span{padding:0 8px;color:#b5a48c}
.mk-shipping-hero h1{max-width:920px;margin:26px 0 20px;font-size:clamp(68px,9vw,130px);line-height:.9;letter-spacing:-.05em}
.mk-shipping-hero p{max-width:470px;color:#777168;font-size:13px;line-height:2}
.mk-shipping-hero-link{display:inline-flex;align-items:center;gap:24px;margin-top:24px;padding:13px 0;border:0;border-bottom:1px solid var(--gold);background:none;color:var(--espresso);font-size:10px!important;letter-spacing:.15em;cursor:pointer}
.mk-shipping-hero .mk-shipping-updated{margin-top:25px;font-size:10px;color:#998a78}
.mk-shipping-hero-decoration{position:absolute;right:-40px;bottom:-110px;font-family:"Cormorant Garamond",Georgia,serif;font-size:390px;letter-spacing:-.12em;white-space:nowrap;color:rgba(182,154,105,.09);pointer-events:none}
.mk-shipping-intro{padding:110px 24px;text-align:center}
.mk-shipping-intro>div{max-width:750px;margin:auto}
.mk-shipping-intro h2{margin:22px 0;font-size:clamp(53px,6vw,84px);line-height:1;letter-spacing:-.04em}
.mk-shipping-intro p{max-width:570px;margin:auto;color:#817b73;font-size:13px;line-height:2.15}
.mk-shipping-details{max-width:1250px;margin:auto;padding:40px 28px 125px;scroll-margin-top:90px}
.mk-shipping-section-heading{padding-bottom:36px;border-bottom:1px solid #d9cfc1}
.mk-shipping-section-heading h2{margin:18px 0 0;font-size:clamp(55px,6vw,82px);line-height:1}
.mk-shipping-section-row{display:grid;grid-template-columns:58px 75px minmax(0,1fr);gap:18px;align-items:start;padding:40px 0;border-bottom:1px solid #ded4c7}
.mk-shipping-section-index{padding-top:11px;font-size:11px;letter-spacing:.12em;color:#ad9879}
.mk-shipping-section-icon{display:grid;place-items:center;width:53px;height:53px;border:1px solid #d8c9b5;border-radius:50%;color:#a08760}
.mk-shipping-section-copy h3{margin:0 0 13px;font-size:clamp(29px,3vw,41px);line-height:1.1}
.mk-shipping-section-copy p{max-width:750px;margin:0 0 12px;color:#7a746d;font-size:12px;line-height:2}
.mk-shipping-section-copy .mk-shipping-policy-text{color:#4f4b45}
.mk-shipping-extra{margin-top:35px;padding:28px;background:#ece3d7}
.mk-shipping-extra p{font-size:12px;line-height:1.9}
.mk-shipping-support-strip{padding:80px 28px;background:var(--espresso);color:var(--ivory)}
.mk-shipping-support-inner{display:grid;grid-template-columns:70px minmax(0,1fr) auto;align-items:center;gap:30px;max-width:1200px;margin:auto}
.mk-shipping-support-icon{display:grid;place-items:center;width:62px;height:62px;border:1px solid #6b5944;border-radius:50%;color:#d7bd93}
.mk-shipping-support-inner h2{margin:10px 0;font-size:clamp(42px,5vw,65px);line-height:1}
.mk-shipping-support-inner p{max-width:530px;margin:0;color:#c3b8ab;font-size:12px;line-height:1.9}
.mk-shipping-support-button{display:flex;align-items:center;justify-content:center;gap:20px;min-height:52px;padding:0 24px;border:1px solid #a88d64;color:var(--ivory);font-size:10px;letter-spacing:.13em;transition:background .2s}
.mk-shipping-support-button:hover{background:#44382e}
.mk-shipping-faq{padding:130px 28px}
.mk-shipping-faq-grid{display:grid;grid-template-columns:.85fr 1.15fr;gap:90px;max-width:1200px;margin:auto}
.mk-shipping-faq-heading h2{margin:22px 0;font-size:clamp(53px,5vw,75px);line-height:.98;letter-spacing:-.035em}
.mk-shipping-faq-heading p{max-width:290px;color:#817b73;font-size:12px;line-height:2}
.mk-shipping-faq-item{border-bottom:1px solid #d9cfc1}
.mk-shipping-faq-item:first-child{border-top:1px solid #d9cfc1}
.mk-shipping-faq-item h3{margin:0}
.mk-shipping-faq-item button{display:flex;align-items:center;justify-content:space-between;gap:20px;width:100%;padding:24px 0;border:0;background:transparent;text-align:left;color:var(--espresso);font-family:"Manrope",sans-serif;font-size:12px;font-weight:600;line-height:1.8;cursor:pointer}
.mk-shipping-faq-item button svg{flex-shrink:0;transition:transform .2s}
.mk-shipping-faq-item button svg.is-open{transform:rotate(180deg)}
.mk-shipping-faq-answer{padding:0 35px 24px 0}
.mk-shipping-faq-answer p{margin:0;color:#777169;font-size:12px;line-height:2}
.mk-shipping-footer-cta{padding:110px 24px 125px;background:#e9e0d4;text-align:center}
.mk-shipping-footer-cta h2{margin:22px 0 35px;font-size:clamp(54px,6vw,85px);line-height:1}
.mk-shipping-footer-links{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:15px}
.mk-shipping-footer-links a{display:inline-flex;align-items:center;justify-content:center;gap:20px;min-height:50px;padding:0 19px;border:1px solid #a99b87;color:var(--espresso);font-size:9px;font-weight:600;letter-spacing:.1em;transition:background .2s,color .2s}
.mk-shipping-footer-links a:hover{background:var(--espresso);color:var(--ivory)}
@media(max-width:850px){.mk-shipping-support-inner{grid-template-columns:60px 1fr}.mk-shipping-support-button{grid-column:2;justify-self:start}.mk-shipping-faq-grid{gap:45px}}
@media(max-width:650px){.mk-shipping-hero{min-height:470px;padding:125px 22px 80px}.mk-shipping-hero h1{font-size:clamp(60px,12vw,83px)}.mk-shipping-hero-decoration{font-size:230px;bottom:-55px}.mk-shipping-intro{padding:80px 22px}.mk-shipping-details{padding:20px 22px 85px}.mk-shipping-section-row{grid-template-columns:38px minmax(0,1fr);gap:12px;padding:30px 0}.mk-shipping-section-index{grid-column:1;grid-row:1}.mk-shipping-section-icon{grid-column:1;grid-row:2;width:36px;height:36px}.mk-shipping-section-icon svg{width:18px}.mk-shipping-section-copy{grid-column:2;grid-row:1/span 2}.mk-shipping-support-strip{padding:70px 22px}.mk-shipping-support-inner{grid-template-columns:1fr;gap:18px}.mk-shipping-support-button{grid-column:1}.mk-shipping-faq{padding:90px 22px}.mk-shipping-faq-grid{grid-template-columns:1fr;gap:35px}.mk-shipping-footer-cta{padding:85px 22px}.mk-shipping-footer-links{flex-direction:column}.mk-shipping-footer-links a{width:100%;max-width:350px;justify-content:space-between}}
@media(prefers-reduced-motion:reduce){.mk-shipping-page *{transition:none!important;scroll-behavior:auto!important}}
`;
