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
import { Plus, Trash2, Send, Users, User, Shield } from "lucide-react"

const MemberSchema = z.object({
  name: z.string().min(1, "Member name is required"),
  DOB: z.string().min(1, "Member date of birth is required"),
  PhoneNumber: z
    .string()
    .min(10, "Phone number must be 10 digits")
    .max(10, "Phone number must be 10 digits"),
})

const schema = z.object({
  name: z.string().min(1, "Servant name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be 10 digits")
    .max(10, "Phone number must be 10 digits"),
  DOB: z.string().min(1, "Date of birth is required"),
  members: z.array(MemberSchema).max(15, "Maximum 15 members allowed"),
})

type FormValues = z.infer<typeof schema>

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof schema>>({
    // @ts-expect-error - Zod version mismatch with hook-form resolver types
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      DOB: "",
      members: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members",
  })

  const flattenMembers = (members: FormValues["members"]) => {
    if (members.length === 0) return "No members"
    return members
      .map(
        (m, i) =>
          `M${i + 1}: ${m.name} (DOB: ${m.DOB}, Phone: ${m.PhoneNumber})`
      )
      .join(" | ")
  }

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    const formData = new FormData()

    formData.append(
      process.env.NEXT_PUBLIC_ENTRY_NAME || "entry.115209315",
      values.name
    )
    formData.append(
      process.env.NEXT_PUBLIC_ENTRY_EMAIL || "entry.2072288893",
      values.email
    )
    formData.append(
      process.env.NEXT_PUBLIC_ENTRY_PHONE || "entry.566033448",
      values.phone
    )
    formData.append(
      process.env.NEXT_PUBLIC_ENTRY_DOB || "entry.956431042",
      values.DOB
    )
    formData.append(
      process.env.NEXT_PUBLIC_ENTRY_MEMBERS || "entry.165889844",
      flattenMembers(values.members)
    )

    try {
      await fetch(
        process.env.NEXT_PUBLIC_GOOGLE_FORM_URL ||
          "https://docs.google.com/forms/d/e/1FAIpQLSf_dVsQro-lumIz9yZVMnsnKy_uC_lhy2u7QnlaKxbz5WJGbw/formResponse",
        {
          method: "POST",
          mode: "no-cors",
          body: formData,
        }
      )
      toast.success("Registration successful!")
      form.reset()
    } catch (error) {
      toast.error("Submission failed. Please try again.")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl"
      >
        <div className="mb-10 flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Da<span className="text-amber-600">Ra</span>
          </h1>
          <p className="mt-2 font-medium tracking-widest text-amber-600 uppercase">
            M&P Didaskalia Advanced Robotics Association
          </p>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="overflow-hidden rounded-2xl apple-glass shadow-2xl"
        >
          <div className="h-2 w-full bg-blue-900/40" />

          <div className="space-y-10 p-8">
            {/* Servant Section - 2x2 Grid */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-white/20 pb-3">
                <User className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-slate-900">
                  Servant Identification
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-semibold text-slate-800"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter Servant Name"
                    className="border-white/20 bg-white/30 transition-all focus:bg-white/60"
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
                    className="text-sm font-semibold text-slate-800"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@church.com"
                    className="border-white/20 bg-white/30 transition-all focus:bg-white/60"
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
                    className="text-sm font-semibold text-slate-800"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    placeholder="10 digit number"
                    className="border-white/20 bg-white/30 transition-all focus:bg-white/60"
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
                    htmlFor="DOB"
                    className="text-sm font-semibold text-slate-800"
                  >
                    Date of Birth
                  </Label>
                  <Input
                    id="DOB"
                    type="date"
                    className="border-white/20 bg-white/30 transition-all focus:bg-white/60"
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
              <div className="flex items-center justify-between border-b border-white/20 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold text-slate-900">Members</h2>
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
                  className="border-primary text-primary transition-all hover:bg-primary hover:text-white disabled:border-slate-200"
                >
                  <Plus className="mr-1 h-4 w-4" /> Add Member
                </Button>
              </div>

              <AnimatePresence>
                {fields.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-lg border border-dashed border-white/30 bg-white/20 py-10 text-center"
                  >
                    <p className="text-sm text-blue-900 font-medium">
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
                        className="group relative rounded-xl apple-glass p-5 shadow-lg"
                      >
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="absolute top-2 right-2 text-slate-400 transition-colors hover:text-primary"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                        <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3">
                          <div className="space-y-1">
                            <Label className="text-xs font-bold text-slate-600">
                              Name
                            </Label>
                            <Input
                              placeholder="Name"
                              className="h-9 border-white/20 bg-white/40 focus:bg-white/60"
                              {...form.register(`members.${index}.name`)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-bold text-slate-600">
                              Phone
                            </Label>
                            <Input
                              placeholder="Phone"
                              className="h-9 border-white/20 bg-white/40 focus:bg-white/60"
                              {...form.register(`members.${index}.PhoneNumber`)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-bold text-slate-600">
                              Date of Birth
                            </Label>
                            <Input
                              type="date"
                              className="h-9 border-white/20 bg-white/40 focus:bg-white/60"
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

            <Button
              type="submit"
              className="flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-primary text-lg font-bold text-white shadow-lg shadow-red-100 transition-all hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Processing...
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
  )
}
