# Design Spec: Global Auth Gate

**Topic:** Mandatory site-wide authentication gate.
**Date:** 2026-05-01

## 1. Problem Statement
The user wants a "Hard Gate" login system. No part of the website (including public courses) should be accessible until a user provides a phone number that is either an Admin (defined in `.env`) or a registered Team Member (defined in Google Sheets).

## 2. Architecture: Global Layout Wrapper

### 2.1 The AuthGate Component
We will implement an `AuthGate` component in `app/layout.tsx` that wraps the entire application.

- **Check:** On mount, it checks `localStorage` for `dara_access`.
- **Validation:** If access exists, it verifies it (locally for admins, via GAS for others).
- **Blocking:** If no access exists, it renders a full-screen login overlay instead of the page content.

### 2.2 Reusable Auth Logic
The login logic will be centralized to handle:
1. Egyptian phone normalization.
2. Admin check against `.env.NEXT_PUBLIC_ADMIN_PHONES`.
3. User check via `GAS_URL?action=checkUser`.

## 3. User Interface (The "Gate")

- **Visuals:** A centered, high-fidelity card with:
  - DaRa Logo and full name.
  - Title: "Access Protected".
  - Phone number input with fixed `+20` prefix.
  - "Enter Platform" button.
- **Feedback:** 
  - Loading state while verifying.
  - Error message: "Access Denied. Please contact your team administrator to be included in a team."

## 4. Data Flow

1. **Visit Site:** User arrives at any URL.
2. **Gate Check:** `AuthGate` detects no session.
3. **User Action:** User enters phone number.
4. **Normalization:** Input is cleaned (e.g., `012...` -> `2012...`).
5. **Admin Check:** If phone matches `.env`, grant `admin` role immediately.
6. **GAS Check:** If not admin, call GAS.
   - **Success:** Store `firstName`, `lastName`, `phone`, `role`, `teamName` and grant access.
   - **Fail:** Show "Access Denied" message.

## 5. Security & Persistence

- **Session Persistence:** `localStorage` will keep the user logged in across refreshes.
- **Logout:** A logout button in the Navbar will clear `localStorage` and trigger the Gate to reappear.

## 6. Testing Strategy

- **Test Admin Login:** Ensure numbers in `.env` bypass the Sheet check.
- **Test Member Login:** Ensure numbers in Sheets grant appropriate access.
- **Test Unauthorized:** Ensure unknown numbers remain blocked with a clear message.
- **Test Direct Navigation:** Navigate to `/courses/[id]` directly and ensure the gate still blocks it.
