import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { MedicationSchema } from "@/lib/validation";

// ─── GET: Ambil Daftar Obat & Statistik Kepatuhan Pengguna ────────────────────
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Silakan masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Ambil seluruh obat milik pengguna beserta log minum obat hari ini
    const medications = await db.medication.findMany({
      where: { userId: user.id },
      orderBy: [{ isActive: "desc" }, { scheduleTime: "asc" }],
      include: {
        medicationLogs: {
          where: {
            logDate: {
              gte: today,
              lt: tomorrow,
            },
          },
        },
      },
    });

    // Hitung ringkasan kepatuhan
    const activeMedications = medications.filter((m) => m.isActive);
    let takenTodayCount = 0;
    let skippedTodayCount = 0;
    let pendingTodayCount = 0;

    const mappedMedications = medications.map((med) => {
      const todayLog = med.medicationLogs[0] || null;
      const status = todayLog ? todayLog.status : "pending";

      if (med.isActive) {
        if (status === "taken") takenTodayCount++;
        else if (status === "skipped") skippedTodayCount++;
        else pendingTodayCount++;
      }

      return {
        id: med.id,
        medicineName: med.medicineName,
        dosageNote: med.dosageNote,
        scheduleTime: med.scheduleTime,
        isActive: med.isActive,
        createdAt: med.createdAt,
        todayStatus: status,
        takenAt: todayLog?.takenAt || null,
        logId: todayLog?.id || null,
      };
    });

    const totalActive = activeMedications.length;
    const adherenceRate =
      totalActive > 0 ? Math.round((takenTodayCount / totalActive) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        medications: mappedMedications,
        stats: {
          totalMedications: medications.length,
          totalActive,
          takenTodayCount,
          skippedTodayCount,
          pendingTodayCount,
          adherenceRate,
        },
      },
    });
  } catch (error) {
    console.error("Error pada GET /api/medications:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat daftar obat." },
      { status: 500 }
    );
  }
}

// ─── POST: Daftarkan Obat Baru Milik Pengguna ──────────────────────────────────
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
    const validation = MedicationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.issues[0]?.message || "Input obat tidak valid.",
        },
        { status: 400 }
      );
    }

    const { medicineName, dosageNote, scheduleTime, isActive } = validation.data;

    const newMedication = await db.medication.create({
      data: {
        userId: user.id,
        medicineName: medicineName.trim(),
        dosageNote: dosageNote.trim(),
        scheduleTime: scheduleTime.trim(),
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Obat "${newMedication.medicineName}" berhasil ditambahkan.`,
        data: newMedication,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error pada POST /api/medications:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan obat." },
      { status: 500 }
    );
  }
}
