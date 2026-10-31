import { useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowUpRight, Heart, ShoppingBag, UserRound, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// Maison Kiyora — standalone mobile navigation drawer.
// Controlled by Navbar: open, onClose, cartCount, wishlistCount, triggerRef.
// Does not render an announcement bar or header, so it won't duplicate Navbar.

const NAV_LINKS = [
  { label: "Home", to: "/", end: true },
  { label: "The Collection", to: "/collections" },
  { label: "Our Story", to: "/our-story" },
  { label: "Contact", to: "/contact" },
];
const EASE = [0.22, 1, 0.36, 1];

const STYLES = `
  .mk-mobile-menu__backdrop{position:fixed;inset:0;z-index:299;background:rgba(17,28,48,.55);backdrop-filter:blur(3px)}
  .mk-mobile-menu{position:fixed;top:0;bottom:0;left:0;z-index:300;display:flex;flex-direction:column;width:min(88vw,390px);max-width:100%;padding:26px 28px max(24px,env(safe-area-inset-bottom));overflow-y:auto;overscroll-behavior:contain;background:#f5f0e8;color:#1d2940;box-shadow:15px 0 55px rgba(17,28,48,.12);font-family:"Manrope",sans-serif}
  .mk-mobile-menu__head{display:flex;align-items:center;justify-content:space-between;gap:12px}
  .mk-mobile-menu__brand{font:500 26px/1 "Cormorant Garamond",Georgia,serif;letter-spacing:.08em}
  .mk-mobile-menu__close{display:grid;place-items:center;flex:0 0 auto;width:38px;height:38px;padding:0;border:0;background:transparent;color:#1d2940;cursor:pointer}
  .mk-mobile-menu__rule{height:1px;margin:30px 0 22px;background:rgba(29,41,64,.13)}
  .mk-mobile-menu__link{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:17px 0;border-bottom:1px solid rgba(29,41,64,.13);color:#1d2940;text-decoration:none;font:400 clamp(27px,7vw,37px)/1 "Cormorant Garamond",Georgia,serif}
  .mk-mobile-menu__link--active{color:#8c7044}
  .mk-mobile-menu__link svg{flex-shrink:0}
  .mk-mobile-menu__utilities{display:grid;gap:6px;margin-top:26px}
  .mk-mobile-menu__utility{display:flex;align-items:center;gap:13px;min-height:45px;color:#1d2940;text-decoration:none;font-size:12px;font-weight:600}
  .mk-mobile-menu__utility svg{flex-shrink:0}
  .mk-mobile-menu__footer{margin-top:auto;padding-top:40px}
  .mk-mobile-menu__eyebrow{margin:0;color:#8c7044;font-size:10px;font-weight:700;letter-spacing:.18em}
  .mk-mobile-menu__footer-copy{max-width:290px;margin:12px 0 0;color:#50596a;font:400 25px/1.2 "Cormorant Garamond",Georgia,serif}
  .mk-mobile-menu__close:focus-visible,.mk-mobile-menu__link:focus-visible,.mk-mobile-menu__utility:focus-visible{outline:2px solid #b69a69;outline-offset:4px}
  @media(max-width:420px){.mk-mobile-menu{padding-inline:22px}.mk-mobile-menu__brand{font-size:23px}}
`;

function getFocusable(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(
    'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])'
  )).filter((element) => element.getClientRects().length > 0);
}

export default function MobileMenu({
  open = false,
  onClose = () => {},
  cartCount = 0,
  wishlistCount = 0,
  triggerRef,
  navLinks = NAV_LINKS,
  className = "",
}) {
  const reducedMotion = useReducedMotion();
  const location = useLocation();
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Close on navigation, including search/query changes.
  useEffect(() => {
    if (open) onCloseRef.current();
    // Only route changes should trigger this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => closeRef.current?.focus());

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const elements = getFocusable(dialogRef.current);
      if (!elements.length) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      const focusTarget = triggerRef?.current?.isConnected
        ? triggerRef.current
        : previouslyFocused?.isConnected
          ? previouslyFocused
          : null;
      focusTarget?.focus();
    };
  }, [open, triggerRef]);

  const countText = (value) => {
    const count = Number(value);
    return Number.isFinite(count) && count > 0 ? ` (${Math.floor(count)})` : "";
  };

  return (
    <>
      <style>{STYLES}</style>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="mk-mobile-backdrop"
              className="mk-mobile-menu__backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.aside
              key="mk-mobile-drawer"
              ref={dialogRef}
              id="mk-mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              tabIndex={-1}
              className={["mk-mobile-menu", className].filter(Boolean).join(" ")}
              initial={reducedMotion ? { opacity: 0 } : { x: "-100%" }}
              animate={reducedMotion ? { opacity: 1 } : { x: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { x: "-100%" }}
              transition={{ duration: reducedMotion ? 0 : 0.38, ease: EASE }}
            >
              <div className="mk-mobile-menu__head">
                <span className="mk-mobile-menu__brand">MAISON KIYORA</span>
                <button ref={closeRef} type="button" className="mk-mobile-menu__close" onClick={onClose} aria-label="Close navigation menu">
                  <X size={22} strokeWidth={1.4} aria-hidden="true" />
                </button>
              </div>
              <div className="mk-mobile-menu__rule" aria-hidden="true" />
              <nav aria-label="Mobile main navigation">
                {navLinks.map(({ label, to, end }) => (
                  <NavLink
                    key={`${to}-${label}`}
                    to={to}
                    end={end}
                    onClick={onClose}
                    className={({ isActive }) => `mk-mobile-menu__link${isActive ? " mk-mobile-menu__link--active" : ""}`}
                  >
                    <span>{label}</span>
                    <ArrowUpRight size={18} strokeWidth={1.3} aria-hidden="true" />
                  </NavLink>
                ))}
              </nav>
              <div className="mk-mobile-menu__utilities">
                <Link to="/wishlist" onClick={onClose} className="mk-mobile-menu__utility">
                  <Heart size={18} strokeWidth={1.4} aria-hidden="true" />
                  <span>Wishlist{countText(wishlistCount)}</span>
                </Link>
                <Link to="/cart" onClick={onClose} className="mk-mobile-menu__utility">
                  <ShoppingBag size={18} strokeWidth={1.4} aria-hidden="true" />
                  <span>Shopping Bag{countText(cartCount)}</span>
                </Link>
                <Link to="/account" onClick={onClose} className="mk-mobile-menu__utility">
                  <UserRound size={18} strokeWidth={1.4} aria-hidden="true" />
                  <span>My Account</span>
                </Link>
              </div>
              <div className="mk-mobile-menu__footer">
                <p className="mk-mobile-menu__eyebrow">THE ART OF SLOW PERFUMERY</p>
                <p className="mk-mobile-menu__footer-copy">Discover the Maison Kiyora collection.</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
