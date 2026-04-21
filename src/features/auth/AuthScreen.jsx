import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../../core/firebase"; 
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useTranslation } from 'react-i18next'; // 🌍 Çeviri kancası eklendi

export default function AuthScreen({ C }) {
  const { t } = useTranslation(); 

  const [mode, setMode] = useState("login"); // "login" | "register" | "reset"
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔧 Çeviri destekli hata yakalayıcı
  const getAuthErrorMessage = (code) => {
    const messages = {
      "auth/email-already-in-use": t("err_email_in_use"),
      "auth/wrong-password": t("err_wrong_pass"),
      "auth/invalid-credential": t("err_wrong_pass"),
      "auth/user-not-found": t("err_user_not_found"),
      "auth/weak-password": t("err_weak_pass"),
      "auth/invalid-email": t("err_invalid_email"),
      "auth/too-many-requests": t("err_too_many_req"),
      "auth/network-request-failed": t("err_network"),
      "auth/operation-not-allowed": t("auth_err_guest_disabled"),
    };
    return messages[code] || t("err_default");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email) return setError(t("auth_err_empty_email"));
    if (mode !== "reset" && !password) return setError(t("auth_err_empty_pass"));
    if (mode === "register" && !displayName) return setError(t("auth_err_empty_name"));

    setLoading(true);

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } 
      else if (mode === "register") {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
        await updateProfile(userCredential.user, { 
          displayName: displayName.trim() 
        });
      } 
      else if (mode === "reset") {
        await sendPasswordResetEmail(auth, email.trim());
        setSuccessMsg(t("auth_msg_reset_success", { email: email.trim() }));
        setLoading(false);
        return;
      }
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInAnonymously(auth);
    } catch (err) {
      if (err.code === "auth/operation-not-allowed") {
        setError(t("auth_err_guest_disabled"));
      } else {
        setError(t("auth_err_guest_failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "16px 20px",
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    color: "#fff",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
  };

  const titles = {
    login: t("auth_title_login"),
    register: t("auth_title_register"),
    reset: t("auth_title_reset"),
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        position: "relative",
        overflow: "hidden",
        background: "#000",
      }}
    >
      {/* Arka Plan Efektleri */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "-10%",
          width: 350,
          height: 350,
          background: C.blue,
          borderRadius: "50%",
          filter: "blur(140px)",
          opacity: 0.4,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "-10%",
          width: 350,
          height: 350,
          background: C.green,
          borderRadius: "50%",
          filter: "blur(140px)",
          opacity: 0.3,
        }}
      />

      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "100%",
          maxWidth: 380,
          background: "rgba(20, 20, 25, 0.35)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          padding: "40px 30px",
          borderRadius: 40,
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo & Başlık */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            style={{
              width: 70,
              height: 70,
              borderRadius: 22,
              background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.0))",
              border: "1px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              margin: "0 auto 20px",
              boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
            }}
          >
            ⚡
          </motion.div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>
            Protocol
          </h1>
          <p style={{ margin: "8px 0 0 0", fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
            {titles[mode]}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Görünen İsim */}
          <AnimatePresence>
            {mode === "register" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div style={{ fontSize: 10, color: C.green, fontWeight: 800, marginBottom: 6, letterSpacing: 1 }}>
                  {t("auth_lbl_name")}
                </div>
                <input
                  type="text"
                  placeholder={t("auth_ph_name")}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.border = `1px solid ${C.green}80`)}
                  onBlur={(e) => (e.target.style.border = "1px solid rgba(255,255,255,0.08)")}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* E-posta */}
          <div>
            <div style={{ fontSize: 10, color: C.sub, fontWeight: 800, marginBottom: 6, letterSpacing: 1 }}>
              {t("auth_lbl_email")}
            </div>
            <input
              type="email"
              placeholder={t("auth_ph_email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.border = `1px solid ${C.green}80`)}
              onBlur={(e) => (e.target.style.border = "1px solid rgba(255,255,255,0.08)")}
            />
          </div>

          {/* Şifre */}
          <AnimatePresence>
            {mode !== "reset" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div style={{ fontSize: 10, color: C.sub, fontWeight: 800, marginBottom: 6, letterSpacing: 1 }}>
                  {t("auth_lbl_pass")}
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth_ph_pass")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ ...inputStyle, paddingRight: 52 }}
                    onFocus={(e) => (e.target.style.border = `1px solid ${C.green}80`)}
                    onBlur={(e) => (e.target.style.border = "1px solid rgba(255,255,255,0.08)")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    style={{
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "rgba(255,255,255,0.5)",
                      cursor: "pointer",
                      fontSize: 18,
                      padding: 0,
                    }}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hata Mesajı */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  color: "#ff453a",
                  fontSize: 13,
                  fontWeight: 600,
                  textAlign: "center",
                  padding: "10px",
                  background: "rgba(255,69,58,0.1)",
                  borderRadius: 12,
                  border: "1px solid rgba(255,69,58,0.2)",
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Başarı Mesajı */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  color: C.green,
                  fontSize: 13,
                  fontWeight: 600,
                  textAlign: "center",
                  padding: "10px",
                  background: `${C.green}18`,
                  borderRadius: 12,
                  border: `1px solid ${C.green}30`,
                }}
              >
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ana Buton */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            disabled={loading}
            style={{
              width: "100%",
              background: "#fff",
              color: "#000",
              border: "none",
              padding: 18,
              borderRadius: 20,
              fontSize: 16,
              fontWeight: 900,
              cursor: loading ? "wait" : "pointer",
              marginTop: 8,
              boxShadow: "0 10px 20px rgba(255,255,255,0.15)",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? t("auth_btn_loading")
              : mode === "login"
              ? t("auth_btn_login")
              : mode === "register"
              ? t("auth_btn_register")
              : t("auth_btn_reset")}
          </motion.button>
        </form>

        {/* Şifremi Unuttum */}
        {mode === "login" && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button
              type="button"
              onClick={() => { 
                setMode("reset"); 
                setError(""); 
                setSuccessMsg(""); 
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.5)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              {t("auth_forgot_pass")}
            </button>
          </div>
        )}

        {/* Ayraç */}
        <div style={{ display: "flex", alignItems: "center", margin: "22px 0", opacity: 0.4 }}>
          <div style={{ flex: 1, height: 1, background: "#fff" }} />
          <div style={{ padding: "0 10px", color: "#fff", fontSize: 11, fontWeight: 900, letterSpacing: 1 }}>
            {t("auth_or")}
          </div>
          <div style={{ flex: 1, height: 1, background: "#fff" }} />
        </div>

        {/* Misafir Girişi */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleGuestLogin}
          disabled={loading}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.05)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: 16,
            borderRadius: 20,
            fontSize: 14,
            fontWeight: 800,
            cursor: loading ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 20 }}>🕵️‍♂️</span> {t("auth_guest_btn")}
        </motion.button>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 8 }}>
          {t("auth_guest_desc")}
        </div>

        {/* Giriş / Kayıt geçiş butonu */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button
            type="button"
            onClick={() => { 
              setMode(mode === "login" ? "register" : "login"); 
              setError(""); 
              setSuccessMsg(""); 
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "underline",
              textUnderlineOffset: 4,
            }}
          >
            {mode === "login"
              ? t("auth_switch_to_register")
              : t("auth_switch_to_login")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}