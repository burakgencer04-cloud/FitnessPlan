import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next'; // 🌍 ÇEVİRİ HOOK'U EKLENDİ

// --- DÜZELTİLMİŞ YOLLAR ---
import { useAppStore } from '@/app/store';
import { generatePersonalizedPlan } from '@/features/user/onboarding/utils/generatorEngine';
import { generateMealPlan } from '@/features/fitness/nutrition/utils/nutritionUtils';
// --------------------------

const fonts = {
  header: "'Comucan', system-ui, sans-serif",
  body: "'Comucan', system-ui, sans-serif",
  mono: "monospace"
};

// 🌟 APPLE AYARLAR TARZI PREMIUM ACCORDION
const Accordion = ({ id, icon, title, isOpen, onToggle, C, children }) => {
  return (
    <div style={{
      background: `linear-gradient(145deg, rgba(30, 30, 35, 0.7), rgba(15, 15, 20, 0.9))`,
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      border: `1px solid rgba(255, 255, 255, 0.08)`, borderRadius: 32, marginBottom: 16, overflow: "hidden",
      transform: "translateZ(0)", boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
    }}>
      <div 
        onClick={() => onToggle(id)}
        style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", background: isOpen ? `rgba(255,255,255,0.03)` : "transparent" }}
      >
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: fonts.header, display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ background: "rgba(255,255,255,0.1)", padding: "8px", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid rgba(255,255,255,0.05)` }}>{icon}</span> 
          {title}
        </h3>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} style={{ color: "rgba(255,255,255,0.4)" }}>▼</motion.div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "12px 24px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 🌟 PREMIUM DİL SEÇİCİ (Glassmorphism Language Switcher)
export function LanguageSwitcher({ C }) {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const currentLang = i18n.language || 'tr';
    const nextLang = currentLang.startsWith('tr') ? 'en' : 'tr';
    i18n.changeLanguage(nextLang);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const currentLang = i18n.language || 'tr';

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: `linear-gradient(145deg, rgba(30, 30, 35, 0.7), rgba(15, 15, 20, 0.9))`,
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      padding: '16px 24px', borderRadius: 32, border: `1px solid rgba(255,255,255,0.08)`,
      marginBottom: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
    }}>
      <div style={{ fontSize: 16, color: '#fff', fontWeight: 900, fontFamily: fonts.header, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ background: "rgba(255,255,255,0.1)", padding: "8px", borderRadius: 12, border: `1px solid rgba(255,255,255,0.05)` }}>🌐</span> 
        {t('language') || 'Dil / Language'}
      </div>
      
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={toggleLanguage}
        style={{
          background: `rgba(255,255,255,0.05)`, border: `1px solid rgba(255,255,255,0.1)`,
          color: '#fff', padding: '10px 16px', borderRadius: 16, fontWeight: 900,
          cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center', fontFamily: fonts.mono
        }}
      >
        <span style={{ opacity: currentLang.startsWith('tr') ? 1 : 0.3, color: currentLang.startsWith('tr') ? C.green : '#fff' }}>TR</span>
        <span style={{ opacity: 0.2 }}>|</span>
        <span style={{ opacity: currentLang.startsWith('en') ? 1 : 0.3, color: currentLang.startsWith('en') ? C.green : '#fff' }}>EN</span>
      </motion.button>
    </div>
  );
}

export default function TabProfile({ themeColors: C }) {
  const { t } = useTranslation(); 
  const user = useAppStore(state => state.user);
  const setUser = useAppStore(state => state.setUser);
  const setMacros = useAppStore(state => state.setMacros);
  const setCustomTargetMacros = useAppStore(state => state.setCustomTargetMacros);
  const setCustomWorkouts = useAppStore(state => state.setCustomWorkouts);
  const setMealPlan = useAppStore(state => state.setMealPlan);
  
  const activeThemeId = useAppStore(state => state.activeThemeId);
  const setActiveThemeId = useAppStore(state => state.setActiveThemeId);

  const [openSections, setOpenSections] = useState(["hesap"]);
  const [toast, setToast] = useState(null);

  // Bütün orijinal form değişkenleri korundu
  const [form, setForm] = useState({
    userId: user?.userId || `USR-${Math.floor(10000 + Math.random() * 90000)}`,
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    city: user?.city || "",
    gender: user?.gender || "erkek",
    dietType: user?.dietType || "standart",
    dob: user?.dob || "1995-01-01",
    height: user?.height || 180,
    goal: user?.goal || "kilo_ver",
    startWeight: user?.startWeight || user?.weight || 80,
    targetWeight: user?.targetWeight || 70,
    activity: user?.activity || "orta",
    weeklyGoal: user?.weeklyGoal || "0.5",
    customCalorie: user?.customCalorie || "",
    stepGoal: user?.stepGoal || 10000,
    macroProfile: user?.macroProfile || "dengeli",
    allowSweets: user?.preferences?.allowSweets || false,
    waterUnit: user?.waterUnit || "ml",
    waterGoal: user?.waterGoal || 2500,
    notifBreakfast: user?.notifBreakfast || "08:00",
    notifLunch: user?.notifLunch || "13:00",
    notifDinner: user?.notifDinner || "19:00",
    notifSnack: user?.notifSnack || "16:00",
    workDays: user?.workDays || ["Pzt", "Sal", "Çar", "Per", "Cum"],
    unitWeight: user?.unitWeight || "kg",
    unitLength: user?.unitLength || "cm",
    unitEnergy: user?.unitEnergy || "kcal",
    unitPortion: user?.unitPortion || "gr",
    unitBlood: user?.unitBlood || "mg/dL"
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleSection = (id) => {
    setOpenSections(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkDayToggle = (day) => {
    const current = form.workDays;
    if (current.includes(day)) {
      handleInputChange("workDays", current.filter(d => d !== day));
    } else {
      handleInputChange("workDays", [...current, day]);
    }
  };

  const handleThemeChange = (themeId) => {
    setActiveThemeId(themeId);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const handleSaveAll = () => {
    const updatedPreferences = {
      ...user?.preferences,
      allowSweets: form.allowSweets
    };

    const updatedUser = { 
      ...user, ...form, 
      preferences: updatedPreferences,
      weight: parseFloat(form.startWeight) || user.weight,
      age: new Date().getFullYear() - new Date(form.dob).getFullYear() || user.age 
    };
    
    setUser(updatedUser);

    try {
      const generatedData = generatePersonalizedPlan(updatedUser);
      
      if (form.customCalorie) {
        generatedData.macros.calories = parseInt(form.customCalorie);
      }

      setCustomTargetMacros(generatedData.macros);
      setMacros(generatedData.macros);
      setCustomWorkouts(generatedData.workouts);
      setMealPlan(generateMealPlan(generatedData.macros, updatedUser));
      
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      showToast(t('msg_saved'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    if (window.confirm("Tüm verilerin, geçmişin ve programın silinecek! Onaylıyor musun? / All data will be deleted!")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const macroPct = useMemo(() => {
    switch (form.macroProfile) {
      case "yuksek_protein": return { p: 40, c: 30, f: 30 };
      case "dusuk_karb": return { p: 35, c: 20, f: 45 };
      case "keto": return { p: 25, c: 5, f: 70 };
      default: return { p: 30, c: 40, f: 30 }; 
    }
  }, [form.macroProfile]);

  const inputStyle = { width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "16px 20px", borderRadius: 20, outline: "none", fontFamily: fonts.mono, fontSize: 14, transition: "0.2s" };
  const selectStyle = { width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "16px 20px", borderRadius: 20, outline: "none", fontFamily: fonts.header, fontSize: 14, appearance: "none" };
  const labelStyle = { fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 8, display: "block", fontFamily: fonts.header };

  return (
    <div style={{ paddingBottom: 120, position: "relative" }}>
      
      {/* 🌌 AMBIENT ARKA PLAN */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15], x: [0, -30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} style={{ position: 'absolute', top: '20%', right: '-20%', width: '90vw', height: '90vw', background: `radial-gradient(circle, ${C.green}40 0%, transparent 60%)`, filter: 'blur(120px)' }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, padding: "0 8px" }}>
        
        {/* ÜST BAŞLIK */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: "#fff", letterSpacing: "-1px" }}>{t('profile_title')} <span style={{ fontSize: 28 }}>👤</span></h2>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginTop: 8 }}>{t('profile_desc')}</div>
        </div>

        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} style={{ position: "fixed", top: 20, left: 20, right: 20, background: C.green, color: "#000", padding: 16, borderRadius: 20, fontWeight: 900, textAlign: "center", zIndex: 1000, boxShadow: `0 10px 30px rgba(46, 204, 113, 0.4)` }}>
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 💳 LÜKS KİMLİK KARTI */}
        <div style={{ background: `linear-gradient(145deg, rgba(30, 30, 35, 0.7), rgba(15, 15, 20, 0.9))`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: `1px solid rgba(255, 255, 255, 0.08)`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)", borderRadius: 36, display: 'flex', alignItems: 'center', gap: 24, padding: "32px 28px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
           <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: C.green, filter: 'blur(80px)', opacity: 0.2 }} />
           
           <div style={{ width: 80, height: 80, borderRadius: 28, background: "rgba(255,255,255,0.1)", display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, border: `1px solid rgba(255,255,255,0.2)`, boxShadow: "inset 0 4px 10px rgba(255,255,255,0.2), 0 10px 20px rgba(0,0,0,0.3)" }}>
             {user?.avatar || "🥷"}
           </div>
           
           <div>
             <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", fontFamily: fonts.header, letterSpacing: -0.5, marginBottom: 6 }}>
               {form.firstName ? `${form.firstName} ${form.lastName}` : (user?.name || "Warrior")}
             </div>
             <div style={{ fontSize: 13, color: C.green, fontWeight: 800, background: "rgba(46, 204, 113, 0.15)", padding: "6px 12px", borderRadius: 100, display: "inline-block", border: `1px solid rgba(46, 204, 113, 0.3)` }}>
               {t('prof_warrior')}
             </div>
           </div>
        </div>

        <LanguageSwitcher C={C} />

        {/* 1. HESAP */}
        <Accordion id="hesap" icon="🛡️" title={t('acc_account')} isOpen={openSections.includes("hesap")} onToggle={toggleSection} C={C}>
          <div>
            <label style={labelStyle}>{t('lbl_userid')}</label>
            <input type="text" value={form.userId} disabled style={{ ...inputStyle, opacity: 0.5 }} />
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button onClick={handleReset} style={{ flex: 1, background: "transparent", border: `1px solid ${C.red}60`, color: C.red, padding: "16px", borderRadius: 20, fontWeight: 800, cursor: "pointer", fontSize: 13 }}>{t('btn_reset_acc')}</button>
            <button onClick={() => window.location.reload()} style={{ flex: 1, background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "16px", borderRadius: 20, fontWeight: 800, cursor: "pointer", fontSize: 13 }}>{t('btn_logout')}</button>
          </div>
        </Accordion>

        {/* 2. PROFİL */}
        <Accordion id="profil" icon="👤" title={t('acc_personal')} isOpen={openSections.includes("profil")} onToggle={toggleSection} C={C}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>{t('lbl_name')}</label>
              <input type="text" value={form.firstName} onChange={e => handleInputChange("firstName", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('lbl_surname')}</label>
              <input type="text" value={form.lastName} onChange={e => handleInputChange("lastName", e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>{t('lbl_city')}</label>
            <input type="text" value={form.city} onChange={e => handleInputChange("city", e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>{t('lbl_gender')}</label>
              <select value={form.gender} onChange={e => handleInputChange("gender", e.target.value)} style={selectStyle}>
                <option value="erkek">{t('gender_male')}</option><option value="kadin">{t('gender_female')}</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t('lbl_dob')}</label>
              <input type="date" value={form.dob} onChange={e => handleInputChange("dob", e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>{t('lbl_diet')}</label>
            <select value={form.dietType} onChange={e => handleInputChange("dietType", e.target.value)} style={selectStyle}>
              <option value="standart">{t('diet_std')}</option>
              <option value="vejetaryen">{t('diet_veg')}</option>
              <option value="vegan">{t('diet_vegan')}</option>
              <option value="keto">{t('diet_keto')}</option>
            </select>
          </div>
        </Accordion>

        {/* 3. HEDEFLERİM */}
        <Accordion id="hedefler" icon="🎯" title={t('acc_goals')} isOpen={openSections.includes("hedefler")} onToggle={toggleSection} C={C}>
          <div style={{ background: `rgba(255,193,7,0.1)`, border: `1px solid rgba(255,193,7,0.3)`, padding: 20, borderRadius: 20, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "#ffc107", fontWeight: 900 }}>⚠️ DİKKAT:</span>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", margin: "6px 0 0 0", lineHeight: 1.5 }}>{t('goal_warn')}</p>
          </div>
          <div>
            <label style={labelStyle}>{t('lbl_main_goal')}</label>
            <select value={form.goal} onChange={e => handleInputChange("goal", e.target.value)} style={{ ...selectStyle, borderColor: C.green, color: C.green, fontWeight: 900 }}>
              <option value="kilo_ver">{t('goal_lose')}</option>
              <option value="kilo_al">{t('goal_gain')}</option>
              <option value="kas_yap">{t('goal_muscle')}</option>
              <option value="koru">{t('goal_maintain')}</option>
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>{t('lbl_start_w')} ({form.unitWeight.toUpperCase()})</label>
              <input type="number" value={form.startWeight} onChange={e => handleInputChange("startWeight", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('lbl_target_w')}</label>
              <input type="number" value={form.targetWeight} onChange={e => handleInputChange("targetWeight", e.target.value)} style={{ ...inputStyle, color: C.green }} />
            </div>
            <div>
              <label style={labelStyle}>{t('lbl_height')} ({form.unitLength.toUpperCase()})</label>
              <input type="number" value={form.height} onChange={e => handleInputChange("height", e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>{t('lbl_activity')}</label>
            <select value={form.activity} onChange={e => handleInputChange("activity", e.target.value)} style={selectStyle}>
              <option value="sedanter">{t('act_sedentary')}</option>
              <option value="orta">{t('act_moderate')}</option>
              <option value="aktif">{t('act_active')}</option>
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>{t('lbl_weekly_goal')}</label>
              <select value={form.weeklyGoal} onChange={e => handleInputChange("weeklyGoal", e.target.value)} style={selectStyle}>
                <option value="0.25">0.25 {form.unitWeight} / Hafta</option>
                <option value="0.5">0.50 {form.unitWeight} / Hafta</option>
                <option value="0.75">0.75 {form.unitWeight} / Hafta</option>
                <option value="1">1.00 {form.unitWeight} / Hafta</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t('lbl_step_goal')}</label>
              <input type="number" step="1000" value={form.stepGoal} onChange={e => handleInputChange("stepGoal", e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>{t('lbl_manual_cal')}</label>
            <input type="number" placeholder="Örn: 2200" value={form.customCalorie} onChange={e => handleInputChange("customCalorie", e.target.value)} style={inputStyle} />
          </div>
        </Accordion>

        {/* 4. BESİN HEDEFİ */}
        <Accordion id="besin" icon="🥩" title={t('acc_macros')} isOpen={openSections.includes("besin")} onToggle={toggleSection} C={C}>
          <div>
            <label style={labelStyle}>{t('lbl_macro_prof')}</label>
            <select value={form.macroProfile} onChange={e => handleInputChange("macroProfile", e.target.value)} style={selectStyle}>
              <option value="dengeli">{t('macro_bal')}</option>
              <option value="yuksek_protein">{t('macro_pro')}</option>
              <option value="dusuk_karb">{t('macro_carb')}</option>
              <option value="keto">{t('macro_keto')}</option>
            </select>
          </div>

          <div 
            onClick={() => handleInputChange("allowSweets", !form.allowSweets)}
            style={{ marginTop: 16, background: form.allowSweets ? `${C.green}15` : "rgba(0,0,0,0.3)", border: `1px solid ${form.allowSweets ? C.green : `rgba(255,255,255,0.1)`}`, padding: "20px", borderRadius: 20, cursor: "pointer", display: "flex", gap: 16, alignItems: "center", transition: "0.2s" }}
          >
            <div style={{ width: 28, height: 28, borderRadius: 8, border: `2px solid ${form.allowSweets ? C.green : "rgba(255,255,255,0.3)"}`, background: form.allowSweets ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {form.allowSweets && <span style={{ color: "#000", fontWeight: 900, fontSize: 16 }}>✓</span>}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, fontFamily: fonts.header, color: form.allowSweets ? C.green : "#fff", marginBottom: 4 }}>{t('lbl_sweets')}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>{t('desc_sweets')}</div>
            </div>
          </div>
          
          <div style={{ marginTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 12, fontWeight: 900, fontFamily: fonts.mono }}>
              <span style={{ color: C.blue }}>Karb %{macroPct.c}</span>
              <span style={{ color: C.green }}>Protein %{macroPct.p}</span>
              <span style={{ color: C.yellow }}>Yağ %{macroPct.f}</span>
            </div>
            <div style={{ width: "100%", height: 16, borderRadius: 8, display: "flex", overflow: "hidden", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
              <motion.div layout style={{ width: `${macroPct.c}%`, background: C.blue }} />
              <motion.div layout style={{ width: `${macroPct.p}%`, background: C.green }} />
              <motion.div layout style={{ width: `${macroPct.f}%`, background: C.yellow }} />
            </div>
          </div>
        </Accordion>

        {/* 5. GÜNLÜK SU TAKİPÇİSİ */}
        <Accordion id="su" icon="💧" title={t('acc_water')} isOpen={openSections.includes("su")} onToggle={toggleSection} C={C}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>{t('lbl_water_unit')}</label>
              <select value={form.waterUnit} onChange={e => handleInputChange("waterUnit", e.target.value)} style={selectStyle}>
                <option value="ml">ml</option>
                <option value="oz">oz</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t('lbl_water_goal')}</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="number" step="100" value={form.waterGoal} onChange={e => handleInputChange("waterGoal", e.target.value)} style={inputStyle} />
                <span style={{ color: C.blue, fontWeight: 900, fontSize: 16 }}>{form.waterUnit}</span>
              </div>
            </div>
          </div>
        </Accordion>

        {/* 6. BİLDİRİMLER */}
        <Accordion id="bildirim" icon="🔔" title={t('acc_notif')} isOpen={openSections.includes("bildirim")} onToggle={toggleSection} C={C}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>{t('notif_breakfast')}</label>
              <input type="time" value={form.notifBreakfast} onChange={e => handleInputChange("notifBreakfast", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('notif_lunch')}</label>
              <input type="time" value={form.notifLunch} onChange={e => handleInputChange("notifLunch", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('notif_snack')}</label>
              <input type="time" value={form.notifSnack} onChange={e => handleInputChange("notifSnack", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('notif_dinner')}</label>
              <input type="time" value={form.notifDinner} onChange={e => handleInputChange("notifDinner", e.target.value)} style={inputStyle} />
            </div>
          </div>
          
          <div style={{ marginTop: 24 }}>
            <label style={labelStyle}>{t('lbl_workdays')}</label>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
              {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(day => {
                const isActive = form.workDays.includes(day);
                return (
                  <button 
                    key={day} onClick={() => handleWorkDayToggle(day)}
                    style={{ flexShrink: 0, width: 48, height: 48, borderRadius: "50%", background: isActive ? "#fff" : "rgba(0,0,0,0.3)", color: isActive ? "#000" : "rgba(255,255,255,0.5)", border: `1px solid ${isActive ? "#fff" : `rgba(255,255,255,0.1)`}`, fontWeight: 900, cursor: "pointer", transition: "0.2s" }}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        </Accordion>

        {/* 7. BİRİMLER */}
        <Accordion id="birimler" icon="⚖️" title={t('acc_units')} isOpen={openSections.includes("birimler")} onToggle={toggleSection} C={C}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>{t('unit_weight')}</label>
              <select value={form.unitWeight} onChange={e => handleInputChange("unitWeight", e.target.value)} style={selectStyle}>
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t('unit_length')}</label>
              <select value={form.unitLength} onChange={e => handleInputChange("unitLength", e.target.value)} style={selectStyle}>
                <option value="cm">cm</option>
                <option value="ft">ft/in</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t('unit_energy')}</label>
              <select value={form.unitEnergy} onChange={e => handleInputChange("unitEnergy", e.target.value)} style={selectStyle}>
                <option value="kcal">kcal</option>
                <option value="kj">kJ</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t('unit_portion')}</label>
              <select value={form.unitPortion} onChange={e => handleInputChange("unitPortion", e.target.value)} style={selectStyle}>
                <option value="gr">g/ml</option>
                <option value="oz">oz</option>
              </select>
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>{t('unit_blood')}</label>
              <select value={form.unitBlood} onChange={e => handleInputChange("unitBlood", e.target.value)} style={selectStyle}>
                <option value="mg/dL">mg/dL</option>
                <option value="mmol/L">mmol/L</option>
              </select>
            </div>
          </div>
        </Accordion>

        {/* 8. TEMA SEÇİCİ */}
        <Accordion id="tema" icon="🎨" title={t('acc_theme')} isOpen={openSections.includes("tema")} onToggle={toggleSection} C={C}>
          <label style={labelStyle}>{t('theme_title')}</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { id: "midnight", label: t('theme_midnight'), color: "#000000" },
              { id: "iron", label: t('theme_iron'), color: "#181a1f" },
              { id: "cyberpunk", label: t('theme_cyberpunk'), color: "#05000a" },
              { id: "neon", label: t('theme_neon'), color: "#020617" },
              { id: "forest", label: t('theme_forest'), color: "#040b06" },
              { id: "bloodmoon", label: t('theme_bloodmoon'), color: "#0a0202" }
            ].map(theme => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                style={{
                  background: "rgba(0,0,0,0.3)",
                  border: `1px solid ${activeThemeId === theme.id ? C.green : `rgba(255,255,255,0.1)`}`,
                  color: activeThemeId === theme.id ? C.green : "#fff",
                  padding: "16px",
                  borderRadius: 20,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  transition: "0.2s",
                  boxShadow: activeThemeId === theme.id ? `0 4px 15px ${C.green}30` : "none"
                }}
              >
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: theme.color, border: `1px solid rgba(255,255,255,0.2)` }} />
                {theme.label}
              </button>
            ))}
          </div>
        </Accordion>

        {/* KAYDET BUTONU */}
        <div style={{ position: "fixed", bottom: 100, left: 0, right: 0, display: "flex", justifyContent: "center", padding: "0 20px", zIndex: 100, transform: "translateZ(0)", pointerEvents: "none" }}>
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={handleSaveAll}
            style={{ pointerEvents: "auto", width: "100%", maxWidth: 400, background: `linear-gradient(135deg, ${C.green}, #22c55e)`, border: "none", borderRadius: 100, color: "#000", fontWeight: 900, padding: "24px", cursor: "pointer", fontSize: 16, letterSpacing: -0.5, fontFamily: fonts.header, boxShadow: `0 15px 35px rgba(46, 204, 113, 0.4), inset 0 2px 5px rgba(255,255,255,0.4)` }}
          >
            {t('prof_save_btn')}
          </motion.button>
        </div>

      </div>
    </div>
  );
}