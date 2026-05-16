"use client"

import React, { useEffect, useState } from "react"
import { Package, Download, ExternalLink, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { getUserAssetsAction } from "@/lib/actions"
import { getStoredAccess } from "@/lib/access-storage"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: string
  title: string
  description: string
  price: string | number
  imageUrl?: string
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const fetchAssets = async () => {
      const access = getStoredAccess()
      if (!access) {
        setLoading(false)
        return
      }

      setHasAccess(true)
      try {
        const res = await getUserAssetsAction(access)
        if (res.success) {
          setAssets((res.data as unknown as Product[]) || [])
        }
      } catch (error) {
        console.error("Failed to fetch assets:", error)
      } finally {
        setLoading(false)
      }
    }
    void fetchAssets()
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 h-10 w-48 animate-pulse rounded bg-slate-100" />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-32 text-center">
        <ShieldCheck className="mb-6 h-16 w-16 text-slate-300" />
        <h2 className="text-3xl font-bold text-slate-900">Access Restricted</h2>
        <p className="mt-2 text-lg text-slate-500">
          Please register or login to view your purchased assets.
        </p>
        <Link href="/" className="mt-8">
          <Button className="bg-[#2E4A7D] px-8 py-6 text-lg font-bold">
            Go to Home
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 border-b border-slate-200 pb-5">
        <h1 className="text-4xl font-bold tracking-tight text-[#2E4A7D]">
          My Assets
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Manage your purchased robotics kits and digital resources.
        </p>
      </div>

      {assets.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-md"
            >
              <div className="relative flex h-48 items-center justify-center bg-slate-50">
                {asset.imageUrl ? (
                  <img
                    src={asset.imageUrl}
                    alt={asset.title}
                    className="h-full w-full object-contain p-4"
                  />
                ) : (
                  <Package className="h-12 w-12 text-slate-300" />
                )}
                <Badge className="absolute top-4 right-4 bg-green-100 text-green-800 hover:bg-green-100">
                  Owned
                </Badge>
              </div>
              <div className="flex flex-1 flex-col space-y-4 p-6">
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {asset.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-slate-500">
                    {asset.description}
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-4">
                  <Button variant="outline" className="w-full justify-between">
                    Download Documentation
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button className="w-full justify-between bg-[#2E4A7D] hover:bg-[#2E4A7D]/90">
                    View Resource Center
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-24 text-center">
          <Package className="mb-4 h-12 w-12 text-slate-300" />
          <p className="text-xl font-medium text-slate-500">
            You don&apos;t own any assets yet.
          </p>
          <Link href="/store" className="mt-6">
            <Button variant="outline">Visit Store</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
