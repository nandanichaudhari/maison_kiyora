import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";

const DEFAULT_MIN = 1;
const DEFAULT_MAX = 10; // Matches the current CartContext per-item limit.

const STYLES = `
.mk-quantity-selector{display:inline-flex;flex-direction:column;align-items:flex-start;gap:10px;max-width:100%;color:#1d2940;font-family:"Manrope",sans-serif}
.mk-quantity-selector__label{color:#1d2940;font-size:10px;font-weight:600;line-height:1.4;letter-spacing:.16em;text-transform:uppercase}
.mk-quantity-selector__control{display:inline-flex;align-items:center;justify-content:space-between;min-height:48px;border:1px solid rgba(29,41,64,.22);background:transparent;color:#1d2940}
.mk-quantity-selector__button{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:44px;min-height:46px;padding:0;border:0;background:transparent;color:inherit;cursor:pointer;transition:background 200ms ease,color 200ms ease}
.mk-quantity-selector__button:hover:not(:disabled){background:rgba(182,154,105,.12);color:#967a51}
.mk-quantity-selector__button:focus-visible{position:relative;z-index:1;outline:2px solid #b69a69;outline-offset:-2px}
.mk-quantity-selector__button:disabled{opacity:.3;cursor:not-allowed}
.mk-quantity-selector__value{display:flex;align-items:center;justify-content:center;min-width:46px;min-height:46px;padding:0 8px;font-size:13px;font-weight:500;font-variant-numeric:tabular-nums;text-align:center;user-select:none}
.mk-quantity-selector__hint{margin:0;color:#8c8c8c;font-size:10px;line-height:1.5}
.mk-quantity-selector--compact .mk-quantity-selector__control{min-height:38px}
.mk-quantity-selector--compact .mk-quantity-selector__button{width:36px;min-height:36px}
.mk-quantity-selector--compact .mk-quantity-selector__value{min-width:34px;min-height:36px;font-size:12px}
.mk-quantity-selector--large .mk-quantity-selector__control{min-height:56px}
.mk-quantity-selector--large .mk-quantity-selector__button{width:52px;min-height:54px}
.mk-quantity-selector--large .mk-quantity-selector__value{min-width:52px;min-height:54px;font-size:14px}
.mk-quantity-selector--disabled{opacity:.55}
@media(max-width:480px){.mk-quantity-selector:not(.mk-quantity-selector--compact):not(.mk-quantity-selector--large) .mk-quantity-selector__control{min-height:44px}.mk-quantity-selector:not(.mk-quantity-selector--compact):not(.mk-quantity-selector--large) .mk-quantity-selector__button,.mk-quantity-selector:not(.mk-quantity-selector--compact):not(.mk-quantity-selector--large) .mk-quantity-selector__value{min-height:42px}}
@media(prefers-reduced-motion:reduce){.mk-quantity-selector__button{transition:none}}
`;

function normalizeInteger(value, fallback) {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? Math.trunc(number) : fallback;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Controlled: <QuantitySelector value={quantity} onChange={setQuantity} />
 * Uncontrolled: <QuantitySelector defaultValue={1} onChange={handleChange} />
 * A supplied `value` makes the component controlled, including when onChange is absent.
 */
export default function QuantitySelector({
  value,
  defaultValue = 1,
  onChange,
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
  stock,
  disabled = false,
  variant = "default",
  showLabel = true,
  showHint = false,
  label = "Quantity",
  className = "",
  id,
}) {
  const generatedId = useId();
  const controlId = id || generatedId;
  const [internalValue, setInternalValue] = useState(() =>
    normalizeInteger(defaultValue, DEFAULT_MIN)
  );
  const isControlled = value !== undefined;

  // The cart enforces 10 units per line item. A higher min cannot override that cap.
  const safeMin = clamp(normalizeInteger(min, DEFAULT_MIN), 1, DEFAULT_MAX);
  const requestedMax = clamp(normalizeInteger(max, DEFAULT_MAX), 0, DEFAULT_MAX);
  const hasStockLimit = stock !== undefined && stock !== null && stock !== "" && Number.isFinite(Number(stock));
  const stockQuantity = hasStockLimit ? Math.max(0, Math.trunc(Number(stock))) : null;
  const effectiveMax = hasStockLimit ? Math.min(requestedMax, stockQuantity) : requestedMax;
  const isOutOfStock = effectiveMax < safeMin;

  const rawValue = isControlled ? value : internalValue;
  const safeValue = isOutOfStock
    ? 0
    : clamp(normalizeInteger(rawValue, safeMin), safeMin, effectiveMax);

  const safeVariant = ["default", "compact", "large"].includes(variant) ? variant : "default";
  const isDisabled = Boolean(disabled || isOutOfStock);
  const canDecrease = !isDisabled && safeValue > safeMin;
  const canIncrease = !isDisabled && safeValue < effectiveMax;
  const accessibleLabel = typeof label === "string" && label.trim() ? label.trim() : "Quantity";

  const updateQuantity = (nextValue) => {
    if (isDisabled || nextValue < safeMin || nextValue > effectiveMax) return;
    if (!isControlled) setInternalValue(nextValue);
    onChange?.(nextValue);
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className={[
        "mk-quantity-selector",
        `mk-quantity-selector--${safeVariant}`,
        isDisabled && "mk-quantity-selector--disabled",
        className,
      ].filter(Boolean).join(" ")}>
        {showLabel && (
          <span id={`${controlId}-label`} className="mk-quantity-selector__label">
            {accessibleLabel}
          </span>
        )}
        <div
          className="mk-quantity-selector__control"
          role="group"
          aria-label={showLabel ? undefined : accessibleLabel}
          aria-labelledby={showLabel ? `${controlId}-label` : undefined}
        >
          <button
            type="button"
            className="mk-quantity-selector__button"
            onClick={() => updateQuantity(safeValue - 1)}
            disabled={!canDecrease}
            aria-label={`Decrease ${accessibleLabel.toLowerCase()}`}
          >
            <Minus size={15} strokeWidth={1.6} aria-hidden="true" />
          </button>
          <output className="mk-quantity-selector__value" aria-live="polite" aria-atomic="true">
            {safeValue}
          </output>
          <button
            type="button"
            className="mk-quantity-selector__button"
            onClick={() => updateQuantity(safeValue + 1)}
            disabled={!canIncrease}
            aria-label={`Increase ${accessibleLabel.toLowerCase()}`}
          >
            <Plus size={15} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>
        {showHint && (
          <p className="mk-quantity-selector__hint">
            {isOutOfStock ? "Currently unavailable" : `Maximum ${effectiveMax} per order`}
          </p>
        )}
      </div>
    </>
  );
}
