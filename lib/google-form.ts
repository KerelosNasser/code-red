export type RegistrationFormValues = {
  name: string
  email: string
  phone: string
  DOB: string
  members: {
    name: string
    DOB: string
    PhoneNumber: string
  }[]
}

export const googleFormConfig = {
  url:
    process.env.GOOGLE_FORM_URL ||
    "https://docs.google.com/forms/d/e/1FAIpQLSf_dVsQro-lumIz9yZVMnsnKy_uC_lhy2u7QnlaKxbz5WJGbw/formResponse",
  fields: {
    name: process.env.GOOGLE_FORM_ENTRY_NAME || "entry.115209315",
    email: process.env.GOOGLE_FORM_ENTRY_EMAIL || "entry.2072288893",
    phone: process.env.GOOGLE_FORM_ENTRY_PHONE || "entry.566033448",
    DOB: process.env.GOOGLE_FORM_ENTRY_DOB || "entry.956431042",
    members: process.env.GOOGLE_FORM_ENTRY_MEMBERS || "entry.165889844",
  },
} as const

export function flattenMembers(members: RegistrationFormValues["members"]) {
  if (members.length === 0) return "No members"

  return members
    .map(
      (member, index) =>
        `M${index + 1}: ${member.name} (DOB: ${member.DOB}, Phone: ${
          member.PhoneNumber
        })`
    )
    .join(" | ")
}

export function buildGoogleFormBody(values: RegistrationFormValues) {
  const memberSummary = flattenMembers(values.members)
  const body = new URLSearchParams()

  body.set(googleFormConfig.fields.name, values.name)
  body.set(googleFormConfig.fields.email, values.email)
  body.set(googleFormConfig.fields.phone, values.phone)
  body.set(googleFormConfig.fields.DOB, values.DOB)
  body.set(googleFormConfig.fields.members, memberSummary)

  return {
    body,
    memberSummary,
    formFieldsSent: Object.fromEntries(body.entries()),
  }
}
