import React, { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';

const fonts = {
  header: "'Comucan', system-ui, sans-serif",
  body: "'Comucan', system-ui, sans-serif",
  mono: "monospace"
};

// Varsayılan Kullanıcı Şablonunu dışarı aktarıyoruz ki FitnessPlan da kullanabilsin
export const defaultForm = { 
  age: 25, gender: "erkek", height: 180, weight: 80, 
  activity: "orta", goal: "kilo_ver", mealsPerDay: 4,
  experience: "baslangic", trainDays: 3 
};

export default function Onboarding({ onDone, theme, existingUser }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(existingUser ? { ...defaultForm, ...existingUser } : defaultForm);

  const inputStyle = {
    width: "100%", padding: "16px 20px", borderRadius: "16px",
    border: `2px solid transparent`, background: theme.bg,
    color: theme.text, fontSize: 16, fontWeight: 600,
    fontFamily: fonts.body, outline: "none", transition: "0.3s ease",
    boxShadow: `inset 0 2px 4px rgba(0,0,0,0.05)`
  };

  const labelStyle = {
    fontSize: 12, color: theme.sub, fontWeight: 800, 
    letterSpacing: 1, marginBottom: 8, display: "block",
    fontFamily: fonts.header
  };

  const nextStep = () => setStep(s => Math.min(3, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: fonts.body }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ background: theme.card, padding: 40, borderRadius: 32, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", top: -50, left: -50, width: 200, height: 200, background: theme.green, filter: "blur(100px)", opacity: 0.15, borderRadius: "50%", pointerEvents: "none" }} />
        
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 6, flex: 1, borderRadius: 3, background: step >= i ? theme.green : theme.border, transition: "0.3s" }} />
          ))}
        </div>

        <h2 style={{ textAlign: "center", margin: "0 0 32px 0", fontSize: 28, fontWeight: 900, color: theme.text, letterSpacing: "-1px", fontFamily: fonts.header, fontStyle: "italic" }}>
          {step === 1 && "Fiziksel Özelliklerin"}
          {step === 2 && "Beslenme & Yaşam Tarzın"}
          {step === 3 && "Antrenman Profilin"}
        </h2>
        
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>CİNSİYET</label>
                  <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} style={inputStyle}>
                    <option value="erkek">Erkek</option>
                    <option value="kadin">Kadın</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>YAŞ</label>
                  <input type="number" value={form.age} onChange={e => setForm({...form, age: Number(e.target.value)})} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
                <div>
                  <label style={labelStyle}>BOY (CM)</label>
                  <input type="number" value={form.height} onChange={e => setForm({...form, height: Number(e.target.value)})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>KİLO (KG)</label>
                  <input type="number" value={form.weight} onChange={e => setForm({...form, weight: Number(e.target.value)})} style={inputStyle} />
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={nextStep} style={{ width: "100%", padding: "18px", borderRadius: "18px", background: theme.text, color: theme.bg, fontWeight: 900, fontSize: 16, border: "none", cursor: "pointer", fontFamily: fonts.header }}>
                Devam Et →
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 32 }}>
                <div>
                  <label style={labelStyle}>GÜNLÜK AKTİVİTE</label>
                  <select value={form.activity} onChange={e => setForm({...form, activity: e.target.value})} style={inputStyle}>
                    <option value="sedanter">Masa Başı (Hareketsiz)</option>
                    <option value="orta">Hafif Hareketli</option>
                    <option value="aktif">Çok Aktif / Sporcu</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>ANA HEDEFİN</label>
                  <select value={form.goal} onChange={e => setForm({...form, goal: e.target.value})} style={inputStyle}>
                    <option value="kilo_ver">Kilo Ver / Yağ Yak</option>
                    <option value="koru">Formu Koru / Recomp</option>
                    <option value="kilo_al">Kas Kütlesi Ekle (Bulk)</option>
                    <option value="agresif_bulk">Agresif Kilo Alımı</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>GÜNDE KAÇ ÖĞÜN YERSİN?</label>
                  <select value={form.mealsPerDay} onChange={e => setForm({...form, mealsPerDay: Number(e.target.value)})} style={inputStyle}>
                    <option value={2}>2 Öğün (Aralıklı Oruç)</option>
                    <option value={3}>3 Öğün (Klasik)</option>
                    <option value={4}>4 Öğün (Ara Öğünlü)</option>
                    <option value={5}>5 Öğün (Sık Beslenme)</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={prevStep} style={{ flex: 1, padding: "18px", borderRadius: "18px", background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, fontWeight: 900, cursor: "pointer", fontFamily: fonts.header }}>← Geri</button>
                <button onClick={nextStep} style={{ flex: 2, padding: "18px", borderRadius: "18px", background: theme.text, color: theme.bg, border: "none", fontWeight: 900, cursor: "pointer", fontFamily: fonts.header }}>Devam Et →</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 32 }}>
                <div>
                  <label style={labelStyle}>SPOR GEÇMİŞİN</label>
                  <select value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} style={inputStyle}>
                    <option value="baslangic">Yeni Başlıyorum (0-6 Ay)</option>
                    <option value="orta">Orta Seviye (6 Ay - 2 Yıl)</option>
                    <option value="ileri">İleri Seviye (2 Yıl+)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>HAFTADA KAÇ GÜN ANTRENMAN YAPABİLİRSİN?</label>
                  <select value={form.trainDays} onChange={e => setForm({...form, trainDays: Number(e.target.value)})} style={inputStyle}>
                    <option value={3}>Haftada 3 Gün</option>
                    <option value={4}>Haftada 4 Gün</option>
                    <option value={5}>Haftada 5 Gün</option>
                    <option value={6}>Haftada 6 Gün</option>
                  </select>
                </div>
                
                <div style={{ background: `${theme.green}15`, border: `1px solid ${theme.green}40`, padding: 16, borderRadius: 16, marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: theme.green, fontWeight: 800 }}>💡 BİLGİ:</span>
                  <p style={{ fontSize: 12, color: theme.text, margin: "8px 0 0 0", lineHeight: 1.4 }}>
                    Verdiğin cevaplara göre sana en uygun antrenman ve beslenme programı otomatik olarak güncellenecek.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={prevStep} style={{ flex: 1, padding: "18px", borderRadius: "18px", background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, fontWeight: 900, cursor: "pointer", fontFamily: fonts.header }}>← Geri</button>
                <motion.button 
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => onDone(form)} 
                  style={{ flex: 2, padding: "18px", borderRadius: "18px", background: `linear-gradient(135deg, ${theme.green}, ${theme.blue})`, color: "#fff", fontWeight: 900, fontSize: 16, border: "none", cursor: "pointer", boxShadow: `0 12px 30px ${theme.green}40`, fontFamily: fonts.header, letterSpacing: 1 }}
                >
                  {existingUser ? "PROFİLİ GÜNCELLE" : "PLANIMI OLUŞTUR 🚀"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}