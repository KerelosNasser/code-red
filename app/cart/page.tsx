"use client"

import React, { useState } from "react"
import { Trash2, ShoppingBag, ArrowRight, Package, Loader2, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/lib/store/cart"
import { Button } from "@/components/ui/button"
import { getStoredAccess } from "@/lib/access-storage"
import { submitPurchaseAction } from "@/lib/actions"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

export default function CartPage() {
  const { items, removeItem, clearCart } = useCartStore()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const router = useRouter()
  const access = getStoredAccess()

  const total = items.reduce((sum, item) => sum + Number(item.price), 0)

  const handleCheckout = async () => {
    if (!access || access.role !== 'admin') {
      toast.error("Only administrators can complete purchases")
      return
    }

    setIsCheckingOut(true)
    try {
      const res = await submitPurchaseAction({ 
        productIds: items.map((i) => i.id),
        adminPhone: access.phone
      })
      if (res.success) {
        toast.success("Purchase successful! Your assets are now available for your team.")
        clearCart()
        router.push("/assets")
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Checkout failed"
      toast.error(message)
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (access && access.role !== 'admin') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
          <Lock className="h-10 w-10 text-slate-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Only</h1>
        <p className="mt-4 text-lg text-slate-600">
          Only administrators can access the checkout.
        </p>
        <Button asChild className="mt-8 bg-blue-900">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-32 text-center">
        <div className="mb-6 rounded-full bg-slate-100 p-6">
          <ShoppingBag className="h-12 w-12 text-slate-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="mt-2 text-lg text-slate-500">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <Link href="/store" className="mt-8">
          <Button className="bg-[#2E4A7D] px-8 py-6 text-lg font-bold hover:bg-[#2E4A7D]/90">
            Browse Store
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-12 text-4xl font-bold text-[#2E4A7D]">Shopping Cart</h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Package className="h-10 w-10 text-slate-300" />
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-slate-400 transition-colors hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <p className="mt-2 text-xl font-bold text-[#2E4A7D]">
                  ${Number(item.price).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Order Summary</h2>
            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between text-2xl font-bold text-[#2E4A7D]">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              className="mt-8 w-full bg-yellow-600 py-8 text-xl font-bold hover:bg-[#F5A623]"
              disabled={isCheckingOut}
              onClick={handleCheckout}
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Checkout <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            <p className="mt-4 text-center text-sm text-slate-500">
              Payments are simulated for this demonstration.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
