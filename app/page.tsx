// app/page.tsx
"use client";
import { useState, useEffect, useCallback } from 'react';

import Header from '../components/Header';
import KpiCards from '../components/KpiCards';
import KecamatanTables from '../components/KecamatanTables';
import KelurahanTables from '../components/KelurahanTables'; 
import KeplingTables from '../components/KeplingTables';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'KEC' | 'KEL' | 'KEPLING'>('KEC');
  const [filterKec, setFilterKec] = useState<string[]>(['ALL']);
  const [filterKel, setFilterKel] = useState<string[]>(['ALL']);
  
  // State manajemen data TiDB
  const [dataKepling, setDataKepling] = useState<any[]>([]);
  const [rekapData, setRekapData] = useState<any[]>([]); // 💡 PERBAIKAN 1: State penampung list nama detail peserta
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State manajemen tab yang sudah dikunjungi
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

  useEffect(() => {
    if (!mountedTabs[activeTab]) {
      setMountedTabs(prev => ({ ...prev, [activeTab]: true }));
    }
  }, [activeTab, mountedTabs]);

  // 🟢 FUNGSI UTAMA: Ambil Data Instan dari TiDB API Route (SPA Style)
  const muatDataDariTiDB = useCallback(async (isManualClick = false) => {
    if (isManualClick) setRefreshing(true);
    try {
      // Alamat diarahkan ke /api/kepling dengan cache-buster dinamis jika tombol segarkan diklik
      const urlBuster = isManualClick ? `?t=${Date.now()}` : '';
      
      // 💡 PERBAIKAN 2: Mengubah '/api/sheets' menjadi '/api/kepling' (Jalur TiDB)
      const response = await fetch('/api/kepling' + urlBuster);
      const json = await response.json();
      
      if (json.status === 'success' && Array.isArray(json.data)) {
        // Normalisasi data dari TiDB SQL agar struktur variabelnya klop 100% dengan komponen tabel Anda
        const dataTerformat = json.data.map((row: any) => {
          const totalTkAktif = (row.tk_form || 0) + (row.tk_rekap || 0);
          
          let displayLingkungan = row.lingkungan || "-";
          if (row.doc_id && row.doc_id.endsWith("_2")) {
            displayLingkungan = displayLingkungan.toString().replace("_2", "").trim();
          }

          return {
            id: row.doc_id,
            kecamatan: (row.kecamatan || "-").toUpperCase().trim(),
            kelurahan: (row.kelurahan || "-").toUpperCase().trim(),
            lingkungan: displayLingkungan,
            target: row.target || 50,
            tk_aktif: totalTkAktif,
            tk_form: row.tk_form || 0,
            tk_rekap: row.tk_rekap || 0
          };
        });

        setDataKepling(dataTerformat);
      }

      // 💡 PERBAIKAN 3: Tarik list nama detail peserta (REKAP) dari Google Sheets via API Route Hybrid kita
      const rekapBuster = isManualClick ? `&t=${Date.now()}` : '';
      const rekapRes = await fetch('/api/kepling?tab=REKAP' + rekapBuster);
      const rekapJson = await rekapRes.json();
      if (Array.isArray(rekapJson)) {
        setRekapData(rekapJson);
      }

    } catch (error) {
      console.error("Gagal memuat data TiDB:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Memuat data otomatis saat pertama kali web dibuka
  useEffect(() => {
    muatDataDariTiDB();
  }, [muatDataDariTiDB]);

  // 🎯 PENANGKAP EVENT TOMBOL SEGARKAN DATA (HEADER)
  useEffect(() => {
    const handleForceRefresh = () => {
      console.log("🔄 Sinyal Diterima! Menyegarkan data murni tanpa reload halaman...");
      muatDataDariTiDB(true);
    };

    window.addEventListener('forceRefreshData', handleForceRefresh);
    return () => {
      window.removeEventListener('forceRefreshData', handleForceRefresh);
    };
  }, [muatDataDariTiDB]);

  const handleTabChange = (tab: 'KEC' | 'KEL' | 'KEPLING') => {
    setActiveTab(tab);
    setFilterKec(['ALL']);
    setFilterKel(['ALL']);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f3f4ec] dark:bg-[#0f172a] font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1b75d8] dark:border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg tracking-wide">Menghubungkan Server TiDB Cloud...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f4ec] dark:bg-[#0f172a] font-sans overflow-x-auto flex flex-col transition-colors duration-300">
      <div className="min-w-[1500px] mx-auto flex flex-col flex-1 w-full relative">
        
        {/* Indikator Halus jika data sedang disegarkan di latar belakang */}
        {refreshing && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md animate-pulse z-50">
            ⏳ Menyegarkan data...
          </div>
        )}

        <Header 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
        
        <div className="p-4 flex gap-4 mt-2 flex-1">
          <div className="flex-none">
            <KpiCards 
              data={dataKepling} 
              activeTab={activeTab} 
              filterKec={filterKec} 
              filterKel={filterKel} 
              isDarkMode={isDarkMode} 
            />
          </div>
          
          <div className="flex-1 flex min-w-0 relative">
            {mountedTabs.KEC && (
              <div className={`flex-1 flex min-w-0 ${activeTab === 'KEC' ? '' : 'hidden'}`}>
                <KecamatanTables data={dataKepling} />
              </div>
            )}

            {mountedTabs.KEL && (
              <div className={`flex-1 flex min-w-0 ${activeTab === 'KEL' ? '' : 'hidden'}`}>
                <KelurahanTables 
                  data={dataKepling} 
                  filterKec={filterKec} 
                  setFilterKec={setFilterKec} 
                  filterKel={filterKel} 
                  setFilterKel={setFilterKel} 
                />
              </div>
            )}

            {mountedTabs.KEPLING && (
              <div className={`flex-1 flex min-w-0 ${activeTab === 'KEPLING' ? '' : 'hidden'}`}>
                <KeplingTables 
                  data={dataKepling} 
                  filterKec={filterKec} 
                  setFilterKec={setFilterKec} 
                  filterKel={filterKel} 
                  setFilterKel={setFilterKel} 
                  rekapData={rekapData} // 💡 PERBAIKAN 4: Mengoper state rekap data peserta ke dalam tabel Kepling
                />
              </div>
            )}
          </div>
        </div>

        <footer className="bg-[#1b75d8] dark:bg-[#020617] text-white text-center py-4 mt-2 w-full shadow-inner transition-colors duration-300">
          <p className="font-extrabold text-[16px] tracking-wide uppercase">Jefri Iswanto</p>
          <p className="font-bold text-[14px] tracking-wider uppercase mt-0.5">Kepala BPJS Ketenagakerjaan Kantor Cabang Medan Kantor Cabang Medan Kota</p>
        </footer>
      </div>
    </main>
  );
}