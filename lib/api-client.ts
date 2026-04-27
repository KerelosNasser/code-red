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
    const errorMessage = result.error || fallbackMessage

    if (errorMessage === "Invalid action") {
      throw new Error(
        "Google Apps Script deployment is out of date. Deploy the latest docs/google-apps-script/Code.gs, then run setupDatabase."
      )
    }

    throw new Error(errorMessage)
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
      data: payload,
      ...payload,
    }),
  })

  return parseGasResponse(response, "Submission failed")
}

export async function checkUserAccess(payload: AccessCheckPayload) {
  if (!GAS_URL) throw new Error("GAS_URL is not configured")

  const { email, phone } = payload
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
