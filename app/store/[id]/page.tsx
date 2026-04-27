"use client"

import React, { useEffect, useState, use } from "react"
import { ArrowLeft, ShoppingCart, Package, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { getProductsFromGas } from "@/lib/api-client"
import { MOCK_PRODUCTS } from "@/lib/mock-data"
import { useCartStore } from "@/lib/store/cart"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: string
  title: string
  description: string
  price: string | number
  image_url?: string
}

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProductsFromGas()
        let found = null
        if (res.success && res.data?.length > 0) {
          found = res.data.find((p: Product) => String(p.id) === id)
        }
        
        if (!found) {
          found = MOCK_PRODUCTS.find((p) => String(p.id) === id)
        }
        
        setProduct(found || null)
      } catch (error) {
        console.error("Failed to fetch product:", error)
        const found = MOCK_PRODUCTS.find((p) => String(p.id) === id)
        setProduct(found || null)
      } finally {
        setLoading(false)
      }
    }
    void fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (product) {
      addItem({
        id: product.id,
        title: product.title,
        price: product.price,
        image_url: product.image_url,
      })
      toast.success(`${product.title} added to cart`)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="h-96 animate-pulse rounded-xl bg-slate-100" />
      </div>
    )
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/store"
        className="mb-8 flex w-fit items-center gap-2 text-slate-500 transition-colors hover:text-[#2E4A7D]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Store</span>
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Product Image */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-8">
          <div className="relative flex aspect-square items-center justify-center">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="h-full w-full object-contain"
              />
            ) : (
              <Package className="h-32 w-32 text-slate-200" />
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col space-y-8">
          <div className="space-y-4">
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
              In Stock
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#2E4A7D]">
              {product.title}
            </h1>
            <p className="text-3xl font-bold text-slate-900">
              ${Number(product.price).toFixed(2)}
            </p>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Description
            </h3>
            <p className="text-lg leading-relaxed text-slate-600">
              {product.description}
            </p>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-8">
            <div className="flex items-center gap-3 text-slate-600">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Free technical support</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Certified components</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <Button
              size="lg"
              className="flex-1 bg-yellow-600 text-lg font-bold hover:bg-[#F5A623]"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Link href="/cart">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                View Cart
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
