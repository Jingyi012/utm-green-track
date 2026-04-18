# Next.js to TanStack Start Replacement Map

Use this file while converting the `green-track` frontend.

## Infrastructure

| Next.js piece | TanStack Start target | Notes |
| --- | --- | --- |
| `next` package and CLI scripts | `@tanstack/react-start`, `@tanstack/react-router`, `vite`, `@vitejs/plugin-react` | TanStack Start runs on Vite |
| `next.config.ts` | `vite.config.ts` | Configure `tanstackStart()` before `viteReact()` |
| `next-env.d.ts` | remove | Not needed outside Next |
| `postcss.config.mjs` for Next/Tailwind wiring | Vite/TanStack setup | Keep only if another tool still needs it |
| `@ant-design/nextjs-registry` | remove | Keep other Ant Design providers |
| `src/app/*` | `src/routes/*` plus `src/router.tsx` | File-based routing stays, but conventions change |

## Route file mapping

| Current file | Preferred target |
| --- | --- |
| `src/app/layout.tsx` | `src/routes/__root.tsx` |
| `src/app/page.tsx` | `src/routes/index.tsx` |
| `src/app/not-found.tsx` | TanStack root `notFoundComponent` or route-level fallback in `__root.tsx` |
| `src/app/(auth)/login/page.tsx` | `src/routes/(auth)/login.tsx` |
| `src/app/(auth)/signup/page.tsx` | `src/routes/(auth)/signup.tsx` |
| `src/app/(auth)/forgot-password/page.tsx` | `src/routes/(auth)/forgot-password.tsx` |
| `src/app/(auth)/reset-password/page.tsx` | `src/routes/(auth)/reset-password.tsx` |
| `src/app/(internal)/layout.tsx` | `src/routes/_internal/route.tsx` |
| `src/app/(internal)/dashboard/page.tsx` | `src/routes/_internal/dashboard.tsx` |
| `src/app/(internal)/home/page.tsx` | `src/routes/_internal/home.tsx` |
| `src/app/(internal)/waste-info/page.tsx` | `src/routes/_internal/waste-info.tsx` |
| `src/app/(internal)/waste-data/management/page.tsx` | `src/routes/_internal/waste-data/management.tsx` |
| `src/app/(internal)/waste-data/approval/page.tsx` | `src/routes/_internal/waste-data/approval.tsx` |
| `src/app/(internal)/waste-data/requests/page.tsx` | `src/routes/_internal/waste-data/requests.tsx` |
| `src/app/(internal)/data-entry/new-form/page.tsx` | `src/routes/_internal/data-entry/new-form.tsx` |
| `src/app/(internal)/data-entry/statistic/page.tsx` | `src/routes/_internal/data-entry/statistic.tsx` |
| `src/app/(internal)/data-entry/view-form/page.tsx` | `src/routes/_internal/data-entry/view-form.tsx` |
| `src/app/(internal)/data-entry/view-form/record/page.tsx` | `src/routes/_internal/data-entry/view-form/record.tsx` |
| `src/app/(internal)/data-entry/view-form/requests/page.tsx` | `src/routes/_internal/data-entry/view-form/requests.tsx` |
| `src/app/(internal)/data-analytics/page.tsx` | `src/routes/_internal/data-analytics.tsx` |
| `src/app/(internal)/enquiry/page.tsx` | `src/routes/_internal/enquiry.tsx` |
| `src/app/(internal)/notifications/page.tsx` | `src/routes/_internal/notifications.tsx` |
| `src/app/(internal)/users/management/page.tsx` | `src/routes/_internal/users/management.tsx` |
| `src/app/(internal)/users/approval/page.tsx` | `src/routes/_internal/users/approval.tsx` |
| `src/app/(internal)/settings/edit-profile/page.tsx` | `src/routes/_internal/settings/edit-profile.tsx` |
| `src/app/(internal)/settings/change-password/page.tsx` | `src/routes/_internal/settings/change-password.tsx` |
| `src/app/(internal)/configurations/page.tsx` | `src/routes/_internal/configurations.tsx` |
| `src/app/(internal)/configurations/role-permissions/page.tsx` | `src/routes/_internal/configurations/role-permissions.tsx` |

## API replacements

| Next.js API | TanStack Start / Router replacement | Guidance |
| --- | --- | --- |
| `redirect('/login')` in a page | `throw redirect({ to: '/login' })` in `beforeLoad`, `loader`, or route config | Prefer route-level redirect over component-side imperative navigation |
| `useRouter()` | `useNavigate()` or route-bound navigation APIs | Use route APIs when the route already has a `Route` object |
| `usePathname()` | Router location hooks or route context | Use the current router location instead of Next pathname helpers |
| `useSearchParams()` | `Route.useSearch()` or router search APIs | Validate search when the route owns the params |
| `<Link href="/x" />` | `<Link to="/x" />` | Update props and typed params/search where useful |
| `<Image />` from `next/image` | plain `<img>` or `Image` from `@unpic/react` | Start with compatibility, optimize later |
| `Metadata` / `generateMetadata` | route `head()` | Move title/meta ownership into route definitions |
| `next/font/google` | CSS imports or Fontsource packages | Keep fonts framework-agnostic |

## GreenTrack-specific cautions

- `AuthContext` and `axios.ts` are browser-oriented today. Treat them as client code during the migration.
- If you move auth checks into `beforeLoad`, you need a router context or another SSR-safe auth source. Do not read `localStorage` directly in server execution paths.
- The internal shell should stay pathless. Do not accidentally create URLs like `/_internal/dashboard`.
- Rename client env usage from `NEXT_PUBLIC_API_URL` to `VITE_API_URL` and read it via `import.meta.env`.

## Recommended order for this repo

1. Replace package/config files
2. Introduce `vite.config.ts` and `src/router.tsx`
3. Build `src/routes/__root.tsx`
4. Build the `_internal` pathless layout route
5. Move auth routes
6. Move internal page routes
7. Replace shared component imports from `next/*`
8. Fix env access and smoke test auth/search/image flows
