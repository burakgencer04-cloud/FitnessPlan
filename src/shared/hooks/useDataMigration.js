// src/shared/hooks/useDataMigration.js
import { useEffect, useState } from 'react';
import { useAppStore } from '@/app/store.js';
import { db } from '@/shared/db/db.js';

export const useDataMigration = () => {
    // Uygulama açılışında migration yapılıp yapılmadığını takip eden state
    const [isMigrating, setIsMigrating] = useState(true);
    
    // Zustand'dan eski veriyi ve temizleme fonksiyonunu çekiyoruz
    const oldWeightLog = useAppStore(state => state.weightLog);
    const clearOldWeightLog = useAppStore(state => state.clearOldWeightLog);

    useEffect(() => {
        let isMounted = true;

        const runMigration = async () => {
            try {
                // 1. Kontrol: Zustand'da weightLog yoksa veya boşsa göçe gerek yok
                if (!oldWeightLog || Object.keys(oldWeightLog).length === 0) {
                    if (isMounted) setIsMigrating(false);
                    return;
                }

                // Dexie'de halihazırda veri var mı kontrolü (Tekrar eden göçü önlemek için)
                const existingCount = await db.weightLogs.count();
                if (existingCount > 0) {
                    // Eğer Dexie dolu ama Zustand hala temizlenmemişse, sadece Zustand'ı temizle
                    clearOldWeightLog();
                    if (isMounted) setIsMigrating(false);
                    return;
                }

                console.log('🔄 Eski Zustand weightLog verisi tespit edildi. Dexie.js migrasyonu başlatılıyor...');

                // 2. Dönüşüm: Eski key-value formatını Dexie'nin düz dizi (flat array) formatına çeviriyoruz
                const dexieEntries = [];
                for (const [exerciseName, logs] of Object.entries(oldWeightLog)) {
                    if (Array.isArray(logs)) {
                        logs.forEach(log => {
                            dexieEntries.push({
                                exerciseName: exerciseName,
                                date: log.date,
                                weight: Number(log.weight) || 0,
                                reps: Number(log.reps) || 0,
                                e1rm: Number(log.e1rm) || 0,
                                synced: false // Firebase senkronizasyonu için
                            });
                        });
                    }
                }

                // 3. Yazma: Dexie'ye topluca (bulk) yazıyoruz. Bu işlem RAM şişmesini önler.
                if (dexieEntries.length > 0) {
                    await db.weightLogs.bulkAdd(dexieEntries);
                    console.log(`✅ ${dexieEntries.length} adet idman seti başarıyla IndexedDB'ye (Dexie) taşındı.`);
                }

                // 4. Temizlik: Başarılı göç sonrası Zustand'daki o devasa objeyi siliyoruz!
                clearOldWeightLog();
                
            } catch (error) {
                console.error('❌ Dexie.js Migrasyon hatası:', error);
            } finally {
                if (isMounted) setIsMigrating(false);
            }
        };

        runMigration();

        // Temizleme fonksiyonu (Component unmount olursa state güncellemelerini durdurmak için)
        return () => {
            isMounted = false;
        };
    }, []); // Bağımlılık dizisi boş, sadece bileşen ilk mount olduğunda çalışır

    return isMigrating;
};