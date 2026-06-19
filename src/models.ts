// The models under test (and the judge). Add more providers here.
import Anthropic from "@anthropic-ai/sdk";
import type { ModelSpec } from "./types";

// One shared Anthropic client (null if no key — keeps things runnable).
export const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export async function anthropicComplete(
  apiModel: string,
  prompt: string,
  maxTokens = 1024,
): Promise<string> {
  if (!anthropic) throw new Error("ANTHROPIC_API_KEY not set");
  const msg = await anthropic.messages.create({
    model: apiModel,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });
  return msg.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
}

function anthropicModel(id: string, apiModel: string): ModelSpec {
  return {
    id,
    provider: "anthropic",
    apiModel,
    available: () => anthropic !== null,
    complete: (prompt) => anthropicComplete(apiModel, prompt),
  };
}

// The roster. Start with two Claude models so you see a real comparison
// immediately. Add OpenAI / Gemini / Sarvam / Llama the same way — implement
// a `complete()` that calls their API and gate it on `available()`.
//
// TODO (you): add other providers, e.g.
//   import OpenAI from "openai";
//   const openai = process.env.OPENAI_API_KEY ? new OpenAI(...) : null;
//   { id: "gpt-x", provider: "openai", apiModel: "...",
//     available: () => openai !== null,
//     complete: async (p) => (await openai.chat.completions.create({...})).choices[0].message.content ?? "" }
export const MODELS: ModelSpec[] = [
  anthropicModel("claude-sonnet-4-6", "claude-sonnet-4-6"),
  anthropicModel("claude-haiku-4-5", "claude-haiku-4-5-20251001"),
];

export function availableModels(): ModelSpec[] {
  return MODELS.filter((m) => m.available());
}
