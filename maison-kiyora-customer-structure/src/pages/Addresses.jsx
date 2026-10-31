import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, Edit3, Home, LoaderCircle,
  MapPin, Plus, ShieldCheck, Star, Trash2, X,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";

const STORAGE_PREFIX = "maison_kiyora_addresses_v1";
const EMPTY_FORM = {
  fullName: "", phone: "", addressLine1: "", addressLine2: "",
  landmark: "", city: "", state: "", pincode: "", label: "Home",
};

function storageKey(userId) {
  return `${STORAGE_PREFIX}:${userId}`;
}

function readAddresses(userId) {
  if (!userId || typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((a) => a && typeof a.id === "string") : [];
  } catch {
    return [];
  }
}

function validateAddress(form) {
  const errors = {};
  const required = ["fullName", "addressLine1", "city", "state", "pincode", "phone"];
  for (const field of required) {
    if (!form[field].trim()) errors[field] = "This field is required.";
  }
  if (form.fullName.trim() && form.fullName.trim().length < 2) {
    errors.fullName = "Please enter your full name.";
  }
  if (form.phone.trim() && !/^[6-9]\d{9}$/.test(form.phone.trim())) {
    errors.phone = "Enter a valid 10-digit Indian mobile number.";
  }
  if (form.pincode.trim() && !/^[1-9]\d{5}$/.test(form.pincode.trim())) {
    errors.pincode = "Enter a valid 6-digit Indian PIN code.";
  }
  if (form.addressLine1.trim() && form.addressLine1.trim().length < 5) {
    errors.addressLine1 = "Enter a more complete street address.";
  }
  for (const key of Object.keys(form)) {
    if (typeof form[key] === "string" && form[key].length > 180) {
      errors[key] = "Please use 180 characters or fewer.";
    }
  }
  return errors;
}

function AddressField({ label, name, value, onChange, error, required = false, placeholder, inputMode, autoComplete }) {
  const id = `mk-address-${name}`;
  return (
    <div className="mk-address-field">
      <label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      <input
        id={id} name={name} value={value} onChange={onChange}
        placeholder={placeholder} inputMode={inputMode}
        autoComplete={autoComplete} maxLength={180}
        aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && <small id={`${id}-error`} role="alert">{error}</small>}
    </div>
  );
}

export default function Addresses() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const userId = user?.id || null;
  const [addresses, setAddresses] = useState([]);
  const [loadedFor, setLoadedFor] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [storageError, setStorageError] = useState("");

  useEffect(() => { document.title = "Saved Addresses | Maison Kiyora"; }, []);

  useEffect(() => {
    setAddresses(readAddresses(userId));
    setLoadedFor(userId);
    setStorageError("");
    setIsFormOpen(false);
    setEditingId(null);
    setDeleteId(null);
  }, [userId]);

  const canWrite = Boolean(isAuthenticated && userId && loadedFor === userId);
  const defaultAddress = useMemo(() => addresses.find((a) => a.isDefault), [addresses]);

  const persist = (next) => {
    if (!canWrite) return false;
    try {
      window.localStorage.setItem(storageKey(userId), JSON.stringify(next));
      setAddresses(next);
      setStorageError("");
      return true;
    } catch {
      setStorageError("Unable to save addresses in this browser. Check storage settings.");
      toast.error("Unable to save addresses in this browser. Check storage settings.");
      return false;
    }
  };

  const openNew = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, fullName: user?.fullName || "", phone: user?.phone || "" });
    setErrors({});
    setDeleteId(null);
    setIsFormOpen(true);
  };

  const openEdit = (address) => {
    setEditingId(address.id);
    setForm(Object.fromEntries(Object.keys(EMPTY_FORM).map((key) => [key, address[key] ?? (key === "label" ? "Home" : "")])));
    setErrors({});
    setDeleteId(null);
    setIsFormOpen(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === "pincode" || name === "phone" ? value.replace(/\D/g, "") : value;
    setForm((previous) => ({ ...previous, [name]: nextValue }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    if (!canWrite) return;
    const nextErrors = validateAddress(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const clean = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]));
    const now = new Date().toISOString();
    let next;
    if (editingId) {
      if (!addresses.some((a) => a.id === editingId)) {
        toast.error("This address is no longer available.");
        return;
      }
      next = addresses.map((a) => a.id === editingId ? { ...a, ...clean, updatedAt: now } : a);
    } else {
      const id = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      next = [...addresses, { ...clean, id, isDefault: addresses.length === 0, createdAt: now, updatedAt: now }];
    }
    if (persist(next)) {
      toast.success(editingId ? "Address updated." : "Address saved.");
      setIsFormOpen(false);
      setEditingId(null);
    }
  };

  const setDefault = (id) => {
    if (!canWrite || !addresses.some((a) => a.id === id)) return;
    if (persist(addresses.map((a) => ({ ...a, isDefault: a.id === id })))) {
      toast.success("Default delivery address updated.");
    }
  };

  const removeAddress = (id) => {
    if (!canWrite || !addresses.some((a) => a.id === id)) return;
    const remaining = addresses.filter((a) => a.id !== id);
    const removed = addresses.find((a) => a.id === id);
    const next = removed?.isDefault && remaining.length
      ? remaining.map((a, index) => ({ ...a, isDefault: index === 0 }))
      : remaining;
    if (persist(next)) {
      toast.success("Address removed.");
      setDeleteId(null);
    }
  };

  if (isLoading || !isAuthenticated || !canWrite) {
    return (
      <div className="mk-address-loading" aria-busy="true">
        <LoaderCircle size={25} className="mk-address-spin" />
        <p>Preparing your account...</p>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="mk-address-page">
      <style>{styles}</style>
      <div className="mk-address-shell">
        <Link to="/account" className="mk-address-back"><ArrowLeft size={16} /> MY ACCOUNT</Link>
        <header className="mk-address-header">
          <div>
            <span className="mk-address-eyebrow">YOUR PERSONAL SPACE</span>
            <h1>Saved <em>addresses.</em></h1>
            <p>Keep your delivery details beautifully organised.</p>
          </div>
          <button type="button" className="mk-address-primary" onClick={openNew}>
            <Plus size={17} /> Add New Address
          </button>
        </header>

        <div className="mk-address-info"><ShieldCheck size={17} /> Addresses are currently saved only in this browser, not synced across devices.</div>
        {storageError && <p className="mk-address-storage-error" role="alert">{storageError}</p>}

        {addresses.length === 0 ? (
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mk-address-empty">
            <div className="mk-address-empty-icon"><MapPin size={29} strokeWidth={1.3} /></div>
            <span className="mk-address-eyebrow">DELIVERY DETAILS</span>
            <h2>A place to <em>begin.</em></h2>
            <p>No addresses saved yet. Add your first delivery address for a smoother checkout experience.</p>
            <button type="button" className="mk-address-primary" onClick={openNew}><Plus size={16} /> Add Your First Address</button>
          </motion.section>
        ) : (
          <div className="mk-address-grid">
            {addresses.map((address) => (
              <motion.article key={address.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mk-address-card ${address.isDefault ? "is-default" : ""}`}>
                <div className="mk-address-card-top">
                  <div className="mk-address-label"><Home size={17} /> {address.label || "Address"}</div>
                  {address.isDefault && <span className="mk-address-default"><Star size={12} fill="currentColor" /> DEFAULT</span>}
                </div>
                <h3>{address.fullName}</h3>
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                {address.landmark && <p>Near {address.landmark}</p>}
                <p>{address.city}, {address.state} — {address.pincode}</p>
                <p className="mk-address-phone">+91 {address.phone}</p>
                <div className="mk-address-actions">
                  <button type="button" onClick={() => openEdit(address)}><Edit3 size={15} /> Edit</button>
                  {!address.isDefault && <button type="button" onClick={() => setDefault(address.id)}><Check size={15} /> Set Default</button>}
                  <button type="button" className="mk-address-danger" onClick={() => setDeleteId(address.id)}><Trash2 size={15} /> Remove</button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
        {defaultAddress && <p className="mk-address-footnote">Your default address is marked above. Checkout integration will be added separately.</p>}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div className="mk-address-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setIsFormOpen(false); }}>
            <motion.section role="dialog" aria-modal="true" aria-labelledby="mk-address-form-title" className="mk-address-modal" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <div className="mk-address-modal-header">
                <div><span className="mk-address-eyebrow">DELIVERY DETAILS</span><h2 id="mk-address-form-title">{editingId ? "Edit" : "Add"} <em>address.</em></h2></div>
                <button type="button" aria-label="Close address form" className="mk-address-icon-button" onClick={() => setIsFormOpen(false)}><X size={21} /></button>
              </div>
              <form onSubmit={handleSave} noValidate>
                <div className="mk-address-form-grid">
                  <AddressField label="Full name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} required autoComplete="name" placeholder="Recipient's full name" />
                  <AddressField label="Mobile number" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} required inputMode="numeric" autoComplete="tel-national" placeholder="10-digit mobile number" />
                  <div className="mk-address-wide"><AddressField label="House / Flat / Building / Street" name="addressLine1" value={form.addressLine1} onChange={handleChange} error={errors.addressLine1} required autoComplete="address-line1" placeholder="House number, building and street" /></div>
                  <div className="mk-address-wide"><AddressField label="Area / Locality (optional)" name="addressLine2" value={form.addressLine2} onChange={handleChange} error={errors.addressLine2} autoComplete="address-line2" placeholder="Area or locality" /></div>
                  <AddressField label="Landmark (optional)" name="landmark" value={form.landmark} onChange={handleChange} error={errors.landmark} placeholder="Nearby landmark" />
                  <AddressField label="PIN code" name="pincode" value={form.pincode} onChange={handleChange} error={errors.pincode} required inputMode="numeric" autoComplete="postal-code" placeholder="6-digit PIN code" />
                  <AddressField label="City" name="city" value={form.city} onChange={handleChange} error={errors.city} required autoComplete="address-level2" placeholder="City" />
                  <AddressField label="State" name="state" value={form.state} onChange={handleChange} error={errors.state} required autoComplete="address-level1" placeholder="State" />
                </div>
                <div className="mk-address-field mk-address-type"><label htmlFor="mk-address-label">Address type</label><select id="mk-address-label" name="label" value={form.label} onChange={handleChange}><option value="Home">Home</option><option value="Work">Work</option><option value="Other">Other</option></select></div>
                <div className="mk-address-modal-actions"><button type="button" className="mk-address-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button><button type="submit" className="mk-address-primary">{editingId ? "Save Changes" : "Save Address"}<ArrowRight size={16} /></button></div>
              </form>
            </motion.section>
          </motion.div>
        )}
        {deleteId && (
          <motion.div className="mk-address-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.section className="mk-address-confirm" role="alertdialog" aria-modal="true" aria-labelledby="mk-address-delete-title" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .97 }}>
              <div className="mk-address-empty-icon"><Trash2 size={24} /></div>
              <h2 id="mk-address-delete-title">Remove address?</h2>
              <p>This address will be removed from this browser.</p>
              <div className="mk-address-modal-actions"><button type="button" className="mk-address-secondary" onClick={() => setDeleteId(null)}>Keep Address</button><button type="button" className="mk-address-primary" onClick={() => removeAddress(deleteId)}>Remove</button></div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = `
.mk-address-page{--navy:#1D2940;--gold:#B69A69;--ivory:#F5F0E8;min-height:80vh;background:var(--ivory);color:var(--navy);font-family:"Manrope",sans-serif;padding:clamp(100px,12vw,160px) 22px 90px}
.mk-address-page *{box-sizing:border-box}
.mk-address-shell{max-width:1120px;margin:auto}
.mk-address-back{display:inline-flex;align-items:center;gap:10px;color:#927d61;text-decoration:none;font-size:10px;letter-spacing:.15em;font-weight:700;margin-bottom:35px}
.mk-address-header{display:flex;justify-content:space-between;align-items:end;gap:25px;margin-bottom:28px}
.mk-address-eyebrow{display:block;font-size:10px;letter-spacing:.22em;font-weight:700;color:#9d8057}
.mk-address-header h1,.mk-address-empty h2,.mk-address-modal h2{font-family:"Cormorant Garamond",Georgia,serif;font-weight:400;letter-spacing:-.045em;line-height:1;margin:12px 0;font-size:clamp(49px,7vw,84px)}
.mk-address-header h1 em,.mk-address-empty h2 em,.mk-address-modal h2 em{color:var(--gold);font-weight:300}
.mk-address-header p,.mk-address-empty p{font-size:12px;color:#777a80;line-height:1.9;margin:0}
.mk-address-primary{display:inline-flex;justify-content:center;align-items:center;gap:11px;min-height:48px;padding:0 22px;background:var(--navy);color:white;border:1px solid var(--navy);font:600 11px "Manrope",sans-serif;cursor:pointer;white-space:nowrap;transition:background .2s}
.mk-address-primary:hover{background:#30405a}
.mk-address-info{display:flex;align-items:center;gap:10px;background:#ece5d9;color:#6d6357;padding:14px 16px;font-size:11px;line-height:1.7;margin-bottom:26px}
.mk-address-info svg{flex-shrink:0;color:#967a51}
.mk-address-storage-error{color:#a4544e;font-size:12px;margin:0 0 20px}
.mk-address-empty{text-align:center;padding:85px 25px;border:1px solid #ddd1bf;background:rgba(255,255,255,.3)}
.mk-address-empty-icon{display:grid;place-items:center;width:66px;height:66px;border:1px solid #d5c5ad;border-radius:50%;margin:0 auto 24px;color:#a58c68}
.mk-address-empty h2{font-size:clamp(46px,6vw,70px)}
.mk-address-empty p{max-width:420px;margin:0 auto 27px}
.mk-address-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
.mk-address-card{display:flex;flex-direction:column;padding:27px;background:rgba(255,255,255,.45);border:1px solid #ddd5ca;min-height:270px}
.mk-address-card.is-default{border-color:#b69a69}
.mk-address-card-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:23px}
.mk-address-label{display:flex;align-items:center;gap:9px;font-size:12px;font-weight:700}
.mk-address-default{display:inline-flex;align-items:center;gap:6px;font-size:9px;letter-spacing:.1em;color:#95764c;background:#f1e6d4;padding:8px 9px}
.mk-address-card h3{font-size:14px;margin:0 0 13px}
.mk-address-card p{margin:0 0 6px;color:#777a80;font-size:12px;line-height:1.7;overflow-wrap:anywhere}
.mk-address-card .mk-address-phone{margin-top:8px;color:#1D2940;font-weight:600}
.mk-address-actions{display:flex;flex-wrap:wrap;gap:15px;border-top:1px solid #e4dacf;margin-top:auto;padding-top:22px;padding-bottom:0}
.mk-address-actions button{display:inline-flex;align-items:center;gap:7px;background:none;border:0;color:#786748;font:600 11px "Manrope",sans-serif;cursor:pointer;padding:3px 0}
.mk-address-actions button:hover{text-decoration:underline}
.mk-address-actions .mk-address-danger{color:#a4544e}
.mk-address-footnote{font-size:11px;color:#777a80;margin-top:24px}
.mk-address-overlay{position:fixed;inset:0;z-index:1200;background:rgba(17,25,40,.65);display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto}
.mk-address-modal{width:100%;max-width:660px;max-height:min(92vh,920px);overflow:auto;background:#F5F0E8;padding:clamp(22px,4vw,42px);box-shadow:0 20px 80px rgba(0,0,0,.2)}
.mk-address-modal-header{display:flex;align-items:start;justify-content:space-between;gap:15px;margin-bottom:25px}
.mk-address-modal h2{font-size:49px;margin-bottom:0}
.mk-address-icon-button{display:grid;place-items:center;width:35px;height:35px;border:1px solid #ddd1bf;background:transparent;cursor:pointer;color:#1D2940}
.mk-address-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px}
.mk-address-wide{grid-column:1/-1}
.mk-address-field label{display:block;margin-bottom:9px;font-size:11px;font-weight:650}
.mk-address-field label span{color:#a4544e}
.mk-address-field input,.mk-address-field select{display:block;width:100%;height:47px;padding:0 13px;border:1px solid #d8cfc3;background:rgba(255,255,255,.6);outline:0;color:#1D2940;font:12px "Manrope",sans-serif;border-radius:0}
.mk-address-field input:focus,.mk-address-field select:focus{border-color:#B69A69;box-shadow:0 0 0 3px rgba(182,154,105,.1)}
.mk-address-field input[aria-invalid="true"]{border-color:#a4544e}
.mk-address-field small{display:block;color:#a4544e;margin-top:6px;font-size:10px;line-height:1.5}
.mk-address-type{margin-top:18px;max-width:240px}
.mk-address-modal-actions{display:flex;justify-content:flex-end;gap:12px;margin-top:28px}
.mk-address-secondary{min-height:48px;padding:0 20px;border:1px solid #c9bba7;background:transparent;color:#1D2940;font:600 11px "Manrope",sans-serif;cursor:pointer}
.mk-address-confirm{width:100%;max-width:420px;background:#F5F0E8;padding:40px;text-align:center}
.mk-address-confirm h2{font:400 43px "Cormorant Garamond",Georgia,serif;margin:0 0 10px}
.mk-address-confirm p{font-size:12px;color:#777a80;line-height:1.8}
.mk-address-confirm .mk-address-modal-actions{justify-content:center}
.mk-address-loading{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:15px;min-height:70vh;background:#F5F0E8;color:#1D2940;font:12px "Manrope",sans-serif}
.mk-address-spin{animation:mk-address-spin .8s linear infinite}
@keyframes mk-address-spin{to{transform:rotate(360deg)}}
@media(max-width:750px){.mk-address-header{align-items:start;flex-direction:column}.mk-address-grid{grid-template-columns:1fr}.mk-address-page{padding-top:110px}}
@media(max-width:500px){.mk-address-form-grid{grid-template-columns:1fr}.mk-address-wide{grid-column:auto}.mk-address-modal-actions{flex-direction:column-reverse}.mk-address-modal-actions button{width:100%}.mk-address-card{padding:22px}.mk-address-modal{max-height:94vh}.mk-address-confirm{padding:25px}}
@media(prefers-reduced-motion:reduce){.mk-address-page *{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;
