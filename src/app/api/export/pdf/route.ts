import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongoose";
import { requireUser } from "@/lib/auth/requireUser";
import { asObjectId } from "@/utils/objectId";
import { MaterialModel } from "@/models/Material";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await connectToDb();

    const sessionOrResp = requireUser();
    if (!("userId" in sessionOrResp)) return sessionOrResp;
    const { userId } = sessionOrResp;

    const url = new URL(req.url);
    const materialId = url.searchParams.get("materialId");
    if (!materialId) {
      return NextResponse.json({ error: "materialId diperlukan" }, { status: 400 });
    }

    const material = await MaterialModel.findOne({
      _id: materialId,
      userId: asObjectId(userId) ?? userId,
    });

    if (!material) {
      return NextResponse.json({ error: "Materi tidak ditemukan" }, { status: 404 });
    }

    const fontPath = path.join(process.cwd(), "public/fonts/Inter-Regular.ttf");
    if (!fs.existsSync(fontPath)) {
      return NextResponse.json({ 
        error: "Font tidak ditemukan di public/fonts/Inter-Regular.ttf" 
      }, { status: 500 });
    }

    // Konfigurasi Kertas A4
    const doc = new PDFDocument({ 
      margin: 50, 
      size: 'A4',
      info: {
        Title: material.title || "Ringkasan Materi",
        Author: "AI Study Assistant",
      }
    });
    
    doc.font(fontPath);

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    const finished = new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    // --- DESAIN MULAI DI SINI ---
    const safeTitle = material.title || "Materi Tanpa Judul";
    const emeraldColor = "#10b981";
    const darkText = "#1f2937";
    const lightText = "#6b7280";

    // 1. Header Aplikasi (Kanan Atas)
    doc.fillColor(emeraldColor).fontSize(16).text("AI Study Assistant", { align: "right" });
    doc.fillColor(lightText).fontSize(9).text("Ringkasan & Poin Penting", { align: "right" });
    doc.moveDown(2);

    // 2. Judul Materi (Kiri)
    // Garis aksen hijau
    doc.rect(50, doc.y, 495, 3).fill(emeraldColor);
    doc.moveDown(1);
    
    doc.fillColor(darkText).fontSize(20).text(safeTitle.toUpperCase(), { align: "left" });
    doc.moveDown(0.2);
    doc.fillColor(lightText).fontSize(10).text(`Diunduh pada: ${new Date().toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })}`);
    doc.moveDown(2);

    // 3. Bagian Ringkasan
    if (material.summary) {
      // Kotak Header Ringkasan
      const startY = doc.y;
      doc.rect(50, startY, 495, 24).fill("#f3f4f6");
      doc.fillColor(emeraldColor).fontSize(12).text("RINGKASAN MATERI", 60, startY + 7);
      
      // Isi Ringkasan
      doc.x = 50;
      doc.y = startY + 35;
      doc.fillColor(darkText).fontSize(11).text(material.summary, { 
        align: "justify", 
        lineGap: 5 
      });
      doc.moveDown(2);
    }

    // 4. Bagian Poin Penting
    if (material.keyPoints?.length) {
      // Cek apakah sisa halaman cukup, jika tidak pindah halaman
      if (doc.y > 700) doc.addPage();

      const startY = doc.y;
      doc.rect(50, startY, 495, 24).fill("#f3f4f6");
      doc.fillColor(emeraldColor).fontSize(12).text("POIN KUNCI", 60, startY + 7);
      
      // Isi Poin (Custom Bullet)
      doc.x = 50;
      doc.y = startY + 35;
      
      material.keyPoints.forEach((kp: string) => {
        // Cek halaman sebelum menggambar bullet agar tidak terpotong
        if (doc.y > 750) doc.addPage();
        
        const currentY = doc.y;
        // Gambar titik bulat (bullet)
        doc.circle(60, currentY + 6, 3).fill(emeraldColor);
        // Teks poin
        doc.fillColor(darkText).fontSize(11).text(kp, 75, currentY, { 
          align: "justify", 
          lineGap: 4 
        });
        doc.moveDown(0.5);
      });
    }

    // 5. Footer (Absolute Position di Bawah Halaman Terakhir)
    const bottomMargin = doc.page.height - 50;
    doc.rect(50, bottomMargin - 15, 495, 1).fill("#e5e7eb"); // Garis tipis
    doc.fillColor(lightText).fontSize(8).text(
      "Dokumen ini di-generate secara otomatis oleh AI Study Assistant - Universitas Muhadi Setiabudi", 
      50, 
      bottomMargin - 5, 
      { align: "center" }
    );

    doc.end();
    
    const buffer = await finished;
    const body = new Uint8Array(buffer);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(safeTitle)}.pdf"`,
        "Content-Length": body.byteLength.toString(),
      },
    });

  } catch (err: any) {
    console.error("PDF Export Error:", err);
    return NextResponse.json({ error: "Gagal membuat PDF: " + err.message }, { status: 500 });
  }
}