"use client";
import { useEffect, useState } from 'react';
import { fetchSheetData } from '../utils/googleSheets';

export default function KecamatanTables() {
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const result = (await fetchSheetData('KEC')) as Record<string, string>[];
      setData(result);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="flex-1 flex justify-center items-center text-blue-500 font-bold">Memuat Data Kecamatan...</div>;
  }

  const getVal = (row: Record<string, string>, targetKey: string) => {
    if (!row) return '';
    const foundKey = Object.keys(row).find(
      (k) => k.trim().toLowerCase() === targetKey.toLowerCase()
    );
    return foundKey ? row[foundKey] : '';
  };

  const parsePercent = (val: string) => parseFloat((val || '0').replace(',', '.').replace('%', ''));
  
  // FUNGSI SAKTI WARNA: Mengubah persentase menjadi gradasi warna (0% = Merah, 25% = Oranye)
  const getDynamicBgColor = (val: string) => {
    const percent = parsePercent(val);
    // Hue 0 = Merah, Hue 35 = Oranye. Kita memetakan rentang 0% - 25%.
    const hue = Math.max(0, Math.min((percent / 25) * 35, 35));
    // Menggunakan format warna HSL (Hue, Saturation, Lightness)
    return `hsl(${hue}, 85%, 45%)`; 
  };

  const sortedData = [...data].sort((a, b) => parsePercent(getVal(b, '%')) - parsePercent(getVal(a, '%')));
  const top10Data = sortedData.slice(0, 10);
  const worst10Data = [...sortedData].reverse().slice(0, 10);

  return (
    <div className="flex gap-4 flex-1 w-full h-full">
      
      {/* BAGIAN KIRI: Tabel Utama Rekap Kecamatan */}
      <div className="flex-[1.5] bg-[#f8faeb] p-4 rounded-xl shadow-sm border border-green-100">
        <h2 className="font-bold text-lg text-black mb-3">Rekap Kecamatan</h2>
        <div className="overflow-x-auto rounded-lg shadow-sm border border-blue-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1b75d8] text-white font-bold">
              <tr>
                <th className="px-3 py-3 w-10 text-center">No.</th>
                <th className="px-3 py-3">Kecamatan</th>
                <th className="px-3 py-3 text-center leading-tight">Jumlah<br/>Kelurahan</th>
                <th className="px-3 py-3 text-center leading-tight">Jumlah<br/>Kepling</th>
                <th className="px-3 py-3 text-center">Target</th>
                <th className="px-3 py-3 text-center">TK Aktif</th>
                <th className="px-3 py-3 text-center">GAP</th>
                <th className="px-3 py-3 text-center">% ▼</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-b last:border-b-0 even:bg-[#eef5e1] odd:bg-white text-gray-800 hover:bg-blue-50 transition">
                  <td className="px-3 py-2 text-center text-gray-500">{index + 1}.</td>
                  <td className="px-3 py-2 uppercase font-medium">{getVal(row, 'Kecamatan')}</td>
                  <td className="px-3 py-2 text-center">{getVal(row, 'Jumlah Kelurahan')}</td>
                  <td className="px-3 py-2 text-center">{getVal(row, 'Jumlah Kepling')}</td>
                  <td className="px-3 py-2 text-center">{getVal(row, 'TARGET')}</td>
                  <td className="px-3 py-2 text-center">{getVal(row, 'TK Aktif')}</td>
                  <td className="px-3 py-2 text-center">{getVal(row, 'GAP')}</td>
                  <td 
                    className="px-3 py-2 text-center font-semibold text-white" 
                    style={{ backgroundColor: getDynamicBgColor(getVal(row, '%')) }}
                  >
                    {getVal(row, '%')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BAGIAN KANAN: Top 10 & Worst 10 */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Top 10 Kecamatan */}
        <div className="bg-[#f8faeb] p-4 rounded-xl shadow-sm border border-green-100">
          <h2 className="font-bold text-lg text-black mb-3">Top 10 Kecamatan</h2>
          <div className="overflow-hidden rounded-lg shadow-sm border border-green-700">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#3e8e41] text-white font-bold">
                <tr>
                  <th className="px-3 py-2 w-10 text-center">No.</th>
                  <th className="px-3 py-2">Kecamatan</th>
                  <th className="px-3 py-2 text-center">TARGET</th>
                  <th className="px-3 py-2 text-center">TK AKTIF</th>
                  <th className="px-3 py-2 text-center">GAP</th>
                  <th className="px-3 py-2 text-center">% ▼</th>
                </tr>
              </thead>
              <tbody>
                {top10Data.map((row, index) => (
                  <tr key={index} className="even:bg-[#fdfaeb] odd:bg-[#eef5e1] text-gray-800 border-b border-green-100/50 hover:bg-green-100 transition">
                    <td className="px-3 py-1.5 text-center text-gray-500">{index + 1}.</td>
                    <td className="px-3 py-1.5 uppercase font-medium">{getVal(row, 'Kecamatan')}</td>
                    <td className="px-3 py-1.5 text-center">{getVal(row, 'TARGET')}</td>
                    <td className="px-3 py-1.5 text-center">{getVal(row, 'TK Aktif')}</td>
                    <td className="px-3 py-1.5 text-center">{getVal(row, 'GAP')}</td>
                    <td 
                      className="px-3 py-1.5 text-center font-semibold text-white"
                      style={{ backgroundColor: getDynamicBgColor(getVal(row, '%')) }}
                    >
                      {getVal(row, '%')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Worst 10 Kecamatan */}
        <div className="bg-[#f8faeb] p-4 rounded-xl shadow-sm border border-green-100">
          <h2 className="font-bold text-lg text-black mb-3">Worst 10 Kecamatan</h2>
          <div className="overflow-hidden rounded-lg shadow-sm border border-red-700">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#c82333] text-white font-bold">
                <tr>
                  <th className="px-3 py-2 w-10 text-center">No.</th>
                  <th className="px-3 py-2">Kecamatan</th>
                  <th className="px-3 py-2 text-center">Target</th>
                  <th className="px-3 py-2 text-center">TK Aktif</th>
                  <th className="px-3 py-2 text-center">GAP</th>
                  <th className="px-3 py-2 text-center">% ▼</th>
                </tr>
              </thead>
              <tbody>
                {worst10Data.map((row, index) => (
                  <tr key={index} className="even:bg-[#fdfaeb] odd:bg-[#eef5e1] text-gray-800 border-b border-red-100/50 hover:bg-red-50 transition">
                    <td className="px-3 py-1.5 text-center text-gray-500">{index + 1}.</td>
                    <td className="px-3 py-1.5 uppercase font-medium">{getVal(row, 'Kecamatan')}</td>
                    <td className="px-3 py-1.5 text-center">{getVal(row, 'TARGET')}</td>
                    <td className="px-3 py-1.5 text-center">{getVal(row, 'TK Aktif')}</td>
                    <td className="px-3 py-1.5 text-center">{getVal(row, 'GAP')}</td>
                    <td 
                      className="px-3 py-1.5 text-center font-semibold text-white"
                      style={{ backgroundColor: getDynamicBgColor(getVal(row, '%')) }}
                    >
                      {getVal(row, '%')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}