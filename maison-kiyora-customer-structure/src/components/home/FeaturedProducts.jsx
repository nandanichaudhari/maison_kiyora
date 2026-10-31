
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  getAllProducts,
  formatPrice,
} from "../../data/products.js";

// ======================================================
// MAISON KIYORA — FEATURED PRODUCTS
// The Art of Slow Perfumery
// ======================================================
//
// Features:
// - Luxury fragrance carousel
// - Responsive horizontal scrolling
// - Touch and swipe support
// - Keyboard-accessible controls
// - Local PNG product images
// - Product details navigation
// - Image fallback handling
// - Smooth entrance animations
// - Existing product catalog integration
//
// Data source:
// src/data/products.js
//
// Images:
// public/images/products/
//
// ======================================================

const EASE = [0.22, 1, 0.36, 1];

const PRODUCT_IMAGE_BASE = "/images/products";

// ------------------------------------------------------
// IMAGE HELPERS
// ------------------------------------------------------

function getProductImage(product) {
  if (!product || typeof product !== "object") {
    return null;
  }

  const candidates = [
    ...(Array.isArray(product.images)
      ? product.images
      : product.images
        ? [product.images]
        : []),
    product.image,
    product.imageUrl,
    product.image_url,
    product.thumbnail,
    ...(Array.isArray(product.gallery)
      ? product.gallery
      : []),
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return {
        src: candidate.trim(),
        alt: `Maison Kiyora ${product.name} perfume bottle`,
      };
    }

    if (candidate && typeof candidate === "object") {
      const src =
        candidate.src ||
        candidate.url ||
        candidate.image_url ||
        candidate.imageUrl ||
        candidate.secure_url ||
        "";

      if (typeof src === "string" && src.trim()) {
        return {
          src: src.trim(),
          alt:
            candidate.alt ||
            candidate.alt_text ||
            candidate.altText ||
            `Maison Kiyora ${product.name} perfume bottle`,
        };
      }
    }
  }

  // Local PNG fallback for Maison Kiyora fragrances.
  if (product.slug) {
    return {
      src: `${PRODUCT_IMAGE_BASE}/${product.slug}.png`,
      alt: `Maison Kiyora ${product.name} 55ml perfume bottle`,
    };
  }

  return null;
}

// ------------------------------------------------------
// PRODUCT SIZE HELPER
// ------------------------------------------------------

function getProductSize(product) {
  if (!product) return "";

  if (product.sizeLabel) {
    return product.sizeLabel;
  }

  if (typeof product.size === "number") {
    return `${product.size} ${product.unit || "ml"}`;
  }

  if (typeof product.size === "string") {
    return product.size;
  }

  return "";
}

// ------------------------------------------------------
// PRODUCT PRICE HELPER
// ------------------------------------------------------

function getProductPrice(product) {
  const rawPrice = product?.price;

  if (
    rawPrice === null ||
    rawPrice === undefined ||
    rawPrice === ""
  ) {
    return null;
  }

  const numericPrice =
    typeof rawPrice === "string"
      ? Number(rawPrice.replace(/[₹,\s]/g, ""))
      : Number(rawPrice);

  if (
    !Number.isFinite(numericPrice) ||
    numericPrice < 0
  ) {
    return null;
  }

  return numericPrice;
}

// ======================================================
// FEATURED PRODUCT CARD
// ======================================================

function FeaturedProductCard({ product, index }) {
  const image = useMemo(
    () => getProductImage(product),
    [product]
  );

  const [imageFailed, setImageFailed] = useState(false);

  const productLink = product.slug
    ? `/product/${encodeURIComponent(product.slug)}`
    : "/collections";

  const productPrice = getProductPrice(product);

  const productSize = getProductSize(product);

  const formattedPrice =
    productPrice !== null
      ? formatPrice(productPrice)
      : "Price on request";

  // Reset image error state when the image changes.
  useEffect(() => {
    setImageFailed(false);
  }, [image?.src]);

  return (
    <article className="mk-home-product">
      {/* PRODUCT IMAGE */}
      <Link
        to={productLink}
        className="mk-home-product__image"
        aria-label={`Explore ${product.name}`}
      >
        {image?.src && !imageFailed ? (
          <img
            key={image.src}
            src={image.src}
            alt={image.alt}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            className="mk-home-product__placeholder"
            role="img"
            aria-label={`${product.name} image unavailable`}
          >
            <span
              className="mk-home-product__monogram"
              aria-hidden="true"
            >
              MK
            </span>

            <span className="mk-home-product__placeholder-name">
              {product.name}
            </span>
          </div>
        )}

        {/* PRODUCT INDEX */}
        <span className="mk-home-product__index">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* EXPLORE ICON */}
        <span
          className="mk-home-product__explore"
          aria-hidden="true"
        >
          <ArrowUpRight
            size={19}
            strokeWidth={1.5}
          />
        </span>
      </Link>

      {/* PRODUCT DETAILS */}
      <div className="mk-home-product__details">
        <div>
          <span className="mk-home-product__category">
            MAISON KIYORA
          </span>

          <h3>
            <Link to={productLink}>
              {product.name}
            </Link>
          </h3>
        </div>

        <div className="mk-home-product__meta">
          <span>{productSize}</span>

          <span>{formattedPrice}</span>
        </div>
      </div>
    </article>
  );
}

// ======================================================
// MAIN FEATURED PRODUCTS COMPONENT
// ======================================================

export default function FeaturedProducts({
  products: providedProducts,
  title = "Discover your",
  highlightedTitle = "signature scent.",
  eyebrow = "THE FRAGRANCES",
  sectionNumber = "02",
  showViewAll = true,
}) {
  const sliderRef = useRef(null);

  const reducedMotion = useReducedMotion();

  const [canScrollLeft, setCanScrollLeft] =
    useState(false);

  const [canScrollRight, setCanScrollRight] =
    useState(false);

  // ----------------------------------------------------
  // PRODUCT DATA
  // ----------------------------------------------------

  const products = useMemo(() => {
    if (Array.isArray(providedProducts)) {
      return providedProducts.filter(
        (product) =>
          product &&
          typeof product === "object" &&
          product.isActive !== false &&
          product.is_active !== false
      );
    }

    try {
      const catalog = getAllProducts();

      return Array.isArray(catalog)
        ? catalog.filter(
            (product) =>
              product &&
              typeof product === "object"
          )
        : [];
    } catch (error) {
      console.error(
        "Unable to load featured fragrances:",
        error
      );

      return [];
    }
  }, [providedProducts]);

  // ----------------------------------------------------
  // SCROLL STATE
  // ----------------------------------------------------

  const updateScrollState = useCallback(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    const {
      scrollLeft,
      scrollWidth,
      clientWidth,
    } = slider;

    setCanScrollLeft(scrollLeft > 2);

    setCanScrollRight(
      scrollLeft + clientWidth < scrollWidth - 2
    );
  }, []);

  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) return undefined;

    updateScrollState();

    slider.addEventListener(
      "scroll",
      updateScrollState,
      { passive: true }
    );

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateScrollState)
        : null;

    resizeObserver?.observe(slider);

    window.addEventListener(
      "resize",
      updateScrollState
    );

    return () => {
      slider.removeEventListener(
        "scroll",
        updateScrollState
      );

      resizeObserver?.disconnect();

      window.removeEventListener(
        "resize",
        updateScrollState
      );
    };
  }, [products.length, updateScrollState]);

  // ----------------------------------------------------
  // CAROUSEL NAVIGATION
  // ----------------------------------------------------

  const scrollProducts = useCallback(
    (direction) => {
      const slider = sliderRef.current;

      if (!slider) return;

      const card = slider.querySelector(
        ".mk-home-product"
      );

      const gap =
        parseFloat(
          window.getComputedStyle(slider).columnGap
        ) || 0;

      const distance = card
        ? card.getBoundingClientRect().width + gap
        : slider.clientWidth * 0.8;

      slider.scrollBy({
        left: distance * direction,
        behavior: reducedMotion
          ? "auto"
          : "smooth",
      });
    },
    [reducedMotion]
  );

  // ----------------------------------------------------
  // ANIMATION CONFIGURATION
  // ----------------------------------------------------

  const reveal = {
    initial: {
      opacity: reducedMotion ? 1 : 0,
      y: reducedMotion ? 0 : 25,
    },

    whileInView: {
      opacity: 1,
      y: 0,
    },

    viewport: {
      once: true,
      amount: 0.15,
    },

    transition: {
      duration: reducedMotion ? 0 : 0.8,
      ease: EASE,
    },
  };

  // ----------------------------------------------------
  // EMPTY STATE
  // ----------------------------------------------------

  if (products.length === 0) {
    return null;
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <section
      className="mk-home-collection"
      id="discover"
      aria-labelledby="mk-home-collection-title"
    >
      <style>{FEATURED_STYLES}</style>

      <div className="mk-container-wide">
        {/* SECTION HEADING */}
        <motion.div {...reveal}>
          <div className="mk-home-section-label">
            <span>{sectionNumber}</span>

            <span
              className="mk-home-section-label__line"
              aria-hidden="true"
            />

            <span>{eyebrow}</span>
          </div>

          <div className="mk-home-collection__heading">
            <div>
              <h2
                id="mk-home-collection-title"
                className="mk-home-collection__title"
              >
                {title}

                <br />

                <em>{highlightedTitle}</em>
              </h2>

              <p>
                Explore the Maison Kiyora fragrance collection.
              </p>
            </div>

            {/* CAROUSEL ARROWS */}
            <div
              className="mk-home-collection__actions"
              role="group"
              aria-label="Fragrance carousel controls"
            >
              <button
                type="button"
                onClick={() => scrollProducts(-1)}
                disabled={!canScrollLeft}
                aria-label="Previous fragrance"
              >
                <ChevronLeft
                  size={21}
                  strokeWidth={1.5}
                />
              </button>

              <button
                type="button"
                onClick={() => scrollProducts(1)}
                disabled={!canScrollRight}
                aria-label="Next fragrance"
              >
                <ChevronRight
                  size={21}
                  strokeWidth={1.5}
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* PRODUCT CAROUSEL */}
        <div
          ref={sliderRef}
          className="mk-home-collection__slider"
          aria-label="Maison Kiyora fragrance collection"
          role="region"
          tabIndex={0}
        >
          {products.map((product, index) => (
            <FeaturedProductCard
              key={
                product.id ??
                product.slug ??
                index
              }
              product={product}
              index={index}
            />
          ))}
        </div>

        {/* BOTTOM NAVIGATION */}
        <div className="mk-home-collection__footer">
          <span>
            {String(products.length).padStart(2, "0")}{" "}
            FRAGRANCES
          </span>

          {showViewAll && (
            <Link
              to="/collections"
              className="mk-home-text-link"
            >
              VIEW ALL FRAGRANCES

              <ArrowRight
                size={17}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

// ======================================================
// PREMIUM RESPONSIVE STYLES
// ======================================================

const FEATURED_STYLES = `
.mk-home-collection {
  padding: clamp(65px, 8vw, 120px) 0;
  background: #f5f0e8;
  color: #1d2940;
  font-family: "Manrope", sans-serif;
  overflow: hidden;
}

.mk-home-collection *,
.mk-home-collection *::before,
.mk-home-collection *::after {
  box-sizing: border-box;
}

.mk-home-collection .mk-container-wide {
  width: min(1380px, calc(100% - 48px));
  margin: 0 auto;
}

/* SECTION LABEL */

.mk-home-section-label {
  display: flex;
  align-items: center;
  gap: 14px;
  color: #9d8154;
  font-size: 10px;
  letter-spacing: .2em;
  font-weight: 700;
}

.mk-home-section-label__line {
  height: 1px;
  width: 45px;
  background: #b69a69;
}

/* HEADING */

.mk-home-collection__heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin: 22px 0 35px;
}

.mk-home-collection__title {
  margin: 0;
  font: 500 clamp(39px, 5.4vw, 76px)/.98
    "Cormorant Garamond", Georgia, serif;
  letter-spacing: -.035em;
}

.mk-home-collection__title em {
  font-weight: 400;
  color: #967b53;
}

.mk-home-collection__heading p {
  margin: 18px 0 0;
  color: #777e86;
  font-size: 12px;
  line-height: 1.8;
}

/* CAROUSEL CONTROLS */

.mk-home-collection__actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.mk-home-collection__actions button {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid #b69a69;
  background: transparent;
  color: #1d2940;
  cursor: pointer;
  transition: background .25s, color .25s;
}

.mk-home-collection__actions button:disabled {
  opacity: .35;
  cursor: not-allowed;
}

.mk-home-collection__actions button:not(:disabled):hover {
  background: #1d2940;
  color: #fff;
}

/* PRODUCT SLIDER */

.mk-home-collection__slider {
  display: flex;
  gap: 22px;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding-bottom: 12px;
  -webkit-overflow-scrolling: touch;
}

.mk-home-collection__slider::-webkit-scrollbar {
  display: none;
}

/* PRODUCT CARD */

.mk-home-product {
  flex: 0 0 calc((100% - 66px) / 4);
  min-width: 0;
  scroll-snap-align: start;
}

/* IMAGE */

.mk-home-product__image {
  display: block;
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: #e6dccc;
  color: #1d2940;
  text-decoration: none;
}

.mk-home-product__image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform .7s cubic-bezier(.2,.7,.2,1);
}

.mk-home-product__image:hover img {
  transform: scale(1.045);
}

/* IMAGE FALLBACK */

.mk-home-product__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  width: 100%;
  height: 100%;
  padding: 20px;
  text-align: center;
  background: radial-gradient(
    circle at 50% 38%,
    #f6efe4,
    #ddd0be
  );
}

.mk-home-product__monogram {
  font: 500 45px
    "Cormorant Garamond", Georgia, serif;
  color: #a68d66;
}

.mk-home-product__placeholder-name {
  font: 500 22px
    "Cormorant Garamond", Georgia, serif;
}

/* PRODUCT INDEX */

.mk-home-product__index {
  position: absolute;
  top: 14px;
  left: 15px;
  font-size: 10px;
  letter-spacing: .1em;
  color: #1d2940;
  background: rgba(245,240,232,.75);
  padding: 5px 7px;
}

/* EXPLORE BUTTON */

.mk-home-product__explore {
  position: absolute;
  right: 13px;
  bottom: 13px;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f5f0e8;
  color: #1d2940;
  transition: background .25s, transform .25s;
}

.mk-home-product__image:hover .mk-home-product__explore {
  background: #fff;
  transform: translate(2px, -2px);
}

/* PRODUCT DETAILS */

.mk-home-product__details {
  padding: 17px 2px 5px;
}

.mk-home-product__category {
  font-size: 9px;
  letter-spacing: .18em;
  color: #a0865e;
}

.mk-home-product__details h3 {
  margin: 8px 0 12px;
  font: 500 27px/1.05
    "Cormorant Garamond", Georgia, serif;
}

.mk-home-product__details h3 a {
  color: inherit;
  text-decoration: none;
  transition: color .2s;
}

.mk-home-product__details h3 a:hover {
  color: #967b53;
}

/* PRODUCT META */

.mk-home-product__meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #626b77;
  font-size: 11px;
}

/* FOOTER */

.mk-home-collection__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  margin-top: 27px;
  font-size: 10px;
  letter-spacing: .13em;
}

.mk-home-text-link {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: #1d2940;
  text-decoration: none;
  font-weight: 700;
  transition: color .2s;
}

.mk-home-text-link:hover {
  color: #967b53;
}

/* FOCUS STATES */

.mk-home-collection button:focus-visible,
.mk-home-collection a:focus-visible,
.mk-home-collection__slider:focus-visible {
  outline: 2px solid #b69a69;
  outline-offset: 3px;
}

/* TABLET */

@media (max-width: 1050px) {
  .mk-home-product {
    flex-basis: calc((100% - 44px) / 3);
  }
}

@media (max-width: 750px) {
  .mk-home-product {
    flex-basis: calc((100% - 22px) / 2);
  }

  .mk-home-collection__heading {
    align-items: flex-end;
  }
}

/* MOBILE */

@media (max-width: 500px) {
  .mk-home-collection .mk-container-wide {
    width: calc(100% - 32px);
  }

  .mk-home-product {
    flex-basis: 78%;
  }

  .mk-home-collection__heading {
    align-items: flex-start;
  }

  .mk-home-collection__actions {
    padding-top: 12px;
  }

  .mk-home-collection__actions button {
    width: 34px;
    height: 34px;
  }

  .mk-home-collection__title {
    font-size: clamp(38px, 10vw, 54px);
  }

  .mk-home-product__details h3 {
    font-size: 27px;
  }
}

/* REDUCED MOTION */

@media (prefers-reduced-motion: reduce) {
  .mk-home-product__image img,
  .mk-home-product__explore,
  .mk-home-collection__actions button {
    transition: none !important;
  }
}
`;
