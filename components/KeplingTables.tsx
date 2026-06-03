"use client";
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { fetchSheetData } from '../utils/googleSheets';

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAll = selected.includes('ALL');
  const selectedCount = isAll ? options.length : selected.length;
  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

  const handleToggleAll = () => isAll ? onChange([]) : onChange(['ALL']);

  const handleToggleItem = (label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAll) onChange(options.map(o => o.label).filter(l => l !== label));
    else {
      if (selected.includes(label)) {
        const newSel = selected.filter(l => l !== label);
        onChange(newSel.length === 0 ? [] : newSel);
      } else onChange([...selected, label]);
    }
  };

  const handleHanya = (label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([label]);
  };

  return (
    <div className="relative w-64" ref={dropdownRef}>
      <div className="px-4 py-3 text-sm border border-gray-300 dark:border-slate-600 rounded shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 flex justify-between items-center cursor-pointer font-medium transition-colors" onClick={() => setIsOpen(!isOpen)}>
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
                  <button onClick={(e) => handleHanya(opt.label, e)} className="opacity-0 group-hover:opacity-100 hover:underline text-gray-600 dark:text-gray-300 text-[10px] font-bold px-1 rounded transition-opacity">HANYA</button>
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

export default function KeplingTables({ 
  data = [], 
  filterKec, setFilterKec, filterKel, setFilterKel 
}: { 
  data?: any[],
  filterKec: string[], setFilterKec: (v: string[]) => void,
  filterKel: string[], setFilterKel: (v: string[]) => void
}) {
  const [rekapData, setRekapData] = useState<Record<string, string>[]>([]); 
  const [isRekapLoading, setIsRekapLoading] = useState(true); 
  const [expandedKepling, setExpandedKepling] = useState<string | null>(null);

  // ⚡ DETEKSI KELURAHAN KEMBAR DI LINTAS KECAMATAN
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

  const formattedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map(row => {
      const target = row.target || 0;
      const tkAktif = row.tk_aktif || 0;
      const gap = tkAktif - target;
      const percent = target > 0 ? (tkAktif / target) * 100 : 0;
      
      const formatNum = (num: number) => new Intl.NumberFormat('id-ID').format(num);
      const formatPerc = (num: number) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num) + '%';
      const keplingName = `${row.kecamatan}-${row.kelurahan}-${row.lingkungan}`;

      return {
        'Kecamatan': row.kecamatan || '',
        'Kelurahan': row.kelurahan || '',
        'Kepala Lingkungan': keplingName,
        'TARGET': formatNum(target),
        'TK Aktif': formatNum(tkAktif),
        'GAP': formatNum(gap),
        '%': formatPerc(percent)
      };
    });
  }, [data]);

  useEffect(() => {
    let isMounted = true;
    async function loadDetailRekap(force = false) {
      if (force) setIsRekapLoading(true);
      try {
        const rekapResult = await fetchSheetData('REKAP', force);
        if (isMounted) setRekapData(rekapResult as Record<string, string>[]);
      } catch (error) {
        console.error("Gagal memuat detail peserta REKAP:", error);
      } finally {
        if (isMounted) setIsRekapLoading(false);
      }
    }
    const timer = setTimeout(() => loadDetailRekap(), 400);
    const handleRefresh = () => loadDetailRekap(true);
    window.addEventListener('forceRefreshData', handleRefresh);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
      window.removeEventListener('forceRefreshData', handleRefresh);
    };
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="text-[#1b75d8] dark:text-blue-400 font-bold text-xl animate-pulse">Menyiapkan Data Kepala Lingkungan...</div>
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

  const getTopBgColor = (val: string) => {
    const percent = parsePercent(val);
    const hue = Math.max(0, Math.min((percent / 100) * 120, 120)); 
    return `hsl(${hue}, 70%, 45%)`; 
  };
  const getWorstBgColor = (val: string) => {
    const percent = parsePercent(val);
    const lightness = Math.max(30, Math.min(80, 45 + (percent / 10))); 
    return `hsl(0, 80%, ${lightness}%)`; 
  };

  // LOGIKA DROPDOWN DENGAN PENGIKAT KECAMATAN UNTUK KELURAHAN KEMBAR
  const kecOptionsMap = new Map();
  formattedData.forEach(row => {
    const kec = getVal(row, 'Kecamatan').toUpperCase();
    if (kec) kecOptionsMap.set(kec, (kecOptionsMap.get(kec) || 0) + parseNum(getVal(row, 'TK Aktif')));
  });
  const kecOptions = Array.from(kecOptionsMap.entries()).map(([label, metric]) => ({label, metric})).sort((a,b) => b.metric - a.metric);

  const availableKelData = filterKec.includes('ALL') ? formattedData : formattedData.filter(r => filterKec.includes(getVal(r, 'Kecamatan').toUpperCase()));
  const kelOptionsMap = new Map();
  availableKelData.forEach(row => {
    const kec = getVal(row, 'Kecamatan').toUpperCase();
    const kel = getVal(row, 'Kelurahan').toUpperCase();
    const label = (kelKecMap.get(kel)?.size ?? 0) > 1 ? `${kel} (${kec})` : kel;
    kelOptionsMap.set(label, (kelOptionsMap.get(label) || 0) + parseNum(getVal(row, 'TK Aktif')));
  });
  const kelOptions = Array.from(kelOptionsMap.entries()).map(([label, metric]) => ({label, metric})).sort((a,b) => b.metric - a.metric);

  // FILTERING DATA TABEL
  const filteredData = formattedData.filter(row => {
    const kec = getVal(row, 'Kecamatan').toUpperCase();
    const kel = getVal(row, 'Kelurahan').toUpperCase();
    const matchKec = filterKec.includes('ALL') || filterKec.includes(kec);
    
    const expectedLabel = (kelKecMap.get(kel)?.size ?? 0) > 1 ? `${kel} (${kec})` : kel;
    const matchKel = filterKel.includes('ALL') || filterKel.includes(expectedLabel);
    return matchKec && matchKel;
  });

  const sortedDataDesc = [...filteredData].sort((a, b) => parsePercent(getVal(b, '%')) - parsePercent(getVal(a, '%')));
  const sortedDataAsc = [...filteredData].sort((a, b) => parsePercent(getVal(a, '%')) - parsePercent(getVal(b, '%')));

  const top200Data = sortedDataDesc.slice(0, 200);
  const worst200Data = sortedDataAsc.slice(0, 200);

  const renderDetailPeserta = (keplingName: string) => {
    if (expandedKepling !== keplingName) return null;
    const pesertaDetail = rekapData.filter(
      r => getVal(r, 'Wilayah').trim().toUpperCase() === keplingName.trim().toUpperCase()
    );

    return (
      <tr className="bg-blue-50 dark:bg-slate-800/80 shadow-inner">
        <td colSpan={6} className="p-4 border-b border-blue-200 dark:border-slate-700">
          <div className="bg-white dark:bg-slate-900 rounded-md border border-blue-300 dark:border-slate-600 shadow-sm overflow-hidden max-h-[300px] flex flex-col">
            <div className="px-3 py-2 bg-[#e3f2fd] dark:bg-slate-800 border-b border-blue-200 dark:border-slate-700 flex justify-between items-center">
              <span className="text-xs font-bold text-[#1565c0] dark:text-blue-300">Detail Peserta: {keplingName}</span>
              {!isRekapLoading && (
                <span className="text-xs font-semibold text-[#1565c0] dark:text-blue-300 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full border border-blue-200 dark:border-slate-600">
                  Total: {pesertaDetail.length}
                </span>
              )}
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-[10px] text-left">
                <thead className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-bold sticky top-0">
                  <tr>
                    <th className="px-3 py-2 w-10 text-center border-b border-gray-200 dark:border-slate-700">No.</th>
                    <th className="px-3 py-2 border-b border-gray-200 dark:border-slate-700 w-32">NIK</th>
                    <th className="px-3 py-2 border-b border-gray-200 dark:border-slate-700">Nama TK</th>
                  </tr>
                </thead>
                <tbody>
                  {isRekapLoading ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-8 text-center text-blue-600 dark:text-blue-400 font-medium animate-pulse">
                        Sinkronisasi daftar peserta dari database... Mohon tunggu sebentar.
                      </td>
                    </tr>
                  ) : pesertaDetail.length > 0 ? (
                    pesertaDetail.map((peserta, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-slate-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                        <td className="px-3 py-1.5 text-center text-gray-500 dark:text-gray-400">{i + 1}.</td>
                        <td className="px-3 py-1.5 font-mono text-gray-600 dark:text-gray-300">{getVal(peserta, 'NIK')}</td>
                        <td className="px-3 py-1.5 font-medium text-gray-800 dark:text-gray-100">{getVal(peserta, 'Nama TK')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-3 py-6 text-center text-gray-400 dark:text-gray-500 italic">
                        Tidak ada data peserta spesifik di sistem (Atau peserta berasal dari FORM input).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex justify-center gap-4 bg-[#f8faeb] dark:bg-slate-900 p-3 rounded-xl border border-green-100 dark:border-slate-700 shadow-sm transition-colors">
        <DataStudioDropdown title="Kecamatan" options={kecOptions} selected={filterKec} onChange={(newSel) => { setFilterKec(newSel); setFilterKel(['ALL']); }} />
        <DataStudioDropdown title="Kelurahan" options={kelOptions} selected={filterKel} onChange={(newSel) => setFilterKel(newSel)} />
      </div>

      <div className="flex gap-4 flex-1 relative min-h-[500px]">
        <div className="flex-1 absolute inset-y-0 left-0 w-[calc(50%-8px)] bg-[#f8faeb] dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden transition-colors">
          <div className="px-4 py-3 bg-[#f8faeb] dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center h-[50px]">
            <h2 className="font-bold text-[15px] text-black dark:text-white">Top 200 Kepala Lingkungan</h2>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium italic">Klik baris untuk lihat peserta</span>
          </div>
          <div className="overflow-y-auto flex-1 bg-white dark:bg-slate-800">
            <table className="w-full text-[11px] text-left">
              <thead className="bg-[#388e3c] text-white font-bold sticky top-0 z-10 shadow-sm whitespace-nowrap">
                <tr>
                  <th className="px-3 py-3 w-8 text-center">No.</th>
                  <th className="px-3 py-3">Kepala Lingkungan</th>
                  <th className="px-3 py-3 text-center uppercase">TARGET</th>
                  <th className="px-3 py-3 text-center uppercase">TK Aktif</th>
                  <th className="px-3 py-3 text-center uppercase">GAP</th>
                  <th className="px-3 py-3 text-center">%</th>
                </tr>
              </thead>
              <tbody>
                {top200Data.map((row, index) => {
                  const keplingName = getVal(row, 'Kepala Lingkungan');
                  return (
                    <React.Fragment key={index}>
                      <tr 
                        onClick={() => setExpandedKepling(expandedKepling === keplingName ? null : keplingName)}
                        className={`border-b border-gray-100 dark:border-slate-700/50 cursor-pointer transition-colors ${expandedKepling === keplingName ? 'bg-blue-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-slate-600' : 'even:bg-[#eef5e1] dark:even:bg-slate-800/80 odd:bg-white dark:odd:bg-slate-800 hover:bg-green-50 dark:hover:bg-slate-700'}`}
                      >
                        <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{index + 1}.</td>
                        <td className="px-3 py-2 uppercase font-medium text-gray-800 dark:text-gray-100 flex items-center gap-1">
                          <span className={`text-[8px] transition-transform ${expandedKepling === keplingName ? 'rotate-90 text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>▶</span>
                          {keplingName}
                        </td>
                        <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'TARGET')}</td>
                        <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'TK Aktif')}</td>
                        <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'GAP')}</td>
                        <td className="px-3 py-2 text-center font-bold text-white border-l border-white/20 dark:border-slate-900/20" style={{ backgroundColor: getTopBgColor(getVal(row, '%')) }}>
                          {getVal(row, '%')}
                        </td>
                      </tr>
                      {renderDetailPeserta(keplingName)}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex-1 absolute inset-y-0 right-0 w-[calc(50%-8px)] bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden transition-colors">
          <div className="px-4 py-3 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center h-[50px]">
            <h2 className="font-bold text-[15px] text-black dark:text-white">Worst 200 Kepala Lingkungan</h2>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium italic">Klik baris untuk lihat peserta</span>
          </div>
          <div className="overflow-y-auto flex-1 bg-white dark:bg-slate-800">
            <table className="w-full text-[11px] text-left">
              <thead className="bg-[#b71c1c] text-white font-bold sticky top-0 z-10 shadow-sm whitespace-nowrap">
                <tr>
                  <th className="px-3 py-3 w-8 text-center">No.</th>
                  <th className="px-3 py-3">Kepala Lingkungan</th>
                  <th className="px-3 py-3 text-center uppercase">TARGET</th>
                  <th className="px-3 py-3 text-center uppercase">TK Aktif</th>
                  <th className="px-3 py-3 text-center uppercase">GAP</th>
                  <th className="px-3 py-3 text-center">%</th>
                </tr>
              </thead>
              <tbody>
                {worst200Data.map((row, index) => {
                  const keplingName = getVal(row, 'Kepala Lingkungan');
                  return (
                    <React.Fragment key={index}>
                      <tr 
                        onClick={() => setExpandedKepling(expandedKepling === keplingName ? null : keplingName)}
                        className={`border-b border-gray-100 dark:border-slate-700/50 cursor-pointer transition-colors ${expandedKepling === keplingName ? 'bg-blue-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-slate-600' : 'even:bg-red-50 dark:even:bg-slate-800/80 odd:bg-white dark:odd:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/30'}`}
                      >
                        <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">{index + 1}.</td>
                        <td className="px-3 py-2 uppercase font-medium text-gray-800 dark:text-gray-100 flex items-center gap-1">
                          <span className={`text-[8px] transition-transform ${expandedKepling === keplingName ? 'rotate-90 text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>▶</span>
                          {keplingName}
                        </td>
                        <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'TARGET')}</td>
                        <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'TK Aktif')}</td>
                        <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{getVal(row, 'GAP')}</td>
                        <td className="px-3 py-2 text-center font-bold text-white border-l border-white/20 dark:border-slate-900/20" style={{ backgroundColor: getWorstBgColor(getVal(row, '%')) }}>
                          {getVal(row, '%')}
                        </td>
                      </tr>
                      {renderDetailPeserta(keplingName)}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}