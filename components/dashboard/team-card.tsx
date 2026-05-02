import React, { useState } from "react"
import {
  Users,
  ShieldCheck,
  ChevronRight,
  MoreVertical,
  Trash2,
  UserCircle,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MemberRow } from "./member-row"
import { type User as GasUser, type Team as GasTeam } from "@/lib/api-client"

export function TeamCard({
  team,
  users,
  onDeleteTeam,
  onDeleteUser,
  onOpenAddUser,
}: {
  team: GasTeam
  users: GasUser[]
  onDeleteTeam: (id: string) => void
  onDeleteUser: (id: string) => void
  onOpenAddUser: () => void
}) {
  const servants = users.filter((u) => u.role === "servant")
  const members = users.filter((u) => u.role === "member")
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-800 text-white">
            <UserCircle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-blue-800">{team.name}</h3>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-blue-500" />
                {servants.length} servants
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {members.length} members
              </span>
            </div>
          </div>
          <ChevronRight
            className={`ml-2 h-4 w-4 text-slate-400 transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-lg text-slate-400"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              className="text-red-600 focus:bg-red-50 focus:text-red-600"
              onClick={() => onDeleteTeam(team.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Team
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {expanded && (
        <div className="divide-y divide-slate-50">
          {servants.length > 0 && (
            <div className="px-4 py-3">
              <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-blue-600 uppercase">
                <ShieldCheck className="h-3 w-3" />
                Servants
              </p>
              <div>
                {servants.map((u) => (
                  <MemberRow key={u.id} user={u} onDelete={onDeleteUser} />
                ))}
              </div>
            </div>
          )}

          <div className="px-4 py-3">
            <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              <Users className="h-3 w-3" />
              Members
            </p>
            {members.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-6 text-center">
                <p className="text-sm py-3 text-center text-slate-400">
                  No members assigned yet
                </p>
                <Button
                  size="sm"
                  className="h-9 rounded-xl bg-red-700 font-semibold hover:bg-red-600"
                  onClick={onOpenAddUser}
                >
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                  Add Person
                </Button>
              </div>
            ) : (
              <div>
                {members.map((u) => (
                  <MemberRow key={u.id} user={u} onDelete={onDeleteUser} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
