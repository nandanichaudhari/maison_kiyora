import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, CheckCircle2, ChevronRight, CircleUserRound,
  ClipboardList, LockKeyhole, LogOut, Mail, MapPin,
  Pencil, Save, ShieldCheck, UserRound, X,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";

const initialProfile = (user) => ({
  firstName: user?.firstName || "",
  lastName: user?.lastName || "",
});

const quickLinks = [
  { to: "/orders", icon: ClipboardList, title: "My Orders", description: "View your purchases and order history" },
  { to: "/account/addresses", icon: MapPin, title: "Saved Addresses", description: "Manage your delivery details" },
  { to: "/wishlist", icon: UserRound, title: "My Wishlist", description: "Revisit your favourite fragrances" },
];

export default function Account() {
  const navigate = useNavigate();
  const {
    user, isAuthenticated, isLoading, isSubmitting,
    updateProfile, changePassword, resendVerification, logout, clearError,
  } = useAuth();

  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(() => initialProfile(user));
  const [profileError, setProfileError] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [busyAction, setBusyAction] = useState("");

  useEffect(() => { document.title = "My Account | Maison Kiyora"; }, []);
  useEffect(() => {
    if (!editing) setProfile(initialProfile(user));
  }, [user?.firstName, user?.lastName, editing]);
  useEffect(() => () => clearError(), [clearError]);

  const displayName = useMemo(() =>
    user?.fullName?.trim() || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Fragrance Lover",
  [user?.fullName, user?.firstName, user?.lastName]);

  const initials = useMemo(() => {
    const parts = displayName.split(/\s+/).filter(Boolean);
    return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : displayName.slice(0, 2)).toUpperCase();
  }, [displayName]);

  const saveProfile = async (event) => {
    event.preventDefault();
    if (isSubmitting || busyAction) return;
    const firstName = profile.firstName.trim();
    const lastName = profile.lastName.trim();
    if (!firstName || !lastName) { setProfileError("Please enter your first and last name."); return; }
    if (firstName.length > 80 || lastName.length > 80) { setProfileError("Each name must be 80 characters or fewer."); return; }
    try {
      setProfileError(""); setBusyAction("profile");
      const result = await updateProfile({ firstName, lastName, fullName: `${firstName} ${lastName}` });
      if (result?.success === false) throw new Error(result.message || "Could not save your profile.");
      setEditing(false); toast.success("Profile updated successfully.");
    } catch (error) { setProfileError(error?.message || "Unable to update your profile."); }
    finally { setBusyAction(""); }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    if (isSubmitting || busyAction) return;
    if (password.length < 8 || password.length > 72) { setPasswordError("Password must be between 8 and 72 characters."); return; }
    if (password !== confirmPassword) { setPasswordError("Passwords do not match."); return; }
    try {
      setPasswordError(""); setBusyAction("password");
      const result = await changePassword({ password, confirmPassword });
      if (result?.success === false) throw new Error(result.message || "Could not change your password.");
      setPassword(""); setConfirmPassword(""); setPasswordOpen(false);
      toast.success("Password updated successfully.");
    } catch (error) { setPasswordError(error?.message || "Unable to change your password."); }
    finally { setBusyAction(""); }
  };

  const handleResendVerification = async () => {
    if (!user?.email || isSubmitting || busyAction) return;
    try {
      setBusyAction("verification");
      const result = await resendVerification({ email: user.email });
      if (result?.success === false) throw new Error(result.message || "Could not send verification email.");
      toast.success("If eligible, a verification email has been sent.");
    } catch (error) { toast.error(error?.message || "Unable to send verification email."); }
    finally { setBusyAction(""); }
  };

  const handleLogout = async () => {
    if (isSubmitting || busyAction) return;
    try {
      setBusyAction("logout");
      const result = await logout();
      if (result?.success === false) throw new Error(result.message || "Could not sign out.");
      toast.success("You have signed out.");
      navigate("/login", { replace: true });
    } catch (error) { toast.error(error?.message || "Unable to sign out."); }
    finally { setBusyAction(""); }
  };

  if (isLoading || !isAuthenticated || !user) {
    return <div className="mk-account-loading" role="status" aria-live="polite"><style>{styles}</style><span className="mk-account-spinner" aria-hidden="true"/><p>Preparing your personal space...</p></div>;
  }

  return (
    <div className="mk-account-page">
      <style>{styles}</style>
      <section className="mk-account-hero">
        <div className="mk-account-container">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}>
            <span className="mk-account-eyebrow">YOUR PERSONAL MAISON</span>
            <h1>Welcome back, <em>{user.firstName || displayName.split(" ")[0]}.</em></h1>
            <p>Your fragrance journey, thoughtfully kept in one place.</p>
          </motion.div>
        </div>
      </section>

      <div className="mk-account-container mk-account-content">
        <div className="mk-account-grid">
          <section className="mk-account-main" aria-label="Account details">
            <motion.div className="mk-account-card mk-account-profile" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}>
              <div className="mk-account-card-heading">
                <div><span className="mk-account-label">ACCOUNT DETAILS</span><h2>My Profile</h2></div>
                {!editing && <button type="button" className="mk-account-text-action" onClick={() => { setProfile(initialProfile(user)); setEditing(true); setProfileError(""); }}><Pencil size={15}/> Edit profile</button>}
              </div>
              <div className="mk-account-identity">
                <div className="mk-account-avatar" aria-hidden="true">{initials}</div>
                <div className="mk-account-identity-text"><strong>{displayName}</strong><span>{user.email}</span></div>
              </div>
              {editing ? (
                <form className="mk-account-edit-form" onSubmit={saveProfile}>
                  <div className="mk-account-name-grid">
                    <label>First name<input autoComplete="given-name" maxLength={80} value={profile.firstName} onChange={(e) => setProfile((prev) => ({ ...prev, firstName: e.target.value }))} disabled={isSubmitting || !!busyAction}/></label>
                    <label>Last name<input autoComplete="family-name" maxLength={80} value={profile.lastName} onChange={(e) => setProfile((prev) => ({ ...prev, lastName: e.target.value }))} disabled={isSubmitting || !!busyAction}/></label>
                  </div>
                  {profileError && <p className="mk-account-error" role="alert">{profileError}</p>}
                  <div className="mk-account-form-actions"><button type="button" className="mk-account-secondary-btn" onClick={() => { setEditing(false); setProfile(initialProfile(user)); setProfileError(""); }} disabled={!!busyAction}><X size={15}/> Cancel</button><button type="submit" className="mk-account-primary-btn" disabled={!!busyAction || isSubmitting}><Save size={15}/>{busyAction === "profile" ? "Saving..." : "Save Changes"}</button></div>
                </form>
              ) : (
                <div className="mk-account-info-grid"><div><span>First name</span><strong>{user.firstName || "Not added"}</strong></div><div><span>Last name</span><strong>{user.lastName || "Not added"}</strong></div><div className="mk-account-info-wide"><span>Email address</span><strong>{user.email}</strong></div></div>
              )}
              <div className="mk-account-verification">
                {user.emailVerified ? <><CheckCircle2 size={17}/><span>Email address verified</span></> : <><Mail size={17}/><span>Email not verified</span><button type="button" onClick={handleResendVerification} disabled={!!busyAction || isSubmitting}>{busyAction === "verification" ? "Sending..." : "Resend email"}</button></>}
              </div>
            </motion.div>

            <section className="mk-account-card mk-account-shortcuts">
              <div className="mk-account-card-heading"><div><span className="mk-account-label">YOUR EXPERIENCE</span><h2>Explore Your Account</h2></div></div>
              <div className="mk-account-links">
                {quickLinks.map(({ to, icon: Icon, title, description }) => <Link key={to} to={to} className="mk-account-link"><span className="mk-account-link-icon"><Icon size={20} strokeWidth={1.4}/></span><span className="mk-account-link-copy"><strong>{title}</strong><small>{description}</small></span><ChevronRight size={18} strokeWidth={1.5}/></Link>)}
              </div>
            </section>
          </section>

          <aside className="mk-account-side" aria-label="Account security">
            <section className="mk-account-card mk-account-security-card">
              <span className="mk-account-label">PRIVATE & SECURE</span>
              <div className="mk-account-side-icon"><ShieldCheck size={25} strokeWidth={1.3}/></div>
              <h2>Account Security</h2>
              <p>Keep your personal Maison Kiyora account protected.</p>
              {!passwordOpen ? <button type="button" className="mk-account-outline-btn" onClick={() => { setPasswordError(""); setPasswordOpen(true); }}><LockKeyhole size={16}/> Change Password <ArrowRight size={16}/></button> : <form onSubmit={savePassword} className="mk-account-password-form"><label>New password<input type="password" autoComplete="new-password" value={password} onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }} disabled={!!busyAction || isSubmitting}/></label><label>Confirm new password<input type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(""); }} disabled={!!busyAction || isSubmitting}/></label>{passwordError && <p className="mk-account-error" role="alert">{passwordError}</p>}<button type="submit" className="mk-account-primary-btn" disabled={!!busyAction || isSubmitting}>{busyAction === "password" ? "Updating..." : "Update Password"}</button><button type="button" className="mk-account-cancel-link" onClick={() => { setPasswordOpen(false); setPassword(""); setConfirmPassword(""); setPasswordError(""); }} disabled={!!busyAction}>Cancel</button></form>}
            </section>
            <section className="mk-account-side-note"><CircleUserRound size={23} strokeWidth={1.2}/><p>Every fragrance tells a story. Your Maison Kiyora account keeps yours close.</p><Link to="/collections">Explore Fragrances <ArrowRight size={15}/></Link></section>
            <button type="button" className="mk-account-logout" onClick={handleLogout} disabled={!!busyAction || isSubmitting}><LogOut size={17}/>{busyAction === "logout" ? "Signing out..." : "Sign Out"}</button>
          </aside>
        </div>
      </div>
    </div>
  );
}

const styles = `
.mk-account-page{--navy:#1D2940;--ivory:#F5F0E8;--gold:#B69A69;--sand:#D8C9B5;min-height:100vh;background:var(--ivory);color:var(--navy);font-family:"Manrope",sans-serif}
.mk-account-page *{box-sizing:border-box}
.mk-account-container{width:min(1160px,calc(100% - 48px));margin-inline:auto}
.mk-account-hero{padding:105px 0 70px;background:radial-gradient(ellipse at 80% 30%,rgba(182,154,105,.19),transparent 46%),linear-gradient(140deg,#29364d,#152033);color:#fff}
.mk-account-eyebrow,.mk-account-label{display:block;font-size:10px;font-weight:650;letter-spacing:.22em;color:var(--gold)}
.mk-account-hero h1{font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(56px,7vw,91px);font-weight:400;letter-spacing:-.04em;line-height:1;margin:17px 0 15px}
.mk-account-hero h1 em{color:#dec9a8;font-weight:300}
.mk-account-hero p{font-size:12px;line-height:1.9;color:rgba(255,255,255,.7);margin:0}
.mk-account-content{padding-block:54px 90px}
.mk-account-grid{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(280px,1fr);gap:25px;align-items:start}
.mk-account-main,.mk-account-side{display:grid;gap:24px;min-width:0}
.mk-account-card{background:#fbf8f3;border:1px solid #e6ded2;padding:clamp(23px,3vw,35px)}
.mk-account-card-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:28px}
.mk-account-card h2{font-family:"Cormorant Garamond",Georgia,serif;font-weight:500;font-size:34px;line-height:1.1;margin:10px 0 0}
.mk-account-text-action{display:inline-flex;align-items:center;gap:8px;border:0;background:transparent;color:#856e4e;font:inherit;font-size:11px;font-weight:650;cursor:pointer;white-space:nowrap}
.mk-account-identity{display:flex;align-items:center;gap:18px;padding-bottom:27px;border-bottom:1px solid #e8dfd4}
.mk-account-avatar{display:grid;place-items:center;flex:none;width:68px;height:68px;border:1px solid #bba681;background:#eee3d4;border-radius:50%;font-family:"Cormorant Garamond",Georgia,serif;font-size:30px;color:#7b6242}
.mk-account-identity-text{display:grid;gap:7px;min-width:0}.mk-account-identity-text strong{font-size:15px;font-weight:650}.mk-account-identity-text span{font-size:11px;color:#7d7a76;overflow-wrap:anywhere}
.mk-account-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:26px 18px;padding:27px 0}.mk-account-info-grid>div{display:grid;gap:8px;min-width:0}.mk-account-info-grid span{font-size:10px;color:#89847c}.mk-account-info-grid strong{font-size:12px;font-weight:600;overflow-wrap:anywhere}.mk-account-info-wide{grid-column:1/-1}
.mk-account-verification{display:flex;align-items:center;gap:9px;border-top:1px solid #e8dfd4;padding-top:18px;color:#5c7963;font-size:11px}.mk-account-verification button{margin-left:auto;background:transparent;border:0;color:#8c7048;font:inherit;font-size:10px;text-decoration:underline;cursor:pointer}
.mk-account-edit-form{padding-top:26px}.mk-account-name-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.mk-account-edit-form label,.mk-account-password-form label{display:grid;gap:9px;font-size:11px;font-weight:600}.mk-account-edit-form input,.mk-account-password-form input{width:100%;min-width:0;height:46px;padding:0 12px;border:1px solid #dcd2c5;background:#fffdf9;outline:none;font:inherit;font-size:12px;color:var(--navy)}.mk-account-edit-form input:focus,.mk-account-password-form input:focus{border-color:var(--gold)}
.mk-account-form-actions{display:flex;justify-content:flex-end;gap:10px;margin:20px 0 24px}.mk-account-primary-btn,.mk-account-secondary-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:43px;padding:0 17px;font:inherit;font-size:11px;font-weight:650;cursor:pointer}.mk-account-primary-btn{background:var(--navy);color:#fff;border:1px solid var(--navy)}.mk-account-secondary-btn{background:transparent;color:var(--navy);border:1px solid #d7ccbd}.mk-account-primary-btn:disabled,.mk-account-secondary-btn:disabled{opacity:.5;cursor:not-allowed}.mk-account-error{margin:12px 0;color:#a94c42;font-size:11px;line-height:1.6}
.mk-account-shortcuts .mk-account-card-heading{margin-bottom:15px}.mk-account-links{display:grid}.mk-account-link{display:flex;align-items:center;gap:17px;padding:20px 0;border-bottom:1px solid #e8dfd4;color:var(--navy);text-decoration:none}.mk-account-link:last-child{border-bottom:0;padding-bottom:0}.mk-account-link-icon{display:grid;place-items:center;width:44px;height:44px;flex:none;border:1px solid #e1d5c3;color:#947a54}.mk-account-link-copy{display:grid;gap:6px;flex:1}.mk-account-link-copy strong{font-size:12px;font-weight:650}.mk-account-link-copy small{font-size:10px;line-height:1.6;color:#85817c}.mk-account-link>svg{color:#99836a;transition:transform .2s}.mk-account-link:hover>svg{transform:translateX(4px)}
.mk-account-side-icon{display:grid;place-items:center;width:54px;height:54px;border:1px solid #dcccb7;border-radius:50%;color:#a88b62;margin:24px 0 18px}.mk-account-security-card>p{font-size:11px;line-height:1.9;color:#7e7b77;margin:14px 0 22px}.mk-account-outline-btn{display:flex;align-items:center;gap:10px;width:100%;padding:14px;border:1px solid #cdbb9f;background:transparent;color:var(--navy);font:inherit;font-size:11px;font-weight:650;cursor:pointer}.mk-account-outline-btn>svg:last-child{margin-left:auto}.mk-account-password-form{display:grid;gap:15px}.mk-account-password-form .mk-account-primary-btn{width:100%}.mk-account-cancel-link{border:0;background:transparent;color:#8d7758;font:inherit;font-size:11px;cursor:pointer}
.mk-account-side-note{padding:27px 28px;background:#eae0d3;color:#806747}.mk-account-side-note p{font-family:"Cormorant Garamond",Georgia,serif;font-size:25px;line-height:1.25;margin:15px 0 20px}.mk-account-side-note a{display:inline-flex;align-items:center;gap:9px;color:var(--navy);font-size:10px;font-weight:650;letter-spacing:.05em;text-decoration:none}
.mk-account-logout{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:49px;border:1px solid #d9cbbd;background:transparent;color:#765c50;font:inherit;font-size:11px;font-weight:650;cursor:pointer}.mk-account-logout:hover{background:#efe7dd}.mk-account-logout:disabled{opacity:.5;cursor:not-allowed}
.mk-account-loading{min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:15px;background:#F5F0E8;color:#1D2940;font-family:"Manrope",sans-serif;font-size:12px}.mk-account-spinner{width:26px;height:26px;border:2px solid #d8c9b5;border-top-color:#1D2940;border-radius:50%;animation:mk-account-spin .7s linear infinite}@keyframes mk-account-spin{to{transform:rotate(360deg)}}
@media(max-width:800px){.mk-account-grid{grid-template-columns:1fr}.mk-account-hero{padding:85px 0 60px}}
@media(max-width:520px){.mk-account-container{width:min(100% - 32px,1160px)}.mk-account-hero{padding:75px 0 50px}.mk-account-hero h1{font-size:55px}.mk-account-content{padding-block:28px 60px}.mk-account-card{padding:22px}.mk-account-name-grid{grid-template-columns:1fr}.mk-account-card-heading{align-items:flex-start}.mk-account-card h2{font-size:30px}.mk-account-identity{gap:12px}.mk-account-avatar{width:56px;height:56px;font-size:25px}.mk-account-link{gap:11px}.mk-account-link-icon{width:40px;height:40px}}
@media(prefers-reduced-motion:reduce){.mk-account-page *{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;
