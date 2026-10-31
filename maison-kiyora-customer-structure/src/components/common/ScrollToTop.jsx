import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// MAISON KIYORA — THE ART OF SLOW PERFUMERY
//
// Optional route scroll manager + floating Back to Top button.
//
// IMPORTANT: src/App.jsx already has a ScrollManager that handles route
// navigation and hash anchors. Keep `manageRouteScroll={false}` (default)
// when using this component inside that App, to avoid duplicate scroll effects.

const STYLES = `
  .mk-scroll-to-top {
    position: fixed;
    right: max(22px, env(safe-area-inset-right));
    bottom: max(24px, env(safe-area-inset-bottom));
    z-index: 90;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    padding: 0;
    border: 1px solid rgba(182, 154, 105, .65);
    border-radius: 50%;
    background: #1d2940;
    color: #f5f0e8;
    box-shadow: 0 8px 24px rgba(29, 41, 64, .15);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background 200ms ease, border-color 200ms ease;
  }

  .mk-scroll-to-top:hover:not(:disabled) {
    background: #293a58;
    border-color: #b69a69;
  }

  .mk-scroll-to-top:focus-visible {
    outline: 2px solid #b69a69;
    outline-offset: 4px;
  }

  .mk-scroll-to-top:disabled {
    opacity: .5;
    cursor: not-allowed;
  }

  .mk-scroll-to-top__sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (max-width: 640px) {
    .mk-scroll-to-top {
      right: max(16px, env(safe-area-inset-right));
      bottom: max(18px, env(safe-area-inset-bottom));
      width: 42px;
      height: 42px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .mk-scroll-to-top {
      transition: none;
    }
  }
`;

const DEFAULT_THRESHOLD = 360;

function normalizeThreshold(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : DEFAULT_THRESHOLD;
}

/**
 * Floating Back to Top button, with optional route scroll restoration.
 *
 * @param {object} props
 * @param {number} [props.showAfter=360] Scroll position after which the button appears.
 * @param {boolean} [props.manageRouteScroll=false] Enable only if App.jsx does not already manage scroll.
 * @param {boolean} [props.showButton=true] Whether to render the floating button.
 * @param {boolean} [props.smooth=true] Smooth button scroll (respects reduced motion).
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.className]
 * @param {string} [props.ariaLabel]
 * @param {number} [props.zIndex] Optional custom stacking order.
 */
export default function ScrollToTop({
  showAfter = DEFAULT_THRESHOLD,
  manageRouteScroll = false,
  showButton = true,
  smooth = true,
  disabled = false,
  className = "",
  ariaLabel = "Back to top",
  zIndex,
}) {
  const { pathname, search, hash } = useLocation();
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const threshold = normalizeThreshold(showAfter);

  // Passive listener + initial check, avoiding unnecessary updates.
  useEffect(() => {
    if (!showButton) return undefined;

    const update = () => {
      const next = window.scrollY > threshold;
      setVisible((current) => (current === next ? current : next));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [showButton, threshold]);

  // Optional route manager. App.jsx already implements this, so default is OFF.
  useEffect(() => {
    if (!manageRouteScroll) return undefined;

    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return undefined;
    }

    // Wait one frame for the destination page to render its hash target.
    const frame = window.requestAnimationFrame(() => {
      const rawId = hash.slice(1);
      let targetId = rawId;
      try {
        targetId = decodeURIComponent(rawId);
      } catch {
        // Keep the raw hash if malformed.
      }
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({
          behavior: reducedMotion ? "instant" : "auto",
          block: "start",
        });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [manageRouteScroll, pathname, search, hash, reducedMotion]);

  const handleScrollToTop = () => {
    if (disabled) return;
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: smooth && !reducedMotion ? "smooth" : "instant",
    });
  };

  return (
    <>
      <style>{STYLES}</style>
      <AnimatePresence>
        {showButton && visible && (
          <motion.button
            key="mk-back-to-top"
            type="button"
            className={["mk-scroll-to-top", className].filter(Boolean).join(" ")}
            style={Number.isFinite(zIndex) ? { zIndex } : undefined}
            aria-label={ariaLabel}
            title={ariaLabel}
            onClick={handleScrollToTop}
            disabled={disabled}
            initial={reducedMotion ? false : { opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
            whileTap={reducedMotion || disabled ? undefined : { scale: 0.94 }}
          >
            <ArrowUp size={19} strokeWidth={1.5} aria-hidden="true" />
            <span className="mk-scroll-to-top__sr-only">{ariaLabel}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
