# Design Doc: Google Sheets Backend & Apps Script API

Upgrading the existing Next.js application from a direct Google Form POST to a structured REST-like API using Google Sheets as a database and Google Apps Script (GAS) as the backend.

## 1. Goals
- Replace Google Form POST with a custom GAS Web App.
- Implement a normalized, queryable database structure in Google Sheets.
- Optimize for performance using batch operations and `CacheService`.
- Provide a clean Next.js integration layer.

## 2. Data Architecture (Google Sheets)

| Sheet | Columns | Description |
| :--- | :--- | :--- |
| **Users** | `id`, `name`, `email`, `phone`, `role`, `created_at` | Servant/User records. |
| **Products** | `id`, `title`, `description`, `price`, `image_url` | Store items. |
| **Courses** | `id`, `title`, `description` | Course metadata. |
| **Lessons** | `id`, `course_id`, `title`, `drive_file_id`, `order` | Lessons linked to courses. |
| **Submissions** | `id`, `user_id`, `type`, `payload`, `status`, `created_at` | Historical log of full form payloads (JSON). |
| **Members** | `id`, `submission_id`, `name`, `dob`, `phone` | Extracted member data for analytics/filtering. |

### Architectural Decisions
- **UUIDs**: All records use UUIDs generated in GAS to avoid collisions and predictable IDs.
- **Hybrid Storage**: Submissions are stored as raw JSON (flexible) while Members are extracted into a separate table (queryable).
- **Relational Integrity**: Sheets use IDs for relationships. Joins (e.g., Courses to Lessons) are performed in-memory in GAS to minimize Sheet I/O.

## 3. Google Apps Script Backend

### Endpoints
- `GET ?action=getCourses`: Fetches all courses and their lessons. Uses batch reading.
- `GET ?action=getProducts`: Fetches all products.
- `GET ?action=getLessons&course_id=xxx`: Filtered lesson list.
- `POST { action: "submitForm", payload: { ... } }`: 
  1. Find/Create User.
  2. Create Submission record.
  3. Batch insert Members.

### Performance Optimizations
- **Batching**: Uses `getValues()` and `setValues()` on entire ranges. No per-row loops for Sheet operations.
- **Caching**: 
  - `CacheService` stores Course and Product data (10 min TTL).
  - `CacheService` stores `email -> user_id` mappings to speed up repeated lookups.
- **Indexing**: In-memory Maps for quick lookup of relational data during a single request.
- **Invalidation**: 
  - `POST` requests for submissions do NOT invalidate the global cache (since they don't affect courses/products).
  - A special `?action=clearCache` endpoint or manual deployment will handle updates to Courses/Products.

### Drive Integration
- Stores `drive_file_id` only.
- API returns both a download URL (`uc?export=download`) and a preview URL (`file/d/.../view`).

## 4. Next.js Integration

### `lib/api.ts`
A service layer using `fetch` to communicate with the GAS Web App.
- Handles `GET` requests with caching on the client side if needed.
- Handles `POST` requests with proper error handling for GAS's lack of true transactions.

### Error Handling
- Since GAS doesn't support ACID transactions, the `Submissions` table includes a `status` column.
- If a member batch write fails, the submission is marked as `PARTIAL_FAILURE` for manual intervention.

## 5. Security
- Use a `SECRET_KEY` header or parameter to prevent unauthorized writes (optional but recommended).
- Access to the GAS Web App set to "Anyone" (for public GETs) but validated internally.
