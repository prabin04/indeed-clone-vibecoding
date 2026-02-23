# Jobly — Project Plan

Indeed-style job board. B2C job seekers apply for jobs; B2B employers post jobs via Clerk Organizations with Clerk Billing plans.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database / Backend**: Convex
- **Auth + Orgs + Billing**: Clerk (`@clerk/nextjs` v6)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript

## User Types

| User | Description |
|---|---|
| Job Seeker | B2C — browses and applies for jobs. No org required. |
| Employer Admin | Creates a Clerk Organization (= their company). Manages billing and team members. |
| Employer Member | Invited to the org. Can post/manage jobs based on plan. |

---

## Clerk Configuration

### Organizations (B2B)
- Every employer company = one Clerk Organization
- Roles: `org:admin` (owner, billing), `org:member` (recruiter)
- `OrganizationSwitcher` lets users switch between companies they belong to

### Billing (B2B — scoped to Organizations)
Plans are set up in Clerk Dashboard → Billing → Plans for Organizations:

| Plan | Price | Features |
|---|---|---|
| Starter | Free | Up to 3 active job posts |
| Pro | ~$49/mo | Unlimited posts + featured listings |
| Enterprise | ~$149/mo | All Pro + analytics + priority support |

Key Clerk Billing components/methods:
```tsx
// Pricing page
<PricingTable for="organization" />

// Gate UI by plan
<Protect plan="pro" fallback={<UpgradePrompt />}>
  <FeaturedListingToggle />
</Protect>

// Server-side plan check
const { has } = await auth()
if (!has({ feature: 'post_jobs' })) redirect('/employer/pricing')
```

### JWT Bridge (Clerk → Convex)
- Clerk Dashboard → JWT Templates → create template named exactly `convex`
- Copy Issuer URL → set as `CLERK_JWT_ISSUER_DOMAIN` in `.env.local` AND Convex Dashboard → Settings → Environment Variables
- In Convex mutations, identity org is available via `ctx.auth.getUserIdentity()` → `org_id`

---

## Environment Variables

```
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CONVEX_SITE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_JWT_ISSUER_DOMAIN=        # From Clerk JWT Templates → "convex" template → Issuer URL
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

---

## Route Structure

```
/                                    Landing page (job search hero, featured jobs, categories)
/jobs                                Browse all jobs (public)
/jobs/[id]                           Job detail + Apply button (apply requires auth)
/sign-in                             Clerk SignIn page
/sign-up                             Clerk SignUp page

/employer                            Employer value prop / landing
/employer/onboarding                 Create org + select billing plan
/employer/pricing                    <PricingTable for="organization" />

/employer/dashboard                  Requires: auth + active org
/employer/dashboard/jobs             List and manage job postings
/employer/dashboard/jobs/new         Create a job (plan-gated)
/employer/dashboard/jobs/[id]/edit   Edit a job posting
/employer/dashboard/applications     View all applicants across jobs
/employer/dashboard/members          <OrganizationProfile /> — invite/manage members
/employer/dashboard/billing          Billing management tab
```

### Middleware Protection
```ts
// middleware.ts
const isEmployerDashboard = createRouteMatcher(['/employer/dashboard(.*)'])
const isApplyRoute = createRouteMatcher(['/jobs/apply(.*)'])
// Both routes call auth.protect() — redirect to sign-in if unauthenticated
```

---

## Convex Schema

### jobs
```ts
{
  orgId: string           // Clerk org ID
  title: string
  company: string
  location: string
  type: "full-time" | "part-time" | "contract" | "internship" | "remote"
  salary?: { min: number; max: number; currency: string }
  description: string
  requirements: string[]
  featured: boolean       // Pro plan only
  status: "active" | "closed" | "draft"
  postedBy: string        // Clerk userId
  createdAt: number
}
// Indexes: by_orgId, by_status, by_featured_status
// Search index: search_jobs on title, filtered by location/type/status
```

### applications
```ts
{
  jobId: Id<"jobs">
  applicantId: string     // Clerk userId
  status: "pending" | "reviewed" | "rejected" | "interview"
  resumeUrl?: string
  coverLetter?: string
  appliedAt: number
}
// Indexes: by_jobId, by_applicantId, by_jobId_applicantId
```

---

## Component Conventions

- `components/navbar.tsx` — site-wide sticky nav (client component)
- `components/` — shared UI components
- `app/(auth)/` — Clerk auth pages (sign-in, sign-up) — route group, no shared layout
- `app/employer/` — all employer-facing routes
- Convex functions live in `convex/` — one file per domain (e.g. `jobs.ts`, `applications.ts`)
- Use `@/` path alias for all imports (maps to project root)

---

## Implementation Phases

### Phase 1 — Foundation ✅
- [x] Convex schema (jobs + applications tables)
- [x] Clerk → Convex JWT auth bridge (`auth.config.ts`)
- [x] Middleware route protection
- [x] Landing page (hero search, featured jobs, categories, employer CTA, footer)
- [x] Clerk auth pages (sign-in, sign-up)
- [x] Navbar component

### Phase 2 — Job Seeker Flow ✅
- [x] `/jobs` — browse page with search, filters (type, location)
- [x] `/jobs/[id]` — job detail page
- [x] Application submission form (requires sign-in, duplicate-prevention, closed-job guard)
- [x] Applicant dashboard — `/dashboard/applications` — view my applications + statuses

### Phase 3 — Employer Org Setup ✅
- [x] `/employer` — value prop landing page (features, pricing preview, CTAs)
- [x] `/employer/onboarding` — `<CreateOrganization />` flow with 3-step indicator
- [x] `/employer/pricing` — `<PricingTable for="organization" />` with org guard
- [x] Employer dashboard shell (`layout.tsx`) with sidebar + `<OrganizationSwitcher />`
- [x] `/employer/dashboard` — overview with stats, quick actions, getting-started checklist
- [x] Middleware updated: redirects to onboarding if authed but no active org

### Phase 4 — Employer Job Management (Plan-Gated) ✅
- [x] Create / edit / close job postings (`createJob`, `updateJob`, `closeJob` mutations)
- [x] Starter plan 3 active job limit enforced in Convex mutation + client-side usage bar
- [x] Featured listing toggle gated behind `<Protect plan="pro">` in shared `JobForm`
- [x] `getOrgJobsWithCounts` — job list with per-job application counts
- [x] `/employer/dashboard/jobs` — job table with status, apps, edit/close/publish actions
- [x] `/employer/dashboard/jobs/new` — create job (plan-aware, org-scoped)
- [x] `/employer/dashboard/jobs/[id]/edit` — edit any org job
- [x] `/employer/dashboard/applications` — view + manage all applicants, filter by job
- [x] Application status workflow: pending → reviewed → interview / rejected

### Phase 5 — Team Management ✅
- [x] Member invitations via `<OrganizationProfile />` — `/employer/dashboard/members/[[...rest]]`
- [x] Billing page — `/employer/dashboard/billing` — admin-only (`org:admin` redirect guard), `<PricingTable for="organization" />`
- [x] Role-based UI — only `org:admin` sees billing tab in sidebar
- [x] Role-based mutation guards in Convex:
  - `createJob` — requires `org:admin` or `org:member`
  - `updateJob` — requires `org:admin` or `org:member`
  - `closeJob` — requires `org:admin` only
  - `updateApplicationStatus` — requires `org:admin` or `org:member`

---

## Key Patterns

### Plan-gating a Convex mutation (server-side)
```ts
// In a Convex mutation, check the org's plan via the JWT claim
// Clerk embeds `org_id` and custom claims into the JWT
// Use has() on the client, or pass plan info via args validated against Clerk server SDK
```

### Scoping Convex data to an org
```ts
// Always filter by orgId from the authenticated identity
const identity = await ctx.auth.getUserIdentity()
const orgId = identity?.org_id // from Clerk JWT
if (!orgId) throw new Error("Not part of an organization")
const jobs = await ctx.db.query("jobs").withIndex("by_orgId", q => q.eq("orgId", orgId)).collect()
```

### Checking plan client-side
```tsx
import { useOrganization } from '@clerk/nextjs'
// Use Protect component or has() from useAuth() for UI gating
```
