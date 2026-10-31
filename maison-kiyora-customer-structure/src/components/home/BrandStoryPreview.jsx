
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

// ======================================================
// MAISON KIYORA — CINEMATIC BRAND STORY
// Autoplay • Muted • Loop • Responsive
// ======================================================

const DEFAULT_VIDEO = "/videos/our-story-maison-kiyora.mp4";
const DEFAULT_POSTER = "/images/our-story-maison-kiyora.jpg";
const EASE = [0.22, 1, 0.36, 1];

const CSS = `
  .mk-home-story {
    position: relative;
    overflow: hidden;
    background: #f5f0e8;
    color: #211c19;
    padding: clamp(70px, 9vw, 135px) 0;
    font-family: "Manrope", sans-serif;
  }

  .mk-home-story *,
  .mk-home-story *::before,
  .mk-home-story *::after {
    box-sizing: border-box;
  }

  .mk-home-story__container {
    width: min(1360px, calc(100% - 64px));
    margin-inline: auto;
  }

  .mk-home-story__grid {
    display: grid;
    grid-template-columns: minmax(0, 1.04fr) minmax(0, .96fr);
    gap: clamp(48px, 7vw, 110px);
    align-items: center;
  }

  /* VIDEO PANEL */

  .mk-home-story__visual {
    position: relative;
    isolation: isolate;
    min-width: 0;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    background: #e9e1d5;
  }

  .mk-home-story__video,
  .mk-home-story__poster {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .mk-home-story__poster {
    z-index: 0;
  }

  .mk-home-story__video {
    z-index: 1;
  }

  .mk-home-story__fallback {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 30px;
    background: #eee7dd;
    color: #211c19;
    text-align: center;
  }

  .mk-home-story__fallback-mark {
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 74px;
    font-weight: 300;
    line-height: 1;
    letter-spacing: -.08em;
  }

  .mk-home-story__fallback-name {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .25em;
  }

  .mk-home-story__fallback-subtitle {
    color: #8d7655;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 24px;
    font-style: italic;
  }

  /* Very subtle bottom shading for controls */

  .mk-home-story__visual::after {
    content: "";
    position: absolute;
    inset: auto 0 0;
    height: 110px;
    z-index: 2;
    pointer-events: none;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, .28),
      transparent
    );
  }

  .mk-home-story__corner-label {
    position: absolute;
    z-index: 3;
    left: 24px;
    bottom: 27px;
    color: #fff;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: .19em;
    text-shadow: 0 1px 8px rgba(0, 0, 0, .25);
  }

  .mk-home-story__controls {
    position: absolute;
    z-index: 4;
    right: 22px;
    bottom: 20px;
  }

  .mk-home-story__play {
    display: grid;
    place-items: center;
    width: 43px;
    height: 43px;
    padding: 0;
    border: 1px solid rgba(255, 255, 255, .7);
    border-radius: 50%;
    background: rgba(33, 28, 25, .28);
    color: #fff;
    cursor: pointer;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition:
      background .25s ease,
      transform .25s ease;
  }

  .mk-home-story__play:hover {
    background: rgba(33, 28, 25, .55);
    transform: scale(1.06);
  }

  .mk-home-story__play:focus-visible,
  .mk-home-story__link:focus-visible {
    outline: 2px solid #b69a69;
    outline-offset: 5px;
  }

  .mk-home-story__loading {
    position: absolute;
    z-index: 3;
    left: 24px;
    top: 24px;
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .18em;
    text-shadow: 0 1px 8px rgba(0, 0, 0, .3);
  }

  /* CONTENT */

  .mk-home-story__label {
    display: flex;
    align-items: center;
    gap: 14px;
    color: #967b58;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .2em;
    text-transform: uppercase;
  }

  .mk-home-story__label-line {
    display: inline-block;
    width: 42px;
    height: 1px;
    background: #b69a69;
  }

  .mk-home-story__title {
    margin: 31px 0 22px;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: clamp(52px, 6.2vw, 96px);
    font-weight: 400;
    line-height: .98;
    letter-spacing: -.04em;
  }

  .mk-home-story__title em {
    font-weight: 400;
    color: #a48860;
  }

  .mk-home-story__description {
    max-width: 410px;
    margin: 0 0 36px;
    color: #6c6661;
    font-size: 13px;
    line-height: 2;
    letter-spacing: .005em;
  }

  .mk-home-story__link {
    display: inline-flex;
    align-items: center;
    gap: 16px;
    padding: 0 0 11px;
    border-bottom: 1px solid #b69a69;
    color: #211c19;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .17em;
    text-decoration: none;
    transition:
      gap .25s ease,
      color .25s ease;
  }

  .mk-home-story__link:hover {
    gap: 22px;
    color: #967b58;
  }

  @media (max-width: 850px) {
    .mk-home-story__grid {
      grid-template-columns: 1fr 1fr;
      gap: 42px;
    }

    .mk-home-story__title {
      font-size: clamp(43px, 6vw, 68px);
    }
  }

  @media (max-width: 650px) {
    .mk-home-story {
      padding: 70px 0;
    }

    .mk-home-story__container {
      width: calc(100% - 36px);
    }

    .mk-home-story__grid {
      grid-template-columns: 1fr;
      gap: 40px;
    }

    .mk-home-story__visual {
      aspect-ratio: 5 / 5.7;
    }

    .mk-home-story__title {
      margin-top: 24px;
      font-size: clamp(50px, 13vw, 72px);
    }

    .mk-home-story__description {
      margin-bottom: 26px;
    }

    .mk-home-story__corner-label {
      left: 18px;
      bottom: 23px;
    }

    .mk-home-story__controls {
      right: 18px;
      bottom: 16px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .mk-home-story__play,
    .mk-home-story__link {
      transition: none;
    }
  }
`;

export default function BrandStoryPreview({
  videoSrc = DEFAULT_VIDEO,
  posterSrc = DEFAULT_POSTER,
  sectionNumber = "05",
  eyebrow = "OUR STORY",
  title = "More than",
  highlightedTitle = "a fragrance.",
  description =
    "Step into the world of Maison Kiyora, where fragrance becomes part of the moments we remember.",
  linkText = "EXPLORE OUR STORY",
  linkTo = "/our-story",
}) {
  const videoRef = useRef(null);
  const reducedMotion = useReducedMotion();

  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(videoSrc));
  const [posterError, setPosterError] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);

  // Reset media state when sources change.

  useEffect(() => {
    setIsPlaying(false);
    setVideoError(false);
    setIsLoading(Boolean(videoSrc));
    setPosterError(false);
    setManuallyPaused(false);
  }, [videoSrc, posterSrc]);

  // Automatically play when visible, pause when offscreen.
  // Do not autoplay for users requesting reduced motion.

  useEffect(() => {
    const video = videoRef.current;

    if (!video || videoError) return;

    if (reducedMotion) {
      video.pause();
      return;
    }

    video.muted = true;

    let cancelled = false;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (cancelled) return;

        if (!entry.isIntersecting) {
          video.pause();
          return;
        }

        if (manuallyPaused) return;

        try {
          await video.play();
        } catch {
          if (!cancelled) {
            setIsPlaying(false);
            setIsLoading(false);
          }
        }
      },
      {
        threshold: 0.25,
      }
    );

    observer.observe(video);

    return () => {
      cancelled = true;
      observer.disconnect();
      video.pause();
    };
  }, [videoSrc, videoError, reducedMotion, manuallyPaused]);

  // Play / pause button.

  async function handleVideoToggle() {
    const video = videoRef.current;

    if (!video || videoError) return;

    if (!video.paused) {
      setManuallyPaused(true);
      video.pause();
      return;
    }

    setManuallyPaused(false);

    try {
      await video.play();
    } catch {
      setIsPlaying(false);
      setIsLoading(false);
    }
  }

  function handleVideoError() {
    setVideoError(true);
    setIsLoading(false);
    setIsPlaying(false);
  }

  const animation = {
    initial: {
      opacity: reducedMotion ? 1 : 0,
      y: reducedMotion ? 0 : 24,
    },
    whileInView: {
      opacity: 1,
      y: 0,
    },
    viewport: {
      once: true,
      amount: 0.12,
    },
    transition: {
      duration: reducedMotion ? 0 : 0.8,
      ease: EASE,
    },
  };

  return (
    <section
      className="mk-home-story"
      aria-labelledby="mk-home-story-title"
    >
      <style>{CSS}</style>

      <div className="mk-home-story__container mk-container-wide">
        <div className="mk-home-story__grid">

          {/* VIDEO PANEL */}

          <motion.div
            className="mk-home-story__visual"
            {...animation}
          >
            {/* Poster displayed behind the video */}

            {posterSrc && !posterError && (
              <img
                className="mk-home-story__poster"
                src={posterSrc}
                alt=""
                loading="lazy"
                onError={() => setPosterError(true)}
              />
            )}

            {/* Video */}

            {videoSrc && !videoError && (
              <video
                key={videoSrc}
                ref={videoRef}
                className="mk-home-story__video"
                src={videoSrc}
                poster={
                  !posterError
                    ? posterSrc
                    : undefined
                }
                autoPlay={!reducedMotion}
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Maison Kiyora brand story film"
                onLoadedData={() => setIsLoading(false)}
                onCanPlay={() => setIsLoading(false)}
                onWaiting={() => setIsLoading(true)}
                onPlaying={() => {
                  setIsPlaying(true);
                  setIsLoading(false);
                }}
                onPause={() => setIsPlaying(false)}
                onError={handleVideoError}
              />
            )}

            {/* Fallback when both video and poster unavailable */}

            {(videoError || !videoSrc) &&
              (posterError || !posterSrc) && (
                <div
                  className="mk-home-story__fallback"
                  role="img"
                  aria-label="Maison Kiyora brand presentation"
                >
                  <span className="mk-home-story__fallback-mark">
                    MK
                  </span>
                  <span className="mk-home-story__fallback-name">
                    MAISON KIYORA
                  </span>
                  <span className="mk-home-story__fallback-subtitle">
                    The Art of Slow Perfumery
                  </span>
                </div>
              )}

            {/* Small bottom-right control */}

            {videoSrc && !videoError && (
              <div className="mk-home-story__controls">
                <button
                  type="button"
                  className="mk-home-story__play"
                  onClick={handleVideoToggle}
                  aria-label={
                    isPlaying
                      ? "Pause brand story video"
                      : "Play brand story video"
                  }
                  title={
                    isPlaying
                      ? "Pause video"
                      : "Play video"
                  }
                >
                  {isPlaying ? (
                    <Pause
                      size={17}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  ) : (
                    <Play
                      size={17}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  )}
                </button>
              </div>
            )}

            {isLoading && !videoError && (
              <span
                className="mk-home-story__loading"
                role="status"
              >
                LOADING FILM
              </span>
            )}

            <span
              className="mk-home-story__corner-label"
              aria-hidden="true"
            >
              EST. WITH INTENTION
            </span>
          </motion.div>

          {/* EDITORIAL CONTENT */}

          <motion.div
            className="mk-home-story__content"
            {...animation}
            transition={{
              duration: reducedMotion ? 0 : 0.8,
              delay: reducedMotion ? 0 : 0.15,
              ease: EASE,
            }}
          >
            <div className="mk-home-story__label">
              <span>{sectionNumber}</span>

              <span
                className="mk-home-story__label-line"
                aria-hidden="true"
              />

              <span>{eyebrow}</span>
            </div>

            <h2
              id="mk-home-story-title"
              className="mk-home-story__title"
            >
              {title}
              <br />
              <em>{highlightedTitle}</em>
            </h2>

            <p className="mk-home-story__description">
              {description}
            </p>

            <Link
              to={linkTo}
              className="mk-home-story__link"
            >
              <span>{linkText}</span>

              <ArrowUpRight
                size={17}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
