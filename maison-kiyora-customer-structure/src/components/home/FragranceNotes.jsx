import { useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { getAllProducts } from "../../data/products.js";

// Maison Kiyora — interactive fragrance discovery.
// Uses product catalog images and never invents fragrance notes.

const EASE = [0.22, 1, 0.36, 1];

const IMAGE_FALLBACKS = {
  "oody-raspberry": "/images/products/oody-raspberry.png",
  "fruits-of-love": "/images/products/fruits-of-love.png",
  "mandarin-melons": "/images/products/mandarin-melons.png",
  "cherry-you-lost": "/images/products/cherry-you-lost.png",
  "yours-pine": "/images/products/yours-pine.png",
  "autumn-hugs": "/images/products/autumn-hugs.png",
  "dancing-raspberry": "/images/products/dancing-raspberry.png",
};

function normalizeNotes(value) {
  if (Array.isArray(value)) {
    return value.map((item) => typeof item === "string" ? item : item?.name || item?.label || "")
      .filter(Boolean).join(", ");
  }
  return typeof value === "string" ? value.trim() : "";
}

function getNotes(product) {
  const notes = product?.notes && typeof product.notes === "object" ? product.notes : {};
  return [
    { label: "TOP NOTES", value: normalizeNotes(notes.top || product?.topNotes) },
    { label: "HEART NOTES", value: normalizeNotes(notes.heart || notes.middle || product?.heartNotes) },
    { label: "BASE NOTES", value: normalizeNotes(notes.base || product?.baseNotes) },
  ].filter((note) => note.value);
}

function getProductImage(product) {
  const image = product?.images?.[0];
  const candidates = [
    typeof image === "string" ? image : image?.src,
    typeof product?.image === "string" ? product.image : product?.image?.src,
    typeof product?.thumbnail === "string" ? product.thumbnail : product?.thumbnail?.src,
    IMAGE_FALLBACKS[product?.slug],
  ];
  return candidates.find((src) => typeof src === "string" && src.trim()) || "";
}

const STYLES = `
  .mk-notes{position:relative;overflow:hidden;padding:clamp(76px,9vw,140px) 0;background:#f5f0e8;color:#211c19}
  .mk-notes *{box-sizing:border-box}
  .mk-notes__container{width:min(1380px,calc(100% - 64px));margin:auto}
  .mk-notes__header{display:grid;grid-template-columns:1.15fr .85fr;align-items:end;gap:40px;margin-bottom:clamp(35px,5vw,68px)}
  .mk-notes__eyebrow{display:flex;align-items:center;gap:16px;margin-bottom:26px;color:#967a51;font:600 10px/1.5 "Manrope",sans-serif;letter-spacing:.24em}
  .mk-notes__eyebrow-line{width:40px;height:1px;background:#b69a69}
  .mk-notes__title{margin:0;font:400 clamp(58px,7vw,105px)/.94 "Cormorant Garamond",Georgia,serif;letter-spacing:-.045em}
  .mk-notes__title em{color:#b69a69;font-weight:400}
  .mk-notes__intro{max-width:410px;margin:0 0 10px auto;color:#756a60;font:400 13px/1.95 "Manrope",sans-serif}
  .mk-notes__layout{display:grid;grid-template-columns:minmax(290px,.77fr) minmax(0,1.23fr);min-height:620px;border:1px solid #ded5c8}
  .mk-notes__list{padding:clamp(26px,3.7vw,52px);border-right:1px solid #ded5c8}
  .mk-notes__list-label{display:block;margin-bottom:22px;color:#967a51;font:600 10px/1.5 "Manrope",sans-serif;letter-spacing:.2em}
  .mk-notes__item{position:relative;display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;padding:17px 0;border:0;border-bottom:1px solid #e4dbcf;background:none;color:#8a8077;text-align:left;cursor:pointer;transition:color .25s ease,padding .25s ease}
  .mk-notes__item:hover,.mk-notes__item--active{color:#211c19}
  .mk-notes__item--active{padding-left:12px}
  .mk-notes__item--active::before{content:"";position:absolute;left:0;top:23%;bottom:23%;width:2px;background:#b69a69}
  .mk-notes__item-name{font:400 clamp(24px,2.1vw,32px)/1.15 "Cormorant Garamond",Georgia,serif}
  .mk-notes__item svg{flex-shrink:0;opacity:.45;transition:transform .25s ease,opacity .25s ease}
  .mk-notes__item:hover svg,.mk-notes__item--active svg{opacity:1;transform:translate(3px,-3px)}
  .mk-notes__detail{position:relative;isolation:isolate;overflow:hidden;display:flex;align-items:center;min-width:0;padding:clamp(30px,4.5vw,65px);background:radial-gradient(ellipse at 72% 42%,rgba(182,154,105,.19),transparent 58%),linear-gradient(130deg,#f0e9df,#e9dfd1)}
  .mk-notes__detail::after{content:"";position:absolute;z-index:-1;right:-12%;top:8%;width:65%;aspect-ratio:1;border:1px solid rgba(182,154,105,.18);border-radius:50%;pointer-events:none}
  .mk-notes__detail-number{position:absolute;top:26px;right:34px;color:#b69a69;font:400 38px/1 "Cormorant Garamond",Georgia,serif}
  .mk-notes__detail-inner{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.98fr);align-items:center;gap:clamp(16px,2.4vw,36px);width:100%}
  .mk-notes__copy{position:relative;z-index:2;min-width:0}
  .mk-notes__detail-label{margin:0 0 20px;color:#967a51;font:600 9px/1.6 "Manrope",sans-serif;letter-spacing:.22em}
  .mk-notes__detail-title{margin:0;color:#211c19;font:400 clamp(45px,4.3vw,74px)/.98 "Cormorant Garamond",Georgia,serif;letter-spacing:-.04em;overflow-wrap:break-word}
  .mk-notes__detail-divider{width:48px;height:1px;margin:25px 0;background:#b69a69}
  .mk-notes__detail-description{max-width:360px;margin:0 0 22px;color:#70675f;font:400 12px/1.85 "Manrope",sans-serif;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4;overflow:hidden}
  .mk-notes__note-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:0 0 26px}
  .mk-notes__note-label{display:block;margin-bottom:6px;color:#967a51;font:600 8px/1.5 "Manrope",sans-serif;letter-spacing:.12em}
  .mk-notes__note-value{display:block;color:#433a33;font:400 18px/1.25 "Cormorant Garamond",Georgia,serif}
  .mk-notes__link{display:inline-flex;align-items:center;gap:12px;width:fit-content;padding-bottom:9px;border-bottom:1px solid #b69a69;color:#211c19;text-decoration:none;font:600 10px/1.5 "Manrope",sans-serif;letter-spacing:.12em;transition:gap .25s ease}
  .mk-notes__link:hover{gap:19px}
  .mk-notes__visual{position:relative;display:flex;align-items:center;justify-content:center;min-width:0;min-height:400px}
  .mk-notes__visual-glow{position:absolute;width:90%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgba(255,252,246,.72),rgba(255,252,246,0) 70%);pointer-events:none}
  .mk-notes__image{position:relative;z-index:1;display:block;width:100%;max-width:340px;height:clamp(330px,31vw,470px);object-fit:contain;filter:drop-shadow(12px 24px 19px rgba(44,30,20,.17));user-select:none}
  .mk-notes__image-placeholder{display:flex;align-items:center;justify-content:center;width:100%;height:340px;border:1px solid rgba(182,154,105,.25);color:#9a8469;text-align:center;font:400 26px/1.2 "Cormorant Garamond",Georgia,serif}
  .mk-notes__footer{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:26px}
  .mk-notes__footer-copy{color:#81776d;font:500 10px/1.6 "Manrope",sans-serif;letter-spacing:.11em}
  .mk-notes__item:focus-visible,.mk-notes__link:focus-visible{outline:2px solid #b69a69;outline-offset:4px}
  @media(max-width:1120px){.mk-notes__detail{padding:40px 28px}.mk-notes__detail-inner{gap:10px}.mk-notes__image{height:390px}.mk-notes__detail-title{font-size:clamp(42px,4.6vw,65px)}}
  @media(max-width:850px){.mk-notes__header{grid-template-columns:1fr;gap:20px}.mk-notes__intro{margin-left:0}.mk-notes__layout{grid-template-columns:1fr}.mk-notes__list{border-right:0;border-bottom:1px solid #ded5c8;padding:24px}.mk-notes__list-label{margin-bottom:8px}.mk-notes__list-items{display:flex;gap:22px;overflow-x:auto;scrollbar-width:thin}.mk-notes__item{flex:0 0 auto;width:auto;white-space:nowrap;padding:15px 0}.mk-notes__item--active{padding-left:0}.mk-notes__item--active::before{top:auto;bottom:0;left:0;right:0;width:auto;height:2px}.mk-notes__item-name{font-size:26px}.mk-notes__detail{min-height:480px;padding:38px}.mk-notes__image{height:390px}}
  @media(max-width:600px){.mk-notes{padding:75px 0}.mk-notes__container{width:calc(100% - 30px)}.mk-notes__title{font-size:clamp(52px,12vw,74px)}.mk-notes__intro{font-size:12px}.mk-notes__detail{padding:55px 22px 35px}.mk-notes__detail-inner{grid-template-columns:1fr;gap:8px}.mk-notes__visual{grid-row:1;min-height:270px}.mk-notes__image{height:300px;max-width:270px}.mk-notes__copy{grid-row:2}.mk-notes__detail-number{top:17px;right:20px;font-size:29px}.mk-notes__detail-title{font-size:clamp(44px,11vw,62px)}.mk-notes__detail-description{font-size:12px}.mk-notes__footer{align-items:flex-start;flex-direction:column}.mk-notes__note-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(prefers-reduced-motion:reduce){.mk-notes__item,.mk-notes__item svg,.mk-notes__link{transition:none}}
`;

function ProductVisual({ product }) {
  const src = getProductImage(product);
  const [failedSrc, setFailedSrc] = useState(null);
  const fallback = IMAGE_FALLBACKS[product?.slug];
  const imageSrc = failedSrc === src && fallback && fallback !== src ? fallback : src;
  const imageFailed = failedSrc === imageSrc;

  return (
    <div className="mk-notes__visual">
      <span className="mk-notes__visual-glow" aria-hidden="true" />
      {imageSrc && !imageFailed ? (
        <img
          className="mk-notes__image"
          src={imageSrc}
          alt={`${product.name} perfume bottle`}
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(imageSrc)}
        />
      ) : (
        <div className="mk-notes__image-placeholder" role="img" aria-label={`${product.name} image unavailable`}>
          MAISON KIYORA
        </div>
      )}
    </div>
  );
}

export default function FragranceNotes({ products: providedProducts }) {
  const reducedMotion = useReducedMotion();
  const instanceId = useId();
  const catalog = useMemo(() => {
    const source = Array.isArray(providedProducts) ? providedProducts : getAllProducts();
    return Array.isArray(source) ? source.filter((product) => product && typeof product.name === "string" && product.name.trim()) : [];
  }, [providedProducts]);
  const [requestedIndex, setRequestedIndex] = useState(0);
  const selectedIndex = Math.max(0, Math.min(requestedIndex, Math.max(0, catalog.length - 1)));
  const selectedProduct = catalog[selectedIndex];

  if (!selectedProduct) return null;

  const notes = getNotes(selectedProduct);
  const productLink = selectedProduct.slug ? `/product/${selectedProduct.slug}` : "/collections";
  const selectedKey = selectedProduct.id || selectedProduct.slug || selectedIndex;

  return (
    <section className="mk-notes" aria-labelledby={`${instanceId}-title`}>
      <style>{STYLES}</style>
      <div className="mk-notes__container">
        <motion.div
          className="mk-notes__header"
          initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reducedMotion ? 0 : .7, ease: EASE }}
        >
          <div>
            <div className="mk-notes__eyebrow">
              <span>03</span><span className="mk-notes__eyebrow-line" aria-hidden="true" />
              <span>FRAGRANCE DISCOVERY</span>
            </div>
            <h2 id={`${instanceId}-title`} className="mk-notes__title">
              Discover the<br /><em>composition.</em>
            </h2>
          </div>
          <p className="mk-notes__intro">
            Every fragrance has its own identity. Explore the Maison Kiyora collection and discover the scent that speaks to you.
          </p>
        </motion.div>

        <div className="mk-notes__layout">
          <div className="mk-notes__list">
            <span className="mk-notes__list-label">SELECT A FRAGRANCE</span>
            <div className="mk-notes__list-items" role="group" aria-label="Select a fragrance">
              {catalog.map((product, index) => {
                const active = index === selectedIndex;
                return (
                  <button
                    key={product.id || product.slug || index}
                    type="button"
                    className={`mk-notes__item ${active ? "mk-notes__item--active" : ""}`}
                    aria-pressed={active}
                    aria-controls={`${instanceId}-detail`}
                    onClick={() => setRequestedIndex(index)}
                  >
                    <span className="mk-notes__item-name">{product.name}</span>
                    <ArrowUpRight size={17} strokeWidth={1.4} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mk-notes__detail" id={`${instanceId}-detail`} aria-label="Selected fragrance details">
            <span className="mk-notes__detail-number" aria-hidden="true">
              {String(selectedIndex + 1).padStart(2, "0")}
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selectedKey}
                className="mk-notes__detail-inner"
                initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : -8 }}
                transition={{ duration: reducedMotion ? 0 : .32, ease: EASE }}
              >
                <div className="mk-notes__copy">
                  <p className="mk-notes__detail-label">MAISON KIYORA — FRAGRANCE</p>
                  <h3 className="mk-notes__detail-title">{selectedProduct.name}</h3>
                  <div className="mk-notes__detail-divider" aria-hidden="true" />
                  <p className="mk-notes__detail-description">
                    {typeof selectedProduct.description === "string" && selectedProduct.description.trim()
                      ? selectedProduct.description
                      : "Explore this fragrance from the Maison Kiyora collection."}
                  </p>
                  {notes.length > 0 && (
                    <div className="mk-notes__note-grid">
                      {notes.map((note) => (
                        <div key={note.label}>
                          <span className="mk-notes__note-label">{note.label}</span>
                          <span className="mk-notes__note-value">{note.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link to={productLink} className="mk-notes__link">
                    EXPLORE FRAGRANCE <ArrowUpRight size={17} strokeWidth={1.5} aria-hidden="true" />
                  </Link>
                </div>
                <ProductVisual product={selectedProduct} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mk-notes__footer">
          <span className="mk-notes__footer-copy">
            {String(catalog.length).padStart(2, "0")} FRAGRANCES. YOUR STORY.
          </span>
          <Link to="/collections" className="mk-notes__link">
            DISCOVER ALL <ArrowRight size={17} strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
