# Code Review Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Address code review feedback by adding a missing service, fixing validation messages, and cleaning up unused files.

**Architecture:** Surgical updates to Google Apps Script backend and React frontend validation logic.

**Tech Stack:** JavaScript (Google Apps Script), TypeScript, React, Zod.

---

### Task 1: Add `LessonService` to `Code.gs`

**Files:**
- Modify: `docs/google-apps-script/Code.gs:87-87`

- [ ] **Step 1: Add `LessonService` before `SheetUtils`**

```javascript
/**
 * SERVICES: Lesson
 */
const LessonService = {
  getByCourse: function(courseId) {
    const lessons = SheetUtils.readAll('Lessons');
    return lessons.filter(l => l.course_id === courseId).sort((a, b) => a.order - b.order);
  }
};

/**
 * UTILS: Sheets
 */
```

- [ ] **Step 2: Commit**

```bash
git add docs/google-apps-script/Code.gs
git commit -m "fix(gas): add LessonService to Code.gs"
```

### Task 2: Update Zod validation messages in `app/page.tsx`

**Files:**
- Modify: `app/page.tsx:24-25`
- Modify: `app/page.tsx:32-32`

- [ ] **Step 1: Update `MemberSchema` phone message**

```typescript
const MemberSchema = z.object({
  name: z.string().min(1, "Member name is required"),
  DOB: z.string().min(1, "Member date of birth is required"),
  PhoneNumber: z
    .string()
    .min(11, "Phone number must be 11 digits")
    .max(11, "Phone number must be 11 digits"),
})
```

- [ ] **Step 2: Update `schema.phone` message**

```typescript
const schema = z.object({
  name: z.string().min(1, "Servant name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(11, "Phone number must be 11 digits")
    .max(11, "Phone number must be 11 digits"),
  paymentReference: z.string().min(1, "Payment reference is required"),
  DOB: z.string().min(1, "Date of birth is required"),
  members: z.array(MemberSchema).max(15, "Maximum 15 members allowed"),
})
```

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "fix(validation): update phone validation messages to 11 digits"
```

### Task 3: Cleanup unused `lib/google-form.ts`

**Files:**
- Delete: `lib/google-form.ts`

- [ ] **Step 1: Remove the file**

Run: `rm C:\projects\code-red\lib\google-form.ts`

- [ ] **Step 2: Commit**

```bash
git add lib/google-form.ts
git commit -m "cleanup: remove unused lib/google-form.ts"
```

### Task 4: Final Verification

- [ ] **Step 1: Verify GAS code syntax** (Manual check, as it's GAS)
- [ ] **Step 2: Verify frontend compilation**

Run: `pnpm build` or `npm run build` (if applicable) or check for lint errors.
Expected: Build passes without errors related to the changes.
