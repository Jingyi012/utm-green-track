---
name: green-track-tanstack-start-migration
description: Migrate the `green-track` frontend from Next.js App Router to TanStack Start. Use when the user wants to replace Next.js with TanStack Start in this repo, convert `src/app` routes into `src/routes`, swap `next/navigation`, `next/link`, `next/image`, or `next/font`, remove `@ant-design/nextjs-registry`, or rename `NEXT_PUBLIC_*` variables to `VITE_*`.
---

# GreenTrack TanStack Start Migration

Use this skill only for the frontend app in `green-track/`.

## Read first

1. Run `powershell -ExecutionPolicy Bypass -File .codex/skills/green-track-tanstack-start-migration/scripts/audit-nextjs-surface.ps1 -FrontendPath .`
2. Read `references/green-track-audit.md`
3. Read `references/next-to-start-replacements.md` before changing routes or framework config

## Goals

- Replace Next.js App Router with TanStack Start and Vite
- Preserve the existing Ant Design, SWR, Zustand, axios, and backend API behavior
- Keep the current URLs stable unless the user explicitly asks for route changes
- Migrate framework glue first, then move route files, then replace Next-only APIs inside shared components

## Required workflow

1. Audit the current surface area
   - Confirm package scripts, Next-only dependencies, env vars, and every file importing `next/*`
   - Inventory `src/app/**/page.tsx`, `layout.tsx`, `not-found.tsx`, and any redirect-only routes
2. Replace the framework shell first
   - Update `package.json` scripts from Next CLI to Vite/TanStack Start
   - Remove Next-only config and dependencies such as `next`, `next-env.d.ts`, `next.config.*`, `eslint-config-next`, `@ant-design/nextjs-registry`, and `postcss.config.*` if it exists only for Next/Tailwind wiring
   - Add TanStack Start and Vite config, including `vite.config.ts` and `src/router.tsx`
3. Re-home routes before touching business components
   - Move `src/app/layout.tsx` into `src/routes/__root.tsx`
   - Move `src/app/page.tsx` into `src/routes/index.tsx`
   - Convert grouped Next folders into TanStack route groups or pathless layouts without changing URL paths
   - Keep the existing page components working with the smallest possible wrapper changes
4. Replace Next-specific runtime APIs
   - `next/navigation` -> TanStack Router route APIs and navigation hooks
   - `next/link` -> `Link` from `@tanstack/react-router`
   - `next/image` -> plain `img` first, or `@unpic/react` if image optimization is worth the extra dependency
   - `next/font` -> CSS/font packages; do not leave font loading tied to Next
   - `Metadata` and `generateMetadata` -> TanStack route `head()` definitions
5. Fix environment access and SSR boundaries
   - Client-safe env vars must move from `process.env.NEXT_PUBLIC_*` to `import.meta.env.VITE_*`
   - Current auth and axios code read `localStorage`; do not move that logic into server-only code accidentally
   - If a route depends on browser-only APIs during initial render, treat selective SSR as a deliberate design decision instead of an afterthought
6. Validate after each phase
   - Build
   - Start the dev server
   - Smoke test login, logout, protected internal pages, search-param driven pages, and image-heavy layouts

## Repo-specific constraints

- `src/contexts/AppProvider.tsx` currently wraps the app with `AntdRegistry`, `ConfigProvider`, `ProConfigProvider`, `App`, and `AuthProvider`. Remove only the Next-specific registry layer unless the user asks for broader provider cleanup.
- `src/contexts/AuthContext.tsx`, `src/components/routes/PageGuard.tsx`, and `src/lib/utils/axios.ts` rely on `localStorage` and client navigation. Treat auth migration as client-first unless the user asks for a server-driven auth redesign.
- `src/app/(internal)/layout.tsx` is the closest thing to a protected shell. Convert it to a TanStack pathless layout route so internal pages stay wrapped without adding an `/internal` URL segment.
- `.env` currently exposes `NEXT_PUBLIC_API_URL`. Rename it to `VITE_API_URL` and update client reads accordingly.

## Preferred route shape for this repo

- Use `src/routes/__root.tsx` for the document shell
- Use `src/routes/index.tsx` for `/`
- Use `src/routes/(auth)/*` for auth pages that only need organization
- Use `src/routes/_internal/route.tsx` plus child routes inside `src/routes/_internal/` for the protected internal shell
- Do not hand-edit `src/routeTree.gen.ts`; let TanStack Start generate it

## Validation checklist

- `package.json` no longer references Next commands or packages
- `src` no longer imports `next/navigation`, `next/link`, `next/image`, `next/font/*`, or `next/*` metadata types
- Root redirect still sends `/` to `/login`
- Internal pages still gate by auth and permission checks
- Search-param pages still read and update URL state correctly
- API base URL still resolves from the client environment

## Official docs to use for accuracy

- TanStack Start migrate-from-next-js: `https://tanstack.com/start/latest/docs/framework/react/migrate-from-next-js`
- TanStack Start routing guide: `https://tanstack.com/start/latest/docs/framework/react/guide/routing`
- TanStack Start environment variables: `https://tanstack.com/start/latest/docs/framework/react/guide/environment-variables`
- TanStack Router authenticated routes: `https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes`

## When to slow down and confirm with the user

- When changing auth behavior beyond replacing the router layer
- When introducing server functions or moving axios calls to loaders
- When changing image handling strategy from simple compatibility to optimization work
- When route URLs would change
