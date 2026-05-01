import { getLocalIsoDate } from "@/shared/utils/dateUtils.js";
import { guessTargetMuscle, predictNextGoal } from './workoutAnalyzer.js';

export const WORKOUT_TIPS = [
  { title: "RIR KURALI (Tükeniş Kontrolü)", text: "Her sette başarısızlığa (tükeniş) gitmek sinir sistemini yorar. Optimal kas gelişimi için hareket formun bozulmadan 1-2 tekrar önce seti bırakmalısın." },
  { title: "PROGRESİF OVERLOAD", text: "Geçen haftadan sadece 1 kg fazla kaldırmak veya 1 tekrar fazla yapmak bile kas gelişimi için yeterli sinyali gönderir. Sürekli artışı hedefle." },
  { title: "NEGATİF KONTROL (Eksantrik)", text: "Ağırlığı kaldırırken hızlı olabilirsin ama indirirken (negatif fazda) kaslarını hissederek, 2-3 saniyede yavaşça indir. Kas hasarı burada oluşur." },
  { title: "ZİHİN - KAS BAĞLANTISI", text: "Sadece ağırlığı A noktasından B noktasına taşımaya odaklanma. Çalıştırdığın kasın kasılıp uzadığını hisset. Zihnin kasında olsun." },
  { title: "DİNLENME SÜRELERİ KANUNU", text: "Bileşke (Squat, Bench) hareketlerde 2-3 dakika, izolasyon (Biceps, Lateral) hareketlerinde 60-90 saniye dinlen. Erken girilen set gücü düşürür." },
  { title: "NEFES TEKNİĞİ", text: "Ağırlığı kaldırırken (zorlandığın kısımda) nefes ver, ağırlığı indirirken (kolay kısımda) nefes al. Nefesini asla tamamen tutma." }
];

export const PART_TO_TARGET = {
  "Baş": "Diğer", "Ense": "Diğer", "Omuz": "Omuz", "Arka Omuz": "Omuz", "Göğüs": "Göğüs",
  "Karın": "Karın", "Sırt": "Sırt", "Trapez": "Sırt", "Bel": "Sırt",
  "Kol (Biceps)": "Kol", "Arka Kol (Triceps)": "Kol", "Ön Kol": "Kol",
  "Bacak (Quad)": "Bacak", "Arka Bacak": "Bacak", "Kalça": "Bacak", "Baldır": "Bacak"
};

// ============================================================================
// 🤖 ZEKİ HEDEFLER: PROGRESİF OVERLOAD TAHMİN ALGORİTMASI
// ============================================================================