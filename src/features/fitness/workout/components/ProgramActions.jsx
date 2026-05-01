import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

import { fonts } from '@/shared/ui/uiStyles.js';

const STYLES = {
  overlay: { position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', flexDirection: "column", alignItems: 'center', justifyContent: 'flex-end', padding: "20px 0 0 0" },
  bgBlur: { position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" },
  modalContent: { background: "rgba(20, 20, 25, 0.85)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)", borderTopLeftRadius: 40, borderTopRightRadius: 40, width: '100%', maxWidth: 640, height: "85vh", display: "flex", flexDirection: "column", position: "relative", zIndex: 1, borderTop: `1px solid rgba(255,255,255,0.1)`, boxShadow: "0 -20px 60px rgba(0,0,0,0.6)" },
  setupOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" },
  setupContent: { background: "rgba(20, 20, 25, 0.8)", backdropFilter: "blur(40px)", borderRadius: 40, padding: 36, width: '100%', maxWidth: 420, border: `1px solid rgba(255,255,255,0.1)`, boxShadow: `0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)` }
};

export const ExerciseModal = ({ show, onClose, onAdd, C = {}, combinedDB = [], t = (k)=>k }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Tümü");

  const categories = useMemo(() => [
    { id: "Tümü", label: t('prog_cat_all') || "Tümü" }, { id: "Göğüs", label: t('prog_cat_chest') || "Göğüs" }, { id: "Sırt", label: t('prog_cat_back') || "Sırt" },
    { id: "Bacak", label: t('prog_cat_legs') || "Bacak" }, { id: "Omuz", label: t('prog_cat_shoulders') || "Omuz" }, { id: "Kol", label: t('prog_cat_arms') || "Kol" }, { id: "Karın", label: t('prog_cat_core') || "Karın" }
  ], [t]);

  const filteredDB = useMemo(() => (combinedDB || []).filter(ex => {
    const matchesSearch = (ex?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "Tümü" || ex?.target === filter;
    return matchesSearch && matchesFilter;
  }), [combinedDB, search, filter]);

  if (!show) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={STYLES.overlay}>
      <div style={STYLES.bgBlur} onClick={onClose} />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 220 }} style={STYLES.modalContent}>
        <div style={{ padding: "24px 24px 12px 24px" }}>
          <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 4, margin: "0 auto 20px auto" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontFamily: fonts.header, fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>{t('prog_add_ex_title') || "Egzersiz Ekle"}</h3>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: `none`, color: "#fff", width: 32, height: 32, borderRadius: "50%", cursor: 'pointer', fontWeight: 900 }}>✕</button>
          </div>
          <input type="text" placeholder={t('prog_search_ex') || "Egzersiz ara..."} value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: `1px solid rgba(255,255,255,0.08)`, color: "#fff", padding: "16px 20px", borderRadius: 16, outline: "none", fontFamily: fonts.mono, fontSize: 15, marginBottom: 20, boxSizing: "border-box" }} />
          <div className="hide-scrollbar" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
            <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setFilter(cat.id)} style={{ flexShrink: 0, background: filter === cat.id ? "#fff" : "rgba(255,255,255,0.05)", color: filter === cat.id ? "#000" : "rgba(255,255,255,0.6)", border: filter === cat.id ? `1px solid #fff` : `1px solid rgba(255,255,255,0.1)`, padding: "10px 20px", borderRadius: 100, fontWeight: 800, fontSize: 13, cursor: "pointer", transition: "all 0.2s ease" }}>{cat.label}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 30px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredDB.map((ex, i) => (
            <motion.div key={i} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => onAdd(ex)} style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.04), rgba(0,0,0,0.2))`, border: `1px solid rgba(255,255,255,0.05)`, padding: "18px 20px", borderRadius: 24, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: fonts.header }}>{ex?.name} {ex?.isCustom && <span style={{ fontSize: 12, color: C?.yellow }}>⭐</span>}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, marginTop: 6, textTransform: "uppercase" }}>{ex?.target || t('prog_cat_other')}</div>
              </div>
              <div style={{ background: `rgba(46, 204, 113, 0.15)`, color: C?.green, width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, border: `1px solid rgba(46, 204, 113, 0.3)` }}>+</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export const PresetSetupModal = ({ presetSetup, setPresetSetup, isBeginnerMode, setIsBeginnerMode, confirmPresetLoad, C = {}, t = (k)=>k }) => {
  if (!presetSetup) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={STYLES.setupOverlay}>
      <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} style={STYLES.setupContent}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ fontSize: 48, marginBottom: 16, filter: `drop-shadow(0 0 15px ${presetSetup?.color || '#fff'}80)` }}>{presetSetup?.icon || "💪"}</div>
          <h3 style={{ margin: 0, fontFamily: fonts.header, fontStyle: "italic", fontSize: 26, fontWeight: 900, color: "#fff" }}>{t('prog_setup_title') || "Program Kurulumu"}</h3>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 6, fontWeight: 600 }}>{presetSetup?.name}</div>
        </div>
        <div onClick={() => setIsBeginnerMode(!isBeginnerMode)} style={{ background: isBeginnerMode ? `rgba(46, 204, 113, 0.15)` : "rgba(0,0,0,0.4)", border: `1px solid ${isBeginnerMode ? (C?.green || '#22c55e') : "rgba(255,255,255,0.1)"}`, padding: 24, borderRadius: 24, cursor: "pointer", display: "flex", gap: 16, alignItems: "center", transition: "all 0.3s ease" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, border: `2px solid ${isBeginnerMode ? (C?.green || '#22c55e') : "rgba(255,255,255,0.3)"}`, background: isBeginnerMode ? (C?.green || '#22c55e') : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {isBeginnerMode && <span style={{ color: "#000", fontWeight: 900 }}>✓</span>}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, fontFamily: fonts.header, color: "#fff", marginBottom: 6 }}>{t('prog_beginner_mode') || "Yeni Başlayan Modu"}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{t('prog_beginner_desc') || "Setleri azaltır."}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 40 }}>
          <button onClick={() => setPresetSetup(null)} style={{ flex: 1, padding: "18px", borderRadius: 20, border: `1px solid rgba(255,255,255,0.1)`, background: "transparent", color: "#fff", fontWeight: 800, cursor: "pointer" }}>{t('prog_btn_cancel_setup') || "İptal"}</button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={confirmPresetLoad} style={{ flex: 2, padding: "18px", borderRadius: 20, border: "none", background: `linear-gradient(135deg, ${presetSetup?.color || '#2563eb'}, #2563eb)`, color: "#fff", fontWeight: 900, cursor: "pointer", fontFamily: fonts.header }}>{t('prog_btn_confirm_setup') || "Sistemi Yükle"}</motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};