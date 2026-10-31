
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  X,
  SlidersHorizontal,
} from "lucide-react";
import {
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  getAllProducts,
  formatPrice,
} from "../data/products.js";

// ======================================================
// MAISON KIYORA — COLLECTIONS PAGE
// The Art of Slow Perfumery
//
// Features:
// - Luxury editorial collection header
// - Real catalog integration
// - Product search
// - Product sorting
// - Responsive product grid
// - Image fallback
// - Product detail navigation
// - Accessible interactions
// - Reduced-motion support
//
// No invented product imagery or fragrance notes.
// ======================================================

const EASE = [0.22, 1, 0.36, 1];

const SORT_OPTIONS = [
  {
    value: "featured",
    label: "Featured",
  },
  {
    value: "name-asc",
    label: "Name: A to Z",
  },
  {
    value: "name-desc",
    label: "Name: Z to A",
  },
  {
    value: "price-asc",
    label: "Price: Low to High",
  },
  {
    value: "price-desc",
    label: "Price: High to Low",
  },
];

// ======================================================
// STYLES
// ======================================================

const STYLES = `
  .mk-collections {
    min-height: 100vh;
    background: #f5f0e8;
    color: #1d2940;
  }

  .mk-collections *,
  .mk-collections *::before,
  .mk-collections *::after {
    box-sizing: border-box;
  }

  .mk-collections__container {
    width: min(1380px, calc(100% - 64px));
    margin-inline: auto;
  }

  /* HERO */

  .mk-collections__hero {
    position: relative;
    overflow: hidden;
    padding: clamp(145px, 16vw, 235px) 0 95px;
    background:
      radial-gradient(
        ellipse at 82% 15%,
        rgba(182, 154, 105, 0.13),
        transparent 48%
      ),
      #eee7dd;
    border-bottom: 1px solid #d8c9b5;
  }

  .mk-collections__eyebrow {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 30px;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #92764f;
  }

  .mk-collections__eyebrow-line {
    width: 42px;
    height: 1px;
    background: #b69a69;
  }

  .mk-collections__hero-layout {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 45px;
  }

  .mk-collections__title {
    margin: 0;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(72px, 11vw, 165px);
    font-weight: 400;
    line-height: 0.8;
    letter-spacing: -0.055em;
  }

  .mk-collections__title em {
    color: #b69a69;
    font-weight: 400;
  }

  .mk-collections__hero-copy {
    max-width: 340px;
    margin: 0 0 6px;
    color: #687080;
    font-family: "Manrope", sans-serif;
    font-size: 13px;
    line-height: 2;
  }

  .mk-collections__hero-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-top: 65px;
  }

  .mk-collections__hero-caption {
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    letter-spacing: 0.18em;
    color: #967a51;
  }

  .mk-collections__hero-mark {
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 28px;
    font-style: italic;
    color: #967a51;
  }

  /* MAIN CATALOG */

  .mk-collections__catalog {
    padding: 80px 0 120px;
  }

  .mk-collections__catalog-heading {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 24px;
    margin-bottom: 35px;
  }

  .mk-collections__section-label {
    margin: 0 0 12px;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    letter-spacing: 0.22em;
    color: #967a51;
  }

  .mk-collections__section-title {
    margin: 0;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(42px, 5vw, 66px);
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.035em;
  }

  .mk-collections__count {
    font-family: "Manrope", sans-serif;
    font-size: 11px;
    color: #727783;
    letter-spacing: 0.06em;
  }

  /* TOOLBAR */

  .mk-collections__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 22px 0;
    margin-bottom: 35px;
    border-top: 1px solid #d8c9b5;
    border-bottom: 1px solid #d8c9b5;
  }

  .mk-collections__search {
    position: relative;
    width: min(100%, 360px);
  }

  .mk-collections__search-icon {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    color: #967a51;
    pointer-events: none;
  }

  .mk-collections__search-input {
    width: 100%;
    padding: 12px 34px 12px 29px;
    border: 0;
    border-bottom: 1px solid #bdb2a4;
    outline: none;
    border-radius: 0;
    background: transparent;
    color: #1d2940;
    font-family: "Manrope", sans-serif;
    font-size: 12px;
  }

  .mk-collections__search-input::placeholder {
    color: #919096;
  }

  .mk-collections__search-input:focus {
    border-bottom-color: #967a51;
  }

  .mk-collections__clear {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 25px;
    height: 25px;
    padding: 0;
    border: 0;
    background: transparent;
    color: #1d2940;
    cursor: pointer;
  }

  .mk-collections__sort {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mk-collections__sort-label {
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
    color: #967a51;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    letter-spacing: 0.12em;
  }

  .mk-collections__sort-select {
    max-width: 185px;
    padding: 10px 25px 10px 8px;
    border: 0;
    background: transparent;
    color: #1d2940;
    font-family: "Manrope", sans-serif;
    font-size: 11px;
    cursor: pointer;
  }

  .mk-collections__sort-select:focus-visible,
  .mk-collections__clear:focus-visible {
    outline: 2px solid #b69a69;
    outline-offset: 4px;
  }

  /* PRODUCT GRID */

  .mk-collections__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 50px 26px;
  }

  .mk-collections__card {
    min-width: 0;
  }

  .mk-collections__image-link {
    position: relative;
    display: block;
    overflow: hidden;
    aspect-ratio: 0.82;
    background: #eae2d7;
    text-decoration: none;
  }

  .mk-collections__image-link:focus-visible {
    outline: 2px solid #b69a69;
    outline-offset: 4px;
  }

  .mk-collections__image {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    transition: transform 700ms cubic-bezier(.22,1,.36,1);
  }

  .mk-collections__card:hover .mk-collections__image {
    transform: scale(1.045);
  }

  .mk-collections__placeholder {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    width: 100%;
    height: 100%;
    padding: 25px;
    text-align: center;
    background:
      radial-gradient(
        circle at 50% 40%,
        rgba(182,154,105,.16),
        transparent 52%
      ),
      #eae2d7;
  }

  .mk-collections__placeholder-symbol {
    color: #b69a69;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 48px;
    line-height: 1;
  }

  .mk-collections__placeholder-brand {
    color: #1d2940;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(24px, 3vw, 35px);
    letter-spacing: .12em;
  }

  .mk-collections__placeholder-caption {
    color: #967a51;
    font-family: "Manrope", sans-serif;
    font-size: 9px;
    letter-spacing: .2em;
  }

  .mk-collections__image-overlay {
    position: absolute;
    right: 18px;
    bottom: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    background: rgba(245,240,232,.95);
    color: #1d2940;
    transition:
      background 250ms ease,
      transform 250ms ease;
  }

  .mk-collections__card:hover .mk-collections__image-overlay {
    background: #b69a69;
    transform: translate(2px, -2px);
  }

  .mk-collections__card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-top: 21px;
  }

  .mk-collections__card-label {
    font-family: "Manrope", sans-serif;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: .17em;
    color: #967a51;
  }

  .mk-collections__card-size {
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    color: #81828a;
  }

  .mk-collections__card-title {
    margin: 10px 0;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(29px, 3vw, 39px);
    font-weight: 400;
    line-height: 1.08;
  }

  .mk-collections__card-title a {
    color: inherit;
    text-decoration: none;
  }

  .mk-collections__card-title a:hover {
    color: #967a51;
  }

  .mk-collections__card-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
  }

  .mk-collections__price {
    font-family: "Manrope", sans-serif;
    font-size: 13px;
    color: #1d2940;
  }

  .mk-collections__view {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-family: "Manrope", sans-serif;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: .1em;
    color: #967a51;
    text-decoration: none;
  }

  .mk-collections__view:hover {
    color: #1d2940;
  }

  /* EMPTY STATE */

  .mk-collections__empty {
    padding: 95px 25px;
    text-align: center;
    border: 1px solid #d8c9b5;
  }

  .mk-collections__empty-title {
    margin: 0 0 15px;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(40px, 6vw, 65px);
    font-weight: 400;
  }

  .mk-collections__empty-copy {
    margin: 0 0 25px;
    color: #727783;
    font-family: "Manrope", sans-serif;
    font-size: 13px;
  }

  .mk-collections__reset {
    padding: 12px 25px;
    border: 1px solid #b69a69;
    background: transparent;
    color: #1d2940;
    font-family: "Manrope", sans-serif;
    font-size: 11px;
    letter-spacing: .1em;
    cursor: pointer;
  }

  .mk-collections__reset:hover {
    background: #b69a69;
  }

  /* BOTTOM CTA */

  .mk-collections__footer {
    padding: 90px 0;
    background: #1d2940;
    color: #f5f0e8;
    text-align: center;
  }

  .mk-collections__footer-eyebrow {
    margin: 0 0 20px;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    letter-spacing: .22em;
    color: #b69a69;
  }

  .mk-collections__footer-title {
    margin: 0 0 30px;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(46px, 7vw, 85px);
    line-height: 1;
    font-weight: 400;
  }

  .mk-collections__footer-title em {
    color: #b69a69;
    font-weight: 400;
  }

  .mk-collections__footer-link {
    display: inline-flex;
    align-items: center;
    gap: 13px;
    padding-bottom: 9px;
    border-bottom: 1px solid #b69a69;
    color: #f5f0e8;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .15em;
    text-decoration: none;
  }

  .mk-collections__footer-link:hover {
    color: #b69a69;
  }

  /* RESPONSIVE */

  @media (max-width: 1000px) {
    .mk-collections__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .mk-collections__hero-layout {
      flex-direction: column;
      align-items: flex-start;
      gap: 35px;
    }
  }

  @media (max-width: 650px) {
    .mk-collections__container {
      width: calc(100% - 32px);
    }

    .mk-collections__hero {
      padding: 130px 0 60px;
    }

    .mk-collections__title {
      font-size: clamp(66px, 16vw, 110px);
    }

    .mk-collections__hero-bottom {
      margin-top: 45px;
    }

    .mk-collections__catalog {
      padding: 55px 0 80px;
    }

    .mk-collections__toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    .mk-collections__search {
      width: 100%;
    }

    .mk-collections__sort {
      justify-content: space-between;
    }

    .mk-collections__grid {
      gap: 35px 14px;
    }

    .mk-collections__card-title {
      font-size: 27px;
    }

    .mk-collections__card-meta {
      flex-wrap: wrap;
      margin-top: 14px;
    }

    .mk-collections__card-bottom {
      align-items: flex-start;
      flex-direction: column;
      gap: 8px;
    }

    .mk-collections__image-overlay {
      width: 33px;
      height: 33px;
      right: 10px;
      bottom: 10px;
    }
  }

  @media (max-width: 390px) {
    .mk-collections__grid {
      grid-template-columns: 1fr;
    }

    .mk-collections__card-title {
      font-size: 34px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .mk-collections__image,
    .mk-collections__image-overlay {
      transition: none;
    }

    .mk-collections__card:hover .mk-collections__image,
    .mk-collections__card:hover .mk-collections__image-overlay {
      transform: none;
    }
  }
`;

// ======================================================
// PRODUCT HELPERS
// ======================================================

function getProductImage(product) {
  const candidates = [
    product?.image,
    product?.imageUrl,
    product?.thumbnail,
    product?.images?.[0],
  ];

  for (const candidate of candidates) {
    if (
      typeof candidate === "string" &&
      candidate.trim()
    ) {
      return candidate;
    }

    if (
      candidate &&
      typeof candidate === "object"
    ) {
      const url =
        candidate.src ||
        candidate.url ||
        candidate.image;

      if (
        typeof url === "string" &&
        url.trim()
      ) {
        return url;
      }
    }
  }

  return null;
}

function getProductPrice(product) {
  const raw =
    product?.price ??
    product?.salePrice ??
    2950;

  const value = Number(raw);

  return Number.isFinite(value)
    ? value
    : 2950;
}

function getProductSize(product) {
  const size =
    product?.size ??
    product?.volume ??
    "55 ml";

  return typeof size === "number"
    ? `${size} ml`
    : String(size);
}

function getProductPath(product) {
  return product?.slug
    ? `/product/${product.slug}`
    : "/collections";
}

// ======================================================
// PRODUCT CARD
// ======================================================

function CollectionProductCard({
  product,
  index,
  reducedMotion,
}) {
  const [imageFailed, setImageFailed] =
    useState(false);

  const image = getProductImage(product);
  const showImage = image && !imageFailed;

  const productPath = getProductPath(product);

  return (
    <motion.article
      className="mk-collections__card"
      initial={{
        opacity: reducedMotion ? 1 : 0,
        y: reducedMotion ? 0 : 24,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.08,
      }}
      transition={{
        duration: reducedMotion ? 0 : 0.65,
        delay: reducedMotion
          ? 0
          : (index % 3) * 0.08,
        ease: EASE,
      }}
    >
      <Link
        to={productPath}
        className="mk-collections__image-link"
        aria-label={`View ${product.name}`}
      >
        {showImage ? (
          <img
            src={image}
            alt={product.name}
            className="mk-collections__image"
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="mk-collections__placeholder">
            <span
              className="mk-collections__placeholder-symbol"
              aria-hidden="true"
            >
              ✦
            </span>

            <span className="mk-collections__placeholder-brand">
              MAISON KIYORA
            </span>

            <span className="mk-collections__placeholder-caption">
              THE ART OF SLOW PERFUMERY
            </span>
          </div>
        )}

        <span
          className="mk-collections__image-overlay"
          aria-hidden="true"
        >
          <ArrowUpRight
            size={18}
            strokeWidth={1.4}
          />
        </span>
      </Link>

      <div className="mk-collections__card-meta">
        <span className="mk-collections__card-label">
          MAISON KIYORA
        </span>

        <span className="mk-collections__card-size">
          {getProductSize(product)}
        </span>
      </div>

      <h3 className="mk-collections__card-title">
        <Link to={productPath}>
          {product.name}
        </Link>
      </h3>

      <div className="mk-collections__card-bottom">
        <span className="mk-collections__price">
          {formatPrice(getProductPrice(product))}
        </span>

        <Link
          to={productPath}
          className="mk-collections__view"
        >
          VIEW FRAGRANCE

          <ArrowRight
            size={14}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </Link>
      </div>
    </motion.article>
  );
}

// ======================================================
// MAIN COLLECTIONS PAGE
// ======================================================

export default function Collections() {
  const reducedMotion = useReducedMotion();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] =
    useState("featured");

  const products = useMemo(() => {
    const result = getAllProducts();

    return Array.isArray(result) ? result : [];
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = products.filter((product) => {
      const name = String(
        product.name || ""
      ).toLowerCase();

      return name.includes(query);
    });

    switch (sortBy) {
      case "name-asc":
        result.sort((a, b) =>
          String(a.name).localeCompare(
            String(b.name)
          )
        );
        break;

      case "name-desc":
        result.sort((a, b) =>
          String(b.name).localeCompare(
            String(a.name)
          )
        );
        break;

      case "price-asc":
        result.sort(
          (a, b) =>
            getProductPrice(a) -
            getProductPrice(b)
        );
        break;

      case "price-desc":
        result.sort(
          (a, b) =>
            getProductPrice(b) -
            getProductPrice(a)
        );
        break;

      default:
        break;
    }

    return result;
  }, [products, search, sortBy]);

  return (
    <main className="mk-collections">
      <style>{STYLES}</style>

      {/* ==============================================
          COLLECTION HERO
      ============================================== */}

      <section
        className="mk-collections__hero"
        aria-labelledby="mk-collections-title"
      >
        <div className="mk-collections__container">
          <motion.div
            initial={{
              opacity: reducedMotion ? 1 : 0,
              y: reducedMotion ? 0 : 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: reducedMotion ? 0 : 0.9,
              ease: EASE,
            }}
          >
            <div className="mk-collections__eyebrow">
              <span>MAISON KIYORA</span>

              <span
                className="mk-collections__eyebrow-line"
                aria-hidden="true"
              />

              <span>THE COLLECTION</span>
            </div>

            <div className="mk-collections__hero-layout">
              <h1
                id="mk-collections-title"
                className="mk-collections__title"
              >
                Our
                <br />
                <em>Fragrances.</em>
              </h1>

              <p className="mk-collections__hero-copy">
                Seven fragrances.
                Seven expressions.
                Explore the Maison Kiyora
                collection and discover the
                one that stays with you.
              </p>
            </div>

            <div className="mk-collections__hero-bottom">
              <span className="mk-collections__hero-caption">
                THE ART OF SLOW PERFUMERY
              </span>

              <span
                className="mk-collections__hero-mark"
                aria-hidden="true"
              >
                MK
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==============================================
          PRODUCT COLLECTION
      ============================================== */}

      <section
        className="mk-collections__catalog"
        aria-labelledby="mk-collections-grid-title"
      >
        <div className="mk-collections__container">
          <div className="mk-collections__catalog-heading">
            <div>
              <p className="mk-collections__section-label">
                DISCOVER THE COLLECTION
              </p>

              <h2
                id="mk-collections-grid-title"
                className="mk-collections__section-title"
              >
                Signature Fragrances
              </h2>
            </div>

            <span
              className="mk-collections__count"
              aria-live="polite"
            >
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "FRAGRANCE"
                : "FRAGRANCES"}
            </span>
          </div>

          {/* SEARCH AND SORT */}

          <div className="mk-collections__toolbar">
            <div className="mk-collections__search">
              <Search
                size={17}
                strokeWidth={1.5}
                className="mk-collections__search-icon"
                aria-hidden="true"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search fragrances..."
                className="mk-collections__search-input"
                aria-label="Search fragrances"
              />

              {search && (
                <button
                  type="button"
                  className="mk-collections__clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X
                    size={16}
                    strokeWidth={1.5}
                  />
                </button>
              )}
            </div>

            <div className="mk-collections__sort">
              <label
                htmlFor="mk-collections-sort"
                className="mk-collections__sort-label"
              >
                <SlidersHorizontal
                  size={15}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />

                SORT BY
              </label>

              <select
                id="mk-collections-sort"
                className="mk-collections__sort-select"
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
              >
                {SORT_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PRODUCT GRID */}

          {filteredProducts.length > 0 ? (
            <div className="mk-collections__grid">
              {filteredProducts.map(
                (product, index) => (
                  <CollectionProductCard
                    key={
                      product.id ||
                      product.slug ||
                      index
                    }
                    product={product}
                    index={index}
                    reducedMotion={reducedMotion}
                  />
                )
              )}
            </div>
          ) : (
            <div className="mk-collections__empty">
              <h3 className="mk-collections__empty-title">
                No fragrances found.
              </h3>

              <p className="mk-collections__empty-copy">
                Try another search to explore
                our collection.
              </p>

              <button
                type="button"
                className="mk-collections__reset"
                onClick={() => {
                  setSearch("");
                  setSortBy("featured");
                }}
              >
                VIEW ALL FRAGRANCES
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ==============================================
          BRAND STORY CTA
      ============================================== */}

      <section
        className="mk-collections__footer"
        aria-labelledby="mk-collections-footer-title"
      >
        <div className="mk-collections__container">
          <p className="mk-collections__footer-eyebrow">
            THE WORLD OF MAISON KIYORA
          </p>

          <h2
            id="mk-collections-footer-title"
            className="mk-collections__footer-title"
          >
            Beyond the
            <br />
            <em>fragrance.</em>
          </h2>

          <Link
            to="/our-story"
            className="mk-collections__footer-link"
          >
            DISCOVER OUR STORY

            <ArrowUpRight
              size={17}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>
    </main>
  );
}
