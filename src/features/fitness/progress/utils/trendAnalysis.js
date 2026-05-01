import { parseLogDateStr } from '@/shared/utils/dateUtils.js';
// Türkçe UI tarihlerini ("12 Nis") matematiksel Date objelerine çeviren parser
const parseTurkishDate = (dateStr) => {
  if (!dateStr) return new Date();
  

  const timestamp = Date.parse(dateStr);
  if (!isNaN(timestamp)) return new Date(timestamp); // Zaten geçerli bir ISO tarihiyse dön

  const months = {
    "oca": 0, "şub": 1, "mar": 2, "nis": 3, "may": 4, "haz": 5,
    "tem": 6, "ağu": 7, "eyl": 8, "eki": 9, "kas": 10, "ara": 11
  };

  const parts = dateStr.trim().split(" ");
  if (parts?.length >= 2) {
    const day = parseInt(parts[0], 10);
    const monthKey = parts[1].toLowerCase().slice(0, 3);
    const monthIndex = months[monthKey];

    if (!isNaN(day) && monthIndex !== undefined) {
      const now = new Date();
      let year = now.getFullYear();
      
      // Kayıt "25 Ara" ama şu an "Ocak" ise, o Aralık geçen seneye aittir.
      if (monthIndex > now.getMonth() + 2) year--;
      return new Date(year, monthIndex, day);
    }
  }
  return new Date(); 
};

export const calculateTrend = (dataArray = [], targetWeight = null) => {
  // 🔥 ZIRH: Eğer veri yoksa veya dizi değilse çökmesini engelle
  const safeData = Array.isArray(dataArray) ? dataArray : [];

  if (safeData?.length === 0) {
    return { 
      weightTrendData: [], 
      targetMessage: "Henüz yeterli ölçüm verisi yok. İlerlemeyi görmek için tartıl!" 
    };
  }

  // Tarihe göre eskiden yeniye sırala
  const sortedData = [...safeData].sort((a, b) => parseTurkishDate(a.date) - parseTurkishDate(b.date));

  // Grafik verisine (X, Y düzlemine) çevir
  const chartData = sortedData.map(item => ({
    date: item.date,
    weight: parseFloat(item.weight) || 0,
  }));

  // Lineer Regresyon (Eğilim Çizgisi) Hesaplaması
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  const n = chartData?.length;

  chartData.forEach((point, i) => {
    sumX += i;
    sumY += point.weight;
    sumXY += i * point.weight;
    sumXX += i * i;
  });

  const denominator = (n * sumXX - sumX * sumX);
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const intercept = n === 0 ? 0 : (sumY - slope * sumX) / n;

  // Gerçek verilere "Projected Value" (Trend/Tahmin Değeri) ekle
  const weightTrendData = chartData.map((point, i) => ({
    ...point,
    projectedValue: parseFloat((slope * i + intercept).toFixed(1))
  }));

  // Gelecek 3 günün tahminini (projeksiyonunu) grafiğin sonuna ekle
  if (n > 1 && slope !== 0) {
    for (let i = 1; i <= 3; i++) {
      const projX = n - 1 + i;
      const projY = slope * projX + intercept;

      if (projY > 20 && projY < 300) { // Uçuk / Mantıksız değerleri filtrele
        weightTrendData.push({
          date: `+${i} Gün`,
          projectedValue: parseFloat(projY.toFixed(1))
        });
      }
    }
  }

  let targetMessage = "Veriler analiz ediliyor, trendi net görmek için bir ölçüm daha girmelisin.";

  // Hedefe Kalan Süre Hesaplaması ve Motivasyon Mesajı
  if (targetWeight && slope !== 0 && n > 1) {
    const lastPointY = chartData[n - 1].weight;
    const targetW = parseFloat(targetWeight);

    // Kilo verme trendinde hedefin altına inmişse VEYA kilo alma trendinde hedefin üstüne çıkmışsa
    if ((slope < 0 && lastPointY <= targetW) || (slope > 0 && lastPointY >= targetW)) {
      targetMessage = "🎉 Hedefine ulaştın! Şimdi bu formu koruma zamanı.";
    } else {
      const targetX = (targetW - intercept) / slope;
      const daysToTarget = Math.round(targetX - (n - 1));

      if (daysToTarget > 0 && daysToTarget < 730) {
        const weeks = Math.max(1, Math.round(daysToTarget / 7));
        targetMessage = `📉 Harika gidiyorsun! Bu istikrarla yaklaşık ${weeks} hafta içinde hedefine ulaşacaksın.`;
      } else if (daysToTarget >= 730) {
        targetMessage = "Hedefine ulaşmak için diyet ve idman istikrarını biraz daha artırmalısın.";
      }
    }
  }

  return { weightTrendData, targetMessage };
};