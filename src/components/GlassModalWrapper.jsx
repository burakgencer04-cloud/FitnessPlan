import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlassModalWrapper({ isOpen, onClose, maxWidth = 480, children, C }) {
  const safeC = C || { card: '#0d0d0f', bg: '#000', border: '#1e1e26', text: '#fff' };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            display: 'flex', alignItems: 'flex-end',
            padding: '0',
          }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute", inset: 0,
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)"
            }}
          />

          {/* Modal sheet — slides up from bottom */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            onClick={e => e.stopPropagation()}
            style={{
              position: "relative", zIndex: 1,
              width: "100%",
              maxWidth: maxWidth,
              margin: "0 auto",
              background: `linear-gradient(170deg, ${safeC.card}F8 0%, ${safeC.bg}F0 100%)`,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              borderTop: "1px solid rgba(255,255,255,0.08)",
              borderLeft: "1px solid rgba(255,255,255,0.04)",
              borderRight: "1px solid rgba(255,255,255,0.04)",
              boxShadow: "0 -24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Drag handle */}
            <div style={{
              width: 40, height: 4,
              borderRadius: 9999,
              background: "rgba(255,255,255,0.12)",
              margin: "14px auto -4px",
              flexShrink: 0,
            }} />

            {/* Scrollable content */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
