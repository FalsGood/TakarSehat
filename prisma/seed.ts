/**
 * prisma/seed.ts
 * ─────────────────────────────────────────────────────────────
 * Seed idempotent: data hanya di-insert jika belum ada.
 * Jalankan dengan: npm run db:seed
 * atau            : npx prisma db seed
 * ─────────────────────────────────────────────────────────────
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Helper: upsert berdasarkan field unik ─────────────────────────────────
// Menggunakan upsert agar aman dijalankan berulang kali (idempotent).

async function main() {
  console.log("🌱 Memulai seeding database TakarSehat...\n");

  // ══════════════════════════════════════════════════════════════
  // 1. ConditionReference — Referensi Kondisi/Penyakit
  // ══════════════════════════════════════════════════════════════
  console.log("📋 Menyemai ConditionReference...");

  const conditions = [
    {
      conditionName: "Hipertensi (Tekanan Darah Tinggi)",
      commonSymptoms:
        '["sakit kepala bagian belakang","penglihatan kabur","pusing","detak jantung tidak teratur","mimisan"]',
      earlySigns:
        "Sering sakit kepala ringan di pagi hari, mudah lelah tanpa sebab jelas, sesekali telinga berdenging.",
      commonCauses:
        "Konsumsi garam berlebih, kurang aktivitas fisik, stres kronis, obesitas, merokok, riwayat keluarga, konsumsi alkohol.",
      redFlags:
        "Tekanan darah ≥180/120 mmHg, nyeri dada, sesak napas tiba-tiba, penglihatan mendadak kabur, bicara pelo, kelemahan satu sisi tubuh → SEGERA KE UGD.",
      categoryTag: "penyakit-kronis",
    },
    {
      conditionName: "Diabetes Mellitus Tipe 2",
      commonSymptoms:
        '["sering buang air kecil","rasa haus berlebih","penurunan berat badan tanpa sebab","luka sulit sembuh","kesemutan di tangan/kaki","penglihatan kabur"]',
      earlySigns:
        "Sering mengantuk setelah makan, mudah lapar meski baru makan, kulit terasa kering dan gatal, luka kecil lama sembuh.",
      commonCauses:
        "Resistensi insulin, pola makan tinggi gula dan karbohidrat olahan, obesitas, kurang olahraga, stres, riwayat keluarga diabetes.",
      redFlags:
        "Kadar gula darah >300 mg/dL, napas berbau buah, mual-muntah parah, penurunan kesadaran → SEGERA KE UGD.",
      categoryTag: "gangguan-metabolik",
    },
    {
      conditionName: "ISPA (Infeksi Saluran Pernapasan Atas)",
      commonSymptoms:
        '["hidung tersumbat","pilek","sakit tenggorokan","bersin-bersin","batuk ringan","demam ringan","nyeri kepala"]',
      earlySigns:
        "Tenggorokan mulai gatal atau kering, hidung mulai mampet sebelah, badan sedikit meriang di sore/malam hari.",
      commonCauses:
        "Virus (rhinovirus, coronavirus, influenza), paparan udara dingin, sistem imun menurun, kontak dengan penderita, kelelahan.",
      redFlags:
        "Sesak napas, demam >39°C lebih dari 3 hari, dahak berwarna kuning/hijau pekat, nyeri dada, bibir atau kuku membiru → Segera ke dokter.",
      categoryTag: "infeksi",
    },
    {
      conditionName: "Gastritis (Maag)",
      commonSymptoms:
        '["nyeri/perih ulu hati","mual","kembung","rasa penuh","sendawa berlebih","muntah","nafsu makan menurun"]',
      earlySigns:
        "Perut terasa tidak nyaman atau perih saat telat makan, mual di pagi hari, mudah kenyang meski makan sedikit.",
      commonCauses:
        "Infeksi H. pylori, konsumsi NSAID/aspirin jangka panjang, pola makan tidak teratur, stres, konsumsi alkohol dan kopi berlebih, merokok.",
      redFlags:
        "Muntah darah atau berwarna hitam, BAB berwarna hitam seperti aspal, nyeri perut sangat hebat tiba-tiba, penurunan berat badan drastis → SEGERA KE UGD.",
      categoryTag: "gangguan-pencernaan",
    },
  ];

  for (const condition of conditions) {
    await prisma.conditionReference.upsert({
      where: { conditionName: condition.conditionName },
      update: condition,
      create: condition,
    });
  }
  console.log(`   ✅ ${conditions.length} ConditionReference berhasil disemai.\n`);

  // ══════════════════════════════════════════════════════════════
  // 2. HabitGuide — Panduan Kebiasaan Sehat
  // ══════════════════════════════════════════════════════════════
  console.log("🥗 Menyemai HabitGuide...");

  const habits = [
    {
      title: "Porsi Makan Seimbang dengan Metode Piring T",
      category: "nutrisi",
      targetSummary: "½ piring sayur/buah, ¼ karbohidrat kompleks, ¼ protein, setiap kali makan",
      guideDescription:
        "Metode Piring T (Tumpeng Gizi Seimbang) dari Kemenkes RI membantu memastikan setiap porsi makan mengandung semua zat gizi. " +
        "Isi ½ piring dengan sayuran berwarna-warni dan buah-buahan segar. " +
        "Isi ¼ piring dengan karbohidrat kompleks seperti nasi merah, ubi, atau roti gandum. " +
        "Isi ¼ sisanya dengan protein (ayam tanpa kulit, ikan, tahu, tempe, telur). " +
        "Tambahkan segelas susu rendah lemak atau produk olahan susu sebagai pelengkap. " +
        "Batasi gula tambahan < 4 sdm/hari, garam < 1 sdt/hari, dan lemak < 5 sdm/hari (prinsip GGL Kemenkes).",
    },
    {
      title: "Hidrasi Optimal: 8 Gelas Air per Hari",
      category: "hidrasi",
      targetSummary: "Minum 2 liter (8 gelas @250 ml) air putih setiap hari",
      guideDescription:
        "Air adalah komponen utama tubuh manusia (60–70%). Kekurangan cairan ringan pun dapat menyebabkan kelelahan, sulit konsentrasi, dan sakit kepala. " +
        "Tips praktis: (1) Minum 1 gelas saat bangun tidur sebelum aktivitas apapun. " +
        "(2) Bawa botol minum 500 ml dan isi ulang minimal 4× sehari. " +
        "(3) Minum 1 gelas sebelum setiap sesi makan utama. " +
        "(4) Pantau warna urine — kuning pucat = cukup, kuning pekat = kurang minum. " +
        "Kebutuhan air meningkat saat berolahraga, cuaca panas, demam, atau diare.",
    },
    {
      title: "Aktivitas Fisik Rutin 30 Menit per Hari",
      category: "olahraga",
      targetSummary: "150 menit aktivitas aerobik intensitas sedang per minggu (≈30 menit/hari, 5 hari)",
      guideDescription:
        "WHO merekomendasikan 150–300 menit aktivitas aerobik intensitas sedang per minggu untuk orang dewasa. " +
        "Pilihan aktivitas: jalan cepat, bersepeda, berenang, senam aerobik, atau menari. " +
        "Mulai perlahan: 10 menit × 3 sesi/hari jika 30 menit terasa berat. " +
        "Tambahkan latihan kekuatan otot (push-up, squat, angkat beban ringan) minimal 2×/minggu. " +
        "Kurangi waktu duduk berturut-turut > 2 jam — bangun dan bergerak setiap 30–60 menit. " +
        "Manfaat: menurunkan risiko penyakit jantung, diabetes, depresi, dan meningkatkan kualitas tidur.",
    },
    {
      title: "Tidur Berkualitas 7–9 Jam per Malam",
      category: "tidur",
      targetSummary: "Tidur 7–9 jam malam dengan jadwal konsisten (jam tidur dan bangun tetap)",
      guideDescription:
        "Tidur cukup dan berkualitas adalah fondasi kesehatan. Saat tidur, tubuh memperbaiki jaringan, mengonsolidasi memori, dan mengatur hormon. " +
        "Kiat tidur berkualitas: (1) Tetapkan jam tidur dan bangun yang sama setiap hari, termasuk akhir pekan. " +
        "(2) Hindari layar (HP, laptop, TV) minimal 1 jam sebelum tidur — cahaya biru menekan melatonin. " +
        "(3) Jaga kamar tetap gelap, sejuk (18–22°C), dan tenang. " +
        "(4) Hindari kafein setelah pukul 14.00 dan alkohol menjelang tidur. " +
        "(5) Lakukan rutinitas relaksasi: membaca, meditasi, atau stretching ringan. " +
        "Kurang tidur kronis meningkatkan risiko obesitas, diabetes, hipertensi, dan gangguan imun.",
    },
    {
      title: "Manajemen Stres dengan Teknik Mindfulness",
      category: "mindfulness",
      targetSummary: "Latihan pernapasan atau meditasi 10–15 menit setiap hari",
      guideDescription:
        "Stres kronis memicu peradangan, merusak imun, dan meningkatkan risiko penyakit kardiovaskular. " +
        "Teknik Pernapasan 4-7-8: tarik napas 4 detik → tahan 7 detik → hembuskan perlahan 8 detik. Ulangi 4 siklus. " +
        "Meditasi Mindfulness: duduk nyaman, fokus pada napas, amati pikiran tanpa menghakimi, cukup 10 menit/hari. " +
        "Journaling: tulis 3 hal yang disyukuri setiap malam — terbukti menurunkan kortisol dan meningkatkan mood. " +
        "Teknik grounding 5-4-3-2-1: identifikasi 5 hal yang dilihat, 4 yang dirasakan, 3 yang didengar, 2 yang dicium, 1 yang dikecap — efektif meredam kecemasan akut. " +
        "Jangan ragu mencari bantuan profesional (psikolog/psikiater) jika stres terasa tak tertangani.",
    },
  ];

  for (const habit of habits) {
    await prisma.habitGuide.upsert({
      where: { title: habit.title },
      update: habit,
      create: habit,
    });
  }
  console.log(`   ✅ ${habits.length} HabitGuide berhasil disemai.\n`);

  // ══════════════════════════════════════════════════════════════
  // 3. Article — Artikel Kesehatan Terpercaya
  // ══════════════════════════════════════════════════════════════
  console.log("📰 Menyemai Article...");

  const articles = [
    {
      title: "Mengenal Hipertensi: Gejala, Penyebab, dan Cara Mencegahnya",
      slug: "mengenal-hipertensi-gejala-penyebab-pencegahan",
      category: "penyakit",
      summary:
        "Hipertensi sering disebut 'silent killer' karena jarang menimbulkan gejala jelas. Kenali faktor risiko dan langkah pencegahannya.",
      content: `# Mengenal Hipertensi

Hipertensi atau tekanan darah tinggi adalah kondisi ketika tekanan darah sistolik ≥140 mmHg dan/atau diastolik ≥90 mmHg secara konsisten. WHO memperkirakan 1,28 miliar orang dewasa di dunia menderita hipertensi.

## Mengapa Berbahaya?
Tekanan darah tinggi yang tidak terkontrol merusak dinding arteri secara perlahan. Dalam jangka panjang, ini dapat menyebabkan:
- Serangan jantung dan stroke
- Gagal ginjal
- Kerusakan pembuluh darah mata (retinopati)
- Aneurisma

## Faktor Risiko
1. **Dapat dimodifikasi**: pola makan tinggi garam, obesitas, kurang olahraga, merokok, alkohol, stres.
2. **Tidak dapat dimodifikasi**: usia >45 tahun, jenis kelamin pria, riwayat keluarga.

## Pencegahan
- Batasi asupan natrium < 2.000 mg/hari (≈1 sdt garam)
- Olahraga aerobik 150 menit/minggu
- Jaga berat badan ideal (IMT 18,5–24,9)
- Berhenti merokok
- Pantau tekanan darah secara rutin

## Kapan ke Dokter?
Jika tekanan darah Anda ≥140/90 mmHg pada dua pengukuran terpisah, segera konsultasi ke dokter.`,
      sourceName: "Kementerian Kesehatan RI",
      sourceUrl: "https://p2ptm.kemkes.go.id/hipertensi",
      readMinutes: 5,
      relatedTopic: "hipertensi,tekanan darah,penyakit kardiovaskular,gaya hidup sehat",
    },
    {
      title: "Panduan Gizi Seimbang: Memahami Tumpeng Gizi Seimbang",
      slug: "panduan-gizi-seimbang-tumpeng-kemenkes",
      category: "nutrisi",
      summary:
        "Tumpeng Gizi Seimbang menggantikan 'empat sehat lima sempurna'. Pelajari prinsip GGL dan cara menerapkannya sehari-hari.",
      content: `# Panduan Gizi Seimbang

Sejak 2014, Kemenkes RI mengganti slogan 'Empat Sehat Lima Sempurna' dengan **Pedoman Gizi Seimbang (PGS)** yang lebih komprehensif. Visualisasinya berupa Tumpeng Gizi Seimbang.

## Prinsip Dasar
1. **Anekaragam pangan** — tidak ada satu pun makanan yang mengandung semua zat gizi yang dibutuhkan.
2. **Perilaku hidup bersih** — cuci tangan, masak makanan hingga matang.
3. **Aktivitas fisik** — minimal 30 menit/hari.
4. **Pantau berat badan** — IMT ideal 18,5–24,9.

## Prinsip GGL (Gula, Garam, Lemak)
Kemenkes menetapkan batas konsumsi harian:
| Zat | Batas/Hari |
|-----|-----------|
| Gula | 4 sdm (50 g) |
| Garam | 1 sdt (2.000 mg natrium) |
| Lemak | 5 sdm (67 g) |

## Komposisi Piring Makan
- **½ piring**: sayur dan buah berwarna beragam
- **¼ piring**: karbohidrat kompleks (nasi merah, ubi, singkong)
- **¼ piring**: protein (ikan, ayam tanpa kulit, tahu, tempe)
- Minum air putih, bukan minuman manis

## Kelompok Khusus
Ibu hamil, lansia, anak-anak, dan penderita penyakit tertentu memerlukan penyesuaian. Konsultasikan dengan ahli gizi.`,
      sourceName: "Kementerian Kesehatan RI — Pedoman Gizi Seimbang",
      sourceUrl: "https://gizi.kemkes.go.id/pedoman-gizi-seimbang",
      readMinutes: 6,
      relatedTopic: "gizi seimbang,nutrisi,pola makan,tumpeng gizi",
    },
    {
      title: "Diabetes Tipe 2: Kenali Sejak Dini, Cegah Komplikasi",
      slug: "diabetes-tipe-2-kenali-cegah-komplikasi",
      category: "penyakit",
      summary:
        "Diabetes tipe 2 berkembang perlahan dan sering tidak disadari. Deteksi dini dan perubahan gaya hidup dapat mencegah komplikasi serius.",
      content: `# Diabetes Mellitus Tipe 2

Diabetes tipe 2 adalah kondisi kronik di mana tubuh tidak dapat menggunakan insulin secara efektif (resistensi insulin). Indonesia termasuk 10 besar negara dengan penderita diabetes terbanyak di dunia (IDF, 2021).

## Gejala Klasik (3P)
- **Poliuria** — sering buang air kecil, termasuk malam hari
- **Polidipsia** — rasa haus berlebihan
- **Polifagia** — cepat lapar meski sudah makan

## Gejala Lain yang Sering Diabaikan
- Luka atau memar lambat sembuh
- Kesemutan atau mati rasa di kaki/tangan
- Penglihatan kabur
- Infeksi berulang (terutama infeksi jamur)

## Faktor Risiko
1. Kelebihan berat badan / obesitas
2. Riwayat keluarga diabetes
3. Usia > 45 tahun
4. Gaya hidup sedentari
5. Riwayat diabetes gestasional

## Pencegahan dengan Modifikasi Gaya Hidup
- Turunkan berat badan 5–7% jika kelebihan berat badan
- Olahraga aerobik 150 menit/minggu + latihan resistansi 2×/minggu
- Pola makan rendah indeks glikemik
- Kurangi konsumsi minuman manis dan makanan ultra-proses

## Pemeriksaan Rutin
Lakukan cek gula darah puasa minimal 1 tahun sekali jika memiliki faktor risiko.`,
      sourceName: "International Diabetes Federation (IDF) & Kemenkes RI",
      sourceUrl: "https://p2ptm.kemkes.go.id/diabetes-melitus",
      readMinutes: 7,
      relatedTopic: "diabetes,gula darah,insulin,penyakit kronis,gaya hidup",
    },
    {
      title: "Manfaat Olahraga Rutin bagi Kesehatan Fisik dan Mental",
      slug: "manfaat-olahraga-rutin-fisik-mental",
      category: "gaya-hidup",
      summary:
        "Olahraga 30 menit sehari tidak hanya menyehatkan jantung, tetapi juga terbukti mengurangi kecemasan dan depresi secara signifikan.",
      content: `# Manfaat Olahraga Rutin

Olahraga teratur adalah salah satu intervensi kesehatan dengan bukti paling kuat. WHO merekomendasikan minimal 150 menit aktivitas aerobik intensitas sedang per minggu untuk orang dewasa.

## Manfaat Fisik
- **Kardiovaskular**: menurunkan tekanan darah, memperkuat jantung, meningkatkan kadar HDL.
- **Metabolik**: meningkatkan sensitivitas insulin, membantu kontrol berat badan.
- **Muskuloskeletal**: memperkuat tulang (mencegah osteoporosis), meningkatkan fleksibilitas.
- **Imunitas**: aktivitas fisik moderat meningkatkan fungsi sel imun.

## Manfaat Mental
- Melepaskan endorfin, dopamin, dan serotonin — 'hormon bahagia'.
- Studi meta-analisis menunjukkan olahraga sama efektifnya dengan antidepresan untuk depresi ringan-sedang.
- Mengurangi kadar kortisol (hormon stres).
- Meningkatkan kualitas tidur.

## Rekomendasi WHO untuk Orang Dewasa
| Jenis | Durasi/Minggu |
|-------|--------------|
| Aerobik intensitas sedang | 150–300 menit |
| Aerobik intensitas tinggi | 75–150 menit |
| Latihan kekuatan | ≥2 sesi |

## Tips Memulai
1. Mulai dari 10 menit, 3× sehari — lebih mudah dipertahankan.
2. Pilih aktivitas yang menyenangkan: menari, bersepeda, berenang.
3. Ajak teman atau keluarga — faktor sosial meningkatkan konsistensi.
4. Gunakan tangga, jalan kaki ke warung — setiap gerakan berarti.`,
      sourceName: "World Health Organization (WHO) Physical Activity Guidelines",
      sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
      readMinutes: 5,
      relatedTopic: "olahraga,aktivitas fisik,kesehatan mental,gaya hidup sehat",
    },
    {
      title: "Tidur Berkualitas: Kunci Pemulihan dan Kesehatan Optimal",
      slug: "tidur-berkualitas-kunci-pemulihan-kesehatan",
      category: "gaya-hidup",
      summary:
        "Kurang tidur kronis meningkatkan risiko diabetes, hipertensi, dan gangguan imun. Pelajari kiat tidur berkualitas berbasis bukti ilmiah.",
      content: `# Tidur Berkualitas

Tidur bukan sekadar istirahat — ini adalah proses aktif di mana otak dan tubuh melakukan perbaikan kritis. National Sleep Foundation merekomendasikan 7–9 jam tidur per malam untuk orang dewasa.

## Apa yang Terjadi Saat Tidur?
- **NREM Fase 3 (Deep Sleep)**: pertumbuhan jaringan, perbaikan sel, penguatan imun.
- **REM Sleep**: konsolidasi memori, regulasi emosi, kreativitas.
- Otak membersihkan limbah metabolik (sistem glimfatik) — termasuk protein terkait Alzheimer.

## Dampak Kurang Tidur
- Kurang tidur 1–2 jam/malam secara kronis meningkatkan risiko kecelakaan, obesitas, diabetes tipe 2, dan penyakit jantung.
- Mempengaruhi pengambilan keputusan dan kontrol emosi.
- Melemahkan respons vaksin dan imunitas.

## Kiat Tidur Berkualitas (Sleep Hygiene)
1. **Jadwal konsisten**: tidur dan bangun di jam yang sama setiap hari.
2. **Paparan cahaya alami**: terpapar sinar matahari pagi membantu reset jam biologis.
3. **Hindari kafein setelah pk. 14.00**.
4. **Screen-free 1 jam sebelum tidur**: cahaya biru menghambat produksi melatonin.
5. **Lingkungan tidur**: gelap, sejuk (18–22°C), tenang.
6. **Hindari makan berat < 2 jam sebelum tidur**.

## Kapan Konsultasi?
Jika Anda mendengkur keras, sering terbangun gasping, atau tetap mengantuk setelah 8 jam tidur → kemungkinan sleep apnea, perlu evaluasi dokter.`,
      sourceName: "National Sleep Foundation & Mayo Clinic",
      sourceUrl: "https://www.sleepfoundation.org/how-sleep-works",
      readMinutes: 6,
      relatedTopic: "tidur,sleep hygiene,kesehatan otak,pemulihan",
    },
    {
      title: "Cara Membaca Label Nutrisi pada Kemasan Makanan",
      slug: "cara-membaca-label-nutrisi-kemasan-makanan",
      category: "nutrisi",
      summary:
        "Label nutrisi pada kemasan makanan menyimpan informasi penting. Pelajari cara membacanya agar bisa membuat pilihan makan yang lebih cerdas.",
      content: `# Cara Membaca Label Nutrisi

Sejak 2016, BPOM RI mewajibkan pencantuman informasi nilai gizi (ING) pada kemasan produk pangan olahan. Memahami label ini membantu Anda membuat pilihan yang lebih sehat.

## Komponen Utama Label Nutrisi
### 1. Takaran Saji & Jumlah Sajian
Ini adalah acuan semua angka nutrisi. Jika satu kemasan berisi 2 sajian, semua nilai perlu dikali 2 jika Anda mengonsumsi seluruhnya.

### 2. Energi (Kalori)
- Kebutuhan rata-rata dewasa: 2.000 kkal/hari (bervariasi).
- Acuan label berdasarkan 2.150 kkal (standar BPOM).

### 3. Lemak Total & Lemak Jenuh
- Batasi lemak jenuh < 10% total energi.
- Hindari lemak trans (tercantum sebagai "partially hydrogenated oils").

### 4. Natrium
- Batas harian: 2.000 mg (setara ~1 sdt garam).
- Produk "rendah natrium" < 140 mg per sajian.

### 5. Karbohidrat & Gula
- Perhatikan **gula tambahan** — berbeda dengan gula alami dari buah/susu.
- Batas gula tambahan: 50 g/hari (Kemenkes RI).

### 6. Serat
- Target: ≥25 g/hari. Produk "sumber serat baik" ≥3 g per sajian.

### 7. Protein
- Kebutuhan umum: 0,8–1 g per kg berat badan/hari.

## Tips Praktis
- Bandingkan produk berdasarkan nilai per 100 g — lebih adil dibanding per sajian.
- Urutan bahan baku menggambarkan jumlah — bahan pertama paling dominan.
- Hindari produk dengan gula sebagai bahan pertama atau kedua.`,
      sourceName: "Badan Pengawas Obat dan Makanan (BPOM) RI",
      sourceUrl: "https://www.pom.go.id/label-pangan",
      readMinutes: 8,
      relatedTopic: "label nutrisi,gizi,pangan olahan,BPOM,konsumsi cerdas",
    },
  ];

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: article,
      create: article,
    });
  }
  console.log(`   ✅ ${articles.length} Article berhasil disemai.\n`);

  // ══════════════════════════════════════════════════════════════
  // 4. Demo User & Initial Dashboard Data (Untuk Pengujian Juri)
  // ══════════════════════════════════════════════════════════════
  console.log("👤 Menyemai Akun Demo untuk Pengujian...");

  const demoEmail = "demo@takarsehat.id";
  const demoPasswordHash = await bcrypt.hash("Password123!", 10);

  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      name: "Budi Sehat (Akun Demo)",
      passwordHash: demoPasswordHash,
    },
    create: {
      name: "Budi Sehat (Akun Demo)",
      email: demoEmail,
      passwordHash: demoPasswordHash,
    },
  });

  // Obat demo
  const med1 = await prisma.medication.findFirst({
    where: { userId: demoUser.id, medicineName: "Amlodipine 5mg" },
  });
  const med1Record = med1
    ? med1
    : await prisma.medication.create({
        data: {
          userId: demoUser.id,
          medicineName: "Amlodipine 5mg",
          dosageNote: "1 tablet di pagi hari sesudah sarapan",
          scheduleTime: "07:00",
          isActive: true,
        },
      });

  const med2 = await prisma.medication.findFirst({
    where: { userId: demoUser.id, medicineName: "Metformin 500mg" },
  });
  const med2Record = med2
    ? med2
    : await prisma.medication.create({
        data: {
          userId: demoUser.id,
          medicineName: "Metformin 500mg",
          dosageNote: "1 tablet bersama makan malam",
          scheduleTime: "19:00",
          isActive: true,
        },
      });

  // Log minum obat hari ini (Normalized date)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingLog1 = await prisma.medicationLog.findFirst({
    where: { medicationId: med1Record.id, userId: demoUser.id, logDate: today },
  });
  if (!existingLog1) {
    const takenTime = new Date();
    takenTime.setHours(7, 15, 0, 0);
    await prisma.medicationLog.create({
      data: {
        medicationId: med1Record.id,
        userId: demoUser.id,
        logDate: today,
        status: "taken",
        takenAt: takenTime,
      },
    });
  }

  const existingLog2 = await prisma.medicationLog.findFirst({
    where: { medicationId: med2Record.id, userId: demoUser.id, logDate: today },
  });
  if (!existingLog2) {
    await prisma.medicationLog.create({
      data: {
        medicationId: med2Record.id,
        userId: demoUser.id,
        logDate: today,
        status: "pending",
        takenAt: null,
      },
    });
  }

  // Riwayat Catatan Gejala Terakhir
  const hipertensiCondition = await prisma.conditionReference.findUnique({
    where: { conditionName: "Hipertensi (Tekanan Darah Tinggi)" },
  });

  const existingSymptom = await prisma.symptomLog.findFirst({
    where: { userId: demoUser.id },
  });
  if (!existingSymptom) {
    await prisma.symptomLog.create({
      data: {
        userId: demoUser.id,
        selectedSymptoms: JSON.stringify(["Sakit kepala belakang", "Pusing ringan", "Leher kaku"]),
        severity: 4,
        triggerNote: "Bekerja di depan laptop seharian dan kurang tidur semalam",
        matchedConditionId: hipertensiCondition ? hipertensiCondition.id : null,
      },
    });
  }

  // Log Takar Pola Hidup Hari Ini
  const habitList = await prisma.habitGuide.findMany();
  for (let i = 0; i < habitList.length; i++) {
    const habit = habitList[i];
    const existingHabitLog = await prisma.dailyHabitLog.findFirst({
      where: {
        userId: demoUser.id,
        habitGuideId: habit.id,
        logDate: today,
      },
    });

    if (!existingHabitLog) {
      // Buat beberapa sudah selesai (misal 3 pertama selesai, 2 belum)
      const isCompleted = i < 3;
      await prisma.dailyHabitLog.create({
        data: {
          userId: demoUser.id,
          habitGuideId: habit.id,
          logDate: today,
          isCompleted,
          portionOrHabitNote: isCompleted ? "Telah dijalankan dengan baik hari ini" : null,
        },
      });
    }
  }

  console.log(`   ✅ Akun Demo berhasil disemai (Email: ${demoEmail} | Password: Password123!)\n`);

  console.log("🎉 Seeding selesai! Database TakarSehat siap digunakan.");
}

// ─── Jalankan & tangani error ──────────────────────────────────────────────
main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
