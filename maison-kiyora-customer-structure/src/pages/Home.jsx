
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

// ======================================================
// MAISON KIYORA — LUXURY HOMEPAGE
// The Art of Slow Perfumery
//
// React 19 + Vite 6 + Framer Motion
//
// Sections:
// 01. Cinematic Hero
// 02. Brand Introduction
// 03. Featured Fragrances
// 04. Fragrance Discovery
// 05. Editorial Brand Statement
// 06. Brand Story Preview
// 07. Trust Highlights
// 08. Final Collection CTA
// ======================================================

// ======================================================
// HOMEPAGE COMPONENTS
// ======================================================

import HeroVideo from "../components/home/HeroVideo.jsx";

import FeaturedProducts from "../components/home/FeaturedProducts.jsx";

import FragranceNotes from "../components/home/FragranceNotes.jsx";

import BrandStoryPreview from "../components/home/BrandStoryPreview.jsx";

import TrustHighlights from "../components/home/TrustHighlights.jsx";

// ======================================================
// ANIMATION CONFIGURATION
// ======================================================

const EASE = [0.22, 1, 0.36, 1];

// ======================================================
// REUSABLE SCROLL REVEAL
// ======================================================

function Reveal({
  children,
  delay = 0,
  className = "",
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{
        opacity: reducedMotion ? 1 : 0,
        y: reducedMotion ? 0 : 22,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.12,
      }}
      transition={{
        duration: reducedMotion ? 0 : 0.75,
        delay: reducedMotion ? 0 : delay,
        ease: EASE,
      }}
    >
      {children}
    </motion.div>
  );
}

// ======================================================
// REUSABLE SECTION LABEL
// ======================================================

function SectionLabel({
  number,
  children,
}) {
  return (
    <div className="mk-home-section-label">
      <span>{number}</span>

      <span
        className="mk-home-section-label__line"
        aria-hidden="true"
      />

      <span>{children}</span>
    </div>
  );
}

// ======================================================
// BRAND INTRODUCTION
// ======================================================

function BrandIntroduction() {
  return (
    <section
      id="discover"
      className="mk-home-intro"
      aria-labelledby="mk-home-intro-title"
    >
      <div className="mk-container">
        <Reveal>
          <SectionLabel number="01">
            THE MAISON
          </SectionLabel>

          <div className="mk-home-intro__layout">
            {/* Editorial heading */}

            <h2
              id="mk-home-intro-title"
              className="mk-home-intro__title"
            >
              The art of
              <br />
              <em>being present.</em>
            </h2>

            {/* Brand description */}

            <div className="mk-home-intro__right">
              <p>
                Fragrance has a way of staying
                with us — in memories, in
                moments, in the everyday.
              </p>

              <Link
                to="/our-story"
                className="mk-home-text-link"
              >
                <span>
                  DISCOVER OUR STORY
                </span>

                <ArrowUpRight
                  size={16}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ======================================================
// EDITORIAL BRAND STATEMENT
// ======================================================

function EditorialStatement() {
  return (
    <section
      className="mk-home-editorial"
      aria-labelledby="mk-home-editorial-title"
    >
      <div className="mk-container">
        <Reveal>
          <span
            className="mk-home-editorial__symbol"
            aria-hidden="true"
          >
            ✦
          </span>

          <p className="mk-home-editorial__eyebrow">
            THE ART OF SLOW PERFUMERY
          </p>

          <h2
            id="mk-home-editorial-title"
            className="mk-home-editorial__title"
          >
            Some moments
            <br />
            deserve to <em>linger.</em>
          </h2>

          <p className="mk-home-editorial__caption">
            MAISON KIYORA
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ======================================================
// FINAL COLLECTION CTA
// ======================================================

function CollectionCTA() {
  return (
    <section
      className="mk-home-final-cta"
      aria-labelledby="mk-home-final-title"
    >
      <div className="mk-container">
        <Reveal>
          <p className="mk-home-final-cta__eyebrow">
            YOUR NEXT SIGNATURE SCENT
          </p>

          <h2 id="mk-home-final-title">
            Find what
            <br />
            <em>stays with you.</em>
          </h2>

          <Link
            to="/collections"
            className="mk-button mk-button--gold"
          >
            <span>
              SHOP THE COLLECTION
            </span>

            <ArrowUpRight
              size={17}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

// ======================================================
// MAIN HOMEPAGE
// ======================================================

export default function Home() {
  return (
    <>
      {/* ==============================================
          01 — CINEMATIC HERO VIDEO
      ============================================== */}

      <HeroVideo />

      {/* ==============================================
          02 — BRAND INTRODUCTION
      ============================================== */}

      <BrandIntroduction />

      {/* ==============================================
          03 — FEATURED PERFUME COLLECTION
      ============================================== */}

      <FeaturedProducts />

      {/* ==============================================
          04 — FRAGRANCE DISCOVERY
      ============================================== */}

      <FragranceNotes />

      {/* ==============================================
          05 — EDITORIAL BRAND STATEMENT
      ============================================== */}

      <EditorialStatement />

      {/* ==============================================
          06 — BRAND STORY VIDEO
      ============================================== */}

      <BrandStoryPreview sectionNumber="05" />

      {/* ==============================================
          07 — BRAND TRUST HIGHLIGHTS
      ============================================== */}

      <TrustHighlights />

      {/* ==============================================
          08 — FINAL COLLECTION CTA
      ============================================== */}

      <CollectionCTA />
    </>
  );
}
