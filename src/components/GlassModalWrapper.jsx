import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlassModalWrapper({ isOpen, onClose, maxWidth = 480, children, C }) {
  // Tema rengi gelmezse çökmemesi için güvenlik (Fallback)
  const safeC = C || { card: '#1e293b', bg: '#0f172a', border: '#334155', text: '#f8fafc' };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} 
          onClick={onClose}
        >
          {/* Derin Arka Plan Bulanıklığı */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }} />
          
          {/* Ana Modal Container (Glassmorphism) */}
          <motion.div 
            initial={{ scale: 0.95, y: 30 }} 
            animate={{ scale: 1, y: 0 }} 
            exit={{ scale: 0.95, y: 30 }} 
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()} // Arka plana tıklamayı engeller
            style={{ 
              background: `linear-gradient(145deg, ${safeC.card}E6, ${safeC.bg}CC)`, 
              borderRadius: 32, 
              width: '100%', 
              maxWidth: maxWidth, 
              border: `1px solid rgba(255,255,255,0.1)`, 
              boxShadow: "0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)", 
              maxHeight: '85vh', 
              display: "flex", 
              flexDirection: "column", 
              position: "relative", 
              zIndex: 1, 
              backdropFilter: "blur(32px)", 
              WebkitBackdropFilter: "blur(32px)",
              overflow: "hidden"
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}