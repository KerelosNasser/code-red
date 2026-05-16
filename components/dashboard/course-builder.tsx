"use client"

import React, { useState } from "react"
import { useForm, useFieldArray, Controller, UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Trash2, GripVertical, UploadCloud, Video, FileText, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

const lessonSchema = z.object({
  title: z.string().min(1, "Lesson title is required"),
  description: z.string().optional(),
  videoFile: z.any().optional(), // In reality, handle File objects
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
      // Phase 3 integration point: 
      // 1. Upload video files via API to Hetzner disk
      // 2. Trigger BullMQ processing
      // 3. Save Drizzle structured data
      
      toast.success("Course saved successfully! Videos are processing.")
    } catch (error) {
      toast.error("Failed to save course.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 pb-20">
      {/* Basic Course Info */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold mb-6 border-b pb-4">1. Course Details</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Course Title</Label>
            <Input id="title" {...form.register("title")} placeholder="e.g. Advanced Robotics Engineering" />
            {form.formState.errors.title && <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea 
              id="description"
              {...form.register("description")}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Detailed description of what the course covers..."
            />
            {form.formState.errors.description && <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <select 
              id="level" 
              {...form.register("level")}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail</Label>
            <Input id="thumbnail" type="file" accept="image/*" />
          </div>
        </div>
      </div>

      {/* Sections and Lessons Builder */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h3 className="text-xl font-semibold">2. Curriculum Builder</h3>
          <Button type="button" onClick={() => appendSection({ title: "", lessons: [{ title: "", description: "" }] })} variant="outline" className="text-amber-700 border-amber-700/30 hover:bg-amber-50">
            <Plus className="mr-2 h-4 w-4" /> Add Section
          </Button>
        </div>

        <div className="space-y-8">
          {sectionFields.map((section, sectionIndex) => (
            <div key={section.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 relative group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 w-full max-w-md">
                  <GripVertical className="text-slate-400 cursor-move h-5 w-5" />
                  <div className="flex-1">
                    <Input 
                      {...form.register(`sections.${sectionIndex}.title`)} 
                      placeholder="Section Title (e.g. Module 1: Fundamentals)" 
                      className="bg-white border-slate-300 font-medium"
                    />
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeSection(sectionIndex)} className="text-red-500 hover:bg-red-100 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {form.formState.errors.sections?.[sectionIndex]?.title && (
                <p className="text-sm text-red-500 mb-4 ml-8">{form.formState.errors.sections[sectionIndex]?.title?.message}</p>
              )}

              {/* Lessons Array within Section */}
              <LessonBuilder form={form} sectionIndex={sectionIndex} />
              
            </div>
          ))}
          {form.formState.errors.sections?.message && (
            <p className="text-sm text-red-500">{form.formState.errors.sections.message}</p>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-10 flex justify-end gap-4 bg-white/80 p-4 backdrop-blur-md border-t">
        <Button type="button" variant="outline">Save as Draft</Button>
        <Button type="submit" disabled={isSubmitting} className="bg-amber-700 hover:bg-amber-800 text-white min-w-[150px]">
          {isSubmitting ? (
             <span className="flex items-center gap-2">
               <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
               Processing...
             </span>
          ) : "Publish Course"}
        </Button>
      </div>
    </form>
  )
}

function LessonBuilder({ form, sectionIndex }: { form: UseFormReturn<CourseFormValues>, sectionIndex: number }) {
  const { fields: lessonFields, append: appendLesson, remove: removeLesson } = useFieldArray({
    control: form.control,
    name: `sections.${sectionIndex}.lessons`,
  })

  return (
    <div className="ml-8 pl-4 border-l-2 border-slate-200 space-y-4">
      {lessonFields.map((lesson, lessonIndex) => (
        <div key={lesson.id} className="rounded-md border bg-white p-4 shadow-sm relative">
          <div className="flex gap-4">
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <Input 
                  {...form.register(`sections.${sectionIndex}.lessons.${lessonIndex}.title`)} 
                  placeholder="Lesson Title" 
                  className="font-medium max-w-sm"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeLesson(lessonIndex)} className="text-slate-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <Input 
                {...form.register(`sections.${sectionIndex}.lessons.${lessonIndex}.description`)} 
                placeholder="Short description..." 
                className="text-sm"
              />

              <div className="flex flex-wrap gap-4 pt-2">
                <div className="relative group/upload">
                  <Input 
                    type="file" 
                    accept="video/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  <Button type="button" variant="outline" size="sm" className="bg-amber-50 text-amber-700 border-amber-200 relative z-0 pointer-events-none group-hover/upload:bg-amber-100">
                    <Video className="h-4 w-4 mr-2" />
                    Upload Video
                  </Button>
                </div>

                <div className="relative group/upload">
                  <Input 
                    type="file" 
                    accept=".pdf,.zip,.rar" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  <Button type="button" variant="outline" size="sm" className="bg-slate-50 text-slate-700 border-slate-200 relative z-0 pointer-events-none group-hover/upload:bg-slate-100">
                    <FileText className="h-4 w-4 mr-2" />
                    Attach Resource
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <Button 
        type="button" 
        onClick={() => appendLesson({ title: "", description: "" })} 
        variant="ghost" 
        size="sm" 
        className="text-slate-500 hover:text-amber-700 hover:bg-amber-50 mt-2"
      >
        <Plus className="h-4 w-4 mr-1" /> Add Lesson
      </Button>
    </div>
  )
}
