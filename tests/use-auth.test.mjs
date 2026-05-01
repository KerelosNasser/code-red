import assert from "node:assert/strict"
import { readFileSync, existsSync } from "node:fs"
import test from "node:test"

const hookPath = new URL("../hooks/use-auth.ts", import.meta.url)

test("use-auth.ts exists", () => {
  assert.strictEqual(existsSync(hookPath), true)
})

test("use-auth.ts has correct implementation", () => {
  if (!existsSync(hookPath)) return;
  const content = readFileSync(hookPath, "utf8")
  
  assert.match(content, /import \{ useState, useEffect \} from "react"/)
  assert.match(content, /import \{ getStoredAccess, AUTH_CHANGE_EVENT, type StoredAccess \} from "@\/lib\/access-storage"/)
  assert.match(content, /export function useAuth\(\)/)
  assert.match(content, /window\.addEventListener\(AUTH_CHANGE_EVENT, check\)/)
  assert.match(content, /window\.addEventListener\("storage", check\)/)
  assert.match(content, /return \{ access, isLoading, isAuthenticated: !!access \}/)
})
