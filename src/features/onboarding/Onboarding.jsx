import React, { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next'; // 🌍 ÇEVİRİ KANCASI

const fonts = {
  header: "'Comucan', system-ui, sans-serif",
  body: "'Comucan', system-ui, sans-serif",
  mono: "monospace"
};

export const defaultForm = { 
  age: 25, gender: "erkek", height: 180, weight: 80, 
  activity: "orta", goal: "kilo_ver", mealsPerDay: 4,
  experience: "baslangic", trainDays: 3 
};

export default function Onboarding({ onDone, theme, existingUser }) {
  const { t } = useTranslation(); // 🌍 ÇEVİRİ FONKSİYONU
  
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
          {step === 1 && t('onb_title_1')}
          {step === 2 && t('onb_title_2')}
          {step === 3 && t('onb_title_3')}
        </h2>
        
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>{t('onb_lbl_gender')}</label>
                  <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} style={inputStyle}>
                    <option value="erkek">{t('onb_opt_male')}</option>
                    <option value="kadin">{t('onb_opt_female')}</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{t('onb_lbl_age')}</label>
                  <input type="number" value={form.age} onChange={e => setForm({...form, age: Number(e.target.value)})} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
                <div>
                  <label style={labelStyle}>{t('onb_lbl_height')}</label>
                  <input type="number" value={form.height} onChange={e => setForm({...form, height: Number(e.target.value)})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('onb_lbl_weight')}</label>
                  <input type="number" value={form.weight} onChange={e => setForm({...form, weight: Number(e.target.value)})} style={inputStyle} />
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={nextStep} style={{ width: "100%", padding: "18px", borderRadius: "18px", background: theme.text, color: theme.bg, fontWeight: 900, fontSize: 16, border: "none", cursor: "pointer", fontFamily: fonts.header }}>
                {t('onb_btn_next')}
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 32 }}>
                <div>
                  <label style={labelStyle}>{t('onb_lbl_activity')}</label>
                  <select value={form.activity} onChange={e => setForm({...form, activity: e.target.value})} style={inputStyle}>
                    <option value="sedanter">{t('onb_act_sedentary')}</option>
                    <option value="orta">{t('onb_act_light')}</option>
                    <option value="aktif">{t('onb_act_active')}</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{t('onb_lbl_goal')}</label>
                  <select value={form.goal} onChange={e => setForm({...form, goal: e.target.value})} style={inputStyle}>
                    <option value="kilo_ver">{t('onb_goal_lose')}</option>
                    <option value="koru">{t('onb_goal_maintain')}</option>
                    <option value="kilo_al">{t('onb_goal_gain')}</option>
                    <option value="agresif_bulk">{t('onb_goal_aggressive')}</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{t('onb_lbl_meals')}</label>
                  <select value={form.mealsPerDay} onChange={e => setForm({...form, mealsPerDay: Number(e.target.value)})} style={inputStyle}>
                    <option value={2}>{t('onb_meal_2')}</option>
                    <option value={3}>{t('onb_meal_3')}</option>
                    <option value={4}>{t('onb_meal_4')}</option>
                    <option value={5}>{t('onb_meal_5')}</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={prevStep} style={{ flex: 1, padding: "18px", borderRadius: "18px", background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, fontWeight: 900, cursor: "pointer", fontFamily: fonts.header }}>{t('onb_btn_back')}</button>
                <button onClick={nextStep} style={{ flex: 2, padding: "18px", borderRadius: "18px", background: theme.text, color: theme.bg, border: "none", fontWeight: 900, cursor: "pointer", fontFamily: fonts.header }}>{t('onb_btn_next')}</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 32 }}>
                <div>
                  <label style={labelStyle}>{t('onb_lbl_exp')}</label>
                  <select value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} style={inputStyle}>
                    <option value="baslangic">{t('onb_exp_beg')}</option>
                    <option value="orta">{t('onb_exp_int')}</option>
                    <option value="ileri">{t('onb_exp_adv')}</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{t('onb_lbl_train_days')}</label>
                  <select value={form.trainDays} onChange={e => setForm({...form, trainDays: Number(e.target.value)})} style={inputStyle}>
                    <option value={3}>{t('onb_freq_3')}</option>
                    <option value={4}>{t('onb_freq_4')}</option>
                    <option value={5}>{t('onb_freq_5')}</option>
                    <option value={6}>{t('onb_freq_6')}</option>
                  </select>
                </div>
                
                <div style={{ background: `${theme.green}15`, border: `1px solid ${theme.green}40`, padding: 16, borderRadius: 16, marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: theme.green, fontWeight: 800 }}>{t('onb_info_title')}</span>
                  <p style={{ fontSize: 12, color: theme.text, margin: "8px 0 0 0", lineHeight: 1.4 }}>
                    {t('onb_info_desc')}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={prevStep} style={{ flex: 1, padding: "18px", borderRadius: "18px", background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, fontWeight: 900, cursor: "pointer", fontFamily: fonts.header }}>{t('onb_btn_back')}</button>
                <motion.button 
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => onDone(form)} 
                  style={{ flex: 2, padding: "18px", borderRadius: "18px", background: `linear-gradient(135deg, ${theme.green}, ${theme.blue})`, color: "#fff", fontWeight: 900, fontSize: 16, border: "none", cursor: "pointer", boxShadow: `0 12px 30px ${theme.green}40`, fontFamily: fonts.header, letterSpacing: 1 }}
                >
                  {existingUser ? t('onb_btn_update') : t('onb_btn_create')}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}