export const ACCESS_STORAGE_KEY = "dara_access"
export const LEGACY_ACCESS_KEY = "dara_has_submitted"

export type StoredAccess = {
  email: string
  phone: string
  submissionId: string
}

export function getStoredAccess(): StoredAccess | null {
  const raw = localStorage.getItem(ACCESS_STORAGE_KEY)

  if (!raw) {
    localStorage.removeItem(LEGACY_ACCESS_KEY)
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

export function storeAccess(access: StoredAccess) {
  localStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify(access))
  localStorage.removeItem(LEGACY_ACCESS_KEY)
}

export function clearStoredAccess() {
  localStorage.removeItem(ACCESS_STORAGE_KEY)
  localStorage.removeItem(LEGACY_ACCESS_KEY)
}
