import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase.js';
import { useAppStore } from '@/app/store.js';

export const useCoopSession = () => {
  const user = useAppStore(state => state.user);
  const [coopId, setCoopId] = useState(localStorage.getItem('coop_session_id') || null);
  const [coopData, setCoopData] = useState(null);

  // Odayı Canlı Dinle
  useEffect(() => {
    if (!coopId) return;
    const unsub = onSnapshot(doc(db, 'coop_sessions', coopId), (docSnap) => {
      if (docSnap.exists()) {
        setCoopData(docSnap.data());
      } else {
        endSession(); // Oda silinmişse çık
      }
    });
    return () => unsub();
  }, [coopId]);

  // Yeni Oda Kur (6 Haneli Kod Üretir)
  const createRoom = async () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    await setDoc(doc(db, 'coop_sessions', id), {
      status: 'active',
      host: { uid: user?.uid || 'guest', name: user?.displayName || 'Kurucu', volume: 0, lastLog: null, timestamp: Date.now() },
      guest: null
    });
    setCoopId(id);
    localStorage.setItem('coop_session_id', id);
    return id;
  };

  // Odaya Katıl
  const joinRoom = async (id) => {
    const code = id.toUpperCase().trim();
    const docRef = doc(db, 'coop_sessions', code);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
       await updateDoc(docRef, {
         guest: { uid: user?.uid || 'guest2', name: user?.displayName || 'Partner', volume: 0, lastLog: null, timestamp: Date.now() }
       });
       setCoopId(code);
       localStorage.setItem('coop_session_id', code);
       return true;
    }
    return false;
  };

  // Set Bittiğinde Veriyi Firebase'e Ateşle
  const logSet = async (exName, kg, reps, totalVol) => {
    if (!coopId || !coopData) return;
    const isHost = coopData.host?.uid === (user?.uid || 'guest');
    const role = isHost ? 'host' : 'guest';
    const logMsg = `${exName}: ${kg}kg × ${reps}`;

    await updateDoc(doc(db, 'coop_sessions', coopId), {
       [`${role}.volume`]: totalVol,
       [`${role}.lastLog`]: logMsg,
       [`${role}.timestamp`]: Date.now()
    });
  };

  // Oturumu Kapat
  const endSession = () => {
    setCoopId(null);
    setCoopData(null);
    localStorage.removeItem('coop_session_id');
  };

  return { coopId, coopData, createRoom, joinRoom, logSet, endSession };
};