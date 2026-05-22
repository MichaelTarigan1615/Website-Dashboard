export const fetchSheetData = async (sheetName: string) => {
  const CACHE_KEY = `cache_data_${sheetName}`;
  const CACHE_TIME_KEY = `cache_time_${sheetName}`;
  const CACHE_DURATION = 5 * 60 * 1000; 

  // 1. CEK MEMORI CACHE BROWSER (LEVEL 2)
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

  console.log(`📥 Mengambil data via API Vercel untuk tab: ${sheetName}...`);
  
  try {
    // 🟢 Ambil melalui API Vercel (100% Aman dari CORS Block)
    const response = await fetch(`/api/sheets?tab=${sheetName}`);
    if (!response.ok) throw new Error('Gagal mengambil data dari API Vercel');
    
    const parsedData = await response.json();

    // 3. SIMPAN KE MEMORI CACHE BROWSER
    if (typeof window !== 'undefined' && parsedData && parsedData.length > 0) {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(parsedData));
      sessionStorage.setItem(CACHE_TIME_KEY, new Date().getTime().toString());
    }

    return parsedData;
  } catch (error) {
    console.error(`Gagal mengambil data dari tab ${sheetName}:`, error);
    return [];
  }
};