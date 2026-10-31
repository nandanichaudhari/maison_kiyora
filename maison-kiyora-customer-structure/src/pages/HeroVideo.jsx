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

// Maison Kiyora — cinematic hero video
// Place the video at public/videos/hero-maison-kiyora.mp4
const HERO_VIDEO = "/videos/hero-maison-kiyora.mp4";
const EASE = [0.22, 1, 0.36, 1];

export default function HeroVideo() {
  const videoRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [playBlocked, setPlayBlocked] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion || videoError) return;

    let active = true;
    let attempting = false;

    // Set the actual media element properties before requesting playback.
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;

    async function attemptAutoplay() {
      if (!active || !video.paused || attempting) return;
      attempting = true;
      try {
        await video.play();
        if (active) setPlayBlocked(false);
      } catch (error) {
        if (active) {
          setIsPlaying(false);
          setPlayBlocked(true);
          console.info("Hero video autoplay unavailable:", error);
        }
      } finally {
        attempting = false;
      }
    }

    // Some mobile browsers need the media to become playable first.
    const onCanPlay = () => void attemptAutoplay();
    video.addEventListener("canplay", onCanPlay);
    void attemptAutoplay();

    return () => {
      active = false;
      video.removeEventListener("canplay", onCanPlay);
      video.pause();
    };
  }, [reducedMotion, videoError]);

  async function handlePlayPause() {
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused) {
      video.pause();
      return;
    }

    try {
      await video.play();
      setPlayBlocked(false);
    } catch (error) {
      setIsPlaying(false);
      setPlayBlocked(true);
      console.info("Hero video could not play:", error);
    }
  }

  function handleMuteToggle() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }

  function handleVideoError() {
    setVideoError(true);
    setIsPlaying(false);
  }

  const animation = {
    hidden: {
      opacity: reducedMotion ? 1 : 0,
      y: reducedMotion ? 0 : 28,
    },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="mk-home-hero" aria-labelledby="mk-home-hero-title">
      <div className="mk-home-hero__media" aria-hidden="true">
        {!videoError && (
          <video
            ref={videoRef}
            src={HERO_VIDEO}
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
            onPause={() => setIsPlaying(false)}
            onVolumeChange={(event) => setIsMuted(event.currentTarget.muted)}
            onError={handleVideoError}
          />
        )}
      </div>

      <div className="mk-home-hero__veil" aria-hidden="true" />

      <div className="mk-container-wide mk-home-hero__layout">
        <div className="mk-home-hero__content">
          <motion.p
            className="mk-home-hero__eyebrow"
            variants={animation}
            initial="hidden"
            animate="visible"
            transition={{ duration: reducedMotion ? 0 : 0.65, ease: EASE }}
          >
            MAISON KIYORA
            <span aria-hidden="true">✦</span>
            THE ART OF SLOW PERFUMERY
          </motion.p>

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
            <Link to="/collections" className="mk-button mk-button--primary">
              <span>EXPLORE THE COLLECTION</span>
              <ArrowUpRight size={17} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </motion.div>
        </div>

        <div className="mk-home-hero__bottom">
          <a href="#discover" className="mk-home-hero__scroll">
            <span>SCROLL TO DISCOVER</span>
            <ChevronDown size={16} strokeWidth={1.5} aria-hidden="true" />
          </a>

          {!videoError && (
            <div
              className="mk-home-hero__video-controls"
              role="group"
              aria-label="Hero video controls"
            >
              <button
                type="button"
                onClick={handlePlayPause}
                aria-label={isPlaying ? "Pause background video" : "Play background video"}
                title={
                  playBlocked
                    ? "Tap to play video"
                    : isPlaying
                      ? "Pause video"
                      : "Play video"
                }
              >
                {isPlaying ? (
                  <Pause size={16} aria-hidden="true" />
                ) : (
                  <Play size={16} aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={handleMuteToggle}
                aria-label={isMuted ? "Unmute background video" : "Mute background video"}
                title={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? (
                  <VolumeX size={16} aria-hidden="true" />
                ) : (
                  <Volume2 size={16} aria-hidden="true" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
