import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- YENİ YOLLAR ---
import { THEMES } from '../../core/theme';
import { generatePersonalizedPlan } from './generatorEngine';
// -------------------

const fonts = {
  header: "'Comucan', system-ui, sans-serif",
  body: "'Comucan', system-ui, sans-serif",
  mono: "monospace"
};

// 🌟 POPÜLER YİYECEK SEÇENEKLERİ (Kullanıcının işini kolaylaştırmak için)
const POPULAR_DISLIKES = ["Mantar", "Brokoli", "Sakatat", "Balık", "Deniz Ürünleri", "Patlıcan", "Süt", "Yumurta", "Kuzu Eti", "Kereviz", "Pırasa", "Zeytin", "Kavun"];
const POPULAR_LIKES = ["Tavuk", "Kırmızı Et", "Yumurta", "Yulaf", "Fıstık Ezmesi", "Avokado", "Peynir", "Kahve", "Pirinç", "Patates", "Muz", "Yoğurt", "Makarna"];

// Genişleyebilir Diyet Kartı Bileşeni
const ExpandableDietCard = ({ diet, isSelected, onClick, color, C }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      style={{
        background: isSelected ? `linear-gradient(145deg, ${color}20, transparent)` : `rgba(0,0,0,0.2)`,
        border: `1px solid ${isSelected ? color : `${C.border}40`}`,
        borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: isSelected ? `0 10px 30px ${color}20` : "none", transition: "all 0.3s ease",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", marginBottom: 12
      }}
    >
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }} onClick={onClick}>
        <div style={{ fontSize: 32, filter: isSelected ? `drop-shadow(0 0 10px ${color}80)` : "grayscale(100%) opacity(50%)", transition: "0.3s" }}>{diet.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: isSelected ? color : C.text, fontFamily: fonts.header, marginBottom: 4 }}>{diet.title}</div>
          <div style={{ fontSize: 12, color: C.mute, lineHeight: 1.4 }}>{diet.shortDesc}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${isSelected ? color : C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isSelected && <div style={{ width: 12, height: 12, borderRadius: "50%", background: color }} />}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} 
            style={{ background: "transparent", border: "none", color: C.sub, fontSize: 10, cursor: "pointer", textDecoration: "underline", padding: 4 }}
          >
            {isExpanded ? "Gizle" : "Detaylar"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 20px 20px 20px", fontSize: 12, lineHeight: 1.5, color: C.mute }}>
              <div style={{ borderTop: `1px dashed ${C.border}40`, paddingTop: 12, marginTop: 4 }}>
                <p style={{ margin: "0 0 8px 0" }}><strong style={{ color: C.text }}>Makro Dağılımı:</strong> {diet.macros}</p>
                <p style={{ margin: "0 0 8px 0" }}><strong style={{ color: C.text }}>Prensip:</strong> {diet.principle}</p>
                <p style={{ margin: "0 0 8px 0" }}><strong style={{ color: C.text }}>Faydaları:</strong> {diet.benefits}</p>
                <p style={{ margin: "0 0 8px 0" }}><strong style={{ color: C.text }}>Riskleri:</strong> {diet.risks}</p>
                <p style={{ margin: 0 }}><strong style={{ color: C.green }}>Kimlere Uygun?:</strong> {diet.targetAudience}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SelectionCard = ({ title, desc, icon, isSelected, onClick, color, C }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClick}
    style={{
      background: isSelected ? `linear-gradient(145deg, ${color}20, transparent)` : `rgba(0,0,0,0.2)`,
      border: `1px solid ${isSelected ? color : `${C.border}40`}`,
      padding: "16px 20px", borderRadius: 20, cursor: "pointer", display: "flex", alignItems: "center", gap: 16,
      boxShadow: isSelected ? `0 10px 30px ${color}20` : "none", transition: "all 0.3s ease",
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)"
    }}
  >
    <div style={{ fontSize: 32, filter: isSelected ? `drop-shadow(0 0 10px ${color}80)` : "grayscale(100%) opacity(50%)", transition: "0.3s" }}>{icon}</div>
    <div>
      <div style={{ fontSize: 16, fontWeight: 900, color: isSelected ? color : C.text, fontFamily: fonts.header, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: C.mute, lineHeight: 1.4 }}>{desc}</div>
    </div>
    <div style={{ marginLeft: "auto", width: 24, height: 24, borderRadius: "50%", border: `2px solid ${isSelected ? color : C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {isSelected && <div style={{ width: 12, height: 12, borderRadius: "50%", background: color }} />}
    </div>
  </motion.div>
);

export default function OnboardingWizard({ onComplete, themeColors: C }) {
  const [step, setStep] = useState(1);
  const totalSteps = 8; 

  const [isCalculating, setIsCalculating] = useState(false);
  const [calcText, setCalcText] = useState("Vücut verilerin analiz ediliyor... 🧬");

  const [form, setForm] = useState({
    firstName: "", lastName: "", city: "", 
    gender: "", dobDay: "", dobMonth: "", dobYear: "",
    unitWeight: "kg", unitLength: "cm",
    height: "", startWeight: "", targetWeight: "",
    goal: "", activity: "",
    dietType: "",
    experience: "", days: null,
    likes: [], dislikes: [], // 🚀 String yerine Dizi (Array) kullanıyoruz
    waterGoalLiters: "" 
  });

  const handleNext = () => {
    if (step === 1 && (!form.firstName.trim() || !form.lastName.trim() || !form.city.trim())) return alert("Lütfen adınızı, soyadınızı ve yaşadığınız şehri eksiksiz girin.");
    if (step === 2 && (!form.gender || !form.dobDay || !form.dobMonth || !form.dobYear)) return alert("Lütfen cinsiyet ve doğum tarihinizi eksiksiz girin.");
    if (step === 3 && (!form.height || !form.startWeight || !form.targetWeight)) return alert("Lütfen boy ve kilo bilgilerinizi eksiksiz girin.");
    if (step === 4 && (!form.goal || !form.activity)) return alert("Lütfen ana hedefinizi ve aktivite düzeyinizi seçin.");
    if (step === 5 && !form.dietType) return alert("Lütfen diyet türünüzü seçin.");
    if (step === 6 && (!form.experience || !form.days)) return alert("Lütfen antrenman seviyenizi ve gün sayısını seçin.");
    // Adım 7 opsiyonel, kontrol gerekmez
    if (step === 8 && !form.waterGoalLiters) return alert("Lütfen günlük su hedefinizi litre cinsinden girin.");

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      startFakeCalculation();
    }
  };

  // Tıklanan yiyeceği ekleme/çıkarma fonksiyonu
  const toggleArrayItem = (field, item) => {
    setForm(prev => {
      const arr = prev[field];
      if (arr.includes(item)) return { ...prev, [field]: arr.filter(i => i !== item) };
      return { ...prev, [field]: [...arr, item] };
    });
  };

  const startFakeCalculation = () => {
    setIsCalculating(true);
    const loadingTexts = [
      "Metabolizma hızın hesaplanıyor... 🔥",
      "Makro ve mikro hedeflerin belirleniyor... 🥑",
      "Sana özel idman rutinin oluşturuluyor... 🏋️‍♂️",
      "Besin tercihlerin sisteme entegre ediliyor... 🍽️",
      "Son rötuşlar yapılıyor... ✨"
    ];
    let index = 0;
    const interval = setInterval(() => {
      if (index < loadingTexts.length - 1) {
        index++;
        setCalcText(loadingTexts[index]);
      }
    }, 1500);

    setTimeout(() => { clearInterval(interval); finalizeSetup(); }, 7500);
  };

  const finalizeSetup = () => {
    const age = new Date().getFullYear() - parseInt(form.dobYear);
    const dobString = `${form.dobYear}-${form.dobMonth.padStart(2, '0')}-${form.dobDay.padStart(2, '0')}`;
    
    let defaultMacro = "dengeli";
    if (form.dietType === "keto") defaultMacro = "keto";
    else if (form.dietType === "high_protein") defaultMacro = "yuksek_protein";
    else if (form.goal === "kas_yap") defaultMacro = "yuksek_protein";

    const finalData = {
      ...form, 
      dob: dobString, 
      age: age > 10 ? age : 25, 
      weight: parseFloat(form.startWeight), 
      
      weeklyGoal: form.goal === "koru" ? "0" : "0.5", 
      customCalorie: "",
      stepGoal: form.activity === "sedanter" ? 6000 : (form.activity === "aktif" ? 12000 : 10000),
      macroProfile: defaultMacro,
      
      preferences: {
        likes: form.likes,
        dislikes: form.dislikes
      },

      waterUnit: "ml",
      waterGoal: parseFloat(form.waterGoalLiters) * 1000, 
      
      notifBreakfast: "08:00", notifLunch: "13:00", notifDinner: "19:30", notifSnack: "16:00",
      workDays: ["Pzt", "Sal", "Çar", "Per", "Cum"],
      unitEnergy: "kcal", unitPortion: "gr", unitBlood: "mg/dL"
    };

    onComplete(finalData);
  };

  const inputStyle = { width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid ${C.border}60`, color: C.text, padding: "16px 20px", borderRadius: 20, outline: "none", fontFamily: fonts.mono, fontSize: 16, marginBottom: 16, transition: "0.3s", textAlign: "center" };
  const labelStyle = { display: "block", fontSize: 11, color: C.sub, fontWeight: 800, letterSpacing: 2, marginBottom: 8, textAlign: "center", textTransform: "uppercase" };

  const DIET_OPTIONS = [
    { id: "standart", color: C.blue, icon: "🍽️", title: "Her Şeyi Yerim", shortDesc: "Standart, dengeli karma beslenme.", macros: "%30 Protein, %40 Karb, %30 Yağ", principle: "Kalori kontrolü dahilinde tüm besin gruplarından tüketilir.", benefits: "Sürdürülebilmesi en kolay diyet türüdür, sosyal hayata tam uyumludur.", risks: "Porsiyon kontrolü yapılmazsa kilo aldırabilir.", targetAudience: "Özel bir kısıtlaması olmayan herkes." },
    { id: "high_protein", color: C.text, icon: "🥩", title: "Yüksek Protein", shortDesc: "Kas yapımı ve tokluk odaklı diyet.", macros: "%40 Protein, %30 Karb, %30 Yağ", principle: "Günlük kalori ihtiyacının büyük kısmı hayvansal/bitkisel proteinlerden karşılanır.", benefits: "Kas yıkımını önler, tokluk hissini artırır ve metabolizmayı hızlandırır.", risks: "Su tüketimi az olursa böbrekleri yorabilir.", targetAudience: "Ağırlık çalışanlar ve kas kütlesini artırmak isteyenler." },
    { id: "akdeniz", color: C.yellow, icon: "🫒", title: "Akdeniz Diyeti", shortDesc: "Zeytinyağı, balık ve yeşillik ağırlıklı.", macros: "%20 Protein, %45 Karb, %35 Yağ", principle: "İşlenmiş gıdalardan uzak, taze sebze, meyve, balık ve sağlıklı yağların bolca tüketildiği model.", benefits: "Kalp sağlığını korur, uzun ömürlülük sağlar, inflamasyonu azaltır.", risks: "Kalori açığı yaratılmazsa kuruyemiş/yağ kaynaklı kilo alınabilir.", targetAudience: "Sağlıklı yaşlanmak ve kalp dostu beslenmek isteyenler." },
    { id: "keto", color: C.red, icon: "🥑", title: "Ketojenik (Keto)", shortDesc: "Çok düşük karb, yüksek yağ.", macros: "%25 Protein, %5 Karb, %70 Yağ", principle: "Karbonhidratlar sıfırlanarak vücudun enerji için yağ (keton) yakması sağlanır.", benefits: "Hızlı yağ yakımı, kan şekerinde stabilite.", risks: "İlk haftalarda halsizlik (keto flu), uzun vadede sürdürülebilirlik zorluğu.", targetAudience: "Hızlı yağ yakmak isteyenler ve insülin direnci olanlar." },
    { id: "if", color: C.mute, icon: "⏱️", title: "Aralıklı Oruç (IF)", shortDesc: "Belirli saatlerde yeme (Örn: 16/8).", macros: "Esnek (Kişiye bağlı)", principle: "Ne yediğinden ziyade, 'Ne zaman' yediğine odaklanır.", benefits: "Hücresel yenilenme (otofaji) sağlar, yağ yakımını kolaylaştırır.", risks: "Mide rahatsızlığı olanlara veya yeme bozukluğu geçmişi olanlara önerilmez.", targetAudience: "Sabah kahvaltı yapmayı sevmeyenler ve kalori kısıtlamasını kolaylaştırmak isteyenler." },
    { id: "dash", color: C.blue, icon: "🩸", title: "DASH Diyeti", shortDesc: "Tansiyon düşürmeye odaklı beslenme.", macros: "Düşük sodyum, Yüksek lif", principle: "Tuz tüketimini minimuma indirir; potasyum ve kalsiyum zengini besinleri önerir.", benefits: "Yüksek tansiyonu düşürür, kalp-damar sağlığını destekler.", risks: "Sıkı tuz kısıtlaması nedeniyle yemekler başlarda lezzetsiz gelebilir.", targetAudience: "Hipertansiyon hastaları veya kalp sağlığına dikkat edenler." },
    { id: "flexitarian", color: C.green, icon: "🥗", title: "Flexitarian", shortDesc: "Esnek Vejetaryenlik (Ara sıra et).", macros: "Bitki ağırlıklı esnek dağılım", principle: "Temelde vejetaryen beslenilir ancak arada sırada (haftada 1-2) ete izin verilir.", benefits: "Sürdürülebilir, çevre dostu, katı yasakları yoktur.", risks: "Demir ve B12 eksikliğine dikkat edilmelidir.", targetAudience: "Katı vejetaryen olamayan ama eti azaltmak isteyenler." },
    { id: "vegan", color: C.green, icon: "🌱", title: "Vegan", shortDesc: "Hayvansal hiçbir ürün içermez.", macros: "Bitkisel protein, yüksek karb", principle: "Et, süt, yumurta, bal dahil hiçbir hayvansal gıda tüketilmez.", benefits: "Çevre dostu, yüksek lif alımı, kolesterolü düşürür.", risks: "B12 vitamini, demir, kalsiyum eksikliği riski taşır.", targetAudience: "Etik veya sağlık nedenleriyle hayvansal gıda tüketmek istemeyenler." }
  ];

  if (isCalculating) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.text, fontFamily: fonts.body, position: "relative" }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <motion.div animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 4, repeat: Infinity }} style={{ position: 'absolute', top: '50%', left: '50%', transform: "translate(-50%, -50%)", width: '80vw', height: '80vw', background: `radial-gradient(circle, ${C.green}30 0%, transparent 60%)`, filter: 'blur(80px)' }} />
        </div>
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} style={{ width: 72, height: 72, borderRadius: "50%", border: `4px solid ${C.border}40`, borderTopColor: C.green, marginBottom: 32, boxShadow: `0 0 30px ${C.green}40` }} />
          <AnimatePresence mode="wait">
            <motion.h2 key={calcText} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }} style={{ margin: 0, fontSize: 20, fontWeight: 900, fontFamily: fonts.header, textAlign: "center", color: C.text, letterSpacing: 0.5, padding: "0 20px" }}>
              {calcText}
            </motion.h2>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", color: C.text, fontFamily: fonts.body }}>
      
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '70vw', height: '70vw', background: `radial-gradient(circle, ${C.blue}20 0%, transparent 60%)`, filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '70vw', height: '70vw', background: `radial-gradient(circle, ${C.green}1A 0%, transparent 60%)`, filter: 'blur(80px)' }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", maxWidth: 600, margin: "0 auto", width: "100%", padding: "40px 20px" }}>
        
        <div style={{ display: "flex", gap: 6, marginBottom: 40 }}>
          {[...Array(totalSteps)].map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i + 1 <= step ? C.green : `rgba(255,255,255,0.1)`, transition: "0.3s" }} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>👋</div>
              <h2 style={{ margin: "0 0 12px 0", fontSize: 28, fontWeight: 900, fontFamily: fonts.header }}>Seni Tanıyalım</h2>
              <p style={{ margin: "0 0 32px 0", fontSize: 15, color: C.sub, lineHeight: 1.5 }}>Sana özel antrenman ve beslenme programını oluşturabilmemiz için birkaç bilgiye ihtiyacımız var.</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>ADIN</label>
                  <input type="text" placeholder="Örn: Ali" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} style={{ ...inputStyle, marginBottom: 0 }} />
                </div>
                <div>
                  <label style={labelStyle}>SOYADIN</label>
                  <input type="text" placeholder="Örn: Yılmaz" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} style={{ ...inputStyle, marginBottom: 0 }} />
                </div>
              </div>
              <label style={{...labelStyle, marginTop: 16}}>HANGİ ŞEHİRDESİN?</label>
              <input type="text" placeholder="Örn: İstanbul" value={form.city} onChange={e => setForm({...form, city: e.target.value})} style={inputStyle} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1 }}>
              <h2 style={{ margin: "0 0 12px 0", fontSize: 28, fontWeight: 900, fontFamily: fonts.header }}>Temel Bilgiler</h2>
              <p style={{ margin: "0 0 32px 0", fontSize: 15, color: C.sub }}>Metabolizma hızını doğru hesaplamamız için biyolojik verilerin önemlidir.</p>
              
              <label style={labelStyle}>CİNSİYET</label>
              <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
                <button onClick={() => setForm({...form, gender: "erkek"})} style={{ flex: 1, background: form.gender === "erkek" ? `linear-gradient(145deg, ${C.blue}30, transparent)` : "rgba(0,0,0,0.3)", border: `1px solid ${form.gender === "erkek" ? C.blue : `${C.border}40`}`, color: form.gender === "erkek" ? C.text : C.mute, padding: "20px", borderRadius: 20, fontSize: 16, fontWeight: 900, cursor: "pointer", backdropFilter: "blur(12px)" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>👨</div> ERKEK
                </button>
                <button onClick={() => setForm({...form, gender: "kadin"})} style={{ flex: 1, background: form.gender === "kadin" ? `linear-gradient(145deg, ${C.red}30, transparent)` : "rgba(0,0,0,0.3)", border: `1px solid ${form.gender === "kadin" ? C.red : `${C.border}40`}`, color: form.gender === "kadin" ? C.text : C.mute, padding: "20px", borderRadius: 20, fontSize: 16, fontWeight: 900, cursor: "pointer", backdropFilter: "blur(12px)" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>👩</div> KADIN
                </button>
              </div>

              <label style={labelStyle}>DOĞUM TARİHİ</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 24, border: `1px solid ${C.border}30` }}>
                <input type="number" placeholder="Gün (Örn: 15)" value={form.dobDay} onChange={e => setForm({...form, dobDay: e.target.value})} style={{ ...inputStyle, marginBottom: 0 }} />
                <input type="number" placeholder="Ay (Örn: 08)" value={form.dobMonth} onChange={e => setForm({...form, dobMonth: e.target.value})} style={{ ...inputStyle, marginBottom: 0 }} />
                <input type="number" placeholder="Yıl (Örn: 1995)" value={form.dobYear} onChange={e => setForm({...form, dobYear: e.target.value})} style={{ ...inputStyle, marginBottom: 0 }} />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1 }}>
              <h2 style={{ margin: "0 0 12px 0", fontSize: 28, fontWeight: 900, fontFamily: fonts.header }}>Vücut Ölçülerin</h2>
              <p style={{ margin: "0 0 24px 0", fontSize: 15, color: C.sub }}>Birim tercihlerini seçip hedefini belirle.</p>
              
              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 24 }}>
                <div style={{ display: "flex", background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 4 }}>
                  <button onClick={() => setForm({...form, unitWeight: "kg"})} style={{ border: "none", padding: "6px 12px", borderRadius: 8, background: form.unitWeight === "kg" ? C.text : "transparent", color: form.unitWeight === "kg" ? C.bg : C.mute, fontWeight: 900, cursor: "pointer", fontSize: 12 }}>KG</button>
                  <button onClick={() => setForm({...form, unitWeight: "lb"})} style={{ border: "none", padding: "6px 12px", borderRadius: 8, background: form.unitWeight === "lb" ? C.text : "transparent", color: form.unitWeight === "lb" ? C.bg : C.mute, fontWeight: 900, cursor: "pointer", fontSize: 12 }}>LB</button>
                </div>
                <div style={{ display: "flex", background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 4 }}>
                  <button onClick={() => setForm({...form, unitLength: "cm"})} style={{ border: "none", padding: "6px 12px", borderRadius: 8, background: form.unitLength === "cm" ? C.text : "transparent", color: form.unitLength === "cm" ? C.bg : C.mute, fontWeight: 900, cursor: "pointer", fontSize: 12 }}>CM</button>
                  <button onClick={() => setForm({...form, unitLength: "ft"})} style={{ border: "none", padding: "6px 12px", borderRadius: 8, background: form.unitLength === "ft" ? C.text : "transparent", color: form.unitLength === "ft" ? C.bg : C.mute, fontWeight: 900, cursor: "pointer", fontSize: 12 }}>FT</button>
                </div>
              </div>

              <div style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2))`, padding: 24, borderRadius: 24, border: `1px solid ${C.border}40`, backdropFilter: "blur(12px)" }}>
                <label style={labelStyle}>BOY ({form.unitLength.toUpperCase()})</label>
                <input type="number" placeholder={form.unitLength === "cm" ? "180" : "5.9"} value={form.height} onChange={e => setForm({...form, height: e.target.value})} style={inputStyle} />

                <label style={{...labelStyle, marginTop: 16}}>GÜNCEL KİLO ({form.unitWeight.toUpperCase()})</label>
                <input type="number" placeholder={form.unitWeight === "kg" ? "80" : "176"} value={form.startWeight} onChange={e => setForm({...form, startWeight: e.target.value})} style={inputStyle} />

                <label style={{...labelStyle, marginTop: 16, color: C.green}}>HEDEF KİLO ({form.unitWeight.toUpperCase()})</label>
                <input type="number" placeholder={form.unitWeight === "kg" ? "70" : "154"} value={form.targetWeight} onChange={e => setForm({...form, targetWeight: e.target.value})} style={{...inputStyle, borderColor: C.green, color: C.green}} />
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1 }}>
              <h2 style={{ margin: "0 0 12px 0", fontSize: 28, fontWeight: 900, fontFamily: fonts.header }}>Ana Hedefin</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                <SelectionCard title="Kilo Ver / Yağ Yak" desc="Kalori açığı oluşturarak yağ oranını düşür." icon="🔥" isSelected={form.goal === "kilo_ver"} onClick={() => setForm({...form, goal: "kilo_ver"})} color={C.red} C={C} />
                <SelectionCard title="Kilo Al / Hacim" desc="Kalori fazlası ile kütle ve hacim kazan." icon="🥩" isSelected={form.goal === "kilo_al"} onClick={() => setForm({...form, goal: "kilo_al"})} color={C.blue} C={C} />
                <SelectionCard title="Kas Yap (Recomp)" desc="Mevcut kilonu koruyarak saf kas kütlesi ekle." icon="💪" isSelected={form.goal === "kas_yap"} onClick={() => setForm({...form, goal: "kas_yap"})} color={C.green} C={C} />
              </div>

              <h2 style={{ margin: "0 0 12px 0", fontSize: 20, fontWeight: 900, fontFamily: fonts.header }}>Aktivite Düzeyin</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <SelectionCard title="Masa Başı" desc="Gün boyu oturarak çalışıyorum, az hareketliyim." icon="💻" isSelected={form.activity === "sedanter"} onClick={() => setForm({...form, activity: "sedanter"})} color={C.mute} C={C} />
                <SelectionCard title="Orta Aktif" desc="Gün içinde hafif yürüyüşler ve hareket yapıyorum." icon="🚶‍♂️" isSelected={form.activity === "orta"} onClick={() => setForm({...form, activity: "orta"})} color={C.yellow} C={C} />
                <SelectionCard title="Çok Aktif" desc="Fiziksel bir işte çalışıyorum veya her gün spor yapıyorum." icon="⚡" isSelected={form.activity === "aktif"} onClick={() => setForm({...form, activity: "aktif"})} color={C.red} C={C} />
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1 }}>
              <h2 style={{ margin: "0 0 12px 0", fontSize: 28, fontWeight: 900, fontFamily: fonts.header }}>Beslenme Tarzın</h2>
              <p style={{ margin: "0 0 24px 0", fontSize: 15, color: C.sub }}>Detaylarını görmek için seçeneklerin üzerine tıkla.</p>
              
              <div style={{ display: "flex", flexDirection: "column" }}>
                {DIET_OPTIONS.map(diet => (
                  <ExpandableDietCard 
                    key={diet.id} diet={diet} C={C} color={diet.color}
                    isSelected={form.dietType === diet.id}
                    onClick={() => setForm({...form, dietType: diet.id})}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1 }}>
              <h2 style={{ margin: "0 0 12px 0", fontSize: 28, fontWeight: 900, fontFamily: fonts.header }}>Antrenman Rutini</h2>
              <p style={{ margin: "0 0 32px 0", fontSize: 15, color: C.sub }}>Seviyene ve zamanına göre programı optimize edelim.</p>
              
              <label style={labelStyle}>SPOR GEÇMİŞİN</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                <SelectionCard title="Yeni Başlayan" desc="0-6 ay deneyim. Makinelere ve temel hareketlere alışma." icon="👶" isSelected={form.experience === "beginner"} onClick={() => setForm({...form, experience: "beginner"})} color={C.green} C={C} />
                <SelectionCard title="Orta Seviye" desc="6 ay - 2 yıl deneyim. Serbest ağırlıklara hakim." icon="🧑‍🔧" isSelected={form.experience === "intermediate"} onClick={() => setForm({...form, experience: "intermediate"})} color={C.blue} C={C} />
                <SelectionCard title="İleri Seviye" desc="2+ yıl deneyim. Ağır idmanlar ve spesifik kas hedefleri." icon="🦍" isSelected={form.experience === "advanced"} onClick={() => setForm({...form, experience: "advanced"})} color={C.red} C={C} />
              </div>

              <label style={labelStyle}>HAFTADA KAÇ GÜN ÇALIŞACAKSIN?</label>
              <div style={{ display: "flex", gap: 12 }}>
                {[3, 4, 5].map(d => (
                  <button 
                    key={d} onClick={() => setForm({...form, days: d})}
                    style={{ flex: 1, background: form.days === d ? C.text : "rgba(0,0,0,0.3)", color: form.days === d ? C.bg : C.mute, border: `1px solid ${form.days === d ? C.text : `${C.border}40`}`, padding: "16px", borderRadius: 16, fontSize: 20, fontWeight: 900, cursor: "pointer", transition: "0.2s" }}
                  >
                    {d} Gün
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* 🚀 YENİ ADIM 7: AKILLI BESİN SEÇİCİ (ETİKET SİSTEMİ) */}
          {step === 7 && (
            <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1 }}>
              <h2 style={{ margin: "0 0 12px 0", fontSize: 28, fontWeight: 900, fontFamily: fonts.header }}>Neleri Seversin?</h2>
              <p style={{ margin: "0 0 32px 0", fontSize: 15, color: C.sub }}>
                Aklına gelmeyebilir diye en çok tercih edilen ve sevilmeyen besinleri aşağıda listeledik. Listene eklemek veya çıkarmak için sadece üzerine tıkla.
              </p>
              
              <label style={{...labelStyle, color: C.red}}>ASLA YEMEM DEDİKLERİN 🚫</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 32, justifyContent: 'center' }}>
                {POPULAR_DISLIKES.map(item => {
                  const isSelected = form.dislikes.includes(item);
                  return (
                    <button
                      key={item} onClick={() => toggleArrayItem("dislikes", item)}
                      style={{
                        background: isSelected ? C.red : "rgba(0,0,0,0.3)", color: isSelected ? "#fff" : C.text,
                        border: `1px solid ${isSelected ? C.red : `${C.border}40`}`, padding: "10px 16px", borderRadius: 100, 
                        fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "0.2s", display: "flex", gap: 6, alignItems: "center",
                        boxShadow: isSelected ? `0 4px 15px ${C.red}60` : "none"
                      }}
                    >
                      {item} {isSelected && "❌"}
                    </button>
                  )
                })}
              </div>

              <label style={{...labelStyle, color: C.green}}>VAZGEÇİLMEZLERİN ❤️</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24, justifyContent: 'center' }}>
                {POPULAR_LIKES.map(item => {
                  const isSelected = form.likes.includes(item);
                  return (
                    <button
                      key={item} onClick={() => toggleArrayItem("likes", item)}
                      style={{
                        background: isSelected ? C.green : "rgba(0,0,0,0.3)", color: isSelected ? "#000" : C.text,
                        border: `1px solid ${isSelected ? C.green : `${C.border}40`}`, padding: "10px 16px", borderRadius: 100, 
                        fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "0.2s", display: "flex", gap: 6, alignItems: "center",
                        boxShadow: isSelected ? `0 4px 15px ${C.green}60` : "none"
                      }}
                    >
                      {item} {isSelected && "✅"}
                    </button>
                  )
                })}
              </div>

              <div style={{ background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 16, fontSize: 12, color: C.mute, marginTop: 16, border: `1px solid ${C.border}40`, textAlign: "center" }}>
                💡 <strong>İpucu:</strong> Bu kısmı boş da geçebilirsin. Algoritmamız, seçtiğin diyet türüne göre otomatik bir menü oluşturacaktır.
              </div>
            </motion.div>
          )}

          {step === 8 && (
            <motion.div key="step8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 64, marginBottom: 16, filter: `drop-shadow(0 0 20px ${C.blue}80)` }}>💧</div>
              <h2 style={{ margin: "0 0 12px 0", fontSize: 28, fontWeight: 900, fontFamily: fonts.header, color: C.blue }}>Su Hayattır!</h2>
              <p style={{ margin: "0 0 32px 0", fontSize: 15, color: C.sub, lineHeight: 1.5, padding: "0 20px" }}>
                Vücudunun %60'ı, kaslarının ise tam <strong>%75'i</strong> sudan oluşuyor. <br/> Günde kaç litre su içeceksin? Unutma, sen bunu başarabilirsin! 💪
              </p>
              
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 12, background: "rgba(0,0,0,0.3)", padding: 24, borderRadius: 24, border: `1px solid ${C.blue}40` }}>
                <input type="number" step="0.5" placeholder="Örn: 2.5" value={form.waterGoalLiters} onChange={e => setForm({...form, waterGoalLiters: e.target.value})} style={{ ...inputStyle, width: 140, marginBottom: 0, borderColor: C.blue, color: C.blue, fontSize: 32 }} />
                <span style={{ fontSize: 20, fontWeight: 900, color: C.text, fontFamily: fonts.header }}>Litre</span>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} style={{ background: "rgba(0,0,0,0.3)", color: C.text, border: `1px solid ${C.border}60`, padding: "16px 24px", borderRadius: 20, fontWeight: 900, cursor: "pointer", fontFamily: fonts.header }}>
              GERİ
            </button>
          )}
          <button onClick={handleNext} style={{ flex: 1, background: `linear-gradient(135deg, ${C.green}, #22c55e)`, color: "#000", border: "none", padding: "16px 24px", borderRadius: 20, fontWeight: 900, cursor: "pointer", fontSize: 16, fontFamily: fonts.header, boxShadow: `0 10px 30px ${C.green}40` }}>
            {step === totalSteps ? "PROGRAMIMI OLUŞTUR 🚀" : "DEVAM ET ➔"}
          </button>
        </div>

      </div>
    </div>
  );
}