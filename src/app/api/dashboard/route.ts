import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // 1. Proteksi Autentikasi Pengguna
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak. Silakan masuk terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    // Tanggal hari ini (awal hari 00:00:00 untuk query logDate)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 2. Query paralel yang sangat efisien (bebas dari N+1 problem)
    const [
      medications,
      todayMedLogs,
      recentSymptomLog,
      allHabitGuides,
      todayHabitLogs,
      featuredArticles,
    ] = await Promise.all([
      // Daftar obat aktif milik pengguna
      db.medication.findMany({
        where: {
          userId: user.id,
          isActive: true,
        },
        orderBy: { scheduleTime: "asc" },
      }),

      // Log obat hari ini milik pengguna
      db.medicationLog.findMany({
        where: {
          userId: user.id,
          logDate: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),

      // Catatan gejala terakhir pengguna beserta relasi nama kondisi
      db.symptomLog.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
          matchedCondition: {
            select: {
              id: true,
              conditionName: true,
              categoryTag: true,
              redFlags: true,
            },
          },
        },
      }),

      // Semua panduan pola hidup yang tersedia
      db.habitGuide.findMany({
        orderBy: { title: "asc" },
      }),

      // Log pemenuhan kebiasaan hari ini milik pengguna
      db.dailyHabitLog.findMany({
        where: {
          userId: user.id,
          logDate: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),

      // 3 artikel terpopuler / terbaru untuk cuplikan edukasi
      db.article.findMany({
        take: 3,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          summary: true,
          sourceName: true,
          readMinutes: true,
        },
      }),
    ]);

    // 3. Olah status obat hari ini
    const medLogMap = new Map<string, (typeof todayMedLogs)[0]>();
    for (const log of todayMedLogs) {
      medLogMap.set(log.medicationId, log);
    }

    const medicationSchedule = medications.map((med) => {
      const log = medLogMap.get(med.id);
      return {
        id: med.id,
        medicineName: med.medicineName,
        dosageNote: med.dosageNote,
        scheduleTime: med.scheduleTime,
        status: log ? log.status : "pending", // "taken" | "skipped" | "pending"
        takenAt: log?.takenAt || null,
        logId: log?.id || null,
      };
    });

    const totalScheduled = medicationSchedule.length;
    const takenCount = medicationSchedule.filter((m) => m.status === "taken").length;
    const skippedCount = medicationSchedule.filter((m) => m.status === "skipped").length;
    const pendingCount = medicationSchedule.filter((m) => m.status === "pending").length;
    const adherenceRate =
      totalScheduled > 0 ? Math.round((takenCount / totalScheduled) * 100) : 0;

    // 4. Olah progres pola hidup hari ini
    const habitLogMap = new Map<string, (typeof todayHabitLogs)[0]>();
    for (const log of todayHabitLogs) {
      habitLogMap.set(log.habitGuideId, log);
    }

    const habitsProgress = allHabitGuides.map((guide) => {
      const log = habitLogMap.get(guide.id);
      return {
        id: guide.id,
        title: guide.title,
        category: guide.category,
        targetSummary: guide.targetSummary,
        isCompleted: log ? log.isCompleted : false,
        note: log?.portionOrHabitNote || null,
      };
    });

    const completedHabitsCount = habitsProgress.filter((h) => h.isCompleted).length;
    const totalHabitsCount = habitsProgress.length;
    const habitsRate =
      totalHabitsCount > 0
        ? Math.round((completedHabitsCount / totalHabitsCount) * 100)
        : 0;

    // 5. Kembalikan response terstruktur
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        todayDate: today.toISOString(),
        medicationsSummary: {
          totalScheduled,
          takenCount,
          skippedCount,
          pendingCount,
          adherenceRate,
          schedule: medicationSchedule,
        },
        symptomsSummary: {
          hasRecord: !!recentSymptomLog,
          record: recentSymptomLog
            ? {
                id: recentSymptomLog.id,
                selectedSymptoms: recentSymptomLog.selectedSymptoms,
                severity: recentSymptomLog.severity,
                triggerNote: recentSymptomLog.triggerNote,
                createdAt: recentSymptomLog.createdAt,
                matchedCondition: recentSymptomLog.matchedCondition,
              }
            : null,
        },
        habitsSummary: {
          totalHabitsCount,
          completedHabitsCount,
          habitsRate,
          habits: habitsProgress,
        },
        featuredArticles,
      },
    });
  } catch (error) {
    console.error("Error pada endpoint /api/dashboard:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat ringkasan dashboard.",
      },
      { status: 500 }
    );
  }
}
