// utils/googleSheets.ts

export const fetchSheetData = async (sheetName: string, forceRefresh = false) => {
  const CACHE_KEY = `cache_data_${sheetName}`;
  const CACHE_TIME_KEY = `cache_time_${sheetName}`;
  const CACHE_DURATION = 5 * 60 * 1000; // Cache lokal browser 5 menit

  // 1. CEK MEMORI CACHE BROWSER
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

    // Penyelarasan bungkusan data objek TiDB vs Array Google Sheets
    let dataFinal: any[] = [];
    if (parsedData && parsedData.status === 'success' && Array.isArray(parsedData.data)) {
      dataFinal = parsedData.data;
    } else {
      dataFinal = Array.isArray(parsedData) ? parsedData : [];
    }

    // ⚡ STRATEGI BUSTER LEVEL FRONTEND (ANTI-GAGAL SEL N1) ⚡
    // Jika data dari API kosong/terhambat cache, buatkan 1 baris cetakan objek kosong
    if (dataFinal.length === 0) {
      dataFinal = [{}];
    }

    // Ambil jam aktivitas sistem lokal saat ini sebagai pelindung fallback terakhir
    const jamSistemSekarang = new Date().toLocaleString("id-ID", { 
      timeZone: "Asia/Jakarta",
      hour12: false
    }).replace(/\./g, ':');

    // Paksa suntikkan semua variasi key waktu ke seluruh baris yang dikirim ke komponen UI
    dataFinal = dataFinal.map((row: any) => {
      const waktuAkurat = row['Waktu Update'] || row['waktu_update'] || jamSistemSekarang;
      return {
        ...row,
        'Waktu Update': waktuAkurat,
        'waktu_update': waktuAkurat,
        'WAKTU UPDATE': waktuAkurat,
        'last_update': waktuAkurat
      };
    });

    console.log(`🔍 [DEBUG SINKRON] Data Elemen Pertama Tab ${sheetName}:`, dataFinal[0]);

    // 3. SIMPAN KE MEMORI CACHE BROWSER
    if (typeof window !== 'undefined' && dataFinal.length > 0) {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(dataFinal));
      sessionStorage.setItem(CACHE_TIME_KEY, new Date().getTime().toString());
    }

    return dataFinal;
  } catch (error) {
    console.error(`❌ Gagal mengambil data dari tab ${sheetName}:`, error);
    
    // ⚡ SABUK PENGAMAN MUTLAK: 
    // Jika API mati/error, kita TETAP mengirimkan jam sistem ke Header.tsx
    // agar teks instruksi sel N1 tidak akan pernah muncul lagi!
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