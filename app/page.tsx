"use client";
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import KpiCards from '../components/KpiCards';
import KecamatanTables from '../components/KecamatanTables';
import KelurahanTables from '../components/KelurahanTables'; 
import KeplingTables from '../components/KeplingTables';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'KEC' | 'KEL' | 'KEPLING'>('KEC');
  const [filterKec, setFilterKec] = useState<string[]>(['ALL']);
  const [filterKel, setFilterKel] = useState<string[]>(['ALL']);

  // ⚡ TRICK UTAMA: Mencatat tab mana saja yang sudah pernah dibuka oleh pengguna
  // Di awal, kita hanya mengizinkan tab KEC yang aktif dimuat untuk menghemat load awal.
  const [mountedTabs, setMountedTabs] = useState<Record<string, boolean>>({
    KEC: true,
    KEL: false,
    KEPLING: false
  });

  // PUSAT KENDALI MODE GELAP
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Aktifkan pencatatan trigger ketika activeTab berubah
  useEffect(() => {
    if (!mountedTabs[activeTab]) {
      setMountedTabs(prev => ({ ...prev, [activeTab]: true }));
    }
  }, [activeTab, mountedTabs]);

  const handleTabChange = (tab: 'KEC' | 'KEL' | 'KEPLING') => {
    setActiveTab(tab);
    setFilterKec(['ALL']);
    setFilterKel(['ALL']);
  };

  return (
    <main className="min-h-screen bg-[#f3f4ec] dark:bg-[#0f172a] font-sans overflow-x-auto flex flex-col transition-colors duration-300">
      <div className="min-w-[1500px] mx-auto flex flex-col flex-1 w-full">
        
        <Header 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
        
        <div className="p-4 flex gap-4 mt-2 flex-1">
          <div className="flex-none">
            <KpiCards activeTab={activeTab} filterKec={filterKec} filterKel={filterKel} isDarkMode={isDarkMode} />
          </div>
          
          <div className="flex-1 flex min-w-0 relative">
            {/* 🟢 TAB REKAP KECAMATAN */}
            {mountedTabs.KEC && (
              <div className={`flex-1 flex min-w-0 ${activeTab === 'KEC' ? '' : 'hidden'}`}>
                <KecamatanTables />
              </div>
            )}

            {/* 🟢 TAB REKAP KELURAHAN */}
            {mountedTabs.KEL && (
              <div className={`flex-1 flex min-w-0 ${activeTab === 'KEL' ? '' : 'hidden'}`}>
                <KelurahanTables filterKec={filterKec} setFilterKec={setFilterKec} filterKel={filterKel} setFilterKel={setFilterKel} />
              </div>
            )}

            {/* 🟢 TAB KEPALA LINGKUNGAN */}
            {mountedTabs.KEPLING && (
              <div className={`flex-1 flex min-w-0 ${activeTab === 'KEPLING' ? '' : 'hidden'}`}>
                <KeplingTables filterKec={filterKec} setFilterKec={setFilterKec} filterKel={filterKel} setFilterKel={setFilterKel} />
              </div>
            )}
          </div>
        </div>

        <footer className="bg-[#1b75d8] dark:bg-[#020617] text-white text-center py-4 mt-2 w-full shadow-inner transition-colors duration-300">
          <p className="font-extrabold text-[16px] tracking-wide uppercase">Jefri Iswanto</p>
          <p className="font-bold text-[14px] tracking-wider uppercase mt-0.5">Kepala BPJS Ketenagakerjaan Kantor Cabang Medan Kota</p>
        </footer>
      </div>
    </main>
  );
}