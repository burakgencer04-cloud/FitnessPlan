    import { useState } from 'react';
import { useTranslation } from '@/shared/hooks/useTranslation.js';
import { WORKOUT_PRESETS } from '@/features/fitness/workout/data/workoutData.js';
import useModalStore from '@/shared/store/useModalStore';

// Sabit Veriler (Constants) - UI'da da kullanılacağı için export ediyoruz
export const POPULAR_DISLIKES = ["Mantar", "Brokoli", "Sakatat", "Balık", "Deniz Ürünleri", "Patlıcan", "Süt", "Yumurta", "Kuzu Eti", "Kereviz", "Pırasa", "Zeytin", "Kavun"];
export const POPULAR_LIKES = ["Tavuk", "Kırmızı Et", "Yumurta", "Yulaf", "Fıstık Ezmesi", "Avokado", "Peynir", "Kahve", "Pirinç", "Patates", "Muz", "Yoğurt", "Makarna"];

export function useOnboarding(onComplete) {
  const { t } = useTranslation(); 
  const { openModal } = useModalStore(); // 🔥 Zırhlı Modal Store

  const [step, setStep] = useState(1);
  const totalSteps = 8; 

  const [isCalculating, setIsCalculating] = useState(false);
  const [calcText, setCalcText] = useState(t('wiz_load_0') || "Veriler işleniyor...");

  const [form, setForm] = useState({
    firstName: "", lastName: "", city: "", gender: "", dobDay: "", dobMonth: "", dobYear: "",
    unitWeight: "kg", unitLength: "cm", height: "", startWeight: "", targetWeight: "",
    goal: "", activity: "", dietType: "", experience: "", days: null, likes: [], dislikes: [], waterGoalLiters: "" 
  });

  // 🛡️ ADIM ADIM FORM VALİDASYONU (Güvenlik Zırhı)
  const handleNext = () => {
    if (step === 1 && (!form.firstName.trim() || !form.lastName.trim() || !form.city.trim())) 
      return openModal({ type: 'alert', title: 'Eksik Bilgi', message: t('wiz_err_personal') || "Tüm kişisel bilgileri doldurun." });
    
    if (step === 2 && (!form.gender || !form.dobDay || !form.dobMonth || !form.dobYear)) 
      return openModal({ type: 'alert', title: 'Eksik Bilgi', message: t('wiz_err_demographics') || "Cinsiyet ve doğum tarihini seçin." });
    
    if (step === 3 && (!form.height || !form.startWeight || !form.targetWeight)) 
      return openModal({ type: 'alert', title: 'Eksik Bilgi', message: t('wiz_err_body') || "Tüm vücut ölçülerini girin." });
    
    if (step === 4 && (!form.goal || !form.activity)) 
      return openModal({ type: 'alert', title: 'Eksik Bilgi', message: t('wiz_err_goal') || "Hedefinizi ve aktivite seviyenizi seçin." });
    
    if (step === 5 && !form.dietType) 
      return openModal({ type: 'alert', title: 'Eksik Bilgi', message: t('wiz_err_diet') || "Bir beslenme tarzı seçin." });
    
    if (step === 6 && (!form.experience || !form.days)) 
      return openModal({ type: 'alert', title: 'Eksik Bilgi', message: t('wiz_err_workout') || "Spor geçmişi ve gün sayısını seçin." });
    
    if (step === 8 && !form.waterGoalLiters) 
      return openModal({ type: 'alert', title: 'Eksik Bilgi', message: t('wiz_err_water') || "Su hedefini girin." });

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      startFakeCalculation();
    }
  };

  const toggleArrayItem = (field, item) => {
    setForm(prev => {
      const arr = prev[field] || [];
      if (arr.includes(item)) return { ...prev, [field]: arr.filter(i => i !== item) };
      return { ...prev, [field]: [...arr, item] };
    });
  };

  const startFakeCalculation = () => {
    setIsCalculating(true);
    const loadingTexts = [ 
      t('wiz_load_1') || "Makrolar hesaplanıyor...", 
      t('wiz_load_2') || "Antrenman programı yazılıyor...", 
      t('wiz_load_3') || "Diyet planı oluşturuluyor...", 
      t('wiz_load_4') || "Son kontroller yapılıyor...", 
      t('wiz_load_5') || "Hazır!" 
    ];
    let index = 0;
    const interval = setInterval(() => { 
      if (index < loadingTexts?.length - 1) { 
        index++; setCalcText(loadingTexts[index]); 
      } 
    }, 1500);
    
    setTimeout(() => { 
      clearInterval(interval); 
      finalizeSetup(); 
    }, 7500);
  };

  const finalizeSetup = () => {
    const age = new Date().getFullYear() - parseInt(form.dobYear || "2000");
    const dobString = `${form.dobYear}-${form.dobMonth.padStart(2, '0')}-${form.dobDay.padStart(2, '0')}`;
    const standardizedGender = form.gender === "erkek" ? "male" : "female";
    
    let standardizedGoal = "maintain";
    if (form.goal === "kilo_ver") standardizedGoal = "cut";
    else if (form.goal === "kilo_al") standardizedGoal = "bulk";

    const targetDays = parseInt(form.days) || 3;
    const exp = form.experience || "baslangic"; 
    let targetId = "fb_3";
    
    if (targetDays <= 2) targetId = "fb_2";
    else if (targetDays === 3) targetId = (exp === "baslangic") ? "fb_3" : "ppl_3";
    else if (targetDays === 4) targetId = "ul_4";
    else if (targetDays === 5) targetId = "pplul_5";
    else if (targetDays >= 6) targetId = "ppl_6";

    let matchedPlan = WORKOUT_PRESETS.find(p => p.id === targetId);
    if (!matchedPlan) matchedPlan = WORKOUT_PRESETS.find(p => p.workouts && p.workouts?.length === targetDays);
    if (!matchedPlan) matchedPlan = WORKOUT_PRESETS[WORKOUT_PRESETS?.length - 1] || WORKOUT_PRESETS[0];

    const finalWorkouts = matchedPlan?.workouts || (matchedPlan?.phases && matchedPlan.phases[0]?.workouts) || [];

    const finalData = {
      ...form, 
      dob: dobString, 
      age: age > 10 ? age : 25, 
      weight: parseFloat(form.startWeight), 
      gender: standardizedGender, 
      goal: standardizedGoal,
      weeklyGoal: form.goal === "koru" ? "0" : "0.5", 
      stepGoal: form.activity === "sedanter" ? 6000 : (form.activity === "aktif" ? 12000 : 10000), 
      waterUnit: "ml", 
      waterGoal: parseFloat(form.waterGoalLiters || 2.5) * 1000, 
      activePlanId: matchedPlan.id, 
      activePlanName: matchedPlan.name, 
      customWorkouts: finalWorkouts 
    };
    
    onComplete(finalData);
  };

  return {
    t,
    step,
    setStep,
    totalSteps,
    isCalculating,
    calcText,
    form,
    setForm,
    handleNext,
    toggleArrayItem
  };
}