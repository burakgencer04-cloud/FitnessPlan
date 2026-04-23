// 🔥 BUG 2 FIX: Türkçe UI tarihlerini ("12 Nis") matematiksel Date objelerine çeviren parser
const parseTurkishDate = (dateStr) => {
  if (!dateStr) return new Date();

  const timestamp = Date.parse(dateStr);
  if (!isNaN(timestamp)) return new Date(timestamp); // Zaten geçerliyse dön

  const months = {
    "oca": 0, "şub": 1, "mar": 2, "nis": 3, "may": 4, "haz": 5,
    "tem": 6, "ağu": 7, "eyl": 8, "eki": 9, "kas": 10, "ara": 11
  };

  const parts = dateStr.trim().split(" ");
  if (parts.length >= 2) {
    const day = parseInt(parts[0], 10);
    const monthKey = parts[1].toLowerCase().slice(0, 3);
    const monthIndex = months[monthKey];

    if (!isNaN(day) && monthIndex !== undefined) {
      const now = new Date();
      let year = now.getFullYear();
      
      // Kayıt mesela "25 Ara" ama şu an "Ocak" ise, o Aralık geçen senedir.
      if (monthIndex > now.getMonth() + 2) year--;
      return new Date(year, monthIndex, day);
    }
  }
  return new Date(); 
};

export const calculateTrend = (measurements, targetWeight) => {
  if (!measurements || measurements.length < 2) return null;

  // 🔥 TERTEMİZ: ISO formatı olduğu için Native Date parser kusursuz çalışır
  const sorted = [...measurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const startMs = new Date(sorted[0].date).getTime();
  
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  const n = sorted.length;

  const points = sorted.map(m => {
    const x = (parseTurkishDate(m.date).getTime() - startMs) / (1000 * 60 * 60 * 24);
    const y = parseFloat(m.weight || m.value); 
    
    if (!isNaN(x) && !isNaN(y)) {
       sumX += x; sumY += y; sumXY += x * y; sumXX += x * x;
    }
    return { x, y, date: m.date, weight: y };
  });

  const slope = (n * sumXX - sumX * sumX) === 0 ? 0 : (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const lastPoint = points[points.length - 1];
  const projectionData = [];

  for (let i = 7; i <= 28; i += 7) {
    const projX = lastPoint.x + i;
    const projY = slope * projX + intercept;
    if (projY > 0 && projY < 300) {
        projectionData.push({
          date: `+${i} Gün`,
          projectedWeight: parseFloat(projY.toFixed(1)),
          projectedValue: parseFloat(projY.toFixed(1)) 
        });
    }
  }

  let targetMessage = "Veriler analiz ediliyor, bir sonraki ölçümü girmelisin.";

  if (targetWeight && slope !== 0) {
    const targetX = (targetWeight - intercept) / slope;
    const daysToTarget = Math.round(targetX - lastPoint.x);

    if (daysToTarget > 0 && daysToTarget < 730) { 
       const weeks = Math.max(1, Math.round(daysToTarget / 7));
       targetMessage = `📉 Harika gidiyorsun! Bu hızla devam edersen hedefine yaklaşık ${weeks} hafta içinde ulaşacaksın.`;
    } else if (daysToTarget <= 0 && ((slope < 0 && lastPoint.y <= targetWeight) || (slope > 0 && lastPoint.y >= targetWeight))) {
       targetMessage = "🎉 Hedefine zaten ulaştın! Şimdi koruma (maintain) zamanı.";
    } else {
       targetMessage = "⚠️ Kilo gidişatın hedefinle ters yönde veya plato yapıyor. Kalori dengeni gözden geçirmelisin.";
    }
  } else if (slope < 0) {
    targetMessage = "📉 Düzenli bir düşüş trendindesin, iyi iş!";
  } else if (slope > 0) {
    targetMessage = "📈 Kilon yukarı yönlü bir trendde.";
  }

  return { slope, projectionData, targetMessage };
};


 

  // 🔥 BUG FIX: Tarihleri Türkçe ayrıştırıcıdan geçirerek sıralıyoruz
  const sorted = [...measurements].sort((a, b) => parseTurkishDate(a.date).getTime() - parseTurkishDate(b.date).getTime());
  const startMs = parseTurkishDate(sorted[0].date).getTime();
  
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  const n = sorted.length;

  const points = sorted.map(m => {
    // 🔥 BUG FIX: Gün farklarını hesaplarken Türkçe ayrıştırıcı kullan
    const x = (parseTurkishDate(m.date).getTime() - startMs) / (1000 * 60 * 60 * 24);
    const y = parseFloat(m.weight || m.value); // Hem eski m.weight hem de yeni m.value'yu destekler
    
    // Güvenlik kontrolü (NaN sızmasın diye)
    if (!isNaN(x) && !isNaN(y)) {
       sumX += x; sumY += y; sumXY += x * y; sumXX += x * x;
    }
    
    return { x, y, date: m.date, weight: y };
  });

  // Lineer Regresyon Formülü (y = mx + b)
  const slope = (n * sumXX - sumX * sumX) === 0 ? 0 : (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const lastPoint = points[points.length - 1];
  const projectionData = [];

  // 4 Haftalık Gelecek Projeksiyonu (7'şer günlük adımlar)
  for (let i = 7; i <= 28; i += 7) {
    const projX = lastPoint.x + i;
    const projY = slope * projX + intercept;
    
    // Gerçekçi sınırlar (Kilo negatif veya uçuk olamaz)
    if (projY > 0 && projY < 300) {
        projectionData.push({
          date: `+${i} Gün`,
          projectedWeight: parseFloat(projY.toFixed(1)),
          projectedValue: parseFloat(projY.toFixed(1)) // İki grafikle de uyumlu çalışması için
        });
    }
  }

  let targetMessage = "Veriler analiz ediliyor, bir sonraki ölçümü girmelisin.";

  // Hedef Kilo Hesaplaması ve Mesaj Üretimi
  if (targetWeight && slope !== 0) {
    const targetX = (targetWeight - intercept) / slope;
    const daysToTarget = Math.round(targetX - lastPoint.x);

    if (daysToTarget > 0 && daysToTarget < 730) { // 2 yıldan kısa süreyse
       const weeks = Math.max(1, Math.round(daysToTarget / 7));
       targetMessage = `📉 Harika gidiyorsun! Bu hızla devam edersen hedefine yaklaşık ${weeks} hafta içinde ulaşacaksın.`;
    } else if (daysToTarget <= 0 && ((slope < 0 && lastPoint.y <= targetWeight) || (slope > 0 && lastPoint.y >= targetWeight))) {
       targetMessage = "🎉 Hedefine zaten ulaştın! Şimdi koruma (maintain) zamanı.";
    } else {
       targetMessage = "⚠️ Kilo gidişatın hedefinle ters yönde veya plato yapıyor. Kalori dengeni gözden geçirmelisin.";
    }
  } else if (slope < 0) {
    targetMessage = "📉 Düzenli bir düşüş trendindesin, iyi iş!";
  } else if (slope > 0) {
    targetMessage = "📈 Kilon yukarı yönlü bir trendde.";
  }

 
;