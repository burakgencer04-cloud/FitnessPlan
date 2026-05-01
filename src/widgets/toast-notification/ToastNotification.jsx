import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fonts } from '@/shared/ui/uiStyles.js';

export const ToastNotification = memo(({ toast, themeColors: C }) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div 
          initial={{ opacity: 0, y: -50, x: "-50%" }} 
          animate={{ opacity: 1, y: 0, x: "-50%" }} 
          exit={{ opacity: 0, y: -50, x: "-50%" }} 
          style={{ 
            position: "absolute", top: 24, left: "50%", 
            background: C.card, border: `1px solid ${C.green}`, 
            padding: "14px 24px", borderRadius: 20, zIndex: 10000, 
            display: "flex", alignItems: "center", gap: 12 
          }}
        >
          <span style={{ fontSize: 24 }}>{toast.icon}</span>
          <span style={{ fontSize: 15, color: C.text, fontWeight: 800, fontFamily: fonts.header }}>
            {toast.text}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
});