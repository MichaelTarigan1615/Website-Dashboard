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

  if (loading) return <div className="flex-1 flex justify-center items-center text-blue-500 font-bold">Memuat Data Kecamatan...</div>;

  const getVal = (row: Record<string, string>, targetKey: string) => {
    const foundKey = Object.keys(row).find((k) => k.trim().toLowerCase() === targetKey.toLowerCase());
    return foundKey ? row[foundKey] : '';
  };
  const parsePercent = (val: string) => parseFloat((val || '0').replace(',', '.').replace('%', ''));

  const getDynamicBgColor = (val: string) => {
    const percent = parsePercent(val);
    const hue = Math.max(0, Math.min((percent / 25) * 35, 35));
    return `hsl(${hue}, 85%, 45%)`; 
  };

  const sortedData = [...data].sort((a, b) => parsePercent(getVal(b, '%')) - parsePercent(getVal(a, '%')));
  const top10Data = sortedData.slice(0, 10);
  const worst10Data = [...sortedData].reverse().slice(0, 10);

  return (
    <div className="flex gap-4 flex-1 w-full h-full">
      
      {/* REKAP KECAMATAN - Diperkecil porsinya dari flex-[2.5] menjadi flex-[2] */}
      <div className="flex-[2] flex flex-col gap-3 relative min-h-full">
        <div className="absolute inset-0 bg-[#f8faeb] p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-3">
          <h2 className="font-bold text-[16px] text-black px-1 flex-none">Rekap Kecamatan</h2>
          <div className="overflow-y-auto flex-1 bg-white rounded-lg border border-gray-200 shadow-inner">
            <table className="w-full text-[12px] text-left">
              <thead className="bg-[#1b75d8] text-white font-bold sticky top-0 shadow-sm z-10">
                <tr>
                  <th className="px-3 py-3 w-10 text-center">No.</th>
                  <th className="px-3 py-3">Kecamatan</th>
                  <th className="px-3 py-3 text-center">Jumlah<br/>Kelurahan</th>
                  <th className="px-3 py-3 text-center">Jumlah<br/>Kepling</th>
                  <th className="px-3 py-3 text-center">TARGET</th>
                  <th className="px-3 py-3 text-center">TK AKTIF</th>
                  <th className="px-3 py-3 text-center">GAP</th>
                  <th className="px-3 py-3 text-center">%</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} className="border-b even:bg-[#eef5e1] odd:bg-white hover:bg-blue-50 transition">
                    <td className="px-3 py-2 text-center text-gray-900 font-bold">{index + 1}.</td>
                    <td className="px-3 py-2 font-medium uppercase text-gray-800">{getVal(row, 'Kecamatan')}</td>
                    <td className="px-3 py-2 text-center text-gray-600">{getVal(row, 'Jumlah Kelurahan')}</td>
                    <td className="px-3 py-2 text-center text-gray-600">{getVal(row, 'Jumlah Kepling')}</td>
                    <td className="px-3 py-2 text-center text-gray-600">{getVal(row, 'TARGET')}</td>
                    <td className="px-3 py-2 text-center text-gray-600">{getVal(row, 'TK Aktif')}</td>
                    <td className="px-3 py-2 text-center text-gray-600">{getVal(row, 'GAP')}</td>
                    <td className="px-3 py-2 text-center font-bold text-white border-l border-white/20" style={{ backgroundColor: getDynamicBgColor(getVal(row, '%')) }}>
                      {getVal(row, '%')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* TABEL TOP & WORST - Diperlebar dari 320px menjadi 380px */}
      <div className="w-[380px] flex flex-col gap-4 shrink-0">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-2 bg-white border-b border-gray-200">
            <h2 className="font-bold text-[14px] text-black">Top 10 Kecamatan</h2>
          </div>
          <table className="w-full text-[10px] text-left">
            <thead className="bg-[#388e3c] text-white font-bold">
              <tr>
                <th className="px-2 py-2 w-6 text-center">No.</th>
                <th className="px-2 py-2">Kecamatan</th>
                <th className="px-2 py-2 text-center">TARGET</th>
                <th className="px-2 py-2 text-center leading-tight">TK<br/>AKTIF</th>
                <th className="px-2 py-2 text-center">GAP</th>
                <th className="px-2 py-2 text-center">%</th>
              </tr>
            </thead>
            <tbody>
              {top10Data.map((row, index) => (
                <tr key={index} className="border-b even:bg-[#eef5e1] odd:bg-white hover:bg-green-50">
                  <td className="px-2 py-2 text-center text-gray-900 font-bold">{index + 1}.</td>
                  {/* PERBAIKAN: max-w dilonggarkan dari 80px menjadi 140px agar nama tidak terpotong */}
                  <td className="px-2 py-2 font-bold uppercase text-gray-800 truncate max-w-[140px]">{getVal(row, 'Kecamatan')}</td>
                  <td className="px-2 py-2 text-center text-gray-600">{getVal(row, 'TARGET')}</td>
                  <td className="px-2 py-2 text-center text-gray-600">{getVal(row, 'TK Aktif')}</td>
                  <td className="px-2 py-2 text-center text-gray-600">{getVal(row, 'GAP')}</td>
                  <td className="px-2 py-2 text-center font-bold text-white" style={{ backgroundColor: getDynamicBgColor(getVal(row, '%')) }}>
                    {getVal(row, '%')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-2 bg-white border-b border-gray-200">
            <h2 className="font-bold text-[14px] text-black">Worst 10 Kecamatan</h2>
          </div>
          <table className="w-full text-[10px] text-left">
            <thead className="bg-[#b71c1c] text-white font-bold">
              <tr>
                <th className="px-2 py-2 w-6 text-center">No.</th>
                <th className="px-2 py-2">Kecamatan</th>
                <th className="px-2 py-2 text-center">TARGET</th>
                <th className="px-2 py-2 text-center leading-tight">TK<br/>AKTIF</th>
                <th className="px-2 py-2 text-center">GAP</th>
                <th className="px-2 py-2 text-center">%</th>
              </tr>
            </thead>
            <tbody>
              {worst10Data.map((row, index) => (
                <tr key={index} className="border-b even:bg-red-50 odd:bg-white hover:bg-red-100">
                  <td className="px-2 py-2 text-center text-gray-900 font-bold">{index + 1}.</td>
                  {/* PERBAIKAN: max-w dilonggarkan dari 80px menjadi 140px agar nama tidak terpotong */}
                  <td className="px-2 py-2 font-bold uppercase text-gray-800 truncate max-w-[140px]">{getVal(row, 'Kecamatan')}</td>
                  <td className="px-2 py-2 text-center text-gray-600">{getVal(row, 'TARGET')}</td>
                  <td className="px-2 py-2 text-center text-gray-600">{getVal(row, 'TK Aktif')}</td>
                  <td className="px-2 py-2 text-center text-gray-600">{getVal(row, 'GAP')}</td>
                  <td className="px-2 py-2 text-center font-bold text-white" style={{ backgroundColor: getDynamicBgColor(getVal(row, '%')) }}>
                    {getVal(row, '%')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}