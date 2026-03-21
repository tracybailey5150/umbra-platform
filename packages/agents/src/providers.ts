/**
 * @package @umbra/agents
 * AI Service Abstraction Layer
 * Default provider: OpenAI GPT-4o
 */

export interface AiMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AiCompletionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface AiCompletionResult {
  content: string;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

export interface IAiProvider {
  readonly name: string;
  readonly defaultModel: string;
  complete(messages: AiMessage[], options?: AiCompletionOptions): Promise<AiCompletionResult>;
}

// ─── OPENAI PROVIDER (PRIMARY) ────────────────────────────────────────────────

export class OpenAIProvider implements IAiProvider {
  readonly name = "openai";
  readonly defaultModel = "gpt-4o";

  async complete(messages: AiMessage[], options: AiCompletionOptions = {}): Promise<AiCompletionResult> {
    const startMs = Date.now();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

    const { systemPrompt, maxTokens = 1024, temperature = 0.3, model = this.defaultModel } = options;

    const formattedMessages = systemPrompt
      ? [{ role: "system", content: systemPrompt }, ...messages.filter((m) => m.role !== "system")]
      : messages;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} — ${errText}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
      model: string;
      usage: { prompt_tokens: number; completion_tokens: number };
    };

    return {
      content: data.choices[0]?.message?.content ?? "",
      model: data.model,
      provider: this.name,
      inputTokens: data.usage.prompt_tokens,
      outputTokens: data.usage.completion_tokens,
      latencyMs: Date.now() - startMs,
    };
  }
}

// ─── ANTHROPIC PROVIDER (FALLBACK) ───────────────────────────────────────────

export class AnthropicProvider implements IAiProvider {
  readonly name = "anthropic";
  readonly defaultModel = "claude-sonnet-4-6";

  async complete(messages: AiMessage[], options: AiCompletionOptions = {}): Promise<AiCompletionResult> {
    const startMs = Date.now();
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

    const { systemPrompt, maxTokens = 1024, temperature = 0.3, model = this.defaultModel } = options;

    const body: Record<string, unknown> = {
      model,
      max_tokens: maxTokens,
      messages: messages.filter((m) => m.role !== "system"),
    };

    if (systemPrompt) body.system = systemPrompt;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} — ${errText}`);
    }

    const data = await response.json() as {
      content: Array<{ type: string; text: string }>;
      model: string;
      usage: { input_tokens: number; output_tokens: number };
    };

    return {
      content: data.content.find((c) => c.type === "text")?.text ?? "",
      model: data.model,
      provider: this.name,
      inputTokens: data.usage.input_tokens,
      outputTokens: data.usage.output_tokens,
      latencyMs: Date.now() - startMs,
    };
  }
}

// ─── PROVIDER REGISTRY ────────────────────────────────────────────────────────

const providerRegistry: Record<string, IAiProvider> = {
  openai: new OpenAIProvider(),
  anthropic: new AnthropicProvider(),
};

// Default to OpenAI GPT-4o
export function getAiProvider(name: string = "openai"): IAiProvider {
  const provider = providerRegistry[name];
  if (!provider) throw new Error(`Unknown AI provider: "${name}"`);
  return provider;
}
