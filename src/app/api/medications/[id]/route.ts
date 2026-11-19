import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { MedicationSchema } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ─── PUT/PATCH: Perbarui Data Obat (Dengan Validasi Otorisasi Ketat) ───────────
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak." },
        { status: 401 }
      );
    }

    const { id: medicationId } = await params;
    const body = await req.json();

    const validation = MedicationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.issues[0]?.message || "Input tidak valid.",
        },
        { status: 400 }
      );
    }

    // Pastikan obat ini milik pengguna yang sedang login
    const existingMed = await db.medication.findFirst({
      where: {
        id: medicationId,
        userId: user.id,
      },
    });

    if (!existingMed) {
      return NextResponse.json(
        { success: false, message: "Data obat tidak ditemukan atau bukan milik Anda." },
        { status: 404 }
      );
    }

    const { medicineName, dosageNote, scheduleTime, isActive } = validation.data;

    const updatedMed = await db.medication.update({
      where: { id: medicationId },
      data: {
        medicineName: medicineName.trim(),
        dosageNote: dosageNote.trim(),
        scheduleTime: scheduleTime.trim(),
        isActive,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Obat "${updatedMed.medicineName}" berhasil diperbarui.`,
      data: updatedMed,
    });
  } catch (error) {
    console.error("Error pada PUT /api/medications/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui data obat." },
      { status: 500 }
    );
  }
}

// ─── DELETE: Hapus Obat Milik Pengguna ─────────────────────────────────────────
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak." },
        { status: 401 }
      );
    }

    const { id: medicationId } = await params;

    // Pastikan obat ini milik pengguna yang sedang login
    const existingMed = await db.medication.findFirst({
      where: {
        id: medicationId,
        userId: user.id,
      },
    });

    if (!existingMed) {
      return NextResponse.json(
        { success: false, message: "Data obat tidak ditemukan atau bukan milik Anda." },
        { status: 404 }
      );
    }

    // Hapus obat (relasi MedicationLog akan terhapus otomatis secara cascade)
    await db.medication.delete({
      where: { id: medicationId },
    });

    return NextResponse.json({
      success: true,
      message: `Obat "${existingMed.medicineName}" berhasil dihapus.`,
    });
  } catch (error) {
    console.error("Error pada DELETE /api/medications/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus obat." },
      { status: 500 }
    );
  }
}
