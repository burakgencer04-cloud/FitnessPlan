import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { auth } from '@/shared/api/firebase.js'; 
import { logger } from '@/shared/lib/logger.js';

export const uploadProgressPhoto = async (base64String) => {
  try {
    const storage = getStorage();
    const userId = auth.currentUser?.uid || "guest";
    const tempId = Date.now();
    const storageRef = ref(storage, `progress_photos/${userId}/${tempId}.jpg`);

    await uploadString(storageRef, base64String, 'data_url');
    const downloadURL = await getDownloadURL(storageRef);
    
    return { downloadURL, tempId };
  } catch (error) {
    logger.error("Fotoğraf Firebase'e yüklenirken hata oluştu:", error);
    throw error;
  }
};