import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { PDFParse } from "pdf-parse";
import { connectToDb } from "@/lib/mongoose";
import { MaterialModel } from "@/models/Material";
import { requireUser } from "@/lib/auth/requireUser";
import { sanitizeFilename, sanitizeTitle } from "@/utils/sanitize";
import { asObjectId } from "@/utils/objectId";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  await connectToDb();

  const sessionOrResp = requireUser();
  if (!("userId" in sessionOrResp)) return sessionOrResp;
  const { userId } = sessionOrResp;

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as unknown as File | null;
  const titleRaw = formData.get("title");

  if (!file || typeof file.arrayBuffer !== "function") {
    return NextResponse.json({ error: "File wajib diupload" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Ukuran file maksimal 5MB" },
      { status: 413 }
    );
  }

  const originalName = file.name ? String(file.name) : "upload.pdf";
  const safeName = sanitizeFilename(originalName);
  const ext = safeName.toLowerCase().includes(".") ? safeName.split(".").pop() : "";

  const title = sanitizeTitle(
    typeof titleRaw === "string" && titleRaw.trim()
      ? titleRaw
      : originalName.replace(/\.[^/.]+$/, "")
  );

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  const destPath = path.join(uploadDir, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(destPath, buffer);

  let content = "";
  const mime = file.type ? String(file.type) : "";

  try {
    if (ext === "pdf" || mime.includes("pdf")) {
      const parser = new PDFParse({ data: buffer });
      const parsed = await parser.getText();
      content = parsed.text ?? "";
    } else if (ext === "txt" || mime.includes("text")) {
      content = buffer.toString("utf8");
    } else {
      return NextResponse.json(
        { error: "Hanya mendukung PDF atau TXT" },
        { status: 415 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Gagal mengekstrak konten dari file" },
      { status: 400 }
    );
  }

  if (!content || content.trim().length < 20) {
    return NextResponse.json(
      { error: "Konten terlalu sedikit atau tidak terbaca" },
      { status: 400 }
    );
  }

  const material = await MaterialModel.create({
    userId: asObjectId(userId) ?? userId,
    title,
    fileUrl: `/uploads/${safeName}`,
    content,
    summary: "",
    keyPoints: [],
  });

  return NextResponse.json(
    {
      material: {
        id: material._id,
        title: material.title,
        fileUrl: material.fileUrl,
        createdAt: material.createdAt,
      },
    },
    { status: 201 }
  );
}

