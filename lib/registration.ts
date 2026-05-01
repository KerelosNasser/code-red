import z from "zod"

export const loginSchema = z.object({
  phone: z
    .string()
    .min(11, "Phone number must be 11 digits")
    .max(11, "Phone number must be 11 digits"),
})

export const userUpsertSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z
    .string()
    .min(11, "Phone number must be 11 digits")
    .max(11, "Phone number must be 11 digits"),
  role: z.enum(["admin", "servant", "member"]),
  teamId: z.string().min(1, "Team is required"),
})

export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "")

  // Egyptian logic:
  // If it starts with 0 and has 11 digits (e.g., 01211730727), replace 0 with 2
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    return "2" + cleaned
  }

  // If it starts with 1 and has 10 digits (e.g., 1211730727), prepend 20
  if (cleaned.startsWith("1") && cleaned.length === 10) {
    return "20" + cleaned
  }

  // If it already starts with 2 and has 12 digits (e.g. 2012...), it's normalized
  if (cleaned.startsWith("20") && cleaned.length === 12) {
    return cleaned
  }

  // Fallback: return as is if it doesn't match standard Egyptian mobile patterns
  return cleaned
}

export type LoginFormValues = z.infer<typeof loginSchema>
export type UserUpsertValues = z.infer<typeof userUpsertSchema>
