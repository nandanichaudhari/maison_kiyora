
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Heart,
  ShoppingBag,
  Check,
} from "lucide-react";
import { toast } from "react-toastify";

import { useCart } from "../../context/CartContext.jsx";
import { useWishlist } from "../../context/WishlistContext.jsx";

// ======================================================
// MAISON KIYORA — PRODUCT CARD
// Premium product presentation
// ======================================================

const PRODUCT_IMAGE_BASE = "/images/products";

const formatMoney = (value, currency = "INR") => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) return null;

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₹${amount.toLocaleString("en-IN")}`;
  }
};

const firstValid = (...values) =>
  values.find(
    (value) =>
      typeof value === "string" && value.trim()
  )?.trim() || "";

// ------------------------------------------------------
// IMAGE HELPERS
// ------------------------------------------------------

function resolveImageSource(image) {
  if (typeof image === "string") {
    return image.trim();
  }

  if (image && typeof image === "object") {
    return firstValid(
      image.src,
      image.url,
      image.image_url,
      image.imageUrl
    );
  }

  return "";
}

function getImage(product) {
  const candidates = [
    product?.images?.[0],
    product?.image,
    product?.imageUrl,
    product?.image_url,
    product?.thumbnail,
    product?.gallery?.[0],
  ];

  for (const candidate of candidates) {
    const source = resolveImageSource(candidate);

    if (source) return source;
  }

  // Fallback to the local PNG using the product slug.
  // This works for Maison Kiyora's seven local products.
  if (product?.slug) {
    return `${PRODUCT_IMAGE_BASE}/${product.slug}.png`;
  }

  return "";
}

function getImageAlt(product) {
  const firstImage = product?.images?.[0];

  return (
    firstValid(
      firstImage?.alt,
      product?.imageAlt,
      product?.image_alt
    ) ||
    `Maison Kiyora ${product?.name || "fragrance"} perfume bottle`
  );
}

// ------------------------------------------------------
// VARIANT HELPERS
// ------------------------------------------------------

function getVariants(product) {
  const variants = product?.variants || product?.sizes || [];

  return Array.isArray(variants) ? variants : [];
}

function getVariantLabel(variant) {
  if (
    typeof variant === "string" ||
    typeof variant === "number"
  ) {
    return String(variant);
  }

  return firstValid(
    variant?.label,
    variant?.size,
    variant?.name,
    variant?.volume,
    variant?.volume_ml != null
      ? `${variant.volume_ml} ml`
      : ""
  );
}

function getVariantId(variant) {
  if (
    typeof variant === "string" ||
    typeof variant === "number"
  ) {
    return String(variant);
  }

  return String(
    variant?.id ??
      variant?.variantId ??
      variant?.sku ??
      getVariantLabel(variant)
  );
}

// ------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------

export default function ProductCard({
  product,
  className = "",
  index = 0,
  showQuickAdd = true,
}) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const reduceMotion = useReducedMotion();

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [selectedVariantId, setSelectedVariantId] =
    useState("");

  const addedTimeoutRef = useRef(null);

  const id =
    product?.id ??
    product?._id ??
    product?.productId;

  const slug =
    product?.slug ||
    (id != null ? String(id) : "");

  const name =
    firstValid(product?.name, product?.title) ||
    "Maison Kiyora Fragrance";

  const description = firstValid(
    product?.subtitle,
    product?.shortDescription,
    product?.short_description,
    typeof product?.category === "object"
      ? product.category?.name
      : ""
  );

  const image = getImage(product);

  const imageAlt = getImageAlt(product);

  const variants = useMemo(
    () => getVariants(product),
    [product]
  );

  const defaultVariant =
    variants.find(
      (variant) =>
        variant &&
        typeof variant === "object" &&
        (variant.isDefault || variant.is_default)
    ) ||
    variants[0] ||
    null;

  const selectedVariant =
    variants.find(
      (variant) =>
        getVariantId(variant) === selectedVariantId
    ) || defaultVariant;

  const variantPrice =
    selectedVariant &&
    typeof selectedVariant === "object"
      ? selectedVariant.salePrice ??
        selectedVariant.sale_price ??
        selectedVariant.price
      : undefined;

  const price =
    variantPrice ??
    product?.salePrice ??
    product?.sale_price ??
    product?.price ??
    product?.base_price;

  const originalPrice =
    (selectedVariant &&
    typeof selectedVariant === "object"
      ? selectedVariant.compareAtPrice ??
        selectedVariant.compare_at_price ??
        selectedVariant.mrp
      : undefined) ??
    product?.compareAtPrice ??
    product?.compare_at_price ??
    product?.originalPrice ??
    product?.mrp;

  const numericPrice = Number(price);
  const numericOriginal = Number(originalPrice);

  const discount =
    originalPrice != null &&
    Number.isFinite(numericPrice) &&
    Number.isFinite(numericOriginal) &&
    numericOriginal > numericPrice &&
    numericOriginal > 0
      ? Math.round(
          ((numericOriginal - numericPrice) /
            numericOriginal) *
            100
        )
      : 0;

  const currency = product?.currency || "INR";

  const stockValue =
    (selectedVariant &&
    typeof selectedVariant === "object"
      ? selectedVariant.stock ??
        selectedVariant.stock_quantity ??
        selectedVariant.inventory
      : undefined) ??
    product?.stock ??
    product?.stock_quantity ??
    product?.inventory ??
    product?.stockQuantity;

  const unavailable =
    product?.isActive === false ||
    product?.is_active === false ||
    product?.available === false ||
    product?.inStock === false ||
    product?.in_stock === false ||
    (stockValue != null &&
      Number(stockValue) <= 0);

  const wished =
    id != null && Boolean(isInWishlist?.(id));

  const href = slug
    ? `/product/${encodeURIComponent(slug)}`
    : "/collections";

  const canAdd =
    id != null &&
    !unavailable &&
    !adding &&
    typeof addToCart === "function";

  const displayPrice = formatMoney(price, currency);

  // Reset image fallback when another product/image is loaded.
  useEffect(() => {
    setImageFailed(false);
  }, [image]);

  // Reset variant selection when the product changes.
  useEffect(() => {
    setSelectedVariantId("");
    setAdded(false);
  }, [id]);

  useEffect(() => {
    return () => {
      if (addedTimeoutRef.current) {
        clearTimeout(addedTimeoutRef.current);
      }
    };
  }, []);

  // ----------------------------------------------------
  // WISHLIST
  // ----------------------------------------------------

  const handleWishlist = async () => {
    if (
      id == null ||
      typeof toggleWishlist !== "function"
    ) {
      return;
    }

    try {
      await Promise.resolve(toggleWishlist(product));
    } catch (error) {
      toast.error(
        error?.message ||
          "Could not update your wishlist."
      );
    }
  };

  // ----------------------------------------------------
  // ADD TO CART
  // ----------------------------------------------------

  const handleAdd = async () => {
    if (!canAdd) return;

    setAdding(true);

    try {
      // Keep the existing cart integration signature.
      const result = await Promise.resolve(
        addToCart(
          product,
          1,
          selectedVariant || undefined
        )
      );

      if (
        result === false ||
        result?.success === false
      ) {
        throw new Error(
          result?.message ||
            "Unable to add this fragrance to your bag."
        );
      }

      setAdded(true);

      toast.success(`${name} added to your bag.`);

      if (addedTimeoutRef.current) {
        clearTimeout(addedTimeoutRef.current);
      }

      addedTimeoutRef.current = setTimeout(() => {
        setAdded(false);
      }, 1800);
    } catch (error) {
      toast.error(
        error?.message ||
          "Could not add this fragrance to your bag."
      );
    } finally {
      setAdding(false);
    }
  };

  if (!product || typeof product !== "object") {
    return null;
  }

  return (
    <motion.article
      className={`mk-product-card ${className}`.trim()}
      initial={
        reduceMotion
          ? false
          : { opacity: 0, y: 18 }
      }
      whileInView={
        reduceMotion
          ? undefined
          : { opacity: 1, y: 0 }
      }
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: 0.5,
        delay: Math.min(index, 6) * 0.055,
      }}
    >
      <style>{styles}</style>

      {/* PRODUCT IMAGE */}
      <div className="mk-product-card-media">
        <Link
          className="mk-product-card-image-link"
          to={href}
          aria-label={`View ${name}`}
        >
          {image && !imageFailed ? (
            <img
              key={image}
              src={image}
              alt={imageAlt}
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span
              className="mk-product-card-placeholder"
              aria-label={`${name} image unavailable`}
              role="img"
            >
              MK
              <span>MAISON KIYORA</span>
            </span>
          )}

          <span className="mk-product-card-view">
            DISCOVER
            <ArrowUpRight
              size={15}
              aria-hidden="true"
            />
          </span>
        </Link>

        {/* PRODUCT BADGE */}
        {unavailable ? (
          <span className="mk-product-card-badge">
            SOLD OUT
          </span>
        ) : discount > 0 ? (
          <span className="mk-product-card-badge">
            {discount}% OFF
          </span>
        ) : product?.isNewArrival ||
          product?.isNew ||
          product?.is_new ? (
          <span className="mk-product-card-badge">
            NEW ARRIVAL
          </span>
        ) : null}

        {/* WISHLIST */}
        {id != null && (
          <button
            className={`mk-product-card-heart ${
              wished ? "is-active" : ""
            }`}
            type="button"
            onClick={handleWishlist}
            aria-label={
              wished
                ? `Remove ${name} from wishlist`
                : `Add ${name} to wishlist`
            }
            aria-pressed={wished}
          >
            <Heart
              size={19}
              strokeWidth={1.5}
              fill={
                wished
                  ? "currentColor"
                  : "none"
              }
            />
          </button>
        )}
      </div>

      {/* PRODUCT DETAILS */}
      <div className="mk-product-card-body">
        <span className="mk-product-card-eyebrow">
          MAISON KIYORA
        </span>

        <Link
          to={href}
          className="mk-product-card-title"
        >
          {name}
        </Link>

        {description && (
          <p className="mk-product-card-description">
            {description}
          </p>
        )}

        <div className="mk-product-card-bottom">
          <div className="mk-product-card-prices">
            {displayPrice ? (
              <strong>{displayPrice}</strong>
            ) : (
              <span>Price on request</span>
            )}

            {discount > 0 && (
              <del>
                {formatMoney(
                  originalPrice,
                  currency
                )}
              </del>
            )}
          </div>

          {/* SIZE SELECTOR */}
          {variants.length > 1 ? (
            <label className="mk-product-card-size-label">
              <span className="mk-product-card-sr-only">
                Choose size for {name}
              </span>

              <select
                value={getVariantId(selectedVariant)}
                onChange={(event) =>
                  setSelectedVariantId(
                    event.target.value
                  )
                }
                aria-label={`Choose size for ${name}`}
              >
                {variants.map((variant) => (
                  <option
                    key={getVariantId(variant)}
                    value={getVariantId(variant)}
                  >
                    {getVariantLabel(variant) ||
                      "Option"}
                  </option>
                ))}
              </select>
            </label>
          ) : selectedVariant ? (
            <span className="mk-product-card-size">
              {getVariantLabel(selectedVariant)}
            </span>
          ) : product?.sizeLabel ? (
            <span className="mk-product-card-size">
              {product.sizeLabel}
            </span>
          ) : null}
        </div>

        {/* ADD TO BAG */}
        {showQuickAdd && (
          <button
            className="mk-product-card-add"
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
          >
            {added ? (
              <Check size={16} />
            ) : (
              <ShoppingBag size={16} />
            )}

            <span>
              {unavailable
                ? "OUT OF STOCK"
                : adding
                ? "ADDING..."
                : added
                ? "ADDED TO BAG"
                : "ADD TO BAG"}
            </span>

            {!unavailable &&
              !adding &&
              !added && (
                <ArrowUpRight size={15} />
              )}
          </button>
        )}
      </div>
    </motion.article>
  );
}

// ======================================================
// STYLES — NAVY × IVORY × CHAMPAGNE GOLD
// ======================================================

const styles = `
.mk-product-card {
  --mk-pc-navy: #1D2940;
  --mk-pc-gold: #B69A69;
  --mk-pc-ivory: #F5F0E8;

  min-width: 0;
  color: var(--mk-pc-navy);
  font-family: "Manrope", sans-serif;
}

.mk-product-card *,
.mk-product-card *::before,
.mk-product-card *::after {
  box-sizing: border-box;
}

.mk-product-card-media {
  position: relative;
  overflow: hidden;
  background: #e9e1d5;
  aspect-ratio: 4 / 5;
}

.mk-product-card-image-link {
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  text-decoration: none;
}

.mk-product-card-image-link img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform .7s cubic-bezier(.2,.7,.2,1);
}

.mk-product-card:hover .mk-product-card-image-link img {
  transform: scale(1.055);
}

.mk-product-card-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  height: 100%;

  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: clamp(60px, 8vw, 115px);
  color: #b5a18b;

  background:
    radial-gradient(
      circle at 50% 40%,
      #f6efe4,
      #ddd0be
    );
}

.mk-product-card-placeholder span {
  font-family: "Manrope", sans-serif;
  font-size: 9px;
  letter-spacing: .3em;
}

.mk-product-card-view {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;

  background: rgba(29,41,64,.86);
  color: #fff;

  font-size: 10px;
  font-weight: 600;
  letter-spacing: .15em;

  transform: translateY(100%);
  transition: transform .3s;
}

.mk-product-card:hover .mk-product-card-view,
.mk-product-card-image-link:focus-visible .mk-product-card-view {
  transform: translateY(0);
}

.mk-product-card-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 1;

  padding: 9px 11px;
  background: rgba(245,240,232,.94);

  font-size: 9px;
  font-weight: 700;
  letter-spacing: .12em;
}

.mk-product-card-heart {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;

  display: grid;
  place-items: center;

  width: 38px;
  height: 38px;

  border: 1px solid rgba(29,41,64,.12);
  border-radius: 50%;

  background: rgba(245,240,232,.94);
  color: var(--mk-pc-navy);

  cursor: pointer;

  transition:
    color .2s,
    background .2s,
    transform .2s;
}

.mk-product-card-heart:hover {
  transform: scale(1.06);
}

.mk-product-card-heart.is-active {
  color: #a84f57;
}

.mk-product-card-body {
  padding: 19px 3px 0;
}

.mk-product-card-eyebrow {
  display: block;
  margin-bottom: 8px;

  color: #99815d;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .22em;
}

.mk-product-card-title {
  display: block;

  color: var(--mk-pc-navy);

  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: clamp(26px, 2.5vw, 34px);
  font-weight: 500;
  line-height: 1.1;

  text-decoration: none;
}

.mk-product-card-title:hover {
  color: #8b6e47;
}

.mk-product-card-description {
  min-height: 17px;
  margin: 9px 0 0;

  color: #77716b;
  font-size: 11px;
  line-height: 1.6;
}

.mk-product-card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  min-height: 40px;
  margin-top: 13px;
}

.mk-product-card-prices {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.mk-product-card-prices strong {
  font-size: 13px;
  font-weight: 700;
}

.mk-product-card-prices del {
  color: #9d9790;
  font-size: 11px;
}

.mk-product-card-prices > span {
  font-size: 11px;
  color: #7b746d;
}

.mk-product-card-size,
.mk-product-card-size-label select {
  font-size: 10px;
  color: #806c50;
}

.mk-product-card-size-label select {
  max-width: 110px;
  padding: 7px 8px;

  border: 1px solid #d9cbbb;
  background: transparent;

  font-family: inherit;
  cursor: pointer;
}

.mk-product-card-add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 11px;

  width: 100%;
  min-height: 46px;
  margin-top: 15px;
  padding: 10px 12px;

  border: 1px solid var(--mk-pc-navy);
  background: transparent;
  color: var(--mk-pc-navy);

  font: 700 10px "Manrope", sans-serif;
  letter-spacing: .12em;

  cursor: pointer;

  transition:
    background .25s,
    color .25s;
}

.mk-product-card-add:hover:not(:disabled) {
  background: var(--mk-pc-navy);
  color: #fff;
}

.mk-product-card-add:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.mk-product-card-add > svg:last-child {
  margin-left: auto;
}

.mk-product-card-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}

.mk-product-card a:focus-visible,
.mk-product-card button:focus-visible,
.mk-product-card select:focus-visible {
  outline: 2px solid var(--mk-pc-gold);
  outline-offset: 3px;
}

@media (hover: none) {
  .mk-product-card-view {
    display: none;
  }
}

@media (max-width: 500px) {
  .mk-product-card-body {
    padding-top: 13px;
  }

  .mk-product-card-title {
    font-size: 26px;
  }

  .mk-product-card-description {
    font-size: 10px;
  }

  .mk-product-card-add {
    font-size: 9px;
    letter-spacing: .07em;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mk-product-card * {
    transition: none !important;
    animation: none !important;
  }
}
`;
