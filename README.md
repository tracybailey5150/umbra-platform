# Umbra — AI Agent Platform

A reusable SaaS platform powering multiple AI-assisted business agent products.
One backend. Many focused agent front-ends. Built to scale from MVP to white-label empire.

---

## Architecture Overview

Umbra is a **platform-first, multi-product SaaS** with two main product lanes:

| Lane | Phase | Description |
|------|-------|-------------|
| **Quote / Intake Agents** | Phase 1 ✅ | AI-powered quote capture, intake, lead qualification, follow-up |
| **Persistent Buyer / Match Agents** | Phase 2 🔜 | Search, score, monitor, alert until the right match is found |

All products share a single backend platform. Each product can have its own URL, branding, and agent configuration. White-label deployment is architecturally supported from day one.

---

## Repo Structure

```
umbra-platform/
├── apps/
│   ├── web/              # Main Next.js app — dashboard + public intake forms
│   ├── landing/          # Marketing site (stub — can be separate domain)
│   └── admin/            # Platform-level admin (stub — for platform owner use)
│
├── packages/
│   ├── ui/               # Shared React component library (design system)
│   ├── db/               # Drizzle ORM schema, migrations, DB client
│   ├── auth/             # Supabase auth helpers, session management
│   ├── agents/           # AI agent service layer (provider-agnostic)
│   ├── workflows/        # Quote workflow engine, pipeline logic
│   ├── billing/          # Stripe integration, plan definitions
│   └── shared/           # Shared types, utilities, constants
│
├── turbo.json            # Turborepo pipeline config
├── tsconfig.base.json    # Shared TypeScript config
└── package.json          # Workspace root
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 14 (App Router) | Full-stack, serverless-friendly, Vercel-native |
| Language | TypeScript | Type safety across all packages |
| UI | React + Tailwind CSS | Utility-first, rapid, consistent |
| Database | PostgreSQL via Supabase | Managed, real-time, auth built-in |
| ORM | Drizzle ORM | Type-safe SQL, schema-first, fast |
| Auth | Supabase Auth | JWT + RLS, handles sessions cleanly |
| Storage | Supabase Storage | File/photo uploads per submission |
| AI | Anthropic Claude (abstracted) | Swappable via IAiProvider interface |
| Billing | Stripe (stubbed) | Checkout, portal, webhook-ready |
| Deployment | Vercel | Zero-config, monorepo support |
| Build system | Turborepo | Fast, incremental builds across packages |

---

## Database Schema

All entities are defined in `packages/db/src/schema.ts`.

### Core Entities (Phase 1)

```
users               — platform identity (synced from Supabase Auth)
organizations       — top-level tenant / business account
memberships         — user ↔ org join table with roles
agents              — configurable AI agent instances
intake_forms        — versioned form definitions per agent
submissions         — raw incoming requests from leads
submission_files    — file attachments to submissions
leads               — CRM record derived from submission
pipeline_stages     — org-defined kanban stages
notes               — internal notes on leads / submissions
follow_ups          — scheduled follow-up messages
notifications       — in-app + multi-channel alerts
analytics_events    — full event stream for all platform actions
subscription_plans  — plan catalog (maps to Stripe Products)
subscriptions       — active org ↔ plan binding
```

### Stubbed for Phase 2 (schema exists, no logic yet)

```
saved_search_agents — persistent buyer search agent config
match_profiles      — structured buyer criteria for scoring
search_alerts       — triggered alerts from a saved search
shortlist_items     — items a buyer has saved
```

---

## AI Service Architecture

All AI calls go through the abstraction in `packages/agents/src/`:

```
IAiProvider (interface)
  ├── AnthropicProvider   — Claude Sonnet (default)
  └── OpenAIProvider      — GPT-4o (stub, ready to wire)

QuoteAgentService
  ├── processSubmission()         — extract + score a raw submission
  ├── generateFollowUpMessage()   — draft a personalized follow-up
  └── identifyMissingInformation() — flag what's needed for a quote
```

**Key rule:** No page or API route should import from `anthropic` or `openai` directly.
All AI calls go through `createQuoteAgent()` or the `getAiProvider()` factory.

Adding a new AI provider = implementing `IAiProvider` and registering it in the registry.

---

## Billing / Plans

Defined in `packages/billing/src/index.ts`:

| Plan | Setup | Monthly |
|------|-------|---------|
| Quote Agent Starter | $2,500 | $349/mo |
| Quote Agent Pro | $5,000 | $749/mo |
| Persistent Buyer Agent | $4,500 | $599/mo |
| White-Label Install | $7,500–$12,500 | $1,250–$2,500/mo |
| Enterprise Custom | $15,000+ | Custom |

`StripeService` in billing package is stubbed — wire up `STRIPE_SECRET_KEY` and implement checkout/portal/webhook methods when ready.

---

## Submission Flow (Phase 1)

```
1. Lead visits branded intake form  →  /submit/[agent-slug]
2. Fills out form and submits
3. POST /api/submissions
4. Raw data stored in `submissions` table
5. AI processes submission async (QuoteAgentService.processSubmission)
   — generates summary
   — extracts structured fields
   — scores quote-readiness (0–100)
   — identifies missing info
   — suggests next steps
6. Lead record created in `leads` table
7. Assigned team member notified
8. Follow-up automation triggered per agent config
9. Lead appears in dashboard pipeline
```

---

## App Routes

### Public
| Route | Description |
|-------|-------------|
| `/` | Marketing landing page |
| `/signup` | Account + org creation (2-step) |
| `/login` | Auth |
| `/submit/[slug]` | Branded intake form (public, per agent) |

### App (authenticated)
| Route | Description |
|-------|-------------|
| `/dashboard` | Stats overview + recent submissions + follow-ups due |
| `/leads` | Paginated lead list with filters, search, status tabs |
| `/leads/[id]` | Lead detail — AI summary, notes, timeline, follow-up |
| `/agents` | Agent list — configure, toggle, preview form URL |
| `/agents/[id]` | Individual agent config (form builder, AI config, follow-up) |
| `/analytics` | Charts — volume, score distribution, agent performance |
| `/team` | Team member management + invite |
| `/settings` | Org settings + billing + plan |

---

## Environment Variables

```bash
# .env.local (apps/web)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database (Supabase Postgres connection string)
DATABASE_URL=

# AI
ANTHROPIC_API_KEY=

# Stripe (stub — add when billing is configured)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Run the web app in development
npm run dev

# Type-check everything
npm run type-check

# Run a production build
npm run build

# Push schema to database (once DATABASE_URL is set)
npm run db:push
```

---

## Phase 2: Buyer / Match Agent Expansion

The platform is architected for Phase 2 without needing a rewrite.

**What's already in place:**
- `saved_search_agents` table stubbed in schema
- `match_profiles`, `search_alerts`, `shortlist_items` tables stubbed
- `agentTypeEnum` includes `buyer_search`, `match`, `alert` types
- AI provider abstraction supports any future agent service
- `packages/agents/src/quote-agent.service.ts` documents the Phase 2 extension points

**What to build in Phase 2:**
1. `BuyerSearchAgentService` — runs persistent criteria against listing sources
2. `MatchScoringService` — scores listings against a buyer profile
3. `AlertGeneratorService` — determines when to notify
4. Background job runner (Inngest or Supabase Edge Functions) for continuous agents
5. Buyer-facing product URLs (`/find/cars`, `/find/land`, `/find/equipment`, etc.)
6. Match dashboard — shortlist, comparison, alert history

---

## White-Label Deployment

Each organization has a `brandConfig` JSON field that supports:
- `primaryColor` — form and UI accent color
- `accentColor` — secondary brand color
- `fontFamily` — custom font override
- `customDomain` — org-specific domain (e.g., `quotes.acme.com`)
- `customLogoUrl` — org logo on intake forms

For white-label installs, the intake form at `/submit/[slug]` reads agent + org config
and renders a fully branded experience. Future work: custom domain routing via Next.js
middleware + DNS configuration.

---

## Next Steps (Recommended Order)

1. **Wire up Supabase** — set env vars, run `db:push`, connect auth
2. **Implement auth middleware** — protect `/dashboard`, `/leads`, etc.
3. **Connect submission API** — uncomment DB calls in `/api/submissions/route.ts`
4. **Build agent config UI** — intake form builder + AI system prompt editor
5. **Add file upload** — Supabase Storage integration in submission form
6. **Wire Stripe** — implement `StripeService` methods, add webhook handler
7. **Add background jobs** — Inngest or Supabase Edge Functions for async AI + follow-up
8. **Deploy to Vercel** — connect repo, set env vars, done
9. **Build Phase 2** — buyer/match agent lane (schema already waiting)

---

*Built platform-first. Scoped for MVP. Ready to scale.*
