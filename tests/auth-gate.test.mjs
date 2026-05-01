import assert from "node:assert/strict"
import { readFileSync, existsSync } from "node:fs"
import test from "node:test"

const componentPath = new URL("../components/auth-gate.tsx", import.meta.url)

test("auth-gate.tsx exists", () => {
  assert.strictEqual(existsSync(componentPath), true)
})

test("auth-gate.tsx exports AuthGate", () => {
  if (!existsSync(componentPath)) {
    assert.fail("File does not exist")
    return
  }
  const content = readFileSync(componentPath, "utf8")
  assert.match(content, /export function AuthGate/)
})
