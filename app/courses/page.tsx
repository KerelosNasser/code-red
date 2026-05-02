import React from "react"
import Link from "next/link"
import { BookOpen, Clock, BarChart, ArrowRight } from "lucide-react"
import { getCachedCourses } from "@/lib/server-api"
import { MOCK_COURSES } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Course {
  id: string
  title: string
  description: string
  level?: string
  time?: string
}

export default async function CoursesPage() {
  let courses: Course[] = []
  
  try {
    const res = await getCachedCourses()
    if (res.success && res.data && res.data.length > 0) {
      courses = res.data
    } else {
      courses = MOCK_COURSES
    }
  } catch {
    courses = MOCK_COURSES
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-slate-200 bg-slate-800 text-white">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Amber Glow */}
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-amber-700/20 blur-[120px]" />

        {/* Animated gradient line */}
        <div className="absolute top-0 left-0 h-[2px] w-full animate-pulse bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

        <div className="relative z-10 container mx-auto px-4 py-10 lg:py-18">
          <div className="max-w-3xl">
            {/* Label */}
            <div className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-400">
              <BookOpen className="h-4 w-4 text-amber-500" />
              <span className="tracking-wide text-red-700 uppercase">
                Robotics Education
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="bg-white bg-clip-text text-transparent">
                Build the Future
              </span>
              <br />
              <span className="text-amber-500">with Robotics</span>
            </h1>

            {/* Description */}
            <p className="mt-2 max-w-xl text-lg text-slate-400">
              Hands-on robotics and engineering courses designed to turn ideas
              into real-world systems.
            </p>
          </div>
        </div>
      </div>
      {/* Courses */}
      <section className="container mx-auto px-4 py-10">
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-700/10"
              >
                {/* Top Icon */}
                <div className="flex h-48 items-center justify-center border-b border-slate-200 bg-slate-50">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
                    <BookOpen className="h-10 w-10 text-amber-700" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <Badge className="mb-3 w-fit border border-amber-300 bg-amber-100 text-amber-800">
                    {course.level || "Intermediate"}
                  </Badge>

                  <h3 className="mb-2 text-xl font-semibold text-slate-900 transition group-hover:text-amber-700">
                    {course.title}
                  </h3>

                  <p className="mb-4 flex-1 text-sm text-slate-500">
                    {course.description ||
                      "Professional course content for real growth."}
                  </p>

                  <div className="flex items-center justify-between border-t pt-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.time || "12+ hrs"}
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart className="h-4 w-4" />
                      {course.level || "Intermediate"}
                    </div>
                  </div>

                  {/* Hover CTA */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                    <div className="flex items-center gap-2 font-semibold text-amber-700">
                      Explore <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
                <Link
                  href={`/courses/${course.id}`}
                  className="absolute inset-0"
                />
              </div>
            ))}
            <div className="bg- rounded-2xl  bg-slate-700 border justify-center border-dashed border-slate-300 py-20 text-center">
              <h3 className="mb-4 text-2xl font-bold text-white">
                Can’t find what you want?
              </h3>
              <p className="mb-6 text-slate-500">
                Request a topic and we’ll build it.
              </p>
              <Button className="bg-amber-700 px-8 py-3 text-base text-white hover:bg-amber-800">
                Request Topic
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 py-20 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-400" />
            <p className="text-slate-500">No courses yet</p>
          </div>
        )}
      </section>{" "}
    </div>
  )
}
