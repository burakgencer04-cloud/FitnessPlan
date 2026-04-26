import React from 'react';
import { globalFonts as fonts } from '@/shared/ui/globalStyles.js';

const STYLES = {
  headerRow: { background: "linear-gradient(145deg, rgba(15, 15, 20, 0.8) 0%, rgba(40, 40, 45, 0.2) 100%)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.02)", boxShadow: "inset 0 4px 15px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.5)", transform: "translateZ(0)", padding: "20px", marginBottom: 24, display: "flex", flexDirection: "column", gap: 16 },
  title: { margin: 0, fontSize: 26, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic", letterSpacing: -0.5 },
  desc: { fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6, fontStyle: "italic" },
  privacyBtn: (isPrivateProfile, C) => ({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: isPrivateProfile ? "rgba(46, 204, 113, 0.05)" : "rgba(231, 76, 60, 0.05)", padding: "12px 16px", borderRadius: 16, border: `1px solid ${isPrivateProfile ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)'}`, cursor: "pointer", transition: "0.3s" }),
  privacyTextRow: { display: "flex", alignItems: "center", gap: 10 },
  privacyText: (isPrivateProfile, C) => ({ fontSize: 11, color: isPrivateProfile ? (C?.green || '#22c55e') : (C?.red || '#ef4444'), fontWeight: 900, fontStyle: "italic" }),
  toggleBase: (isPrivateProfile, C) => ({ width: 36, height: 20, background: isPrivateProfile ? (C?.green || '#22c55e') : "rgba(255,255,255,0.1)", borderRadius: 20, position: "relative", transition: "0.3s" }),
  toggleKnob: (isPrivateProfile) => ({ width: 16, height: 16, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: isPrivateProfile ? 18 : 2, transition: "0.3s", boxShadow: "0 2px 5px rgba(0,0,0,0.5)" }),
  tabContainer: { display: "flex", gap: 8, marginBottom: 16, background: "rgba(0,0,0,0.4)", padding: 6, borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" },
  tabBtn: (isActive) => ({ flex: 1, padding: "12px", borderRadius: 16, background: isActive ? "rgba(255,255,255,0.1)" : "transparent", border: "none", color: isActive ? "#fff" : "rgba(255,255,255,0.4)", fontWeight: 900, fontSize: 12, fontFamily: fonts.header, fontStyle: "italic", cursor: "pointer", transition: "0.2s" })
};

export default function SocialHeader({ t = (k, fb) => fb || k, isPrivateProfile = true, handleTogglePrivacy, activeTab, setActiveTab, C = {} }) {
  return (
    <>
      <div style={STYLES.headerRow}>
        <div>
          <h2 style={STYLES.title}>{t('soc_title', 'Topluluk & Rekabet')} 🍻</h2>
          <div style={STYLES.desc}>{t('soc_desc', 'Takip et, motive ol, sınırlarını zorla.')}</div>
        </div>
        
        <button onClick={handleTogglePrivacy} style={STYLES.privacyBtn(isPrivateProfile, C)}>
          <div style={STYLES.privacyTextRow}>
            <span style={{ fontSize: 18 }}>{isPrivateProfile ? '🛡️' : '🌍'}</span>
            <span style={STYLES.privacyText(isPrivateProfile, C)}>{isPrivateProfile ? 'Gizlilik Açık: Kilo/Boy Gizli' : 'Gizlilik Kapalı: Profil Herkese Açık'}</span>
          </div>
          <div style={STYLES.toggleBase(isPrivateProfile, C)}><div style={STYLES.toggleKnob(isPrivateProfile)} /></div>
        </button>
      </div>

      <div style={STYLES.tabContainer}>
        <button onClick={() => setActiveTab?.('feed')} style={STYLES.tabBtn(activeTab === 'feed')}>🌐 Akış</button>
        <button onClick={() => setActiveTab?.('leaderboard')} style={STYLES.tabBtn(activeTab === 'leaderboard')}>🏆 Liderler</button>
        <button onClick={() => setActiveTab?.('coop')} style={STYLES.tabBtn(activeTab === 'coop')}>🎮 Co-op</button>
      </div>
    </>
  );
}