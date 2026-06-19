# Tamil LLM Benchmark

An open benchmark measuring how well today's LLMs actually handle **Tamil** —
translation, sentiment, transliteration, grammar, summarization, and more.
Built and verified by a native Tamil speaker.

> Why this exists: Indian-language ability is under-measured. Most benchmarks
> test only formal Tamil and can't be human-verified by their authors. This one
> can. See [SPEC.md](SPEC.md) for the full design.

## How it works (3 steps)

```
npm install
cp .env.example .env        # add ANTHROPIC_API_KEY (only this is needed to start)

npm run run-models          # 1. each model answers every dataset item  (cached)
npm run score               # 2. grade answers: chrF / accuracy / LLM-judge  (cached)
npm run leaderboard         # 3. print the ranking
# or all three:  npm run bench
```

Both `run-models` and `score` **cache** their work, so re-running only does what's
missing — you never re-pay the API for answers or judgements you already have.

## Layout

```
dataset/      ← the benchmark itself (JSONL). THIS is the value — see dataset/README.md
src/
  run.ts        dataset × models → completions   (results/completions/)
  score.ts      completions → scores             (results/scores/)
  leaderboard.ts scores → ranked table
  models.ts     the model roster (add providers here)
  prompts.ts    per-task prompt templates
  metrics.ts    chrF + accuracy (objective, free)
  judge.ts      LLM-as-judge (open-ended quality)
results/      ← committed for reproducibility
```

## Scoring methods

- **chrF** — character-overlap vs reference; good for Tamil's morphology (translation, grammar…)
- **accuracy** — exact label match (sentiment / classification)
- **LLM-as-judge** — a model grades quality vs the reference (open-ended answers)

## Status & honest limitations

- ✅ Harness runs; metrics verified; 2 Claude models wired in.
- ⬜ **Dataset is tiny so far (8 example items).** The real work is writing ~275 — see [dataset/README.md](dataset/README.md).
- ⬜ **Single judge (Claude) for now** → self-preference bias when grading Claude. Add a second-family judge (GPT-class) before publishing; the code is structured for it (see `src/judge.ts`).
- ⬜ More models (OpenAI, Gemini, Sarvam, Llama) — add in `src/models.ts`.
- ⬜ Token-efficiency metric, leaderboard website, Hugging Face dataset upload (see SPEC.md).

## Roadmap

[SPEC.md](SPEC.md) has the full plan: 8 tasks, ~275 items, dual-judge scoring,
token-efficiency analysis, public leaderboard, launch. Target ship: 2026-07-09.
