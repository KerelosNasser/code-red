"use client"
import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  User,
  LogIn,
  ArrowLeft,
  Plus,
  Trash2,
  ShieldCheck,
  RefreshCw,
} from "lucide-react"
import {
  checkUserAccess,
  getManagedUsers,
  upsertUser,
  deleteUser,
  type User as GasUser,
} from "@/lib/api-client"
import {
  clearStoredAccess,
  getStoredAccess,
  storeAccess,
  isSessionValidated,
  setSessionValidated,
} from "@/lib/access-storage"
import {
  loginSchema,
  normalizePhoneNumber,
  userUpsertSchema,
  type LoginFormValues,
  type UserUpsertValues,
} from "@/lib/registration"
import Link from "next/link"
import { useRouter } from "next/navigation"

const ADMIN_PHONES = (process.env.NEXT_PUBLIC_ADMIN_PHONES || "")
  .split(",")
  .map((p) => normalizePhoneNumber(p.trim()))

export default function RegisterPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)
  const [access, setAccess] = useState<ReturnType<typeof getStoredAccess>>(null)

  // Dashboard states
  const [managedUsers, setManagedUsers] = useState<GasUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isAddingUser, setIsAddingUser] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function verifyStoredAccess() {
      const storedAccess = getStoredAccess()

      if (!storedAccess) {
        if (isMounted) {
          setIsCheckingAccess(false)
          setAccess(null)
        }
        return
      }

      setAccess(storedAccess)

      // Use cached session validation
      if (isSessionValidated()) {
        if (isMounted) setIsCheckingAccess(false)
        return
      }

      try {
        const result = await checkUserAccess(storedAccess)
        if (!isMounted) return
        if (result.data?.hasAccess) {
          setSessionValidated(true)
        } else {
          clearStoredAccess()
          setAccess(null)
        }
      } catch (error) {
        if (!isMounted) return
        clearStoredAccess()
        setAccess(null)
      } finally {
        if (isMounted) setIsCheckingAccess(false)
      }
    }

    void verifyStoredAccess()
    return () => {
      isMounted = false
    }
  }, [])

  // Fetch managed users if admin
  useEffect(() => {
    if (access?.role === "admin") {
      void fetchUsers()
    }
  }, [access])

  const fetchUsers = async () => {
    if (!access?.phone) return
    setIsLoadingUsers(true)
    try {
      const result = await getManagedUsers(access.phone)
      setManagedUsers(result.data || [])
    } catch (error) {
      toast.error("Failed to load team members")
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "" },
  })

  const userForm = useForm<UserUpsertValues>({
    resolver: zodResolver(userUpsertSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      role: "member",
      teamName: "",
    },
  })

  const onLogin = async (values: LoginFormValues) => {
    setIsSubmitting(true)
    const normalizedPhone = normalizePhoneNumber(values.phone)

    // 1. Check if admin from .env
    if (ADMIN_PHONES.includes(normalizedPhone)) {
      const adminAccess = {
        phone: normalizedPhone,
        role: "admin" as const,
        firstName: "Admin",
        lastName: "",
      }
      storeAccess(adminAccess)
      setAccess(adminAccess)
      window.dispatchEvent(new Event("dara_access_granted"))
      toast.success("Welcome, Admin!")
      setIsSubmitting(false)
      return
    }

    // 2. Check if user/member from GAS
    try {
      const result = await checkUserAccess({ phone: normalizedPhone })
      if (result.data?.hasAccess) {
        const userAccess = {
          phone: normalizedPhone,
          role: result.data.role || "member",
          teamName: result.data.teamName || "",
          firstName: result.data.user?.first_name || "",
          lastName: result.data.user?.last_name || "",
        }
        storeAccess(userAccess)
        setAccess(userAccess)
        window.dispatchEvent(new Event("dara_access_granted"))
        toast.success("Login successful!")
        router.push("/")
      } else {
        toast.error(
          "Account not found. Please contact your team admin to be included."
        )
      }
    } catch (error) {
      toast.error("Connection error. Please try again.")
    } finally {
      setIsSubmitting(false)
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
        team_name: values.teamName,
        managed_by: normalizePhoneNumber(access.phone),
        created_at: new Date().toISOString(),
      })
      toast.success(`${values.firstName} added successfully`)
      userForm.reset()
      void fetchUsers()
    } catch (error) {
      toast.error("Failed to add user")
    } finally {
      setIsAddingUser(false)
    }
  }

  const onDeleteUser = async (userId: string) => {
    if (!access?.phone) return
    if (!confirm("Are you sure you want to remove this member?")) return

    try {
      await deleteUser(userId, access.phone)
      toast.success("Member removed")
      void fetchUsers()
    } catch (error) {
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

  // Admin Dashboard View
  if (access?.role === "admin") {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              </Link>
              <h1 className="text-3xl font-extrabold text-blue-900">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-blue-800">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-bold">Admin: {access.phone}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Add User Form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
                <Plus className="h-5 w-5 text-blue-600" /> Add Team Member
              </h2>
              <form
                onSubmit={userForm.handleSubmit(onAddUser)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase">
                      First Name
                    </Label>
                    <Input
                      {...userForm.register("firstName")}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase">
                      Last Name
                    </Label>
                    <Input
                      {...userForm.register("lastName")}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase">
                    Phone Number
                  </Label>
                  <Input
                    {...userForm.register("phone")}
                    placeholder="01XXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase">
                    Team Name
                  </Label>
                  <Input
                    {...userForm.register("teamName")}
                    placeholder="RoboKnights"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase">
                    Role
                  </Label>
                  <select
                    {...userForm.register("role")}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="member">Member</option>
                    <option value="servant">Servant</option>
                  </select>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-900 font-bold hover:bg-blue-800"
                  disabled={isAddingUser}
                >
                  {isAddingUser ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Include in Team"
                  )}
                </Button>
              </form>
            </div>

            {/* User List */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6">
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                  <Users className="h-5 w-5 text-blue-600" /> Managed Members
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchUsers}
                  disabled={isLoadingUsers}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoadingUsers ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
              <div className="overflow-x-auto p-0">
                {managedUsers.length === 0 ? (
                  <div className="py-20 text-center text-slate-400">
                    No members added yet. Add your first member to get started.
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Phone</th>
                        <th className="px-6 py-4">Team</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {managedUsers.map((u) => (
                        <tr
                          key={u.id}
                          className="transition-colors hover:bg-slate-50/80"
                        >
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {u.first_name} {u.last_name}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {u.phone}
                          </td>
                          <td className="px-6 py-4">
                            <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                              {u.team_name}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 capitalize">
                            {u.role}
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-slate-300 hover:text-red-600"
                              onClick={() => onDeleteUser(u.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Login View
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="h-3 w-full bg-blue-900" />
        <div className="p-8 md:p-12">
          <div className="mb-10 flex flex-col items-center text-center">
            <Image
              src="/icon-dara-logo.png"
              alt="DaRa Logo"
              width={80}
              height={80}
              className="mb-4"
            />
            <h1 className="text-4xl font-extrabold tracking-tight text-blue-900">
              Welcome Back
            </h1>
            <p className="mt-2 text-slate-500">
              Log in to your robotics dashboard
            </p>
          </div>

          <form
            onSubmit={loginForm.handleSubmit(onLogin)}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">
                Phone Number
              </Label>
              <div className="relative">
                <div className="absolute top-1/2 left-4 -translate-y-1/2 border-r border-slate-200 pr-3 font-bold text-slate-400">
                  +20
                </div>
                <Input
                  {...loginForm.register("phone")}
                  placeholder="01XXXXXXXXX"
                  className="h-14 border-slate-200 pl-16 text-lg transition-all focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5"
                />
              </div>
              {loginForm.formState.errors.phone && (
                <p className="text-xs font-medium text-red-500">
                  {loginForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="h-14 w-full rounded-xl bg-blue-900 text-lg font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-800 hover:shadow-xl active:scale-[0.98]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-5 w-5" />
              )}
              {isSubmitting ? "Verifying..." : "Access Platform"}
            </Button>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-8 text-center">
            <p className="text-sm text-slate-500">
              Not on a team? Contact your team administrator for access.
            </p>
            <Link
              href="/"
              className="mt-4 flex items-center justify-center gap-1 text-sm font-bold text-blue-900 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
