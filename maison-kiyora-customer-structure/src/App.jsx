
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

// ============================================
// MAISON KIYORA — MAIN APPLICATION
// ============================================

// Authentication pages use a clean, standalone layout.
// No global Navbar, announcement bar or Footer.
const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

function isAuthenticationRoute(pathname) {
  return AUTH_ROUTES.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );
}

// ============================================
// GLOBAL STYLES
// ============================================

const APP_STYLES = `
  .mk-app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    min-height: 100dvh;
    width: 100%;
    min-width: 0;
    overflow-x: clip;
    background: #F5F0E8;
    color: #211C19;
    font-family: "Manrope", Arial, sans-serif;
  }

  .mk-main-content {
    position: relative;
    display: block;
    flex: 1 0 auto;
    width: 100%;
    min-width: 0;
    outline: none;
  }

  .mk-page-transition {
    position: relative;
    width: 100%;
    min-height: 100%;
  }

  /* Compact standalone authentication layout */

  .mk-app--auth {
    min-height: 100dvh;
    background: #F5F0E8;
  }

  .mk-main-content--auth {
    flex: 1 1 auto;
    min-height: 100dvh;
    background: #F5F0E8;
  }

  .mk-main-content--auth .mk-page-transition {
    min-height: 100dvh;
  }

  /* Prevent extra outer spacing on auth pages */

  .mk-main-content--auth .mk-auth,
  .mk-main-content--auth .mkr-page {
    min-height: 100dvh;
    margin: 0;
  }

  /* Accessible skip navigation */

  .mk-skip-link {
    position: fixed;
    z-index: 99999;
    top: -100px;
    left: 20px;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    min-height: 44px;
    padding: 12px 22px;

    background: #211C19;
    color: #F5F0E8;

    font-family: "Manrope", Arial, sans-serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;

    text-decoration: none;
    border: 1px solid #B69A69;
    border-radius: 2px;

    box-shadow: 0 8px 24px rgba(33, 28, 25, 0.12);
    transition: top 200ms ease;
  }

  .mk-skip-link:focus-visible {
    top: 15px;
    outline: 2px solid #B69A69;
    outline-offset: 3px;
  }

  /* Anchor positioning below the storefront navbar */

  .mk-app:not(.mk-app--auth) [id] {
    scroll-margin-top: 100px;
  }

  #main-content {
    scroll-margin-top: 0;
  }

  @media (max-width: 768px) {
    .mk-skip-link {
      left: 12px;
    }

    .mk-app:not(.mk-app--auth) [id] {
      scroll-margin-top: 80px;
    }

    #main-content {
      scroll-margin-top: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .mk-skip-link {
      transition: none;
    }
  }
`;

// ============================================
// SAFE HASH DECODING
// ============================================

function getHashTargetId(hash) {
  if (!hash || hash === "#") {
    return null;
  }

  const rawId = hash.slice(1);

  try {
    return decodeURIComponent(rawId);
  } catch {
    return rawId;
  }
}

// ============================================
// SCROLL MANAGER
// ============================================

function ScrollManager({ mainRef }) {
  const location = useLocation();

  const { pathname, search, hash } = location;

  const previousPathRef = useRef(null);

  useEffect(() => {
    const currentPath = `${pathname}${search}`;
    const previousPath = previousPathRef.current;

    const pathChanged =
      previousPath !== null &&
      previousPath !== currentPath;

    previousPathRef.current = currentPath;

    // Normal page navigation
    if (!hash) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });

      if (pathChanged) {
        mainRef.current?.focus({
          preventScroll: true,
        });
      }

      return;
    }

    // Hash / anchor navigation
    const targetId = getHashTargetId(hash);

    if (!targetId) {
      return;
    }

    let animationFrameId = null;
    let attempts = 0;
    let cancelled = false;

    const MAX_ATTEMPTS = 120;

    function scrollToAnchor() {
      if (cancelled) {
        return;
      }

      const target = document.getElementById(
        targetId
      );

      if (target) {
        target.scrollIntoView({
          behavior: "instant",
          block: "start",
        });

        return;
      }

      // Allow lazy-loaded routes to mount
      if (attempts < MAX_ATTEMPTS) {
        attempts += 1;

        animationFrameId =
          window.requestAnimationFrame(
            scrollToAnchor
          );
      }
    }

    animationFrameId =
      window.requestAnimationFrame(
        scrollToAnchor
      );

    return () => {
      cancelled = true;

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(
          animationFrameId
        );
      }
    };
  }, [pathname, search, hash, mainRef]);

  return null;
}

// ============================================
// PAGE TRANSITION
// ============================================

function PageTransition({ children }) {
  const location = useLocation();
  const reducedMotion = useReducedMotion();

  const transitionDuration = reducedMotion
    ? 0
    : 0.22;

  return (
    <motion.div
      key={`${location.pathname}${location.search}`}
      className="mk-page-transition"
      initial={
        reducedMotion
          ? false
          : {
              opacity: 0,
              y: 8,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: transitionDuration,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// APPLICATION CONTENT
// ============================================

function AppContent() {
  const mainRef = useRef(null);
  const { pathname } = useLocation();

  const isAuthPage = isAuthenticationRoute(pathname);

  return (
    <div
      className={`mk-app ${
        isAuthPage ? "mk-app--auth" : ""
      }`}
    >
      <style>{APP_STYLES}</style>

      <ScrollManager mainRef={mainRef} />

      <a
        className="mk-skip-link"
        href="#main-content"
      >
        Skip to main content
      </a>

      {/* Global navigation only on storefront pages */}
      {!isAuthPage && <Navbar />}

      <main
        ref={mainRef}
        id="main-content"
        className={`mk-main-content ${
          isAuthPage
            ? "mk-main-content--auth"
            : ""
        }`}
        tabIndex={-1}
      >
        <PageTransition>
          <AppRoutes />
        </PageTransition>
      </main>

      {/* Global footer only on storefront pages */}
      {!isAuthPage && <Footer />}
    </div>
  );
}

// ============================================
// MAIN APPLICATION
// ============================================

export default function App() {
  return <AppContent />;
}
