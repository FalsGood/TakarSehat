"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface MedicationItem {
  id: string;
  medicineName: string;
  dosageNote: string;
  scheduleTime: string;
  isActive: boolean;
  createdAt: string;
  todayStatus: "taken" | "skipped" | "pending";
  takenAt: string | null;
  logId: string | null;
}

interface StatsData {
  totalMedications: number;
  totalActive: number;
  takenTodayCount: number;
  skippedTodayCount: number;
  pendingTodayCount: number;
  adherenceRate: number;
}

export function ObatView() {
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalMedications: 0,
    totalActive: 0,
    takenTodayCount: 0,
    skippedTodayCount: 0,
    pendingTodayCount: 0,
    adherenceRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal / Form state untuk Tambah / Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formDosage, setFormDosage] = useState("");
  const [formSchedule, setFormSchedule] = useState("08:00");
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // Ambil data obat
  async function loadMedications() {
    try {
      const res = await fetch("/api/medications");
      const json = await res.json();
      if (res.ok && json.success) {
        setMedications(json.data.medications || []);
        setStats(json.data.stats || {});
      } else {
        setErrorMsg(json.message || "Gagal memuat data obat.");
      }
    } catch {
      setErrorMsg("Koneksi gagal saat memuat daftar obat.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMedications();
  }, []);

  // Quick Action Minum Obat
  async function handleUpdateLog(medicationId: string, status: "taken" | "skipped" | "pending") {
    setActionLoadingId(medicationId);
    try {
      const res = await fetch("/api/medications/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicationId, status }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        // Refresh data
        loadMedications();
      } else {
        alert(json.message || "Gagal mengubah status obat.");
      }
    } catch {
      alert("Koneksi bermasalah.");
    } finally {
      setActionLoadingId(null);
    }
  }

  // Toggle status aktif obat
  async function handleToggleActive(med: MedicationItem) {
    setActionLoadingId(med.id);
    try {
      const res = await fetch(`/api/medications/${med.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineName: med.medicineName,
          dosageNote: med.dosageNote,
          scheduleTime: med.scheduleTime,
          isActive: !med.isActive,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        loadMedications();
      } else {
        alert(json.message || "Gagal mengubah status aktif obat.");
      }
    } catch {
      alert("Koneksi bermasalah.");
    } finally {
      setActionLoadingId(null);
    }
  }

  // Buka Form Tambah Baru
  function handleOpenCreateForm() {
    setEditingId(null);
    setFormName("");
    setFormDosage("");
    setFormSchedule("08:00");
    setFormIsActive(true);
    setErrorMsg("");
    setSuccessMsg("");
    setIsFormOpen(true);
  }

  // Buka Form Edit Obat
  function handleOpenEditForm(med: MedicationItem) {
    setEditingId(med.id);
    setFormName(med.medicineName);
    setFormDosage(med.dosageNote);
    setFormSchedule(med.scheduleTime);
    setFormIsActive(med.isActive);
    setErrorMsg("");
    setSuccessMsg("");
    setIsFormOpen(true);
  }

  // Submit Form Tambah / Edit
  async function handleSaveMedication(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!formName.trim() || !formDosage.trim() || !formSchedule.trim()) {
      setErrorMsg("Semua kolom formulir obat wajib diisi.");
      return;
    }

    setIsSubmittingForm(true);

    try {
      const url = editingId ? `/api/medications/${editingId}` : "/api/medications";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineName: formName,
          dosageNote: formDosage,
          scheduleTime: formSchedule,
          isActive: formIsActive,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.message || "Gagal menyimpan data obat.");
        return;
      }

      setSuccessMsg(
        editingId
          ? "Data obat berhasil diperbarui."
          : "Obat baru berhasil ditambahkan ke jadwal harian Anda."
      );
      setIsFormOpen(false);
      loadMedications();
    } catch {
      setErrorMsg("Koneksi gagal saat menyimpan data obat.");
    } finally {
      setIsSubmittingForm(false);
    }
  }

  // Hapus Obat
  async function handleDeleteMedication(med: MedicationItem) {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus "${med.medicineName}" beserta seluruh riwayat lognya?`
      )
    ) {
      return;
    }

    setActionLoadingId(med.id);
    try {
      const res = await fetch(`/api/medications/${med.id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok && json.success) {
        loadMedications();
      } else {
        alert(json.message || "Gagal menghapus obat.");
      }
    } catch {
      alert("Koneksi bermasalah.");
    } finally {
      setActionLoadingId(null);
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-28 bg-gray-200 rounded-2xl"></div>
          <div className="h-28 bg-gray-200 rounded-2xl"></div>
          <div className="h-28 bg-gray-200 rounded-2xl"></div>
          <div className="h-28 bg-gray-200 rounded-2xl"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── 1. Header & Tombol Tambah ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center text-xl">
            💊
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Cek Obat & Kepatuhan Jadwal
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {formattedToday} — Kelola resep obat, jadwal konsumsi, dan kepatuhan harian Anda.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreateForm}
          className="font-bold shadow-sm"
        >
          + Tambah Obat Baru
        </Button>
      </div>

      {/* Pesan Sukses / Error */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs flex items-center gap-2">
          <span>✅</span>
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── 2. Kartu Metrik Kepatuhan Hari Ini ─────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card elevated className="bg-white border-gray-200">
          <Card.Body className="p-4">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Tingkat Kepatuhan
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-brand-600">
                {stats.adherenceRate}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
              <div
                className="bg-brand-500 h-1.5 rounded-full"
                style={{ width: `${stats.adherenceRate}%` }}
              ></div>
            </div>
          </Card.Body>
        </Card>

        <Card elevated className="bg-white border-gray-200">
          <Card.Body className="p-4">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Sudah Diminum
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                {stats.takenTodayCount}
              </span>
              <span className="text-xs text-gray-400">/ {stats.totalActive} dosis</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              ✓ Sesuai jadwal
            </p>
          </Card.Body>
        </Card>

        <Card elevated className="bg-white border-gray-200">
          <Card.Body className="p-4">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Menunggu Diminum
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-amber-500">
                {stats.pendingTodayCount}
              </span>
              <span className="text-xs text-gray-400">dosis</span>
            </div>
            <p className="text-[11px] text-amber-600 font-medium mt-1">
              ⏳ Belum waktunya / belum dicatat
            </p>
          </Card.Body>
        </Card>

        <Card elevated className="bg-white border-gray-200">
          <Card.Body className="p-4">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Dosis Dilewati
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-rose-500">
                {stats.skippedTodayCount}
              </span>
              <span className="text-xs text-gray-400">dosis</span>
            </div>
            <p className="text-[11px] text-rose-600 font-medium mt-1">
              ✕ Terlewat / sengaja dihindari
            </p>
          </Card.Body>
        </Card>
      </div>

      {/* ── 3. Modal / Panel Tambah & Edit Obat ──────────────────────────────── */}
      {isFormOpen && (
        <Card elevated className="border-teal-300 bg-teal-50/30 shadow-md">
          <Card.Header className="flex justify-between items-center bg-teal-50/60">
            <h3 className="text-sm font-bold text-gray-900">
              {editingId ? "Edit Rincian Obat" : "Daftarkan Obat / Suplemen Baru"}
            </h3>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-lg font-bold"
            >
              ×
            </button>
          </Card.Header>
          <Card.Body>
            <form onSubmit={handleSaveMedication} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Nama Obat & Dosis"
                    type="text"
                    required
                    placeholder="Contoh: Amlodipine 5mg atau Paracetamol 500mg"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    label="Jadwal Jam Minum"
                    type="text"
                    required
                    placeholder="Contoh: 07:00 atau 08:00, 20:00"
                    value={formSchedule}
                    onChange={(e) => setFormSchedule(e.target.value)}
                  />
                </div>
              </div>

              <Input
                label="Catatan Aturan Pakai / Petunjuk Dokter"
                type="text"
                required
                placeholder="Contoh: 1 tablet setelah sarapan pagi, jangan dikunyah"
                value={formDosage}
                onChange={(e) => setFormDosage(e.target.value)}
              />

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="h-4 w-4 text-brand-600 rounded border-gray-300 focus:ring-brand-400"
                />
                <label htmlFor="formIsActive" className="text-xs font-semibold text-gray-700">
                  Obat ini sedang aktif diminum rutin
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFormOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingForm}
                >
                  {editingId ? "Simpan Perubahan" : "Tambahkan ke Jadwal"}
                </Button>
              </div>
            </form>
          </Card.Body>
        </Card>
      )}

      {/* ── 4. Daftar Obat Pengguna & Aksi Kepatuhan ───────────────────────── */}
      <Card elevated>
        <Card.Header className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Daftar Obat Anda ({medications.length})
            </h2>
            <p className="text-xs text-gray-500">
              Tandai kepatuhan minum obat Anda setiap hari secara langsung
            </p>
          </div>
        </Card.Header>

        <Card.Body>
          {medications.length === 0 ? (
            <div className="py-12 text-center">
              <span className="text-5xl text-gray-300">💊</span>
              <h3 className="text-base font-bold text-gray-800 mt-3">
                Belum Ada Obat Terdaftar
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Tambahkan obat atau suplemen yang sedang Anda konsumsi agar TakarSehat dapat membantu memantau jadwal dan kepatuhan harian Anda.
              </p>
              <div className="mt-5">
                <Button variant="primary" size="md" onClick={handleOpenCreateForm}>
                  + Daftarkan Obat Pertama
                </Button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {medications.map((med) => {
                const isTaken = med.todayStatus === "taken";
                const isSkipped = med.todayStatus === "skipped";
                const isPending = med.todayStatus === "pending";
                const isUpdating = actionLoadingId === med.id;

                return (
                  <div
                    key={med.id}
                    className={[
                      "py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0 transition-opacity",
                      !med.isActive ? "opacity-60 bg-gray-50/50 p-3 rounded-xl" : "",
                    ].join(" ")}
                  >
                    {/* Info Obat */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-800 flex flex-col items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        <span>⏰</span>
                        <span className="text-[11px] leading-tight font-black">{med.scheduleTime}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-gray-900">
                            {med.medicineName}
                          </h3>
                          {med.isActive ? (
                            <>
                              {isTaken && <Badge color="green">✓ Sudah Diminum</Badge>}
                              {isSkipped && <Badge color="red">✕ Dilewati</Badge>}
                              {isPending && <Badge color="yellow">Menunggu</Badge>}
                            </>
                          ) : (
                            <Badge color="gray">Nonaktif</Badge>
                          )}
                        </div>

                        <p className="text-xs text-gray-600 leading-snug">
                          {med.dosageNote}
                        </p>

                        {isTaken && med.takenAt && (
                          <p className="text-[11px] text-emerald-700 font-medium">
                            Diminum pada{" "}
                            {new Intl.DateTimeFormat("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            }).format(new Date(med.takenAt))}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quick action buttons & management */}
                    <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
                      {med.isActive && (
                        <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100">
                          <Button
                            size="sm"
                            variant={isTaken ? "primary" : "outline"}
                            className={`text-xs py-1.5 px-3 ${
                              isTaken ? "bg-emerald-600 hover:bg-emerald-700" : ""
                            }`}
                            disabled={isUpdating}
                            onClick={() => handleUpdateLog(med.id, "taken")}
                          >
                            ✓ Sudah Minum
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`text-xs py-1.5 px-2.5 text-gray-600 hover:text-rose-600 ${
                              isSkipped ? "text-rose-600 bg-rose-50 font-bold" : ""
                            }`}
                            disabled={isUpdating}
                            onClick={() => handleUpdateLog(med.id, "skipped")}
                          >
                            ✕ Lewati
                          </Button>
                        </div>
                      )}

                      {/* Menu edit, toggle aktif, hapus */}
                      <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(med)}
                          disabled={isUpdating}
                          className="p-1.5 text-xs text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                          title={med.isActive ? "Nonaktifkan jadwal ini" : "Aktifkan kembali jadwal ini"}
                        >
                          {med.isActive ? "⏸️" : "▶️"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditForm(med)}
                          className="p-1.5 text-xs text-gray-400 hover:text-brand-600 rounded-lg hover:bg-gray-100"
                          title="Edit obat"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMedication(med)}
                          disabled={isUpdating}
                          className="p-1.5 text-xs text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-100"
                          title="Hapus obat"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
