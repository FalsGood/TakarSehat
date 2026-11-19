"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Terjadi unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center text-3xl mb-4 shadow-sm">
        ⚠️
      </div>
      <span className="text-sm font-bold text-red-600 tracking-wider uppercase mb-1">
        Gangguan Sistem
      </span>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
        Terjadi Kesalahan yang Tidak Terduga
      </h1>
      <p className="text-gray-500 text-sm max-w-md mb-8">
        Sistem mengalami kendala sementara saat memproses permintaan Anda. Silakan coba muat ulang halaman.
      </p>

      <div className="flex gap-3">
        <Button variant="primary" size="md" onClick={() => reset()}>
          Coba Lagi
        </Button>
        <Button
          variant="outline"
          size="md"
          onClick={() => (window.location.href = "/dashboard")}
        >
          Ke Dashboard
        </Button>
      </div>
    </div>
  );
}
