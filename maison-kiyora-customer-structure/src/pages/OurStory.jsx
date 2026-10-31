
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Volume2,
  VolumeX,
} from "lucide-react";

// ======================================================
// MAISON KIYORA
// OUR STORY — THE ART OF SLOW PERFUMERY
// ======================================================

const ASSETS = {
  storyVideo: "/videos/our-story-maison-kiyora.mp4",
  perfumeOne: "/images/products/photo-1.webp",
  perfumeTwo: "/images/products/photo-5.webp",
  perfumeThree: "/images/products/photo-9.webp",
};

const ease = [0.22, 1, 0.36, 1];

function Reveal({ children, className = "", delay = 0 }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reducedMotion
          ? false
          : { opacity: 0, y: 35 }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.8,
        delay,
        ease,
      }}
    >
      {children}
    </motion.div>
  );
}

function ImageFrame({
  src,
  alt,
  className = "",
  loading = "lazy",
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`mk-story-image ${className}`}>
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          loading={loading}
          onError={() => setHasError(true)}
        />
      ) : (
        <div
          className="mk-story-image-fallback"
          role="img"
          aria-label={alt}
        >
          <span>MAISON KIYORA</span>
          <small>THE ART OF SLOW PERFUMERY</small>
        </div>
      )}
    </div>
  );
}

export default function OurStory() {
  const videoRef = useRef(null);
  const storyRef = useRef(null);

  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    document.title = "Our Story | Maison Kiyora";
  }, []);

  const scrollToStory = () => {
    storyRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const toggleSound = () => {
    const video = videoRef.current;

    if (!video) return;

    const nextMuted = !video.muted;

    video.muted = nextMuted;
    setIsMuted(nextMuted);

    if (video.paused) {
      video.play().catch(() => {});
    }
  };

  return (
    <main className="mk-story-page">
      <style>{styles}</style>

      {/* ================================================
          01. CINEMATIC HERO
      ================================================= */}

      <section
        className="mk-story-hero"
        aria-labelledby="mk-story-hero-title"
      >
        {!videoError ? (
          <video
            ref={videoRef}
            className="mk-story-hero-video"
            src={ASSETS.storyVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            onError={() => setVideoError(true)}
          />
        ) : (
          <div className="mk-story-hero-fallback" />
        )}

        <div className="mk-story-hero-overlay" />

        <div className="mk-story-hero-content">
          <motion.span
            className="mk-story-hero-eyebrow"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            THE MAISON / OUR STORY
          </motion.span>

          <motion.h1
            id="mk-story-hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              delay: 0.3,
              ease,
            }}
          >
            The art of
            <br />
            <em>slow perfumery.</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            A world of fragrance, feeling and quiet beauty.
          </motion.p>
        </div>

        <div className="mk-story-hero-bottom">
          <button
            type="button"
            className="mk-story-scroll"
            onClick={scrollToStory}
          >
            <span>DISCOVER OUR WORLD</span>
            <ArrowDown size={16} strokeWidth={1.4} />
          </button>

          {!videoError && (
            <button
              type="button"
              className="mk-story-sound"
              onClick={toggleSound}
              aria-label={
                isMuted ? "Unmute video" : "Mute video"
              }
              aria-pressed={!isMuted}
            >
              {isMuted ? (
                <VolumeX size={19} strokeWidth={1.4} />
              ) : (
                <Volume2 size={19} strokeWidth={1.4} />
              )}
            </button>
          )}
        </div>
      </section>

      {/* ================================================
          02. INTRODUCTION
      ================================================= */}

      <section
        ref={storyRef}
        className="mk-story-intro"
        aria-labelledby="mk-story-intro-title"
      >
        <Reveal className="mk-story-intro-inner">
          <span className="mk-story-kicker">
            A DIFFERENT PACE
          </span>

          <span className="mk-story-ornament">✳</span>

          <h2 id="mk-story-intro-title">
            Some things are
            <br />
            meant to be <em>felt.</em>
          </h2>

          <p>
            A fragrance can hold a feeling long after
            a moment has passed. At Maison Kiyora,
            we are drawn to the quiet connection
            between scent and memory.
          </p>

          <span className="mk-story-intro-rule" />
        </Reveal>
      </section>

      {/* ================================================
          03. EDITORIAL STORY
      ================================================= */}

      <section
        className="mk-story-editorial"
        aria-labelledby="mk-story-editorial-title"
      >
        <div className="mk-story-editorial-grid">
          <Reveal className="mk-story-editorial-visual">
            <ImageFrame
              src={ASSETS.perfumeOne}
              alt="Maison Kiyora perfume presentation"
              className="mk-story-editorial-main-image"
            />

            <span className="mk-story-visual-caption">
              MAISON KIYORA — FRAGRANCE & FEELING
            </span>
          </Reveal>

          <Reveal
            className="mk-story-editorial-copy"
            delay={0.12}
          >
            <span className="mk-story-kicker">
              01 / OUR PHILOSOPHY
            </span>

            <h2 id="mk-story-editorial-title">
              Beauty in
              <br />
              the <em>unhurried.</em>
            </h2>

            <div className="mk-story-copy-rule" />

            <p>
              In a world that rarely slows down,
              fragrance invites us to notice the
              little things.
            </p>

            <p>
              A familiar note. A fleeting memory.
              A feeling that is entirely your own.
              These are the moments that shape
              our world.
            </p>

            <Link
              to="/collections"
              className="mk-story-text-link"
            >
              EXPLORE OUR FRAGRANCES
              <ArrowUpRight
                size={18}
                strokeWidth={1.5}
              />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ================================================
          04. SIGNATURE QUOTE
      ================================================= */}

      <section
        className="mk-story-quote"
        aria-label="Maison Kiyora philosophy"
      >
        <Reveal className="mk-story-quote-inner">
          <span className="mk-story-kicker">
            THE MAISON KIYORA WAY
          </span>

          <blockquote>
            “Not every beautiful thing
            <br />
            needs to be <em>loud.</em>”
          </blockquote>

          <div className="mk-story-quote-line" />

          <span className="mk-story-quote-credit">
            THE ART OF SLOW PERFUMERY
          </span>
        </Reveal>
      </section>

      {/* ================================================
          05. TWO-COLUMN VISUAL STORY
      ================================================= */}

      <section
        className="mk-story-moments"
        aria-labelledby="mk-story-moments-title"
      >
        <div className="mk-story-moments-heading">
          <Reveal>
            <span className="mk-story-kicker">
              02 / THE EXPERIENCE
            </span>

            <h2 id="mk-story-moments-title">
              A moment,
              <br />
              <em>made yours.</em>
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p>
              Fragrance is personal. The same scent
              can become a different story for
              everyone who wears it.
            </p>
          </Reveal>
        </div>

        <div className="mk-story-moments-grid">
          <Reveal className="mk-story-moment-card">
            <ImageFrame
              src={ASSETS.perfumeTwo}
              alt="Maison Kiyora fragrance collection"
            />

            <div className="mk-story-moment-caption">
              <span>01</span>
              <h3>The first impression</h3>
              <p>
                A scent that catches your attention.
              </p>
            </div>
          </Reveal>

          <Reveal
            className="mk-story-moment-card mk-story-moment-card-offset"
            delay={0.15}
          >
            <ImageFrame
              src={ASSETS.perfumeThree}
              alt="Maison Kiyora perfume bottle"
            />

            <div className="mk-story-moment-caption">
              <span>02</span>
              <h3>The lasting feeling</h3>
              <p>
                A memory that becomes your own.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================================================
          06. FULL-WIDTH STATEMENT
      ================================================= */}

      <section className="mk-story-statement">
        <Reveal className="mk-story-statement-inner">
          <span className="mk-story-kicker">
            MORE THAN A FRAGRANCE
          </span>

          <h2>
            Made for moments
            <br />
            worth <em>remembering.</em>
          </h2>

          <p>
            Discover a fragrance that feels like you.
          </p>
        </Reveal>
      </section>

      {/* ================================================
          07. FINAL CTA
      ================================================= */}

      <section className="mk-story-cta">
        <Reveal className="mk-story-cta-inner">
          <span className="mk-story-kicker">
            YOUR STORY CONTINUES
          </span>

          <h2>
            Find your
            <br />
            <em>signature scent.</em>
          </h2>

          <p>
            Explore the Maison Kiyora fragrance collection.
          </p>

          <Link
            to="/collections"
            className="mk-story-cta-button"
          >
            <span>DISCOVER THE COLLECTION</span>
            <ArrowRight
              size={19}
              strokeWidth={1.5}
            />
          </Link>

          <span className="mk-story-cta-signature">
            MAISON KIYORA
          </span>
        </Reveal>
      </section>
    </main>
  );
}

const styles = `
  .mk-story-page {
    --mk-ivory: #F5F0E8;
    --mk-espresso: #211C19;
    --mk-gold: #B69A69;
    --mk-sand: #D8C9B5;

    overflow: hidden;
    background: var(--mk-ivory);
    color: var(--mk-espresso);
    font-family: "Manrope", sans-serif;
  }

  .mk-story-page *,
  .mk-story-page *::before,
  .mk-story-page *::after {
    box-sizing: border-box;
  }

  .mk-story-page a {
    text-decoration: none;
  }

  .mk-story-kicker {
    display: block;
    color: #a08760;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .25em;
    line-height: 1.7;
  }

  /* HERO */

  .mk-story-hero {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 720px;
    min-height: 100svh;
    overflow: hidden;
    background:
      radial-gradient(
        ellipse at center,
        #665a4f,
        #211c19 80%
      );
    color: #fff;
  }

  .mk-story-hero-video,
  .mk-story-hero-fallback,
  .mk-story-hero-overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .mk-story-hero-video {
    object-fit: cover;
  }

  .mk-story-hero-fallback {
    background:
      radial-gradient(
        ellipse at 60% 50%,
        rgba(182,154,105,.35),
        transparent 45%
      ),
      linear-gradient(
        140deg,
        #554b41,
        #211c19 75%
      );
  }

  .mk-story-hero-overlay {
    background:
      linear-gradient(
        180deg,
        rgba(20,16,13,.35),
        rgba(20,16,13,.42) 50%,
        rgba(20,16,13,.65)
      );
    pointer-events: none;
  }

  .mk-story-hero-content {
    position: relative;
    z-index: 1;
    width: min(100%, 1100px);
    margin: auto;
    padding: 150px 30px 100px;
    text-align: center;
  }

  .mk-story-hero-eyebrow {
    display: block;
    margin-bottom: 28px;
    color: #e0cba8;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .27em;
  }

  .mk-story-hero h1 {
    margin: 0;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(75px, 10.5vw, 155px);
    font-weight: 300;
    line-height: .88;
    letter-spacing: -.05em;
  }

  .mk-story-hero h1 em {
    color: #e5d0ad;
    font-weight: 300;
  }

  .mk-story-hero-content > p {
    margin: 30px 0 0;
    color: rgba(255,255,255,.83);
    font-size: 12px;
    letter-spacing: .025em;
    line-height: 2;
  }

  .mk-story-hero-bottom {
    position: absolute;
    z-index: 2;
    right: 6%;
    bottom: 40px;
    left: 6%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .mk-story-scroll,
  .mk-story-sound {
    display: inline-flex;
    align-items: center;
    gap: 15px;
    border: 0;
    background: transparent;
    color: white;
    cursor: pointer;
  }

  .mk-story-scroll {
    padding: 10px 0;
    font: inherit;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: .18em;
  }

  .mk-story-sound {
    justify-content: center;
    width: 42px;
    height: 42px;
    border: 1px solid rgba(255,255,255,.4);
    border-radius: 50%;
  }

  .mk-story-sound:hover {
    background: rgba(255,255,255,.1);
  }

  /* INTRO */

  .mk-story-intro {
    padding: 155px 24px 165px;
    text-align: center;
  }

  .mk-story-intro-inner {
    max-width: 880px;
    margin: auto;
  }

  .mk-story-ornament {
    display: block;
    margin: 32px 0;
    color: var(--mk-gold);
    font-family: Georgia, serif;
    font-size: 28px;
  }

  .mk-story-intro h2,
  .mk-story-editorial h2,
  .mk-story-moments h2,
  .mk-story-statement h2,
  .mk-story-cta h2 {
    margin: 0;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(65px, 8vw, 112px);
    font-weight: 400;
    line-height: .93;
    letter-spacing: -.05em;
  }

  .mk-story-intro h2 em,
  .mk-story-editorial h2 em,
  .mk-story-moments h2 em,
  .mk-story-statement h2 em,
  .mk-story-cta h2 em {
    color: var(--mk-gold);
    font-weight: 300;
  }

  .mk-story-intro p {
    max-width: 520px;
    margin: 32px auto 0;
    color: #817a72;
    font-size: 13px;
    line-height: 2.15;
  }

  .mk-story-intro-rule {
    display: block;
    width: 65px;
    height: 1px;
    margin: 45px auto 0;
    background: var(--mk-gold);
  }

  /* EDITORIAL */

  .mk-story-editorial {
    padding: 80px 6% 130px;
    background: #eee7dc;
  }

  .mk-story-editorial-grid {
    display: grid;
    grid-template-columns: 1.1fr .9fr;
    align-items: center;
    gap: clamp(50px, 8vw, 140px);
    max-width: 1450px;
    margin: auto;
  }

  .mk-story-editorial-visual {
    min-width: 0;
  }

  .mk-story-image {
    overflow: hidden;
    background: #e0d3c3;
  }

  .mk-story-image img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform .8s ease;
  }

  .mk-story-image:hover img {
    transform: scale(1.035);
  }

  .mk-story-editorial-main-image {
    aspect-ratio: 4 / 5;
  }

  .mk-story-image-fallback {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    height: 100%;
    min-height: 300px;
    background:
      radial-gradient(
        circle,
        rgba(182,154,105,.2),
        transparent 60%
      ),
      #dfd2c1;
    text-align: center;
  }

  .mk-story-image-fallback span {
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 26px;
    letter-spacing: .13em;
  }

  .mk-story-image-fallback small {
    color: #a08760;
    font-size: 9px;
    letter-spacing: .14em;
  }

  .mk-story-visual-caption {
    display: block;
    margin-top: 16px;
    color: #95846c;
    font-size: 9px;
    letter-spacing: .15em;
  }

  .mk-story-editorial-copy {
    max-width: 490px;
  }

  .mk-story-editorial h2 {
    margin: 25px 0;
    font-size: clamp(65px, 6.5vw, 100px);
  }

  .mk-story-copy-rule {
    width: 60px;
    height: 1px;
    margin: 30px 0;
    background: var(--mk-gold);
  }

  .mk-story-editorial-copy p {
    max-width: 420px;
    margin: 0 0 18px;
    color: #7c756d;
    font-size: 12px;
    line-height: 2.1;
  }

  .mk-story-text-link {
    display: inline-flex;
    align-items: center;
    gap: 22px;
    margin-top: 30px;
    padding-bottom: 11px;
    border-bottom: 1px solid var(--mk-gold);
    color: var(--mk-espresso);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .14em;
    transition: gap .25s;
  }

  .mk-story-text-link:hover {
    gap: 30px;
  }

  /* QUOTE */

  .mk-story-quote {
    padding: 145px 24px;
    background: var(--mk-espresso);
    color: #f5f0e8;
    text-align: center;
  }

  .mk-story-quote-inner {
    max-width: 1100px;
    margin: auto;
  }

  .mk-story-quote blockquote {
    margin: 32px 0;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(52px, 7vw, 105px);
    font-weight: 300;
    line-height: 1.08;
    letter-spacing: -.045em;
  }

  .mk-story-quote blockquote em {
    color: #d7bd93;
    font-weight: 300;
  }

  .mk-story-quote-line {
    width: 65px;
    height: 1px;
    margin: 35px auto 25px;
    background: var(--mk-gold);
  }

  .mk-story-quote-credit {
    color: #a9977d;
    font-size: 9px;
    letter-spacing: .2em;
  }

  /* MOMENTS */

  .mk-story-moments {
    padding: 145px 6% 160px;
  }

  .mk-story-moments-heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 60px;
    max-width: 1380px;
    margin: 0 auto 65px;
  }

  .mk-story-moments-heading h2 {
    margin-top: 25px;
  }

  .mk-story-moments-heading p {
    max-width: 300px;
    margin: 0 0 10px;
    color: #817a72;
    font-size: 12px;
    line-height: 2;
  }

  .mk-story-moments-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 55px;
    max-width: 1380px;
    margin: auto;
  }

  .mk-story-moment-card {
    min-width: 0;
  }

  .mk-story-moment-card .mk-story-image {
    aspect-ratio: 4 / 4.7;
  }

  .mk-story-moment-card-offset {
    margin-top: 100px;
  }

  .mk-story-moment-caption {
    display: grid;
    grid-template-columns: 38px 1fr;
    column-gap: 15px;
    padding-top: 22px;
    border-top: 1px solid #dcd1c3;
    margin-top: 22px;
  }

  .mk-story-moment-caption > span {
    grid-row: span 2;
    padding-top: 7px;
    color: var(--mk-gold);
    font-size: 10px;
  }

  .mk-story-moment-caption h3 {
    margin: 0;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 34px;
    font-weight: 500;
  }

  .mk-story-moment-caption p {
    margin: 8px 0 0;
    color: #817a72;
    font-size: 11px;
    line-height: 1.8;
  }

  /* STATEMENT */

  .mk-story-statement {
    padding: 155px 24px;
    background:
      radial-gradient(
        ellipse at center,
        rgba(182,154,105,.17),
        transparent 60%
      ),
      #e9dfd1;
    text-align: center;
  }

  .mk-story-statement-inner {
    max-width: 1000px;
    margin: auto;
  }

  .mk-story-statement h2 {
    margin: 30px 0;
  }

  .mk-story-statement p {
    color: #817a72;
    font-size: 12px;
    line-height: 2;
  }

  /* CTA */

  .mk-story-cta {
    padding: 145px 24px 130px;
    background: #f5f0e8;
    text-align: center;
  }

  .mk-story-cta-inner {
    max-width: 900px;
    margin: auto;
  }

  .mk-story-cta h2 {
    margin: 28px 0;
  }

  .mk-story-cta p {
    color: #817a72;
    font-size: 12px;
    line-height: 2;
  }

  .mk-story-cta-button {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 45px;
    min-height: 58px;
    margin-top: 30px;
    padding: 0 24px;
    background: var(--mk-espresso);
    color: #fff;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .12em;
    transition: background .25s, transform .25s;
  }

  .mk-story-cta-button:hover {
    background: #45382e;
    transform: translateY(-2px);
  }

  .mk-story-cta-signature {
    display: block;
    margin-top: 95px;
    color: #ad9878;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 28px;
    letter-spacing: .17em;
  }

  @media (max-width: 950px) {
    .mk-story-editorial-grid {
      gap: 45px;
    }

    .mk-story-editorial h2 {
      font-size: 67px;
    }

    .mk-story-moments-grid {
      gap: 25px;
    }
  }

  @media (max-width: 700px) {
    .mk-story-hero {
      min-height: 680px;
      min-height: 100svh;
    }

    .mk-story-hero-content {
      padding: 130px 20px 110px;
    }

    .mk-story-hero h1 {
      font-size: clamp(67px, 14vw, 95px);
    }

    .mk-story-hero-bottom {
      right: 22px;
      bottom: 25px;
      left: 22px;
    }

    .mk-story-intro {
      padding: 110px 22px;
    }

    .mk-story-intro h2,
    .mk-story-moments h2,
    .mk-story-statement h2,
    .mk-story-cta h2 {
      font-size: clamp(55px, 11vw, 82px);
    }

    .mk-story-editorial {
      padding: 60px 22px 95px;
    }

    .mk-story-editorial-grid {
      grid-template-columns: 1fr;
      gap: 65px;
    }

    .mk-story-editorial h2 {
      font-size: clamp(60px, 11vw, 85px);
    }

    .mk-story-quote {
      padding: 105px 22px;
    }

    .mk-story-moments {
      padding: 105px 22px;
    }

    .mk-story-moments-heading {
      display: block;
      margin-bottom: 45px;
    }

    .mk-story-moments-heading p {
      margin-top: 25px;
    }

    .mk-story-moments-grid {
      grid-template-columns: 1fr;
      gap: 65px;
    }

    .mk-story-moment-card-offset {
      margin-top: 0;
    }

    .mk-story-statement {
      padding: 110px 22px;
    }

    .mk-story-cta {
      padding: 110px 22px 95px;
    }
  }

  @media (max-width: 420px) {
    .mk-story-hero h1 {
      font-size: 65px;
    }

    .mk-story-hero-eyebrow {
      font-size: 9px;
    }

    .mk-story-scroll {
      font-size: 8px;
      gap: 8px;
    }

    .mk-story-intro h2,
    .mk-story-moments h2,
    .mk-story-statement h2,
    .mk-story-cta h2 {
      font-size: 54px;
    }

    .mk-story-quote blockquote {
      font-size: 49px;
    }

    .mk-story-cta-button {
      width: 100%;
      gap: 12px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .mk-story-page *,
    .mk-story-page *::before,
    .mk-story-page *::after {
      animation-duration: .01ms !important;
      transition-duration: .01ms !important;
    }

    .mk-story-image img {
      transition: none;
    }
  }
`;
