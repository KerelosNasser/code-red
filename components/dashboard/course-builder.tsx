"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useFieldArray, useForm, type UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Loader2,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  Video,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getCourseForEditAction,
  publishCourseAction,
  saveCourseDraftAction,
  type CourseActor,
} from "@/lib/actions"
import { getStoredAccess } from "@/lib/access-storage"
import { cn } from "@/lib/utils"

const lessonSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Lesson title is required"),
  description: z.string().optional(),
  videoUrl: z.string().nullable().optional(),
  resourceUrl: z.string().nullable().optional(),
})

const sectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Section title is required"),
  lessons: z.array(lessonSchema).min(1, "Add at least one lesson"),
})

const courseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Course title is required"),
  description: z.string().min(1, "Description is required"),
  level: z.string().min(1, "Level is required"),
  thumbnail: z.string().nullable().optional(),
  sections: z.array(sectionSchema).min(1, "Add at least one section"),
})

type CourseFormValues = z.infer<typeof courseSchema>
type FileMap = Record<string, File | undefined>

function emptyCourse(): CourseFormValues {
  return {
    title: "",
    description: "",
    level: "Intermediate",
    thumbnail: null,
    sections: [{ title: "", lessons: [{ title: "", description: "" }] }],
  }
}

function actorFromStorage(): CourseActor | null {
  const access = getStoredAccess()
  if (!access || (access.role !== "admin" && access.role !== "tutor")) return null
  return { phone: access.phone, role: access.role }
}

function toFormValues(course: any): CourseFormValues {
  return {
    id: course.id,
    title: course.title || "",
    description: course.description || "",
    level: course.level || "Intermediate",
    thumbnail: course.thumbnail || null,
    sections: (course.sections || []).map((section: any) => ({
      id: section.id,
      title: section.title || "",
      lessons: (section.lessons || []).map((lesson: any) => ({
        id: lesson.id,
        title: lesson.title || "",
        description: lesson.description || "",
        videoUrl: lesson.videoUrl || lesson.url || null,
        resourceUrl: lesson.resourceUrl || lesson.resource_url || null,
      })),
    })),
  }
}

export default function CourseBuilder() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get("id")
  const [actor, setActor] = useState<CourseActor | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(courseId))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | undefined>()
  const [videoFiles, setVideoFiles] = useState<FileMap>({})
  const [resourceFiles, setResourceFiles] = useState<FileMap>({})

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: emptyCourse(),
  })

  const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({
    control: form.control,
    name: "sections",
  })

  useEffect(() => {
    const nextActor = actorFromStorage()
    if (!nextActor) {
      router.push("/register")
      return
    }
    setActor(nextActor)

    if (!courseId) {
      setIsLoading(false)
      return
    }

    const load = async () => {
      const result = await getCourseForEditAction(courseId, nextActor)
      if (!result.success || !result.data) {
        toast.error(result.error || "Course not found")
        router.push("/dashboard/courses")
        return
      }
      form.reset(toFormValues(result.data))
      setIsLoading(false)
    }

    void load()
  }, [courseId, form, router])

  const lessonCount = useMemo(
    () => form.watch("sections").reduce((sum, section) => sum + section.lessons.length, 0),
    [form]
  )

  async function uploadMedia(params: {
    file: File
    kind: "thumbnail" | "resource"
    courseId: string
    lessonId?: string
  }) {
    if (!actor) return
    const body = new FormData()
    body.set("file", params.file)
    body.set("kind", params.kind)
    body.set("courseId", params.courseId)
    body.set("actorPhone", actor.phone)
    if (params.lessonId) body.set("lessonId", params.lessonId)

    const response = await fetch("/api/upload-media", { method: "POST", body })
    const json = await response.json()
    if (!response.ok) throw new Error(json.error || "Media upload failed")
    return json.url as string
  }

  async function uploadVideo(file: File, lessonId: string) {
    if (!actor) return
    const body = new FormData()
    body.set("videoFile", file)
    body.set("lessonId", lessonId)
    body.set("actorPhone", actor.phone)

    const response = await fetch("/api/upload-video", { method: "POST", body })
    const json = await response.json()
    if (!response.ok) throw new Error(json.error || "Video upload failed")
  }

  async function saveCourse(publish: boolean) {
    if (!actor) return
    const valid = await form.trigger()
    if (!valid) return

    setIsSubmitting(true)
    try {
      const values = form.getValues()
      const saved = await saveCourseDraftAction(values, actor)
      if (!saved.success || !saved.data) {
        throw new Error(saved.error || "Could not save course")
      }

      const savedCourse = saved.data as any
      if (thumbnailFile) {
        await uploadMedia({ file: thumbnailFile, kind: "thumbnail", courseId: savedCourse.id })
      }

      for (const [sectionIndex, section] of savedCourse.sections.entries()) {
        for (const [lessonIndex, lesson] of section.lessons.entries()) {
          const key = `${sectionIndex}-${lessonIndex}`
          const resourceFile = resourceFiles[key]
          const videoFile = videoFiles[key]
          if (resourceFile) {
            await uploadMedia({
              file: resourceFile,
              kind: "resource",
              courseId: savedCourse.id,
              lessonId: lesson.id,
            })
          }
          if (videoFile) {
            await uploadVideo(videoFile, lesson.id)
          }
        }
      }

      if (publish) {
        const published = await publishCourseAction(savedCourse.id, actor)
        if (!published.success) throw new Error(published.error || "Could not publish course")
      }

      toast.success(publish ? "Course published" : "Draft saved")
      router.push("/dashboard/courses")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Course save failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border bg-white p-12">
        <Loader2 className="h-6 w-6 animate-spin text-blue-900" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col gap-3 rounded-lg border bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {courseId ? "Edit course" : "New course"}
          </h3>
          <p className="text-sm text-slate-500">
            {sectionFields.length} sections, {lessonCount} lessons
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => saveCourse(false)} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save draft
          </Button>
          <Button onClick={() => saveCourse(true)} disabled={isSubmitting}>
            <CheckCircle2 className="h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="h-fit rounded-lg border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500">Curriculum</h4>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => appendSection({ title: "", lessons: [{ title: "", description: "" }] })}
            >
              <Plus className="h-4 w-4" />
              Section
            </Button>
          </div>
          <div className="space-y-2">
            {sectionFields.map((section, index) => (
              <div key={section.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <BookOpen className="h-4 w-4 text-blue-900" />
                  Section {index + 1}
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {form.watch(`sections.${index}.title`) || "Untitled section"}
                </p>
              </div>
            ))}
          </div>
        </aside>

        <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
          <section className="rounded-lg border bg-white p-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...form.register("title")} placeholder="Robotics foundations" />
                <FieldError message={form.formState.errors.title?.message} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  {...form.register("description")}
                  className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder="What students will learn"
                />
                <FieldError message={form.formState.errors.description?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <select
                  id="level"
                  {...form.register("level")}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setThumbnailFile(event.target.files?.[0])}
                />
                {form.watch("thumbnail") && (
                  <p className="text-xs text-slate-500">Current: {form.watch("thumbnail")}</p>
                )}
              </div>
            </div>
          </section>

          <div className="space-y-4">
            {sectionFields.map((section, sectionIndex) => (
              <section key={section.id} className="rounded-lg border bg-white">
                <div className="flex items-center gap-3 border-b p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-sm font-bold text-blue-900">
                    {sectionIndex + 1}
                  </div>
                  <Input
                    {...form.register(`sections.${sectionIndex}.title`)}
                    placeholder="Section title"
                    className="border-0 px-0 text-base font-semibold shadow-none focus-visible:ring-0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-red-600"
                    onClick={() => removeSection(sectionIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4">
                  <LessonBuilder
                    form={form}
                    sectionIndex={sectionIndex}
                    setVideoFiles={setVideoFiles}
                    setResourceFiles={setResourceFiles}
                  />
                </div>
              </section>
            ))}
          </div>
        </form>
      </div>
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs font-medium text-red-600">{message}</p>
}

function LessonBuilder({
  form,
  sectionIndex,
  setVideoFiles,
  setResourceFiles,
}: {
  form: UseFormReturn<CourseFormValues>
  sectionIndex: number
  setVideoFiles: React.Dispatch<React.SetStateAction<FileMap>>
  setResourceFiles: React.Dispatch<React.SetStateAction<FileMap>>
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `sections.${sectionIndex}.lessons`,
  })

  return (
    <div className="space-y-3">
      {fields.map((lesson, lessonIndex) => {
        const key = `${sectionIndex}-${lessonIndex}`
        const videoUrl = form.watch(`sections.${sectionIndex}.lessons.${lessonIndex}.videoUrl`)
        const resourceUrl = form.watch(`sections.${sectionIndex}.lessons.${lessonIndex}.resourceUrl`)
        return (
          <div key={lesson.id} className="rounded-md border border-slate-200 p-4">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <div className="space-y-3">
                <Input
                  {...form.register(`sections.${sectionIndex}.lessons.${lessonIndex}.title`)}
                  placeholder="Lesson title"
                  className="font-semibold"
                />
                <Input
                  {...form.register(`sections.${sectionIndex}.lessons.${lessonIndex}.description`)}
                  placeholder="Short lesson summary"
                />
                <div className="flex flex-wrap gap-3">
                  <label className={cn("inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm", videoUrl && "border-blue-200 bg-blue-50 text-blue-900")}>
                    <Video className="h-4 w-4" />
                    Video
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(event) =>
                        setVideoFiles((prev) => ({ ...prev, [key]: event.target.files?.[0] }))
                      }
                    />
                  </label>
                  <label className={cn("inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm", resourceUrl && "border-amber-200 bg-amber-50 text-amber-800")}>
                    <FileText className="h-4 w-4" />
                    Resource
                    <input
                      type="file"
                      accept=".pdf,.zip,.rar"
                      className="hidden"
                      onChange={(event) =>
                        setResourceFiles((prev) => ({ ...prev, [key]: event.target.files?.[0] }))
                      }
                    />
                  </label>
                  {(videoUrl || resourceUrl) && (
                    <span className="inline-flex h-9 items-center gap-2 text-xs text-slate-500">
                      <UploadCloud className="h-4 w-4" />
                      Existing media attached
                    </span>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-red-600"
                onClick={() => remove(lessonIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ title: "", description: "" })}
      >
        <Plus className="h-4 w-4" />
        Add lesson
      </Button>
    </div>
  )
}
