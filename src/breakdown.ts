// Slice the scores by register (formal vs colloquial) and difficulty.
// This tests the benchmark's core thesis: models tend to fail more on
// *colloquial/spoken* Tamil than formal Tamil — the gap most benchmarks miss.
// Uses only existing scores + dataset metadata (no API calls).
import { join } from "node:path";
import { existsSync, readdirSync } from "node:fs";
import { readJsonl, loadDataset } from "./io";
import type { Score } from "./types";

const SCORE_DIR = "results/scores";
if (!existsSync(SCORE_DIR)) {
  console.error("No scores. Run `npm run bench` first.");
  process.exit(1);
}

// id -> metadata
const meta = new Map<string, { register?: string; difficulty?: string }>();
for (const it of loadDataset()) {
  const m = (it.metadata ?? {}) as Record<string, unknown>;
  meta.set(it.id, {
    register: m.register as string | undefined,
    difficulty: m.difficulty as string | undefined,
  });
}

const scores = readdirSync(SCORE_DIR)
  .filter((f) => f.endsWith(".jsonl"))
  .flatMap((f) => readJsonl<Score>(join(SCORE_DIR, f)));

// Bucket a fine-grained register tag into formal vs colloquial.
function bucket(register?: string): "formal" | "colloquial" | "other" {
  if (!register) return "other";
  if (["formal", "neutral", "honorific"].includes(register)) return "formal";
  if (["colloquial", "casual", "spoken", "polite_spoken", "idiomatic"].includes(register))
    return "colloquial";
  return "other";
}

const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const pct = (x: number) => (x * 100).toFixed(1);

// model -> bucket -> scores
const byModelBucket = new Map<string, Map<string, number[]>>();
const byModelDiff = new Map<string, Map<string, number[]>>();

for (const s of scores) {
  const m = meta.get(s.id);
  const b = bucket(m?.register);
  const d = m?.difficulty ?? "unknown";

  if (!byModelBucket.has(s.model)) byModelBucket.set(s.model, new Map());
  const bm = byModelBucket.get(s.model)!;
  if (!bm.has(b)) bm.set(b, []);
  bm.get(b)!.push(s.score);

  if (!byModelDiff.has(s.model)) byModelDiff.set(s.model, new Map());
  const dm = byModelDiff.get(s.model)!;
  if (!dm.has(d)) dm.set(d, []);
  dm.get(d)!.push(s.score);
}

console.log("\n=== Formal vs Colloquial Tamil (the thesis) ===\n");
const regRows = [...byModelBucket.entries()].map(([model, bm]) => {
  const formal = avg(bm.get("formal") ?? []);
  const colloq = avg(bm.get("colloquial") ?? []);
  return {
    model,
    formal: bm.get("formal")?.length ? pct(formal) : "—",
    colloquial: bm.get("colloquial")?.length ? pct(colloq) : "—",
    "colloquial drop": bm.get("formal")?.length && bm.get("colloquial")?.length
      ? "-" + ((formal - colloq) * 100).toFixed(1)
      : "—",
  };
});
console.table(regRows);

console.log("\n=== By difficulty ===\n");
const diffOrder = ["easy", "medium", "hard", "unknown"];
const diffRows = [...byModelDiff.entries()].map(([model, dm]) => {
  const row: Record<string, string> = { model };
  for (const d of diffOrder) {
    const arr = dm.get(d);
    if (arr && arr.length) row[d] = pct(avg(arr));
  }
  return row;
});
console.table(diffRows);

console.log(
  "\nNote: averages mix scoring methods (chrF/accuracy/judge), all normalized 0–1.",
);
console.log("Small sample so far — the gap sharpens as the dataset grows.");
