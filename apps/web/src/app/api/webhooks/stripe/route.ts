export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { err } from "@umbra/shared";

/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events for subscription lifecycle management.
 *
 * Events handled:
 *   checkout.session.completed     → activate subscription, mark setup fee paid
 *   customer.subscription.updated  → update subscription status/period
 *   customer.subscription.deleted  → cancel subscription
 *   invoice.payment_succeeded      → record successful payment
 *   invoice.payment_failed         → mark subscription as past_due
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json(err("Webhook secret not configured"), { status: 500 });
  }

  const payload   = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(err("Missing stripe-signature header"), { status: 400 });
  }

  // Verify webhook signature
  let event: StripeEvent;
  try {
    event = verifyStripeWebhook(payload, signature, webhookSecret);
  } catch (verifyError) {
    console.error("[Stripe Webhook] Signature verification failed:", verifyError);
    return NextResponse.json(err("Invalid signature"), { status: 400 });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

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
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (handlerError) {
    console.error(`[Stripe Webhook] Handler failed for ${event.type}:`, handlerError);
    // Return 200 to prevent Stripe from retrying for non-retriable errors
    return NextResponse.json({ received: true, error: "Handler error logged" });
  }
}

// ─── EVENT HANDLERS ───────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: StripeCheckoutSession) {
  const { metadata } = session;
  if (!metadata?.organizationId || !metadata?.planSlug) {
    console.warn("[Stripe] checkout.session.completed missing metadata");
    return;
  }

  // TODO: Activate subscription
  // const db = getDb();
  // await db.update(schema.subscriptions)
  //   .set({
  //     status: "active",
  //     stripeSubscriptionId: session.subscription,
  //     setupFeePaid: true,
  //     updatedAt: new Date(),
  //   })
  //   .where(eq(schema.subscriptions.organizationId, metadata.organizationId));

  // TODO: Send welcome email
  // await sendWelcomeEmail({ organizationId: metadata.organizationId });

  console.log(`[Stripe] Checkout completed for org: ${metadata.organizationId}`);
}

async function handleSubscriptionUpdated(subscription: StripeSubscription) {
  // TODO: Sync subscription status to DB
  // const db = getDb();
  // await db.update(schema.subscriptions)
  //   .set({
  //     status: subscription.status as any,
  //     stripeCurrentPeriodStart: new Date(subscription.current_period_start * 1000),
  //     stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
  //     stripeCancelAtPeriodEnd: subscription.cancel_at_period_end,
  //     updatedAt: new Date(),
  //   })
  //   .where(eq(schema.subscriptions.stripeSubscriptionId, subscription.id));

  console.log(`[Stripe] Subscription updated: ${subscription.id} → ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: StripeSubscription) {
  // TODO: Mark as canceled, restrict access
  // await db.update(schema.subscriptions)
  //   .set({ status: "canceled", canceledAt: new Date(), updatedAt: new Date() })
  //   .where(eq(schema.subscriptions.stripeSubscriptionId, subscription.id));

  console.log(`[Stripe] Subscription canceled: ${subscription.id}`);
}

async function handleInvoicePaymentSucceeded(invoice: StripeInvoice) {
  // TODO: Log payment, reset past_due status if applicable
  console.log(`[Stripe] Invoice paid: ${invoice.id} for ${invoice.customer}`);
}

async function handleInvoicePaymentFailed(invoice: StripeInvoice) {
  // TODO: Mark subscription as past_due, notify org owner
  // TODO: Send dunning email
  console.log(`[Stripe] Invoice payment failed: ${invoice.id} for ${invoice.customer}`);
}

// ─── STRIPE SIGNATURE VERIFICATION ───────────────────────────────────────────

/**
 * verifyStripeWebhook — lightweight signature verification without the full SDK.
 * In production, consider using the official Stripe SDK: stripe.webhooks.constructEvent()
 */
function verifyStripeWebhook(
  payload: string,
  signature: string,
  secret: string
): StripeEvent {
  // TODO: Implement HMAC-SHA256 verification
  // const crypto = require("crypto");
  // const parts = signature.split(",").reduce((acc, part) => {
  //   const [key, val] = part.split("=");
  //   acc[key] = val;
  //   return acc;
  // }, {} as Record<string, string>);
  //
  // const signedPayload = `${parts.t}.${payload}`;
  // const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");
  // if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1))) {
  //   throw new Error("Webhook signature mismatch");
  // }

  // For now, parse and return — add verification above before going live
  return JSON.parse(payload) as StripeEvent;
}

// ─── MINIMAL STRIPE TYPES ─────────────────────────────────────────────────────

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
