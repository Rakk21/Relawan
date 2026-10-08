import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Relawan Siti Roika — Dapil 1 Kota Semarang",
  description: "Prototype V1 — Peta Relawan, Peta Suara, dan Blank Spot TPS Dapil 1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col bg-[#E9EBEF]">{children}</body>
    </html>
  );
}