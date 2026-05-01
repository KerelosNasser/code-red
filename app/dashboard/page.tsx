"use client"
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Users,
  User,
  ArrowLeft,
  Plus,
  Trash2,
  ShieldCheck,
  RefreshCw,
  Settings,
  UserPlus,
  Target,
  UserCircle,
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
import {
  getStoredAccess,
  storeAccess,
} from "@/lib/access-storage"
import {
  normalizePhoneNumber,
  userUpsertSchema,
  type UserUpsertValues,
} from "@/lib/registration"
import Link from "next/link"
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DashboardPage() {
  const router = useRouter()
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)
  const [access, setAccess] = useState<ReturnType<typeof getStoredAccess>>(null)

  // Dashboard states
  const [managedUsers, setManagedUsers] = useState<GasUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isAddingUser, setIsAddingUser] = useState(false)

  // Teams states
  const [teams, setTeams] = useState<GasTeam[]>([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [isAddingTeam, setIsAddingTeam] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")

  // Admin Profile state
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [profileFirstName, setProfileFirstName] = useState("")
  const [profileLastName, setProfileLastName] = useState("")

  // Dialog states
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const fetchUsers = async (phone: string) => {
    setIsLoadingUsers(true)
    try {
      const result = await getManagedUsers(phone)
      setManagedUsers(result.data || [])
    } catch (error) {
      console.error(error)
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
    } catch (error) {
      console.error(error)
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
        
        // Update local storage if needed
        const stored = getStoredAccess()
        if (stored && (stored.firstName !== result.data.first_name || stored.lastName !== result.data.last_name)) {
          storeAccess({
            ...stored,
            firstName: result.data.first_name,
            lastName: result.data.last_name
          })
        }
      }
    } catch (error) {
      console.error("Failed to load admin profile", error)
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
    
    // Initial fetch
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
        lastName: profileLastName
      })
      toast.success("Profile updated")
      setIsProfileOpen(false)
      void fetchAdminProfile(access.phone)
    } catch (error) {
      console.error(error)
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
        firstName: values.firstName,
        lastName: values.lastName,
        phone: normalizedPhone,
        role: values.role,
        teamId: values.teamId,
        managedBy: normalizePhoneNumber(access.phone),
        createdAt: new Date().toISOString(),
      })
      toast.success(`${values.firstName} added successfully`)
      userForm.reset()
      setIsAddUserOpen(false)
      void fetchUsers(access.phone)
    } catch (error) {
      console.error(error)
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
      await createTeam({
        name: newTeamName.trim(),
        adminPhone: access.phone,
      })
      toast.success("Team created successfully")
      setNewTeamName("")
      setIsAddTeamOpen(false)
      void fetchTeams(access.phone)
    } catch (error) {
      console.error(error)
      toast.error("Failed to create team")
    } finally {
      setIsAddingTeam(false)
    }
  }

  const onDeleteTeam = async (teamId: string) => {
    if (!access?.phone) return
    if (
      !confirm(
        "Are you sure you want to delete this team? Members assigned to this team will remain but will be teamless."
      )
    )
      return

    try {
      await deleteTeam(teamId, access.phone)
      toast.success("Team deleted")
      void fetchTeams(access.phone)
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete team")
    }
  }

  const onDeleteUser = async (userId: string) => {
    if (!access?.phone) return
    if (!confirm("Are you sure you want to remove this member?")) return

    try {
      await deleteUser(userId, access.phone)
      toast.success("Member removed")
      void fetchUsers(access.phone)
    } catch (error) {
      console.error(error)
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

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4 md:p-6">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-blue-900 md:text-2xl">
                {adminDisplayName}
              </h1>
              <p className="text-xs font-medium text-slate-500">
                Manage your teams and members
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full border-slate-200 text-slate-600">
                  <UserCircle className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
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
                    <Input value={access?.phone || ""} disabled className="bg-slate-50" />
                  </div>
                  <Button type="submit" className="w-full bg-blue-900" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-slate-200 text-slate-600"
              onClick={() => {
                if (access) {
                   void fetchTeams(access.phone)
                   void fetchUsers(access.phone)
                }
              }}
              disabled={isLoadingUsers || isLoadingTeams}
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingUsers || isLoadingTeams ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Hierarchical List */}
      <div className="mx-auto max-w-6xl p-4 md:p-6">
        {teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
            <div className="mb-4 rounded-full bg-blue-50 p-4 text-blue-900">
              <Target className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No Teams Created</h3>
            <p className="mt-2 text-slate-500">Create your first team to start organizing members.</p>
            <Button 
              onClick={() => setIsAddTeamOpen(true)}
              className="mt-6 bg-blue-900 font-bold"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Team
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="mb-4 text-sm font-bold tracking-wider text-slate-400 uppercase">
              Organizational Hierarchy
            </h2>
            <Accordion type="multiple" className="space-y-3">
              {teams.map((team) => {
                const teamUsers = managedUsers.filter(u => u.team_id === team.id)
                const servants = teamUsers.filter(u => u.role === "servant")
                const members = teamUsers.filter(u => u.role === "member")

                return (
                  <AccordionItem 
                    key={team.id} 
                    value={team.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="flex items-center px-4">
                      <AccordionTrigger className="flex-1 py-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 text-white">
                            <Target className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <span className="block text-lg font-bold text-slate-900">{team.name}</span>
                            <span className="text-xs font-medium text-slate-500">
                              {teamUsers.length} total people
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full text-slate-400">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-red-600 focus:bg-red-50 focus:text-red-600"
                            onClick={() => onDeleteTeam(team.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <AccordionContent className="border-t border-slate-50 px-4 pb-4 pt-2">
                      {/* Servants Section */}
                      <div className="mt-2 space-y-4">
                        {servants.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-blue-900 uppercase">
                              <ShieldCheck className="h-3 w-3" /> Servants
                            </h4>
                            <div className="space-y-2">
                              {servants.map((u) => (
                                <div key={u.id} className="flex items-center justify-between rounded-xl bg-blue-50/50 p-3">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-900">
                                      <User className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <span className="block text-sm font-bold text-slate-900">{u.first_name} {u.last_name}</span>
                                      <span className="text-xs text-slate-500">{u.phone}</span>
                                    </div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-slate-300 hover:text-red-600"
                                    onClick={() => onDeleteUser(u.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Members Section */}
                        <div className="space-y-2">
                          <h4 className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                            <Users className="h-3 w-3" /> Members
                          </h4>
                          {members.length === 0 ? (
                            <p className="py-2 text-center text-xs text-slate-400 italic">No members in this team yet.</p>
                          ) : (
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              {members.map((u) => (
                                <div key={u.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                      <User className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <span className="block text-sm font-bold text-slate-900">{u.first_name} {u.last_name}</span>
                                      <span className="text-xs text-slate-500">{u.phone}</span>
                                    </div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-slate-300 hover:text-red-600"
                                    onClick={() => onDeleteUser(u.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </div>
        )}
      </div>

      {/* Floating Bottom Actions (Mobile First) */}
      <div className="fixed bottom-0 left-0 flex w-full justify-center gap-4 bg-gradient-to-t from-white via-white/90 to-transparent p-6 pb-8 md:p-8">
        <Dialog open={isAddTeamOpen} onOpenChange={setIsAddTeamOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="h-14 rounded-2xl bg-white text-blue-900 shadow-xl border border-slate-100 hover:bg-slate-50">
              <Target className="mr-2 h-5 w-5" /> Team
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
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
                />
              </div>
              <Button type="submit" className="w-full bg-blue-900" disabled={isAddingTeam || !newTeamName.trim()}>
                {isAddingTeam ? "Creating..." : "Create Team"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="h-14 rounded-2xl bg-blue-900 text-white shadow-xl hover:bg-blue-800">
              <UserPlus className="mr-2 h-5 w-5" /> Person
              </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add to Organization</DialogTitle>
            </DialogHeader>
            <form onSubmit={userForm.handleSubmit(onAddUser)} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input {...userForm.register("firstName")} placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input {...userForm.register("lastName")} placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input {...userForm.register("phone")} placeholder="01XXXXXXXXX" />
              </div>
              <div className="space-y-2">
                <Label>Team</Label>
                <select
                  {...userForm.register("teamId")}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select a team</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <select
                  {...userForm.register("role")}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="member">Member</option>
                  <option value="servant">Servant</option>
                </select>
              </div>
              <Button type="submit" className="w-full bg-blue-900" disabled={isAddingUser}>
                {isAddingUser ? "Adding..." : "Add to Organization"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
