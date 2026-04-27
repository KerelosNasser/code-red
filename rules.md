# DaRA Project Rules

## 1. Core Identity

* Brand Name: DaRA (Didaskalia Advanced Robotics Association)
* Theme: Professional, educational, tech + robotics
* Tone: Clean, structured, modern — NOT playful or generic

---

## 2. Visual Rules

### Colors

* Primary: Deep Blue (#2E4A7D or similar)
* Accent: Golden Yellow (#F5A623 or similar)
* Background: Light / off-white
* Text: Dark gray / near black

### Usage

* Blue = structure, headers, main UI
* Yellow = highlights, CTA, important actions
* Avoid random colors ❌

---

### Typography

* Headings: Serif (similar to logo style)
* Body: Clean sans-serif (Inter / system font)

---

### Layout Style

* Grid-based
* Clear spacing
* No clutter
* Strong hierarchy

---

### UI Feel

* Should feel like:

  * dashboard
  * learning platform
  * robotics system

NOT:

* social media app ❌
* gaming UI ❌
* overly rounded playful UI ❌

---

## 3. Components Rules

### Cards

* Slight border or shadow
* Clean edges (not too rounded)
* Consistent padding

### Buttons

* Primary → Blue background
* Secondary → Outline or subtle
* CTA → Yellow

---

### Forms

* Minimal
* Clear labels
* No unnecessary fields
* Fast to fill

---

## 4. Backend Rules (IMPORTANT)

### Google Sheets = Database

* Each sheet = table
* No schema changes without updating code
* No duplicate data across sheets

---

### Data Rules

* Always use:

  * `id` (UUID)
  * `created_at`
  * `status` when needed

---

### API Rules

* Always return:

```json
{ "success": true, "data": ... }
```

* Never expose raw Drive logic to frontend

---

## 5. Performance Rules

* Always cache GET requests
* Never loop Sheets inside loops
* Always batch read/write
* Avoid unnecessary API calls

---

## 6. Architecture Rules

* Keep separation:

  * UI (Next.js)
  * API (Apps Script)
  * Data (Sheets)
* No mixing logic between layers

---

## 7. Learning Platform Rules

* Courses are public (visible)
* Lessons:

  * `is_free` OR locked
* Access controlled via:

  * Enrollments

---

## 8. Store Rules

* Products must have:

  * title
  * image
  * price
* Keep display simple (no overdesign)

---

## 9. Code Quality Rules

* No overengineering
* Clear function names
* Modular logic
* Avoid duplication

---

## 10. MVP Mindset

* Build simple → then improve
* Do NOT optimize prematurely
* Focus on:

  * working system
  * clean structure
  * maintainability

---

## 11. Security (Basic)

* Use secret key for POST
* Do not trust frontend input
* Validate all required fields

---

## 12. Future Scalability

This system is:

* MVP-friendly ✅
* Not enterprise ❌

Design everything so it can be replaced later:

* Sheets → DB
* Apps Script → real backend

---

## Final Principle

**Clarity > Complexity**
**Structure > Features**
**Consistency > Creativity**

---

# 🔥 Extra Docs

## 📁 Suggested Project Structure

```
/app
/lib
  api.ts
/components
/styles
```

---

## 📦 API Layer Example

```ts
export async function submitForm(data) {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "submitForm",
      ...data
    })
  });

  return res.json();
}
```

---

## 🧠 Dev Mindset

* Build like:

  * system first
  * UI second

* Every feature should answer:

  * where is it stored?
  * how is it fetched?
  * how is it controlled?
