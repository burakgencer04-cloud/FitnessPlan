import React from 'react';
import ProfileAccordion from './ProfileAccordion.jsx';
import { fonts } from '@/shared/ui/uiStyles.js';

const STYLES = {
  input: { width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "16px 20px", borderRadius: 20, outline: "none", fontFamily: fonts.mono, fontSize: 14, transition: "0.2s" },
  select: { width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "16px 20px", borderRadius: 20, outline: "none", fontFamily: fonts.header, fontSize: 14, appearance: "none" },
  label: { fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 8, display: "block", fontFamily: fonts.header },
  btnRed: (C) => ({ flex: 1, background: "transparent", border: `1px solid ${C?.red || '#ef4444'}60`, color: C?.red || '#ef4444', padding: "16px", borderRadius: 20, fontWeight: 800, cursor: "pointer", fontSize: 13 }),
  btnDark: { flex: 1, background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "16px", borderRadius: 20, fontWeight: 800, cursor: "pointer", fontSize: 13 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }
};

export default function ProfileStats({ form = {}, openSections = [], toggleSection, handleInputChange, handleReset, C = {}, t = (k)=>k }) {
  return (
    <>
      <ProfileAccordion id="hesap" icon="🛡️" title={t('acc_account') || "Hesap"} isOpen={(openSections || []).includes("hesap")} onToggle={toggleSection} C={C}>
        <div><label style={STYLES.label}>{t('lbl_userid')}</label><input type="text" value={form?.userId || ""} disabled style={{ ...STYLES.input, opacity: 0.5 }} /></div>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <button onClick={handleReset} style={STYLES.btnRed(C)}>{t('btn_reset_acc') || 'Hesabı Sıfırla'}</button>
          <button onClick={() => window.location.reload()} style={STYLES.btnDark}>{t('btn_logout') || 'Çıkış Yap'}</button>
        </div>
      </ProfileAccordion>

      <ProfileAccordion id="profil" icon="👤" title={t('acc_personal') || "Kişisel Bilgiler"} isOpen={(openSections || []).includes("profil")} onToggle={toggleSection} C={C}>
        <div style={STYLES.grid2}>
          <div><label style={STYLES.label}>{t('lbl_name')}</label><input type="text" value={form?.firstName || ""} onChange={e => handleInputChange?.("firstName", e.target.value)} style={STYLES.input} /></div>
          <div><label style={STYLES.label}>{t('lbl_surname')}</label><input type="text" value={form?.lastName || ""} onChange={e => handleInputChange?.("lastName", e.target.value)} style={STYLES.input} /></div>
        </div>
        <div><label style={STYLES.label}>{t('lbl_city')}</label><input type="text" value={form?.city || ""} onChange={e => handleInputChange?.("city", e.target.value)} style={STYLES.input} /></div>
        <div style={STYLES.grid2}>
          <div>
            <label style={STYLES.label}>{t('lbl_gender')}</label>
            <select value={form?.gender || "erkek"} onChange={e => handleInputChange?.("gender", e.target.value)} style={STYLES.select}>
              <option value="erkek">{t('gender_male') || 'Erkek'}</option><option value="kadin">{t('gender_female') || 'Kadın'}</option>
            </select>
          </div>
          <div><label style={STYLES.label}>{t('lbl_dob')}</label><input type="date" value={form?.dob || ""} onChange={e => handleInputChange?.("dob", e.target.value)} style={STYLES.input} /></div>
        </div>
        <div>
          <label style={STYLES.label}>{t('lbl_diet')}</label>
          <select value={form?.dietType || "standart"} onChange={e => handleInputChange?.("dietType", e.target.value)} style={STYLES.select}>
            <option value="standart">{t('diet_std') || 'Standart'}</option><option value="vejetaryen">{t('diet_veg') || 'Vejetaryen'}</option>
            <option value="vegan">{t('diet_vegan') || 'Vegan'}</option><option value="keto">{t('diet_keto') || 'Keto'}</option>
          </select>
        </div>
      </ProfileAccordion>
    </>
  );
}