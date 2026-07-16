import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from '@vercel/analytics/next';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// UBAH BAGIAN INI: Ini adalah "Papan Nama" website Anda + Kode Verifikasi Google
export const metadata: Metadata = {
  title: "Dashboard Kepling Kota Medan",
  description: "Dashboard Road to Universal Coverage Jamsostek untuk Kepala Lingkungan Kota Medan oleh BPJS Ketenagakerjaan.",
  verification: {
    google: "qYmI2FooNjsKHIVgygN-HAfITfWVMV0HkLk5ASb5yMA", // 💡 Kunci gembok verifikasi dari Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}