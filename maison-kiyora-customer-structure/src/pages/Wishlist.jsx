import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Heart, ShoppingBag, Trash2, LockKeyhole } from "lucide-react";
import { toast } from "react-toastify";
import useWishlist from "../hooks/useWishlist.js";
import useCart from "../hooks/useCart.js";
import useAuth from "../hooks/useAuth.js";

const currency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

function getProductId(product) {
  return product?.id ?? product?._id ?? product?.slug ?? null;
}

function getProductImage(product) {
  const image = product?.image ?? product?.images?.[0] ?? product?.thumbnail;
  if (typeof image === "string") return image;
  if (image && typeof image === "object") return image.url ?? image.src ?? "";
  return "";
}

function getProductPrice(product) {
  const value = product?.price ?? product?.salePrice;
  const number = typeof value === "string" ? Number(value.replace(/[^\d.]/g, "")) : Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

export default function Wishlist() {
  const { user, isLoading: authLoading } = useAuth();
  const { wishlistItems = [], removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [busyId, setBusyId] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const products = useMemo(() => wishlistItems.filter(Boolean), [wishlistItems]);

  if (authLoading) {
    return <main className="mk-wishlist-page mk-wishlist-loading"><style>{styles}</style><span className="mk-wishlist-spinner" />Preparing your saved fragrances...</main>;
  }

  if (!user) return <Navigate to="/login" state={{ from: { pathname: "/wishlist" } }} replace />;

  const handleRemove = (product) => {
    const id = getProductId(product);
    if (id == null) return;
    try {
      removeFromWishlist(id);
      toast.info("Fragrance removed from your wishlist.");
    } catch (error) {
      toast.error(error?.message || "Unable to remove this fragrance.");
    }
  };

  const handleAddToCart = async (product) => {
    const id = getProductId(product);
    if (id == null || busyId != null) return;
    if (product?.inStock === false || product?.isAvailable === false || product?.stock === 0) {
      toast.info("This fragrance is currently unavailable.");
      return;
    }
    setBusyId(String(id));
    try {
      const result = await addToCart(product, 1);
      if (result === false || result?.success === false) throw new Error(result?.message || "Unable to add fragrance.");
      toast.success("Added to your shopping bag.");
    } catch (error) {
      toast.error(error?.message || "Unable to add this fragrance to your bag.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="mk-wishlist-page">
      <style>{styles}</style>
      <div className="mk-wishlist-shell">
        <nav className="mk-wishlist-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link><span>/</span><Link to="/account">My Account</Link><span>/</span><span>Wishlist</span>
        </nav>
        <header className="mk-wishlist-header">
          <div>
            <span className="mk-wishlist-eyebrow">YOUR PERSONAL EDIT</span>
            <h1>Saved <em>Fragrances.</em></h1>
            <p>A collection of scents worth returning to.</p>
          </div>
          <div className="mk-wishlist-header-actions">
            <span className="mk-wishlist-count">{products.length} {products.length === 1 ? "fragrance" : "fragrances"}</span>
            {products.length > 0 && <button type="button" className="mk-wishlist-clear" onClick={() => setConfirmClear(true)}><Trash2 size={15} /> Clear all</button>}
          </div>
        </header>
        {products.length === 0 ? (
          <motion.section className="mk-wishlist-empty" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mk-wishlist-empty-icon"><Heart size={31} strokeWidth={1.2} /></div>
            <span className="mk-wishlist-eyebrow">A COLLECTION YET TO BEGIN</span>
            <h2>Your wishlist is <em>waiting.</em></h2>
            <p>Explore Maison Kiyora and save the fragrances that speak to you. They'll appear here whenever you return on this browser.</p>
            <Link to="/collections" className="mk-wishlist-primary">Discover Fragrances <ArrowRight size={17} /></Link>
          </motion.section>
        ) : (
          <>
            <div className="mk-wishlist-grid">
              <AnimatePresence mode="popLayout">
                {products.map((product, index) => {
                  const id = getProductId(product);
                  const name = product?.name ?? product?.title ?? "Maison Kiyora Fragrance";
                  const price = getProductPrice(product);
                  const image = getProductImage(product);
                  const available = product?.inStock !== false && product?.isAvailable !== false && product?.stock !== 0;
                  const link = product?.slug ? `/product/${encodeURIComponent(product.slug)}` : "/collections";
                  return (
                    <motion.article key={String(id ?? index)} layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25 }} className="mk-wishlist-card">
                      <div className="mk-wishlist-image-wrap">
                        <Link to={link} className="mk-wishlist-image-link" aria-label={`View ${name}`}>
                          {image ? <img src={image} alt={name} loading="lazy" /> : <div className="mk-wishlist-image-placeholder">MAISON<br />KIYORA</div>}
                        </Link>
                        <button type="button" className="mk-wishlist-remove" onClick={() => handleRemove(product)} aria-label={`Remove ${name} from wishlist`} title="Remove from wishlist"><Heart size={18} fill="currentColor" /></button>
                        {!available && <span className="mk-wishlist-unavailable">UNAVAILABLE</span>}
                      </div>
                      <div className="mk-wishlist-card-info">
                        <span className="mk-wishlist-card-kicker">MAISON KIYORA</span>
                        <Link to={link} className="mk-wishlist-card-title">{name}</Link>
                        {product?.size && <span className="mk-wishlist-size">{product.size}</span>}
                        <div className="mk-wishlist-card-bottom">
                          <span className="mk-wishlist-price">{price != null ? currency(price) : "Price on product page"}</span>
                          <button type="button" className="mk-wishlist-add" disabled={!available || busyId === String(id) || id == null} onClick={() => handleAddToCart(product)} aria-label={`Add ${name} to shopping bag`}>
                            <ShoppingBag size={17} strokeWidth={1.5} /><span>{busyId === String(id) ? "Adding..." : available ? "Add to Bag" : "Unavailable"}</span>
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
            <div className="mk-wishlist-bottom"><Link to="/collections"><ArrowLeft size={17} /> Continue Exploring</Link><Link to="/cart">View Shopping Bag <ArrowRight size={17} /></Link></div>
          </>
        )}
      </div>
      {confirmClear && (
        <div className="mk-wishlist-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmClear(false); }}>
          <div className="mk-wishlist-modal" role="alertdialog" aria-modal="true" aria-labelledby="mk-wishlist-modal-title" aria-describedby="mk-wishlist-modal-desc">
            <Heart size={27} strokeWidth={1.3} />
            <h2 id="mk-wishlist-modal-title">Clear your wishlist?</h2>
            <p id="mk-wishlist-modal-desc">This will remove all saved fragrances from this browser.</p>
            <div className="mk-wishlist-modal-actions"><button type="button" onClick={() => setConfirmClear(false)}>Keep Fragrances</button><button type="button" onClick={() => { try { clearWishlist(); toast.info("Wishlist cleared."); } catch (error) { toast.error(error?.message || "Unable to clear wishlist."); } finally { setConfirmClear(false); } }}>Clear Wishlist</button></div>
          </div>
        </div>
      )}
    </main>
  );
}

const styles = `
.mk-wishlist-page{min-height:75vh;background:#F5F0E8;color:#1D2940;font-family:"Manrope",sans-serif;padding:125px 24px 95px}
.mk-wishlist-page *{box-sizing:border-box}
.mk-wishlist-shell{max-width:1250px;margin:auto}
.mk-wishlist-breadcrumb{display:flex;gap:12px;align-items:center;color:#88847e;font-size:11px;margin-bottom:56px}
.mk-wishlist-breadcrumb a{color:inherit;text-decoration:none}.mk-wishlist-breadcrumb a:hover{color:#B69A69}
.mk-wishlist-header{display:flex;justify-content:space-between;align-items:end;gap:24px;margin-bottom:48px;padding-bottom:30px;border-bottom:1px solid #dfd5c9}
.mk-wishlist-eyebrow,.mk-wishlist-card-kicker{font-size:10px;font-weight:600;letter-spacing:.2em;color:#a08459}
.mk-wishlist-header h1{font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(58px,7vw,100px);font-weight:400;letter-spacing:-.05em;line-height:1;margin:17px 0}
.mk-wishlist-header h1 em,.mk-wishlist-empty h2 em{font-weight:300;color:#B69A69}
.mk-wishlist-header p{font-size:12px;color:#7b7b7c;line-height:1.8;margin:0}
.mk-wishlist-header-actions{display:flex;align-items:center;gap:22px;padding-bottom:5px}
.mk-wishlist-count{white-space:nowrap;font-size:11px;color:#777}
.mk-wishlist-clear{display:flex;align-items:center;gap:8px;background:none;border:0;color:#9b7065;font:inherit;font-size:11px;cursor:pointer;white-space:nowrap}
.mk-wishlist-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:34px 22px}
.mk-wishlist-card{min-width:0}.mk-wishlist-image-wrap{position:relative;aspect-ratio:4/5;background:#eae3d8;overflow:hidden}
.mk-wishlist-image-link{display:block;width:100%;height:100%}.mk-wishlist-image-link img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}.mk-wishlist-image-link:hover img{transform:scale(1.05)}
.mk-wishlist-image-placeholder{height:100%;display:grid;place-items:center;text-align:center;font-family:"Cormorant Garamond",serif;font-size:32px;letter-spacing:.15em;color:#a59683}
.mk-wishlist-remove{position:absolute;right:13px;top:13px;width:39px;height:39px;display:grid;place-items:center;border:1px solid #e8dfd4;border-radius:50%;background:rgba(245,240,232,.95);color:#a78963;cursor:pointer;transition:transform .2s}.mk-wishlist-remove:hover{transform:scale(1.08)}
.mk-wishlist-unavailable{position:absolute;left:12px;bottom:12px;padding:8px 10px;background:#1D2940;color:white;font-size:9px;letter-spacing:.1em}
.mk-wishlist-card-info{padding:19px 2px 0}.mk-wishlist-card-kicker{font-size:9px}.mk-wishlist-card-title{display:block;margin:8px 0 4px;color:#1D2940;font-family:"Cormorant Garamond",serif;font-size:clamp(24px,2.4vw,33px);line-height:1.05;text-decoration:none}.mk-wishlist-card-title:hover{color:#a08459}
.mk-wishlist-size{font-size:10px;color:#85817c}.mk-wishlist-card-bottom{display:flex;flex-direction:column;gap:15px;margin-top:16px}.mk-wishlist-price{font-size:13px;font-weight:600}
.mk-wishlist-add{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:43px;background:#1D2940;color:#fff;border:1px solid #1D2940;font:inherit;font-size:10px;font-weight:600;letter-spacing:.04em;cursor:pointer;transition:background .2s}.mk-wishlist-add:hover:not(:disabled){background:#30405a}.mk-wishlist-add:disabled{opacity:.55;cursor:not-allowed}
.mk-wishlist-bottom{display:flex;justify-content:space-between;gap:20px;margin-top:60px;padding-top:25px;border-top:1px solid #dfd5c9}.mk-wishlist-bottom a{display:inline-flex;align-items:center;gap:9px;text-decoration:none;color:#1D2940;font-size:11px;font-weight:600}.mk-wishlist-bottom a:hover{color:#a08459}
.mk-wishlist-empty{display:flex;align-items:center;flex-direction:column;justify-content:center;text-align:center;min-height:470px;padding:40px 20px}.mk-wishlist-empty-icon{width:76px;height:76px;border:1px solid #d8c9b5;border-radius:50%;display:grid;place-items:center;color:#B69A69;margin-bottom:30px}.mk-wishlist-empty h2{font-family:"Cormorant Garamond",serif;font-weight:400;font-size:clamp(46px,6vw,76px);line-height:1;margin:18px 0}.mk-wishlist-empty p{max-width:440px;font-size:12px;line-height:2;color:#7c7a76;margin:0 0 28px}.mk-wishlist-primary{display:flex;align-items:center;gap:30px;padding:17px 24px;background:#1D2940;color:#fff;text-decoration:none;font-size:11px;letter-spacing:.06em}.mk-wishlist-primary:hover{background:#30405a}
.mk-wishlist-loading{display:flex;align-items:center;justify-content:center;gap:15px;font-size:12px}.mk-wishlist-spinner{width:20px;height:20px;border:2px solid #d8c9b5;border-top-color:#1D2940;border-radius:50%;animation:mk-wishlist-spin .8s linear infinite}@keyframes mk-wishlist-spin{to{transform:rotate(360deg)}}
.mk-wishlist-modal-backdrop{position:fixed;inset:0;z-index:9999;background:rgba(12,19,31,.58);display:grid;place-items:center;padding:20px}.mk-wishlist-modal{width:min(100%,420px);padding:35px;background:#F5F0E8;text-align:center;box-shadow:0 15px 60px #0003}.mk-wishlist-modal>svg{color:#B69A69}.mk-wishlist-modal h2{font-family:"Cormorant Garamond",serif;font-size:39px;font-weight:400;margin:15px 0}.mk-wishlist-modal p{font-size:12px;color:#777;line-height:1.8}.mk-wishlist-modal-actions{display:flex;gap:10px;margin-top:25px}.mk-wishlist-modal-actions button{flex:1;min-height:45px;padding:8px;border:1px solid #1D2940;font:inherit;font-size:11px;cursor:pointer}.mk-wishlist-modal-actions button:first-child{background:transparent;color:#1D2940}.mk-wishlist-modal-actions button:last-child{background:#1D2940;color:#fff}
@media(max-width:1050px){.mk-wishlist-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:740px){.mk-wishlist-page{padding:105px 20px 65px}.mk-wishlist-breadcrumb{margin-bottom:34px}.mk-wishlist-header{align-items:start;flex-direction:column;gap:20px;margin-bottom:30px}.mk-wishlist-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:30px 15px}.mk-wishlist-card-title{font-size:27px}}@media(max-width:440px){.mk-wishlist-page{padding-inline:14px}.mk-wishlist-header h1{font-size:57px}.mk-wishlist-image-wrap{aspect-ratio:3/4}.mk-wishlist-card-title{font-size:23px}.mk-wishlist-card-bottom{gap:12px}.mk-wishlist-add{font-size:9px;gap:6px}.mk-wishlist-bottom{flex-direction:column;align-items:flex-start}.mk-wishlist-modal-actions{flex-direction:column}}
@media(prefers-reduced-motion:reduce){.mk-wishlist-page *{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;
