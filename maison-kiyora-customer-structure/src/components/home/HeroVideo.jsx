
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronDown,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  motion,
  useReducedMotion,
} from "framer-motion";

// ======================================================
// MAISON KIYORA — CINEMATIC LUXURY HERO
// Designed for transparent overlay navbar
// ======================================================

const DEFAULT_VIDEO = "/videos/hero-maison-kiyora.mp4";
const DEFAULT_POSTER = "/images/hero-maison-kiyora.jpg";

const EASE = [0.22, 1, 0.36, 1];

const CSS = `
  .mk-home-hero {
    position: relative;
    isolation: isolate;
    display: flex;
    width: 100%;
    min-height: 720px;
    min-height: 100svh;
    overflow: hidden;
    background: #211c19;
    color: #f5f0e8;
    font-family: "Manrope", Arial, sans-serif;
  }

  .mk-home-hero *,
  .mk-home-hero *::before,
  .mk-home-hero *::after {
    box-sizing: border-box;
  }

  /* Background video and image */

  .mk-home-hero__media {
    position: absolute;
    inset: 0;
    z-index: -2;
    overflow: hidden;
    pointer-events: none;
  }

  .mk-home-hero__media video,
  .mk-home-hero__poster {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
  }

  .mk-home-hero__poster {
    z-index: 0;
    background: #211c19;
  }

  .mk-home-hero__media video {
    z-index: 1;
  }

  /* Cinematic gradient for readability */

  .mk-home-hero__veil {
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background:
      linear-gradient(
        90deg,
        rgba(17, 14, 13, .78) 0%,
        rgba(17, 14, 13, .56) 35%,
        rgba(17, 14, 13, .22) 72%,
        rgba(17, 14, 13, .14) 100%
      ),
      linear-gradient(
        180deg,
        rgba(17, 14, 13, .38) 0%,
        transparent 28%,
        transparent 70%,
        rgba(17, 14, 13, .52) 100%
      );
  }

  /* Main layout */

  .mk-home-hero__layout {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 40px;
    width: min(100%, 1540px);
    min-height: inherit;
    margin: 0 auto;
    padding:
      clamp(165px, 23vh, 235px)
      clamp(24px, 6vw, 110px)
      34px;
  }

  .mk-home-hero__content {
    width: min(100%, 720px);
    margin: auto 0;
  }

  /* Editorial label */

  .mk-home-hero__eyebrow {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 13px;
    margin: 0 0 28px;
    color: #ead9bc;
    font-size: 10px;
    font-weight: 600;
    line-height: 1.7;
    letter-spacing: .22em;
  }

  .mk-home-hero__eyebrow span {
    color: #b69a69;
    font-size: 12px;
  }

  /* Hero typography */

  .mk-home-hero__title {
    margin: 0;
    max-width: 760px;
    color: #f5f0e8;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(68px, 8vw, 124px);
    font-weight: 400;
    line-height: .94;
    letter-spacing: -.045em;
    text-wrap: balance;
  }

  .mk-home-hero__title em {
    color: #e8d2ac;
    font-weight: 300;
  }

  .mk-home-hero__description {
    max-width: 410px;
    margin: 26px 0 30px;
    color: rgba(245, 240, 232, .87);
    font-size: clamp(12px, 1.1vw, 14px);
    font-weight: 400;
    line-height: 1.9;
    letter-spacing: .01em;
  }

  /* CTA */

  .mk-home-hero__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
  }

  .mk-home-hero__cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 26px;
    min-height: 55px;
    padding: 16px 25px;
    background: #f5f0e8;
    color: #211c19;
    border: 1px solid #f5f0e8;
    text-decoration: none;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .13em;
    transition:
      background .25s ease,
      border-color .25s ease,
      transform .25s ease;
  }

  .mk-home-hero__cta:hover {
    background: #e8d2ac;
    border-color: #e8d2ac;
    transform: translateY(-2px);
  }

  .mk-home-hero__cta:focus-visible,
  .mk-home-hero__scroll:focus-visible,
  .mk-home-hero__video-controls button:focus-visible {
    outline: 2px solid #e8d2ac;
    outline-offset: 4px;
  }

  /* Bottom controls */

  .mk-home-hero__bottom {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 20px;
  }

  .mk-home-hero__scroll {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    color: rgba(245, 240, 232, .9);
    font-size: 9px;
    font-weight: 600;
    letter-spacing: .18em;
    text-decoration: none;
  }

  .mk-home-hero__scroll svg {
    transition: transform .25s ease;
  }

  .mk-home-hero__scroll:hover svg {
    transform: translateY(4px);
  }

  .mk-home-hero__video-controls {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .mk-home-hero__video-controls button {
    display: grid;
    place-items: center;
    width: 39px;
    height: 39px;
    padding: 0;
    border: 1px solid rgba(245, 240, 232, .55);
    border-radius: 50%;
    background: rgba(33, 28, 25, .32);
    color: #f5f0e8;
    cursor: pointer;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition:
      background .2s ease,
      border-color .2s ease;
  }

  .mk-home-hero__video-controls button:hover {
    background: rgba(245, 240, 232, .18);
    border-color: #f5f0e8;
  }

  /* Tablet */

  @media (max-width: 900px) {
    .mk-home-hero__layout {
      padding: 165px 36px 30px;
    }

    .mk-home-hero__title {
      font-size: clamp(66px, 10vw, 100px);
    }

    .mk-home-hero__veil {
      background:
        linear-gradient(
          90deg,
          rgba(17, 14, 13, .76),
          rgba(17, 14, 13, .32)
        ),
        linear-gradient(
          180deg,
          rgba(17, 14, 13, .35),
          transparent 40%,
          rgba(17, 14, 13, .45)
        );
    }
  }

  /* Mobile */

  @media (max-width: 700px) {
    .mk-home-hero {
      min-height: 680px;
      min-height: 100svh;
    }

    .mk-home-hero__layout {
      gap: 30px;
      padding: 142px 23px 27px;
    }

    .mk-home-hero__content {
      max-width: 100%;
    }

    .mk-home-hero__eyebrow {
      gap: 8px;
      margin-bottom: 23px;
      font-size: 8px;
      letter-spacing: .12em;
    }

    .mk-home-hero__title {
      font-size: clamp(56px, 12.5vw, 82px);
      line-height: .98;
      letter-spacing: -.04em;
    }

    .mk-home-hero__description {
      max-width: 330px;
      margin: 25px 0;
      font-size: 12px;
      line-height: 1.85;
    }

    .mk-home-hero__cta {
      min-height: 52px;
      padding: 15px 18px;
      font-size: 9px;
      gap: 17px;
    }

    .mk-home-hero__scroll {
      font-size: 8px;
      letter-spacing: .11em;
    }

    .mk-home-hero__veil {
      background:
        linear-gradient(
          90deg,
          rgba(17, 14, 13, .79),
          rgba(17, 14, 13, .32)
        ),
        linear-gradient(
          180deg,
          rgba(17, 14, 13, .3),
          transparent 40%,
          rgba(17, 14, 13, .52)
        );
    }
  }

  /* Small phones */

  @media (max-width: 380px) {
    .mk-home-hero__layout {
      padding: 132px 18px 24px;
    }

    .mk-home-hero__title {
      font-size: 52px;
    }

    .mk-home-hero__eyebrow {
      font-size: 7px;
    }

    .mk-home-hero__bottom {
      gap: 12px;
    }

    .mk-home-hero__video-controls button {
      width: 35px;
      height: 35px;
    }
  }

  /* Reduced motion */

  @media (prefers-reduced-motion: reduce) {
    .mk-home-hero__cta,
    .mk-home-hero__scroll svg,
    .mk-home-hero__video-controls button {
      transition: none;
    }
  }
`;

// ======================================================
// MAIN HERO COMPONENT
// ======================================================

export default function HeroVideo({
  videoSrc = DEFAULT_VIDEO,
  posterSrc = DEFAULT_POSTER,
  collectionPath = "/collections",
  scrollTarget = "discover",
  className = "",
}) {
  const videoRef = useRef(null);
  const reducedMotion = useReducedMotion();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [posterError, setPosterError] = useState(false);

  // Reset media errors when sources change.

  useEffect(() => {
    setVideoError(false);
    setIsPlaying(false);
  }, [videoSrc]);

  useEffect(() => {
    setPosterError(false);
  }, [posterSrc]);

  // Respect reduced-motion preference.

  useEffect(() => {
    const video = videoRef.current;

    if (!video || videoError) return;

    if (reducedMotion) {
      video.pause();
      return;
    }

    video.muted = true;

    const attempt = video.play();

    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => setIsPlaying(false));
    }

    return () => {
      video.pause();
    };
  }, [reducedMotion, videoError, videoSrc]);

  // Play / pause control.

  async function handlePlayPause() {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
      } catch {
        setIsPlaying(false);
      }
    } else {
      video.pause();
    }
  }

  // Mute / unmute control.

  function handleMuteToggle() {
    const video = videoRef.current;

    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  }

  // Motion configuration.

  const reveal = {
    hidden: {
      opacity: reducedMotion ? 1 : 0,
      y: reducedMotion ? 0 : 24,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const transition = (duration, delay = 0) => ({
    duration: reducedMotion ? 0 : duration,
    delay: reducedMotion ? 0 : delay,
    ease: EASE,
  });

  return (
    <section
      className={`mk-home-hero ${className}`.trim()}
      aria-labelledby="mk-home-hero-title"
    >
      <style>{CSS}</style>

      {/* ============================================
          BACKGROUND MEDIA
      ============================================ */}

      <div
        className="mk-home-hero__media"
        aria-hidden="true"
      >
        {!posterError && posterSrc && (
          <img
            className="mk-home-hero__poster"
            src={posterSrc}
            alt=""
            fetchPriority="high"
            onError={() => setPosterError(true)}
          />
        )}

        {!videoError && videoSrc && (
          <video
            key={videoSrc}
            ref={videoRef}
            src={videoSrc}
            poster={
              !posterError ? posterSrc : undefined
            }
            autoPlay={!reducedMotion}
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onVolumeChange={(event) =>
              setIsMuted(event.currentTarget.muted)
            }
            onError={() => {
              setVideoError(true);
              setIsPlaying(false);
            }}
          />
        )}
      </div>

      {/* CINEMATIC OVERLAY */}

      <div
        className="mk-home-hero__veil"
        aria-hidden="true"
      />

      {/* ============================================
          HERO CONTENT
      ============================================ */}

      <div className="mk-home-hero__layout">
        <div className="mk-home-hero__content">

          {/* Eyebrow */}

          <motion.p
            className="mk-home-hero__eyebrow"
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={transition(0.65)}
          >
            MAISON KIYORA

            <span aria-hidden="true">✦</span>

            THE ART OF SLOW PERFUMERY
          </motion.p>

          {/* Main heading */}

          <motion.h1
            id="mk-home-hero-title"
            className="mk-home-hero__title"
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={transition(1, 0.12)}
          >
            A scent
            <br />
            to <em>remember.</em>
          </motion.h1>

          {/* Description */}

          <motion.p
            className="mk-home-hero__description"
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={transition(0.8, 0.3)}
          >
            Discover fragrances for moments
            worth holding onto.
          </motion.p>

          {/* Collection CTA */}

          <motion.div
            className="mk-home-hero__actions"
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={transition(0.8, 0.45)}
          >
            <Link
              to={collectionPath}
              className="mk-home-hero__cta"
            >
              <span>
                EXPLORE THE COLLECTION
              </span>

              <ArrowUpRight
                size={17}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </Link>
          </motion.div>
        </div>

        {/* ============================================
            BOTTOM CONTROLS
        ============================================ */}

        <div className="mk-home-hero__bottom">

          <a
            href={`#${scrollTarget}`}
            className="mk-home-hero__scroll"
          >
            <span>
              SCROLL TO DISCOVER
            </span>

            <ChevronDown
              size={16}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </a>

          {!videoError && Boolean(videoSrc) && (
            <div
              className="mk-home-hero__video-controls"
              role="group"
              aria-label="Hero video controls"
            >
              <button
                type="button"
                onClick={handlePlayPause}
                aria-label={
                  isPlaying
                    ? "Pause background video"
                    : "Play background video"
                }
                title={
                  isPlaying
                    ? "Pause video"
                    : "Play video"
                }
              >
                {isPlaying ? (
                  <Pause
                    size={16}
                    aria-hidden="true"
                  />
                ) : (
                  <Play
                    size={16}
                    aria-hidden="true"
                  />
                )}
              </button>

              <button
                type="button"
                onClick={handleMuteToggle}
                aria-label={
                  isMuted
                    ? "Unmute background video"
                    : "Mute background video"
                }
                title={
                  isMuted
                    ? "Unmute video"
                    : "Mute video"
                }
              >
                {isMuted ? (
                  <VolumeX
                    size={16}
                    aria-hidden="true"
                  />
                ) : (
                  <Volume2
                    size={16}
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
