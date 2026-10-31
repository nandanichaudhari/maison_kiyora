import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, ChevronRight,
  CircleAlert, CreditCard, LoaderCircle, MapPin, Package,
  RefreshCw, ShieldCheck, ShoppingBag, Truck,
} from "lucide-react";
import useAuth from "../hooks/useAuth.js";
import { getOrderById, isOrderServiceConfigured } from "../services/orderService.js";

const pick = (...values) => values.find((value) => value !== undefined && value !== null && value !== "");
const readable = (value) => String(value ?? "").replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const money = (value, currency = "INR") => {
  if (value === undefined || value === null || value === "") return "Not available";
  const number = Number(value);
  if (!Number.isFinite(number)) return "Not available";
  try { return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(number); }
  catch { return `₹${number.toLocaleString("en-IN")}`; }
};
const dateLabel = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(date);
};
const tone = (value) => {
  const status = String(value || "").toLowerCase();
  if (/delivered|paid|completed|success/.test(status)) return "success";
  if (/cancel|fail|refund|return/.test(status)) return "danger";
  if (/ship|transit|dispatch/.test(status)) return "info";
  return "pending";
};
const normalizeOrderResponse = (response) => {
  if (!response || typeof response !== "object") return null;
  const result = response.order ?? response.data?.order ?? response.data ?? response;
  return result && typeof result === "object" && !Array.isArray(result) ? result : null;
};
const itemList = (order) => {
  const items = pick(order?.items, order?.orderItems, order?.order_items, order?.lineItems);
  return Array.isArray(items) ? items : [];
};
const safeImage = (value) => {
  if (typeof value !== "string") return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
};
const addressLines = (address) => {
  if (!address) return [];
  if (typeof address === "string") return [address];
  const name = pick(address.fullName, address.full_name, address.name, [address.firstName, address.lastName].filter(Boolean).join(" "));
  const line1 = pick(address.addressLine1, address.address_line1, address.line1, address.street, address.address);
  const line2 = pick(address.addressLine2, address.address_line2, address.line2, address.landmark);
  const locality = [pick(address.city, address.town), address.state, pick(address.pincode, address.postalCode, address.zip)].filter(Boolean).join(", ");
  const phone = pick(address.phone, address.mobile, address.phoneNumber);
  return [name, line1, line2, locality, phone ? `Phone: ${phone}` : null].filter(Boolean);
};

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => { document.title = "Order Details | Maison Kiyora"; }, []);
  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate("/login", { replace: true, state: { from: location } });
  }, [authLoading, isAuthenticated, navigate, location]);

  const loadOrder = useCallback(async (cancelled) => {
    setLoading(true);
    setError("");
    try {
      const result = await getOrderById(orderId);
      if (!cancelled.current) {
        const normalized = normalizeOrderResponse(result);
        if (!normalized) throw new Error("We couldn't find this order.");
        setOrder(normalized);
      }
    } catch (err) {
      if (!cancelled.current) {
        setOrder(null);
        setError(err?.message || "Unable to load this order. Please try again.");
      }
    } finally { if (!cancelled.current) setLoading(false); }
  }, [orderId]);

  useEffect(() => {
    const cancelled = { current: false };
    if (!authLoading && isAuthenticated) {
      if (!orderId) { setError("No order was selected."); setLoading(false); }
      else if (!isOrderServiceConfigured()) {
        setError("Order details are not connected yet. Please try again when the order service is available.");
        setLoading(false);
      } else loadOrder(cancelled);
    }
    return () => { cancelled.current = true; };
  }, [authLoading, isAuthenticated, user?.id, refresh, loadOrder, orderId]);

  const view = useMemo(() => {
    if (!order) return null;
    const payment = order.payment && typeof order.payment === "object" ? order.payment : {};
    const shipping = order.shipping && typeof order.shipping === "object" ? order.shipping : {};
    const shippingAddress = pick(order.shippingAddress, order.shipping_address, order.deliveryAddress, order.address, shipping.address);
    return {
      number: pick(order.orderNumber, order.order_number, order.displayId, order.id, order.orderId, order._id, orderId),
      created: pick(order.createdAt, order.created_at, order.placedAt, order.orderDate),
      status: pick(order.status, order.orderStatus, order.order_status),
      paymentStatus: pick(order.paymentStatus, order.payment_status, payment.status),
      paymentMethod: pick(order.paymentMethod, order.payment_method, payment.method),
      transaction: pick(order.transactionId, order.transaction_id, payment.transactionId, payment.razorpayPaymentId),
      currency: order.currency || "INR",
      subtotal: pick(order.subtotal, order.subTotal, order.sub_total, order.itemsSubtotal),
      shippingFee: pick(order.shippingFee, order.shipping_fee, order.shippingCharge, order.shipping_charge),
      discount: pick(order.discount, order.discountAmount, order.discount_amount),
      tax: pick(order.tax, order.taxAmount, order.tax_amount),
      total: pick(order.total, order.totalAmount, order.total_amount, order.grandTotal, order.grand_total),
      trackingNumber: pick(order.trackingNumber, order.tracking_number, shipping.trackingNumber, shipping.tracking_number),
      carrier: pick(order.carrier, order.courierName, shipping.carrier, shipping.courierName),
      trackingUrl: pick(order.trackingUrl, order.tracking_url, shipping.trackingUrl),
      address: addressLines(shippingAddress),
      items: itemList(order),
    };
  }, [order, orderId]);

  if (authLoading || !isAuthenticated) {
    return <main className="mk-od-loading"><style>{styles}</style><LoaderCircle className="mk-od-spin" size={25} /> Preparing your account...</main>;
  }

  return (
    <main className="mk-od-page">
      <style>{styles}</style>
      <div className="mk-od-container">
        <nav className="mk-od-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link><ChevronRight size={13}/><Link to="/account">My Account</Link><ChevronRight size={13}/><Link to="/orders">Orders</Link><ChevronRight size={13}/><span>Order Details</span>
        </nav>
        <motion.header className="mk-od-header" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div><span className="mk-od-eyebrow">YOUR MAISON KIYORA ACCOUNT</span><h1>Order <em>Details.</em></h1><p>Every detail of your fragrance journey, in one place.</p></div>
          <Link className="mk-od-back" to="/orders"><ArrowLeft size={16}/> All Orders</Link>
        </motion.header>

        {loading ? (
          <div className="mk-od-state" aria-busy="true"><LoaderCircle size={30} className="mk-od-spin"/><h2>Finding your order</h2><p>Please wait while we retrieve your details.</p></div>
        ) : error ? (
          <div className="mk-od-state" role="alert"><CircleAlert size={32}/><h2>Order details unavailable</h2><p>{error}</p><div className="mk-od-state-actions"><button type="button" onClick={() => setRefresh((n) => n + 1)}><RefreshCw size={15}/> Try Again</button><Link to="/orders">View My Orders <ArrowRight size={15}/></Link></div></div>
        ) : view ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="mk-od-summary">
              <div><span className="mk-od-kicker">ORDER REFERENCE</span><h2>#{String(view.number)}</h2><p><CalendarDays size={15}/> {dateLabel(view.created)}</p></div>
              <div className="mk-od-summary-status"><span className="mk-od-kicker">ORDER STATUS</span><span className={`mk-od-status ${tone(view.status)}`}>{view.status ? readable(view.status) : "Not available"}</span><button type="button" className="mk-od-refresh" onClick={() => setRefresh((n) => n + 1)}><RefreshCw size={14}/> Refresh</button></div>
            </div>
            <div className="mk-od-grid">
              <div className="mk-od-main">
                <section className="mk-od-card"><div className="mk-od-card-heading"><div><span className="mk-od-kicker">YOUR PURCHASE</span><h3>Items in this order</h3></div><Package size={20}/></div>
                  {view.items.length ? view.items.map((item, index) => {
                    const product = item.product || {};
                    const name = pick(item.name, item.title, item.productName, product.name, product.title, "Product");
                    const image = safeImage(pick(item.image, item.imageUrl, item.thumbnail, product.image, product.imageUrl));
                    const quantity = pick(item.quantity, item.qty, 1);
                    const unitPrice = pick(item.unitPrice, item.unit_price, item.price, product.price);
                    const total = pick(item.total, item.lineTotal, item.line_total, item.totalPrice);
                    return <div className="mk-od-item" key={pick(item.id, item.productId, item.product_id, index)}>
                      <div className="mk-od-item-image">{image ? <img src={image} alt={String(name)} loading="lazy"/> : <ShoppingBag size={24}/>}</div>
                      <div className="mk-od-item-info"><strong>{name}</strong>{pick(item.variant, item.size, product.size) && <span>{pick(item.variant, item.size, product.size)}</span>}<span>Quantity: {quantity}</span></div>
                      <div className="mk-od-item-price">{money(total ?? (unitPrice != null ? Number(unitPrice) * Number(quantity) : null), view.currency)}</div>
                    </div>;
                  }) : <p className="mk-od-muted">Item details are not available for this order.</p>}
                </section>
                <section className="mk-od-card"><div className="mk-od-card-heading"><div><span className="mk-od-kicker">DELIVERY INFORMATION</span><h3>Shipping details</h3></div><Truck size={20}/></div>
                  <div className="mk-od-details-row"><span>Shipping status</span><strong>{view.status ? readable(view.status) : "Not available"}</strong></div>
                  <div className="mk-od-details-row"><span>Courier</span><strong>{view.carrier || "Not available"}</strong></div>
                  <div className="mk-od-details-row"><span>Tracking number</span><strong>{view.trackingNumber || "Not available"}</strong></div>
                  {safeImage(view.trackingUrl) && <a className="mk-od-track-link" href={safeImage(view.trackingUrl)} target="_blank" rel="noopener noreferrer">Track with courier <ArrowRight size={15}/></a>}
                  <div className="mk-od-address"><div className="mk-od-address-heading"><MapPin size={17}/> Delivery address</div>{view.address.length ? view.address.map((line, i) => <p key={i}>{line}</p>) : <p>Delivery address is not available.</p>}</div>
                </section>
              </div>
              <aside className="mk-od-aside">
                <section className="mk-od-card"><div className="mk-od-card-heading"><div><span className="mk-od-kicker">PAYMENT</span><h3>Payment details</h3></div><CreditCard size={20}/></div>
                  <div className="mk-od-details-row"><span>Status</span><span className={`mk-od-status ${tone(view.paymentStatus)}`}>{view.paymentStatus ? readable(view.paymentStatus) : "Not available"}</span></div>
                  <div className="mk-od-details-row"><span>Method</span><strong>{view.paymentMethod ? readable(view.paymentMethod) : "Not available"}</strong></div>
                  {view.transaction && <div className="mk-od-details-row"><span>Transaction ID</span><strong className="mk-od-break">{view.transaction}</strong></div>}
                </section>
                <section className="mk-od-card"><div className="mk-od-card-heading"><div><span className="mk-od-kicker">ORDER SUMMARY</span><h3>Payment breakdown</h3></div><ShoppingBag size={20}/></div>
                  <div className="mk-od-details-row"><span>Subtotal</span><strong>{money(view.subtotal, view.currency)}</strong></div>
                  <div className="mk-od-details-row"><span>Shipping</span><strong>{money(view.shippingFee, view.currency)}</strong></div>
                  {view.discount != null && <div className="mk-od-details-row"><span>Discount</span><strong>{money(view.discount, view.currency)}</strong></div>}
                  {view.tax != null && <div className="mk-od-details-row"><span>Tax</span><strong>{money(view.tax, view.currency)}</strong></div>}
                  <div className="mk-od-grand-total"><span>Order Total</span><strong>{money(view.total, view.currency)}</strong></div>
                </section>
                <div className="mk-od-secure"><ShieldCheck size={18}/><span>Order information is retrieved through your authenticated account.</span></div>
              </aside>
            </div>
            <div className="mk-od-bottom"><Link to="/orders"><ArrowLeft size={16}/> Back to My Orders</Link><Link to="/collections">Explore Fragrances <ArrowRight size={16}/></Link></div>
          </motion.div>
        ) : null}
      </div>
    </main>
  );
}

const styles = `
.mk-od-page{--ivory:#F5F0E8;--navy:#1D2940;--gold:#B69A69;min-height:75vh;background:var(--ivory);color:var(--navy);font-family:"Manrope",sans-serif}
.mk-od-page *{box-sizing:border-box}.mk-od-container{max-width:1250px;margin:0 auto;padding:130px 30px 95px}
.mk-od-breadcrumb{display:flex;align-items:center;flex-wrap:wrap;gap:8px;color:#8c857b;font-size:11px;margin-bottom:45px}.mk-od-breadcrumb a{color:inherit;text-decoration:none}.mk-od-breadcrumb a:hover{color:#967a51}
.mk-od-header{display:flex;justify-content:space-between;align-items:flex-end;gap:25px;margin-bottom:43px}.mk-od-eyebrow,.mk-od-kicker{font-size:10px;font-weight:650;letter-spacing:.18em;color:#9c825a}.mk-od-header h1{font:400 clamp(57px,7vw,94px)/.95 "Cormorant Garamond",Georgia,serif;letter-spacing:-.045em;margin:14px 0}.mk-od-header h1 em{font-weight:300;color:var(--gold)}.mk-od-header p{font-size:12px;color:#777982;line-height:1.8;margin:0}.mk-od-back,.mk-od-bottom a{display:inline-flex;align-items:center;gap:9px;color:var(--navy);font-size:11px;font-weight:650;text-decoration:none;white-space:nowrap}
.mk-od-summary{display:flex;justify-content:space-between;align-items:center;gap:25px;background:var(--navy);color:#fff;padding:28px 33px;margin-bottom:26px}.mk-od-summary h2{font:400 34px/1.1 "Cormorant Garamond",Georgia,serif;margin:10px 0;overflow-wrap:anywhere}.mk-od-summary p{display:flex;align-items:center;gap:8px;color:#c9cbd0;font-size:11px;margin:0}.mk-od-summary .mk-od-kicker{color:#d8c9b5}.mk-od-summary-status{display:flex;align-items:flex-end;flex-direction:column;gap:10px}.mk-od-status{display:inline-flex;align-items:center;width:fit-content;padding:7px 10px;border:1px solid #d8d0c4;background:#eee8df;color:#7b6c59;font-size:10px;font-weight:700;letter-spacing:.03em;white-space:nowrap}.mk-od-status.success{background:#e3ede5;border-color:#c9decf;color:#416b4c}.mk-od-status.danger{background:#f5e7e3;border-color:#e8cac4;color:#a35348}.mk-od-status.info{background:#e3eaf2;border-color:#c7d5e4;color:#496787}.mk-od-summary .mk-od-status{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.25);color:#fff}.mk-od-refresh{display:flex;align-items:center;gap:7px;border:0;background:none;color:#ddd0bc;font:inherit;font-size:10px;cursor:pointer}
.mk-od-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(290px,1fr);gap:25px;align-items:start}.mk-od-main,.mk-od-aside{display:grid;gap:25px}.mk-od-card{padding:29px;background:#fffdfa;border:1px solid #e6ddd0;min-width:0}.mk-od-card-heading{display:flex;align-items:center;justify-content:space-between;gap:14px;padding-bottom:20px;border-bottom:1px solid #eae3d9;margin-bottom:17px}.mk-od-card-heading>svg{color:#b69a69}.mk-od-card-heading h3{font:500 30px/1.1 "Cormorant Garamond",Georgia,serif;margin:8px 0 0}.mk-od-item{display:flex;align-items:center;gap:15px;padding:16px 0;border-bottom:1px solid #eee8df}.mk-od-item:last-child{border-bottom:0}.mk-od-item-image{display:grid;place-items:center;width:80px;height:94px;flex-shrink:0;background:#f2ede6;color:#a38d6d}.mk-od-item-image img{width:100%;height:100%;object-fit:cover}.mk-od-item-info{display:flex;flex-direction:column;gap:7px;min-width:0;flex:1}.mk-od-item-info strong{font-size:12px;font-weight:650}.mk-od-item-info span{font-size:10px;color:#8c857b}.mk-od-item-price{font-size:12px;font-weight:700;text-align:right}.mk-od-muted{font-size:12px;color:#8c857b;line-height:1.8}
.mk-od-details-row{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;padding:12px 0;border-bottom:1px solid #eee8df;font-size:11px}.mk-od-details-row>span:first-child{color:#88847f}.mk-od-details-row strong{font-weight:650;text-align:right}.mk-od-break{overflow-wrap:anywhere;max-width:60%}.mk-od-address{margin-top:24px;padding:18px;background:#f7f3ed}.mk-od-address-heading{display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:11px;font-weight:700}.mk-od-address-heading svg{color:var(--gold)}.mk-od-address p{margin:5px 0;color:#6e6d70;font-size:11px;line-height:1.6}.mk-od-track-link{display:inline-flex;align-items:center;gap:8px;margin-top:17px;color:#967a51;font-size:11px;font-weight:700;text-decoration:none}.mk-od-grand-total{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:22px;font-size:13px;font-weight:750}.mk-od-grand-total strong{font-size:19px}.mk-od-secure{display:flex;gap:10px;color:#898276;font-size:10px;line-height:1.7}.mk-od-secure svg{flex-shrink:0;color:var(--gold)}.mk-od-bottom{display:flex;justify-content:space-between;gap:20px;margin-top:35px}.mk-od-state{display:flex;flex-direction:column;align-items:center;text-align:center;justify-content:center;min-height:350px;padding:45px 20px;border:1px solid #e6ddd0;background:#fffdfa;color:#9b835f}.mk-od-state h2{font:400 39px "Cormorant Garamond",Georgia,serif;color:var(--navy);margin:20px 0 8px}.mk-od-state p{font-size:12px;color:#777982;line-height:1.8;max-width:430px}.mk-od-state-actions{display:flex;gap:13px;flex-wrap:wrap;justify-content:center;margin-top:15px}.mk-od-state-actions a,.mk-od-state-actions button{display:flex;align-items:center;gap:8px;padding:12px 16px;border:1px solid var(--navy);background:var(--navy);color:#fff;font:inherit;font-size:11px;text-decoration:none;cursor:pointer}.mk-od-state-actions a{background:transparent;color:var(--navy)}.mk-od-loading{display:flex;align-items:center;justify-content:center;gap:12px;min-height:60vh;background:#F5F0E8;color:#1D2940;font-size:12px}.mk-od-spin{animation:mk-od-spin .8s linear infinite}@keyframes mk-od-spin{to{transform:rotate(360deg)}}
@media(max-width:800px){.mk-od-grid{grid-template-columns:1fr}.mk-od-aside{grid-template-columns:repeat(2,minmax(0,1fr))}.mk-od-secure{grid-column:1/-1}}@media(max-width:600px){.mk-od-container{padding:105px 17px 70px}.mk-od-header{align-items:flex-start;flex-direction:column}.mk-od-header h1{font-size:63px}.mk-od-summary{padding:22px;align-items:flex-start;flex-direction:column}.mk-od-summary-status{align-items:flex-start}.mk-od-aside{grid-template-columns:1fr}.mk-od-card{padding:20px}.mk-od-item-image{width:63px;height:76px}.mk-od-item{gap:10px}.mk-od-item-price{font-size:10px}.mk-od-bottom{flex-direction:column}.mk-od-breadcrumb{margin-bottom:28px}}
@media(prefers-reduced-motion:reduce){.mk-od-spin{animation:none}}
`;
