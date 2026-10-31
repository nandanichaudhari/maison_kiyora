
import { useState } from "react";
import { Heart } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "react-toastify";

import useWishlist from "../../hooks/useWishlist.js";

// ======================================================
// MAISON KIYORA
// THE ART OF SLOW PERFUMERY
//
// PREMIUM WISHLIST BUTTON
//
// Features:
// - Add/remove wishlist products
// - Animated heart icon
// - React Context integration
// - Accessible button labels
// - Toast notifications
// - Compact and full variants
// - Custom className support
// - Reduced motion support
// - Prevent parent card navigation
// ======================================================

// ======================================================
// 01. COMPONENT STYLES
// ======================================================

const STYLES = `
  .mk-wishlist-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    flex-shrink: 0;
    min-width: 44px;
    min-height: 44px;
    padding: 10px;
    border: 1px solid rgba(29,41,64,.16);
    border-radius: 50%;
    background: rgba(245,240,232,.94);
    color: #1d2940;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition:
      background 250ms ease,
      border-color 250ms ease,
      color 250ms ease,
      box-shadow 250ms ease;
  }

  .mk-wishlist-button:hover {
    background: #fffaf2;
    border-color: #b69a69;
    box-shadow: 0 5px 20px rgba(29,41,64,.08);
  }

  .mk-wishlist-button:focus-visible {
    outline: 2px solid #b69a69;
    outline-offset: 4px;
  }

  .mk-wishlist-button:disabled {
    opacity: .45;
    cursor: not-allowed;
  }

  .mk-wishlist-button--active {
    color: #9b675c;
    border-color: rgba(155,103,92,.35);
  }

  .mk-wishlist-button__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    line-height: 0;
  }

  .mk-wishlist-button__text {
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .11em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  /* Compact product card variant */

  .mk-wishlist-button--compact {
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
    padding: 8px;
  }

  /* Full product details variant */

  .mk-wishlist-button--full {
    min-height: 52px;
    padding: 13px 22px;
    border-radius: 2px;
    background: transparent;
  }

  .mk-wishlist-button--full:hover {
    background: rgba(182,154,105,.07);
    box-shadow: none;
  }

  /* Minimal icon-only variant */

  .mk-wishlist-button--minimal {
    border-color: transparent;
    background: transparent;
  }

  .mk-wishlist-button--minimal:hover {
    background: rgba(182,154,105,.08);
    box-shadow: none;
  }

  @media (max-width: 480px) {
    .mk-wishlist-button--full {
      min-height: 48px;
      padding: 12px 16px;
    }

    .mk-wishlist-button__text {
      font-size: 9px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .mk-wishlist-button {
      transition: none;
    }
  }
`;

// ======================================================
// 02. WISHLIST BUTTON COMPONENT
// ======================================================

export default function WishlistButton({
  product,
  variant = "compact",
  showLabel = false,
  className = "",
  iconSize = 19,
  disabled = false,
  showToast = true,
  onToggle,
}) {
  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  const reducedMotion = useReducedMotion();

  const [animationKey, setAnimationKey] = useState(0);

  // ----------------------------------------------------
  // VALIDATE PRODUCT
  // ----------------------------------------------------

  const productId =
    product?.id ??
    product?.productId ??
    product?.slug;

  const isValidProduct =
    productId !== undefined &&
    productId !== null &&
    String(productId).trim() !== "";

  // ----------------------------------------------------
  // CURRENT WISHLIST STATE
  // ----------------------------------------------------

  const isWishlisted = isValidProduct
    ? isInWishlist(product)
    : false;

  // ----------------------------------------------------
  // VARIANT CONFIGURATION
  // ----------------------------------------------------

  const allowedVariants = [
    "compact",
    "full",
    "minimal",
  ];

  const safeVariant = allowedVariants.includes(variant)
    ? variant
    : "compact";

  const displayLabel =
    showLabel || safeVariant === "full";

  const buttonLabel = isWishlisted
    ? "Remove from wishlist"
    : "Add to wishlist";

  // ----------------------------------------------------
  // HANDLE TOGGLE
  // ----------------------------------------------------

  const handleToggle = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (disabled || !isValidProduct) {
      return;
    }

    const added = toggleWishlist(product);

    setAnimationKey((previous) => previous + 1);

    if (showToast) {
      if (added) {
        toast.success(
          `${product.name ?? product.title ?? "Fragrance"} added to your wishlist.`
        );
      } else {
        toast.info(
          "Removed from your wishlist."
        );
      }
    }

    if (typeof onToggle === "function") {
      onToggle(added, product);
    }
  };

  // ----------------------------------------------------
  // COMPONENT OUTPUT
  // ----------------------------------------------------

  return (
    <>
      <style>{STYLES}</style>

      <button
        type="button"
        className={[
          "mk-wishlist-button",
          `mk-wishlist-button--${safeVariant}`,
          isWishlisted
            ? "mk-wishlist-button--active"
            : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={handleToggle}
        disabled={disabled || !isValidProduct}
        aria-label={buttonLabel}
        aria-pressed={isWishlisted}
        title={buttonLabel}
      >
        <motion.span
          key={animationKey}
          className="mk-wishlist-button__icon"
          initial={
            reducedMotion
              ? false
              : { scale: 0.75 }
          }
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 19,
            duration: reducedMotion ? 0 : undefined,
          }}
        >
          <Heart
            size={iconSize}
            strokeWidth={1.6}
            fill={
              isWishlisted
                ? "currentColor"
                : "none"
            }
            aria-hidden="true"
          />
        </motion.span>

        {displayLabel && (
          <span className="mk-wishlist-button__text">
            {isWishlisted
              ? "Added to Wishlist"
              : "Add to Wishlist"}
          </span>
        )}
      </button>
    </>
  );
}
