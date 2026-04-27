"use client"

import React, { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import {
  ChevronLeft,
  Menu,
  X,
  Play,
  CheckCircle2,
  Download,
  Info,
  ChevronDown,
  Clock,
  FileText,
} from "lucide-react"
import * as Accordion from "@radix-ui/react-accordion"
import * as Tabs from "@radix-ui/react-tabs"
import { Plyr } from "plyr-react"
import { getCoursesFromGas } from "@/lib/api-client"
import { getStoredAccess } from "@/lib/access-storage"
import { MOCK_COURSES } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface Lesson {
  id: string
  title: string
  description: string
  drive_file_id: string
  resource_url?: string
  url: string
  preview_url: string
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

export default function CoursePlayerPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const courseId = params.id as string
  const lessonId = searchParams.get("lesson")

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const init = async () => {
      const access = getStoredAccess()
      if (!access) {
        router.push("/")
        return
      }

      try {
        const res = await getCoursesFromGas()
        let found = null
        if (res.success && res.data) {
          found = res.data.find((c: Course) => c.id === courseId)
        }

        if (!found) {
          found = (MOCK_COURSES as any).find((c: any) => c.id === courseId)
        }

        if (found) {
          setCourse(found)

          const allLessons = found.sections.flatMap((s: Section) => s.lessons)
          if (lessonId) {
            const target = allLessons.find((l: Lesson) => l.id === lessonId)
            if (target) setActiveLesson(target)
            else if (allLessons.length > 0) setActiveLesson(allLessons[0])
          } else if (allLessons.length > 0) {
            setActiveLesson(allLessons[0])
          }
        }
      } catch (error) {
        console.error("Failed to fetch course details:", error)
        const found = (MOCK_COURSES as any).find((c: any) => c.id === courseId)
        if (found) {
          setCourse(found)
          const allLessons = found.sections.flatMap((s: any) => s.lessons)
          if (allLessons.length > 0) setActiveLesson(allLessons[0])
        }
      } finally {
        setLoading(false)
      }
    }
    void init()
  }, [courseId, lessonId, router])

  const plyrSource = useMemo(() => {
    if (!activeLesson) return null
    return {
      type: "video" as const,
      sources: [
        {
          src: activeLesson.url,
          type: "video/mp4",
        },
      ],
    }
  }, [activeLesson])

  const handleLessonClick = (lesson: Lesson) => {
    setActiveLesson(lesson)
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set("lesson", lesson.id)
    router.push(`/courses/${courseId}/learn?${newParams.toString()}`)
  }

  const completedLessons = course
    ? course.sections.flatMap((s) => s.lessons).filter((l) => {
        const allLessons = course.sections.flatMap((s) => s.lessons)
        const currentIndex = allLessons.findIndex((lesson) => lesson.id === l.id)
        const activeIndex = activeLesson
          ? allLessons.findIndex((lesson) => lesson.id === activeLesson.id)
          : -1
        return activeIndex > currentIndex
      }).length
    : 0

  const totalLessons = course
    ? course.sections.reduce((acc, s) => acc + s.lessons.length, 0)
    : 0

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-slate-400">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course || !activeLesson) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white text-center px-4">
        <div className="mb-6 rounded-full bg-white/5 p-4">
          <Info className="h-8 w-8 text-slate-600" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Course Content Unavailable</h1>
        <p className="text-slate-400 mb-8 max-w-md">
          The course you are looking for cannot be found or accessed at this time.
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/courses">Back to Courses</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 lg:px-6 z-30">
        <div className="flex items-center gap-3">
          <Link
            href={`/courses/${courseId}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-400 transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <Separator orientation="vertical" className="mx-2 h-6 bg-slate-700" />
          <div className="hidden md:block">
            <h1 className="text-base font-semibold text-white truncate max-w-[200px]">
              {course.title}
            </h1>
            <p className="text-xs text-slate-500">
              {completedLessons} of {totalLessons} lessons completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="hidden md:flex bg-primary/10 text-primary border-primary/30"
          >
            {completedLessons}/{totalLessons} lessons
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content - Video & Lesson Details */}
        <main
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-300 ease-in-out",
            sidebarOpen ? "lg:mr-[400px]" : "mr-0"
          )}
        >
          {/* Video Player Section */}
          <div className="relative aspect-video bg-slate-900 lg:sticky lg:top-0 lg:z-20">
            {plyrSource && (
              <Plyr
                source={plyrSource}
                options={{
                  controls: [
                    "play-large",
                    "play",
                    "progress",
                    "current-time",
                    "mute",
                    "volume",
                    "captions",
                    "settings",
                    "pip",
                    "airplay",
                    "fullscreen",
                  ],
                  settings: ["quality", "speed"],
                  speed: {
                    selected: 1,
                    options: [0.5, 0.75, 1, 1.25, 1.5, 2],
                  },
                }}
              />
            )}
          </div>

          {/* Lesson Content */}
          <div className="max-w-4xl mx-auto px-4 py-8 lg:px-6 lg:py-10">
            <div className="space-y-6">
              {/* Lesson Title & Meta */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {course.sections.map((s, idx) =>
                    s.lessons.find((l) => l.id === activeLesson.id) ? (
                      <Badge
                        key={s.id}
                        variant="outline"
                        className="bg-primary/5 border-primary/30 text-primary"
                      >
                        Section {idx + 1}
                      </Badge>
                    ) : null
                  )}
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {activeLesson.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>10 minutes</span>
                  </div>
                  {activeLesson.resource_url && (
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-4 w-4" />
                      <span>Resource available</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-slate-800" />

              {/* Tabs */}
              <Tabs.Root defaultValue="overview" className="w-full">
                <Tabs.List
                  className="flex w-full gap-1 rounded-lg bg-slate-900/50 p-1 border border-slate-800"
                  aria-label="Lesson details"
                >
                  <Tabs.Trigger
                    value="overview"
                    className="flex-1 rounded-md px-4 py-2.5 text-sm font-medium text-slate-400 transition-all hover:text-slate-200 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20"
                  >
                    Overview
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    value="resources"
                    className="flex-1 rounded-md px-4 py-2.5 text-sm font-medium text-slate-400 transition-all hover:text-slate-200 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20"
                  >
                    Resources
                  </Tabs.Trigger>
                </Tabs.List>

                <div className="mt-6">
                  <Tabs.Content
                    value="overview"
                    className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                      <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-base">
                        {activeLesson.description ||
                          "In this lesson, we cover the core concepts of the topic. Master these fundamentals to progress through the curriculum."}
                      </p>
                    </div>
                  </Tabs.Content>

                  <Tabs.Content
                    value="resources"
                    className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    {activeLesson.resource_url ? (
                      <div className="space-y-4">
                        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-primary/50 group">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                              <Download className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-white mb-1">
                                Lesson Resources
                              </h4>
                              <p className="text-sm text-slate-400 mb-4">
                                Download attached materials and supplementary files
                              </p>
                              <Button
                                asChild
                                className="bg-primary hover:bg-primary/90"
                              >
                                <a
                                  href={activeLesson.resource_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Download Resources
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50">
                          <Info className="h-8 w-8 text-slate-600" />
                        </div>
                        <p className="text-sm font-medium">
                          No resources attached to this lesson
                        </p>
                      </div>
                    )}
                  </Tabs.Content>
                </div>
              </Tabs.Root>
            </div>
          </div>
        </main>

        {/* Sidebar - Course Content */}
        <aside
          className={cn(
            "fixed top-14 bottom-0 right-0 z-20 w-full border-l border-slate-800 bg-slate-950 transition-transform duration-300",
            sidebarOpen ? "translate-x-0 lg:w-[400px]" : "translate-x-full lg:translate-x-0 lg:w-[400px]"
          )}
        >
          <div className="flex h-full flex-col">
            {/* Sidebar Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 lg:px-5">
              <h3 className="text-sm font-bold text-white">
                Course Content
                <span className="ml-2 text-slate-500">
                  ({totalLessons} lessons)
                </span>
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-800"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Course Sections */}
            <div className="flex-1 overflow-y-auto px-4 py-4 lg:px-5">
              <Accordion.Root
                type="multiple"
                defaultValue={course.sections[0]?.id ? [course.sections[0].id] : []}
                className="space-y-2"
              >
                {course.sections.map((section, sIdx) => {
                  const sectionLessonsCompleted = section.lessons.filter((l) => {
                    const allLessons = course.sections.flatMap((s) => s.lessons)
                    const activeIndex = activeLesson
                      ? allLessons.findIndex((lesson) => lesson.id === activeLesson.id)
                      : -1
                    const lessonIndex = allLessons.findIndex((lesson) => lesson.id === l.id)
                    return activeIndex > lessonIndex
                  }).length

                  return (
                    <Accordion.Item
                      key={section.id}
                      value={section.id}
                      className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/30"
                    >
                      <Accordion.Header>
                        <Accordion.Trigger className="flex w-full items-start justify-between px-4 py-3 text-left transition-all hover:bg-slate-800/50 group">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              Section {sIdx + 1}
                            </span>
                            <span className="text-sm font-semibold text-white leading-tight group-data-[state=open]:text-primary">
                              {section.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">
                              {sectionLessonsCompleted}/{section.lessons.length}
                            </span>
                            <ChevronDown className="h-4 w-4 text-slate-500 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                          </div>
                        </Accordion.Trigger>
                      </Accordion.Header>
                      <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        <div className="px-4 pb-2">
                          {section.lessons.map((lesson, lIdx) => {
                            const isActive = activeLesson.id === lesson.id
                            const allLessons = course.sections.flatMap((s) => s.lessons)
                            const lessonIndex = allLessons.findIndex(
                              (l) => l.id === lesson.id
                            )
                            const activeIndex = activeLesson
                              ? allLessons.findIndex((l) => l.id === activeLesson.id)
                              : -1
                            const isCompleted = activeIndex > lessonIndex

                            return (
                              <button
                                key={lesson.id}
                                onClick={() => handleLessonClick(lesson)}
                                className={cn(
                                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all my-1",
                                  isActive
                                    ? "bg-primary/20 border border-primary/30"
                                    : "hover:bg-slate-800/50"
                                )}
                              >
                                <div
                                  className={cn(
                                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs transition-all",
                                    isCompleted
                                      ? "bg-green-500/20 border border-green-500/50 text-green-400"
                                      : isActive
                                      ? "bg-primary border border-primary/50 text-primary-foreground"
                                      : "bg-slate-800 border border-slate-700 text-slate-500"
                                  )}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  ) : (
                                    <span className="font-bold">{lIdx + 1}</span>
                                  )}
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                  <span
                                    className={cn(
                                      "text-sm font-medium truncate",
                                      isActive
                                        ? "text-primary"
                                        : "text-slate-300"
                                    )}
                                  >
                                    {lesson.title}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-3 w-3 text-slate-500" />
                                    <span className="text-xs text-slate-500">
                                      10 min
                                    </span>
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </Accordion.Content>
                    </Accordion.Item>
                  )
                })}
              </Accordion.Root>
            </div>

            {/* Sidebar Footer */}
            <div className="shrink-0 border-t border-slate-800 p-4 lg:px-5">
              <div className="rounded-lg bg-slate-900/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Progress
                    </p>
                    <p className="text-lg font-bold text-white">
                      {completedLessons}/{totalLessons}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">
                      {Math.round((completedLessons / totalLessons) * 100) || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Toggle Button */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 active:scale-95 lg:hidden"
          >
            <Menu className="h-5 w-5 text-white" />
          </button>
        )}
      </div>
    </div>
  )
}
