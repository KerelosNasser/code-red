"use client"
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Users,
  User,
  Plus,
  Trash2,
  ShieldCheck,
  RefreshCw,
  Settings,
  UserPlus,
  Target,
  UserCircle,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  MoreVertical,
  Hash,
  TrendingUp,
  Menu,
  X,
  Group,
} from "lucide-react"
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
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
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

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
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

// ─── Member Row ───────────────────────────────────────────────────────────────

function MemberRow({
  user,
  onDelete,
}: {
  user: GasUser
  onDelete: (id: string) => void
}) {
  const fullName = `${user.first_name} ${user.last_name}`.trim()
  const isServant = user.role === "servant"

  return (
    <div className="group flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50">
      <div className="flex items-center gap-3">
        <Avatar name={fullName} size="md" />
        <div>
          <p className="text-sm font-semibold text-slate-800">{fullName}</p>
          <p className="text-xs text-slate-400">{user.phone}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isServant && (
          <span className="rounded-full bg-yellow-600 px-2 py-0.5 text-[10px] font-bold tracking-wider text-yellow-50/90 uppercase">
            Servant
          </span>
        )}
        <button
          onClick={() => onDelete(user.id)}
          className="invisible flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition-colors group-hover:visible hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Team Card ────────────────────────────────────────────────────────────────

function TeamCard({
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
      {/* Team Header */}
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

      {/* Team Body */}
      {expanded && (
        <div className="divide-y divide-slate-50">
          {/* Servants */}
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

          {/* Members */}
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

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  adminName,
  phone,
  teamCount,
  memberCount,
  servantCount,
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
      {/* Logo / Toggle */}
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

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-3 py-2.5 text-blue-900">
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <span className="text-sm font-semibold">Dashboard</span>
          )}
        </div>
      </nav>

      {/* Admin Profile CTA */}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
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
        setProfileFirstName(result.data.first_name || "")
        setProfileLastName(result.data.last_name || "")
        const stored = getStoredAccess()
        if (
          stored &&
          (stored.firstName !== result.data.first_name ||
            stored.lastName !== result.data.last_name)
        ) {
          storeAccess({
            ...stored,
            firstName: result.data.first_name,
            lastName: result.data.last_name,
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
      router.push("/register")
      return
    }
    setAccess(storedAccess)
    setIsCheckingAccess(false)
    void fetchUsers(storedAccess.phone)
    void fetchTeams(storedAccess.phone)
    void fetchAdminProfile(storedAccess.phone)
  }, [router]) // eslint-disable-line react-hooks/exhaustive-deps

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
    if (!access?.phone) return
    setIsAddingUser(true)
    try {
      const normalizedPhone = normalizePhoneNumber(values.phone)
      await upsertUser({
        first_name: values.firstName,
        last_name: values.lastName,
        phone: normalizedPhone,
        role: values.role,
        team_id: values.teamId,
        managed_by: normalizePhoneNumber(access.phone),
        created_at: new Date().toISOString(),
      })
      toast.success(`${values.firstName} added successfully`)
      userForm.reset()
      setIsAddUserOpen(false)
      void fetchUsers(access.phone)
    } catch {
      toast.error("Failed to add user")
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

  if (isCheckingAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    )
  }

  const adminDisplayName = adminProfile?.first_name
    ? `${adminProfile.first_name} ${adminProfile.last_name || ""}`.trim()
    : "Administrator"

  const servantCount = managedUsers.filter((u) => u.role === "servant").length
  const memberCount = managedUsers.filter((u) => u.role === "member").length
  const isRefreshing = isLoadingUsers || isLoadingTeams

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* ── Sidebar ── */}
      <Sidebar
        adminName={adminDisplayName}
        phone={access?.phone ?? ""}
        teamCount={teams.length}
        memberCount={memberCount}
        servantCount={servantCount}
        onOpenProfile={() => setIsProfileOpen(true)}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div>
            <h1 className="text-sm font-black text-slate-900 md:text-lg">
              Organization Overview
            </h1>
            <p className="hidden text-slate-400 md:text-xs">
              Manage your teams and members
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (access) {
                  void fetchTeams(access.phone)
                  void fetchUsers(access.phone)
                }
              }}
              disabled={isRefreshing}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>

            {/* Add Team */}
            <Dialog open={isAddTeamOpen} onOpenChange={setIsAddTeamOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl border-slate-200 font-semibold text-slate-700"
                >
                  <Target className="mr-1.5 h-3.5 w-3.5" />
                  New Team
                </Button>
              </DialogTrigger>
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

            {/* Add Person */}
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="h-9 rounded-xl bg-red-700 font-semibold hover:bg-red-600"
                >
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                  Add Person
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add to Organization</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={userForm.handleSubmit(onAddUser)}
                  className="mt-4 space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        {...userForm.register("firstName")}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        {...userForm.register("lastName")}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      {...userForm.register("phone")}
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Team</Label>
                      <select
                        {...userForm.register("teamId")}
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
                        {...userForm.register("role")}
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
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stat Cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              label="Total Teams"
              value={teams.length}
              icon={Target}
              accent="#1e3a5f"
            />
            <StatCard
              label="Total Members"
              value={managedUsers.length}
              icon={Users}
              accent="#9b1c1f"
            />
            <StatCard
              label="Servants"
              value={servantCount}
              icon={ShieldCheck}
              accent="#2d6a4f"
            />
            <StatCard
              label="Members"
              value={memberCount}
              icon={User}
              accent="#b5541a"
            />
          </div>

          {/* Section header */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase">
              Teams &amp; Members
            </h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
              {teams.length} teams
            </span>
          </div>

          {/* Team Cards or Empty State */}
          {teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                <User className="h-8 w-8 text-blue-900" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Teams Yet</h3>
              <p className="mt-1 max-w-xs text-sm text-slate-400">
                Create your first team to start organizing members into groups.
              </p>
              <Button
                onClick={() => setIsAddTeamOpen(true)}
                className="mt-6 rounded-xl bg-blue-900 hover:bg-blue-800"
              >
                <Plus className="mr-2 h-4 w-4" /> Create First Team
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {teams.map((team) => {
                const teamUsers = managedUsers.filter(
                  (u) => u.team_id === team.id
                )
                return (
                  <TeamCard
                    key={team.id}
                    team={team}
                    users={teamUsers}
                    onDeleteTeam={onDeleteTeam}
                    onDeleteUser={onDeleteUser}
                    onOpenAddUser={() => setIsAddUserOpen(true)}
                  />
                )
              })}

              {/* Unassigned Members */}
              {managedUsers.filter(
                (u) => !u.team_id || !teams.find((t) => t.id === u.team_id)
              ).length > 0 && (
                <div className="mt-8">
                  <h3 className="mb-3 text-xs font-bold tracking-widest text-slate-400 uppercase">
                    Unassigned Members
                  </h3>
                  <div className="rounded-2xl border border-slate-200 bg-white p-2">
                    {managedUsers
                      .filter(
                        (u) =>
                          !u.team_id || !teams.find((t) => t.id === u.team_id)
                      )
                      .map((u) => (
                        <MemberRow
                          key={u.id}
                          user={u}
                          onDelete={onDeleteUser}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Profile Dialog ── */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Admin Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={onUpdateProfile} className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={profileFirstName}
                  onChange={(e) => setProfileFirstName(e.target.value)}
                  placeholder="Admin"
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={profileLastName}
                  onChange={(e) => setProfileLastName(e.target.value)}
                  placeholder="Name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone (Reference)</Label>
              <Input
                value={access?.phone || ""}
                disabled
                className="bg-slate-50"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-red-700 hover:bg-red-600"
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
