/**
 * src/app/layout.tsx
 * ─────────────────────────────────────────────────────────────
 * Root Layout — dibungkus semua halaman di aplikasi.
 * Mengatur metadata global, font, dan provider.
 * ─────────────────────────────────────────────────────────────
 */

import type { Metadata, Viewport } from "next";
import "./globals.css";

// Metadata SEO global
export const metadata: Metadata = {
  title: {
    default: "TakarSehat — Catat Gejala, Cek Obat, Takar Pola Hidup",
    template: "%s | TakarSehat",
  },
  description:
    "Platform kesehatan personal: catat gejala, kelola jadwal obat, pantau kebiasaan hidup sehat, dan baca artikel kesehatan terpercaya.",
  keywords: ["kesehatan", "obat", "gejala", "pola hidup", "artikel kesehatan"],
  authors: [{ name: "Tim TakarSehat" }],
  openGraph: {
    type:        "website",
    locale:      "id_ID",
    title:       "TakarSehat",
    description: "Platform kesehatan personal terpercaya.",
    siteName:    "TakarSehat",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#22c55e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="font-sans bg-gray-50 text-gray-900">
        {/*
         * Tambahkan Provider di sini jika perlu:
         *   - SessionProvider (NextAuth)
         *   - ThemeProvider
         *   - React Query / SWR
         */}
        {children}
      </body>
    </html>
  );
}
