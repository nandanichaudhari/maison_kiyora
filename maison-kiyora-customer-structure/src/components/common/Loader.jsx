import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

// MAISON KIYORA — THE ART OF SLOW PERFUMERY
// Reusable spinner, full-page loading overlay, and skeleton placeholders.
// Usage: <Loader />, <Loader variant="page" />, <Loader variant="skeleton" />

const STYLES = `
  .mk-loader{--mk-loader-ink:#1d2940;--mk-loader-gold:#b69a69;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:15px;color:var(--mk-loader-ink);font-family:"Manrope",sans-serif;text-align:center}
  .mk-loader--inline{display:inline-flex;flex-direction:row;gap:9px;vertical-align:middle}
  .mk-loader--page{width:100%;min-height:min(65vh,650px);padding:50px 20px;background:#f5f0e8}
  .mk-loader--overlay{position:fixed;inset:0;z-index:9999;min-height:100vh;padding:30px;background:rgba(245,240,232,.94);backdrop-filter:blur(8px)}
  .mk-loader__ring{display:block;position:relative;width:44px;height:44px;border:1.5px solid rgba(29,41,64,.15);border-top-color:var(--mk-loader-gold);border-right-color:var(--mk-loader-gold);border-radius:50%;animation:mk-loader-spin 950ms linear infinite}
  .mk-loader--sm .mk-loader__ring{width:20px;height:20px}
  .mk-loader--lg .mk-loader__ring{width:62px;height:62px;border-width:2px}
  .mk-loader__brand{font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(25px,3vw,36px);font-weight:500;letter-spacing:.13em;text-transform:uppercase}
  .mk-loader__label{margin:0;color:#6e7580;font-size:11px;line-height:1.6;letter-spacing:.1em}
  .mk-loader__subtext{margin:0;color:#8a8d92;font-size:10px;line-height:1.7}
  .mk-loader__skeletons{display:grid;gap:12px;width:100%;max-width:100%}
  .mk-loader__skeleton{display:block;width:100%;height:16px;border-radius:2px;background:linear-gradient(90deg,#eae4dc 20%,#f5f0e8 50%,#eae4dc 80%);background-size:220% 100%;animation:mk-loader-shimmer 1.5s ease-in-out infinite}
  .mk-loader__skeleton:nth-child(2){width:85%}
  .mk-loader__skeleton:nth-child(3){width:65%}
  .mk-loader__skeleton--image{height:auto;aspect-ratio:3/4}
  .mk-loader__skeleton--card{height:200px}
  @keyframes mk-loader-spin{to{transform:rotate(360deg)}}
  @keyframes mk-loader-shimmer{to{background-position-x:-220%}}
  @media(prefers-reduced-motion:reduce){.mk-loader__ring,.mk-loader__skeleton{animation:none}.mk-loader__ring{border-color:var(--mk-loader-gold)}.mk-loader__skeleton{background:#eae4dc}}
`;

const VALID_VARIANTS = new Set(["default", "inline", "page", "overlay", "skeleton"]);
const VALID_SIZES = new Set(["sm", "md", "lg"]);

/**
 * @param {object} props
 * @param {"default"|"inline"|"page"|"overlay"|"skeleton"} [props.variant]
 * @param {"sm"|"md"|"lg"} [props.size]
 * @param {string} [props.label]
 * @param {string} [props.subtext]
 * @param {boolean} [props.showBrand]
 * @param {number} [props.lines] Skeleton rows, from 1 to 12.
 * @param {"text"|"image"|"card"} [props.skeletonType]
 * @param {string} [props.className]
 * @param {string} [props.id]
 */
export default function Loader({
  variant = "default",
  size = "md",
  label = "Loading...",
  subtext = "",
  showBrand = false,
  lines = 3,
  skeletonType = "text",
  className = "",
  id,
}) {
  const generatedId = useId();
  const reducedMotion = useReducedMotion();
  const safeVariant = VALID_VARIANTS.has(variant) ? variant : "default";
  const safeSize = VALID_SIZES.has(size) ? size : "md";
  const safeLines = Number.isFinite(Number(lines)) ? Math.min(12, Math.max(1, Math.trunc(Number(lines)))) : 3;
  const safeSkeletonType = ["text", "image", "card"].includes(skeletonType) ? skeletonType : "text";
  const labelId = `${id || generatedId}-label`;

  if (safeVariant === "skeleton") {
    return (
      <div
        id={id}
        className={["mk-loader__skeletons", className].filter(Boolean).join(" ")}
        role="status"
        aria-label={label || "Loading content"}
        aria-busy="true"
      >
        <style>{STYLES}</style>
        {Array.from({ length: safeLines }, (_, index) => (
          <span
            key={index}
            className={`mk-loader__skeleton ${safeSkeletonType === "text" ? "" : `mk-loader__skeleton--${safeSkeletonType}`}`}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      id={id}
      className={[
        "mk-loader",
        `mk-loader--${safeVariant}`,
        `mk-loader--${safeSize}`,
        className,
      ].filter(Boolean).join(" ")}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-labelledby={label ? labelId : undefined}
      aria-label={label ? undefined : "Loading"}
    >
      <style>{STYLES}</style>
      {showBrand && safeVariant !== "inline" && (
        <motion.span
          className="mk-loader__brand"
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.4 }}
          aria-hidden="true"
        >
          Maison Kiyora
        </motion.span>
      )}
      <span className="mk-loader__ring" aria-hidden="true" />
      {label && <p id={labelId} className="mk-loader__label">{label}</p>}
      {subtext && <p className="mk-loader__subtext">{subtext}</p>}
    </div>
  );
}

export function PageLoader(props) {
  return <Loader variant="page" showBrand {...props} />;
}

export function InlineLoader(props) {
  return <Loader variant="inline" size="sm" {...props} />;
}

export function SkeletonLoader(props) {
  return <Loader variant="skeleton" {...props} />;
}
