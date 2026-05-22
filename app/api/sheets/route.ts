import { NextResponse } from 'next/server';
import Papa from 'papaparse';

export const dynamic = 'force-dynamic';

const SHEET_ID = '15JMEUKugjMYhmzm7mQEft80nMHkwLsg9NTjyXJ485Zw';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sheetName = searchParams.get('tab') || 'KEC';

  // ⚡ PERBAIKAN FATAL: Bulatkan waktu ke menit terdekat (Bukan milidetik)
  // Ini membuat URL tetap sama selama 60 detik, sehingga Vercel bisa menyimpan cache tanpa terkena limit 10 detik!
  const cacheBuster = Math.floor(Date.now() / 60000);
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}&v=${cacheBuster}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 } // Mengizinkan server menyimpan data bersih selama 60 detik
    });

    if (!response.ok) throw new Error('Gagal mengambil data dari Google Sheets');

    const csvText = await response.text();
    const results = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    return NextResponse.json(results.data);
  } catch (error) {
    console.error(`Error API Server untuk tab ${sheetName}:`, error);
    // Kembalikan array kosong jika terjadi error agar aplikasi tidak crash
    return NextResponse.json([]);
  }
}