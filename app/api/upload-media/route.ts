import { mkdir, writeFile } from "fs/promises"
import { extname, join } from "path"
import { NextResponse } from "next/server"
import {
  checkUserAccessAction,
  createAdminNotificationAction,
  updateCourseThumbnailAction,
  updateLessonMediaAction,
} from "@/lib/actions"
import { assertSufficientStorage, StorageGuardError } from "@/lib/storage-guard"

function safeExt(name: string) {
  return extname(name).toLowerCase().replace(/[^a-z0-9.]/g, "") || ".bin"
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const kind = formData.get("kind") as "thumbnail" | "resource"
    const courseId = formData.get("courseId") as string
    const lessonId = formData.get("lessonId") as string | null
    const actorPhone = formData.get("actorPhone") as string

    if (!file || !kind || !courseId || !actorPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const accessCheck = await checkUserAccessAction({ phone: actorPhone })
    const role = accessCheck.data?.role
    if (!accessCheck.data?.hasAccess || (role !== "admin" && role !== "tutor")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (kind === "resource" && !lessonId) {
      return NextResponse.json({ error: "Resource uploads require lessonId" }, { status: 400 })
    }

    await assertSufficientStorage(file.size)

    const folder = kind === "thumbnail"
      ? join(process.cwd(), "public", "uploads", "courses", courseId)
      : join(process.cwd(), "public", "uploads", "courses", courseId, "lessons", lessonId || "unknown")
    await mkdir(folder, { recursive: true })

    const filename = `${kind}-${Date.now()}${safeExt(file.name)}`
    const filepath = join(folder, filename)
    const bytes = await file.arrayBuffer()
    await writeFile(filepath, Buffer.from(bytes))

    const url = kind === "thumbnail"
      ? `/uploads/courses/${courseId}/${filename}`
      : `/uploads/courses/${courseId}/lessons/${lessonId}/${filename}`

    if (kind === "thumbnail") {
      await updateCourseThumbnailAction(courseId, url, { phone: actorPhone, role })
    } else if (lessonId) {
      await updateLessonMediaAction(lessonId, { resourceUrl: url })
    }

    return NextResponse.json({ success: true, url })
  } catch (error: unknown) {
    if (error instanceof StorageGuardError) {
      await createAdminNotificationAction({
        type: "storage_low",
        message: error.message,
        metadata: { source: "media-upload" },
      })
      return NextResponse.json({ error: error.message }, { status: 507 })
    }

    console.error("Media Upload Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
