"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  readMinutes: number;
  relatedTopic: string;
  updatedAt: string;
}

export function ArtikelListView() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  async function fetchArticles(q = "", cat = "", top = "") {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (cat && cat !== "semua") params.set("category", cat);
      if (top) params.set("topic", top);

      const res = await fetch(`/api/articles?${params.toString()}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setArticles(json.data.articles || []);
        if (json.data.categories?.length > 0) {
          setAvailableCategories(json.data.categories);
        }
        if (json.data.topics?.length > 0) {
          setAvailableTopics(json.data.topics);
        }
      } else {
        setErrorMsg(json.message || "Gagal memuat artikel.");
      }
    } catch {
      setErrorMsg("Koneksi bermasalah saat memuat artikel.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchArticles(searchQuery, selectedCategory, selectedTopic);
  }, [selectedCategory, selectedTopic]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchArticles(searchQuery, selectedCategory, selectedTopic);
  }

  function handleResetFilters() {
    setSearchQuery("");
    setSelectedCategory("semua");
    setSelectedTopic("");
    fetchArticles("", "semua", "");
  }

  function getCategoryColor(cat: string) {
    switch (cat.toLowerCase()) {
      case "nutrisi": return "green";
      case "penyakit": return "red";
      case "gaya-hidup": return "blue";
      case "obat-obatan": return "purple";
      default: return "teal";
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── 1. Header ────────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl">
            📰
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Artikel Kesehatan Terpercaya
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Panduan dan literatur resmi berbasis sains dari Kementerian Kesehatan RI, WHO, dan BPOM.
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. Search Bar & Filter ─────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Cari artikel, topik, atau kata kunci (contoh: garam, tensi, diabetes, tidur)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-200 bg-white shadow-sm"
            />
          </div>
          <Button type="submit" variant="primary" size="md" className="font-bold px-6">
            Cari
          </Button>
        </form>

        {/* Filter Kategori */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
            Kategori:
          </span>
          <button
            onClick={() => setSelectedCategory("semua")}
            className={[
              "px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0",
              selectedCategory === "semua"
                ? "bg-brand-500 text-white shadow-sm ring-2 ring-brand-300"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50",
            ].join(" ")}
          >
            Semua
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={[
                "px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0",
                selectedCategory === cat
                  ? "bg-brand-500 text-white shadow-sm ring-2 ring-brand-300"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50",
              ].join(" ")}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Topik Terkait (Chips) */}
        {availableTopics.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] font-semibold text-gray-400 mr-1">
              Topik Populer:
            </span>
            {availableTopics.slice(0, 8).map((top) => {
              const isSelected = selectedTopic === top;
              return (
                <button
                  key={top}
                  onClick={() => setSelectedTopic(isSelected ? "" : top)}
                  className={[
                    "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors",
                    isSelected
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                  ].join(" ")}
                >
                  #{top}
                </button>
              );
            })}
          </div>
        )}

        {/* Indikator Filter Aktif */}
        {(selectedCategory !== "semua" || selectedTopic || searchQuery) && (
          <div className="flex items-center justify-between bg-brand-50/70 px-4 py-2 rounded-xl border border-brand-200 text-xs">
            <span className="text-brand-900">
              Menampilkan filter aktif{" "}
              {selectedCategory !== "semua" && `• Kategori: ${selectedCategory} `}
              {selectedTopic && `• Topik: #${selectedTopic} `}
              {searchQuery && `• Pencarian: "${searchQuery}"`}
            </span>
            <button
              onClick={handleResetFilters}
              className="font-bold text-brand-700 hover:text-brand-900 underline ml-2"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* ── 3. Daftar Kartu Artikel ─────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <Card elevated className="py-16 text-center">
          <span className="text-5xl text-gray-300">🔍</span>
          <h3 className="text-base font-bold text-gray-800 mt-3">
            Tidak Ada Artikel yang Cocok
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Tidak ditemukan artikel kesehatan untuk kata kunci atau filter yang Anda pilih.
          </p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              Reset Semua Filter
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => {
            const formattedDate = new Intl.DateTimeFormat("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(new Date(art.updatedAt));

            return (
              <Card
                key={art.id}
                elevated
                className="flex flex-col border border-gray-100 hover:border-brand-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group"
              >
                <Card.Body className="p-6 flex flex-col flex-1 space-y-4">
                  {/* Metadata Header */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <Badge color={getCategoryColor(art.category) as any}>
                      {art.category}
                    </Badge>
                    <span className="text-gray-400 font-medium text-[11px] flex items-center gap-1">
                      <span>⏱️</span> {art.readMinutes} mnt baca
                    </span>
                  </div>

                  {/* Judul */}
                  <div>
                    <Link href={`/artikel/${art.slug}`}>
                      <h2 className="text-base font-bold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                        {art.title}
                      </h2>
                    </Link>
                  </div>

                  {/* Ringkasan */}
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {art.summary}
                  </p>

                  {/* Topik Terkait */}
                  {art.relatedTopic && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {art.relatedTopic.split(",").slice(0, 3).map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium"
                        >
                          #{t.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer Card: Sumber Resmi & Tanggal */}
                  <div className="mt-auto pt-4 border-t border-gray-100 space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <span>🏛️</span>
                        <a
                          href={art.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold hover:underline line-clamp-1"
                          title="Buka rujukan resmi"
                        >
                          {art.sourceName} ↗
                        </a>
                      </div>
                      <span className="text-gray-400 text-[10px]">{formattedDate}</span>
                    </div>

                    <Link href={`/artikel/${art.slug}`} className="block">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs font-semibold group-hover:bg-brand-50 group-hover:border-brand-300"
                      >
                        Baca Artikel Lengkap →
                      </Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
