import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import type { Session } from "next-auth";
import { IncomingForm } from "formidable";
import type { Fields, Files, File } from "formidable";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session;
    const user = session?.user as { id: string };
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads/profile-pictures");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Parse multipart form
    const filter = ({ mimetype }: { mimetype?: string | null }) =>
      mimetype === "image/png" || mimetype === "image/jpeg" || mimetype === "image/heic" || mimetype === "image/heif";
    
    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filter,
    });

    // formidable doesn't work natively with Next.js API routes, so we need to wrap it
    const buffer = await request.arrayBuffer();
    const req = new Readable();
    req.push(Buffer.from(buffer));
    req.push(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).headers = Object.fromEntries(request.headers.entries());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).method = request.method;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).url = request.url;

    const parseForm = () =>
      new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form.parse(req as any, (err: any, fields: Fields, files: Files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });

    const { files } = await parseForm();
    let file = files.file as File | File[] | undefined;
    if (Array.isArray(file)) file = file[0];
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Only allow PNG, JPG, or HEIC/HEIF
    if (
      file.mimetype !== "image/png" &&
      file.mimetype !== "image/jpeg" &&
      file.mimetype !== "image/heic" &&
      file.mimetype !== "image/heif"
    ) {
      fs.unlinkSync(file.filepath);
      return NextResponse.json({ error: "Only PNG, JPG, or HEIC/HEIF allowed" }, { status: 400 });
    }

    // Return the file path relative to /public
    const relPath = `/uploads/profile-pictures/${path.basename(file.filepath)}`;
    return NextResponse.json({ filePath: relPath });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
} 