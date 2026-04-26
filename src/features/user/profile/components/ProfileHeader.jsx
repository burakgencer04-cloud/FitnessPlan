import React from 'react';
import { motion } from 'framer-motion';

import { fonts } from '@/shared/utils/uiStyles.js';

const STYLES = {
  langContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `linear-gradient(145deg, rgba(30, 30, 35, 0.7), rgba(15, 15, 20, 0.9))`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", padding: '16px 24px', borderRadius: 32, border: `1px solid rgba(255,255,255,0.08)`, marginBottom: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" },
  langTitle: { fontSize: 16, color: '#fff', fontWeight: 900, fontFamily: fonts.header, display: "flex", alignItems: "center", gap: 12 },
  langIcon: { background: "rgba(255,255,255,0.1)", padding: "8px", borderRadius: 12, border: `1px solid rgba(255,255,255,0.05)` },
  langBtn: { background: `rgba(255,255,255,0.05)`, border: `1px solid rgba(255,255,255,0.1)`, color: '#fff', padding: '10px 16px', borderRadius: 16, fontWeight: 900, cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center', fontFamily: fonts.mono },
  headerBox: { marginBottom: 32 },
  mainTitle: { margin: 0, fontSize: 32, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: "#fff", letterSpacing: "-1px" },
  desc: { fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginTop: 8 },
  idCard: { background: `linear-gradient(145deg, rgba(30, 30, 35, 0.7), rgba(15, 15, 20, 0.9))`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: `1px solid rgba(255, 255, 255, 0.08)`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)", borderRadius: 36, display: 'flex', alignItems: 'center', gap: 24, padding: "32px 28px", marginBottom: 24, position: "relative", overflow: "hidden" },
  glow: (C) => ({ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: C?.green || '#22c55e', filter: 'blur(80px)', opacity: 0.2 }),
  avatarBox: { width: 80, height: 80, borderRadius: 28, background: "rgba(255,255,255,0.1)", display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, border: `1px solid rgba(255,255,255,0.2)`, boxShadow: "inset 0 4px 10px rgba(255,255,255,0.2), 0 10px 20px rgba(0,0,0,0.3)" },
  nameText: { fontSize: 24, fontWeight: 900, color: "#fff", fontFamily: fonts.header, letterSpacing: -0.5, marginBottom: 6 },
  badge: (C) => ({ fontSize: 13, color: C?.green || '#22c55e', fontWeight: 800, background: "rgba(46, 204, 113, 0.15)", padding: "6px 12px", borderRadius: 100, display: "inline-block", border: `1px solid rgba(46, 204, 113, 0.3)` })
};

function LanguageSwitcher({ C = {}, t = (k)=>k, currentLang = 'tr', toggleLanguage }) {
  return (
    <div style={STYLES.langContainer}>
      <div style={STYLES.langTitle}><span style={STYLES.langIcon}>🌐</span> {t('language') || 'Dil / Language'}</div>
      <motion.button whileTap={{ scale: 0.9 }} onClick={toggleLanguage} style={STYLES.langBtn}>
        <span style={{ opacity: currentLang.startsWith('tr') ? 1 : 0.3, color: currentLang.startsWith('tr') ? (C?.green || '#22c55e') : '#fff' }}>TR</span>
        <span style={{ opacity: 0.2 }}>|</span>
        <span style={{ opacity: currentLang.startsWith('en') ? 1 : 0.3, color: currentLang.startsWith('en') ? (C?.green || '#22c55e') : '#fff' }}>EN</span>
      </motion.button>
    </div>
  );
}

export default function ProfileHeader({ user = {}, form = {}, toggleLanguage, currentLang, C = {}, t = (k)=>k }) {
  return (
    <div style={STYLES.headerBox}>
      <div style={STYLES.headerBox}>
        <h2 style={STYLES.mainTitle}>{t('profile_title') || 'Profilim'} <span style={{ fontSize: 28 }}>👤</span></h2>
        <div style={STYLES.desc}>{t('profile_desc') || 'Kişisel verilerini yönet'}</div>
      </div>

      <div style={STYLES.idCard}>
         <div style={STYLES.glow(C)} />
         <div style={STYLES.avatarBox}>{user?.avatar || "🥷"}</div>
         <div>
           <div style={STYLES.nameText}>{form?.firstName ? `${form?.firstName} ${form?.lastName || ""}` : (user?.name || "Warrior")}</div>
           <div style={STYLES.badge(C)}>{t('prof_warrior') || 'Savaşçı'}</div>
         </div>
      </div>

      <LanguageSwitcher C={C} t={t} currentLang={currentLang} toggleLanguage={toggleLanguage} />
    </div>
  );
}