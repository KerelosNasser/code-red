# Design Doc: New Home Page & Session Persistence

## 1. Goals
- Transform the root `/` path from a registration form into a welcoming dashboard for the M&P Didaskalia Advanced Robotics Association (DaRa).
- Provide a visually appealing hero section with abstract shapes and branding.
- Showcase previews of courses and products on the home page.
- Ensure seamless session persistence so users don't have to log in every time they visit.

## 2. Architecture & Flow

### Page Restructuring
- **`app/register/page.tsx`**: The current registration/login form logic in `app/page.tsx` will be moved here. This becomes the dedicated authentication route.
- **`app/page.tsx`**: A completely new landing/dashboard page.

### Session Persistence
- **Current State**: `lib/access-storage.ts` already uses `localStorage` (`dara_access`).
- **Improvement**: We will maintain this `localStorage` approach as the primary persistence mechanism. 
- **Validation**: On the new home page, we will silently verify the stored credentials against the backend (using `checkUserAccess`). 
  - If valid: The UI reflects the logged-in state (e.g., CTA changes to "Continue Learning").
  - If invalid: The local storage is cleared, and the UI reflects the logged-out state (e.g., CTA shows "Join / Login").
  - This validation happens in the background to avoid blocking the initial render with a loading spinner.

## 3. Visual Components (Home Page)

### Hero Section
- **Branding**: Displays the "DaRa" logo and full name "M&P Didaskalia Advanced Robotics Association".
- **Aesthetics**: Light off-white background with primary blue (`#2E4A7D`) and accent yellow (`#F5A623`).
- **Visuals**: Abstract, procedurally generated CSS shapes (e.g., SVG or CSS circles/lines representing circuits or robotics) to create a warm, modern feel.
- **CTA**: Dynamic based on auth state.
  - Logged Out: "Join the Association" (links to `/register`).
  - Logged In: "View Courses" (links to `/courses`).

### Showcase Sections
- **Courses Preview**: Fetches the latest 3 courses using the existing `getCourses` API client function. Renders them using small card components similar to the `/courses` page.
- **Products Preview**: Fetches the latest 3 products using the existing `getProducts` API client function. Renders them using small card components similar to the `/store` page.

## 4. Data Flow
1. User visits `/`.
2. Page mounts and immediately shows cached/optimistic UI based on `getStoredAccess()`.
3. Concurrently, a background request verifies the access via `checkUserAccess()`.
4. Page fetches preview data via `getCourses()` and `getProducts()`.
5. If the user clicks "Join", they go to `/register`. After successful registration/login, they are redirected back to `/` or `/courses`.

## 5. Testing & Verification
- Ensure the existing `tests/access-storage.test.mjs` still passes.
- Verify the `dara_access_granted` event still correctly updates the Navbar.
- Verify that manually clearing `localStorage` correctly updates the Home page state.
- Run `pnpm typecheck`, `pnpm lint`, and `pnpm build` before completing the task.
