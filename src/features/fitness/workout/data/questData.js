// src/features/workout/questData.js

const RAW_QUESTS = [
  "Antrenmanda Göğüs hacmini 2 tonun üzerine çıkar.","Squat setlerinde derinliğini sonuna kadar zorla.","Bugün en az 1 harekette 'Failure' (Tükeniş) noktasına git.","Antrenmanı Savaş Arenası (Odak Modu) açıkken tamamla.","Günde en az 3 litre su tüketimini tamamla.","Bugün hiçbir ısınma setini atlama.","İdman sonrası 5 dakika statik esneme yap.","Protein hedefine %100 oranında ulaş.","Deadlift veya türevi bir harekette yeni PR (Rekor) dene.","Karbonhidrat tüketimini akşam saat 8'den sonra kes.","Bugün antrenman sırasında telefon bildirimlerine hiç bakma.","Bir omuz hareketinde 'Drop Set' uygula.","Set aralarındaki dinlenme süresine saniyesi saniyesine uy.","Antrenman sonu Taverna'da idmanını paylaş.","Sırt antrenmanında ağırlıktan ziyade kas hissiyatına odaklan.","Bugünkü kalorinin büyük kısmını temiz besinlerden al.","Bench Press'te negatifi (ağırlığı indirmeyi) 3 saniyede yap.","Gece 23:30'dan önce uykuya dal.","Şeker ilaveli hiçbir besin tüketme.","Bacak antrenmanını asla iptal etme.","Günün en zor hareketini idmanın en başında yap.","Karın kası (Core) için ekstra 3 set ekle.","İdman öncesi mobilite (eklem açıklığı) çalışması yap.","Bugün asansör yerine merdivenleri kullan.","Öğle yemeğinde ekstra bir porsiyon yeşillik tüket.","Z-Bar Curl hareketinde tepe noktasında 1 saniye bekle.","Sırt idmanında çekişleri patlayıcı güçle yap.","Kendi vücut ağırlığınla yapabildiğin maksimum barfiksi çek.","İdman boyunca en az 1 litre su tüket.","Tabağına bugün 3 farklı renkte sebze ekle.",
  "İdmanını planlanan süreden daha hızlı bitirmeye çalış.","Bugün 10.000 adım hedefini geç.","Triceps hareketlerinde dirseklerini tamamen sabitle.","En sevmediğin egzersizi bugün programa ekle.","Bugün kahveyi veya pre-workout'u şekersiz/kremasız iç.","Bir bacak hareketinde 'Pause Set' (Aşağıda bekleme) yap.","Antrenmana başlamadan önce zihinsel olarak idmanı vizyonla.","Haftalık tonaj rekorunu kırmak için fazladan 1 set at.","Taverna'da en az 2 korsanın idmanına ateş (🔥) bırak.","Bugün fast-food veya işlenmiş gıdaya el sürme.","Omuz preslerinde ağırlığı kulak hizasına kadar indir.","Beslenme planındaki öğün saatlerine tam uyum sağla.","Antrenman sonrasında soğuk duş al veya yüzünü yıka.","Kalf (Baldır) kaslarına ekstra bir hareket ekle.","Bugün yediğin her şeyi eksiksiz olarak sisteme gir.","Cable Cross hareketinde kasları tam esnet.","Antrenman öncesi karbonhidrat alımını iyi ayarla.","İdman sırasında sadece motive edici, agresif müzikler dinle.","Deadlift yaparken omurga formunu kusursuz koru.","Sade maden suyu içerek metabolizmanı hızlandır.",
  "Lateral Raise yaparken ağırlığı fırlatmadan kaldır.","Dumbbell Row hareketinde kürek kemiklerini iyice sık.","Bugün hiçbir seti yarım bırakma.","İdman bittikten sonra sisteme not / hissiyat yaz.","Beslenme sekmesindeki 'AI Yemek Lensi'ni kullanarak yemek ekle.","Bugün hiç asitli / şekerli içecek tüketme.","Bench Press yaparken ayaklarından güç al (Leg Drive).","Bugün aynaya bakıp geliştiğin bir kas grubunu takdir et.","Barfiks çekerken çeneni barın üzerine tam çıkar.","Antrenman boyunca nefes kontrolünü (tutmadan) sağla.","Bugün en az 1 öğününü sadece bitkisel (vegan/vejetaryen) yap.","İdmanın sonuna 10 dakikalık HIIT (Kardiyo) ekle.","Pull-up yapamıyorsan negatif (iniş) barfiks çalış.","Antrenman öncesi dinamik ısınmayı 10 dakikaya uzat.","Bugün dışarıdan yemek sipariş etme, evde hazırla.","Bacak preste dizlerini içeri bükülmekten koru.","Günün son öğününde karbonhidratı minimumda tut.","Triceps Pushdown yaparken ipi en altta ikiye ayır.","Bugün aynada poz verip sisteme form fotoğrafı yükle.","Omuz idmanında Trapez kaslarına ekstra özen göster.",
  "İdman esnasında aklına gelen bahaneleri sustur.","Bugün 1 porsiyon sağlıklı yağ (Avokado, zeytinyağı, kuruyemiş) tüket.","Squat yaparken göğsünü dik ve açık tut.","Lat Pulldown hareketinde barı göğüs üstüne kadar çek.","Bugün 7 saatten az uyuma.","Taverna liderlik tablosundaki bir üstündeki kişiyi geçmeyi hedefle.","Dumbbell Press hareketinde tepe noktasında dambılları çarpma.","Antrenmandan sonra karbonhidrat ve protein alımını geciktirme.","Bugün hiçbir tatlı krizine yenik düşme.","French Press yaparken hareket açıklığını (ROM) tam kullan.","İdman öncesi odaklanmak için 2 dakika gözlerini kapat ve nefes al.","Bugün meyve tüketimini sadece antrenman öncesine sakla.","Lunge hareketinde adımlarını uzun tutarak kalçayı hedefle.","Barbell Curl yaparken belinden destek (momentum) alma.","Bugün antrenmanda en az 1 litre ter dökene kadar çalış.","Sırt hareketlerinde 'önce omuz, sonra dirsek' kuralını uygula.","Bugün protein tozunu sütle değil suyla iç.","Front Squat deneyerek core bölgene meydan oku.","Antrenmanda 1 dakika bile boş durma.","Bugün kahvaltıyı protein ağırlıklı (yumurta/yulaf) yap.",
  "Leg Extension yaparken yukarıda kası 1 saniye kitle.","Face Pull hareketinde arka omuzlarını alev alev yak.","Bugün tuz tüketimini (sodyum) dengede tut.","Bir harekette kendi sınırını aşıp 'Yardımlı Tekrar' yap.","Beslenme planındaki 'Örnek Plan Üret' butonunu test et.","Bugün gün içinde duruşunu (postürünü) dik tutmaya özen göster.","İncline Bench Press açısını 30 derecede tutarak üst göğsü vur.","Antrenman sonu karın (Plank) rekorunu kırmayı dene.","Bugün beyaz ekmek yerine tam tahıllı kompleks karb tüket.","Shrug hareketinde omuzlarını kulaklarına kadar çekip bekle.","İdmanda kendini iyi hissetmiyorsan bile disiplinle tamamla.","Bugün yatmadan önce telefon/mavi ışık kullanımını azalt.","Chest Fly hareketinde kasların yırtıldığını (esnediğini) hisset.","Romanian Deadlift ile arka bacak (Hamstring) kaslarını ger.","Bugün sadece su, maden suyu, çay ve kahve iç (Sıfır kalori).","Biceps hareketlerinde ağırlığı yavaşça ve kontrolle indir.","Antrenman alanını ve aletleri kullandıktan sonra temiz bırak.","Bugün 1 bardak yeşil çay içerek antioksidan al.","Bilek (Forearm) kasları için antrenman sonu 2 set çalış.","Bir sonraki hedefini belirlemek için Profilindeki ayarları gözden geçir."
];

// Görevlere rastgele ancak tutarlı (seed) XP ve İkon atayan fonksiyon
export const getDailyQuests = (dateString) => {
  // Tarihten bir sayısal seed üret (Örn: "2026-04-21" -> 20260421)
  const seed = parseInt(dateString.replace(/-/g, ''));
  
  // Basit bir rastgele sayı üreteci (Seed tabanlı)
  const random = (s) => {
    let x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };

  const selectedQuests = [];
  let currentSeed = seed;

  for (let i = 0; i < 3; i++) {
    // Rastgele bir indeks seç
    const index = Math.floor(random(currentSeed) * RAW_QUESTS.length);
    currentSeed += 1;
    
    const xp = Math.floor(random(currentSeed) * 5) * 10 + 50; // 50, 60, 70, 80, 90 XP
    currentSeed += 1;

    // Görev metnine göre ikon belirle
    const text = RAW_QUESTS[index].toLowerCase();
    let icon = "🎯";
    if (text.includes("su") || text.includes("iç")) icon = "💧";
    else if (text.includes("uyu") || text.includes("gece")) icon = "🌙";
    else if (text.includes("beslenme") || text.includes("yemek") || text.includes("öğün") || text.includes("protein")) icon = "🥩";
    else if (text.includes("rekor") || text.includes("pr")) icon = "🏆";
    else if (text.includes("kilo") || text.includes("tonaj")) icon = "🏋️‍♂️";
    else if (text.includes("savaş arenası") || text.includes("taverna")) icon = "⚔️";

    selectedQuests.push({
      id: `${seed}-${i}`,
      title: RAW_QUESTS[index],
      xp: xp,
      icon: icon
    });
  }

  return selectedQuests;
};