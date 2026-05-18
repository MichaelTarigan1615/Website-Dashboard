"use client";
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fetchSheetData } from '../utils/googleSheets';

const Header = ({ activeTab, setActiveTab }: { 
  activeTab: string, 
  setActiveTab: (tab: 'KEC' | 'KEL' | 'KEPLING') => void 
}) => {
  const [lastUpdate, setLastUpdate] = useState<string>('Memuat waktu update...');

  useEffect(() => {
    async function fetchUpdateTime() {
      try {
        const data = (await fetchSheetData('KEC')) as Record<string, string>[];
        if (data && data.length > 0) {
          const updateTime = data[0]['Waktu Update'];
          
          if (updateTime) {
            setLastUpdate(`Update data per tgl. ${updateTime}`);
          } else {
            setLastUpdate('Update data per tgl. (Tambahkan header "Waktu Update" di sel N1)');
          }
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
      {/* HEADER UTAMA: Gap disesuaikan agar elemen di tengah memiliki ruang nafas */}
      <header className="relative bg-gradient-to-r from-[#f1f8e9] via-[#f9fbe7] to-[#fffde7] min-h-[180px] overflow-hidden flex justify-center items-end pb-3 gap-4 xl:gap-12">

        {/* Logo BPJS Background Watermark */}
        <div className="absolute right-0 bottom-[-40px] z-0 opacity-30 pointer-events-none">
          <Image src="/images/logo-bpjs.png" alt="Logo BPJS Watermark" width={650} height={200} className="object-contain" priority />
        </div>

        {/* LOGO PEMKO (Ujung Kiri) */}
        <div className="absolute left-8 bottom-3 z-20">
          <Image src="/images/logo-pemko.png" alt="Logo Pemko" width={110} height={130} className="object-contain" priority />
        </div>

        {/* LOGO BPJS (Ujung Kanan) */}
        <div className="absolute right-8 bottom-[-36] z-20">
          <Image src="/images/logo-bpjs.png" alt="Logo BPJS" width={240} height={80} className="object-contain" priority />
        </div>

        {/* ==============================================================
            KIRI TENGAH: WALIKOTA & WAKIL WALIKOTA
        ============================================================== */}
        <div className="flex items-end gap-2 z-10 shrink-0">
          
          {/* Walikota */}
          <div className="flex flex-col items-center">
            <Image src="/images/foto-walikota.png" alt="Walikota" width={120} height={120} className="object-contain object-bottom" />
            <div className="bg-white/95 border border-gray-200 shadow-sm px-2 py-1.5 flex flex-col items-center text-center w-[145px] -mt-1 rounded z-10">
              <p className="text-[10px] font-black text-[#263238] leading-tight uppercase">RICO TRI PUTRA BAYU MAS</p>
              <p className="text-[8px] font-bold text-[#1b75d8] leading-tight uppercase mt-0.5">Walikota Medan</p>
            </div>
          </div>

          {/* Wakil Walikota */}
          <div className="flex flex-col items-center">
            <Image src="/images/foto-wakil-walikota.png" alt="Wakil Walikota" width={120} height={120} className="object-contain object-bottom" />
            <div className="bg-white/95 border border-gray-200 shadow-sm px-2 py-1.5 flex flex-col items-center text-center w-[145px] -mt-1 rounded z-10">
              <p className="text-[10px] font-black text-[#263238] leading-tight uppercase">H. ZAKIYUDDIN HARAHAP</p>
              <p className="text-[8px] font-bold text-[#1b75d8] leading-tight uppercase mt-0.5">Wakil Walikota Medan</p>
            </div>
          </div>

        </div>

        {/* ==============================================================
            TENGAH: JUDUL DASHBOARD
        ============================================================== */}
        <div className="text-center pb-3 z-10 shrink-0 px-4">
          <h1 className="text-[34px] xl:text-[40px] font-black text-[#455a64] leading-none tracking-tight">DASHBOARD</h1>
          <h2 className="text-[18px] xl:text-[24px] font-extrabold text-[#37474f] uppercase leading-tight mt-1">Kepala Lingkungan Kota Medan</h2>
          <h3 className="text-[14px] xl:text-[16px] font-bold text-[#607d8b] mt-1">Road to Universal Coverage Jamsostek</h3>
        </div>

        {/* ==============================================================
            KANAN TENGAH: KACAB & KABID
        ============================================================== */}
        <div className="flex items-end gap-2 z-10 shrink-0">
          
          {/* Kepala Cabang */}
          <div className="flex flex-col items-center">
            <Image src="/images/foto-kacab.png" alt="Kacab" width={120} height={120} className="object-contain object-bottom" />
            <div className="bg-white/95 border border-gray-200 shadow-sm px-2 py-1.5 flex flex-col items-center text-center w-[145px] -mt-1 rounded z-10">
              <p className="text-[10px] font-black text-[#263238] leading-tight uppercase">JEFRI&nbsp;&nbsp;&nbsp;ISWANTO</p>
              <p className="text-[8px] font-bold text-[#1b75d8] leading-tight uppercase mt-0.5">Kepala Kantor Cabang</p>
            </div>
          </div>

          {/* Kepala Bidang */}
          <div className="flex flex-col items-center">
            <Image src="/images/foto-kabid.png" alt="Kabid" width={110} height={110} className="object-contain object-bottom" />
            <div className="bg-white/95 border border-gray-200 shadow-sm px-2 py-1.5 flex flex-col items-center text-center w-[155px] -mt-1 rounded z-10">
              <p className="text-[10px] font-black text-[#263238] leading-tight uppercase">BOY CITRA L. TOBING</p>
              <p className="text-[8px] font-bold text-[#1b75d8] leading-tight uppercase mt-0.5">Kepala Bidang Kepesertaan Progus</p>
            </div>
          </div>

        </div>

      </header>

      {/* BAR BIRU NAVIGASI */}
      <div className="bg-[#1b75d8] text-white px-6 py-2.5 flex justify-between items-center relative border-t border-blue-400 z-30">
        
        {/* TEKS WAKTU UPDATE DINAMIS */}
        <div className="text-[13px] font-bold">
          {lastUpdate}
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 flex gap-1">
          <button onClick={() => setActiveTab('KEC')} className={`${activeTab === 'KEC' ? "bg-white text-[#1b75d8] shadow-md" : "bg-[#0d47a1] text-white hover:bg-[#1565c0]"} px-8 xl:px-12 py-1.5 text-sm font-bold rounded-sm transition-all`}>Kecamatan</button>
          <button onClick={() => setActiveTab('KEL')} className={`${activeTab === 'KEL' ? "bg-white text-[#1b75d8] shadow-md" : "bg-[#0d47a1] text-white hover:bg-[#1565c0]"} px-8 xl:px-12 py-1.5 text-sm font-bold rounded-sm transition-all`}>Kelurahan</button>
          <button onClick={() => setActiveTab('KEPLING')} className={`${activeTab === 'KEPLING' ? "bg-white text-[#1b75d8] shadow-md" : "bg-[#0d47a1] text-white hover:bg-[#1565c0]"} px-8 xl:px-12 py-1.5 text-sm font-bold rounded-sm transition-all`}>Kepala Lingkungan</button>
        </div>
        <div className="w-[200px]"></div>
      </div>
    </div>
  );
};

export default Header;