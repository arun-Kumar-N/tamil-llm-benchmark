// Tiny JSONL helpers (one JSON object per line) + dataset loader.
import {
  readFileSync,
  existsSync,
  mkdirSync,
  appendFileSync,
  readdirSync,
} from "node:fs";
import { dirname, join } from "node:path";
import type { TestItem } from "./types";

export function readJsonl<T>(path: string): T[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l) as T);
}

export function appendJsonl(path: string, obj: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(path, JSON.stringify(obj) + "\n");
}

// Load every .jsonl file in dataset/ and merge into one list of items.
export function loadDataset(dir = "dataset"): TestItem[] {
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir).filter((f) => f.endsWith(".jsonl"));
  return files.flatMap((f) => readJsonl<TestItem>(join(dir, f)));
}
