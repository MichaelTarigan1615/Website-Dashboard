"use client";
import { useState } from 'react';
import Header from '../components/Header';
import KpiCards from '../components/KpiCards';
import KecamatanTables from '../components/KecamatanTables';
import KelurahanTables from '../components/KelurahanTables'; 
import KeplingTables from '../components/KeplingTables';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'KEC' | 'KEL' | 'KEPLING'>('KEC');
  
  const [filterKec, setFilterKec] = useState<string[]>(['ALL']);
  const [filterKel, setFilterKel] = useState<string[]>(['ALL']);

  const handleTabChange = (tab: 'KEC' | 'KEL' | 'KEPLING') => {
    setActiveTab(tab);
    setFilterKec(['ALL']);
    setFilterKel(['ALL']);
  };

  return (
    // Menggunakan flex dan min-h-screen agar footer bisa selalu terdorong ke paling bawah
    <main className="min-h-screen bg-[#f3f4ec] font-sans overflow-x-auto flex flex-col">
      
      {/* KANVAS TETAP: Memastikan seluruh elemen dari Header sampai Footer sejajar */}
      <div className="min-w-[1500px] mx-auto flex flex-col flex-1 w-full">
        
        <Header activeTab={activeTab} setActiveTab={handleTabChange} />
        
        {/* AREA KONTEN UTAMA */}
        <div className="p-4 flex gap-4 mt-2 flex-1">
          <div className="flex-none">
            <KpiCards activeTab={activeTab} filterKec={filterKec} filterKel={filterKel} />
          </div>
          
          <div className="flex-1 flex min-w-0">
            {activeTab === 'KEC' && <KecamatanTables />}
            
            {activeTab === 'KEL' && (
               <KelurahanTables 
                  filterKec={filterKec} 
                  setFilterKec={setFilterKec}
                  filterKel={filterKel}
                  setFilterKel={setFilterKel}
               />
            )}
            
            {activeTab === 'KEPLING' && (
               <KeplingTables 
                  filterKec={filterKec} 
                  setFilterKec={setFilterKec}
                  filterKel={filterKel}
                  setFilterKel={setFilterKel}
               />
            )}
          </div>
        </div>

        {/* =========================================
            FOOTER (ATRIBUT BAWAH)
        ========================================= */}
        <footer className="bg-[#1b75d8] text-white text-center py-4 mt-2 w-full shadow-inner">
          <p className="font-extrabold text-[16px] tracking-wide uppercase">
            Jefri Iswanto
          </p>
          <p className="font-bold text-[14px] tracking-wider uppercase mt-0.5">
            Kepala BPJS Ketenagakerjaan Kantor Cabang Medan Kota
          </p>
        </footer>

      </div>
    </main>
  );
}