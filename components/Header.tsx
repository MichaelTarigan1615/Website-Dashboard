"use client";
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fetchSheetData } from '../utils/googleSheets';

const Header = ({ 
  activeTab, 
  setActiveTab,
  isDarkMode,
  toggleDarkMode
}: { 
  activeTab: string, 
  setActiveTab: (tab: 'KEC' | 'KEL' | 'KEPLING') => void,
  isDarkMode: boolean,
  toggleDarkMode: () => void
}) => {
  const [lastUpdate, setLastUpdate] = useState<string>('Memuat waktu update...');

  useEffect(() => {
    async function fetchUpdateTime() {
      try {
        const data = (await fetchSheetData('KEC')) as Record<string, string>[];
        if (data && data.length > 0) {
          const updateTime = data[0]['Update per'];
          if (updateTime) setLastUpdate(`Update data per tgl. ${updateTime}`);
          else setLastUpdate('Update data per tgl. (Tambahkan header "Waktu Update" di sel N1)');
        }
      } catch (error) {
        console.error("Gagal memuat waktu update:", error);
        setLastUpdate('Gagal memuat waktu update');
      }
    }
    fetchUpdateTime();
  }, []);

  return (
    <div className="w-full shadow-sm">
      <header className={`relative min-h-[180px] overflow-hidden flex justify-center items-end pb-3 gap-4 xl:gap-12 transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-r from-[#1e293b] via-[#0f172a] to-[#1e293b]' : 'bg-gradient-to-r from-[#f1f8e9] via-[#f9fbe7] to-[#fffde7]'}`}>

        <div className={`absolute right-0 bottom-[-40px] z-0 pointer-events-none transition-opacity duration-300 ${isDarkMode ? 'opacity-10' : 'opacity-30'}`}>
          <Image src="/images/logo-bpjs.png" alt="Logo BPJS Watermark" width={650} height={200} className="object-contain" priority />
        </div>

        <div className="absolute left-8 bottom-3 z-20">
          <Image src="/images/logo-pemko.png" alt="Logo Pemko" width={110} height={130} className="object-contain" priority />
        </div>

        <div className="absolute right-8 bottom-[-36px] z-20">
          <Image src="/images/logo-bpjs.png" alt="Logo BPJS" width={240} height={80} className="object-contain" priority />
        </div>

        <div className="flex items-end gap-2 z-10 shrink-0">
          <div className="flex flex-col items-center">
            <Image src="/images/foto-walikota.png" alt="Walikota" width={120} height={120} className="object-contain object-bottom" />
            <div className={`border shadow-sm px-2 py-1.5 flex flex-col items-center text-center w-[145px] -mt-1 rounded z-10 transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white/95 border-gray-200'}`}>
              <p className={`text-[10px] font-black leading-tight uppercase ${isDarkMode ? 'text-gray-200' : 'text-[#263238]'}`}>RICO TRI PUTRA BAYU MAS</p>
              <p className={`text-[8px] font-bold leading-tight uppercase mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-[#1b75d8]'}`}>Walikota Medan</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <Image src="/images/foto-wakil-walikota.png" alt="Wakil Walikota" width={120} height={120} className="object-contain object-bottom" />
            <div className={`border shadow-sm px-2 py-1.5 flex flex-col items-center text-center w-[145px] -mt-1 rounded z-10 transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white/95 border-gray-200'}`}>
              <p className={`text-[10px] font-black leading-tight uppercase ${isDarkMode ? 'text-gray-200' : 'text-[#263238]'}`}>H. ZAKIYUDDIN HARAHAP</p>
              <p className={`text-[8px] font-bold leading-tight uppercase mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-[#1b75d8]'}`}>Wakil Walikota Medan</p>
            </div>
          </div>
        </div>

        <div className="text-center pb-3 z-10 shrink-0 px-4">
          <h1 className={`text-[34px] xl:text-[40px] font-black leading-none tracking-tight transition-colors duration-300 ${isDarkMode ? 'text-gray-100' : 'text-[#455a64]'}`}>DASHBOARD</h1>
          <h2 className={`text-[18px] xl:text-[24px] font-extrabold uppercase leading-tight mt-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-[#37474f]'}`}>Kepala Lingkungan Kota Medan</h2>
          <h3 className={`text-[14px] xl:text-[16px] font-bold mt-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-[#607d8b]'}`}>Road to Universal Coverage Jamsostek</h3>
        </div>

        <div className="flex items-end gap-2 z-10 shrink-0">
          <div className="flex flex-col items-center">
            <Image src="/images/foto-kacab.png" alt="Kacab" width={120} height={120} className="object-contain object-bottom" />
            <div className={`border shadow-sm px-2 py-1.5 flex flex-col items-center text-center w-[145px] -mt-1 rounded z-10 transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white/95 border-gray-200'}`}>
              <p className={`text-[10px] font-black leading-tight uppercase tracking-wider ${isDarkMode ? 'text-gray-200' : 'text-[#263238]'}`}>JEFRI&nbsp;ISWANTO</p>
              <p className={`text-[8px] font-bold leading-tight uppercase mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-[#1b75d8]'}`}>Kepala Kantor Cabang</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <Image src="/images/foto-kabid.png" alt="Kabid" width={110} height={110} className="object-contain object-bottom" />
            <div className={`border shadow-sm px-2 py-1.5 flex flex-col items-center text-center w-[155px] -mt-1 rounded z-10 transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white/95 border-gray-200'}`}>
              <p className={`text-[10px] font-black leading-tight uppercase ${isDarkMode ? 'text-gray-200' : 'text-[#263238]'}`}>BOY CITRA L. TOBING</p>
              <p className={`text-[8px] font-bold leading-tight uppercase mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-[#1b75d8]'}`}>Kepala Bidang Kepesertaan Progus</p>
            </div>
          </div>
        </div>

      </header>

      <div className={`text-white px-6 py-2.5 flex justify-between items-center relative border-t z-30 transition-colors duration-300 ${isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-[#1b75d8] border-blue-400'}`}>
        <div className="text-[13px] font-bold flex-1">{lastUpdate}</div>
        
        <div className="absolute left-1/2 -translate-x-1/2 flex gap-1">
          <button onClick={() => setActiveTab('KEC')} className={`px-8 xl:px-12 py-1.5 text-sm font-bold rounded-sm transition-all ${activeTab === 'KEC' ? (isDarkMode ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-[#1b75d8] shadow-md') : (isDarkMode ? 'bg-slate-900 text-gray-400 hover:bg-slate-700' : 'bg-[#0d47a1] text-white hover:bg-[#1565c0]')}`}>Kecamatan</button>
          <button onClick={() => setActiveTab('KEL')} className={`px-8 xl:px-12 py-1.5 text-sm font-bold rounded-sm transition-all ${activeTab === 'KEL' ? (isDarkMode ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-[#1b75d8] shadow-md') : (isDarkMode ? 'bg-slate-900 text-gray-400 hover:bg-slate-700' : 'bg-[#0d47a1] text-white hover:bg-[#1565c0]')}`}>Kelurahan</button>
          <button onClick={() => setActiveTab('KEPLING')} className={`px-8 xl:px-12 py-1.5 text-sm font-bold rounded-sm transition-all ${activeTab === 'KEPLING' ? (isDarkMode ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-[#1b75d8] shadow-md') : (isDarkMode ? 'bg-slate-900 text-gray-400 hover:bg-slate-700' : 'bg-[#0d47a1] text-white hover:bg-[#1565c0]')}`}>Kepala Lingkungan</button>
        </div>
        
        {/* WADAH TOMBOL KANAN */}
        <div className="flex justify-end gap-2 flex-1 shrink-0">
          {/* TOMBOL SEGARKAN DATA */}
          <button 
            onClick={() => window.dispatchEvent(new Event('forceRefreshData'))}
            className={`flex items-center gap-1.5 px-4 py-1 rounded-full text-[11px] font-bold border shadow-inner transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600' : 'bg-[#0d47a1] hover:bg-[#1565c0] text-white border-blue-400/30'}`}
            title="Tarik data terbaru dari server tanpa reload halaman"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="mt-0.5">Segarkan Data</span>
          </button>

          {/* TOMBOL MODE GELAP/TERANG */}
          <button 
            onClick={toggleDarkMode} 
            className={`flex items-center gap-1.5 px-4 py-1 rounded-full text-[11px] font-bold border shadow-inner transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600' : 'bg-[#0d47a1] hover:bg-[#1565c0] text-white border-blue-400/30'}`}
          >
            {isDarkMode ? (<>☀️ <span className="mt-0.5">Mode Terang</span></>) : (<>🌙 <span className="mt-0.5">Mode Gelap</span></>)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;