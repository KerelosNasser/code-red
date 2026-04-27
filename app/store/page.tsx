"use client"

import React, { useEffect, useState } from "react"
import { ShoppingCart, Package, Info } from "lucide-react"
import Link from "next/link"
import { getProductsFromGas } from "@/lib/api-client"
import { MOCK_PRODUCTS } from "@/lib/mock-data"
import { useCartStore } from "@/lib/store/cart"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Product {
  id: string
  title: string
  description: string
  price: string | number
  image_url?: string
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProductsFromGas()
        if (res.success && res.data?.length > 0) {
          setProducts(res.data)
        } else {
          setProducts(MOCK_PRODUCTS)
        }
      } catch (error) {
        console.error("Failed to fetch products:", error)
        setProducts(MOCK_PRODUCTS)
      } finally {
        setLoading(false)
      }
    }
    void fetchProducts()
  }, [])

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image_url: product.image_url,
    })
    toast.success(`${product.title} added to cart`)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 flex items-end justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#2E4A7D]">
            Store
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Professional robotics equipment and specialized kits.
          </p>
        </div>
        <Link
          href="/cart"
          className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 font-semibold text-[#2E4A7D] transition-colors hover:bg-slate-200"
        >
          <ShoppingCart className="h-5 w-5" />
          <span>My Cart</span>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-96 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-md"
            >
              <div className="relative flex h-50 items-center justify-center overflow-hidden bg-slate-100">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <Package className="h-16 w-16 text-slate-300" />
                )}
                <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="flex flex-1 flex-col space-y-4 p-6">
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {product.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-slate-500">
                    {product.description}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xl font-bold text-[#2E4A7D]">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  <div className="flex gap-2">
                    <Link href={`/store/${product.id}`}>
                      <Button variant="outline" size="sm">
                        <Info className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      className="bg-yellow-600 font-bold hover:bg-[#F5A623]"
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <p className="font-medium text-slate-500 italic">
            Full catalog coming soon...
          </p>
        </div>
      )}
    </div>
  )
}
