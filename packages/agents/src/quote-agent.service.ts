/**
 * @package @umbra/agents
 * Quote / Intake AI Agent Service
 * 
 * All AI-powered operations for Phase 1:
 * - summarize a submission
 * - extract structured data
 * - identify missing fields
 * - generate a quote-ready output
 * - suggest follow-up actions
 */

import { getAiProvider, type AiCompletionOptions, type IAiProvider } from "./providers";
import type { AiStructuredOutput, IntakeField } from "@umbra/db";

// ─── AGENT CONFIG ─────────────────────────────────────────────────────────────

export interface QuoteAgentConfig {
  provider?: string;
  model?: string;
  systemPrompt?: string;
  // The form fields this agent uses (context for extraction)
  formFields?: IntakeField[];
  // Business context (helps AI understand what it's quoting for)
  businessContext?: string;
}

const DEFAULT_QUOTE_SYSTEM_PROMPT = `You are an intelligent intake assistant for a business.
Your job is to analyze incoming quote/service requests submitted by potential customers.
Be concise, accurate, and professional. Always extract as much structured information as possible.
When something is missing, note it clearly. Score the quote-readiness from 0-100.
Respond ONLY in the JSON format specified — no extra text or markdown.`;

// ─── QUOTE AGENT SERVICE ──────────────────────────────────────────────────────

export class QuoteAgentService {
  private provider: IAiProvider;
  private config: QuoteAgentConfig;

  constructor(config: QuoteAgentConfig = {}) {
    this.config = config;
    this.provider = getAiProvider(config.provider ?? "anthropic");
  }

  /**
   * processSubmission — the primary Phase 1 AI action.
   * Takes raw submission data and returns structured, quote-ready output.
   */
  async processSubmission(
    rawData: Record<string, unknown>,
    options?: { organizationId?: string; agentId?: string }
  ): Promise<AiStructuredOutput> {
    const systemPrompt = this.config.systemPrompt ?? DEFAULT_QUOTE_SYSTEM_PROMPT;
    const fieldContext = this.config.formFields
      ? `\nExpected fields: ${this.config.formFields.map((f) => f.label).join(", ")}`
      : "";
    const businessContext = this.config.businessContext
      ? `\nBusiness context: ${this.config.businessContext}`
      : "";

    const userMessage = `
Analyze this service/quote request submission and extract structured information.

${businessContext}${fieldContext}

Raw submission data:
${JSON.stringify(rawData, null, 2)}

Respond with a JSON object in exactly this shape:
{
  "summary": "2-3 sentence plain English summary of the request",
  "extractedData": { /* key-value pairs of all extracted structured fields */ },
  "missingFields": ["list of field names that are missing or unclear"],
  "suggestedNextSteps": ["list of 2-4 concrete next actions for the business"],
  "quoteReadyScore": <integer 0-100 representing how quote-ready this submission is>,
  "estimatedValue": <optional number, estimated deal value if determinable>,
  "confidence": <decimal 0-1, AI confidence in the extraction accuracy>
}
`;

    const completionOptions: AiCompletionOptions = {
      model: this.config.model,
      maxTokens: 1024,
      temperature: 0.1,
      systemPrompt,
    };

    const result = await this.provider.complete(
      [{ role: "user", content: userMessage }],
      completionOptions
    );

    return this._parseStructuredOutput(result.content);
  }

  /**
   * generateFollowUpMessage — creates a personalized follow-up for a lead
   */
  async generateFollowUpMessage(params: {
    leadName?: string;
    submissionSummary: string;
    followUpNumber: number;
    businessName: string;
    tone?: "professional" | "friendly" | "urgent";
  }): Promise<{ subject: string; body: string }> {
    const { leadName, submissionSummary, followUpNumber, businessName, tone = "professional" } = params;

    const userMessage = `
Write follow-up #${followUpNumber} email for this lead.

Business: ${businessName}
Lead name: ${leadName ?? "there"}
Their request summary: ${submissionSummary}
Tone: ${tone}

Respond with JSON in this shape:
{
  "subject": "email subject line",
  "body": "email body (plain text, 3-5 sentences max)"
}
`;

    const result = await this.provider.complete(
      [{ role: "user", content: userMessage }],
      { maxTokens: 512, temperature: 0.5 }
    );

    const parsed = this._safeJsonParse<{ subject: string; body: string }>(result.content);
    return parsed ?? { subject: "Following up on your request", body: "Hi, just following up on your recent inquiry. Let us know if you have any questions." };
  }

  /**
   * identifyMissingInformation — pinpoints what's needed to complete a quote
   */
  async identifyMissingInformation(params: {
    rawData: Record<string, unknown>;
    requiredFields: IntakeField[];
  }): Promise<string[]> {
    const { rawData, requiredFields } = params;

    const userMessage = `
Given this form submission and required fields, identify what's missing or incomplete.

Required fields:
${requiredFields.map((f) => `- ${f.label} (${f.required ? "required" : "optional"})`).join("\n")}

Submitted data:
${JSON.stringify(rawData, null, 2)}

Respond with a JSON array of strings — each string is a missing or incomplete field name.
Example: ["Phone number", "Project start date", "Budget range"]
`;

    const result = await this.provider.complete(
      [{ role: "user", content: userMessage }],
      { maxTokens: 256, temperature: 0.1 }
    );

    return this._safeJsonParse<string[]>(result.content) ?? [];
  }

  // ─── PRIVATE HELPERS ────────────────────────────────────────────────────────

  private _parseStructuredOutput(content: string): AiStructuredOutput {
    const parsed = this._safeJsonParse<AiStructuredOutput>(content);
    if (!parsed) {
      // Fallback if AI returns malformed JSON
      return {
        summary: content.slice(0, 500),
        extractedData: {},
        missingFields: [],
        suggestedNextSteps: ["Review submission manually"],
        quoteReadyScore: 0,
        confidence: 0,
      };
    }
    return parsed;
  }

  private _safeJsonParse<T>(content: string): T | null {
    try {
      // Strip any markdown code fences the model might add
      const clean = content
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      return JSON.parse(clean) as T;
    } catch {
      return null;
    }
  }
}

// ─── FACTORY ─────────────────────────────────────────────────────────────────

/**
 * createQuoteAgent — factory for creating configured agent instances
 * Used by API routes and background jobs
 */
export function createQuoteAgent(config: QuoteAgentConfig = {}): QuoteAgentService {
  return new QuoteAgentService(config);
}

// ─── FUTURE: BUYER/MATCH AGENT STUB ───────────────────────────────────────────
// Phase 2 will add:
// - BuyerSearchAgentService: runs persistent search criteria against listings
// - MatchScoringService: scores items against a buyer profile
// - AlertGeneratorService: determines when to notify a buyer of a match
//
// These will follow the same IAiProvider abstraction pattern.
// export class BuyerSearchAgentService { ... }
