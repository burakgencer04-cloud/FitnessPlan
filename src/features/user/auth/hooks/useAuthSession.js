import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/shared/api/firebase.js';
import { requestNotificationPermission, listenForegroundMessages } from '@/shared/api/messagingService.js';
import { HapticEngine } from '@/shared/lib/hapticSoundEngine.js';

export function useAuthSession(showToast) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => { 
      setCurrentUser(authUser); 
      setIsAuthLoading(false); 
      if (authUser && authUser.uid) {
        requestNotificationPermission(authUser.uid);
      }
    });

    const unsubscribeMessages = listenForegroundMessages((payload) => {
       const title = payload?.notification?.title || "Yeni Bildirim";
       const body = payload?.notification?.body || "";
       if (showToast) showToast("🔔", `${title}: ${body}`);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [showToast]);

  const handleLogout = async () => { 
    try { 
      await signOut(auth); 
      HapticEngine?.medium?.(); 
    } catch (err) {} 
  };

  return { currentUser, isAuthLoading, handleLogout };
}