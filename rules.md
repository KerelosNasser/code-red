# DaRA Project Rules

## Access Rules

Do not trust `localStorage` by itself.

Access is stored under `dara_access` with:

```ts
{
  phone: string
  role: 'admin' | 'servant' | 'member'
  teamName?: string
  firstName?: string
  lastName?: string
}
```

On page load, if access exists, the app may call `checkUserAccess()` to verify permissions.

Navbar access must use `getStoredAccess()` from `lib/access-storage.ts`, not direct localStorage checks.

## Admin Roles & Logic

- **Admins:** Defined in `.env` as `NEXT_PUBLIC_ADMIN_PHONES` (comma-separated).
- **Members/Servants:** Added by Admins via the Registration Dashboard.
- **Access Flow:** Anyone can log in with a phone number. If the number is in `.env`, they are an Admin. If it's in the Sheets `Users` table, they get their assigned role. Otherwise, access is denied.

## Frontend Rules

Keep files small and focused.

- Put API fetch logic in `lib/api-client.ts`.
- Put localStorage access logic in `lib/access-storage.ts`.
- Put registration/login validation in `lib/registration.ts`.
- Use existing UI components from `components/ui/`.

## UI And Brand

Brand:
- Name: DaRA
- Full name: M&P Didaskalia Advanced Robotics Association
- Feel: clean, structured, professional, educational robotics

Colors:
- Primary blue: `#2E4A7D`
- Accent yellow: `#F5A623`
- Accent Red: `#B91C1C`

## Data Flow

1. Admin logs in via phone number (verified against `.env`).
2. Admin adds members to their team via the Registration Dashboard.
3. Members log in via phone number (verified against Sheets `Users` table).
4. Courses are publically available.
5. Assets are shared among all members managed by the same Admin.
6. Only Admins can access the Store and make purchases.

## Testing And Verification

Before claiming work is done, run:

```bash
pnpm typecheck
pnpm lint
pnpm build
```
