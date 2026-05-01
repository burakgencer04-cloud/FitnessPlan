
import { useState, useCallback } from 'react';

export function useAppToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((icon, text) => { 
    setToast({ icon, text }); 
    setTimeout(() => setToast(null), 3000); 
  }, []);

  return { toast, showToast };
}