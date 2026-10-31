
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

// ======================================================
// MAISON KIYORA — LUXURY ANNOUNCEMENT BAR
// Warm Ivory × Espresso × Champagne Gold
// ======================================================

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: "discover",
    text: "Discover the Maison Kiyora fragrance collection",
    linkText: "EXPLORE",
    to: "/collections",
  },
];

const STYLES = `
  .mk-announcement {
    position: relative;
    z-index: 201;

    width: 100%;
    min-height: 38px;

    background: #eae1d3;
    color: #211c19;

    border-bottom: 1px solid rgba(182, 154, 105, .28);

    font-family: "Manrope", Arial, sans-serif;
  }

  .mk-announcement *,
  .mk-announcement *::before,
  .mk-announcement *::after {
    box-sizing: border-box;
  }

  .mk-announcement__inner {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    gap: 12px;

    min-height: 38px;
    padding: 8px 94px;
  }

  .mk-announcement__message {
    display: flex;
    align-items: center;
    justify-content: center;

    flex-wrap: wrap;
    gap: 6px 13px;

    min-width: 0;

    text-align: center;
  }

  .mk-announcement__text {
    margin: 0;

    color: #4b3e32;

    font-size: 10px;
    font-weight: 500;
    line-height: 1.5;
    letter-spacing: .065em;
  }

  .mk-announcement__link {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    gap: 5px;

    flex-shrink: 0;

    color: #8b6a3f;

    font-size: 9px;
    font-weight: 700;
    letter-spacing: .12em;

    text-decoration: none;
    white-space: nowrap;

    transition: color .2s ease;
  }

  .mk-announcement__link:hover {
    color: #211c19;
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  .mk-announcement__controls {
    position: absolute;

    left: 22px;
    top: 50%;

    display: flex;
    align-items: center;

    gap: 3px;

    transform: translateY(-50%);
  }

  .mk-announcement__close {
    position: absolute;
    right: 20px;
    top: 50%;

    transform: translateY(-50%);
  }

  .mk-announcement__icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: 26px;
    height: 26px;
    padding: 0;

    border: 0;
    border-radius: 50%;

    background: transparent;
    color: #6e5b45;

    cursor: pointer;

    transition:
      background .2s ease,
      color .2s ease;
  }

  .mk-announcement__icon-button:hover {
    background: rgba(182, 154, 105, .15);
    color: #211c19;
  }

  .mk-announcement__icon-button:focus-visible,
  .mk-announcement__link:focus-visible {
    outline: 2px solid #b69a69;
    outline-offset: 3px;
  }

  .mk-announcement__icon-button:disabled {
    opacity: .35;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    .mk-announcement__inner {
      min-height: 40px;
      padding: 8px 42px;
    }

    .mk-announcement__controls {
      left: 5px;
      gap: 0;
    }

    .mk-announcement__icon-button {
      width: 23px;
      height: 23px;
    }

    .mk-announcement__close {
      right: 9px;
    }

    .mk-announcement__message {
      gap: 2px 8px;
    }

    .mk-announcement__text {
      font-size: 9px;
      letter-spacing: .02em;
    }

    .mk-announcement__link {
      font-size: 8px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .mk-announcement *,
    .mk-announcement *::before,
    .mk-announcement *::after {
      transition: none !important;
    }
  }
`;

function isExternalLink(value) {
  return (
    typeof value === "string" &&
    /^https?:\/\//i.test(value)
  );
}

function AnnouncementLink({ announcement }) {
  const destination =
    announcement.to ?? announcement.href;

  const label =
    announcement.linkText ?? "DISCOVER";

  if (
    typeof destination !== "string" ||
    !destination.trim()
  ) {
    return null;
  }

  const children = (
    <>
      {label}

      <ArrowUpRight
        size={12}
        strokeWidth={1.5}
        aria-hidden="true"
      />
    </>
  );

  if (isExternalLink(destination)) {
    return (
      <a
        className="mk-announcement__link"
        href={destination}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      className="mk-announcement__link"
      to={destination}
    >
      {children}
    </Link>
  );
}

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function AnnouncementBar({
  announcements = DEFAULT_ANNOUNCEMENTS,
  dismissible = false,
  autoRotate = false,
  interval = 5500,
  onDismiss,
  className = "",
}) {
  const reducedMotion = useReducedMotion();

  const [activeIndex, setActiveIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [paused, setPaused] = useState(false);

  const entries = Array.isArray(announcements)
    ? announcements.filter(
        (item) =>
          item &&
          typeof item.text === "string" &&
          item.text.trim()
      )
    : [];

  const count = entries.length;

  const currentIndex =
    count > 0 ? activeIndex % count : 0;

  const active = entries[currentIndex];

  const multiple = count > 1;

  // ----------------------------------------------------
  // AUTO ROTATION
  // ----------------------------------------------------

  useEffect(() => {
    if (
      !autoRotate ||
      !multiple ||
      paused ||
      dismissed ||
      reducedMotion
    ) {
      return;
    }

    const delay = Number.isFinite(interval)
      ? Math.max(2500, interval)
      : 5500;

    const timer = window.setInterval(() => {
      setActiveIndex(
        (previous) => (previous + 1) % count
      );
    }, delay);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    autoRotate,
    multiple,
    paused,
    dismissed,
    reducedMotion,
    interval,
    count,
  ]);

  // ----------------------------------------------------
  // NAVIGATION
  // ----------------------------------------------------

  function navigate(direction) {
    if (count < 2) return;

    setActiveIndex(
      (previous) =>
        (previous + direction + count) % count
    );
  }

  // ----------------------------------------------------
  // DISMISS
  // ----------------------------------------------------

  function dismiss() {
    setDismissed(true);
    onDismiss?.();
  }

  if (dismissed || !active) {
    return null;
  }

  // ----------------------------------------------------
  // RENDER
  // ----------------------------------------------------

  return (
    <div
      className={[
        "mk-announcement",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="region"
      aria-label="Store announcements"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget
          )
        ) {
          setPaused(false);
        }
      }}
    >
      <style>{STYLES}</style>

      <div className="mk-announcement__inner">

        {/* Previous / Next */}

        {multiple && (
          <div
            className="mk-announcement__controls"
            role="group"
            aria-label="Browse announcements"
          >
            <button
              type="button"
              className="mk-announcement__icon-button"
              onClick={() => navigate(-1)}
              aria-label="Previous announcement"
            >
              <ChevronLeft
                size={15}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              className="mk-announcement__icon-button"
              onClick={() => navigate(1)}
              aria-label="Next announcement"
            >
              <ChevronRight
                size={15}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </button>
          </div>
        )}

        {/* Announcement content */}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={
              active.id ??
              `${currentIndex}-${active.text}`
            }
            className="mk-announcement__message"
            initial={
              reducedMotion
                ? false
                : { opacity: 0, y: 5 }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={
              reducedMotion
                ? {
                    opacity: 0,
                    transition: { duration: 0 },
                  }
                : {
                    opacity: 0,
                    y: -5,
                  }
            }
            transition={{
              duration: reducedMotion ? 0 : 0.2,
            }}
          >
            <p className="mk-announcement__text">
              {active.text}
            </p>

            <AnnouncementLink announcement={active} />
          </motion.div>
        </AnimatePresence>

        {/* Optional close button */}

        {dismissible && (
          <button
            type="button"
            className="mk-announcement__icon-button mk-announcement__close"
            onClick={dismiss}
            aria-label="Dismiss announcement"
          >
            <X
              size={14}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </button>
        )}
      </div>
    </div>
  );
}

export { DEFAULT_ANNOUNCEMENTS };
