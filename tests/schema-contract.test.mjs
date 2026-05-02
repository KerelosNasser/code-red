import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const codeGs = readFileSync(new URL("../docs/google-apps-script/Code.gs", import.meta.url), "utf8")
const apiClient = readFileSync(new URL("../lib/api-client.ts", import.meta.url), "utf8")

const expectedSchema = {
  Users: ["id", "firstName", "lastName", "phone", "role", "teamId", "managedBy", "createdAt"],
  Teams: ["id", "name", "adminPhone", "createdAt"],
  Submissions: ["id", "userId", "type", "payload", "status", "createdAt"],
  Products: ["id", "title", "description", "price", "imageUrl"],
}

test("Code.gs defines the exact Google Sheets schema", () => {
  assert.match(codeGs, /const SHEET_SCHEMAS\s*=/)

  for (const [sheetName, headers] of Object.entries(expectedSchema)) {
    const pattern = new RegExp(`${sheetName}["']?\\s*:\\s*\\[\\s*${headers.map(h => `["']${h}["']`).join("\\s*,\\s*")}\\s*\\]`)
    assert.ok(
      pattern.test(codeGs),
      `Missing schema for ${sheetName}`
    )
  }
})

test("Code.gs can initialize sheets", () => {
  assert.match(codeGs, /function setupDatabaseSchema\(\)/)
})

test("Code.gs resolves the spreadsheet through a helper", () => {
  assert.match(codeGs, /SHEET_ID:/)
  assert.match(codeGs, /function getSpreadsheet\(\)/)
})

test("Code.gs exposes administrative and access endpoints", () => {
  assert.match(codeGs, /case "checkUser":/)
  assert.match(codeGs, /case "getManagedUsers":/)
  assert.match(codeGs, /case "upsertUser":/)
  assert.match(codeGs, /case "deleteUser":/)
})

test("frontend API client rejects Apps Script JSON failures", () => {
  assert.match(apiClient, /const result = await response\.json\(\)/)
  assert.match(apiClient, /result\.success === false/)
})

test("frontend API client can check user access by phone", () => {
  assert.match(apiClient, /export async function checkUserAccess/)
  assert.match(apiClient, /action=checkUser/)
  assert.match(apiClient, /phone=/)
})

test("Code.gs exposes a getUserAssets action", () => {
  assert.match(codeGs, /case "getUserAssets":/)
})
