import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const codeGs = readFileSync(new URL("../docs/google-apps-script/Code.gs", import.meta.url), "utf8")
const apiClient = readFileSync(new URL("../lib/api-client.ts", import.meta.url), "utf8")

const expectedSchema = {
  Users: ["id", "name", "email", "phone", "role", "created_at"],
  Submissions: ["id", "user_id", "type", "payload", "status", "created_at"],
  Members: ["id", "submission_id", "name", "dob", "phone"],
  Courses: ["id", "title", "description"],
  Sections: ["id", "course_id", "title", "order"],
  Lessons: [
    "id",
    "course_id",
    "section_id",
    "title",
    "description",
    "drive_file_id",
    "resource_url",
    "order",
  ],
  Products: ["id", "title", "description", "price", "image_url"],
}

test("Code.gs defines the exact Google Sheets schema", () => {
  assert.match(codeGs, /const SHEET_SCHEMAS\s*=/)

  for (const [sheetName, headers] of Object.entries(expectedSchema)) {
    const schemaLine = `${sheetName}: [${headers.map((header) => `"${header}"`).join(", ")}]`
    assert.ok(
      codeGs.includes(schemaLine),
      `Missing exact schema line: ${schemaLine}`
    )
  }
})

test("Code.gs can initialize and validate sheets before writes", () => {
  assert.match(codeGs, /function setupDatabaseSchema\(\)/)
  assert.match(codeGs, /function ensureDatabaseSchema\(\)/)
  assert.match(codeGs, /ensureDatabaseSchema\(\)/)
})

test("Code.gs guards missing Apps Script event objects for manual runs", () => {
  assert.match(codeGs, /function getRequestParameters\(e\)/)
  assert.match(codeGs, /return e && e\.parameter \? e\.parameter : \{\}/)
  assert.match(codeGs, /function getPostBody\(e\)/)
  assert.match(codeGs, /Missing POST body/)
})

test("Code.gs resolves the spreadsheet through a helper instead of chaining getActiveSpreadsheet", () => {
  assert.match(codeGs, /SHEET_ID:/)
  assert.match(codeGs, /function getSpreadsheet\(\)/)
  assert.match(codeGs, /SpreadsheetApp\.openById\(CONFIG\.SHEET_ID\)/)
  assert.doesNotMatch(codeGs, /SpreadsheetApp\.getActiveSpreadsheet\(\)\.getSheetByName/)
})

test("Code.gs exposes a user check endpoint backed by Users and Submissions", () => {
  assert.match(codeGs, /case "checkUser":/)
  assert.match(codeGs, /UserService\.checkAccess/)
  assert.match(codeGs, /SheetUtils\.readAll\("Submissions"\)/)
})

test("frontend API client rejects Apps Script JSON failures", () => {
  assert.match(apiClient, /const result = await response\.json\(\)/)
  assert.match(apiClient, /result\.success === false/)
  assert.match(apiClient, /throw new Error/)
})

test("frontend API client can check whether the stored user exists", () => {
  assert.match(apiClient, /export async function checkUserAccess/)
  assert.match(apiClient, /action=checkUser/)
  assert.match(apiClient, /encodeURIComponent\(email\)/)
})

test("frontend API client explains stale Apps Script deployments", () => {
  assert.match(apiClient, /Google Apps Script deployment is out of date/)
  assert.match(apiClient, /Invalid action/)
})

test("frontend submit payload stays compatible with older Apps Script deployments", () => {
  assert.match(apiClient, /payload,/)
  assert.match(apiClient, /\.\.\.payload/)
  assert.match(apiClient, /data: payload/)
})

test("Code.gs exposes a getUserAssets action", () => {
  assert.match(codeGs, /case "getUserAssets":/)
})
