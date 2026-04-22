import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';

import en from "@/locales/en";
import tr from "@/locales/tr";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: tr.translation },
      en: { translation: en.translation }
    },
    fallbackLng: 'tr',
    debug: false, // Konsolda hata varsa bize söyleyecek!
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;