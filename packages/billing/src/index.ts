/**
 * @package @umbra/billing
 * 
 * Plan definitions and Stripe integration layer.
 * Plans map to the pricing model defined in the product spec.
 */

import type { PlanFeatures } from "@umbra/db";

// ─── PLAN DEFINITIONS ─────────────────────────────────────────────────────────

export type PlanSlug =
  | "quote_agent_starter"
  | "quote_agent_pro"
  | "persistent_buyer_agent"
  | "white_label_install"
  | "enterprise_custom";

export interface PlanDefinition {
  slug: PlanSlug;
  name: string;
  description: string;
  setupFeeMin: number;
  setupFeeMax: number | null;
  monthlyFeeMin: number;
  monthlyFeeMax: number | null;
  displayPrice: string;
  displaySetup: string;
  isEnterprise: boolean;
  features: PlanFeatures;
  highlights: string[];
}

export const PLANS: Record<PlanSlug, PlanDefinition> = {
  quote_agent_starter: {
    slug: "quote_agent_starter",
    name: "Basic",
    description: "AI-powered quote capture and intake for small service businesses.",
    setupFeeMin: 0,
    setupFeeMax: null,
    monthlyFeeMin: 29,
    monthlyFeeMax: null,
    displayPrice: "$29/mo",
    displaySetup: "7-day free trial",
    isEnterprise: false,
    highlights: [
      "1 AI Agent",
      "Up to 100 submissions/mo",
      "AI scoring",
      "Lead pipeline dashboard",
      "Email notifications",
      "No setup fee",
    ],
    features: {
      maxAgents: 1,
      maxSubmissionsPerMonth: 200,
      maxTeamMembers: 3,
      aiSummaries: true,
      aiFollowUp: true,
      customBranding: false,
      whiteLabelDomain: false,
      apiAccess: false,
      analyticsRetentionDays: 90,
    },
  },
  quote_agent_pro: {
    slug: "quote_agent_pro",
    name: "Pro",
    description: "Full quote and intake automation for growing businesses and agencies.",
    setupFeeMin: 0,
    setupFeeMax: null,
    monthlyFeeMin: 79,
    monthlyFeeMax: null,
    displayPrice: "$79/mo",
    displaySetup: "7-day free trial",
    isEnterprise: false,
    highlights: [
      "Up to 5 AI Agents",
      "Unlimited submissions",
      "AI follow-up automation",
      "Analytics",
      "7-day free trial",
      "No setup fee",
    ],
    features: {
      maxAgents: 5,
      maxSubmissionsPerMonth: -1, // unlimited
      maxTeamMembers: 10,
      aiSummaries: true,
      aiFollowUp: true,
      customBranding: true,
      whiteLabelDomain: false,
      apiAccess: true,
      analyticsRetentionDays: 365,
    },
  },
  persistent_buyer_agent: {
    slug: "persistent_buyer_agent",
    name: "Persistent Buyer Agent",
    description: "A search agent that works continuously until it finds the right match.",
    setupFeeMin: 4500,
    setupFeeMax: null,
    monthlyFeeMin: 599,
    monthlyFeeMax: null,
    displayPrice: "$599/mo",
    displaySetup: "$4,500 setup",
    isEnterprise: false,
    highlights: [
      "Persistent search & match agent",
      "Real-time alerts on matches",
      "Buyer profile builder",
      "Shortlist & comparison tools",
      "Custom match scoring",
    ],
    features: {
      maxAgents: 1,
      maxSubmissionsPerMonth: -1,
      maxTeamMembers: 5,
      aiSummaries: true,
      aiFollowUp: true,
      customBranding: true,
      whiteLabelDomain: false,
      apiAccess: false,
      analyticsRetentionDays: 180,
    },
  },
  white_label_install: {
    slug: "white_label_install",
    name: "White-Label Agent Install",
    description: "Your brand, your domain, your agents — fully white-labeled.",
    setupFeeMin: 7500,
    setupFeeMax: 12500,
    monthlyFeeMin: 1250,
    monthlyFeeMax: 2500,
    displayPrice: "$1,250–$2,500/mo",
    displaySetup: "$7,500–$12,500 setup",
    isEnterprise: false,
    highlights: [
      "Fully white-labeled experience",
      "Custom domain",
      "Unlimited agents",
      "All agent types",
      "Priority support",
      "Dedicated onboarding",
    ],
    features: {
      maxAgents: -1,
      maxSubmissionsPerMonth: -1,
      maxTeamMembers: -1,
      aiSummaries: true,
      aiFollowUp: true,
      customBranding: true,
      whiteLabelDomain: true,
      apiAccess: true,
      analyticsRetentionDays: 730,
    },
  },
  enterprise_custom: {
    slug: "enterprise_custom",
    name: "Enterprise Custom Agent Build",
    description: "Fully custom AI agent builds for complex enterprise workflows.",
    setupFeeMin: 15000,
    setupFeeMax: null,
    monthlyFeeMin: 0, // usage-based
    monthlyFeeMax: null,
    displayPrice: "Custom",
    displaySetup: "$15,000+ setup",
    isEnterprise: true,
    highlights: [
      "Custom agent architecture",
      "Dedicated engineering support",
      "SLA & uptime guarantees",
      "Custom integrations",
      "Usage-based pricing",
      "Private deployment option",
    ],
    features: {
      maxAgents: -1,
      maxSubmissionsPerMonth: -1,
      maxTeamMembers: -1,
      aiSummaries: true,
      aiFollowUp: true,
      customBranding: true,
      whiteLabelDomain: true,
      apiAccess: true,
      analyticsRetentionDays: -1,
    },
  },
};

export const PUBLIC_PLANS = Object.values(PLANS).filter((p) => !p.isEnterprise);

// ─── STRIPE SERVICE STUB ──────────────────────────────────────────────────────

/**
 * StripeService — handles checkout, portal, and webhook events.
 * Methods are stubbed — implement when Stripe keys are configured.
 */
export class StripeService {
  private readonly secretKey: string;

  constructor() {
    this.secretKey = process.env.STRIPE_SECRET_KEY ?? "";
  }

  /**
   * createCheckoutSession — initiates a Stripe checkout for a plan
   * TODO: Implement with stripe-js or Stripe Node SDK
   */
  async createCheckoutSession(params: {
    organizationId: string;
    planSlug: PlanSlug;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string }> {
    // STUB — implement with Stripe SDK
    console.log("[Stripe] createCheckoutSession stub called", params);
    throw new Error("Stripe not yet configured. Set STRIPE_SECRET_KEY.");
  }

  /**
   * createPortalSession — opens the Stripe billing portal for an org
   */
  async createPortalSession(params: {
    stripeCustomerId: string;
    returnUrl: string;
  }): Promise<{ url: string }> {
    console.log("[Stripe] createPortalSession stub called", params);
    throw new Error("Stripe not yet configured. Set STRIPE_SECRET_KEY.");
  }

  /**
   * handleWebhook — processes Stripe webhook events
   * Events to handle: checkout.session.completed, subscription.updated, subscription.deleted
   */
  async handleWebhook(payload: string, signature: string): Promise<void> {
    console.log("[Stripe] handleWebhook stub called");
    // TODO: Verify signature with STRIPE_WEBHOOK_SECRET
    // TODO: Route event types to appropriate handlers
    throw new Error("Stripe webhooks not yet configured.");
  }
}

export function getBillingService(): StripeService {
  return new StripeService();
}
