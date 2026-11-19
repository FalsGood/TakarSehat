/**
 * src/lib/db.ts
 * ─────────────────────────────────────────────────────────────
 * Singleton Prisma Client untuk menghindari koneksi database
 * yang terlalu banyak saat hot-reload di mode development.
 *
 * Referensi: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 * ─────────────────────────────────────────────────────────────
 */

import { PrismaClient } from "@prisma/client";

// Deklarasi global agar instance tidak terduplikasi saat hot-reload
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Gunakan instance global di development; buat baru di production
export const db = globalThis.prisma ?? new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"] // Log query SQL di development
      : ["error"],                 // Hanya log error di production
});

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
