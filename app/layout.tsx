import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// UBAH BAGIAN INI: Ini adalah "Papan Nama" website Anda
export const metadata: Metadata = {
  title: "Dashboard Kepling Kota Medan",
  description: "Dashboard Road to Universal Coverage Jamsostek untuk Kepala Lingkungan Kota Medan oleh BPJS Ketenagakerjaan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}