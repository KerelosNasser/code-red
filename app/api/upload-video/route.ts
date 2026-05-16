import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { videoQueue } from "@/lib/queue/video-queue";
import { checkUserAccessAction } from "@/lib/actions";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("videoFile") as File;
    const lessonId = formData.get("lessonId") as string;
    const adminPhone = formData.get("adminPhone") as string;

    if (!file || !lessonId || !adminPhone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Security Check: Verify admin status
    const accessCheck = await checkUserAccessAction({ phone: adminPhone });
    if (!accessCheck.data?.hasAccess || accessCheck.data?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to temp directory
    const tempDir = join(process.cwd(), "public/videos/tmp");
    await mkdir(tempDir, { recursive: true });
    
    // We append timestamp to avoid collisions
    const inputFileName = `${lessonId}-${Date.now()}-${file.name}`;
    const inputPath = join(tempDir, inputFileName);
    
    await writeFile(inputPath, buffer);

    // Destination directory for HLS
    const outputDir = join(process.cwd(), "public/videos/hls", lessonId);

    // Add to BullMQ processing queue
    await videoQueue.add("process-video", {
      lessonId,
      inputPath,
      outputDir,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Video uploaded and processing started." 
    });
  } catch (error: unknown) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
