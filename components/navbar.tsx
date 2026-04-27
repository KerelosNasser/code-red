"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { getStoredAccess } from "@/lib/access-storage"
import { Button } from "./ui/button"

export function Navbar() {
  const pathname = usePathname()
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const checkAccess = () => {
      setHasAccess(Boolean(getStoredAccess()))
    }

    checkAccess()
    window.addEventListener("storage", checkAccess)
    window.addEventListener("dara_access_granted", checkAccess)

    return () => {
      window.removeEventListener("storage", checkAccess)
      window.removeEventListener("dara_access_granted", checkAccess)
    }
  }, [])

  const linkStyle = (path: string) =>
    `relative text-lg font-bold transition-all duration-300 
    ${pathname === path ? "text-white" : "text-white/80"} 
    hover:text-[#F5A623] after:absolute after:-bottom-1 after:left-0 
    after:h-[2px] after:w-0 after:bg-[#F5A623] after:transition-all 
    after:duration-300 hover:after:w-full`

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-blue-950/90 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-around">
        
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img
            src="/icon-dara-logo.png"
            alt="DaRa Logo"
            className="h-20 w-auto object-contain transition-transform duration-300 hover:scale-105"
          />
          <span className="text-4xl font-bold text-red-600">DaRa</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link href="/about" className={linkStyle("/about")}>
            About
          </Link>

          {hasAccess && (
            <>
              <Link href="/store" className={linkStyle("/store")}>
                Store
              </Link>
              <Link href="/courses" className={linkStyle("/courses")}>
                Courses
              </Link>
            </>
          )}

          {!hasAccess && pathname !== "/register" && (
            <Button
              asChild
              size="sm"
              className="bg-[#F5A623] hover:bg-[#F5A623]/90 text-white font-semibold px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Link href="/register">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}