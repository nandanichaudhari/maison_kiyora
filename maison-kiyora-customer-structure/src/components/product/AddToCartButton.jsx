import { useEffect, useRef, useState } from "react";
import { ShoppingBag, Check, LoaderCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "react-toastify";
import { useCart } from "../../context/CartContext.jsx";

const STYLES = `
.mk-add-to-cart-button{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:52px;padding:15px 28px;border:1px solid #1d2940;border-radius:2px;background:#1d2940;color:#f5f0e8;font-family:"Manrope",sans-serif;font-size:11px;font-weight:600;line-height:1.3;letter-spacing:.13em;text-transform:uppercase;cursor:pointer;transition:background .25s,color .25s,border-color .25s,box-shadow .25s}
.mk-add-to-cart-button:hover:not(:disabled){background:#293a58;border-color:#293a58;box-shadow:0 8px 24px rgba(29,41,64,.14)}
.mk-add-to-cart-button:focus-visible{outline:2px solid #b69a69;outline-offset:4px}
.mk-add-to-cart-button:disabled{opacity:.5;cursor:not-allowed;box-shadow:none}
.mk-add-to-cart-button__icon{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;line-height:0}
.mk-add-to-cart-button__label{display:inline-block}
.mk-add-to-cart-button--full{width:100%}
.mk-add-to-cart-button--compact{min-height:42px;padding:11px 17px;font-size:10px;letter-spacing:.1em}
.mk-add-to-cart-button--outline{border-color:#b69a69;background:transparent;color:#1d2940}
.mk-add-to-cart-button--outline:hover:not(:disabled){background:rgba(182,154,105,.1);border-color:#967a51;color:#1d2940;box-shadow:none}
.mk-add-to-cart-button--success,.mk-add-to-cart-button--success:hover:not(:disabled){background:#354c3c;border-color:#354c3c;color:#fff}
.mk-add-to-cart-button__spinner{animation:mk-cart-spin .85s linear infinite}
@keyframes mk-cart-spin{to{transform:rotate(360deg)}}
@media(max-width:480px){.mk-add-to-cart-button{min-height:48px;padding:13px 18px;font-size:10px}.mk-add-to-cart-button--compact{min-height:40px;padding:10px 14px}}
@media(prefers-reduced-motion:reduce){.mk-add-to-cart-button{transition:none}.mk-add-to-cart-button__spinner{animation:none}}
`;

function parsePrice(value) {
  if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? value : null;
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value.replace(/[₹,\s]/g, ""));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function getVariant(product, options) {
  const candidate = options?.variant ?? options?.selectedVariant;
  if (candidate && typeof candidate === "object") return candidate;
  if (candidate != null) {
    return (product?.variants || []).find((v) => String(v?.id ?? v?.variantId ?? v?.sku ?? v) === String(candidate)) || null;
  }
  return null;
}

/**
 * Add to Bag button, compatible with CartContext.addToCart(product, quantity, options).
 * options can contain variantId, variant, size and price. Variant objects are converted
 * to primitive identifiers to avoid cart keys such as "[object Object]".
 */
export default function AddToCartButton({
  product,
  quantity = 1,
  options = {},
  variant = "default",
  className = "",
  disabled = false,
  loading = false,
  showToast = true,
  showIcon = true,
  label = "Add to Bag",
  onAdd,
}) {
  const { addToCart } = useCart();
  const reducedMotion = useReducedMotion();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const timerRef = useRef(null);
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  const selectedVariant = getVariant(product, options);
  const rawVariantId = options?.variantId ?? selectedVariant?.id ?? selectedVariant?.variantId ?? selectedVariant?.sku ??
    (typeof options?.variant === "string" || typeof options?.variant === "number" ? options.variant : null) ?? product?.variantId ?? "default";
  const variantId = String(rawVariantId);
  const selectedPrice = options?.price ?? selectedVariant?.salePrice ?? selectedVariant?.sale_price ?? selectedVariant?.price ??
    product?.salePrice ?? product?.sale_price ?? product?.price ?? product?.base_price;
  const price = parsePrice(selectedPrice);
  const selectedSize = options?.size ?? selectedVariant?.size ?? selectedVariant?.label ?? selectedVariant?.volume ?? product?.size;
  const stock = options?.stock ?? selectedVariant?.stock ?? selectedVariant?.stock_quantity ?? selectedVariant?.inventory ??
    product?.stock ?? product?.stock_quantity ?? product?.inventory;
  const hasStock = stock !== null && stock !== undefined && stock !== "" && Number.isFinite(Number(stock));
  const availableStock = hasStock ? Math.max(0, Math.trunc(Number(stock))) : null;
  const productId = product?.id ?? product?.productId ?? product?.slug;
  const validProduct = productId != null && String(productId).trim() !== "" && price !== null;
  const requestedQuantity = Number(quantity);
  const validQuantity = Number.isInteger(requestedQuantity) && requestedQuantity >= 1 && requestedQuantity <= 10;
  const unavailable = product?.inStock === false || product?.in_stock === false || product?.available === false ||
    product?.isAvailable === false || product?.isActive === false || product?.is_active === false ||
    selectedVariant?.available === false || selectedVariant?.inStock === false ||
    (availableStock !== null && availableStock < requestedQuantity);
  const isDisabled = disabled || loading || isAdding || !validProduct || !validQuantity || unavailable || typeof addToCart !== "function";
  const safeVariant = ["default", "full", "compact", "outline"].includes(variant) ? variant : "default";

  const handleAddToCart = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isDisabled || inFlightRef.current) return;
    inFlightRef.current = true;
    setIsAdding(true);
    setIsAdded(false);
    try {
      // CartContext expects a numeric price and a primitive variantId.
      const cartProduct = { ...product, price };
      const cartOptions = { ...options, variantId, price };
      if (selectedSize !== undefined && selectedSize !== null) cartOptions.size = String(selectedSize);
      delete cartOptions.variant;
      delete cartOptions.selectedVariant;
      const result = await Promise.resolve(addToCart(cartProduct, requestedQuantity, cartOptions));
      if (result === false || result?.success === false) {
        throw new Error(result?.message || "Unable to add this fragrance to your bag.");
      }
      if (!mountedRef.current) return;
      setIsAdded(true);
      if (showToast) toast.success(`${product?.name ?? product?.title ?? "Fragrance"} added to your bag.`, { autoClose: 2500 });
      // onAdd is a notification callback, not a second cart insertion.
      if (typeof onAdd === "function") {
        try { onAdd(product, requestedQuantity, cartOptions); }
        catch (callbackError) { console.error("Maison Kiyora: onAdd callback failed.", callbackError); }
      }
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) setIsAdded(false);
      }, 1800);
    } catch (error) {
      console.error("Maison Kiyora: Add to cart failed.", error);
      if (mountedRef.current && showToast) toast.error(error?.message || "Unable to add this fragrance. Please try again.");
    } finally {
      inFlightRef.current = false;
      if (mountedRef.current) setIsAdding(false);
    }
  };

  const buttonLabel = unavailable ? "Out of Stock" : loading || isAdding ? "Adding..." : isAdded ? "Added to Bag" : label;

  return (
    <>
      <style>{STYLES}</style>
      <motion.button
        type="button"
        className={["mk-add-to-cart-button", `mk-add-to-cart-button--${safeVariant}`, isAdded ? "mk-add-to-cart-button--success" : "", className].filter(Boolean).join(" ")}
        onClick={handleAddToCart}
        disabled={isDisabled}
        aria-label={buttonLabel}
        aria-busy={loading || isAdding}
        whileTap={reducedMotion || isDisabled ? undefined : { scale: 0.97 }}
        transition={{ duration: reducedMotion ? 0 : 0.15 }}
      >
        {showIcon && (
          <span className="mk-add-to-cart-button__icon">
            {loading || isAdding ? <LoaderCircle size={17} strokeWidth={1.6} className="mk-add-to-cart-button__spinner" aria-hidden="true" /> :
              isAdded ? <Check size={17} strokeWidth={1.7} aria-hidden="true" /> :
                <ShoppingBag size={17} strokeWidth={1.6} aria-hidden="true" />}
          </span>
        )}
        <span className="mk-add-to-cart-button__label">{buttonLabel}</span>
      </motion.button>
    </>
  );
}
