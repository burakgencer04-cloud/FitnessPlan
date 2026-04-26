import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthLogic } from "../hooks/useAuthLogic.js";
import { AuthBackground, AuthHeader, AuthMessages, AuthInput } from "./AuthUI.jsx";

export default function AuthScreen({ C }) {
  // 🔥 BÜTÜN MANTIK HOOK'TAN GELİYOR
  const { 
    t, mode, switchMode, 
    email, setEmail, displayName, setDisplayName, password, setPassword, 
    showPassword, setShowPassword, error, successMsg, loading, 
    handleSubmit, handleGuestLogin 
  } = useAuthLogic();

  const titles = {
    login: t("auth_title_login"),
    register: t("auth_title_register"),
    reset: t("auth_title_reset"),
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", overflow: "hidden", background: "#000" }}>
      <AuthBackground C={C} />

      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "100%", maxWidth: 380, background: "rgba(20, 20, 25, 0.35)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", padding: "40px 30px", borderRadius: 40, border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)", position: "relative", zIndex: 1 }}
      >
        <AuthHeader title={titles[mode]} />

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
          
          <AnimatePresence>
            {mode === "register" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <AuthInput label={t("auth_lbl_name")} type="text" placeholder={t("auth_ph_name")} value={displayName} onChange={(e) => setDisplayName(e.target.value)} C={C} />
              </motion.div>
            )}
          </AnimatePresence>

          <AuthInput label={t("auth_lbl_email")} type="email" placeholder={t("auth_ph_email")} value={email} onChange={(e) => setEmail(e.target.value)} C={C} />

          <AnimatePresence>
            {mode !== "reset" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <AuthInput 
                  label={t("auth_lbl_pass")} type={showPassword ? "text" : "password"} placeholder={t("auth_ph_pass")} 
                  value={password} onChange={(e) => setPassword(e.target.value)} C={C} 
                  icon={showPassword ? "🙈" : "👁️"} onIconClick={() => setShowPassword(!showPassword)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AuthMessages error={error} successMsg={successMsg} C={C} />

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} disabled={loading}
            style={{ width: "100%", background: "#fff", color: "#000", border: "none", padding: 18, borderRadius: 20, fontSize: 16, fontWeight: 900, cursor: loading ? "wait" : "pointer", marginTop: 8, boxShadow: "0 10px 20px rgba(255,255,255,0.15)", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? t("auth_btn_loading") : mode === "login" ? t("auth_btn_login") : mode === "register" ? t("auth_btn_register") : t("auth_btn_reset")}
          </motion.button>
        </form>

        {mode === "login" && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button type="button" onClick={() => switchMode("reset")} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
              {t("auth_forgot_pass")}
            </button>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", margin: "22px 0", opacity: 0.4 }}>
          <div style={{ flex: 1, height: 1, background: "#fff" }} />
          <div style={{ padding: "0 10px", color: "#fff", fontSize: 11, fontWeight: 900, letterSpacing: 1 }}>{t("auth_or")}</div>
          <div style={{ flex: 1, height: 1, background: "#fff" }} />
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }} onClick={handleGuestLogin} disabled={loading}
          style={{ width: "100%", background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", padding: 16, borderRadius: 20, fontSize: 14, fontWeight: 800, cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
        >
          <span style={{ fontSize: 20 }}>🕵️‍♂️</span> {t("auth_guest_btn")}
        </motion.button>
        
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 8 }}>{t("auth_guest_desc")}</div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button
            type="button" onClick={() => switchMode(mode === "login" ? "register" : "login")}
            style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 4 }}
          >
            {mode === "login" ? t("auth_switch_to_register") : t("auth_switch_to_login")}
          </button>
        </div>

      </motion.div>
    </div>
  );
}