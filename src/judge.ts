// LLM-as-judge: grade an open-ended answer against the reference.
//
// Design choices that matter (see SPEC.md §3):
//   - reference-based: the judge sees the known-good answer (more reliable)
//   - reason BEFORE score: better grading, less post-hoc rationalizing
//   - structured JSON out: machine-readable, easy to aggregate
//
// ⚠️ IMPORTANT CAVEAT: this scaffold uses ONE judge (Claude). That means when
// you grade Claude's own answers you have a self-preference bias. Before
// publishing, add a SECOND judge from a different family (e.g. GPT-class) and
// average / check agreement. The structure here makes that a small change:
// pass a different `judgeModel`.
import { anthropicComplete } from "./models";
import type { TestItem } from "./types";

const JUDGE_MODEL = "claude-sonnet-4-6";

export interface Judgement {
  score: number; // normalized 0..1
  raw1to5: number;
  reasoning: string;
}

export async function judge(item: TestItem, output: string): Promise<Judgement> {
  const prompt = `You are grading a model's answer to a Tamil-language task.

Task: ${item.task}
Input: ${item.input}
Reference (known-good) answer: ${item.reference}
Model's answer: ${output}

Grade the model's answer 1-5 for overall quality (accuracy of meaning, fluency, and appropriateness of register), judged against the reference.
1 = wrong or unusable, 3 = acceptable with issues, 5 = excellent and natural.

First write one sentence of reasoning, THEN the score.
Reply with ONLY a JSON object, no markdown fences:
{"reasoning": "<one sentence>", "score": <integer 1-5>}`;

  const text = await anthropicComplete(JUDGE_MODEL, prompt, 300);
  const parsed = extractJson(text);
  const raw = clamp(Number(parsed?.score) || 1, 1, 5);
  return {
    score: (raw - 1) / 4, // map 1..5 -> 0..1
    raw1to5: raw,
    reasoning: String(parsed?.reasoning ?? ""),
  };
}

function extractJson(text: string): { score?: unknown; reasoning?: unknown } | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
