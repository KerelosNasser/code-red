import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const schema = readFileSync(new URL("../lib/db/schema.ts", import.meta.url), "utf8")
const services = readFileSync(new URL("../lib/db/services.ts", import.meta.url), "utf8")
const actions = readFileSync(new URL("../lib/actions.ts", import.meta.url), "utf8")
const registration = readFileSync(new URL("../lib/registration.ts", import.meta.url), "utf8")
const accessStorage = readFileSync(new URL("../lib/access-storage.ts", import.meta.url), "utf8")
const uploadRoute = readFileSync(new URL("../app/api/upload-video/route.ts", import.meta.url), "utf8")
const worker = readFileSync(new URL("../worker/video-worker.ts", import.meta.url), "utf8")

test("role contracts include tutor", () => {
  assert.match(registration, /"tutor"/)
  assert.match(accessStorage, /'tutor'/)
  assert.match(services, /"tutor"/)
})

test("course schema tracks publishing and tutor ownership", () => {
  assert.match(schema, /status: varchar\("status"/)
  assert.match(schema, /publishedAt: timestamp\("published_at"/)
  assert.match(schema, /ownerPhone: varchar\("owner_phone"/)
  assert.match(schema, /ownerRole: varchar\("owner_role"/)
})

test("course services expose scoped write operations", () => {
  for (const name of [
    "listCoursesForActor",
    "getCourseForEdit",
    "saveCourseDraft",
    "publishCourse",
    "deleteCourseForActor",
  ]) {
    assert.match(services, new RegExp(`export async function ${name}`))
    assert.match(actions, new RegExp(`${name}Action`))
  }
})

test("course responses normalize media fields for player compatibility", () => {
  assert.match(services, /url: lesson\.videoUrl/)
  assert.match(services, /resource_url: lesson\.resourceUrl/)
})

test("admin notifications and storage guardrails are wired", () => {
  assert.match(schema, /adminNotifications/)
  assert.match(services, /createAdminNotification/)
  assert.match(uploadRoute, /assertSufficientStorage/)
  assert.match(worker, /createAdminNotification/)
})
