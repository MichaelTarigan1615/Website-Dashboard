// app/api/kepling/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/utils/tidb';
import Papa from 'papaparse';

export const dynamic = 'force-dynamic';

const SHEET_ID = '15JMEUKugjMYhmzm7mQEft80nMHkwLsg9NTjyXJ485Zw';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hasTabParam = searchParams.has('tab'); 
  const sheetName = (searchParams.get('tab') || '').toUpperCase().trim();
  const clientTimestamp = searchParams.get('t'); 

  if (sheetName === 'REKAP') {
    const cacheBuster = clientTimestamp ? clientTimestamp : Math.floor(Date.now() / 60000);
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=REKAP&v=${cacheBuster}`;

    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error('Gagal mengambil data REKAP');

      const csvText = await response.text();
      const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });

      const minimizedData = results.data.map((row: unknown) => {
        const rowData = row as Record<string, string>;
        const getValLocal = (r: Record<string, string>, target: string) => {
          const foundKey = Object.keys(r).find(k => k.trim().toLowerCase() === target.toLowerCase());
          return foundKey ? r[foundKey] : '';
        };
        return {
          'Wilayah': getValLocal(rowData, 'Wilayah'),
          'NIK': getValLocal(rowData, 'NIK'),
          'Nama TK': getValLocal(rowData, 'Nama TK')
        };
      });

      return NextResponse.json(minimizedData, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
      console.error("❌ Error API detail REKAP:", error);
      return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } });
    }
  }

  let dateObj = new Date(); 
  try {
    const [timeRows] = await pool.query(`
      SELECT MAX(paling_baru) AS last_update 
      FROM (
        SELECT MAX(last_updated_rekap) AS paling_baru FROM data_kepling
        UNION ALL
        SELECT MAX(last_updated_form) AS paling_baru FROM data_kepling
      ) AS t
    `);
    
    const castedTimeRows = timeRows as Record<string, unknown>[];
    const lastUpdateRaw = castedTimeRows[0]?.last_update;
    
    if (lastUpdateRaw) {
      const parsedDate = new Date(lastUpdateRaw as string | number | Date);
      if (!isNaN(parsedDate.getTime())) {
        dateObj = parsedDate; 
      }
    }
  } catch (err) {
    console.error("⚠️ Gagal mengambil waktu TiDB:", err);
  }

  // 🟢 FORMAT TANGGAL MANUAL TERKUNCI (DD/MM/YYYY HH:mm:ss)
  const tzString = dateObj.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
  const wibDate = new Date(tzString);
  const dd = String(wibDate.getDate()).padStart(2, '0');
  const mm = String(wibDate.getMonth() + 1).padStart(2, '0');
  const yyyy = wibDate.getFullYear();
  const hh = String(wibDate.getHours()).padStart(2, '0');
  const min = String(wibDate.getMinutes()).padStart(2, '0');
  const ss = String(wibDate.getSeconds()).padStart(2, '0');
  
  const waktuFormatted = `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;

  try {
    const [rows] = await pool.query('SELECT doc_id, kecamatan, kelurahan, lingkungan, target, tk_rekap, tk_form FROM data_kepling');
    const castedRows = rows as Record<string, unknown>[];
    
    const dataDenganWaktuSempurna = castedRows.map(row => ({
      ...row,
      'Waktu Update': waktuFormatted,
      'waktu_update': waktuFormatted,
      'WAKTU UPDATE': waktuFormatted,
      'waktuUpdate': waktuFormatted,
      'last_update': waktuFormatted,
      'Last Update': waktuFormatted
    }));

    if (hasTabParam) {
      return NextResponse.json(dataDenganWaktuSempurna, { headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json(
      { status: 'success', data: dataDenganWaktuSempurna }, 
      { headers: { 'Cache-Control': 'no-store' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ status: 'error', message: errorMessage }, { status: 500 });
  }
}