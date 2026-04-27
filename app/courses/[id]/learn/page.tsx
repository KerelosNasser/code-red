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
  ChevronDown
} from "lucide-react"
import * as Accordion from "@radix-ui/react-accordion"
import * as Tabs from "@radix-ui/react-tabs"
import { Plyr } from "plyr-react"
import { getCoursesFromGas } from "@/lib/api-client"
import { getStoredAccess } from "@/lib/access-storage"
import { MOCK_COURSES } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
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
          
          // Set initial lesson
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    )
  }

  if (!course || !activeLesson) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white text-center px-4">
        <h1 className="text-4xl font-bold mb-4">Course Content Unavailable</h1>
        <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900">
          <Link href="/courses">Back to Courses</Link>
        </Button>
      </div>
    )
  }

  const handleLessonClick = (lesson: Lesson) => {
    setActiveLesson(lesson)
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set("lesson", lesson.id)
    router.push(`/courses/${courseId}/learn?${newParams.toString()}`)
  }

  return (
    <div className="flex h-screen flex-col bg-white overflow-hidden">
      {/* Top Header */}
      <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-slate-900 px-4 text-white shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href={`/courses/${courseId}`} className="hover:text-blue-400 transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <div className="h-4 w-px bg-slate-700 mx-2" />
          <h1 className="text-lg font-bold truncate max-w-[200px] md:max-w-md">
            {course.title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-slate-800 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Content Area */}
        <main className={cn(
          "flex-1 overflow-y-auto transition-all duration-300",
          sidebarOpen ? "lg:mr-[350px]" : "mr-0"
        )}>
          {/* Video Player */}
          <div className="aspect-video bg-black w-full sticky top-0 z-10">
            {plyrSource && (
              <Plyr 
                source={plyrSource} 
                options={{
                  controls: [
                    'play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'
                  ],
                  settings: ['quality', 'speed'],
                  speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] }
                }} 
              />
            )}
          </div>

          {/* Lesson Details */}
          <div className="max-w-5xl mx-auto p-6 md:p-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{activeLesson.title}</h2>
            
            <Tabs.Root defaultValue="overview" className="w-full">
              <Tabs.List className="flex border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
                <Tabs.Trigger 
                  value="overview"
                  className="px-6 py-3 text-sm font-bold text-slate-500 data-[state=active]:text-[#2E4A7D] data-[state=active]:border-b-2 data-[state=active]:border-[#2E4A7D] transition-all whitespace-nowrap"
                >
                  Overview
                </Tabs.Trigger>
                <Tabs.Trigger 
                  value="resources"
                  className="px-6 py-3 text-sm font-bold text-slate-500 data-[state=active]:text-[#2E4A7D] data-[state=active]:border-b-2 data-[state=active]:border-[#2E4A7D] transition-all whitespace-nowrap"
                >
                  Resources
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="overview" className="animate-in fade-in duration-300">
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {activeLesson.description || "In this lesson, we cover the core concepts of the topic. Master these fundamentals to progress through the curriculum."}
                  </p>
                </div>
              </Tabs.Content>

              <Tabs.Content value="resources" className="animate-in fade-in duration-300">
                {activeLesson.resource_url ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl group hover:border-[#2E4A7D]/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center border border-slate-100 shadow-sm">
                          <Download className="h-5 w-5 text-[#2E4A7D]" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">Lesson Resources</div>
                          <div className="text-xs text-slate-500">Download attached materials</div>
                        </div>
                      </div>
                      <Button asChild size="sm" className="bg-[#2E4A7D]">
                        <a href={activeLesson.resource_url} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Info className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-sm font-medium">No resources attached to this lesson.</p>
                  </div>
                )}
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </main>

        {/* Sidebar */}
        <aside className={cn(
          "fixed top-14 bottom-0 right-0 w-full lg:w-[350px] bg-white border-l border-slate-200 flex flex-col z-20 transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:hidden"
        )}>
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Course Content</h3>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <Accordion.Root 
              type="multiple" 
              defaultValue={course.sections[0]?.id ? [course.sections[0].id] : []} 
              className="divide-y divide-slate-100"
            >
              {course.sections.map((section, sIdx) => (
                <Accordion.Item key={section.id} value={section.id} className="overflow-hidden">
                  <Accordion.Header>
                    <Accordion.Trigger className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-50 transition-all group">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Section {sIdx + 1}</span>
                        <span className="text-sm font-bold text-slate-800 leading-tight group-data-[state=open]:text-[#2E4A7D]">
                          {section.title}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="bg-white overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <div className="bg-white">
                      {section.lessons.map((lesson, lIdx) => {
                        const isActive = activeLesson.id === lesson.id
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => handleLessonClick(lesson)}
                            className={cn(
                              "flex w-full items-start gap-3 p-4 text-left transition-colors",
                              isActive ? "bg-blue-50/50" : "hover:bg-slate-50"
                            )}
                          >
                            <div className="mt-0.5">
                              {isActive ? (
                                <div className="h-5 w-5 rounded-full bg-[#2E4A7D] flex items-center justify-center">
                                  <Play className="h-2.5 w-2.5 text-white fill-white ml-0.5" />
                                </div>
                              ) : (
                                <CheckCircle2 className="h-5 w-5 text-slate-200" />
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className={cn(
                                "text-sm font-medium leading-snug",
                                isActive ? "text-[#2E4A7D] font-bold" : "text-slate-600"
                              )}>
                                {lIdx + 1}. {lesson.title}
                              </span>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                <Play className="h-3 w-3" />
                                <span>10:00</span>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>
        </aside>
      </div>
      
      {/* Mobile Toggle Button (when sidebar is closed) */}
      {!sidebarOpen && (
        <button 
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-[#2E4A7D] text-white shadow-xl flex items-center justify-center z-30 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}
