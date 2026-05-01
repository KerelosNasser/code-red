import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const access = readFileSync(new URL("../lib/access-storage.ts", import.meta.url), "utf8")
const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8")

test("access storage keeps the role and phone needed for verification", () => {
  assert.match(access, /ACCESS_STORAGE_KEY = "dara_access"/)
  assert.match(access, /phone: string/)
  assert.match(access, /role:/)
})

test("home page verifies stored access with the backend", () => {
  assert.match(page, /checkUserAccess/)
  assert.match(page, /getStoredAccess/)
})

test("isAdmin helper is provided", () => {
  assert.match(access, /export function isAdmin\(\)/)
  assert.match(access, /role === 'admin'/)
})
