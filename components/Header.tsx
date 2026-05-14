"use client";
import Image from 'next/image';

// Tambahkan kembali Props agar navigasi berfungsi
const Header = ({ activeTab, setActiveTab }: { 
  activeTab: string, 
  setActiveTab: (tab: 'KEC' | 'KEL' | 'KEPLING') => void 
}) => {
  return (
    <div className="w-full shadow-sm">
      {/* HEADER: Area Visual Utama */}
      <header className="relative bg-gradient-to-r from-[#f1f8e9] via-[#f9fbe7] to-[#fffde7] h-[190px] overflow-hidden">

        {/* LOGO PEMKO (KIRI) */}
        <div className="absolute left-[60px] top-4 z-20">
          <Image
            src="/images/logo-pemko.png"
            alt="Logo Pemko"
            width={140}
            height={160}
            className="object-contain"
            priority
          />
        </div>

        {/* LOGO BPJS (KANAN) */}
        <div className="absolute right-6 bottom-[-20px] z-0">
          <div className="relative w-[800px] h-[300px]">
            <Image
              src="/images/logo-bpjs.png"
              alt="Logo BPJS"
              fill
              className="object-contain object-right-bottom opacity-80"
              priority
            />
          </div>
        </div>

        {/* KONTEN TENGAH (FOTO & JUDUL) */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-3 z-10">
          <div className="flex items-end gap-10">

            {/* WALIKOTA + WAKIL */}
            <div className="flex items-end gap-2">
              <div className="flex flex-col items-center">
                <Image src="/images/foto-walikota.png" alt="Walikota" width={160} height={160} className="object-contain object-bottom" />
                <p className="bg-white/90 px-2 py-0.5 text-[14px] font-black border border-gray-300 text-black uppercase">WALIKOTA MEDAN</p>
              </div>
              <div className="flex flex-col items-center">
                <Image src="/images/foto-wakil-walikota.png" alt="Wakil" width={160} height={160} className="object-contain object-bottom" />
                <p className="bg-white/90 px-2 py-0.5 text-[14px] font-black border border-gray-300 text-black uppercase">WAKIL WALIKOTA MEDAN</p>
              </div>
            </div>

            {/* JUDUL */}
            <div className="text-center px-4 pb-3">
              <h1 className="text-[40px] font-black text-[#455a64] leading-none tracking-tight">DASHBOARD</h1>
              <h2 className="text-[26px] font-extrabold text-[#37474f] uppercase leading-tight">Kepala Lingkungan Kota Medan</h2>
              <h3 className="text-[17px] font-bold text-[#607d8b]">Road to Universal Coverage Jamsostek</h3>
            </div>

            {/* KACAB + KABID */}
            <div className="flex items-end gap-2">
              <div className="flex flex-col items-center">
                <Image src="/images/foto-kacab.png" alt="Kacab" width={160} height={160} className="object-contain object-bottom" />
                <p className="bg-white/90 px-2 py-0.5 text-[14px] font-black border border-gray-300 text-black uppercase">KEPALA KANTOR CABANG</p>
              </div>
              <div className="flex flex-col items-center">
                <Image src="/images/foto-kabid.png" alt="Kabid" width={150} height={150} className="object-contain object-bottom" />
                <p className="bg-white/90 px-2 py-0.5 text-[14px] font-black border border-gray-300 text-black uppercase">KEPALA BIDANG</p>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* BAR BIRU: Navigasi Aktif */}
      <div className="bg-[#1b75d8] text-white px-6 py-2.5 flex items-center relative border-t border-blue-400 z-30">
        <div className="text-[13px] font-bold">Update data per tgl. 13 May 2026 21:14:03</div>
        <div className="absolute left-1/2 -translate-x-1/2 flex gap-1">
          <button 
            onClick={() => setActiveTab('KEC')}
            className={`${activeTab === 'KEC' ? "bg-white text-[#1b75d8]" : "bg-[#0d47a1] text-white hover:bg-[#1565c0]"} px-12 py-1.5 text-sm font-bold rounded-sm shadow-md transition-all`}
          >
            Kecamatan
          </button>
          <button 
            onClick={() => setActiveTab('KEL')}
            className={`${activeTab === 'KEL' ? "bg-white text-[#1b75d8]" : "bg-[#0d47a1] text-white hover:bg-[#1565c0]"} px-12 py-1.5 text-sm font-bold rounded-sm transition-all`}
          >
            Kelurahan
          </button>
          <button 
            onClick={() => setActiveTab('KEPLING')}
            className={`${activeTab === 'KEPLING' ? "bg-white text-[#1b75d8]" : "bg-[#0d47a1] text-white hover:bg-[#1565c0]"} px-12 py-1.5 text-sm font-bold rounded-sm transition-all`}
          >
            Kepala Lingkungan
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;