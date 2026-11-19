import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.toLowerCase().trim() || "";
    const category = searchParams.get("category")?.toLowerCase().trim() || "";
    const topic = searchParams.get("topic")?.toLowerCase().trim() || "";

    // Bangun filter Prisma dinamis
    const whereClause: any = {};

    if (category && category !== "semua") {
      whereClause.category = {
        equals: category,
        mode: "insensitive",
      };
    }

    if (topic) {
      whereClause.relatedTopic = {
        contains: topic,
        mode: "insensitive",
      };
    }

    if (q) {
      whereClause.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
        { relatedTopic: { contains: q, mode: "insensitive" } },
        { sourceName: { contains: q, mode: "insensitive" } },
      ];
    }

    const articles = await db.article.findMany({
      where: whereClause,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        summary: true,
        sourceName: true,
        sourceUrl: true,
        readMinutes: true,
        relatedTopic: true,
        updatedAt: true,
      },
    });

    // Ambil daftar seluruh kategori dan topik unik untuk filter
    const allArticles = await db.article.findMany({
      select: { category: true, relatedTopic: true },
    });

    const categorySet = new Set<string>();
    const topicSet = new Set<string>();

    for (const a of allArticles) {
      if (a.category) categorySet.add(a.category.toLowerCase());
      if (a.relatedTopic) {
        a.relatedTopic.split(",").forEach((t) => {
          const trimmed = t.trim().toLowerCase();
          if (trimmed) topicSet.add(trimmed);
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        articles,
        categories: Array.from(categorySet),
        topics: Array.from(topicSet),
      },
    });
  } catch (error) {
    console.error("Error pada GET /api/articles:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat artikel kesehatan." },
      { status: 500 }
    );
  }
}
