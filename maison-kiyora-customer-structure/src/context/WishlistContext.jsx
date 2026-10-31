
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// ======================================================
// MAISON KIYORA — WISHLIST CONTEXT
// The Art of Slow Perfumery
// React + Vite
// ======================================================

const WISHLIST_STORAGE_KEY = "maison_kiyora_wishlist";

export const WishlistContext = createContext(null);

// ======================================================
// HELPERS
// ======================================================

function getProductId(product) {
  if (!product || typeof product !== "object") {
    return null;
  }

  const id =
    product.productId ??
    product.id ??
    product.slug;

  if (id === null || id === undefined) {
    return null;
  }

  return String(id).trim() || null;
}

function normalizePrice(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0
      ? value
      : null;
  }

  if (typeof value === "string") {
    const cleaned = value
      .replace(/[₹,\s]/g, "")
      .trim();

    if (!cleaned) return null;

    const parsed = Number(cleaned);

    return Number.isFinite(parsed) && parsed >= 0
      ? parsed
      : null;
  }

  return null;
}

function normalizeImage(image) {
  if (typeof image === "string") {
    return image.trim() || null;
  }

  if (image && typeof image === "object") {
    const src =
      image.src ||
      image.url ||
      image.image_url ||
      image.imageUrl ||
      image.secure_url ||
      image.publicUrl ||
      image.image;

    return typeof src === "string"
      ? src.trim() || null
      : null;
  }

  return null;
}

function getProductImage(product) {
  const candidates = [
    product.image,
    product.thumbnail,
    product.imageUrl,
    product.image_url,
    ...(Array.isArray(product.images)
      ? product.images
      : []),
  ];

  for (const candidate of candidates) {
    const image = normalizeImage(candidate);

    if (image) return image;
  }

  if (product.slug) {
    return `/images/products/${product.slug}.png`;
  }

  return null;
}

function getProductSize(product) {
  const size =
    product.sizeLabel ??
    product.size ??
    product.volume ??
    "55 ml";

  return typeof size === "number"
    ? `${size} ml`
    : String(size);
}

function normalizeWishlistProduct(product) {
  const productId = getProductId(product);

  if (!productId) return null;

  const name = String(
    product.name ??
      product.title ??
      "Maison Kiyora Fragrance"
  );

  const image = getProductImage(product);

  return {
    id: productId,
    productId,

    slug: String(product.slug ?? productId),

    name,
    title: name,

    price: normalizePrice(product.price),

    image,
    thumbnail: image,

    size: getProductSize(product),
  };
}

// ======================================================
// SANITIZE STORED WISHLIST
// ======================================================

function sanitizeWishlist(items) {
  if (!Array.isArray(items)) return [];

  const productMap = new Map();

  for (const product of items) {
    if (!product || typeof product !== "object") {
      continue;
    }

    const normalized = normalizeWishlistProduct(product);

    if (!normalized) continue;

    if (!productMap.has(normalized.id)) {
      productMap.set(normalized.id, normalized);
    }
  }

  return [...productMap.values()];
}

// ======================================================
// LOCAL STORAGE
// ======================================================

function readStoredWishlist() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(
      WISHLIST_STORAGE_KEY
    );

    if (!stored) return [];

    return sanitizeWishlist(JSON.parse(stored));
  } catch (error) {
    console.warn(
      "Maison Kiyora: Unable to restore wishlist.",
      error
    );

    return [];
  }
}

function saveWishlist(items) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      WISHLIST_STORAGE_KEY,
      JSON.stringify(items)
    );
  } catch (error) {
    console.warn(
      "Maison Kiyora: Unable to save wishlist.",
      error
    );
  }
}

// ======================================================
// WISHLIST PROVIDER
// ======================================================

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(
    readStoredWishlist
  );

  // ----------------------------------------------------
  // PERSIST WISHLIST
  // ----------------------------------------------------

  useEffect(() => {
    saveWishlist(wishlistItems);
  }, [wishlistItems]);

  // ----------------------------------------------------
  // SYNC BETWEEN BROWSER TABS
  // ----------------------------------------------------

  useEffect(() => {
    function handleStorage(event) {
      if (
        event.key !== WISHLIST_STORAGE_KEY &&
        event.key !== null
      ) {
        return;
      }

      const updatedItems = readStoredWishlist();

      setWishlistItems((previousItems) => {
        if (
          JSON.stringify(previousItems) ===
          JSON.stringify(updatedItems)
        ) {
          return previousItems;
        }

        return updatedItems;
      });
    }

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  // ----------------------------------------------------
  // ADD TO WISHLIST
  // ----------------------------------------------------

  const addToWishlist = useCallback((product) => {
    const normalized = normalizeWishlistProduct(product);

    if (!normalized) {
      console.warn(
        "Maison Kiyora: Invalid wishlist product."
      );

      return false;
    }

    setWishlistItems((previousItems) => {
      const alreadyExists = previousItems.some(
        (item) => item.id === normalized.id
      );

      if (alreadyExists) {
        return previousItems;
      }

      return [...previousItems, normalized];
    });

    return true;
  }, []);

  // ----------------------------------------------------
  // REMOVE FROM WISHLIST
  // ----------------------------------------------------

  const removeFromWishlist = useCallback(
    (productOrId) => {
      if (
        productOrId === null ||
        productOrId === undefined
      ) {
        return;
      }

      const identifier =
        typeof productOrId === "object"
          ? getProductId(productOrId)
          : String(productOrId);

      if (!identifier) return;

      setWishlistItems((previousItems) =>
        previousItems.filter(
          (item) =>
            item.id !== identifier &&
            item.productId !== identifier &&
            item.slug !== identifier
        )
      );
    },
    []
  );

  // ----------------------------------------------------
  // CHECK WISHLIST STATUS
  // ----------------------------------------------------

  const isInWishlist = useCallback(
    (productOrId) => {
      if (
        productOrId === null ||
        productOrId === undefined
      ) {
        return false;
      }

      const identifier =
        typeof productOrId === "object"
          ? getProductId(productOrId)
          : String(productOrId);

      if (!identifier) return false;

      return wishlistItems.some(
        (item) =>
          item.id === identifier ||
          item.productId === identifier ||
          item.slug === identifier
      );
    },
    [wishlistItems]
  );

  // ----------------------------------------------------
  // TOGGLE WISHLIST
  // ----------------------------------------------------

  const toggleWishlist = useCallback(
    (product) => {
      const normalized = normalizeWishlistProduct(product);

      if (!normalized) {
        console.warn(
          "Maison Kiyora: Invalid wishlist product."
        );

        return false;
      }

      const willAdd = !wishlistItems.some(
        (item) => item.id === normalized.id
      );

      setWishlistItems((previousItems) => {
        const alreadyExists = previousItems.some(
          (item) => item.id === normalized.id
        );

        if (alreadyExists) {
          return previousItems.filter(
            (item) => item.id !== normalized.id
          );
        }

        return [...previousItems, normalized];
      });

      // true = product added
      // false = product removed
      return willAdd;
    },
    [wishlistItems]
  );

  // ----------------------------------------------------
  // CLEAR WISHLIST
  // ----------------------------------------------------

  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
  }, []);

  // ----------------------------------------------------
  // CALCULATED VALUES
  // ----------------------------------------------------

  const wishlistCount = wishlistItems.length;
  const isWishlistEmpty = wishlistCount === 0;

  // ----------------------------------------------------
  // CONTEXT VALUE
  // ----------------------------------------------------

  const contextValue = useMemo(
    () => ({
      // Products
      wishlistItems,
      items: wishlistItems,
      wishlist: wishlistItems,

      // Actions
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      clearWishlist,

      // Helpers
      isInWishlist,

      // Totals
      wishlistCount,
      itemCount: wishlistCount,
      totalItems: wishlistCount,

      // State
      isWishlistEmpty,
      isEmpty: isWishlistEmpty,
    }),
    [
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      clearWishlist,
      isInWishlist,
      wishlistCount,
      isWishlistEmpty,
    ]
  );

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
}

// ======================================================
// CUSTOM HOOK
// ======================================================

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used inside WishlistProvider."
    );
  }

  return context;
}

export default WishlistProvider;
