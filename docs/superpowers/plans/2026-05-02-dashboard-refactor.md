# Dashboard Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `app/dashboard/page.tsx` (~934 lines) into modular components and a custom hook to improve maintainability.

**Architecture:** 
- Extract UI to `components/dashboard/`.
- Extract business logic to `hooks/use-dashboard.ts`.
- Simplify `app/dashboard/page.tsx` to a layout shell.

**Tech Stack:** Next.js, React, Tailwind CSS, Lucide React, React Hook Form, Zod.

---

### Task 1: Basic Building Blocks

**Files:**
- Create: `components/dashboard/avatar.tsx`
- Create: `components/dashboard/stat-card.tsx`
- Create: `components/dashboard/member-row.tsx`

- [ ] **Step 1: Create Avatar component**
Move `Avatar` function from `page.tsx` to `components/dashboard/avatar.tsx`.

```tsx
import React from "react"

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const colors = [
    "#1e3a5f",
    "#9b1c1f",
    "#2d6a4f",
    "#7b2d8b",
    "#b5541a",
    "#1a5c7a",
  ]
  const color = colors[name.charCodeAt(0) % colors.length]

  const cls = size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs"

  return (
    <div
      className={`${cls} flex shrink-0 items-center justify-center rounded-full font-bold text-white`}
      style={{ background: color }}
    >
      {initials}
    </div>
  )
}
```

- [ ] **Step 2: Create StatCard component**
Move `StatCard` function from `page.tsx` to `components/dashboard/stat-card.tsx`.

```tsx
import React from "react"

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: number
  icon: React.ElementType
  accent: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div
        className="absolute top-0 right-0 h-20 w-20 rounded-bl-[3rem] opacity-10"
        style={{ background: accent }}
      />
      <div
        className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: `${accent}18` }}
      >
        <Icon className="h-5 w-5" style={{ color: accent }} />
      </div>
      <p className="text-3xl font-black tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-0.5 text-xs font-semibold tracking-wider text-slate-400 uppercase">
        {label}
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Create MemberRow component**
Move `MemberRow` function from `page.tsx` to `components/dashboard/member-row.tsx`.

```tsx
import React from "react"
import { Trash2 } from "lucide-react"
import { Avatar } from "./avatar"
import { type User as GasUser } from "@/lib/api-client"

export function MemberRow({
  user,
  onDelete,
}: {
  user: GasUser
  onDelete: (id: string) => void
}) {
  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown Member"
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
```

- [ ] **Step 4: Commit components**

```bash
git add components/dashboard/avatar.tsx components/dashboard/stat-card.tsx components/dashboard/member-row.tsx
git commit -m "refactor(dashboard): extract basic UI components"
```

---

### Task 2: Layout & Main Components

**Files:**
- Create: `components/dashboard/sidebar.tsx`
- Create: `components/dashboard/team-card.tsx`

- [ ] **Step 1: Create Sidebar component**
Move `Sidebar` function from `page.tsx` to `components/dashboard/sidebar.tsx`.

```tsx
import React from "react"
import {
  Menu,
  X,
  LayoutDashboard,
  UserCircle,
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
        <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-3 py-2.5 text-blue-900">
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <span className="text-sm font-semibold">Dashboard</span>
          )}
        </div>
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
```

- [ ] **Step 2: Create TeamCard component**
Move `TeamCard` function from `page.tsx` to `components/dashboard/team-card.tsx`.

```tsx
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
            <h3 className="text- font-bold text-blue-800">{team.name}</h3>
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
                <p className="text-m py-3 text-center text-slate-400">
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
```

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/sidebar.tsx components/dashboard/team-card.tsx
git commit -m "refactor(dashboard): extract sidebar and team card"
```

---

### Task 3: Dialogs Extraction

**Files:**
- Create: `components/dashboard/add-team-dialog.tsx`
- Create: `components/dashboard/add-user-dialog.tsx`
- Create: `components/dashboard/profile-dialog.tsx`

- [ ] **Step 1: Create AddTeamDialog**

```tsx
import React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AddTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTeam: (e: React.FormEvent) => void
  newTeamName: string
  setNewTeamName: (name: string) => void
  isAddingTeam: boolean
}

export function AddTeamDialog({
  open,
  onOpenChange,
  onAddTeam,
  newTeamName,
  setNewTeamName,
  isAddingTeam,
}: AddTeamDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
        </DialogHeader>
        <form onSubmit={onAddTeam} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Team Name</Label>
            <Input
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="e.g. RoboKnights"
              autoFocus
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-900 hover:bg-blue-800"
            disabled={isAddingTeam || !newTeamName.trim()}
          >
            {isAddingTeam ? "Creating..." : "Create Team"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Create AddUserDialog**

```tsx
import React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { type Team as GasTeam } from "@/lib/api-client"
import { UseFormReturn } from "react-hook-form"
import { type UserUpsertValues } from "@/lib/registration"

interface AddUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: UseFormReturn<UserUpsertValues>
  onAddUser: (values: UserUpsertValues) => void
  isAddingUser: boolean
  teams: GasTeam[]
}

export function AddUserDialog({
  open,
  onOpenChange,
  form,
  onAddUser,
  isAddingUser,
  teams,
}: AddUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Organization</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onAddUser)}
          className="mt-4 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                {...form.register("firstName")}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                {...form.register("lastName")}
                placeholder="Doe"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              {...form.register("phone")}
              placeholder="01XXXXXXXXX"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Team</Label>
              <select
                {...form.register("teamId")}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select a team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select
                {...form.register("role")}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="member">Member</option>
                <option value="servant">Servant</option>
              </select>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-red-700 hover:bg-red-600"
            disabled={isAddingUser}
          >
            {isAddingUser ? "Adding..." : "Add to Organization"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Create ProfileDialog**

```tsx
import React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateProfile: (e: React.FormEvent) => void
  firstName: string
  setFirstName: (v: string) => void
  lastName: string
  setLastName: (v: string) => void
  phone: string
  isUpdating: boolean
}

export function ProfileDialog({
  open,
  onOpenChange,
  onUpdateProfile,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  phone,
  isUpdating,
}: ProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Admin Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={onUpdateProfile} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Admin"
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Phone (Reference)</Label>
            <Input
              value={phone}
              disabled
              className="bg-slate-50"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-red-700 hover:bg-red-600"
            disabled={isUpdating}
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/add-team-dialog.tsx components/dashboard/add-user-dialog.tsx components/dashboard/profile-dialog.tsx
git commit -m "refactor(dashboard): extract dialog components"
```

---

### Task 4: Extract Dashboard Hook

**Files:**
- Create: `hooks/use-dashboard.ts`

- [ ] **Step 1: Implement use-dashboard hook**
Move state and logic from `page.tsx`.

```tsx
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  getManagedUsers,
  upsertUser,
  deleteUser,
  getTeams,
  createTeam,
  deleteTeam,
  getAdminProfile,
  updateAdminProfile,
  type User as GasUser,
  type Team as GasTeam,
  type AdminProfile,
} from "@/lib/api-client"
import { getStoredAccess, storeAccess } from "@/lib/access-storage"
import {
  normalizePhoneNumber,
  userUpsertSchema,
  type UserUpsertValues,
} from "@/lib/registration"

export function useDashboard() {
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)
  const [access, setAccess] = useState<ReturnType<typeof getStoredAccess>>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const [managedUsers, setManagedUsers] = useState<GasUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isAddingUser, setIsAddingUser] = useState(false)

  const [teams, setTeams] = useState<GasTeam[]>([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [isAddingTeam, setIsAddingTeam] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")

  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [profileFirstName, setProfileFirstName] = useState("")
  const [profileLastName, setProfileLastName] = useState("")

  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const fetchUsers = async (phone: string) => {
    setIsLoadingUsers(true)
    try {
      const result = await getManagedUsers(phone)
      setManagedUsers(result.data || [])
    } catch {
      toast.error("Failed to load team members")
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const fetchTeams = async (phone: string) => {
    setIsLoadingTeams(true)
    try {
      const result = await getTeams(phone)
      setTeams(result.data || [])
    } catch {
      toast.error("Failed to load teams")
    } finally {
      setIsLoadingTeams(false)
    }
  }

  const fetchAdminProfile = async (phone: string) => {
    try {
      const result = await getAdminProfile(phone)
      if (result.data) {
        setAdminProfile(result.data)
        setProfileFirstName(result.data.first_name || result.data.firstName || "")
        setProfileLastName(result.data.last_name || result.data.lastName || "")
        const stored = getStoredAccess()
        const fetchedFirstName = result.data.first_name || result.data.firstName
        const fetchedLastName = result.data.last_name || result.data.lastName
        if (
          stored &&
          (stored.firstName !== fetchedFirstName ||
            stored.lastName !== fetchedLastName)
        ) {
          storeAccess({
            ...stored,
            firstName: fetchedFirstName,
            lastName: fetchedLastName,
          })
        }
      }
    } catch {
      /* silent */
    }
  }

  useEffect(() => {
    const storedAccess = getStoredAccess()
    if (!storedAccess || storedAccess.role !== "admin") {
      setIsCheckingAccess(false)
      return
    }
    setAccess(storedAccess)
    setIsCheckingAccess(false)
    void fetchUsers(storedAccess.phone)
    void fetchTeams(storedAccess.phone)
    void fetchAdminProfile(storedAccess.phone)
  }, [])

  const userForm = useForm<UserUpsertValues>({
    resolver: zodResolver(userUpsertSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      role: "member",
      teamId: "",
    },
  })

  const onUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!access?.phone) return
    setIsUpdatingProfile(true)
    try {
      await updateAdminProfile({
        phone: access.phone,
        firstName: profileFirstName,
        lastName: profileLastName,
      })
      toast.success("Profile updated")
      setIsProfileOpen(false)
      void fetchAdminProfile(access.phone)
    } catch {
      toast.error("Failed to update profile")
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const onAddUser = async (values: UserUpsertValues) => {
    if (!access?.phone) {
      toast.error("Admin session not found. Please log in again.")
      return
    }

    setIsAddingUser(true)
    try {
      const normalizedPhone = normalizePhoneNumber(values.phone)
      const adminPhone = normalizePhoneNumber(access.phone)

      const duplicateUser = managedUsers.find(u => {
        const uPhone = u.phone || (u as any).Phone || (u as any).phoneNumber
        if (!uPhone) return false
        try {
          return normalizePhoneNumber(String(uPhone)) === normalizedPhone
        } catch {
          return false
        }
      })

      if (duplicateUser) {
        const dName = duplicateUser.first_name || duplicateUser.firstName || "Member"
        toast.error(`${dName} is already registered with this phone number.`)
        setIsAddingUser(false)
        return
      }

      const payload = {
        first_name: values.firstName,
        last_name: values.lastName,
        phone: normalizedPhone,
        role: values.role,
        team_id: values.teamId || "",
        managed_by: adminPhone,
        created_at: new Date().toISOString(),
      }

      const result = await upsertUser(payload)
      
      if (result.success) {
        toast.success(`${values.firstName} added to organization`)
        
        const newUser: GasUser = {
          id: result.data?.userId || Math.random().toString(36).substr(2, 9),
          first_name: values.firstName,
          last_name: values.lastName,
          phone: normalizedPhone,
          role: values.role,
          team_id: values.teamId || "",
          managed_by: adminPhone,
          created_at: new Date().toISOString(),
        }
        setManagedUsers((prev) => [newUser, ...prev])

        userForm.reset({
          firstName: "",
          lastName: "",
          phone: "",
          role: "member",
          teamId: "",
        })
        setIsAddUserOpen(false)
        setTimeout(() => void fetchUsers(access.phone), 1000)
      }
    } catch (err) {
      console.error("Critical error in onAddUser:", err)
      toast.error("Could not add person. Check your connection or the backend log.")
    } finally {
      setIsAddingUser(false)
    }
  }

  const onAddTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!access?.phone || !newTeamName.trim()) return
    setIsAddingTeam(true)
    try {
      await createTeam({ name: newTeamName.trim(), adminPhone: access.phone })
      toast.success("Team created successfully")
      setNewTeamName("")
      setIsAddTeamOpen(false)
      void fetchTeams(access.phone)
    } catch {
      toast.error("Failed to create team")
    } finally {
      setIsAddingTeam(false)
    }
  }

  const onDeleteTeam = async (teamId: string) => {
    if (!access?.phone) return
    if (!confirm("Delete this team? Members will become teamless.")) return
    try {
      await deleteTeam(teamId, access.phone)
      toast.success("Team deleted")
      void fetchTeams(access.phone)
    } catch {
      toast.error("Failed to delete team")
    }
  }

  const onDeleteUser = async (userId: string) => {
    if (!access?.phone) return
    if (!confirm("Remove this member?")) return
    try {
      await deleteUser(userId, access.phone)
      toast.success("Member removed")
      void fetchUsers(access.phone)
    } catch {
      toast.error("Failed to delete user")
    }
  }

  const refreshData = () => {
    if (access) {
      void fetchTeams(access.phone)
      void fetchUsers(access.phone)
    }
  }

  return {
    isCheckingAccess,
    access,
    sidebarCollapsed,
    setSidebarCollapsed,
    managedUsers,
    isLoadingUsers,
    isAddingUser,
    teams,
    isLoadingTeams,
    isAddingTeam,
    newTeamName,
    setNewTeamName,
    adminProfile,
    isUpdatingProfile,
    profileFirstName,
    setProfileFirstName,
    profileLastName,
    setProfileLastName,
    isAddTeamOpen,
    setIsAddTeamOpen,
    isAddUserOpen,
    setIsAddUserOpen,
    isProfileOpen,
    setIsProfileOpen,
    userForm,
    onUpdateProfile,
    onAddUser,
    onAddTeam,
    onDeleteTeam,
    onDeleteUser,
    refreshData,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/use-dashboard.ts
git commit -m "feat(dashboard): add useDashboard hook"
```

---

### Task 5: Refactor Dashboard Page

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Rewrite page.tsx**
Use the hook and components.

```tsx
"use client"
import React, { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Plus, UserPlus, Target, Users, ShieldCheck, User } from "lucide-react"
import { useRouter } from "next/navigation"

import { Sidebar } from "@/components/dashboard/sidebar"
import { StatCard } from "@/components/dashboard/stat-card"
import { TeamCard } from "@/components/dashboard/team-card"
import { MemberRow } from "@/components/dashboard/member-row"
import { AddTeamDialog } from "@/components/dashboard/add-team-dialog"
import { AddUserDialog } from "@/components/dashboard/add-user-dialog"
import { ProfileDialog } from "@/components/dashboard/profile-dialog"
import { useDashboard } from "@/hooks/use-dashboard"

export default function DashboardPage() {
  const router = useRouter()
  const d = useDashboard()

  useEffect(() => {
    if (!d.isCheckingAccess && (!d.access || d.access.role !== "admin")) {
      router.push("/register")
    }
  }, [d.isCheckingAccess, d.access, router])

  if (d.isCheckingAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    )
  }

  if (!d.access || d.access.role !== "admin") return null

  const adminDisplayName = d.adminProfile?.first_name || d.adminProfile?.firstName
    ? `${d.adminProfile.first_name || d.adminProfile.firstName} ${d.adminProfile.last_name || d.adminProfile.lastName || ""}`.trim()
    : "Administrator"

  const servantCount = d.managedUsers.filter((u) => u.role === "servant").length
  const memberCount = d.managedUsers.filter((u) => u.role === "member").length
  const isRefreshing = d.isLoadingUsers || d.isLoadingTeams

  const unassignedUsers = d.managedUsers.filter(
    (u) =>
      !(u.team_id || u.teamId) ||
      !d.teams.find((t) => t.id === (u.team_id || u.teamId))
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar
        adminName={adminDisplayName}
        phone={d.access.phone}
        teamCount={d.teams.length}
        memberCount={memberCount}
        servantCount={servantCount}
        onOpenProfile={() => d.setIsProfileOpen(true)}
        collapsed={d.sidebarCollapsed}
        onToggle={() => d.setSidebarCollapsed((v) => !v)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div>
            <h1 className="text-sm font-black text-slate-900 md:text-lg">Organization Overview</h1>
            <p className="hidden text-slate-400 md:text-xs">Manage your teams and members</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={d.refreshData}
              disabled={isRefreshing}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>

            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-xl border-slate-200 font-semibold text-slate-700"
              onClick={() => d.setIsAddTeamOpen(true)}
            >
              <Target className="mr-1.5 h-3.5 w-3.5" />
              New Team
            </Button>

            <Button
              size="sm"
              className="h-9 rounded-xl bg-red-700 font-semibold hover:bg-red-600"
              onClick={() => d.setIsAddUserOpen(true)}
            >
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Add Person
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Total Teams" value={d.teams.length} icon={Target} accent="#1e3a5f" />
            <StatCard label="Total Members" value={d.managedUsers.length} icon={Users} accent="#9b1c1f" />
            <StatCard label="Servants" value={servantCount} icon={ShieldCheck} accent="#2d6a4f" />
            <StatCard label="Members" value={memberCount} icon={User} accent="#b5541a" />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Teams &amp; Members</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
              {d.teams.length} teams
            </span>
          </div>

          {d.teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                <User className="h-8 w-8 text-blue-900" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Teams Yet</h3>
              <p className="mt-1 max-w-xs text-sm text-slate-400">
                Create your first team to start organizing members into groups.
              </p>
              <Button
                onClick={() => d.setIsAddTeamOpen(true)}
                className="mt-6 rounded-xl bg-blue-900 hover:bg-blue-800"
              >
                <Plus className="mr-2 h-4 w-4" /> Create First Team
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {d.teams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  users={d.managedUsers.filter((u) => (u.team_id || u.teamId) === team.id)}
                  onDeleteTeam={d.onDeleteTeam}
                  onDeleteUser={d.onDeleteUser}
                  onOpenAddUser={() => d.setIsAddUserOpen(true)}
                />
              ))}

              {unassignedUsers.length > 0 && (
                <div className="mt-8">
                  <h3 className="mb-3 text-xs font-bold tracking-widest text-slate-400 uppercase">Unassigned Members</h3>
                  <div className="rounded-2xl border border-slate-200 bg-white p-2">
                    {unassignedUsers.map((u) => (
                      <MemberRow key={u.id} user={u} onDelete={d.onDeleteUser} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <AddTeamDialog
        open={d.isAddTeamOpen}
        onOpenChange={d.setIsAddTeamOpen}
        onAddTeam={d.onAddTeam}
        newTeamName={d.newTeamName}
        setNewTeamName={d.setNewTeamName}
        isAddingTeam={d.isAddingTeam}
      />

      <AddUserDialog
        open={d.isAddUserOpen}
        onOpenChange={d.setIsAddUserOpen}
        form={d.userForm}
        onAddUser={d.onAddUser}
        isAddingUser={d.isAddingUser}
        teams={d.teams}
      />

      <ProfileDialog
        open={d.isProfileOpen}
        onOpenChange={d.setIsProfileOpen}
        onUpdateProfile={d.onUpdateProfile}
        firstName={d.profileFirstName}
        setFirstName={d.setProfileFirstName}
        lastName={d.profileLastName}
        setLastName={d.setProfileLastName}
        phone={d.access.phone}
        isUpdating={d.isUpdatingProfile}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "refactor(dashboard): simplify page.tsx using components and hook"
```

---

### Task 6: Final Verification

- [ ] **Step 1: Run type check**
Run: `pnpm tsc --noEmit`
Expected: No errors related to dashboard.

- [ ] **Step 2: Verify imports**
Check all files for correct relative imports and `@/` aliases.
