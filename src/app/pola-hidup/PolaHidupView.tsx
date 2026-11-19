"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface HabitItem {
  id: string;
  title: string;
  category: string;
  targetSummary: string;
  guideDescription: string;
  isCompleted: boolean;
  portionOrHabitNote: string;
  logId: string | null;
}

interface HabitStats {
  totalHabits: number;
  completedCount: number;
  completionRate: number;
}

export function PolaHidupView() {
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [stats, setStats] = useState<HabitStats>({
    totalHabits: 0,
    completedCount: 0,
    completionRate: 0,
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("semua");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Load habits data
  async function loadHabits() {
    try {
      const res = await fetch("/api/habits");
      const json = await res.json();
      if (res.ok && json.success) {
        const habitList: HabitItem[] = json.data.habits || [];
        setHabits(habitList);
        setStats(json.data.stats || {});

        // Inisialisasi input catatan lokal
        const initialNotes: Record<string, string> = {};
        for (const h of habitList) {
          initialNotes[h.id] = h.portionOrHabitNote || "";
        }
        setNoteInputs(initialNotes);
      } else {
        setErrorMsg(json.message || "Gagal memuat panduan pola hidup.");
      }
    } catch {
      setErrorMsg("Koneksi bermasalah saat memuat data.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadHabits();
  }, []);

  // Toggle status selesai
  async function handleToggleCompleted(habit: HabitItem) {
    setTogglingId(habit.id);
    const newStatus = !habit.isCompleted;

    try {
      const res = await fetch("/api/habits/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitGuideId: habit.id,
          isCompleted: newStatus,
          portionOrHabitNote: noteInputs[habit.id] || habit.portionOrHabitNote || null,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setHabits((prev) =>
          prev.map((item) =>
            item.id === habit.id ? { ...item, isCompleted: newStatus } : item
          )
        );

        // Update stats
        setStats((prev) => {
          const newCompleted = newStatus
            ? prev.completedCount + 1
            : Math.max(0, prev.completedCount - 1);
          const newRate =
            prev.totalHabits > 0 ? Math.round((newCompleted / prev.totalHabits) * 100) : 0;
          return {
            ...prev,
            completedCount: newCompleted,
            completionRate: newRate,
          };
        });

        setFeedbackMsg(
          newStatus
            ? `✓ "${habit.title}" ditandai selesai!`
            : `Status "${habit.title}" diubah menjadi belum selesai.`
        );
        setTimeout(() => setFeedbackMsg(""), 3000);
      } else {
        alert(json.message || "Gagal memperbarui status kebiasaan.");
      }
    } catch {
      alert("Koneksi bermasalah.");
    } finally {
      setTogglingId(null);
    }
  }

  // Simpan catatan porsi / kebiasaan
  async function handleSaveNote(habit: HabitItem) {
    setSavingNoteId(habit.id);
    const noteText = noteInputs[habit.id] || "";

    try {
      const res = await fetch("/api/habits/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitGuideId: habit.id,
          isCompleted: habit.isCompleted,
          portionOrHabitNote: noteText.trim() || null,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setHabits((prev) =>
          prev.map((item) =>
            item.id === habit.id ? { ...item, portionOrHabitNote: noteText } : item
          )
        );
        setFeedbackMsg(`Catatan untuk "${habit.title}" berhasil disimpan!`);
        setTimeout(() => setFeedbackMsg(""), 3000);
      } else {
        alert(json.message || "Gagal menyimpan catatan.");
      }
    } catch {
      alert("Koneksi bermasalah.");
    } finally {
      setSavingNoteId(null);
    }
  }

  // Filter kategori
  const categories = ["semua", "nutrisi", "hidrasi", "olahraga", "tidur", "mindfulness"];

  const filteredHabits =
    selectedCategory === "semua"
      ? habits
      : habits.filter((h) => h.category.toLowerCase() === selectedCategory);

  function getCategoryColor(cat: string) {
    switch (cat.toLowerCase()) {
      case "nutrisi": return "green";
      case "hidrasi": return "blue";
      case "olahraga": return "teal";
      case "tidur": return "purple";
      case "mindfulness": return "yellow";
      default: return "gray";
    }
  }

  const formattedToday = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 rounded-xl w-1/3"></div>
        <div className="h-40 bg-gray-200 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── 1. Header ────────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl">
            ⚖️
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Takar Pola Hidup Harian
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {formattedToday} — Panduan porsi gizi seimbang, hidrasi, aktivitas, tidur, dan mindfulness.
            </p>
          </div>
        </div>
      </div>

      {/* Pesan Feedback */}
      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <span>✅</span>
          <span>{feedbackMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── 2. Kartu Progres Kepatuhan Pola Hidup Hari Ini ───────────────────── */}
      <Card elevated className="bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-700 text-white border-0 shadow-lg">
        <Card.Body className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block">
                Capaian Pola Hidup Hari Ini
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-black">
                  {stats.completedCount}
                </span>
                <span className="text-lg text-blue-200">
                  / {stats.totalHabits} Kebiasaan Terlaksana
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-100 mt-2 max-w-lg leading-relaxed">
                {stats.completionRate === 100
                  ? "🎉 Luar biasa! Seluruh target pola hidup sehat Anda hari ini telah terpenuhi secara sempurna."
                  : stats.completionRate >= 60
                  ? "👍 Sangat baik! Sebagian besar kebiasaan sehat hari ini sudah terlaksana."
                  : "💪 Ayo lanjutkan! Penuhi kebiasaan sehat lainnya untuk menjaga kebugaran tubuh Anda."}
              </p>
            </div>

            {/* Circular / Big Metric */}
            <div className="text-right sm:text-center bg-white/10 backdrop-blur rounded-2xl p-4 sm:p-5 border border-white/20 shrink-0">
              <span className="text-3xl sm:text-4xl font-black block">
                {stats.completionRate}%
              </span>
              <span className="text-[11px] text-blue-100 uppercase tracking-wider">
                Target Harian
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/20 rounded-full h-3 mt-6 overflow-hidden">
            <div
              className="bg-yellow-300 h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            ></div>
          </div>
        </Card.Body>
      </Card>

      {/* ── 3. Tab Filter Kategori ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={[
                "px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all shrink-0",
                isActive
                  ? "bg-brand-500 text-white shadow-sm ring-2 ring-brand-300"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50",
              ].join(" ")}
            >
              {cat === "semua" ? "🌟 Semua Panduan" : cat}
            </button>
          );
        })}
      </div>

      {/* ── 4. Daftar Kartu Panduan Kebiasaan ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredHabits.map((habit) => {
          const isExpanded = expandedId === habit.id;
          const isToggling = togglingId === habit.id;
          const isSavingNote = savingNoteId === habit.id;

          return (
            <Card
              key={habit.id}
              elevated
              className={[
                "transition-all duration-200 border",
                habit.isCompleted
                  ? "border-emerald-300 bg-emerald-50/20"
                  : "border-gray-200 bg-white",
              ].join(" ")}
            >
              <Card.Body className="p-5 sm:p-6 space-y-4">
                {/* Header card: Judul & Checklist */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge color={getCategoryColor(habit.category) as any}>
                        {habit.category}
                      </Badge>
                      {habit.isCompleted && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          ✓ Terlaksana Hari Ini
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 leading-snug">
                      {habit.title}
                    </h3>
                  </div>

                  {/* Tombol Checklist Besar */}
                  <button
                    type="button"
                    disabled={isToggling}
                    onClick={() => handleToggleCompleted(habit)}
                    className={[
                      "w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg transition-transform active:scale-95 shrink-0 shadow-sm",
                      habit.isCompleted
                        ? "bg-emerald-500 text-white ring-2 ring-emerald-300"
                        : "bg-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200",
                    ].join(" ")}
                    title={
                      habit.isCompleted
                        ? "Klik untuk membatalkan status selesai"
                        : "Klik untuk menandai kebiasaan ini telah selesai"
                    }
                  >
                    {habit.isCompleted ? "✓" : "○"}
                  </button>
                </div>

                {/* Target Ringkas */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <span className="font-bold text-gray-800 block mb-0.5">
                    🎯 Target Rekomendasi:
                  </span>
                  <p className="text-gray-600 leading-relaxed">
                    {habit.targetSummary}
                  </p>
                </div>

                {/* Panduan Lengkap (Collapsible) */}
                <div>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : habit.id)}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <span>{isExpanded ? "Sembunyikan Panduan Lengkap" : "Baca Panduan Lengkap"}</span>
                    <span>{isExpanded ? "▴" : "▾"}</span>
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-gray-700 leading-relaxed space-y-2">
                      <p>{habit.guideDescription}</p>
                    </div>
                  )}
                </div>

                {/* Input Catatan Porsi / Detail Kebiasaan */}
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    Catatan Porsi / Evaluasi Harian Anda:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Contoh: Porsi makan siang 1/2 sayur, 1/4 nasi merah, 1/4 ikan..."
                      value={noteInputs[habit.id] ?? ""}
                      onChange={(e) =>
                        setNoteInputs({ ...noteInputs, [habit.id]: e.target.value })
                      }
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      isLoading={isSavingNote}
                      onClick={() => handleSaveNote(habit)}
                      className="text-xs shrink-0"
                    >
                      Simpan
                    </Button>
                  </div>
                  {habit.portionOrHabitNote && (
                    <p className="text-[11px] text-gray-500 italic">
                      Tersimpan: "{habit.portionOrHabitNote}"
                    </p>
                  )}
                </div>
              </Card.Body>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
