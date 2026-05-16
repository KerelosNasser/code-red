import React, { Suspense } from "react"
import CourseLandingClient from "@/components/course-landing-client"
import { getCachedCourses } from "@/lib/server-api"
import { MOCK_COURSES } from "@/lib/mock-data"
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from "next/cache"

interface PageProps {
  params: Promise<{ id: string }>
}

async function CourseContent({ params }: PageProps) {
  const { id } = await params
  cacheLife("days")
  cacheTag("courses")
  let course = null

  try {
    const res = await getCachedCourses()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    course = (res?.data as any[])?.find((c) => c.id === id)
    if (!course) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      course = (MOCK_COURSES as any[]).find((c) => c.id === id)
    }
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    course = (MOCK_COURSES as any[]).find((c) => c.id === id)
  }

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-slate-500">Course not found</p>
      </div>
    )
  }

  return <CourseLandingClient course={course} id={id} />
}

export default function CourseLandingPage({ params }: PageProps) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-700 border-t-transparent" />
      </div>
    }>
      <CourseContent params={params} />
    </Suspense>
  )
}
