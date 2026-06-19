// STEP 2 — grade every cached completion with the right method.
// Scores are cached too, so re-running won't re-pay for judge calls.
import "dotenv/config";
import { join } from "node:path";
import { existsSync, readdirSync } from "node:fs";
import { readJsonl, appendJsonl } from "./io";
import { accuracy, chrf } from "./metrics";
import { judge } from "./judge";
import type { Completion, Score } from "./types";

const COMP_DIR = "results/completions";
const SCORE_DIR = "results/scores";

async function main() {
  if (!existsSync(COMP_DIR)) {
    console.error("No completions found. Run `npm run run-models` first.");
    process.exit(1);
  }
  const files = readdirSync(COMP_DIR).filter((f) => f.endsWith(".jsonl"));

  for (const file of files) {
    const completions = readJsonl<Completion>(join(COMP_DIR, file));
    const scorePath = join(SCORE_DIR, file);
    const done = new Set(readJsonl<Score>(scorePath).map((s) => s.id));
    let made = 0;

    for (const c of completions) {
      if (done.has(c.id)) continue;
      let score: number;
      let detail: Record<string, unknown> | undefined;

      if (c.scoring === "accuracy") {
        score = accuracy(c.output, c.reference);
      } else if (c.scoring === "chrf") {
        score = chrf(c.output, c.reference);
      } else {
        const j = await judge(c, c.output);
        score = j.score;
        detail = { raw1to5: j.raw1to5, reasoning: j.reasoning };
      }

      appendJsonl(scorePath, {
        id: c.id,
        task: c.task,
        model: c.model,
        method: c.scoring,
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
