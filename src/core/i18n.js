import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { tr } from '../locales/tr';
import { en } from '../locales/en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: tr.translation },
      en: { translation: en.translation }
    },
    fallbackLng: 'tr',
    debug: true, // Konsolda hata varsa bize söyleyecek!
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;