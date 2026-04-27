import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const access = readFileSync(new URL("../lib/access-storage.ts", import.meta.url), "utf8")
const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8")

test("access storage keeps the user identity needed for backend verification", () => {
  assert.match(access, /ACCESS_STORAGE_KEY = "dara_access"/)
  assert.match(access, /email: string/)
  assert.match(access, /phone: string/)
  assert.match(access, /submissionId: string/)
})

test("old boolean-only access is cleared instead of trusted", () => {
  assert.match(access, /LEGACY_ACCESS_KEY = "dara_has_submitted"/)
  assert.match(access, /localStorage\.removeItem\(LEGACY_ACCESS_KEY\)/)
})

test("home page verifies stored access with the backend before showing success", () => {
  assert.match(page, /checkUserAccess/)
  assert.match(page, /getStoredAccess/)
  assert.match(page, /clearStoredAccess/)
})
