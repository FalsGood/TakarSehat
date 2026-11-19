import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-brand-100 text-brand-700 flex items-center justify-center text-3xl mb-4 shadow-sm">
        🌿
      </div>
      <span className="text-sm font-bold text-brand-600 tracking-wider uppercase mb-1">
        Error 404
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
        Halaman Tidak Ditemukan
      </h1>
      <p className="text-gray-500 text-sm max-w-md mb-8">
        Halaman yang Anda tuju mungkin telah dipindahkan, dihapus, atau tautan yang Anda masukkan keliru.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/dashboard">
          <Button variant="primary" size="md">
            Kembali ke Dashboard
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" size="md">
            Halaman Utama
          </Button>
        </Link>
      </div>
    </div>
  );
}
