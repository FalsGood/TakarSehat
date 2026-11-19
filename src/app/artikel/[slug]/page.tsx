import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const article = await db.article.findUnique({
    where: { slug },
    select: { title: true, summary: true },
  });

  if (!article) {
    return { title: "Artikel Tidak Ditemukan | TakarSehat" };
  }

  return {
    title: `${article.title} | TakarSehat`,
    description: article.summary,
  };
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const [user, article] = await Promise.all([
    getCurrentUser(),
    db.article.findUnique({
      where: { slug },
    }),
  ]);

  if (!article) {
    notFound();
  }

  // Cari artikel terkait (berdasarkan kategori yang sama atau topik terkait)
  const relatedArticles = await db.article.findMany({
    where: {
      id: { not: article.id },
      category: article.category,
    },
    take: 3,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      summary: true,
      sourceName: true,
      readMinutes: true,
    },
  });

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(article.updatedAt));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Breadcrumb / Navigasi Kembali */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/artikel" className="hover:text-brand-600 transition-colors font-medium">
              ← Kembali ke Daftar Artikel
            </Link>
            <span>/</span>
            <span className="capitalize">{article.category}</span>
          </div>

          {/* ── 1. Header Artikel ────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs flex-wrap">
              <Badge color="green">{article.category}</Badge>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500 font-medium flex items-center gap-1">
                <span>⏱️</span> {article.readMinutes} menit membaca
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">Diperbarui {formattedDate}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
              {article.title}
            </h1>

            {/* Ringkasan / Lead paragraph */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal bg-brand-50/50 p-4 rounded-2xl border border-brand-100">
              {article.summary}
            </p>
          </div>

          {/* ── 2. Kotak Verifikasi Sumber Rujukan Resmi ──────────────────────── */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">🏛️</span>
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Rujukan Literatur Terverifikasi
                </span>
                <p className="text-sm font-bold text-emerald-950 mt-0.5">
                  {article.sourceName}
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Artikel ini disusun merujuk pada pedoman dan publikasi resmi kesehatan masyarakat.
                </p>
              </div>
            </div>

            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100/50 transition-colors shrink-0 shadow-sm"
            >
              Kunjungi Sumber Resmi <span>↗</span>
            </a>
          </div>

          {/* ── 3. Konten Utama Artikel ──────────────────────────────────────── */}
          <Card elevated>
            <Card.Body className="p-6 sm:p-10">
              <div className="prose prose-green max-w-none text-gray-800 text-sm sm:text-base leading-relaxed space-y-5">
                {article.content.split("\n\n").map((paragraph, index) => {
                  const trimmed = paragraph.trim();

                  // Heading Level 1
                  if (trimmed.startsWith("# ")) {
                    return (
                      <h2 key={index} className="text-2xl font-bold text-gray-900 pt-3 border-b border-gray-100 pb-2">
                        {trimmed.replace("# ", "")}
                      </h2>
                    );
                  }

                  // Heading Level 2
                  if (trimmed.startsWith("## ")) {
                    return (
                      <h3 key={index} className="text-xl font-bold text-gray-900 pt-4">
                        {trimmed.replace("## ", "")}
                      </h3>
                    );
                  }

                  // Heading Level 3
                  if (trimmed.startsWith("### ")) {
                    return (
                      <h4 key={index} className="text-base font-bold text-gray-900 pt-2">
                        {trimmed.replace("### ", "")}
                      </h4>
                    );
                  }

                  // Bullet list
                  if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                    const items = trimmed.split("\n").map((i) => i.replace(/^[-*]\s+/, ""));
                    return (
                      <ul key={index} className="list-disc pl-5 space-y-1.5 text-gray-700">
                        {items.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    );
                  }

                  // Numbered list
                  if (/^\d+\.\s/.test(trimmed)) {
                    const items = trimmed.split("\n").map((i) => i.replace(/^\d+\.\s+/, ""));
                    return (
                      <ol key={index} className="list-decimal pl-5 space-y-1.5 text-gray-700">
                        {items.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ol>
                    );
                  }

                  // Paragraf biasa
                  return (
                    <p key={index} className="text-gray-700 leading-relaxed">
                      {trimmed}
                    </p>
                  );
                })}
              </div>

              {/* Tag Topik Terkait */}
              {article.relatedTopic && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                    Topik Terkait:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {article.relatedTopic.split(",").map((topic, idx) => (
                      <Link
                        key={idx}
                        href={`/artikel?topic=${encodeURIComponent(topic.trim().toLowerCase())}`}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                      >
                        #{topic.trim()}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* ── 4. Penafian Medis Bawah ───────────────────────────────────────── */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <p className="leading-relaxed">
              <strong>Penafian Edukasi Kesehatan: </strong>
              Seluruh artikel di TakarSehat disusun untuk tujuan edukasi dan peningkatan literasi kesehatan masyarakat. Informasi ini tidak dimaksudkan untuk menggantikan diagnosis, pemeriksaan, atau perawatan langsung oleh tenaga medis profesional.
            </p>
          </div>

          {/* ── 5. Rekomendasi Artikel Terkait ───────────────────────────────── */}
          {relatedArticles.length > 0 && (
            <div className="pt-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                Artikel Terkait Lainnya
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedArticles.map((rel) => (
                  <Link key={rel.id} href={`/artikel/${rel.slug}`} className="group">
                    <Card
                      elevated
                      className="h-full border border-gray-100 hover:border-brand-200 transition-all duration-150 hover:-translate-y-1"
                    >
                      <Card.Body className="p-4 flex flex-col justify-between h-full space-y-2">
                        <div>
                          <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                            {rel.category}
                          </span>
                          <h4 className="text-xs font-bold text-gray-900 group-hover:text-brand-600 transition-colors mt-2 line-clamp-2">
                            {rel.title}
                          </h4>
                          <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">
                            {rel.summary}
                          </p>
                        </div>
                        <span className="text-[10px] text-gray-400 block pt-2">
                          ⏱️ {rel.readMinutes} mnt baca • {rel.sourceName}
                        </span>
                      </Card.Body>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
