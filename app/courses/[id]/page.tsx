"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  BookOpen,
  ChevronDown,
  PlayCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  Book,
  Eye,
} from "lucide-react"
import * as Accordion from "@radix-ui/react-accordion"
import { getCoursesFromGas } from "@/lib/api-client"
import { getStoredAccess } from "@/lib/access-storage"
import { MOCK_COURSES } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function CourseLandingPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const init = async () => {
      setHasAccess(!!getStoredAccess())
      try {
        const res = await getCoursesFromGas()
        let found = res?.data?.find((c: any) => c.id === id)
        if (!found) {
          found = (MOCK_COURSES as any).find((c: any) => c.id === id)
        }
        setCourse(found)
      } catch {
        setCourse((MOCK_COURSES as any).find((c: any) => c.id === id))
      } finally {
        setLoading(false)
      }
    }
    void init()
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-700 border-t-transparent" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-slate-500">Course not found</p>
      </div>
    )
  }

  const totalLessons = course.sections.reduce(
    (acc: number, s: any) => acc + s.lessons.length,
    0
  )

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* HERO */}
      <div className="relative overflow-hidden border-b border-slate-200 bg-slate-900/95">
        {/* grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* glow */}
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 bg-amber-500/25 blur-[100px]" />

        {/* top line */}
        <div className="absolute top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

        <div className="relative z-10 container mx-auto px-4 py-13">
          <div className="mx-auto max-w-4xl">
            <nav className="mb-4 text-sm text-amber-400">
              <Link href="/courses" className="transition hover:text-amber-700">
                Courses
              </Link>{" "}
              / <span className="text-white">{course.title}</span>
            </nav>

            <h1 className="text-4xl leading-tight font-bold text-white sm:text-5xl">
              {course.title}
            </h1>

            <p className="text-m mt-2 max-w-lg font-medium text-white/50">
              {course.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Badge className="border border-amber-300 bg-amber-600 text-white">
                Intermediate
              </Badge>
              <Badge className="border border-slate-200 bg-red-700 text-white">
                <Clock className="mr-1 h-3 w-3" /> 12h
              </Badge>
              <Badge className="border border-slate-200 bg-blue-900 text-white px-3">
                <BookOpen className="mr-1 h-3 w-3" /> {totalLessons}
              </Badge>
            </div>

            <div className="mt-10 flex gap-4">
              <Button
                onClick={() =>
                  router.push(hasAccess ? `/courses/${id}/learn` : "/register")
                }
                className="h-12 bg-amber-700 px-8 text-white rounded-3xl shadow-md transition-all hover:bg-amber-800 hover:shadow-lg"
              >
                {hasAccess ? "Start Learning" : "Enroll"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button className="border-slate-300 py-6 px-5 rounded-3xl bg-white text-red-700 text-lg hover:bg-slate-50">
                <Eye className="mr-1 h-5 w-5" />
                Preview
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container mx-auto grid gap-12 px-4 py-16 lg:grid-cols-3">
        {/* MAIN */}
        <div className="space-y-16 lg:col-span-2">
          {/* FEATURES */}
          <section>
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
              <ShieldCheck className="text-amber-700" />
              What you'll learn
            </h2>

            <div className="grid gap-4 grid-cols-2">
              {[
                "Hands-on robotics",
                "Real projects",
                "Industry skills",
                "Certification",
              ].map((f, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-amber-400 hover:shadow-md"
                >
                  {f}
                </div>
              ))}
            </div>
          </section>

          {/* ACCORDION */}
          <section>
            <h2 className="mb-6 text-2xl font-bold">Course Content</h2>

            <Accordion.Root type="multiple" className="space-y-4">
              {course.sections.map((section: any) => (
                <Accordion.Item
                  key={section.id}
                  value={section.id}
                  className="rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <Accordion.Trigger className="flex w-full items-center justify-between p-5 transition hover:bg-slate-50">
                    <span className="font-medium">{section.title}</span>
                    <ChevronDown />
                  </Accordion.Trigger>

                  <Accordion.Content>
                    <Separator className="bg-slate-200" />
                    {section.lessons.map((lesson: any) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-5 transition hover:bg-amber-50"
                      >
                        <div className="flex items-center gap-3">
                          <PlayCircle className="text-amber-700" />
                          <span className="text-sm text-slate-700">
                            {lesson.title}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">10min</span>
                      </div>
                    ))}
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </section>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6 lg:sticky lg:top-20 justify-center self-center items-center">
          {/* Requirements */}
          <div className="rounded-2xl border border-slate-200 bg-yellow-600 p-6 shadow-sm">
            <h3 className="mb-4 text-2xl font-bold text-white">Requirements</h3>
            <Separator className="mb-4 bg-white" />
            <ol className="space-y-2 text-m text-white">
              <li>Basic coding knowledge</li>
              <li>Laptop</li>
              <li>Passion for robotics</li>
            </ol>
          </div>

          {/* Instructor */}
          <div className="rounded-2xl border bg-blue-900 to-white p-6">
            <h3 className="mb-2 text-lg font-semibold text-white">Instructor</h3>
            <p className="text-sm text-slate-200">
              Learn from experienced robotics professionals.
            </p>
          </div>

          {/* CTA */}
          <Button
            onClick={() =>
              router.push(hasAccess ? `/courses/${id}/learn` : "/register")
            }
            className="h-12 w-full bg-red-700 rounded-2xl text-lg py-2 font-bold text-white shadow-md transition hover:bg-amber-800 hover:shadow-lg"
          >
            Enroll Now
          </Button>
        </div>
      </div>
    </div>
  )
}
