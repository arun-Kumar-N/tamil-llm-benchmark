# Dataset — how to write items

This folder IS the benchmark. The code is just plumbing; **the dataset is the value**, and only a native Tamil speaker can write it well.

## Format

One JSON object per line (`.jsonl`). One file per task type.

```json
{"id": "en-ta-006", "task": "translation_en_ta", "scoring": "chrf", "input": "...", "reference": "...", "metadata": {"register": "formal", "difficulty": "easy"}}
```

| Field | Meaning |
|---|---|
| `id` | unique, e.g. `en-ta-006` (prefix per task, zero-padded) |
| `task` | one of the 8 tasks (see SPEC.md) |
| `scoring` | `chrf` (translation/generation), `accuracy` (labels), or `judge` (open-ended quality) |
| `input` | the question / source text |
| `reference` | the gold answer, or the correct label |
| `metadata` | `register` (formal/colloquial), `difficulty` (easy/medium/hard), `dialect`… |

## Rules (what makes it credible)

1. **Hand-write or hand-adapt every item.** Don't paste from Wikipedia/news — models have memorized those, so it wouldn't test real ability.
2. **Cover both registers.** Formal (செந்தமிழ்) *and* colloquial/spoken — colloquial is where models actually fail, and few benchmarks test it.
3. **Verify every reference yourself.** You are the source of truth. The 8 example items here are just to show the format — review them too.
4. **Tag honestly** with `register` and `difficulty` so the leaderboard can break results down.

## Target for v1

~275 items total (see SPEC.md for the per-task breakdown). Start with the tasks
you find easiest to write, ~10–15 min a day. The dataset is the long pole —
begin now, the code is already waiting for it.

## Which scoring to use

- **Translation, transliteration, grammar, summarization** → `chrf` (or `judge` for quality nuance)
- **Sentiment / classification** → `accuracy`
- **Comprehension, knowledge, “is this natural?”** → `judge`
