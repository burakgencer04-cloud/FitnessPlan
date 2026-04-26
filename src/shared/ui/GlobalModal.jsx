import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 🔥 Senin projendeki yola göre import
import useModalStore from '@/shared/store/useModalStore'; 

export default function GlobalModal({ C }) {
  // Bütün değerleri direkt store'dan çekiyoruz
  const { isOpen, type, title, message, confirmText, cancelText, onConfirm, onCancel, closeModal } = useModalStore();

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeModal();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeModal();
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
          transition={{ type: "spring", damping: 25, stiffness: 300 }} // Animasyon biraz daha yaylandırıldı
          style={{
            background: '#0f1422', // Senin teman (midnight card)
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
          {/* MODAL BAŞLIĞI */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 24 }}>
              {/* data.icon ve modalType yerine direkt type değişkeni kullanıldı */}
              {type === 'confirm' ? '⚠️' : '🔔'}
            </span>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
              {/* data.title yerine direkt title */}
              {title || 'Bilgi'}
            </h2>
          </div>
          
          {/* MODAL MESAJI */}
          <p style={{ margin: '0 0 24px 0', fontSize: 15, color: '#94a3b8', lineHeight: 1.5 }}>
            {/* data.message yerine direkt message */}
            {message || 'Bu bir sistem bildirimidir.'}
          </p>

          {/* DİNAMİK BUTON ALANI (Alert vs Confirm) */}
          <div style={{ display: 'flex', gap: 12 }}>
            
            {/* Eğer type 'confirm' ise (Fotoğraf silme, program silme vb.) İPTAL butonu çıkar */}
            {type === 'confirm' && (
              <button
                onClick={handleCancel} // İptale basınca dışarı tıklanmış gibi handleCancel çalışsın
                style={{
                  flex: 1,
                  background: '#1e293b', // Temaya uygun koyu gri buton
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
                {/* data.cancelText yerine cancelText */}
                {cancelText || 'İptal'}
              </button>
            )}

            {/* ANA ONAY BUTONU */}
            <button
              onClick={handleConfirm}
              style={{
                flex: 1,
                background: type === 'confirm' ? '#ef4444' : '#3b82f6', // Silme işlemlerinde Kırmızı, bilgi mesajlarında Mavi
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
              {/* data.confirmText yerine confirmText */}
              {confirmText || 'Anladım'}
            </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}