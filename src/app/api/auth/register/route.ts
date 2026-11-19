import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, signAuthToken, getAuthCookieOptions } from "@/lib/auth";
import { RegisterSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validasi input
    const validation = RegisterSchema.safeParse(body);
    if (!validation.success) {
      const issues = validation.error.format();
      const firstErrorMessage =
        validation.error.issues[0]?.message || "Data formulir tidak valid";

      return NextResponse.json(
        {
          success: false,
          message: firstErrorMessage,
          errors: issues,
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Cek apakah email sudah terdaftar
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email ini sudah terdaftar. Silakan gunakan email lain atau login.",
        },
        { status: 409 }
      );
    }

    // Hash password secara aman
    const passwordHash = await hashPassword(password);

    // Simpan pengguna baru ke database
    const newUser = await db.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Otomatis buat token session dan set cookie HttpOnly
    const token = await signAuthToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Pendaftaran berhasil! Selamat datang di TakarSehat.",
        user: newUser,
      },
      { status: 201 }
    );

    // Pasang cookie session yang aman
    const cookieOptions = getAuthCookieOptions();
    response.cookies.set(cookieOptions.name, token, cookieOptions);

    return response;
  } catch (error) {
    console.error("Error pada endpoint /api/auth/register:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi gangguan server. Silakan coba beberapa saat lagi.",
      },
      { status: 500 }
    );
  }
}
