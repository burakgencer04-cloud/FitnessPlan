export const getLocalIsoDate = () => {
  const date = new Date();
  const tzOffset = date.getTimezoneOffset() * 60000; // Saat dilimi farkını milisaniyeye çevirir
  return new Date(date - tzOffset).toISOString().split('T')[0];
};
