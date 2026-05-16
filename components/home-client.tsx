"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  BookOpen,
  ShoppingCart,
  ArrowRight,
  Cpu,
  CircuitBoard,
  ShieldCheck,
  ChevronRight,
} from "lucide-react"
import {
  getStoredAccess,
  clearStoredAccess,
  isSessionValidated,
  setSessionValidated,
  type StoredAccess,
} from "@/lib/access-storage"
import { checkUserAccessAction } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { normalizePhoneNumber } from "@/lib/registration"

const ADMIN_PHONES = (
  process.env.NEXT_PUBLIC_ADMIN_PHONES ||
  process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE ||
  ""
)
  .split(",")
  .map((p) => normalizePhoneNumber(p.trim()))

interface HomeCourse {
  id: string;
  title: string;
  description?: string;
}

interface HomeProduct {
  id: string;
  title: string;
  description?: string;
  price?: string | number;
  imageUrl?: string;
}

interface HomeClientProps {
  featuredCourses: HomeCourse[]
  featuredProducts: HomeProduct[]
}

export default function HomeClient({ featuredCourses, featuredProducts }: HomeClientProps) {
  const router = useRouter()
  const [access, setAccess] = useState<StoredAccess | null>(null)
  const [isValidated, setIsValidated] = useState(false)

  useEffect(() => {
    const init = async () => {
      const stored = getStoredAccess()
      setAccess(stored)

      try {
        if (stored && stored.role === "admin" && ADMIN_PHONES.includes(normalizePhoneNumber(stored.phone))) {
          setIsValidated(true)
          setSessionValidated(true)
        } else if (stored && isSessionValidated()) {
          setIsValidated(true)
        } else if (stored) {
          try {
            const result = await checkUserAccessAction(stored)
            if (result.data?.hasAccess) {
              setIsValidated(true)
              setSessionValidated(true)
            } else {
              clearStoredAccess()
              setIsValidated(false)
              setAccess(null)
            }
          } catch (error) {
            console.error("Access verification error:", error)
          }
        }
      } catch (error) {
        console.error("Failed to load home page auth data", error)
      }
    }

    void init()
  }, [router])

  const isAdmin = access?.role === 'admin'

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-white py-10 lg:py-32">
        <div className="relative z-10 container mx-auto px-4">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6 flex items-center justify-center gap-3">
                <Image
                  src="/icon-dara-logo.png"
                  alt="DaRa Logo"
                  width={120}
                  height={120}
                />
                <h1 className="text-7xl font-extrabold tracking-tight text-blue-900">
                  DaRa
                </h1>
              </div>
              <p className="text-m font-bold tracking-[0.3em] text-red-700 uppercase">
                M&P Didaskalia Advanced Robotics Association
              </p>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-2 text-4xl leading-tight font-bold text-slate-900 md:text-6xl"
            >
              {access?.firstName ? (
                <>Welcome, <span className="text-[#2E4A7D]">{access.firstName}</span></>
              ) : (
                <>Empowering the Next Generation of
                <span className="text-[#2E4A7D]"> Robotics Engineers</span></>
              )}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-10 max-w-2xl text-lg text-slate-600"
            >
              Join a community of innovators, builders, and learners. Access
              premium robotics curriculum and specialized components to bring
              your ideas to life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <Button
                asChild
                size="lg"
                className="h-14 rounded-xl bg-[#2E4A7D] px-8 text-lg font-bold text-white shadow-lg shadow-blue-100 hover:bg-[#2E4A7D]/90"
              >
                <Link href="/courses" className="flex items-center gap-2">
                  Explore Courses <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              
              {!isValidated && (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-14 rounded-xl border-slate-200 px-8 text-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  <Link href="/register">Student Login</Link>
                </Button>
              )}
            </motion.div>
          </div>
        </div>

        {/* Decorative Circuit Elements */}
        <div className="top- absolute left-35 hidden -translate-y-1/2 text-[#2E4A7D] opacity-20 xl:block">
          <CircuitBoard size={150} />
        </div>
        <div className="absolute right-35 bottom-100 hidden -translate-y-1/2 text-[#F5A623] opacity-20 xl:block">
          <Cpu size={120} />
        </div>
      </section>

      {/* Featured Courses */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 flex items-end justify-between border-b border-slate-200 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-[#2E4A7D] uppercase">
              <BookOpen className="h-4 w-4" />
              <span>Education</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">
              Featured Courses
            </h3>
          </div>
          <Link
            href="/courses"
            className="group flex items-center gap-1 font-bold text-[#2E4A7D] hover:underline"
          >
            View all courses{" "}
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredCourses.length > 0 ? (
            featuredCourses.map((course) => (
              <motion.div
                key={course.id}
                whileHover={{ y: -5 }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-[#2E4A7D]/20 hover:shadow-xl hover:shadow-blue-900/5"
              >
                <div className="relative flex h-40 items-center justify-center overflow-hidden bg-[#2E4A7D]">
                  <BookOpen className="relative z-10 h-12 w-12 text-[#F5A623]" />
                  <div className="absolute inset-0 opacity-10">
                    <CircuitBoard className="h-full w-full scale-150 rotate-12" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h4 className="mb-3 line-clamp-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-[#2E4A7D]">
                    {course.title as string}
                  </h4>
                  <p className="mb-6 line-clamp-3 text-sm text-slate-600">
                    {course.description ||
                      "Master advanced robotics concepts with our structured curriculum."}
                  </p>
                  <div className="mt-auto border-t border-slate-50 pt-6">
                    <Button
                      asChild
                      className="w-full border border-slate-100 bg-slate-50 font-bold text-[#2E4A7D] transition-all hover:bg-[#2E4A7D] hover:text-white"
                    >
                      <Link href={`/courses?id=${course.id}`}>
                        Start Learning
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-20 text-center">
              <p className="font-medium text-slate-500">
                Coming soon: Advanced curriculum updates.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products - Only visible to Admins as Shop is restricted */}
      {isAdmin && (
        <section className="relative overflow-hidden bg-slate-900 py-20 text-white">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[#2E4A7D] via-[#F5A623] to-[#2E4A7D]" />

          <div className="relative z-10 container mx-auto px-4">
            <div className="mb-12 flex items-end justify-between border-b border-white/10 pb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-[#F5A623] uppercase">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Components</span>
                </div>
                <h3 className="text-3xl font-bold">Specialized Store</h3>
              </div>
              <Link
                href="/store"
                className="group flex items-center gap-1 font-bold text-white/80 transition-colors hover:text-white"
              >
                Explore catalog{" "}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:bg-white/10"
                  >
                    <div className="relative flex aspect-square items-center justify-center bg-white/10">
                      {product.imageUrl ? (
                                            <Image
                                              src={product.imageUrl}
                                              alt={product.title}

                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <ShoppingCart className="h-16 w-16 text-white/20" />
                      )}
                    </div>
                    <div className="p-6">
                      <h4 className="mb-2 text-xl font-bold">{product.title}</h4>
                      <p className="mb-6 line-clamp-2 text-sm text-white/60">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-[#F5A623]">
                          {product.price ? `$${product.price}` : "TBA"}
                        </span>
                        <Button
                          asChild
                          size="sm"
                          className="bg-white font-bold text-slate-900 transition-colors hover:bg-[#F5A623] hover:text-white"
                        >
                          <Link href="/store">View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 py-20 text-center">
                  <p className="font-medium text-white/40">
                    New component kits are being prepared.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Trust Bar */}
      <section className="border-t border-slate-100 bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40 grayscale transition-all hover:opacity-100 hover:grayscale-0 md:gap-20">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ShieldCheck className="h-6 w-6" />
              <span>Certified Learning</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Cpu className="h-6 w-6" />
              <span>Cutting Edge Tech</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <CircuitBoard className="h-6 w-6" />
              <span>Professional Network</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-slate-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            &copy; 2026 M&amp;P Didaskalia Advanced Robotics
            Association (DaRa). All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
