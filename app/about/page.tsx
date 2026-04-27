export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-4xl font-bold tracking-tight text-[#2E4A7D]">About DaRa</h1>
        <p className="mt-2 text-lg font-medium text-[#F5A623] uppercase tracking-wider">
          Didaskalia Advanced Robotics Association
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-6 text-slate-700 leading-relaxed">
          <p className="text-xl font-semibold text-slate-900">
            Pioneering the future of robotics education through structured learning and community engagement.
          </p>
          <p>
            DaRa is a dedicated association focused on bringing advanced robotics and engineering concepts to students and enthusiasts. Our mission is to bridge the gap between theoretical knowledge and practical application.
          </p>
          <p>
            Through our specialized curriculum, hands-on workshops, and competitive challenges, we prepare the next generation of innovators to excel in the rapidly evolving field of technology.
          </p>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm space-y-4">
          <h3 className="text-xl font-bold text-[#2E4A7D]">Our Core Values</h3>
          <ul className="space-y-3 list-disc list-inside text-slate-600 font-medium">
            <li>Precision in Engineering</li>
            <li>Structure in Learning</li>
            <li>Innovation in Design</li>
            <li>Excellence in Execution</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
