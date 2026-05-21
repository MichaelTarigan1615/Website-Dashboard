import { NextResponse } from 'next/server';
import Papa from 'papaparse';

const SHEET_ID = '15JMEUKugjMYhmzm7mQEft80nMHkwLsg9NTjyXJ485Zw';

export async function GET(request: Request) {
  // Menangkap nama tab dari URL (misal: /api/sheets?tab=REKAP)
  const { searchParams } = new URL(request.url);
  const sheetName = searchParams.get('tab') || 'KEC';

  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

  try {
    // ⚡ MAGIC LEVEL 3: ISR (Incremental Static Regeneration)
    // Server Vercel akan menyimpan hasil unduhan ini di brankas mereka selama 60 detik.
    // Selama 60 detik itu, jutaan orang yang akses akan mendapat data fotokopi yang instan.
    const response = await fetch(url, {
      next: { revalidate: 60 } 
    });

    if (!response.ok) throw new Error('Gagal mengambil data dari Google Sheets');

    // Beban kerja PapaParse sekarang dipindah ke Server Vercel (bukan lagi di laptop user)
    const csvText = await response.text();
    const results = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    // Mengirimkan hasil yang sudah matang dan bersih (format JSON) ke Front-End
    return NextResponse.json(results.data);
  } catch (error) {
    console.error(`Error API Server untuk tab ${sheetName}:`, error);
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}