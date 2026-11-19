import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { PolaHidupView } from "./PolaHidupView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Takar Pola Hidup Harian",
  description: "Pantau pemenuhan porsi gizi seimbang, hidrasi harian, olahraga, tidur, dan manajemen stres Anda.",
};

export default async function PolaHidupPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} />
      <main className="flex-1">
        <PolaHidupView />
      </main>
    </div>
  );
}
