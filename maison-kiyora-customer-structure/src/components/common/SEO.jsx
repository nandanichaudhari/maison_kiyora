import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Maison Kiyora — page-level SEO for the Vite/React storefront.
 *
 * This component updates browser metadata on navigation. It does not
 * server-render tags for crawlers that do not execute JavaScript. For robust
 * indexing and social previews, use prerendering/SSR or server-generated HTML.
 *
 * Set VITE_SITE_URL to the production origin, e.g. https://example.com.
 * Set VITE_OG_IMAGE to an absolute URL for a public 1200x630 image.
 */

const BRAND = "Maison Kiyora";
const DEFAULT_DESCRIPTION =
  "Discover Maison Kiyora's thoughtfully crafted fragrances. Explore our perfume collection and find a scent that feels uniquely yours.";
const DEFAULT_ROBOTS = "index, follow";

function absoluteUrl(value, origin) {
  if (!value || typeof value !== "string") return "";
  try {
    const url = new URL(value, origin);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
}

function ensureMeta(attribute, name) {
  let element = Array.from(document.head.querySelectorAll(`meta[${attribute}]`)).find(
    (candidate) => candidate.getAttribute(attribute) === name
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  return element;
}

function setMeta(attribute, name, value) {
  if (!value) return;
  ensureMeta(attribute, name).setAttribute("content", String(value));
}

function setCanonical(url) {
  if (!url) return;
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", url);
}

function sanitizeJsonLd(value) {
  // JSON is placed in a script tag: escape HTML-significant characters.
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/**
 * SEO
 *
 * @param {object} props
 * @param {string} [props.title] Page title, with brand suffix by default.
 * @param {string} [props.description]
 * @param {string} [props.image] Absolute or root-relative Open Graph image URL.
 * @param {string} [props.url] Canonical URL or pathname (defaults to current route).
 * @param {string} [props.canonical] Alias for url.
 * @param {string} [props.type] Open Graph type, e.g. website or product.
 * @param {string} [props.robots] Explicit robots directive.
 * @param {boolean} [props.noIndex=false]
 * @param {string} [props.siteName]
 * @param {string} [props.locale]
 * @param {string} [props.twitterCard]
 * @param {object|object[]} [props.structuredData] Valid Schema.org JSON-LD object(s).
 * @param {boolean} [props.appendBrand=true]
 * @param {string} [props.siteUrl] Production origin override.
 */
export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  url,
  canonical,
  type = "website",
  robots,
  noIndex = false,
  siteName = BRAND,
  locale = "en_IN",
  twitterCard = "summary_large_image",
  structuredData,
  appendBrand = true,
  siteUrl,
}) {
  const { pathname } = useLocation();

  // Serialize here so an inline object supplied by the parent does not
  // retrigger DOM writes on every render.
  let jsonLd = "";
  if (structuredData) {
    try {
      jsonLd = sanitizeJsonLd(structuredData);
    } catch {
      // Invalid/circular data must not crash the page.
    }
  }

  useEffect(() => {
    const configuredOrigin =
      siteUrl || import.meta.env.VITE_SITE_URL || window.location.origin;
    const origin = absoluteUrl(configuredOrigin, window.location.origin) || window.location.origin;
    const pageUrl = absoluteUrl(canonical || url || pathname || "/", origin);
    const imageUrl = absoluteUrl(
      image || import.meta.env.VITE_OG_IMAGE || "",
      origin
    );

    const cleanTitle = typeof title === "string" ? title.trim() : "";
    const fullTitle = cleanTitle
      ? appendBrand && !cleanTitle.toLowerCase().includes(siteName.toLowerCase())
        ? `${cleanTitle} | ${siteName}`
        : cleanTitle
      : `${siteName} | The Art of Slow Perfumery`;
    const cleanDescription =
      typeof description === "string" && description.trim()
        ? description.trim()
        : DEFAULT_DESCRIPTION;
    const robotsValue = noIndex ? "noindex, nofollow" : robots || DEFAULT_ROBOTS;

    document.title = fullTitle;
    setMeta("name", "description", cleanDescription);
    setMeta("name", "robots", robotsValue);
    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", siteName);
    setMeta("property", "og:locale", locale);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", cleanDescription);
    setMeta("name", "twitter:card", imageUrl ? twitterCard : "summary");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", cleanDescription);

    if (pageUrl) {
      setCanonical(pageUrl);
      setMeta("property", "og:url", pageUrl);
    }

    // Remove old image tags when moving to a page without an image.
    for (const [attribute, name] of [
      ["property", "og:image"],
      ["name", "twitter:image"],
    ]) {
      const element = Array.from(document.head.querySelectorAll(`meta[${attribute}]`)).find(
        (candidate) => candidate.getAttribute(attribute) === name
      );
      if (imageUrl) {
        setMeta(attribute, name, imageUrl);
      } else {
        element?.remove();
      }
    }

    const jsonLdId = "mk-page-jsonld";
    const previous = document.getElementById(jsonLdId);
    if (jsonLd) {
      const script = previous || document.createElement("script");
      script.id = jsonLdId;
      script.type = "application/ld+json";
      script.textContent = jsonLd;
      if (!previous) document.head.appendChild(script);
    } else {
      previous?.remove();
    }
  }, [
    title,
    description,
    image,
    url,
    canonical,
    pathname,
    type,
    robots,
    noIndex,
    siteName,
    locale,
    twitterCard,
    appendBrand,
    siteUrl,
    jsonLd,
  ]);

  return null;
}

/**
 * Optional helper for verified product data. Only provide real inventory,
 * price, and image values; never fabricate reviews or availability.
 */
export function createProductStructuredData({
  name,
  description,
  image,
  sku,
  brand = BRAND,
  url,
  price,
  currency = "INR",
  availability,
}) {
  if (!name) return null;
  const result = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    brand: { "@type": "Brand", name: brand },
  };
  if (description) result.description = description;
  if (image) result.image = image;
  if (sku) result.sku = sku;
  if (url) result.url = url;
  if (price !== undefined && price !== null && Number.isFinite(Number(price)) && Number(price) >= 0) {
    result.offers = {
      "@type": "Offer",
      price: Number(price),
      priceCurrency: currency,
      ...(url ? { url } : {}),
      ...(availability ? { availability } : {}),
    };
  }
  return result;
}
