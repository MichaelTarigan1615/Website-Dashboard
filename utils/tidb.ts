// utils/tidb.ts
import mysql from 'mysql2/promise';

// Membuat pool koneksi otomatis agar server Next.js tidak kelebihan beban jabat tangan (handshake)
export const pool = mysql.createPool({
  host: 'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',
  port: 4000,
  user: '4Kqqs9JNX6UntM6.root',
  password: 'yMlFHH0VNSLyOsNH',
  database: 'test',
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true, // TiDB Cloud mewajibkan koneksi SSL aman
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});