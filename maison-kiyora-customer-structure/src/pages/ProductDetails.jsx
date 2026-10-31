
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Check,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  getAllProducts,
  formatPrice,
} from "../data/products.js";

import ProductGallery from "../components/product/ProductGallery.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";

// ======================================================
// MAISON KIYORA — PRODUCT DETAILS
// Ivory × Espresso × Champagne Gold
// ======================================================

const EASE = [0.22, 1, 0.36, 1];
const MAX_QUANTITY = 10;

function getProductPrice(product) {
  const value =
    product?.price ??
    product?.salePrice ??
    product?.sale_price;

  if (value == null || value === "") return null;

  const price = Number(value);
  return Number.isFinite(price) ? price : null;
}

function getProductSize(product) {
  if (product?.sizeLabel) return product.sizeLabel;

  const size = product?.size ?? product?.volume;

  if (typeof size === "number") {
    return `${size} ${product?.unit || "ml"}`;
  }

  return size ? String(size) : "55 ml";
}

function normalizeNotes(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "string"
          ? item
          : item?.name || item?.label || ""
      )
      .filter(Boolean)
      .join(", ");
  }

  return typeof value === "string" ? value : "";
}

function getFragranceNotes(product) {
  const notes = product?.notes || {};

  return [
    {
      label: "TOP",
      value: normalizeNotes(
        notes.top || product?.topNotes
      ),
    },
    {
      label: "HEART",
      value: normalizeNotes(
        notes.heart ||
          notes.middle ||
          product?.heartNotes
      ),
    },
    {
      label: "BASE",
      value: normalizeNotes(
        notes.base || product?.baseNotes
      ),
    },
  ].filter((item) => item.value);
}

function getProductImage(product) {
  const candidates = [
    ...(Array.isArray(product?.images)
      ? product.images
      : []),
    product?.image,
    product?.imageUrl,
    product?.image_url,
    product?.thumbnail,
  ];

  for (const item of candidates) {
    const src =
      typeof item === "string"
        ? item
        : item?.src ||
          item?.url ||
          item?.image_url ||
          item?.imageUrl;

    if (typeof src === "string" && src.trim()) {
      return src.trim();
    }
  }

  return product?.slug
    ? `/images/products/${product.slug}.png`
    : "";
}

// ======================================================
// ACCORDION
// ======================================================

function ProductAccordion({
  title,
  children,
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mk-product__accordion">
      <button
        type="button"
        className="mk-product__accordion-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronDown size={17} strokeWidth={1.5} />
      </button>

      {open && (
        <div className="mk-product__accordion-content">
          {children}
        </div>
      )}
    </div>
  );
}

// ======================================================
// RELATED PRODUCT
// ======================================================

function RelatedProductCard({ product }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = getProductImage(product);
  const href = `/product/${encodeURIComponent(
    product.slug
  )}`;

  useEffect(() => {
    setImageFailed(false);
  }, [image]);

  return (
    <article className="mk-product__related-card">
      <Link
        to={href}
        className="mk-product__related-image"
        aria-label={`View ${product.name}`}
      >
        {image && !imageFailed ? (
          <img
            src={image}
            alt={`${product.name} perfume`}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="mk-product__related-placeholder">
            MK
          </span>
        )}

        <span className="mk-product__related-discover">
          DISCOVER <ArrowUpRight size={15} />
        </span>
      </Link>

      <span className="mk-product__related-brand">
        MAISON KIYORA
      </span>

      <h3 className="mk-product__related-name">
        <Link to={href}>{product.name}</Link>
      </h3>

      <div className="mk-product__related-meta">
        <span>{getProductSize(product)}</span>
        <span>
          {getProductPrice(product) !== null
            ? formatPrice(getProductPrice(product))
            : "Price on request"}
        </span>
      </div>
    </article>
  );
}

// ======================================================
// MAIN PAGE
// ======================================================

export default function ProductDetails({
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}) {
  const { slug } = useParams();
  const reducedMotion = useReducedMotion();

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState("");
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const products = useMemo(() => {
    const result = getAllProducts();
    return Array.isArray(result) ? result : [];
  }, []);

  const product = useMemo(
    () =>
      products.find(
        (item) =>
          item.slug === slug ||
          String(item.id) === slug
      ),
    [products, slug]
  );

  const relatedProducts = useMemo(
    () =>
      products
        .filter(
          (item) =>
            item.slug !== product?.slug &&
            item.isActive !== false
        )
        .slice(0, 3),
    [products, product?.slug]
  );

  const currentIsWishlisted = product
    ? typeof onToggleWishlist === "function"
      ? Boolean(isWishlisted)
      : Boolean(isInWishlist?.(product.id))
    : false;

  const cartAction =
    typeof onAddToCart === "function"
      ? onAddToCart
      : addToCart;

  const wishlistAction =
    typeof onToggleWishlist === "function"
      ? onToggleWishlist
      : toggleWishlist;

  const stock = product?.stockQuantity;

  const unavailable =
    product?.isActive === false ||
    product?.available === false ||
    (stock != null && Number(stock) <= 0);

  const canAddToCart =
    Boolean(product) &&
    !unavailable &&
    typeof cartAction === "function";

  const canWishlist =
    Boolean(product) &&
    typeof wishlistAction === "function";

  useEffect(() => {
    setQuantity(1);
    setNotice("");
    setAdding(false);
    setAdded(false);
    window.scrollTo?.(0, 0);
  }, [slug]);

  async function handleAddToCart() {
    if (!canAddToCart || adding) return;

    setAdding(true);
    setNotice("");

    try {
      const result = await Promise.resolve(
        cartAction(product, quantity)
      );

      if (
        result === false ||
        result?.success === false
      ) {
        throw new Error(
          result?.message || "Unable to add to bag."
        );
      }

      setAdded(true);
      setNotice(
        `${quantity} × ${product.name} added to your bag.`
      );

      toast.success(`${product.name} added to your bag.`);
    } catch (error) {
      const message =
        error?.message ||
        "Unable to add this fragrance. Please try again.";

      setNotice(message);
      toast.error(message);
    } finally {
      setAdding(false);
    }
  }

  async function handleWishlist() {
    if (!canWishlist) return;

    try {
      await Promise.resolve(wishlistAction(product));
      setNotice("");
    } catch (error) {
      const message =
        error?.message || "Unable to update wishlist.";

      setNotice(message);
      toast.error(message);
    }
  }

  // ====================================================
  // NOT FOUND
  // ====================================================

  if (!product) {
    return (
      <main className="mk-product">
        <style>{STYLES}</style>

        <div className="mk-product__not-found">
          <span className="mk-product__eyebrow">
            MAISON KIYORA
          </span>

          <h1>Fragrance not found.</h1>

          <p>
            This fragrance is not available in the
            current collection.
          </p>

          <Link
            to="/collections"
            className="mk-product__related-link"
          >
            <ArrowLeft size={17} />
            BACK TO COLLECTION
          </Link>
        </div>
      </main>
    );
  }

  const size = getProductSize(product);
  const price = getProductPrice(product);
  const fragranceNotes = getFragranceNotes(product);

  const description =
    product.description?.trim() ||
    product.shortDescription?.trim() ||
    "Discover this fragrance from the Maison Kiyora Signature Collection.";

  // ====================================================
  // PAGE RENDER
  // ====================================================

  return (
    <main className="mk-product">
      <style>{STYLES}</style>

      <div className="mk-product__main">
        <div className="mk-product__container">
          {/* BREADCRUMB */}

          <nav
            className="mk-product__breadcrumb"
            aria-label="Breadcrumb"
          >
            <Link to="/">HOME</Link>
            <span>/</span>
            <Link to="/collections">COLLECTION</Link>
            <span>/</span>
            <span className="mk-product__breadcrumb-current">
              {product.name}
            </span>
          </nav>

          {/* PRODUCT LAYOUT */}

          <div className="mk-product__layout">
            {/* PRODUCT GALLERY */}

            <motion.div
              className="mk-product__gallery-wrapper"
              initial={
                reducedMotion
                  ? false
                  : { opacity: 0, y: 20 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.8,
                ease: EASE,
              }}
            >
              <ProductGallery
                key={product.id || product.slug}
                product={product}
                productName={product.name}
                enableZoom
                showThumbnails
              />
            </motion.div>

            {/* PRODUCT INFORMATION */}

            <motion.div
              className="mk-product__info"
              initial={
                reducedMotion
                  ? false
                  : { opacity: 0, y: 25 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.8,
                delay: reducedMotion ? 0 : 0.1,
                ease: EASE,
              }}
            >
              <div className="mk-product__eyebrow">
                <span>MAISON KIYORA</span>
                <span className="mk-product__eyebrow-line" />
                <span>FRAGRANCE</span>
              </div>

              <h1 className="mk-product__title">
                {product.name}
              </h1>

              <p className="mk-product__subtitle">
                {size}
                {product.concentration
                  ? ` — ${product.concentration}`
                  : ""}
              </p>

              <div className="mk-product__price-row">
                <span className="mk-product__price">
                  {price !== null
                    ? formatPrice(price)
                    : "Price on request"}
                </span>

                {product.compareAtPrice > price &&
                  price !== null && (
                    <del className="mk-product__old-price">
                      {formatPrice(
                        product.compareAtPrice
                      )}
                    </del>
                  )}
              </div>

              <p className="mk-product__description">
                {description}
              </p>

              {/* SIZE */}

              <div className="mk-product__option">
                <div className="mk-product__option-heading">
                  <span>SIZE</span>
                  <span>{size}</span>
                </div>

                <span className="mk-product__size">
                  {size}
                </span>
              </div>

              {/* QUANTITY */}

              <div className="mk-product__option">
                <div className="mk-product__option-heading">
                  <span>QUANTITY</span>
                  <span>MAX {MAX_QUANTITY}</span>
                </div>

                <div className="mk-product__quantity">
                  <button
                    type="button"
                    className="mk-product__quantity-button"
                    onClick={() =>
                      setQuantity((value) =>
                        Math.max(1, value - 1)
                      )
                    }
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>

                  <span
                    className="mk-product__quantity-value"
                    aria-live="polite"
                  >
                    {quantity}
                  </span>

                  <button
                    type="button"
                    className="mk-product__quantity-button"
                    onClick={() =>
                      setQuantity((value) =>
                        Math.min(
                          MAX_QUANTITY,
                          value + 1
                        )
                      )
                    }
                    disabled={
                      quantity >= MAX_QUANTITY
                    }
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* ADD TO BAG + WISHLIST */}

              <div className="mk-product__actions">
                <button
                  type="button"
                  className="mk-product__cart-button"
                  onClick={handleAddToCart}
                  disabled={!canAddToCart || adding}
                >
                  {added ? (
                    <>
                      <Check size={18} />
                      ADDED TO BAG
                    </>
                  ) : adding ? (
                    <>
                      <ShoppingBag size={18} />
                      ADDING...
                    </>
                  ) : unavailable ? (
                    <>
                      <ShoppingBag size={18} />
                      OUT OF STOCK
                    </>
                  ) : (
                    <>
                      <ShoppingBag
                        size={18}
                        strokeWidth={1.5}
                      />
                      ADD TO BAG
                      <ArrowRight
                        size={17}
                        strokeWidth={1.5}
                      />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className={`mk-product__wishlist ${
                    currentIsWishlisted
                      ? "mk-product__wishlist--active"
                      : ""
                  }`}
                  onClick={handleWishlist}
                  disabled={!canWishlist}
                  aria-label={
                    currentIsWishlisted
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                  aria-pressed={currentIsWishlisted}
                >
                  <Heart
                    size={20}
                    strokeWidth={1.5}
                    fill={
                      currentIsWishlisted
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>
              </div>

              {notice && (
                <p
                  className="mk-product__notice"
                  role="status"
                >
                  {notice}
                </p>
              )}

              {/* ACCORDIONS */}

              <div className="mk-product__details">
                <ProductAccordion
                  title="ABOUT THE FRAGRANCE"
                  defaultOpen
                >
                  {description}
                </ProductAccordion>

                {fragranceNotes.length > 0 && (
                  <ProductAccordion title="FRAGRANCE NOTES">
                    {fragranceNotes.map((note) => (
                      <div
                        key={note.label}
                        className="mk-product__note-row"
                      >
                        <span className="mk-product__note-label">
                          {note.label}
                        </span>

                        <span>{note.value}</span>
                      </div>
                    ))}
                  </ProductAccordion>
                )}

                <ProductAccordion title="SHIPPING & RETURNS">
                  For shipping information, please
                  review our{" "}
                  <Link to="/shipping-policy">
                    Shipping Policy
                  </Link>
                  . For returns and refunds, please
                  review our{" "}
                  <Link to="/returns-refunds">
                    Returns & Refunds Policy
                  </Link>
                  .
                </ProductAccordion>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}

      {relatedProducts.length > 0 && (
        <section
          className="mk-product__related"
          aria-labelledby="mk-related-title"
        >
          <div className="mk-product__container">
            <div className="mk-product__related-heading">
              <div>
                <p className="mk-product__related-eyebrow">
                  CONTINUE EXPLORING
                </p>

                <h2
                  id="mk-related-title"
                  className="mk-product__related-title"
                >
                  You may also
                  <br />
                  <em>discover.</em>
                </h2>
              </div>

              <Link
                to="/collections"
                className="mk-product__related-link"
              >
                VIEW ALL FRAGRANCES
                <ArrowUpRight size={17} />
              </Link>
            </div>

            <div className="mk-product__related-grid">
              {relatedProducts.map((item) => (
                <RelatedProductCard
                  key={item.id || item.slug}
                  product={item}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

// ======================================================
// STYLES
// ======================================================

const STYLES = `
.mk-product {
  min-height: 100vh;
  background: #F5F0E8;
  color: #211C19;
  font-family: "Manrope", sans-serif;
}

.mk-product *,
.mk-product *::before,
.mk-product *::after {
  box-sizing: border-box;
}

.mk-product__container {
  width: min(1380px, calc(100% - 64px));
  margin-inline: auto;
}

.mk-product__main {
  padding: 145px 0 110px;
}

.mk-product__breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 38px;
  font-size: 10px;
  letter-spacing: .08em;
  color: #8c8379;
}

.mk-product__breadcrumb a {
  color: inherit;
  text-decoration: none;
}

.mk-product__breadcrumb a:hover {
  color: #B69A69;
}

.mk-product__breadcrumb-current {
  color: #211C19;
}

.mk-product__layout {
  display: grid;
  grid-template-columns:
    minmax(0, 1.12fr)
    minmax(0, .88fr);
  align-items: start;
  gap: clamp(45px, 6vw, 105px);
}

.mk-product__gallery-wrapper {
  min-width: 0;
}

.mk-product__info {
  position: sticky;
  top: 115px;
  min-width: 0;
}

.mk-product__eyebrow {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 25px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .22em;
  color: #967a51;
}

.mk-product__eyebrow-line {
  width: 35px;
  height: 1px;
  background: #B69A69;
}

.mk-product__title {
  margin: 0 0 22px;
  font-family:
    "Cormorant Garamond", Georgia, serif;
  font-size: clamp(60px, 6.5vw, 105px);
  line-height: .88;
  font-weight: 400;
  letter-spacing: -.045em;
  overflow-wrap: anywhere;
}

.mk-product__subtitle {
  margin: 0 0 26px;
  font-size: 11px;
  letter-spacing: .15em;
  color: #967a51;
}

.mk-product__price-row {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 30px;
}

.mk-product__price {
  font-family:
    "Cormorant Garamond", Georgia, serif;
  font-size: 39px;
  line-height: 1;
}

.mk-product__old-price {
  color: #9e9387;
  font-size: 14px;
}

.mk-product__description {
  max-width: 480px;
  margin: 0 0 38px;
  color: #756e68;
  font-size: 13px;
  line-height: 2;
}

.mk-product__option {
  padding: 22px 0;
  border-top: 1px solid #D8C9B5;
}

.mk-product__option-heading {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 17px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .14em;
}

.mk-product__size {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
  padding: 13px 20px;
  border: 1px solid #B69A69;
  font-size: 11px;
  color: #211C19;
}

.mk-product__quantity {
  display: inline-flex;
  align-items: center;
  border: 1px solid #cfc2b2;
}

.mk-product__quantity-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 43px;
  height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #211C19;
  cursor: pointer;
}

.mk-product__quantity-button:disabled {
  opacity: .3;
  cursor: not-allowed;
}

.mk-product__quantity-value {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  font-size: 12px;
}

.mk-product__actions {
  display: flex;
  gap: 12px;
  margin-top: 25px;
}

.mk-product__cart-button {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 13px;
  min-height: 58px;
  padding: 16px 20px;
  border: 1px solid #211C19;
  background: #211C19;
  color: #F5F0E8;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .16em;
  cursor: pointer;
  transition:
    background 250ms ease,
    color 250ms ease;
}

.mk-product__cart-button:hover:not(:disabled) {
  background: #B69A69;
  border-color: #B69A69;
  color: #211C19;
}

.mk-product__cart-button:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.mk-product__wishlist {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  min-height: 58px;
  padding: 0;
  border: 1px solid #cfc2b2;
  background: transparent;
  color: #211C19;
  cursor: pointer;
}

.mk-product__wishlist--active {
  color: #a84f57;
  border-color: #a84f57;
}

.mk-product__wishlist:disabled {
  opacity: .4;
  cursor: not-allowed;
}

.mk-product__notice {
  margin-top: 16px;
  font-size: 11px;
  line-height: 1.6;
  color: #967a51;
}

.mk-product__details {
  margin-top: 42px;
  border-top: 1px solid #D8C9B5;
}

.mk-product__accordion {
  border-bottom: 1px solid #D8C9B5;
}

.mk-product__accordion-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 23px 0;
  border: 0;
  background: transparent;
  color: #211C19;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .13em;
  cursor: pointer;
}

.mk-product__accordion-trigger svg {
  transition: transform 250ms ease;
}

.mk-product__accordion-trigger[aria-expanded="true"] svg {
  transform: rotate(180deg);
}

.mk-product__accordion-content {
  padding: 0 0 25px;
  font-size: 12px;
  line-height: 1.9;
  color: #756e68;
}

.mk-product__accordion-content a {
  color: #967a51;
}

.mk-product__note-row {
  display: grid;
  grid-template-columns: 105px 1fr;
  gap: 15px;
  padding: 10px 0;
}

.mk-product__note-label {
  color: #967a51;
  font-size: 10px;
  letter-spacing: .12em;
}

/* RELATED PRODUCTS */

.mk-product__related {
  padding: 100px 0 120px;
  background: #EEE7DD;
}

.mk-product__related-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 45px;
}

.mk-product__related-eyebrow {
  margin: 0 0 12px;
  font-size: 10px;
  letter-spacing: .22em;
  color: #967a51;
}

.mk-product__related-title {
  margin: 0;
  font-family:
    "Cormorant Garamond", Georgia, serif;
  font-size: clamp(44px, 5vw, 75px);
  line-height: 1;
  font-weight: 400;
}

.mk-product__related-title em {
  color: #B69A69;
  font-weight: 400;
}

.mk-product__related-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #B69A69;
  color: #211C19;
  text-decoration: none;
  font-size: 10px;
  letter-spacing: .13em;
}

.mk-product__related-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 25px;
}

.mk-product__related-card {
  min-width: 0;
}

.mk-product__related-image {
  display: block;
  position: relative;
  overflow: hidden;
  aspect-ratio: 3 / 4;
  background: #e2d8cb;
}

.mk-product__related-image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 600ms ease;
}

.mk-product__related-card:hover img {
  transform: scale(1.045);
}

.mk-product__related-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #B69A69;
  font-family:
    "Cormorant Garamond", Georgia, serif;
  font-size: 65px;
}

.mk-product__related-discover {
  position: absolute;
  right: 14px;
  bottom: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 11px 13px;
  background: rgba(245,240,232,.94);
  color: #211C19;
  font-size: 9px;
  letter-spacing: .1em;
}

.mk-product__related-brand {
  display: block;
  margin-top: 19px;
  font-size: 9px;
  letter-spacing: .2em;
  color: #967a51;
}

.mk-product__related-name {
  margin: 8px 0 10px;
  font-family:
    "Cormorant Garamond", Georgia, serif;
  font-size: 33px;
  font-weight: 400;
}

.mk-product__related-name a {
  color: inherit;
  text-decoration: none;
}

.mk-product__related-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #756e68;
  font-size: 11px;
}

/* NOT FOUND */

.mk-product__not-found {
  display: flex;
  min-height: 80vh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 140px 24px 80px;
  text-align: center;
}

.mk-product__not-found h1 {
  margin: 0 0 20px;
  font-family:
    "Cormorant Garamond", Georgia, serif;
  font-size: clamp(55px, 8vw, 95px);
  font-weight: 400;
}

.mk-product__not-found p {
  margin-bottom: 25px;
  font-size: 13px;
  color: #756e68;
}

.mk-product button:focus-visible,
.mk-product a:focus-visible {
  outline: 2px solid #B69A69;
  outline-offset: 3px;
}

/* TABLET */

@media (max-width: 950px) {
  .mk-product__layout {
    grid-template-columns: 1fr;
    gap: 55px;
  }

  .mk-product__info {
    position: static;
  }

  .mk-product__related-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

/* MOBILE */

@media (max-width: 650px) {
  .mk-product__container {
    width: calc(100% - 32px);
  }

  .mk-product__main {
    padding: 115px 0 75px;
  }

  .mk-product__breadcrumb {
    margin-bottom: 25px;
  }

  .mk-product__title {
    font-size: clamp(58px, 13vw, 90px);
  }

  .mk-product__related {
    padding: 75px 0;
  }

  .mk-product__related-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .mk-product__related-grid {
    gap: 18px;
  }

  .mk-product__related-name {
    font-size: 27px;
  }

  .mk-product__related-meta {
    flex-direction: column;
    gap: 5px;
  }
}

@media (max-width: 390px) {
  .mk-product__related-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mk-product__related-image img,
  .mk-product__accordion-trigger svg {
    transition: none !important;
  }
}
`;
