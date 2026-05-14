"use client";
import { useEffect, useState } from 'react';
import { fetchSheetData } from '../utils/googleSheets';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function KpiCards({ 
  activeTab = 'KEC',
  filterKec = ['ALL'],
  filterKel = ['ALL']
}: { 
  activeTab?: string, filterKec?: string[], filterKel?: string[]
}) {
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const sheetToFetch = activeTab === 'KEPLING' ? 'KEP' : activeTab === 'KEL' ? 'KEL' : 'KEC';
      const result = (await fetchSheetData(sheetToFetch)) as Record<string, string>[];
      setData(result);
      setLoading(false);
    }
    loadData();
  }, [activeTab]); 

  const getVal = (row: Record<string, string>, targetKey: string) => {
    if (!row) return '';
    const foundKey = Object.keys(row).find((k) => k.trim().toLowerCase() === targetKey.toLowerCase());
    return foundKey ? row[foundKey] : '';
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3 w-[360px] h-full items-center justify-center bg-white rounded-xl shadow text-blue-500 font-bold border border-gray-100 min-h-[600px]">
        Memuat Indikator & Grafik...
      </div>
    );
  }

  const parseNum = (val: string) => {
     if (!val) return 0;
     const cleanVal = val.replace(/\./g, '').replace(',', '.');
     const num = parseFloat(cleanVal);
     return isNaN(num) ? 0 : num;
  };
  
  const parsePercent = (val: string) => parseFloat((val || '0').replace(',', '.').replace('%', ''));

  const isKel = activeTab === 'KEL';
  const isKep = activeTab === 'KEPLING';

  const filteredData = data.filter(row => {
    if (!isKel && !isKep) return true; 
    const kec = getVal(row, 'Kecamatan').toUpperCase();
    const kel = getVal(row, 'Kelurahan').toUpperCase();

    const matchKec = filterKec.includes('ALL') || filterKec.includes(kec);
    const matchKel = filterKel.includes('ALL') || filterKel.includes(kel);
    
    return matchKec && matchKel;
  });

  const jmlKecamatan = isKep || isKel 
    ? new Set(filteredData.map(r => getVal(r, 'Kecamatan')).filter(Boolean)).size 
    : filteredData.length;
    
  const jmlKelurahan = isKep
    ? new Set(filteredData.map(r => getVal(r, 'Kelurahan')).filter(Boolean)).size
    : isKel 
      ? filteredData.length 
      : filteredData.reduce((acc, row) => acc + parseNum(getVal(row, 'Jumlah Kelurahan')), 0);
    
  const jmlKepling = isKep
    ? filteredData.length 
    : filteredData.reduce((acc, row) => acc + parseNum(getVal(row, 'Jumlah Kepling')), 0);

  const target = filteredData.reduce((acc, row) => acc + parseNum(getVal(row, 'TARGET')), 0);
  const tkAktif = filteredData.reduce((acc, row) => acc + parseNum(getVal(row, 'TK Aktif')), 0);
  const sisaTarget = filteredData.reduce((acc, row) => acc + parseNum(getVal(row, 'GAP')), 0);
  
  const percentTkAktif = target > 0 ? (tkAktif / target) * 100 : 0;

  const formatNum = (num: number) => num.toLocaleString('id-ID');
  const formatPercent = (num: number) => num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';

  const pieData = [
    { name: 'TIDAK AKTIF', value: Math.abs(sisaTarget) },
    { name: 'TK AKTIF', value: tkAktif }
  ];
  const PIE_COLORS = ['#e84545', '#4caf50'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight="bold">
        {`${(percent * 100).toFixed(1).replace('.', ',')}%`}
      </text>
    );
  };

  const barNameKey = isKep ? 'Kepala Lingkungan' : isKel ? 'Kelurahan' : 'Kecamatan';
  
  let barDataRaw = [...filteredData];
  if (activeTab === 'KEC') {
    barDataRaw.sort((a, b) => getVal(a, 'Kecamatan').localeCompare(getVal(b, 'Kecamatan')));
  } else {
    barDataRaw.sort((a, b) => parsePercent(getVal(b, '%')) - parsePercent(getVal(a, '%')));
    barDataRaw = barDataRaw.slice(0, 10);
  }

  const barData = barDataRaw.map(row => {
    let nama = getVal(row, barNameKey);
    if(isKep && nama.length > 35) nama = nama.substring(0, 34) + '...';
    else if(!isKep && nama.length > 12) nama = nama.substring(0, 11) + '...'; 
    return {
      name: nama,
      'TK AKTIF': parseNum(getVal(row, 'TK Aktif')),
      'TARGET': parseNum(getVal(row, 'TARGET'))
    };
  });

  return (
    <div className="flex flex-col gap-3 w-[360px] h-full">
      <div className="flex gap-3 shrink-0">
        <div className="bg-[#42954f] text-white px-3 py-2 rounded-md shadow flex-1 transition-all">
          <p className="text-sm leading-tight">Jumlah<br/>Kecamatan</p>
          <p className="text-4xl font-normal mt-1">{formatNum(jmlKecamatan)}</p>
        </div>
        <div className="bg-[#42954f] text-white px-3 py-2 rounded-md shadow flex-1 transition-all">
          <p className="text-sm leading-tight">Jumlah<br/>Kelurahan</p>
          <p className="text-4xl font-normal mt-1">{formatNum(jmlKelurahan)}</p>
        </div>
        <div className="bg-[#42954f] text-white px-3 py-2 rounded-md shadow flex-1 transition-all">
          <p className="text-sm leading-tight">Jumlah<br/>Kepling</p>
          <p className="text-4xl font-normal mt-1">{formatNum(jmlKepling)}</p>
        </div>
      </div>

      <div className="flex gap-3 shrink-0">
        <div className="bg-[#1681db] text-white px-4 py-3 rounded-md shadow flex-1 flex flex-col justify-between min-h-[110px]">
          <p className="text-sm leading-tight">Jumlah Target<br/>(50 x jumlah Kepling)</p>
          <p className="text-4xl font-normal mt-2 tracking-tight">{formatNum(target)}</p>
        </div>
        <div className="bg-[#1681db] text-white px-4 py-3 rounded-md shadow flex-1 flex flex-col justify-between min-h-[110px]">
          <p className="text-sm leading-tight">Jumlah TK Aktif</p>
          <p className="text-4xl font-normal mt-2 tracking-tight">{formatNum(tkAktif)}</p>
        </div>
      </div>

      <div className="flex gap-3 h-[200px] shrink-0">
        <div className="bg-white border border-gray-100 rounded-md shadow flex-[1.5] flex flex-col items-center justify-center pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel} innerRadius={30} outerRadius={75} dataKey="value" stroke="none">
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
              </Pie>
              <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex flex-col gap-3 flex-1">
          <div className="bg-[#1681db] text-white px-4 py-2 rounded-md shadow flex-1 flex flex-col justify-center">
            <p className="text-sm">Sisa Target</p>
            <p className="text-3xl font-normal mt-1">{formatNum(sisaTarget)}</p>
          </div>
          <div className="bg-[#1681db] text-white px-4 py-2 rounded-md shadow flex-1 flex flex-col justify-center">
            <p className="text-sm">% TK Aktif</p>
            <p className="text-3xl font-normal mt-1">{formatPercent(percentTkAktif)}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#f8faeb] border border-blue-100 flex-1 min-h-[250px] rounded-md shadow mt-1 p-2">
         <ResponsiveContainer width="100%" height="100%">
          {isKep ? (
            <BarChart layout="vertical" data={barData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e0e0e0" />
              <XAxis type="number" tick={{fontSize: 9}} stroke="#666" />
              <YAxis type="category" dataKey="name" tick={{fontSize: 8}} stroke="#666" interval={0} width={160} />
              {/* PERBAIKAN TOOLTIP */}
              <Tooltip 
                cursor={{fill: 'transparent'}} 
                contentStyle={{fontSize: '12px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                labelStyle={{color: '#37474f', fontWeight: '900', marginBottom: '6px'}}
                itemStyle={{color: '#455a64', fontWeight: '600'}}
              />
              <Legend verticalAlign="top" iconType="square" wrapperStyle={{ fontSize: '10px', marginTop: '-10px' }} />
              <Bar dataKey="TK AKTIF" fill="#1681db" barSize={8} radius={[0, 2, 2, 0]} />
              <Bar dataKey="TARGET" fill="#00bcd4" barSize={8} radius={[0, 2, 2, 0]} />
            </BarChart>
          ) : (
            <BarChart layout="horizontal" data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 45 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{fontSize: activeTab === 'KEC' ? 7.5 : 9}} angle={-45} textAnchor="end" interval={0} stroke="#666" />
              <YAxis tick={{fontSize: 10}} tickFormatter={(value) => value >= 1000 ? `${value / 1000} rb` : value} stroke="#666" />
              {/* PERBAIKAN TOOLTIP */}
              <Tooltip 
                cursor={{fill: 'transparent'}} 
                contentStyle={{fontSize: '12px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                labelStyle={{color: '#37474f', fontWeight: '900', marginBottom: '6px'}}
                itemStyle={{color: '#455a64', fontWeight: '600'}}
              />
              <Legend verticalAlign="top" iconType="square" wrapperStyle={{ fontSize: '10px', marginTop: '-10px' }} />
              <Bar dataKey="TK AKTIF" fill="#1681db" barSize={12} radius={[2, 2, 0, 0]} />
              <Bar dataKey="TARGET" fill="#00bcd4" barSize={12} radius={[2, 2, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}