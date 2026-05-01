import { useState } from "react";
import { auth } from "@/shared/api/firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useTranslation } from '@/shared/hooks/useTranslation.js';

export function useAuthLogic() {
  const { t } = useTranslation(); 

  const [mode, setMode] = useState("login"); // "login" | "register" | "reset"
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

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
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(userCredential.user, { displayName: displayName.trim() });
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

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setSuccessMsg("");
  };

  return {
    t, mode, switchMode,
    email, setEmail,
    displayName, setDisplayName,
    password, setPassword,
    showPassword, setShowPassword,
    error, successMsg, loading,
    handleSubmit, handleGuestLogin
  };
}