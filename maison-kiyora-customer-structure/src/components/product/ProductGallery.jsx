
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  ChevronLeft,
  ChevronRight,
  Expand,
  ImageOff,
  X,
} from "lucide-react";

// ======================================================
// MAISON KIYORA — PRODUCT GALLERY
// Premium product images, thumbnails and fullscreen zoom
// ======================================================

const FALLBACK_ALT = "Maison Kiyora fragrance";
const IMAGE_BASE = "/images/products";

// ------------------------------------------------------
// IMAGE NORMALIZATION
// ------------------------------------------------------

function normalizeImage(item, index, productName) {
  const source =
    typeof item === "string"
      ? { url: item }
      : item;

  if (!source || typeof source !== "object") {
    return null;
  }

  const url =
    source.url ||
    source.src ||
    source.image_url ||
    source.imageUrl ||
    source.secure_url ||
    source.publicUrl ||
    source.image;

  if (typeof url !== "string" || !url.trim()) {
    return null;
  }

  return {
    id: String(source.id ?? `${index}-${url}`),
    src: url.trim(),
    alt:
      source.alt ||
      source.alt_text ||
      source.altText ||
      `${productName || FALLBACK_ALT} — view ${index + 1}`,
  };
}

/**
 * Usage:
 *
 * <ProductGallery product={product} />
 *
 * <ProductGallery
 *   images={product.images}
 *   productName={product.name}
 * />
 *
 * Accepts URL strings and image objects.
 * Supports local PNG images and remote URLs.
 */

// ------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------

export default function ProductGallery({
  product,
  images,
  productName,
  className = "",
  showThumbnails = true,
  enableZoom = true,
  initialIndex = 0,
  onImageChange,
}) {
  const reducedMotion = useReducedMotion();

  const name =
    productName ||
    product?.name ||
    product?.title ||
    FALLBACK_ALT;

  const galleryImages = useMemo(() => {
    const input =
      images ??
      product?.images ??
      product?.gallery ??
      product?.image ??
      product?.image_url ??
      [];

    const list = Array.isArray(input)
      ? input
      : [input];

    const normalized = list
      .map((item, index) =>
        normalizeImage(item, index, name)
      )
      .filter(Boolean);

    // Use the local product PNG when the catalog
    // has no image entry for this product.
    if (!normalized.length && product?.slug) {
      normalized.push({
        id: `local-${product.slug}`,
        src: `${IMAGE_BASE}/${product.slug}.png`,
        alt: `${name} 55ml perfume bottle by Maison Kiyora`,
      });
    }

    // Prevent duplicate gallery images.
    const unique = new Set();

    return normalized.filter((item) => {
      if (unique.has(item.src)) return false;

      unique.add(item.src);
      return true;
    });
  }, [
    images,
    product?.images,
    product?.gallery,
    product?.image,
    product?.image_url,
    product?.slug,
    name,
  ]);

  const [activeIndex, setActiveIndex] = useState(
    initialIndex
  );

  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const [failedSources, setFailedSources] = useState([]);

  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  const count = galleryImages.length;

  const currentIndex = count
    ? Math.min(Math.max(activeIndex, 0), count - 1)
    : 0;

  const activeImage = galleryImages[currentIndex];

  const activeFailed =
    activeImage &&
    failedSources.includes(activeImage.src);

  // ----------------------------------------------------
  // RESET WHEN PRODUCT CHANGES
  // ----------------------------------------------------

  useEffect(() => {
    const safeIndex = Math.min(
      Math.max(initialIndex, 0),
      Math.max(count - 1, 0)
    );

    setActiveIndex(safeIndex);
    setIsZoomOpen(false);
    setFailedSources([]);
  }, [galleryImages, initialIndex, count]);

  // ----------------------------------------------------
  // IMAGE NAVIGATION
  // ----------------------------------------------------

  const selectImage = useCallback(
    (index) => {
      if (!count) return;

      const nextIndex = (index + count) % count;

      setActiveIndex(nextIndex);

      onImageChange?.(
        nextIndex,
        galleryImages[nextIndex]
      );
    },
    [count, galleryImages, onImageChange]
  );

  const previous = useCallback(() => {
    selectImage(currentIndex - 1);
  }, [selectImage, currentIndex]);

  const next = useCallback(() => {
    selectImage(currentIndex + 1);
  }, [selectImage, currentIndex]);

  // ----------------------------------------------------
  // IMAGE ERROR HANDLING
  // ----------------------------------------------------

  const markFailed = useCallback((src) => {
    setFailedSources((previousSources) =>
      previousSources.includes(src)
        ? previousSources
        : [...previousSources, src]
    );
  }, []);

  // ----------------------------------------------------
  // FULLSCREEN ZOOM
  // ----------------------------------------------------

  const openZoom = () => {
    if (!enableZoom || !activeImage || activeFailed) {
      return;
    }

    previousFocusRef.current = document.activeElement;
    setIsZoomOpen(true);
  };

  const closeZoom = useCallback(() => {
    setIsZoomOpen(false);
  }, []);

  useEffect(() => {
    if (!isZoomOpen) return undefined;

    const oldOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeZoom();
      }

      if (event.key === "ArrowLeft" && count > 1) {
        previous();
      }

      if (event.key === "ArrowRight" && count > 1) {
        next();
      }

      // Keep keyboard focus inside the modal.
      if (event.key === "Tab") {
        const dialog = document.querySelector(
          ".mk-gallery-lightbox"
        );

        if (!dialog) return;

        const focusable = Array.from(
          dialog.querySelectorAll(
            'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
          )
        );

        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (
          event.shiftKey &&
          document.activeElement === first
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    // Focus the close button after opening.
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener(
        "keydown",
        onKeyDown
      );

      previousFocusRef.current?.focus?.();
    };
  }, [
    isZoomOpen,
    closeZoom,
    previous,
    next,
    count,
  ]);

  // ----------------------------------------------------
  // RENDER
  // ----------------------------------------------------

  return (
    <div
      className={`mk-gallery ${className}`.trim()}
      aria-label={`${name} product images`}
    >
      <style>{styles}</style>

      {/* MAIN IMAGE STAGE */}
      <div className="mk-gallery-stage">
        {activeImage && !activeFailed ? (
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={activeImage.src}
              src={activeImage.src}
              alt={activeImage.alt}
              className="mk-gallery-main-image"
              loading="eager"
              decoding="async"
              initial={
                reducedMotion
                  ? false
                  : {
                      opacity: 0,
                      scale: 1.025,
                    }
              }
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={
                reducedMotion
                  ? undefined
                  : { opacity: 0 }
              }
              transition={{
                duration: reducedMotion ? 0 : 0.3,
              }}
              onError={() =>
                markFailed(activeImage.src)
              }
            />
          </AnimatePresence>
        ) : (
          <div
            className="mk-gallery-placeholder"
            role="img"
            aria-label="Product image unavailable"
          >
            <ImageOff
              size={30}
              strokeWidth={1.2}
            />

            <span>IMAGE UNAVAILABLE</span>
          </div>
        )}

        {/* PREVIOUS / NEXT CONTROLS */}
        {count > 1 && (
          <div className="mk-gallery-stage-controls">
            <button
              type="button"
              onClick={previous}
              aria-label="Previous product image"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Next product image"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* EXPAND IMAGE */}
        {enableZoom &&
          activeImage &&
          !activeFailed && (
            <button
              className="mk-gallery-expand"
              type="button"
              onClick={openZoom}
              aria-label="Enlarge product image"
            >
              <Expand size={17} />

              <span>VIEW LARGE</span>
            </button>
          )}

        {/* IMAGE COUNTER */}
        {count > 1 && (
          <span className="mk-gallery-counter">
            {String(currentIndex + 1).padStart(
              2,
              "0"
            )}
            {" / "}
            {String(count).padStart(2, "0")}
          </span>
        )}
      </div>

      {/* THUMBNAILS */}
      {showThumbnails && count > 1 && (
        <div
          className="mk-gallery-thumbnails"
          role="group"
          aria-label="Choose product image"
        >
          {galleryImages.map((item, index) => {
            const failed = failedSources.includes(
              item.src
            );

            return (
              <button
                key={item.id}
                type="button"
                className={`mk-gallery-thumb ${
                  index === currentIndex
                    ? "is-active"
                    : ""
                }`}
                onClick={() => selectImage(index)}
                aria-label={`Show product image ${
                  index + 1
                }`}
                aria-pressed={
                  index === currentIndex
                }
              >
                {failed ? (
                  <ImageOff size={18} />
                ) : (
                  <img
                    src={item.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={() =>
                      markFailed(item.src)
                    }
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX */}
      <AnimatePresence>
        {isZoomOpen && activeImage && (
          <motion.div
            className="mk-gallery-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`${name} enlarged image`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.2,
            }}
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget
              ) {
                closeZoom();
              }
            }}
          >
            {/* CLOSE */}
            <button
              ref={closeButtonRef}
              type="button"
              className="mk-gallery-close"
              onClick={closeZoom}
              aria-label="Close enlarged image"
            >
              <X size={23} />
            </button>

            {/* PREVIOUS */}
            {count > 1 && (
              <button
                type="button"
                className="mk-gallery-light-prev"
                onClick={previous}
                aria-label="Previous image"
              >
                <ChevronLeft size={25} />
              </button>
            )}

            {/* LARGE IMAGE */}
            {failedSources.includes(
              activeImage.src
            ) ? (
              <div className="mk-gallery-placeholder">
                <ImageOff size={32} />
                <span>Image unavailable</span>
              </div>
            ) : (
              <img
                className="mk-gallery-light-image"
                src={activeImage.src}
                alt={activeImage.alt}
                onError={() =>
                  markFailed(activeImage.src)
                }
              />
            )}

            {/* NEXT */}
            {count > 1 && (
              <button
                type="button"
                className="mk-gallery-light-next"
                onClick={next}
                aria-label="Next image"
              >
                <ChevronRight size={25} />
              </button>
            )}

            {/* CAPTION */}
            <span className="mk-gallery-light-caption">
              {name}
              {count > 1
                ? ` · ${currentIndex + 1} / ${count}`
                : ""}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ======================================================
// PREMIUM STYLES
// Ivory × Espresso × Champagne Gold
// ======================================================

const styles = `
.mk-gallery {
  --mk-navy: #1D2940;
  --mk-gold: #B69A69;
  --mk-ivory: #F5F0E8;

  width: 100%;
  min-width: 0;
  font-family: "Manrope", sans-serif;
}

.mk-gallery *,
.mk-gallery *::before,
.mk-gallery *::after {
  box-sizing: border-box;
}

.mk-gallery button {
  cursor: pointer;
}

/* MAIN STAGE */

.mk-gallery-stage {
  position: relative;
  display: grid;
  place-items: center;

  width: 100%;
  aspect-ratio: 4 / 5;
  overflow: hidden;

  background: linear-gradient(
    145deg,
    #f2eae0,
    #e9dfd2
  );

  border: 1px solid #e4d9ca;
}

/*
 * Product PNGs already contain a styled background.
 * Avoid extra padding around the image.
 */

.mk-gallery-main-image {
  position: absolute;
  inset: 0;

  width: 100%;
  height: 100%;

  object-fit: cover;
  object-position: center;

  padding: 0;
}

/* FALLBACK */

.mk-gallery-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;

  width: 100%;
  min-height: 180px;

  color: #9c8c78;
  font-size: 10px;
  letter-spacing: .16em;
  text-align: center;
}

/* STAGE NAVIGATION */

.mk-gallery-stage-controls {
  position: absolute;
  z-index: 2;

  top: 50%;
  left: 14px;
  right: 14px;

  display: flex;
  justify-content: space-between;

  transform: translateY(-50%);
  pointer-events: none;
}

.mk-gallery-stage-controls button,
.mk-gallery-light-prev,
.mk-gallery-light-next,
.mk-gallery-close {
  display: grid;
  place-items: center;

  width: 39px;
  height: 39px;

  border: 1px solid rgba(29,41,64,.15);
  background: rgba(245,240,232,.92);
  color: var(--mk-navy);

  pointer-events: auto;
  transition: background .2s;
}

.mk-gallery-stage-controls button:hover,
.mk-gallery-expand:hover {
  background: #fff;
}

/* ZOOM BUTTON */

.mk-gallery-expand {
  position: absolute;
  z-index: 2;

  bottom: 20px;
  left: 20px;

  display: flex;
  align-items: center;
  gap: 8px;

  padding: 11px 13px;

  border: 1px solid #d9cbb9;
  background: rgba(245,240,232,.9);
  color: var(--mk-navy);

  font-size: 9px;
  font-weight: 700;
  letter-spacing: .13em;

  backdrop-filter: blur(10px);
  transition: background .2s;
}

/* IMAGE COUNTER */

.mk-gallery-counter {
  position: absolute;

  right: 21px;
  bottom: 24px;

  color: #665d53;
  font-size: 10px;
  letter-spacing: .15em;
}

/* THUMBNAILS */

.mk-gallery-thumbnails {
  display: grid;
  grid-template-columns: repeat(
    5,
    minmax(0, 1fr)
  );

  gap: 10px;
  margin-top: 13px;
}

.mk-gallery-thumb {
  display: grid;
  place-items: center;

  aspect-ratio: 4 / 5;
  min-width: 0;
  padding: 4px;

  border: 1px solid #e0d5c7;
  background: #f0e9df;
  color: #8c7b67;

  overflow: hidden;

  transition:
    border-color .2s,
    opacity .2s;
}

.mk-gallery-thumb.is-active {
  border: 2px solid var(--mk-gold);
}

.mk-gallery-thumb:hover {
  border-color: #9d8560;
}

.mk-gallery-thumb img {
  display: block;
  width: 100%;
  height: 100%;

  object-fit: cover;
  object-position: center;
}

/* FULLSCREEN LIGHTBOX */

.mk-gallery-lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 65px 70px;

  background: rgba(12,18,28,.94);
  backdrop-filter: blur(12px);
}

.mk-gallery-light-image {
  display: block;

  max-width: 100%;
  max-height: calc(100vh - 140px);

  width: auto;
  height: auto;

  object-fit: contain;
  box-shadow: 0 20px 70px rgba(0,0,0,.25);
}

.mk-gallery-close {
  position: absolute;
  top: 22px;
  right: 24px;
  z-index: 2;
}

.mk-gallery-light-prev,
.mk-gallery-light-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
}

.mk-gallery-light-prev {
  left: 22px;
}

.mk-gallery-light-next {
  right: 22px;
}

.mk-gallery-light-caption {
  position: absolute;
  bottom: 24px;
  left: 50%;

  transform: translateX(-50%);

  max-width: 85%;

  color: #e4d6c1;
  font-size: 11px;
  letter-spacing: .1em;
  text-align: center;
}

/* ACCESSIBILITY */

.mk-gallery button:focus-visible {
  outline: 2px solid var(--mk-gold);
  outline-offset: 3px;
}

/* MOBILE */

@media (max-width: 600px) {
  .mk-gallery-stage-controls {
    left: 8px;
    right: 8px;
  }

  .mk-gallery-stage-controls button {
    width: 34px;
    height: 34px;
  }

  .mk-gallery-thumbnails {
    gap: 6px;
  }

  .mk-gallery-expand {
    bottom: 12px;
    left: 12px;
    padding: 9px;
  }

  .mk-gallery-expand span {
    display: none;
  }

  .mk-gallery-counter {
    right: 13px;
    bottom: 17px;
  }

  .mk-gallery-lightbox {
    padding: 75px 42px;
  }

  .mk-gallery-light-prev {
    left: 5px;
  }

  .mk-gallery-light-next {
    right: 5px;
  }

  .mk-gallery-close {
    right: 12px;
    top: 12px;
  }
}

/* REDUCED MOTION */

@media (prefers-reduced-motion: reduce) {
  .mk-gallery * {
    transition: none !important;
  }
}
`;
