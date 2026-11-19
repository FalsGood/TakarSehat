"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ConditionReference {
  id: string;
  conditionName: string;
  commonSymptoms: string;
  earlySigns: string;
  commonCauses: string;
  redFlags: string;
  categoryTag: string;
}

interface SymptomLogItem {
  id: string;
  selectedSymptoms: string;
  severity: number;
  triggerNote: string | null;
  createdAt: string;
  matchedCondition?: ConditionReference | null;
}

// Rekomendasi chip gejala umum untuk mempermudah pemilihan cepat
const COMMON_SYMPTOM_PRESETS = [
  "Sakit kepala bagian belakang",
  "Pusing berputar",
  "Penglihatan kabur",
  "Nyeri dada",
  "Sesak napas",
  "Detak jantung cepat / tidak teratur",
  "Nyeri / perih ulu hati",
  "Mual dan muntah",
  "Perut kembung / begah",
  "Sering buang air kecil",
  "Rasa haus berlebihan",
  "Kesemutan di tangan / kaki",
  "Hidung tersumbat / pilek",
  "Sakit tenggorokan",
  "Batuk berdahak",
  "Demam / meriang",
  "Tubuh lemas & mudah lelah",
];

export function GejalaView() {
  const [symptomLogs, setSymptomLogs] = useState<SymptomLogItem[]>([]);
  const [conditions, setConditions] = useState<ConditionReference[]>([]);
  const [disclaimer, setDisclaimer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptomInput, setCustomSymptomInput] = useState("");
  const [severity, setSeverity] = useState<number>(4);
  const [triggerNote, setTriggerNote] = useState("");
  const [selectedConditionId, setSelectedConditionId] = useState<string>("");

  // Fetch riwayat dan daftar kondisi
  async function loadData() {
    try {
      const res = await fetch("/api/symptoms");
      const json = await res.json();
      if (res.ok && json.success) {
        setSymptomLogs(json.data.symptomLogs || []);
        setConditions(json.data.conditions || []);
        setDisclaimer(json.data.disclaimer || "");
      } else {
        setErrorMsg(json.message || "Gagal memuat data gejala.");
      }
    } catch {
      setErrorMsg("Koneksi bermasalah saat memuat data.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Toggle pilihan gejala preset
  function toggleSymptom(symptom: string) {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      if (selectedSymptoms.length >= 20) return;
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  }

  // Tambah gejala kustom
  function handleAddCustomSymptom(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = customSymptomInput.trim();
    if (!trimmed) return;
    if (!selectedSymptoms.includes(trimmed)) {
      setSelectedSymptoms([...selectedSymptoms, trimmed]);
    }
    setCustomSymptomInput("");
  }

  // Live match prospective condition
  const prospectiveCondition = React.useMemo(() => {
    if (selectedConditionId) {
      return conditions.find((c) => c.id === selectedConditionId) || null;
    }
    if (selectedSymptoms.length === 0 || conditions.length === 0) return null;

    let bestMatch: ConditionReference | null = null;
    let maxScore = 0;

    const userTerms = selectedSymptoms.map((s) => s.toLowerCase());

    for (const cond of conditions) {
      let condSymptoms: string[] = [];
      try {
        const parsed = JSON.parse(cond.commonSymptoms);
        if (Array.isArray(parsed)) {
          condSymptoms = parsed.map((s: string) => String(s).toLowerCase());
        }
      } catch {
        condSymptoms = cond.commonSymptoms.toLowerCase().split(",").map((s) => s.trim());
      }

      let score = 0;
      for (const uTerm of userTerms) {
        for (const cTerm of condSymptoms) {
          if (cTerm.includes(uTerm) || uTerm.includes(cTerm)) {
            score += 2;
          } else {
            const uWords = uTerm.split(/\s+/);
            const cWords = cTerm.split(/\s+/);
            if (uWords.some((w) => w.length > 3 && cWords.includes(w))) {
              score += 1;
            }
          }
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestMatch = cond;
      }
    }

    return maxScore > 0 ? bestMatch : null;
  }, [selectedSymptoms, selectedConditionId, conditions]);

  // Submit catatan gejala
  async function handleSubmitLog(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (selectedSymptoms.length === 0) {
      setErrorMsg("Pilih minimal 1 gejala yang sedang Anda rasakan.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedSymptoms,
          severity,
          triggerNote: triggerNote.trim() || null,
          matchedConditionId: prospectiveCondition ? prospectiveCondition.id : null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.message || "Gagal menyimpan catatan gejala.");
        return;
      }

      setSuccessMsg("Catatan gejala berhasil disimpan ke jurnal kesehatan Anda.");
      // Reset form
      setSelectedSymptoms([]);
      setTriggerNote("");
      setSeverity(4);
      setSelectedConditionId("");
      // Refresh list
      loadData();
    } catch {
      setErrorMsg("Koneksi gagal saat menyimpan catatan gejala.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Hapus log gejala
  async function handleDeleteLog(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus catatan gejala ini?")) return;

    try {
      const res = await fetch(`/api/symptoms?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok && json.success) {
        setSymptomLogs(symptomLogs.filter((log) => log.id !== id));
      } else {
        alert(json.message || "Gagal menghapus catatan.");
      }
    } catch {
      alert("Koneksi bermasalah saat menghapus catatan.");
    }
  }

  function getSeverityColor(sev: number) {
    if (sev <= 3) return { label: "Ringan (1-3)", color: "green", bar: "bg-emerald-500" };
    if (sev <= 6) return { label: "Sedang (4-6)", color: "yellow", bar: "bg-amber-500" };
    return { label: "Tinggi / Perlu Perhatian (7-10)", color: "red", bar: "bg-rose-500" };
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 rounded-xl w-1/3"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 h-96 bg-gray-200 rounded-2xl"></div>
          <div className="lg:col-span-5 h-96 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── 1. Header Halaman ────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center text-xl">
            🩺
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Catat Gejala & Panduan Awal
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Identifikasi keluhan fisik Anda dan temukan tanda rujukan literatur kesehatan terpercaya.
            </p>
          </div>
        </div>

        {/* Banner Penegasan Edukasi / Disclaimer Medis */}
        <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
          <span className="text-xl shrink-0 mt-0.5">ℹ️</span>
          <p className="leading-relaxed">
            <strong className="font-semibold text-amber-950">Penafian Medis: </strong>
            {disclaimer ||
              "Panduan ini bersifat edukasi dan penilaian awal mandiri berdasarkan referensi Kemenkes RI dan WHO. Fitur ini BUKAN diagnosis medis pengganti konsultasi dengan dokter spesialis atau fasilitas kesehatan."}
          </p>
        </div>
      </div>

      {/* ── 2. Dua Kolom: Form Input & Rekomendasi Real-time ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Kolom Kiri: Form Catat Gejala (7/12) */}
        <div className="lg:col-span-7 space-y-6">
          <Card elevated>
            <Card.Header>
              <h2 className="text-base font-bold text-gray-900">
                Formulir Pencatatan Gejala Harian
              </h2>
              <p className="text-xs text-gray-500">
                Pilih atau ketikkan gejala yang Anda rasakan saat ini
              </p>
            </Card.Header>

            <Card.Body>
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs flex items-center gap-2">
                  <span>✅</span>
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmitLog} className="space-y-6">
                {/* 2a. Pilihan Chip Gejala Cepat */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    1. Pilih Gejala yang Dirasakan ({selectedSymptoms.length} dipilih)
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1 border border-gray-100 rounded-xl bg-gray-50/50">
                    {COMMON_SYMPTOM_PRESETS.map((sym) => {
                      const isSelected = selectedSymptoms.includes(sym);
                      return (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => toggleSymptom(sym)}
                          className={[
                            "px-3 py-1.5 rounded-xl text-xs font-medium transition-all text-left",
                            isSelected
                              ? "bg-brand-500 text-white shadow-sm ring-2 ring-brand-300 ring-offset-1"
                              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100",
                          ].join(" ")}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {sym}
                        </button>
                      );
                    })}
                  </div>

                  {/* Input kustom jika tidak ada di preset */}
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Ketik gejala lain (misal: mata merah, bibir kering)..."
                      value={customSymptomInput}
                      onChange={(e) => setCustomSymptomInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddCustomSymptom}
                      className="text-xs"
                    >
                      + Tambahkan
                    </Button>
                  </div>

                  {/* Daftar gejala yang terpilih saat ini */}
                  {selectedSymptoms.length > 0 && (
                    <div className="mt-3 p-3 bg-brand-50/60 rounded-xl border border-brand-200/80">
                      <span className="text-[11px] font-semibold text-brand-900 block mb-1.5">
                        Gejala Terpilih:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSymptoms.map((item) => (
                          <span
                            key={item}
                            onClick={() => toggleSymptom(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-brand-800 border border-brand-200 cursor-pointer hover:bg-red-50 hover:text-red-700 transition-colors"
                            title="Klik untuk menghapus"
                          >
                            {item}
                            <span className="text-gray-400 hover:text-red-600 font-bold">×</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2b. Slider Tingkat Keparahan (1-10) */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      2. Skala Tingkat Keparahan
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-gray-900">{severity} / 10</span>
                      <Badge color={getSeverityColor(severity).color as any}>
                        {getSeverityColor(severity).label}
                      </Badge>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={severity}
                    onChange={(e) => setSeverity(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                    <span>1 (Sangat Ringan)</span>
                    <span>5 (Mengganggu Aktivitas)</span>
                    <span>10 (Sangat Parah / Darurat)</span>
                  </div>
                </div>

                {/* 2c. Catatan Pemicu & Konteks Tambahan */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    3. Catatan Pemicu / Aktivitas Terkait (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Muncul setelah begadang semalaman, terlambat makan siang, atau banyak minum kopi..."
                    value={triggerNote}
                    onChange={(e) => setTriggerNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  ></textarea>
                </div>

                {/* Tombol Simpan */}
                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  className="w-full text-sm font-bold shadow-md"
                  isLoading={isSubmitting}
                >
                  Simpan Catatan Gejala Ini
                </Button>
              </form>
            </Card.Body>
          </Card>
        </div>

        {/* Kolom Kanan: Panduan Rujukan Kondisi Real-time (5/12) */}
        <div className="lg:col-span-5 space-y-6">
          <Card elevated className="border-teal-200/80 bg-teal-50/20">
            <Card.Header className="bg-teal-50/60 border-b border-teal-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">💡</span>
                <div>
                  <h3 className="text-sm font-bold text-teal-950">
                    Panduan Awal & Kondisi Terkait
                  </h3>
                  <p className="text-[11px] text-teal-700">
                    Pencocokan edukatif berdasarkan gejala yang dipilih
                  </p>
                </div>
              </div>
            </Card.Header>

            <Card.Body className="space-y-4">
              {!prospectiveCondition ? (
                <div className="py-8 text-center text-gray-500">
                  <span className="text-3xl text-gray-300">🔍</span>
                  <p className="text-xs font-semibold text-gray-700 mt-2">
                    Belum Ada Kecocokan Spesifik
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1 max-w-xs mx-auto">
                    Pilih minimal satu gejala di samping untuk melihat panduan rujukan medis, tanda awal, dan red flags.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Nama Kondisi & Kategori */}
                  <div>
                    <span className="text-[11px] text-gray-500 font-medium">
                      Kemungkinan Kondisi Rujukan:
                    </span>
                    <h4 className="text-base font-bold text-teal-900 mt-0.5">
                      {prospectiveCondition.conditionName}
                    </h4>
                    <div className="mt-1">
                      <Badge color="teal">{prospectiveCondition.categoryTag}</Badge>
                    </div>
                  </div>

                  {/* Tanda Awal */}
                  <div className="p-3 bg-white rounded-xl border border-teal-100 text-xs">
                    <span className="font-bold text-gray-800 block mb-1">
                      🌱 Tanda-tanda Awal yang Sering Diabaikan:
                    </span>
                    <p className="text-gray-600 leading-relaxed">
                      {prospectiveCondition.earlySigns}
                    </p>
                  </div>

                  {/* Penyebab & Pemicu Umum */}
                  <div className="p-3 bg-white rounded-xl border border-teal-100 text-xs">
                    <span className="font-bold text-gray-800 block mb-1">
                      ⚠️ Penyebab & Pemicu Umum:
                    </span>
                    <p className="text-gray-600 leading-relaxed">
                      {prospectiveCondition.commonCauses}
                    </p>
                  </div>

                  {/* Tanda Bahaya (Red Flags) */}
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900">
                    <span className="font-bold flex items-center gap-1 mb-1 text-rose-950">
                      <span>🚨</span> Tanda Bahaya (Segera ke Fasilitas Medis):
                    </span>
                    <p className="leading-relaxed">
                      {prospectiveCondition.redFlags}
                    </p>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* ── 3. Riwayat Catatan Gejala Pengguna ───────────────────────────────── */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Riwayat Catatan Gejala Anda
            </h3>
            <p className="text-xs text-gray-500">
              Total {symptomLogs.length} catatan tersimpan
            </p>
          </div>
        </div>

        {symptomLogs.length === 0 ? (
          <Card elevated className="p-8 text-center">
            <span className="text-4xl text-gray-300">📋</span>
            <h4 className="text-sm font-semibold text-gray-800 mt-2">
              Belum Ada Riwayat Gejala
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Catatan gejala yang Anda simpan akan muncul di sini secara kronologis.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {symptomLogs.map((log) => {
              const formattedDate = new Intl.DateTimeFormat("id-ID", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(log.createdAt));

              return (
                <Card key={log.id} elevated className="border-gray-200">
                  <Card.Body className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] text-gray-400">{formattedDate}</span>
                        <h4 className="text-sm font-bold text-gray-900 mt-0.5">
                          {log.matchedCondition?.conditionName || "Pencatatan Mandiri"}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge color={getSeverityColor(log.severity).color as any}>
                          Skala {log.severity}/10
                        </Badge>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="text-xs text-gray-400 hover:text-rose-600 transition-colors p-1"
                          title="Hapus catatan ini"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Gejala */}
                    <div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(() => {
                          try {
                            const parsed = JSON.parse(log.selectedSymptoms);
                            if (Array.isArray(parsed)) {
                              return parsed.map((s: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded text-[11px] bg-red-50 text-red-700 font-medium"
                                >
                                  • {s}
                                </span>
                              ));
                            }
                          } catch {
                            return (
                              <span className="text-xs text-gray-600">
                                {log.selectedSymptoms}
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>

                    {/* Trigger Note */}
                    {log.triggerNote && (
                      <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        <span className="font-semibold text-gray-800">Konteks: </span>
                        {log.triggerNote}
                      </p>
                    )}

                    {/* Red flags warning jika ada */}
                    {log.matchedCondition?.redFlags && log.severity >= 7 && (
                      <div className="text-[11px] text-rose-800 bg-rose-50 p-2 rounded-lg border border-rose-200">
                        <span className="font-bold">⚠️ Perhatian: </span>
                        {log.matchedCondition.redFlags}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
