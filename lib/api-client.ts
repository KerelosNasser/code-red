export const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL || ""
export const GAS_SECRET = process.env.NEXT_PUBLIC_GAS_SECRET_KEY || ""

export interface User {
  id: string
  firstName: string
  lastName: string
  phone: string
  role: "admin" | "servant" | "member"
  teamId: string
  managedBy: string
  createdAt: string
}

export interface Team {
  id: string
  name: string
  adminPhone: string
  createdAt: string
}

export interface AdminProfile {
  phone: string
  firstName: string
  lastName: string
}

export interface AccessCheckPayload {
  phone: string
}

function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => toCamelCase(v))
  } else if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/(_\w)/g, (m) => m[1].toUpperCase())
      return {
        ...result,
        [camelKey]: toCamelCase(obj[key]),
      }
    }, {})
  }
  return obj
}

async function parseGasResponse(response: Response, fallbackMessage: string) {
  if (!response.ok) {
    console.error(`GAS API Error (${response.status}): ${response.statusText}`)
    throw new Error(`${fallbackMessage}: ${response.statusText}`)
  }

  const result = await response.json()

  if (result.success === false) {
    const errorMessage = result.error || fallbackMessage
    console.error("GAS API Business Logic Error:", errorMessage)
    throw new Error(errorMessage)
  }

  // Normalize keys to camelCase if data exists
  if (result.data) {
    result.data = toCamelCase(result.data)
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

export async function getTeams(adminPhone: string) {
  if (!GAS_URL) throw new Error("GAS_URL is not configured")

  const url = `${GAS_URL}?action=getTeams&token=${encodeURIComponent(
    GAS_SECRET
  )}&adminPhone=${encodeURIComponent(adminPhone)}`
  const response = await fetch(url)
  return parseGasResponse(response, "Failed to fetch teams")
}

export async function createTeam(payload: { name: string; adminPhone: string }) {
  if (!GAS_URL) throw new Error("GAS_URL is not configured")

  const response = await fetch(GAS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "createTeam",
      token: GAS_SECRET,
      payload,
    }),
  })

  return parseGasResponse(response, "Failed to create team")
}

export async function deleteTeam(teamId: string, adminPhone: string) {
  if (!GAS_URL) throw new Error("GAS_URL is not configured")

  const response = await fetch(GAS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "deleteTeam",
      token: GAS_SECRET,
      teamId,
      adminPhone,
    }),
  })

  return parseGasResponse(response, "Failed to delete team")
}

export async function getAdminProfile(phone: string) {
  if (!GAS_URL) throw new Error("GAS_URL is not configured")

  const url = `${GAS_URL}?action=getAdmin&token=${encodeURIComponent(
    GAS_SECRET
  )}&phone=${encodeURIComponent(phone)}`
  const response = await fetch(url)
  return parseGasResponse(response, "Failed to fetch admin profile")
}

export async function updateAdminProfile(payload: {
  phone: string
  firstName: string
  lastName: string
}) {
  if (!GAS_URL) throw new Error("GAS_URL is not configured")

  const response = await fetch(GAS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "upsertAdmin",
      token: GAS_SECRET,
      payload,
    }),
  })

  return parseGasResponse(response, "Failed to update admin profile")
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
