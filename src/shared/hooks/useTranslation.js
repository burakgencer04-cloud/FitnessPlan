// src/hooks/useTranslation.js
import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return { t, changeLanguage, currentLanguage: i18n.language };
};