"use client"

import React from "react"
import Link from "next/link"
import { Plus, BookOpen, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AdminCoursesPage() {
  // Mock data for now until API is connected
  const courses = [
    { id: "1", title: "Introduction to Robotics", status: "Published", lessons: 12 },
    { id: "2", title: "Advanced Automation", status: "Draft", lessons: 8 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Courses</h2>
          <p className="text-muted-foreground">Manage your educational content and video materials.</p>
        </div>
        <Button asChild className="bg-amber-700 hover:bg-amber-800">
          <Link href="/dashboard/courses/builder">
            <Plus className="mr-2 h-4 w-4" />
            New Course
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="p-0">
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-lg font-medium">No courses found</h3>
              <p className="text-sm text-muted-foreground mb-4">You haven&apos;t created any courses yet.</p>
              <Button asChild variant="outline">
                <Link href="/dashboard/courses/builder">Create your first course</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-amber-100 flex items-center justify-center text-amber-700">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{course.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={course.status === "Published" ? "default" : "secondary"} className="text-[10px]">
                          {course.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{course.lessons} lessons</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/courses/builder?id=${course.id}`}>
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
