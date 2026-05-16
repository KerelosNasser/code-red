import React from "react"
import HomeClient from "@/components/home-client"
import { getCachedCourses, getCachedProducts } from "@/lib/server-api"

export default async function HomePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let featuredCourses: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let featuredProducts: any[] = []

  try {
    const [coursesRes, productsRes] = await Promise.all([
      getCachedCourses(),
      getCachedProducts(),
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (coursesRes.success) featuredCourses = (coursesRes.data as any[])?.slice(0, 3) || []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (productsRes.success) featuredProducts = (productsRes.data as any[])?.slice(0, 3) || []
  } catch (error) {
    console.error("Failed to fetch home page data:", error)
  }

  return (
    <HomeClient 
      featuredCourses={featuredCourses} 
      featuredProducts={featuredProducts} 
    />
  )
}
