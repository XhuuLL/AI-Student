import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongoose";
import { requireUser } from "@/lib/auth/requireUser";
import { asObjectId } from "@/utils/objectId";
import { MaterialModel } from "@/models/Material";
import PDFDocument from "pdfkit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
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

  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => {
    chunks.push(chunk as Buffer);
  });

  const finished = new Promise<Buffer>((resolve) => {
    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
  });

  doc.fontSize(18).text(material.title, { underline: true });
  doc.moveDown();

  if (material.summary) {
    doc.fontSize(14).text("Ringkasan", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(material.summary, { align: "justify" });
    doc.moveDown();
  }

  if (material.keyPoints?.length) {
    doc.fontSize(14).text("Poin Penting", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    material.keyPoints.forEach((kp: string) => {
      doc.text(`• ${kp}`);
    });
  }

  doc.end();
  const buffer = await finished;
  const body = new Uint8Array(buffer);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(
        `${material.title || "materi"}.pdf`
      )}"`,
    },
  });
}

