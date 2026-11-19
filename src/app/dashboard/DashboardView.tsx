"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface MedicationItem {
  id: string;
  medicineName: string;
  dosageNote: string;
  scheduleTime: string;
  status: "taken" | "skipped" | "pending";
  takenAt: string | null;
  logId: string | null;
}

interface HabitItem {
  id: string;
  title: string;
  category: string;
  targetSummary: string;
  isCompleted: boolean;
  note: string | null;
}

interface SymptomRecord {
  id: string;
  selectedSymptoms: string;
  severity: number;
  triggerNote: string | null;
  createdAt: string;
  matchedCondition?: {
    id: string;
    conditionName: string;
    categoryTag: string;
    redFlags: string;
  } | null;
}

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  sourceName: string;
  readMinutes: number;
}

interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
  };
  todayDate: string;
  medicationsSummary: {
    totalScheduled: number;
    takenCount: number;
    skippedCount: number;
    pendingCount: number;
    adherenceRate: number;
    schedule: MedicationItem[];
  };
  symptomsSummary: {
    hasRecord: boolean;
    record: SymptomRecord | null;
  };
  habitsSummary: {
    totalHabitsCount: number;
    completedHabitsCount: number;
    habitsRate: number;
    habits: HabitItem[];
  };
  featuredArticles: ArticleItem[];
}

export function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [updatingMedId, setUpdatingMedId] = useState<string | null>(null);
  const [updatingHabitId, setUpdatingHabitId] = useState<string | null>(null);

  // Ambil data dashboard
  async function fetchDashboard() {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.message || "Gagal memuat data dashboard.");
        return;
      }
      setData(json.data);
    } catch {
      setErrorMsg("Koneksi gagal saat memuat dashboard.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Quick Action: Tandai Minum Obat
  async function handleMedicationAction(medicationId: string, status: "taken" | "skipped") {
    setUpdatingMedId(medicationId);
    try {
      const res = await fetch("/api/medications/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicationId, status }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        // Optimistic update
        setData((prev) => {
          if (!prev) return prev;
          const updatedSchedule = prev.medicationsSummary.schedule.map((item) => {
            if (item.id === medicationId) {
              return {
                ...item,
                status,
                takenAt: status === "taken" ? new Date().toISOString() : null,
              };
            }
            return item;
          });
          const taken = updatedSchedule.filter((m) => m.status === "taken").length;
          const skipped = updatedSchedule.filter((m) => m.status === "skipped").length;
          const pending = updatedSchedule.filter((m) => m.status === "pending").length;
          const adherence =
            updatedSchedule.length > 0 ? Math.round((taken / updatedSchedule.length) * 100) : 0;

          return {
            ...prev,
            medicationsSummary: {
              ...prev.medicationsSummary,
              schedule: updatedSchedule,
              takenCount: taken,
              skippedCount: skipped,
              pendingCount: pending,
              adherenceRate: adherence,
            },
          };
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingMedId(null);
    }
  }

  // Quick Action: Toggle Kebiasaan Sehat
  async function handleToggleHabit(habitGuideId: string, currentStatus: boolean) {
    setUpdatingHabitId(habitGuideId);
    const newStatus = !currentStatus;
    try {
      const res = await fetch("/api/habits/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitGuideId, isCompleted: newStatus }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setData((prev) => {
          if (!prev) return prev;
          const updatedHabits = prev.habitsSummary.habits.map((item) => {
            if (item.id === habitGuideId) {
              return { ...item, isCompleted: newStatus };
            }
            return item;
          });
          const completed = updatedHabits.filter((h) => h.isCompleted).length;
          const rate =
            updatedHabits.length > 0
              ? Math.round((completed / updatedHabits.length) * 100)
              : 0;

          return {
            ...prev,
            habitsSummary: {
              ...prev.habitsSummary,
              habits: updatedHabits,
              completedHabitsCount: completed,
              habitsRate: rate,
            },
          };
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingHabitId(null);
    }
  }

  // Format tanggal Indonesia
  const formattedToday = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  // Helper Severity Color
  function getSeverityColor(sev: number) {
    if (sev <= 3) return { label: "Ringan", bg: "bg-emerald-500", text: "text-emerald-700" };
    if (sev <= 6) return { label: "Sedang", bg: "bg-amber-500", text: "text-amber-700" };
    return { label: "Berat", bg: "bg-rose-500", text: "text-rose-700" };
  }

  // Helper Habit Category Badge Color
  function getCategoryBadgeColor(cat: string) {
    switch (cat.toLowerCase()) {
      case "nutrisi": return "green";
      case "hidrasi": return "blue";
      case "olahraga": return "teal";
      case "tidur": return "purple";
      case "mindfulness": return "yellow";
      default: return "gray";
    }
  }

  // ─── Loading State ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded-xl w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────────────
  if (errorMsg || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
          <span className="text-4xl">⚠️</span>
          <h2 className="text-xl font-bold text-red-900 mt-3">Gagal Memuat Ringkasan</h2>
          <p className="text-sm text-red-700 mt-2">{errorMsg || "Silakan muat ulang halaman."}</p>
          <div className="mt-5">
            <Button onClick={() => window.location.reload()} variant="primary">
              Coba Muat Ulang
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { medicationsSummary, symptomsSummary, habitsSummary, featuredArticles, user } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── 1. Header Sambutan & Tanggal ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Halo, {user.name} 👋
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-800">
              Hari Ini
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {formattedToday} — Pantau perkembangan dan target kesehatan Anda hari ini.
          </p>
        </div>

        {/* Akses Cepat Tombol Pintas */}
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/gejala">
            <Button size="sm" variant="outline" className="text-xs">
              🩺 Catat Gejala
            </Button>
          </Link>
          <Link href="/obat">
            <Button size="sm" variant="outline" className="text-xs">
              💊 Kelola Obat
            </Button>
          </Link>
          <Link href="/pola-hidup">
            <Button size="sm" variant="outline" className="text-xs">
              ⚖️ Pola Hidup
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 2. Kartu Metrik Ringkas (Overview Cards) ───────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Metrik Obat */}
        <Card elevated className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
          <Card.Body className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-100 uppercase tracking-wider">
                Kepatuhan Minum Obat
              </p>
              <h3 className="text-3xl font-black mt-1">
                {medicationsSummary.adherenceRate}%
              </h3>
              <p className="text-xs text-emerald-100 mt-1">
                {medicationsSummary.takenCount} dari {medicationsSummary.totalScheduled} dosis diminum
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
              💊
            </div>
          </Card.Body>
        </Card>

        {/* Metrik Pola Hidup */}
        <Card elevated className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
          <Card.Body className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-100 uppercase tracking-wider">
                Target Pola Hidup
              </p>
              <h3 className="text-3xl font-black mt-1">
                {habitsSummary.completedHabitsCount} / {habitsSummary.totalHabitsCount}
              </h3>
              <p className="text-xs text-blue-100 mt-1">
                {habitsSummary.habitsRate}% kebiasaan sehat terlaksana
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
              ⚖️
            </div>
          </Card.Body>
        </Card>

        {/* Metrik Gejala Terakhir */}
        <Card elevated className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 sm:col-span-2 lg:col-span-1">
          <Card.Body className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-100 uppercase tracking-wider">
                Kondisi Terakhir
              </p>
              <h3 className="text-xl font-bold mt-1 line-clamp-1">
                {symptomsSummary.record?.matchedCondition?.conditionName || "Kondisi Stabil"}
              </h3>
              <p className="text-xs text-amber-100 mt-1">
                {symptomsSummary.hasRecord
                  ? `Skala keparahan: ${symptomsSummary.record?.severity}/10`
                  : "Belum ada keluhan tercatat"}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
              🩺
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* ── 3. Dua Kolom Utama Dashboard ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Kolom Kiri: Jadwal Obat & Catatan Gejala (7/12) */}
        <div className="lg:col-span-7 space-y-8">
          {/* 3a. Jadwal & Kepatuhan Minum Obat Hari Ini */}
          <Card elevated>
            <Card.Header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">💊</span>
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">
                    Jadwal Minum Obat Hari Ini
                  </h3>
                  <p className="text-xs text-gray-500">
                    Aksi cepat untuk menandai obat yang telah diminum
                  </p>
                </div>
              </div>
              <Link href="/obat">
                <span className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                  Lihat Semua →
                </span>
              </Link>
            </Card.Header>

            <Card.Body>
              {medicationsSummary.schedule.length === 0 ? (
                // Empty state obat
                <div className="py-8 text-center">
                  <span className="text-4xl text-gray-300">💊</span>
                  <h4 className="text-sm font-semibold text-gray-800 mt-2">
                    Belum Ada Obat Terjadwal
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                    Daftarkan obat atau suplemen rutin Anda agar tidak melewatkan dosis harian.
                  </p>
                  <div className="mt-4">
                    <Link href="/obat">
                      <Button size="sm" variant="primary">
                        + Tambah Obat Sekarang
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {medicationsSummary.schedule.map((med) => {
                    const isTaken = med.status === "taken";
                    const isSkipped = med.status === "skipped";
                    const isPending = med.status === "pending";
                    const isUpdating = updatingMedId === med.id;

                    return (
                      <div
                        key={med.id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {med.scheduleTime}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-gray-900">
                                {med.medicineName}
                              </h4>
                              {isTaken && <Badge color="green">Sudah Diminum</Badge>}
                              {isSkipped && <Badge color="red">Dilewati</Badge>}
                              {isPending && <Badge color="yellow">Menunggu</Badge>}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {med.dosageNote}
                            </p>
                          </div>
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          <Button
                            size="sm"
                            variant={isTaken ? "ghost" : "primary"}
                            className={`text-xs py-1.5 px-3 ${
                              isTaken
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : ""
                            }`}
                            disabled={isUpdating}
                            onClick={() => handleMedicationAction(med.id, "taken")}
                          >
                            {isTaken ? "✓ Diminum" : "Minum"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`text-xs py-1.5 px-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 ${
                              isSkipped ? "text-red-600 bg-red-50 font-bold" : ""
                            }`}
                            disabled={isUpdating}
                            onClick={() => handleMedicationAction(med.id, "skipped")}
                          >
                            Lewati
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* 3b. Riwayat Catatan Gejala Terbaru */}
          <Card elevated>
            <Card.Header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🩺</span>
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">
                    Catatan Gejala Terbaru
                  </h3>
                  <p className="text-xs text-gray-500">
                    Riwayat kondisi fisik yang Anda laporkan
                  </p>
                </div>
              </div>
              <Link href="/gejala">
                <Button size="sm" variant="ghost" className="text-xs">
                  + Catat Baru
                </Button>
              </Link>
            </Card.Header>

            <Card.Body>
              {!symptomsSummary.hasRecord || !symptomsSummary.record ? (
                <div className="py-8 text-center">
                  <span className="text-4xl text-gray-300">🩺</span>
                  <h4 className="text-sm font-semibold text-gray-800 mt-2">
                    Belum Ada Catatan Gejala
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                    Laporkan keluhan atau sensasi yang Anda rasakan untuk mendeteksi kemungkinan pemicu dan tanda bahaya.
                  </p>
                  <div className="mt-4">
                    <Link href="/gejala">
                      <Button size="sm" variant="primary">
                        + Catat Gejala Pertama
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Header ringkas status */}
                  <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <div>
                      <span className="text-xs text-gray-400 font-medium">
                        Kondisi Rujukan Terkait:
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 mt-0.5">
                        {symptomsSummary.record.matchedCondition?.conditionName || "Pemeriksaan Gejala Mandiri"}
                      </h4>
                      <div className="mt-1 flex items-center gap-2">
                        {symptomsSummary.record.matchedCondition?.categoryTag && (
                          <Badge color="blue">
                            {symptomsSummary.record.matchedCondition.categoryTag}
                          </Badge>
                        )}
                        <span className="text-[11px] text-gray-400">
                          Dicatat pada{" "}
                          {new Intl.DateTimeFormat("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(symptomsSummary.record.createdAt))}
                        </span>
                      </div>
                    </div>

                    {/* Meter Skala Keparahan */}
                    <div className="text-right shrink-0">
                      <span className="text-xs text-gray-400 block">Tingkat Keparahan</span>
                      <div className="flex items-center gap-1.5 justify-end mt-0.5">
                        <span className="text-lg font-black text-gray-900">
                          {symptomsSummary.record.severity}
                        </span>
                        <span className="text-xs text-gray-400">/ 10</span>
                      </div>
                      <Badge
                        color={
                          symptomsSummary.record.severity <= 3
                            ? "green"
                            : symptomsSummary.record.severity <= 6
                            ? "yellow"
                            : "red"
                        }
                      >
                        {getSeverityColor(symptomsSummary.record.severity).label}
                      </Badge>
                    </div>
                  </div>

                  {/* Gejala yang dipilih */}
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      Gejala yang Dirasakan:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(() => {
                        try {
                          const parsed = JSON.parse(symptomsSummary.record.selectedSymptoms);
                          if (Array.isArray(parsed)) {
                            return parsed.map((sym: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-100"
                              >
                                • {sym}
                              </span>
                            ));
                          }
                        } catch {
                          return (
                            <span className="text-xs text-gray-600">
                              {symptomsSummary.record.selectedSymptoms}
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>

                  {/* Pemicu & Konteks jika ada */}
                  {symptomsSummary.record.triggerNote && (
                    <div className="text-xs text-gray-600 bg-amber-50/70 p-3 rounded-xl border border-amber-200/60">
                      <span className="font-semibold text-amber-900">Catatan Pemicu: </span>
                      {symptomsSummary.record.triggerNote}
                    </div>
                  )}

                  {/* Red flags jika ada */}
                  {symptomsSummary.record.matchedCondition?.redFlags && (
                    <div className="text-xs text-rose-800 bg-rose-50 p-3 rounded-xl border border-rose-200">
                      <span className="font-bold">🚨 Tanda Bahaya Rujukan: </span>
                      {symptomsSummary.record.matchedCondition.redFlags}
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Kolom Kanan: Takar Pola Hidup & Artikel Edukasi (5/12) */}
        <div className="lg:col-span-5 space-y-8">
          {/* 3c. Takar Pola Hidup Hari Ini */}
          <Card elevated>
            <Card.Header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚖️</span>
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">
                    Takar Pola Hidup Hari Ini
                  </h3>
                  <p className="text-xs text-gray-500">
                    Centang kebiasaan yang telah Anda penuhi
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                {habitsSummary.completedHabitsCount}/{habitsSummary.totalHabitsCount} Selesai
              </span>
            </Card.Header>

            <Card.Body className="space-y-4">
              {/* Progress bar visual */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1 font-medium">
                  <span>Progres Harian</span>
                  <span>{habitsSummary.habitsRate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-brand-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${habitsSummary.habitsRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Daftar kebiasaan dengan toggle klik cepat */}
              <div className="space-y-2.5 pt-1">
                {habitsSummary.habits.map((habit) => {
                  const isUpdating = updatingHabitId === habit.id;

                  return (
                    <div
                      key={habit.id}
                      onClick={() => !isUpdating && handleToggleHabit(habit.id, habit.isCompleted)}
                      className={[
                        "p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3",
                        habit.isCompleted
                          ? "bg-brand-50/60 border-brand-200"
                          : "bg-white border-gray-200/80 hover:bg-gray-50",
                        isUpdating ? "opacity-60 pointer-events-none" : "",
                      ].join(" ")}
                    >
                      <div className="pt-0.5">
                        <input
                          type="checkbox"
                          checked={habit.isCompleted}
                          onChange={() => {}}
                          className="h-4 w-4 text-brand-600 rounded border-gray-300 focus:ring-brand-400 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={[
                              "text-xs font-bold leading-tight",
                              habit.isCompleted ? "text-brand-900 line-through opacity-80" : "text-gray-900",
                            ].join(" ")}
                          >
                            {habit.title}
                          </span>
                          <Badge color={getCategoryBadgeColor(habit.category) as any}>
                            {habit.category}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                          {habit.targetSummary}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-1">
                <Link href="/pola-hidup" className="block text-center">
                  <span className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                    Buka Panduan & Jurnal Lengkap →
                  </span>
                </Link>
              </div>
            </Card.Body>
          </Card>

          {/* 3d. Cuplikan Artikel Kesehatan Terpercaya */}
          <Card elevated>
            <Card.Header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📰</span>
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">
                    Artikel Terverifikasi
                  </h3>
                  <p className="text-xs text-gray-500">
                    Literatur resmi Kemenkes, WHO, dan BPOM
                  </p>
                </div>
              </div>
              <Link href="/artikel">
                <span className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                  Lihat Semua →
                </span>
              </Link>
            </Card.Header>

            <Card.Body className="divide-y divide-gray-100">
              {featuredArticles.map((art) => (
                <article key={art.id} className="py-3.5 first:pt-0 last:pb-0 group">
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-1">
                    <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                      {art.sourceName}
                    </span>
                    <span>• {art.readMinutes} mnt baca</span>
                  </div>
                  <Link href={`/artikel/${art.slug}`}>
                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                      {art.title}
                    </h4>
                  </Link>
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>
                </article>
              ))}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
