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
  ChevronRight
} from "lucide-react"
import { getStoredAccess, clearStoredAccess, type StoredAccess } from "@/lib/access-storage"
import { checkUserAccess, getCoursesFromGas, getProductsFromGas } from "@/lib/api-client"
import { Button } from "@/components/ui/button"

interface Course {
  id: string
  title: string
  description: string
}

interface Product {
  id: string
  title: string
  description: string
  price: string
  image_url?: string
}

export default function HomePage() {
  const [access, setAccess] = useState<StoredAccess | null>(null)
  const [isValidated, setIsValidated] = useState(false)
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const stored = getStoredAccess()
      setAccess(stored)
      
      try {
        // Background validation if stored access exists
        if (stored) {
          try {
            const result = await checkUserAccess(stored)
            if (result.data?.hasAccess) {
              setIsValidated(true)
            } else {
              // Rule: If backend cannot confirm it, clear local access
              clearStoredAccess()
              setIsValidated(false)
              setAccess(null)
            }
          } catch (error) {
            // Rule: home page shows the actual backend error message (or logs it)
            const message = error instanceof Error ? error.message : "Verification failed"
            console.error("Access verification error:", message)
            clearStoredAccess()
            setIsValidated(false)
            setAccess(null)
          }
        }

        // Fetch showcase data
        const [coursesRes, productsRes] = await Promise.all([
          getCoursesFromGas(),
          getProductsFromGas()
        ])

        if (coursesRes.success) setFeaturedCourses(coursesRes.data.slice(0, 3))
        if (productsRes.success) setFeaturedProducts(productsRes.data.slice(0, 3))
      } catch (error) {
        console.error("Failed to load home page data", error)
      } finally {
        setLoading(false)
      }
    }

    void init()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-32 border-b border-slate-100">
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] rounded-full bg-[#2E4A7D]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] rounded-full bg-[#F5A623]/5 blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Image src="/icon-dara-logo.png" alt="DaRa Logo" width={60} height={60} />
                <h1 className="text-5xl font-extrabold tracking-tight text-[#2E4A7D]">DaRa</h1>
              </div>
              <p className="text-sm font-bold tracking-[0.3em] text-red-700 uppercase">
                M&P Didaskalia Advanced Robotics Association
              </p>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight"
            >
              Empowering the Next Generation of <span className="text-[#2E4A7D]">Robotics Engineers</span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-slate-600 mb-10 max-w-2xl"
            >
              Join a community of innovators, builders, and learners. Access premium robotics curriculum and specialized components to bring your ideas to life.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {access && isValidated ? (
                <Button asChild size="lg" className="bg-[#2E4A7D] hover:bg-[#2E4A7D]/90 text-white h-14 px-8 text-lg font-bold rounded-xl shadow-lg shadow-blue-100">
                  <Link href="/courses" className="flex items-center gap-2">
                    Continue Learning <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="bg-[#2E4A7D] hover:bg-[#2E4A7D]/90 text-white h-14 px-8 text-lg font-bold rounded-xl shadow-lg shadow-blue-100">
                    <Link href="/register">Join the Association</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-slate-200 text-slate-600 hover:bg-slate-50 h-14 px-8 text-lg font-bold rounded-xl">
                    <Link href="/about">Learn More</Link>
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        </div>

        {/* Decorative Circuit Elements */}
        <div className="absolute left-10 top-1/2 -translate-y-1/2 hidden xl:block opacity-20 text-[#2E4A7D]">
          <CircuitBoard size={120} />
        </div>
        <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden xl:block opacity-20 text-[#F5A623]">
          <Cpu size={120} />
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex items-end justify-between mb-12 border-b border-slate-200 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#2E4A7D] font-bold uppercase tracking-wider text-sm">
              <BookOpen className="h-4 w-4" />
              <span>Education</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">Featured Courses</h3>
          </div>
          <Link href="/courses" className="group flex items-center gap-1 text-[#2E4A7D] font-bold hover:underline">
            View all courses <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-[400px] rounded-2xl bg-slate-100 animate-pulse" />
            ))
          ) : featuredCourses.length > 0 ? (
            featuredCourses.map((course) => (
              <motion.div
                key={course.id}
                whileHover={{ y: -5 }}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:border-[#2E4A7D]/20 hover:shadow-xl hover:shadow-blue-900/5"
              >
                <div className="h-40 bg-[#2E4A7D] relative overflow-hidden flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-[#F5A623] relative z-10" />
                  <div className="absolute inset-0 opacity-10">
                    <CircuitBoard className="w-full h-full scale-150 rotate-12" />
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#2E4A7D] transition-colors line-clamp-2">
                    {course.title}
                  </h4>
                  <p className="text-slate-600 text-sm mb-6 line-clamp-3">
                    {course.description || "Master advanced robotics concepts with our structured curriculum."}
                  </p>
                  <div className="mt-auto pt-6 border-t border-slate-50">
                    <Button asChild className="w-full bg-slate-50 hover:bg-[#2E4A7D] text-[#2E4A7D] hover:text-white font-bold transition-all border border-slate-100">
                      <Link href={`/courses?id=${course.id}`}>Start Learning</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
              <p className="text-slate-500 font-medium">Coming soon: Advanced curriculum updates.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2E4A7D] via-[#F5A623] to-[#2E4A7D]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#F5A623] font-bold uppercase tracking-wider text-sm">
                <ShoppingCart className="h-4 w-4" />
                <span>Components</span>
              </div>
              <h3 className="text-3xl font-bold">Specialized Store</h3>
            </div>
            <Link href="/store" className="group flex items-center gap-1 text-white/80 hover:text-white font-bold transition-colors">
              Explore catalog <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-[450px] rounded-2xl bg-white/5 animate-pulse" />
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <div 
                  key={product.id}
                  className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition-all hover:bg-white/10"
                >
                  <div className="aspect-square bg-white/10 relative flex items-center justify-center">
                    {product.image_url ? (
                      <Image 
                        src={product.image_url} 
                        alt={product.title} 
                        fill 
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <ShoppingCart className="h-16 w-16 text-white/20" />
                    )}
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold mb-2">{product.title}</h4>
                    <p className="text-white/60 text-sm mb-6 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#F5A623]">{product.price ? `$${product.price}` : "TBA"}</span>
                      <Button asChild size="sm" className="bg-white text-slate-900 hover:bg-[#F5A623] hover:text-white transition-colors font-bold">
                        <Link href="/store">View Details</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center rounded-2xl border border-white/10 bg-white/5">
                <p className="text-white/40 font-medium">New component kits are being prepared.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-20 opacity-40 grayscale transition-all hover:grayscale-0 hover:opacity-100">
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
      <footer className="mt-auto py-12 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} M&P Didaskalia Advanced Robotics Association (DaRa). All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
