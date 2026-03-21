/**
 * @package @umbra/workflows
 *
 * Quote Workflow Engine
 *
 * Orchestrates the lifecycle of a submission from intake → quote → close.
 * Designed to be called from API routes or background jobs.
 *
 * Each step is a pure function so it can be tested in isolation and
 * retried safely on failure.
 */

import type { AiStructuredOutput } from "@umbra/db";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type WorkflowStatus =
  | "pending"
  | "processing"
  | "needs_info"
  | "ready_to_quote"
  | "quoted"
  | "won"
  | "lost"
  | "archived";

export interface WorkflowContext {
  submissionId: string;
  organizationId: string;
  agentId: string;
  rawData: Record<string, unknown>;
  aiOutput?: AiStructuredOutput;
  assignedUserId?: string;
}

export interface WorkflowStep {
  name: string;
  run: (ctx: WorkflowContext) => Promise<WorkflowStepResult>;
}

export interface WorkflowStepResult {
  ok: boolean;
  next?: WorkflowStatus;
  data?: Record<string, unknown>;
  error?: string;
}

export interface WorkflowResult {
  finalStatus: WorkflowStatus;
  steps: Array<{ name: string; ok: boolean; durationMs: number }>;
  totalDurationMs: number;
}

// ─── INDIVIDUAL STEPS ─────────────────────────────────────────────────────────

/**
 * Step: validateSubmission
 * Ensures the submission has minimum required fields before processing.
 */
export const validateSubmission: WorkflowStep = {
  name: "validate_submission",
  async run(ctx) {
    const { rawData } = ctx;
    const hasContactInfo =
      rawData.email || rawData.phone || rawData.name;

    if (!hasContactInfo) {
      return {
        ok: false,
        error: "Submission missing contact information",
        next: "needs_info",
      };
    }

    return { ok: true };
  },
};

/**
 * Step: scoreSubmission
 * Determines if the AI score is high enough to auto-advance the workflow.
 */
export const scoreSubmission: WorkflowStep = {
  name: "score_submission",
  async run(ctx) {
    const score = ctx.aiOutput?.quoteReadyScore ?? 0;

    if (score >= 70) {
      return { ok: true, next: "ready_to_quote", data: { score } };
    }

    if (score >= 40) {
      return { ok: true, next: "needs_info", data: { score } };
    }

    // Very low score — flag for manual review
    return {
      ok: true,
      next: "needs_info",
      data: { score, reason: "Low confidence extraction — manual review needed" },
    };
  },
};

/**
 * Step: autoAssign
 * Assigns the submission to a team member based on round-robin or rules.
 * Stub — replace with actual assignment logic.
 */
export const autoAssign: WorkflowStep = {
  name: "auto_assign",
  async run(ctx) {
    // TODO: Implement round-robin assignment from org members
    // const members = await getActiveOrgMembers(ctx.organizationId);
    // const assignee = roundRobin(members);
    return {
      ok: true,
      data: { assignedUserId: null, note: "Auto-assignment pending implementation" },
    };
  },
};

/**
 * Step: scheduleFollowUp
 * Queues the first follow-up message based on agent config.
 */
export const scheduleFollowUp: WorkflowStep = {
  name: "schedule_follow_up",
  async run(ctx) {
    // TODO: Insert follow_up record with scheduled_for = now + agentConfig.followUpIntervalHours
    // const followUpAt = addHours(new Date(), agentConfig.followUpIntervalHours ?? 24);
    return {
      ok: true,
      data: { scheduled: true, scheduledForHours: 24 },
    };
  },
};

/**
 * Step: notifyTeam
 * Sends in-app notification to assigned team member (and org owner if unassigned).
 */
export const notifyTeam: WorkflowStep = {
  name: "notify_team",
  async run(ctx) {
    // TODO: Insert notification records for relevant users
    // await db.insert(schema.notifications).values({ ... });
    return { ok: true, data: { notified: true } };
  },
};

/**
 * Step: trackAnalytics
 * Records the submission event in the analytics stream.
 */
export const trackAnalytics: WorkflowStep = {
  name: "track_analytics",
  async run(ctx) {
    // TODO: Insert analytics_event
    // await db.insert(schema.analyticsEvents).values({
    //   organizationId: ctx.organizationId,
    //   agentId: ctx.agentId,
    //   eventName: ANALYTICS_EVENTS.SUBMISSION_AI_PROCESSED,
    //   entityType: "submission",
    //   entityId: ctx.submissionId,
    //   properties: { score: ctx.aiOutput?.quoteReadyScore },
    // });
    return { ok: true };
  },
};

// ─── WORKFLOW RUNNER ──────────────────────────────────────────────────────────

/**
 * runWorkflow — executes a sequence of steps against a context.
 * Each step is run in order; a failed step stops the sequence.
 * The final workflow status is determined by the last step that set a `next`.
 */
export async function runWorkflow(
  ctx: WorkflowContext,
  steps: WorkflowStep[]
): Promise<WorkflowResult> {
  const start = Date.now();
  const stepResults: WorkflowResult["steps"] = [];
  let currentStatus: WorkflowStatus = "processing";

  for (const step of steps) {
    const stepStart = Date.now();
    let result: WorkflowStepResult;

    try {
      result = await step.run(ctx);
    } catch (err) {
      result = {
        ok: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }

    stepResults.push({
      name: step.name,
      ok: result.ok,
      durationMs: Date.now() - stepStart,
    });

    if (result.next) {
      currentStatus = result.next;
    }

    if (!result.ok) {
      console.error(`[Workflow] Step "${step.name}" failed:`, result.error);
      break;
    }
  }

  return {
    finalStatus: currentStatus,
    steps: stepResults,
    totalDurationMs: Date.now() - start,
  };
}

// ─── PRE-BUILT WORKFLOW PRESETS ───────────────────────────────────────────────

/**
 * QUOTE_INTAKE_WORKFLOW — standard quote intake pipeline
 * Used for all Phase 1 agent types
 */
export const QUOTE_INTAKE_WORKFLOW: WorkflowStep[] = [
  validateSubmission,
  scoreSubmission,
  autoAssign,
  scheduleFollowUp,
  notifyTeam,
  trackAnalytics,
];

/**
 * runQuoteIntakeWorkflow — convenience wrapper for the standard flow
 */
export async function runQuoteIntakeWorkflow(ctx: WorkflowContext) {
  return runWorkflow(ctx, QUOTE_INTAKE_WORKFLOW);
}

// ─── FUTURE: BUYER MATCH WORKFLOW ─────────────────────────────────────────────
// Phase 2 will add a BUYER_MATCH_WORKFLOW with steps:
// - validateSearchCriteria
// - runMatchSearch
// - scoreMatches
// - filterByThreshold
// - generateAlerts
// - notifyBuyer
// export const BUYER_MATCH_WORKFLOW: WorkflowStep[] = [...];
