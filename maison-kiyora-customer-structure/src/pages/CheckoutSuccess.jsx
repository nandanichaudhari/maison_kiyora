import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import useAuth from "../hooks/useAuth.js";
import * as orderService from "../services/orderService.js";

const SUCCESS_PAYMENT_STATUSES = new Set(["paid", "captured", "completed", "success", "succeeded"]);
const PENDING_PAYMENT_STATUSES = new Set(["pending", "processing", "authorized", "initiated", "created"]);

const readValue = (...values) => values.find((value) => value !== null && value !== undefined && value !== "");

function currency(amount, currencyCode = "INR") {
  const number = Number(amount);
  if (!Number.isFinite(number)) return null;
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: currencyCode, maximumFractionDigits: 2 }).format(number);
  } catch {
    return `₹${number.toLocaleString("en-IN")}`;
  }
}

function getOrderPaymentStatus(order) {
  const raw = readValue(
    order?.paymentStatus,
    order?.payment_status,
    order?.payment?.status,
    order?.payment?.paymentStatus
  );
  return String(raw || "").trim().toLowerCase();
}

function getOrderNumber(order) {
  return readValue(order?.orderNumber, order?.order_number, order?.displayId, order?.display_id, order?.id);
}

function getOrderAmount(order) {
  return readValue(order?.total, order?.totalAmount, order?.total_amount, order?.grandTotal, order?.grand_total, order?.amount);
}

function getOrderDate(order) {
  const raw = readValue(order?.createdAt, order?.created_at, order?.placedAt, order?.date);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function unwrapOrder(result) {
  if (!result || typeof result !== "object") return null;
  if (result.order && typeof result.order === "object") return result.order;
  if (result.data?.order && typeof result.data.order === "object") return result.data.order;
  if (result.data && typeof result.data === "object" && !Array.isArray(result.data)) return result.data;
  return result;
}

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const orderId = useMemo(
    () => (searchParams.get("orderId") || searchParams.get("order_id") || "").trim(),
    [searchParams]
  );
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    document.title = "Order Confirmation | Maison Kiyora";
  }, []);

  useEffect(() => {
    if (authLoading || isAuthenticated) return;
    const redirect = `/checkout/success${window.location.search}`;
    navigate(`/login?redirect=${encodeURIComponent(redirect)}`, { replace: true });
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    if (!orderId) {
      setOrder(null);
      setStatus("missing");
      return;
    }

    let active = true;
    setStatus("loading");
    setErrorMessage("");

    (async () => {
      try {
        if (typeof orderService.getOrderById !== "function") {
          throw new Error("Order lookup is not available yet.");
        }
        const result = await orderService.getOrderById(orderId);
        if (!active) return;
        const found = unwrapOrder(result);
        if (!found || typeof found !== "object" || result?.success === false) {
          throw new Error("We couldn't find this order.");
        }
        setOrder(found);
        const paymentStatus = getOrderPaymentStatus(found);
        if (SUCCESS_PAYMENT_STATUSES.has(paymentStatus)) setStatus("confirmed");
        else if (PENDING_PAYMENT_STATUSES.has(paymentStatus)) setStatus("pending");
        else setStatus("unverified");
      } catch (error) {
        if (!active) return;
        setOrder(null);
        setStatus("error");
        setErrorMessage(error?.message || "We couldn't load your order right now.");
      }
    })();

    return () => { active = false; };
  }, [orderId, attempt, authLoading, isAuthenticated]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  const orderNumber = order && getOrderNumber(order);
  const amount = order && currency(getOrderAmount(order), order.currency || "INR");
  const date = order && getOrderDate(order);
  const isConfirmed = status === "confirmed";
  const isPending = status === "pending";
  const isLoading = authLoading || (isAuthenticated && status === "loading");

  return (
    <main className="mk-success-page">
      <style>{styles}</style>
      <div className="mk-success-shell">
        <Link className="mk-success-brand" to="/">MAISON KIYORA</Link>
        <motion.div className="mk-success-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          {isLoading ? (
            <div className="mk-success-center" role="status" aria-live="polite">
              <div className="mk-success-loader" />
              <span className="mk-success-eyebrow">VERIFYING YOUR ORDER</span>
              <h1>Just a <em>moment.</em></h1>
              <p>We're checking your order details securely.</p>
            </div>
          ) : isConfirmed ? (
            <>
              <div className="mk-success-center">
                <div className="mk-success-symbol mk-success-symbol--confirmed"><Check size={35} strokeWidth={1.35} /></div>
                <span className="mk-success-eyebrow">ORDER CONFIRMED</span>
                <h1>Thank you for <em>choosing us.</em></h1>
                <p>Your payment is confirmed and your order has been received. Your fragrance journey continues.</p>
              </div>
              <div className="mk-success-details">
                {orderNumber && <div><span>Order number</span><strong>{orderNumber}</strong></div>}
                {date && <div><span>Order placed</span><strong>{date}</strong></div>}
                {amount && <div><span>Order total</span><strong>{amount}</strong></div>}
                <div><span>Payment</span><strong className="mk-success-paid"><CheckCircle2 size={15} /> Paid</strong></div>
              </div>
              <div className="mk-success-note"><PackageCheck size={19} strokeWidth={1.5} /><span>You can view the latest order and delivery updates in your account.</span></div>
            </>
          ) : isPending ? (
            <>
              <div className="mk-success-center">
                <div className="mk-success-symbol"><Clock3 size={31} strokeWidth={1.4} /></div>
                <span className="mk-success-eyebrow">PAYMENT PROCESSING</span>
                <h1>Almost <em>there.</em></h1>
                <p>Your order was found, but payment has not been confirmed yet. Please check again shortly before attempting another payment.</p>
              </div>
              {orderNumber && <div className="mk-success-single-detail">Order reference <strong>{orderNumber}</strong></div>}
              <button type="button" className="mk-success-secondary" onClick={retry}><RefreshCw size={16} /> Check payment status</button>
            </>
          ) : (
            <>
              <div className="mk-success-center">
                <div className="mk-success-symbol"><CreditCard size={30} strokeWidth={1.4} /></div>
                <span className="mk-success-eyebrow">ORDER STATUS</span>
                <h1>{status === "missing" ? <>Order <em>reference needed.</em></> : status === "error" ? <>Unable to <em>load order.</em></> : <>Confirmation <em>pending.</em></>}</h1>
                <p>{status === "missing" ? "We need a valid order reference to show your confirmation. You can find your orders in your account." : status === "error" ? errorMessage : "We found your order, but cannot confirm that payment was completed. Please check your order status before paying again."}</p>
              </div>
              {orderNumber && <div className="mk-success-single-detail">Order reference <strong>{orderNumber}</strong></div>}
              {status === "error" && <button type="button" className="mk-success-secondary" onClick={retry}><RefreshCw size={16} /> Try again</button>}
            </>
          )}

          {!isLoading && (
            <div className="mk-success-actions">
              {orderId && <Link className="mk-success-primary" to={`/orders/${encodeURIComponent(orderId)}`}><span>View Order Details</span><ArrowRight size={18} strokeWidth={1.5} /></Link>}
              <Link className="mk-success-text-link" to="/collections"><ShoppingBag size={16} strokeWidth={1.5} /> Continue Shopping</Link>
              <Link className="mk-success-text-link" to="/orders"><ArrowLeft size={15} strokeWidth={1.5} /> My Orders</Link>
            </div>
          )}
        </motion.div>
        <div className="mk-success-footer"><ShieldCheck size={15} strokeWidth={1.5} /> Secure account-based order verification</div>
      </div>
    </main>
  );
}

const styles = `
.mk-success-page{--navy:#1D2940;--ivory:#F5F0E8;--gold:#B69A69;min-height:100vh;background:radial-gradient(ellipse at 50% 5%,rgba(182,154,105,.14),transparent 55%),var(--ivory);color:var(--navy);font-family:"Manrope",sans-serif;padding:42px 20px 80px}
.mk-success-page *{box-sizing:border-box}
.mk-success-shell{max-width:720px;margin:0 auto}
.mk-success-brand{display:block;text-align:center;text-decoration:none;color:var(--navy);font-family:"Cormorant Garamond",Georgia,serif;letter-spacing:.18em;font-size:24px;margin-bottom:55px}
.mk-success-card{background:rgba(255,255,255,.58);border:1px solid #e1d7c9;padding:clamp(30px,6vw,64px);box-shadow:0 18px 65px rgba(29,41,64,.055)}
.mk-success-center{text-align:center}
.mk-success-symbol{width:78px;height:78px;border:1px solid #cfc1ad;color:#9b815e;border-radius:50%;display:grid;place-items:center;margin:0 auto 26px}
.mk-success-symbol--confirmed{border-color:#9bb39d;color:#527a5b;background:rgba(92,136,103,.05)}
.mk-success-eyebrow{display:block;color:#997c53;font-size:10px;letter-spacing:.23em;font-weight:700}
.mk-success-center h1{font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(52px,7vw,78px);font-weight:400;letter-spacing:-.04em;line-height:.97;margin:17px 0 20px}
.mk-success-center h1 em{color:var(--gold);font-weight:300}
.mk-success-center p{font-size:12px;color:#777b82;line-height:2;max-width:425px;margin:0 auto}
.mk-success-details{margin:38px 0 25px;padding:10px 0;border-top:1px solid #e3d9cc;border-bottom:1px solid #e3d9cc}
.mk-success-details>div{display:flex;justify-content:space-between;gap:20px;align-items:center;padding:13px 0;font-size:12px}
.mk-success-details span,.mk-success-single-detail{color:#7b7b7d}
.mk-success-details strong,.mk-success-single-detail strong{font-weight:650;color:var(--navy);overflow-wrap:anywhere;text-align:right}
.mk-success-paid{display:inline-flex;align-items:center;gap:6px;color:#527a5b!important}
.mk-success-note{display:flex;gap:12px;align-items:flex-start;background:#f5f0e8;padding:18px;margin-bottom:26px;font-size:11px;color:#6b6e72;line-height:1.8}
.mk-success-note svg{flex-shrink:0;color:#9b815e}
.mk-success-single-detail{display:flex;justify-content:space-between;gap:15px;padding:20px 0;border-bottom:1px solid #e3d9cc;font-size:12px;margin-top:25px}
.mk-success-actions{display:flex;flex-direction:column;align-items:center;gap:20px;margin-top:32px}
.mk-success-primary{width:100%;display:flex;justify-content:space-between;align-items:center;min-height:55px;padding:0 22px;background:var(--navy);color:white;text-decoration:none;font-size:11px;font-weight:650;letter-spacing:.08em;transition:background .2s}
.mk-success-primary:hover{background:#31415d}
.mk-success-text-link{display:inline-flex;gap:10px;align-items:center;color:var(--navy);text-decoration:none;font-size:11px;font-weight:600}
.mk-success-text-link:hover{color:#997c53}
.mk-success-secondary{width:100%;min-height:50px;border:1px solid #cbbba5;background:transparent;color:var(--navy);display:flex;align-items:center;justify-content:center;gap:10px;margin-top:25px;cursor:pointer;font:600 11px "Manrope",sans-serif}
.mk-success-secondary:hover{background:#f2e9dd}
.mk-success-footer{display:flex;justify-content:center;gap:9px;align-items:center;margin-top:27px;color:#8a8279;font-size:10px}
.mk-success-loader{height:28px;width:28px;margin:0 auto 25px;border:2px solid #ded6cb;border-top-color:var(--navy);border-radius:50%;animation:mk-success-spin .8s linear infinite}
@keyframes mk-success-spin{to{transform:rotate(360deg)}}
@media(max-width:500px){.mk-success-page{padding:28px 15px 60px}.mk-success-brand{margin-bottom:34px;font-size:21px}.mk-success-card{padding:30px 23px}.mk-success-details>div{font-size:11px}}
@media(prefers-reduced-motion:reduce){.mk-success-page *{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;
