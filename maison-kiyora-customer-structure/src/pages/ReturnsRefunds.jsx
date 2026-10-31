import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  ClipboardCheck,
  Headphones,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

/**
 * MAISON KIYORA — RETURNS & REFUNDS
 *
 * IMPORTANT: This page intentionally does not promise any return window,
 * refund turnaround, eligibility, or cancellation deadline. Replace the
 * configurable policy details below ONLY with terms approved by the merchant.
 * Do not publish this page as a finalized legal policy until approved.
 */
const POLICY = {
  effectiveDate: "", // e.g. "30 October 2026" after merchant approval
  supportEmail: "", // approved customer-support email
  returnWindow: "", // approved time period, if applicable
  refundTimeline: "", // approved processing time, if applicable
  cancellationDeadline: "", // approved cancellation conditions
  damagedItemReporting: "", // approved reporting period and evidence requirements
};

const sections = [
  {
    id: "eligibility",
    number: "01",
    title: "Return eligibility",
    description:
      "Whether a fragrance can be returned depends on the applicable product condition, reason for return, and the policy confirmed at purchase. Please contact our team before sending anything back.",
    details: [
      {
        label: "Return request window",
        value: POLICY.returnWindow || "To be confirmed by Maison Kiyora support.",
      },
      {
        label: "Product condition requirements",
        value: "Please request confirmation of eligibility before returning a product.",
      },
    ],
  },
  {
    id: "issues",
    number: "02",
    title: "Damaged or incorrect orders",
    description:
      "If your order arrives damaged, incomplete, or different from what you purchased, please contact our support team with your order reference and a description of the issue.",
    details: [
      {
        label: "Reporting period",
        value: POLICY.damagedItemReporting || "Please contact support promptly; the applicable reporting period is subject to confirmation.",
      },
      {
        label: "Helpful information",
        value: "Order number, item name, and clear photos of the product and packaging, where relevant.",
      },
    ],
  },
  {
    id: "refunds",
    number: "03",
    title: "Refund requests",
    description:
      "Refund eligibility and processing depend on the outcome of the support review and the original payment method. Submitting a request does not automatically mean a refund is approved.",
    details: [
      {
        label: "Processing timeline",
        value: POLICY.refundTimeline || "The applicable timeline will be shared by support once the request is reviewed.",
      },
      {
        label: "Refund destination",
        value: "Support will confirm the available refund method for an approved request.",
      },
    ],
  },
  {
    id: "cancellations",
    number: "04",
    title: "Order cancellations",
    description:
      "If you need to cancel an order, contact us as soon as possible with your order number. Cancellation is subject to the order's current processing status and the applicable policy.",
    details: [
      {
        label: "Cancellation cutoff",
        value: POLICY.cancellationDeadline || "Please ask support whether your order is still eligible for cancellation.",
      },
    ],
  },
];

const faqs = [
  {
    question: "Can I return a perfume after opening it?",
    answer:
      "Eligibility for opened or used fragrances has not yet been published. Contact Maison Kiyora support with your order number before attempting a return.",
  },
  {
    question: "What if I receive a damaged bottle?",
    answer:
      "Contact support promptly with your order reference and photos showing the issue. The team can explain the next steps and applicable resolution options.",
  },
  {
    question: "How long does a refund take?",
    answer:
      POLICY.refundTimeline ||
      "There is no confirmed refund-processing timeline published here yet. Support can provide the applicable timeline after reviewing an eligible request.",
  },
  {
    question: "Can I cancel an order after placing it?",
    answer:
      "Cancellation may depend on the order's processing status. Please contact support as soon as possible to check whether cancellation is available.",
  },
  {
    question: "Where should I send a return package?",
    answer:
      "Do not ship a return without instructions from Maison Kiyora support. The team will confirm whether the return is accepted and provide the correct address and procedure.",
  },
];

function FadeIn({ children, className = "", delay = 0 }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.65, delay }}
    >
      {children}
    </motion.div>
  );
}

function FAQItem({ item, isOpen, onToggle, index }) {
  return (
    <div className={`mk-rr-faq-item ${isOpen ? "is-open" : ""}`}>
      <h3>
        <button
          type="button"
          className="mk-rr-faq-question"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={`mk-rr-answer-${index}`}
        >
          <span>{item.question}</span>
          <ChevronDown size={19} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`mk-rr-answer-${index}`}
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mk-rr-faq-answer"
          >
            <p>{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ReturnsRefunds() {
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    document.title = "Returns & Refunds | Maison Kiyora";
  }, []);

  return (
    <main className="mk-rr-page">
      <style>{styles}</style>

      <section className="mk-rr-hero" aria-labelledby="mk-rr-title">
        <motion.div
          className="mk-rr-hero-inner"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="mk-rr-eyebrow">MAISON KIYORA / CUSTOMER CARE</span>
          <h1 id="mk-rr-title">
            Returns <span>&</span>
            <br />
            <em>Refunds.</em>
          </h1>
          <p>Guidance for returns, order concerns, refunds and cancellations.</p>
          {POLICY.effectiveDate && (
            <span className="mk-rr-date">EFFECTIVE {POLICY.effectiveDate}</span>
          )}
        </motion.div>
      </section>

      <section className="mk-rr-intro" aria-labelledby="mk-rr-intro-title">
        <FadeIn className="mk-rr-intro-inner">
          <span className="mk-rr-eyebrow">HERE TO HELP</span>
          <h2 id="mk-rr-intro-title">
            Thoughtful care,
            <br />
            <em>every step of the way.</em>
          </h2>
          <p>
            We want you to have clear guidance if something about your order
            needs attention. The information below explains how to reach us and
            what to expect while your request is reviewed.
          </p>
          <div className="mk-rr-notice" role="note">
            <ShieldCheck size={20} strokeWidth={1.5} aria-hidden="true" />
            <p>
              <strong>Policy details pending confirmation.</strong> Exact
              eligibility rules, deadlines and processing timelines must be
              confirmed by Maison Kiyora before this page is treated as the
              final store policy.
            </p>
          </div>
        </FadeIn>
      </section>

      <section className="mk-rr-process" aria-labelledby="mk-rr-process-title">
        <div className="mk-rr-shell">
          <FadeIn className="mk-rr-heading">
            <span className="mk-rr-eyebrow">HOW TO REQUEST HELP</span>
            <h2 id="mk-rr-process-title">A simple <em>process.</em></h2>
          </FadeIn>
          <div className="mk-rr-process-grid">
            {[
              {
                icon: ClipboardCheck,
                number: "01",
                title: "Gather your details",
                text: "Keep your order number and a short description of the issue ready.",
              },
              {
                icon: Headphones,
                number: "02",
                title: "Contact support",
                text: "Send your request through our contact page. Include photos if relevant.",
              },
              {
                icon: PackageCheck,
                number: "03",
                title: "Follow the guidance",
                text: "Wait for eligibility confirmation and instructions before sending anything back.",
              },
            ].map(({ icon: Icon, number, title, text }, index) => (
              <FadeIn className="mk-rr-step" key={number} delay={index * 0.08}>
                <div className="mk-rr-step-top">
                  <Icon size={25} strokeWidth={1.25} aria-hidden="true" />
                  <span>{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-rr-policy" aria-labelledby="mk-rr-policy-title">
        <div className="mk-rr-shell">
          <FadeIn className="mk-rr-heading">
            <span className="mk-rr-eyebrow">THE DETAILS</span>
            <h2 id="mk-rr-policy-title">Our <em>guidance.</em></h2>
          </FadeIn>
          <div className="mk-rr-policy-list">
            {sections.map((section) => (
              <FadeIn className="mk-rr-policy-row" key={section.id}>
                <div className="mk-rr-policy-number">{section.number}</div>
                <div className="mk-rr-policy-content" id={section.id}>
                  <h3>{section.title}</h3>
                  <p>{section.description}</p>
                  <dl>
                    {section.details.map((detail) => (
                      <div key={detail.label}>
                        <dt>{detail.label}</dt>
                        <dd>{detail.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-rr-faq" aria-labelledby="mk-rr-faq-title">
        <div className="mk-rr-faq-layout mk-rr-shell">
          <FadeIn className="mk-rr-faq-aside">
            <span className="mk-rr-eyebrow">GOOD TO KNOW</span>
            <h2 id="mk-rr-faq-title">Frequently<br /><em>asked.</em></h2>
            <p>Answers to common questions about order concerns.</p>
          </FadeIn>
          <div className="mk-rr-faq-list">
            {faqs.map((item, index) => (
              <FAQItem
                key={item.question}
                item={item}
                index={index}
                isOpen={openFaq === index}
                onToggle={() => setOpenFaq((current) => current === index ? -1 : index)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mk-rr-support" aria-labelledby="mk-rr-support-title">
        <FadeIn className="mk-rr-support-inner">
          <RotateCcw size={27} strokeWidth={1.2} aria-hidden="true" />
          <span className="mk-rr-eyebrow">PERSONAL ASSISTANCE</span>
          <h2 id="mk-rr-support-title">We're here to <em>help.</em></h2>
          <p>
            Have a question about an order? Reach out to our team and include
            your order reference so we can understand your request.
          </p>
          <div className="mk-rr-actions">
            <Link className="mk-rr-primary-link" to="/contact">
              CONTACT SUPPORT <ArrowRight size={17} strokeWidth={1.5} />
            </Link>
            <Link className="mk-rr-secondary-link" to="/orders">
              VIEW MY ORDERS
            </Link>
          </div>
          {POLICY.supportEmail && (
            <a className="mk-rr-email" href={`mailto:${POLICY.supportEmail}`}>
              {POLICY.supportEmail}
            </a>
          )}
        </FadeIn>
      </section>

      <nav className="mk-rr-bottom-nav" aria-label="Related information">
        <Link to="/shipping-policy">SHIPPING & DELIVERY <ArrowRight size={15} /></Link>
        <Link to="/collections">DISCOVER FRAGRANCES <ArrowRight size={15} /></Link>
      </nav>
    </main>
  );
}

const styles = `
  .mk-rr-page{--ivory:#F5F0E8;--espresso:#211C19;--gold:#B69A69;--sand:#D8C9B5;background:var(--ivory);color:var(--espresso);font-family:"Manrope",sans-serif;overflow:hidden}
  .mk-rr-page *,.mk-rr-page *::before,.mk-rr-page *::after{box-sizing:border-box}
  .mk-rr-page a{text-decoration:none}
  .mk-rr-shell{width:min(1240px,calc(100% - 48px));margin-inline:auto}
  .mk-rr-eyebrow{display:block;color:#a3875e;font-size:10px;font-weight:650;letter-spacing:.23em;line-height:1.7}
  .mk-rr-hero{position:relative;display:grid;place-items:center;min-height:580px;padding:150px 24px 100px;background:radial-gradient(ellipse at 70% 30%,rgba(182,154,105,.16),transparent 48%),#eae2d7;text-align:center}
  .mk-rr-hero::before{content:"";position:absolute;inset:12% 25%;border:1px solid rgba(182,154,105,.14);border-radius:50%;pointer-events:none}
  .mk-rr-hero-inner{position:relative;z-index:1}
  .mk-rr-hero h1{margin:25px 0 23px;font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(70px,10vw,145px);font-weight:400;line-height:.87;letter-spacing:-.055em}
  .mk-rr-hero h1 span{font-weight:300;font-style:italic}
  .mk-rr-hero h1 em,.mk-rr-page h2 em{color:var(--gold);font-weight:300}
  .mk-rr-hero p{margin:0;color:#77736f;font-size:12px;line-height:2}
  .mk-rr-date{display:block;margin-top:25px;color:#a3875e;font-size:9px;letter-spacing:.15em}
  .mk-rr-intro{padding:125px 24px 135px;text-align:center}
  .mk-rr-intro-inner{max-width:760px;margin:auto}
  .mk-rr-page h2{margin:20px 0;font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(52px,7vw,90px);font-weight:400;line-height:.99;letter-spacing:-.045em}
  .mk-rr-intro-inner>p{max-width:560px;margin:24px auto 0;color:#7b756e;font-size:13px;line-height:2.1}
  .mk-rr-notice{display:flex;gap:17px;align-items:flex-start;max-width:650px;margin:40px auto 0;padding:22px 24px;border:1px solid #d8c8b0;background:#f0e9df;text-align:left}
  .mk-rr-notice svg{flex-shrink:0;color:#94794e}
  .mk-rr-notice p{margin:0;color:#746c64;font-size:11px;line-height:1.9}
  .mk-rr-notice strong{color:var(--espresso)}
  .mk-rr-process{padding:115px 0 125px;background:#eae2d7}
  .mk-rr-heading{text-align:center;margin-bottom:58px}
  .mk-rr-process-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
  .mk-rr-step{min-height:245px;padding:34px;border:1px solid #d7c9b7;background:rgba(255,255,255,.25)}
  .mk-rr-step-top{display:flex;justify-content:space-between;align-items:center;color:#a3875e}
  .mk-rr-step-top span{font-size:11px;letter-spacing:.15em}
  .mk-rr-step h3{margin:37px 0 12px;font-family:"Cormorant Garamond",Georgia,serif;font-size:32px;font-weight:500}
  .mk-rr-step p{max-width:320px;margin:0;color:#7b756e;font-size:12px;line-height:1.9}
  .mk-rr-policy{padding:125px 0 140px}
  .mk-rr-policy-list{border-top:1px solid #d9cfc1}
  .mk-rr-policy-row{display:grid;grid-template-columns:100px minmax(0,1fr);gap:20px;padding:42px 0;border-bottom:1px solid #d9cfc1}
  .mk-rr-policy-number{padding-top:10px;color:#a3875e;font-size:11px;letter-spacing:.16em}
  .mk-rr-policy-content h3{margin:0 0 13px;font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(35px,4vw,51px);font-weight:500}
  .mk-rr-policy-content>p{max-width:750px;margin:0;color:#7b756e;font-size:12px;line-height:2}
  .mk-rr-policy-content dl{display:grid;gap:16px;margin:25px 0 0}
  .mk-rr-policy-content dl>div{display:grid;grid-template-columns:210px 1fr;gap:16px}
  .mk-rr-policy-content dt{color:#8b775c;font-size:11px;font-weight:650}
  .mk-rr-policy-content dd{margin:0;color:#7b756e;font-size:11px;line-height:1.8}
  .mk-rr-faq{padding:120px 0;background:#eae2d7}
  .mk-rr-faq-layout{display:grid;grid-template-columns:.8fr 1.2fr;gap:75px}
  .mk-rr-faq-aside h2{margin-top:25px}
  .mk-rr-faq-aside>p{max-width:290px;color:#7b756e;font-size:12px;line-height:2}
  .mk-rr-faq-list{border-top:1px solid #cdbfae}
  .mk-rr-faq-item{border-bottom:1px solid #cdbfae}
  .mk-rr-faq-item h3{margin:0}
  .mk-rr-faq-question{display:flex;justify-content:space-between;align-items:center;gap:22px;width:100%;padding:25px 0;border:0;background:transparent;color:var(--espresso);text-align:left;font:500 14px/1.6 "Manrope",sans-serif;cursor:pointer}
  .mk-rr-faq-question svg{flex-shrink:0;transition:transform .25s}
  .mk-rr-faq-item.is-open .mk-rr-faq-question svg{transform:rotate(180deg)}
  .mk-rr-faq-answer{overflow:hidden}
  .mk-rr-faq-answer p{margin:0;padding:0 35px 26px 0;color:#756f68;font-size:12px;line-height:2}
  .mk-rr-support{padding:130px 24px;text-align:center;background:var(--espresso);color:var(--ivory)}
  .mk-rr-support-inner{max-width:760px;margin:auto}
  .mk-rr-support-inner>svg{margin-bottom:22px;color:var(--gold)}
  .mk-rr-support h2{margin:25px 0;color:var(--ivory)}
  .mk-rr-support p{max-width:470px;margin:0 auto;color:#c0b5a9;font-size:12px;line-height:2}
  .mk-rr-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:15px;margin-top:38px}
  .mk-rr-primary-link,.mk-rr-secondary-link{display:inline-flex;justify-content:center;align-items:center;gap:25px;min-height:53px;padding:0 22px;font-size:10px;font-weight:650;letter-spacing:.12em;transition:transform .2s}
  .mk-rr-primary-link{background:var(--ivory);color:var(--espresso)}
  .mk-rr-secondary-link{border:1px solid #877761;color:var(--ivory)}
  .mk-rr-primary-link:hover,.mk-rr-secondary-link:hover{transform:translateY(-2px)}
  .mk-rr-email{display:inline-block;margin-top:27px;color:#d4bb93;font-size:12px;text-decoration:underline!important;text-underline-offset:5px}
  .mk-rr-bottom-nav{display:flex;justify-content:center;gap:50px;flex-wrap:wrap;padding:33px 20px;background:#eee7dc}
  .mk-rr-bottom-nav a{display:inline-flex;align-items:center;gap:12px;color:var(--espresso);font-size:10px;font-weight:600;letter-spacing:.12em}
  .mk-rr-bottom-nav a:hover{color:#9a7a4c}
  @media(max-width:850px){.mk-rr-faq-layout{grid-template-columns:1fr;gap:35px}.mk-rr-process-grid{gap:12px}.mk-rr-step{padding:25px}.mk-rr-policy-content dl>div{grid-template-columns:160px 1fr}}
  @media(max-width:650px){.mk-rr-shell{width:calc(100% - 36px)}.mk-rr-hero{min-height:490px;padding:130px 18px 75px}.mk-rr-hero h1{font-size:clamp(66px,13vw,95px)}.mk-rr-intro{padding:90px 18px}.mk-rr-page h2{font-size:clamp(51px,11vw,72px)}.mk-rr-process,.mk-rr-policy,.mk-rr-faq{padding:85px 0}.mk-rr-process-grid{grid-template-columns:1fr}.mk-rr-step{min-height:auto}.mk-rr-step h3{margin-top:22px}.mk-rr-policy-row{grid-template-columns:45px 1fr;gap:10px;padding:30px 0}.mk-rr-policy-content dl>div{grid-template-columns:1fr;gap:5px}.mk-rr-policy-content h3{font-size:35px}.mk-rr-faq-question{font-size:13px}.mk-rr-support{padding:95px 18px}.mk-rr-bottom-nav{gap:25px}}
  @media(prefers-reduced-motion:reduce){.mk-rr-page *,.mk-rr-page *::before,.mk-rr-page *::after{scroll-behavior:auto!important;transition-duration:.01ms!important;animation-duration:.01ms!important}}
`;
