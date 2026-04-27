export const ACCESS_STORAGE_KEY = "dara_access"
export const LEGACY_ACCESS_KEY = "dara_has_submitted"
export const SESSION_VALIDATED_KEY = "dara_session_validated"

export type StoredAccess = {
  email: string
  phone: string
  submissionId: string
}

export function getStoredAccess(): StoredAccess | null {
  const raw = localStorage.getItem(ACCESS_STORAGE_KEY)

  if (!raw) {
    localStorage.removeItem(LEGACY_ACCESS_KEY)
    sessionStorage.removeItem(SESSION_VALIDATED_KEY)
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredAccess>
    if (!parsed.email || !parsed.phone || !parsed.submissionId) {
      clearStoredAccess()
      return null
    }

    return {
      email: parsed.email,
      phone: parsed.phone,
      submissionId: parsed.submissionId,
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
  localStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify(access))
  localStorage.removeItem(LEGACY_ACCESS_KEY)
  setSessionValidated(true)
}

export function clearStoredAccess() {
  localStorage.removeItem(ACCESS_STORAGE_KEY)
  localStorage.removeItem(LEGACY_ACCESS_KEY)
  sessionStorage.removeItem(SESSION_VALIDATED_KEY)
}
