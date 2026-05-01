import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Projendeki yola göre import
import useModalStore from '@/shared/store/useModalStore'; 
import { GLASS_STYLES, LAYOUT } from '@/shared/ui/globalStyles';

export default function GlobalModal({ C }) {
  const { 
    isOpen, type, title, message, 
    inputPlaceholder, initialInputValue, 
    confirmText, cancelText, onConfirm, onCancel, closeModal 
  } = useModalStore();

  // 🔥 YENİ: Input modu için yerel state
  const [inputValue, setInputValue] = useState('');

  // Modal her açıldığında input'u varsayılan değerle sıfırla
  useEffect(() => {
    if (isOpen) {
      setInputValue(initialInputValue || '');
    }
  }, [isOpen, initialInputValue]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      // Eğer input moduysa, yazılan metni geri döndür
      if (type === 'input') {
        onConfirm(inputValue);
      } else {
        onConfirm();
      }
    }
    closeModal();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeModal();
  };

  // Enter tuşuna basıldığında onaylama kolaylığı
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && type === 'input') {
      handleConfirm();
    }
  };

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
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          style={{
            background: '#0f1422', // Temaya uygun (midnight card)
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24,
            padding: 24,
            maxWidth: 400,
            width: '100%',
            color: '#f8fafc',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* MODAL BAŞLIĞI */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 24 }}>
              {type === 'confirm' ? '⚠️' : type === 'input' ? '✏️' : '🔔'}
            </span>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
              {title || 'Bilgi'}
            </h2>
          </div>
          
          {/* MODAL MESAJI */}
          {message && (
            <p style={{ margin: '0 0 20px 0', fontSize: 15, color: '#94a3b8', lineHeight: 1.5 }}>
              {message}
            </p>
          )}

          {/* 🔥 YENİ: INPUT ALANI (Sadece type === 'input' ise görünür) */}
          {type === 'input' && (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={inputPlaceholder}
              autoFocus
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                padding: '16px',
                borderRadius: 16,
                fontSize: 15,
                outline: 'none',
                marginBottom: 24,
                boxSizing: 'border-box',
                transition: 'border 0.2s',
              }}
              onFocus={(e) => e.target.style.border = '1px solid #3b82f6'}
              onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
            />
          )}

          {/* DİNAMİK BUTON ALANI */}
          <div style={{ display: 'flex', gap: 12 }}>
            
            {/* İPTAL BUTONU (Hem confirm hem de input modunda çıkar) */}
            {(type === 'confirm' || type === 'input') && (
              <button
                onClick={handleCancel}
                style={{
                  flex: 1,
                  background: '#1e293b',
                  color: '#fff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: 14,
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
              >
                {cancelText || 'İptal'}
              </button>
            )}

            {/* ANA ONAY BUTONU */}
            <button
              onClick={handleConfirm}
              style={{
                flex: 1,
                background: type === 'confirm' ? '#ef4444' : '#3b82f6',
                color: '#fff',
                border: 'none',
                padding: '14px',
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
                transition: '0.2s',
                boxShadow: type === 'confirm' ? '0 10px 20px rgba(239, 68, 68, 0.2)' : '0 10px 20px rgba(59, 130, 246, 0.2)'
              }}
            >
              {confirmText || 'Anladım'}
            </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}