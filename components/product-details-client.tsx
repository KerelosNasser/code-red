"use client"

import React from "react"
import { ArrowLeft, ShoppingCart, Package, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useCartStore } from "@/lib/store/cart"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: string
  title: string
  description: string
  price: string | number
  imageUrl?: string
}

interface ProductDetailsClientProps {
  product: Product
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl,
    })
    toast.success(`${product.title} added to cart`)
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
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
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
