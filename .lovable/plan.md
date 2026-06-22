## Problem

The runtime error `Invariant failed: Expected to find a match below the root match in SPA mode` is caused by mixing `ssr: false` on individual routes (`/`, `/auth`, `/_authenticated`) with components that return `null` or depend on async redirects from `beforeLoad`. TanStack's SPA-mode invariant requires every route in the matched chain to render real content, which our redirect-only `index` and the SSR-skipped `_authenticated` layout violate.

## Fix

Stop using `ssr: false` and stop doing auth redirects in `beforeLoad`. Gate auth entirely in the client with a small hook, and have each route render a real component (loading state, redirect-on-mount, or content).

### Changes

1. **`src/routes/index.tsx`** — remove `ssr: false`. Component mounts, checks session in `useEffect`, then navigates to `/dashboard` or `/auth`. Renders a tiny "Loading…" placeholder instead of `null`.

2. **`src/routes/_authenticated/route.tsx`** — remove `ssr: false` and `beforeLoad`. Component uses a `useAuthReady` hook: while loading, render a spinner/placeholder; if no user, `navigate({ to: "/auth", replace: true })` from `useEffect`; if user present, render `<Outlet />`.

3. **`src/routes/auth.tsx`** — remove `ssr: false`. Keep the existing `useEffect` that redirects already-signed-in users to `/dashboard`.

4. **New `src/hooks/use-auth-ready.ts`** — calls `supabase.auth.getSession()` once, subscribes to `onAuthStateChange`, returns `{ user, isReady }`. Used by `_authenticated` layout (and reusable elsewhere).

5. **`src/routes/_authenticated/dashboard.tsx`** — keep current logic; the layout guarantees a user before it mounts, so queries are safe.

### Why this works

- Every route renders a real component on first paint → no SPA-mode invariant violation.
- Auth check happens after hydration in `useEffect`, so SSR/CSR markup matches → no hydration mismatch.
- Centralized `useAuthReady` avoids the `INITIAL_SESSION` race where `auth.uid()` is null during the first RLS query.

No backend or schema changes required.