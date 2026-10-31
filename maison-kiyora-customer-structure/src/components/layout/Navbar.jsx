
import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Search,
  Heart,
  ShoppingBag,
  UserRound,
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

import { useCart } from "../../context/CartContext.jsx";
import { useWishlist } from "../../context/WishlistContext.jsx";
import AnnouncementBar from "./AnnouncementBar.jsx";

// ======================================================
// MAISON KIYORA — TRANSPARENT LUXURY NAVBAR
// ======================================================

const NAV_LINKS = [
  { label: "Home", to: "/", end: true },
  { label: "Collection", to: "/collections" },
  { label: "Our Story", to: "/our-story" },
  { label: "Contact", to: "/contact" },
];

const EASE = [0.22, 1, 0.36, 1];

const NAVBAR_STYLES = `
  .kiyora-header {
    position: relative;
    z-index: 200;
    width: 100%;
    height: 96px;
    color: #211c19;
    background: #f5f0e8;
    border-bottom: 1px solid rgba(33,28,25,.09);
    transition:
      background .35s ease,
      border-color .35s ease,
      box-shadow .35s ease;
  }

  /* Keep announcement in normal flow and anchor the hero overlay to its bottom. */
  .kiyora-header-shell {
    position: relative;
    z-index: 200;
    width: 100%;
  }

  /* Preserve page layout when an inner-page navbar becomes fixed. */
  .kiyora-header-spacer {
    height: 96px;
  }

  /* Homepage: float directly over the hero */

  .kiyora-header--overlay {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    height: 96px;
    background: linear-gradient(
      to bottom,
      rgba(19,16,14,.52),
      rgba(19,16,14,0)
    );
    border-bottom: 1px solid rgba(255,255,255,.18);
    color: #f5f0e8;
  }

  /* Sticky glass header */

  .kiyora-header--scrolled {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 76px;
    background: rgba(245,240,232,.94);
    color: #211c19;
    border-bottom: 1px solid rgba(182,154,105,.25);
    box-shadow: 0 8px 35px rgba(33,28,25,.055);
    -webkit-backdrop-filter: blur(18px);
    backdrop-filter: blur(18px);
  }

  .kiyora-header__container {
    width: min(1540px, calc(100% - 100px));
    height: 100%;
    margin: 0 auto;
  }

  .kiyora-header__inner {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0,1fr) auto minmax(0,1fr);
    align-items: center;
    column-gap: 28px;
    height: 100%;
  }

  .kiyora-header__left,
  .kiyora-header__right {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .kiyora-header__right {
    justify-content: flex-end;
    gap: clamp(9px,1.4vw,22px);
  }

  /* Navigation */

  .kiyora-nav {
    display: flex;
    align-items: center;
    gap: clamp(17px,2vw,35px);
  }

  .kiyora-nav__link {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: inherit;
    font-family: "Manrope",Arial,sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: .135em;
    line-height: 1.4;
    text-decoration: none;
    text-transform: uppercase;
    white-space: nowrap;
    transition: color .25s ease;
  }

  .kiyora-nav__link::after {
    content: "";
    position: absolute;
    bottom: 8px;
    left: 0;
    width: 0;
    height: 1px;
    background: #b69a69;
    transition: width .3s ease;
  }

  .kiyora-nav__link:hover::after,
  .kiyora-nav__link.active::after {
    width: 100%;
  }

  .kiyora-nav__link:hover {
    color: #b69a69;
  }

  /* Centered logo */

  .kiyora-logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 7px;
    text-align: center;
    text-decoration: none;
    color: inherit;
    white-space: nowrap;
  }

  .kiyora-logo__name {
    font-family: "Cormorant Garamond",Georgia,serif;
    font-size: clamp(25px,2.5vw,36px);
    font-weight: 400;
    line-height: .95;
    letter-spacing: .145em;
  }

  .kiyora-logo__tagline {
    color: #b69a69;
    font-family: "Manrope",Arial,sans-serif;
    font-size: 7px;
    font-weight: 600;
    letter-spacing: .26em;
    line-height: 1.5;
  }

  .kiyora-header--overlay .kiyora-logo__tagline {
    color: #e1c79c;
  }

  /* Icons */

  .kiyora-icon {
    position: relative;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    flex: 0 0 auto;
    width: 38px;
    height: 44px;
    padding: 0;
    color: inherit;
    background: transparent;
    border: 0;
    text-decoration: none;
    cursor: pointer;
    transition:
      color .25s ease,
      transform .25s ease;
  }

  .kiyora-icon:hover {
    color: #b69a69;
    transform: translateY(-1px);
  }

  .kiyora-icon:focus-visible,
  .kiyora-nav__link:focus-visible,
  .kiyora-logo:focus-visible,
  .kiyora-drawer__link:focus-visible {
    outline: 2px solid #b69a69;
    outline-offset: 4px;
  }

  .kiyora-count {
    position: absolute;
    top: 3px;
    right: -4px;
    display: grid;
    place-items: center;
    min-width: 17px;
    height: 17px;
    padding: 0 4px;
    border-radius: 20px;
    background: #b69a69;
    color: #211c19;
    font-family: "Manrope",Arial,sans-serif;
    font-size: 9px;
    font-weight: 700;
    line-height: 1;
  }

  .kiyora-header--scrolled .kiyora-count {
    background: #211c19;
    color: #f5f0e8;
  }

  .kiyora-menu-trigger {
    display: none;
  }

  /* Overlay shared styles */

  .kiyora-overlay {
    position: fixed;
    inset: 0;
    z-index: 900;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: min(13vh,120px) 18px 30px;
    background: rgba(20,17,15,.72);
    -webkit-backdrop-filter: blur(9px);
    backdrop-filter: blur(9px);
    overflow-y: auto;
  }

  .kiyora-search-panel {
    width: min(100%,760px);
    padding: clamp(28px,5vw,56px);
    background: #f5f0e8;
    color: #211c19;
    box-shadow: 0 30px 90px rgba(0,0,0,.16);
  }

  .kiyora-search-panel__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  .kiyora-eyebrow {
    color: #96794f;
    font-family: "Manrope",Arial,sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .2em;
    text-transform: uppercase;
  }

  .kiyora-search-panel__title {
    margin: 24px 0 30px;
    font-family: "Cormorant Garamond",Georgia,serif;
    font-size: clamp(42px,6vw,68px);
    font-weight: 400;
    line-height: 1;
  }

  .kiyora-search-form {
    display: flex;
    align-items: center;
    gap: 14px;
    border-bottom: 1px solid #b69a69;
  }

  .kiyora-search-form input {
    flex: 1;
    min-width: 0;
    height: 58px;
    border: 0;
    outline: none;
    background: transparent;
    color: #211c19;
    font-family: "Manrope",Arial,sans-serif;
    font-size: 14px;
  }

  .kiyora-search-form input::placeholder {
    color: #877e74;
  }

  .kiyora-search-panel__hint {
    margin-top: 20px;
    color: #756b61;
    font-family: "Manrope",Arial,sans-serif;
    font-size: 12px;
    line-height: 1.8;
  }

  /* Mobile drawer */

  .kiyora-drawer-backdrop {
    position: fixed;
    inset: 0;
    z-index: 910;
    background: rgba(20,17,15,.65);
  }

  .kiyora-drawer {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 911;
    display: flex;
    flex-direction: column;
    width: min(88vw,400px);
    padding: 27px 28px;
    background: #f5f0e8;
    color: #211c19;
    overflow-y: auto;
    box-shadow: 20px 0 70px rgba(0,0,0,.15);
  }

  .kiyora-drawer__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 28px;
    border-bottom: 1px solid rgba(33,28,25,.14);
  }

  .kiyora-drawer__brand {
    font-family: "Cormorant Garamond",Georgia,serif;
    font-size: 25px;
    font-weight: 500;
    letter-spacing: .075em;
  }

  .kiyora-drawer__nav {
    display: flex;
    flex-direction: column;
    margin-top: 22px;
  }

  .kiyora-drawer__link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 18px 0;
    border-bottom: 1px solid rgba(33,28,25,.11);
    color: #211c19;
    font-family: "Cormorant Garamond",Georgia,serif;
    font-size: clamp(30px,7vw,39px);
    line-height: 1.1;
    text-decoration: none;
  }

  .kiyora-drawer__link.active {
    color: #a18356;
  }

  .kiyora-drawer__utilities {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 32px;
  }

  .kiyora-drawer__utility {
    display: flex;
    align-items: center;
    gap: 14px;
    min-height: 48px;
    color: #211c19;
    font-family: "Manrope",Arial,sans-serif;
    font-size: 12px;
    text-decoration: none;
  }

  .kiyora-drawer__footer {
    margin-top: auto;
    padding-top: 44px;
  }

  .kiyora-drawer__footer p:last-child {
    margin-top: 12px;
    color: #776d62;
    font-family: "Cormorant Garamond",Georgia,serif;
    font-size: 28px;
    line-height: 1.1;
  }

  /* Responsive */

  @media (max-width: 1180px) {
    .kiyora-header__container {
      width: calc(100% - 54px);
    }

    .kiyora-nav {
      gap: 17px;
    }

    .kiyora-nav__link {
      font-size: 9px;
      letter-spacing: .09em;
    }

    .kiyora-header__right {
      gap: 6px;
    }

    .kiyora-logo__name {
      font-size: 27px;
    }
  }

  @media (max-width: 920px) {
    .kiyora-header-spacer { height: 78px; }
    .kiyora-header,
    .kiyora-header--overlay {
      height: 78px;
    }

    .kiyora-header--scrolled {
      height: 70px;
    }

    .kiyora-header__container {
      width: calc(100% - 40px);
    }

    .kiyora-nav {
      display: none;
    }

    .kiyora-menu-trigger {
      display: inline-flex;
    }

    .kiyora-header__right {
      gap: 4px;
    }

    .kiyora-header__right .kiyora-account {
      display: none;
    }

    .kiyora-logo__name {
      font-size: 26px;
    }
  }

  @media (max-width: 540px) {
    .kiyora-header-spacer { height: 70px; }
    .kiyora-header,
    .kiyora-header--overlay {
      height: 70px;
    }

    .kiyora-header--scrolled {
      height: 64px;
    }

    .kiyora-header__container {
      width: calc(100% - 26px);
    }

    .kiyora-header__inner {
      column-gap: 5px;
    }

    .kiyora-header__right {
      gap: 0;
    }

    .kiyora-icon {
      width: 33px;
      height: 38px;
    }

    .kiyora-header__right .kiyora-wishlist {
      display: none;
    }

    .kiyora-logo__name {
      font-size: clamp(17px,4.7vw,23px);
      letter-spacing: .07em;
    }

    .kiyora-logo__tagline {
      font-size: 5.3px;
      letter-spacing: .13em;
    }

    .kiyora-count {
      top: 0;
      right: -2px;
    }

    .kiyora-drawer {
      padding: 24px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .kiyora-header,
    .kiyora-icon,
    .kiyora-nav__link,
    .kiyora-nav__link::after {
      transition: none;
    }
  }
`;

// ======================================================
// BRAND LOGO
// ======================================================

function BrandLogo({ onClick }) {
  return (
    <Link
      to="/"
      className="kiyora-logo"
      aria-label="Maison Kiyora — Homepage"
      onClick={onClick}
    >
      <span className="kiyora-logo__name">
        MAISON KIYORA
      </span>

      <span className="kiyora-logo__tagline">
        THE ART OF SLOW PERFUMERY
      </span>
    </Link>
  );
}

// ======================================================
// NAVIGATION ICON
// ======================================================

function NavigationIcon({
  to,
  label,
  count = 0,
  className = "",
  children,
}) {
  return (
    <Link
      to={to}
      className={`kiyora-icon ${className}`}
      aria-label={
        count > 0
          ? `${label}, ${count} items`
          : label
      }
      title={label}
    >
      {children}

      {count > 0 && (
        <span
          className="kiyora-count"
          aria-hidden="true"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

// ======================================================
// DIALOG FOCUS MANAGEMENT
// ======================================================

function useDialogFocus(open, dialogRef, triggerRef) {
  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousFocus = document.activeElement;

    const selector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    const frame = requestAnimationFrame(() => {
      const elements = dialog.querySelectorAll(selector);

      if (elements.length) {
        elements[0].focus();
      } else {
        dialog.focus();
      }
    });

    function handleKeyDown(event) {
      if (event.key !== "Tab") return;

      const elements = Array.from(
        dialog.querySelectorAll(selector)
      ).filter(
        (element) =>
          element.getClientRects().length > 0
      );

      if (!elements.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      if (triggerRef.current?.isConnected) {
        triggerRef.current.focus();
      } else if (previousFocus?.isConnected) {
        previousFocus.focus();
      }
    };
  }, [open, dialogRef, triggerRef]);
}

// ======================================================
// SEARCH OVERLAY
// ======================================================

function SearchOverlay({
  open,
  onClose,
  reducedMotion,
  triggerRef,
}) {
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const inputRef = useRef(null);

  const [query, setQuery] = useState("");

  useDialogFocus(open, dialogRef, triggerRef);

  useEffect(() => {
    if (!open) return;

    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [open]);

  function handleSubmit(event) {
    event.preventDefault();

    const searchText = query.trim();

    onClose();

    navigate(
      searchText
        ? `/search?q=${encodeURIComponent(searchText)}`
        : "/search"
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="kiyora-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.2,
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="kiyora-search-title"
            tabIndex={-1}
            className="kiyora-search-panel"
            initial={{
              opacity: 0,
              y: reducedMotion ? 0 : -18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: reducedMotion ? 0 : -12,
            }}
            transition={{
              duration: reducedMotion ? 0 : 0.28,
              ease: EASE,
            }}
          >
            <div className="kiyora-search-panel__top">
              <span className="kiyora-eyebrow">
                DISCOVER YOUR SIGNATURE SCENT
              </span>

              <button
                type="button"
                className="kiyora-icon"
                onClick={onClose}
                aria-label="Close search"
              >
                <X size={22} strokeWidth={1.4} />
              </button>
            </div>

            <h2
              id="kiyora-search-title"
              className="kiyora-search-panel__title"
            >
              Find your fragrance.
            </h2>

            <form
              className="kiyora-search-form"
              onSubmit={handleSubmit}
            >
              <Search
                size={22}
                strokeWidth={1.4}
                aria-hidden="true"
              />

              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search fragrances..."
                aria-label="Search perfumes"
                autoComplete="off"
              />

              <button
                type="submit"
                className="kiyora-icon"
                aria-label="Submit search"
              >
                <ArrowRight
                  size={21}
                  strokeWidth={1.4}
                />
              </button>
            </form>

            <p className="kiyora-search-panel__hint">
              Explore the Maison Kiyora fragrance collection.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ======================================================
// MOBILE NAVIGATION
// ======================================================

function MobileNavigation({
  open,
  onClose,
  reducedMotion,
  cartCount,
  wishlistCount,
  triggerRef,
}) {
  const dialogRef = useRef(null);

  useDialogFocus(open, dialogRef, triggerRef);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="kiyora-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.2,
            }}
            onClick={onClose}
          />

          <motion.aside
            ref={dialogRef}
            id="kiyora-mobile-navigation"
            className="kiyora-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            tabIndex={-1}
            initial={{
              x: reducedMotion ? 0 : "-100%",
              opacity: reducedMotion ? 0 : 1,
            }}
            animate={{
              x: 0,
              opacity: 1,
            }}
            exit={{
              x: reducedMotion ? 0 : "-100%",
              opacity: reducedMotion ? 0 : 1,
            }}
            transition={{
              duration: reducedMotion ? 0 : 0.38,
              ease: EASE,
            }}
          >
            <div className="kiyora-drawer__top">
              <span className="kiyora-drawer__brand">
                MAISON KIYORA
              </span>

              <button
                type="button"
                className="kiyora-icon"
                onClick={onClose}
                aria-label="Close navigation menu"
              >
                <X size={23} strokeWidth={1.4} />
              </button>
            </div>

            <nav
              className="kiyora-drawer__nav"
              aria-label="Mobile main navigation"
            >
              {NAV_LINKS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className="kiyora-drawer__link"
                >
                  <span>{item.label}</span>

                  <ArrowUpRight
                    size={19}
                    strokeWidth={1.3}
                    aria-hidden="true"
                  />
                </NavLink>
              ))}
            </nav>

            <div className="kiyora-drawer__utilities">
              <Link
                to="/search"
                onClick={onClose}
                className="kiyora-drawer__utility"
              >
                <Search size={19} strokeWidth={1.4} />
                Search Fragrances
              </Link>

              <Link
                to="/wishlist"
                onClick={onClose}
                className="kiyora-drawer__utility"
              >
                <Heart size={19} strokeWidth={1.4} />
                Wishlist
                {wishlistCount > 0 &&
                  ` (${wishlistCount})`}
              </Link>

              <Link
                to="/cart"
                onClick={onClose}
                className="kiyora-drawer__utility"
              >
                <ShoppingBag
                  size={19}
                  strokeWidth={1.4}
                />
                Shopping Bag
                {cartCount > 0 && ` (${cartCount})`}
              </Link>

              <Link
                to="/account"
                onClick={onClose}
                className="kiyora-drawer__utility"
              >
                <UserRound
                  size={19}
                  strokeWidth={1.4}
                />
                My Account
              </Link>
            </div>

            <div className="kiyora-drawer__footer">
              <p className="kiyora-eyebrow">
                THE ART OF SLOW PERFUMERY
              </p>

              <p>
                A scent to remember.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ======================================================
// MAIN NAVBAR
// ======================================================

export default function Navbar() {
  const location = useLocation();
  const reducedMotion = useReducedMotion();

  const { cartCount = 0 } = useCart();
  const { wishlistCount = 0 } = useWishlist();

  const menuButtonRef = useRef(null);
  const searchButtonRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHomePage = location.pathname === "/";

  // ----------------------------------------------------
  // SCROLL STATE
  // ----------------------------------------------------

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 65);
    }

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // ----------------------------------------------------
  // CLOSE OVERLAYS AFTER NAVIGATION
  // ----------------------------------------------------

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  // ----------------------------------------------------
  // ESCAPE KEY + BODY SCROLL LOCK
  // ----------------------------------------------------

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [menuOpen, searchOpen]);

  function openMenu() {
    setSearchOpen(false);
    setMenuOpen(true);
  }

  function openSearch() {
    setMenuOpen(false);
    setSearchOpen(true);
  }

  const headerClassName = [
    "kiyora-header",
    isHomePage && !scrolled
      ? "kiyora-header--overlay"
      : "",
    scrolled
      ? "kiyora-header--scrolled"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <style>{NAVBAR_STYLES}</style>

      {/* Announcement stays in normal document flow.
          Homepage header is positioned below it, over the hero. */}
      <div className="kiyora-header-shell">
        <AnnouncementBar />

        {/* Inner pages keep their space when the header becomes fixed. */}
        {!isHomePage && scrolled && (
          <div className="kiyora-header-spacer" aria-hidden="true" />
        )}

      {/* NAVBAR */}

      <header className={headerClassName}>
        <div className="kiyora-header__container">
          <div className="kiyora-header__inner">

            {/* LEFT NAVIGATION */}

            <div className="kiyora-header__left">
              <button
                ref={menuButtonRef}
                type="button"
                className="kiyora-icon kiyora-menu-trigger"
                onClick={openMenu}
                aria-label="Open navigation menu"
                aria-expanded={menuOpen}
                aria-controls="kiyora-mobile-navigation"
              >
                <Menu
                  size={23}
                  strokeWidth={1.4}
                />
              </button>

              <nav
                className="kiyora-nav"
                aria-label="Main navigation"
              >
                {NAV_LINKS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className="kiyora-nav__link"
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* CENTER LOGO */}

            <BrandLogo />

            {/* RIGHT ACTIONS */}

            <div className="kiyora-header__right">
              <button
                ref={searchButtonRef}
                type="button"
                className="kiyora-icon"
                onClick={openSearch}
                aria-label="Search fragrances"
                aria-expanded={searchOpen}
                title="Search"
              >
                <Search
                  size={21}
                  strokeWidth={1.35}
                />
              </button>

              <NavigationIcon
                to="/account"
                label="My Account"
                className="kiyora-account"
              >
                <UserRound
                  size={21}
                  strokeWidth={1.35}
                />
              </NavigationIcon>

              <NavigationIcon
                to="/wishlist"
                label="Wishlist"
                count={wishlistCount}
                className="kiyora-wishlist"
              >
                <Heart
                  size={21}
                  strokeWidth={1.35}
                />
              </NavigationIcon>

              <NavigationIcon
                to="/cart"
                label="Shopping Bag"
                count={cartCount}
              >
                <ShoppingBag
                  size={21}
                  strokeWidth={1.35}
                />
              </NavigationIcon>
            </div>
          </div>
        </div>
      </header>
      </div>

      {/* SEARCH OVERLAY */}

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        reducedMotion={reducedMotion}
        triggerRef={searchButtonRef}
      />

      {/* MOBILE NAVIGATION */}

      <MobileNavigation
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        reducedMotion={reducedMotion}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        triggerRef={menuButtonRef}
      />
    </>
  );
}
