import React from 'react';
import { motion } from 'framer-motion';
import ProfileAccordion from './ProfileAccordion.jsx';

import { fonts } from '@/shared/utils/uiStyles.js';
const STYLES = {
  input: { width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "16px 20px", borderRadius: 20, outline: "none", fontFamily: fonts.mono, fontSize: 14, transition: "0.2s" },
  select: { width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "16px 20px", borderRadius: 20, outline: "none", fontFamily: fonts.header, fontSize: 14, appearance: "none" },
  label: { fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 8, display: "block", fontFamily: fonts.header },
  warningBox: { background: `rgba(255,193,7,0.1)`, border: `1px solid rgba(255,193,7,0.3)`, padding: 20, borderRadius: 20, marginBottom: 12 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  sweetToggle: (allowSweets, C) => ({ marginTop: 16, background: allowSweets ? `${C?.green || '#22c55e'}15` : "rgba(0,0,0,0.3)", border: `1px solid ${allowSweets ? (C?.green || '#22c55e') : `rgba(255,255,255,0.1)`}`, padding: "20px", borderRadius: 20, cursor: "pointer", display: "flex", gap: 16, alignItems: "center", transition: "0.2s" }),
  checkbox: (allowSweets, C) => ({ width: 28, height: 28, borderRadius: 8, border: `2px solid ${allowSweets ? (C?.green || '#22c55e') : "rgba(255,255,255,0.3)"}`, background: allowSweets ? (C?.green || '#22c55e') : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 })
};

export default function ProfileGoals({ form = {}, openSections = [], toggleSection, handleInputChange, macroPct = {}, C = {}, t = (k)=>k }) {
  return (
    <>
      <ProfileAccordion id="hedefler" icon="🎯" title={t('acc_goals') || "Hedeflerim"} isOpen={(openSections || []).includes("hedefler")} onToggle={toggleSection} C={C}>
        <div style={STYLES.warningBox}>
          <span style={{ fontSize: 13, color: "#ffc107", fontWeight: 900 }}>⚠️ DİKKAT:</span>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", margin: "6px 0 0 0", lineHeight: 1.5 }}>{t('goal_warn')}</p>
        </div>
        <div>
          <label style={STYLES.label}>{t('lbl_main_goal')}</label>
          <select value={form?.goal || "kilo_ver"} onChange={e => handleInputChange?.("goal", e.target.value)} style={{ ...STYLES.select, borderColor: C?.green || '#22c55e', color: C?.green || '#22c55e', fontWeight: 900 }}>
            <option value="kilo_ver">{t('goal_lose')}</option><option value="kilo_al">{t('goal_gain')}</option>
            <option value="kas_yap">{t('goal_muscle')}</option><option value="koru">{t('goal_maintain')}</option>
          </select>
        </div>
        <div style={STYLES.grid3}>
          <div><label style={STYLES.label}>{t('lbl_start_w')} ({(form?.unitWeight || "kg").toUpperCase()})</label><input type="number" value={form?.startWeight || ""} onChange={e => handleInputChange?.("startWeight", e.target.value)} style={STYLES.input} /></div>
          <div><label style={STYLES.label}>{t('lbl_target_w')}</label><input type="number" value={form?.targetWeight || ""} onChange={e => handleInputChange?.("targetWeight", e.target.value)} style={{ ...STYLES.input, color: C?.green || '#22c55e' }} /></div>
          <div><label style={STYLES.label}>{t('lbl_height')} ({(form?.unitLength || "cm").toUpperCase()})</label><input type="number" value={form?.height || ""} onChange={e => handleInputChange?.("height", e.target.value)} style={STYLES.input} /></div>
        </div>
        <div>
          <label style={STYLES.label}>{t('lbl_activity')}</label>
          <select value={form?.activity || "orta"} onChange={e => handleInputChange?.("activity", e.target.value)} style={STYLES.select}>
            <option value="sedanter">{t('act_sedentary')}</option><option value="orta">{t('act_moderate')}</option><option value="aktif">{t('act_active')}</option>
          </select>
        </div>
        <div style={STYLES.grid2}>
          <div>
            <label style={STYLES.label}>{t('lbl_weekly_goal')}</label>
            <select value={form?.weeklyGoal || "0.5"} onChange={e => handleInputChange?.("weeklyGoal", e.target.value)} style={STYLES.select}>
              <option value="0.25">0.25 {form?.unitWeight || "kg"} / Hafta</option><option value="0.5">0.50 {form?.unitWeight || "kg"} / Hafta</option>
              <option value="0.75">0.75 {form?.unitWeight || "kg"} / Hafta</option><option value="1">1.00 {form?.unitWeight || "kg"} / Hafta</option>
            </select>
          </div>
          <div><label style={STYLES.label}>{t('lbl_step_goal')}</label><input type="number" step="1000" value={form?.stepGoal || ""} onChange={e => handleInputChange?.("stepGoal", e.target.value)} style={STYLES.input} /></div>
        </div>
        <div><label style={STYLES.label}>{t('lbl_manual_cal')}</label><input type="number" placeholder="Örn: 2200" value={form?.customCalorie || ""} onChange={e => handleInputChange?.("customCalorie", e.target.value)} style={STYLES.input} /></div>
      </ProfileAccordion>

      <ProfileAccordion id="besin" icon="🥩" title={t('acc_macros') || "Beslenme"} isOpen={(openSections || []).includes("besin")} onToggle={toggleSection} C={C}>
        <div>
          <label style={STYLES.label}>{t('lbl_macro_prof')}</label>
          <select value={form?.macroProfile || "dengeli"} onChange={e => handleInputChange?.("macroProfile", e.target.value)} style={STYLES.select}>
            <option value="dengeli">{t('macro_bal')}</option><option value="yuksek_protein">{t('macro_pro')}</option>
            <option value="dusuk_karb">{t('macro_carb')}</option><option value="keto">{t('macro_keto')}</option>
          </select>
        </div>

        <div onClick={() => handleInputChange?.("allowSweets", !form?.allowSweets)} style={STYLES.sweetToggle(form?.allowSweets, C)}>
          <div style={STYLES.checkbox(form?.allowSweets, C)}>{form?.allowSweets && <span style={{ color: "#000", fontWeight: 900, fontSize: 16 }}>✓</span>}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, fontFamily: fonts.header, color: form?.allowSweets ? (C?.green || '#22c55e') : "#fff", marginBottom: 4 }}>{t('lbl_sweets')}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>{t('desc_sweets')}</div>
          </div>
        </div>
        
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 12, fontWeight: 900, fontFamily: fonts.mono }}>
            <span style={{ color: C?.blue || '#3b82f6' }}>Karb %{macroPct?.c || 0}</span><span style={{ color: C?.green || '#22c55e' }}>Protein %{macroPct?.p || 0}</span><span style={{ color: C?.yellow || '#f59e0b' }}>Yağ %{macroPct?.f || 0}</span>
          </div>
          <div style={{ width: "100%", height: 16, borderRadius: 8, display: "flex", overflow: "hidden", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
            <motion.div layout style={{ width: `${macroPct?.c || 0}%`, background: C?.blue || '#3b82f6' }} />
            <motion.div layout style={{ width: `${macroPct?.p || 0}%`, background: C?.green || '#22c55e' }} />
            <motion.div layout style={{ width: `${macroPct?.f || 0}%`, background: C?.yellow || '#f59e0b' }} />
          </div>
        </div>
      </ProfileAccordion>
    </>
  );
}