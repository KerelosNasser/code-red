import React from "react"
import HomeClient from "@/components/home-client"
import { getCachedCourses, getCachedProducts } from "@/lib/server-api"

export default async function HomePage() {
  let featuredCourses = []
  let featuredProducts = []

  try {
    const [coursesRes, productsRes] = await Promise.all([
      getCachedCourses(),
      getCachedProducts(),
    ])

    if (coursesRes.success) featuredCourses = coursesRes.data?.slice(0, 3) || []
    if (productsRes.success) featuredProducts = productsRes.data?.slice(0, 3) || []
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
