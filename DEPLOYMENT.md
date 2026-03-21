# Umbra Platform — Deployment & Integration Guide

This guide covers everything needed to take the scaffold from local dev to production.

---

## 1. Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works for dev)
- An [Anthropic API key](https://console.anthropic.com)
- A [Vercel](https://vercel.com) account for deployment
- A [Stripe](https://stripe.com) account (when billing is ready)

---

## 2. Local Development Setup

```bash
# Clone and install
git clone <your-repo>
cd umbra-platform
npm install

# Copy environment template
cp apps/web/.env.example apps/web/.env.local

# Fill in your keys (see section 3)
# Then run:
npm run dev
```

The web app runs at http://localhost:3000.

---

## 3. Environment Variables

### Supabase Setup

1. Create a new project at https://supabase.com
2. Go to **Settings → API** and copy:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Go to **Settings → Database** and copy the connection string:
   - Use the **Session mode** URI for serverless (port 5432, not 6543)
   - Set as `DATABASE_URL`

### Supabase Auth Configuration

In your Supabase dashboard:
1. **Authentication → URL Configuration**:
   - Site URL: `https://yourdomain.com`
   - Redirect URLs: `https://yourdomain.com/auth/callback`
2. **Authentication → Email Templates**: Customize as needed
3. Enable email confirmations or set to auto-confirm for dev

### Database Migration

```bash
# Push schema to Supabase
npm run db:push

# Or generate migration files first
npm run db:generate
```

The schema will create all tables defined in `packages/db/src/schema.ts`.

### Supabase Row Level Security (RLS)

After pushing the schema, set up RLS policies in Supabase SQL editor:

```sql
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Example: Users can only see their org's data
CREATE POLICY "org_isolation" ON submissions
  USING (organization_id IN (
    SELECT organization_id FROM memberships
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- Repeat similar policies for other tables
-- or use a helper function:

CREATE OR REPLACE FUNCTION user_org_ids()
RETURNS uuid[] AS $$
  SELECT array_agg(organization_id)
  FROM memberships
  WHERE user_id = auth.uid() AND status = 'active'
$$ LANGUAGE sql SECURITY DEFINER;
```

### Anthropic API Key

1. Get a key at https://console.anthropic.com
2. Set `ANTHROPIC_API_KEY` in your `.env.local`

---

## 4. Connecting the Real Database

All API routes have DB calls stubbed with comments. To activate them:

### Step 1: Uncomment DB imports at the top of each route:

```typescript
// Uncomment these in each API route:
import { getDb, schema } from "@umbra/db";
import { eq, and, isNull, desc, asc } from "drizzle-orm";
import { ANALYTICS_EVENTS } from "@umbra/shared";
```

### Step 2: Uncomment DB operation blocks

Each route has `// TODO:` comments wrapping the real implementation.
Remove the stubs and uncomment the real code. Example in `POST /api/submissions`:

```typescript
// BEFORE (stub):
return NextResponse.json(ok({ submissionId: "stub-submission-id" }), { status: 201 });

// AFTER (real):
const db = getDb();
const [submission] = await db.insert(schema.submissions).values({
  agentId,
  organizationId,
  submitterName: formData.name,
  submitterEmail: formData.email,
  rawData: formData,
  status: "new",
}).returning();

return NextResponse.json(ok({ submissionId: submission.id }), { status: 201 });
```

### Step 3: Wire auth checks

Replace stub auth in each route:

```typescript
// BEFORE:
// const user = await requireAuth();

// AFTER:
import { requireAuth } from "@umbra/auth";
const user = await requireAuth(); // redirects to /login if not authed
```

---

## 5. Activating Auth in Page Components

Server components that need auth:

```typescript
// apps/web/src/app/(app)/dashboard/page.tsx
import { requireAuth } from "@umbra/auth";

export default async function DashboardPage() {
  const user = await requireAuth(); // Add this line
  // user.id, user.email, user.fullName now available
  // ...
}
```

Client components that need auth:

```typescript
"use client";
import { createBrowserClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function SomeClientComponent() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);
  // ...
}
```

---

## 6. Setting Up Background Jobs

Phase 1 AI processing and follow-up automation need async execution.
Two recommended options:

### Option A: Inngest (recommended)

```bash
npm install inngest
```

```typescript
// packages/agents/src/inngest.ts
import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "umbra-platform" });

export const processSubmission = inngest.createFunction(
  { id: "process-submission" },
  { event: "submission/created" },
  async ({ event, step }) => {
    const { submissionId, agentId, rawData } = event.data;
    
    const agent = createQuoteAgent({ provider: "anthropic" });
    const result = await step.run("ai-process", () =>
      agent.processSubmission(rawData)
    );
    
    await step.run("update-db", () =>
      updateSubmissionWithAiResult(submissionId, result)
    );
    
    await step.run("schedule-followup", () =>
      scheduleFollowUp(submissionId)
    );
  }
);
```

Then in `POST /api/submissions`:
```typescript
await inngest.send({
  name: "submission/created",
  data: { submissionId: submission.id, agentId, rawData: formData },
});
```

### Option B: Supabase Edge Functions

Create `supabase/functions/process-submission/index.ts` and trigger via
Supabase database webhooks on the `submissions` table insert.

---

## 7. Stripe Integration

### Setup

```bash
npm install stripe
```

In `packages/billing/src/index.ts`, implement `StripeService`:

```typescript
import Stripe from "stripe";

export class StripeService {
  private stripe: Stripe;
  
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-04-10",
    });
  }
  
  async createCheckoutSession({ organizationId, planSlug, successUrl, cancelUrl }) {
    const plan = PLANS[planSlug];
    
    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{
        price: plan.stripePriceId!, // Set in plan definitions
        quantity: 1,
      }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { organizationId, planSlug },
    });
    
    return { url: session.url! };
  }
}
```

### Webhook signature verification

In `apps/web/src/app/api/webhooks/stripe/route.ts`, replace the stub with:

```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const event = stripe.webhooks.constructEvent(
  payload,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

### Local testing

```bash
# Install Stripe CLI
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 8. Email (Transactional)

Add [Resend](https://resend.com) for transactional emails:

```bash
npm install resend
```

```typescript
// packages/shared/src/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendFollowUpEmail({
  to, subject, body, fromName,
}: {
  to: string; subject: string; body: string; fromName: string;
}) {
  await resend.emails.send({
    from: `${fromName} <noreply@umbra.ai>`,
    to,
    subject,
    text: body,
  });
}
```

Call from follow-up API route when sending:
```typescript
await sendFollowUpEmail({
  to: lead.email,
  subject: followUp.subject,
  body: followUp.body,
  fromName: org.name,
});

await db.update(schema.followUps)
  .set({ status: "sent", sentAt: new Date() })
  .where(eq(schema.followUps.id, followUpId));
```

---

## 9. File Uploads (Supabase Storage)

For submission photo uploads, configure Supabase Storage:

1. Create a bucket called `submission-files` in Supabase dashboard
2. Set bucket to private (access via signed URLs)
3. In the intake form upload handler:

```typescript
import { createClient } from "@/lib/supabase";

async function uploadFile(file: File, submissionId: string) {
  const supabase = createClient();
  const path = `${submissionId}/${file.name}`;
  
  const { data, error } = await supabase.storage
    .from("submission-files")
    .upload(path, file);
  
  if (error) throw error;
  
  // Store path in submission_files table
  return data.path;
}
```

---

## 10. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# Set environment variables in Vercel dashboard or CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add ANTHROPIC_API_KEY
# ... add all vars from .env.example
```

### Vercel configuration

The `apps/web/next.config.js` is already configured for the monorepo.
Vercel will auto-detect the Next.js app.

Set the **Root Directory** in Vercel to `apps/web` if deploying a single app,
or use Vercel's monorepo support to deploy multiple apps.

### Custom domain

1. In Vercel: Settings → Domains → Add domain
2. Update `NEXT_PUBLIC_APP_URL` to your production domain
3. Update Supabase auth redirect URLs

---

## 11. Multi-Product / White-Label Deployment

For deploying focused product URLs (e.g., `quotes.acme.com`):

### Option A: Next.js middleware-based routing

```typescript
// apps/web/src/middleware.ts — add domain detection
const hostname = request.headers.get("host") ?? "";

// Route custom domains to org-specific experience
if (hostname !== "app.umbra.ai" && hostname !== "localhost:3000") {
  // Look up org by customDomain in DB
  // Inject org context into headers
  // Rewrite to branded layout
}
```

### Option B: Separate Next.js apps in monorepo

Add focused apps to `apps/`:
```
apps/
  car-agent/    # app.findmycar.ai
  land-agent/   # app.findmyland.ai
  quote-agent/  # quotes.yourbiz.com (white-label)
```

All share the same `packages/` — same DB, same AI layer, same billing.

---

## 12. Phase 2: Buyer / Match Agent Checklist

When ready to build the buyer/match agent lane:

- [ ] Implement `BuyerSearchAgentService` in `packages/agents/src/buyer-search-agent.service.ts`
- [ ] Implement `MatchScoringService` in `packages/agents/src/match-scoring.service.ts`
- [ ] Activate `saved_search_agents` table (already in schema)
- [ ] Activate `match_profiles`, `search_alerts`, `shortlist_items` tables
- [ ] Add `buyer_search` and `match` agent types to the agent creation wizard
- [ ] Build buyer dashboard pages: `/find/[category]`, `/shortlist`, `/alerts`
- [ ] Add continuous job runner for persistent search agents
- [ ] Build match alert notification flow

---

## 13. Security Checklist (Before Launch)

- [ ] Enable RLS on all Supabase tables
- [ ] Add org membership checks to all API routes
- [ ] Verify Stripe webhook signature in production
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Enable Supabase email confirmation
- [ ] Add rate limiting to `/api/submissions` (prevent spam)
- [ ] Add CAPTCHA to public intake form (hCaptcha or Cloudflare Turnstile)
- [ ] Sanitize file uploads (type + size validation)
- [ ] Review and tighten RLS policies
- [ ] Set up error monitoring (Sentry or Axiom)
- [ ] Enable Supabase Vault for storing sensitive org configs

---

## 14. Monitoring & Observability

### Error tracking (Sentry)
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Logging
Use `console.error` in API routes — Vercel captures these automatically.
For structured logging, add Axiom or Pino:
```bash
npm install pino pino-pretty
```

### Uptime monitoring
Use Vercel's built-in analytics, or add Better Uptime / Checkly.

---

*Architecture decisions, schema extensions, and integration patterns are documented
inline throughout the codebase. See the main README.md for the high-level overview.*
