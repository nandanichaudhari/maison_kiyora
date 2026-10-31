
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  LockKeyhole,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import useCart from "../../hooks/useCart.js";

// ======================================================
// MAISON KIYORA
// THE ART OF SLOW PERFUMERY
//
// PREMIUM CART SUMMARY
//
// React 19 + React Router + CartContext
//
// FEATURES:
// - Live cart subtotal
// - Total quantity of products
// - Shipping status
// - Optional calculated shipping
// - Optional tax amount
// - Estimated order total
// - Secure checkout navigation
// - Empty cart handling
// - Responsive luxury design
// - Accessible checkout button
//
// IMPORTANT:
// Final shipping, taxes, discounts and pricing
// must be validated by the backend at checkout.
// ======================================================

// ======================================================
// 01. STYLES
// ======================================================

const STYLES = `
  .mk-cart-summary {
    width: 100%;
    padding: 32px;
    border: 1px solid rgba(29,41,64,.12);
    background: #f5f0e8;
    color: #1d2940;
  }

  .mk-cart-summary__eyebrow {
    margin: 0 0 10px;
    color: #967a51;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .22em;
    text-transform: uppercase;
  }

  .mk-cart-summary__title {
    margin: 0;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(32px, 3vw, 40px);
    font-weight: 500;
    line-height: 1.1;
    letter-spacing: -.025em;
  }

  .mk-cart-summary__divider {
    height: 1px;
    margin: 26px 0;
    background: rgba(29,41,64,.14);
  }

  .mk-cart-summary__rows {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .mk-cart-summary__row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .mk-cart-summary__label {
    color: #555d68;
    font-family: "Manrope", sans-serif;
    font-size: 12px;
    line-height: 1.6;
  }

  .mk-cart-summary__value {
    color: #1d2940;
    font-family: "Manrope", sans-serif;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.6;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .mk-cart-summary__pending {
    color: #777a80;
    font-weight: 400;
  }

  .mk-cart-summary__total {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
  }

  .mk-cart-summary__total-label {
    font-family: "Manrope", sans-serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .mk-cart-summary__total-value {
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(28px, 3vw, 36px);
    font-weight: 600;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .mk-cart-summary__estimate-note {
    margin: 12px 0 0;
    color: #777a80;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    line-height: 1.7;
  }

  .mk-cart-summary__checkout {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    width: 100%;
    min-height: 56px;
    margin-top: 28px;
    padding: 16px 22px;
    border: 1px solid #1d2940;
    border-radius: 2px;
    background: #1d2940;
    color: #f5f0e8;
    font-family: "Manrope", sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .13em;
    text-transform: uppercase;
    cursor: pointer;
    transition:
      background 250ms ease,
      border-color 250ms ease,
      box-shadow 250ms ease;
  }

  .mk-cart-summary__checkout:hover:not(:disabled) {
    background: #293a58;
    border-color: #293a58;
    box-shadow: 0 12px 28px rgba(29,41,64,.14);
  }

  .mk-cart-summary__checkout:focus-visible {
    outline: 2px solid #b69a69;
    outline-offset: 4px;
  }

  .mk-cart-summary__checkout:disabled {
    opacity: .45;
    cursor: not-allowed;
    box-shadow: none;
  }

  .mk-cart-summary__checkout-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .mk-cart-summary__security {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 17px;
    color: #777a80;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    line-height: 1.6;
    text-align: center;
  }

  .mk-cart-summary__shipping-note {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-top: 27px;
    padding: 17px;
    border: 1px solid rgba(182,154,105,.25);
    background: rgba(255,255,255,.3);
  }

  .mk-cart-summary__shipping-icon {
    flex-shrink: 0;
    margin-top: 2px;
    color: #967a51;
  }

  .mk-cart-summary__shipping-text {
    margin: 0;
    color: #555d68;
    font-family: "Manrope", sans-serif;
    font-size: 11px;
    line-height: 1.8;
  }

  .mk-cart-summary__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 16px 0 6px;
    color: #777a80;
    text-align: center;
  }

  .mk-cart-summary__empty p {
    margin: 0;
    font-family: "Manrope", sans-serif;
    font-size: 12px;
    line-height: 1.7;
  }

  @media (max-width: 768px) {
    .mk-cart-summary {
      padding: 26px 22px;
    }

    .mk-cart-summary__checkout {
      min-height: 52px;
    }
  }

  @media (max-width: 480px) {
    .mk-cart-summary {
      padding: 24px 18px;
    }

    .mk-cart-summary__title {
      font-size: 32px;
    }

    .mk-cart-summary__divider {
      margin: 22px 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .mk-cart-summary__checkout {
      transition: none;
    }
  }
`;

// ======================================================
// 02. HELPERS
// ======================================================

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function isValidMoney(value) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}

// ======================================================
// 03. CART SUMMARY COMPONENT
// ======================================================

export default function CartSummary({
  className = "",
  shippingAmount = null,
  taxAmount = null,
  checkoutPath = "/checkout",
  discountAmount = null,
  disabled = false,
  onCheckout,
}) {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const {
    cartItems,
    cartCount,
    cartSubtotal,
    isCartEmpty,
  } = useCart();

  const [isNavigating, setIsNavigating] = useState(false);
  const checkoutLockRef = useRef(false);
  const [checkoutError, setCheckoutError] = useState("");

  // ----------------------------------------------------
  // CART VALUES
  // ----------------------------------------------------

  const items = Array.isArray(cartItems)
    ? cartItems
    : [];

  const itemCount = Number.isFinite(cartCount)
    ? cartCount
    : items.reduce(
        (total, item) =>
          total + (Number(item.quantity) || 0),
        0
      );

  const subtotal = Number.isFinite(Number(cartSubtotal)) && cartSubtotal !== null
    ? Math.max(0, Number(cartSubtotal))
    : items.reduce((total, item) => {
        const price = Number(item?.price);
        const quantity = Number(item?.quantity);
        return total + (
          Number.isFinite(price) && price >= 0 &&
          Number.isFinite(quantity) && quantity > 0
            ? price * quantity
            : 0
        );
      }, 0);

  const isEmpty =
    Boolean(isCartEmpty) ||
    items.length === 0 ||
    itemCount <= 0;

  // ----------------------------------------------------
  // OPTIONAL SHIPPING AND TAXES
  //
  // null = not calculated
  // 0    = explicitly free / no charge
  // > 0  = calculated amount
  // ----------------------------------------------------

  const hasShipping =
    isValidMoney(shippingAmount);

  const hasTax =
    isValidMoney(taxAmount);

  const shipping = hasShipping
    ? shippingAmount
    : 0;

  const tax = hasTax
    ? taxAmount
    : 0;

  const discount = isValidMoney(discountAmount)
    ? Math.min(discountAmount, subtotal)
    : 0;

  const estimatedTotal = Math.max(0, subtotal - discount + shipping + tax);

  const chargesPending =
    !hasShipping || !hasTax;

  // ----------------------------------------------------
  // CHECKOUT BUTTON STATE
  // ----------------------------------------------------

  const isCheckoutDisabled =
    disabled ||
    isEmpty ||
    isNavigating;

  // ----------------------------------------------------
  // CHECKOUT HANDLER
  // ----------------------------------------------------

  const handleCheckout = async () => {
    if (isCheckoutDisabled || checkoutLockRef.current) {
      return;
    }

    checkoutLockRef.current = true;
    setCheckoutError("");
    setIsNavigating(true);

    try {
      // Optional custom checkout handler.
      // Returning false cancels navigation.
      if (typeof onCheckout === "function") {
        const result = await onCheckout({
          items,
          itemCount,
          subtotal,
          discount,
          shipping: hasShipping ? shipping : null,
          tax: hasTax ? tax : null,
          estimatedTotal,
          chargesPending,
        });

        if (result === false) {
          return;
        }
      }

      navigate(checkoutPath);
    } catch (error) {
      console.error(
        "Maison Kiyora: Checkout navigation failed.",
        error
      );
      setCheckoutError("Unable to continue to checkout. Please try again.");
    } finally {
      checkoutLockRef.current = false;
      setIsNavigating(false);
    }
  };

  // ----------------------------------------------------
  // COMPONENT OUTPUT
  // ----------------------------------------------------

  return (
    <>
      <style>{STYLES}</style>

      <motion.aside
        className={[
          "mk-cart-summary",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        initial={
          reducedMotion
            ? false
            : { opacity: 0, y: 12 }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: reducedMotion ? 0 : 0.45,
          ease: "easeOut",
        }}
        aria-label="Shopping bag summary"
      >
        {/* HEADING */}

        <header>
          <p className="mk-cart-summary__eyebrow">
            Your Selection
          </p>

          <h2 className="mk-cart-summary__title">
            Order Summary
          </h2>
        </header>

        <div className="mk-cart-summary__divider" />

        {/* EMPTY CART */}

        {isEmpty ? (
          <div className="mk-cart-summary__empty">
            <ShoppingBag
              size={27}
              strokeWidth={1.2}
              aria-hidden="true"
            />

            <p>
              Your shopping bag is currently empty.
            </p>
          </div>
        ) : (
          <>
            {/* PRICE BREAKDOWN */}

            <div className="mk-cart-summary__rows">
              <div className="mk-cart-summary__row">
                <span className="mk-cart-summary__label">
                  Items
                </span>

                <span className="mk-cart-summary__value">
                  {itemCount}
                </span>
              </div>

              <div className="mk-cart-summary__row">
                <span className="mk-cart-summary__label">
                  Subtotal
                </span>

                <span className="mk-cart-summary__value">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {discount > 0 && (
                <div className="mk-cart-summary__row">
                  <span className="mk-cart-summary__label">Discount</span>
                  <span className="mk-cart-summary__value">
                    −{formatPrice(discount)}
                  </span>
                </div>
              )}

              <div className="mk-cart-summary__row">
                <span className="mk-cart-summary__label">
                  Shipping
                </span>

                <span
                  className={[
                    "mk-cart-summary__value",
                    !hasShipping
                      ? "mk-cart-summary__pending"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {!hasShipping
                    ? "Calculated at checkout"
                    : shipping === 0
                      ? "Free"
                      : formatPrice(shipping)}
                </span>
              </div>

              <div className="mk-cart-summary__row">
                <span className="mk-cart-summary__label">
                  Additional taxes
                </span>

                <span
                  className={[
                    "mk-cart-summary__value",
                    !hasTax
                      ? "mk-cart-summary__pending"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {!hasTax
                    ? "Confirmed at checkout"
                    : formatPrice(tax)}
                </span>
              </div>
            </div>

            <div className="mk-cart-summary__divider" />

            {/* ESTIMATED TOTAL */}

            <div className="mk-cart-summary__total">
              <span className="mk-cart-summary__total-label">
                {chargesPending
                  ? "Estimated Total"
                  : "Total"}
              </span>

              <strong className="mk-cart-summary__total-value">
                {formatPrice(estimatedTotal)}
              </strong>
            </div>

            {chargesPending && (
              <p className="mk-cart-summary__estimate-note">
                Displayed amount excludes any shipping
                charges or additional taxes not yet
                calculated. Your final payable amount
                will be confirmed at checkout.
              </p>
            )}
          </>
        )}

        {/* CHECKOUT BUTTON */}

        <motion.button
          type="button"
          className="mk-cart-summary__checkout"
          onClick={handleCheckout}
          disabled={isCheckoutDisabled}
          aria-label="Proceed to checkout"
          aria-busy={isNavigating}
          whileTap={
            reducedMotion || isCheckoutDisabled
              ? undefined
              : { scale: 0.98 }
          }
        >
          <span>
            {isNavigating
              ? "Please Wait..."
              : "Proceed to Checkout"}
          </span>

          <span className="mk-cart-summary__checkout-icon">
            <ArrowRight
              size={17}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </span>
        </motion.button>

        {checkoutError && (
          <p role="alert" className="mk-cart-summary__estimate-note">
            {checkoutError}
          </p>
        )}

        {/* SECURITY NOTE */}

        <div className="mk-cart-summary__security">
          <LockKeyhole
            size={13}
            strokeWidth={1.5}
            aria-hidden="true"
          />

          <span>
            Payment options available at checkout
          </span>
        </div>

        {/* SHIPPING INFORMATION */}

        <div className="mk-cart-summary__shipping-note">
          <Truck
            size={19}
            strokeWidth={1.4}
            className="mk-cart-summary__shipping-icon"
            aria-hidden="true"
          />

          <p className="mk-cart-summary__shipping-text">
            Shipping availability and charges
            will be confirmed during checkout.
          </p>
        </div>
      </motion.aside>
    </>
  );
}
