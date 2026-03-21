/**
 * @package @umbra/db
 * 
 * Complete platform schema — designed for Phase 1 (Quote/Intake Agents)
 * while leaving clear extension points for Phase 2 (Buyer/Match Agents).
 * 
 * Design principles:
 * - Every table has soft-delete via `deleted_at`
 * - Organizations are the top-level tenant unit
 * - Agents are configurable workflow containers
 * - The search/match tables are stubbed for future expansion
 */

import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  decimal,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── ENUMS ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "platform_admin",  // Umbra platform staff
  "org_owner",       // Business account owner
  "org_admin",       // Business admin
  "team_member",     // Business rep / agent user
]);

export const membershipStatusEnum = pgEnum("membership_status", [
  "active",
  "invited",
  "suspended",
  "removed",
]);

export const agentTypeEnum = pgEnum("agent_type", [
  "quote",           // Phase 1: quote/intake agent
  "intake",          // Phase 1: general intake agent
  "follow_up",       // Phase 1: follow-up / re-engagement agent
  // Phase 2 types (reserved — do not remove):
  "buyer_search",    // Future: persistent buyer search agent
  "match",           // Future: match/scoring agent
  "alert",           // Future: search alert agent
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "new",
  "reviewing",
  "quoted",
  "accepted",
  "declined",
  "closed",
  "archived",
]);

export const pipelineStageTypeEnum = pgEnum("pipeline_stage_type", [
  "intake",
  "qualifying",
  "quoted",
  "negotiating",
  "won",
  "lost",
]);

export const followUpStatusEnum = pgEnum("follow_up_status", [
  "pending",
  "sent",
  "responded",
  "skipped",
  "failed",
]);

export const notificationChannelEnum = pgEnum("notification_channel", [
  "email",
  "sms",
  "in_app",
  "webhook",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
]);

export const fileTypeEnum = pgEnum("file_type", [
  "image",
  "document",
  "video",
  "other",
]);

// ─── CORE IDENTITY ────────────────────────────────────────────────────────────

/**
 * users — platform auth identity, synced from Supabase Auth
 * One user can belong to multiple organizations via memberships
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  supabaseAuthId: uuid("supabase_auth_id").unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  fullName: varchar("full_name", { length: 255 }),
  avatarUrl: text("avatar_url"),
  phone: varchar("phone", { length: 50 }),
  platformRole: userRoleEnum("platform_role").default("team_member").notNull(),
  lastSignInAt: timestamp("last_sign_in_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

/**
 * organizations — top-level tenant unit (a business or white-label install)
 * All agent configs, submissions, and pipelines belong to an org
 */
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  industry: varchar("industry", { length: 100 }),
  timezone: varchar("timezone", { length: 100 }).default("UTC"),
  // White-label config — theme overrides, custom domain, branding
  brandConfig: jsonb("brand_config").$type<{
    primaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    customDomain?: string;
    customLogoUrl?: string;
  }>(),
  // Subscription pointer
  stripeCustomerId: varchar("stripe_customer_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

/**
 * memberships — join table between users and organizations
 * A user can be a member of multiple orgs with different roles
 */
export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
    role: userRoleEnum("role").default("team_member").notNull(),
    status: membershipStatusEnum("status").default("active").notNull(),
    invitedByUserId: uuid("invited_by_user_id").references(() => users.id),
    invitedAt: timestamp("invited_at"),
    acceptedAt: timestamp("accepted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userOrgUnique: uniqueIndex("memberships_user_org_unique").on(t.userId, t.organizationId),
  })
);

// ─── AGENT CONFIGURATION ──────────────────────────────────────────────────────

/**
 * agents — configurable AI agent instances belonging to an org
 * Each agent has a type, a system prompt, and workflow config
 * 
 * Phase 1: quote, intake, follow_up types
 * Phase 2: buyer_search, match, alert types (schema already supports them)
 */
export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  type: agentTypeEnum("type").default("quote").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  // AI model config — abstracted so provider can be swapped
  aiConfig: jsonb("ai_config").$type<{
    provider: "anthropic" | "openai" | "gemini";
    model: string;
    systemPromptTemplate?: string;
    temperature?: number;
    maxTokens?: number;
  }>(),
  // Public-facing intake form settings
  intakeConfig: jsonb("intake_config").$type<{
    welcomeMessage?: string;
    fields?: IntakeField[];
    successMessage?: string;
    redirectUrl?: string;
    requireEmail?: boolean;
    requirePhone?: boolean;
  }>(),
  // Follow-up automation config
  followUpConfig: jsonb("follow_up_config").$type<{
    enableAutoFollowUp: boolean;
    followUpIntervalHours?: number;
    maxFollowUps?: number;
    followUpTemplate?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// ─── INTAKE FORMS ──────────────────────────────────────────────────────────────

/**
 * intake_forms — versioned form definitions for an agent
 * Allows form builder to evolve without breaking existing submissions
 */
export const intakeForms = pgTable("intake_forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").references(() => agents.id, { onDelete: "cascade" }).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  version: integer("version").default(1).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  formSchema: jsonb("form_schema").$type<IntakeFormSchema>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── SUBMISSIONS & LEADS ───────────────────────────────────────────────────────

/**
 * submissions — a raw request submitted through an intake form
 * The AI processes this into a structured quote-ready summary
 */
export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").references(() => agents.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  // Submitter info (external lead — not a platform user)
  submitterName: varchar("submitter_name", { length: 255 }),
  submitterEmail: varchar("submitter_email", { length: 255 }),
  submitterPhone: varchar("submitter_phone", { length: 50 }),
  // Raw data from form
  rawData: jsonb("raw_data").notNull(),
  // AI-processed structured output
  aiSummary: text("ai_summary"),
  aiStructuredData: jsonb("ai_structured_data").$type<AiStructuredOutput>(),
  aiMissingFields: jsonb("ai_missing_fields").$type<string[]>(),
  aiSuggestedNextSteps: jsonb("ai_suggested_next_steps").$type<string[]>(),
  aiProcessedAt: timestamp("ai_processed_at"),
  // Status tracking
  status: submissionStatusEnum("status").default("new").notNull(),
  assignedToUserId: uuid("assigned_to_user_id").references(() => users.id),
  // Source tracking (UTM, referrer, etc.)
  sourceUrl: text("source_url"),
  utmSource: varchar("utm_source", { length: 100 }),
  utmMedium: varchar("utm_medium", { length: 100 }),
  utmCampaign: varchar("utm_campaign", { length: 100 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

/**
 * submission_files — files attached to a submission
 */
export const submissionFiles = pgTable("submission_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").references(() => submissions.id, { onDelete: "cascade" }).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileType: fileTypeEnum("file_type").default("other").notNull(),
  mimeType: varchar("mime_type", { length: 100 }),
  fileSizeBytes: integer("file_size_bytes"),
  storageUrl: text("storage_url").notNull(), // Supabase Storage URL
  storagePath: text("storage_path").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// ─── CRM / PIPELINE ───────────────────────────────────────────────────────────

/**
 * leads — a CRM record created from a submission
 * Tracks the full lifecycle of a prospect
 */
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").references(() => submissions.id).unique(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  agentId: uuid("agent_id").references(() => agents.id),
  assignedToUserId: uuid("assigned_to_user_id").references(() => users.id),
  // Contact info (can be enriched post-submission)
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  // Pipeline
  currentStageId: uuid("current_stage_id"),
  score: integer("score").default(0), // 0-100 lead score
  estimatedValue: decimal("estimated_value", { precision: 12, scale: 2 }),
  // Timestamps
  lastActivityAt: timestamp("last_activity_at"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

/**
 * pipeline_stages — customizable stages per org (like a kanban board)
 */
export const pipelineStages = pgTable("pipeline_stages", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  agentId: uuid("agent_id").references(() => agents.id),
  name: varchar("name", { length: 100 }).notNull(),
  type: pipelineStageTypeEnum("type").notNull(),
  order: integer("order").default(0).notNull(),
  color: varchar("color", { length: 20 }),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * notes — internal notes on a lead or submission
 */
export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "cascade" }),
  submissionId: uuid("submission_id").references(() => submissions.id),
  authorUserId: uuid("author_user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isAiGenerated: boolean("is_ai_generated").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// ─── FOLLOW-UP & NOTIFICATIONS ────────────────────────────────────────────────

/**
 * follow_ups — scheduled or triggered follow-up actions
 */
export const followUps = pgTable("follow_ups", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "cascade" }),
  submissionId: uuid("submission_id").references(() => submissions.id),
  scheduledFor: timestamp("scheduled_for").notNull(),
  channel: notificationChannelEnum("channel").default("email").notNull(),
  status: followUpStatusEnum("status").default("pending").notNull(),
  subject: varchar("subject", { length: 255 }),
  body: text("body"),
  isAiGenerated: boolean("is_ai_generated").default(false),
  sentAt: timestamp("sent_at"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * notifications — in-app + multi-channel notifications to org users
 */
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  channel: notificationChannelEnum("channel").default("in_app").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),
  actionUrl: text("action_url"),
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

/**
 * analytics_events — event stream for all trackable platform actions
 */
export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  agentId: uuid("agent_id").references(() => agents.id),
  userId: uuid("user_id").references(() => users.id),
  eventName: varchar("event_name", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }), // "submission", "lead", etc.
  entityId: uuid("entity_id"),
  properties: jsonb("properties"),
  sessionId: varchar("session_id", { length: 100 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
},
(t) => ({
  orgIdx: index("analytics_events_org_idx").on(t.organizationId),
  agentIdx: index("analytics_events_agent_idx").on(t.agentId),
  eventIdx: index("analytics_events_event_name_idx").on(t.eventName),
  occurredIdx: index("analytics_events_occurred_idx").on(t.occurredAt),
}));

// ─── BILLING & SUBSCRIPTIONS ──────────────────────────────────────────────────

/**
 * subscription_plans — platform plan catalog (maps to Stripe Products)
 */
export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).unique().notNull(),
  description: text("description"),
  // Pricing
  setupFeeMin: decimal("setup_fee_min", { precision: 10, scale: 2 }),
  setupFeeMax: decimal("setup_fee_max", { precision: 10, scale: 2 }),
  monthlyFeeMin: decimal("monthly_fee_min", { precision: 10, scale: 2 }),
  monthlyFeeMax: decimal("monthly_fee_max", { precision: 10, scale: 2 }),
  // Stripe integration
  stripeProductId: varchar("stripe_product_id", { length: 100 }),
  stripePriceId: varchar("stripe_price_id", { length: 100 }),
  // Feature flags for this plan
  features: jsonb("features").$type<PlanFeatures>(),
  isActive: boolean("is_active").default(true).notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * subscriptions — active subscription linking an org to a plan
 */
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  planId: uuid("plan_id").references(() => subscriptionPlans.id).notNull(),
  status: subscriptionStatusEnum("status").default("trialing").notNull(),
  // Stripe
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 100 }),
  stripeCurrentPeriodStart: timestamp("stripe_current_period_start"),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end"),
  stripeCancelAtPeriodEnd: boolean("stripe_cancel_at_period_end").default(false),
  // Setup fee tracking
  setupFeePaid: boolean("setup_fee_paid").default(false),
  setupFeeAmount: decimal("setup_fee_amount", { precision: 10, scale: 2 }),
  // Trial
  trialEndsAt: timestamp("trial_ends_at"),
  canceledAt: timestamp("canceled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── FUTURE: BUYER / MATCH AGENT TABLES ───────────────────────────────────────
// NOTE: These tables are stubbed for Phase 2. Do not add logic yet.
// They define the data shape for the persistent buyer/search agent lane.

/**
 * saved_search_agents — Phase 2: a user's persistent search/watch agent
 * (e.g., "Find me a 2022 F-150 under $40k within 100 miles")
 */
export const savedSearchAgents = pgTable("saved_search_agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  userId: uuid("user_id").references(() => users.id),
  agentId: uuid("agent_id").references(() => agents.id),
  name: varchar("name", { length: 255 }),
  category: varchar("category", { length: 100 }), // "vehicle", "property", "equipment", etc.
  searchCriteria: jsonb("search_criteria"), // flexible JSON criteria
  isActive: boolean("is_active").default(true),
  lastRunAt: timestamp("last_run_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // PHASE 2 TODO: add match scoring weights, alert thresholds, etc.
});

/**
 * match_profiles — Phase 2: structured buyer profile for matching
 */
export const matchProfiles = pgTable("match_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  savedSearchAgentId: uuid("saved_search_agent_id").references(() => savedSearchAgents.id),
  userId: uuid("user_id").references(() => users.id),
  profileData: jsonb("profile_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * search_alerts — Phase 2: triggered alerts from a saved search agent
 */
export const searchAlerts = pgTable("search_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  savedSearchAgentId: uuid("saved_search_agent_id").references(() => savedSearchAgents.id),
  userId: uuid("user_id").references(() => users.id),
  matchScore: decimal("match_score", { precision: 5, scale: 2 }),
  matchedItemData: jsonb("matched_item_data"),
  isRead: boolean("is_read").default(false),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * shortlist_items — Phase 2: items a buyer has saved/shortlisted
 */
export const shortlistItems = pgTable("shortlist_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  savedSearchAgentId: uuid("saved_search_agent_id").references(() => savedSearchAgents.id),
  itemData: jsonb("item_data").notNull(),
  notes: text("notes"),
  rank: integer("rank"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── RELATIONS ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(memberships),
  assignedSubmissions: many(submissions),
  assignedLeads: many(leads),
  notes: many(notes),
  notifications: many(notifications),
}));

export const organizationsRelations = relations(organizations, ({ many, one }) => ({
  memberships: many(memberships),
  agents: many(agents),
  submissions: many(submissions),
  leads: many(leads),
  pipelineStages: many(pipelineStages),
  subscriptions: many(subscriptions),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  organization: one(organizations, { fields: [agents.organizationId], references: [organizations.id] }),
  submissions: many(submissions),
  leads: many(leads),
  intakeForms: many(intakeForms),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  agent: one(agents, { fields: [submissions.agentId], references: [agents.id] }),
  organization: one(organizations, { fields: [submissions.organizationId], references: [organizations.id] }),
  files: many(submissionFiles),
  lead: one(leads),
  notes: many(notes),
  followUps: many(followUps),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  submission: one(submissions, { fields: [leads.submissionId], references: [submissions.id] }),
  organization: one(organizations, { fields: [leads.organizationId], references: [organizations.id] }),
  notes: many(notes),
  followUps: many(followUps),
}));

// ─── TYPESCRIPT TYPES ─────────────────────────────────────────────────────────

export type IntakeField = {
  id: string;
  type: "text" | "textarea" | "email" | "phone" | "number" | "select" | "multiselect" | "file" | "date";
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  helpText?: string;
  order: number;
};

export type IntakeFormSchema = {
  title: string;
  description?: string;
  fields: IntakeField[];
};

export type AiStructuredOutput = {
  summary: string;
  extractedData: Record<string, unknown>;
  missingFields: string[];
  suggestedNextSteps: string[];
  quoteReadyScore: number; // 0-100: how quote-ready is this submission?
  estimatedValue?: number;
  confidence: number; // 0-1: AI confidence in extraction
};

export type PlanFeatures = {
  maxAgents: number;
  maxSubmissionsPerMonth: number;
  maxTeamMembers: number;
  aiSummaries: boolean;
  aiFollowUp: boolean;
  customBranding: boolean;
  whiteLabelDomain: boolean;
  apiAccess: boolean;
  analyticsRetentionDays: number;
};
