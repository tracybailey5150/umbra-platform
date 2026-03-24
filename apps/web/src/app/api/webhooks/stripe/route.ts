export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/webhooks/stripe
 *
 * Events handled:
 *   checkout.session.completed     → activate subscription in Supabase
 *   customer.subscription.updated  → sync status/period
 *   customer.subscription.deleted  → cancel subscription, revoke access
 *   invoice.payment_succeeded      → log payment
 *   invoice.payment_failed         → mark past_due
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = verifyStripeWebhook(payload, signature, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`[Stripe Webhook] ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as StripeCheckoutSession);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as StripeSubscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as StripeSubscription);
        break;
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as StripeInvoice);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as StripeInvoice);
        break;
      default:
        console.log(`[Stripe Webhook] Unhandled event: ${event.type}`);
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`[Stripe Webhook] Handler error for ${event.type}:`, err);
    return NextResponse.json({ received: true, error: "Handler error logged" });
  }
}

// ─── HANDLERS ─────────────────────────────────────────────────────────────────

const PLAN_TIER_MAP: Record<string, string> = {
  "price_1TEILnHW6WsrXJBUSHHgb3Tk": "basic",
  "price_1TEILoHW6WsrXJBUpJRBIh2l": "pro",
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

async function handleCheckoutCompleted(session: StripeCheckoutSession) {
  const userId = session.metadata?.userId;
  const priceId = session.metadata?.priceId;
  const planTier = priceId ? (PLAN_TIER_MAP[priceId] ?? "basic") : "basic";

  console.log(`[Stripe] Checkout completed user=${userId} plan=${planTier}`);

  const supabase = getSupabase();
  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId ?? null,
      stripe_customer_id: session.customer ?? null,
      stripe_subscription_id: session.subscription ?? null,
      plan_tier: planTier,
      status: "active",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" }
  );

  if (error) console.error("[Stripe] Supabase upsert error:", error);
  else console.log(`[Stripe] Subscription active for user=${userId}`);
}

async function handleSubscriptionUpdated(sub: StripeSubscription) {
  console.log(`[Stripe] Subscription updated: ${sub.id} → ${sub.status}`);
  const supabase = getSupabase();
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: sub.status,
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", sub.id);

  if (error) console.error("[Stripe] Subscription update error:", error);
}

async function handleSubscriptionDeleted(sub: StripeSubscription) {
  console.log(`[Stripe] Subscription canceled: ${sub.id}`);
  const supabase = getSupabase();
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", sub.id);

  if (error) console.error("[Stripe] Subscription cancel error:", error);
}

async function handleInvoicePaymentSucceeded(invoice: StripeInvoice) {
  console.log(`[Stripe] Invoice paid: ${invoice.id}`);
  if (!invoice.subscription) return;
  const supabase = getSupabase();
  await supabase
    .from("subscriptions")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", invoice.subscription);
}

async function handleInvoicePaymentFailed(invoice: StripeInvoice) {
  console.log(`[Stripe] Invoice payment failed: ${invoice.id}`);
  if (!invoice.subscription) return;
  const supabase = getSupabase();
  await supabase
    .from("subscriptions")
    .update({ status: "past_due", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", invoice.subscription);
}

// ─── SIGNATURE VERIFICATION ───────────────────────────────────────────────────

function verifyStripeWebhook(payload: string, signature: string, secret: string): StripeEvent {
  const parts = signature.split(",").reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split("=");
    acc[k] = v;
    return acc;
  }, {});

  const timestamp = parts["t"];
  const v1 = parts["v1"];

  if (!timestamp || !v1) throw new Error("Malformed stripe-signature header");

  const signed = `${timestamp}.${payload}`;
  const expected = crypto.createHmac("sha256", secret).update(signed, "utf8").digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(v1, "hex"))) {
    throw new Error("Webhook signature mismatch");
  }

  // Reject events older than 5 minutes
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
    throw new Error("Webhook timestamp too old");
  }

  return JSON.parse(payload) as StripeEvent;
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface StripeEvent {
  id: string;
  type: string;
  data: { object: unknown };
}
interface StripeCheckoutSession {
  id: string;
  subscription?: string;
  customer?: string;
  metadata?: Record<string, string>;
}
interface StripeSubscription {
  id: string;
  status: string;
  customer: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
}
interface StripeInvoice {
  id: string;
  customer: string;
  subscription?: string;
  amount_paid?: number;
}
