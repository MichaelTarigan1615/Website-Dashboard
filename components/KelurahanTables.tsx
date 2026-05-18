"use client";
import { useEffect, useState, useRef } from 'react';
import { fetchSheetData } from '../utils/googleSheets';

// =========================================================================
// KOMPONEN KUSTOM DROPDOWN
// =========================================================================
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
            <span>TK AKTIF</span>
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


// =========================================================================
// KOMPONEN UTAMA TABEL KELURAHAN
// =========================================================================
export default function KelurahanTables({ 
  filterKec, setFilterKec, filterKel, setFilterKel 
}: { 
  filterKec: string[], setFilterKec: (v: string[]) => void,
  filterKel: string[], setFilterKel: (v: string[]) => void
}) {
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const result = (await fetchSheetData('KEL')) as Record<string, string>[];
      setData(result);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center">
        <div className="text-[#1b75d8] dark:text-blue-400 font-bold text-xl animate-pulse">Memuat Data Kelurahan...</div>
      </div>
    );
  }

  const getVal = (row: Record<string, string>, targetKey: string) => {
    const foundKey = Object.keys(row).find((k) => k.trim().toLowerCase() === targetKey.toLowerCase());
    return foundKey ? row[foundKey] : '';
  };

  const parsePercent = (val: string) => parseFloat((val || '0').replace(',', '.').replace('%', ''));
  const parseNum = (val: string) => {
    const num = parseFloat((val || '0').replace(/\./g, '').replace(',', '.'));
    return isNaN(num) ? 0 : num;
  };

  const getDynamicBgColor = (val: string) => {
    const percent = parsePercent(val);
    const hue = Math.max(0, Math.min((percent / 40) * 35, 35)); 
    return `hsl(${hue}, 85%, 45%)`; 
  };

  const kecOptionsMap = new Map();
  data.forEach(row => {
    const kec = getVal(row, 'Kecamatan').toUpperCase();
    if (!kec) return;
    kecOptionsMap.set(kec, (kecOptionsMap.get(kec) || 0) + parseNum(getVal(row, 'TK Aktif')));
  });
  const kecOptions = Array.from(kecOptionsMap.entries()).map(([label, metric]) => ({label, metric})).sort((a,b) => b.metric - a.metric); 

  const availableKelData = filterKec.includes('ALL') ? data : data.filter(r => filterKec.includes(getVal(r, 'Kecamatan').toUpperCase()));
  const kelOptionsMap = new Map();
  availableKelData.forEach(row => {
    const kel = getVal(row, 'Kelurahan').toUpperCase();
    if (!kel) return;
    kelOptionsMap.set(kel, (kelOptionsMap.get(kel) || 0) + parseNum(getVal(row, 'TK Aktif')));
  });
  const kelOptions = Array.from(kelOptionsMap.entries()).map(([label, metric]) => ({label, metric})).sort((a,b) => b.metric - a.metric);

  const filteredData = data.filter(row => {
    const matchKec = filterKec.includes('ALL') || filterKec.includes(getVal(row, 'Kecamatan').toUpperCase());
    const matchKel = filterKel.includes('ALL') || filterKel.includes(getVal(row, 'Kelurahan').toUpperCase());
    return matchKec && matchKel;
  });

  const sortedDataDesc = [...filteredData].sort((a, b) => parsePercent(getVal(b, '%')) - parsePercent(getVal(a, '%')));
  const sortedDataAsc = [...filteredData].sort((a, b) => parsePercent(getVal(a, '%')) - parsePercent(getVal(b, '%')));

  const top10Data = sortedDataDesc.slice(0, 10);
  const worst10Data = sortedDataAsc.slice(0, 10);

  return (
    <div className="flex gap-4 w-full">
      <div className="flex-[1.5] relative min-h-full">
        <div className="absolute inset-0 bg-[#f8faeb] dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col gap-3 transition-colors">
          <h2 className="font-bold text-[16px] text-black dark:text-white px-1 flex-none">Rekap Kelurahan</h2>
          <div className="overflow-y-auto flex-1 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-inner transition-colors">
            <table className="w-full text-[11px] text-left">
              <thead className="bg-[#1b75d8] text-white font-bold sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-3 py-3 w-8 text-center">No.</th>
                  <th className="px-3 py-3">Kecamatan</th>
                  <th className="px-3 py-3">Kelurahan</th>
                  <th className="px-2 py-3 text-center leading-tight">Jumlah<br/>Kepling</th>
                  <th className="px-3 py-3 text-center">TARGET</th>
                  <th className="px-3 py-3 text-center uppercase">TK AKTIF</th>
                  <th className="px-3 py-3 text-center uppercase">GAP</th>
                  <th className="px-3 py-3 text-center">%</th>
                </tr>
              </thead>
              <tbody>
                {sortedDataDesc.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-slate-700/50 even:bg-[#eef5e1] dark:even:bg-slate-800/80 odd:bg-white dark:odd:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{index + 1}.</td>
                    <td className="px-3 py-2 uppercase font-bold text-gray-800 dark:text-gray-100">{getVal(row, 'Kecamatan')}</td>
                    <td className="px-3 py-2 uppercase font-medium text-gray-700 dark:text-gray-300">{getVal(row, 'Kelurahan')}</td>
                    <td className="px-2 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'Jumlah Kepling')}</td>
                    <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'TARGET')}</td>
                    <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'TK Aktif')}</td>
                    <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'GAP')}</td>
                    <td className="px-3 py-2 text-center font-bold text-white border-l border-white/20 dark:border-slate-900/20" style={{ backgroundColor: getDynamicBgColor(getVal(row, '%')) }}>
                      {getVal(row, '%')}
                    </td>
                  </tr>
                ))}
                {sortedDataDesc.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-10 text-gray-400 dark:text-gray-500 font-bold">Data tidak ditemukan</td></tr>
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
                <th className="px-2 py-2 text-center uppercase">TK AKTIF</th>
                <th className="px-2 py-2 text-center uppercase">GAP</th>
                <th className="px-2 py-2 text-center">%</th>
              </tr>
            </thead>
            <tbody>
              {top10Data.map((row, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-slate-700/50 even:bg-[#eef5e1] dark:even:bg-slate-800/80 odd:bg-white dark:odd:bg-slate-800 hover:bg-green-50 dark:hover:bg-slate-700 transition-colors">
                   <td className="px-2 py-2 text-center text-gray-500 dark:text-gray-400">{index + 1}.</td>
                   <td className="px-2 py-2 uppercase font-bold text-gray-800 dark:text-gray-100">{getVal(row, 'Kecamatan')}</td>
                   <td className="px-2 py-2 uppercase font-medium text-gray-700 dark:text-gray-300 truncate max-w-[160px]">{getVal(row, 'Kelurahan')}</td>
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
                <th className="px-2 py-2 text-center uppercase">TK AKTIF</th>
                <th className="px-2 py-2 text-center uppercase">GAP</th>
                <th className="px-2 py-2 text-center">%</th>
              </tr>
            </thead>
            <tbody>
               {worst10Data.map((row, index) => (
                 <tr key={index} className="border-b border-gray-100 dark:border-slate-700/50 even:bg-[#eef5e1] dark:even:bg-slate-800/80 odd:bg-white dark:odd:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                    <td className="px-2 py-2 text-center text-gray-500 dark:text-gray-400">{index + 1}.</td>
                    <td className="px-2 py-2 uppercase font-bold text-gray-800 dark:text-gray-100">{getVal(row, 'Kecamatan')}</td>
                    <td className="px-2 py-2 uppercase font-medium text-gray-700 dark:text-gray-300 truncate max-w-[160px]">{getVal(row, 'Kelurahan')}</td>
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