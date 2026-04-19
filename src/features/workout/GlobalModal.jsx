import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useModalStore from '../store/useModalStore';

export default function GlobalModal() {
  // Store'dan verileri çekiyoruz
  const { isOpen, title, message, type, confirmText, cancelText, confirmColor, onConfirm, closeModal } = useModalStore();

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeModal();
  };

  // DİKKAT: "if (!isOpen) return null;" satırını sildik! 
  // AnimatePresence'ın çalışması için koşul içeride olmalı.
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          style={{ 
            position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', 
            justifyContent: 'center', padding: '20px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' 
          }}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }} 
            animate={{ scale: 1, y: 0 }} 
            exit={{ scale: 0.9, y: 20 }}
            style={{ 
              background: 'linear-gradient(145deg, rgba(30,30,30,0.9), rgba(20,20,20,0.95))', 
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '28px', padding: '24px', 
              width: '100%', maxWidth: '340px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', 
              color: '#fff', textAlign: 'center' 
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }}>
              {type === 'confirm' ? (confirmColor === '#ef4444' ? '🗑️' : '🤔') : '💡'}
            </div>
            
            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: '900', letterSpacing: '0.5px' }}>{title}</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5' }}>{message}</p>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              {type === 'confirm' && (
                <motion.button 
                  whileTap={{ scale: 0.95 }} onClick={closeModal}
                  style={{ flex: 1, padding: '14px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {cancelText}
                </motion.button>
              )}
              <motion.button 
                whileTap={{ scale: 0.95 }} onClick={handleConfirm}
                style={{ flex: 1, padding: '14px', borderRadius: '16px', border: 'none', background: confirmColor, color: '#fff', fontWeight: 'bold', cursor: 'pointer', boxShadow: `0 4px 15px ${confirmColor}50` }}
              >
                {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}