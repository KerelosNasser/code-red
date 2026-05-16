import React from "react"
import { Trash2 } from "lucide-react"
import { Avatar } from "./avatar"
import { type User as GasUser } from "@/lib/actions"

export function MemberRow({
  user,
  onDelete,
}: {
  user: GasUser
  onDelete: (id: string) => void
}) {
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown Member"
  const isServant = user.role === "servant"
  const phone = user.phone || ""
  const id = user.id || ""

  return (
    <div className="group flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50">
      <div className="flex items-center gap-3">
        <Avatar name={fullName} size="md" />
        <div>
          <p className="text-sm font-semibold text-slate-800">{fullName}</p>
          <p className="text-xs text-slate-400">{phone}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isServant && (
          <span className="rounded-full bg-yellow-600 px-2 py-0.5 text-[10px] font-bold tracking-wider text-yellow-50/90 uppercase">
            Servant
          </span>
        )}
        <button
          onClick={() => onDelete(id)}
          className="invisible flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition-colors group-hover:visible hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
