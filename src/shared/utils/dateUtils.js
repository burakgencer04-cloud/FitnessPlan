/**
 * Kullanıcının bulunduğu yerel saat dilimine göre bugünün tarihini YYYY-MM-DD formatında döndürür.
 * (new Date().toISOString() kullanıldığında UTC saatini aldığı için gece yarısı gün kaymalarını önler)
 */
export const getLocalIsoDate = () => {
  const d = new Date();
  // Kullanıcının saat dilimi farkını (Türkiye için -180 dk) mevcut saate ekleyip/çıkararak yerel saati buluyoruz
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};