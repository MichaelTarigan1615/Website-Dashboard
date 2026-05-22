import { NextResponse } from 'next/server';
import Papa from 'papaparse';

export const dynamic = 'force-dynamic';

const SHEET_ID = '15JMEUKugjMYhmzm7mQEft80nMHkwLsg9NTjyXJ485Zw';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sheetName = searchParams.get('tab') || 'KEC';

  const cacheBuster = Math.floor(Date.now() / 60000);
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}&v=${cacheBuster}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 }
    });

    if (!response.ok) throw new Error('Gagal mengambil data dari Google Sheets');

    const csvText = await response.text();
    const results = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    // ⚡ SUPER OPTIMASI: Jika yang diminta tab REKAP, pangkas kolomnya di server!
    // Hanya kirim 3 kolom penting. Ukuran menyusut dari 10MB+ menjadi ~1MB (Lolos limit Vercel)
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

    // Untuk tab ringan (KEC, KEL, KEP) kirim utuh seperti biasa
    return NextResponse.json(results.data);
  } catch (error) {
    console.error(`Error API Server untuk tab ${sheetName}:`, error);
    return NextResponse.json([]);
  }
}