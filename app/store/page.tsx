import { ShoppingCart } from "lucide-react"

export default function StorePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 border-b border-slate-200 pb-5 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#2E4A7D]">Store</h1>
          <p className="mt-2 text-lg text-slate-600">Professional robotics equipment and specialized kits.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-[#2E4A7D] font-semibold">
          <ShoppingCart className="h-5 w-5" />
          <span>Catalog</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder for Product Cards */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-md">
            <div className="aspect-square bg-slate-100 flex items-center justify-center relative overflow-hidden">
              <span className="text-slate-400 font-medium">Product Image {i}</span>
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Robotics Component Kit {i}</h3>
                <p className="text-sm text-slate-500 line-clamp-2">High-precision components for advanced robotics applications.</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xl font-bold text-[#2E4A7D]">$0.00</span>
                <button className="px-4 py-2 bg-[#F5A623] hover:bg-[#F5A623]/90 text-white text-sm font-bold rounded-lg transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
        <p className="text-slate-500 font-medium italic">Full catalog coming soon...</p>
      </div>
    </div>
  )
}
