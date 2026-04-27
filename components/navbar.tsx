"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function Navbar() {
  const pathname = usePathname()
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    // Check localStorage on mount and when storage event fires
    const checkAccess = () => {
      setHasAccess(localStorage.getItem("dara_has_submitted") === "true")
    }
    
    checkAccess()
    window.addEventListener("storage", checkAccess)
    // Custom event to update navbar instantly from the form submission
    window.addEventListener("dara_access_granted", checkAccess)
    
    return () => {
      window.removeEventListener("storage", checkAccess)
      window.removeEventListener("dara_access_granted", checkAccess)
    }
  }, [])

  if (!hasAccess) return null

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-[#2E4A7D] text-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Da<span className="text-[#F5A623]">Ra</span>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Link 
            href="/about" 
            className={`text-sm font-medium transition-colors hover:text-[#F5A623] ${pathname === "/about" ? "text-[#F5A623]" : "text-white/90"}`}
          >
            About
          </Link>
          <Link 
            href="/store" 
            className={`text-sm font-medium transition-colors hover:text-[#F5A623] ${pathname === "/store" ? "text-[#F5A623]" : "text-white/90"}`}
          >
            Store
          </Link>
          <Link 
            href="/courses" 
            className={`text-sm font-medium transition-colors hover:text-[#F5A623] ${pathname === "/courses" ? "text-[#F5A623]" : "text-white/90"}`}
          >
            Courses
          </Link>
        </div>
      </div>
    </nav>
  )
}
