import { NextResponse } from 'next/server';
import Papa from 'papaparse';

export const dynamic = 'force-dynamic';

const SHEET_ID = '15JMEUKugjMYhmzm7mQEft80nMHkwLsg9NTjyXJ485Zw';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sheetName = searchParams.get('tab') || 'KEC';
  
  // 1. TANGKAP SINYAL REFRESH DARI TOMBOL (Dari googleSheets.ts)
  const clientTimestamp = searchParams.get('t'); 

  // 2. LOGIKA CACHE PINTAR
  // Jika tombol Segarkan ditekan (ada clientTimestamp), gunakan waktu saat ini juga agar 100% bypass cache.
  // Jika tidak (memuat normal), bulatkan ke 1 menit untuk menghemat kuota Vercel.
  const cacheBuster = clientTimestamp ? clientTimestamp : Math.floor(Date.now() / 60000);

  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}&v=${cacheBuster}`;

  try {
    // 3. MATIKAN CACHE INTERNAL NEXT.JS SAAT REFRESH
    let fetchOptions: RequestInit = {};
    if (clientTimestamp) {
      fetchOptions = { cache: 'no-store' }; // Paksa tarik baru dari Google!
    } else {
      fetchOptions = { next: { revalidate: 60 } }; // Simpan cache 60 detik
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) throw new Error('Gagal mengambil data dari Google Sheets');

    const csvText = await response.text();
    const results = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    // 4. PEMANGKASAN KOLOM UNTUK TAB REKAP (Lolos Limit 4,5MB Vercel)
    if (sheetName === 'REKAP') {
      const minimizedData = results.data.map((row: any) => {
        const getValLocal = (r: any, target: string) => {
          const foundKey = Object.keys(r).find(k => k.trim().toLowerCase() === target.toLowerCase());
          return foundKey ? r[foundKey] : '';
        };
        return {
          'Wilayah': getValLocal(row, 'Wilayah'),
          'NIK': getValLocal(row, 'NIK'),
          'Nama TK': getValLocal(row, 'Nama TK')
        };
      });
      return NextResponse.json(minimizedData);
    }

    // Untuk tab KEC, KEL, KEP
    return NextResponse.json(results.data);
  } catch (error) {
    console.error(`Error API Server untuk tab ${sheetName}:`, error);
    return NextResponse.json([]);
  }
}