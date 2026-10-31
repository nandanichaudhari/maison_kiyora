
import { useEffect, useId, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  LockKeyhole,
  MapPin,
  ShoppingBag,
  Truck,
  UserRound,
  Wallet,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "react-toastify";

import useCart from "../hooks/useCart.js";

// ======================================================
// MAISON KIYORA
// THE ART OF SLOW PERFUMERY
//
// PREMIUM CHECKOUT PAGE
//
// React 19 + React Router DOM 7
//
// FEATURES:
// - Contact information
// - Shipping address form
// - India-specific address fields
// - Basic client-side validation
// - Payment method selection
// - Live order summary
// - CartContext integration
// - Responsive luxury styling
// - Accessible form controls
//
// IMPORTANT:
// This is a frontend-only checkout UI.
//
// No payment is collected here.
// No order is created here.
// No success redirect is performed.
//
// Real checkout requires a backend to:
// 1. Validate product prices and stock
// 2. Calculate shipping and taxes
// 3. Create a pending order
// 4. Create a payment session/order
// 5. Verify payment server-side
// 6. Confirm the order
// ======================================================

// ======================================================
// 01. CONSTANTS
// ======================================================

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

const PAYMENT_METHODS = [
  {
    id: "online",
    title: "Online Payment",
    description:
      "UPI, cards and other supported methods will be shown when the payment gateway is connected.",
    icon: CreditCard,
  },
];

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

// ======================================================
// 02. STYLES
// ======================================================

const STYLES = `
  .mk-checkout {
    min-height: 100vh;
    padding: 56px 24px 110px;
    background: #faf8f4;
    color: #1d2940;
  }

  .mk-checkout__container {
    max-width: 1280px;
    margin: 0 auto;
  }

  .mk-checkout__breadcrumb {
    display: flex;
    align-items: center;
    gap: 11px;
    flex-wrap: wrap;
    margin-bottom: 36px;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    letter-spacing: .06em;
  }

  .mk-checkout__breadcrumb a {
    color: #777a80;
    text-decoration: none;
  }

  .mk-checkout__breadcrumb a:hover {
    color: #967a51;
  }

  .mk-checkout__breadcrumb span {
    color: #b69a69;
  }

  .mk-checkout__eyebrow {
    margin: 0 0 12px;
    color: #967a51;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .23em;
    text-transform: uppercase;
  }

  .mk-checkout__title {
    margin: 0;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(48px, 6vw, 78px);
    font-weight: 400;
    line-height: 1;
    letter-spacing: -.035em;
  }

  .mk-checkout__subtitle {
    margin: 16px 0 0;
    color: #777a80;
    font-family: "Manrope", sans-serif;
    font-size: 12px;
    line-height: 1.8;
  }

  .mk-checkout__layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 390px;
    align-items: start;
    gap: 60px;
    margin-top: 48px;
  }

  .mk-checkout__form {
    min-width: 0;
  }

  .mk-checkout__section {
    margin-bottom: 43px;
  }

  .mk-checkout__section-heading {
    display: flex;
    align-items: center;
    gap: 13px;
    margin-bottom: 25px;
    padding-bottom: 17px;
    border-bottom: 1px solid rgba(29,41,64,.14);
  }

  .mk-checkout__section-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 37px;
    height: 37px;
    flex-shrink: 0;
    border: 1px solid rgba(182,154,105,.4);
    border-radius: 50%;
    color: #967a51;
  }

  .mk-checkout__section-title {
    margin: 0;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 29px;
    font-weight: 500;
    line-height: 1.1;
  }

  .mk-checkout__section-description {
    margin: 6px 0 0;
    color: #777a80;
    font-family: "Manrope", sans-serif;
    font-size: 11px;
    line-height: 1.7;
  }

  .mk-checkout__fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }

  .mk-checkout__field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .mk-checkout__field--full {
    grid-column: 1 / -1;
  }

  .mk-checkout__label {
    color: #1d2940;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .04em;
  }

  .mk-checkout__required {
    color: #967a51;
  }

  .mk-checkout__input,
  .mk-checkout__select {
    width: 100%;
    min-height: 49px;
    padding: 12px 15px;
    border: 1px solid rgba(29,41,64,.2);
    border-radius: 0;
    outline: none;
    background: rgba(255,255,255,.5);
    color: #1d2940;
    font-family: "Manrope", sans-serif;
    font-size: 12px;
    transition:
      border-color 200ms ease,
      background 200ms ease;
  }

  .mk-checkout__input::placeholder {
    color: #a0a0a0;
  }

  .mk-checkout__input:focus,
  .mk-checkout__select:focus {
    border-color: #b69a69;
    background: #fff;
  }

  .mk-checkout__input[aria-invalid="true"],
  .mk-checkout__select[aria-invalid="true"] {
    border-color: #b15b5b;
  }

  .mk-checkout__error {
    margin: 0;
    color: #a64e4e;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    line-height: 1.5;
  }

  .mk-checkout__payment {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .mk-checkout__payment-option {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    padding: 20px;
    border: 1px solid rgba(29,41,64,.18);
    background: rgba(255,255,255,.4);
    cursor: pointer;
  }

  .mk-checkout__payment-option--selected {
    border-color: #b69a69;
    background: #f5f0e8;
  }

  .mk-checkout__payment-radio {
    width: 16px;
    height: 16px;
    margin: 3px 0 0;
    accent-color: #1d2940;
    flex-shrink: 0;
  }

  .mk-checkout__payment-icon {
    flex-shrink: 0;
    margin-top: 1px;
    color: #967a51;
  }

  .mk-checkout__payment-title {
    display: block;
    color: #1d2940;
    font-family: "Manrope", sans-serif;
    font-size: 12px;
    font-weight: 600;
  }

  .mk-checkout__payment-description {
    display: block;
    margin-top: 7px;
    color: #777a80;
    font-family: "Manrope", sans-serif;
    font-size: 11px;
    line-height: 1.7;
  }

  .mk-checkout__payment-status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 14px;
    color: #967a51;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    font-weight: 600;
  }

  .mk-checkout__actions {
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin-top: 15px;
  }

  .mk-checkout__submit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 13px;
    width: 100%;
    min-height: 56px;
    padding: 15px 22px;
    border: 1px solid #1d2940;
    background: #1d2940;
    color: #f5f0e8;
    font-family: "Manrope", sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .12em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 200ms ease;
  }

  .mk-checkout__submit:hover:not(:disabled) {
    background: #293a58;
  }

  .mk-checkout__submit:disabled {
    opacity: .5;
    cursor: not-allowed;
  }

  .mk-checkout__back {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    color: #1d2940;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .09em;
    text-decoration: none;
    text-transform: uppercase;
  }

  .mk-checkout__back:hover {
    color: #967a51;
  }

  .mk-checkout__notice {
    margin: 0;
    color: #777a80;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    line-height: 1.8;
    text-align: center;
  }

  /* ----------------------------------------------
     ORDER SUMMARY
  ---------------------------------------------- */

  .mk-checkout__summary {
    position: sticky;
    top: 110px;
    padding: 29px;
    border: 1px solid rgba(29,41,64,.12);
    background: #f5f0e8;
  }

  .mk-checkout__summary-eyebrow {
    margin: 0 0 10px;
    color: #967a51;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .18em;
    text-transform: uppercase;
  }

  .mk-checkout__summary-title {
    margin: 0;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 34px;
    font-weight: 500;
  }

  .mk-checkout__summary-divider {
    height: 1px;
    margin: 23px 0;
    background: rgba(29,41,64,.14);
  }

  .mk-checkout__products {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .mk-checkout__product {
    display: grid;
    grid-template-columns: 65px minmax(0, 1fr) auto;
    align-items: center;
    gap: 13px;
  }

  .mk-checkout__product-image {
    display: block;
    width: 65px;
    height: 80px;
    object-fit: cover;
    background: #e9e1d5;
  }

  .mk-checkout__product-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 65px;
    height: 80px;
    background: #e9e1d5;
    color: #b69a69;
  }

  .mk-checkout__product-name {
    margin: 0;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 21px;
    font-weight: 600;
    line-height: 1.1;
  }

  .mk-checkout__product-meta {
    margin: 7px 0 0;
    color: #777a80;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    line-height: 1.6;
  }

  .mk-checkout__product-price {
    align-self: center;
    color: #1d2940;
    font-family: "Manrope", sans-serif;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
  }

  .mk-checkout__summary-rows {
    display: flex;
    flex-direction: column;
    gap: 17px;
  }

  .mk-checkout__summary-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    font-family: "Manrope", sans-serif;
    font-size: 11px;
    line-height: 1.6;
  }

  .mk-checkout__summary-row span:first-child {
    color: #777a80;
  }

  .mk-checkout__summary-row strong {
    font-weight: 600;
    text-align: right;
  }

  .mk-checkout__summary-total {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
  }

  .mk-checkout__summary-total span {
    font-family: "Manrope", sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .mk-checkout__summary-total strong {
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 33px;
    font-weight: 600;
  }

  .mk-checkout__summary-note {
    margin: 12px 0 0;
    color: #777a80;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    line-height: 1.8;
  }

  .mk-checkout__delivery-note {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    margin-top: 25px;
    padding: 15px;
    border: 1px solid rgba(182,154,105,.24);
    color: #777a80;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    line-height: 1.7;
  }

  .mk-checkout__delivery-note svg {
    flex-shrink: 0;
    color: #967a51;
  }

  /* ----------------------------------------------
     EMPTY CHECKOUT
  ---------------------------------------------- */

  .mk-checkout__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 420px;
    padding: 45px 20px;
    background: #f5f0e8;
    text-align: center;
  }

  .mk-checkout__empty-icon {
    color: #b69a69;
  }

  .mk-checkout__empty-title {
    margin: 23px 0 12px;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 45px;
    font-weight: 500;
  }

  .mk-checkout__empty-description {
    margin: 0 0 25px;
    color: #777a80;
    font-family: "Manrope", sans-serif;
    font-size: 12px;
    line-height: 1.8;
  }

  .mk-checkout__empty-link {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 23px;
    background: #1d2940;
    color: #f5f0e8;
    font-family: "Manrope", sans-serif;
    font-size: 11px;
    font-weight: 600;
    text-decoration: none;
  }

  /* ----------------------------------------------
     RESPONSIVE
  ---------------------------------------------- */

  @media (max-width: 1100px) {
    .mk-checkout__layout {
      grid-template-columns: minmax(0, 1fr) 350px;
      gap: 35px;
    }
  }

  @media (max-width: 900px) {
    .mk-checkout__layout {
      grid-template-columns: 1fr;
    }

    .mk-checkout__summary {
      position: static;
    }
  }

  @media (max-width: 640px) {
    .mk-checkout {
      padding: 35px 18px 75px;
    }

    .mk-checkout__title {
      font-size: 54px;
    }

    .mk-checkout__layout {
      gap: 30px;
      margin-top: 35px;
    }

    .mk-checkout__fields {
      grid-template-columns: 1fr;
      gap: 17px;
    }

    .mk-checkout__field--full {
      grid-column: auto;
    }

    .mk-checkout__section {
      margin-bottom: 36px;
    }

    .mk-checkout__summary {
      padding: 22px 18px;
    }
  }

  @media (max-width: 380px) {
    .mk-checkout__product {
      grid-template-columns: 55px minmax(0, 1fr);
    }

    .mk-checkout__product-image,
    .mk-checkout__product-placeholder {
      width: 55px;
      height: 70px;
    }

    .mk-checkout__product-price {
      grid-column: 2;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .mk-checkout__input,
    .mk-checkout__select,
    .mk-checkout__submit {
      transition: none;
    }
  }
`;

// ======================================================
// 03. HELPERS
// ======================================================

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getImageSource(image) {
  if (typeof image === "string") {
    return image;
  }

  if (image && typeof image === "object") {
    return image.src ?? image.url ?? "";
  }

  return "";
}

function getValidationErrors(form) {
  const errors = {};

  if (!form.firstName.trim()) {
    errors.firstName = "First name is required.";
  }

  if (!form.lastName.trim()) {
    errors.lastName = "Last name is required.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
    errors.phone = "Enter a valid 10-digit Indian mobile number.";
  }

  if (!form.addressLine1.trim()) {
    errors.addressLine1 = "Delivery address is required.";
  }

  if (!form.city.trim()) {
    errors.city = "City is required.";
  }

  if (!form.state) {
    errors.state = "Select your state or union territory.";
  }

  if (!/^\d{6}$/.test(form.postalCode.trim())) {
    errors.postalCode = "Enter a valid 6-digit PIN code.";
  }

  return errors;
}

// ======================================================
// 04. FORM FIELD
// ======================================================

function FormField({
  id,
  name,
  label,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  autoComplete,
  inputMode,
  maxLength,
  type = "text",
  full = false,
}) {
  return (
    <div
      className={[
        "mk-checkout__field",
        full ? "mk-checkout__field--full" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <label
        htmlFor={id}
        className="mk-checkout__label"
      >
        {label}

        {required && (
          <span className="mk-checkout__required">
            {" "}*
          </span>
        )}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${id}-error` : undefined
        }
        className="mk-checkout__input"
      />

      {error && (
        <p
          id={`${id}-error`}
          className="mk-checkout__error"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ======================================================
// 05. CHECKOUT ORDER SUMMARY
// ======================================================

function CheckoutOrderSummary({
  items,
  subtotal,
  itemCount,
}) {
  return (
    <aside
      className="mk-checkout__summary"
      aria-label="Order summary"
    >
      <p className="mk-checkout__summary-eyebrow">
        Your Selection
      </p>

      <h2 className="mk-checkout__summary-title">
        Order Summary
      </h2>

      <div className="mk-checkout__summary-divider" />

      <div className="mk-checkout__products">
        {items.map((item) => {
          const image = getImageSource(item.image);

          const quantity = Math.max(
            1,
            Number(item.quantity) || 1
          );

          const price = Number(item.price) || 0;

          const total = price * quantity;

          return (
            <div
              key={item.key}
              className="mk-checkout__product"
            >
              {image ? (
                <img
                  src={image}
                  alt={item.name || "Perfume"}
                  className="mk-checkout__product-image"
                  loading="lazy"
                />
              ) : (
                <div className="mk-checkout__product-placeholder">
                  <ShoppingBag
                    size={22}
                    strokeWidth={1.2}
                    aria-hidden="true"
                  />
                </div>
              )}

              <div>
                <h3 className="mk-checkout__product-name">
                  {item.name}
                </h3>

                <p className="mk-checkout__product-meta">
                  {item.size || "55 ml"} · Qty {quantity}
                </p>
              </div>

              <strong className="mk-checkout__product-price">
                {formatPrice(total)}
              </strong>
            </div>
          );
        })}
      </div>

      <div className="mk-checkout__summary-divider" />

      <div className="mk-checkout__summary-rows">
        <div className="mk-checkout__summary-row">
          <span>Items</span>
          <strong>{itemCount}</strong>
        </div>

        <div className="mk-checkout__summary-row">
          <span>Subtotal</span>
          <strong>{formatPrice(subtotal)}</strong>
        </div>

        <div className="mk-checkout__summary-row">
          <span>Shipping</span>
          <strong>To be calculated</strong>
        </div>

        <div className="mk-checkout__summary-row">
          <span>Additional taxes</span>
          <strong>To be confirmed</strong>
        </div>
      </div>

      <div className="mk-checkout__summary-divider" />

      <div className="mk-checkout__summary-total">
        <span>Current Subtotal</span>
        <strong>{formatPrice(subtotal)}</strong>
      </div>

      <p className="mk-checkout__summary-note">
        This is not the final payable amount.
        Shipping and applicable taxes must be
        confirmed before payment.
      </p>

      <div className="mk-checkout__delivery-note">
        <Truck
          size={18}
          strokeWidth={1.4}
          aria-hidden="true"
        />

        <span>
          Delivery availability, charges and
          estimated timelines will be confirmed
          after shipping integration.
        </span>
      </div>
    </aside>
  );
}

// ======================================================
// 06. MAIN CHECKOUT PAGE
// ======================================================

export default function Checkout() {
  const {
    cartItems,
    cartCount,
    cartSubtotal,
  } = useCart();

  const reducedMotion = useReducedMotion();
  const formId = useId();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] =
    useState("online");

  const [hasSubmitted, setHasSubmitted] =
    useState(false);

  // ----------------------------------------------------
  // PAGE TITLE
  // ----------------------------------------------------

  useEffect(() => {
    document.title = "Checkout | Maison Kiyora";
  }, []);

  // ----------------------------------------------------
  // CART DATA
  // ----------------------------------------------------

  const items = Array.isArray(cartItems)
    ? cartItems
    : [];

  const itemCount = Number.isFinite(cartCount)
    ? cartCount
    : items.reduce(
        (total, item) =>
          total + (Number(item.quantity) || 0),
        0
      );

  const subtotal = Number.isFinite(cartSubtotal)
    ? cartSubtotal
    : 0;

  const isEmpty =
    items.length === 0 || itemCount <= 0;

  // ----------------------------------------------------
  // FORM HANDLERS
  // ----------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    let nextValue = value;

    if (name === "phone") {
      nextValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "postalCode") {
      nextValue = value.replace(/\D/g, "").slice(0, 6);
    }

    setForm((previous) => ({
      ...previous,
      [name]: nextValue,
    }));

    setErrors((previous) => {
      if (!previous[name]) {
        return previous;
      }

      return {
        ...previous,
        [name]: undefined,
      };
    });
  };

  // ----------------------------------------------------
  // VALIDATE FORM
  // ----------------------------------------------------

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isEmpty) {
      toast.error("Your shopping bag is empty.");
      return;
    }

    const validationErrors =
      getValidationErrors(form);

    setErrors(validationErrors);
    setHasSubmitted(true);

    if (Object.keys(validationErrors).length > 0) {
      toast.error(
        "Please complete the required checkout details."
      );

      const firstInvalidField =
        Object.keys(validationErrors)[0];

      document
        .getElementById(`${formId}-${firstInvalidField}`)
        ?.focus();

      return;
    }

    // ==================================================
    // PAYMENT INTEGRATION PLACEHOLDER
    //
    // Do not:
    // - Clear the cart
    // - Create a fake order ID
    // - Navigate to checkout/success
    // - Mark payment as successful
    //
    // When backend is ready:
    //
    // 1. Send validated customer/address data
    //    to the server.
    //
    // 2. Server recalculates prices, shipping,
    //    taxes and stock.
    //
    // 3. Server creates a pending order and
    //    Razorpay order.
    //
    // 4. Open Razorpay Checkout using the
    //    server-generated order details.
    //
    // 5. Verify payment on the backend.
    //
    // 6. Only after verified success,
    //    navigate to /checkout/success.
    // ==================================================

    toast.info(
      "Your details are valid. Online payments will be available once the payment gateway is connected.",
      {
        autoClose: 5000,
      }
    );
  };

  // ----------------------------------------------------
  // EMPTY CART
  // ----------------------------------------------------

  if (isEmpty) {
    return (
      <>
        <style>{STYLES}</style>

        <main className="mk-checkout">
          <div className="mk-checkout__container">
            <div className="mk-checkout__empty">
              <ShoppingBag
                size={42}
                strokeWidth={1.2}
                className="mk-checkout__empty-icon"
                aria-hidden="true"
              />

              <h1 className="mk-checkout__empty-title">
                Your Bag Is Empty
              </h1>

              <p className="mk-checkout__empty-description">
                Add a fragrance to your bag before
                continuing to checkout.
              </p>

              <Link
                to="/collections"
                className="mk-checkout__empty-link"
              >
                Explore Fragrances

                <ArrowRight
                  size={16}
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  // ----------------------------------------------------
  // CHECKOUT PAGE OUTPUT
  // ----------------------------------------------------

  return (
    <>
      <style>{STYLES}</style>

      <main className="mk-checkout">
        <div className="mk-checkout__container">

          {/* BREADCRUMB */}

          <nav
            className="mk-checkout__breadcrumb"
            aria-label="Breadcrumb"
          >
            <Link to="/">
              Home
            </Link>

            <span aria-hidden="true">/</span>

            <Link to="/cart">
              Shopping Bag
            </Link>

            <span aria-hidden="true">/</span>

            <strong aria-current="page">
              Checkout
            </strong>
          </nav>

          {/* PAGE HEADER */}

          <motion.header
            initial={
              reducedMotion
                ? false
                : { opacity: 0, y: 12 }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: reducedMotion ? 0 : 0.4,
            }}
          >
            <p className="mk-checkout__eyebrow">
              Maison Kiyora
            </p>

            <h1 className="mk-checkout__title">
              Checkout
            </h1>

            <p className="mk-checkout__subtitle">
              Complete your delivery details
              to prepare your order.
            </p>
          </motion.header>

          {/* MAIN LAYOUT */}

          <div className="mk-checkout__layout">

            {/* LEFT: CHECKOUT FORM */}

            <form
              className="mk-checkout__form"
              onSubmit={handleSubmit}
              noValidate
            >
              {/* ========================================
                  CONTACT INFORMATION
              ======================================== */}

              <section className="mk-checkout__section">
                <div className="mk-checkout__section-heading">
                  <div className="mk-checkout__section-icon">
                    <UserRound
                      size={18}
                      strokeWidth={1.4}
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <h2 className="mk-checkout__section-title">
                      Contact Information
                    </h2>

                    <p className="mk-checkout__section-description">
                      How can we reach you?
                    </p>
                  </div>
                </div>

                <div className="mk-checkout__fields">
                  <FormField
                    id={`${formId}-firstName`}
                    name="firstName"
                    label="First Name"
                    value={form.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                    placeholder="First name"
                    autoComplete="given-name"
                    required
                  />

                  <FormField
                    id={`${formId}-lastName`}
                    name="lastName"
                    label="Last Name"
                    value={form.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                    placeholder="Last name"
                    autoComplete="family-name"
                    required
                  />

                  <FormField
                    id={`${formId}-email`}
                    name="email"
                    type="email"
                    label="Email Address"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    full
                  />

                  <FormField
                    id={`${formId}-phone`}
                    name="phone"
                    type="tel"
                    label="Mobile Number"
                    value={form.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    placeholder="10-digit mobile number"
                    autoComplete="tel-national"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    full
                  />
                </div>
              </section>

              {/* ========================================
                  SHIPPING ADDRESS
              ======================================== */}

              <section className="mk-checkout__section">
                <div className="mk-checkout__section-heading">
                  <div className="mk-checkout__section-icon">
                    <MapPin
                      size={18}
                      strokeWidth={1.4}
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <h2 className="mk-checkout__section-title">
                      Delivery Address
                    </h2>

                    <p className="mk-checkout__section-description">
                      Where should we deliver
                      your fragrance?
                    </p>
                  </div>
                </div>

                <div className="mk-checkout__fields">
                  <FormField
                    id={`${formId}-addressLine1`}
                    name="addressLine1"
                    label="House / Flat / Street Address"
                    value={form.addressLine1}
                    onChange={handleChange}
                    error={errors.addressLine1}
                    placeholder="House number, street, building"
                    autoComplete="address-line1"
                    required
                    full
                  />

                  <FormField
                    id={`${formId}-addressLine2`}
                    name="addressLine2"
                    label="Apartment / Area (Optional)"
                    value={form.addressLine2}
                    onChange={handleChange}
                    placeholder="Apartment, area or locality"
                    autoComplete="address-line2"
                    full
                  />

                  <FormField
                    id={`${formId}-landmark`}
                    name="landmark"
                    label="Landmark (Optional)"
                    value={form.landmark}
                    onChange={handleChange}
                    placeholder="Nearby landmark"
                    full
                  />

                  <FormField
                    id={`${formId}-city`}
                    name="city"
                    label="City"
                    value={form.city}
                    onChange={handleChange}
                    error={errors.city}
                    placeholder="Your city"
                    autoComplete="address-level2"
                    required
                  />

                  <div className="mk-checkout__field">
                    <label
                      htmlFor={`${formId}-state`}
                      className="mk-checkout__label"
                    >
                      State / Union Territory
                      <span className="mk-checkout__required">
                        {" "}*
                      </span>
                    </label>

                    <select
                      id={`${formId}-state`}
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      required
                      autoComplete="address-level1"
                      aria-invalid={Boolean(errors.state)}
                      aria-describedby={
                        errors.state
                          ? `${formId}-state-error`
                          : undefined
                      }
                      className="mk-checkout__select"
                    >
                      <option value="">
                        Select state
                      </option>

                      {INDIAN_STATES.map((state) => (
                        <option
                          key={state}
                          value={state}
                        >
                          {state}
                        </option>
                      ))}
                    </select>

                    {errors.state && (
                      <p
                        id={`${formId}-state-error`}
                        className="mk-checkout__error"
                        role="alert"
                      >
                        {errors.state}
                      </p>
                    )}
                  </div>

                  <FormField
                    id={`${formId}-postalCode`}
                    name="postalCode"
                    label="PIN Code"
                    value={form.postalCode}
                    onChange={handleChange}
                    error={errors.postalCode}
                    placeholder="6-digit PIN code"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    maxLength={6}
                    required
                  />

                  <FormField
                    id={`${formId}-country`}
                    name="country"
                    label="Country"
                    value={form.country}
                    onChange={handleChange}
                    autoComplete="country-name"
                    full
                  />
                </div>
              </section>

              {/* ========================================
                  PAYMENT METHOD
              ======================================== */}

              <section className="mk-checkout__section">
                <div className="mk-checkout__section-heading">
                  <div className="mk-checkout__section-icon">
                    <Wallet
                      size={18}
                      strokeWidth={1.4}
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <h2 className="mk-checkout__section-title">
                      Payment Method
                    </h2>

                    <p className="mk-checkout__section-description">
                      Payment options will be enabled
                      after gateway integration.
                    </p>
                  </div>
                </div>

                <div className="mk-checkout__payment">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;

                    const selected =
                      paymentMethod === method.id;

                    return (
                      <label
                        key={method.id}
                        className={[
                          "mk-checkout__payment-option",
                          selected
                            ? "mk-checkout__payment-option--selected"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selected}
                          onChange={() =>
                            setPaymentMethod(method.id)
                          }
                          className="mk-checkout__payment-radio"
                        />

                        <Icon
                          size={20}
                          strokeWidth={1.5}
                          className="mk-checkout__payment-icon"
                          aria-hidden="true"
                        />

                        <span>
                          <span className="mk-checkout__payment-title">
                            {method.title}
                          </span>

                          <span className="mk-checkout__payment-description">
                            {method.description}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="mk-checkout__payment-status">
                  <LockKeyhole
                    size={13}
                    aria-hidden="true"
                  />

                  Payment gateway not yet connected
                </div>
              </section>

              {/* ========================================
                  SUBMIT ACTION
              ======================================== */}

              <div className="mk-checkout__actions">
                <motion.button
                  type="submit"
                  className="mk-checkout__submit"
                  whileTap={
                    reducedMotion
                      ? undefined
                      : { scale: 0.99 }
                  }
                >
                  Validate Checkout Details

                  <ArrowRight
                    size={17}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </motion.button>

                <p className="mk-checkout__notice">
                  This step only validates your details.
                  No payment will be taken and no order
                  will be placed.
                </p>

                <Link
                  to="/cart"
                  className="mk-checkout__back"
                >
                  <ArrowLeft
                    size={15}
                    aria-hidden="true"
                  />

                  Return to Shopping Bag
                </Link>
              </div>
            </form>

            {/* RIGHT: ORDER SUMMARY */}

            <CheckoutOrderSummary
              items={items}
              subtotal={subtotal}
              itemCount={itemCount}
            />

          </div>
        </div>
      </main>
    </>
  );
}
