export const ACCESS_STORAGE_KEY = "dara_access"
export const SESSION_VALIDATED_KEY = "dara_session_validated"
export const AUTH_CHANGE_EVENT = "dara_auth_change"

export function triggerAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
  }
}

export type StoredAccess = {
  phone: string
  role: 'admin' | 'servant' | 'member'
  teamName?: string
  firstName?: string
  lastName?: string
}

export function getStoredAccess(): StoredAccess | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(ACCESS_STORAGE_KEY)

  if (!raw) {
    sessionStorage.removeItem(SESSION_VALIDATED_KEY)
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredAccess>
    if (!parsed.phone || !parsed.role) {
      clearStoredAccess()
      return null
    }

    return {
      phone: parsed.phone,
      role: parsed.role as 'admin' | 'servant' | 'member',
      teamName: parsed.teamName,
      firstName: parsed.firstName,
      lastName: parsed.lastName
    }
  } catch {
    clearStoredAccess()
    return null
  }
}

export function isSessionValidated(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem(SESSION_VALIDATED_KEY) === "true"
}

export function setSessionValidated(valid: boolean) {
  if (typeof window === "undefined") return
  if (valid) {
    sessionStorage.setItem(SESSION_VALIDATED_KEY, "true")
  } else {
    sessionStorage.removeItem(SESSION_VALIDATED_KEY)
  }
}

export function storeAccess(access: StoredAccess) {
  if (typeof window === "undefined") return
  localStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify(access))
  setSessionValidated(true)
  triggerAuthChange()
}

export function clearStoredAccess() {
  if (typeof window === "undefined") return
  localStorage.removeItem(ACCESS_STORAGE_KEY)
  sessionStorage.removeItem(SESSION_VALIDATED_KEY)
  triggerAuthChange()
}

export function isAdmin(): boolean {
  const access = getStoredAccess()
  return access?.role === 'admin'
}
