"use client";
import React, { useState, useMemo } from 'react';

// Menerima data real-time yang sudah diparsing dari page.tsx
export default function KecamatanTables({ data = [] }: { data?: any[] }) {
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

  // ⚡ AGREGATOR OTOMATIS: Mengubah data mentah Kepling menjadi data Rekap Kecamatan
  const aggregatedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const map = new Map();
    const kelurahanSetMap = new Map();

    data.forEach(row => {
      const kec = (row.kecamatan || 'TIDAK DIKETAHUI').toUpperCase();
      const kel = (row.kelurahan || 'TIDAK DIKETAHUI').toUpperCase();

      if (!map.has(kec)) {
        map.set(kec, {
          'Kecamatan': kec,
          'Jumlah Kelurahan': 0, // Akan dihitung dari Set
          'Jumlah Kepling': 0,
          'TARGET': 0,
          'TK Aktif': 0,
        });
        kelurahanSetMap.set(kec, new Set());
      }

      const kecData = map.get(kec);
      kecData['Jumlah Kepling'] += 1;
      kecData['TARGET'] += (row.target || 0);
      kecData['TK Aktif'] += (row.tk_aktif || 0);
      kelurahanSetMap.get(kec).add(kel);
    });

    // Finalisasi perhitungan dan format output agar SAMA PERSIS dengan format Google Sheets lama
    return Array.from(map.values()).map(kecData => {
      const kec = kecData['Kecamatan'];
      const target = kecData['TARGET'];
      const tkAktif = kecData['TK Aktif'];
      const gap = tkAktif - target;
      const percent = target > 0 ? (tkAktif / target) * 100 : 0;
      
      const formatNum = (num: number) => new Intl.NumberFormat('id-ID').format(num);
      const formatPerc = (num: number) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num) + '%';

      return {
        'Kecamatan': kec,
        'Jumlah Kelurahan': formatNum(kelurahanSetMap.get(kec).size),
        'Jumlah Kepling': formatNum(kecData['Jumlah Kepling']),
        'TARGET': formatNum(target),
        'TK Aktif': formatNum(tkAktif),
        'GAP': formatNum(gap),
        '%': formatPerc(percent)
      };
    });
  }, [data]);

  const getVal = (row: Record<string, string>, targetKey: string) => {
    const foundKey = Object.keys(row).find((k) => k.trim().toLowerCase() === targetKey.toLowerCase());
    return foundKey ? String(row[foundKey]) : '';
  };
  
  const parsePercent = (val: string) => parseFloat((val || '0').replace(',', '.').replace('%', ''));

  const getDynamicBgColor = (val: string) => {
    const percent = parsePercent(val);
    const hue = Math.max(0, Math.min((percent / 25) * 35, 35));
    return `hsl(${hue}, 85%, 45%)`; 
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedTableData = useMemo(() => {
    let sortableItems = [...aggregatedData]; 
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const valA = getVal(a, sortConfig.key!);
        const valB = getVal(b, sortConfig.key!);

        const cleanValue = (val: any) => {
          if (!val) return 0;
          const strVal = String(val);
          const cleanStr = strVal.replace(/\./g, '').replace(/,/g, '.').replace('%', '');
          const num = parseFloat(cleanStr);
          return isNaN(num) ? strVal : num; 
        };

        const cleanedA = cleanValue(valA);
        const cleanedB = cleanValue(valB);

        if (typeof cleanedA === 'number' && typeof cleanedB === 'number') {
          return sortConfig.direction === 'asc' ? cleanedA - cleanedB : cleanedB - cleanedA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [aggregatedData, sortConfig]);

  if (!data || data.length === 0) {
    return <div className="flex-1 flex justify-center items-center text-blue-500 dark:text-blue-400 font-bold">Menyiapkan Data Kecamatan...</div>;
  }

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <span className="text-white/30 opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-[10px]">↕</span>;
    return sortConfig.direction === 'asc' ? <span className="text-white ml-1 text-[10px]">▲</span> : <span className="text-white ml-1 text-[10px]">▼</span>;
  };

  const sortedDataDesc = [...aggregatedData].sort((a, b) => parsePercent(getVal(b, '%')) - parsePercent(getVal(a, '%')));
  const top10Data = sortedDataDesc.slice(0, 10);
  const worst10Data = [...sortedDataDesc].reverse().slice(0, 10);

  return (
    <div className="flex gap-4 flex-1 w-full h-full">
      <div className="flex-[2] flex flex-col gap-3 relative min-h-full">
        <div className="absolute inset-0 bg-[#f8faeb] dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col gap-3 transition-colors">
          <h2 className="font-bold text-[16px] text-black dark:text-white px-1 flex-none">Rekap Kecamatan</h2>
          <div className="overflow-y-auto flex-1 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-inner transition-colors">
            <table className="w-full text-[12px] text-left">
              <thead className="bg-[#1b75d8] text-white font-bold sticky top-0 shadow-sm z-10">
                <tr>
                  <th className="px-3 py-3 w-10 text-center border-r border-blue-600/30">No.</th>
                  <th onClick={() => handleSort('Kecamatan')} className="px-3 py-3 cursor-pointer group hover:bg-[#1565c0] transition-colors select-none border-r border-blue-600/30">
                    <div className="flex items-center">Kecamatan {getSortIcon('Kecamatan')}</div>
                  </th>
                  <th onClick={() => handleSort('Jumlah Kelurahan')} className="px-3 py-3 cursor-pointer group hover:bg-[#1565c0] transition-colors select-none border-r border-blue-600/30">
                    <div className="flex items-center justify-center text-center">Jumlah<br/>Kelurahan {getSortIcon('Jumlah Kelurahan')}</div>
                  </th>
                  <th onClick={() => handleSort('Jumlah Kepling')} className="px-3 py-3 cursor-pointer group hover:bg-[#1565c0] transition-colors select-none border-r border-blue-600/30">
                    <div className="flex items-center justify-center text-center">Jumlah<br/>Kepling {getSortIcon('Jumlah Kepling')}</div>
                  </th>
                  <th onClick={() => handleSort('TARGET')} className="px-3 py-3 cursor-pointer group hover:bg-[#1565c0] transition-colors select-none border-r border-blue-600/30">
                    <div className="flex items-center justify-center text-center">TARGET {getSortIcon('TARGET')}</div>
                  </th>
                  <th onClick={() => handleSort('TK Aktif')} className="px-3 py-3 cursor-pointer group hover:bg-[#1565c0] transition-colors select-none border-r border-blue-600/30">
                    <div className="flex items-center justify-center text-center">TK AKTIF {getSortIcon('TK Aktif')}</div>
                  </th>
                  <th onClick={() => handleSort('GAP')} className="px-3 py-3 cursor-pointer group hover:bg-[#1565c0] transition-colors select-none border-r border-blue-600/30">
                    <div className="flex items-center justify-center text-center">GAP {getSortIcon('GAP')}</div>
                  </th>
                  <th onClick={() => handleSort('%')} className="px-3 py-3 cursor-pointer group hover:bg-[#1565c0] transition-colors select-none">
                    <div className="flex items-center justify-center text-center">% {getSortIcon('%')}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTableData.map((row, index) => (
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