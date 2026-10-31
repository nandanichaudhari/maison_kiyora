import { useId, useMemo, useState } from "react";
import {
  CreditCard,
  Landmark,
  Smartphone,
  Wallet,
  ShieldCheck,
  Check,
  Info,
  LoaderCircle,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

// MAISON KIYORA — Payment method selection UI.
// IMPORTANT: This component NEVER collects card details, creates payments,
// charges customers, or confirms orders. Integrate a secure payment gateway
// on the server and verify the payment server-side before marking an order paid.

export const PAYMENT_METHODS = Object.freeze([
  {
    id: "upi",
    title: "UPI",
    description: "Pay using any supported UPI app",
    icon: Smartphone,
  },
  {
    id: "card",
    title: "Credit or Debit Card",
    description: "Pay securely through the payment gateway",
    icon: CreditCard,
  },
  {
    id: "netbanking",
    title: "Net Banking",
    description: "Choose your bank at the secure payment step",
    icon: Landmark,
  },
  {
    id: "wallet",
    title: "Wallet",
    description: "Available wallets depend on your payment provider",
    icon: Wallet,
  },
]);

const STYLES = `
  .mk-payment-methods{font-family:"Manrope",sans-serif;color:#1d2940;width:100%}
  .mk-payment-methods__heading{margin:0 0 8px;font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(29px,3vw,38px);font-weight:500;line-height:1.1}
  .mk-payment-methods__intro{margin:0 0 24px;color:#69717d;font-size:12px;line-height:1.8}
  .mk-payment-methods__list{display:grid;gap:12px}
  .mk-payment-methods__option{display:flex;align-items:center;gap:15px;width:100%;min-height:83px;padding:18px;border:1px solid rgba(29,41,64,.17);background:#fffdf9;color:#1d2940;text-align:left;cursor:pointer;transition:border-color .2s,background .2s,box-shadow .2s}
  .mk-payment-methods__option:hover:not(:disabled){border-color:#b69a69;background:#fffaf0}
  .mk-payment-methods__option[aria-checked="true"]{border-color:#b69a69;background:#f5f0e8;box-shadow:inset 0 0 0 1px #b69a69}
  .mk-payment-methods__option:focus-visible{outline:2px solid #b69a69;outline-offset:3px}
  .mk-payment-methods__option:disabled{opacity:.48;cursor:not-allowed}
  .mk-payment-methods__icon{display:flex;align-items:center;justify-content:center;flex:0 0 42px;height:42px;background:rgba(182,154,105,.12);color:#967a51}
  .mk-payment-methods__copy{display:flex;flex:1;flex-direction:column;gap:5px;min-width:0}
  .mk-payment-methods__name{font-size:12px;font-weight:700;letter-spacing:.025em}
  .mk-payment-methods__description{font-size:11px;line-height:1.6;color:#737983}
  .mk-payment-methods__radio{display:flex;align-items:center;justify-content:center;flex:0 0 20px;width:20px;height:20px;border:1px solid #a8a7a4;border-radius:50%;color:#fff}
  .mk-payment-methods__option[aria-checked="true"] .mk-payment-methods__radio{background:#1d2940;border-color:#1d2940}
  .mk-payment-methods__note{display:flex;align-items:flex-start;gap:10px;margin-top:20px;padding:14px 16px;background:rgba(182,154,105,.09);border:1px solid rgba(182,154,105,.2);color:#626773;font-size:11px;line-height:1.7}
  .mk-payment-methods__note svg{flex-shrink:0;margin-top:2px;color:#967a51}
  .mk-payment-methods__error{margin:14px 0 0;color:#a13e3e;font-size:12px;line-height:1.6}
  .mk-payment-methods__submit{display:flex;align-items:center;justify-content:center;gap:12px;width:100%;min-height:54px;margin-top:24px;padding:14px 20px;border:1px solid #1d2940;background:#1d2940;color:#f5f0e8;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;cursor:pointer;transition:background .2s}
  .mk-payment-methods__submit:hover:not(:disabled){background:#293a58}
  .mk-payment-methods__submit:focus-visible{outline:2px solid #b69a69;outline-offset:3px}
  .mk-payment-methods__submit:disabled{opacity:.5;cursor:not-allowed}
  .mk-payment-methods__spin{animation:mk-payment-spin .9s linear infinite}
  @keyframes mk-payment-spin{to{transform:rotate(360deg)}}
  @media(max-width:480px){.mk-payment-methods__option{padding:14px 12px;gap:11px}.mk-payment-methods__icon{flex-basis:36px;height:36px}}
  @media(prefers-reduced-motion:reduce){.mk-payment-methods__option,.mk-payment-methods__submit{transition:none}.mk-payment-methods__spin{animation:none}}
`;

/**
 * @param {object} props
 * @param {string} [props.value] Controlled selected method ID.
 * @param {string} [props.defaultValue="upi"] Initial selection in uncontrolled mode.
 * @param {(methodId:string)=>void} [props.onChange]
 * @param {string[]} [props.availableMethods] IDs actually enabled in your gateway.
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.loading]
 * @param {boolean} [props.showPayButton=false] Opt-in; default is selection only.
 * @param {(methodId:string)=>Promise<void>|void} [props.onContinue] Your checkout handler; MUST perform real gateway integration.
 * @param {string} [props.buttonLabel]
 * @param {string} [props.error]
 * @param {string} [props.className]
 */
export default function PaymentMethods({
  value,
  defaultValue = "upi",
  onChange,
  availableMethods = ["upi", "card", "netbanking", "wallet"],
  disabled = false,
  loading = false,
  showPayButton = false,
  onContinue,
  buttonLabel = "Continue to Secure Payment",
  error,
  className = "",
}) {
  const groupId = useId();
  const reducedMotion = useReducedMotion();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const enabledMethods = useMemo(() => {
    const ids = Array.isArray(availableMethods) ? availableMethods : [];
    return PAYMENT_METHODS.filter((method) => ids.includes(method.id));
  }, [availableMethods]);
  const selected = value !== undefined ? value : internalValue;
  const selectedIsAvailable = enabledMethods.some((method) => method.id === selected);
  const busy = disabled || loading || submitting;

  function selectMethod(id) {
    if (busy || !enabledMethods.some((method) => method.id === id)) return;
    if (value === undefined) setInternalValue(id);
    setLocalError("");
    onChange?.(id);
  }

  function handleKeyDown(event, index) {
    if (busy || !enabledMethods.length) return;
    const key = event.key;
    if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(key)) return;
    event.preventDefault();
    const nextIndex = key === "Home" ? 0 : key === "End" ? enabledMethods.length - 1 :
      (index + (key === "ArrowDown" || key === "ArrowRight" ? 1 : -1) + enabledMethods.length) % enabledMethods.length;
    const next = enabledMethods[nextIndex];
    selectMethod(next.id);
    document.getElementById(`${groupId}-${next.id}`)?.focus();
  }

  async function handleContinue() {
    if (busy) return;
    if (!selectedIsAvailable) {
      setLocalError("Please select an available payment method.");
      return;
    }
    if (typeof onContinue !== "function") {
      setLocalError("Payment gateway is not connected yet. Please try again later.");
      return;
    }
    setSubmitting(true);
    setLocalError("");
    try {
      await onContinue(selected);
    } catch (err) {
      console.error("Maison Kiyora: payment handoff failed", err);
      setLocalError("Could not open secure payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={`mk-payment-methods ${className}`.trim()} aria-labelledby={`${groupId}-title`}>
      <style>{STYLES}</style>
      <h2 className="mk-payment-methods__heading" id={`${groupId}-title`}>Payment Method</h2>
      <p className="mk-payment-methods__intro">Choose how you would like to pay for your fragrance.</p>
      <div className="mk-payment-methods__list" role="radiogroup" aria-label="Payment method">
        {enabledMethods.map((method, index) => {
          const Icon = method.icon;
          const checked = selected === method.id;
          return (
            <motion.button
              key={method.id}
              id={`${groupId}-${method.id}`}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked || (!selectedIsAvailable && index === 0) ? 0 : -1}
              disabled={busy}
              className="mk-payment-methods__option"
              onClick={() => selectMethod(method.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              whileTap={reducedMotion || busy ? undefined : { scale: 0.995 }}
            >
              <span className="mk-payment-methods__icon"><Icon size={20} strokeWidth={1.5} aria-hidden="true" /></span>
              <span className="mk-payment-methods__copy">
                <span className="mk-payment-methods__name">{method.title}</span>
                <span className="mk-payment-methods__description">{method.description}</span>
              </span>
              <span className="mk-payment-methods__radio" aria-hidden="true">{checked && <Check size={12} strokeWidth={2.5} />}</span>
            </motion.button>
          );
        })}
        {enabledMethods.length === 0 && <p className="mk-payment-methods__description">Payment methods are currently unavailable.</p>}
      </div>
      <div className="mk-payment-methods__note">
        <ShieldCheck size={17} strokeWidth={1.6} aria-hidden="true" />
        <span>Payment details will be entered only on the secure payment gateway. Availability of each method depends on your payment provider.</span>
      </div>
      {(error || localError) && <p role="alert" className="mk-payment-methods__error">{error || localError}</p>}
      {showPayButton && (
        <motion.button
          type="button"
          className="mk-payment-methods__submit"
          disabled={busy || !selectedIsAvailable}
          onClick={handleContinue}
          aria-busy={loading || submitting}
          whileTap={reducedMotion || busy ? undefined : { scale: 0.985 }}
        >
          {loading || submitting ? <LoaderCircle size={17} className="mk-payment-methods__spin" aria-hidden="true" /> : <Info size={16} aria-hidden="true" />}
          {loading || submitting ? "Please wait..." : buttonLabel}
        </motion.button>
      )}
    </section>
  );
}
