"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { getStoredAccess } from "@/lib/access-storage"
import { Button } from "./ui/button"
import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/lib/store/cart"

export function Navbar() {
  const pathname = usePathname()
  const [hasAccess, setHasAccess] = useState(false)
  const cartItemsCount = useCartStore((state) => state.items.length)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsClient(true), 0)
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
    <nav className="sticky top-0 z-50 w-full bg-blue-950/90 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-around px-4">
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
          <Link href="/store" className={linkStyle("/store")}>
            Store
          </Link>

          {hasAccess && (
            <>
              <Link href="/courses" className={linkStyle("/courses")}>
                Courses
              </Link>
              <Link href="/assets" className={linkStyle("/assets")}>
                Assets
              </Link>
            </>
          )}

          <Link
            href="/cart"
            className="relative text-white transition-colors hover:text-[#F5A623]"
          >
            <ShoppingCart className="h-6 w-6" />
            {isClient && cartItemsCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-blue-950">
                {cartItemsCount}
              </span>
            )}
          </Link>

          {!hasAccess && pathname !== "/register" && (
            <Button
              asChild
              size="sm"
              className="rounded-xl bg-[#F5A623] px-5 py-2 font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#F5A623]/90 hover:shadow-lg"
            >
              <Link href="/register">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
