import { useId, useMemo, useState } from "react";
import { ArrowDownUp, ChevronDown } from "lucide-react";

// MAISON KIYORA — reusable, accessible product sorting control.
// Controlled: <SortDropdown value={sortBy} onChange={setSortBy} />
// Uncontrolled: <SortDropdown defaultValue="featured" />
// Sorting the actual product array is the responsibility of the parent.

export const SORT_OPTIONS = Object.freeze([
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
]);

const STYLES = `
  .mk-sort { display: inline-flex; align-items: center; gap: 12px; max-width: 100%; color: #1d2940; font-family: "Manrope", sans-serif; }
  .mk-sort *, .mk-sort *::before, .mk-sort *::after { box-sizing: border-box; }
  .mk-sort__label { flex-shrink: 0; color: #1d2940; font-size: 10px; font-weight: 700; line-height: 1.4; letter-spacing: .14em; text-transform: uppercase; }
  .mk-sort__field { position: relative; display: flex; align-items: center; min-width: 180px; max-width: 100%; }
  .mk-sort__leading { position: absolute; left: 13px; color: #b69a69; pointer-events: none; }
  .mk-sort__select { appearance: none; -webkit-appearance: none; width: 100%; min-height: 46px; padding: 11px 36px 11px 38px; border: 1px solid rgba(29,41,64,.24); border-radius: 2px; background: #fffdf9; color: #1d2940; font: 500 12px/1.4 "Manrope", sans-serif; cursor: pointer; transition: border-color .2s ease, background .2s ease; }
  .mk-sort__select:hover:not(:disabled) { border-color: #b69a69; background: #f5f0e8; }
  .mk-sort__select:focus-visible { outline: 2px solid #b69a69; outline-offset: 3px; }
  .mk-sort__select:disabled { opacity: .5; cursor: not-allowed; }
  .mk-sort__chevron { position: absolute; right: 12px; pointer-events: none; color: #1d2940; }
  .mk-sort--compact .mk-sort__field { min-width: 155px; }
  .mk-sort--compact .mk-sort__select { min-height: 40px; padding-top: 9px; padding-bottom: 9px; font-size: 11px; }
  .mk-sort--full { display: flex; width: 100%; }
  .mk-sort--full .mk-sort__field { flex: 1; }
  @media (max-width: 480px) { .mk-sort { gap: 8px; } .mk-sort__label { font-size: 9px; } .mk-sort__field { min-width: 0; flex: 1; } .mk-sort__select { font-size: 11px; } }
  @media (prefers-reduced-motion: reduce) { .mk-sort__select { transition: none; } }
`;

function normalizeOptions(options) {
  if (!Array.isArray(options)) return SORT_OPTIONS;
  const normalized = options.map((option) =>
    typeof option === "string"
      ? { value: option, label: option }
      : option
  ).filter((option) => option && option.value != null && option.label != null);
  return normalized.length ? normalized : SORT_OPTIONS;
}

export default function SortDropdown({
  value,
  defaultValue = "featured",
  onChange,
  options = SORT_OPTIONS,
  label = "Sort by",
  showLabel = true,
  disabled = false,
  variant = "default",
  className = "",
  id,
  name = "sortBy",
  "aria-label": ariaLabel,
}) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const normalized = useMemo(() => normalizeOptions(options), [options]);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const controlled = value !== undefined;
  const currentValue = controlled ? value : internalValue;
  const selectedValue = normalized.some((option) => String(option.value) === String(currentValue))
    ? String(currentValue)
    : String(normalized[0].value);

  const handleChange = (event) => {
    const nextValue = event.target.value;
    if (!controlled) setInternalValue(nextValue);
    onChange?.(nextValue);
  };

  const safeVariant = ["default", "compact", "full"].includes(variant)
    ? variant
    : "default";

  return (
    <>
      <style>{STYLES}</style>
      <div className={["mk-sort", `mk-sort--${safeVariant}`, className].filter(Boolean).join(" ")}>
        {showLabel && (
          <label className="mk-sort__label" htmlFor={selectId}>{label}</label>
        )}
        <div className="mk-sort__field">
          <ArrowDownUp className="mk-sort__leading" size={15} strokeWidth={1.6} aria-hidden="true" />
          <select
            id={selectId}
            name={name}
            className="mk-sort__select"
            value={selectedValue}
            onChange={handleChange}
            disabled={disabled}
            aria-label={!showLabel ? (ariaLabel || label) : undefined}
          >
            {normalized.map((option) => (
              <option key={String(option.value)} value={String(option.value)}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="mk-sort__chevron" size={15} strokeWidth={1.6} aria-hidden="true" />
        </div>
      </div>
    </>
  );
}
