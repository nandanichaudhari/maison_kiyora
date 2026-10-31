
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// ======================================================
// MAISON KIYORA — SHOPPING CART CONTEXT
// Persistent cart, quantities, variants and totals
// ======================================================

const CART_STORAGE_KEY = "maison_kiyora_cart";
const MAX_QUANTITY_PER_ITEM = 10;

export const CartContext = createContext(null);

// ======================================================
// HELPERS
// ======================================================

function normalizeQuantity(value, fallback = 1) {
  const quantity = Number(value);

  if (!Number.isFinite(quantity)) {
    return fallback;
  }

  return Math.max(
    1,
    Math.min(
      MAX_QUANTITY_PER_ITEM,
      Math.trunc(quantity)
    )
  );
}

function getProductId(product) {
  if (!product || typeof product !== "object") {
    return null;
  }

  const id =
    product.productId ??
    product.id ??
    product.slug;

  if (id === undefined || id === null) {
    return null;
  }

  const normalizedId = String(id).trim();

  return normalizedId || null;
}

function normalizeVariantId(value) {
  if (value === null || value === undefined) {
    return "default";
  }

  if (typeof value === "object") {
    const identifier =
      value.id ??
      value.variantId ??
      value.sku ??
      value.value ??
      value.name ??
      value.label;

    return identifier == null
      ? "default"
      : String(identifier);
  }

  const result = String(value).trim();

  return result || "default";
}

function getVariantId(product, options = {}) {
  return normalizeVariantId(
    options.variantId ??
      options.variant ??
      product.variantId ??
      product.variant ??
      "default"
  );
}

function createCartKey(productId, variantId) {
  return `${productId}::${variantId}`;
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
    const source =
      image.src ||
      image.url ||
      image.image_url ||
      image.imageUrl ||
      image.secure_url ||
      image.publicUrl ||
      image.image;

    return typeof source === "string"
      ? source.trim() || null
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

function getProductSize(product, options = {}) {
  const size =
    options.size ??
    product.sizeLabel ??
    product.size ??
    product.volume ??
    "55 ml";

  if (typeof size === "number") {
    return `${size} ml`;
  }

  return String(size);
}

// ======================================================
// NORMALIZE CART PRODUCT
// ======================================================

function normalizeProduct(product, options = {}) {
  const productId = getProductId(product);

  if (!productId) return null;

  const variantId = getVariantId(product, options);

  const price = normalizePrice(
    options.price ?? product.price
  );

  // Products must have a valid price.
  if (price === null) return null;

  const quantity = normalizeQuantity(
    options.quantity ?? product.quantity ?? 1
  );

  const name = String(
    product.name ??
      product.title ??
      "Maison Kiyora Fragrance"
  );

  const image = getProductImage(product);

  return {
    key: createCartKey(productId, variantId),

    productId,
    id: productId,

    slug: String(product.slug ?? productId),

    variantId,

    name,
    title: name,

    image,
    thumbnail: image,

    price,
    quantity,

    size: getProductSize(product, options),
  };
}

// ======================================================
// SANITIZE STORED CART
// ======================================================

function sanitizeCart(items) {
  if (!Array.isArray(items)) return [];

  const cartMap = new Map();

  for (const item of items) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const normalized = normalizeProduct(item, {
      variantId: item.variantId,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
    });

    if (!normalized) continue;

    const existing = cartMap.get(normalized.key);

    if (existing) {
      cartMap.set(normalized.key, {
        ...existing,
        quantity: normalizeQuantity(
          existing.quantity + normalized.quantity
        ),
      });
    } else {
      cartMap.set(normalized.key, normalized);
    }
  }

  return [...cartMap.values()];
}

// ======================================================
// LOCAL STORAGE
// ======================================================

function readStoredCart() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(
      CART_STORAGE_KEY
    );

    if (!stored) return [];

    return sanitizeCart(JSON.parse(stored));
  } catch (error) {
    console.warn(
      "Maison Kiyora: Unable to restore shopping bag.",
      error
    );

    return [];
  }
}

// ======================================================
// CART PROVIDER
// ======================================================

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(
    readStoredCart
  );

  // ----------------------------------------------------
  // SAVE CART
  // ----------------------------------------------------

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.warn(
        "Maison Kiyora: Unable to save shopping bag.",
        error
      );
    }
  }, [cartItems]);

  // ----------------------------------------------------
  // ADD TO CART
  // ----------------------------------------------------

  const addToCart = useCallback(
    (product, quantity = 1, options = {}) => {
      // Supported:
      // addToCart(product, 1)
      // addToCart(product, 2, variant)
      // addToCart(product, { quantity: 2, size: "55 ml" })

      let requestedQuantity = quantity;
      let requestedOptions = options;

      if (
        quantity !== null &&
        typeof quantity === "object"
      ) {
        requestedOptions = quantity;
        requestedQuantity =
          requestedOptions.quantity ?? 1;
      }

      // A product card may pass the selected variant
      // directly as the third argument.
      if (
        requestedOptions !== null &&
        typeof requestedOptions === "object" &&
        !Array.isArray(requestedOptions) &&
        requestedOptions.id !== undefined &&
        requestedOptions.variantId === undefined &&
        requestedOptions.variant === undefined
      ) {
        requestedOptions = {
          ...requestedOptions,
          variantId: requestedOptions.id,
        };
      }

      const normalized = normalizeProduct(product, {
        ...(requestedOptions &&
        typeof requestedOptions === "object"
          ? requestedOptions
          : {
              variantId: requestedOptions,
            }),
        quantity: requestedQuantity,
      });

      if (!normalized) {
        console.warn(
          "Maison Kiyora: Invalid product or price."
        );

        return false;
      }

      if (
        product.available === false ||
        product.isActive === false ||
        (product.stockQuantity != null &&
          Number(product.stockQuantity) <= 0)
      ) {
        return false;
      }

      setCartItems((previousItems) => {
        const existingIndex =
          previousItems.findIndex(
            (item) => item.key === normalized.key
          );

        if (existingIndex === -1) {
          return [...previousItems, normalized];
        }

        return previousItems.map((item, index) => {
          if (index !== existingIndex) {
            return item;
          }

          return {
            ...item,
            quantity: normalizeQuantity(
              item.quantity + normalized.quantity
            ),
          };
        });
      });

      return true;
    },
    []
  );

  // ----------------------------------------------------
  // REMOVE FROM CART
  // ----------------------------------------------------

  const removeFromCart = useCallback((keyOrId) => {
    if (
      keyOrId === undefined ||
      keyOrId === null
    ) {
      return;
    }

    const identifier = String(keyOrId);

    setCartItems((previousItems) =>
      previousItems.filter(
        (item) =>
          item.key !== identifier &&
          item.productId !== identifier
      )
    );
  }, []);

  // ----------------------------------------------------
  // UPDATE QUANTITY
  // ----------------------------------------------------

  const updateQuantity = useCallback(
    (keyOrId, quantity) => {
      if (
        keyOrId === undefined ||
        keyOrId === null
      ) {
        return;
      }

      const identifier = String(keyOrId);
      const numericQuantity = Number(quantity);

      if (!Number.isFinite(numericQuantity)) {
        return;
      }

      // Quantity 0 removes the product.
      if (numericQuantity <= 0) {
        removeFromCart(identifier);
        return;
      }

      const safeQuantity = normalizeQuantity(
        numericQuantity
      );

      setCartItems((previousItems) =>
        previousItems.map((item) => {
          if (
            item.key !== identifier &&
            item.productId !== identifier
          ) {
            return item;
          }

          return {
            ...item,
            quantity: safeQuantity,
          };
        })
      );
    },
    [removeFromCart]
  );

  // ----------------------------------------------------
  // INCREASE QUANTITY
  // ----------------------------------------------------

  const increaseQuantity = useCallback((keyOrId) => {
    if (
      keyOrId === undefined ||
      keyOrId === null
    ) {
      return;
    }

    const identifier = String(keyOrId);

    setCartItems((previousItems) =>
      previousItems.map((item) => {
        if (
          item.key !== identifier &&
          item.productId !== identifier
        ) {
          return item;
        }

        return {
          ...item,
          quantity: normalizeQuantity(
            item.quantity + 1
          ),
        };
      })
    );
  }, []);

  // ----------------------------------------------------
  // DECREASE QUANTITY
  // ----------------------------------------------------

  const decreaseQuantity = useCallback((keyOrId) => {
    if (
      keyOrId === undefined ||
      keyOrId === null
    ) {
      return;
    }

    const identifier = String(keyOrId);

    setCartItems((previousItems) =>
      previousItems
        .map((item) => {
          if (
            item.key !== identifier &&
            item.productId !== identifier
          ) {
            return item;
          }

          return {
            ...item,
            quantity: item.quantity - 1,
          };
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  // ----------------------------------------------------
  // CLEAR CART
  // ----------------------------------------------------

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // ----------------------------------------------------
  // IS PRODUCT IN CART?
  // ----------------------------------------------------

  const isInCart = useCallback(
    (productId, variantId = null) => {
      if (
        productId === undefined ||
        productId === null
      ) {
        return false;
      }

      const identifier = String(productId);

      return cartItems.some((item) => {
        if (variantId !== null) {
          return (
            item.key ===
            createCartKey(
              identifier,
              normalizeVariantId(variantId)
            )
          );
        }

        return item.productId === identifier;
      });
    },
    [cartItems]
  );

  // ----------------------------------------------------
  // GET PRODUCT QUANTITY
  // ----------------------------------------------------

  const getItemQuantity = useCallback(
    (productId, variantId = null) => {
      if (
        productId === undefined ||
        productId === null
      ) {
        return 0;
      }

      const identifier = String(productId);

      return cartItems.reduce((total, item) => {
        const matches =
          variantId === null
            ? item.productId === identifier
            : item.key ===
              createCartKey(
                identifier,
                normalizeVariantId(variantId)
              );

        return matches
          ? total + item.quantity
          : total;
      }, 0);
    },
    [cartItems]
  );

  // ----------------------------------------------------
  // CALCULATED VALUES
  // ----------------------------------------------------

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + item.quantity,
        0
      ),
    [cartItems]
  );

  const cartSubtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + item.price * item.quantity,
        0
      ),
    [cartItems]
  );

  // Shipping, taxes and discounts are handled
  // separately during checkout.
  const cartTotal = cartSubtotal;

  const isCartEmpty = cartItems.length === 0;

  // ----------------------------------------------------
  // CURRENCY FORMATTING
  // ----------------------------------------------------

  const formatCartPrice = useCallback(
    (amount) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(Number(amount) || 0),
    []
  );

  // ----------------------------------------------------
  // CONTEXT VALUE
  // ----------------------------------------------------

  const contextValue = useMemo(
    () => ({
      // Products
      cartItems,
      items: cartItems,

      // Actions
      addToCart,
      removeFromCart,
      updateQuantity,
      increaseQuantity,
      decreaseQuantity,
      clearCart,

      // Helpers
      isInCart,
      getItemQuantity,
      formatCartPrice,

      // Counts
      cartCount,
      itemCount: cartCount,
      totalItems: cartCount,

      // Prices
      cartSubtotal,
      subtotal: cartSubtotal,
      cartTotal,
      total: cartTotal,

      // State
      isCartEmpty,
      isEmpty: isCartEmpty,

      // Configuration
      maxQuantity: MAX_QUANTITY_PER_ITEM,
    }),
    [
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      isInCart,
      getItemQuantity,
      formatCartPrice,
      cartCount,
      cartSubtotal,
      cartTotal,
      isCartEmpty,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// ======================================================
// CUSTOM HOOK
// ======================================================

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider."
    );
  }

  return context;
}

export default CartProvider;
