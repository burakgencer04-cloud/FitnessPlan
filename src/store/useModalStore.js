import { create } from 'zustand';

const useModalStore = create((set) => ({
  isOpen: false,
  title: "",
  message: "",
  type: "alert", // "alert" (sadece tamam butonu) veya "confirm" (onay/iptal butonları)
  confirmText: "Tamam",
  cancelText: "İptal",
  confirmColor: "#3b82f6", // Varsayılan buton rengi (Mavi)
  onConfirm: null,
  
  // Basit Bilgilendirme Uyarıları İçin (Eski 'alert' yerine)
  showAlert: (title, message) => set({ 
    isOpen: true, title, message, type: "alert", 
    confirmText: "Anladım", confirmColor: "#3b82f6", onConfirm: null 
  }),
  
  // Onay İsteyen Durumlar İçin (Eski 'window.confirm' yerine)
  showConfirm: (title, message, onConfirm, options = {}) => set({ 
    isOpen: true, title, message, type: "confirm", onConfirm,
    confirmText: options.confirmText || "Onayla",
    cancelText: options.cancelText || "İptal",
    confirmColor: options.confirmColor || "#ef4444" // Silme gibi işlemler için varsayılan Kırmızı
  }),
  
  closeModal: () => set({ isOpen: false })
}));

export default useModalStore;