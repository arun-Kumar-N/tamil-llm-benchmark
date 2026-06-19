// Shared types for the whole benchmark.

export type Task =
  | "translation_en_ta"
  | "translation_ta_en"
  | "summarization"
  | "comprehension"
  | "grammar"
  | "transliteration"
  | "sentiment"
  | "knowledge";

// How an item is graded:
//   "chrf"     — character-overlap score vs the reference (translation, etc.)
//   "accuracy" — exact label match (classification, e.g. sentiment)
//   "judge"    — an LLM grades quality vs the reference (open-ended answers)
export type ScoringMethod = "chrf" | "accuracy" | "judge";

// One exam question. This is what YOU write (the dataset).
export interface TestItem {
  id: string;
  task: Task;
  input: string;
  reference: string; // gold answer, or the correct label
  scoring: ScoringMethod;
  metadata?: Record<string, unknown>;
}

// One model's answer to one item (cached so we never re-pay the API).
export interface Completion {
  id: string;
  task: Task;
  model: string;
  input: string;
  reference: string;
  scoring: ScoringMethod;
  output: string;
}

// One graded result.
export interface Score {
  id: string;
  task: Task;
  model: string;
  method: ScoringMethod;
  score: number; // normalized 0..1 (1 = best)
  detail?: Record<string, unknown>;
}

// A model we can call.
export interface ModelSpec {
  id: string; // short name used in files + leaderboard
  provider: "anthropic" | "openai" | "google" | "sarvam";
  apiModel: string; // the real API model id
  available: () => boolean; // is its API key configured?
  complete: (prompt: string) => Promise<string>;
}
