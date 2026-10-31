import { useId, useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";

// MAISON KIYORA — controlled collection filters.
// Parent owns filters and applies them to product data.
// Example filters: { category: "all", note: "all", minPrice: 0,
//                    maxPrice: 10000, inStockOnly: false, sortBy: "featured" }

export const DEFAULT_PRODUCT_FILTERS = Object.freeze({
  category: "all",
  note: "all",
  minPrice: 0,
  maxPrice: 10000,
  inStockOnly: false,
  sortBy: "featured",
});

const DEFAULT_CATEGORIES = [
  { value: "all", label: "All Fragrances" },
  { value: "floral", label: "Floral" },
  { value: "woody", label: "Woody" },
  { value: "fresh", label: "Fresh" },
  { value: "oriental", label: "Amber & Oriental" },
  { value: "citrus", label: "Citrus" },
];

const DEFAULT_NOTES = [
  { value: "all", label: "All Notes" },
  { value: "rose", label: "Rose" },
  { value: "jasmine", label: "Jasmine" },
  { value: "oud", label: "Oud" },
  { value: "musk", label: "Musk" },
  { value: "vanilla", label: "Vanilla" },
  { value: "sandalwood", label: "Sandalwood" },
];

const DEFAULT_SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
];

const STYLES = `
  .mk-filters { font-family: "Manrope", sans-serif; color: #1d2940; width: 100%; }
  .mk-filters * { box-sizing: border-box; }
  .mk-filters__toolbar { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 20px; }
  .mk-filters__heading { display: flex; align-items: center; gap: 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .16em; }
  .mk-filters__count { color: #857e73; font-size: 11px; font-weight: 400; letter-spacing: 0; text-transform: none; }
  .mk-filters__toolbar-actions { display: flex; gap: 10px; align-items: center; }
  .mk-filters__toggle, .mk-filters__clear { appearance: none; display: inline-flex; align-items: center; justify-content: center; gap: 7px; border: 1px solid rgba(29,41,64,.22); background: transparent; color: #1d2940; padding: 10px 13px; min-height: 40px; cursor: pointer; font: 600 10px "Manrope", sans-serif; letter-spacing: .09em; text-transform: uppercase; transition: background .2s ease, border-color .2s ease; }
  .mk-filters__toggle:hover, .mk-filters__clear:hover { background: rgba(182,154,105,.1); border-color: #b69a69; }
  .mk-filters__clear:disabled { opacity: .4; cursor: not-allowed; }
  .mk-filters__panel { border: 1px solid rgba(29,41,64,.12); background: #f5f0e8; padding: 22px; }
  .mk-filters__grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; align-items: end; }
  .mk-filters__field { display: flex; flex-direction: column; gap: 9px; min-width: 0; }
  .mk-filters__label { font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
  .mk-filters__select-wrap { position: relative; }
  .mk-filters__select { appearance: none; width: 100%; min-height: 43px; border: 1px solid rgba(29,41,64,.2); border-radius: 0; background: #fffdf9; color: #1d2940; padding: 10px 34px 10px 12px; font: 500 12px "Manrope", sans-serif; cursor: pointer; }
  .mk-filters__select-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; }
  .mk-filters__price-inputs { display: flex; align-items: center; gap: 8px; }
  .mk-filters__price-input { width: 100%; min-width: 0; min-height: 43px; border: 1px solid rgba(29,41,64,.2); border-radius: 0; background: #fffdf9; color: #1d2940; padding: 9px 8px; font: 500 12px "Manrope", sans-serif; font-variant-numeric: tabular-nums; }
  .mk-filters__price-separator { color: #8a806f; }
  .mk-filters__bottom { display: flex; align-items: center; justify-content: space-between; gap: 18px; flex-wrap: wrap; margin-top: 20px; padding-top: 18px; border-top: 1px solid rgba(29,41,64,.12); }
  .mk-filters__check-label { display: inline-flex; align-items: center; gap: 9px; font-size: 12px; cursor: pointer; }
  .mk-filters__checkbox { width: 16px; height: 16px; accent-color: #1d2940; cursor: pointer; }
  .mk-filters__note { margin: 0; font-size: 11px; color: #81776b; }
  .mk-filters__active { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
  .mk-filters__chip { display: inline-flex; align-items: center; gap: 7px; border: 1px solid rgba(182,154,105,.45); background: rgba(182,154,105,.08); color: #1d2940; padding: 7px 10px; font: 500 11px "Manrope", sans-serif; cursor: pointer; }
  .mk-filters button:focus-visible, .mk-filters input:focus-visible, .mk-filters select:focus-visible { outline: 2px solid #b69a69; outline-offset: 3px; }
  .mk-filters button:disabled { cursor: not-allowed; }
  @media (max-width: 980px) { .mk-filters__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 600px) { .mk-filters__panel { padding: 16px; } .mk-filters__grid { grid-template-columns: 1fr; gap: 16px; } .mk-filters__toolbar { align-items: flex-start; } .mk-filters__toolbar-actions { width: 100%; } .mk-filters__toggle, .mk-filters__clear { flex: 1; } }
  @media (prefers-reduced-motion: reduce) { .mk-filters__toggle, .mk-filters__clear { transition: none; } }
`;

function normalizedOptions(options, fallback) {
  if (!Array.isArray(options)) return fallback;
  return options.map((option) =>
    typeof option === "string"
      ? { value: option, label: option }
      : option
  ).filter((option) => option && option.value != null && option.label != null);
}

function normalizePrice(value, fallback) {
  if (value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : fallback;
}

function SelectField({ id, label, value, options, onChange, disabled }) {
  return (
    <div className="mk-filters__field">
      <label htmlFor={id} className="mk-filters__label">{label}</label>
      <div className="mk-filters__select-wrap">
        <select id={id} className="mk-filters__select" value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled}>
          {options.map((option) => <option key={String(option.value)} value={option.value}>{option.label}</option>)}
        </select>
        <ChevronDown className="mk-filters__select-icon" size={15} aria-hidden="true" />
      </div>
    </div>
  );
}

/**
 * Controlled component. Supply `filters` and `onChange` from the parent.
 * `priceBounds` sets the allowed catalog range; defaults to ₹0–₹10,000.
 * `categories`, `notes`, `sortOptions` can be customized to match Supabase data.
 */
export default function ProductFilters({
  filters = DEFAULT_PRODUCT_FILTERS,
  onChange,
  onClear,
  categories = DEFAULT_CATEGORIES,
  notes = DEFAULT_NOTES,
  sortOptions = DEFAULT_SORT_OPTIONS,
  priceBounds = { min: 0, max: 10000 },
  resultCount,
  defaultOpen = true,
  disabled = false,
  className = "",
  showNotes = true,
  showSort = true,
  showAvailability = true,
}) {
  const id = useId();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const lowerBound = normalizePrice(priceBounds?.min, 0);
  const upperBound = Math.max(lowerBound, normalizePrice(priceBounds?.max, 10000));
  const defaults = { ...DEFAULT_PRODUCT_FILTERS, minPrice: lowerBound, maxPrice: upperBound };
  const current = { ...defaults, ...filters };
  const minPrice = Math.min(upperBound, Math.max(lowerBound, normalizePrice(current.minPrice, lowerBound)));
  const maxPrice = Math.max(minPrice, Math.min(upperBound, normalizePrice(current.maxPrice, upperBound)));
  const categoryOptions = normalizedOptions(categories, DEFAULT_CATEGORIES);
  const noteOptions = normalizedOptions(notes, DEFAULT_NOTES);
  const sortingOptions = normalizedOptions(sortOptions, DEFAULT_SORT_OPTIONS);
  const categoryLabel = categoryOptions.find((option) => String(option.value) === String(current.category))?.label ?? current.category;
  const noteLabel = noteOptions.find((option) => String(option.value) === String(current.note))?.label ?? current.note;
  const activeFilters = [
    current.category !== "all" && { key: "category", label: categoryLabel, reset: "all" },
    showNotes && current.note !== "all" && { key: "note", label: noteLabel, reset: "all" },
    minPrice > lowerBound && { key: "minPrice", label: `From ₹${minPrice.toLocaleString("en-IN")}`, reset: lowerBound },
    maxPrice < upperBound && { key: "maxPrice", label: `Up to ₹${maxPrice.toLocaleString("en-IN")}`, reset: upperBound },
    showAvailability && current.inStockOnly && { key: "inStockOnly", label: "In stock", reset: false },
  ].filter(Boolean);

  const update = (patch) => {
    if (!disabled && typeof onChange === "function") onChange({ ...current, ...patch });
  };
  const clear = () => {
    if (disabled) return;
    if (typeof onClear === "function") onClear();
    else update(defaults);
  };

  return (
    <section className={`mk-filters ${className}`.trim()} aria-label="Filter fragrances">
      <style>{STYLES}</style>
      <div className="mk-filters__toolbar">
        <div className="mk-filters__heading">
          <SlidersHorizontal size={17} strokeWidth={1.5} aria-hidden="true" />
          Refine Your Selection
          {Number.isFinite(resultCount) && <span className="mk-filters__count">({resultCount} {resultCount === 1 ? "fragrance" : "fragrances"})</span>}
        </div>
        <div className="mk-filters__toolbar-actions">
          <button type="button" className="mk-filters__toggle" aria-expanded={isOpen} aria-controls={`${id}-panel`} onClick={() => setIsOpen((open) => !open)}>
            {isOpen ? "Hide Filters" : "Show Filters"}<ChevronDown size={14} style={{ transform: isOpen ? "rotate(180deg)" : "none" }} aria-hidden="true" />
          </button>
          <button type="button" className="mk-filters__clear" onClick={clear} disabled={disabled || activeFilters.length === 0}>
            <X size={13} aria-hidden="true" /> Clear
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mk-filters__panel" id={`${id}-panel`}>
          <div className="mk-filters__grid">
            <SelectField id={`${id}-category`} label="Fragrance Family" value={current.category} options={categoryOptions} disabled={disabled} onChange={(category) => update({ category })} />
            {showNotes && <SelectField id={`${id}-note`} label="Fragrance Note" value={current.note} options={noteOptions} disabled={disabled} onChange={(note) => update({ note })} />}
            <div className="mk-filters__field">
              <span className="mk-filters__label" id={`${id}-price-label`}>Price Range (₹)</span>
              <div className="mk-filters__price-inputs" role="group" aria-labelledby={`${id}-price-label`}>
                <input className="mk-filters__price-input" type="number" inputMode="numeric" min={lowerBound} max={maxPrice} step="1" value={minPrice} aria-label="Minimum price in rupees" disabled={disabled} onChange={(event) => update({ minPrice: Math.min(maxPrice, Math.max(lowerBound, normalizePrice(event.target.value, lowerBound))) })} />
                <span className="mk-filters__price-separator" aria-hidden="true">–</span>
                <input className="mk-filters__price-input" type="number" inputMode="numeric" min={minPrice} max={upperBound} step="1" value={maxPrice} aria-label="Maximum price in rupees" disabled={disabled} onChange={(event) => update({ maxPrice: Math.max(minPrice, Math.min(upperBound, normalizePrice(event.target.value, upperBound))) })} />
              </div>
            </div>
            {showSort && <SelectField id={`${id}-sort`} label="Sort By" value={current.sortBy} options={sortingOptions} disabled={disabled} onChange={(sortBy) => update({ sortBy })} />}
          </div>
          {showAvailability && (
            <div className="mk-filters__bottom">
              <label className="mk-filters__check-label" htmlFor={`${id}-stock`}>
                <input id={`${id}-stock`} className="mk-filters__checkbox" type="checkbox" checked={Boolean(current.inStockOnly)} disabled={disabled} onChange={(event) => update({ inStockOnly: event.target.checked })} />
                Show available fragrances only
              </label>
              <p className="mk-filters__note">Discover a fragrance that feels like you.</p>
            </div>
          )}
        </div>
      )}

      {activeFilters.length > 0 && (
        <div className="mk-filters__active" aria-label="Active filters">
          {activeFilters.map((item) => (
            <button key={item.key} type="button" className="mk-filters__chip" disabled={disabled} onClick={() => update({ [item.key]: item.reset })} aria-label={`Remove filter: ${item.label}`}>
              {item.label}<X size={12} aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
