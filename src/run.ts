// STEP 1 — run every dataset item through every available model.
// Completions are cached per model, so re-running only fills in what's missing
// (and never re-pays for answers you already have).
import "dotenv/config";
import { join } from "node:path";
import { loadDataset, readJsonl, appendJsonl } from "./io";
import { availableModels } from "./models";
import { buildPrompt } from "./prompts";
import type { Completion } from "./types";

const OUT_DIR = "results/completions";

async function main() {
  const items = loadDataset();
  const models = availableModels();

  if (items.length === 0) {
    console.error("No dataset items found in dataset/*.jsonl");
    process.exit(1);
  }
  if (models.length === 0) {
    console.error("No models available. Set ANTHROPIC_API_KEY in .env");
    process.exit(1);
  }

  console.log(`Dataset: ${items.length} items · Models: ${models.map((m) => m.id).join(", ")}\n`);

  for (const model of models) {
    const path = join(OUT_DIR, `${model.id}.jsonl`);
    const done = new Set(readJsonl<Completion>(path).map((c) => c.id));
    let made = 0;

    for (const item of items) {
      if (done.has(item.id)) continue;
      try {
        const output = await model.complete(buildPrompt(item));
        const completion: Completion = {
          id: item.id,
          task: item.task,
          model: model.id,
          input: item.input,
          reference: item.reference,
          scoring: item.scoring,
          output,
        };
        appendJsonl(path, completion);
        made++;
        process.stdout.write(`  ${model.id} ✓ ${item.id}\n`);
      } catch (err) {
        process.stdout.write(`  ${model.id} ✗ ${item.id} — ${(err as Error).message}\n`);
      }
    }
    console.log(`${model.id}: ${made} new, ${done.size} cached\n`);
  }
  console.log("Done. Next: npm run score");
}

main();
