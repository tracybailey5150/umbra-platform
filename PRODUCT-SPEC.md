# Umbra Platform — Product Spec v1
*Locked: 2026-03-21*

## What It Is
AI-powered intake & CRM platform for service businesses (roofing, HVAC, remodeling, landscaping, etc.).
A business signs up, creates AI agents, embeds a form — leads flow in, AI qualifies them, dashboard shows everything, follow-ups send automatically.

## The Pitch
"Stop losing leads. Your AI agent works 24/7 — qualifies, responds, and follows up while you sleep."

## Target Customer
Service businesses with inbound leads: contractors, home services, trades, professional services.

---

## Agent Types (Phase 1)

### Intake Agent
- Receives leads via embedded form or direct link
- AI asks smart follow-up questions to fill gaps
- Scores lead 0–100 (urgency, budget, project size)
- Sends instant confirmation to the lead
- Routes to right team member

### Follow-Up Agent
- Detects cold leads (no response in X days)
- Drafts personalized follow-up emails/SMS
- Runs sequences: day 1 / day 3 / day 7
- Adjusts tone by lead score
- Marks won/lost based on responses

### Quote Agent
- Takes qualified lead details
- Generates price range estimate by project type
- Drafts formal quote
- Flags missing info
- One-click send

---

## Core User Flow (MVP)

1. Business signs up → creates org
2. Creates an agent (name, type, industry, questions)
3. Gets embed code → pastes on their website
4. Customer fills form → lead hits Umbra
5. AI scores + qualifies instantly
6. Dashboard shows lead with score, draft response
7. Business clicks send (or auto-sends)
8. Follow-up agent handles non-responders
9. Lead converts → marked Won

---

## Pages & What They Show

| Page | Real Data Source |
|------|-----------------|
| Dashboard | Count stats from submissions + leads tables |
| Leads | submissions + leads tables, AI score, status |
| Follow-ups | follow_ups table, pending/sent/responded |
| Agents | agents table, toggle active/inactive |
| Analytics | analytics_events + submissions aggregated |
| Team | memberships table |
| Settings | organizations table + subscriptions |

---

## MVP Build Checklist

### Phase 1A — Intake (this sprint)
- [ ] `/submit/[agentSlug]` — public intake form page (no auth)
- [ ] API route: `POST /api/submit` — receives submission, stores in DB
- [ ] AI processing: GPT-4o scores lead, drafts response, categorizes
- [ ] Wire Leads page to real Supabase data
- [ ] Wire Dashboard stats to real counts

### Phase 1B — Agents & Follow-ups
- [ ] Agent creation form (name, type, custom questions)
- [ ] Wire Agents page to real data (toggle active/inactive)
- [ ] Wire Follow-ups page to real data
- [ ] Follow-up send action (Resend email)

### Phase 1C — Monetize
- [ ] Stripe checkout flow (pricing → subscribe → plan active)
- [ ] Plan limits enforced (submission count, agent count)
- [ ] Onboarding flow (new user → create org → create agent → get embed code)

### Phase 2 — Power Features
- [ ] Email inbound intake (Sendgrid)
- [ ] SMS intake + follow-up (Twilio)
- [ ] PDF quote generation
- [ ] Calendar booking (Cal.com)
- [ ] CRM webhooks
- [ ] White-label / agency tier

---

## Pricing (locked)
- **Basic** $9.99/mo — 1 agent, 50 leads/mo
- **Pro** $29/mo — 5 agents, 500 leads/mo  
- **Team** $99/mo — unlimited agents, unlimited leads, team members

---

## Tech Stack
- Next.js 14 (App Router)
- Supabase (auth + DB)
- Drizzle ORM
- OpenAI GPT-4o (AI processing)
- Resend (email)
- Stripe (billing)
- Vercel (hosting)
