import { create } from 'zustand';

const useModalStore = create((set) => ({
  isOpen: false,
  type: 'alert', // 'alert' veya 'confirm'
  title: '',
  message: '',
  confirmText: 'Tamam',
  cancelText: 'İptal',
  onConfirm: null,
  onCancel: null,

  // 🔥 YENİ VE STANDART API (Tüm uygulamanın kullanacağı ana fonksiyon)
  openModal: (config) => set({
    isOpen: true,
    type: config.type || 'alert',
    title: config.title || 'Bilgi',
    message: config.message || '',
    confirmText: config.confirmText || 'Tamam',
    cancelText: config.cancelText || 'İptal',
    onConfirm: config.onConfirm || null,
    onCancel: config.onCancel || null,
  }),

  closeModal: () => set({ 
    isOpen: false, 
    onConfirm: null, 
    onCancel: null 
  }),

  // 🛡️ GERİYE DÖNÜK UYUMLULUK ZIRHI (Eski kodlar patlamasın diye)
  showAlert: (title, message) => set({
    isOpen: true, type: 'alert', title, message, confirmText: 'Tamam', onConfirm: null
  }),
  
  showConfirm: (title, message, onConfirm) => set({
    isOpen: true, type: 'confirm', title, message, confirmText: 'Evet', cancelText: 'Hayır', onConfirm
  })
}));

export default useModalStore;