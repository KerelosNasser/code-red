# Dashboard Refactor Design

Refactor `app/dashboard/page.tsx` (~934 lines) into modular components and a custom hook to improve maintainability and readability.

## Architecture

- **Custom Hook**: `hooks/use-dashboard.ts` will manage all state, API calls, and business logic.
- **Dumb Components**: UI components moved to `components/dashboard/`.
- **Layout Shell**: `app/dashboard/page.tsx` will focus on layout composition.

## Components Map

- `components/dashboard/stat-card.tsx`: `StatCard`
- `components/dashboard/avatar.tsx`: `Avatar`
- `components/dashboard/member-row.tsx`: `MemberRow`
- `components/dashboard/team-card.tsx`: `TeamCard` (uses `MemberRow`)
- `components/dashboard/sidebar.tsx`: `Sidebar`
- `components/dashboard/add-team-dialog.tsx`: `AddTeamDialog`
- `components/dashboard/add-user-dialog.tsx`: `AddUserDialog`
- `components/dashboard/profile-dialog.tsx`: `ProfileDialog`

## State & Logic Hook (`use-dashboard.ts`)

- **State**: `managedUsers`, `teams`, `adminProfile`, `access`, `loadingStates`, `dialogOpenStates`.
- **Methods**: `onAddUser`, `onAddTeam`, `onDeleteUser`, `onDeleteTeam`, `onUpdateProfile`, `refreshData`.
- **Initialization**: Handles initial fetch of users, teams, and admin profile.

## Data Flow

1. `DashboardPage` calls `useDashboard()`.
2. Hook checks storage, fetches data.
3. Page displays loading spinner if `isCheckingAccess`.
4. Page redirects to `/register` if no access.
5. Page renders layout with components, passing data/actions as props.

## Success Criteria

- `app/dashboard/page.tsx` under 150 lines.
- No logic changes; behavior preserved exactly.
- All components isolated and testable.
