import React from "react"
import CourseBuilder from "@/components/dashboard/course-builder"

export default function CourseBuilderPage() {
  return (
    <div className="max-w-5xl mx-auto py-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Course Builder</h2>
        <p className="text-muted-foreground">
          Create sections, add lessons, and upload videos.
        </p>
      </div>
      
      <CourseBuilder />
    </div>
  )
}
