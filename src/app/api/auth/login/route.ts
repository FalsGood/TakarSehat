import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, signAuthToken, getAuthCookieOptions } from "@/lib/auth";
import { LoginSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validasi input
    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Format email atau password tidak valid.",
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Cari user berdasarkan email
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Cegah user enumeration: pesan error sama persis untuk user tidak ada maupun password salah
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Email atau kata sandi yang Anda masukkan salah.",
        },
        { status: 401 }
      );
    }

    // Verifikasi hash password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Email atau kata sandi yang Anda masukkan salah.",
        },
        { status: 401 }
      );
    }

    // Buat token session JWT
    const token = await signAuthToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json({
      success: true,
      message: "Berhasil masuk ke akun TakarSehat.",
      user: safeUser,
    });

    // Pasang cookie session HttpOnly
    const cookieOptions = getAuthCookieOptions();
    response.cookies.set(cookieOptions.name, token, cookieOptions);

    return response;
  } catch (error) {
    console.error("Error pada endpoint /api/auth/login:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal. Silakan coba lagi.",
      },
      { status: 500 }
    );
  }
}
