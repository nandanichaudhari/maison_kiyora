
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Heart,
  Search as SearchIcon,
  SlidersHorizontal,
  ShoppingBag,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import * as productData from "../data/products.js";
import useCart from "../hooks/useCart.js";
import useWishlist from "../hooks/useWishlist.js";

// ======================================================
// MAISON KIYORA
// SEARCH & FRAGRANCE DISCOVERY
// ======================================================

const formatPrice = (price) => {
  const amount = Number(price);

  if (!Number.isFinite(amount)) return "";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const normalizeText = (value) =>
  String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

const getProductSource = () => {
  const candidates = [
    productData.products,
    productData.PRODUCTS,
    productData.allProducts,
    productData.productCatalog,
    productData.default,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }

    if (
      candidate &&
      typeof candidate === "object" &&
      Array.isArray(candidate.products)
    ) {
      return candidate.products;
    }
  }

  return [];
};

const getProductImage = (product) => {
  const directImage =
    product.image ||
    product.imageUrl ||
    product.thumbnail ||
    product.featuredImage ||
    product.coverImage;

  if (typeof directImage === "string") {
    return directImage;
  }

  if (directImage?.src) {
    return directImage.src;
  }

  const images =
    product.images ||
    product.gallery ||
    product.productImages ||
    [];

  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];

    if (typeof first === "string") return first;

    return first?.src || first?.url || first?.image || "";
  }

  return "";
};

const getProductPrice = (product) => {
  const value =
    product.price ??
    product.salePrice ??
    product.sellingPrice ??
    product.variants?.[0]?.price;

  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[₹,\s]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const getProductCategory = (product) => {
  const category =
    product.collection ||
    product.category ||
    product.family ||
    product.fragranceFamily ||
    "";

  if (typeof category === "string") {
    return category.trim();
  }

  return category?.name || category?.title || "";
};

const getProductName = (product) =>
  product.name || product.title || "Maison Kiyora Fragrance";

const getProductSlug = (product) =>
  product.slug || product.handle || product.id || "";

const getProductSearchText = (product) => {
  const notes = product.notes || product.fragranceNotes;

  const notesText = Array.isArray(notes)
    ? notes
        .map((note) =>
          typeof note === "string"
            ? note
            : note?.name || note?.title || ""
        )
        .join(" ")
    : typeof notes === "string"
      ? notes
      : "";

  return normalizeText(
    [
      getProductName(product),
      product.description,
      product.shortDescription,
      getProductCategory(product),
      notesText,
    ].join(" ")
  );
};

const getStockStatus = (product) => {
  if (
    product.inStock === false ||
    product.available === false ||
    product.isAvailable === false ||
    product.stockStatus === "out_of_stock" ||
    product.stockStatus === "out-of-stock"
  ) {
    return false;
  }

  if (
    typeof product.stock === "number" &&
    product.stock <= 0
  ) {
    return false;
  }

  return true;
};

const getProductId = (product) =>
  product.id ?? product.slug ?? product.handle;

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    addToCart,
    isInCart,
  } = useCart();

  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  const queryFromUrl = searchParams.get("q") || "";

  const [searchInput, setSearchInput] =
    useState(queryFromUrl);

  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [sortBy, setSortBy] = useState("featured");

  const [showFilters, setShowFilters] = useState(false);

  const [imageErrors, setImageErrors] = useState({});

  const products = useMemo(() => {
    return getProductSource().filter(
      (product) =>
        product &&
        typeof product === "object" &&
        getProductSlug(product)
    );
  }, []);

  useEffect(() => {
    document.title = queryFromUrl
      ? `Search: ${queryFromUrl} | Maison Kiyora`
      : "Discover Fragrances | Maison Kiyora";
  }, [queryFromUrl]);

  useEffect(() => {
    setSearchInput(queryFromUrl);
  }, [queryFromUrl]);

  const categories = useMemo(() => {
    const values = products
      .map(getProductCategory)
      .filter(Boolean);

    return [
      "all",
      ...Array.from(new Set(values)).sort((a, b) =>
        a.localeCompare(b)
      ),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = normalizeText(queryFromUrl);

    let result = products.filter((product) => {
      const matchesQuery =
        !query || getProductSearchText(product).includes(query);

      const matchesCategory =
        selectedCategory === "all" ||
        getProductCategory(product) === selectedCategory;

      return matchesQuery && matchesCategory;
    });

    result = [...result];

    switch (sortBy) {
      case "name-asc":
        result.sort((a, b) =>
          getProductName(a).localeCompare(getProductName(b))
        );
        break;

      case "name-desc":
        result.sort((a, b) =>
          getProductName(b).localeCompare(getProductName(a))
        );
        break;

      case "price-asc":
        result.sort((a, b) => {
          const aPrice = getProductPrice(a);
          const bPrice = getProductPrice(b);

          return (aPrice ?? Infinity) - (bPrice ?? Infinity);
        });
        break;

      case "price-desc":
        result.sort((a, b) => {
          const aPrice = getProductPrice(a);
          const bPrice = getProductPrice(b);

          return (bPrice ?? -Infinity) - (aPrice ?? -Infinity);
        });
        break;

      default:
        break;
    }

    return result;
  }, [products, queryFromUrl, selectedCategory, sortBy]);

  const updateSearch = (value) => {
    const nextQuery = value.trim();

    setSearchParams(
      nextQuery ? { q: nextQuery } : {},
      { replace: false }
    );

    setSelectedCategory("all");
  };

  const handleSearch = (event) => {
    event.preventDefault();
    updateSearch(searchInput);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSelectedCategory("all");
    setSortBy("featured");
    setSearchParams({}, { replace: false });
  };

  const handleAddToCart = (product) => {
    if (!getStockStatus(product)) {
      toast.info("This fragrance is currently unavailable.");
      return;
    }

    try {
      const result = addToCart(product, 1);

      if (result === false) {
        toast.error("Unable to add this fragrance to your bag.");
        return;
      }

      toast.success("Added to your shopping bag.");
    } catch (error) {
      toast.error(
        error?.message ||
          "Unable to add this fragrance to your bag."
      );
    }
  };

  const handleWishlist = (product) => {
    try {
      const wasSaved = isInWishlist(getProductId(product));

      toggleWishlist(product);

      toast.success(
        wasSaved
          ? "Removed from your wishlist."
          : "Saved to your wishlist."
      );
    } catch (error) {
      toast.error(
        error?.message || "Unable to update your wishlist."
      );
    }
  };

  const renderProduct = (product, index) => {
    const id = getProductId(product);
    const slug = getProductSlug(product);
    const name = getProductName(product);
    const image = getProductImage(product);
    const price = getProductPrice(product);
    const category = getProductCategory(product);
    const inStock = getStockStatus(product);

    const saved = isInWishlist(id);
    const inCart = isInCart(id);

    return (
      <motion.article
        key={String(id)}
        className="mk-search-product"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.35,
          delay: Math.min(index * 0.04, 0.3),
        }}
      >
        <div className="mk-search-product-image">
          <Link
            to={`/product/${encodeURIComponent(slug)}`}
            aria-label={`View ${name}`}
          >
            {image && !imageErrors[id] ? (
              <img
                src={image}
                alt={name}
                loading="lazy"
                onError={() =>
                  setImageErrors((previous) => ({
                    ...previous,
                    [id]: true,
                  }))
                }
              />
            ) : (
              <div className="mk-search-image-fallback">
                <span>MAISON KIYORA</span>
                <span>THE ART OF SLOW PERFUMERY</span>
              </div>
            )}
          </Link>

          <button
            type="button"
            className={`mk-search-wishlist ${
              saved ? "is-active" : ""
            }`}
            onClick={() => handleWishlist(product)}
            aria-label={
              saved
                ? `Remove ${name} from wishlist`
                : `Save ${name} to wishlist`
            }
            aria-pressed={saved}
          >
            <Heart
              size={18}
              strokeWidth={1.6}
              fill={saved ? "currentColor" : "none"}
            />
          </button>

          {!inStock && (
            <span className="mk-search-stock-label">
              UNAVAILABLE
            </span>
          )}
        </div>

        <div className="mk-search-product-info">
          <span className="mk-search-product-category">
            {category || "MAISON KIYORA"}
          </span>

          <Link
            to={`/product/${encodeURIComponent(slug)}`}
            className="mk-search-product-name"
          >
            {name}
          </Link>

          {product.size && (
            <span className="mk-search-product-size">
              {product.size}
            </span>
          )}

          <div className="mk-search-product-bottom">
            <span className="mk-search-price">
              {price === null
                ? "Price on request"
                : formatPrice(price)}
            </span>

            <button
              type="button"
              className="mk-search-add"
              disabled={!inStock}
              onClick={() => handleAddToCart(product)}
              aria-label={`Add ${name} to bag`}
              title={
                inStock
                  ? "Add to bag"
                  : "Currently unavailable"
              }
            >
              <ShoppingBag
                size={18}
                strokeWidth={1.5}
              />
            </button>
          </div>

          {inCart && (
            <span className="mk-search-in-bag">
              In your shopping bag
            </span>
          )}
        </div>
      </motion.article>
    );
  };

  return (
    <main className="mk-search-page">
      <style>{styles}</style>

      {/* PAGE HERO */}
      <section className="mk-search-hero">
        <div className="mk-search-hero-inner">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mk-search-eyebrow">
              MAISON KIYORA / DISCOVER
            </span>

            <h1>
              Find your <em>signature.</em>
            </h1>

            <p>
              A fragrance for every feeling, every memory,
              every moment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SEARCH BAR */}
      <section className="mk-search-main">
        <div className="mk-search-container">
          <form
            className="mk-search-form"
            onSubmit={handleSearch}
            role="search"
          >
            <SearchIcon
              size={21}
              strokeWidth={1.5}
              aria-hidden="true"
            />

            <input
              type="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              placeholder="Search fragrances..."
              aria-label="Search fragrances"
            />

            {searchInput && (
              <button
                type="button"
                className="mk-search-clear-input"
                onClick={() => setSearchInput("")}
                aria-label="Clear search input"
              >
                <X size={18} />
              </button>
            )}

            <button
              type="submit"
              className="mk-search-submit"
            >
              <span>SEARCH</span>
              <ArrowRight size={17} />
            </button>
          </form>

          {/* TOOLBAR */}
          <div className="mk-search-toolbar">
            <div className="mk-search-results-info">
              <span>
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "FRAGRANCE"
                  : "FRAGRANCES"}
              </span>

              {queryFromUrl && (
                <p>
                  Results for{" "}
                  <strong>“{queryFromUrl}”</strong>
                </p>
              )}
            </div>

            <div className="mk-search-toolbar-actions">
              <button
                type="button"
                className="mk-search-filter-toggle"
                onClick={() =>
                  setShowFilters((value) => !value)
                }
                aria-expanded={showFilters}
              >
                <SlidersHorizontal size={16} />
                FILTERS
              </button>

              <label className="mk-search-sort">
                <span>SORT BY</span>

                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value)
                  }
                >
                  {sortOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* FILTERS */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="mk-search-filters"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mk-search-filter-heading">
                  <span>REFINE YOUR DISCOVERY</span>

                  <button
                    type="button"
                    onClick={() =>
                      setShowFilters(false)
                    }
                    aria-label="Close filters"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mk-search-category-list">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={
                        selectedCategory === category
                          ? "is-selected"
                          : ""
                      }
                      onClick={() =>
                        setSelectedCategory(category)
                      }
                      aria-pressed={
                        selectedCategory === category
                      }
                    >
                      {category === "all"
                        ? "All Fragrances"
                        : category}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* PRODUCTS / EMPTY STATE */}
          {filteredProducts.length > 0 ? (
            <div className="mk-search-grid">
              {filteredProducts.map(renderProduct)}
            </div>
          ) : (
            <div className="mk-search-empty">
              <div className="mk-search-empty-icon">
                <SearchIcon
                  size={29}
                  strokeWidth={1.2}
                />
              </div>

              <span className="mk-search-eyebrow">
                YOUR DISCOVERY
              </span>

              <h2>
                No fragrances <em>found.</em>
              </h2>

              <p>
                {products.length === 0
                  ? "Our fragrance collection is not available right now."
                  : "Try a different fragrance name or explore our full collection."}
              </p>

              <button
                type="button"
                className="mk-search-reset-button"
                onClick={clearSearch}
              >
                CLEAR SEARCH
                <ArrowRight size={17} />
              </button>

              <Link
                to="/collections"
                className="mk-search-explore-link"
              >
                Explore the Collection
              </Link>
            </div>
          )}

          {/* BOTTOM MESSAGE */}
          {filteredProducts.length > 0 && (
            <div className="mk-search-bottom">
              <span>MAISON KIYORA</span>
              <p>The Art of Slow Perfumery</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

const styles = `
  .mk-search-page {
    --mk-ivory: #F5F0E8;
    --mk-navy: #1D2940;
    --mk-gold: #B69A69;
    --mk-sand: #D8C9B5;

    min-height: 100vh;
    background: var(--mk-ivory);
    color: var(--mk-navy);
    font-family: "Manrope", sans-serif;
  }

  .mk-search-page *,
  .mk-search-page *::before,
  .mk-search-page *::after {
    box-sizing: border-box;
  }

  .mk-search-hero {
    position: relative;
    overflow: hidden;
    padding: 155px 24px 85px;
    background:
      radial-gradient(
        ellipse at 75% 40%,
        rgba(182,154,105,.14),
        transparent 50%
      ),
      #eee7dc;
    text-align: center;
  }

  .mk-search-hero::after {
    content: "";
    position: absolute;
    top: 40%;
    left: 50%;
    width: min(500px, 85vw);
    aspect-ratio: 1;
    border: 1px solid rgba(182,154,105,.14);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .mk-search-hero-inner {
    position: relative;
    z-index: 1;
    max-width: 900px;
    margin: 0 auto;
  }

  .mk-search-eyebrow {
    display: block;
    color: #9a8058;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .24em;
  }

  .mk-search-hero h1 {
    margin: 24px 0 18px;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(62px, 9vw, 120px);
    font-weight: 400;
    line-height: .95;
    letter-spacing: -.055em;
  }

  .mk-search-hero h1 em {
    color: var(--mk-gold);
    font-weight: 300;
  }

  .mk-search-hero p {
    margin: 0;
    color: #74757a;
    font-size: 12px;
    line-height: 2;
  }

  .mk-search-main {
    padding: 65px 24px 110px;
  }

  .mk-search-container {
    max-width: 1320px;
    margin: 0 auto;
  }

  .mk-search-form {
    display: flex;
    align-items: center;
    gap: 15px;
    min-height: 67px;
    padding: 7px 8px 7px 22px;
    border: 1px solid #d9cfc0;
    background: rgba(255,255,255,.65);
    transition: border-color .2s, box-shadow .2s;
  }

  .mk-search-form:focus-within {
    border-color: var(--mk-gold);
    box-shadow: 0 0 0 3px rgba(182,154,105,.08);
  }

  .mk-search-form > svg {
    flex-shrink: 0;
    color: #a18b6a;
  }

  .mk-search-form input {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--mk-navy);
    font: inherit;
    font-size: 13px;
  }

  .mk-search-form input::placeholder {
    color: #a49d94;
  }

  .mk-search-clear-input {
    display: grid;
    place-items: center;
    width: 30px;
    height: 35px;
    border: 0;
    background: transparent;
    color: #8a8175;
    cursor: pointer;
  }

  .mk-search-submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 25px;
    align-self: stretch;
    min-width: 145px;
    padding: 0 20px;
    border: 0;
    background: var(--mk-navy);
    color: white;
    font: inherit;
    font-size: 10px;
    font-weight: 650;
    letter-spacing: .14em;
    cursor: pointer;
    transition: background .2s;
  }

  .mk-search-submit:hover {
    background: #33425a;
  }

  .mk-search-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin: 40px 0 25px;
    padding-bottom: 22px;
    border-bottom: 1px solid #dfd6ca;
  }

  .mk-search-results-info > span {
    font-size: 10px;
    font-weight: 650;
    letter-spacing: .16em;
  }

  .mk-search-results-info p {
    margin: 9px 0 0;
    color: #77777a;
    font-size: 11px;
  }

  .mk-search-results-info strong {
    color: var(--mk-navy);
    font-weight: 600;
  }

  .mk-search-toolbar-actions {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .mk-search-filter-toggle {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 10px 0;
    border: 0;
    background: transparent;
    color: var(--mk-navy);
    font: inherit;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .1em;
    cursor: pointer;
  }

  .mk-search-sort {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .mk-search-sort > span {
    color: #9b8b78;
    font-size: 9px;
    font-weight: 650;
    letter-spacing: .1em;
  }

  .mk-search-sort select {
    max-width: 190px;
    padding: 9px 10px;
    border: 1px solid #dfd6ca;
    outline-color: var(--mk-gold);
    background: transparent;
    color: var(--mk-navy);
    font: inherit;
    font-size: 11px;
    cursor: pointer;
  }

  .mk-search-filters {
    overflow: hidden;
    margin-bottom: 32px;
    border-bottom: 1px solid #dfd6ca;
  }

  .mk-search-filter-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0 20px;
  }

  .mk-search-filter-heading > span {
    color: #9b8b78;
    font-size: 10px;
    font-weight: 650;
    letter-spacing: .15em;
  }

  .mk-search-filter-heading button {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border: 0;
    background: transparent;
    color: var(--mk-navy);
    cursor: pointer;
  }

  .mk-search-category-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding-bottom: 28px;
  }

  .mk-search-category-list button {
    padding: 11px 17px;
    border: 1px solid #d9cfc0;
    background: transparent;
    color: #77777a;
    font: inherit;
    font-size: 11px;
    cursor: pointer;
    transition: all .2s;
  }

  .mk-search-category-list button:hover,
  .mk-search-category-list button.is-selected {
    border-color: var(--mk-navy);
    background: var(--mk-navy);
    color: white;
  }

  .mk-search-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 38px 20px;
  }

  .mk-search-product {
    min-width: 0;
  }

  .mk-search-product-image {
    position: relative;
    overflow: hidden;
    aspect-ratio: 4 / 5;
    background: #eae2d7;
  }

  .mk-search-product-image > a {
    display: block;
    width: 100%;
    height: 100%;
  }

  .mk-search-product-image img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform .65s ease;
  }

  .mk-search-product:hover .mk-search-product-image img {
    transform: scale(1.055);
  }

  .mk-search-image-fallback {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    height: 100%;
    background:
      radial-gradient(
        circle at center,
        rgba(182,154,105,.13),
        transparent 60%
      ),
      #e8ded1;
    text-align: center;
  }

  .mk-search-image-fallback span:first-child {
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 24px;
    letter-spacing: .13em;
  }

  .mk-search-image-fallback span:last-child {
    color: #9a8058;
    font-size: 8px;
    letter-spacing: .17em;
  }

  .mk-search-wishlist {
    position: absolute;
    top: 13px;
    right: 13px;
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border: 1px solid rgba(255,255,255,.8);
    border-radius: 50%;
    background: rgba(245,240,232,.93);
    color: var(--mk-navy);
    cursor: pointer;
    transition: all .2s;
  }

  .mk-search-wishlist:hover,
  .mk-search-wishlist.is-active {
    color: #a65c5c;
  }

  .mk-search-stock-label {
    position: absolute;
    bottom: 12px;
    left: 12px;
    padding: 9px 12px;
    background: rgba(29,41,64,.9);
    color: white;
    font-size: 9px;
    letter-spacing: .12em;
  }

  .mk-search-product-info {
    padding: 18px 2px 0;
  }

  .mk-search-product-category {
    display: block;
    margin-bottom: 9px;
    color: #a18b6a;
    font-size: 9px;
    font-weight: 650;
    letter-spacing: .15em;
    text-transform: uppercase;
  }

  .mk-search-product-name {
    display: block;
    color: var(--mk-navy);
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(23px, 2.3vw, 32px);
    font-weight: 500;
    line-height: 1.15;
    text-decoration: none;
  }

  .mk-search-product-name:hover {
    color: #95794f;
  }

  .mk-search-product-size {
    display: block;
    margin-top: 8px;
    color: #88847f;
    font-size: 10px;
  }

  .mk-search-product-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid #e0d7ca;
  }

  .mk-search-price {
    font-size: 12px;
    font-weight: 650;
  }

  .mk-search-add {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border: 1px solid #c9bba7;
    background: transparent;
    color: var(--mk-navy);
    cursor: pointer;
    transition: all .2s;
  }

  .mk-search-add:hover:not(:disabled) {
    border-color: var(--mk-navy);
    background: var(--mk-navy);
    color: white;
  }

  .mk-search-add:disabled {
    opacity: .4;
    cursor: not-allowed;
  }

  .mk-search-in-bag {
    display: block;
    margin-top: 9px;
    color: #607b63;
    font-size: 10px;
  }

  .mk-search-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 95px 20px;
    text-align: center;
  }

  .mk-search-empty-icon {
    display: grid;
    place-items: center;
    width: 72px;
    height: 72px;
    margin-bottom: 25px;
    border: 1px solid #d8c9b5;
    border-radius: 50%;
    color: #a18b6a;
  }

  .mk-search-empty h2 {
    margin: 20px 0;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(49px, 7vw, 75px);
    font-weight: 400;
    line-height: 1;
  }

  .mk-search-empty h2 em {
    color: var(--mk-gold);
  }

  .mk-search-empty p {
    max-width: 400px;
    margin: 0 0 30px;
    color: #78777a;
    font-size: 12px;
    line-height: 1.9;
  }

  .mk-search-reset-button {
    display: inline-flex;
    align-items: center;
    gap: 25px;
    min-height: 50px;
    padding: 0 23px;
    border: 1px solid var(--mk-navy);
    background: var(--mk-navy);
    color: white;
    font: inherit;
    font-size: 10px;
    letter-spacing: .1em;
    cursor: pointer;
  }

  .mk-search-explore-link {
    margin-top: 23px;
    color: #95794f;
    font-size: 11px;
    text-decoration: underline;
    text-underline-offset: 5px;
  }

  .mk-search-bottom {
    margin-top: 100px;
    padding-top: 40px;
    border-top: 1px solid #dfd6ca;
    text-align: center;
  }

  .mk-search-bottom span {
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 23px;
    letter-spacing: .16em;
  }

  .mk-search-bottom p {
    color: #9a8058;
    font-size: 10px;
    letter-spacing: .12em;
  }

  @media (max-width: 1050px) {
    .mk-search-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 760px) {
    .mk-search-hero {
      padding: 120px 20px 65px;
    }

    .mk-search-main {
      padding: 40px 18px 80px;
    }

    .mk-search-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 30px 14px;
    }

    .mk-search-toolbar {
      align-items: flex-start;
      flex-direction: column;
      gap: 18px;
    }

    .mk-search-toolbar-actions {
      justify-content: space-between;
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .mk-search-hero h1 {
      font-size: 59px;
    }

    .mk-search-form {
      min-height: 58px;
      gap: 10px;
      padding: 5px 5px 5px 13px;
    }

    .mk-search-form input {
      font-size: 12px;
    }

    .mk-search-submit {
      min-width: 52px;
      padding: 0 14px;
    }

    .mk-search-submit span {
      display: none;
    }

    .mk-search-grid {
      gap: 28px 11px;
    }

    .mk-search-product-name {
      font-size: 23px;
    }

    .mk-search-product-info {
      padding-top: 13px;
    }

    .mk-search-product-bottom {
      margin-top: 13px;
    }

    .mk-search-price {
      font-size: 11px;
    }

    .mk-search-add {
      width: 34px;
      height: 34px;
    }

    .mk-search-wishlist {
      top: 8px;
      right: 8px;
      width: 33px;
      height: 33px;
    }

    .mk-search-sort {
      gap: 6px;
    }

    .mk-search-sort select {
      max-width: 155px;
      font-size: 10px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .mk-search-page *,
    .mk-search-page *::before,
    .mk-search-page *::after {
      animation-duration: .01ms !important;
      transition-duration: .01ms !important;
    }
  }
`;
