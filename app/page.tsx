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
    // 1. Tambahkan overflow-x-auto di sini agar bisa di-scroll ke samping jika layar kecil
    <main className="min-h-screen bg-[#f3f4ec] font-sans pb-10 overflow-x-auto">
      
      {/* 2. KUNCI LEBAR KANVAS: min-w-[1500px] akan memaksa desain tetap lebar seperti di zoom 80% */}
      <div className="min-w-[1500px] mx-auto">
        
        <Header activeTab={activeTab} setActiveTab={handleTabChange} />
        
        <div className="p-4 flex gap-4 mt-2">
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

      </div>
    </main>
  );
}