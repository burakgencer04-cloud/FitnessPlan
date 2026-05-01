import React from 'react';
import { motion } from 'framer-motion';
import { getSharedStyles } from './WizardShared.jsx';
import { fonts } from '@/shared/ui/uiStyles.js';

export const Step1Personal = ({ form, setForm, C, t }) => {
  const { inputStyle, labelStyle } = getSharedStyles(C);
  
  return (
    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>👋</div>
      <h2 style={{ margin: "0 0 12px 0", fontSize: 28, fontWeight: 900, fontFamily: fonts.header }}>{t('wiz_step1_title')}</h2>
      <p style={{ margin: "0 0 32px 0", fontSize: 15, color: C.sub, lineHeight: 1.5 }}>{t('wiz_step1_desc')}</p>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>{t('wiz_lbl_name')}</label>
          <input type="text" placeholder={t('wiz_ph_name')} value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} style={{ ...inputStyle, marginBottom: 0 }} />
        </div>
        <div>
          <label style={labelStyle}>{t('wiz_lbl_surname')}</label>
          <input type="text" placeholder={t('wiz_ph_surname')} value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} style={{ ...inputStyle, marginBottom: 0 }} />
        </div>
      </div>
      
      <label style={{...labelStyle, marginTop: 16}}>{t('wiz_lbl_city')}</label>
      <input type="text" placeholder={t('wiz_ph_city')} value={form.city} onChange={e => setForm({...form, city: e.target.value})} style={inputStyle} />
    </motion.div>
  );
};

export const Step2Demographics = ({ form, setForm, C, t }) => {
  const { inputStyle, labelStyle } = getSharedStyles(C);
  
  return (
    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1 }}>
      <h2 style={{ margin: "0 0 12px 0", fontSize: 28, fontWeight: 900, fontFamily: fonts.header }}>{t('wiz_step2_title')}</h2>
      <p style={{ margin: "0 0 32px 0", fontSize: 15, color: C.sub }}>{t('wiz_step2_desc')}</p>
      
      <label style={labelStyle}>{t('wiz_lbl_gender')}</label>
      <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
        <button onClick={() => setForm({...form, gender: "erkek"})} style={{ flex: 1, background: form.gender === "erkek" ? `linear-gradient(145deg, ${C.blue}30, transparent)` : "rgba(0,0,0,0.3)", border: `1px solid ${form.gender === "erkek" ? C.blue : `${C.border}40`}`, color: form.gender === "erkek" ? C.text : C.mute, padding: "20px", borderRadius: 20, fontSize: 16, fontWeight: 900, cursor: "pointer", backdropFilter: "blur(12px)" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👨</div> {t('wiz_gender_male')}
        </button>
        <button onClick={() => setForm({...form, gender: "kadin"})} style={{ flex: 1, background: form.gender === "kadin" ? `linear-gradient(145deg, ${C.red}30, transparent)` : "rgba(0,0,0,0.3)", border: `1px solid ${form.gender === "kadin" ? C.red : `${C.border}40`}`, color: form.gender === "kadin" ? C.text : C.mute, padding: "20px", borderRadius: 20, fontSize: 16, fontWeight: 900, cursor: "pointer", backdropFilter: "blur(12px)" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👩</div> {t('wiz_gender_female')}
        </button>
      </div>
      
      <label style={labelStyle}>{t('wiz_lbl_dob')}</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 24, border: `1px solid ${C.border}30` }}>
        <input type="number" placeholder={t('wiz_ph_day')} value={form.dobDay} onChange={e => setForm({...form, dobDay: e.target.value})} style={{ ...inputStyle, marginBottom: 0 }} />
        <input type="number" placeholder={t('wiz_ph_month')} value={form.dobMonth} onChange={e => setForm({...form, dobMonth: e.target.value})} style={{ ...inputStyle, marginBottom: 0 }} />
        <input type="number" placeholder={t('wiz_ph_year')} value={form.dobYear} onChange={e => setForm({...form, dobYear: e.target.value})} style={{ ...inputStyle, marginBottom: 0 }} />
      </div>
    </motion.div>
  );
};

export const Step3Body = ({ form, setForm, C, t }) => {
  const { inputStyle, labelStyle } = getSharedStyles(C);
  
  return (
    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1 }}>
      <h2 style={{ margin: "0 0 12px 0", fontSize: 28, fontWeight: 900, fontFamily: fonts.header }}>{t('wiz_step3_title')}</h2>
      <p style={{ margin: "0 0 24px 0", fontSize: 15, color: C.sub }}>{t('wiz_step3_desc')}</p>
      
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 24 }}>
        <div style={{ display: "flex", background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 4 }}>
          <button onClick={() => setForm({...form, unitWeight: "kg"})} style={{ border: "none", padding: "6px 12px", borderRadius: 8, background: form.unitWeight === "kg" ? C.text : "transparent", color: form.unitWeight === "kg" ? C.bg : C.mute, fontWeight: 900, cursor: "pointer", fontSize: 12 }}>KG</button>
          <button onClick={() => setForm({...form, unitWeight: "lb"})} style={{ border: "none", padding: "6px 12px", borderRadius: 8, background: form.unitWeight === "lb" ? C.text : "transparent", color: form.unitWeight === "lb" ? C.bg : C.mute, fontWeight: 900, cursor: "pointer", fontSize: 12 }}>LB</button>
        </div>
        <div style={{ display: "flex", background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 4 }}>
          <button onClick={() => setForm({...form, unitLength: "cm"})} style={{ border: "none", padding: "6px 12px", borderRadius: 8, background: form.unitLength === "cm" ? C.text : "transparent", color: form.unitLength === "cm" ? C.bg : C.mute, fontWeight: 900, cursor: "pointer", fontSize: 12 }}>CM</button>
          <button onClick={() => setForm({...form, unitLength: "ft"})} style={{ border: "none", padding: "6px 12px", borderRadius: 8, background: form.unitLength === "ft" ? C.text : "transparent", color: form.unitLength === "ft" ? C.bg : C.mute, fontWeight: 900, cursor: "pointer", fontSize: 12 }}>FT</button>
        </div>
      </div>
      
      <div style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2))`, padding: 24, borderRadius: 24, border: `1px solid ${C.border}40`, backdropFilter: "blur(12px)" }}>
        <label style={labelStyle}>{t('wiz_lbl_height')} ({form.unitLength.toUpperCase()})</label>
        <input type="number" placeholder={form.unitLength === "cm" ? "180" : "5.9"} value={form.height} onChange={e => setForm({...form, height: e.target.value})} style={inputStyle} />
        
        <label style={{...labelStyle, marginTop: 16}}>{t('wiz_lbl_current_w')} ({form.unitWeight.toUpperCase()})</label>
        <input type="number" placeholder={form.unitWeight === "kg" ? "80" : "176"} value={form.startWeight} onChange={e => setForm({...form, startWeight: e.target.value})} style={inputStyle} />
        
        <label style={{...labelStyle, marginTop: 16, color: C.green}}>{t('wiz_lbl_target_w')} ({form.unitWeight.toUpperCase()})</label>
        <input type="number" placeholder={form.unitWeight === "kg" ? "70" : "154"} value={form.targetWeight} onChange={e => setForm({...form, targetWeight: e.target.value})} style={{...inputStyle, borderColor: C.green, color: C.green}} />
      </div>
    </motion.div>
  );
};