import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Sesi tidak aktif atau telah kedaluwarsa.",
          user: null,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error pada endpoint /api/auth/me:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memverifikasi pengguna.",
      },
      { status: 500 }
    );
  }
}
