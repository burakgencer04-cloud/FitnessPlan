import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const AuthBackground = ({ C }) => (
  <>
    <div style={{ position: "absolute", top: "10%", left: "-10%", width: 350, height: 350, background: C.blue, borderRadius: "50%", filter: "blur(140px)", opacity: 0.4 }} />
    <div style={{ position: "absolute", bottom: "10%", right: "-10%", width: 350, height: 350, background: C.green, borderRadius: "50%", filter: "blur(140px)", opacity: 0.3 }} />
  </>
);

export const AuthHeader = ({ title }) => (
  <div style={{ textAlign: "center", marginBottom: 36 }}>
    <motion.div
      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
      style={{ width: 70, height: 70, borderRadius: 22, background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.0))", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px", boxShadow: "0 10px 20px rgba(0,0,0,0.3)" }}
    >
      ⚡
    </motion.div>
    <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>Protocol</h1>
    <p style={{ margin: "8px 0 0 0", fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{title}</p>
  </div>
);

export const AuthMessages = ({ error, successMsg, C }) => (
  <>
    <AnimatePresence>
      {error && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ color: "#ff453a", fontSize: 13, fontWeight: 600, textAlign: "center", padding: "10px", background: "rgba(255,69,58,0.1)", borderRadius: 12, border: "1px solid rgba(255,69,58,0.2)", marginBottom: 14 }}>
          {error}
        </motion.div>
      )}
    </AnimatePresence>
    <AnimatePresence>
      {successMsg && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ color: C.green, fontSize: 13, fontWeight: 600, textAlign: "center", padding: "10px", background: `${C.green}18`, borderRadius: 12, border: `1px solid ${C.green}30`, marginBottom: 14 }}>
          {successMsg}
        </motion.div>
      )}
    </AnimatePresence>
  </>
);

export const AuthInput = ({ label, type, placeholder, value, onChange, C, icon, onIconClick }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 10, color: C.sub, fontWeight: 800, marginBottom: 6, letterSpacing: 1 }}>{label}</div>
    <div style={{ position: "relative" }}>
      <input
        type={type} placeholder={placeholder} value={value} onChange={onChange}
        style={{ width: "100%", padding: "16px 20px", paddingRight: icon ? 52 : 20, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", transition: "0.2s" }}
        onFocus={(e) => (e.target.style.border = `1px solid ${C.green}80`)}
        onBlur={(e) => (e.target.style.border = "1px solid rgba(255,255,255,0.08)")}
      />
      {icon && (
        <button type="button" onClick={onIconClick} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 18, padding: 0 }}>
          {icon}
        </button>
      )}
    </div>
  </div>
);