"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { 
  BookOpen, 
  ChevronDown, 
  PlayCircle, 
  Clock, 
  BarChart, 
  ShieldCheck,
  ArrowRight
} from "lucide-react"
import * as Accordion from "@radix-ui/react-accordion"
import { getCoursesFromGas } from "@/lib/api-client"
import { getStoredAccess } from "@/lib/access-storage"
import { MOCK_COURSES } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"

interface Lesson {
  id: string
  title: string
  description: string
}

interface Section {
  id: string
  title: string
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  description: string
  sections: Section[]
}

export default function CourseLandingPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const init = async () => {
      const access = getStoredAccess()
      setHasAccess(!!access)

      try {
        const res = await getCoursesFromGas()
        let found = null
        if (res.success && res.data) {
          found = res.data.find((c: Course) => c.id === id)
        }
        
        if (!found) {
          found = (MOCK_COURSES as any).find((c: any) => c.id === id)
        }

        if (found) {
          setCourse(found)
        }
      } catch (error) {
        console.error("Failed to fetch course details:", error)
        const found = (MOCK_COURSES as any).find((c: any) => c.id === id)
        if (found) setCourse(found)
      } finally {
        setLoading(false)
      }
    }
    void init()
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#2E4A7D] border-t-transparent" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-center px-4">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Course Not Found</h1>
        <p className="text-slate-600 mb-8">The course you are looking for does not exist or has been moved.</p>
        <Button asChild className="bg-[#2E4A7D] hover:bg-[#2E4A7D]/90">
          <Link href="/courses">Back to Courses</Link>
        </Button>
      </div>
    )
  }

  const totalLessons = course.sections.reduce((acc, s) => acc + s.lessons.length, 0)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Course Hero */}
      <div className="bg-[#2E4A7D] text-white py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <nav className="flex items-center gap-2 text-blue-200 text-sm font-medium mb-6">
              <Link href="/courses" className="hover:text-white transition-colors">Courses</Link>
              <span>/</span>
              <span className="text-white opacity-60">{course.title}</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
              {course.title}
            </h1>
            <p className="text-xl text-blue-50 mb-8 leading-relaxed opacity-90">
              {course.description || "Master advanced robotics and engineering through our professional, hands-on curriculum."}
            </p>
            <div className="flex flex-wrap gap-6 mb-10 text-sm font-medium">
              <div className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-[#F5A623]" />
                <span>Intermediate Level</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#F5A623]" />
                <span>12+ Hours of Content</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#F5A623]" />
                <span>{totalLessons} Lessons</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => router.push(hasAccess ? `/courses/${id}/learn` : "/register")}
                size="lg" 
                className="h-14 px-8 text-lg font-bold bg-[#F5A623] hover:bg-[#F5A623]/90 text-white border-none"
              >
                {hasAccess ? "Go to Course" : "Enroll Now"} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">What you&apos;ll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                {[
                  "Advanced robotics architecture",
                  "Real-time sensor integration",
                  "Professional coding standards",
                  "Mechanical design principles",
                  "Power management systems",
                  "Communication protocols"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-slate-700">
                    <ShieldCheck className="h-5 w-5 text-[#2E4A7D] shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Course Content</h2>
              <div className="mb-4 flex items-center justify-between text-sm text-slate-500 font-medium">
                <span>{course.sections.length} sections • {totalLessons} lessons</span>
              </div>

              <Accordion.Root type="multiple" className="space-y-3">
                {course.sections.map((section, idx) => (
                  <Accordion.Item 
                    key={section.id} 
                    value={section.id}
                    className="overflow-hidden border border-slate-200 bg-white rounded-xl shadow-sm"
                  >
                    <Accordion.Header>
                      <Accordion.Trigger className="flex w-full items-center justify-between p-5 text-left font-bold text-slate-800 hover:bg-slate-50 transition-colors group">
                        <span className="flex items-center gap-3">
                          <span className="text-[#2E4A7D] opacity-40">Section {idx + 1}</span>
                          {section.title}
                        </span>
                        <ChevronDown className="h-5 w-5 text-slate-400 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="border-t border-slate-100 overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                      <div className="divide-y divide-slate-50">
                        {section.lessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <PlayCircle className="h-5 w-5 text-[#2E4A7D]/60" />
                              <span className="text-sm font-medium text-slate-700">{lesson.title}</span>
                            </div>
                            <span className="text-xs text-slate-400 font-medium">10:00</span>
                          </div>
                        ))}
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            </section>
          </div>

          {/* Sidebar / Requirements */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Requirements</h3>
              <ul className="space-y-4">
                {[
                  "Basic understanding of electronics",
                  "Familiarity with C++/Python",
                  "Laptop with at least 8GB RAM",
                  "A passion for building robots"
                ].map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#F5A623] mt-2 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#2E4A7D]/5 p-8 rounded-2xl border border-[#2E4A7D]/10">
              <h3 className="text-lg font-bold text-[#2E4A7D] mb-4">Instructor</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-[#2E4A7D] flex items-center justify-center text-white font-bold">
                  D
                </div>
                <div>
                  <div className="font-bold text-slate-900">DaRa Expert Faculty</div>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Mastering Robotics</div>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Learn from industry professionals with years of experience in educational and industrial robotics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
