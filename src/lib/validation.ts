/**
 * src/lib/validation.ts
 * ─────────────────────────────────────────────────────────────
 * Schema validasi menggunakan Zod untuk seluruh fitur TakarSehat.
 * Digunakan di API Routes dan Server Actions untuk memvalidasi input.
 * ─────────────────────────────────────────────────────────────
 */

import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Password harus mengandung huruf kapital")
    .regex(/[0-9]/, "Password harus mengandung angka"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password dan konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

export const LoginSchema = z.object({
  email:    z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

// ─── Medication (Cek Obat) ────────────────────────────────────────────────────

export const MedicationSchema = z.object({
  medicineName: z
    .string()
    .min(2, "Nama obat minimal 2 karakter")
    .max(200, "Nama obat terlalu panjang"),
  dosageNote: z
    .string()
    .min(3, "Catatan dosis wajib diisi")
    .max(500, "Catatan dosis terlalu panjang"),
  scheduleTime: z
    .string()
    .min(1, "Jadwal minum wajib diisi")
    .max(200, "Format jadwal terlalu panjang"),
  isActive: z.boolean().default(true),
});

export const MedicationLogSchema = z.object({
  medicationId: z.string().cuid("ID obat tidak valid"),
  logDate:      z.string().datetime({ message: "Format tanggal tidak valid" }),
  status:       z.enum(["taken", "skipped", "pending"], {
    message: "Status harus: taken, skipped, atau pending",
  }),
  takenAt: z.string().datetime().optional().nullable(),
});

// ─── SymptomLog (Catat Gejala) ────────────────────────────────────────────────

export const SymptomLogSchema = z.object({
  selectedSymptoms: z
    .array(z.string().min(1))
    .min(1, "Pilih minimal 1 gejala")
    .max(20, "Maksimal 20 gejala per sesi"),
  severity: z
    .number()
    .int()
    .min(1, "Skala keparahan minimal 1")
    .max(10, "Skala keparahan maksimal 10"),
  triggerNote:        z.string().max(1000, "Catatan pemicu terlalu panjang").optional().nullable(),
  matchedConditionId: z.string().optional().nullable(),
});

// ─── DailyHabitLog (Takar Pola Hidup) ────────────────────────────────────────

export const DailyHabitLogSchema = z.object({
  habitGuideId:      z.string().cuid("ID panduan tidak valid"),
  logDate:           z.string().datetime({ message: "Format tanggal tidak valid" }),
  isCompleted:       z.boolean(),
  portionOrHabitNote: z
    .string()
    .max(500, "Catatan terlalu panjang")
    .optional()
    .nullable(),
});

// ─── Ekspor tipe TypeScript dari schema ──────────────────────────────────────
// Menggunakan z.infer agar tidak perlu mendefinisikan tipe secara terpisah.

export type RegisterInput     = z.infer<typeof RegisterSchema>;
export type LoginInput         = z.infer<typeof LoginSchema>;
export type MedicationInput    = z.infer<typeof MedicationSchema>;
export type MedicationLogInput = z.infer<typeof MedicationLogSchema>;
export type SymptomLogInput    = z.infer<typeof SymptomLogSchema>;
export type DailyHabitLogInput = z.infer<typeof DailyHabitLogSchema>;
