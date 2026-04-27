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
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import * as Accordion from "@radix-ui/react-accordion"
import { getCoursesFromGas } from "@/lib/api-client"
import { getStoredAccess } from "@/lib/access-storage"
import { MOCK_COURSES } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-slate-400">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white text-center px-4">
        <div className="mb-6 rounded-full bg-white/5 p-4">
          <ShieldCheck className="h-8 w-8 text-slate-600" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Course Not Found</h1>
        <p className="text-slate-400 mb-8 max-w-md">
          The course you are looking for does not exist or has been moved.
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/courses">Back to Courses</Link>
        </Button>
      </div>
    )
  }

  const totalLessons = course.sections.reduce((acc, s) => acc + s.lessons.length, 0)

  const features = [
    "Professional-grade curriculum",
    "Hands-on project work",
    "Industry expert instruction",
    "Certificate of completion",
    "Lifetime access to materials",
    "Community support",
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(46,74,125,0.3),transparent)]" />
        <div className="relative z-10">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          <div className="container mx-auto px-4 py-16 lg:py-24">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm mb-6 text-slate-400">
                <Link href="/courses" className="hover:text-white transition-colors">
                  Courses
                </Link>
                <span>/</span>
                <span className="text-white truncate">{course.title}</span>
              </nav>

              {/* Title & Description */}
              <div className="space-y-6 mb-10">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {course.title}
                </h1>
                <p className="text-xl text-slate-400 leading-relaxed max-w-3xl">
                  {course.description ||
                    "Master advanced concepts through our comprehensive, industry-focused curriculum designed for professional growth."}
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-3 mb-8">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/30"
                >
                  Intermediate Level
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-slate-800 text-slate-300 border-slate-700"
                >
                  <Clock className="h-3 w-3 mr-1.5" />
                  12+ Hours
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-slate-800 text-slate-300 border-slate-700"
                >
                  <BookOpen className="h-3 w-3 mr-1.5" />
                  {totalLessons} Lessons
                </Badge>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-16">
                <Button
                  onClick={() => router.push(hasAccess ? `/courses/${id}/learn` : "/register")}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white px-8 h-12 text-base font-semibold"
                >
                  {hasAccess ? "Start Learning" : "Enroll Now"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 h-12 px-8"
                >
                  Preview Curriculum
                </Button>
              </div>
            </div>
          </div>

          {/* Decorative gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* What You'll Learn */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                What You&apos;ll Learn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-primary/30 transition-colors"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-slate-300 text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Course Content */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  Course Content
                </h2>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>{course.sections.length} sections</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  <span>{totalLessons} lessons</span>
                </div>
              </div>

              <Accordion.Root type="multiple" className="space-y-4">
                {course.sections.map((section, idx) => (
                  <Accordion.Item
                    key={section.id}
                    value={section.id}
                    className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/30"
                  >
                    <Accordion.Header>
                      <Accordion.Trigger className="flex w-full items-start justify-between p-6 text-left transition-all hover:bg-slate-800/30">
                        <div className="flex flex-col gap-1 text-left">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Section {idx + 1}
                          </span>
                          <span className="text-lg font-semibold text-white">
                            {section.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <span className="text-sm">{section.lessons.length} lessons</span>
                          <ChevronDown className="h-5 w-5 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                        </div>
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                      <Separator className="bg-slate-800" />
                      <div className="divide-y divide-slate-800">
                        {section.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-6 transition-colors hover:bg-slate-800/30"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
                                <PlayCircle className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-slate-200">
                                  {lesson.title}
                                </span>
                                {lesson.description && (
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {lesson.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                10 min
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Requirements Card */}
              <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Requirements</h3>
                <ul className="space-y-3">
                  {[  
                    "Basic understanding of electronics",
                    "Familiarity with C++/Python",
                    "Laptop with at least 8GB RAM",
                    "A passion for building robots",
                  ].map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructor Card */}
              <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Instructor</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-slate-950 font-bold text-lg">
                    DR
                  </div>
                  <div>
                    <div className="font-semibold text-white">DaRa Expert Faculty</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">
                      Mastering Robotics
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Learn from industry professionals with years of experience in educational and
                  industrial robotics.
                </p>
              </div>

              {/* Enroll CTA */}
              <Button
                onClick={() => router.push(hasAccess ? `/courses/${id}/learn` : "/register")}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base font-semibold"
              >
                {hasAccess ? "Start Learning" : "Enroll Now"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
