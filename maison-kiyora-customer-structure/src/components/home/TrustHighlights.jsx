
import { Link } from "react-router-dom";
import { ArrowUpRight, Flower2, Gem, MessageCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

// ======================================================
// MAISON KIYORA — THE MAISON EXPERIENCE
// Luxury editorial image cards
// Ivory × Espresso × Champagne Gold
// ======================================================

const EASE = [0.22, 1, 0.36, 1];

const DEFAULT_HIGHLIGHTS = [
  {
    number: "01",
    title: "Find Your Fragrance",
    description:
      "Explore our collection and discover a scent that feels uniquely yours.",
    image: "/images/products/oody-raspberry.png",
    imageAlt: "Maison Kiyora Oody Raspberry perfume",
    icon: Flower2,
    linkText: "EXPLORE COLLECTION",
    linkTo: "/collections",
  },
  {
    number: "02",
    title: "Distinctive Compositions",
    description:
      "Discover fragrances with their own names, notes and character.",
    image: "/images/products/fruits-of-love.png",
    imageAlt: "Maison Kiyora Fruits of Love perfume",
    icon: Gem,
    linkText: "DISCOVER FRAGRANCES",
    linkTo: "/collections",
  },
  {
    number: "03",
    title: "Here to Help",
    description:
      "Have a question about our collection? Get in touch with Maison Kiyora.",
    image: "/images/products/mandarin-melons.png",
    imageAlt: "Maison Kiyora Mandarin Melons perfume",
    icon: MessageCircle,
    linkText: "CONTACT THE MAISON",
    linkTo: "/contact",
  },
];

const STYLES = `
  .mk-trust {
    position: relative;
    overflow: hidden;
    padding: clamp(70px, 8vw, 120px) 0;
    background: #f5f0e8;
    color: #211c19;
  }

  .mk-trust *,
  .mk-trust *::before,
  .mk-trust *::after {
    box-sizing: border-box;
  }

  .mk-trust__container {
    width: min(1360px, calc(100% - 64px));
    margin-inline: auto;
  }

  /* SECTION HEADING */

  .mk-trust__top {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-bottom: 20px;
  }

  .mk-trust__line {
    display: block;
    width: 36px;
    height: 1px;
    background: #b69a69;
  }

  .mk-trust__eyebrow {
    margin: 0;
    color: #94764c;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .24em;
    text-align: center;
    text-transform: uppercase;
  }

  .mk-trust__heading {
    max-width: 850px;
    margin: 0 auto 54px;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(48px, 5.8vw, 82px);
    font-weight: 400;
    letter-spacing: -.04em;
    line-height: 1;
    text-align: center;
  }

  .mk-trust__heading em {
    color: #b69a69;
    font-weight: 400;
  }

  /* EDITORIAL CARDS */

  .mk-trust__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: clamp(16px, 2vw, 28px);
  }

  .mk-trust__item {
    min-width: 0;
  }

  .mk-trust__image-wrap {
    position: relative;
    display: block;
    overflow: hidden;
    aspect-ratio: 4 / 4.7;
    background:
      radial-gradient(
        circle at 50% 38%,
        #f4ece1 0%,
        #e7dbcb 60%,
        #d9c8b4 100%
      );
    text-decoration: none;
  }

  .mk-trust__image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    padding: 11%;
    transition: transform .8s cubic-bezier(.22,1,.36,1);
  }

  .mk-trust__item:hover .mk-trust__image {
    transform: scale(1.065);
  }

  .mk-trust__image-fallback {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94764c;
  }

  .mk-trust__image-fallback svg {
    width: 58px;
    height: 58px;
    stroke-width: .8;
  }

  .mk-trust__image-number {
    position: absolute;
    top: 22px;
    left: 24px;
    z-index: 2;
    color: #8b704d;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .2em;
  }

  .mk-trust__image-arrow {
    position: absolute;
    right: 19px;
    bottom: 19px;
    z-index: 2;
    display: grid;
    place-items: center;
    width: 43px;
    height: 43px;
    border: 1px solid rgba(182,154,105,.55);
    border-radius: 50%;
    background: rgba(245,240,232,.78);
    color: #211c19;
    transition:
      background .3s ease,
      transform .3s ease;
  }

  .mk-trust__item:hover .mk-trust__image-arrow {
    background: #f5f0e8;
    transform: translate(3px,-3px);
  }

  /* CARD CONTENT */

  .mk-trust__content {
    padding: 25px 3px 8px;
  }

  .mk-trust__item-eyebrow {
    margin: 0 0 13px;
    color: #94764c;
    font-family: "Manrope", sans-serif;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .2em;
  }

  .mk-trust__item-title {
    margin: 0 0 12px;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(30px, 2.6vw, 42px);
    font-weight: 400;
    line-height: 1.05;
    letter-spacing: -.025em;
  }

  .mk-trust__description {
    max-width: 340px;
    margin: 0 0 22px;
    color: #6c6661;
    font-family: "Manrope", sans-serif;
    font-size: 12px;
    line-height: 1.85;
  }

  .mk-trust__card-link {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #b69a69;
    color: #211c19;
    font-family: "Manrope", sans-serif;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .13em;
    text-decoration: none;
    transition: gap .25s ease;
  }

  .mk-trust__card-link:hover {
    gap: 18px;
  }

  .mk-trust__card-link:focus-visible,
  .mk-trust__image-wrap:focus-visible,
  .mk-trust__link:focus-visible {
    outline: 2px solid #b69a69;
    outline-offset: 5px;
  }

  /* OPTIONAL BOTTOM CTA */

  .mk-trust__bottom {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px 22px;
    margin-top: 55px;
    padding-top: 28px;
    border-top: 1px solid rgba(182,154,105,.35);
    text-align: center;
  }

  .mk-trust__bottom-text {
    margin: 0;
    color: #6c6661;
    font-family: "Manrope", sans-serif;
    font-size: 12px;
  }

  .mk-trust__link {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 36px;
    color: #211c19;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .13em;
    text-decoration: none;
    transition: gap .25s ease;
  }

  .mk-trust__link:hover {
    gap: 17px;
  }

  /* RESPONSIVE */

  @media (max-width: 900px) {
    .mk-trust__container {
      width: calc(100% - 44px);
    }

    .mk-trust__grid {
      gap: 14px;
    }

    .mk-trust__item-title {
      font-size: 31px;
    }

    .mk-trust__content {
      padding-top: 20px;
    }
  }

  @media (max-width: 650px) {
    .mk-trust {
      padding: 70px 0;
    }

    .mk-trust__container {
      width: calc(100% - 36px);
    }

    .mk-trust__heading {
      margin-bottom: 38px;
      font-size: clamp(46px, 11vw, 64px);
    }

    .mk-trust__grid {
      grid-template-columns: 1fr;
      gap: 38px;
    }

    .mk-trust__image-wrap {
      aspect-ratio: 4 / 3.8;
    }

    .mk-trust__image {
      padding: 9%;
    }

    .mk-trust__item-title {
      font-size: 38px;
    }

    .mk-trust__bottom {
      margin-top: 45px;
      padding-top: 25px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .mk-trust__image,
    .mk-trust__image-arrow,
    .mk-trust__card-link,
    .mk-trust__link {
      transition: none;
    }

    .mk-trust__item:hover .mk-trust__image,
    .mk-trust__item:hover .mk-trust__image-arrow {
      transform: none;
    }
  }
`;

function HighlightItem({ highlight, index, reducedMotion }) {
  const Icon = highlight.icon || Flower2;

  const number =
    highlight.number ??
    String(index + 1).padStart(2, "0");

  const linkTo = highlight.linkTo || "/collections";

  const image = highlight.image;

  return (
    <motion.article
      className="mk-trust__item"
      initial={
        reducedMotion
          ? false
          : { opacity: 0, y: 20 }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: reducedMotion ? 0 : 0.7,
        delay: reducedMotion ? 0 : index * 0.12,
        ease: EASE,
      }}
    >
      <Link
        to={linkTo}
        className="mk-trust__image-wrap"
        aria-label={highlight.title}
      >
        <span className="mk-trust__image-number">
          {number}
        </span>

        {image ? (
          <img
            className="mk-trust__image"
            src={image}
            alt={highlight.imageAlt || highlight.title}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="mk-trust__image-fallback">
            <Icon aria-hidden="true" />
          </span>
        )}

        <span
          className="mk-trust__image-arrow"
          aria-hidden="true"
        >
          <ArrowUpRight size={18} strokeWidth={1.4} />
        </span>
      </Link>

      <div className="mk-trust__content">
        <p className="mk-trust__item-eyebrow">
          MAISON KIYORA — {number}
        </p>

        <h3 className="mk-trust__item-title">
          {highlight.title}
        </h3>

        <p className="mk-trust__description">
          {highlight.description}
        </p>

        <Link
          to={linkTo}
          className="mk-trust__card-link"
        >
          {highlight.linkText || "EXPLORE"}
          <ArrowUpRight
            size={15}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </Link>
      </div>
    </motion.article>
  );
}

export default function TrustHighlights({
  highlights = DEFAULT_HIGHLIGHTS,
  eyebrow = "THE MAISON EXPERIENCE",
  title = "A more personal",
  highlightedTitle = "fragrance journey.",
  contactText = "Questions about our fragrances?",
  linkText = "CONTACT THE MAISON",
  linkTo = "/contact",
  showContactLink = true,
  className = "",
}) {
  const reducedMotion = useReducedMotion();

  const items = Array.isArray(highlights)
    ? highlights.filter(
        (item) => item?.title && item?.description
      )
    : DEFAULT_HIGHLIGHTS;

  if (!items.length) return null;

  return (
    <section
      className={["mk-trust", className]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby="mk-trust-title"
    >
      <style>{STYLES}</style>

      <div className="mk-trust__container">
        <motion.div
          initial={
            reducedMotion
              ? false
              : { opacity: 0, y: 18 }
          }
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{
            duration: reducedMotion ? 0 : 0.75,
            ease: EASE,
          }}
        >
          <div className="mk-trust__top">
            <span
              className="mk-trust__line"
              aria-hidden="true"
            />

            <p className="mk-trust__eyebrow">
              {eyebrow}
            </p>

            <span
              className="mk-trust__line"
              aria-hidden="true"
            />
          </div>

          <h2
            id="mk-trust-title"
            className="mk-trust__heading"
          >
            {title}
            <br />
            <em>{highlightedTitle}</em>
          </h2>
        </motion.div>

        <div className="mk-trust__grid">
          {items.map((highlight, index) => (
            <HighlightItem
              key={
                highlight.number ??
                `${highlight.title}-${index}`
              }
              highlight={highlight}
              index={index}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>

        {showContactLink && (
          <div className="mk-trust__bottom">
            <p className="mk-trust__bottom-text">
              {contactText}
            </p>

            <Link
              to={linkTo}
              className="mk-trust__link"
            >
              {linkText}

              <ArrowUpRight
                size={17}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export { DEFAULT_HIGHLIGHTS };
