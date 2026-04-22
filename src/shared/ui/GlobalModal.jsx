import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// DÜZELTİLEN IMPORT YOLU: İki üst klasöre çık, core içine gir
import useModalStore from '@/shared/store/useModalStore'; 

export default function GlobalModal() {
  const { isOpen, type, props, closeModal } = useModalStore();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}
        onClick={closeModal}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          style={{
            background: '#0f1422', // Tema rengin (midnight card)
            border: '1px solid #1e293b',
            borderRadius: 24,
            padding: 24,
            maxWidth: 400,
            width: '100%',
            color: '#f8fafc',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
          onClick={(e) => e.stopPropagation()} // Tıklamanın arkaya geçmesini engeller
        >
          {/* Modal başlığı ve içeriği (İleride type'a göre özelleştirebilirsin) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 24 }}>{props?.icon || 'ℹ️'}</span>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{props?.title || 'Bilgi'}</h2>
          </div>
          
          <p style={{ margin: '0 0 24px 0', fontSize: 15, color: '#94a3b8', lineHeight: 1.5 }}>
            {props?.message || 'Bu bir sistem bildirimidir.'}
          </p>

          <button
            onClick={closeModal}
            style={{
              width: '100%',
              background: '#3b82f6', // Tema mavisi
              color: '#fff',
              border: 'none',
              padding: '14px',
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {props?.buttonText || 'Anladım'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}