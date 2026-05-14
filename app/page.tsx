"use client";
import { useState } from 'react';
import Header from '../components/Header';
import KpiCards from '../components/KpiCards';
import KecamatanTables from '../components/KecamatanTables';
import KelurahanTables from '../components/KelurahanTables'; 
import KeplingTables from '../components/KeplingTables'; // Tambahkan Import Ini

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
    <main className="min-h-screen bg-[#f3f4ec] font-sans pb-10">
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
          
          {/* Tambahkan komponen KeplingTables di sini */}
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
    </main>
  );
}