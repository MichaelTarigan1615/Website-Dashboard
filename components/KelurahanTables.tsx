"use client";
import React, { useState, useRef, useEffect, useMemo } from 'react';

// ⚡ PERBAIKAN 1: Mendefinisikan Tipe Data
interface KeplingData {
  kecamatan?: string;
  kelurahan?: string;
  target?: number;
  tk_form?: number;  // 💡 AKUISISI
  tk_rekap?: number; // 💡 TK AKTIF
  [key: string]: unknown;
}

const DataStudioDropdown = ({ title, options, selected, onChange }: {
  title: string;
  options: { label: string, metric: number }[];
  selected: string[];
  onChange: (val: string[]) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAll = selected.includes('ALL');
  const selectedCount = isAll ? options.length : selected.length;
  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

  const handleToggleAll = () => {
    if (isAll) onChange([]); 
    else onChange(['ALL']);  
  };

  const handleToggleItem = (label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAll) {
      onChange(options.map(o => o.label).filter(l => l !== label));
    } else {
      if (selected.includes(label)) {
        const newSel = selected.filter(l => l !== label);
        onChange(newSel.length === 0 ? [] : newSel);
      } else {
        onChange([...selected, label]);
      }
    }
  };

  const handleHanya = (label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([label]); 
  };

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <div 
        className="p-2.5 text-xs border border-gray-300 dark:border-slate-600 rounded shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 flex justify-between items-center cursor-pointer font-medium transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title} {selectedCount < options.length ? `(${selectedCount})` : ''}</span>
        <span className="text-[10px]">▼</span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-slate-800 shadow-2xl rounded-md z-50 border border-gray-300 dark:border-slate-600 overflow-hidden flex flex-col">
          <div className="bg-[#9e9e9e] dark:bg-slate-700 text-black dark:text-white px-3 py-2 flex items-center gap-3 font-bold text-xs">
            <input type="checkbox" className="w-4 h-4 cursor-pointer accent-gray-700 dark:accent-blue-500" checked={isAll} onChange={handleToggleAll} />
            <span className="flex-1">{title} ({selectedCount})</span>
            <span>AKUISISI</span> {/* 💡 Update Label filter popup */}
          </div>
          
          <div className="p-2 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="flex items-center gap-2 px-2 py-1.5 border border-gray-300 dark:border-slate-600 rounded-sm">
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ketik untuk menelusuri" className="outline-none text-xs w-full bg-transparent dark:text-white" />
            </div>
          </div>

          <div className="max-h-[250px] overflow-y-auto bg-white dark:bg-slate-800">
            {filteredOptions.map(opt => {
              const isChecked = isAll || selected.includes(opt.label);
              return (
                <div key={opt.label} className="group flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer border-b border-gray-50 dark:border-slate-700/50 last:border-0" onClick={(e) => handleToggleItem(opt.label, e)}>
                  <input type="checkbox" className="w-4 h-4 cursor-pointer pointer-events-none accent-gray-700 dark:accent-blue-500" checked={isChecked} readOnly />
                  <span className="text-[11px] text-gray-700 dark:text-gray-200 flex-1 truncate">{opt.label}</span>
                  <button 
                    onClick={(e) => handleHanya(opt.label, e)}
                    className="opacity-0 group-hover:opacity-100 hover:underline text-gray-600 dark:text-gray-300 text-[10px] font-bold px-1 rounded transition-opacity"
                  >
                    HANYA
                  </button>
                  <span className="text-[11px] text-gray-600 dark:text-gray-400 w-10 text-right">{opt.metric.toLocaleString('id-ID')}</span>
                </div>
              )
            })}
            {filteredOptions.length === 0 && <div className="p-4 text-center text-xs text-gray-500 dark:text-gray-400">Tidak ada hasil.</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default function KelurahanTables({ 
  data = [], 
  filterKec, setFilterKec, filterKel, setFilterKel 
}: { 
  data?: KeplingData[],
  filterKec: string[], setFilterKec: (v: string[]) => void,
  filterKel: string[], setFilterKel: (v: string[]) => void
}) {
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

  const kelKecMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    data.forEach(row => {
      const kec = (row.kecamatan || '').toUpperCase().trim();
      const kel = (row.kelurahan || '').toUpperCase().trim();
      if (kel) {
        if (!map.has(kel)) map.set(kel, new Set());
        map.get(kel)!.add(kec);
      }
    });
    return map;
  }, [data]);

  const aggregatedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const map = new Map();

    data.forEach(row => {
      const kec = (row.kecamatan || 'TIDAK DIKETAHUI').toUpperCase().trim();
      const kel = (row.kelurahan || 'TIDAK DIKETAHUI').toUpperCase().trim();
      const uniqueKey = `${kec}_${kel}`;

      if (!map.has(uniqueKey)) {
        map.set(uniqueKey, {
          'Kecamatan': kec,
          'Kelurahan': kel,
          'Jumlah Kepling': 0,
          'TARGET': 0,
          'AKUISISI': 0, // 💡 Kolom Baru
          'TK AKTIF': 0, // 💡 Kolom Baru
        });
      }

      const kelData = map.get(uniqueKey);
      kelData['Jumlah Kepling'] += 1;
      kelData['TARGET'] += (row.target || 0);
      kelData['AKUISISI'] += (row.tk_form || 0); // 💡 Akuisisi
      kelData['TK AKTIF'] += (row.tk_rekap || 0); // 💡 TK Aktif
    });

    return Array.from(map.values()).map(kelData => {
      const target = kelData['TARGET'];
      const akuisisi = kelData['AKUISISI'];
      const tkAktif = kelData['TK AKTIF'];
      const gap = akuisisi - target; // 💡 Dihitung berdasar Akuisisi
      const percent = target > 0 ? (akuisisi / target) * 100 : 0;
      
      const formatNum = (num: number) => new Intl.NumberFormat('id-ID').format(num);
      const formatPerc = (num: number) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num) + '%';

      return {
        'Kecamatan': kelData['Kecamatan'],
        'Kelurahan': kelData['Kelurahan'],
        'Jumlah Kepling': formatNum(kelData['Jumlah Kepling']),
        'TARGET': formatNum(target),
        'AKUISISI': formatNum(akuisisi),
        'TK AKTIF': formatNum(tkAktif),
        'GAP': formatNum(gap),
        '%': formatPerc(percent)
      } as Record<string, string>;
    });
  }, [data]);

  const getVal = (row: Record<string, string>, targetKey: string) => {
    const foundKey = Object.keys(row).find((k) => k.trim().toLowerCase() === targetKey.toLowerCase());
    return foundKey ? String(row[foundKey]) : '';
  };

  // ⚡ PERBAIKAN: Fungsi parsing yang kebal terhadap angka ribuan
  const parseNum = (val: string) => {
    const num = parseFloat((val || '0').replace(/\./g, '').replace(/,/g, '.'));
    return isNaN(num) ? 0 : num;
  };
  
  const parsePercent = (val: string) => {
    return parseNum(String(val).replace('%', ''));
  };

  // ⚡ PERBAIKAN: Mengatur batas Hue ke 120 (Hijau) agar warna tidak mentok di Oranye
  const getDynamicBgColor = (val: string) => {
    const percent = parsePercent(val);
    const hue = Math.max(0, Math.min((percent / 100) * 120, 120)); 
    return `hsl(${hue}, 85%, 42%)`; // 42% Lightness agar font putih tetap terbaca jelas
  };

  const filteredData = aggregatedData.filter(row => {
    const kec = row.Kecamatan;
    const kel = row.Kelurahan;
    const matchKec = filterKec.includes('ALL') || filterKec.includes(kec);
    
    const expectedLabel = (kelKecMap.get(kel)?.size ?? 0) > 1
      ? `${kel} (${kec})`
      : kel;

    const matchKel = filterKel.includes('ALL') || filterKel.includes(expectedLabel);
    return matchKec && matchKel;
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const displayData = useMemo(() => {
    let sortableItems: Record<string, string>[] = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const valA = getVal(a, sortConfig.key!);
        const valB = getVal(b, sortConfig.key!);

        const cleanValue = (val: string | number | unknown) => {
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
    } else {
      sortableItems.sort((a, b) => parsePercent(getVal(b, '%')) - parsePercent(getVal(a, '%')));
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center">
        <div className="text-[#1b75d8] dark:text-blue-400 font-bold text-xl animate-pulse">Menyiapkan Data Kelurahan...</div>
      </div>
    );
  }

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <span className="text-white/30 opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-[10px]">↕</span>;
    return sortConfig.direction === 'asc' ? <span className="text-white ml-1 text-[10px]">▲</span> : <span className="text-white ml-1 text-[10px]">▼</span>;
  };

  const kecOptionsMap = new Map();
  aggregatedData.forEach(row => {
    const kec = getVal(row, 'Kecamatan').toUpperCase();
    if (!kec) return;
    kecOptionsMap.set(kec, (kecOptionsMap.get(kec) || 0) + parseNum(getVal(row, 'AKUISISI'))); // Sort filter by Akuisisi
  });
  const kecOptions = Array.from(kecOptionsMap.entries()).map(([label, metric]) => ({label, metric})).sort((a,b) => b.metric - a.metric); 

  const availableKelData = filterKec.includes('ALL') ? aggregatedData : aggregatedData.filter(r => filterKec.includes(r.Kecamatan));
  const kelOptionsMap = new Map();
  availableKelData.forEach(row => {
    const kec = row.Kecamatan;
    const kel = row.Kelurahan;
    const label = (kelKecMap.get(kel)?.size ?? 0) > 1 ? `${kel} (${kec})` : kel;
    kelOptionsMap.set(label, (kelOptionsMap.get(label) || 0) + parseNum(row['AKUISISI'])); // Sort filter by Akuisisi
  });
  const kelOptions = Array.from(kelOptionsMap.entries()).map(([label, metric]) => ({label, metric})).sort((a,b) => b.metric - a.metric);

  const sortedDataDesc = [...filteredData].sort((a, b) => parsePercent(getVal(b, '%')) - parsePercent(getVal(a, '%')));
  const sortedDataAsc = [...filteredData].sort((a, b) => parsePercent(getVal(a, '%')) - parsePercent(getVal(b, '%')));

  const top10Data = sortedDataDesc.slice(0, 10);
  const worst10Data = sortedDataAsc.slice(0, 10);

  return (
    <div className="flex gap-4 w-full h-full">
      <div className="flex-[1.5] relative min-h-full">
        <div className="absolute inset-0 bg-[#f8faeb] dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col gap-3 transition-colors">
          <h2 className="font-bold text-[16px] text-black dark:text-white px-1 flex-none">Rekap Kelurahan</h2>
          <div className="overflow-y-auto flex-1 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-inner transition-colors">
            <table className="w-full text-[11px] text-left">
              <thead className="bg-[#1b75d8] text-white font-bold sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-3 py-3 w-8 text-center border-r border-blue-600/30">No.</th>
                  <th onClick={() => handleSort('Kecamatan')} className="px-3 py-3 cursor-pointer group hover:bg-[#1565c0] transition-colors select-none border-r border-blue-600/30">
                    <div className="flex items-center">Kecamatan {getSortIcon('Kecamatan')}</div>
                  </th>
                  <th onClick={() => handleSort('Kelurahan')} className="px-3 py-3 cursor-pointer group hover:bg-[#1565c0] transition-colors select-none border-r border-blue-600/30">
                    <div className="flex items-center">Kelurahan {getSortIcon('Kelurahan')}</div>
                  </th>
                  <th onClick={() => handleSort('Jumlah Kepling')} className="px-2 py-3 cursor-pointer group hover:bg-[#1565c0] transition-colors select-none border-r border-blue-600/30">
                    <div className="flex items-center justify-center text-center leading-tight">Jumlah<br/>Kepling {getSortIcon('Jumlah Kepling')}</div>
                  </th>
                  <th onClick={() => handleSort('TARGET')} className="px-3 py-3 cursor-pointer group hover:bg-[#1565c0] transition-colors select-none border-r border-blue-600/30">
                    <div className="flex items-center justify-center text-center">TARGET {getSortIcon('TARGET')}</div>
                  </th>
                  <th onClick={() => handleSort('AKUISISI')} className="px-3 py-3 cursor-pointer group hover:bg-[#1565c0] transition-colors select-none border-r border-blue-600/30">
                    <div className="flex items-center justify-center text-center uppercase">AKUISISI {getSortIcon('AKUISISI')}</div>
                  </th>
                  <th onClick={() => handleSort('TK AKTIF')} className="px-3 py-3 cursor-pointer group hover:bg-[#1565c0] transition-colors select-none border-r border-blue-600/30">
                    <div className="flex items-center justify-center text-center uppercase">TK AKTIF {getSortIcon('TK AKTIF')}</div>
                  </th>
                  <th onClick={() => handleSort('GAP')} className="px-3 py-3 cursor-pointer group hover:bg-[#1565c0] transition-colors select-none border-r border-blue-600/30">
                    <div className="flex items-center justify-center text-center uppercase">GAP {getSortIcon('GAP')}</div>
                  </th>
                  <th onClick={() => handleSort('%')} className="px-3 py-3 cursor-pointer group hover:bg-[#1565c0] transition-colors select-none">
                    <div className="flex items-center justify-center text-center">% {getSortIcon('%')}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayData.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-slate-700/50 even:bg-[#eef5e1] dark:even:bg-slate-800/80 odd:bg-white dark:odd:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{index + 1}.</td>
                    <td className="px-3 py-2 uppercase font-bold text-gray-800 dark:text-gray-100">{getVal(row, 'Kecamatan')}</td>
                    <td className="px-3 py-2 uppercase font-medium text-gray-700 dark:text-gray-300">{getVal(row, 'Kelurahan')}</td>
                    <td className="px-2 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'Jumlah Kepling')}</td>
                    <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'TARGET')}</td>
                    <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'AKUISISI')}</td>
                    <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'TK AKTIF')}</td>
                    <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'GAP')}</td>
                    <td className="px-3 py-2 text-center font-bold text-white border-l border-white/20 dark:border-slate-900/20" style={{ backgroundColor: getDynamicBgColor(getVal(row, '%')) }}>
                      {getVal(row, '%')}
                    </td>
                  </tr>
                ))}
                {displayData.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-10 text-gray-400 dark:text-gray-500 font-bold">Data tidak ditemukan</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="flex gap-4">
          <DataStudioDropdown title="Kecamatan" options={kecOptions} selected={filterKec} onChange={(newSel) => { setFilterKec(newSel); setFilterKel(['ALL']); }} />
          <DataStudioDropdown title="Kelurahan" options={kelOptions} selected={filterKel} onChange={(newSel) => setFilterKel(newSel)} />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col transition-colors">
          <div className="px-4 py-2 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
            <h2 className="font-bold text-[14px] text-black dark:text-white">Top 10 Kelurahan</h2>
          </div>
          <table className="w-full text-[10px] text-left">
            <thead className="bg-[#388e3c] text-white font-bold">
              <tr>
                <th className="px-2 py-2 w-6 text-center">No.</th>
                <th className="px-2 py-2">Kecamatan</th>
                <th className="px-2 py-2">Kelurahan</th>
                <th className="px-2 py-2 text-center uppercase">TARGET</th>
                <th className="px-2 py-2 text-center uppercase">AKUISISI</th>
                <th className="px-2 py-2 text-center uppercase">TK AKTIF</th>
                <th className="px-2 py-2 text-center uppercase">GAP</th>
                <th className="px-2 py-2 text-center">%</th>
              </tr>
            </thead>
            <tbody>
              {top10Data.map((row, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-slate-700/50 even:bg-[#eef5e1] dark:even:bg-slate-800/80 odd:bg-white dark:odd:bg-slate-800 hover:bg-green-50 dark:hover:bg-slate-700 transition-colors">
                   <td className="px-2 py-2 text-center text-gray-500 dark:text-gray-400">{index + 1}.</td>
                   <td className="px-2 py-2 uppercase font-bold text-gray-800 dark:text-gray-100 truncate max-w-[90px]">{getVal(row, 'Kecamatan')}</td>
                   <td className="px-2 py-2 uppercase font-medium text-gray-700 dark:text-gray-300 truncate max-w-[110px]">{getVal(row, 'Kelurahan')}</td>
                   <td className="px-2 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'TARGET')}</td>
                   <td className="px-2 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'AKUISISI')}</td>
                   <td className="px-2 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'TK AKTIF')}</td>
                   <td className="px-2 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'GAP')}</td>
                   <td className="px-2 py-2 text-center font-bold text-white border-l border-white/20 dark:border-slate-900/20" style={{ backgroundColor: getDynamicBgColor(getVal(row, '%')) }}>
                     {getVal(row, '%')}
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col transition-colors">
          <div className="px-4 py-2 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
            <h2 className="font-bold text-[14px] text-black dark:text-white">Worst 10 Kelurahan</h2>
          </div>
          <table className="w-full text-[10px] text-left">
            <thead className="bg-[#b71c1c] text-white font-bold">
              <tr>
                <th className="px-2 py-2 w-6 text-center">No.</th>
                <th className="px-2 py-2">Kecamatan</th>
                <th className="px-2 py-2">Kelurahan</th>
                <th className="px-2 py-2 text-center uppercase">TARGET</th>
                <th className="px-2 py-2 text-center uppercase">AKUISISI</th>
                <th className="px-2 py-2 text-center uppercase">TK AKTIF</th>
                <th className="px-2 py-2 text-center uppercase">GAP</th>
                <th className="px-2 py-2 text-center">%</th>
              </tr>
            </thead>
            <tbody>
               {worst10Data.map((row, index) => (
                 <tr key={index} className="border-b border-gray-100 dark:border-slate-700/50 even:bg-[#eef5e1] dark:even:bg-slate-800/80 odd:bg-white dark:odd:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                    <td className="px-2 py-2 text-center text-gray-500 dark:text-gray-400">{index + 1}.</td>
                    <td className="px-2 py-2 uppercase font-bold text-gray-800 dark:text-gray-100 truncate max-w-[90px]">{getVal(row, 'Kecamatan')}</td>
                    <td className="px-2 py-2 uppercase font-medium text-gray-700 dark:text-gray-300 truncate max-w-[110px]">{getVal(row, 'Kelurahan')}</td>
                    <td className="px-2 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'TARGET')}</td>
                    <td className="px-2 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'AKUISISI')}</td>
                    <td className="px-2 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'TK AKTIF')}</td>
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