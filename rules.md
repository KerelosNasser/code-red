# DaRA Project Handoff Rules

This file is the context handoff for future AI/dev work. Read it before changing the app.

## Project Summary

DaRA is a Next.js app backed by Google Apps Script and Google Sheets.

- Frontend: Next.js App Router in `app/`
- Backend API: Google Apps Script in `docs/google-apps-script/Code.gs`
- Database: Google Sheets tabs created/managed by `Code.gs`
- Main registration UI: `app/page.tsx`
- API client: `lib/api-client.ts`
- Local access state: `lib/access-storage.ts`
- Registration schema/helpers: `lib/registration.ts`

Do not bring back the old direct Google Form submit flow. The app writes to Apps Script, not Google Forms.

## Source Of Truth

The visual source of truth is `app/page.tsx`. Preserve its DaRA registration design unless the user explicitly asks for a redesign.

The backend source of truth is `docs/google-apps-script/Code.gs`. The cloud Apps Script must be updated manually from this file after backend changes.

The Sheets schema source of truth is `SHEET_SCHEMAS` in `Code.gs`. If columns change, update tests and every read/write path in the same change.

## Exact Sheets Schema

Create these sheets exactly, with these headers in row 1:

```text
Users
id | name | email | phone | role | created_at

Submissions
id | user_id | type | payload | status | created_at

Members
id | submission_id | name | dob | phone

Courses
id | title | description

Sections
id | course_id | title | order

Lessons
id | course_id | section_id | title | description | drive_file_id | resource_url | order

Products
id | title | description | price | image_url
```

`Code.gs` has `setupDatabaseSchema()` and `ensureDatabaseSchema()` to create/fix these sheets.

To initialize the cloud spreadsheet after deploying Apps Script:

```text
<GAS_WEB_APP_URL>?action=setupDatabase&token=DARA-ELKEDESEEN
```

## Apps Script API Contract

All API responses should be JSON:

```json
{ "success": true, "data": {} }
```

Errors should be:

```json
{ "success": false, "error": "Message" }
```

Current actions:

- `POST submitForm`: creates/fetches a user, creates a submission, inserts members, marks submission `completed`.
- `GET checkUser`: verifies a browser-stored user has a matching completed submission.
- `GET getCourses`: returns courses with lessons.
- `GET getLessons`: returns lessons for one course.
- `GET getProducts`: returns products.
- `GET setupDatabase`: creates/fixes the database sheets.
- `GET clearCache`: clears cached course/product reads.

Protected actions must include the token. The current secret is `DARA-ELKEDESEEN`; keep frontend env `NEXT_PUBLIC_GAS_SECRET_KEY` aligned with `CONFIG.SECRET`.

## Access Rules

Do not trust `localStorage` by itself.

The old `dara_has_submitted=true` flag is stale and must not grant access. Current access is stored under `dara_access` with:

```ts
{
  email: string
  phone: string
  submissionId: string
}
```

On page load, `app/page.tsx` calls `checkUserAccess()` to confirm the user exists in Sheets and has a `completed` submission. If the backend cannot confirm it, clear local access and show the registration form again.

Navbar access must use `getStoredAccess()` from `lib/access-storage.ts`, not direct localStorage checks.

## Frontend Rules

Keep files small and focused.

- Put API fetch logic in `lib/api-client.ts`.
- Put localStorage access logic in `lib/access-storage.ts`.
- Put registration validation/helper logic in `lib/registration.ts`.
- Keep `app/page.tsx` mainly for rendering, form state, and page-level flow.
- Use existing UI components from `components/ui/`.

Do not add broad abstractions or new libraries unless they solve a real current problem.

## UI And Brand

Brand:

- Name: DaRA
- Full name: M&P Didaskalia Advanced Robotics Association
- Feel: clean, structured, professional, educational robotics

Colors:

- Primary blue: `#2E4A7D`
- Accent yellow: `#F5A623`
- Current registration CTA uses red styling from the user-approved `app/page.tsx`; do not change it casually.
- Background should be light/off-white.

Assets live in `public/`. Prefer existing DaRA assets before introducing new imagery.

## Data Flow For Registration

1. User fills the registration form in `app/page.tsx`.
2. Zod validation runs from `registrationSchema`.
3. `submitToGas()` posts `{ action: "submitForm", token, payload }`.
4. Apps Script writes:
   - `Users`: one user per email
   - `Submissions`: full JSON payload and status
   - `Members`: normalized member rows
5. Frontend stores `dara_access` only after successful GAS response.
6. Frontend dispatches `dara_access_granted` so navbar updates.

If data is not appearing in Sheets, check in this order:

1. Is `.env` `NEXT_PUBLIC_GAS_URL` pointing at the current Web App deployment URL?
2. Is `.env` `NEXT_PUBLIC_GAS_SECRET_KEY` equal to `CONFIG.SECRET` in cloud `Code.gs`?
3. Was the updated `Code.gs` pasted/deployed to the cloud Apps Script?
4. Was `setupDatabase` run against the target spreadsheet?
5. Does `submitToGas()` receive `{ success: true, data: { submissionId } }`?

## Testing And Verification

Before claiming work is done, run:

```bash
node --test tests/schema-contract.test.mjs tests/access-storage.test.mjs
pnpm typecheck
pnpm lint
pnpm build
```

For local manual testing, the app usually runs at:

```text
http://127.0.0.1:3000
```

If port 3000 is already taken, inspect the existing server before starting another one.

## Current Test Purpose

- `tests/schema-contract.test.mjs`: guards the exact Sheets schema, GAS setup/check endpoints, and API error handling.
- `tests/access-storage.test.mjs`: guards browser access storage and backend verification behavior.

If you change schema, access flow, or API contract, update these tests first and watch them fail before implementing.

## Git And Workspace Notes

There may be user-created assets in `public/` that are untracked. Do not delete or revert them.

Do not revert user changes unless explicitly asked.

Keep changes scoped. If a file is getting large, extract a small helper instead of piling more logic into it.

## Final Principle

Working system first. Exact schema. Verified backend. UI stays aligned with `app/page.tsx`.
