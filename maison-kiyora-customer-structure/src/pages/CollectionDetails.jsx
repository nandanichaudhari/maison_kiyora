import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Heart, Search, ShoppingBag, X } from "lucide-react";
import { toast } from "react-toastify";
import * as productsModule from "../data/products.js";
import * as collectionsModule from "../data/collections.js";
import useCart from "../hooks/useCart.js";
import useWishlist from "../hooks/useWishlist.js";

// Maison Kiyora — collection landing page.
// Uses existing local catalog data. Never invents products, availability or collection copy.
const slugify = (value) => String(value ?? "").trim().toLowerCase().normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "").replace(/&/g, "and")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function arrayFromModule(module, keys) {
  for (const key of keys) {
    const value = module[key];
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      if (Array.isArray(value.items)) return value.items;
      if (Array.isArray(value.products)) return value.products;
      if (Array.isArray(value.collections)) return value.collections;
    }
  }
  return [];
}

const nameOf = (product) => product.name || product.title || "Untitled fragrance";
const idOf = (product) => product.id ?? product.slug ?? product.handle;
const slugOf = (product) => product.slug || product.handle || slugify(nameOf(product));
const priceOf = (product) => {
  const raw = product.price ?? product.salePrice ?? product.sellingPrice ?? product.variants?.[0]?.price;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  if (typeof raw === "string" && raw.trim()) {
    const parsed = Number(raw.replace(/[₹,\s]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};
const formatPrice = (value) => value == null ? "Price on request" : new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0,
}).format(value);
const imageOf = (product) => {
  const candidate = product.image || product.imageUrl || product.thumbnail || product.featuredImage || product.coverImage ||
    product.images?.[0] || product.gallery?.[0] || product.productImages?.[0];
  return typeof candidate === "string" ? candidate : candidate?.src || candidate?.url || candidate?.image || "";
};
const isAvailable = (product) => product.inStock !== false && product.available !== false &&
  product.isAvailable !== false && !["out_of_stock", "out-of-stock"].includes(product.stockStatus) &&
  !(typeof product.stock === "number" && product.stock <= 0);

function referenceSlugs(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value.flatMap(referenceSlugs);
  if (typeof value === "object") return [value.slug, value.handle, value.id, value.name, value.title]
    .filter(Boolean).map(slugify);
  return [slugify(value)];
}

function belongsToCollection(product, collection, requestedSlug) {
  const candidates = [
    product.collection, product.collections, product.collectionSlug, product.collection_slug,
    product.category, product.categories, product.categorySlug, product.fragranceFamily,
  ].flatMap(referenceSlugs);
  const accepted = new Set([requestedSlug, ...referenceSlugs(collection)]);
  return candidates.some((candidate) => accepted.has(candidate));
}

function ProductImage({ product }) {
  const [broken, setBroken] = useState(false);
  const src = imageOf(product);
  useEffect(() => setBroken(false), [src]);
  if (!src || broken) return (
    <div className="mk-cd-image-fallback" role="img" aria-label={`${nameOf(product)} image unavailable`}>
      <span>MAISON KIYORA</span><small>THE ART OF SLOW PERFUMERY</small>
    </div>
  );
  return <img src={src} alt={nameOf(product)} loading="lazy" onError={() => setBroken(true)} />;
}

export default function CollectionDetails() {
  const { slug } = useParams();
  const reducedMotion = useReducedMotion();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [showSearch, setShowSearch] = useState(false);

  const allProducts = useMemo(() => arrayFromModule(productsModule,
    ["products", "PRODUCTS", "allProducts", "productCatalog", "default"]), []);
  const allCollections = useMemo(() => arrayFromModule(collectionsModule,
    ["collections", "COLLECTIONS", "allCollections", "default"]), []);
  const normalizedSlug = slugify(slug);
  const collection = useMemo(() => allCollections.find((item) =>
    referenceSlugs(item).includes(normalizedSlug)), [allCollections, normalizedSlug]);
  const collectionName = collection?.name || collection?.title ||
    normalizedSlug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  const collectionDescription = collection?.description || collection?.shortDescription || "";

  const matchingProducts = useMemo(() => {
    const explicit = Array.isArray(collection?.products) ? collection.products : null;
    if (explicit) {
      const allowed = new Set(explicit.flatMap(referenceSlugs));
      return allProducts.filter((product) => [idOf(product), slugOf(product), nameOf(product)]
        .some((value) => allowed.has(slugify(value))));
    }
    return allProducts.filter((product) => belongsToCollection(product, collection, normalizedSlug));
  }, [allProducts, collection, normalizedSlug]);

  const displayedProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    const results = matchingProducts.filter((product) => !term ||
      [nameOf(product), product.description, product.shortDescription].join(" ").toLowerCase().includes(term));
    if (sort === "name") results.sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
    if (sort === "price-low") results.sort((a, b) => (priceOf(a) ?? Infinity) - (priceOf(b) ?? Infinity));
    if (sort === "price-high") results.sort((a, b) => (priceOf(b) ?? -Infinity) - (priceOf(a) ?? -Infinity));
    return results;
  }, [matchingProducts, query, sort]);

  useEffect(() => {
    document.title = `${collectionName || "Collection"} | Maison Kiyora`;
    setQuery(""); setSort("featured"); setShowSearch(false);
  }, [normalizedSlug, collectionName]);

  function handleAddToCart(product) {
    if (!isAvailable(product)) return toast.info("This fragrance is currently unavailable.");
    try {
      const result = addToCart(product, 1);
      if (result === false) return toast.error("Unable to add this fragrance to your bag.");
      toast.success("Added to your shopping bag.");
    } catch (error) { toast.error(error?.message || "Could not add to bag."); }
  }

  function handleWishlist(product) {
    try {
      const saved = isInWishlist(idOf(product));
      toggleWishlist(product);
      toast.success(saved ? "Removed from your wishlist." : "Saved to your wishlist.");
    } catch (error) { toast.error(error?.message || "Could not update wishlist."); }
  }

  return (
    <main className="mk-cd-page">
      <style>{styles}</style>
      <section className="mk-cd-hero" aria-labelledby="mk-cd-heading">
        <div className="mk-cd-hero-inner">
          <Link to="/collections" className="mk-cd-back"><ArrowLeft size={16} /> ALL COLLECTIONS</Link>
          <motion.div initial={reducedMotion ? false : { opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
            <p className="mk-cd-eyebrow">MAISON KIYORA / THE COLLECTION</p>
            <h1 id="mk-cd-heading">{collectionName || "The Collection"}<span>.</span></h1>
            {collectionDescription ? <p className="mk-cd-description">{collectionDescription}</p> :
              <p className="mk-cd-description">Explore fragrances from this collection.</p>}
          </motion.div>
          <div className="mk-cd-hero-mark" aria-hidden="true">MK</div>
        </div>
      </section>

      <section className="mk-cd-content" aria-label="Collection fragrances">
        <div className="mk-cd-container">
          <div className="mk-cd-toolbar">
            <div className="mk-cd-count"><span className="mk-cd-gold-line" />
              {matchingProducts.length} {matchingProducts.length === 1 ? "FRAGRANCE" : "FRAGRANCES"}
            </div>
            <div className="mk-cd-controls">
              <button type="button" className="mk-cd-search-toggle" onClick={() => setShowSearch((value) => !value)}
                aria-expanded={showSearch} aria-label="Toggle collection search"><Search size={17} /> SEARCH</button>
              <label className="mk-cd-sort">SORT BY
                <select value={sort} onChange={(event) => setSort(event.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="name">Name A–Z</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </label>
            </div>
          </div>
          {showSearch && <div className="mk-cd-search-field">
            <Search size={19} /><input type="search" placeholder="Find a fragrance in this collection…"
              aria-label="Search within collection" value={query} onChange={(event) => setQuery(event.target.value)} />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={18} /></button>}
          </div>}

          {displayedProducts.length ? (
            <div className="mk-cd-grid">
              {displayedProducts.map((product, index) => {
                const id = idOf(product) ?? slugOf(product);
                const saved = isInWishlist(id);
                const available = isAvailable(product);
                return (
                  <motion.article className="mk-cd-card" key={String(id)}
                    initial={reducedMotion ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.2) }}>
                    <div className="mk-cd-card-visual">
                      <Link to={`/product/${encodeURIComponent(slugOf(product))}`} aria-label={`View ${nameOf(product)}`}>
                        <ProductImage product={product} />
                      </Link>
                      <button type="button" className={`mk-cd-heart ${saved ? "is-saved" : ""}`}
                        onClick={() => handleWishlist(product)} aria-label={`${saved ? "Remove" : "Add"} ${nameOf(product)} ${saved ? "from" : "to"} wishlist`}
                        aria-pressed={saved}><Heart size={19} fill={saved ? "currentColor" : "none"} /></button>
                      {!available && <span className="mk-cd-unavailable">UNAVAILABLE</span>}
                    </div>
                    <div className="mk-cd-card-details">
                      <p className="mk-cd-brand">MAISON KIYORA</p>
                      <Link to={`/product/${encodeURIComponent(slugOf(product))}`} className="mk-cd-name">{nameOf(product)}</Link>
                      {product.size && <p className="mk-cd-size">{product.size}</p>}
                      <div className="mk-cd-card-bottom">
                        <span className="mk-cd-price">{formatPrice(priceOf(product))}</span>
                        <button type="button" className="mk-cd-add" disabled={!available}
                          onClick={() => handleAddToCart(product)} aria-label={`Add ${nameOf(product)} to bag`}>
                          <ShoppingBag size={18} /><span>ADD TO BAG</span>
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <div className="mk-cd-empty">
              <span className="mk-cd-empty-mark">MK</span>
              <p className="mk-cd-eyebrow">YOUR FRAGRANCE JOURNEY</p>
              <h2>{query ? "No matching fragrances." : "Nothing here just yet."}</h2>
              <p>{query ? "Try another search within this collection." :
                "There are no listed fragrances for this collection at the moment."}</p>
              {query ? <button type="button" onClick={() => setQuery("")} className="mk-cd-empty-link">CLEAR SEARCH <ArrowRight size={17} /></button> :
                <Link to="/collections" className="mk-cd-empty-link">EXPLORE ALL COLLECTIONS <ArrowRight size={17} /></Link>}
            </div>
          )}
          <div className="mk-cd-end"><span>MAISON KIYORA</span><p>THE ART OF SLOW PERFUMERY</p></div>
        </div>
      </section>
    </main>
  );
}

const styles = `
.mk-cd-page{--ivory:#F5F0E8;--espresso:#211C19;--gold:#B69A69;--sand:#D8C9B5;background:var(--ivory);color:var(--espresso);font-family:Manrope,Arial,sans-serif;min-height:100vh}
.mk-cd-page *{box-sizing:border-box}.mk-cd-page a{text-decoration:none}.mk-cd-page button,.mk-cd-page select{font:inherit}
.mk-cd-hero{position:relative;overflow:hidden;background:linear-gradient(120deg,#e9dfd2,#f3ece2 58%,#e7dccb);padding:150px 6% 95px}
.mk-cd-hero-inner{max-width:1360px;margin:auto;position:relative;z-index:1}.mk-cd-back{display:inline-flex;gap:11px;align-items:center;color:#7c6d5c;font-size:10px;letter-spacing:.15em;font-weight:650;margin-bottom:75px}
.mk-cd-eyebrow{color:#9b7e53;font-size:10px;letter-spacing:.25em;font-weight:650}.mk-cd-hero h1{font:400 clamp(68px,10vw,145px)/.94 'Cormorant Garamond',Georgia,serif;letter-spacing:-.055em;margin:25px 0;max-width:1000px;overflow-wrap:anywhere}.mk-cd-hero h1 span{color:var(--gold)}
.mk-cd-description{font-size:13px;color:#77736f;line-height:2;max-width:560px}.mk-cd-hero-mark{position:absolute;right:-1%;bottom:-65px;color:rgba(182,154,105,.11);font:400 clamp(160px,30vw,440px)/1 'Cormorant Garamond',Georgia,serif;pointer-events:none}
.mk-cd-content{padding:65px 6% 110px}.mk-cd-container{max-width:1360px;margin:auto}.mk-cd-toolbar{display:flex;align-items:center;justify-content:space-between;gap:25px;border-bottom:1px solid #dbd0c1;padding-bottom:25px;margin-bottom:35px}
.mk-cd-count{display:flex;align-items:center;gap:14px;font-size:10px;letter-spacing:.16em;font-weight:700}.mk-cd-gold-line{width:25px;height:1px;background:var(--gold)}.mk-cd-controls{display:flex;align-items:center;gap:28px}.mk-cd-search-toggle{display:flex;align-items:center;gap:9px;background:none;border:0;color:var(--espresso);font-size:10px;letter-spacing:.12em;cursor:pointer}
.mk-cd-sort{display:flex;align-items:center;gap:10px;color:#8e7d68;font-size:10px;letter-spacing:.1em}.mk-cd-sort select{padding:11px 12px;border:1px solid #d7cbbb;background:transparent;color:var(--espresso);font-size:11px;letter-spacing:0;max-width:180px}
.mk-cd-search-field{display:flex;align-items:center;gap:14px;border:1px solid #d7cbbb;background:#fff9;padding:16px 20px;margin-bottom:32px}.mk-cd-search-field input{flex:1;min-width:0;background:transparent;border:0;outline:0;color:var(--espresso);font:inherit;font-size:13px}.mk-cd-search-field button{border:0;background:transparent;cursor:pointer}
.mk-cd-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:40px 22px}.mk-cd-card{min-width:0}.mk-cd-card-visual{position:relative;aspect-ratio:4/5;overflow:hidden;background:#e7ddcf}.mk-cd-card-visual>a{display:block;width:100%;height:100%}.mk-cd-card-visual img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s}.mk-cd-card:hover img{transform:scale(1.045)}
.mk-cd-image-fallback{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;background:radial-gradient(circle,#f2e9da,#e2d6c5)}.mk-cd-image-fallback span{font:400 27px 'Cormorant Garamond',Georgia,serif;letter-spacing:.12em}.mk-cd-image-fallback small{font-size:8px;letter-spacing:.16em;color:#9b7e53}
.mk-cd-heart{position:absolute;right:13px;top:13px;width:39px;height:39px;display:grid;place-items:center;border:1px solid #ffffffb3;border-radius:50%;background:#f5f0e8e8;color:var(--espresso);cursor:pointer}.mk-cd-heart.is-saved{color:#a55b60}.mk-cd-unavailable{position:absolute;left:12px;bottom:12px;background:#211c19e8;color:white;padding:9px 12px;font-size:9px;letter-spacing:.12em}
.mk-cd-card-details{padding:19px 2px}.mk-cd-brand{font-size:9px;letter-spacing:.2em;color:#9b7e53;margin:0 0 9px}.mk-cd-name{font:500 clamp(25px,2.5vw,34px)/1.1 'Cormorant Garamond',Georgia,serif;color:var(--espresso);display:block}.mk-cd-name:hover{color:#9b7e53}.mk-cd-size{font-size:10px;color:#8c8177;margin:10px 0 0}.mk-cd-card-bottom{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid #e0d5c7;margin-top:18px;padding-top:14px}.mk-cd-price{font-size:12px;font-weight:650}.mk-cd-add{display:flex;align-items:center;gap:8px;background:transparent;border:1px solid #d4c5b1;color:var(--espresso);padding:10px;cursor:pointer;font-size:9px;letter-spacing:.08em}.mk-cd-add:hover:not(:disabled){background:var(--espresso);color:white}.mk-cd-add:disabled{opacity:.4;cursor:not-allowed}
.mk-cd-empty{padding:100px 20px;text-align:center;display:flex;align-items:center;flex-direction:column}.mk-cd-empty-mark{font:400 80px 'Cormorant Garamond',Georgia,serif;color:#cdbb9e}.mk-cd-empty h2{font:400 clamp(45px,6vw,78px)/1 'Cormorant Garamond',Georgia,serif;margin:15px 0}.mk-cd-empty>p:not(.mk-cd-eyebrow){font-size:12px;color:#80766c;line-height:2}.mk-cd-empty-link{display:inline-flex;align-items:center;gap:18px;margin-top:28px;border:0;border-bottom:1px solid var(--gold);background:transparent;padding:0 0 10px;color:var(--espresso);font-size:10px;letter-spacing:.12em;cursor:pointer}
.mk-cd-end{text-align:center;border-top:1px solid #ddd1c2;margin-top:100px;padding-top:40px}.mk-cd-end span{font:400 26px 'Cormorant Garamond',Georgia,serif;letter-spacing:.15em}.mk-cd-end p{font-size:9px;letter-spacing:.18em;color:#a08760}
@media(max-width:1080px){.mk-cd-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.mk-cd-add span{display:none}}
@media(max-width:760px){.mk-cd-hero{padding:120px 22px 70px}.mk-cd-back{margin-bottom:50px}.mk-cd-content{padding:45px 20px 85px}.mk-cd-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:30px 14px}.mk-cd-toolbar{align-items:flex-start;flex-direction:column;gap:20px}.mk-cd-controls{width:100%;justify-content:space-between}.mk-cd-hero-mark{bottom:-20px}.mk-cd-card-details{padding-top:14px}}
@media(max-width:450px){.mk-cd-hero h1{font-size:64px}.mk-cd-name{font-size:25px}.mk-cd-add{padding:8px}.mk-cd-heart{width:35px;height:35px;right:9px;top:9px}.mk-cd-sort select{max-width:140px}.mk-cd-price{font-size:11px}}
@media(prefers-reduced-motion:reduce){.mk-cd-page *{transition:none!important;animation:none!important}}
`;
