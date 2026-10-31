
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
import { motion, useReducedMotion } from "framer-motion";

// ==============================================
// MAISON KIYORA — CINEMATIC HERO VIDEO
// Mobile autoplay + graceful fallback
// ==============================================

const HERO_VIDEO = "/videos/hero-maison-kiyora.mp4";
const HERO_POSTER = "/images/hero-maison-kiyora.jpg";

const EASE = [0.22, 1, 0.36, 1];

export default function HeroVideo() {
  const videoRef = useRef(null);
  const manuallyPausedRef = useRef(false);

  const reducedMotion = useReducedMotion();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [playBlocked, setPlayBlocked] = useState(false);

  // ==============================================
  // AUTOPLAY INITIALIZATION
  // ==============================================

  useEffect(() => {
    const video = videoRef.current;

    if (!video || videoError) return;

    let active = true;
    let attempting = false;

    // Configure video for mobile browsers.
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.loop = true;

    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    setIsMuted(true);

    if (reducedMotion) {
      video.pause();
      return;
    }

    const attemptAutoplay = async () => {
      if (
        !active ||
        attempting ||
        manuallyPausedRef.current ||
        !video.paused
      ) {
        return;
      }

      attempting = true;

      try {
        await video.play();

        if (active) {
          setIsPlaying(true);
          setPlayBlocked(false);
        }
      } catch (error) {
        if (active) {
          setIsPlaying(false);
          setPlayBlocked(true);

          console.warn(
            "[Maison Kiyora] Hero autoplay failed:",
            error?.name,
            error?.message
          );
        }
      } finally {
        attempting = false;
      }
    };

    // Attempt immediately.
    void attemptAutoplay();

    // Retry when the video becomes ready.
    const handleReady = () => {
      void attemptAutoplay();
    };

    // Retry when returning to the browser tab.
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void attemptAutoplay();
      }
    };

    video.addEventListener("loadeddata", handleReady);
    video.addEventListener("canplay", handleReady);

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      active = false;

      video.removeEventListener(
        "loadeddata",
        handleReady
      );

      video.removeEventListener(
        "canplay",
        handleReady
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

      video.pause();
    };
  }, [reducedMotion, videoError]);

  // ==============================================
  // PLAY / PAUSE
  // ==============================================

  async function handlePlayPause() {
    const video = videoRef.current;

    if (!video) return;

    if (!video.paused) {
      manuallyPausedRef.current = true;
      video.pause();
      setIsPlaying(false);
      return;
    }

    manuallyPausedRef.current = false;

    try {
      await video.play();
      setIsPlaying(true);
      setPlayBlocked(false);
    } catch (error) {
      setIsPlaying(false);
      setPlayBlocked(true);

      console.warn(
        "[Maison Kiyora] Manual playback failed:",
        error
      );
    }
  }

  // ==============================================
  // MUTE / UNMUTE
  // ==============================================

  function handleMuteToggle() {
    const video = videoRef.current;

    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  }

  // ==============================================
  // VIDEO EVENTS
  // ==============================================

  function handleVideoError(event) {
    const error = event.currentTarget.error;

    console.error(
      "[Maison Kiyora] Video loading error:",
      error?.code,
      error?.message
    );

    setVideoError(true);
    setIsPlaying(false);
  }

  // ==============================================
  // ANIMATION
  // ==============================================

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

  const transition = (duration, delay = 0) => ({
    duration: reducedMotion ? 0 : duration,
    delay: reducedMotion ? 0 : delay,
    ease: EASE,
  });

  // ==============================================
  // RENDER
  // ==============================================

  return (
    <section
      className="mk-home-hero"
      aria-labelledby="mk-home-hero-title"
    >
      {/* BACKGROUND VIDEO */}

      <div
        className="mk-home-hero__media"
        aria-hidden="true"
      >
        {!videoError && (
          <video
            ref={videoRef}
            src={HERO_VIDEO}
            poster={HERO_POSTER}
            autoPlay={!reducedMotion}
            muted
            loop
            playsInline
            preload="auto"
            controls={false}
            disablePictureInPicture
            onPlay={() => {
              setIsPlaying(true);
              setPlayBlocked(false);
            }}
            onPause={() => {
              setIsPlaying(false);
            }}
            onVolumeChange={(event) => {
              setIsMuted(event.currentTarget.muted);
            }}
            onError={handleVideoError}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        )}

        {videoError && (
          <img
            src={HERO_POSTER}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
      </div>

      {/* CINEMATIC OVERLAY */}

      <div
        className="mk-home-hero__veil"
        aria-hidden="true"
      />

      {/* HERO CONTENT */}

      <div className="mk-container-wide mk-home-hero__layout">
        <div className="mk-home-hero__content">

          {/* EYEBROW */}

          <motion.p
            className="mk-home-hero__eyebrow"
            variants={animation}
            initial="hidden"
            animate="visible"
            transition={transition(0.65)}
          >
            MAISON KIYORA

            <span aria-hidden="true">
              ✦
            </span>

            THE ART OF SLOW PERFUMERY
          </motion.p>

          {/* HEADING */}

          <motion.h1
            id="mk-home-hero-title"
            className="mk-home-hero__title"
            variants={animation}
            initial="hidden"
            animate="visible"
            transition={transition(1, 0.12)}
          >
            A scent
            <br />
            to <em>remember.</em>
          </motion.h1>

          {/* DESCRIPTION */}

          <motion.p
            className="mk-home-hero__description"
            variants={animation}
            initial="hidden"
            animate="visible"
            transition={transition(0.8, 0.3)}
          >
            Discover fragrances for moments
            worth holding onto.
          </motion.p>

          {/* COLLECTION CTA */}

          <motion.div
            className="mk-home-hero__actions"
            variants={animation}
            initial="hidden"
            animate="visible"
            transition={transition(0.8, 0.45)}
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

        {/* BOTTOM CONTROLS */}

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
              {/* PLAY / PAUSE */}

              <button
                type="button"
                onClick={handlePlayPause}
                aria-label={
                  isPlaying
                    ? "Pause background video"
                    : "Play background video"
                }
                title={
                  playBlocked
                    ? "Tap to play video"
                    : isPlaying
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

              {/* MUTE / UNMUTE */}

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
