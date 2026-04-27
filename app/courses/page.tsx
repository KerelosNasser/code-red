"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, Clock, BarChart } from "lucide-react"
import { getCoursesFromGas } from "@/lib/api-client"
import { MOCK_COURSES } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"

interface Course {
  id: string
  title: string
  description: string
  level?: string
  time?: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await getCoursesFromGas()
        if (res.success && res.data && res.data.length > 0) {
          setCourses(res.data)
        } else {
          setCourses(MOCK_COURSES)
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error)
        setCourses(MOCK_COURSES)
      } finally {
        setLoading(false)
      }
    }
    void fetchCourses()
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 border-b border-slate-200 pb-5">
        <h1 className="text-4xl font-bold tracking-tight text-[#2E4A7D]">Courses</h1>
        <p className="mt-2 text-lg text-slate-600">Advanced robotics and engineering curriculum.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-[400px] animate-pulse rounded-2xl bg-slate-100" />
          ))
        ) : courses.length > 0 ? (
          courses.map((course) => (
            <div key={course.id} className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-[#2E4A7D]/30 hover:shadow-lg">
              <div className="h-32 bg-[#2E4A7D] p-6 flex items-end relative overflow-hidden">
                <BookOpen className="h-8 w-8 text-[#F5A623] relative z-10" />
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-white/20 transform rotate-12 translate-x-12 translate-y-12" />
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex-1 space-y-3">
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">{course.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-3">
                    {course.description || "Master advanced robotics concepts with our structured curriculum."}
                  </p>
                  <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                    <div className="flex items-center gap-1">
                      <BarChart className="h-4 w-4" />
                      <span>{course.level || "Intermediate"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.time || "12 hrs"}</span>
                    </div>
                  </div>
                </div>
                <Button asChild className="mt-6 w-full bg-[#2E4A7D] hover:bg-[#2E4A7D]/90 font-bold">
                  <Link href={`/courses/${course.id}`}>
                    Explore Lessons
                  </Link>
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl">
            <p className="text-slate-500 font-medium">No courses available at the moment.</p>
          </div>
        )}
      </div>
      
      <div className="mt-12 p-8 rounded-xl bg-[#2E4A7D]/5 border border-[#2E4A7D]/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h4 className="text-lg font-bold text-[#2E4A7D]">Can&apos;t find what you&apos;re looking for?</h4>
          <p className="text-slate-600">We are constantly adding new curriculum to the platform.</p>
        </div>
        <Button variant="outline" className="border-2 border-[#2E4A7D] text-[#2E4A7D] font-bold hover:bg-[#2E4A7D] hover:text-white">
          Request a Topic
        </Button>
      </div>
    </div>
  )
}
