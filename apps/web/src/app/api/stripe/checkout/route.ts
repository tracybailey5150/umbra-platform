export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Stripe price IDs (test mode)
const PRICE_IDS: Record<string, string> = {
  "price_1TDGbjQgTSmbZJKxZyKJe5Va": "Basic $9.99",
  "price_1TDGbkQgTSmbZJKx8kElMmUl": "Pro $29",
  "price_1TDGblQgTSmbZJKxNgWawFku": "Team $99",
};

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId, userEmail } = await request.json();

    if (!priceId || !PRICE_IDS[priceId]) {
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Find or create Stripe customer
    let customerId: string | undefined;
    if (userEmail) {
      const existing = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: { userId: userId || "" },
        });
        customerId = customer.id;
      }
    }

    // Create checkout session with 14-day trial
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          userId: userId || "",
          priceId,
        },
      },
      success_url: `${appUrl}/dashboard?subscribed=true`,
      cancel_url: `${appUrl}/pricing`,
      metadata: {
        userId: userId || "",
        priceId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("[Stripe Checkout] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
