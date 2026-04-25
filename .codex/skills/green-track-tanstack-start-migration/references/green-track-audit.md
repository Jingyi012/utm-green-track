# GreenTrack Frontend Audit

This reference captures the current Next.js-specific surface area in `green-track/` before migration.

## Current framework profile

- Framework: Next.js `15.3.6`
- React: `19`
- Router style: App Router under `src/app`
- UI stack: Ant Design, Ant Design Pro, SWR, Zustand, axios
- Tailwind is present in dependencies, but the app is primarily Ant Design-driven

## Package-level hotspots

- `package.json`
  - Scripts use `next dev`, `next build`, `next start`, and `next lint`
  - Dependencies include `next` and `@ant-design/nextjs-registry`
  - Dev dependencies include `eslint-config-next`
- `next.config.ts`
- `next-env.d.ts`

## Root app shell

- `src/app/layout.tsx`
  - Uses `Metadata` from `next`
  - Uses `Geist` and `Geist_Mono` from `next/font/google`
  - Wraps children with `AppProviders`
- `src/app/page.tsx`
  - Redirect-only root page using `redirect('/login')`
- `src/app/not-found.tsx`
  - Client component using `useRouter` from `next/navigation`

## Provider stack

- `src/contexts/AppProvider.tsx`
  - Uses `AntdRegistry` from `@ant-design/nextjs-registry`
  - Uses `ConfigProvider`, `ProConfigProvider`, `App`, and `AuthProvider`
- `src/contexts/AuthContext.tsx`
  - Uses `useRouter` from `next/navigation`
  - Hydrates auth state from `localStorage`

## Protected shell

- `src/app/(internal)/layout.tsx`
  - Wraps internal pages with `PageGuard`, `ConfigProvider`, and `AppProLayout`
- `src/components/routes/PageGuard.tsx`
  - Uses `usePathname` from `next/navigation`
  - Depends on `AuthContext` and permission lookup

## Current route inventory

### Public/auth routes

- `/login` -> `src/app/(auth)/login/page.tsx`
- `/signup` -> `src/app/(auth)/signup/page.tsx`
- `/forgot-password` -> `src/app/(auth)/forgot-password/page.tsx`
- `/reset-password` -> `src/app/(auth)/reset-password/page.tsx`

### Internal routes

- `/home`
- `/dashboard`
- `/waste-info`
- `/waste-data/management`
- `/waste-data/approval`
- `/waste-data/requests`
- `/data-entry/new-form`
- `/data-entry/statistic`
- `/data-entry/view-form`
- `/data-entry/view-form/record`
- `/data-entry/view-form/requests`
- `/data-analytics`
- `/enquiry`
- `/notifications`
- `/users/management`
- `/users/approval`
- `/settings/edit-profile`
- `/settings/change-password`
- `/configurations`
- `/configurations/role-permissions`

## Next-specific imports found in shared components

### Navigation

- `src/contexts/AuthContext.tsx`
- `src/components/routes/PageGuard.tsx`
- `src/components/home/HomeSection.tsx`
- `src/components/wasteRecords/WasteRecordManagement.tsx`
- `src/components/wasteRecords/WasteRecordDetailPage.tsx`
- `src/components/auth/LoginForm.tsx`
- `src/components/auth/RegisterForm.tsx`
- `src/components/auth/ResetPasswordForm.tsx`
- `src/components/request/RequestManagement.tsx`
- `src/components/request/MyRequestManagement.tsx`
- `src/components/dataAnalytics/DataAnalyticsPage.tsx`
- `src/components/layouts/AppProLayout.tsx`
- `src/components/layouts/forbiddenPage.tsx`
- `src/components/notification/NotificationList.tsx`
- `src/components/notification/NotificationBell.tsx`
- `src/app/not-found.tsx`

### Link

- `src/components/breadcrumb/CustomBreadcrumb.tsx`
- `src/components/auth/LoginForm.tsx`

### Image

- `src/components/wasteInfo/WasteInfoUpperCards.tsx`
- `src/components/dashboard/InfoCardGrid.tsx`
- `src/components/layouts/AuthLayout.tsx`
- `src/components/layouts/AppProLayout.tsx`

### Font and metadata

- `src/app/layout.tsx`
- `src/app/page.tsx`

## Environment and client/runtime assumptions

- `.env` defines `NEXT_PUBLIC_API_URL=https://localhost:7280`
- `src/lib/utils/axios.ts` reads `process.env.NEXT_PUBLIC_API_URL`
- The axios instance reads and writes `localStorage` and uses `window.location.href`
- This means the current frontend assumes browser availability for auth/session behavior

## Migration implications

- Remove `AntdRegistry`; it is Next-specific
- Replace `next/font` with CSS-based font loading
- Replace search-param and pathname reads with TanStack Router hooks or route APIs
- Keep auth client-driven first; SSR-aware auth can be a second pass
