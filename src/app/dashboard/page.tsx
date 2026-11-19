import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { DashboardView } from "./DashboardView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard Ringkasan Hari Ini",
  description: "Pantau kepatuhan minum obat, catatan gejala, dan kebiasaan sehat harian Anda.",
};

export default async function DashboardPage() {
  // Proteksi server-side: redirect ke /login jika belum terautentikasi
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} />
      <main className="flex-1">
        <DashboardView />
      </main>
    </div>
  );
}
