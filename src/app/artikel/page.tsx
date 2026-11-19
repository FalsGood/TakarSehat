import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { ArtikelListView } from "./ArtikelListView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Artikel Kesehatan Terpercaya",
  description: "Kumpulan artikel edukasi kesehatan berbasis bukti ilmiah dari Kementerian Kesehatan RI, WHO, dan BPOM.",
};

export default async function ArtikelPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} />
      <main className="flex-1">
        <ArtikelListView />
      </main>
    </div>
  );
}
