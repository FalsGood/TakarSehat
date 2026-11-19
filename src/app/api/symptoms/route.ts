import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { SymptomLogSchema } from "@/lib/validation";

// Disclaimer standar medis
const MEDICAL_DISCLAIMER =
  "PENTING: Panduan ini bersifat edukasi dan penilaian awal mandiri berdasarkan referensi literatur kesehatan terpercaya (Kemenkes & WHO). Ini BUKAN merupakan diagnosis medis final atau resep pengobatan. Jika mengalami gejala parah atau tanda bahaya (red flags), segera hubungi dokter atau IGD terdekat.";

// ─── GET: Ambil Riwayat Gejala Pengguna & Daftar Referensi Kondisi ─────────────
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Silakan masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    // Ambil riwayat gejala user dan seluruh referensi kondisi secara paralel
    const [symptomLogs, conditions] = await Promise.all([
      db.symptomLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
          matchedCondition: true,
        },
      }),
      db.conditionReference.findMany({
        orderBy: { conditionName: "asc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        symptomLogs,
        conditions,
        disclaimer: MEDICAL_DISCLAIMER,
      },
    });
  } catch (error) {
    console.error("Error pada GET /api/symptoms:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat data gejala." },
      { status: 500 }
    );
  }
}

// ─── POST: Catat Gejala Baru & Jalankan Algoritma Pencocokan Kondisi ───────────
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Silakan masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = SymptomLogSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.issues[0]?.message || "Input tidak valid.",
        },
        { status: 400 }
      );
    }

    const { selectedSymptoms, severity, triggerNote, matchedConditionId } = validation.data;

    // Ambil seluruh ConditionReference untuk pencocokan jika belum dipilih manual
    const allConditions = await db.conditionReference.findMany();

    let finalMatchedConditionId: string | null = matchedConditionId || null;

    // Logika pencocokan transparan & edukatif:
    // Menghitung bobot kecocokan kata kunci antara gejala yang dipilih dengan daftar commonSymptoms
    if (!finalMatchedConditionId && allConditions.length > 0) {
      let highestScore = 0;
      let bestMatchId: string | null = null;

      const userSymptomsNormalized = selectedSymptoms.map((s) => s.toLowerCase().trim());

      for (const cond of allConditions) {
        let conditionSymptoms: string[] = [];
        try {
          const parsed = JSON.parse(cond.commonSymptoms);
          if (Array.isArray(parsed)) {
            conditionSymptoms = parsed.map((s: string) => String(s).toLowerCase().trim());
          }
        } catch {
          conditionSymptoms = cond.commonSymptoms.toLowerCase().split(",").map((s) => s.trim());
        }

        let score = 0;
        for (const userSym of userSymptomsNormalized) {
          for (const condSym of conditionSymptoms) {
            // Pencocokan substring / kata kunci
            if (condSym.includes(userSym) || userSym.includes(condSym)) {
              score += 2;
            } else {
              // Cek kesamaan kata individual
              const userWords = userSym.split(/\s+/);
              const condWords = condSym.split(/\s+/);
              const hasSharedWord = userWords.some(
                (w) => w.length > 3 && condWords.includes(w)
              );
              if (hasSharedWord) {
                score += 1;
              }
            }
          }
        }

        if (score > highestScore) {
          highestScore = score;
          bestMatchId = cond.id;
        }
      }

      // Pasang hasil pencocokan jika skor memenuhi threshold
      if (highestScore > 0) {
        finalMatchedConditionId = bestMatchId;
      }
    }

    // Simpan log gejala ke database
    const createdLog = await db.symptomLog.create({
      data: {
        userId: user.id,
        selectedSymptoms: JSON.stringify(selectedSymptoms),
        severity,
        triggerNote: triggerNote || null,
        matchedConditionId: finalMatchedConditionId,
      },
      include: {
        matchedCondition: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Catatan gejala berhasil disimpan.",
      data: createdLog,
      disclaimer: MEDICAL_DISCLAIMER,
    });
  } catch (error) {
    console.error("Error pada POST /api/symptoms:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan catatan gejala." },
      { status: 500 }
    );
  }
}

// ─── DELETE: Hapus Riwayat Gejala (Dengan Validasi Kepemilikan) ────────────────
export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const logId = searchParams.get("id");

    if (!logId) {
      return NextResponse.json(
        { success: false, message: "ID catatan wajib disertakan." },
        { status: 400 }
      );
    }

    // Pastikan log milik pengguna yang sedang login
    const targetLog = await db.symptomLog.findFirst({
      where: {
        id: logId,
        userId: user.id,
      },
    });

    if (!targetLog) {
      return NextResponse.json(
        { success: false, message: "Catatan gejala tidak ditemukan atau bukan milik Anda." },
        { status: 404 }
      );
    }

    await db.symptomLog.delete({
      where: { id: logId },
    });

    return NextResponse.json({
      success: true,
      message: "Catatan gejala berhasil dihapus.",
    });
  } catch (error) {
    console.error("Error pada DELETE /api/symptoms:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus catatan gejala." },
      { status: 500 }
    );
  }
}
