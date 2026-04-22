export const calculateTrend = (measurements, targetWeight) => {
  if (!measurements || measurements.length < 2) return null;

  const sorted = [...measurements].sort((a, b) => new Date(a.date) - new Date(b.date));
  const startMs = new Date(sorted[0].date).getTime();
  
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  const n = sorted.length;

  const points = sorted.map(m => {
    const x = (new Date(m.date).getTime() - startMs) / (1000 * 60 * 60 * 24);
    const y = parseFloat(m.weight);
    sumX += x; sumY += y; sumXY += x * y; sumXX += x * x;
    return { x, y, date: m.date, weight: y };
  });

  // Lineer Regresyon (y = mx + b)
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const lastPoint = points[points.length - 1];
  const projectionData = [];

  // 4 Haftalık Projeksiyon (7'şer günlük adımlar)
  for (let i = 7; i <= 28; i += 7) {
    const projX = lastPoint.x + i;
    const projY = slope * projX + intercept;
    
    // Sadece mantıklı değerleri ekle (örn. negatif kilo olmaz)
    if (projY > 0) {
        projectionData.push({
          date: `+${i} Gün`,
          projectedWeight: parseFloat(projY.toFixed(1))
        });
    }
  }

  let daysToTarget = null;
  let targetMessage = "Trend hesaplanıyor, birkaç gün daha veri girmelisin.";

  if (targetWeight && slope !== 0) {
    const targetX = (targetWeight - intercept) / slope;
    daysToTarget = Math.round(targetX - lastPoint.x);

    if (daysToTarget > 0 && daysToTarget < 365) {
       const weeks = Math.round(daysToTarget / 7);
       targetMessage = `📉 Trend AI: Harika gidiyorsun! Bu hızla devam edersen hedefine yaklaşık ${weeks} hafta içinde ulaşacaksın.`;
    } else if (daysToTarget <= 0 && ((slope < 0 && lastPoint.y <= targetWeight) || (slope > 0 && lastPoint.y >= targetWeight))) {
       targetMessage = "🎉 Trend AI: Hedefine zaten ulaştın! Şimdi koruma zamanı.";
    } else {
       targetMessage = "⚠️ Trend AI: Kilo gidişatın hedefinle ters yönde. Kalori dengeni ve programını gözden geçirmelisin.";
    }
  }

  return { slope, projectionData, targetMessage };
};