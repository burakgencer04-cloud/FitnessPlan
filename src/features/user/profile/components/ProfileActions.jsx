import React from 'react';
import { motion } from 'framer-motion';

import { fonts } from '@/shared/utils/uiStyles.js';

const STYLES = {
  wrapper: { position: "fixed", bottom: 100, left: 0, right: 0, display: "flex", justifyContent: "center", padding: "0 20px", zIndex: 100, transform: "translateZ(0)", pointerEvents: "none" },
  btn: (C) => ({ pointerEvents: "auto", width: "100%", maxWidth: 400, background: `linear-gradient(135deg, ${C?.green || '#22c55e'}, #22c55e)`, border: "none", borderRadius: 100, color: "#000", fontWeight: 900, padding: "24px", cursor: "pointer", fontSize: 16, letterSpacing: -0.5, fontFamily: fonts.header, boxShadow: `0 15px 35px rgba(46, 204, 113, 0.4), inset 0 2px 5px rgba(255,255,255,0.4)` })
};

export default function ProfileActions({ handleSaveAll, C = {}, t = (k)=>k }) {
  return (
    <div style={STYLES.wrapper}>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={handleSaveAll} style={STYLES.btn(C)}>
        {t('prof_save_btn') || "Değişiklikleri Kaydet"}
      </motion.button>
    </div>
  );
}