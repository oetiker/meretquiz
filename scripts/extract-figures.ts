// scripts/extract-figures.ts
// Run: pnpm tsx scripts/extract-figures.ts
// Lists distinct capitalized proper-noun-looking strings from question options/explanations.
import { questions } from '../src/data/questions';

const counts = new Map<string, number>();

function addNoun(s: string) {
  const cleaned = s.trim().replace(/[.,;:!?]+$/, '');
  if (cleaned.length < 2) return;
  if (/^[A-ZÄÖÜ][a-zäöüß-]+/.test(cleaned)) {
    counts.set(cleaned, (counts.get(cleaned) ?? 0) + 1);
  }
}

for (const q of questions) {
  for (const opt of q.options) addNoun(opt);
  for (const word of q.explanation.split(/\s+/)) addNoun(word);
}

const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
for (const [name, n] of sorted) {
  console.log(`${String(n).padStart(3)} ${name}`);
}
console.log(`\n${sorted.length} distinct candidates.`);
