/**
 * src/types/index.ts
 * ─────────────────────────────────────────────────────────────
 * Tipe-tipe TypeScript global yang digunakan di seluruh aplikasi.
 * Terpisah dari schema Zod agar bisa dipakai di komponen tanpa
 * mengimpor Zod di sisi client.
 * ─────────────────────────────────────────────────────────────
 */

// ─── API Response Wrapper ─────────────────────────────────────────────────────
/** Struktur respons API yang konsisten di semua endpoint */
export type ApiResponse<T = null> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>; // Field-level validation errors
};

// ─── Navigasi & UI ────────────────────────────────────────────────────────────
export type NavItem = {
  label: string;
  href:  string;
  icon?: string; // Nama ikon (opsional, misal dari Heroicons)
};

// ─── Fitur: Cek Obat ──────────────────────────────────────────────────────────
export type MedicationStatus = "taken" | "skipped" | "pending";

export type MedicationWithLogs = {
  id:           string;
  medicineName: string;
  dosageNote:   string;
  scheduleTime: string;
  isActive:     boolean;
  createdAt:    Date;
  medicationLogs: {
    id:      string;
    logDate: Date;
    status:  MedicationStatus;
    takenAt: Date | null;
  }[];
};

// ─── Fitur: Catat Gejala ──────────────────────────────────────────────────────
export type ConditionReferencePublic = {
  id:              string;
  conditionName:   string;
  commonSymptoms:  string;
  earlySigns:      string;
  commonCauses:    string;
  redFlags:        string;
  categoryTag:     string;
};

// ─── Fitur: Takar Pola Hidup ──────────────────────────────────────────────────
export type HabitCategory =
  | "nutrisi"
  | "olahraga"
  | "tidur"
  | "hidrasi"
  | "mindfulness";

export type HabitGuidePublic = {
  id:               string;
  title:            string;
  category:         HabitCategory;
  targetSummary:    string;
  guideDescription: string;
};

// ─── Fitur: Artikel Kesehatan ─────────────────────────────────────────────────
export type ArticleCategory =
  | "nutrisi"
  | "penyakit"
  | "gaya-hidup"
  | "obat-obatan";

export type ArticleCard = {
  id:          string;
  title:       string;
  slug:        string;
  category:    ArticleCategory;
  summary:     string;
  sourceName:  string;
  readMinutes: number;
  relatedTopic: string;
  updatedAt:   Date;
};

export type ArticleFull = ArticleCard & {
  content:   string;
  sourceUrl: string;
};

// ─── Session User ─────────────────────────────────────────────────────────────
/** Ekstensi NextAuth Session untuk menyertakan user ID */
export type SessionUser = {
  id:    string;
  name:  string;
  email: string;
};
