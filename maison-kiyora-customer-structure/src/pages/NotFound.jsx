import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Home, Search, Sparkles } from "lucide-react";

/**
 * Maison Kiyora — custom 404 page.
 * Place at src/pages/NotFound.jsx and register with <Route path="*" element={<NotFound />} />.
 */
export default function NotFound() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Page Not Found | Maison Kiyora";
    return () => { document.title = previousTitle; };
  }, []);

  const goBack = () => {
    // Direct visits may have no meaningful history entry within this site.
    if (window.history.length > 1) window.history.back();
    else window.location.assign("/");
  };

  return (
    <main className="mk-404" aria-labelledby="mk-404-heading">
      <style>{styles}</style>
      <div className="mk-404-glow" aria-hidden="true" />
      <div className="mk-404-ring mk-404-ring-one" aria-hidden="true" />
      <div className="mk-404-ring mk-404-ring-two" aria-hidden="true" />

      <div className="mk-404-inner">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="mk-404-brand"
        >
          <Sparkles size={15} strokeWidth={1.3} aria-hidden="true" />
          <span>MAISON KIYORA</span>
          <Sparkles size={15} strokeWidth={1.3} aria-hidden="true" />
        </motion.div>

        <motion.div
          className="mk-404-number"
          aria-hidden="true"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          404
        </motion.div>

        <motion.div
          className="mk-404-content"
          initial={reduceMotion ? false : { opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: reduceMotion ? 0 : 0.2 }}
        >
          <span className="mk-404-eyebrow">A MOMENTARY DETOUR</span>
          <h1 id="mk-404-heading">A little <em>lost in the moment.</em></h1>
          <p>
            The page you're looking for isn't here. Your next beautiful discovery
            is just a step away.
          </p>

          <div className="mk-404-actions">
            <Link className="mk-404-primary" to="/collections">
              EXPLORE FRAGRANCES <ArrowRight size={17} strokeWidth={1.5} aria-hidden="true" />
            </Link>
            <Link className="mk-404-secondary" to="/">
              <Home size={16} strokeWidth={1.5} aria-hidden="true" /> BACK TO HOME
            </Link>
          </div>

          <div className="mk-404-links">
            <button type="button" onClick={goBack}>
              <ArrowLeft size={15} strokeWidth={1.5} aria-hidden="true" /> Previous page
            </button>
            <span aria-hidden="true">·</span>
            <Link to="/search">
              <Search size={15} strokeWidth={1.5} aria-hidden="true" /> Search fragrances
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/contact">Contact us</Link>
          </div>
        </motion.div>
      </div>

      <div className="mk-404-footer" aria-hidden="true">
        <span>THE ART OF SLOW PERFUMERY</span>
        <span>EST. IN MOMENTS, NOT IN HASTE</span>
      </div>
      {import.meta.env.DEV && (
        <span className="mk-404-dev-path">Unmatched route: {location.pathname}</span>
      )}
    </main>
  );
}

const styles = `
  .mk-404 { --ivory:#F5F0E8; --espresso:#211C19; --gold:#B69A69; --sand:#D8C9B5;
    position:relative; isolation:isolate; display:flex; align-items:center; justify-content:center;
    min-height: min(920px, 100svh); min-height: 100svh; overflow:hidden;
    padding: 125px 24px 105px; background:var(--ivory); color:var(--espresso);
    font-family:"Manrope",sans-serif; text-align:center; }
  .mk-404 *, .mk-404 *::before, .mk-404 *::after {box-sizing:border-box;}
  .mk-404 a {text-decoration:none;}
  .mk-404-glow {position:absolute;z-index:-2;inset:0;background:
    radial-gradient(ellipse 44% 40% at 50% 48%,rgba(182,154,105,.18),transparent 85%),
    radial-gradient(ellipse 40% 45% at 12% 15%,rgba(216,201,181,.35),transparent 90%);}
  .mk-404-ring {position:absolute;z-index:-1;left:50%;top:46%;width:clamp(400px,70vw,900px);
    aspect-ratio:1;border:1px solid rgba(182,154,105,.17);border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;}
  .mk-404-ring-two {width:clamp(540px,88vw,1160px);border-color:rgba(182,154,105,.1);}
  .mk-404-inner {position:relative;z-index:1;width:min(100%,850px);margin:auto;}
  .mk-404-brand {display:flex;align-items:center;justify-content:center;gap:15px;color:#967a4e;
    font-size:11px;font-weight:650;letter-spacing:.32em;}
  .mk-404-number {margin:12px 0 -45px;font-family:"Cormorant Garamond",Georgia,serif;
    font-size:clamp(175px,33vw,370px);font-weight:300;letter-spacing:-.085em;line-height:1;
    color:rgba(182,154,105,.19);user-select:none;}
  .mk-404-content {position:relative;}
  .mk-404-eyebrow {display:block;color:#9a8058;font-size:10px;font-weight:650;letter-spacing:.25em;}
  .mk-404 h1 {max-width:790px;margin:21px auto 20px;font-family:"Cormorant Garamond",Georgia,serif;
    font-size:clamp(49px,7.5vw,92px);font-weight:400;line-height:.99;letter-spacing:-.048em;}
  .mk-404 h1 em {color:#a58b60;font-weight:300;}
  .mk-404-content > p {max-width:460px;margin:0 auto;color:#77716b;font-size:13px;line-height:2;}
  .mk-404-actions {display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:13px;margin-top:37px;}
  .mk-404-primary,.mk-404-secondary {display:inline-flex;align-items:center;justify-content:center;gap:18px;
    min-height:55px;padding:0 23px;font-size:10px;font-weight:650;letter-spacing:.13em;transition:background .2s,transform .2s,border-color .2s;}
  .mk-404-primary {background:var(--espresso);color:white;}
  .mk-404-primary:hover {background:#44372e;transform:translateY(-2px);}
  .mk-404-secondary {border:1px solid #cdbda8;color:var(--espresso);}
  .mk-404-secondary:hover {border-color:var(--espresso);transform:translateY(-2px);}
  .mk-404-links {display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:17px;margin-top:36px;}
  .mk-404-links a,.mk-404-links button {display:inline-flex;align-items:center;gap:7px;padding:6px 0;
    border:0;background:transparent;color:#81796e;font:inherit;font-size:11px;cursor:pointer;}
  .mk-404-links a:hover,.mk-404-links button:hover {color:#9a8058;text-decoration:underline;text-underline-offset:4px;}
  .mk-404-links > span {color:#b9ab98;}
  .mk-404-footer {position:absolute;right:6%;bottom:34px;left:6%;display:flex;justify-content:space-between;
    gap:20px;color:#a18d72;font-size:9px;letter-spacing:.2em;}
  .mk-404-dev-path {position:absolute;left:12px;bottom:10px;color:#8d7c69;font-size:10px;}
  @media (max-width:650px) {
    .mk-404 {padding:120px 18px 95px;}
    .mk-404-brand {font-size:10px;letter-spacing:.22em;}
    .mk-404-number {margin-bottom:-18px;font-size:clamp(165px,43vw,240px);}
    .mk-404 h1 {font-size:clamp(51px,11vw,75px);}
    .mk-404-actions {flex-direction:column;align-items:stretch;max-width:330px;margin:32px auto 0;}
    .mk-404-primary,.mk-404-secondary {width:100%;}
    .mk-404-links {gap:10px 14px;}
    .mk-404-footer {justify-content:center;bottom:24px;text-align:center;}
    .mk-404-footer span:last-child {display:none;}
  }
  @media (prefers-reduced-motion:reduce) {
    .mk-404 *, .mk-404 *::before, .mk-404 *::after {transition-duration:.01ms!important;animation-duration:.01ms!important;}
  }
`;
