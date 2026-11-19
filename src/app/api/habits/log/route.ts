import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const UpdateHabitLogSchema = z.object({
  habitGuideId: z.string().min(1, "ID panduan kebiasaan wajib diisi"),
  isCompleted: z.boolean(),
  portionOrHabitNote: z.string().optional().nullable(),
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
    const validation = UpdateHabitLogSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Parameter tidak valid." },
        { status: 400 }
      );
    }

    const { habitGuideId, isCompleted, portionOrHabitNote } = validation.data;

    // Pastikan HabitGuide valid
    const habit = await db.habitGuide.findUnique({
      where: { id: habitGuideId },
    });

    if (!habit) {
      return NextResponse.json(
        { success: false, message: "Panduan kebiasaan tidak ditemukan." },
        { status: 404 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Atomic upsert berkat composite unique constraint [habitGuideId, userId, logDate]
    const updatedLog = await db.dailyHabitLog.upsert({
      where: {
        habitGuideId_userId_logDate: {
          habitGuideId,
          userId: user.id,
          logDate: today,
        },
      },
      update: {
        isCompleted,
        portionOrHabitNote: portionOrHabitNote !== undefined ? portionOrHabitNote : undefined,
      },
      create: {
        habitGuideId,
        userId: user.id,
        logDate: today,
        isCompleted,
        portionOrHabitNote: portionOrHabitNote || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Progres kebiasaan berhasil disimpan.`,
      data: updatedLog,
    });
  } catch (error) {
    console.error("Error pada endpoint /api/habits/log:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan progres kebiasaan." },
      { status: 500 }
    );
  }
}
