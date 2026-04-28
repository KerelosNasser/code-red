import z from "zod"

export const memberSchema = z.object({
  name: z.string().min(1, "Member name is required"),
  DOB: z.string().min(1, "Member date of birth is required"),
  PhoneNumber: z
    .string()
    .min(11, "Phone number must be 11 digits")
    .max(11, "Phone number must be 11 digits"),
})

export const registrationSchema = z.object({
  teamName: z.string().min(1, "Team name is required"),
  name: z.string().min(1, "Servant name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(11, "Phone number must be 11 digits")
    .max(11, "Phone number must be 11 digits"),
  paymentReference: z.string().min(1, "Payment reference is required"),
  DOB: z.string().min(1, "Date of birth is required"),
  members: z.array(memberSchema).max(15, "Maximum 15 members allowed"),
})

export const loginSchema = z.object({
  phone: z
    .string()
    .min(11, "Phone number must be 11 digits")
    .max(11, "Phone number must be 11 digits"),
})

export type RegistrationFormValues = z.infer<typeof registrationSchema>
export type LoginFormValues = z.infer<typeof loginSchema>

export type WhatsAppSubmissionData = {
  name: string
  phone: string
  paymentReference: string
  uniqueId: string
  timestamp: string
}

export function generateSubmissionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function generateWhatsAppLink(
  adminPhone: string,
  data: WhatsAppSubmissionData
) {
  const message = `New Payment Submission
Name: ${data.name}
Phone: ${data.phone}
Payment Ref: ${data.paymentReference}
ID: ${data.uniqueId}
Time: ${data.timestamp}

I have completed payment via InstaPay. Please verify.`

  return `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`
}
