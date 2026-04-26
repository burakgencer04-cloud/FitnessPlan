/**
 * @fileoverview Core utility functions used across the entire application.
 * FSD Mimarisinde 'core' katmanı, projeden bağımsız çalışabilen saf (pure) JS fonksiyonlarını içerir.
 */

/**
 * Yerel saat dilimine göre ISO tarih formatı döner (YYYY-MM-DD)
 */
export const getLocalIsoDate = () => {
  const date = new Date();
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().split('T')[0];
};

/**
 * Performanslı ve güvenli UUID v4 oluşturucu
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * API veya LocalStorage'dan gelen veriyi güvenli bir şekilde ayrıştırır
 * Çökme durumunda (crash) fallback değerini döner.
 */
export const safeJSONParse = (str, fallback = null) => {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch (e) {
    console.warn("JSON Parse Error:", e);
    return fallback;
  }
};

/**
 * Hızlı tetiklenen fonksiyonları yavaşlatmak için Debounce (Örn: Arama inputları, scroll)
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};

/**
 * Metinlerin ilk harfini büyütür
 */
export const capitalizeFirstLetter = (string) => {
  if (!string || typeof string !== 'string') return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Array içindeki objeleri belirli bir key'e göre gruplar
 */
export const groupBy = (array, key) => {
  return (array || []).reduce((result, currentValue) => {
    const groupKey = currentValue[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(currentValue);
    return result;
  }, {});
};