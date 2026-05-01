// src/shared/hooks/useTranslation.js

import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  const changeLanguage = (lng) => {
    if (i18n && typeof i18n.changeLanguage === 'function') {
      i18n.changeLanguage(lng);
    }
  };

  return { 
    t, 
    i18n, 
    changeLanguage, 
    currentLanguage: i18n?.language || 'tr' 
  };
};