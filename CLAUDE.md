# PMVM / R3SET
Fitness. Next14 App Router, TS, Tailwind, next-intl `es|en|pt` → `src/app/[locale]/`. Supabase Auth/DB/RLS. Schema: `supabase/README-tables.md`. Routes: `dashboard/*`, `dashboard-legacy/*`, `admin/*` (role `admin` + `createAdminClient` in `admin/layout.tsx`), auth/onboarding/checkout, `planes`, `v2`/`v3`. `src/middleware.ts`: auth+i18n; not admin check. `@/lib/supabase/client` | `server`. `NEXT_PUBLIC_SUPABASE_*`. `npm run dev|build|lint`

**Approach:** Think first. Read before write; concise output, thorough reasoning; edit files, don’t wholesale rewrite; don’t re-read unless changed; test before done; no filler; keep it simple; user instructions override this file.
