"use client";
import Image from 'next/image';

const Header = ({ activeTab, setActiveTab }: { 
  activeTab: string, 
  setActiveTab: (tab: 'KEC' | 'KEL' | 'KEPLING') => void 
}) => {
  return (
    <div className="w-full shadow-sm">
      {/* HEADER UTAMA */}
      <header className="relative bg-gradient-to-r from-[#f1f8e9] via-[#f9fbe7] to-[#fffde7] min-h-[180px] overflow-hidden flex justify-center items-end pb-3 gap-6 xl:gap-16">

        {/* Logo BPJS Background Watermark */}
        <div className="absolute right-0 bottom-[-40px] z-0 opacity-30 pointer-events-none">
          <Image src="/images/logo-bpjs.png" alt="Logo BPJS Watermark" width={650} height={200} className="object-contain" priority />
        </div>

        {/* =========================================
            LOGO DI UJUNG KIRI & KANAN (ABSOLUTE)
        ========================================= */}
        {/* LOGO PEMKO (Ujung Kiri) */}
        <div className="absolute left-8 bottom-3 z-20">
          <Image src="/images/logo-pemko.png" alt="Logo Pemko" width={110} height={130} className="object-contain" priority />
        </div>

        {/* LOGO BPJS (Ujung Kanan) - Diperbesar */}
        <div className="absolute right-8 bottom-[-30] z-20">
          <Image src="/images/logo-bpjs.png" alt="Logo BPJS" width={240} height={80} className="object-contain" priority />
        </div>


        {/* =========================================
            KONTEN TENGAH (FOTO & JUDUL MERAPAT)
        ========================================= */}
        {/* FOTO WALIKOTA & WAKIL (Kiri Tengah) */}
        <div className="flex items-end gap-2 z-10 shrink-0">
          <div className="flex flex-col items-center">
            <Image src="/images/foto-walikota.png" alt="Walikota" width={120} height={120} className="object-contain object-bottom" />
            <p className="bg-white/90 px-2 py-0.5 text-[10px] font-black border border-gray-300 text-black uppercase shadow-sm">WALIKOTA MEDAN</p>
          </div>
          <div className="flex flex-col items-center">
            <Image src="/images/foto-wakil-walikota.png" alt="Wakil" width={120} height={120} className="object-contain object-bottom" />
            <p className="bg-white/90 px-2 py-0.5 text-[10px] font-black border border-gray-300 text-black uppercase shadow-sm">WAKIL WALIKOTA MEDAN</p>
          </div>
        </div>

        {/* JUDUL DASHBOARD (Pusat) */}
        <div className="text-center pb-3 z-10 shrink-0 px-4">
          <h1 className="text-[34px] xl:text-[40px] font-black text-[#455a64] leading-none tracking-tight">DASHBOARD</h1>
          <h2 className="text-[18px] xl:text-[24px] font-extrabold text-[#37474f] uppercase leading-tight mt-1">Kepala Lingkungan Kota Medan</h2>
          <h3 className="text-[14px] xl:text-[16px] font-bold text-[#607d8b] mt-1">Road to Universal Coverage Jamsostek</h3>
        </div>

        {/* FOTO KACAB & KABID (Kanan Tengah) */}
        <div className="flex items-end gap-2 z-10 shrink-0">
          <div className="flex flex-col items-center">
            <Image src="/images/foto-kacab.png" alt="Kacab" width={120} height={120} className="object-contain object-bottom" />
            <p className="bg-white/90 px-2 py-0.5 text-[10px] font-black border border-gray-300 text-black uppercase shadow-sm">KEPALA KANTOR CABANG</p>
          </div>
          <div className="flex flex-col items-center">
            <Image src="/images/foto-kabid.png" alt="Kabid" width={110} height={110} className="object-contain object-bottom" />
            <p className="bg-white/90 px-2 py-0.5 text-[10px] font-black border border-gray-300 text-black uppercase shadow-sm">KEPALA BIDANG</p>
          </div>
        </div>

      </header>

      {/* BAR BIRU NAVIGASI */}
      <div className="bg-[#1b75d8] text-white px-6 py-2.5 flex justify-between items-center relative border-t border-blue-400 z-30">
        <div className="text-[13px] font-bold">Update data per tgl. 13 May 2026 21:14:03</div>
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