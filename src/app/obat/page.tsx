import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { ObatView } from "./ObatView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cek Obat & Kepatuhan Jadwal",
  description: "Kelola jadwal konsumsi obat harian dan pantau kepatuhan minum obat Anda dengan mudah.",
};

export default async function ObatPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} />
      <main className="flex-1">
        <ObatView />
      </main>
    </div>
  );
}
