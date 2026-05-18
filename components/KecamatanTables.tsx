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

  if (loading) return <div className="flex-1 flex justify-center items-center text-blue-500 dark:text-blue-400 font-bold">Memuat Data Kecamatan...</div>;

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
      
      {/* REKAP KECAMATAN */}
      <div className="flex-[2] flex flex-col gap-3 relative min-h-full">
        <div className="absolute inset-0 bg-[#f8faeb] dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col gap-3 transition-colors">
          <h2 className="font-bold text-[16px] text-black dark:text-white px-1 flex-none">Rekap Kecamatan</h2>
          <div className="overflow-y-auto flex-1 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-inner transition-colors">
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
                  <tr key={index} className="border-b border-gray-100 dark:border-slate-700/50 even:bg-[#eef5e1] dark:even:bg-slate-800/80 odd:bg-white dark:odd:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="px-3 py-2 text-center text-gray-900 dark:text-gray-400 font-bold">{index + 1}.</td>
                    <td className="px-3 py-2 font-medium uppercase text-gray-800 dark:text-gray-100">{getVal(row, 'Kecamatan')}</td>
                    <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'Jumlah Kelurahan')}</td>
                    <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'Jumlah Kepling')}</td>
                    <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'TARGET')}</td>
                    <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'TK Aktif')}</td>
                    <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'GAP')}</td>
                    <td className="px-3 py-2 text-center font-bold text-white border-l border-white/20 dark:border-slate-900/20" style={{ backgroundColor: getDynamicBgColor(getVal(row, '%')) }}>
                      {getVal(row, '%')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* TABEL TOP & WORST */}
      <div className="w-[380px] flex flex-col gap-4 shrink-0">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden transition-colors">
          <div className="px-4 py-2 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
            <h2 className="font-bold text-[14px] text-black dark:text-white">Top 10 Kecamatan</h2>
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
                <tr key={index} className="border-b border-gray-100 dark:border-slate-700/50 even:bg-[#eef5e1] dark:even:bg-slate-800/80 odd:bg-white dark:odd:bg-slate-800 hover:bg-green-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="px-2 py-2 text-center text-gray-900 dark:text-gray-400 font-bold">{index + 1}.</td>
                  <td className="px-2 py-2 font-bold uppercase text-gray-800 dark:text-gray-100 truncate max-w-[140px]">{getVal(row, 'Kecamatan')}</td>
                  <td className="px-2 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'TARGET')}</td>
                  <td className="px-2 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'TK Aktif')}</td>
                  <td className="px-2 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'GAP')}</td>
                  <td className="px-2 py-2 text-center font-bold text-white border-l border-white/20 dark:border-slate-900/20" style={{ backgroundColor: getDynamicBgColor(getVal(row, '%')) }}>
                    {getVal(row, '%')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden transition-colors">
          <div className="px-4 py-2 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
            <h2 className="font-bold text-[14px] text-black dark:text-white">Worst 10 Kecamatan</h2>
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
                <tr key={index} className="border-b border-gray-100 dark:border-slate-700/50 even:bg-red-50 dark:even:bg-slate-800/80 odd:bg-white dark:odd:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                  <td className="px-2 py-2 text-center text-gray-900 dark:text-gray-400 font-bold">{index + 1}.</td>
                  <td className="px-2 py-2 font-bold uppercase text-gray-800 dark:text-gray-100 truncate max-w-[140px]">{getVal(row, 'Kecamatan')}</td>
                  <td className="px-2 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'TARGET')}</td>
                  <td className="px-2 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'TK Aktif')}</td>
                  <td className="px-2 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'GAP')}</td>
                  <td className="px-2 py-2 text-center font-bold text-white border-l border-white/20 dark:border-slate-900/20" style={{ backgroundColor: getDynamicBgColor(getVal(row, '%')) }}>
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