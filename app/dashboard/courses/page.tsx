"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  deleteCourseForActorAction,
  listCoursesForActorAction,
  type CourseActor,
} from "@/lib/actions"
import { getStoredAccess } from "@/lib/access-storage"

type CourseRow = {
  id: string
  title: string
  description?: string
  status: "draft" | "published"
  ownerPhone: string
  ownerRole: string
  updatedAt?: string | Date
  sections?: { lessons?: unknown[] }[]
}

export default function AdminCoursesPage() {
  const router = useRouter()
  const [actor, setActor] = useState<CourseActor | null>(null)
  const [courses, setCourses] = useState<CourseRow[]>([])
  const [loading, setLoading] = useState(true)

  const canManage = useMemo(
    () => actor?.role === "admin" || actor?.role === "tutor",
    [actor]
  )

  const loadCourses = async (currentActor: CourseActor) => {
    setLoading(true)
    const result = await listCoursesForActorAction(currentActor)
    if (result.success) {
      setCourses((result.data || []) as CourseRow[])
    } else {
      toast.error(result.error || "Failed to load courses")
    }
    setLoading(false)
  }

  useEffect(() => {
    const access = getStoredAccess()
    if (!access || (access.role !== "admin" && access.role !== "tutor")) {
      router.push("/register")
      return
    }
    const nextActor = { phone: access.phone, role: access.role }
    setActor(nextActor)
    void loadCourses(nextActor)
  }, [router])

  const onDelete = async (course: CourseRow) => {
    if (!actor || !confirm(`Delete course "${course.title}"?`)) return
    const result = await deleteCourseForActorAction(course.id, actor)
    if (result.success) {
      toast.success("Course deleted")
      void loadCourses(actor)
    } else {
      toast.error(result.error || "Could not delete course")
    }
  }

  if (!canManage) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Courses</h2>
          <p className="text-muted-foreground">
            Manage course drafts, publishing, videos, and resources.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => actor && loadCourses(actor)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button asChild>
            <Link href="/dashboard/courses/builder">
              <Plus className="mr-2 h-4 w-4" />
              New Course
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        {loading ? (
          <div className="flex items-center justify-center p-10 text-sm text-slate-500">
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-center">
            <BookOpen className="mb-4 h-10 w-10 text-muted-foreground opacity-30" />
            <h3 className="text-lg font-medium">No courses yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Create a draft course to start adding lessons.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard/courses/builder">Create your first course</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {courses.map((course) => {
              const lessons = course.sections?.reduce(
                (count, section) => count + (section.lessons?.length || 0),
                0
              ) || 0
              return (
                <div key={course.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-900">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate font-medium">{course.title}</h4>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge variant={course.status === "published" ? "default" : "secondary"}>
                          {course.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{lessons} lessons</span>
                        {actor?.role === "admin" && (
                          <span className="text-xs text-muted-foreground">
                            owner: {course.ownerRole} {course.ownerPhone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/courses/builder?id=${course.id}`}>
                        <Pencil className="mr-1 h-4 w-4" /> Edit
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => onDelete(course)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
