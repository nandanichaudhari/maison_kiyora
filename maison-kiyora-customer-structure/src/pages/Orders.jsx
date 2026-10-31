import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Box, CalendarDays, ChevronRight,
  CircleAlert, CreditCard, LoaderCircle, Package, RefreshCw,
  Search, ShoppingBag, Truck,
} from "lucide-react";
import useAuth from "../hooks/useAuth.js";
import { getMyOrders, isOrderServiceConfigured } from "../services/orderService.js";

const formatMoney = (value, currency = "INR") => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `₹${amount.toLocaleString("en-IN")}`;
  }
};

const formatDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date);
};

const prettyStatus = (value) => String(value || "Processing")
  .replace(/[_-]+/g, " ")
  .replace(/\b\w/g, (character) => character.toUpperCase());

const statusTone = (value) => {
  const status = String(value || "").toLowerCase();
  if (/deliver|paid|complet/.test(status)) return "success";
  if (/cancel|fail|refund|return/.test(status)) return "danger";
  if (/ship|transit|dispatch/.test(status)) return "info";
  return "pending";
};

const normalizeOrdersResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.orders)) return response.orders;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.orders)) return response.data.orders;
  if (Array.isArray(response?.items)) return response.items;
  return [];
};

const orderId = (order) => order?.id ?? order?.orderId ?? order?._id ?? null;
const orderNumber = (order) => order?.orderNumber ?? order?.order_number ?? order?.displayId ?? orderId(order);
const orderItems = (order) => order?.items ?? order?.orderItems ?? order?.order_items ?? [];
const orderTotal = (order) => order?.total ?? order?.totalAmount ?? order?.total_amount ?? order?.grandTotal ?? order?.grand_total;
const orderDate = (order) => order?.createdAt ?? order?.created_at ?? order?.placedAt ?? order?.orderDate;
const orderStatus = (order) => order?.status ?? order?.orderStatus ?? order?.order_status ?? "Processing";
const paymentStatus = (order) => order?.paymentStatus ?? order?.payment_status ?? order?.payment?.status;

export default function Orders() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => { document.title = "My Orders | Maison Kiyora"; }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { replace: true, state: { from: location } });
    }
  }, [authLoading, isAuthenticated, location, navigate]);

  const loadOrders = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const response = await getMyOrders();
      if (!signal.cancelled) setOrders(normalizeOrdersResponse(response));
    } catch (err) {
      if (!signal.cancelled) {
        setOrders([]);
        setError(err?.message || "We couldn't load your orders. Please try again.");
      }
    } finally {
      if (!signal.cancelled) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const signal = { cancelled: false };
    if (!authLoading && isAuthenticated) {
      if (!isOrderServiceConfigured()) {
        setError("Order history is not connected yet. Please try again once the order service is available.");
        setLoading(false);
      } else {
        loadOrders(signal);
      }
    }
    return () => { signal.cancelled = true; };
  }, [authLoading, isAuthenticated, user?.id, refreshKey, loadOrders]);

  const filtered = useMemo(() => orders.filter((order) => {
    const searchable = [orderNumber(order), orderStatus(order), paymentStatus(order)]
      .filter(Boolean).join(" ").toLowerCase();
    const matchesSearch = searchable.includes(query.trim().toLowerCase());
    const status = String(orderStatus(order)).toLowerCase();
    const matchesFilter = filter === "all" ||
      (filter === "active" && !/deliver|cancel|refund|return|fail|complet/.test(status)) ||
      (filter === "delivered" && /deliver|complet/.test(status)) ||
      (filter === "cancelled" && /cancel|refund|return|fail/.test(status));
    return matchesSearch && matchesFilter;
  }), [orders, query, filter]);

  if (authLoading || !isAuthenticated) {
    return <main className="mk-orders-auth-loading" aria-busy="true"><LoaderCircle className="mk-orders-spin" size={26} /><span>Preparing your account...</span><style>{styles}</style></main>;
  }

  return (
    <main className="mk-orders-page">
      <style>{styles}</style>
      <div className="mk-orders-container">
        <nav className="mk-orders-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link><ChevronRight size={13} /><Link to="/account">My Account</Link><ChevronRight size={13} /><span>Orders</span>
        </nav>

        <motion.header className="mk-orders-header" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div>
            <span className="mk-orders-eyebrow">YOUR MAISON KIYORA ACCOUNT</span>
            <h1>My <em>Orders.</em></h1>
            <p>Follow your fragrance journey, from checkout to delivery.</p>
          </div>
          <Link to="/account" className="mk-orders-account-link"><ArrowLeft size={16} /> Back to Account</Link>
        </motion.header>

        <div className="mk-orders-layout">
          <aside className="mk-orders-sidebar" aria-label="Account navigation">
            <span className="mk-orders-sidebar-label">MY ACCOUNT</span>
            <Link to="/account"><Box size={17} /> Overview</Link>
            <Link to="/orders" className="active" aria-current="page"><Package size={17} /> My Orders</Link>
            <Link to="/account/addresses"><Truck size={17} /> Saved Addresses</Link>
            <Link to="/wishlist"><ShoppingBag size={17} /> Wishlist</Link>
          </aside>

          <section className="mk-orders-main" aria-label="Order history">
            <div className="mk-orders-toolbar">
              <div>
                <span className="mk-orders-section-label">ORDER HISTORY</span>
                <h2>Your purchases</h2>
              </div>
              <button type="button" className="mk-orders-refresh" onClick={() => setRefreshKey((n) => n + 1)} disabled={loading} aria-label="Refresh orders"><RefreshCw size={16} className={loading ? "mk-orders-spin" : ""} /> Refresh</button>
            </div>

            {!error && !loading && orders.length > 0 && (
              <div className="mk-orders-controls">
                <label className="mk-orders-search"><Search size={17} /><span className="mk-orders-sr-only">Search orders</span><input type="search" placeholder="Search order number or status" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
                <select aria-label="Filter orders" value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="all">All orders</option>
                  <option value="active">In progress</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled / returned</option>
                </select>
              </div>
            )}

            {loading ? (
              <div className="mk-orders-state" role="status" aria-busy="true"><LoaderCircle size={29} className="mk-orders-spin" /><h3>Gathering your orders</h3><p>Your order history will appear here shortly.</p></div>
            ) : error ? (
              <div className="mk-orders-state" role="alert"><CircleAlert size={30} /><h3>Unable to load orders</h3><p>{error}</p><button type="button" className="mk-orders-primary" onClick={() => setRefreshKey((n) => n + 1)}>Try Again <RefreshCw size={16} /></button></div>
            ) : orders.length === 0 ? (
              <div className="mk-orders-state"><ShoppingBag size={32} strokeWidth={1.4} /><span className="mk-orders-eyebrow">YOUR JOURNEY BEGINS HERE</span><h3>No orders yet</h3><p>When you place your first order, its details and status will appear here.</p><Link to="/collections" className="mk-orders-primary">Explore Fragrances <ArrowRight size={16} /></Link></div>
            ) : filtered.length === 0 ? (
              <div className="mk-orders-state"><Search size={29} /><h3>No matching orders</h3><p>Try a different search or filter.</p><button type="button" className="mk-orders-primary" onClick={() => { setQuery(""); setFilter("all"); }}>Clear Filters <ArrowRight size={16} /></button></div>
            ) : (
              <div className="mk-orders-list">
                <p className="mk-orders-count">Showing {filtered.length} of {orders.length} orders</p>
                {filtered.map((order, index) => {
                  const id = orderId(order);
                  const items = Array.isArray(orderItems(order)) ? orderItems(order) : [];
                  const total = orderTotal(order);
                  const currency = order.currency || "INR";
                  return (
                    <motion.article className="mk-orders-card" key={String(id ?? index)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.2) }}>
                      <div className="mk-orders-card-top">
                        <div><span className="mk-orders-card-label">ORDER NUMBER</span><h3>{orderNumber(order) ? `#${String(orderNumber(order)).replace(/^#/, "")}` : "Order"}</h3></div>
                        <span className={`mk-orders-status mk-orders-status--${statusTone(orderStatus(order))}`}>{prettyStatus(orderStatus(order))}</span>
                      </div>
                      <div className="mk-orders-card-meta">
                        <span><CalendarDays size={15} /> {formatDate(orderDate(order))}</span>
                        <span><Package size={15} /> {items.length} {items.length === 1 ? "item" : "items"}</span>
                        {paymentStatus(order) && <span><CreditCard size={15} /> {prettyStatus(paymentStatus(order))}</span>}
                      </div>
                      {items.length > 0 && <div className="mk-orders-products">{items.slice(0, 3).map((item, itemIndex) => <span key={String(item?.id ?? item?.productId ?? itemIndex)}>{item?.name ?? item?.productName ?? item?.product?.name ?? "Fragrance"}{Number(item?.quantity) > 1 ? ` × ${item.quantity}` : ""}</span>)}{items.length > 3 && <span>+{items.length - 3} more</span>}</div>}
                      <div className="mk-orders-card-bottom"><div><span className="mk-orders-card-label">ORDER TOTAL</span><strong>{formatMoney(total, currency)}</strong></div>{id != null ? <Link to={`/orders/${encodeURIComponent(String(id))}`} className="mk-orders-detail-link">View Details <ArrowRight size={16} /></Link> : <span className="mk-orders-detail-unavailable">Details unavailable</span>}</div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

const styles = `
.mk-orders-page{--ink:#1d2940;--gold:#b69a69;--ivory:#f5f0e8;min-height:85vh;background:var(--ivory);color:var(--ink);font-family:"Manrope",sans-serif;padding:120px 24px 95px}
.mk-orders-page *{box-sizing:border-box}.mk-orders-container{max-width:1180px;margin:auto}.mk-orders-breadcrumb{display:flex;align-items:center;gap:9px;color:#8b8276;font-size:11px;margin-bottom:35px}.mk-orders-breadcrumb a{color:inherit;text-decoration:none}.mk-orders-breadcrumb a:hover{color:var(--gold)}
.mk-orders-header{display:flex;justify-content:space-between;align-items:end;gap:25px;margin-bottom:55px}.mk-orders-eyebrow,.mk-orders-section-label,.mk-orders-sidebar-label,.mk-orders-card-label{font-size:10px;font-weight:650;letter-spacing:.17em;color:#a18760}.mk-orders-header h1{font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(58px,7vw,94px);font-weight:400;letter-spacing:-.045em;line-height:1;margin:15px 0}.mk-orders-header h1 em{font-weight:300;color:var(--gold)}.mk-orders-header p{color:#777b80;font-size:12px;line-height:1.8}.mk-orders-account-link{display:flex;align-items:center;gap:8px;color:var(--ink);text-decoration:none;font-size:11px;white-space:nowrap;border-bottom:1px solid var(--gold);padding-bottom:8px}
.mk-orders-layout{display:grid;grid-template-columns:235px minmax(0,1fr);gap:55px}.mk-orders-sidebar{display:flex;flex-direction:column;align-self:start;gap:5px;border-top:1px solid #ddd4c8;padding-top:25px}.mk-orders-sidebar-label{margin-bottom:16px}.mk-orders-sidebar a{display:flex;align-items:center;gap:13px;padding:15px 14px;text-decoration:none;color:#686d75;font-size:12px;transition:background .2s,color .2s}.mk-orders-sidebar a:hover,.mk-orders-sidebar a.active{background:#eae2d7;color:var(--ink)}.mk-orders-sidebar a.active{border-left:2px solid var(--gold)}
.mk-orders-main{min-width:0}.mk-orders-toolbar{display:flex;justify-content:space-between;align-items:end;gap:15px;margin-bottom:23px}.mk-orders-toolbar h2{font-family:"Cormorant Garamond",Georgia,serif;font-weight:400;font-size:38px;margin:6px 0 0}.mk-orders-refresh{display:flex;align-items:center;gap:8px;background:transparent;border:0;color:var(--ink);font:inherit;font-size:11px;cursor:pointer;padding:8px}.mk-orders-refresh:disabled{opacity:.5;cursor:not-allowed}
.mk-orders-controls{display:flex;gap:12px;margin-bottom:25px}.mk-orders-search{display:flex;align-items:center;gap:10px;flex:1;min-width:0;padding:0 14px;border:1px solid #dcd1c3;background:rgba(255,255,255,.5)}.mk-orders-search svg{color:#a18d73}.mk-orders-search input{height:47px;width:100%;border:0;outline:0;background:transparent;font:inherit;font-size:11px;color:var(--ink)}.mk-orders-controls select{max-width:190px;min-height:47px;padding:0 12px;background:rgba(255,255,255,.5);border:1px solid #dcd1c3;color:var(--ink);font:inherit;font-size:11px}.mk-orders-count{color:#8b8276;font-size:10px;margin:0 0 14px}
.mk-orders-card{border:1px solid #dfd5c9;background:rgba(255,255,255,.52);padding:25px 27px;margin-bottom:15px}.mk-orders-card-top,.mk-orders-card-bottom{display:flex;justify-content:space-between;align-items:center;gap:18px}.mk-orders-card-top h3{font-size:16px;font-weight:600;margin:7px 0 0;overflow-wrap:anywhere}.mk-orders-status{display:inline-block;padding:8px 12px;border-radius:30px;font-size:10px;white-space:nowrap;background:#efe7d9;color:#8c6b37}.mk-orders-status--success{background:#e4ede4;color:#426b4b}.mk-orders-status--danger{background:#f6e4e1;color:#9b5048}.mk-orders-status--info{background:#e5edf5;color:#426888}.mk-orders-card-meta{display:flex;flex-wrap:wrap;gap:12px 24px;margin:24px 0;color:#747981;font-size:11px}.mk-orders-card-meta span{display:flex;align-items:center;gap:8px}.mk-orders-products{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:23px}.mk-orders-products span{font-size:10px;padding:8px 11px;background:#f3eee7;color:#646a72}.mk-orders-card-bottom{padding-top:19px;border-top:1px solid #e7ded3}.mk-orders-card-bottom>div{display:flex;flex-direction:column;gap:7px}.mk-orders-card-bottom strong{font-size:17px;font-weight:650}.mk-orders-detail-link{display:flex;align-items:center;gap:10px;color:var(--ink);text-decoration:none;border-bottom:1px solid var(--gold);padding-bottom:6px;font-size:11px}.mk-orders-detail-unavailable{font-size:10px;color:#999}
.mk-orders-state{min-height:340px;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;padding:45px 24px;border:1px solid #dfd5c9;background:rgba(255,255,255,.4)}.mk-orders-state>svg{color:var(--gold);margin-bottom:18px}.mk-orders-state h3{font-family:"Cormorant Garamond",Georgia,serif;font-weight:400;font-size:43px;margin:12px 0}.mk-orders-state p{font-size:12px;line-height:1.9;color:#7b7e83;max-width:380px;margin:0 0 22px}.mk-orders-primary{display:flex;align-items:center;justify-content:center;gap:14px;padding:15px 22px;border:1px solid var(--ink);background:var(--ink);color:white;text-decoration:none;font:inherit;font-size:11px;cursor:pointer}.mk-orders-primary:hover{background:#30405a}.mk-orders-auth-loading{min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:#f5f0e8;color:#1d2940;font:12px "Manrope",sans-serif}.mk-orders-spin{animation:mk-orders-spin .8s linear infinite}@keyframes mk-orders-spin{to{transform:rotate(360deg)}}.mk-orders-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:850px){.mk-orders-layout{grid-template-columns:185px minmax(0,1fr);gap:24px}.mk-orders-header{margin-bottom:40px}}
@media(max-width:650px){.mk-orders-page{padding:100px 18px 65px}.mk-orders-header{align-items:start;flex-direction:column;gap:15px}.mk-orders-layout{display:block}.mk-orders-sidebar{flex-direction:row;overflow-x:auto;gap:4px;margin-bottom:35px;padding:10px 0;border-top:1px solid #ddd4c8;border-bottom:1px solid #ddd4c8}.mk-orders-sidebar-label{display:none}.mk-orders-sidebar a{flex-shrink:0;padding:11px;font-size:10px}.mk-orders-card{padding:19px}.mk-orders-controls{flex-direction:column}.mk-orders-controls select{max-width:none;width:100%}.mk-orders-card-meta{gap:10px 14px}.mk-orders-header h1{font-size:65px}}
@media(max-width:380px){.mk-orders-card-top{align-items:start;flex-direction:column}.mk-orders-card-bottom strong{font-size:15px}.mk-orders-detail-link{font-size:10px}}
@media(prefers-reduced-motion:reduce){.mk-orders-page *{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;
