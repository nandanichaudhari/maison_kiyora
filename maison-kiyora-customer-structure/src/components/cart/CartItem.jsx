
import { useState } from "react";
import { Link } from "react-router-dom";
import { X, ShoppingBag } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "react-toastify";

import useCart from "../../hooks/useCart.js";
import QuantitySelector from "../product/QuantitySelector.jsx";

// ======================================================
// MAISON KIYORA
// THE ART OF SLOW PERFUMERY
//
// PREMIUM SHOPPING BAG ITEM
//
// Features:
// - Product image and details
// - Product page navigation
// - Quantity increase/decrease
// - Remove product from bag
// - Individual item total
// - CartContext integration
// - Toast notifications
// - Responsive luxury layout
// - Accessible controls
// - Framer Motion animations
//
// Cart item structure:
// {
//   key,
//   productId,
//   id,
//   slug,
//   variantId,
//   name,
//   title,
//   image,
//   price,
//   quantity,
//   size
// }
// ======================================================

// ======================================================
// 01. COMPONENT STYLES
// ======================================================

const STYLES = `
  .mk-cart-item {
    display: grid;
    grid-template-columns: 118px minmax(0, 1fr);
    gap: 24px;
    width: 100%;
    padding: 26px 0;
    border-bottom: 1px solid rgba(29,41,64,.13);
    color: #1d2940;
  }

  .mk-cart-item__image-link {
    display: block;
    width: 118px;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    background: #eee8df;
    text-decoration: none;
  }

  .mk-cart-item__image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 500ms ease;
  }

  .mk-cart-item__image-link:hover .mk-cart-item__image {
    transform: scale(1.055);
  }

  .mk-cart-item__image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #b69a69;
  }

  .mk-cart-item__content {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .mk-cart-item__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .mk-cart-item__eyebrow {
    margin: 0 0 8px;
    color: #967a51;
    font-family: "Manrope", sans-serif;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: .2em;
    text-transform: uppercase;
  }

  .mk-cart-item__name {
    margin: 0;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(24px, 2.4vw, 30px);
    font-weight: 500;
    line-height: 1.08;
    letter-spacing: -.015em;
  }

  .mk-cart-item__name a {
    color: inherit;
    text-decoration: none;
    transition: color 200ms ease;
  }

  .mk-cart-item__name a:hover {
    color: #967a51;
  }

  .mk-cart-item__size {
    margin: 9px 0 0;
    color: #777a80;
    font-family: "Manrope", sans-serif;
    font-size: 11px;
    letter-spacing: .04em;
  }

  .mk-cart-item__remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 36px;
    height: 36px;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 50%;
    background: transparent;
    color: #777a80;
    cursor: pointer;
    transition:
      color 200ms ease,
      background 200ms ease,
      border-color 200ms ease;
  }

  .mk-cart-item__remove:hover {
    color: #a64e4e;
    background: rgba(166,78,78,.06);
    border-color: rgba(166,78,78,.15);
  }

  .mk-cart-item__remove:focus-visible {
    outline: 2px solid #b69a69;
    outline-offset: 3px;
  }

  .mk-cart-item__bottom {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: auto;
    padding-top: 22px;
  }

  .mk-cart-item__pricing {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;
    margin-left: auto;
  }

  .mk-cart-item__unit-price {
    color: #858585;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    line-height: 1.5;
  }

  .mk-cart-item__total {
    margin: 0;
    color: #1d2940;
    font-family: "Manrope", sans-serif;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: .01em;
    font-variant-numeric: tabular-nums;
  }

  @media (max-width: 640px) {
    .mk-cart-item {
      grid-template-columns: 92px minmax(0, 1fr);
      gap: 16px;
      padding: 20px 0;
    }

    .mk-cart-item__image-link {
      width: 92px;
    }

    .mk-cart-item__name {
      font-size: 24px;
    }

    .mk-cart-item__bottom {
      align-items: flex-start;
      gap: 12px;
      padding-top: 16px;
    }

    .mk-cart-item__pricing {
      align-items: flex-start;
      margin-left: 0;
    }

    .mk-cart-item__total {
      font-size: 14px;
    }
  }

  @media (max-width: 380px) {
    .mk-cart-item {
      grid-template-columns: 76px minmax(0, 1fr);
      gap: 12px;
    }

    .mk-cart-item__image-link {
      width: 76px;
    }

    .mk-cart-item__name {
      font-size: 21px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .mk-cart-item__image,
    .mk-cart-item__name a,
    .mk-cart-item__remove {
      transition: none;
    }
  }
`;

// ======================================================
// 02. HELPERS
// ======================================================

function normalizePrice(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(
      value.replace(/[₹,\s]/g, "")
    );

    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getImageSource(image) {
  if (typeof image === "string") {
    return image;
  }

  if (image && typeof image === "object") {
    return image.src ?? image.url ?? "";
  }

  return "";
}

// ======================================================
// 03. CART ITEM COMPONENT
// ======================================================

export default function CartItem({
  item,
  className = "",
  showToast = true,
  onRemove,
}) {
  const {
    removeFromCart,
    updateQuantity,
    maxQuantity = 10,
  } = useCart();

  const reducedMotion = useReducedMotion();

  const [isRemoving, setIsRemoving] = useState(false);

  // ----------------------------------------------------
  // SAFELY READ ITEM DATA
  // ----------------------------------------------------

  const itemKey =
    item?.key ??
    (item?.productId != null || item?.id != null
      ? `${item.productId ?? item.id}::${item.variantId ?? "default"}`
      : null);

  const productName =
    item?.name ??
    item?.title ??
    "Maison Kiyora Fragrance";

  const productSlug = item?.slug;

  const productSize = item?.size ?? item?.variant?.size ?? null;
  const productType = item?.type ?? "Eau de Parfum";

  const productPrice = normalizePrice(item?.price);

  const rawQuantity = Number(item?.quantity);
  const productQuantity = Number.isFinite(rawQuantity)
    ? Math.max(1, Math.trunc(rawQuantity))
    : 1;

  const rawStock = item?.stock ?? item?.variant?.stock;
  const stock = rawStock != null && rawStock !== "" && Number.isFinite(Number(rawStock))
    ? Math.max(0, Math.trunc(Number(rawStock)))
    : undefined;
  const quantityMax = Math.min(10, Number.isFinite(Number(maxQuantity))
    ? Math.max(1, Math.trunc(Number(maxQuantity)))
    : 10);

  const lineTotal =
    productPrice * productQuantity;

  const productImage = getImageSource(item?.image);

  const productUrl = productSlug
    ? `/product/${encodeURIComponent(productSlug)}`
    : null;

  // ----------------------------------------------------
  // UPDATE QUANTITY
  // ----------------------------------------------------

  const handleQuantityChange = (newQuantity) => {
    if (isRemoving || !itemKey || typeof updateQuantity !== "function") return;

    const next = Number(newQuantity);
    if (!Number.isInteger(next) || next < 1 || next > quantityMax) return;
    if (stock !== undefined && next > stock) return;

    try {
      updateQuantity(itemKey, next);
    } catch (error) {
      console.error("Maison Kiyora: Unable to update quantity.", error);
      if (showToast) toast.error("Unable to update quantity. Please try again.");
    }
  };

  // ----------------------------------------------------
  // REMOVE PRODUCT
  // ----------------------------------------------------

  const handleRemove = () => {
    if (isRemoving || !itemKey || typeof removeFromCart !== "function") {
      return;
    }

    setIsRemoving(true);

    try {
      removeFromCart(itemKey);

      if (showToast) {
        toast.info(
          `${productName} removed from your bag.`,
          {
            autoClose: 2200,
          }
        );
      }

      if (typeof onRemove === "function") {
        onRemove(item);
      }
      setIsRemoving(false);
    } catch (error) {
      setIsRemoving(false);

      console.error(
        "Maison Kiyora: Unable to remove cart item.",
        error
      );

      if (showToast) {
        toast.error(
          "Unable to remove this item. Please try again."
        );
      }
    }
  };

  // ----------------------------------------------------
  // COMPONENT OUTPUT
  // ----------------------------------------------------

  return (
    <>
      <style>{STYLES}</style>

      <motion.article
        layout={!reducedMotion}
        initial={
          reducedMotion
            ? false
            : { opacity: 0, y: 8 }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={
          reducedMotion
            ? undefined
            : {
                opacity: 0,
                x: -20,
                transition: {
                  duration: 0.2,
                },
              }
        }
        transition={{
          duration: reducedMotion ? 0 : 0.3,
        }}
        className={[
          "mk-cart-item",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* PRODUCT IMAGE */}

        {productUrl ? (
          <Link
            to={productUrl}
            className="mk-cart-item__image-link"
            aria-label={`View ${productName}`}
          >
            {productImage ? (
              <img
                src={productImage}
                alt={productName}
                className="mk-cart-item__image"
                loading="lazy"
              />
            ) : (
              <span className="mk-cart-item__image-placeholder">
                <ShoppingBag
                  size={28}
                  strokeWidth={1}
                  aria-hidden="true"
                />
              </span>
            )}
          </Link>
        ) : (
          <div className="mk-cart-item__image-link">
            {productImage ? (
              <img
                src={productImage}
                alt={productName}
                className="mk-cart-item__image"
                loading="lazy"
              />
            ) : (
              <span className="mk-cart-item__image-placeholder">
                <ShoppingBag
                  size={28}
                  strokeWidth={1}
                  aria-hidden="true"
                />
              </span>
            )}
          </div>
        )}

        {/* PRODUCT DETAILS */}

        <div className="mk-cart-item__content">
          <div className="mk-cart-item__top">
            <div>
              <p className="mk-cart-item__eyebrow">
                Maison Kiyora
              </p>

              <h3 className="mk-cart-item__name">
                {productUrl ? (
                  <Link to={productUrl}>
                    {productName}
                  </Link>
                ) : (
                  productName
                )}
              </h3>

              <p className="mk-cart-item__size">
                {productType}{productSize ? ` · ${productSize}` : ""}
              </p>
            </div>

            <button
              type="button"
              className="mk-cart-item__remove"
              onClick={handleRemove}
              disabled={isRemoving || !itemKey}
              aria-label={`Remove ${productName} from bag`}
              title="Remove from bag"
            >
              <X
                size={19}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* QUANTITY AND PRICING */}

          <div className="mk-cart-item__bottom">
            <QuantitySelector
              value={productQuantity}
              onChange={handleQuantityChange}
              min={1}
              max={quantityMax}
              stock={stock === undefined ? undefined : Math.max(stock, productQuantity)}
              variant="compact"
              showLabel={false}
              label={`Quantity for ${productName}`}
              disabled={isRemoving || !itemKey}
            />

            <div className="mk-cart-item__pricing">
              <span className="mk-cart-item__unit-price">
                {formatPrice(productPrice)} each
              </span>

              <p className="mk-cart-item__total">
                {formatPrice(lineTotal)}
              </p>
            </div>
          </div>
        </div>
      </motion.article>
    </>
  );
}
