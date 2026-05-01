// src/shared/db/db.js
import Dexie from 'dexie';

export const db = new Dexie('FitnessAppDB');

// Şema (Schema) Tanımı:
// ++id: Otomatik artan (Auto-increment) birincil anahtar
// exerciseName, date: Sorgulama (query) yapacağımız indeksli alanlar
db.version(1).stores({
    weightLogs: '++id, exerciseName, date, synced' 
});