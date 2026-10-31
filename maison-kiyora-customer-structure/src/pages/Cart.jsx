
import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Trash2,
  LockKeyhole,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { toast } from "react-toastify";

import useCart from "../hooks/useCart.js";
import CartItem from "../components/cart/CartItem.jsx";
import CartSummary from "../components/cart/CartSummary.jsx";

// ======================================================
// MAISON KIYORA
// THE ART OF SLOW PERFUMERY
//
// SHOPPING BAG PAGE
//
// Features:
// - Premium luxury shopping bag
// - Live cart items
// - Quantity updates
// - Remove individual products
// - Clear entire shopping bag
// - Cart summary and subtotal
// - Continue shopping navigation
// - Empty cart experience
// - Smooth Framer Motion animations
// - Fully responsive layout
// - Accessible interactive controls
//
// Cart data comes from CartContext.
// ======================================================

// ======================================================
// 01. PAGE STYLES
// ======================================================

const STYLES = `
  .mk-cart-page {
    min-height: 80vh;
    background: #faf8f4;
    color: #1d2940;
    padding: 62px 24px 110px;
  }

  .mk-cart-page__container {
    width: 100%;
    max-width: 1320px;
    margin: 0 auto;
  }

  /* ----------------------------------------------
     BREADCRUMB
  ---------------------------------------------- */

  .mk-cart-page__breadcrumb {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 38px;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    letter-spacing: .08em;
  }

  .mk-cart-page__breadcrumb a {
    color: #777a80;
    text-decoration: none;
    transition: color 200ms ease;
  }

  .mk-cart-page__breadcrumb a:hover {
    color: #967a51;
  }

  .mk-cart-page__breadcrumb-separator {
    color: #b69a69;
  }

  .mk-cart-page__breadcrumb-current {
    color: #1d2940;
  }

  /* ----------------------------------------------
     PAGE HEADER
  ---------------------------------------------- */

  .mk-cart-page__header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 24px;
    margin-bottom: 42px;
  }

  .mk-cart-page__eyebrow {
    margin: 0 0 13px;
    color: #967a51;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .25em;
    text-transform: uppercase;
  }

  .mk-cart-page__title {
    margin: 0;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(48px, 6vw, 82px);
    font-weight: 400;
    line-height: .98;
    letter-spacing: -.04em;
  }

  .mk-cart-page__subtitle {
    margin: 18px 0 0;
    color: #777a80;
    font-family: "Manrope", sans-serif;
    font-size: 12px;
    line-height: 1.8;
  }

  .mk-cart-page__count {
    color: #967a51;
    font-weight: 600;
  }

  .mk-cart-page__continue {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    color: #1d2940;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .13em;
    text-decoration: none;
    text-transform: uppercase;
    transition:
      color 200ms ease,
      gap 200ms ease;
  }

  .mk-cart-page__continue:hover {
    gap: 15px;
    color: #967a51;
  }

  .mk-cart-page__continue:focus-visible {
    outline: 2px solid #b69a69;
    outline-offset: 5px;
  }

  /* ----------------------------------------------
     CONTENT GRID
  ---------------------------------------------- */

  .mk-cart-page__layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 380px;
    align-items: start;
    gap: 62px;
  }

  .mk-cart-page__items {
    min-width: 0;
  }

  .mk-cart-page__items-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 19px;
    border-bottom: 1px solid rgba(29,41,64,.18);
  }

  .mk-cart-page__items-heading {
    margin: 0;
    font-family: "Manrope", sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .15em;
    text-transform: uppercase;
  }

  .mk-cart-page__clear {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 8px 0;
    border: none;
    background: transparent;
    color: #777a80;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    cursor: pointer;
    transition: color 200ms ease;
  }

  .mk-cart-page__clear:hover {
    color: #a64e4e;
  }

  .mk-cart-page__clear:focus-visible {
    outline: 2px solid #b69a69;
    outline-offset: 4px;
  }

  .mk-cart-page__items-list {
    display: flex;
    flex-direction: column;
  }

  .mk-cart-page__items-footer {
    margin-top: 30px;
  }

  /* ----------------------------------------------
     SUMMARY
  ---------------------------------------------- */

  .mk-cart-page__summary {
    position: sticky;
    top: 110px;
    min-width: 0;
  }

  /* ----------------------------------------------
     EMPTY CART
  ---------------------------------------------- */

  .mk-cart-page__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 480px;
    padding: 55px 24px;
    border: 1px solid rgba(29,41,64,.1);
    background: #f5f0e8;
    text-align: center;
  }

  .mk-cart-page__empty-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 90px;
    height: 90px;
    margin-bottom: 28px;
    border: 1px solid rgba(182,154,105,.35);
    border-radius: 50%;
    color: #b69a69;
  }

  .mk-cart-page__empty-eyebrow {
    margin: 0 0 13px;
    color: #967a51;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .22em;
    text-transform: uppercase;
  }

  .mk-cart-page__empty-title {
    margin: 0;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(38px, 5vw, 60px);
    font-weight: 400;
    line-height: 1.1;
  }

  .mk-cart-page__empty-description {
    max-width: 390px;
    margin: 18px 0 30px;
    color: #777a80;
    font-family: "Manrope", sans-serif;
    font-size: 12px;
    line-height: 1.9;
  }

  .mk-cart-page__shop-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    min-height: 52px;
    padding: 15px 26px;
    border: 1px solid #1d2940;
    background: #1d2940;
    color: #f5f0e8;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .14em;
    text-decoration: none;
    text-transform: uppercase;
    transition:
      background 250ms ease,
      border-color 250ms ease,
      transform 250ms ease;
  }

  .mk-cart-page__shop-button:hover {
    background: #293a58;
    border-color: #293a58;
    transform: translateY(-2px);
  }

  .mk-cart-page__shop-button:focus-visible {
    outline: 2px solid #b69a69;
    outline-offset: 4px;
  }

  /* ----------------------------------------------
     FOOTER NOTE
  ---------------------------------------------- */

  .mk-cart-page__footer-note {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    margin-top: 60px;
    color: #777a80;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    line-height: 1.6;
    text-align: center;
  }

  /* ----------------------------------------------
     RESPONSIVE
  ---------------------------------------------- */

  @media (max-width: 1100px) {
    .mk-cart-page__layout {
      grid-template-columns: minmax(0, 1fr) 340px;
      gap: 36px;
    }
  }

  @media (max-width: 900px) {
    .mk-cart-page__layout {
      grid-template-columns: 1fr;
      gap: 42px;
    }

    .mk-cart-page__summary {
      position: static;
      max-width: 600px;
      width: 100%;
    }
  }

  @media (max-width: 640px) {
    .mk-cart-page {
      padding: 36px 18px 70px;
    }

    .mk-cart-page__breadcrumb {
      margin-bottom: 28px;
    }

    .mk-cart-page__header {
      align-items: flex-start;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 30px;
    }

    .mk-cart-page__title {
      font-size: 55px;
    }

    .mk-cart-page__subtitle {
      margin-top: 13px;
    }

    .mk-cart-page__empty {
      min-height: 400px;
      padding: 42px 20px;
    }

    .mk-cart-page__empty-icon {
      width: 76px;
      height: 76px;
    }

    .mk-cart-page__footer-note {
      margin-top: 45px;
    }
  }

  @media (max-width: 380px) {
    .mk-cart-page__title {
      font-size: 48px;
    }

    .mk-cart-page__items-header {
      gap: 10px;
    }

    .mk-cart-page__items-heading {
      font-size: 10px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .mk-cart-page__continue,
    .mk-cart-page__clear,
    .mk-cart-page__shop-button {
      transition: none;
    }

    .mk-cart-page__shop-button:hover {
      transform: none;
    }
  }
`;

// ======================================================
// 02. EMPTY CART COMPONENT
// ======================================================

function EmptyCart() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section
      className="mk-cart-page__empty"
      initial={
        reducedMotion
          ? false
          : { opacity: 0, y: 18 }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: reducedMotion ? 0 : 0.5,
        ease: "easeOut",
      }}
      aria-labelledby="empty-cart-title"
    >
      <div className="mk-cart-page__empty-icon">
        <ShoppingBag
          size={34}
          strokeWidth={1.1}
          aria-hidden="true"
        />
      </div>

      <p className="mk-cart-page__empty-eyebrow">
        Your Collection Awaits
      </p>

      <h2
        id="empty-cart-title"
        className="mk-cart-page__empty-title"
      >
        Your Bag Is Empty
      </h2>

      <p className="mk-cart-page__empty-description">
        Discover fragrances thoughtfully created
        for moments worth remembering.
      </p>

      <Link
        to="/collections"
        className="mk-cart-page__shop-button"
      >
        <span>Explore Fragrances</span>

        <ArrowRight
          size={17}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </Link>
    </motion.section>
  );
}

// ======================================================
// 03. MAIN CART PAGE
// ======================================================

export default function Cart() {
  const {
    cartItems,
    cartCount,
    isCartEmpty,
    clearCart,
  } = useCart();

  const reducedMotion = useReducedMotion();

  // ----------------------------------------------------
  // PAGE TITLE
  // ----------------------------------------------------

  useEffect(() => {
    document.title =
      "Shopping Bag | Maison Kiyora";
  }, []);

  // ----------------------------------------------------
  // CART DATA
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

  const isEmpty =
    Boolean(isCartEmpty) ||
    items.length === 0 ||
    itemCount <= 0;

  // ----------------------------------------------------
  // CLEAR SHOPPING BAG
  // ----------------------------------------------------

  const handleClearCart = () => {
    if (isEmpty) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove all fragrances from your shopping bag?"
    );

    if (!confirmed) {
      return;
    }

    clearCart();

    toast.info(
      "Your shopping bag has been cleared.",
      {
        autoClose: 2500,
      }
    );
  };

  // ----------------------------------------------------
  // PAGE OUTPUT
  // ----------------------------------------------------

  return (
    <>
      <style>{STYLES}</style>

      <div className="mk-cart-page">
        <div className="mk-cart-page__container">

          {/* BREADCRUMB */}

          <nav
            className="mk-cart-page__breadcrumb"
            aria-label="Breadcrumb"
          >
            <Link to="/">
              Home
            </Link>

            <span
              className="mk-cart-page__breadcrumb-separator"
              aria-hidden="true"
            >
              /
            </span>

            <span
              className="mk-cart-page__breadcrumb-current"
              aria-current="page"
            >
              Shopping Bag
            </span>
          </nav>

          {/* PAGE HEADER */}

          <motion.header
            className="mk-cart-page__header"
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
            }}
          >
            <div>
              <p className="mk-cart-page__eyebrow">
                Maison Kiyora
              </p>

              <h1 className="mk-cart-page__title">
                Your Shopping Bag
              </h1>

              <p className="mk-cart-page__subtitle">
                {isEmpty ? (
                  "Your fragrance journey begins here."
                ) : (
                  <>
                    You have{" "}
                    <span className="mk-cart-page__count">
                      {itemCount}
                    </span>{" "}
                    {itemCount === 1
                      ? "item"
                      : "items"}{" "}
                    in your bag.
                  </>
                )}
              </p>
            </div>

            {!isEmpty && (
              <Link
                to="/collections"
                className="mk-cart-page__continue"
              >
                <ArrowLeft
                  size={16}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />

                <span>Continue Shopping</span>
              </Link>
            )}
          </motion.header>

          {/* SHOPPING BAG CONTENT */}

          {isEmpty ? (
            <EmptyCart />
          ) : (
            <div className="mk-cart-page__layout">

              {/* LEFT: CART ITEMS */}

              <section
                className="mk-cart-page__items"
                aria-labelledby="cart-items-title"
              >
                <div className="mk-cart-page__items-header">
                  <h2
                    id="cart-items-title"
                    className="mk-cart-page__items-heading"
                  >
                    Selected Fragrances
                  </h2>

                  <button
                    type="button"
                    className="mk-cart-page__clear"
                    onClick={handleClearCart}
                    aria-label="Clear shopping bag"
                  >
                    <Trash2
                      size={14}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />

                    <span>Clear Bag</span>
                  </button>
                </div>

                <div className="mk-cart-page__items-list">
                  <AnimatePresence
                    initial={false}
                    mode="popLayout"
                  >
                    {items.map((item) => (
                      <CartItem
                        key={
                          item.key ??
                          `${item.productId}-${item.variantId}`
                        }
                        item={item}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                <div className="mk-cart-page__items-footer">
                  <Link
                    to="/collections"
                    className="mk-cart-page__continue"
                  >
                    <ArrowLeft
                      size={16}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />

                    <span>Discover More Fragrances</span>
                  </Link>
                </div>
              </section>

              {/* RIGHT: ORDER SUMMARY */}

              <div className="mk-cart-page__summary">
                <CartSummary />
              </div>
            </div>
          )}

          {/* FOOTER NOTE */}

          <div className="mk-cart-page__footer-note">
            <LockKeyhole
              size={13}
              strokeWidth={1.5}
              aria-hidden="true"
            />

            <span>
              Your shopping bag is saved in this browser.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
