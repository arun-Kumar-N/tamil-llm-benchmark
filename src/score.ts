// STEP 2 — grade every cached completion with the right method.
//
// The scoring method comes from the DATASET (not the cached completion), so if
// you change an item's `scoring` you can re-grade without re-running the models.
// Scores are cached too, so re-running won't re-pay for judge calls.
import "dotenv/config";
import { join } from "node:path";
import { existsSync, readdirSync } from "node:fs";
import { readJsonl, appendJsonl, loadDataset } from "./io";
import { accuracy, chrf } from "./metrics";
import { judge } from "./judge";
import type { Completion, Score, TestItem } from "./types";

const COMP_DIR = "results/completions";
const SCORE_DIR = "results/scores";

async function main() {
  if (!existsSync(COMP_DIR)) {
    console.error("No completions found. Run `npm run run-models` first.");
    process.exit(1);
  }
  const dataset = new Map(loadDataset().map((i) => [i.id, i]));
  const files = readdirSync(COMP_DIR).filter((f) => f.endsWith(".jsonl"));

  for (const file of files) {
    const completions = readJsonl<Completion>(join(COMP_DIR, file));
    const scorePath = join(SCORE_DIR, file);
    const done = new Set(readJsonl<Score>(scorePath).map((s) => s.id));
    let made = 0;

    for (const c of completions) {
      if (done.has(c.id)) continue;

      // Scoring method is authoritative from the dataset (fallback: completion).
      const item: TestItem = dataset.get(c.id) ?? {
        id: c.id,
        task: c.task,
        input: c.input,
        reference: c.reference,
        scoring: c.scoring,
      };

      let score: number;
      let detail: Record<string, unknown> | undefined;

      if (item.scoring === "accuracy") {
        score = accuracy(c.output, item.reference);
      } else if (item.scoring === "chrf") {
        score = chrf(c.output, item.reference);
      } else {
        const j = await judge(item, c.output);
        score = j.score;
        detail = { raw1to5: j.raw1to5, reasoning: j.reasoning };
      }

      appendJsonl(scorePath, {
        id: c.id,
        task: c.task,
        model: c.model,
        method: item.scoring,
        score,
        detail,
      } satisfies Score);
      made++;
    }
    console.log(`${file}: ${made} newly scored, ${done.size} cached`);
  }
  console.log("\nDone. Next: npm run leaderboard");
}

main();
