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
        setProfileFirstName(result.data.firstName || "")
        setProfileLastName(result.data.lastName || "")
        const stored = getStoredAccess()
        const fetchedFirstName = result.data.firstName
        const fetchedLastName = result.data.lastName
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
    const checkAccess = () => {
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
    }

    checkAccess()
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

      const duplicateUser = managedUsers.find((u) => {
        const uPhone = u.phone
        if (!uPhone) return false
        try {
          return normalizePhoneNumber(String(uPhone)) === normalizedPhone
        } catch {
          return false
        }
      })

      if (duplicateUser) {
        const dName = duplicateUser.firstName || "Member"
        toast.error(`${dName} is already registered with this phone number.`)
        setIsAddingUser(false)
        return
      }

      const payload: Partial<GasUser> = {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: normalizedPhone,
        role: values.role,
        teamId: values.teamId || "",
        managedBy: adminPhone,
        createdAt: new Date().toISOString(),
      }

      const result = await upsertUser(payload)
      
      if (result.success) {
        toast.success(`${values.firstName} added to organization`)
        
        const newUser: GasUser = {
          id: result.data?.userId || Math.random().toString(36).substr(2, 9),
          firstName: values.firstName,
          lastName: values.lastName,
          phone: normalizedPhone,
          role: values.role,
          teamId: values.teamId || "",
          managedBy: adminPhone,
          createdAt: new Date().toISOString(),
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
