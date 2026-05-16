import React, { Suspense } from "react"
import Link from "next/link"
import ProductDetailsClient from "@/components/product-details-client"
import { getCachedProducts } from "@/lib/server-api"
import { MOCK_PRODUCTS } from "@/lib/mock-data"

interface PageProps {
  params: Promise<{ id: string }>
}

async function ProductContent({ params }: PageProps) {
  const { id } = await params
  let product = null

  try {
    const res = await getCachedProducts()
    if (res.success && res.data && res.data.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      product = (res.data as any[]).find((p) => String(p.id) === id)
    }
    
    if (!product) {
      product = MOCK_PRODUCTS.find((p) => String(p.id) === id)
    }
  } catch (error) {
    console.error("Failed to fetch product:", error)
    product = MOCK_PRODUCTS.find((p) => String(p.id) === id)
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Link href="/store" className="mt-4 text-[#2E4A7D] hover:underline">
          Back to Store
        </Link>
      </div>
    )
  }

  return <ProductDetailsClient product={product} />
}

export default function ProductDetailsPage({ params }: PageProps) {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="h-96 animate-pulse rounded-xl bg-slate-100" />
      </div>
    }>
      <ProductContent params={params} />
    </Suspense>
  )
}
