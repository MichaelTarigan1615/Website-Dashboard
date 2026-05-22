import Papa from 'papaparse';

const SHEET_ID = '15JMEUKugjMYhmzm7mQEft80nMHkwLsg9NTjyXJ485Zw';

export const fetchSheetData = async (sheetName: string) => {
  const CACHE_KEY = `cache_data_${sheetName}`;
  const CACHE_TIME_KEY = `cache_time_${sheetName}`;
  const CACHE_DURATION = 5 * 60 * 1000; 

  // 1. CEK MEMORI BROWSER
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

  try {
    let parsedData;

    // 2. LOGIKA HYBRID (Pemisahan Tugas)
    if (sheetName === 'REKAP') {
      // ⚡ BYPASS VERCEL: Browser mengunduh langsung dari Google untuk menghindari Limit 4,5 MB Vercel
      console.log(`📥 Mengunduh REKAP langsung dari Google (Bypass Limit)...`);
      
      const cacheBuster = Math.floor(Date.now() / 60000);
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}&v=${cacheBuster}`;
      
      const response = await fetch(url, { cache: 'no-store' });
      const csvText = await response.text();

      // Laptop pengguna yang bertugas merapikan data ini
      const results = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      });
      parsedData = results.data;

    } else {
      // 🟢 Tab kecil (KEC, KEL, KEP) tetap menggunakan jalur Server Vercel yang super cepat
      console.log(`📥 Mengambil data dari API Vercel untuk tab: ${sheetName}...`);
      
      const response = await fetch(`/api/sheets?tab=${sheetName}`);
      if (!response.ok) throw new Error('Gagal mengambil data dari API lokal');
      parsedData = await response.json();
    }

    // 3. SIMPAN KE MEMORI
    // Pastikan data tidak kosong sebelum menyimpannya ke memori
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