export const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL || ""
export const GAS_SECRET = process.env.NEXT_PUBLIC_GAS_SECRET_KEY || ""

export interface User {
  id: string
  first_name: string
  last_name: string
  phone: string
  role: 'admin' | 'servant' | 'member'
  team_name: string
  managed_by: string
  created_at: string
}

export interface AccessCheckPayload {
  phone: string
}

async function parseGasResponse(response: Response, fallbackMessage: string) {
  if (!response.ok) {
    throw new Error(`${fallbackMessage}: ${response.statusText}`)
  }

  const result = await response.json()

  if (result.success === false) {
    const errorMessage = result.error || fallbackMessage
    throw new Error(errorMessage)
  }

  return result
}

export async function checkUserAccess(payload: AccessCheckPayload) {
  if (!GAS_URL) throw new Error("GAS_URL is not configured")

  const { phone } = payload
  const url = `${GAS_URL}?action=checkUser&token=${encodeURIComponent(
    GAS_SECRET
  )}&phone=${encodeURIComponent(phone)}`
  
  const response = await fetch(url)
  return parseGasResponse(response, "User check failed")
}

export async function getCoursesFromGas() {
  const url = `${GAS_URL}?action=getCourses`
  const response = await fetch(url)
  return parseGasResponse(response, "Failed to fetch courses")
}

export async function getProductsFromGas() {
  const url = `${GAS_URL}?action=getProducts`
  const response = await fetch(url)
  return parseGasResponse(response, "Failed to fetch products")
}

export async function getUserAssetsFromGas(payload: AccessCheckPayload) {
  if (!GAS_URL) throw new Error("GAS_URL is not configured")

  const { phone } = payload
  const url = `${GAS_URL}?action=getUserAssets&token=${encodeURIComponent(
    GAS_SECRET
  )}&phone=${encodeURIComponent(phone)}`
  const response = await fetch(url)
  return parseGasResponse(response, "Failed to fetch user assets")
}

export async function getManagedUsers(adminPhone: string) {
  if (!GAS_URL) throw new Error("GAS_URL is not configured")

  const url = `${GAS_URL}?action=getManagedUsers&token=${encodeURIComponent(
    GAS_SECRET
  )}&adminPhone=${encodeURIComponent(adminPhone)}`
  const response = await fetch(url)
  return parseGasResponse(response, "Failed to fetch managed users")
}

export async function upsertUser(payload: Partial<User>) {
  if (!GAS_URL) throw new Error("GAS_URL is not configured")

  const response = await fetch(GAS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "upsertUser",
      token: GAS_SECRET,
      payload,
    }),
  })

  return parseGasResponse(response, "Failed to save user")
}

export async function deleteUser(userId: string, adminPhone: string) {
  if (!GAS_URL) throw new Error("GAS_URL is not configured")

  const response = await fetch(GAS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "deleteUser",
      token: GAS_SECRET,
      userId,
      adminPhone,
    }),
  })

  return parseGasResponse(response, "Failed to delete user")
}

export async function submitPurchase(
  payload: { productIds: string[], adminPhone: string }
) {
  if (!GAS_URL) throw new Error("GAS_URL is not configured")

  const response = await fetch(GAS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "submitPurchase",
      token: GAS_SECRET,
      payload,
    }),
  })

  return parseGasResponse(response, "Purchase failed")
}
