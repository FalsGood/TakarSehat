import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

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

    // Ambil seluruh panduan kebiasaan dan log user hari ini secara paralel
    const [allGuides, todayLogs] = await Promise.all([
      db.habitGuide.findMany({
        orderBy: [{ category: "asc" }, { title: "asc" }],
      }),
      db.dailyHabitLog.findMany({
        where: {
          userId: user.id,
          logDate: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
    ]);

    const logMap = new Map<string, (typeof todayLogs)[0]>();
    for (const log of todayLogs) {
      logMap.set(log.habitGuideId, log);
    }

    const habits = allGuides.map((guide) => {
      const userLog = logMap.get(guide.id);
      return {
        id: guide.id,
        title: guide.title,
        category: guide.category,
        targetSummary: guide.targetSummary,
        guideDescription: guide.guideDescription,
        isCompleted: userLog ? userLog.isCompleted : false,
        portionOrHabitNote: userLog?.portionOrHabitNote || "",
        logId: userLog?.id || null,
      };
    });

    const totalHabits = habits.length;
    const completedCount = habits.filter((h) => h.isCompleted).length;
    const completionRate =
      totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        habits,
        stats: {
          totalHabits,
          completedCount,
          completionRate,
        },
      },
    });
  } catch (error) {
    console.error("Error pada GET /api/habits:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat panduan pola hidup." },
      { status: 500 }
    );
  }
}
