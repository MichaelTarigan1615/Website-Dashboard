"use client";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function KpiCards({ 
  data = [], 
  activeTab = 'KEC',
  filterKec = ['ALL'],
  filterKel = ['ALL'],
  isDarkMode = false
}: { 
  data?: any[], activeTab?: string, filterKec?: string[], filterKel?: string[], isDarkMode?: boolean
}) {

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col gap-3 w-[360px] h-full items-center justify-center bg-white dark:bg-slate-800 rounded-xl shadow text-blue-500 dark:text-blue-400 font-bold border border-gray-100 dark:border-slate-700 min-h-[600px] transition-colors">
        Memuat Indikator & Grafik...
      </div>
    );
  }

  const isKel = activeTab === 'KEL';
  const isKep = activeTab === 'KEPLING';

  const kelKecMap = new Map<string, Set<string>>();
  data.forEach(item => {
    const kec = (item.kecamatan || '').toUpperCase().trim();
    const kel = (item.kelurahan || '').toUpperCase().trim();
    if (kel) {
      if (!kelKecMap.has(kel)) kelKecMap.set(kel, new Set());
      kelKecMap.get(kel)!.add(kec);
    }
  });

  const filteredData = data.filter(row => {
    if (!isKel && !isKep) return true;
    const kec = (row.kecamatan || '').toUpperCase().trim();
    const kel = (row.kelurahan || '').toUpperCase().trim();
    
    const matchKec = filterKec.includes('ALL') || filterKec.includes(kec);
    
    const expectedLabel = (kelKecMap.get(kel)?.size ?? 0) > 1
      ? `${kel} (${kec})`
      : kel;
      
    const matchKel = filterKel.includes('ALL') || filterKel.includes(expectedLabel);
    return matchKec && matchKel;
  });

  const jmlKecamatan = new Set(filteredData.map(r => r.kecamatan).filter(Boolean)).size;
  const jmlKelurahan = new Set(filteredData.map(r => `${r.kecamatan}_${r.kelurahan}`).filter(Boolean)).size;
  const jmlKepling = filteredData.length;

  const target = filteredData.reduce((acc, row) => acc + (row.target || 0), 0);
  const tkAkuisisi = filteredData.reduce((acc, row) => acc + (row.tk_form || 0), 0);
  const tkAktifRiil = filteredData.reduce((acc, row) => acc + (row.tk_rekap || 0), 0);
  
  let sisaTarget = tkAkuisisi - target;
  if (sisaTarget > 0) sisaTarget = 0; 

  const percentTkAktif = target > 0 ? (tkAkuisisi / target) * 100 : 0;

  const formatNum = (num: number) => num.toLocaleString('id-ID');
  const formatPercent = (num: number) => num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';

  const pieData = [
    { name: 'BELUM AKTIF', value: Math.abs(sisaTarget) },
    { name: 'AKUISISI', value: tkAkuisisi }
  ];
  
  // 💡 PERBAIKAN WARNA PIE CHART: Merah untuk BELUM AKTIF, Hijau untuk AKUISISI
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

  let aggregatedData: any[] = [];

  if (activeTab === 'KEC') {
    const mapKec = new Map();
    filteredData.forEach(row => {
      const key = row.kecamatan;
      if (!mapKec.has(key)) mapKec.set(key, { name: key, fullName: key, target: 0, tk_aktif: 0 });
      const item = mapKec.get(key);
      item.target += (row.target || 0);
      item.tk_aktif += (row.tk_form || 0); 
    });
    aggregatedData = Array.from(mapKec.values());
  } else if (activeTab === 'KEL') {
    const mapKel = new Map();
    filteredData.forEach(row => {
      const kec = (row.kecamatan || '').toUpperCase().trim();
      const kel = (row.kelurahan || '').toUpperCase().trim();
      const label = (kelKecMap.get(kel)?.size ?? 0) > 1 ? `${kel} (${kec})` : kel;

      if (!mapKel.has(label)) mapKel.set(label, { name: label, fullName: label, target: 0, tk_aktif: 0 });
      const item = mapKel.get(label);
      item.target += (row.target || 0);
      item.tk_aktif += (row.tk_form || 0); 
    });
    aggregatedData = Array.from(mapKel.values());
  } else {
    aggregatedData = filteredData.map(row => ({
      name: `${row.kelurahan} - ${row.lingkungan}`,
      fullName: `Lingkungan ${row.lingkungan}, ${row.kelurahan}`, 
      target: row.target || 0,
      tk_aktif: row.tk_form || 0 
    }));
  }

  aggregatedData = aggregatedData.map(item => ({
    ...item,
    percent: item.target > 0 ? (item.tk_aktif / item.target) * 100 : 0
  }));

  if (activeTab === 'KEC') {
    aggregatedData.sort((a, b) => a.fullName.localeCompare(b.fullName));
  } else {
    aggregatedData.sort((a, b) => b.percent - a.percent);
    aggregatedData = aggregatedData.slice(0, 10);
  }

  const barData = aggregatedData.map(row => {
    let nama = row.fullName;
    if (isKep && nama.length > 35) nama = nama.substring(0, 34) + '...';
    else if (!isKep && nama.length > 12) nama = nama.substring(0, 11) + '...'; 
    return {
      name: nama,
      fullName: row.fullName, 
      'AKUISISI': row.tk_aktif,
      'TARGET': row.target
    };
  });

  return (
    <div className="flex flex-col gap-3 w-[360px] h-full relative z-50">
      <div className="flex gap-3 shrink-0">
        <div className="bg-[#42954f] dark:bg-green-700 text-white px-3 py-2 rounded-md shadow flex-1 transition-colors">
          <p className="text-sm leading-tight">Jumlah<br/>Kecamatan</p>
          <p className="text-4xl font-normal mt-1">{formatNum(jmlKecamatan)}</p>
        </div>
        <div className="bg-[#42954f] dark:bg-green-700 text-white px-3 py-2 rounded-md shadow flex-1 transition-colors">
          <p className="text-sm leading-tight">Jumlah<br/>Kelurahan</p>
          <p className="text-4xl font-normal mt-1">{formatNum(jmlKelurahan)}</p>
        </div>
        <div className="bg-[#42954f] dark:bg-green-700 text-white px-3 py-2 rounded-md shadow flex-1 transition-colors">
          <p className="text-sm border-gray-100 leading-tight">Jumlah<br/>Kepling</p>
          <p className="text-4xl font-normal mt-1">{formatNum(jmlKepling)}</p>
        </div>
      </div>

      <div className="flex gap-2 shrink-0">
        <div className="bg-[#1681db] dark:bg-blue-800 text-white px-3 py-3 rounded-md shadow flex-[1.2] flex flex-col justify-between min-h-[90px] transition-colors">
          <p className="text-xs font-semibold leading-tight">Target<br/>(50 x Kepling)</p>
          <p className="text-2xl font-normal mt-1 tracking-tight">{formatNum(target)}</p>
        </div>
        <div className="bg-[#1681db] dark:bg-blue-800 text-white px-3 py-3 rounded-md shadow flex-1 flex flex-col justify-between min-h-[90px] transition-colors">
          <p className="text-xs font-semibold leading-tight">Akuisisi<br/>Capaian</p>
          <p className="text-2xl font-normal mt-1 tracking-tight">{formatNum(tkAkuisisi)}</p>
        </div>
        <div className="bg-[#1681db] dark:bg-blue-800 text-white px-3 py-3 rounded-md shadow flex-1 flex flex-col justify-between min-h-[90px] transition-colors">
          <p className="text-xs font-semibold leading-tight">TK<br/>Aktif</p>
          <p className="text-2xl font-normal mt-1 tracking-tight">{formatNum(tkAktifRiil)}</p>
        </div>
      </div>

      <div className="flex gap-3 h-[200px] shrink-0">
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-md shadow flex-[1.5] flex flex-col items-center justify-center pt-2 transition-colors">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel} innerRadius={30} outerRadius={75} dataKey="value" stroke="none">
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip 
                formatter={(value: any) => formatNum(Number(value) || 0)}
                contentStyle={{fontSize: '12px', borderRadius: '8px', backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb', color: isDarkMode ? '#f8fafc' : '#000'}}
                itemStyle={{color: isDarkMode ? '#cbd5e1' : '#455a64', fontWeight: '600'}}
              />
              <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ fontSize: '10px', color: isDarkMode ? '#cbd5e1' : '#333' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex flex-col gap-3 flex-1">
          <div className="bg-[#1681db] dark:bg-blue-800 text-white px-4 py-2 rounded-md shadow flex-1 flex flex-col justify-center transition-colors">
            <p className="text-sm">Sisa Target</p>
            <p className="text-3xl font-normal mt-1">{formatNum(sisaTarget)}</p>
          </div>
          <div className="bg-[#1681db] dark:bg-blue-800 text-white px-4 py-2 rounded-md shadow flex-1 flex flex-col justify-center transition-colors">
            <p className="text-sm">% Total Capaian</p>
            <p className="text-3xl font-normal mt-1">{formatPercent(percentTkAktif)}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#f8faeb] dark:bg-slate-900 border border-blue-100 dark:border-slate-700 flex-1 min-h-[250px] rounded-md shadow mt-1 p-2 transition-colors">
         <ResponsiveContainer width="100%" height="100%">
          {isKep ? (
            <BarChart layout="vertical" data={barData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? "#334155" : "#e0e0e0"} />
              <XAxis type="number" tick={{fontSize: 9, fill: isDarkMode ? "#cbd5e1" : "#666"}} stroke={isDarkMode ? "#cbd5e1" : "#666"} />
              <YAxis type="category" dataKey="name" tick={{fontSize: 8, fill: isDarkMode ? "#cbd5e1" : "#666"}} stroke={isDarkMode ? "#cbd5e1" : "#666"} interval={0} width={160} />
              <Tooltip 
                cursor={{fill: isDarkMode ? 'rgba(255,255,255,0.1)' : 'transparent'}} 
                wrapperStyle={{ zIndex: 100 }}
                contentStyle={{fontSize: '12px', borderRadius: '8px', backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb', color: isDarkMode ? '#f8fafc' : '#37474f', maxWidth: '300px', whiteSpace: 'normal'}}
                labelStyle={{fontWeight: '900', marginBottom: '6px', wordWrap: 'break-word', color: isDarkMode ? '#fff' : '#37474f'}}
                itemStyle={{fontWeight: '600'}}
                labelFormatter={(label, payload) => {
                  if (payload && payload.length > 0 && payload[0].payload && payload[0].payload.fullName) return payload[0].payload.fullName;
                  return label;
                }}
              />
              <Legend verticalAlign="top" iconType="square" wrapperStyle={{ fontSize: '10px', marginTop: '-10px', color: isDarkMode ? '#cbd5e1' : '#333' }} />
              <Bar dataKey="AKUISISI" fill={isDarkMode ? "#3b82f6" : "#1681db"} barSize={8} radius={[0, 2, 2, 0]} />
              <Bar dataKey="TARGET" fill={isDarkMode ? "#06b6d4" : "#00bcd4"} barSize={8} radius={[0, 2, 2, 0]} />
            </BarChart>
          ) : (
            <BarChart layout="horizontal" data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 45 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#e0e0e0"} />
              <XAxis dataKey="name" tick={{fontSize: activeTab === 'KEC' ? 7.5 : 9, fill: isDarkMode ? "#cbd5e1" : "#666"}} angle={-45} textAnchor="end" interval={0} stroke={isDarkMode ? "#cbd5e1" : "#666"} />
              <YAxis tick={{fontSize: 10, fill: isDarkMode ? "#cbd5e1" : "#666"}} tickFormatter={(value) => value >= 1000 ? `${value / 1000} rb` : value} stroke={isDarkMode ? "#cbd5e1" : "#666"} />
              <Tooltip 
                cursor={{fill: isDarkMode ? 'rgba(255,255,255,0.1)' : 'transparent'}} 
                wrapperStyle={{ zIndex: 100 }}
                contentStyle={{fontSize: '12px', borderRadius: '8px', backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb', color: isDarkMode ? '#f8fafc' : '#37474f', maxWidth: '300px', whiteSpace: 'normal'}}
                labelStyle={{fontWeight: '900', marginBottom: '6px', wordWrap: 'break-word', color: isDarkMode ? '#fff' : '#37474f'}}
                itemStyle={{fontWeight: '600'}}
                labelFormatter={(label, payload) => {
                  if (payload && payload.length > 0 && payload[0].payload && payload[0].payload.fullName) return payload[0].payload.fullName;
                  return label;
                }}
              />
              <Legend verticalAlign="top" iconType="square" wrapperStyle={{ fontSize: '10px', marginTop: '-10px', color: isDarkMode ? '#cbd5e1' : '#333' }} />
              <Bar dataKey="AKUISISI" fill={isDarkMode ? "#3b82f6" : "#1681db"} barSize={12} radius={[2, 2, 0, 0]} />
              <Bar dataKey="TARGET" fill={isDarkMode ? "#06b6d4" : "#00bcd4"} barSize={12} radius={[2, 2, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}