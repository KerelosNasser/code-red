"use client"
import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Send, Users, User, CircleCheck } from "lucide-react"
import { submitToGas } from "@/lib/api-client"

const ADMIN_WHATSAPP_PHONE =
  process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE || "15551234567"

const MemberSchema = z.object({
  name: z.string().min(1, "Member name is required"),
  DOB: z.string().min(1, "Member date of birth is required"),
  PhoneNumber: z
    .string()
    .min(11, "Phone number must be 10 digits")
    .max(11, "Phone number must be 10 digits"),
})

const schema = z.object({
  name: z.string().min(1, "Servant name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(11, "Phone number must be 9 digits")
    .max(11, "Phone number must be 11 digits"),
  paymentReference: z.string().min(1, "Payment reference is required"),
  DOB: z.string().min(1, "Date of birth is required"),
  members: z.array(MemberSchema).max(15, "Maximum 15 members allowed"),
})

type FormValues = z.infer<typeof schema>

type SubmissionStatus = {
  type: "success" | "error"
  message: string
} | null

type WhatsAppSubmissionData = {
  name: string
  phone: string
  paymentReference: string
  uniqueId: string
  timestamp: string
}

function generateSubmissionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function generateWhatsAppLink(data: WhatsAppSubmissionData) {
  const message = `New Payment Submission
Name: ${data.name}
Phone: ${data.phone}
Payment Ref: ${data.paymentReference}
ID: ${data.uniqueId}
Time: ${data.timestamp}

I have completed payment via InstaPay. Please verify.`

  return `https://wa.me/${ADMIN_WHATSAPP_PHONE}?text=${encodeURIComponent(
    message
  )}`
}

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [whatsAppUrl, setWhatsAppUrl] = useState("")
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>(null)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
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

  const onSubmit = async (values: FormValues) => {
    if (isSubmitting || hasSubmitted) return

    setIsSubmitting(true)
    setSubmissionStatus(null)
    setWhatsAppUrl("")

    const uniqueId = generateSubmissionId()
    const timestamp = new Date().toISOString()

    try {
      await submitToGas({
        ...values,
        type: "team_registration",
      })

      const redirectUrl = generateWhatsAppLink({
        name: values.name,
        phone: values.phone,
        paymentReference: values.paymentReference,
        uniqueId,
        timestamp,
      })
      setHasSubmitted(true)
      setWhatsAppUrl(redirectUrl)

      const successMessage = "Redirecting to WhatsApp..."
      setSubmissionStatus({
        type: "success",
        message: successMessage,
      })
      toast.success("Submission sent. Opening WhatsApp...")

      window.setTimeout(() => {
        window.location.href = redirectUrl
      }, 500)
    } catch (error) {
      const errorMessage = "Submission failed. Please try again."
      setSubmissionStatus({
        type: "error",
        message: errorMessage,
      })
      toast.error(errorMessage)
      console.error(error)
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

  return (
    <>
      <div className="relative z-10 min-h-screen bg-white px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl"
        >
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white/80 shadow-xl backdrop-blur-sm sm:mt-8"
          >
            <div className="h-2 w-full bg-blue-900" />
            <div className="mt-8 mb-2 flex flex-col items-center text-center">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                Da<span className="text-amber-600">Ra</span>
              </h1>
              <p className="mt-2 font-medium tracking-widest text-amber-600 uppercase">
                M&P Didaskalia Advanced Robotics Association
              </p>
            </div>
            <div className="ml-27 h-1 w-1/2 bg-slate-400 sm:ml-50" />
            <div className="space-y-10 p-8">
              {/* Servant Section - 2x2 Grid */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <User className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold text-slate-800">
                    Servant Identification
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-semibold text-slate-700"
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
                      <p className="mt-1 text-xs text-primary">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

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
                      <p className="mt-1 text-xs text-primary">
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
                      placeholder="10 digit number"
                      className="border-slate-200 bg-slate-50 transition-all focus:bg-white"
                      {...form.register("phone")}
                    />
                    {form.formState.errors.phone && (
                      <p className="mt-1 text-xs text-primary">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

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
                      <p className="mt-1 text-xs text-primary">
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
                      <p className="mt-1 text-xs text-primary">
                        {form.formState.errors.DOB.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Members Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold text-slate-800">
                      Members
                    </h2>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      fields.length < 15 &&
                      append({ name: "", DOB: "", PhoneNumber: "" })
                    }
                    disabled={fields.length >= 15}
                    className="focus:ring-primarydisabled:border-slate-200 border-primary text-primary transition-all hover:bg-primary hover:text-white"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add Member
                  </Button>
                </div>

                <AnimatePresence>
                  {fields.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-10 text-center"
                    >
                      <p className="text-sm text-blue-700">
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
                            className="absolute top-2 right-2 text-slate-300 transition-colors hover:text-primary"
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
              <div className="ml-27 h-1 w-1/2 bg-slate-400 sm:ml-50" />

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

              {whatsAppUrl && (
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
                className="flex h-14 w-full gap-2 rounded-lg bg-primary text-lg font-bold text-white shadow-lg shadow-red-100 transition-all hover:bg-primary/90 sm:w-full"
                disabled={isSubmitting || hasSubmitted}
              >
                {isSubmitting ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Redirecting to WhatsApp...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" /> Submit
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  )
}
