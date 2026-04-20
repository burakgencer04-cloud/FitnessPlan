import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../../core/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function AuthScreen({ C }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Lütfen tüm alanları doldurun.');
    setLoading(true); setError('');
    try {
      if (isLogin) await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('Bu e-posta zaten kayıtlı.');
      else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') setError('E-posta veya şifre hatalı.');
      else if (err.code === 'auth/weak-password') setError('Şifre en az 6 haneli olmalıdır.');
      else setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden', background: '#000' }}>
      
      {/* 🌟 iPhone Style Blurred Orbs Background */}
      <div style={{ position: 'absolute', top: '10%', left: '-10%', width: 350, height: 350, background: C.blue, borderRadius: '50%', filter: 'blur(140px)', opacity: 0.45 }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '-10%', width: 350, height: 350, background: C.green, borderRadius: '50%', filter: 'blur(140px)', opacity: 0.35 }} />

      {/* 🧊 Frosted Glass Container (Cam Efekti) */}
      <motion.div 
        initial={{ y: 30, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: 380, background: 'rgba(20, 20, 25, 0.35)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', padding: '40px 30px', borderRadius: 40, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)', position: 'relative', zIndex: 1 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} style={{ width: 70, height: 70, borderRadius: 22, background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.0))', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
            ⚡
          </motion.div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>Protocol</h1>
          <p style={{ margin: '8px 0 0 0', fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Hesabınıza giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="email" placeholder="E-posta Adresi" value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '18px 20px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, color: '#fff', fontSize: 15, outline: 'none', transition: 'all 0.3s', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.border = `1px solid ${C.green}80`}
              onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.05)'}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <input 
              type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '18px 20px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, color: '#fff', fontSize: 15, outline: 'none', transition: 'all 0.3s', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.border = `1px solid ${C.green}80`}
              onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.05)'}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ color: '#ff453a', fontSize: 13, fontWeight: 600, textAlign: 'center', padding: '0 10px' }}>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} disabled={loading}
            style={{ width: '100%', background: '#fff', color: '#000', border: 'none', padding: 18, borderRadius: 20, fontSize: 16, fontWeight: 800, cursor: loading ? 'wait' : 'pointer', marginTop: 10, boxShadow: '0 10px 20px rgba(255,255,255,0.15)', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Bekleniyor..." : (isLogin ? "Giriş Yap" : "Kayıt Ol")}
          </motion.button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button 
            type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: '0.2s' }}
            onMouseOver={(e) => e.target.style.color = '#fff'}
            onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
          >
            {isLogin ? "Hesabınız yok mu? Yeni kayıt olun" : "Zaten hesabınız var mı? Giriş yapın"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}