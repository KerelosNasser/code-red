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

export interface GasResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface AccessCheckData {
  hasAccess: boolean
  user?: User
  role?: "admin" | "servant" | "member"
  teamId?: string
}

async function parseGasResponse<T = any>(
  response: Response,
  fallbackMessage: string
): Promise<GasResponse<T>> {
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

  return result as GasResponse<T>
}

export async function checkUserAccess(
  payload: AccessCheckPayload
): Promise<GasResponse<AccessCheckData>> {
  if (!GAS_URL) throw new Error("GAS_URL is not configured")

  const { phone } = payload
  const url = `${GAS_URL}?action=checkUser&token=${encodeURIComponent(
    GAS_SECRET
  )}&phone=${encodeURIComponent(phone)}`
  
  const response = await fetch(url)
  return parseGasResponse<AccessCheckData>(response, "User check failed")
}

export async function getCoursesFromGas(): Promise<GasResponse<any[]>> {
  const url = `${GAS_URL}?action=getCourses`
  const response = await fetch(url)
  return parseGasResponse<any[]>(response, "Failed to fetch courses")
}

export async function getProductsFromGas(): Promise<GasResponse<any[]>> {
  const url = `${GAS_URL}?action=getProducts`
  const response = await fetch(url)
  return parseGasResponse<any[]>(response, "Failed to fetch products")
}

export async function getUserAssetsFromGas(
  payload: AccessCheckPayload
): Promise<GasResponse<any[]>> {
  if (!GAS_URL) throw new Error("GAS_URL is not configured")

  const { phone } = payload
  const url = `${GAS_URL}?action=getUserAssets&token=${encodeURIComponent(
    GAS_SECRET
  )}&phone=${encodeURIComponent(phone)}`
  const response = await fetch(url)
  return parseGasResponse<any[]>(response, "Failed to fetch user assets")
}

export async function getManagedUsers(
  adminPhone: string
): Promise<GasResponse<User[]>> {
  if (!GAS_URL) throw new Error("GAS_URL is not configured")

  const url = `${GAS_URL}?action=getManagedUsers&token=${encodeURIComponent(
    GAS_SECRET
  )}&adminPhone=${encodeURIComponent(adminPhone)}`
  const response = await fetch(url)
  return parseGasResponse<User[]>(response, "Failed to fetch managed users")
}

export async function upsertUser(
  payload: Partial<User>
): Promise<GasResponse<{ userId: string }>> {
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

  return parseGasResponse<{ userId: string }>(response, "Failed to save user")
}

export async function deleteUser(
  userId: string,
  adminPhone: string
): Promise<GasResponse<void>> {
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

  return parseGasResponse<void>(response, "Failed to delete user")
}

export async function getTeams(
  adminPhone: string
): Promise<GasResponse<Team[]>> {
  if (!GAS_URL) throw new Error("GAS_URL is not configured")

  const url = `${GAS_URL}?action=getTeams&token=${encodeURIComponent(
    GAS_SECRET
  )}&adminPhone=${encodeURIComponent(adminPhone)}`
  const response = await fetch(url)
  return parseGasResponse<Team[]>(response, "Failed to fetch teams")
}

export async function createTeam(payload: {
  name: string
  adminPhone: string
}): Promise<GasResponse<{ teamId: string }>> {
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

  return parseGasResponse<{ teamId: string }>(response, "Failed to create team")
}

export async function deleteTeam(
  teamId: string,
  adminPhone: string
): Promise<GasResponse<void>> {
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

  return parseGasResponse<void>(response, "Failed to delete team")
}

export async function getAdminProfile(
  phone: string
): Promise<GasResponse<AdminProfile>> {
  if (!GAS_URL) throw new Error("GAS_URL is not configured")

  const url = `${GAS_URL}?action=getAdmin&token=${encodeURIComponent(
    GAS_SECRET
  )}&phone=${encodeURIComponent(phone)}`
  const response = await fetch(url)
  return parseGasResponse<AdminProfile>(response, "Failed to fetch admin profile")
}

export async function updateAdminProfile(payload: {
  phone: string
  firstName: string
  lastName: string
}): Promise<GasResponse<void>> {
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

  return parseGasResponse<void>(response, "Failed to update admin profile")
}

export async function submitPurchase(payload: {
  productIds: string[]
  adminPhone: string
}): Promise<GasResponse<void>> {
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

  return parseGasResponse<void>(response, "Purchase failed")
}
