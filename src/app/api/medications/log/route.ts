import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const UpdateMedicationLogSchema = z.object({
  medicationId: z.string().min(1, "ID obat wajib diisi"),
  status: z.enum(["taken", "skipped", "pending"]),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Akses tidak sah." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = UpdateMedicationLogSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Parameter tidak valid." },
        { status: 400 }
      );
    }

    const { medicationId, status } = validation.data;

    // Verifikasi bahwa obat tersebut benar-benar milik pengguna yang sedang login
    const medication = await db.medication.findFirst({
      where: {
        id: medicationId,
        userId: user.id,
      },
    });

    if (!medication) {
      return NextResponse.json(
        { success: false, message: "Data obat tidak ditemukan." },
        { status: 404 }
      );
    }

    // Tanggal hari ini tanpa jam
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const takenAt = status === "taken" ? new Date() : null;

    // Atomic upsert berkat composite unique constraint [medicationId, userId, logDate]
    const updatedLog = await db.medicationLog.upsert({
      where: {
        medicationId_userId_logDate: {
          medicationId,
          userId: user.id,
          logDate: today,
        },
      },
      update: {
        status,
        takenAt,
      },
      create: {
        medicationId,
        userId: user.id,
        logDate: today,
        status,
        takenAt,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Status obat berhasil diperbarui menjadi ${status}.`,
      data: updatedLog,
    });
  } catch (error) {
    console.error("Error pada endpoint /api/medications/log:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui status obat." },
      { status: 500 }
    );
  }
}
