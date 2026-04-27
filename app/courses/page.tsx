import { BookOpen, Clock, BarChart } from "lucide-react"

export default function CoursesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 border-b border-slate-200 pb-5">
        <h1 className="text-4xl font-bold tracking-tight text-[#2E4A7D]">Courses</h1>
        <p className="mt-2 text-lg text-slate-600">Advanced robotics and engineering curriculum.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder for Course Cards */}
        {[
          { title: "Introduction to Robotics", level: "Beginner", time: "10 hrs" },
          { title: "Advanced Control Systems", level: "Advanced", time: "24 hrs" },
          { title: "Mechatronics Fundamentals", level: "Intermediate", time: "15 hrs" },
        ].map((course, i) => (
          <div key={i} className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-[#F5A623]/30">
            <div className="h-32 bg-[#2E4A7D] p-6 flex items-end">
              <BookOpen className="h-8 w-8 text-[#F5A623]" />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex-1 space-y-3">
                <h3 className="text-xl font-bold text-slate-900 leading-tight">{course.title}</h3>
                <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-1">
                    <BarChart className="h-4 w-4" />
                    <span>{course.level}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.time}</span>
                  </div>
                </div>
              </div>
              <button className="mt-6 w-full py-2.5 bg-[#2E4A7D] hover:bg-[#2E4A7D]/90 text-white font-bold rounded-lg transition-colors">
                Explore Lessons
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 p-8 rounded-xl bg-[#2E4A7D]/5 border border-[#2E4A7D]/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h4 className="text-lg font-bold text-[#2E4A7D]">Can&apos;t find what you&apos;re looking for?</h4>
          <p className="text-slate-600">We are constantly adding new curriculum to the platform.</p>
        </div>
        <button className="px-6 py-2 border-2 border-[#2E4A7D] text-[#2E4A7D] font-bold rounded-lg hover:bg-[#2E4A7D] hover:text-white transition-all whitespace-nowrap">
          Request a Topic
        </button>
      </div>
    </div>
  )
}
