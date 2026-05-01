import React from 'react';
import ProfileAccordion from './ProfileAccordion.jsx';
import { fonts } from '@/shared/ui/uiStyles.js';

const STYLES = {
  input: { width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "16px 20px", borderRadius: 20, outline: "none", fontFamily: fonts.mono, fontSize: 14, transition: "0.2s" },
  select: { width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "16px 20px", borderRadius: 20, outline: "none", fontFamily: fonts.header, fontSize: 14, appearance: "none" },
  label: { fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 8, display: "block", fontFamily: fonts.header },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  gridWater: { display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 },
  themeBtn: (isActive, themeColor, C) => ({ background: "rgba(0,0,0,0.3)", border: `1px solid ${isActive ? (C?.green || '#22c55e') : `rgba(255,255,255,0.1)`}`, color: isActive ? (C?.green || '#22c55e') : "#fff", padding: "16px", borderRadius: 20, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "0.2s", boxShadow: isActive ? `0 4px 15px ${(C?.green || '#22c55e')}30` : "none" })
};

const THEMES = [
  { id: "midnight", labelKey: 'theme_midnight', color: "#000000", fallback: "Gece" },
  { id: "iron", labelKey: 'theme_iron', color: "#181a1f", fallback: "Demir" },
  { id: "cyberpunk", labelKey: 'theme_cyberpunk', color: "#05000a", fallback: "Neon" },
  { id: "neon", labelKey: 'theme_neon', color: "#020617", fallback: "Gece Mavisi" },
  { id: "forest", labelKey: 'theme_forest', color: "#040b06", fallback: "Orman" },
  { id: "bloodmoon", labelKey: 'theme_bloodmoon', color: "#0a0202", fallback: "Kanlı Ay" }
];

export default function ProfileSettings({ form = {}, openSections = [], toggleSection, handleInputChange, handleWorkDayToggle, handleThemeChange, activeThemeId, C = {}, t = (k)=>k }) {
  return (
    <>
      <ProfileAccordion id="su" icon="💧" title={t('acc_water') || "Su"} isOpen={(openSections || []).includes("su")} onToggle={toggleSection} C={C}>
        <div style={STYLES.gridWater}>
          <div><label style={STYLES.label}>{t('lbl_water_unit')}</label><select value={form?.waterUnit || "ml"} onChange={e => handleInputChange?.("waterUnit", e.target.value)} style={STYLES.select}><option value="ml">ml</option><option value="oz">oz</option></select></div>
          <div><label style={STYLES.label}>{t('lbl_water_goal')}</label><div style={{ display: "flex", alignItems: "center", gap: 12 }}><input type="number" step="100" value={form?.waterGoal || ""} onChange={e => handleInputChange?.("waterGoal", e.target.value)} style={STYLES.input} /><span style={{ color: C?.blue || '#3b82f6', fontWeight: 900, fontSize: 16 }}>{form?.waterUnit || "ml"}</span></div></div>
        </div>
      </ProfileAccordion>

      <ProfileAccordion id="bildirim" icon="🔔" title={t('acc_notif') || "Bildirimler"} isOpen={(openSections || []).includes("bildirim")} onToggle={toggleSection} C={C}>
        <div style={STYLES.grid2}>
          <div><label style={STYLES.label}>{t('notif_breakfast')}</label><input type="time" value={form?.notifBreakfast || ""} onChange={e => handleInputChange?.("notifBreakfast", e.target.value)} style={STYLES.input} /></div>
          <div><label style={STYLES.label}>{t('notif_lunch')}</label><input type="time" value={form?.notifLunch || ""} onChange={e => handleInputChange?.("notifLunch", e.target.value)} style={STYLES.input} /></div>
          <div><label style={STYLES.label}>{t('notif_snack')}</label><input type="time" value={form?.notifSnack || ""} onChange={e => handleInputChange?.("notifSnack", e.target.value)} style={STYLES.input} /></div>
          <div><label style={STYLES.label}>{t('notif_dinner')}</label><input type="time" value={form?.notifDinner || ""} onChange={e => handleInputChange?.("notifDinner", e.target.value)} style={STYLES.input} /></div>
        </div>
        <div style={{ marginTop: 24 }}>
          <label style={STYLES.label}>{t('lbl_workdays')}</label>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
            {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(day => {
              const isActive = (form?.workDays || []).includes(day);
              return (
                <button key={day} onClick={() => handleWorkDayToggle?.(day)} style={{ flexShrink: 0, width: 48, height: 48, borderRadius: "50%", background: isActive ? "#fff" : "rgba(0,0,0,0.3)", color: isActive ? "#000" : "rgba(255,255,255,0.5)", border: `1px solid ${isActive ? "#fff" : `rgba(255,255,255,0.1)`}`, fontWeight: 900, cursor: "pointer", transition: "0.2s" }}>{day}</button>
              )
            })}
          </div>
        </div>
      </ProfileAccordion>

      <ProfileAccordion id="birimler" icon="⚖️" title={t('acc_units') || "Birimler"} isOpen={(openSections || []).includes("birimler")} onToggle={toggleSection} C={C}>
        <div style={STYLES.grid2}>
          <div><label style={STYLES.label}>{t('unit_weight')}</label><select value={form?.unitWeight || "kg"} onChange={e => handleInputChange?.("unitWeight", e.target.value)} style={STYLES.select}><option value="kg">kg</option><option value="lb">lb</option></select></div>
          <div><label style={STYLES.label}>{t('unit_length')}</label><select value={form?.unitLength || "cm"} onChange={e => handleInputChange?.("unitLength", e.target.value)} style={STYLES.select}><option value="cm">cm</option><option value="ft">ft/in</option></select></div>
          <div><label style={STYLES.label}>{t('unit_energy')}</label><select value={form?.unitEnergy || "kcal"} onChange={e => handleInputChange?.("unitEnergy", e.target.value)} style={STYLES.select}><option value="kcal">kcal</option><option value="kj">kJ</option></select></div>
          <div><label style={STYLES.label}>{t('unit_portion')}</label><select value={form?.unitPortion || "gr"} onChange={e => handleInputChange?.("unitPortion", e.target.value)} style={STYLES.select}><option value="gr">g/ml</option><option value="oz">oz</option></select></div>
          <div style={{ gridColumn: "span 2" }}><label style={STYLES.label}>{t('unit_blood')}</label><select value={form?.unitBlood || "mg/dL"} onChange={e => handleInputChange?.("unitBlood", e.target.value)} style={STYLES.select}><option value="mg/dL">mg/dL</option><option value="mmol/L">mmol/L</option></select></div>
        </div>
      </ProfileAccordion>

      <ProfileAccordion id="tema" icon="🎨" title={t('acc_theme') || "Tema"} isOpen={(openSections || []).includes("tema")} onToggle={toggleSection} C={C}>
        <label style={STYLES.label}>{t('theme_title')}</label>
        <div style={STYLES.grid2}>
          {(THEMES || []).map(theme => (
            <button key={theme.id} onClick={() => handleThemeChange?.(theme.id)} style={STYLES.themeBtn(activeThemeId === theme.id, theme.color, C)}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: theme.color, border: `1px solid rgba(255,255,255,0.2)` }} />
              {t(theme.labelKey) || theme.fallback}
            </button>
          ))}
        </div>
      </ProfileAccordion>
    </>
  );
}