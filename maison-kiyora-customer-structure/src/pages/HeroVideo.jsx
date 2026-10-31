
import {
  useEffect,
  useRef,
  useState,
} from "react";

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
// MAISON KIYORA — CINEMATIC HERO VIDEO
// The Art of Slow Perfumery
//
// React 19 + Framer Motion
//
// Features:
// - Full-screen cinematic background video
// - Responsive luxury typography
// - Accessible video controls
// - Reduced-motion support
// - Graceful video fallback
// - Collection CTA
//
// Video location:
// public/videos/hero-maison-kiyora.mp4
// ======================================================

const HERO_VIDEO =
  "/videos/hero-maison-kiyora.mp4";

const EASE = [0.22, 1, 0.36, 1];

// ------------------------------------------------------
// HERO VIDEO COMPONENT
// ------------------------------------------------------

export default function HeroVideo() {
  const videoRef = useRef(null);

  const reducedMotion = useReducedMotion();

  const [isPlaying, setIsPlaying] = useState(false);

  const [isMuted, setIsMuted] = useState(true);

  const [videoError, setVideoError] = useState(false);

  // ----------------------------------------------------
  // VIDEO INITIALIZATION
  // ----------------------------------------------------

  useEffect(() => {
    const video = videoRef.current;

    if (!video || reducedMotion) {
      return;
    }

    // Browsers generally permit muted autoplay.
    // If autoplay is blocked, controls remain available.
    const playPromise = video.play();

    if (playPromise?.catch) {
      playPromise.catch(() => {
        setIsPlaying(false);
      });
    }

    return () => {
      video.pause();
    };
  }, [reducedMotion]);

  // ----------------------------------------------------
  // PLAY / PAUSE
  // ----------------------------------------------------

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

  // ----------------------------------------------------
  // MUTE / UNMUTE
  // ----------------------------------------------------

  function handleMuteToggle() {
    const video = videoRef.current;

    if (!video) return;

    video.muted = !video.muted;

    setIsMuted(video.muted);
  }

  // ----------------------------------------------------
  // VIDEO ERROR
  // ----------------------------------------------------

  function handleVideoError() {
    setVideoError(true);
    setIsPlaying(false);
  }

  // ----------------------------------------------------
  // ANIMATION CONFIG
  // ----------------------------------------------------

  const animation = {
    hidden: {
      opacity: reducedMotion ? 1 : 0,
      y: reducedMotion ? 0 : 28,
    },

    visible: {
      opacity: 1,
      y: 0,
    },
  };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <section
      className="mk-home-hero"
      aria-labelledby="mk-home-hero-title"
    >
      {/* Cinematic video background */}
      <div
        className="mk-home-hero__media"
        aria-hidden="true"
      >
        {!videoError && (
          <video
            ref={videoRef}
            src={HERO_VIDEO}
            autoPlay={!reducedMotion}
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onVolumeChange={(event) => {
              setIsMuted(event.currentTarget.muted);
            }}
            onError={handleVideoError}
          />
        )}
      </div>

      {/* Gradient for readable typography */}
      <div
        className="mk-home-hero__veil"
        aria-hidden="true"
      />

      {/* Main hero content */}
      <div className="mk-container-wide mk-home-hero__layout">
        <div className="mk-home-hero__content">
          {/* Eyebrow */}
          <motion.p
            className="mk-home-hero__eyebrow"
            variants={animation}
            initial="hidden"
            animate="visible"
            transition={{
              duration: reducedMotion ? 0 : 0.65,
              ease: EASE,
            }}
          >
            MAISON KIYORA

            <span aria-hidden="true">
              ✦
            </span>

            THE ART OF SLOW PERFUMERY
          </motion.p>

          {/* Hero title */}
          <motion.h1
            id="mk-home-hero-title"
            className="mk-home-hero__title"
            variants={animation}
            initial="hidden"
            animate="visible"
            transition={{
              duration: reducedMotion ? 0 : 1,
              delay: reducedMotion ? 0 : 0.12,
              ease: EASE,
            }}
          >
            A scent
            <br />
            to <em>remember.</em>
          </motion.h1>

          {/* Description */}
          <motion.p
            className="mk-home-hero__description"
            variants={animation}
            initial="hidden"
            animate="visible"
            transition={{
              duration: reducedMotion ? 0 : 0.8,
              delay: reducedMotion ? 0 : 0.3,
              ease: EASE,
            }}
          >
            Discover fragrances for moments
            worth holding onto.
          </motion.p>

          {/* CTA */}
          <motion.div
            className="mk-home-hero__actions"
            variants={animation}
            initial="hidden"
            animate="visible"
            transition={{
              duration: reducedMotion ? 0 : 0.8,
              delay: reducedMotion ? 0 : 0.45,
              ease: EASE,
            }}
          >
            <Link
              to="/collections"
              className="mk-button mk-button--primary"
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

        {/* Bottom controls */}
        <div className="mk-home-hero__bottom">
          <a
            href="#discover"
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

          {!videoError && (
            <div
              className="mk-home-hero__video-controls"
              role="group"
              aria-label="Hero video controls"
            >
              {/* Play / Pause */}
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

              {/* Mute / Unmute */}
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
