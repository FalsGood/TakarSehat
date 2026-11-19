"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    // Validasi dasar di client
    if (password.length < 8) {
      setErrorMsg("Kata sandi harus minimal 8 karakter.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setErrorMsg("Kata sandi harus mengandung minimal 1 huruf kapital.");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setErrorMsg("Kata sandi harus mengandung minimal 1 angka.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok dengan kata sandi.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Pendaftaran gagal. Silakan periksa kembali data Anda.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrorMsg("Koneksi bermasalah. Silakan periksa jaringan internet Anda.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-gray-50 to-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
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
          Buat Akun Baru
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Mulai langkah cerdas mengelola kesehatan pribadi Anda hari ini.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
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
                label="Nama Lengkap"
                type="text"
                required
                placeholder="Contoh: Budi Santoso"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

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
                autoComplete="new-password"
                placeholder="Minimal 8 karakter, huruf kapital & angka"
                hint="Minimal 8 karakter dengan kombinasi huruf kapital dan angka"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Input
                label="Ulangi Kata Sandi"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Masukkan kembali kata sandi"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Daftar Sekarang
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500 border-t border-gray-100 pt-5">
              Sudah memiliki akun?{" "}
              <Link
                href="/login"
                className="font-semibold text-brand-600 hover:text-brand-700 hover:underline"
              >
                Masuk di sini
              </Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
