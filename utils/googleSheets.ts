// Fungsi ini sekarang tidak lagi butuh PapaParse karena sudah dikerjakan oleh Server API

export const fetchSheetData = async (sheetName: string) => {
  // Tetap pertahankan LEVEL 2 (Session Storage) untuk perpindahan tab yang 0 detik!
  const CACHE_KEY = `cache_data_${sheetName}`;
  const CACHE_TIME_KEY = `cache_time_${sheetName}`;
  const CACHE_DURATION = 5 * 60 * 1000; 

  if (typeof window !== 'undefined') {
    const cachedData = sessionStorage.getItem(CACHE_KEY);
    const cacheTimestamp = sessionStorage.getItem(CACHE_TIME_KEY);

    if (cachedData && cacheTimestamp) {
      const now = new Date().getTime();
      if (now - parseInt(cacheTimestamp) < CACHE_DURATION) {
        return JSON.parse(cachedData);
      }
    }
  }

  console.log(`📥 Mengambil data dari API Internal Vercel untuk tab: ${sheetName}...`);
  
  try {
    // ⚡ MENGARAH KE API LOKAL (Bukan lagi ke docs.google.com)
    // Ini memanggil file route.ts yang baru kita buat
    const response = await fetch(`/api/sheets?tab=${sheetName}`);
    
    if (!response.ok) {
      throw new Error('Gagal mengambil data dari API lokal');
    }

    // Data yang datang sudah berbentuk JSON rapi, tidak perlu PapaParse lagi!
    const parsedData = await response.json();

    if (typeof window !== 'undefined' && parsedData && !parsedData.error) {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(parsedData));
      sessionStorage.setItem(CACHE_TIME_KEY, new Date().getTime().toString());
    }

    return parsedData;
  } catch (error) {
    console.error(`Gagal mengambil data dari tab ${sheetName}:`, error);
    return [];
  }
};