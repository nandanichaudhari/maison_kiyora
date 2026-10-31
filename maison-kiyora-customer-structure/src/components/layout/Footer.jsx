
import { useState } from "react";

import { Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  Instagram,
  Mail,
  Phone,
  PackageCheck,
  MessageCircle,
} from "lucide-react";

import { toast } from "react-toastify";

const FOOTER_STYLES = `
.mk-footer {
  --mkf-bg: #111c30;
  --mkf-ivory: #f5f0e8;
  --mkf-gold-light: #d8c29b;
  --mkf-line: rgba(245,240,232,.15);
  --mkf-muted: rgba(245,240,232,.7);
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: var(--mkf-bg);
  color: var(--mkf-ivory);
  font-family: "Manrope", sans-serif;
}
.mk-footer *, .mk-footer *::before, .mk-footer *::after { box-sizing: border-box; }
.mk-footer .mk-container { width: min(1220px, calc(100% - 80px)); margin-inline: auto; }
.mk-footer a { color: inherit; text-decoration: none; }
.mk-footer a:focus-visible, .mk-footer button:focus-visible, .mk-footer input:focus-visible { outline: 2px solid var(--mkf-gold-light); outline-offset: 4px; }

/* Newsletter: natural content height, no oversized top/bottom gaps */
.mk-footer .mk-footer-editorial {
  position: relative;
  display: block;
  height: auto;
  min-height: 0;
  padding: 28px 0 30px;
  margin: 0;
  background: radial-gradient(ellipse at 17% 110%, rgba(245,240,232,.075), transparent 45%);
}
.mk-footer-editorial::before { content: ""; position: absolute; top: 0; left: 50%; width: min(1220px, calc(100% - 80px)); height: 1px; transform: translateX(-50%); background: var(--mkf-line); }
.mk-footer .mk-footer-editorial__inner {
  display: grid;
  grid-template-columns: minmax(0,1fr) minmax(0,1fr);
  align-items: center;
  gap: clamp(30px,4vw,65px);
  height: auto;
  min-height: 0;
}
.mk-footer .mk-footer-editorial__identity,
.mk-footer .mk-footer-newsletter { min-height: 0; margin: 0; padding: 0; }
.mk-footer-editorial__eyebrow, .mk-footer-newsletter__eyebrow, .mk-footer__heading { color: var(--mkf-gold-light); font-size: 11px; font-weight: 700; letter-spacing: .22em; line-height: 1.5; }
.mk-footer .mk-footer-editorial__statement {
  max-width: 560px;
  margin: 10px 0 0;
  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: clamp(40px,4.2vw,62px);
  line-height: .98;
  letter-spacing: -.045em;
  font-weight: 400;
}
.mk-footer-editorial__statement em, .mk-footer-newsletter__title em { font-weight: 400; color: var(--mkf-gold-light); }
.mk-footer-newsletter { max-width: 570px; }
.mk-footer .mk-footer-newsletter__title {
  margin: 8px 0 8px;
  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: clamp(36px,3.1vw,49px);
  line-height: 1;
  letter-spacing: -.035em;
  font-weight: 400;
}
.mk-footer .mk-footer-newsletter__description { margin: 0 0 9px; color: var(--mkf-muted); font-size: 12px; line-height: 1.65; }
.mk-footer .mk-footer-newsletter__form { display: flex; align-items: center; min-height: 42px; margin: 0; border-bottom: 1px solid rgba(245,240,232,.48); transition: border-color .25s ease; }
.mk-footer-newsletter__form:focus-within { border-color: var(--mkf-gold-light); }
.mk-footer-newsletter__form input { flex: 1; min-width: 0; padding: 9px 0; border: 0; background: transparent; color: var(--mkf-ivory); font: inherit; font-size: 12px; outline: none; }
.mk-footer-newsletter__form input::placeholder { color: rgba(245,240,232,.66); }
.mk-footer-newsletter__form input:disabled { opacity: 1; cursor: not-allowed; }
.mk-footer-newsletter__form button { display: grid; place-items: center; width: 42px; height: 42px; border: 0; background: transparent; color: var(--mkf-gold-light); cursor: pointer; transition: transform .2s ease; }
.mk-footer-newsletter__form button:not(:disabled):hover { transform: translateX(4px); }
.mk-footer-newsletter__form button:disabled { cursor: not-allowed; opacity: .6; }
.mk-footer .mk-footer-newsletter__note { margin: 6px 0 0; color: var(--mkf-gold-light); font-size: 11px; }
.mk-footer .mk-footer-newsletter__privacy { margin: 6px 0 0; max-width: 540px; color: var(--mkf-muted); font-size: 10px; line-height: 1.55; }
.mk-footer-newsletter__privacy a { color: var(--mkf-gold-light); text-decoration: underline; text-underline-offset: 4px; }
.mk-footer .mk-visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; }

/* Footer links and information */
.mk-footer .mk-footer__main { display: grid; grid-template-columns: minmax(190px,1.25fr) minmax(120px,.8fr) minmax(155px,1fr) minmax(160px,1fr); gap: clamp(22px,3vw,48px); padding: 26px 0; border-top: 1px solid var(--mkf-line); }
.mk-footer__brand { display: inline-block; font-family: "Cormorant Garamond", Georgia, serif; font-size: clamp(43px,4vw,60px); line-height: .83; letter-spacing: -.035em; font-weight: 400; }
.mk-footer .mk-footer__description { max-width: 300px; margin: 18px 0 17px; font-size: 12px; line-height: 1.7; color: var(--mkf-muted); }
.mk-footer__signature { display: flex; align-items: center; gap: 9px; color: var(--mkf-gold-light); }
.mk-footer__signature > span { width: 22px; height: 1px; background: currentColor; }
.mk-footer__signature small { font-size: 9px; letter-spacing: .16em; line-height: 1.6; }
.mk-footer .mk-footer__heading { margin: 0 0 18px; }
.mk-footer__links { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }
.mk-footer__links a { display: inline-block; color: var(--mkf-muted); font-size: 12px; line-height: 1.5; transition: color .2s ease, transform .2s ease; }
.mk-footer__links a:hover { color: var(--mkf-gold-light); transform: translateX(3px); }
.mk-footer .mk-footer-support__text { margin: 0 0 13px; color: var(--mkf-muted); font-size: 12px; line-height: 1.7; }
.mk-footer .mk-footer-support__contact { display: flex; align-items: center; gap: 9px; margin: 10px 0; font-size: 12px; color: var(--mkf-muted); transition: color .2s ease; overflow-wrap: anywhere; }
.mk-footer-support__contact svg { flex: 0 0 auto; color: var(--mkf-gold-light); }
.mk-footer-support__contact:hover { color: var(--mkf-gold-light); }
.mk-footer .mk-footer-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 17px 0; border-top: 1px solid var(--mkf-line); border-bottom: 1px solid var(--mkf-line); }
.mk-footer-info__item { display: flex; align-items: flex-start; gap: 12px; }
.mk-footer-info__item > svg { flex-shrink: 0; margin-top: 3px; color: var(--mkf-gold-light); }
.mk-footer-info__item strong { display: block; margin-bottom: 4px; font-size: 12px; font-weight: 600; }
.mk-footer-info__item span { display: block; color: var(--mkf-muted); font-size: 11px; line-height: 1.7; }
.mk-footer .mk-footer__bottom { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 16px; padding: 17px 0 22px; color: var(--mkf-muted); font-size: 10px; }
.mk-footer__bottom p { margin: 0; }
.mk-footer__bottom-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 25px; }
.mk-footer__bottom-links a:hover { color: var(--mkf-gold-light); }
.mk-footer__country { justify-self: end; color: var(--mkf-gold-light); letter-spacing: .22em; font-weight: 700; }
.mk-footer__giant-wordmark { display: none; }
.mk-footer > .mk-container { position: relative; z-index: 1; }

@media (max-width: 1100px) {
  .mk-footer .mk-footer__main { grid-template-columns: 1.15fr 1fr 1fr; gap: 26px; }
  .mk-footer__main > :last-child { grid-column: 2 / 4; }
}
@media (max-width: 760px) {
  .mk-footer .mk-container { width: calc(100% - 40px); }
  .mk-footer-editorial::before { width: calc(100% - 40px); }
  .mk-footer .mk-footer-editorial { padding: 24px 0 26px; }
  .mk-footer .mk-footer-editorial__inner { grid-template-columns: 1fr; gap: 20px; }
  .mk-footer .mk-footer-editorial__statement { font-size: clamp(39px,8vw,56px); }
  .mk-footer .mk-footer-newsletter__title { font-size: clamp(37px,7vw,48px); }
  .mk-footer .mk-footer__main { grid-template-columns: 1fr 1fr; gap: 28px 22px; padding: 26px 0 24px; }
  .mk-footer__brand-column { grid-column: 1 / -1; }
  .mk-footer__main > :last-child { grid-column: auto; }
  .mk-footer .mk-footer__bottom { grid-template-columns: 1fr auto; }
  .mk-footer__bottom-links { grid-column: 1 / -1; grid-row: 2; justify-content: flex-start; }
}
@media (max-width: 480px) {
  .mk-footer .mk-footer-editorial { padding: 22px 0 24px; }
  .mk-footer .mk-footer-editorial__inner { gap: 18px; }
  .mk-footer .mk-footer-editorial__statement { font-size: clamp(38px,10vw,48px); }
  .mk-footer .mk-footer-newsletter__title { font-size: 40px; }
  .mk-footer .mk-footer__main { gap: 24px 18px; }
  .mk-footer__main > :last-child { grid-column: 1 / -1; }
  .mk-footer__links { gap: 11px; }
  .mk-footer .mk-footer-info { grid-template-columns: 1fr; gap: 16px; }
  .mk-footer .mk-footer__bottom { grid-template-columns: 1fr; gap: 12px; }
  .mk-footer__bottom-links { grid-column: auto; grid-row: auto; }
  .mk-footer__country { justify-self: start; }
}
@media (prefers-reduced-motion: reduce) {
  .mk-footer *, .mk-footer *::before, .mk-footer *::after { transition: none !important; }
}
`;

// ======================================================
// MAISON KIYORA — LUXURY FOOTER
// The Art of Slow Perfumery
//
// Features:
// - Luxury brand identity
// - Newsletter interest form
// - Collection and support navigation
// - Verified customer support number
// - International shipping information
// - Responsive editorial layout
//
// IMPORTANT:
// Newsletter submission requires backend integration.
// Social links are hidden until verified.
// ======================================================

// ------------------------------------------------------
// BRAND CONFIGURATION
// ------------------------------------------------------

const BRAND = {
  name: "MAISON KIYORA",
  tagline: "THE ART OF SLOW PERFUMERY",

  phone: "+91 96253 60942",
  phoneHref: "tel:+919625360942",

  email: "",

  // Add only verified official social links.
  instagram: "",

  // Set true only after newsletter backend is connected.
  newsletterEnabled: false, // Legacy config; pass onSubscribe to activate.
};

// ------------------------------------------------------
// NAVIGATION DATA
// ------------------------------------------------------

const FOOTER_LINKS = {
  explore: [
    {
      label: "All Fragrances",
      to: "/collections",
    },
    {
      label: "Our Story",
      to: "/our-story",
    },
    {
      label: "My Wishlist",
      to: "/wishlist",
    },
    {
      label: "My Account",
      to: "/account",
    },
  ],

  assistance: [
    {
      label: "Contact Us",
      to: "/contact",
    },
    {
      label: "Shipping Information",
      to: "/shipping-policy",
    },
    {
      label: "Returns & Refunds",
      to: "/returns-refunds",
    },
    {
      label: "Track Your Orders",
      to: "/orders",
    },
  ],

  legal: [
    {
      label: "Privacy Policy",
      to: "/privacy-policy",
    },
    {
      label: "Terms & Conditions",
      to: "/terms",
    },
  ],
};

// ------------------------------------------------------
// REUSABLE FOOTER LINK GROUP
// ------------------------------------------------------

function FooterLinkGroup({ title, links }) {
  return (
    <div className="mk-footer__column">
      <h3 className="mk-footer__heading">
        {title}
      </h3>

      <nav aria-label={`${title} links`}>
        <ul className="mk-footer__links">
          {links.map((item) => (
            <li key={item.to}>
              <Link to={item.to}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

// ------------------------------------------------------
// NEWSLETTER
// ------------------------------------------------------

function Newsletter({ onSubscribe }) {
  const [email, setEmail] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanedEmail = email.trim();

    if (!cleanedEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!event.currentTarget.checkValidity()) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!onSubscribe) {
      toast.info(
        "Newsletter subscriptions are not available yet."
      );
      return;
    }

    try {
      await onSubscribe(cleanedEmail);
      toast.success("Thank you for subscribing.");
      setEmail("");
    } catch (error) {
      toast.error(error?.message || "Could not subscribe. Please try again.");
    }
  }

  return (
    <div className="mk-footer-newsletter">
      <span
        className="mk-footer-newsletter__eyebrow"
      >
        A NOTE FROM MAISON KIYORA
      </span>

      <h2 className="mk-footer-newsletter__title">
        The beauty of
        <br />
        <em>slowing down.</em>
      </h2>

      <p className="mk-footer-newsletter__description">
        Discover our fragrances and the world
        of Maison Kiyora.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mk-footer-newsletter__form"
      >
        <label
          htmlFor="mk-newsletter-email"
          className="mk-visually-hidden"
        >
          Email address for newsletter
        </label>

        <input
          id="mk-newsletter-email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="Your email address"
          autoComplete="email"
          required
          maxLength={254}
          disabled={!onSubscribe}
        />

        <button
          type="submit"
          aria-label="Subscribe to newsletter"
          disabled={!onSubscribe}
        >
          <ArrowRight
            size={20}
            strokeWidth={1.4}
            aria-hidden="true"
          />
        </button>
      </form>

      {!onSubscribe && (
        <p className="mk-footer-newsletter__note">
          Newsletter coming soon.
        </p>
      )}

      <p className="mk-footer-newsletter__privacy">
        When subscriptions become available,
        your email will be used only with your
        consent. See our{" "}
        <Link to="/privacy-policy">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

// ------------------------------------------------------
// CUSTOMER SUPPORT
// ------------------------------------------------------

function FooterSupport() {
  return (
    <div className="mk-footer__column">
      <h3 className="mk-footer__heading">
        GET IN TOUCH
      </h3>

      <p className="mk-footer-support__text">
        Questions about our collection
        or your order? Reach out to us.
      </p>

      <a
        href={BRAND.phoneHref}
        className="mk-footer-support__contact"
        aria-label={`Call Maison Kiyora at ${BRAND.phone}`}
      >
        <Phone
          size={16}
          strokeWidth={1.4}
          aria-hidden="true"
        />

        <span>{BRAND.phone}</span>
      </a>

      {BRAND.email && (
        <a
          href={`mailto:${BRAND.email}`}
          className="mk-footer-support__contact"
        >
          <Mail
            size={16}
            strokeWidth={1.4}
            aria-hidden="true"
          />

          <span>{BRAND.email}</span>
        </a>
      )}

      {BRAND.instagram && (
        <a
          href={BRAND.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="mk-footer-support__contact"
        >
          <Instagram
            size={16}
            strokeWidth={1.4}
            aria-hidden="true"
          />

          <span>Instagram</span>

          <ArrowUpRight
            size={14}
            strokeWidth={1.4}
            aria-hidden="true"
          />
        </a>
      )}
    </div>
  );
}

// ------------------------------------------------------
// TRUST / INFORMATION STRIP
// ------------------------------------------------------

function FooterInformation() {
  return (
    <div className="mk-footer-info">
      <div className="mk-footer-info__item">
        <PackageCheck
          size={22}
          strokeWidth={1.2}
          aria-hidden="true"
        />

        <div>
          <strong>
            Explore the Collection
          </strong>

          <span>
            Discover the Maison Kiyora fragrances
          </span>
        </div>
      </div>

      <div className="mk-footer-info__item">
        <MessageCircle
          size={22}
          strokeWidth={1.2}
          aria-hidden="true"
        />

        <div>
          <strong>
            Customer Assistance
          </strong>

          <span>
            Here to help with your enquiries
          </span>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// MAIN FOOTER COMPONENT
// ======================================================

export default function Footer({ onSubscribe }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mk-footer">
      <style>{FOOTER_STYLES}</style>
      {/* Newsletter / editorial introduction */}
      <div className="mk-footer-editorial">
        <div className="mk-container">
          <div className="mk-footer-editorial__inner">
            <div className="mk-footer-editorial__identity">
              <span className="mk-footer-editorial__eyebrow">
                MAISON KIYORA
              </span>

              <p className="mk-footer-editorial__statement">
                An invitation to
                <br />
                <em>experience fragrance.</em>
              </p>
            </div>

            <Newsletter onSubscribe={onSubscribe} />
          </div>
        </div>
      </div>

      {/* Main footer columns */}
      <div className="mk-container">
        <div className="mk-footer__main">
          {/* Brand */}
          <div className="mk-footer__brand-column">
            <Link
              to="/"
              className="mk-footer__brand"
              aria-label="Maison Kiyora homepage"
            >
              MAISON
              <br />
              KIYORA
            </Link>

            <p className="mk-footer__description">
              The Art of Slow Perfumery.
              Explore the Maison Kiyora
              fragrance collection.
            </p>

            <div className="mk-footer__signature">
              <span />
              <small>
                MADE FOR MOMENTS THAT MATTER
              </small>
            </div>
          </div>

          {/* Navigation */}
          <FooterLinkGroup
            title="EXPLORE"
            links={FOOTER_LINKS.explore}
          />

          {/* Customer care */}
          <FooterLinkGroup
            title="CUSTOMER CARE"
            links={FOOTER_LINKS.assistance}
          />

          {/* Support */}
          <FooterSupport />
        </div>

        {/* Collection discovery and customer assistance */}
        <FooterInformation />

        {/* Bottom bar */}
        <div className="mk-footer__bottom">
          <p>
            © {currentYear} Maison Kiyora.
            All rights reserved.
          </p>

          <div className="mk-footer__bottom-links">
            {FOOTER_LINKS.legal.map((item) => (
              <Link
                key={item.to}
                to={item.to}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <span className="mk-footer__country">
            INDIA
          </span>
        </div>
      </div>

      {/* Decorative background wordmark: absolute, consumes no layout height */}
      <div
        className="mk-footer__giant-wordmark"
        aria-hidden="true"
      >
        MAISON KIYORA
      </div>
    </footer>
  );
}
