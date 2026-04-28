"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { getStoredAccess } from "@/lib/access-storage"
import { Button } from "./ui/button"
import { ShoppingCart, Menu, X } from "lucide-react"
import { useCartStore } from "@/lib/store/cart"

export function Navbar() {
  const pathname = usePathname()
  const [hasAccess, setHasAccess] = useState(false)
  const cartItemsCount = useCartStore((state) => state.items.length)
  const [isClient, setIsClient] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  if (pathname === "/register") {
    return null
  }

  const linkStyle = (path: string) =>
    `relative text-lg font-bold transition-all duration-300 w-fit
    ${pathname === path ? "text-white" : "text-white/80"} 
    hover:text-[#F5A623] after:absolute after:-bottom-1 after:left-0 
    after:h-[2px] after:w-0 after:bg-[#F5A623] after:transition-all 
    after:duration-300 hover:after:w-full`

  const CartLink = () => (
    <Link
      href="/cart"
      className="relative flex items-center text-white transition-colors hover:text-[#F5A623]"
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <ShoppingCart className="h-6 w-6" />
      {isClient && cartItemsCount > 0 && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-blue-950">
          {cartItemsCount}
        </span>
      )}
    </Link>
  )

  return (
    <nav className="sticky top-0 z-50 w-full bg-blue-950/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <img
            src="/icon-dara-logo.png"
            alt="DaRa Logo"
            className="h-20 w-auto object-contain transition-transform duration-300 hover:scale-105"
          />
          <span
            className="text-3xl font-bold text-white sm:text-4xl"
            style={{ WebkitTextStroke: "1/2px amber" }}
          >
            DaRa
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-6 md:flex">
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

          <CartLink />

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

        {/* Mobile Controls */}
        <div className="flex items-center gap-5 md:hidden">
          <CartLink />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white hover:text-[#F5A623] focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-7 w-7" />
            ) : (
              <Menu className="h-7 w-7" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-20 left-0 z-40 flex w-full flex-col gap-6 border-t border-blue-900/50 bg-blue-950/95 px-6 py-6 shadow-md backdrop-blur-md md:hidden">
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
          {!hasAccess && pathname !== "/register" && (
            <Button
              asChild
              className="mt-2 w-full rounded-xl bg-[#F5A623] py-6 text-lg font-semibold text-white shadow-md transition-all hover:bg-[#F5A623]/90"
            >
              <Link href="/register">Login</Link>
            </Button>
          )}
        </div>
      )}
    </nav>
  )
}
