"use client"

import React, { useState } from "react"
import { useForm, useFieldArray, UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Video, 
  FileText, 
  BookOpen, 
  Layers, 
  Settings, 
  Save, 
  ChevronRight,
  UploadCloud,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const lessonSchema = z.object({
  title: z.string().min(1, "Lesson title is required"),
  description: z.string().optional(),
  videoFile: z.any().optional(),
  resourceFile: z.any().optional(),
})

const sectionSchema = z.object({
  title: z.string().min(1, "Section title is required"),
  lessons: z.array(lessonSchema).min(1, "At least one lesson is required per section"),
})

const courseSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  description: z.string().min(1, "Description is required"),
  level: z.string().min(1, "Level is required"),
  thumbnail: z.any().optional(),
  sections: z.array(sectionSchema).min(1, "At least one section is required"),
})

type CourseFormValues = z.infer<typeof courseSchema>

export default function CourseBuilder() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      level: "Intermediate",
      sections: [
        {
          title: "",
          lessons: [{ title: "", description: "" }],
        },
      ],
    },
  })

  const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({
    control: form.control,
    name: "sections",
  })

  const onSubmit = async (data: CourseFormValues) => {
    setIsSubmitting(true)
    try {
      console.log("Submitting course data:", data)
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulating upload
      toast.success("Course saved successfully! Videos are processing.")
    } catch {
      toast.error("Failed to save course.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-32 font-sans">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
        
        {/* Course Core Configuration */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-blue-900/5"
        >
          <div className="flex items-center gap-3 bg-blue-950 px-8 py-5 text-white">
            <Settings className="h-5 w-5 text-amber-500" />
            <h3 className="font-serif text-xl font-bold tracking-tight">Core Course Configuration</h3>
          </div>
          
          <div className="p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="title" className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Professional Title
                </Label>
                <Input 
                  id="title" 
                  {...form.register("title")} 
                  placeholder="e.g. Masterclass: Industrial Robotics & Automation" 
                  className="h-14 rounded-xl border-slate-200 bg-slate-50/50 text-lg transition-all focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5"
                />
                {form.formState.errors.title && (
                  <p className="text-xs font-semibold text-red-600 italic">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="description" className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Curriculum Overview
                </Label>
                <textarea 
                  id="description"
                  {...form.register("description")}
                  className="flex min-h-[120px] w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm transition-all focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5 outline-none"
                  placeholder="Describe the learning outcomes and technical requirements..."
                />
                {form.formState.errors.description && (
                  <p className="text-xs font-semibold text-red-600 italic">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="level" className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Target Proficiency
                </Label>
                <select 
                  id="level" 
                  {...form.register("level")}
                  className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-medium transition-all focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5 outline-none"
                >
                  <option value="Beginner">Beginner - Foundations</option>
                  <option value="Intermediate">Intermediate - Specialized</option>
                  <option value="Advanced">Advanced - Expert Implementation</option>
                  <option value="Expert">Expert - Research & Design</option>
                </select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="thumbnail" className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Visual Branding (Thumbnail)
                </Label>
                <div className="relative h-12">
                   <Input 
                    id="thumbnail" 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex h-full items-center justify-between rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-4 text-sm text-slate-500">
                    <span className="flex items-center gap-2 italic">
                      <UploadCloud className="h-4 w-4" /> Click to upload image
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Curriculum Section */}
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-slate-900">Curriculum Structure</h3>
                <p className="text-sm text-slate-500">Design modules and interactive lessons</p>
              </div>
            </div>
            <Button 
              type="button" 
              onClick={() => appendSection({ title: "", lessons: [{ title: "", description: "" }] })} 
              className="rounded-xl bg-amber-700 font-bold text-white hover:bg-amber-800"
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Module
            </Button>
          </div>

          <div className="space-y-8">
            <AnimatePresence>
              {sectionFields.map((section, sectionIndex) => (
                <motion.div 
                  key={section.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg"
                >
                  {/* Section Header */}
                  <div className="flex items-center justify-between bg-slate-50/80 px-6 py-4 border-b border-slate-100">
                    <div className="flex flex-1 items-center gap-4">
                      <GripVertical className="h-5 w-5 cursor-move text-slate-300" />
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-900 text-xs font-bold text-white">
                        {sectionIndex + 1}
                      </div>
                      <div className="flex-1">
                        <Input 
                          {...form.register(`sections.${sectionIndex}.title`)} 
                          placeholder="Module Title (e.g. Kinematics & Motion Planning)" 
                          className="h-11 border-none bg-transparent font-serif text-lg font-bold text-slate-900 placeholder:text-slate-300 focus-visible:ring-0"
                        />
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeSection(sectionIndex)} 
                      className="text-slate-300 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>

                  {form.formState.errors.sections?.[sectionIndex]?.title && (
                    <div className="bg-red-50 px-10 py-2 border-b border-red-100">
                      <p className="text-xs font-bold text-red-600 italic">
                        {form.formState.errors.sections[sectionIndex]?.title?.message}
                      </p>
                    </div>
                  )}

                  {/* Lessons Builder Component */}
                  <div className="p-6">
                    <LessonBuilder form={form} sectionIndex={sectionIndex} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {sectionFields.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 text-center">
                <BookOpen className="mb-4 h-12 w-12 text-slate-300" />
                <h4 className="text-lg font-bold text-slate-900">No Content Added</h4>
                <p className="mt-1 text-sm text-slate-500">Start building your course by adding your first module.</p>
                <Button 
                  type="button" 
                  onClick={() => appendSection({ title: "", lessons: [{ title: "", description: "" }] })} 
                  className="mt-6 rounded-xl border border-amber-700 text-amber-700 hover:bg-amber-50"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" /> Create First Module
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center border-t border-slate-200 bg-white/90 p-6 backdrop-blur-xl md:left-64">
          <div className="flex w-full max-w-5xl items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <span className="flex h-2 w-2 rounded-full bg-amber-500" /> 
              Drafting in Progress
            </div>
            
            <div className="flex items-center gap-4">
              <Button type="button" variant="ghost" className="font-bold text-slate-400 hover:text-slate-900">
                Discard Changes
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="h-12 min-w-[180px] rounded-xl bg-blue-950 font-black text-white shadow-lg shadow-blue-900/20 hover:bg-blue-900 hover:shadow-xl active:scale-95 transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" /> Finalizing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" /> Publish Masterclass
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

function LessonBuilder({ form, sectionIndex }: { form: UseFormReturn<CourseFormValues>, sectionIndex: number }) {
  const { fields: lessonFields, append: appendLesson, remove: removeLesson } = useFieldArray({
    control: form.control,
    name: `sections.${sectionIndex}.lessons`,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-black tracking-widest text-slate-400 uppercase mb-2">
        <div className="h-[1px] flex-1 bg-slate-100" />
        Lessons
        <div className="h-[1px] flex-1 bg-slate-100" />
      </div>

      <AnimatePresence mode="popLayout">
        {lessonFields.map((lesson, lessonIndex) => (
          <motion.div 
            key={lesson.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="group/lesson rounded-2xl border border-slate-100 bg-slate-50/50 p-5 transition-all hover:border-amber-200 hover:bg-white hover:shadow-md"
          >
            <div className="flex flex-col gap-6 md:flex-row">
              {/* Lesson Number/Type Icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 group-hover/lesson:border-amber-100 group-hover/lesson:text-amber-600">
                <span className="text-xs font-black">{lessonIndex + 1}</span>
              </div>

              <div className="flex-1 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <Input 
                      {...form.register(`sections.${sectionIndex}.lessons.${lessonIndex}.title`)} 
                      placeholder="Lesson Name (e.g. Geometric Jacobian)" 
                      className="h-9 border-none bg-transparent p-0 text-lg font-bold text-slate-800 placeholder:text-slate-300 focus-visible:ring-0"
                    />
                    <Input 
                      {...form.register(`sections.${sectionIndex}.lessons.${lessonIndex}.description`)} 
                      placeholder="Key takeaway for students..." 
                      className="h-6 border-none bg-transparent p-0 text-sm text-slate-500 italic placeholder:text-slate-200 focus-visible:ring-0"
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeLesson(lessonIndex)} 
                    className="h-8 w-8 text-slate-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover/lesson:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Media Upload Buttons */}
                <div className="flex flex-wrap gap-3">
                  <div className="relative group/btn">
                    <Input 
                      type="file" 
                      accept="video/*" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="h-9 rounded-lg border-slate-200 bg-white px-4 font-bold text-slate-600 transition-all group-hover/btn:border-blue-900 group-hover/btn:text-blue-900"
                    >
                      <Video className="mr-2 h-4 w-4" /> Video File
                    </Button>
                  </div>

                  <div className="relative group/btn">
                    <Input 
                      type="file" 
                      accept=".pdf,.zip,.rar" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="h-9 rounded-lg border-slate-200 bg-white px-4 font-bold text-slate-600 transition-all group-hover/btn:border-amber-600 group-hover/btn:text-amber-600"
                    >
                      <FileText className="mr-2 h-4 w-4" /> Resources
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      <div className="pt-2">
        <Button 
          type="button" 
          onClick={() => appendLesson({ title: "", description: "" })} 
          variant="ghost" 
          className="group flex items-center gap-2 font-bold text-slate-400 hover:text-amber-700"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 group-hover:border-amber-700">
            <Plus className="h-3 w-3" />
          </div>
          Add New Lesson
          <ChevronRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
        </Button>
      </div>
    </div>
  )
}

function RefreshCw({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}
