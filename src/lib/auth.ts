/**
 * src/lib/auth.ts
 * ─────────────────────────────────────────────────────────────
 * Utilitas Autentikasi TakarSehat:
 *   - Hash & verifikasi password menggunakan bcryptjs
 *   - JWT Session menggunakan jose (Edge / Serverless compatible)
 *   - Pengelolaan HttpOnly cookie (SameSite: lax, secure in production)
 *   - Helper autentikasi server: getCurrentUser(), requireAuth()
 * ─────────────────────────────────────────────────────────────
 */

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// ─── Konstanta & Konfigurasi ──────────────────────────────────────────────────
const SALT_ROUNDS = 12;
export const AUTH_COOKIE_NAME = "takarsehat_session";
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 hari

// Secret key untuk signing JWT
function getJwtSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET || "takarsehat-default-jwt-secret-key-minimum-32-chars";
  return new TextEncoder().encode(secret);
}

export type AuthTokenPayload = {
  id: string;
  email: string;
  name: string;
};

// ─── 1. Password Hashing & Verification ───────────────────────────────────────

/**
 * Menghasilkan hash bcrypt dari password plaintext.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Memverifikasi kecocokan password plaintext dengan hash yang tersimpan.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── 2. JWT Generation & Verification ─────────────────────────────────────────

/**
 * Membuat token JWT berdurasi 7 hari menggunakan jose.
 */
export async function signAuthToken(payload: AuthTokenPayload): Promise<string> {
  return new SignJWT({
    id: payload.id,
    email: payload.email,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

/**
 * Memverifikasi dan mem-parse token JWT. Mengembalikan payload jika valid, null jika invalid/expired.
 */
export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const verified = await jwtVerify(token, getJwtSecret());
    const payload = verified.payload as unknown as AuthTokenPayload;
    if (!payload?.id || !payload?.email) {
      return null;
    }
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

// ─── 3. Cookie Configuration ──────────────────────────────────────────────────

/**
 * Mendapatkan opsi cookie standar (HttpOnly, SameSite lax, Secure di production).
 */
export function getAuthCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    name: AUTH_COOKIE_NAME,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

// ─── 4. Server Helper: Ambil User Saat Ini ─────────────────────────────────────

/**
 * Mendapatkan data pengguna yang sedang login dari session cookie.
 * Mengembalikan data user aman dari database atau null jika belum login.
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) return null;

    const payload = await verifyAuthToken(token);
    if (!payload) return null;

    // Ambil data user segar dari database untuk memastikan akun masih aktif
    const user = await db.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error: unknown) {
    // Biarkan Next.js menandai route sebagai dynamic saat memanggil cookies()
    const err = error as { digest?: string; message?: string };
    if (
      err?.digest === "DYNAMIC_SERVER_USAGE" ||
      err?.message?.includes("Dynamic server usage")
    ) {
      throw error;
    }
    console.error("Gagal mendapatkan current user:", error);
    return null;
  }
}

/**
 * Proteksi rute: memastikan user login.
 * Mengembalikan user atau melempar error jika belum login.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

// ─── 5. Konfigurasi NextAuth (Opsional jika ingin kompatibilitas) ──────────────
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_SECONDS },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const isValid = await verifyPassword(credentials.password, user.passwordHash);
        if (!isValid) return null;
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id: string } & typeof session.user).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
