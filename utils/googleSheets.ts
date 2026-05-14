import Papa from 'papaparse';

// Ini adalah ID dari tautan Google Sheets Anda
const SHEET_ID = '15JMEUKugjMYhmzm7mQEft80nMHkwLsg9NTjyXJ485Zw';

// Fungsi untuk menarik data berdasarkan nama tab (KEC, KEL, KEP, atau REKAP)
export const fetchSheetData = async (sheetName: string) => {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
  
  try {
    const response = await fetch(url, { cache: 'no-store' });
    const csvText = await response.text();

    // Memproses teks CSV secara langsung tanpa callback rumit
    const results = Papa.parse(csvText, {
      header: true,         // Membaca baris pertama sebagai nama kolom
      skipEmptyLines: true, // Mengabaikan baris yang kosong
    });

    // Langsung mengembalikan hasil datanya
    return results.data;
  } catch (error) {
    console.error(`Gagal mengambil data dari tab ${sheetName}:`, error);
    return [];
  }
};