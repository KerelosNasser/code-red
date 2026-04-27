"use client"
import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Send, Users, User, CircleCheck, LogIn, ArrowLeft } from "lucide-react"
import { checkUserAccess, submitToGas } from "@/lib/api-client"
import {
  clearStoredAccess,
  getStoredAccess,
  storeAccess,
  isSessionValidated,
  setSessionValidated,
} from "@/lib/access-storage"
import {
  generateSubmissionId,
  generateWhatsAppLink,
  registrationSchema,
  loginSchema,
  type RegistrationFormValues,
} from "@/lib/registration"
import Link from "next/link"
import { useRouter } from "next/navigation"

const ADMIN_WHATSAPP_PHONE =
  process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE || "01211730727"

function getErrorMessage(_error: unknown, fallbackMessage: string) {
  return _error instanceof Error ? _error.message : fallbackMessage
}

type SubmissionStatus = {
  type: "success" | "error"
  message: string
} | null

export default function RegisterPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [whatsAppUrl, setWhatsAppUrl] = useState("")
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>(null)
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup")

  useEffect(() => {
    let isMounted = true

    async function verifyStoredAccess() {
      const storedAccess = getStoredAccess()

      if (!storedAccess) {
        if (isMounted) setIsCheckingAccess(false)
        return
      }

      // Use cached session validation
      if (isSessionValidated()) {
        setHasSubmitted(true)
        if (isMounted) setIsCheckingAccess(false)
        return
      }

      try {
        const result = await checkUserAccess(storedAccess)

        if (!isMounted) return

        if (result.data?.hasAccess) {
          setHasSubmitted(true)
          setSessionValidated(true)
        } else {
          clearStoredAccess()
          setHasSubmitted(false)
        }
      } catch (error) {
        if (!isMounted) return
        clearStoredAccess()
      } finally {
        if (isMounted) setIsCheckingAccess(false)
      }
    }

    void verifyStoredAccess()

    return () => {
      isMounted = false
    }
  }, [])

  const form = useForm<RegistrationFormValues>({
    resolver: async (data, context, options) => {
      const schema = authMode === "signup" ? registrationSchema : loginSchema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (zodResolver(schema) as any)(data, context, options)
    },
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      paymentReference: "",
      DOB: "",
      members: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members",
  })

  const onSubmit = async (values: RegistrationFormValues) => {
    if (isSubmitting || hasSubmitted) return

    setIsSubmitting(true)
    setSubmissionStatus(null)
    setWhatsAppUrl("")

    if (authMode === "login") {
      try {
        const result = await checkUserAccess({
          email: values.email,
          phone: values.phone,
        })

        if (result.data?.hasAccess) {
          storeAccess({
            email: values.email,
            phone: values.phone,
            submissionId: result.data.submission?.id || "",
          })
          window.dispatchEvent(new Event("dara_access_granted"))
          setHasSubmitted(true)
          setSubmissionStatus({
            type: "success",
            message: "Login successful!",
          })
          toast.success("Welcome back. You can now access all features.")
          router.push("/")
        } else {
          setSubmissionStatus({
            type: "error",
            message: "We could not find your registration in the database.",
          })
          toast.error("Login failed. Registration not found.")
        }
      } catch (error) {
        const errorMessage = getErrorMessage(
          error,
          "Login failed. Please try again."
        )
        setSubmissionStatus({
          type: "error",
          message: errorMessage,
        })
        toast.error(errorMessage)
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    const uniqueId = generateSubmissionId()
    const timestamp = new Date().toISOString()

    try {
      const result = await submitToGas({
        ...values,
        type: "team_registration",
      })
      const submissionId = result.data?.submissionId || uniqueId

      const redirectUrl = generateWhatsAppLink(ADMIN_WHATSAPP_PHONE, {
        name: values.name,
        phone: values.phone,
        paymentReference: values.paymentReference,
        uniqueId,
        timestamp,
      })

      // Update state and persistence
      storeAccess({
        email: values.email,
        phone: values.phone,
        submissionId,
      })
      window.dispatchEvent(new Event("dara_access_granted"))

      setHasSubmitted(true)
      setWhatsAppUrl(redirectUrl)

      setSubmissionStatus({
        type: "success",
        message: "Registration successful!",
      })
      toast.success("Submission sent. You can now access all features.")
    } catch (error) {
      const errorMessage = getErrorMessage(
        error,
        "Submission failed. Please try again."
      )
      setSubmissionStatus({
        type: "error",
        message: errorMessage,
      })
      toast.error(errorMessage)
      setIsSubmitting(false)
    }
  }

  const onInvalidSubmit = () => {
    const errorMessage = "Please fix the highlighted fields before submitting."
    setSubmissionStatus({
      type: "error",
      message: errorMessage,
    })
    toast.error(errorMessage)
  }

  if (isCheckingAccess) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center bg-white px-4 py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#2E4A7D]" />
      </div>
    )
  }

  // Success View
  if (hasSubmitted) {
    return (
      <div className="relative z-10 min-h-screen bg-slate-50 px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:mt-8"
        >
          <div className="h-2 w-full bg-[#2E4A7D]" />
          <div className="space-y-6 p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CircleCheck className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">
                {authMode === "login" ? "Login Complete" : "Registration Complete"}
              </h2>
              <p className="text-slate-600">
                {authMode === "login"
                  ? "Welcome back! You have successfully logged in."
                  : "Thank you for registering. You now have access to the DaRa platform."}
              </p>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:justify-center">
              {whatsAppUrl && authMode === "signup" && (
                <Button
                  asChild
                  className="h-12 bg-emerald-600 px-8 font-medium text-white hover:bg-emerald-700"
                >
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open WhatsApp
                  </a>
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                className="h-12 border-[#2E4A7D] px-8 text-[#2E4A7D] hover:bg-[#2E4A7D]/10"
              >
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-slate-50">
      {/* Back button */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-[#2E4A7D] transition-colors font-medium">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="relative z-10 px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl"
        >
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white/80 shadow-xl backdrop-blur-sm sm:mt-8"
          >
            <div className="h-2 w-full bg-[#2E4A7D]" />
            <div className="mt-8 mb-2 flex flex-col items-center text-center">
              <div className="flex items-center justify-center gap-0">
                <Image
                  src="/icon-dara-logo.png"
                  alt="icon"
                  width={70}
                  height={70}
                />

                <h1 className="text-4xl font-bold tracking-tight text-blue-900 sm:text-5xl">
                  DaRa
                </h1>
              </div>
              <p className="mt-2 font-medium tracking-widest text-red-700 uppercase">
                M&P Didaskalia Advanced Robotics Association
              </p>
            </div>

            {/* Mode Switcher Buttons */}
            <div className="flex justify-center gap-4 mt-6 mb-4">
              <Button
                type="button"
                variant={authMode === "signup" ? "default" : "outline"}
                className={
                  authMode === "signup"
                    ? "bg-[#2E4A7D] text-white hover:bg-[#1f3358] w-32"
                    : "text-slate-600 border-slate-300 hover:bg-slate-50 w-32"
                }
                onClick={() => {
                  setAuthMode("signup")
                  form.clearErrors()
                  setSubmissionStatus(null)
                }}
              >
                Sign Up
              </Button>
              <Button
                type="button"
                variant={authMode === "login" ? "default" : "outline"}
                className={
                  authMode === "login"
                    ? "bg-[#2E4A7D] text-white hover:bg-[#1f3358] w-32"
                    : "text-slate-600 border-slate-300 hover:bg-slate-50 w-32"
                }
                onClick={() => {
                  setAuthMode("login")
                  form.clearErrors()
                  setSubmissionStatus(null)
                }}
              >
                Login
              </Button>
            </div>

            <div className="mx-auto h-1 w-1/2 bg-slate-400" />
            <div className="space-y-10 p-8">
              {/* Servant Section - 2x2 Grid */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <User className="h-5 w-5 text-[#2E4A7D]" />
                  <h2 className="text-xl font-bold text-slate-800">
                    Servant Identification
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                  {authMode === "signup" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-sm font-semibold text-[#2E4A7D]"
                      >
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Enter Servant Name"
                        className="border-slate-200 bg-slate-50 transition-all focus:bg-white"
                        {...form.register("name")}
                      />
                      {form.formState.errors.name && (
                        <p className="mt-1 text-xs text-red-600">
                          {form.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@church.com"
                      className="border-slate-200 bg-slate-50 transition-all focus:bg-white"
                      {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                      <p className="mt-1 text-xs text-red-600">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      placeholder="11 digit number"
                      className="border-slate-200 bg-slate-50 transition-all focus:bg-white"
                      {...form.register("phone")}
                    />
                    {form.formState.errors.phone && (
                      <p className="mt-1 text-xs text-red-600">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  {authMode === "signup" && (
                    <>
                      <div className="space-y-2">
                        <Label
                          htmlFor="paymentReference"
                          className="text-sm font-semibold text-slate-700"
                        >
                          Payment Reference
                        </Label>
                        <Input
                          id="paymentReference"
                          placeholder="Enter InstaPay reference"
                          className="border-slate-200 bg-slate-50 transition-all focus:bg-white"
                          {...form.register("paymentReference")}
                        />
                        {form.formState.errors.paymentReference && (
                          <p className="mt-1 text-xs text-red-600">
                            {form.formState.errors.paymentReference.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="DOB"
                          className="text-sm font-semibold text-slate-700"
                        >
                          Date of Birth
                        </Label>
                        <Input
                          id="DOB"
                          type="date"
                          className="border-slate-200 bg-slate-50 transition-all focus:bg-white"
                          {...form.register("DOB")}
                        />
                        {form.formState.errors.DOB && (
                          <p className="mt-1 text-xs text-red-600">
                            {form.formState.errors.DOB.message}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Members Section */}
              {authMode === "signup" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-[#2E4A7D]" />
                      <h2 className="text-xl font-bold text-slate-800">
                        Members
                      </h2>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        fields.length < 15 &&
                        append({ name: "", DOB: "", PhoneNumber: "" })
                      }
                      disabled={fields.length >= 15}
                      className="border-[#F5A623] bg-white text-[#F5A623] hover:bg-[#F5A623] hover:text-white transition-colors"
                    >
                      <Plus className="mr-1 h-4 w-4" /> Add Member
                    </Button>
                  </div>

                  <AnimatePresence>
                    {fields.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="rounded-lg border border-slate-200 bg-slate-50 py-10 text-center"
                      >
                        <p className="text-sm text-slate-500">
                          No members added to the unit yet
                        </p>
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        {fields.map((field, index) => (
                          <motion.div
                            key={field.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group relative rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                          >
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="absolute top-2 right-2 text-slate-300 transition-colors hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>

                            <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3">
                              <div className="space-y-1">
                                <Input
                                  placeholder="Name"
                                  className="h-9 border-slate-100 bg-slate-50"
                                  {...form.register(`members.${index}.name`)}
                                />
                              </div>
                              <div className="space-y-1">
                                <Input
                                  placeholder="Phone"
                                  className="h-9 border-slate-100 bg-slate-50"
                                  {...form.register(
                                    `members.${index}.PhoneNumber`
                                  )}
                                />
                              </div>
                              <div className="space-y-1">
                                <Input
                                  type="date"
                                  className="h-9 border-slate-100 bg-slate-50"
                                  {...form.register(`members.${index}.DOB`)}
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="mx-auto h-1 w-1/2 bg-slate-400" />

              {submissionStatus && (
                <div
                  role="status"
                  className={
                    submissionStatus.type === "success"
                      ? "flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
                      : "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                  }
                >
                  {submissionStatus.type === "success" && (
                    <CircleCheck className="h-5 w-5 shrink-0" />
                  )}
                  <span>{submissionStatus.message}</span>
                </div>
              )}

              {whatsAppUrl && authMode === "signup" && (
                <Button
                  asChild
                  variant="outline"
                  className="h-12 w-full border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                >
                  <a href={whatsAppUrl}>Open WhatsApp</a>
                </Button>
              )}

              <Button
                type="submit"
                className="flex h-14 w-full gap-2 rounded-lg bg-[#2E4A7D] text-lg font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-[#2E4A7D]/90"
                disabled={isSubmitting || hasSubmitted}
              >
                {isSubmitting ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {authMode === "login" ? "Logging in..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    {authMode === "login" ? <LogIn className="h-5 w-5" /> : <Send className="h-5 w-5" />}
                    {authMode === "login" ? "Login" : "Submit"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
