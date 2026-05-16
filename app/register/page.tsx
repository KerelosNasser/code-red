"use client"
import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { motion } from "framer-motion"
import {
  LogIn,
  RefreshCw,
} from "lucide-react"
import {
  checkUserAccessAction,
} from "@/lib/actions"
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
  type LoginFormValues,
} from "@/lib/registration"
import { useRouter } from "next/navigation"

const ADMIN_PHONES = (
  process.env.NEXT_PUBLIC_ADMIN_PHONES ||
  process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE ||
  ""
)
  .split(",")
  .map((p) => normalizePhoneNumber(p.trim()))
  .filter(Boolean)

export default function RegisterPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)

  useEffect(() => {
    async function verifyStoredAccess() {
      const storedAccess = getStoredAccess()

      if (!storedAccess) {
        setIsCheckingAccess(false)
        return
      }

      // If already logged in as admin, go to dashboard
      if (storedAccess.role === "admin") {
        router.push("/dashboard")
        return
      }

      // If already logged in as user, go to home
      if (isSessionValidated()) {
        router.push("/")
        return
      }

      try {
        const result = await checkUserAccessAction({ phone: storedAccess.phone })
        if (result.data?.hasAccess) {
          setSessionValidated(true)
          router.push("/")
        } else {
          clearStoredAccess()
          setIsCheckingAccess(false)
        }
      } catch (error) {
        console.error(error)
        clearStoredAccess()
        setIsCheckingAccess(false)
      }
    }

    void verifyStoredAccess()
  }, [router])

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "" },
  })

  const onLogin = async (values: LoginFormValues) => {
    setIsSubmitting(true)
    const normalizedPhone = normalizePhoneNumber(values.phone)
    
    console.log("DEBUG: Login attempt", {
      input: values.phone,
      normalized: normalizedPhone,
      adminList: ADMIN_PHONES
    })

    // 1. Check if admin from .env
    if (ADMIN_PHONES.includes(normalizedPhone)) {
      console.log("DEBUG: Admin match found in .env")
      const adminAccess = {
        phone: normalizedPhone,
        role: "admin" as const,
        firstName: "Admin",
        lastName: "",
      }
      storeAccess(adminAccess)
      window.dispatchEvent(new Event("dara_access_granted"))
      toast.success("Welcome, Admin!")
      router.push("/dashboard")
      return
    }

    // 2. Check if user/member from GAS
    try {
      const result = await checkUserAccessAction({ phone: normalizedPhone })
      if (result.data?.hasAccess) {
        const gasUser = result.data.user
        const fName = gasUser?.firstName || ""
        const lName = gasUser?.lastName || ""
        
        const userAccess = {
          phone: normalizedPhone,
          role: result.data.role || "member",
          teamId: result.data.teamId || "",
          firstName: fName,
          lastName: lName,
        }
        storeAccess(userAccess)
        window.dispatchEvent(new Event("dara_access_granted"))
        toast.success("Login successful!")
        router.push("/")
      } else {
        toast.error(
          "Account not found. Please contact your team admin to be included."
        )
      }
    } catch (error) {
      console.error(error)
      toast.error("Connection error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCheckingAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-900" />
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
              Welcome
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
                <Input
                  {...loginForm.register("phone")}
                  placeholder="01XXXXXXXXX"
                  className="h-14 border-slate-200 pl-8 text-lg transition-all focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5"
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
              className="h-14 w-full rounded-xl bg-red-800 text-lg font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-yellow-700 hover:shadow-xl active:scale-[0.98]"
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
          </div>
        </div>
      </motion.div>
    </div>
  )
}
