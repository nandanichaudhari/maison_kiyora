
/**
 * =========================================================
 * MAISON KIYORA — PRODUCT CATALOG
 * The Art of Slow Perfumery
 * =========================================================
 *
 * Central source for customer-facing product information.
 *
 * Used by:
 * - Homepage
 * - Collections
 * - Product Details
 * - Search and Filters
 * - Wishlist
 * - Cart
 * - Checkout product summaries
 *
 * IMPORTANT:
 * Product prices and names reflect supplied brand data.
 * Fragrance notes, ingredients, stock and reviews are
 * intentionally not invented.
 *
 * Production:
 * Supabase will become the authoritative source for
 * prices, inventory and product availability.
 * Never trust client-side prices for payment creation.
 */

// ---------------------------------------------------------
// 01. STORE CONFIGURATION
// ---------------------------------------------------------

export const STORE_CONFIG = Object.freeze({
  name: "Maison Kiyora",

  tagline: "The Art of Slow Perfumery",

  currency: "INR",

  locale: "en-IN",

  defaultProductSize: 55,

  defaultProductUnit: "ml",

  customerSupportPhone: "+919625360942",

  customerSupportWhatsApp: "919625360942",

  // Existing configuration preserved.
  // Confirm shipping availability before production launch.
  freeShipping: true,

  internationalShipping: true,

  cashOnDelivery: false,

  // Final refund conditions must be approved by the brand.
  returnsPolicyStatus: "pending_confirmation",

  // Production website URL to be configured after launch.
  siteUrl: "",

  // No unverified email address is published.
  supportEmail: "",
});

// ---------------------------------------------------------
// 02. CURRENCY FORMATTING
// ---------------------------------------------------------

const currencyFormatter = new Intl.NumberFormat(
  STORE_CONFIG.locale,
  {
    style: "currency",
    currency: STORE_CONFIG.currency,
    maximumFractionDigits: 0,
  }
);

export function formatPrice(amount) {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return currencyFormatter.format(0);
  }

  return currencyFormatter.format(value);
}

// ---------------------------------------------------------
// 03. IMAGE HELPERS
// ---------------------------------------------------------

/**
 * All product images are stored in:
 *
 * public/images/products/
 *
 * In Vite, files inside public are accessed directly
 * from the root URL.
 *
 * Example:
 * public/images/products/oody-raspberry.png
 *
 * Browser URL:
 * /images/products/oody-raspberry.png
 */

const PRODUCT_IMAGE_PATH = "/images/products";

/**
 * Creates an image object compatible with ProductCard,
 * ProductGallery, FeaturedProducts and SEO helpers.
 */
const createImage = (src, alt = "") => ({
  src,
  alt,
  width: 1024,
  height: 1536,
});

/**
 * Builds the main product image for a fragrance.
 *
 * Additional images can be added to the images array
 * later when lifestyle/gallery photos are available.
 */
function createProductImages(slug, name) {
  return [
    createImage(
      `${PRODUCT_IMAGE_PATH}/${slug}.png`,
      `Maison Kiyora ${name} 55ml perfume bottle`
    ),
  ];
}

// ---------------------------------------------------------
// 04. PRODUCT FACTORY
// ---------------------------------------------------------

function createProduct({
  id,
  slug,
  name,
  order,
  images = [],
}) {
  const size = STORE_CONFIG.defaultProductSize;
  const unit = STORE_CONFIG.defaultProductUnit;

  return {
    id,

    slug,

    name,

    brand: STORE_CONFIG.name,

    type: "perfume",

    category: "Fragrances",

    collection: "Signature Collection",

    size,

    unit,

    sizeLabel: `${size} ${unit}`,

    price: 2950,

    currency: STORE_CONFIG.currency,

    // Not a discounted product unless the client
    // provides a verified original selling price.
    compareAtPrice: null,

    discountPercentage: null,

    images,

    // Editorial descriptions require brand approval.
    shortDescription: "",

    description: "",

    fragranceFamily: null,

    topNotes: [],

    heartNotes: [],

    baseNotes: [],

    ingredients: [],

    concentration: null,

    longevity: null,

    projection: null,

    gender: null,

    occasion: [],

    season: [],

    // Inventory must come from the backend.
    stockQuantity: null,

    availability: "unconfirmed",

    isActive: true,

    isFeatured: false,

    isNewArrival: false,

    isBestSeller: false,

    // No fabricated customer ratings or reviews.
    rating: null,

    reviewCount: 0,

    // Search indexing
    searchKeywords: [
      name.toLowerCase(),
      "maison kiyora",
      "perfume",
      "fragrance",
      "55 ml",
      "55ml",
    ],

    // SEO
    seo: {
      title: `${name} | Maison Kiyora Perfume`,

      description:
        `Explore ${name}, a 55 ml fragrance from ` +
        `Maison Kiyora's Signature Collection. ` +
        `Discover The Art of Slow Perfumery.`,

      canonicalPath: `/product/${slug}`,

      keywords: [
        name,
        `${name} perfume`,
        "Maison Kiyora",
        "55ml perfume",
        "perfume online",
      ],
    },

    displayOrder: order,

    createdAt: null,

    updatedAt: null,
  };
}

// ---------------------------------------------------------
// 05. VERIFIED PRODUCT NAMES & IMAGES
// ---------------------------------------------------------

export const PRODUCTS = [
  createProduct({
    id: "mk-001",
    slug: "oody-raspberry",
    name: "Oody Raspberry",
    order: 1,
    images: createProductImages(
      "oody-raspberry",
      "Oody Raspberry"
    ),
  }),

  createProduct({
    id: "mk-002",
    slug: "fruits-of-love",
    name: "Fruits of Love",
    order: 2,
    images: createProductImages(
      "fruits-of-love",
      "Fruits of Love"
    ),
  }),

  createProduct({
    id: "mk-003",
    slug: "mandarin-melons",
    name: "Mandarin Melons",
    order: 3,
    images: createProductImages(
      "mandarin-melons",
      "Mandarin Melons"
    ),
  }),

  createProduct({
    id: "mk-004",
    slug: "cherry-you-lost",
    name: "Cherry You Lost",
    order: 4,
    images: createProductImages(
      "cherry-you-lost",
      "Cherry You Lost"
    ),
  }),

  createProduct({
    id: "mk-005",
    slug: "yours-pine",
    name: "Yours Pine",
    order: 5,
    images: createProductImages(
      "yours-pine",
      "Yours Pine"
    ),
  }),

  createProduct({
    id: "mk-006",
    slug: "autumn-hugs",
    name: "Autumn Hugs",
    order: 6,
    images: createProductImages(
      "autumn-hugs",
      "Autumn Hugs"
    ),
  }),

  createProduct({
    id: "mk-007",
    slug: "dancing-raspberry",
    name: "Dancing Raspberry",
    order: 7,
    images: createProductImages(
      "dancing-raspberry",
      "Dancing Raspberry"
    ),
  }),
];

// Alternative export for conventional imports.
export const products = PRODUCTS;

// ---------------------------------------------------------
// 06. PRODUCT LOOKUP
// ---------------------------------------------------------

export function getAllProducts() {
  return PRODUCTS.filter((product) => product.isActive);
}

export function getProductById(id) {
  return (
    PRODUCTS.find((product) => product.id === id) ?? null
  );
}

export function getProductBySlug(slug) {
  if (!slug) return null;

  return (
    PRODUCTS.find(
      (product) =>
        product.slug === String(slug).toLowerCase()
    ) ?? null
  );
}

export function getFeaturedProducts(limit = 4) {
  const featured = getAllProducts().filter(
    (product) => product.isFeatured
  );

  // If no featured products are assigned,
  // show the first products in catalog order.
  const selected = featured.length
    ? featured
    : getAllProducts();

  return selected.slice(0, Math.max(0, limit));
}

// ---------------------------------------------------------
// 07. SEARCH
// ---------------------------------------------------------

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function searchProducts(query = "") {
  const searchTerm = normalizeText(query);

  if (!searchTerm) {
    return getAllProducts();
  }

  const terms = searchTerm.split(/\s+/).filter(Boolean);

  return getAllProducts().filter((product) => {
    const searchableText = normalizeText(
      [
        product.name,
        product.brand,
        product.category,
        product.collection,
        product.type,
        product.sizeLabel,
        product.shortDescription,
        ...product.searchKeywords,
      ].join(" ")
    );

    return terms.every((term) =>
      searchableText.includes(term)
    );
  });
}

// ---------------------------------------------------------
// 08. FILTERS
// ---------------------------------------------------------

export function filterProducts(
  items = PRODUCTS,
  filters = {}
) {
  const {
    query = "",
    category = "",
    collection = "",
    minPrice = null,
    maxPrice = null,
    fragranceFamily = "",
    availability = "",
  } = filters;

  const searchTerm = normalizeText(query);

  return items.filter((product) => {
    if (!product.isActive) return false;

    if (searchTerm) {
      const searchText = normalizeText(
        [
          product.name,
          product.brand,
          product.category,
          product.collection,
          ...product.searchKeywords,
        ].join(" ")
      );

      const terms = searchTerm.split(/\s+/);

      if (
        !terms.every((term) =>
          searchText.includes(term)
        )
      ) {
        return false;
      }
    }

    if (
      category &&
      normalizeText(product.category) !==
        normalizeText(category)
    ) {
      return false;
    }

    if (
      collection &&
      normalizeText(product.collection) !==
        normalizeText(collection)
    ) {
      return false;
    }

    if (
      fragranceFamily &&
      normalizeText(product.fragranceFamily) !==
        normalizeText(fragranceFamily)
    ) {
      return false;
    }

    if (
      availability &&
      product.availability !== availability
    ) {
      return false;
    }

    if (
      minPrice !== null &&
      Number.isFinite(Number(minPrice)) &&
      product.price < Number(minPrice)
    ) {
      return false;
    }

    if (
      maxPrice !== null &&
      Number.isFinite(Number(maxPrice)) &&
      product.price > Number(maxPrice)
    ) {
      return false;
    }

    return true;
  });
}

// ---------------------------------------------------------
// 09. SORTING
// ---------------------------------------------------------

export const SORT_OPTIONS = [
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
  {
    value: "newest",
    label: "Newest",
  },
];

export function sortProducts(
  items = PRODUCTS,
  sortBy = "featured"
) {
  const sorted = [...items];

  switch (sortBy) {
    case "name-asc":
      return sorted.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

    case "name-desc":
      return sorted.sort((a, b) =>
        b.name.localeCompare(a.name)
      );

    case "price-asc":
      return sorted.sort(
        (a, b) => a.price - b.price
      );

    case "price-desc":
      return sorted.sort(
        (a, b) => b.price - a.price
      );

    case "newest":
      return sorted.sort((a, b) => {
        if (!a.createdAt && !b.createdAt) {
          return a.displayOrder - b.displayOrder;
        }

        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;

        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      });

    case "featured":
    default:
      return sorted.sort((a, b) => {
        if (a.isFeatured !== b.isFeatured) {
          return (
            Number(b.isFeatured) -
            Number(a.isFeatured)
          );
        }

        return a.displayOrder - b.displayOrder;
      });
  }
}

// ---------------------------------------------------------
// 10. COLLECTION HELPERS
// ---------------------------------------------------------

export function getCollections() {
  return [
    {
      id: "signature",
      slug: "signature-collection",
      name: "Signature Collection",
      description:
        "Explore the Maison Kiyora fragrance collection.",
      productCount: getAllProducts().filter(
        (product) =>
          product.collection ===
          "Signature Collection"
      ).length,
    },
  ];
}

export function getProductsByCollection(
  collectionName
) {
  return getAllProducts().filter(
    (product) =>
      normalizeText(product.collection) ===
      normalizeText(collectionName)
  );
}

// ---------------------------------------------------------
// 11. RELATED PRODUCTS
// ---------------------------------------------------------

export function getRelatedProducts(
  productId,
  limit = 4
) {
  const currentProduct = getProductById(productId);

  if (!currentProduct) {
    return [];
  }

  return getAllProducts()
    .filter((product) => product.id !== productId)
    .sort((a, b) => {
      const aSameCollection =
        a.collection === currentProduct.collection;

      const bSameCollection =
        b.collection === currentProduct.collection;

      return (
        Number(bSameCollection) -
        Number(aSameCollection)
      );
    })
    .slice(0, Math.max(0, limit));
}

// ---------------------------------------------------------
// 12. FILTER METADATA
// ---------------------------------------------------------

export function getPriceRange() {
  const prices = getAllProducts().map(
    (product) => product.price
  );

  if (!prices.length) {
    return { min: 0, max: 0 };
  }

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

export function getAvailableCategories() {
  return [
    ...new Set(
      getAllProducts().map(
        (product) => product.category
      )
    ),
  ];
}

export function getAvailableFragranceFamilies() {
  return [
    ...new Set(
      getAllProducts()
        .map((product) => product.fragranceFamily)
        .filter(Boolean)
    ),
  ];
}

// ---------------------------------------------------------
// 13. CART HELPERS
// ---------------------------------------------------------

/**
 * Display-only cart total helper.
 *
 * Actual order totals must be recalculated on the
 * secure backend using trusted product prices.
 */

export function calculateCartSubtotal(
  cartItems = []
) {
  return cartItems.reduce((total, item) => {
    const product = getProductById(
      item.productId ?? item.id
    );

    if (!product) return total;

    const quantity = Math.max(
      0,
      Math.floor(Number(item.quantity) || 0)
    );

    return total + product.price * quantity;
  }, 0);
}

export function getCartItemCount(
  cartItems = []
) {
  return cartItems.reduce((count, item) => {
    const quantity = Math.max(
      0,
      Math.floor(Number(item.quantity) || 0)
    );

    return count + quantity;
  }, 0);
}

// ---------------------------------------------------------
// 14. SEO PRODUCT STRUCTURED DATA
// ---------------------------------------------------------

/**
 * Generates basic Schema.org Product JSON-LD.
 *
 * Do not add fabricated ratings, reviews or stock.
 * Offer availability is intentionally omitted until
 * backend inventory data is available.
 */

export function getProductStructuredData(
  product,
  siteUrl = STORE_CONFIG.siteUrl
) {
  if (!product) return null;

  const baseUrl = String(siteUrl).replace(/\/$/, "");

  const productUrl = baseUrl
    ? `${baseUrl}/product/${product.slug}`
    : undefined;

  const primaryImage = product.images?.[0]?.src;

  const imageUrl =
    baseUrl && primaryImage
      ? new URL(primaryImage, `${baseUrl}/`).href
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",

    name: product.name,

    description:
      product.description ||
      product.seo.description,

    brand: {
      "@type": "Brand",
      name: STORE_CONFIG.name,
    },

    ...(productUrl && { url: productUrl }),

    ...(imageUrl && { image: [imageUrl] }),

    // Price information can be added to an Offer
    // once purchase availability and backend data
    // are confirmed.
  };
}

// ---------------------------------------------------------
// 15. DEFAULT EXPORT
// ---------------------------------------------------------

export default PRODUCTS;
