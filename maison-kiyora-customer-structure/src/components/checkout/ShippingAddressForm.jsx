import { useEffect, useId, useMemo, useState } from "react";
import { Check, MapPin, LoaderCircle } from "lucide-react";

// MAISON KIYORA — Shipping Address Form
// Frontend-only form. Persist/validate the address on your backend during checkout.

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",
  "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export const EMPTY_SHIPPING_ADDRESS = Object.freeze({
  fullName: "", phone: "", email: "", addressLine1: "", addressLine2: "",
  landmark: "", city: "", state: "", postalCode: "", country: "India",
  isDefault: false,
});

const FIELD_NAMES = Object.keys(EMPTY_SHIPPING_ADDRESS);

function normalizeAddress(address) {
  const source = address && typeof address === "object" ? address : {};
  return {
    fullName: String(source.fullName ?? source.name ?? ""),
    phone: String(source.phone ?? source.mobile ?? ""),
    email: String(source.email ?? ""),
    addressLine1: String(source.addressLine1 ?? source.line1 ?? source.address ?? ""),
    addressLine2: String(source.addressLine2 ?? source.line2 ?? ""),
    landmark: String(source.landmark ?? ""),
    city: String(source.city ?? ""),
    state: String(source.state ?? ""),
    postalCode: String(source.postalCode ?? source.pincode ?? source.pinCode ?? source.zip ?? ""),
    country: "India",
    isDefault: Boolean(source.isDefault ?? source.default),
  };
}

export function validateShippingAddress(address) {
  const errors = {};
  const fullName = address.fullName.trim();
  const phone = address.phone.replace(/\D/g, "");
  const email = address.email.trim();
  const line1 = address.addressLine1.trim();
  const city = address.city.trim();
  const postalCode = address.postalCode.trim();

  if (fullName.length < 2 || fullName.length > 100) errors.fullName = "Enter a name between 2 and 100 characters.";
  if (!/^[6-9]\d{9}$/.test(phone)) errors.phone = "Enter a valid 10-digit Indian mobile number.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
  if (line1.length < 5 || line1.length > 200) errors.addressLine1 = "Enter a complete house/flat and street address.";
  if (address.addressLine2.length > 200) errors.addressLine2 = "Address line is too long.";
  if (address.landmark.length > 120) errors.landmark = "Landmark is too long.";
  if (city.length < 2 || city.length > 100) errors.city = "Enter a valid city or town.";
  if (!INDIAN_STATES.includes(address.state)) errors.state = "Select your state or union territory.";
  if (!/^[1-9]\d{5}$/.test(postalCode)) errors.postalCode = "Enter a valid 6-digit Indian PIN code.";
  return errors;
}

const STYLES = `
  .mk-shipping-form { width:100%; color:#1d2940; font-family:"Manrope",sans-serif; }
  .mk-shipping-form * { box-sizing:border-box; }
  .mk-shipping-form__heading { display:flex; align-items:center; gap:12px; margin-bottom:25px; }
  .mk-shipping-form__heading-icon { color:#b69a69; }
  .mk-shipping-form__eyebrow { margin:0 0 5px; color:#967a51; font-size:10px; font-weight:700; letter-spacing:.2em; text-transform:uppercase; }
  .mk-shipping-form__title { margin:0; font-family:"Cormorant Garamond",Georgia,serif; font-size:clamp(28px,3vw,36px); font-weight:500; line-height:1.1; }
  .mk-shipping-form__grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:19px 18px; }
  .mk-shipping-form__field { display:flex; flex-direction:column; gap:8px; min-width:0; }
  .mk-shipping-form__field--wide { grid-column:1 / -1; }
  .mk-shipping-form__label { font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; }
  .mk-shipping-form__required { color:#a64e4e; }
  .mk-shipping-form__input { width:100%; min-height:48px; padding:12px 14px; border:1px solid rgba(29,41,64,.23); border-radius:2px; outline:none; background:#fffdf9; color:#1d2940; font:400 13px/1.5 "Manrope",sans-serif; transition:border-color .2s,box-shadow .2s; }
  .mk-shipping-form__input::placeholder { color:#93959a; }
  .mk-shipping-form__input:focus { border-color:#b69a69; box-shadow:0 0 0 2px rgba(182,154,105,.16); }
  .mk-shipping-form__input[aria-invalid="true"] { border-color:#b45d5d; }
  .mk-shipping-form__input:disabled { background:#eeeae3; cursor:not-allowed; }
  .mk-shipping-form__hint { margin:0; color:#797c80; font-size:10px; line-height:1.5; }
  .mk-shipping-form__error { margin:0; color:#a33e3e; font-size:11px; line-height:1.5; }
  .mk-shipping-form__check { display:flex; align-items:flex-start; gap:10px; margin-top:23px; font-size:12px; line-height:1.6; cursor:pointer; }
  .mk-shipping-form__check input { width:16px; height:16px; margin-top:2px; accent-color:#1d2940; }
  .mk-shipping-form__actions { display:flex; align-items:center; flex-wrap:wrap; gap:16px; margin-top:28px; }
  .mk-shipping-form__submit { display:inline-flex; align-items:center; justify-content:center; gap:10px; min-height:52px; padding:14px 27px; border:1px solid #1d2940; border-radius:2px; background:#1d2940; color:#f5f0e8; font:700 11px/1.3 "Manrope",sans-serif; letter-spacing:.12em; text-transform:uppercase; cursor:pointer; transition:background .2s; }
  .mk-shipping-form__submit:hover:not(:disabled) { background:#293a58; }
  .mk-shipping-form__submit:focus-visible { outline:2px solid #b69a69; outline-offset:3px; }
  .mk-shipping-form__submit:disabled { opacity:.55; cursor:not-allowed; }
  .mk-shipping-form__footnote { margin:0; color:#777a80; font-size:10px; line-height:1.6; }
  .mk-shipping-form__status { margin:16px 0 0; color:#a33e3e; font-size:12px; }
  .mk-shipping-form__spinner { animation:mk-shipping-spin .9s linear infinite; }
  @keyframes mk-shipping-spin { to { transform:rotate(360deg); } }
  @media(max-width:600px) { .mk-shipping-form__grid { grid-template-columns:1fr; gap:17px; } .mk-shipping-form__field--wide { grid-column:auto; } .mk-shipping-form__submit { width:100%; } }
  @media(prefers-reduced-motion:reduce) { .mk-shipping-form__input,.mk-shipping-form__submit { transition:none; } .mk-shipping-form__spinner { animation:none; } }
`;

/**
 * Controlled: <ShippingAddressForm value={address} onChange={setAddress} onSubmit={save} />
 * Uncontrolled: <ShippingAddressForm defaultValue={savedAddress} onSubmit={save} />
 * onSubmit receives normalized address; may return a Promise. Throw to show an error.
 */
export default function ShippingAddressForm({
  value,
  defaultValue,
  onChange,
  onSubmit,
  disabled = false,
  loading = false,
  showDefaultCheckbox = false,
  showSubmitButton = true,
  submitLabel = "Continue to Payment",
  className = "",
  id,
}) {
  const generatedId = useId();
  const formId = id || generatedId;
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(() => normalizeAddress(defaultValue));
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const address = useMemo(() => normalizeAddress(controlled ? value : internalValue), [controlled, value, internalValue]);
  const errors = useMemo(() => validateShippingAddress(address), [address]);
  const busy = disabled || loading || submitting;

  // When switching between saved addresses, parent should pass `value` or remount with a `key`.
  useEffect(() => { setSubmitError(""); }, [value]);

  const setField = (name, nextValue) => {
    if (busy || !FIELD_NAMES.includes(name)) return;
    const next = { ...address, [name]: nextValue };
    if (!controlled) setInternalValue(next);
    onChange?.(next);
    setSubmitError("");
  };

  const markTouched = (name) => setTouched((previous) => ({ ...previous, [name]: true }));

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setAttempted(true);
    setTouched(Object.fromEntries(FIELD_NAMES.map((field) => [field, true])));
    if (Object.keys(errors).length) {
      const firstInvalid = Object.keys(errors)[0];
      document.getElementById(`${formId}-${firstInvalid}`)?.focus();
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      await onSubmit?.({
        ...address,
        fullName: address.fullName.trim(),
        phone: address.phone.replace(/\D/g, ""),
        email: address.email.trim(),
        addressLine1: address.addressLine1.trim(),
        addressLine2: address.addressLine2.trim(),
        landmark: address.landmark.trim(),
        city: address.city.trim(),
        postalCode: address.postalCode.trim(),
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not continue. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name, label, options = {}) => {
    const { wide = false, required = false, placeholder = "", type = "text", hint, autoComplete, maxLength, inputMode } = options;
    const fieldId = `${formId}-${name}`;
    const showError = (touched[name] || attempted) && errors[name];
    return (
      <div className={`mk-shipping-form__field${wide ? " mk-shipping-form__field--wide" : ""}`}>
        <label className="mk-shipping-form__label" htmlFor={fieldId}>
          {label} {required && <span className="mk-shipping-form__required" aria-hidden="true">*</span>}
        </label>
        {name === "state" ? (
          <select id={fieldId} name={name} className="mk-shipping-form__input" value={address.state}
            onChange={(event) => setField(name, event.target.value)} onBlur={() => markTouched(name)}
            disabled={busy} required={required} aria-invalid={Boolean(showError)}
            aria-describedby={showError ? `${fieldId}-error` : undefined} autoComplete="address-level1">
            <option value="">Select state / UT</option>
            {INDIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
          </select>
        ) : (
          <input id={fieldId} name={name} type={type} className="mk-shipping-form__input"
            value={address[name]} onChange={(event) => setField(name, event.target.value)}
            onBlur={() => markTouched(name)} disabled={busy} required={required}
            placeholder={placeholder} autoComplete={autoComplete} maxLength={maxLength}
            inputMode={inputMode} aria-invalid={Boolean(showError)}
            aria-describedby={showError ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined} />
        )}
        {hint && !showError && <p id={`${fieldId}-hint`} className="mk-shipping-form__hint">{hint}</p>}
        {showError && <p id={`${fieldId}-error`} className="mk-shipping-form__error" role="alert">{errors[name]}</p>}
      </div>
    );
  };

  return (
    <>
      <style>{STYLES}</style>
      <form id={formId} className={["mk-shipping-form", className].filter(Boolean).join(" ")}
        onSubmit={submit} noValidate aria-busy={loading || submitting}>
        <div className="mk-shipping-form__heading">
          <MapPin className="mk-shipping-form__heading-icon" size={26} strokeWidth={1.4} aria-hidden="true" />
          <div>
            <p className="mk-shipping-form__eyebrow">Delivery Details</p>
            <h2 className="mk-shipping-form__title">Shipping Address</h2>
          </div>
        </div>
        <div className="mk-shipping-form__grid">
          {field("fullName", "Full Name", { required: true, placeholder: "Name of recipient", autoComplete: "name", maxLength: 100 })}
          {field("phone", "Mobile Number", { required: true, placeholder: "10-digit mobile number", type: "tel", inputMode: "numeric", autoComplete: "tel-national", maxLength: 10 })}
          {field("email", "Email Address", { wide: true, placeholder: "Optional email for order updates", type: "email", autoComplete: "email", maxLength: 254 })}
          {field("addressLine1", "House / Flat / Street Address", { wide: true, required: true, placeholder: "House number, building and street", autoComplete: "address-line1", maxLength: 200 })}
          {field("addressLine2", "Area / Locality", { wide: true, placeholder: "Apartment, locality (optional)", autoComplete: "address-line2", maxLength: 200 })}
          {field("landmark", "Landmark", { wide: true, placeholder: "Nearby landmark (optional)", maxLength: 120 })}
          {field("city", "City / Town", { required: true, placeholder: "City or town", autoComplete: "address-level2", maxLength: 100 })}
          {field("state", "State / Union Territory", { required: true })}
          {field("postalCode", "PIN Code", { required: true, placeholder: "6-digit PIN code", inputMode: "numeric", autoComplete: "postal-code", maxLength: 6 })}
          <div className="mk-shipping-form__field">
            <label className="mk-shipping-form__label" htmlFor={`${formId}-country`}>Country</label>
            <input id={`${formId}-country`} className="mk-shipping-form__input" value="India" disabled readOnly />
          </div>
        </div>
        {showDefaultCheckbox && (
          <label className="mk-shipping-form__check">
            <input type="checkbox" checked={address.isDefault} onChange={(event) => setField("isDefault", event.target.checked)} disabled={busy} />
            <span>Save as my default shipping address</span>
          </label>
        )}
        {submitError && <p className="mk-shipping-form__status" role="alert">{submitError}</p>}
        {showSubmitButton && (
          <div className="mk-shipping-form__actions">
            <button type="submit" className="mk-shipping-form__submit" disabled={busy}>
              {loading || submitting ? <LoaderCircle className="mk-shipping-form__spinner" size={17} aria-hidden="true" /> : <Check size={17} strokeWidth={1.7} aria-hidden="true" />}
              {loading || submitting ? "Please Wait..." : submitLabel}
            </button>
            <p className="mk-shipping-form__footnote">Delivery availability and final charges are confirmed at checkout.</p>
          </div>
        )}
      </form>
    </>
  );
}
