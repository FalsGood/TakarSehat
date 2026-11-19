/**
 * src/app/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Halaman beranda TakarSehat.
 * Menampilkan Navbar, Hero Section, dan 4 pilar fitur utama.
 * ─────────────────────────────────────────────────────────────
 */

import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

// Data fitur utama aplikasi
const features = [
  {
    icon: "🩺",
    title: "Catat Gejala",
    description:
      "Rekam gejala yang Anda rasakan dan temukan kondisi yang mungkin sesuai berdasarkan referensi medis terpercaya.",
    href: "/gejala",
    color: "from-green-50 to-emerald-50",
    iconBg: "bg-green-100",
  },
  {
    icon: "💊",
    title: "Cek Obat",
    description:
      "Kelola jadwal minum obat, catat dosis, dan pantau kepatuhan konsumsi obat harian Anda.",
    href: "/obat",
    color: "from-teal-50 to-cyan-50",
    iconBg: "bg-teal-100",
  },
  {
    icon: "⚖️",
    title: "Takar Pola Hidup",
    description:
      "Pantau kebiasaan sehat harian: porsi makan, hidrasi, olahraga, tidur, dan manajemen stres.",
    href: "/pola-hidup",
    color: "from-blue-50 to-sky-50",
    iconBg: "bg-blue-100",
  },
  {
    icon: "📰",
    title: "Artikel Kesehatan",
    description:
      "Baca artikel kesehatan terpercaya dari sumber resmi seperti Kemenkes RI, WHO, dan lembaga kesehatan lainnya.",
    href: "/artikel",
    color: "from-purple-50 to-violet-50",
    iconBg: "bg-purple-100",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar user={user} />

      <main className="flex-1">
        {/* ── Hero Section ─────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-brand-500 via-brand-600 to-teal-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center relative z-10">
            <div className="max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white mb-6 backdrop-blur">
                <span>🌿</span> Platform Kesehatan Terintegrasi
              </span>

              <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
                Jaga Kesehatan Anda dengan{" "}
                <span className="text-yellow-300">TakarSehat</span>
              </h1>

              <p className="text-lg md:text-xl text-green-50 mb-10 leading-relaxed font-light">
                Catat gejala harian, cek jadwal obat, takar pola hidup bergizi
                seimbang, dan pelajari artikel kesehatan berbasis sains terpercaya.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto font-bold shadow-lg">
                      📊 Buka Dashboard Saya →
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login">
                      <Button size="lg" variant="secondary" className="w-full sm:w-auto font-bold shadow-lg">
                        Mulai Sekarang — Gratis
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto border-white text-white hover:bg-white/10"
                      >
                        ⚡ Coba Akun Demo
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── 4 Fitur Utama ─────────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 font-extrabold text-3xl mb-3 tracking-tight">
              4 Pilar Utama TakarSehat
            </h2>
            <p className="text-gray-500 text-base max-w-2xl mx-auto">
              Setiap fitur dirancang untuk kemudahan pemantauan dan peningkatan kualitas hidup Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Link key={feature.href} href={feature.href} className="group">
                <Card
                  elevated
                  className={`h-full bg-gradient-to-br ${feature.color} border border-gray-100 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg`}
                >
                  <Card.Body className="p-6 flex flex-col items-start gap-4">
                    <div className={`w-12 h-12 ${feature.iconBg} rounded-2xl flex items-center justify-center text-2xl shadow-sm`}>
                      {feature.icon}
                    </div>

                    <div>
                      <h3 className="text-gray-900 font-bold text-lg mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    <span className="mt-auto text-brand-600 text-sm font-semibold group-hover:text-brand-700 flex items-center gap-1">
                      Jelajahi <span>→</span>
                    </span>
                  </Card.Body>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌿</span>
            <span className="text-sm font-bold text-gray-800">TakarSehat</span>
            <span className="text-xs text-gray-400">© {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-gray-400 text-center md:text-right">
            Platform edukasi dan pemantauan kesehatan personal. Bukan pengganti diagnosis dokter.
          </p>
        </div>
      </footer>
    </div>
  );
}
