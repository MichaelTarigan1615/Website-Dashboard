// utils/googleSheets.ts

export const fetchSheetData = async (sheetName: string, forceRefresh = false) => {
  const CACHE_KEY = `cache_data_${sheetName}`;
  const CACHE_TIME_KEY = `cache_time_${sheetName}`;
  const CACHE_DURATION = 5 * 60 * 1000; 

  if (typeof window !== 'undefined' && !forceRefresh) {
    const cachedData = sessionStorage.getItem(CACHE_KEY);
    const cacheTimestamp = sessionStorage.getItem(CACHE_TIME_KEY);

    if (cachedData && cacheTimestamp) {
      const now = new Date().getTime();
      if (now - parseInt(cacheTimestamp) < CACHE_DURATION) {
        return JSON.parse(cachedData);
      }
    }
  }

  console.log(`📥 Mengambil data via API TiDB untuk tab: ${sheetName}...`);
  
  try {
    const fetchUrl = forceRefresh 
      ? `/api/kepling?tab=${sheetName}&t=${new Date().getTime()}` 
      : `/api/kepling?tab=${sheetName}`;

    const response = await fetch(fetchUrl);
    if (!response.ok) throw new Error('Gagal mengambil data dari API TiDB Cloud');
    
    const parsedData = await response.json();

    // ⚡ PERBAIKAN 1: Menghilangkan any[] dengan struktur kuat
    let dataFinal: Record<string, string | number | null>[] = [];
    if (parsedData && parsedData.status === 'success' && Array.isArray(parsedData.data)) {
      dataFinal = parsedData.data;
    } else {
      dataFinal = Array.isArray(parsedData) ? parsedData : [];
    }

    if (dataFinal.length === 0) {
      dataFinal = [{}];
    }

    const jamSistemSekarang = new Date().toLocaleString("id-ID", { 
      timeZone: "Asia/Jakarta",
      hour12: false
    }).replace(/\./g, ':');

    // ⚡ PERBAIKAN 2: Mengganti any di dalam fungsi .map
    dataFinal = dataFinal.map((row: Record<string, string | number | null>) => {
      // Menggunakan penegasan tipe (as string) agar TS percaya ini adalah teks
      const waktuAkurat = (row['Waktu Update'] || row['waktu_update'] || jamSistemSekarang) as string;
      return {
        ...row,
        'Waktu Update': waktuAkurat,
        'waktu_update': waktuAkurat,
        'WAKTU UPDATE': waktuAkurat,
        'last_update': waktuAkurat
      };
    });

    console.log(`🔍 [DEBUG SINKRON] Data Elemen Pertama Tab ${sheetName}:`, dataFinal[0]);

    if (typeof window !== 'undefined' && dataFinal.length > 0) {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(dataFinal));
      sessionStorage.setItem(CACHE_TIME_KEY, new Date().getTime().toString());
    }

    return dataFinal;
  } catch (error) {
    console.error(`❌ Gagal mengambil data dari tab ${sheetName}:`, error);
    
    const jamDarurat = new Date().toLocaleString("id-ID", { 
      timeZone: "Asia/Jakarta", 
      hour12: false 
    }).replace(/\./g, ':');

    return [{
      'Waktu Update': jamDarurat,
      'waktu_update': jamDarurat,
      'WAKTU UPDATE': jamDarurat,
      'last_update': jamDarurat,
    }];
  }
};