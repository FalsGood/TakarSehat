import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { GejalaView } from "./GejalaView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catat Gejala & Panduan Awal",
  description: "Catat gejala kesehatan Anda dan temukan panduan edukatif awal berdasarkan literatur medis resmi.",
};

export default async function GejalaPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} />
      <main className="flex-1">
        <GejalaView />
      </main>
    </div>
  );
}
