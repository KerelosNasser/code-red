import React from "react"
import StoreClient from "@/components/store-client"
import { getCachedProducts } from "@/lib/server-api"
import { MOCK_PRODUCTS } from "@/lib/mock-data"

export default async function StorePage() {
  let products = []

  try {
    const res = await getCachedProducts()
    if (res.success && res.data && res.data.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      products = res.data as any[]
    } else {
      products = MOCK_PRODUCTS
    }
  } catch (error) {
    console.error("Failed to fetch products:", error)
    products = MOCK_PRODUCTS
  }

  return <StoreClient initialProducts={products} />
}
