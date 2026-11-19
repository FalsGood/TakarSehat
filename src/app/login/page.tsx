"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  // Fungsi Login Standar
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Harap isi alamat email dan kata sandi.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Email atau kata sandi tidak sesuai.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrorMsg("Koneksi bermasalah. Silakan periksa jaringan Anda.");
    } finally {
      setIsLoading(false);
    }
  }

  // Fungsi Quick Login Akun Demo untuk Pengujian Juri
  async function handleDemoLogin() {
    setErrorMsg("");
    setIsDemoLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "demo@takarsehat.id",
          password: "Password123!",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg("Gagal mengakses akun demo. Pastikan database telah diseed.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrorMsg("Gagal melakukan demo login.");
    } finally {
      setIsDemoLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-gray-50 to-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Form */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <span className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
            🌿
          </span>
          <span className="font-bold text-2xl text-gray-900 tracking-tight">
            Takar<span className="text-brand-600">Sehat</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">
          Masuk ke Akun Anda
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Pantau kesehatan dan pola hidup harian Anda dengan mudah.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Banner Fitur Demo untuk Juri / Penguji */}
        <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚡</span>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-emerald-900">
                Mode Uji Coba Cepat (Juri / Penguji)
              </h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Gunakan akun demo yang telah diisi jadwal obat, riwayat gejala, dan progres pola hidup hari ini.
              </p>
              <div className="mt-2.5">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="w-full text-xs font-semibold py-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  isLoading={isDemoLoading}
                  onClick={handleDemoLogin}
                >
                  🚀 1-Klik Masuk sebagai Akun Demo
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Card Form Login */}
        <Card elevated className="border-gray-200/80 shadow-md">
          <Card.Body className="p-6 sm:p-8">
            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                <span className="text-base leading-none">⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Alamat Email"
                type="email"
                required
                autoComplete="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Kata Sandi"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Masuk Sekarang
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500 border-t border-gray-100 pt-5">
              Belum memiliki akun?{" "}
              <Link
                href="/register"
                className="font-semibold text-brand-600 hover:text-brand-700 hover:underline"
              >
                Daftar akun baru
              </Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
