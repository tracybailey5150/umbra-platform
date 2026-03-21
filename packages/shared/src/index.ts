/**
 * @package @umbra/shared
 * Shared types, utilities, and constants used across all packages and apps.
 */

// ─── API RESPONSE WRAPPER ─────────────────────────────────────────────────────

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiError = {
  ok: false;
  error: string;
  code?: string;
  details?: unknown;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function ok<T>(data: T): ApiSuccess<T> {
  return { ok: true, data };
}

export function err(error: string, code?: string, details?: unknown): ApiError {
  return { ok: false, error, code, details };
}

// ─── PAGINATION ───────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function buildPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

// ─── ANALYTICS EVENTS ─────────────────────────────────────────────────────────

export const ANALYTICS_EVENTS = {
  // Submission lifecycle
  SUBMISSION_CREATED: "submission.created",
  SUBMISSION_AI_PROCESSED: "submission.ai_processed",
  SUBMISSION_STATUS_CHANGED: "submission.status_changed",
  SUBMISSION_ASSIGNED: "submission.assigned",
  // Lead lifecycle
  LEAD_CREATED: "lead.created",
  LEAD_STAGE_CHANGED: "lead.stage_changed",
  LEAD_CLOSED_WON: "lead.closed_won",
  LEAD_CLOSED_LOST: "lead.closed_lost",
  // Follow-up
  FOLLOW_UP_SENT: "follow_up.sent",
  FOLLOW_UP_RESPONDED: "follow_up.responded",
  // Agent
  AGENT_CREATED: "agent.created",
  AGENT_FORM_VIEWED: "agent.form_viewed",
  AGENT_FORM_STARTED: "agent.form_started",
  AGENT_FORM_SUBMITTED: "agent.form_submitted",
  AGENT_FORM_ABANDONED: "agent.form_abandoned",
  // Organization
  ORG_CREATED: "org.created",
  MEMBER_INVITED: "member.invited",
  MEMBER_JOINED: "member.joined",
} as const;

export type AnalyticsEventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

// ─── DATE/TIME HELPERS ────────────────────────────────────────────────────────

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

// ─── SLUG HELPERS ─────────────────────────────────────────────────────────────

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── VALIDATION ───────────────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s\-()]{7,15}$/.test(phone);
}
