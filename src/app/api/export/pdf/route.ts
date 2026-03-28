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

    // --- LOGIKA FONT KRUSIAL ---
    // Pastikan kamu SUDAH mendownload file .ttf dan menaruhnya di folder ini
    const fontPath = path.join(process.cwd(), "public/fonts/Inter-Regular.ttf");
    
    // Jika font tidak ditemukan, kita lempar error yang jelas agar kamu tahu solusinya
    if (!fs.existsSync(fontPath)) {
      return NextResponse.json({ 
        error: "Font tidak ditemukan di public/fonts/Inter-Regular.ttf. Silakan download font .ttf dan masukkan ke folder tersebut." 
      }, { status: 500 });
    }

    const doc = new PDFDocument({ margin: 50 });
    
    // WAJIB panggil ini SEBELUM menulis teks apapun
    doc.font(fontPath);

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    const finished = new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    // Gunakan judul default jika title kosong untuk menghindari error toUpperCase()
    const safeTitle = material.title || "Materi Tanpa Judul";

    // Isi PDF
    doc.fontSize(20).text(safeTitle.toUpperCase(), { align: "center" });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); 
    doc.moveDown();

    if (material.summary) {
      doc.fontSize(14).fillColor("#059669").text("RINGKASAN", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor("#000000").text(material.summary, { align: "justify", lineGap: 3 });
      doc.moveDown();
    }

    if (material.keyPoints?.length) {
      doc.fontSize(14).fillColor("#059669").text("POIN PENTING", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor("#000000");
      material.keyPoints.forEach((kp: string) => {
        doc.text(`• ${kp}`, { indent: 15, lineGap: 2 });
      });
    }

    doc.end();
    
    // 1. Ambil data Buffer dari Promise
    const buffer = await finished;

    // 2. KONVERSI PENTING: Ubah Buffer (Node.js) menjadi Uint8Array (Web Standard)
    // Ini yang akan menghilangkan error garis merah di VS Code kamu.
    const body = new Uint8Array(buffer);

    // 3. Kirim respon menggunakan Uint8Array
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(safeTitle)}.pdf"`,
        "Content-Length": body.byteLength.toString(), // Gunakan byteLength dari Uint8Array
      },
    });

  } catch (err: any) {
    console.error("PDF Export Error:", err);
    return NextResponse.json({ error: "Gagal membuat PDF: " + err.message }, { status: 500 });
  }
}