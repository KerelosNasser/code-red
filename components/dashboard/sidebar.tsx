import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu,
  X,
  LayoutDashboard,
  UserCircle,
  BookOpen,
} from "lucide-react"

export function Sidebar({
  adminName,
  phone,
  onOpenProfile,
  collapsed,
  onToggle,
}: {
  adminName: string
  phone: string
  teamCount: number
  memberCount: number
  servantCount: number
  onOpenProfile: () => void
  collapsed: boolean
  onToggle: () => void
}) {
  const pathname = usePathname()

  return (
    <aside
      className={`hidden h-full flex-col border-r border-slate-200 bg-white transition-all duration-300 md:flex ${collapsed ? "w-16" : "w-64"} `}
    >
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
        {!collapsed && (
          <span className="text-lg font-black tracking-tight text-blue-900">
            DARA<span className="text-red-600">.</span>admin
          </span>
        )}
        <button
          onClick={onToggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <Link 
          href="/dashboard"
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${pathname === "/dashboard" ? "bg-blue-50 text-blue-900" : "text-slate-500 hover:bg-slate-50"}`}
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <span className="text-sm font-semibold">Dashboard</span>
          )}
        </Link>
        
        <Link 
          href="/dashboard/courses"
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${pathname.startsWith("/dashboard/courses") ? "bg-blue-50 text-blue-900" : "text-slate-500 hover:bg-slate-50"}`}
        >
          <BookOpen className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <span className="text-sm font-semibold">Courses</span>
          )}
        </Link>
      </nav>

      <div className="border-t border-slate-100 p-3">
        <button
          onClick={onOpenProfile}
          className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-slate-50 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-700">
            <UserCircle className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-800">
                {adminName}
              </p>
              <p className="truncate text-xs text-slate-400">{phone}</p>
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}
