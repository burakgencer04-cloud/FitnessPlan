import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STYLES = {
  toast: (C) => ({ position: "fixed", top: 20, left: 20, right: 20, background: C?.green || '#22c55e', color: "#000", padding: 16, borderRadius: 20, fontWeight: 900, textAlign: "center", zIndex: 10000, boxShadow: `0 10px 30px rgba(46, 204, 113, 0.4)` })
};

export default function ProfileModals({ logic, C = {} }) {
  if (!logic) return null;
  const { toast } = logic;

  return (
    <AnimatePresence mode="wait">
      {!!toast && (
        <motion.div key="toast-modal" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} style={STYLES.toast(C)}>
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}