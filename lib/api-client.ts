export const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL || ""
export const GAS_SECRET = process.env.NEXT_PUBLIC_GAS_SECRET_KEY || ""

export interface Member {
  name: string
  DOB: string
  PhoneNumber: string
}

export interface SubmissionPayload {
  name: string
  email: string
  phone: string
  paymentReference: string
  DOB: string
  members: Member[]
  type?: string
}

export interface AccessCheckPayload {
  email: string
  phone: string
}

async function parseGasResponse(response: Response, fallbackMessage: string) {
  if (!response.ok) {
    throw new Error(`${fallbackMessage}: ${response.statusText}`)
  }

  const result = await response.json()

  if (result.success === false) {
    throw new Error(result.error || fallbackMessage)
  }

  return result
}

export async function submitToGas(payload: SubmissionPayload) {
  if (!GAS_URL) throw new Error("GAS_URL is not configured")

  const response = await fetch(GAS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "submitForm",
      token: GAS_SECRET,
      payload,
    }),
  })

  return parseGasResponse(response, "Submission failed")
}

export async function checkUserAccess({ email, phone }: AccessCheckPayload) {
  if (!GAS_URL) throw new Error("GAS_URL is not configured")

  const url = `${GAS_URL}?action=checkUser&token=${encodeURIComponent(
    GAS_SECRET
  )}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`
  const response = await fetch(url)
  return parseGasResponse(response, "User check failed")
}

export async function getCoursesFromGas() {
  const url = `${GAS_URL}?action=getCourses`
  const response = await fetch(url)
  return parseGasResponse(response, "Failed to fetch courses")
}
