// Eyeball every model's actual answer next to your reference + its score.
// Use this to sanity-check the leaderboard — especially the Tamil quality,
// which only you can truly judge.
import { join } from "node:path";
import { existsSync, readdirSync } from "node:fs";
import { readJsonl, loadDataset } from "./io";
import type { Completion, Score } from "./types";

const dataset = new Map(loadDataset().map((i) => [i.id, i]));

const COMP = "results/completions";
const SCORE = "results/scores";

if (!existsSync(COMP)) {
  console.error("No completions yet. Run `npm run run-models` first.");
  process.exit(1);
}

const comps = readdirSync(COMP)
  .filter((f) => f.endsWith(".jsonl"))
  .flatMap((f) => readJsonl<Completion>(join(COMP, f)));

const scores = existsSync(SCORE)
  ? readdirSync(SCORE)
      .filter((f) => f.endsWith(".jsonl"))
      .flatMap((f) => readJsonl<Score>(join(SCORE, f)))
  : [];
const scoreMap = new Map(scores.map((s) => [`${s.model}::${s.id}`, s]));

const byId = new Map<string, Completion[]>();
for (const c of comps) {
  if (!byId.has(c.id)) byId.set(c.id, []);
  byId.get(c.id)!.push(c);
}

for (const [id, list] of byId) {
  const first = list[0];
  const method = dataset.get(id)?.scoring ?? first.scoring;
  console.log(`\n── ${id}  [${first.task} · scored by ${method}]`);
  console.log(`   input:     ${first.input}`);
  console.log(`   reference: ${first.reference}`);
  for (const c of list) {
    const s = scoreMap.get(`${c.model}::${c.id}`);
    const sc = s ? (s.score * 100).toFixed(0).padStart(3) : "  ?";
    console.log(`   ${sc}  ${c.model.padEnd(20)} ${c.output}`);
    const reason = s?.detail?.reasoning;
    if (reason) console.log(`        ↳ judge: ${reason}`);
  }
}
console.log("\n(score is 0–100. For translations, low ≠ wrong — chrF only rewards overlap with YOUR reference wording.)");
