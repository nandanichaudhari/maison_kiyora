import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, LockKeyhole, ShoppingBag, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import useCart from "../../hooks/useCart.js";
import ShippingAddressForm, {
  EMPTY_SHIPPING_ADDRESS,
  validateShippingAddress,
} from "./ShippingAddressForm.jsx";
import PaymentMethods from "./PaymentMethods.jsx";

// MAISON KIYORA — THE ART OF SLOW PERFUMERY
// Checkout orchestration only. The server must calculate authoritative
// prices, shipping, taxes and inventory, create a gateway order,
// and verify payment before fulfilling an order.

const STYLES = `
  .mk-checkout{width:100%;color:#1d2940;font-family:"Manrope",sans-serif}
  .mk-checkout *{box-sizing:border-box}
  .mk-checkout__eyebrow{margin:0 0 9px;color:#967a51;font-size:10px;font-weight:700;letter-spacing:.22em;text-transform:uppercase}
  .mk-checkout__title{margin:0;font:500 clamp(35px,4vw,52px)/1.05 "Cormorant Garamond",Georgia,serif;letter-spacing:-.025em}
  .mk-checkout__subtitle{margin:12px 0 28px;color:#707680;font-size:12px;line-height:1.8}
  .mk-checkout__steps{display:flex;align-items:center;gap:12px;margin:0 0 29px;padding:0;list-style:none}
  .mk-checkout__step{display:flex;align-items:center;gap:9px;color:#82858a;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
  .mk-checkout__step--active{color:#1d2940}
  .mk-checkout__number{display:grid;place-items:center;width:27px;height:27px;border:1px solid rgba(29,41,64,.25);border-radius:50%;font-size:11px}
  .mk-checkout__step--active .mk-checkout__number{background:#1d2940;color:#f5f0e8;border-color:#1d2940}
  .mk-checkout__step-line{flex:1;max-width:80px;height:1px;background:rgba(29,41,64,.2)}
  .mk-checkout__grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(270px,340px);gap:36px;align-items:start}
  .mk-checkout__panel{min-width:0;padding:29px;border:1px solid rgba(29,41,64,.12);background:#fffdf9}
  .mk-checkout__summary{position:sticky;top:100px;padding:27px;border:1px solid rgba(29,41,64,.12);background:#f5f0e8}
  .mk-checkout__summary-title{margin:0 0 21px;font:500 31px/1.1 "Cormorant Garamond",Georgia,serif}
  .mk-checkout__item{display:flex;justify-content:space-between;gap:14px;padding:12px 0;border-bottom:1px solid rgba(29,41,64,.1);font-size:11px;line-height:1.6}
  .mk-checkout__item-name{min-width:0;overflow-wrap:anywhere}
  .mk-checkout__item-size{display:block;color:#81848a;font-size:10px;margin-top:3px}
  .mk-checkout__money{white-space:nowrap;font-variant-numeric:tabular-nums;font-weight:600}
  .mk-checkout__totals{display:grid;gap:14px;margin-top:22px}
  .mk-checkout__row{display:flex;justify-content:space-between;gap:12px;font-size:12px;line-height:1.6}
  .mk-checkout__muted{color:#747983}
  .mk-checkout__total{padding-top:17px;border-top:1px solid rgba(29,41,64,.18);font-weight:700}
  .mk-checkout__note{margin:16px 0 0;color:#777b81;font-size:10px;line-height:1.7}
  .mk-checkout__back{display:inline-flex;align-items:center;gap:9px;margin:0 0 22px;padding:8px 0;border:0;background:none;color:#1d2940;font:700 10px "Manrope",sans-serif;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}
  .mk-checkout__back:focus-visible,.mk-checkout__pay:focus-visible{outline:2px solid #b69a69;outline-offset:4px}
  .mk-checkout__address-preview{margin:0 0 26px;padding:17px;border:1px solid rgba(182,154,105,.28);background:#f9f5ee;color:#59616b;font-size:11px;line-height:1.8;overflow-wrap:anywhere}
  .mk-checkout__address-preview strong{display:block;margin-bottom:5px;color:#1d2940}
  .mk-checkout__pay{display:flex;align-items:center;justify-content:center;gap:12px;width:100%;min-height:54px;margin-top:24px;padding:15px;border:1px solid #1d2940;background:#1d2940;color:#f5f0e8;font:700 11px "Manrope",sans-serif;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}
  .mk-checkout__pay:disabled{opacity:.45;cursor:not-allowed}
  .mk-checkout__security{display:flex;align-items:center;gap:9px;margin-top:15px;color:#777b81;font-size:10px;line-height:1.7}
  .mk-checkout__error{margin:17px 0 0;padding:13px 15px;border:1px solid rgba(160,60,60,.2);color:#a13e3e;background:#fff5f3;font-size:12px;line-height:1.6}
  .mk-checkout__empty{display:flex;flex-direction:column;align-items:center;gap:12px;padding:44px 20px;border:1px solid rgba(29,41,64,.12);text-align:center;color:#747983}
  .mk-checkout__empty p{margin:0;font-size:13px;line-height:1.7}
  @media(max-width:900px){.mk-checkout__grid{grid-template-columns:1fr;gap:22px}.mk-checkout__summary{position:static}}
  @media(max-width:550px){.mk-checkout__panel,.mk-checkout__summary{padding:20px 17px}.mk-checkout__steps{gap:8px}.mk-checkout__step{font-size:9px;gap:6px}}
`;

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

const safeMoney = (value) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;

const itemPrice = (item) => {
  const raw = item?.price;
  const number =
    typeof raw === "number"
      ? raw
      : typeof raw === "string"
        ? Number(raw.replace(/[₹,\s]/g, ""))
        : NaN;
  return Number.isFinite(number) && number >= 0 ? number : 0;
};

const itemQty = (item) => {
  const qty = Number(item?.quantity);
  return Number.isInteger(qty) && qty > 0 ? qty : 0;
};

/**
 * @param {object} props
 * @param {object} [props.initialAddress] Prefill a previously saved address.
 * @param {(address:object)=>void|Promise<void>} [props.onAddressConfirmed]
 *   Optional callback to validate/save an address. Throw to block advancement.
 * @param {(payload:object)=>Promise<unknown>} [props.onPlaceOrder]
 *   REQUIRED for payment: backend-driven order creation and secure gateway handoff.
 *   Do not treat callback resolution as proof that payment succeeded.
 * @param {number|null} [props.shippingAmount] Server-quoted shipping; null = unknown.
 * @param {number|null} [props.taxAmount] Server-quoted additional taxes; null = unknown.
 * @param {number|null} [props.discountAmount] Server-quoted discount; null = none.
 * @param {string[]} [props.availableMethods] Gateway-supported methods.
 * @param {boolean} [props.loading] External loading state.
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 */
export default function CheckoutForm({
  initialAddress = EMPTY_SHIPPING_ADDRESS,
  onAddressConfirmed,
  onPlaceOrder,
  shippingAmount = null,
  taxAmount = null,
  discountAmount = null,
  availableMethods = ["upi", "card", "netbanking", "wallet"],
  loading = false,
  disabled = false,
  className = "",
}) {
  const { cartItems, cartSubtotal } = useCart();
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState("shipping");
  const [address, setAddress] = useState(initialAddress);
  const [confirmedAddress, setConfirmedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);

  const items = Array.isArray(cartItems) ? cartItems : [];
  const count = items.reduce((sum, item) => sum + itemQty(item), 0);
  const calculatedSubtotal = items.reduce(
    (sum, item) => sum + itemPrice(item) * itemQty(item),
    0
  );
  const subtotal =
    typeof cartSubtotal === "number" && Number.isFinite(cartSubtotal)
      ? Math.max(0, cartSubtotal)
      : calculatedSubtotal;
  const shipping = safeMoney(shippingAmount);
  const tax = safeMoney(taxAmount);
  const discount = safeMoney(discountAmount) ?? 0;
  const total = Math.max(0, subtotal + (shipping ?? 0) + (tax ?? 0) - discount);
  const chargesPending = shipping === null || tax === null;
  const busy = disabled || loading || submitting;
  const isEmpty = items.length === 0 || count === 0;
  const paymentAvailable = Array.isArray(availableMethods) &&
    availableMethods.includes(paymentMethod);

  const checkoutPayload = useMemo(
    () => ({
      address: confirmedAddress,
      paymentMethod,
      // Informational snapshot ONLY. Never trust client totals on the server.
      items: items.map((item) => ({
        key: item.key,
        productId: item.productId ?? item.id,
        variantId: item.variantId ?? null,
        quantity: itemQty(item),
      })),
      estimate: {
        subtotal,
        shipping,
        tax,
        discount,
        total,
        chargesPending,
        currency: "INR",
      },
    }),
    // cartItems is managed by CartContext; recalculation is intentional.
    [cartItems, confirmedAddress, paymentMethod, subtotal, shipping, tax, discount, total, chargesPending]
  );

  async function confirmAddress(nextAddress) {
    if (busy || submitLock.current) return;
    const errors = validateShippingAddress(nextAddress);
    if (Object.keys(errors).length) {
      setError("Please complete your shipping address before continuing.");
      return;
    }
    submitLock.current = true;
    setSubmitting(true);
    setError("");
    try {
      await onAddressConfirmed?.(nextAddress);
      setAddress(nextAddress);
      setConfirmedAddress(nextAddress);
      setStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm address. Please try again.");
      throw err; // Allows ShippingAddressForm to show its own error.
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  }

  async function placeOrder() {
    if (busy || submitLock.current || !confirmedAddress || isEmpty) return;
    if (!paymentAvailable) {
      setError("Please choose an available payment method.");
      return;
    }
    if (typeof onPlaceOrder !== "function") {
      setError("Secure payment is not connected yet. Please try again later.");
      return;
    }
    submitLock.current = true;
    setSubmitting(true);
    setError("");
    try {
      // Must create a server-side order and hand off to a real gateway.
      // The backend verifies the gateway response/webhook before marking paid.
      await onPlaceOrder(checkoutPayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment. Please try again.");
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  }

  if (isEmpty) {
    return (
      <section className={`mk-checkout ${className}`.trim()} aria-label="Checkout">
        <style>{STYLES}</style>
        <div className="mk-checkout__empty">
          <ShoppingBag size={29} strokeWidth={1.3} aria-hidden="true" />
          <p>Your shopping bag is empty. Add a fragrance before checkout.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`mk-checkout ${className}`.trim()} aria-label="Checkout">
      <style>{STYLES}</style>
      <header>
        <p className="mk-checkout__eyebrow">Maison Kiyora · Secure Checkout</p>
        <h1 className="mk-checkout__title">Complete Your Order</h1>
        <p className="mk-checkout__subtitle">
          A thoughtful final step before your fragrance finds its way home.
        </p>
      </header>

      <ol className="mk-checkout__steps" aria-label="Checkout progress">
        <li className={`mk-checkout__step ${step === "shipping" ? "mk-checkout__step--active" : ""}`}>
          <span className="mk-checkout__number">1</span> Shipping
        </li>
        <li className="mk-checkout__step-line" aria-hidden="true" />
        <li className={`mk-checkout__step ${step === "payment" ? "mk-checkout__step--active" : ""}`}>
          <span className="mk-checkout__number">2</span> Payment
        </li>
      </ol>

      <div className="mk-checkout__grid">
        <motion.div
          key={step}
          className="mk-checkout__panel"
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.25 }}
        >
          {step === "shipping" ? (
            <ShippingAddressForm
              value={address}
              onChange={setAddress}
              onSubmit={confirmAddress}
              loading={busy}
              disabled={busy}
              submitLabel="Continue to Payment"
            />
          ) : (
            <>
              <button
                type="button"
                className="mk-checkout__back"
                onClick={() => { setStep("shipping"); setError(""); }}
                disabled={busy}
              >
                <ArrowLeft size={15} aria-hidden="true" /> Edit Shipping Address
              </button>

              <div className="mk-checkout__address-preview">
                <strong>Delivering to {confirmedAddress?.fullName}</strong>
                {confirmedAddress?.addressLine1}
                {confirmedAddress?.addressLine2 ? `, ${confirmedAddress.addressLine2}` : ""}
                {confirmedAddress?.landmark ? `, near ${confirmedAddress.landmark}` : ""}
                <div>{confirmedAddress?.city}, {confirmedAddress?.state} — {confirmedAddress?.postalCode}</div>
                <div>Mobile: {confirmedAddress?.phone}</div>
              </div>

              <PaymentMethods
                value={paymentMethod}
                onChange={(next) => { setPaymentMethod(next); setError(""); }}
                availableMethods={availableMethods}
                loading={busy}
                disabled={busy}
                showPayButton={false}
              />

              <motion.button
                type="button"
                className="mk-checkout__pay"
                onClick={placeOrder}
                disabled={busy || !paymentAvailable || typeof onPlaceOrder !== "function"}
                whileTap={reducedMotion || busy ? undefined : { scale: 0.985 }}
                aria-busy={busy}
              >
                <LockKeyhole size={16} aria-hidden="true" />
                {busy ? "Please Wait..." : "Continue to Secure Payment"}
                {!busy && <ArrowRight size={16} aria-hidden="true" />}
              </motion.button>

              {typeof onPlaceOrder !== "function" && (
                <p className="mk-checkout__error" role="status">
                  Secure payment integration is not connected yet.
                </p>
              )}
              <p className="mk-checkout__security">
                <ShieldCheck size={15} aria-hidden="true" />
                Payment is processed by your payment provider, not this form.
              </p>
            </>
          )}
          {error && <p className="mk-checkout__error" role="alert">{error}</p>}
        </motion.div>

        <aside className="mk-checkout__summary" aria-label="Order summary">
          <p className="mk-checkout__eyebrow">Your Selection</p>
          <h2 className="mk-checkout__summary-title">Order Summary</h2>
          {items.map((item, index) => (
            <div className="mk-checkout__item" key={item.key ?? `${item.productId ?? item.id}-${index}`}>
              <span className="mk-checkout__item-name">
                {item.name ?? item.title ?? "Fragrance"} × {itemQty(item)}
                {(item.size || item.variantName) && (
                  <span className="mk-checkout__item-size">{item.size ?? item.variantName}</span>
                )}
              </span>
              <span className="mk-checkout__money">{money(itemPrice(item) * itemQty(item))}</span>
            </div>
          ))}
          <div className="mk-checkout__totals">
            <div className="mk-checkout__row">
              <span className="mk-checkout__muted">Items ({count})</span>
              <span className="mk-checkout__money">{money(subtotal)}</span>
            </div>
            <div className="mk-checkout__row">
              <span className="mk-checkout__muted">Shipping</span>
              <span>{shipping === null ? "Calculated later" : shipping === 0 ? "Free" : money(shipping)}</span>
            </div>
            <div className="mk-checkout__row">
              <span className="mk-checkout__muted">Additional taxes</span>
              <span>{tax === null ? "Confirmed later" : money(tax)}</span>
            </div>
            {discount > 0 && (
              <div className="mk-checkout__row">
                <span className="mk-checkout__muted">Discount</span>
                <span>−{money(discount)}</span>
              </div>
            )}
            <div className="mk-checkout__row mk-checkout__total">
              <span>{chargesPending ? "Estimated total" : "Total estimate"}</span>
              <span className="mk-checkout__money">{money(total)}</span>
            </div>
          </div>
          <p className="mk-checkout__note">
            Displayed amounts are estimates. Final product prices, stock, delivery,
            discounts and taxes must be confirmed by the server before payment.
          </p>
        </aside>
      </div>
    </section>
  );
}
